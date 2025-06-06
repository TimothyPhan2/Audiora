import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { mockPricingPlans } from '@/lib/mockData';

// Type for billing frequency
type BillingFrequency = 'monthly' | 'yearly';

export function Pricing() {
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');
  
  // Add floating notes for visual interest
  const notes = ['♪', '♫', '♩', '♬'];
  
  // Calculate yearly price (20% discount)
  const getYearlyPrice = (monthlyPrice: number) => {
    return (monthlyPrice * 12 * 0.8).toFixed(2);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,195,154,0.12),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(2,195,154,0.12),transparent_50%)]"></div>
          {/* Floating Music Notes */}
          {notes.map((note, index) => (
            <div
              key={index}
              className="floating-note text-teal-400 text-4xl"
              style={{ left: `${20 + index * 20}%`, top: `${15 + index * 10}%`, textShadow: '0 0 10px rgba(2,128,144,0.5)' }}
            >
              {note}
            </div>
          ))}
        </div>
        <div className="container-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-cream-200 max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Choose the plan that's right for your language learning journey.
          </p>
        </div>
      </section>
      
      {/* Pricing Plans Section */}
      <section className="py-20 bg-[#0c0a1d]">
        <div className="container-center">
          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-lapis_lazuli-600/30 p-1 rounded-full flex items-center">
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingFrequency === 'monthly'
                    ? 'bg-teal-500 text-white'
                    : 'text-cream-300 hover:text-cream-100'
                }`}
                onClick={() => setBillingFrequency('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingFrequency === 'yearly'
                    ? 'bg-teal-500 text-white'
                    : 'text-cream-300 hover:text-cream-100'
                }`}
                onClick={() => setBillingFrequency('yearly')}
              >
                Yearly <span className="text-xs font-bold text-mint-400">Save 20%</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockPricingPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`card relative overflow-hidden transition-all duration-300 ${
                  plan.popular 
                    ? 'border-2 border-teal-400 transform hover:-translate-y-1' 
                    : 'transform hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-teal-500 text-white text-xs font-bold px-3 py-1 uppercase">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-cream-100">{plan.name}</h3>
                  
                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className="text-4xl font-bold text-cream-100">
                        ${billingFrequency === 'monthly' ? plan.price : getYearlyPrice(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-cream-300 ml-2">
                          /{billingFrequency === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </div>
                    {billingFrequency === 'yearly' && plan.price > 0 && (
                      <p className="text-sm text-cream-300 mt-1">
                        ${plan.price}/month billed annually
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-teal-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-cream-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={plan.price === 0 ? "/signup" : "/checkout"}>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'button-gradient-primary text-white' 
                          : plan.price === 0 
                            ? 'bg-lapis_lazuli-600 hover:bg-lapis_lazuli-500 text-white'
                            : 'bg-lapis_lazuli-500/50 text-cream-100 hover:bg-lapis_lazuli-400/50'
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
      <section className="py-20 bg-[#0c0a1d]">
        <div className="container-center">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-persian_green-500 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-cream-300 max-w-2xl mx-auto">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card">
              <h3 className="text-xl font-semibold mb-2 text-cream-100">Can I switch plans later?</h3>
              <p className="text-cream-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be applied to your next billing cycle.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-2 text-cream-100">Is there a free trial?</h3>
              <p className="text-cream-300">
                Our Free plan gives you limited access to our features indefinitely. You can upgrade to Premium or Pro whenever you're ready.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-2 text-cream-100">How many languages can I learn?</h3>
              <p className="text-cream-300">
                You can learn multiple languages with any plan. Each language's progress is tracked separately.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-2 text-cream-100">How do I cancel my subscription?</h3>
              <p className="text-cream-300">
                You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-2 text-cream-100">Are there any refunds?</h3>
              <p className="text-cream-300">
                We offer a 14-day money-back guarantee if you're not satisfied with your Premium or Pro subscription.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-2 text-cream-100">What payment methods do you accept?</h3>
              <p className="text-cream-300">
                We accept all major credit cards, PayPal, and Apple Pay. For annual plans, we also offer invoice payment options.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}