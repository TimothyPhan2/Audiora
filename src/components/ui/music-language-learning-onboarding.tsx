'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, Globe, Star, ArrowRight, Check } from 'lucide-react'

interface OnboardingProps {
  onComplete: (data: { language: string; fluency: string }) => void
}

const languages = [
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸', color: 'from-red-500 to-yellow-500' },
  { code: 'french', name: 'French', flag: '🇫🇷', color: 'from-blue-500 to-red-500' },
  { code: 'italian', name: 'Italian', flag: '🇮🇹', color: 'from-green-500 to-red-500' },
  { code: 'german', name: 'German', flag: '🇩🇪', color: 'from-black to-red-500' },
]

const fluencyLevels = [
  { 
    level: 'Beginner', 
    description: 'Just starting out',
    icon: '🌱',
    details: 'Perfect for complete beginners who want to learn basic vocabulary and phrases through music.'
  },
  { 
    level: 'Intermediate', 
    description: 'Some experience',
    icon: '🌿',
    details: 'Great for learners who know some basics and want to expand their vocabulary and understanding.'
  },
  { 
    level: 'Advanced', 
    description: 'Quite comfortable',
    icon: '🌳',
    details: 'Ideal for confident speakers looking to refine their skills and learn nuanced expressions.'
  },
  { 
    level: 'Fluent', 
    description: 'Very confident',
    icon: '🏆',
    details: 'Perfect for fluent speakers who want to explore cultural nuances and advanced vocabulary.'
  },
]

export function MusicLanguageLearningOnboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedFluency, setSelectedFluency] = useState('')

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language)
    setTimeout(() => setStep(2), 300)
  }

  const handleFluencySelect = (fluency: string) => {
    setSelectedFluency(fluency)
  }

  const handleComplete = () => {
    if (selectedLanguage && selectedFluency) {
      onComplete({ language: selectedLanguage, fluency: selectedFluency })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Music className="h-12 w-12 text-accent-teal-400" />
              <motion.div
                className="absolute -top-1 -right-1 h-4 w-4 bg-accent-mint-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" as const }}
              />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Welcome to Audiora</h1>
          </div>
          <p className="text-lg text-text-cream300 max-w-2xl mx-auto">
            Let's personalize your language learning journey through music
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          className="flex items-center justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= 1 ? 'bg-accent-teal-400 border-accent-teal-400 text-base-dark2' : 'border-text-cream400 text-text-cream400'
            }`}>
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-accent-teal-400' : 'bg-text-cream400/30'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= 2 ? 'bg-accent-teal-400 border-accent-teal-400 text-base-dark2' : 'border-text-cream400 text-text-cream400'
            }`}>
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
          </div>
        </motion.div>

        {/* Step 1: Language Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-text-cream100 mb-2">
                Which language would you like to learn?
              </h2>
              <p className="text-text-cream300">
                Choose the language you're most excited to explore through music
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {languages.map((language, index) => (
                <motion.div
                  key={language.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                      selectedLanguage === language.name 
                        ? 'border-accent-teal-400 bg-accent-teal-500/10' 
                        : 'border-accent-teal-500/20 hover:border-accent-teal-400/50'
                    } bg-base-dark3/60 backdrop-blur-sm`}
                    onClick={() => handleLanguageSelect(language.name)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{language.flag}</div>
                      <h3 className="text-xl font-semibold text-text-cream100 mb-2">
                        {language.name}
                      </h3>
                      <div className={`h-1 w-full bg-gradient-to-r ${language.color} rounded-full opacity-60`} />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Fluency Level Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-text-cream100 mb-2">
                What's your current level in {selectedLanguage}?
              </h2>
              <p className="text-text-cream300">
                This helps us recommend the perfect songs for your learning journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
              {fluencyLevels.map((level, index) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                      selectedFluency === level.level 
                        ? 'border-accent-teal-400 bg-accent-teal-500/10' 
                        : 'border-accent-teal-500/20 hover:border-accent-teal-400/50'
                    } bg-base-dark3/60 backdrop-blur-sm`}
                    onClick={() => handleFluencySelect(level.level)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{level.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-text-cream100 mb-1">
                            {level.level}
                          </h3>
                          <p className="text-sm text-text-cream300 mb-2">
                            {level.description}
                          </p>
                          <p className="text-xs text-text-cream400">
                            {level.details}
                          </p>
                        </div>
                        {selectedFluency === level.level && (
                          <Check className="h-5 w-5 text-accent-teal-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {selectedFluency && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  onClick={handleComplete}
                  className="button-gradient-primary text-white px-8 py-3 text-lg font-medium"
                >
                  Start Learning with Music
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Decorative Elements */}
        <div className="fixed top-10 left-10 opacity-20">
          <Globe className="h-16 w-16 text-accent-teal-400 animate-pulse" />
        </div>
        <div className="fixed bottom-10 right-10 opacity-20">
          <Star className="h-12 w-12 text-accent-mint-400 animate-pulse" />
        </div>
      </div>
    </div>
  )
}