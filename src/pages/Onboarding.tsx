import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingForm } from '@/components/auth/OnboardingForm';
import { useAuthStore } from '@/stores/authStore';

export function Onboarding() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // Redirect to dashboard if user has already completed onboarding
    if (user && user.learning_languages.length > 0 && user.proficiency_level) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const handleOnboardingSuccess = () => {
    navigate('/dashboard', { replace: true });
  };

  // Don't render anything while checking authentication/onboarding status
  if (!isAuthenticated || (user && user.learning_languages.length > 0 && user.proficiency_level)) {
    return null;
  }

  return <OnboardingForm onSuccess={handleOnboardingSuccess} />;
}