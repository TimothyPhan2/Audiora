import { create } from 'zustand';
import { VocabularyItem } from '../lib/types';
import { getUserVocabulary, removeWordFromVocabulary } from '../lib/api';

interface VocabularyState {
  savedWords: VocabularyItem[];
  isLoading: boolean;
  error: string | null;
  addWord: (word: VocabularyItem) => void;
  removeWord: (wordId: string) => void;
  fetchWords: () => Promise<void>;
  refreshWords: () => Promise<void>;
}

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
     
        const vocabularyData = await getUserVocabulary();
      
      
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