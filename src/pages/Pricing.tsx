import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { mockPricingPlans } from '@/lib/mockData';

// Type for billing frequency
type BillingFrequency = 'monthly' | 'yearly';

export function Pricing() {
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');
  
  // Calculate yearly price (20% discount)
  const getYearlyPrice = (monthlyPrice: number) => {
    return (monthlyPrice * 12 * 0.8).toFixed(2);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-charcoal-600 via-charcoal-500 to-persian-700 text-white">
        <div className="container-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Choose the plan that's right for your language learning journey.
          </p>
        </div>
      </section>
      
      {/* Pricing Plans Section */}
      <section className="py-20 bg-white">
        <div className="container-center">
          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-charcoal-100 p-1 rounded-full flex items-center">
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingFrequency === 'monthly'
                    ? 'bg-persian-500 text-white'
                    : 'text-charcoal-600 hover:text-charcoal-800'
                }`}
                onClick={() => setBillingFrequency('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingFrequency === 'yearly'
                    ? 'bg-persian-500 text-white'
                    : 'text-charcoal-600 hover:text-charcoal-800'
                }`}
                onClick={() => setBillingFrequency('yearly')}
              >
                Yearly <span className="text-xs font-bold text-saffron-500">Save 20%</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockPricingPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`card relative overflow-hidden transition-all duration-300 ${
                  plan.popular 
                    ? 'border-2 border-persian-500 transform hover:-translate-y-1' 
                    : 'transform hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-persian-500 text-white text-xs font-bold px-3 py-1 uppercase">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  
                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className="text-4xl font-bold">
                        ${billingFrequency === 'monthly' ? plan.price : getYearlyPrice(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-charcoal-500 ml-2">
                          /{billingFrequency === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </div>
                    {billingFrequency === 'yearly' && plan.price > 0 && (
                      <p className="text-sm text-charcoal-500 mt-1">
                        ${plan.price}/month billed annually
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-persian-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-charcoal-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={plan.price === 0 ? "/signup" : "/checkout"}>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-persian-500 hover:bg-persian-600 text-white' 
                          : plan.price === 0 
                            ? 'bg-charcoal-200 hover:bg-charcoal-300 text-white'
                            : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                      }`}
                    >
                      {plan.price === 0 ? 'Sign Up Free' : 'Choose Plan'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQs Section */}
      <section className="py-20 bg-gradient-to-br from-charcoal-100 to-persian-100">
        <div className="container-center">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Can I switch plans later?</h3>
              <p className="text-charcoal-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be applied to your next billing cycle.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-charcoal-600">
                Our Free plan gives you limited access to our features indefinitely. You can upgrade to Premium or Pro whenever you're ready.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">How many languages can I learn?</h3>
              <p className="text-charcoal-600">
                You can learn multiple languages with any plan. Each language's progress is tracked separately.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">How do I cancel my subscription?</h3>
              <p className="text-charcoal-600">
                You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Are there any refunds?</h3>
              <p className="text-charcoal-600">
                We offer a 14-day money-back guarantee if you're not satisfied with your Premium or Pro subscription.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-charcoal-600">
                We accept all major credit cards, PayPal, and Apple Pay. For annual plans, we also offer invoice payment options.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}