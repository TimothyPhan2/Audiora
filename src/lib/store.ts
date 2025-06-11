import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from './supabase';
import { 
  AuthFormData, 
  OnboardingData,
  PreferenceUpdate,
  SignupResult,
  Song, 
  SongFilters, 
  User, 
  VocabularyItem 
} from './types';
import { mockSongs } from './mockData';

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
  setSession: (session: any) => void;
  fetchUser: () => Promise<void>;
}

interface SongState {
  songs: Song[];
  currentSong: Song | null;
  isLoading: boolean;
  error: string | null;
  filters: SongFilters;
  fetchSongs: () => Promise<void>;
  setSong: (songId: string) => void;
  setFilters: (filters: SongFilters) => void;
}

interface VocabularyState {
  savedWords: VocabularyItem[];
  isLoading: boolean;
  error: string | null;
  addWord: (word: VocabularyItem) => void;
  removeWord: (wordId: string) => void;
  fetchWords: () => Promise<void>;
}

interface RecordingState {
  isRecording: boolean;
  recordingUrl: string | null;
  feedback: string | null;
  startRecording: () => void;
  stopRecording: () => Promise<void>;
  clearRecording: () => void;
}

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
            set({ 
              session: authData.session,
              isAuthenticated: true,
              isLoading: false 
            });
            
            // Fetch user profile
            await get().fetchUser();
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
              set({ 
                session: authData.session,
                isAuthenticated: true,
                isLoading: false 
              });
              
              // Fetch user profile (this will create it if it doesn't exist)
              await get().fetchUser();
              
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
          const { data, error } = await supabase.auth.signInWithOAuth({
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

      fetchUser: async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (!authUser) {
            set({ user: null, isAuthenticated: false });
            return;
          }

          // Try to fetch user profile
          const { data: userProfile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .limit(1);

          // If user profile doesn't exist, create it
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
              console.error('Error creating user profile:', insertError);
              return;
            }

            // Fetch the newly created profile
            const { data: newUserProfile, error: fetchError } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .limit(1);

            if (fetchError || !newUserProfile || newUserProfile.length === 0) {
              console.error('Error fetching newly created user profile:', fetchError);
              return;
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
          } else if (error) {
            console.error('Error fetching user profile:', error);
            return;
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
          }
        } catch (error) {
          console.error('Error in fetchUser:', error);
          await get().logout();
        }
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

      setSession: (session: any) => {
        set({ 
          session,
          isAuthenticated: !!session,
        });
        
        if (session) {
          get().fetchUser();
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

// Song store with mock data (will be updated to use Supabase later)
export const useSongStore = create<SongState>()((set, get) => ({
  songs: [],
  currentSong: null,
  isLoading: false,
  error: null,
  filters: {},
  
  fetchSongs: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call - TODO: Replace with Supabase query
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Apply filters to mock data
      const { filters } = get();
      let filteredSongs = [...mockSongs];
      
      if (filters.language) {
        filteredSongs = filteredSongs.filter(song => 
          song.language.toLowerCase() === filters.language?.toLowerCase()
        );
      }
      
      if (filters.level) {
        filteredSongs = filteredSongs.filter(song => 
          song.level === filters.level
        );
      }
      
      if (filters.genre) {
        filteredSongs = filteredSongs.filter(song => 
          song.genre.toLowerCase() === filters.genre?.toLowerCase()
        );
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredSongs = filteredSongs.filter(song => 
          song.title.toLowerCase().includes(query) || 
          song.artist.toLowerCase().includes(query)
        );
      }
      
      set({ songs: filteredSongs, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch songs', 
        isLoading: false 
      });
    }
  },
  
  setSong: (songId: string) => {
    const song = get().songs.find(s => s.id === songId) || null;
    set({ currentSong: song });
  },
  
  setFilters: (filters: SongFilters) => {
    set({ filters });
    get().fetchSongs();
  },
}));

// Vocabulary store
export const useVocabularyStore = create<VocabularyState>()((set, get) => ({
  savedWords: [],
  isLoading: false,
  error: null,
  
  addWord: (word: VocabularyItem) => {
    const { savedWords } = get();
    const exists = savedWords.some(w => w.id === word.id);
    
    if (!exists) {
      set({ savedWords: [...savedWords, word] });
    }
  },
  
  removeWord: (wordId: string) => {
    const { savedWords } = get();
    set({ savedWords: savedWords.filter(w => w.id !== wordId) });
  },
  
  fetchWords: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Fetch from Supabase
      const user = useAuthStore.getState().user;
      
      if (user && user.savedVocabulary.length > 0) {
        set({ savedWords: user.savedVocabulary, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch vocabulary', 
        isLoading: false 
      });
    }
  },
}));

// Recording state for pronunciation practice
export const useRecordingStore = create<RecordingState>()((set) => ({
  isRecording: false,
  recordingUrl: null,
  feedback: null,
  
  startRecording: () => {
    set({ isRecording: true, feedback: null });
  },
  
  stopRecording: async () => {
    set({ isRecording: false });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock recording URL and feedback
      const mockUrl = 'mock-recording-url';
      
      // Generate random feedback
      const feedbackOptions = [
        'Great pronunciation! Your accent is improving.',
        'Good effort! Try to emphasize the vowel sounds more.',
        'Nice job! Work on the rhythm of the phrase.',
        'Well done! Your intonation is getting better.'
      ];
      
      const randomFeedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
      
      set({ recordingUrl: mockUrl, feedback: randomFeedback });
    } catch (error) {
      set({ 
        feedback: 'Failed to process recording. Please try again.',
        recordingUrl: null
      });
    }
  },
  
  clearRecording: () => {
    set({ recordingUrl: null, feedback: null });
  },
}));