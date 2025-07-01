import { create } from 'zustand';
import { Song, SongFilters } from '../lib/types';
import { mockSongs } from '../lib/mockData';

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