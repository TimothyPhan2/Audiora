import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Import product configuration to map price_id to subscription tier
const stripeProducts = [
  {
    priceId: 'price_1RbaN1PB89D9FXUlcfivY8Vu',
    tier: 'pro' as const,
    name: 'Pro Monthly',
  },
  {
    priceId: 'price_1RbaNbPB89D9FXUlRISQ7RW0',
    tier: 'pro' as const,
    name: 'Pro Yearly',
  },
];

function getSubscriptionTierFromPriceId(priceId: string): 'pro' | 'free' {
  const product = stripeProducts.find(p => p.priceId === priceId);
  return product?.tier || 'free';
}

function mapStripeStatusToInternalStatus(stripeStatus: string): 'active' | 'expired' | 'cancelled' | 'trial' {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'active'; // Keep active but might want to handle differently
    case 'canceled':
    case 'incomplete_expired':
      return 'cancelled';
    case 'incomplete':
      return 'trial';
    default:
      return 'expired';
  }
}

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;

      isSubscription = mode === 'subscription';

      console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        // Extract the necessary information from the session
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
        } = stripeData as Stripe.Checkout.Session;

        // Insert the order into the stripe_orders table
        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed', // assuming we want to mark it as completed since payment is successful
        });

        if (orderError) {
          console.error('Error inserting order:', orderError);
          return;
        }
        console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // Get user_id from stripe_customers table
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .single();

    if (customerError || !customerData) {
      console.error('Error fetching customer data:', customerError);
      throw new Error('Failed to find user for customer');
    }

    const userId = customerData.user_id;

    // Handle case where no subscriptions exist
    if (subscriptions.data.length === 0) {
      console.info(`No subscriptions found for customer: ${customerId}`);
      
      // Update stripe_subscriptions table
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }

      // Update internal subscriptions table - set to cancelled/expired
      const { error: internalSubError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          tier: 'free',
          status: 'expired',
          started_at: new Date().toISOString(),
          expires_at: new Date().toISOString(), // Set to now to indicate expired
          auto_renew: false,
          payment_method: 'stripe',
          payment_reference: customerId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (internalSubError) {
        console.error('Error updating internal subscription:', internalSubError);
      }

      return;
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // Update stripe_subscriptions table
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }

    // Now sync with internal subscriptions table
    const priceId = subscription.items.data[0].price.id;
    const subscriptionTier = getSubscriptionTierFromPriceId(priceId);
    const internalStatus = mapStripeStatusToInternalStatus(subscription.status);
    
    // Calculate dates
    const startedAt = new Date(subscription.current_period_start * 1000).toISOString();
    const expiresAt = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

    // Determine payment method info
    let paymentMethod = 'stripe';
    if (subscription.default_payment_method && typeof subscription.default_payment_method !== 'string') {
      const pm = subscription.default_payment_method;
      if (pm.card) {
        paymentMethod = `${pm.card.brand} ****${pm.card.last4}`;
      }
    }

    // Update internal subscriptions table
    const { error: internalSubError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        tier: subscriptionTier,
        status: internalStatus,
        started_at: startedAt,
        expires_at: expiresAt,
        auto_renew: !subscription.cancel_at_period_end,
        payment_method: paymentMethod,
        payment_reference: subscription.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (internalSubError) {
      console.error('Error updating internal subscription:', internalSubError);
      throw new Error('Failed to update internal subscription');
    }

    console.info(`Successfully synced subscription for customer: ${customerId}`);
    console.info(`Internal subscription updated: tier=${subscriptionTier}, status=${internalStatus}`);
    
    // The database trigger will automatically update users.subscription_tier
    
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}