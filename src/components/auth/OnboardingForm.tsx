import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/lib/store';
import { OnboardingData, SupportedLanguage, ProficiencyLevel } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2, Globe, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const onboardingSchema = z.object({
  selectedLanguage: z.enum(['Spanish', 'French', 'Italian', 'German'], {
    required_error: 'Please select a language to learn',
  }),
  proficiencyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Fluent'], {
    required_error: 'Please select your proficiency level',
  }),
});

type OnboardingFormProps = {
  onSuccess?: () => void;
};

const supportedLanguages: { value: SupportedLanguage; label: string; flag: string }[] = [
  { value: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'French', label: 'French', flag: '🇫🇷' },
  { value: 'Italian', label: 'Italian', flag: '🇮🇹' },
  { value: 'German', label: 'German', flag: '🇩🇪' },
];

const proficiencyLevels: { value: ProficiencyLevel; label: string; description: string }[] = [
  { 
    value: 'Beginner', 
    label: 'Beginner', 
    description: 'Just starting out or know very basic words' 
  },
  { 
    value: 'Intermediate', 
    label: 'Intermediate', 
    description: 'Can understand simple conversations and texts' 
  },
  { 
    value: 'Advanced', 
    label: 'Advanced', 
    description: 'Comfortable with complex topics and expressions' 
  },
  { 
    value: 'Fluent', 
    label: 'Fluent', 
    description: 'Near-native level understanding and speaking' 
  },
];

export function OnboardingForm({ onSuccess }: OnboardingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUserPreferences } = useAuthStore();

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
  });

  const selectedLanguage = watch('selectedLanguage');
  const proficiencyLevel = watch('proficiencyLevel');

  const onSubmit = async (data: OnboardingData) => {
    if (!user) {
      toast.error('Authentication required', {
        description: 'Please log in to continue with onboarding.',
      });
      return;
    }

    setIsLoading(true);

    try {
      await updateUserPreferences({
        userId: user.id,
        selectedLanguage: data.selectedLanguage,
        proficiencyLevel: data.proficiencyLevel,
      });

      toast.success('Preferences saved!', {
        description: `You're all set to start learning ${data.selectedLanguage} at ${data.proficiencyLevel} level.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to save preferences', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-gradient">
      <motion.div 
        className="w-full max-w-lg space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img src="/audiora_logo_variant1.png" alt="Audiora Logo" className="h-16 w-16 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Welcome to Audiora!</h1>
          <p className="text-lg text-text-cream300">
            Let's personalize your language learning journey
          </p>
        </div>

        {/* Onboarding Form */}
        <motion.div 
          className="frosted-glass p-8 border border-accent-teal-500/20 rounded-xl backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Language Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-accent-teal-400" />
                <Label className="text-lg font-medium text-text-cream100">
                  Which language would you like to learn?
                </Label>
              </div>
              
              <Select 
                onValueChange={(value) => setValue('selectedLanguage', value as SupportedLanguage, { shouldValidate: true })}
                value={selectedLanguage}
              >
                <SelectTrigger className="bg-white/10 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100 h-12">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent className="bg-base-dark2 border-accent-teal-500/30 shadow-xl">
                  {supportedLanguages.map((language) => (
                    <SelectItem 
                      key={language.value} 
                      value={language.value}
                      className="text-text-cream100 focus:bg-accent-teal-500/20 focus:text-accent-teal-400 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{language.flag}</span>
                        <span>{language.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {errors.selectedLanguage && (
                <p className="text-sm text-red-400">{errors.selectedLanguage.message}</p>
              )}
            </div>

            {/* Proficiency Level Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-accent-teal-400" />
                <Label className="text-lg font-medium text-text-cream100">
                  What's your current level?
                </Label>
              </div>
              
              <Select 
                onValueChange={(value) => setValue('proficiencyLevel', value as ProficiencyLevel, { shouldValidate: true })}
                value={proficiencyLevel}
              >
                <SelectTrigger className="bg-white/10 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100 h-12">
                  <SelectValue placeholder="Select your proficiency level" />
                </SelectTrigger>
                <SelectContent className="bg-base-dark2 border-accent-teal-500/30 shadow-xl">
                  {proficiencyLevels.map((level) => (
                    <SelectItem 
                      key={level.value} 
                      value={level.value}
                      className="text-text-cream100 focus:bg-accent-teal-500/20 focus:text-accent-teal-400 cursor-pointer py-3"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{level.label}</span>
                        <span className="text-xs text-text-cream400">{level.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {errors.proficiencyLevel && (
                <p className="text-sm text-red-400">{errors.proficiencyLevel.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full button-gradient-primary text-white font-medium py-3 text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !selectedLanguage || !proficiencyLevel}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving preferences...
                </>
              ) : (
                'Start Learning!'
              )}
            </Button>
          </form>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 text-text-cream400">
            <div className="w-2 h-2 bg-accent-teal-400 rounded-full"></div>
            <div className="w-2 h-2 bg-accent-teal-400 rounded-full"></div>
            <div className="w-2 h-2 bg-accent-teal-500/30 rounded-full"></div>
          </div>
          <p className="text-sm mt-2">Step 2 of 3</p>
        </motion.div>
      </motion.div>
    </div>
  );
}