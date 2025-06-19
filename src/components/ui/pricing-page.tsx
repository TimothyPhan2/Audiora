import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/lib/stripe';
import { stripeProducts } from '@/stripe-config';
import { useAuthStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// TextShimmer component with fixed motion API
interface TextShimmerProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

const TextShimmer: React.FC<TextShimmerProps> = ({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}) => {
  const MotionComponent = motion(Component as keyof JSX.IntrinsicElements);

  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <MotionComponent
      className={cn(
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text',
        'text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]',
        '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
        'dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]',
        className
      )}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      style={
        {
          '--spread': `${dynamicSpread}px`,
          backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
        } as React.CSSProperties
      }
    >
      {children}
    </MotionComponent>
  );
};

// Plan template interface for static plan data
interface PlanTemplate {
  name: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  gradient: string;
  borderGradient: string;
  badge?: string;
  buttonText: string;
  buttonVariant: 'default' | 'outline';
}

// Static plan templates
const displayPlanTemplates: PlanTemplate[] = [
  {
    name: 'Free',
    description: 'Perfect for getting started with language learning',
    features: [
      'Access to 10 songs',
      'Basic vocabulary tools',
      'Limited quizzes',
      'Community support',
    ],
    icon: Zap,
    gradient: 'from-gray-500/20 to-gray-600/20',
    borderGradient: 'from-gray-500/30 to-gray-600/30',
    buttonText: 'Get Started',
    buttonVariant: 'outline',
  },
  {
    name: 'Pro',
    description: 'Unlock unlimited access to all songs, advanced vocabulary tools, and personalized learning features.',
    features: [
      'Unlimited song access',
      'Advanced vocabulary tools',
      'Unlimited quizzes',
      'Pronunciation feedback',
      'Progress tracking',
      'Personalized learning path',
      'Priority support',
    ],
    icon: Crown,
    gradient: 'from-accent-teal-500/20 to-accent-persian-500/20',
    borderGradient: 'from-accent-teal-400/50 to-accent-persian-500/50',
    badge: 'Most Popular',
    buttonText: 'Start Pro',
    buttonVariant: 'default',
  },
];
 const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.23, 0.86, 0.39, 0.96] 
      }
    }
  };
export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId?: string) => {
    if (!priceId) {
      // Free plan - redirect to signup or dashboard
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/signup');
      }
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe');
      navigate('/login');
      return;
    }

    try {
      setLoadingPriceId(priceId);
      const { url } = await createCheckoutSession({
        priceId,
        mode: 'subscription',
      });
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-persian-500/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Floating Music Notes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-accent-teal-400/20 text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            >
              ♪
            </motion.div>
          ))}
        </div>

        <div className="relative container-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent-teal-500/10 border border-accent-teal-500/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 text-accent-teal-400" />
              </motion.div>
              <span className="text-sm font-medium text-text-cream300">
                ✨ Simple, Transparent Pricing
              </span>
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight"
              variants={fadeInUp}
            >
              <TextShimmer 
                className="bg-gradient-to-r from-accent-teal-400 to-accent-persian-500 bg-clip-text text-transparent"
                duration={3}
              >
                Choose Your Plan
              </TextShimmer>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl text-text-cream300 max-w-3xl mx-auto leading-relaxed mb-10"
              variants={fadeInUp}
            >
              Start free and scale as you grow. Learn languages through music with no hidden fees.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4 mb-12"
            >
              <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-text-cream100' : 'text-text-cream400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                  isYearly ? 'bg-accent-teal-500' : 'bg-base-dark3'
                }`}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                  animate={{ x: isYearly ? 32 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-text-cream100' : 'text-text-cream400'}`}>
                Yearly
              </span>
              {isYearly && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30"
                >
                  Save 17%
                </motion.span>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container-center pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {displayPlanTemplates.map((planTemplate, index) => {
            // For Free plan, use static data
            if (planTemplate.name === 'Free') {
              return (
                <motion.div
                  key={planTemplate.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`relative p-8 rounded-2xl border-2 bg-gradient-to-br ${planTemplate.gradient} border-transparent bg-clip-padding`}
                  style={{
                    background: `linear-gradient(135deg, ${planTemplate.gradient.replace('from-', '').replace('to-', ', ')}) padding-box, linear-gradient(135deg, ${planTemplate.borderGradient.replace('from-', '').replace('to-', ', ')}) border-box`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${planTemplate.gradient}`}>
                      <planTemplate.icon className="w-6 h-6 text-text-cream100" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-text-cream100">{planTemplate.name}</h3>
                      <p className="text-text-cream300 text-sm">{planTemplate.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-text-cream100">$0</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {planTemplate.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + featureIndex * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-text-cream200">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe()}
                    variant={planTemplate.buttonVariant}
                    className={`w-full py-3 font-medium transition-all duration-300 ${
                      planTemplate.buttonVariant === 'default'
                        ? 'button-gradient-primary text-white hover:shadow-lg'
                        : 'bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10'
                    }`}
                  >
                    {planTemplate.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              );
            }

            // For Pro plan, find the appropriate product based on billing interval
            const stripeProduct = stripeProducts.find(
              product => product.name === 'Pro' && product.interval === (isYearly ? 'year' : 'month')
            );

            if (!stripeProduct) return null;

            return (
              <motion.div
                key={`${planTemplate.name}-${isYearly ? 'yearly' : 'monthly'}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`relative p-8 rounded-2xl border-2 bg-gradient-to-br ${planTemplate.gradient} border-transparent bg-clip-padding`}
                style={{
                  background: `linear-gradient(135deg, ${planTemplate.gradient.replace('from-', '').replace('to-', ', ')}) padding-box, linear-gradient(135deg, ${planTemplate.borderGradient.replace('from-', '').replace('to-', ', ')}) border-box`,
                }}
              >
                {planTemplate.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-accent-teal-500 to-accent-persian-500 text-white text-sm font-medium rounded-full">
                      {planTemplate.badge}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${planTemplate.gradient}`}>
                    <planTemplate.icon className="w-6 h-6 text-accent-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-text-cream100">{planTemplate.name}</h3>
                    <p className="text-text-cream300 text-sm">{stripeProduct.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-text-cream100">
                      ${stripeProduct.price}
                    </span>
                    <span className="text-text-cream400">
                      / {stripeProduct.interval}
                    </span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-green-400 mt-1">
                      Save ${((9.99 * 12) - 99.99).toFixed(2)} per year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {stripeProduct.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + featureIndex * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-text-cream200">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(stripeProduct.priceId)}
                  disabled={loadingPriceId === stripeProduct.priceId}
                  variant={planTemplate.buttonVariant}
                  className={`w-full py-3 font-medium transition-all duration-300 ${
                    planTemplate.buttonVariant === 'default'
                      ? 'button-gradient-primary text-white hover:shadow-lg disabled:opacity-50'
                      : 'bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10'
                  }`}
                >
                  {loadingPriceId === stripeProduct.priceId ? 'Loading...' : planTemplate.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container-center pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-text-cream100 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-base-dark3/30 rounded-xl border border-accent-teal-500/10">
              <h3 className="font-semibold text-text-cream100 mb-2">Can I cancel anytime?</h3>
              <p className="text-text-cream300 text-sm">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="p-6 bg-base-dark3/30 rounded-xl border border-accent-teal-500/10">
              <h3 className="font-semibold text-text-cream100 mb-2">What payment methods do you accept?</h3>
              <p className="text-text-cream300 text-sm">
                We accept all major credit cards, debit cards, and digital wallets through our secure payment processor.
              </p>
            </div>
            <div className="p-6 bg-base-dark3/30 rounded-xl border border-accent-teal-500/10">
              <h3 className="font-semibold text-text-cream100 mb-2">Is there a free trial?</h3>
              <p className="text-text-cream300 text-sm">
                Our free plan gives you access to 10 songs and basic features. Upgrade anytime to unlock unlimited content.
              </p>
            </div>
            <div className="p-6 bg-base-dark3/30 rounded-xl border border-accent-teal-500/10">
              <h3 className="font-semibold text-text-cream100 mb-2">Can I switch between plans?</h3>
              <p className="text-text-cream300 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}