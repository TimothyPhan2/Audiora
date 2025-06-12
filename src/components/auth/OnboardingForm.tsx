import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { SupportedLanguage, ProficiencyLevel } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { MusicLanguageLearningOnboarding } from '@/components/ui/music-language-learning-onboarding';

type OnboardingFormProps = {
  onSuccess?: () => void;
};

export function OnboardingForm({ onSuccess }: OnboardingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUserPreferences } = useAuthStore();

  const handleComplete = async (data: { language: string; fluency: string }) => {
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
        selectedLanguage: data.language as SupportedLanguage,
        proficiencyLevel: data.fluency as ProficiencyLevel,
      });

      toast.success('Preferences saved!', {
        description: `You're all set to start learning ${data.language} at ${data.fluency} level.`,
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
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-accent-teal-400" />
        </div>
      )}
      <MusicLanguageLearningOnboarding onComplete={handleComplete} />
    </>
  );
}