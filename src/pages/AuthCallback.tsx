import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    
    const processAuthCallback = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('AuthCallback: Starting authentication process...');
        
        // Get the current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw new Error(`Session error: ${error.message}`);
        }

        if (!data.session) {
          throw new Error('No session found after authentication');
        }

        console.log('AuthCallback: Session found, setting session and fetching user...');
        
        // setSession now handles user fetching with retry logic
        await setSession(data.session);
        
        // Wait a moment for the store to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if component is still mounted before proceeding
        if (!isMounted) {
          return;
        }
        
        // Get the latest user state from the store
        const currentUser = useAuthStore.getState().user;
        const currentIsAuthenticated = useAuthStore.getState().isAuthenticated;
        
        console.log('AuthCallback: User state after setSession:', { 
          user: currentUser, 
          isAuthenticated: currentIsAuthenticated 
        });

        if (!currentIsAuthenticated || !currentUser) {
          throw new Error('Failed to authenticate user after session creation');
        }
        
        // Show success message for email confirmation or OAuth
        toast.success('Authentication successful!', {
          description: 'Welcome to Audiora!',
        });
        
        // Determine navigation based on onboarding status
        const hasCompletedOnboarding = currentUser.learning_languages?.length > 0 && currentUser.proficiency_level;
        
        if (hasCompletedOnboarding) {
          console.log('AuthCallback: User has completed onboarding, redirecting to dashboard');
          toast.success('Welcome back!', {
            description: 'Redirecting to your dashboard...',
          });
          
          if (isMounted) {
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.log('AuthCallback: User needs onboarding, redirecting to onboarding');
          toast.success('Let\'s set up your learning preferences!', {
            description: 'Redirecting to onboarding...',
          });
          
          if (isMounted) {
            navigate('/onboarding', { replace: true });
          }
        }
        
      } catch (error) {
        console.error('AuthCallback: Error during authentication process:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        
        if (isMounted) {
          setError(errorMessage);
          
          toast.error('Authentication failed', {
            description: errorMessage,
          });
          
          // Wait a moment before redirecting to show the error
          setTimeout(() => {
            if (isMounted) {
              navigate('/login', { replace: true });
            }
          }, 2000);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Start the authentication process
    processAuthCallback();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [navigate, setSession]);

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-gradient">
        <div className="text-center max-w-md">
          <img src="/audiora_logo_variant1.png" alt="Audiora Logo" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h1>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
          <p className="text-text-cream300 text-sm">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-gradient">
      <div className="text-center">
        <img src="/audiora_logo_variant1.png" alt="Audiora Logo" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold gradient-text mb-4">
          {isLoading ? 'Completing Authentication...' : 'Authentication Complete!'}
        </h1>
        
        {isLoading && (
          <>
            <div className="flex items-center justify-center gap-2 text-text-cream300 mb-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Setting up your account...</span>
            </div>
            <div className="text-center text-sm text-text-cream400 space-y-1">
              <p>Please wait while we:</p>
              <ul className="list-disc list-inside space-y-1 text-left max-w-xs mx-auto">
                <li>Verify your authentication</li>
                <li>Set up your user profile</li>
                <li>Check your onboarding status</li>
                <li>Prepare your dashboard</li>
              </ul>
              <p className="mt-3 text-xs">This may take a few moments...</p>
            </div>
          </>
        )}
        
        {!isLoading && (
          <div className="text-text-cream300">
            <p>Redirecting you now...</p>
          </div>
        )}
      </div>
    </div>
  );
}