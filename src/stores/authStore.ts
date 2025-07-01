import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { 
  AuthFormData, 
  PreferenceUpdate,
  SignupResult,
  User, 
} from '../lib/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  session: any;
  login: (data: AuthFormData) => Promise<void>;
  signup: (data: AuthFormData) => Promise<SignupResult>;
  signInWithGoogle: () => Promise<void>;
  updateUserPreferences: (data: PreferenceUpdate) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setSession: (session: any) => Promise<void>;
  fetchUser: () => Promise<User | null>;
}

// Configuration for retry logic
const FETCH_USER_CONFIG = {
  maxRetries: 7,
  retryDelayMs: 750,
  backoffMultiplier: 1.5
};

// Helper function to wait for a specified duration
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth store with real Supabase authentication
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      session: null,
      
      login: async (data: AuthFormData) => {
        
        set({ isLoading: true, error: null });
        
        try {
          const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (error) {
            throw error;
          }

          if (authData.user) {
            // setSession now handles user fetching with retries
            await get().setSession(authData.session);
            set({ isLoading: false });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to login', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      signup: async (data: AuthFormData) => {
    
        
        set({ isLoading: true, error: null });
        
        try {
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                username: data.username,
              },
              emailRedirectTo:`${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            throw error;
          }

          if (authData.user) {
            // Check if session exists (email confirmation status)
            if (authData.session) {
              // Email confirmation disabled or user confirmed immediately
              // setSession now handles user fetching with retries
              await get().setSession(authData.session);
              set({ isLoading: false });
              
              return { needsEmailConfirmation: false };
            } else {
              // Email confirmation required
              set({ isLoading: false });
              return { needsEmailConfirmation: true };
            }
          }
          
          // Fallback - should not reach here normally
          set({ isLoading: false });
          return { needsEmailConfirmation: true };
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to sign up', 
            isLoading: false 
          });
          throw error;
        }
      },

      signInWithGoogle: async () => {
      
        
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            throw error;
          }

          // OAuth redirect will handle the rest
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to sign in with Google', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateUserPreferences: async (data: PreferenceUpdate) => {
  
        set({ isLoading: true, error: null });
        
        try {
          // Verify user is authenticated before updating preferences
          const { user: currentUser } = get();
          if (!currentUser) {
            throw new Error('User must be authenticated to update preferences');
          }

          const { error } = await supabase
            .from('users')
            .update({
              learning_languages: [data.selectedLanguage.toLowerCase()],
              proficiency_level: data.proficiencyLevel,
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.userId);

          if (error) {
            throw error;
          }

          // Fetch updated user data
          await get().fetchUser();
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update preferences', 
            isLoading: false 
          });
          throw error;
        }
      },

      fetchUser: async (): Promise<User | null> => {
  
        
        const { maxRetries, retryDelayMs, backoffMultiplier } = FETCH_USER_CONFIG;
        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            
            if (!authUser) {
              set({ user: null, isAuthenticated: false });
              return null;
            }

            // Try to fetch user profile with retry logic
            const { data: userProfile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .limit(1);

            // If user profile doesn't exist, create it (for new users)
            if (error && error.code === 'PGRST116') {
              // User profile doesn't exist, create it
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: authUser.id,
                  username: authUser.user_metadata?.username || 
                           authUser.user_metadata?.full_name || 
                           authUser.email?.split('@')[0],
                  subscription_tier: 'free',
                  role: 'user',
                  learning_languages: [],
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                });

              if (insertError) {
                lastError = new Error(`Failed to create user profile: ${insertError.message}`);
                console.error('Error creating user profile:', insertError);
                
                // If this is not the last attempt, wait and retry
                if (attempt < maxRetries) {
                  const delay = retryDelayMs * Math.pow(backoffMultiplier, attempt);
                  console.log(`Retrying user profile creation in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
                  await wait(delay);
                  continue;
                }
                
                // Last attempt failed, return null
                set({ user: null, isAuthenticated: false });
                return null;
              }

              // Fetch the newly created profile
              const { data: newUserProfile, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .limit(1);

              if (fetchError || !newUserProfile || newUserProfile.length === 0) {
                lastError = new Error(`Failed to fetch newly created user profile: ${fetchError?.message || 'Profile not found'}`);
                console.error('Error fetching newly created user profile:', fetchError);
                
                // If this is not the last attempt, wait and retry
                if (attempt < maxRetries) {
                  const delay = retryDelayMs * Math.pow(backoffMultiplier, attempt);
                  console.log(`Retrying user profile fetch in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
                  await wait(delay);
                  continue;
                }
                
                // Last attempt failed, return null
                set({ user: null, isAuthenticated: false });
                return null;
              }

              const profile = newUserProfile[0];
              const user: User = {
                id: profile.id,
                email: authUser.email || '',
                username: profile.username,
                learning_languages: profile.learning_languages || [],
                proficiency_level: profile.proficiency_level as any,
                level: profile.proficiency_level?.toLowerCase() as any || 'beginner',
                savedVocabulary: [], // TODO: Fetch from database
                completedSongs: [], // TODO: Fetch from database
                completedQuizzes: [], // TODO: Fetch from database
                subscription_tier: profile.subscription_tier,
                role: profile.role,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
              };

              set({ user, isAuthenticated: true });
              return user;
            } else if (error) {
              lastError = new Error(`Database error: ${error.message}`);
              console.error('Error fetching user profile:', error);
              
              // If this is not the last attempt, wait and retry
              if (attempt < maxRetries) {
                const delay = retryDelayMs * Math.pow(backoffMultiplier, attempt);
                console.log(`Retrying user profile fetch in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
                await wait(delay);
                continue;
              }
              
              // Last attempt failed, return null
              set({ user: null, isAuthenticated: false });
              return null;
            } else if (userProfile && userProfile.length > 0) {
              // User profile exists
              const profile = userProfile[0];
              const user: User = {
                id: profile.id,
                email: authUser.email || '',
                username: profile.username,
                learning_languages: profile.learning_languages || [],
                proficiency_level: profile.proficiency_level as any,
                level: profile.proficiency_level?.toLowerCase() as any || 'beginner',
                savedVocabulary: [], // TODO: Fetch from database
                completedSongs: [], // TODO: Fetch from database
                completedQuizzes: [], // TODO: Fetch from database
                subscription_tier: profile.subscription_tier,
                role: profile.role,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
              };

              set({ user, isAuthenticated: true });
              return user;
            } else {
              // Profile not found, but no error - this might be a timing issue with the trigger
              lastError = new Error('User profile not found - this might be a timing issue');
              console.log(`User profile not found for ${authUser.id}, attempt ${attempt + 1}/${maxRetries + 1}`);
              
              // If this is not the last attempt, wait and retry
              if (attempt < maxRetries) {
                const delay = retryDelayMs * Math.pow(backoffMultiplier, attempt);
                console.log(`Waiting for user profile creation, retrying in ${delay}ms`);
                await wait(delay);
                continue;
              }
              
              // Last attempt failed, return null
              set({ user: null, isAuthenticated: false });
              return null;
            }
          } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error occurred');
            console.error(`Error in fetchUser attempt ${attempt + 1}:`, error);
            
            // If this is not the last attempt, wait and retry
            if (attempt < maxRetries) {
              const delay = retryDelayMs * Math.pow(backoffMultiplier, attempt);
              console.log(`Retrying fetchUser in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
              await wait(delay);
              continue;
            }
            
            // Last attempt failed
            console.error('All fetchUser attempts failed:', lastError);
            set({ user: null, isAuthenticated: false });
            return null;
          }
        }
        
        // This should never be reached, but just in case
        console.error('fetchUser: Unexpected end of retry loop');
        set({ user: null, isAuthenticated: false });
        return null;
      },
      
      logout: async () => {
    
        
        try {
          await supabase.auth.signOut();
          set({ 
            user: null, 
            isAuthenticated: false, 
            session: null,
            error: null 
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      setSession: async (session: any) => {
        set({ 
          session,
          isAuthenticated: !!session,
        });
        
        if (session) {
          // Wait for user data to be fetched with retry logic
          try {
            
              await get().fetchUser();
            
          } catch (error) {
            console.error('Error fetching user in setSession:', error);
            // Don't throw here - let the component handle the error state
          }
        } else {
          set({ user: null });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'audiora-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user data, not session (Supabase handles session persistence)
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 