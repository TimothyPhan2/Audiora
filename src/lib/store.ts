import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from './supabase';
import { 
  AuthFormData, 
  PreferenceUpdate,
  SignupResult,
  Song, 
  SongFilters, 
  User, 
  VocabularyItem 
} from './types';
import { mockSongs, mockVocabulary } from './mockData';
import { getUserVocabulary, removeWordFromVocabulary } from './api';

// Mock functions for when Supabase is not configured
const mockGetUserVocabulary = async (): Promise<any[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Transform mock vocabulary to match expected format
  return mockVocabulary.map(item => ({
    vocabulary: {
      id: item.id,
      word: item.original,
      translation: item.translation,
      language: item.language,
      difficulty_level: item.difficulty_level || 'beginner'
    },
    learned_from_song_id: item.songId
  }));
};

const mockRemoveWordFromVocabulary = async (wordId: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Mock: Removed word with ID ${wordId}`);
};

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
  refreshWords: () => Promise<void>;
}

interface RecordingState {
  isRecording: boolean;
  recordingUrl: string | null;
  feedback: string | null;
  startRecording: () => void;
  stopRecording: () => Promise<void>;
  clearRecording: () => void;
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
        if (!isSupabaseConfigured) {
          set({ 
            error: 'Authentication not available - Supabase not configured', 
            isLoading: false 
          });
          throw new Error('Authentication not available - Supabase not configured');
        }
        
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
        if (!isSupabaseConfigured) {
          set({ 
            error: 'Authentication not available - Supabase not configured', 
            isLoading: false 
          });
          throw new Error('Authentication not available - Supabase not configured');
        }
        
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
        if (!isSupabaseConfigured) {
          set({ 
            error: 'Authentication not available - Supabase not configured', 
            isLoading: false 
          });
          throw new Error('Authentication not available - Supabase not configured');
        }
        
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
        if (!isSupabaseConfigured) {
          set({ 
            error: 'User preferences update not available - Supabase not configured', 
            isLoading: false 
          });
          throw new Error('User preferences update not available - Supabase not configured');
        }
        
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
        if (!isSupabaseConfigured) {
          set({ user: null, isAuthenticated: false });
          return null;
        }
        
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
        if (!isSupabaseConfigured) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            session: null,
            error: null 
          });
          return;
        }
        
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
            if (isSupabaseConfigured) {
              await get().fetchUser();
            }
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
      
      // If Supabase is not configured, just keep it in memory
      if (!isSupabaseConfigured) {
        console.log('Mock: Added word to vocabulary:', word.original);
      }
    }
  },
  
  removeWord: (wordId: string) => {
    if (!isSupabaseConfigured) {
      // Mock implementation - just remove from memory
      const { savedWords } = get();
      const updatedWords = savedWords.filter(w => w.id !== wordId);
      set({ savedWords: updatedWords });
      console.log('Mock: Removed word from vocabulary:', wordId);
      return;
    }
    
    const removeWordAsync = async () => {
      try {
        await removeWordFromVocabulary(wordId);
        await get().fetchWords(); // Refresh the list
      } catch (error) {
        console.error('Failed to remove word:', error);
      }
    };
    removeWordAsync();
  },
  
  fetchWords: async () => {
    set({ isLoading: true, error: null });
    
    try {
      let vocabularyData;
      
      if (!isSupabaseConfigured) {
        // Use mock data when Supabase is not configured
        vocabularyData = await mockGetUserVocabulary();
      } else {
        vocabularyData = await getUserVocabulary();
      }
      
      // Transform the data to match VocabularyItem interface
      const savedWords: VocabularyItem[] = vocabularyData.map(item => ({
        id: item.vocabulary.id,
        original: item.vocabulary.word,
        translation: item.vocabulary.translation,
        context: '', // Context not stored in current schema
        language: item.vocabulary.language,
        songId: item.learned_from_song_id,
      }));
      
      set({ savedWords, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch vocabulary', 
        isLoading: false 
      });
    }
  },

  refreshWords: async () => {
    await get().fetchWords();
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