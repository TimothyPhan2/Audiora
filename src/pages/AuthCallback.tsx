import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setSession, fetchUser } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Show success message for email confirmation
        toast.success('Email confirmed successfully!', {
          description: 'Welcome to Audiora! Let\'s set up your learning preferences.',
        });
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login', { replace: true });
          return;
        }

        if (data.session) {
          setSession(data.session);
          
          // Fetch user data and get the returned user object
          const user = await fetchUser();
          
          if (user) {
            // Use the returned user object to make navigation decision
            if (user.learning_languages?.length > 0 && user.proficiency_level) {
              toast.success('Welcome back!', {
                description: 'Redirecting to your dashboard...',
              });
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/onboarding', { replace: true });
            }
          } else {
            // If user fetch failed, redirect to onboarding as fallback
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
          <div className="mt-4 text-sm text-text-cream400">
            <p>This may take a few moments. Please don't close this window.</p>
          </div>
        </div>
      </div>
    </div>
  );
}