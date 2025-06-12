import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Globe, Star, ArrowRight, Check } from 'lucide-react';

// Musical notes for animation
const musicalNotes = ['♪', '♫', '♩', '♬', '♭', '♮', '♯', '♭'];

// Component: BackgroundBeams
// Purpose: Create an animated musical background with floating notes and waves
const BackgroundBeams = React.memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background waves with reduced opacity */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(45, 212, 191, 0.2)" />
            <stop offset="50%" stopColor="rgba(0, 168, 150, 0.2)" />
            <stop offset="100%" stopColor="rgba(0, 212, 176, 0.2)" />
          </linearGradient>
          <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0, 212, 176, 0.2)" />
            <stop offset="50%" stopColor="rgba(45, 212, 191, 0.2)" />
            <stop offset="100%" stopColor="rgba(0, 168, 150, 0.2)" />
          </linearGradient>
        </defs>
        
        {/* Background waves */}
        <motion.path
          d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z"
          fill="url(#wave-gradient-1)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,500 Q300,450 600,500 T1200,500 L1200,800 L0,800 Z"
          fill="url(#wave-gradient-2)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Floating musical notes */}
      <div className="absolute inset-0">
        {musicalNotes.map((note, index) => (
          <motion.div
            key={index}
            className="absolute text-accent-teal-400 text-4xl font-bold pointer-events-none select-none"
            style={{
              left: `${10 + index * 12}%`,
              top: `${20 + Math.sin(index) * 15}%`,
              fontSize: '32px',
              textShadow: '0 0 20px rgba(45, 212, 191, 0.6), 0 0 40px rgba(45, 212, 191, 0.4)',
              filter: 'drop-shadow(0 0 10px rgba(45, 212, 191, 0.8))',
            }}
            initial={{ 
              opacity: 0.4,
              scale: 0.95,
              y: -30,
              x: 0,
              rotate: -10
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [0.95, 1.05, 0.95],
              y: [-30, 30, -30],
              x: [0, 15, 0],
              rotate: [-10, 10, -10],
            }}
            transition={{
              duration: 4 + (index % 3),
              delay: index * 0.2,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut",
            }}
          >
            {note}
          </motion.div>
        ))}
      </div>
    </div>
  );
});

BackgroundBeams.displayName = 'BackgroundBeams';

interface OnboardingData {
  language: string;
  fluency: string;
}

interface MusicLanguageLearningOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const languages = [
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸', description: 'Learn with Latin rhythms' },
  { code: 'french', name: 'French', flag: '🇫🇷', description: 'Discover chanson and pop' },
  { code: 'italian', name: 'Italian', flag: '🇮🇹', description: 'Opera and modern hits' },
  { code: 'german', name: 'German', flag: '🇩🇪', description: 'From classical to electronic' },
];

const fluencyLevels = [
  { 
    level: 'Beginner', 
    description: 'Just starting out',
    details: 'Perfect for first-time learners. We\'ll start with simple songs and basic vocabulary.',
    icon: <Star className="w-5 h-5" />
  },
  { 
    level: 'Intermediate', 
    description: 'Some experience',
    details: 'You know some basics. We\'ll help you expand with more complex songs and grammar.',
    icon: <Globe className="w-5 h-5" />
  },
  { 
    level: 'Advanced', 
    description: 'Quite comfortable',
    details: 'You\'re confident with the language. Let\'s refine your skills with challenging content.',
    icon: <Music className="w-5 h-5" />
  },
  { 
    level: 'Fluent', 
    description: 'Nearly native level',
    details: 'You\'re almost fluent. We\'ll help you perfect nuances and cultural expressions.',
    icon: <Check className="w-5 h-5" />
  },
];

export function MusicLanguageLearningOnboarding({ onComplete }: MusicLanguageLearningOnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFluency, setSelectedFluency] = useState('');

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setTimeout(() => setStep(2), 300);
  };

  const handleFluencySelect = (fluency: string) => {
    setSelectedFluency(fluency);
  };

  const handleComplete = () => {
    if (selectedLanguage && selectedFluency) {
      onComplete({
        language: selectedLanguage,
        fluency: selectedFluency,
      });
    }
  };

  const selectedLanguageData = languages.find(lang => lang.code === selectedLanguage);
  const selectedFluencyData = fluencyLevels.find(level => level.level === selectedFluency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundBeams />
      
      <div className="w-full max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              {/* Header */}
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-teal-500/20 rounded-full border border-accent-teal-500/30"
                >
                  <Music className="w-5 h-5 text-accent-teal-400" />
                  <span className="text-accent-teal-400 font-medium">Welcome to Audiora</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold gradient-text"
                >
                  Which language would you like to learn?
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-text-cream300 max-w-2xl mx-auto"
                >
                  Choose your target language and start your musical learning journey
                </motion.p>
              </div>

              {/* Language Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto"
              >
                {languages.map((language, index) => (
                  <motion.div
                    key={language.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                        selectedLanguage === language.code
                          ? 'border-accent-teal-400 bg-accent-teal-500/10'
                          : 'border-accent-teal-500/20 hover:border-accent-teal-400/50 bg-base-dark3/60'
                      }`}
                      onClick={() => handleLanguageSelect(language.code)}
                    >
                      <CardContent className="p-6 text-center space-y-3">
                        <div className="text-4xl mb-2">{language.flag}</div>
                        <h3 className="text-xl font-semibold text-text-cream100">{language.name}</h3>
                        <p className="text-text-cream300 text-sm">{language.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-teal-500/20 rounded-full border border-accent-teal-500/30"
                >
                  {selectedLanguageData?.flag}
                  <span className="text-accent-teal-400 font-medium">{selectedLanguageData?.name}</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold gradient-text"
                >
                  What's your current level?
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-text-cream300 max-w-2xl mx-auto"
                >
                  Help us personalize your learning experience
                </motion.p>
              </div>

              {/* Fluency Level Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
              >
                {fluencyLevels.map((level, index) => (
                  <motion.div
                    key={level.level}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                        selectedFluency === level.level
                          ? 'border-accent-teal-400 bg-accent-teal-500/10'
                          : 'border-accent-teal-500/20 hover:border-accent-teal-400/50 bg-base-dark3/60'
                      }`}
                      onClick={() => handleFluencySelect(level.level)}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-accent-teal-500/20 rounded-lg">
                            {level.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-text-cream100">{level.level}</h3>
                            <p className="text-text-cream400 text-sm">{level.description}</p>
                          </div>
                        </div>
                        <p className="text-text-cream300 text-sm leading-relaxed">{level.details}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto"
              >
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10"
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleComplete}
                  disabled={!selectedFluency}
                  className="w-full sm:w-auto button-gradient-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>

              {/* Selection Summary */}
              {selectedFluency && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-teal-500/10 rounded-full border border-accent-teal-500/30">
                    <Badge variant="secondary" className="bg-accent-teal-500/20 text-accent-teal-400 border-accent-teal-500/30">
                      {selectedLanguageData?.name}
                    </Badge>
                    <span className="text-text-cream400">•</span>
                    <Badge variant="secondary" className="bg-accent-teal-500/20 text-accent-teal-400 border-accent-teal-500/30">
                      {selectedFluencyData?.level}
                    </Badge>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}