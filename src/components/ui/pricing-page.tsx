'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Music, Headphones, BookOpen, Mic } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started with language learning through music',
    features: [
      'Access to 10 songs',
      'Basic vocabulary tools',
      'Limited quizzes',
      'Community support',
      'Mobile app access'
    ],
    limitations: [
      'Limited song library',
      'Basic features only',
      'No offline access'
    ],
    cta: 'Get Started Free',
    popular: false,
    color: 'from-gray-500 to-gray-600'
  },
  {
    name: 'Pro',
    price: 9.99,
    period: 'month',
    description: 'Unlock the full potential of music-based language learning',
    features: [
      'Unlimited song access',
      'Advanced vocabulary tools',
      'Unlimited quizzes',
      'Pronunciation feedback',
      'Progress tracking',
      'Personalized learning path',
      'Offline mode',
      'Priority support',
      'Advanced analytics',
      'Custom playlists'
    ],
    limitations: [],
    cta: 'Start Pro Trial',
    popular: true,
    color: 'from-accent-teal-400 to-accent-mint-400'
  }
]

const features = [
  {
    icon: Music,
    title: 'Unlimited Songs',
    description: 'Access our entire library of songs in multiple languages',
    free: '10 songs',
    pro: 'Unlimited'
  },
  {
    icon: BookOpen,
    title: 'Vocabulary Tools',
    description: 'Advanced tools to build and practice your vocabulary',
    free: 'Basic',
    pro: 'Advanced'
  },
  {
    icon: Headphones,
    title: 'Audio Quality',
    description: 'High-quality audio for better pronunciation learning',
    free: 'Standard',
    pro: 'HD Audio'
  },
  {
    icon: Mic,
    title: 'Pronunciation Feedback',
    description: 'AI-powered feedback on your pronunciation',
    free: false,
    pro: true
  }
]

export default function PricingPage() {
  const navigate = useNavigate()
  const [isAnnual, setIsAnnual] = useState(false)

  const handlePlanSelect = (planName: string) => {
    if (planName === 'Free') {
      navigate('/signup')
    } else {
      // In a real app, this would redirect to payment processing
      navigate('/signup')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Choose Your Learning Journey
          </h1>
          <p className="text-lg text-text-cream300 max-w-2xl mx-auto mb-8">
            Start learning languages through music with our flexible pricing plans. 
            Upgrade anytime to unlock advanced features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-text-cream100' : 'text-text-cream400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isAnnual ? 'bg-accent-teal-400' : 'bg-text-cream400/30'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-text-cream100' : 'text-text-cream400'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-accent-teal-500/20 text-accent-teal-400 border-accent-teal-500/30">
                Save 20%
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-accent-teal-400 to-accent-mint-400 text-base-dark2 px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`relative overflow-hidden border-2 ${
                plan.popular 
                  ? 'border-accent-teal-400/50 bg-gradient-to-br from-accent-teal-500/10 to-accent-mint-500/10' 
                  : 'border-accent-teal-500/20 bg-base-dark3/60'
              } backdrop-blur-sm`}>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-text-cream100 mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-accent-teal-400">
                      ${plan.price === 0 ? '0' : isAnnual ? (plan.price * 12 * 0.8).toFixed(0) : plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-text-cream400 ml-2">
                        /{isAnnual ? 'year' : plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-text-cream300 text-sm">
                    {plan.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-accent-teal-400 flex-shrink-0" />
                        <span className="text-text-cream200 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-accent-teal-500/20">
                      <p className="text-text-cream400 text-xs mb-2">Limitations:</p>
                      <div className="space-y-1">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="text-text-cream400 text-xs">
                            • {limitation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handlePlanSelect(plan.name)}
                    className={`w-full py-3 ${
                      plan.popular
                        ? 'button-gradient-primary text-white'
                        : 'bg-transparent border border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-text-cream100 text-center mb-8">
            Compare Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-base-dark3/60 border-accent-teal-500/20">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-8 w-8 text-accent-teal-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-text-cream100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-cream300 text-sm mb-4">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-cream400">Free:</span>
                      <span className="text-text-cream200">
                        {typeof feature.free === 'boolean' 
                          ? (feature.free ? '✓' : '✗')
                          : feature.free
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-cream400">Pro:</span>
                      <span className="text-accent-teal-400 font-medium">
                        {typeof feature.pro === 'boolean' 
                          ? (feature.pro ? '✓' : '✗')
                          : feature.pro
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mt-16"
        >
          <h2 className="text-2xl font-bold text-text-cream100 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card className="bg-base-dark3/60 border-accent-teal-500/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-text-cream100 mb-2">
                  Can I switch plans anytime?
                </h3>
                <p className="text-text-cream300 text-sm">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-base-dark3/60 border-accent-teal-500/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-text-cream100 mb-2">
                  Is there a free trial for Pro?
                </h3>
                <p className="text-text-cream300 text-sm">
                  Yes! New users get a 7-day free trial of Pro features. No credit card required.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-base-dark3/60 border-accent-teal-500/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-text-cream100 mb-2">
                  What languages are supported?
                </h3>
                <p className="text-text-cream300 text-sm">
                  Currently we support Spanish, French, Italian, and German, with more languages coming soon!
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <h2 className="text-2xl font-bold text-text-cream100 mb-4">
            Ready to start learning?
          </h2>
          <p className="text-text-cream300 mb-8">
            Join thousands of learners who are mastering languages through music.
          </p>
          <Button 
            onClick={() => navigate('/signup')}
            className="button-gradient-primary text-white px-8 py-3 text-lg"
          >
            Start Your Journey
          </Button>
        </motion.div>
      </div>
    </div>
  )
}