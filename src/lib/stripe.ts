import { supabase } from './supabase';

export interface CheckoutSessionRequest {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface SubscriptionData {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export async function createCheckoutSession(
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.access_token) {
    throw new Error('Authentication required');
  }

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
  
  const defaultUrls = {
    successUrl: `${window.location.origin}/success`,
    cancelUrl: `${window.location.origin}/pricing`,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_id: request.priceId,
      mode: request.mode,
      success_url: request.successUrl || defaultUrls.successUrl,
      cancel_url: request.cancelUrl || defaultUrls.cancelUrl,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getUserSubscription(): Promise<SubscriptionData | null> {
  const { data, error } = await supabase
    .from('stripe_user_subscriptions')
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }

  return data;
}

export async function redirectToCheckout(sessionId: string): Promise<void> {
  // For now, we'll use the URL returned from the checkout session
  // In a production app, you might want to use Stripe.js for better UX
  const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;
  window.location.href = checkoutUrl;
}