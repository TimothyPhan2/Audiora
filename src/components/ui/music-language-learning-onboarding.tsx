import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Globe, Star, ArrowRight, Volume2 } from 'lucide-react';

// GlowEffect component adapted for Audiora's color scheme
export type GlowEffectProps = {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
  mode?:
    | 'rotate'
    | 'pulse'
    | 'breathe'
    | 'colorShift'
    | 'flowHorizontal'
    | 'static';
  blur?:
    | number
    | 'softest'
    | 'soft'
    | 'medium'
    | 'strong'
    | 'stronger'
    | 'strongest'
    | 'none';
  scale?: number;
  duration?: number;
};

export function GlowEffect({
  className,
  style,
  colors = ['#2dd4bf', '#14b8a6', '#00a896', '#00d4b0'],
  mode = 'rotate',
  blur = 'medium',
  scale = 1,
  duration = 5,
}: GlowEffectProps) {
  const BASE_TRANSITION = {
    repeat: Infinity,
    duration: duration,
    ease: 'linear',
  };

  const animations = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(', ')})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(', ')})`,
      ],
      transition: BASE_TRANSITION,
    },
    pulse: {
      background: colors.map(
        (color) =>
          `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
      ),
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        ...BASE_TRANSITION,
        repeatType: 'mirror',
      },
    },
    breathe: {
      background: [
        ...colors.map(
          (color) =>
            `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
        ),
      ],
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition: {
        ...BASE_TRANSITION,
        repeatType: 'mirror',
      },
    },
    colorShift: {
      background: colors.map((color, index) => {
        const nextColor = colors[(index + 1) % colors.length];
        return `conic-gradient(from 0deg at 50% 50%, ${color} 0%, ${nextColor} 50%, ${color} 100%)`;
      }),
      transition: {
        ...BASE_TRANSITION,
        repeatType: 'mirror',
      },
    },
    flowHorizontal: {
      background: colors.map((color) => {
        const nextColor = colors[(colors.indexOf(color) + 1) % colors.length];
        return `linear-gradient(to right, ${color}, ${nextColor})`;
      }),
      transition: {
        ...BASE_TRANSITION,
        repeatType: 'mirror',
      },
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(', ')})`,
    },
  };

  const getBlurClass = (blur: GlowEffectProps['blur']) => {
    if (typeof blur === 'number') {
      return `blur-[${blur}px]`;
    }

    const presets = {
      softest: 'blur-sm',
      soft: 'blur',
      medium: 'blur-md',
      strong: 'blur-lg',
      stronger: 'blur-xl',
      strongest: 'blur-xl',
      none: 'blur-none',
    };

    return presets[blur as keyof typeof presets];
  };

  return (
    <motion.div
      style={
        {
          ...style,
          '--scale': scale,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        } as React.CSSProperties
      }
      animate={animations[mode]}
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        'scale-[var(--scale)] transform-gpu',
        getBlurClass(blur),
        className
      )}
    />
  );
}

// BackgroundBeams component with Audiora's teal color scheme
export const BackgroundBeams = React.memo(
  ({ className }: { className?: string }) => {
    const paths = [
      "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
      "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
      "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
      "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
      "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
    ];
    
    return (
      <div
        className={cn(
          "absolute h-full w-full inset-0 [mask-size:40px] [mask-repeat:no-repeat] flex items-center justify-center",
          className,
        )}
      >
        <svg
          className="z-0 h-full w-full pointer-events-none absolute"
          width="100%"
          height="100%"
          viewBox="0 0 696 316"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {paths.map((path, index) => (
            <motion.path
              key={`path-${index}`}
              d={path}
              stroke={`url(#linearGradient-${index})`}
              strokeOpacity="0.4"
              strokeWidth="0.5"
            />
          ))}
          <defs>
            {paths.map((path, index) => (
              <motion.linearGradient
                id={`linearGradient-${index}`}
                key={`gradient-${index}`}
                initial={{
                  x1: "0%",
                  x2: "0%",
                  y1: "0%",
                  y2: "0%",
                }}
                animate={{
                  x1: ["0%", "100%"],
                  x2: ["0%", "95%"],
                  y1: ["0%", "100%"],
                  y2: ["0%", `${93 + Math.random() * 8}%`],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: Math.random() * 10,
                }}
              >
                <stop stopColor="#2dd4bf" stopOpacity="0" />
                <stop stopColor="#2dd4bf" />
                <stop offset="32.5%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#00a896" stopOpacity="0" />
              </motion.linearGradient>
            ))}
          </defs>
        </svg>
      </div>
    );
  },
);

BackgroundBeams.displayName = "BackgroundBeams";

// Language options data - matching Audiora's supported languages
const languages = [
  { value: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'French', label: 'French', flag: '🇫🇷' },
  { value: 'German', label: 'German', flag: '🇩🇪' },
  { value: 'Italian', label: 'Italian', flag: '🇮🇹' },
];

const fluencyLevels = [
  { value: 'Beginner', label: 'Beginner', description: 'Just starting out or know very basic words' },
  { value: 'Intermediate', label: 'Intermediate', description: 'Can understand simple conversations and texts' },
  { value: 'Advanced', label: 'Advanced', description: 'Comfortable with complex topics and expressions' },
  { value: 'Fluent', label: 'Fluent', description: 'Near-native level understanding and speaking' },
];

interface OnboardingFormProps {
  onComplete?: (data: { language: string; fluency: string }) => void;
}

function MusicLanguageLearningOnboarding({ onComplete }: OnboardingFormProps = {}) {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFluency, setSelectedFluency] = useState('');
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step === 1 && selectedLanguage) {
      setStep(2);
    } else if (step === 2 && selectedFluency) {
      onComplete?.({ language: selectedLanguage, fluency: selectedFluency });
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const canProceed = step === 1 ? selectedLanguage : selectedFluency;

  return (
    <div className="min-h-screen auth-gradient relative overflow-hidden">
      <BackgroundBeams />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <Card className="relative overflow-hidden frosted-glass border border-accent-teal-500/20 shadow-2xl">
            <GlowEffect
              colors={['#2dd4bf', '#14b8a6', '#00a896', '#00d4b0']}
              mode="breathe"
              blur="medium"
              className="opacity-20"
            />
            
            <CardHeader className="relative z-10 text-center pb-8 pt-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-accent-teal-400 to-accent-teal-500 rounded-full flex items-center justify-center"
              >
                <Music className="w-10 h-10 text-base-dark2" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold gradient-text mb-4"
              >
                Welcome to Audiora!
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-text-cream300 max-w-md mx-auto"
              >
                Learn languages through the power of music. Let's personalize your learning journey!
              </motion.p>
            </CardHeader>

            <CardContent className="relative z-10 px-8 pb-12">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= 1 ? 'bg-accent-teal-400 text-base-dark2' : 'bg-base-dark3 text-text-cream400'
                    }`}>
                      1
                    </div>
                    <span className={`text-sm font-medium ${step >= 1 ? 'text-text-cream100' : 'text-text-cream400'}`}>
                      Choose Language
                    </span>
                  </div>
                  
                  <div className="flex-1 mx-4 h-1 bg-base-dark3 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent-teal-400 to-accent-mint-400"
                      initial={{ width: "0%" }}
                      animate={{ width: step >= 2 ? "100%" : "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= 2 ? 'bg-accent-teal-400 text-base-dark2' : 'bg-base-dark3 text-text-cream400'
                    }`}>
                      2
                    </div>
                    <span className={`text-sm font-medium ${step >= 2 ? 'text-text-cream100' : 'text-text-cream400'}`}>
                      Fluency Level
                    </span>
                  </div>
                </div>
              </div>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Globe className="w-12 h-12 text-accent-teal-400 mx-auto mb-4" />
                      <h2 className="text-2xl font-semibold mb-2 text-text-cream100">Which language would you like to learn?</h2>
                      <p className="text-text-cream300">Choose the language you want to master through music</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="language-select" className="text-base font-medium text-text-cream200">
                        Select Language
                      </Label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="h-14 text-left bg-white/10 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100">
                          <SelectValue placeholder="Choose your target language..." />
                        </SelectTrigger>
                        <SelectContent className="bg-base-dark2 border-accent-teal-500/30">
                          {languages.map((language) => (
                            <SelectItem key={language.value} value={language.value} className="text-text-cream100 focus:bg-accent-teal-500/20">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{language.flag}</span>
                                <span className="font-medium">{language.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedLanguage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-accent-teal-500/10 border border-accent-teal-400/30 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Volume2 className="w-5 h-5 text-accent-teal-400" />
                          <div>
                            <p className="font-medium text-text-cream100">Great choice!</p>
                            <p className="text-sm text-text-cream300">
                              You'll learn {languages.find(l => l.value === selectedLanguage)?.label} through popular songs and music.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Star className="w-12 h-12 text-accent-teal-400 mx-auto mb-4" />
                      <h2 className="text-2xl font-semibold mb-2 text-text-cream100">What's your current fluency level?</h2>
                      <p className="text-text-cream300">
                        This helps us personalize your learning experience in {languages.find(l => l.value === selectedLanguage)?.label}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium text-text-cream200">Current Level</Label>
                      <div className="grid gap-3">
                        {fluencyLevels.map((level) => (
                          <motion.div
                            key={level.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedFluency(level.value)}
                              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                                selectedFluency === level.value
                                  ? 'border-accent-teal-400 bg-accent-teal-500/10'
                                  : 'border-accent-teal-500/20 hover:border-accent-teal-400/50 bg-white/5'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-text-cream100">{level.label}</h3>
                                  <p className="text-sm text-text-cream300">{level.description}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  selectedFluency === level.value
                                    ? 'border-accent-teal-400 bg-accent-teal-400'
                                    : 'border-text-cream400'
                                }`}>
                                  {selectedFluency === level.value && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-full h-full rounded-full bg-accent-teal-400"
                                    />
                                  )}
                                </div>
                              </div>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              <div className="flex justify-between mt-8 pt-6 border-t border-accent-teal-500/20">
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack} className="bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10">
                    Back
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`${step === 1 ? 'ml-auto' : ''} group button-gradient-primary text-white font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-50`}
                >
                  {step === 2 ? 'Start Learning!' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export { MusicLanguageLearningOnboarding };
export default MusicLanguageLearningOnboarding;