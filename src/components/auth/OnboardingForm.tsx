import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { SupportedLanguage, ProficiencyLevel } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { MusicLanguageLearningOnboarding } from '@/components/ui/music-language-learning-onboarding';

type OnboardingFormProps = {
  onSuccess?: () => void;
};

export function OnboardingForm({ onSuccess }: OnboardingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { user, isAuthenticated, updateUserPreferences } = useAuthStore();
  const navigate = useNavigate();

  // Authentication state verification
  useEffect(() => {
    console.log('OnboardingForm: Checking authentication state...', { 
      user, 
      isAuthenticated 
    });
    
    // Check if user is properly authenticated
    if (!isAuthenticated || !user) {
      console.log('OnboardingForm: User not authenticated, redirecting to login');
      setAuthError('Authentication required. Please log in to continue.');
      
      toast.error('Authentication required', {
        description: 'Please log in to access the onboarding process.',
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
      return;
    }
    
    // Check if user has already completed onboarding
    if (user.learning_languages?.length > 0 && user.proficiency_level) {
      console.log('OnboardingForm: User has already completed onboarding, redirecting to dashboard');
      
      toast.success('Welcome back!', {
        description: 'You have already completed onboarding. Redirecting to dashboard.',
      });
      
      navigate('/dashboard', { replace: true });
      return;
    }
    
    console.log('OnboardingForm: User authenticated and needs onboarding');
    setAuthError(null);
  }, [user, isAuthenticated, navigate]);

  const handleComplete = async (data: { language: string; fluency: string }) => {
    // Double-check authentication before proceeding
    if (!user) {
      setAuthError('Authentication lost. Please log in again.');
      toast.error('Authentication required', {
        description: 'Your session has expired. Please log in again.',
      });
      navigate('/login', { replace: true });
      return;
    }

    console.log('OnboardingForm: Starting onboarding completion...', { 
      userId: user.id, 
      language: data.language, 
      fluency: data.fluency 
    });

    setIsLoading(true);
    setAuthError(null);

    try {
      await updateUserPreferences({
        userId: user.id,
        selectedLanguage: data.language as SupportedLanguage,
        proficiencyLevel: data.fluency as ProficiencyLevel,
      });

      console.log('OnboardingForm: Preferences updated successfully');

      toast.success('Preferences saved!', {
        description: `You're all set to start learning ${data.language} at ${data.fluency} level.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences';
      setAuthError(errorMessage);
      
      toast.error('Failed to save preferences', {
        description: errorMessage + '. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show error state if there's an authentication error
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-gradient">
        <div className="text-center max-w-md">
          <img src="/audiora_logo_variant1.png" alt="Audiora Logo" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h1>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{authError}</p>
          </div>
          <p className="text-text-cream300 text-sm">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-gradient">
        <div className="text-center">
          <img src="/audiora_logo_variant1.png" alt="Audiora Logo" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold gradient-text mb-4">Verifying Authentication...</h1>
          <div className="flex items-center justify-center gap-2 text-text-cream300">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Please wait while we verify your session</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-base-dark2 rounded-xl p-6 border border-accent-teal-500/20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent-teal-400 mx-auto mb-3" />
            <p className="text-text-cream200 font-medium">Saving your preferences...</p>
            <p className="text-text-cream400 text-sm mt-1">This may take a moment</p>
          </div>
        </div>
      )}
      <MusicLanguageLearningOnboarding onComplete={handleComplete} />
    </>
  );
}