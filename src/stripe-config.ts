export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SWde5wGV88e8Pj',
    priceId: 'price_1RbaN1PB89D9FXUlcfivY8Vu',
    name: 'Pro Monthly',
    description: 'Unlock unlimited access to all songs, advanced vocabulary tools, and personalized learning features.',
    mode: 'subscription',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited song access',
      'Advanced vocabulary tools',
      'Unlimited quizzes',
      'Pronunciation feedback',
      'Progress tracking',
      'Personalized learning path',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'prod_SWdezXJZvpoC6c',
    priceId: 'price_1RbaNbPB89D9FXUlRISQ7RW0',
    name: 'Pro Yearly',
    description: 'Get the best value with our annual plan. All Pro features with significant savings.',
    mode: 'subscription',
    price: 99.99,
    currency: 'usd',
    interval: 'year',
    features: [
      'Unlimited song access',
      'Advanced vocabulary tools',
      'Unlimited quizzes',
      'Pronunciation feedback',
      'Progress tracking',
      'Personalized learning path',
      'Priority support',
      'Save 17% vs monthly',
    ],
    popular: false,
  },
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};