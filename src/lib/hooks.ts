import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// Song data interface
interface Song {
  id: string;
  title: string;
  artist: string;
  language: string;
  difficulty_level: string;
  genre: string;
  audio_url: string;
  cover_image_url: string;
  duration_seconds: number;
  is_published: boolean;
  is_premium: boolean;
  popularity_score: number;
  created_at: string;
  updated_at: string;
}

// Lyric data interface
interface Lyric {
  id: string;
  song_id: string;
  line_number: number;
  text: string;
  start_time_ms: number | null;
  end_time_ms: number | null;
  translation: string | null;
  created_at: string;
}

// Combined song data with lyrics
interface SongData {
  song: Song;
  lyrics: Lyric[];
}

// Hook return type
interface UseSongDataReturn {
  data: SongData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch song data and lyrics from Supabase
 * @param songId - The ID of the song to fetch
 * @returns Object containing song data, loading state, and error state
 */
export function useSongData(songId: string | undefined): UseSongDataReturn {
  const [data, setData] = useState<SongData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!songId) {
      setError('No song ID provided');
      setIsLoading(false);
      return;
    }

    const fetchSongData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch song data
        const { data: songData, error: songError } = await supabase
          .from('songs')
          .select('*')
          .eq('id', songId)
          .single();

        if (songError) {
          throw new Error(`Failed to fetch song: ${songError.message}`);
        }

        if (!songData) {
          throw new Error('Song not found');
        }

        // Fetch lyrics data
        const { data: lyricsData, error: lyricsError } = await supabase
          .from('lyrics')
          .select('*')
          .eq('song_id', songId)
          .order('line_number', { ascending: true });

        if (lyricsError) {
          throw new Error(`Failed to fetch lyrics: ${lyricsError.message}`);
        }

        // Combine song and lyrics data
        setData({
          song: songData as Song,
          lyrics: lyricsData as Lyric[] || []
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching song data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongData();
  }, [songId]);

  return { data, isLoading, error };
}

/**
 * Custom hook to fetch user's vocabulary for a specific language
 * @param language - The language to filter vocabulary by
 * @returns Object containing vocabulary data, loading state, and error state
 */
export function useUserVocabulary(language?: string) {
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserVocabulary = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setVocabulary([]);
          return;
        }

        let query = supabase
          .from('user_vocabulary')
          .select(`
            id,
            mastery_score,
            times_practiced,
            times_correct,
            vocabulary:vocabulary_id (
              id,
              word,
              language,
              translation,
              difficulty_level
            )
          `)
          .eq('user_id', user.id);

        // Filter by language if provided
        if (language) {
          query = query.eq('vocabulary.language', language);
        }

        const { data, error: vocabError } = await query;

        if (vocabError) {
          throw new Error(`Failed to fetch vocabulary: ${vocabError.message}`);
        }

        setVocabulary(data || []);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching user vocabulary:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserVocabulary();
  }, [language]);

  return { vocabulary, isLoading, error };
}

/**
 * Custom hook to fetch user profile data
 * @returns Object containing user profile data, loading state, and error state
 */
export function useUserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setProfile(null);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw new Error(`Failed to fetch profile: ${profileError.message}`);
        }

        setProfile(profileData);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { profile, isLoading, error };
}