import React, { useState, useMemo, type JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Zap, 
  Crown, 
  ArrowRight, 
  Sparkles, 
  ChevronDown,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Utils function
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Text Shimmer Component
interface TextShimmerProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

function TextShimmer({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
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
}

// FAQ Section Component
interface FaqSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  items: {
    question: string;
    answer: string;
  }[];
  contactInfo?: {
    title: string;
    description: string;
    buttonText: string;
    onContact?: () => void;
  };
}

const FaqItem = React.forwardRef<
  HTMLDivElement,
  {
    question: string;
    answer: string;
    index: number;
  }
>((props, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { question, answer, index } = props;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.1 }}
      className={cn(
        "group rounded-lg",
        "transition-all duration-200 ease-in-out",
        "border border-accent-teal-500/20",
        isOpen
          ? "bg-gradient-to-br from-base-dark2 via-base-dark3/50 to-base-dark2"
          : "hover:bg-base-dark3/30"
      )}
    >
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 h-auto justify-between hover:bg-transparent"
      >
        <h3
          className={cn(
            "text-base font-medium transition-colors duration-200 text-left",
            "text-text-cream300",
            isOpen && "text-text-cream100"
          )}
        >
          {question}
        </h3>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "p-0.5 rounded-full flex-shrink-0",
            "transition-colors duration-200",
            isOpen ? "text-accent-teal-400" : "text-text-cream400"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </Button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: 0.2, ease: "easeIn" },
            }}
          >
            <div className="px-6 pb-4 pt-2">
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-sm text-text-cream300 leading-relaxed"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
FaqItem.displayName = "FaqItem";

const FaqSection = React.forwardRef<HTMLElement, FaqSectionProps>(
  ({ className, title, description, items, contactInfo, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "py-16 w-full bg-gradient-to-b from-transparent via-base-dark3/30 to-transparent",
          className
        )}
        {...props}
      >
        <div className="container max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl font-semibold mb-3 bg-gradient-to-r from-accent-teal-400 to-accent-persian-500 bg-clip-text text-transparent">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-text-cream300">{description}</p>
            )}
          </motion.div>

          {/* FAQ Items */}
          <div className="max-w-2xl mx-auto space-y-2">
            {items.map((item, index) => (
              <FaqItem
                key={index}
                question={item.question}
                answer={item.answer}
                index={index}
              />
            ))}
          </div>

          {/* Contact Section */}
          {contactInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-md mx-auto mt-12 p-6 rounded-lg text-center"
            >
              <div className="inline-flex items-center justify-center p-1.5 rounded-full mb-4">
                <Mail className="h-4 w-4 text-accent-teal-400" />
              </div>
              <p className="text-sm font-medium text-text-cream100 mb-1">
                {contactInfo.title}
              </p>
              <p className="text-xs text-text-cream300 mb-4">
                {contactInfo.description}
              </p>
              <Button size="sm" onClick={contactInfo.onContact} className="button-gradient-primary">
                {contactInfo.buttonText}
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    );
  }
);
FaqSection.displayName = "FaqSection";

// Main Pricing Page Component
interface PricingTier {
  name: string;
  subtitle: string;
  price: { monthly: number; yearly: number };
  description: string;
  icon: typeof Zap;
  gradient: string;
  borderGradient: string;
  features: string[];
  highlight: boolean;
  badge: string | null;
}

const pricingPlans: PricingTier[] = [
  {
    name: "Free",
    subtitle: "Perfect for getting started",
    price: { monthly: 0, yearly: 0 },
    description: "Try Audiora with basic features",
    icon: Zap,
    gradient: "from-accent-teal-500/20 to-accent-mint-400/20",
    borderGradient: "from-accent-teal-400 to-accent-mint-400",
    features: [
      "Access to 10 songs",
      "Basic vocabulary tools",
      "Limited quizzes",
      "Community support"
    ],
    highlight: false,
    badge: null
  },
  {
    name: "Pro",
    subtitle: "Most popular choice",
    price: { monthly: 9.99, yearly: 99.99 },
    description: "Advanced features for serious learners",
    icon: Crown,
    gradient: "from-accent-teal-500/20 to-accent-persian-500/20",
    borderGradient: "from-accent-teal-400 to-accent-persian-500",
    features: [
      "Unlimited song access",
      "Advanced vocabulary tools",
      "Unlimited quizzes",
      "Pronunciation feedback",
      "Progress tracking",
      "Offline mode",
      "Priority support",
      "Personalized learning path"
    ],
    highlight: true,
    badge: "Most Popular"
  }
];

const faqItems = [
  {
    question: "Can I switch plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and Apple Pay. For annual plans, we also offer invoice payment options."
  },
  {
    question: "Is there a free trial available?",
    answer: "Our Free plan gives you access to basic features indefinitely. You can upgrade to Pro whenever you're ready."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee if you're not satisfied with your Pro subscription."
  },
  {
    question: "How many languages can I learn?",
    answer: "You can learn multiple languages with any plan. Each language's progress is tracked separately."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period."
  }
];

function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const handlePlanSelect = (planName: string) => {
    console.log(`Selected ${planName} plan with ${isYearly ? 'yearly' : 'monthly'} billing`);
  };

  const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number) => {
    return Math.max(0, (monthlyPrice * 12) - yearlyPrice);
  };

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

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: { 
      scale: 1.05, 
      y: -10,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  // Floating music notes
  const musicNotes = ['♪', '♫', '♩', '♬', '♭', '♮', '♯'];

  return (
    <div className="min-h-screen bg-base-dark2">
      {/* Pricing Section */}
      <section className="relative py-20 bg-gradient-to-br from-base-dark2 via-base-dark3/30 to-base-dark2 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-accent-teal-500/5 via-accent-persian-500/5 to-accent-mint-400/5"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '400% 400%'
            }}
          />
          
          {/* Floating music notes */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-accent-teal-400/20 text-2xl md:text-4xl font-bold select-none pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                textShadow: '0 0 20px rgba(45, 212, 191, 0.3)',
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.1, 0.6, 0.1],
                scale: [0.8, 1.2, 0.8],
                rotate: [0, 360, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 4,
              }}
            >
              {musicNotes[Math.floor(Math.random() * musicNotes.length)]}
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="relative z-10 max-w-6xl mx-auto px-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
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
              className="flex items-center justify-center gap-4"
              variants={fadeInUp}
            >
              <span className={`text-sm font-medium ${!isYearly ? 'text-text-cream100' : 'text-text-cream400'}`}>
                Monthly
              </span>
              <motion.button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full border-2 transition-all ${
                  isYearly ? 'bg-accent-teal-500 border-accent-teal-500' : 'bg-base-dark3 border-accent-teal-500/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 bg-text-cream100 rounded-full shadow-lg"
                  animate={{
                    x: isYearly ? 26 : 2
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              </motion.button>
              <span className={`text-sm font-medium ${isYearly ? 'text-text-cream100' : 'text-text-cream400'}`}>
                Yearly
              </span>
              {isYearly && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400"
                >
                  Save 17%
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20"
            variants={staggerContainer}
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className="relative"
                variants={fadeInUp}
                onHoverStart={() => setHoveredPlan(index)}
                onHoverEnd={() => setHoveredPlan(null)}
              >
                <motion.div
                  className={`relative h-full p-8 rounded-2xl border backdrop-blur-sm overflow-hidden ${
                    plan.highlight
                      ? 'bg-gradient-to-br from-accent-teal-500/10 to-accent-persian-500/10 border-accent-teal-400/30 shadow-lg'
                      : 'bg-base-dark3/50 border-accent-teal-500/20 hover:border-accent-teal-400/40'
                  }`}
                  variants={cardHover}
                  initial="rest"
                  whileHover="hover"
                >
                  {/* Badge */}
                  {plan.badge && (
                    <motion.div
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-accent-teal-500 text-text-cream100"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {plan.badge}
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} border border-accent-teal-500/30 flex items-center justify-center mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <plan.icon className="w-6 h-6 text-accent-teal-400" />
                    </motion.div>

                    {/* Plan Info */}
                    <h3 className="text-2xl font-bold text-text-cream100 mb-2">{plan.name}</h3>
                    <p className="text-text-cream300 text-sm mb-4">{plan.subtitle}</p>
                    <p className="text-text-cream200 mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-text-cream100">
                          ${isYearly ? plan.price.yearly : plan.price.monthly}
                        </span>
                        <span className="text-text-cream400">
                          {plan.price.monthly === 0 ? '' : `/${isYearly ? 'year' : 'month'}`}
                        </span>
                      </div>
                      {isYearly && plan.price.monthly > 0 && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-green-400 text-sm mt-1"
                        >
                          Save ${calculateYearlySavings(plan.price.monthly, plan.price.yearly)} per year
                        </motion.p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          className="flex items-center gap-3 py-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                        >
                          <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-text-cream200 text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => handlePlanSelect(plan.name)}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                        plan.highlight
                          ? 'button-gradient-primary text-text-cream100'
                          : 'button-gradient-secondary text-text-cream200 border border-accent-teal-500/30'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {plan.price.monthly === 0 ? 'Get Started Free' : 'Choose Plan'}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </motion.button>
                  </div>

                  {/* Hover glow effect */}
                  <AnimatePresence>
                    {hoveredPlan === index && plan.highlight && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-accent-teal-500/5 border border-accent-teal-400/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <FaqSection
        title="Frequently Asked Questions"
        description="Everything you need to know about our pricing and plans"
        items={faqItems}
        contactInfo={{
          title: "Still have questions?",
          description: "We're here to help you choose the right plan",
          buttonText: "Contact Support",
          onContact: () => console.log("Contact support clicked"),
        }}
      />
    </div>
  );
}

export default PricingPage;