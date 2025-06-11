import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { 
  AuthFormData, 
  OnboardingData,
  PreferenceUpdate,
  Song, 
  SongFilters, 
  User, 
  VocabularyItem 
} from './types';
import { mockSongs, mockUsers } from './mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: AuthFormData) => Promise<void>;
  signup: (data: AuthFormData) => Promise<void>;
  updateUserPreferences: (data: PreferenceUpdate) => Promise<void>;
  logout: () => void;
  clearError: () => void;
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

// Auth store with mock authentication
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (data: AuthFormData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock login logic
          const user = mockUsers.find(u => u.email === data.email);
          
          if (!user) {
            throw new Error('Invalid email or password');
          }
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to login', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      signup: async (data: AuthFormData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if user already exists
          const existingUser = mockUsers.find(u => u.email === data.email);
          
          if (existingUser) {
            throw new Error('Email already in use');
          }

          // Check if username is taken (for signup)
          if (data.username) {
            const existingUsername = mockUsers.find(u => u.username === data.username);
            if (existingUsername) {
              throw new Error('Username already taken');
            }
          }
          
          // Create new mock user
          const newUser: User = {
            id: `user-${Date.now()}`,
            email: data.email,
            username: data.username,
            learning_languages: [],
            proficiency_level: undefined,
            level: 'beginner',
            savedVocabulary: [],
            completedSongs: [],
            completedQuizzes: [],
            subscription_tier: 'free',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          // In a real app, this would be stored in the database
          // For now, we just set it in the state
          set({ user: newUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to sign up', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateUserPreferences: async (data: PreferenceUpdate) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('User not authenticated');
          }

          // Update user with preferences
          const updatedUser: User = {
            ...currentUser,
            learning_languages: [data.selectedLanguage.toLowerCase()],
            proficiency_level: data.proficiencyLevel,
            level: data.proficiencyLevel.toLowerCase() as any,
            updated_at: new Date().toISOString(),
          };

          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update preferences', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'audiora-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Song store with mock data
export const useSongStore = create<SongState>()((set, get) => ({
  songs: [],
  currentSong: null,
  isLoading: false,
  error: null,
  filters: {},
  
  fetchSongs: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
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
      // In a real app, this would fetch from the database
      // For now, we just use what's in the store or from the user object
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