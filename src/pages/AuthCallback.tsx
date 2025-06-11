import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setSession, fetchUser } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login', { replace: true });
          return;
        }

        if (data.session) {
          setSession(data.session);
          
          // Fetch user data (this will create profile if it doesn't exist)
          await fetchUser();
          
          // Get updated user state to check onboarding status
          const userState = useAuthStore.getState();
          const user = userState.user;
          
          // Redirect based on onboarding status
          if (user && user.learning_languages?.length > 0 && user.proficiency_level) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, setSession, fetchUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-gradient">
      <div className="text-center">
        <img src="/audiora_logo_variant1.png" alt="Audiora Logo" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold gradient-text mb-4">Completing Sign In...</h1>
        <div className="flex items-center justify-center gap-2 text-text-cream300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Please wait while we set up your account</span>
        </div>
      </div>
    </div>
  );
}