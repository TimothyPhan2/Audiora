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
          
          // Check if user profile exists, create if not
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // User profile doesn't exist, create it
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.session.user.id,
                username: data.session.user.user_metadata?.full_name || 
                         data.session.user.email?.split('@')[0],
                subscription_tier: 'free',
                role: 'user',
                learning_languages: [],
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              });

            if (insertError) {
              console.error('Error creating user profile:', insertError);
            }
          }

          // Fetch user data
          await fetchUser();
          
          // Redirect based on onboarding status
          if (userProfile && userProfile.learning_languages?.length > 0 && userProfile.proficiency_level) {
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