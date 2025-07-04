import { supabase } from '../supabase';
import { Song, LanguageLevel } from '../types';

export interface SongWithExtras extends Song {
  duration: string;
  progress: number;
  difficulty: string;
}

export interface SongFilters {
  language?: string;
  level?: string;
  genre?: string;
  searchQuery?: string;
  duration?: string;
}

/**
 * Fetch all published songs from the database
 */
export async function getSongs(): Promise<SongWithExtras[]> {
  try {
    const { data: songsData, error: songsError } = await supabase
      .from('songs')
      .select(`
        id,
        title,
        artist,
        language,
        difficulty_level,
        genre,
        audio_url,
        cover_image_url,
        duration_seconds,
        popularity_score,
        is_published
      `)
      .eq('is_published', true)
      .order('popularity_score', { ascending: false });

    if (songsError) {
      console.error('Error fetching songs:', songsError);
      throw songsError;
    }

    if (!songsData || songsData.length === 0) {
      return [];
    }

    // Get current user to fetch their progress
    const { data: { user } } = await supabase.auth.getUser();
    let userProgress: any[] = [];

    if (user) {
      const { data: progressData } = await supabase
        .from('user_song_progress')
        .select('song_id, completed, play_time_seconds')
        .eq('user_id', user.id);
      
      userProgress = progressData || [];
    }

    // Transform the data to match the expected format
    const transformedSongs: SongWithExtras[] = songsData.map(song => {
      const progress = userProgress.find(p => p.song_id === song.id);
      const completionPercentage = progress?.completed ? 100 : 0;
      
      // Convert duration from seconds to MM:SS format
      const durationMinutes = Math.floor(song.duration_seconds / 60);
      const durationSeconds = song.duration_seconds % 60;
      const durationFormatted = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

      // Generate difficulty description based on level and genre
      const getDifficultyDescription = (level: string, genre: string) => {
        const levelDescriptions = {
          beginner: 'Simple vocabulary, clear pronunciation',
          intermediate: 'Moderate complexity, varied expressions',
          advanced: 'Complex language, cultural references'
        };
        const baseDescription = levelDescriptions[level as keyof typeof levelDescriptions] || 'Engaging musical content';
        
        // Add genre context to the description
        const genreContext = genre ? ` in ${genre} style` : '';
        return baseDescription + genreContext;
      };

      return {
        id: song.id,
        title: song.title,
        artist: song.artist,
        language: song.language,
        level: song.difficulty_level as LanguageLevel,
        genre: song.genre,
        coverUrl: song.cover_image_url,
        audioUrl: song.audio_url,
        popularity: song.popularity_score,
        duration: durationFormatted,
        progress: completionPercentage,
        difficulty: getDifficultyDescription(song.difficulty_level, song.genre),
        lyrics: [] // Will be loaded separately when needed
      };
    });

    return transformedSongs;

  } catch (error) {
    console.error('Error in getSongs:', error);
    throw error;
  }
}

/**
 * Fetch a specific song by ID with its lyrics
 */
export async function getSongById(songId: string): Promise<Song | null> {
  try {
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .select(`
        id,
        title,
        artist,
        language,
        difficulty_level,
        genre,
        audio_url,
        cover_image_url,
        popularity_score
      `)
      .eq('id', songId)
      .eq('is_published', true)
      .single();

    if (songError) {
      console.error('Error fetching song:', songError);
      return null;
    }

    if (!songData) {
      return null;
    }

    // Fetch lyrics for this song
    const { data: lyricsData, error: lyricsError } = await supabase
      .from('lyrics')
      .select('id, text, start_time_ms, end_time_ms, translation, line_number')
      .eq('song_id', songId)
      .order('line_number', { ascending: true });

    if (lyricsError) {
      console.error('Error fetching lyrics:', lyricsError);
    }

    // Transform lyrics to match expected format
    const lyrics = (lyricsData || []).map(lyric => ({
      id: lyric.id,
      text: lyric.text,
      startTime: lyric.start_time_ms || 0,
      endTime: lyric.end_time_ms || 0,
      translation: lyric.translation
    }));

    return {
      id: songData.id,
      title: songData.title,
      artist: songData.artist,
      language: songData.language,
      level: songData.difficulty_level as LanguageLevel,
      genre: songData.genre,
      coverUrl: songData.cover_image_url,
      audioUrl: songData.audio_url,
      popularity: songData.popularity_score,
      lyrics
    };

  } catch (error) {
    console.error('Error in getSongById:', error);
    return null;
  }
}

/**
 * Filter songs based on provided criteria
 */
export function filterSongs(songs: SongWithExtras[], filters: SongFilters): SongWithExtras[] {
  return songs.filter(song => {
    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch = 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Language filter
    if (filters.language && filters.language !== 'all') {
      if (song.language !== filters.language) return false;
    }

    // Level filter
    if (filters.level && filters.level !== 'All') {
      if (song.level !== filters.level.toLowerCase()) return false;
    }

    // Genre filter
    if (filters.genre && filters.genre !== 'All') {
      if (song.genre !== filters.genre.toLowerCase()) return false;
    }

    // Duration filter
    if (filters.duration && filters.duration !== 'All') {
      const duration = song.duration;
      const minutes = parseInt(duration.split(':')[0]);
      
      switch (filters.duration) {
        case 'Short (< 3 min)':
          if (minutes >= 3) return false;
          break;
        case 'Medium (3-4 min)':
          if (minutes < 3 || minutes > 4) return false;
          break;
        case 'Long (> 4 min)':
          if (minutes <= 4) return false;
          break;
      }
    }

    return true;
  });
}

/**
 * Get songs by language
 */
export async function getSongsByLanguage(language: string): Promise<SongWithExtras[]> {
  const allSongs = await getSongs();
  return allSongs.filter(song => song.language === language);
}

/**
 * Get songs by difficulty level
 */
export async function getSongsByLevel(level: LanguageLevel): Promise<SongWithExtras[]> {
  const allSongs = await getSongs();
  return allSongs.filter(song => song.level === level);
}

/**
 * Search songs by title or artist
 */
export async function searchSongs(query: string): Promise<SongWithExtras[]> {
  const allSongs = await getSongs();
  const lowerQuery = query.toLowerCase();
  
  return allSongs.filter(song => 
    song.title.toLowerCase().includes(lowerQuery) ||
    song.artist.toLowerCase().includes(lowerQuery)
  );
} 