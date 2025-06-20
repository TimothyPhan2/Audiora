import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SongPlayer } from '@/components/songs/SongPlayer';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

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
}

interface Lyric {
  id: string;
  song_id: string;
  line_number: number;
  text: string;
  start_time_ms: number | null;
  end_time_ms: number | null;
  translation: string | null;
}

export function SongDetail() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [song, setSong] = useState<Song | null>(null);
  const [lyrics, setLyrics] = useState<Lyric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (!songId) {
      setError('Song ID is required');
      setIsLoading(false);
      return;
    }

    fetchSongData();
  }, [songId, isAuthenticated, navigate]);

  const fetchSongData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch song details
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select('*')
        .eq('id', songId)
        .eq('is_published', true)
        .single();

      if (songError) {
        throw new Error(songError.message);
      }

      if (!songData) {
        throw new Error('Song not found');
      }

      setSong(songData);

      // Fetch lyrics for the song
      const { data: lyricsData, error: lyricsError } = await supabase
        .from('lyrics')
        .select('*')
        .eq('song_id', songId)
        .order('line_number', { ascending: true });

      if (lyricsError) {
        throw new Error(lyricsError.message);
      }

      setLyrics(lyricsData || []);
    } catch (err) {
      console.error('Error fetching song data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load song');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/lessons');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-accent-teal-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-cream100 mb-2">Loading Song...</h2>
          <p className="text-text-cream300">Preparing your learning experience</p>
        </motion.div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-text-cream100 mb-2">Song Not Found</h2>
          <p className="text-text-cream300 mb-6">
            {error || 'The song you\'re looking for doesn\'t exist or isn\'t available.'}
          </p>
          <Button
            onClick={handleGoBack}
            className="button-gradient-primary text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lessons
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-base-dark2/80 backdrop-blur-md border-b border-accent-teal-500/20 p-4 sm:p-6"
      >
        <div className="container-center flex items-center gap-4">
          <Button
            onClick={handleGoBack}
            variant="ghost"
            className="text-text-cream200 hover:text-text-cream100 hover:bg-accent-teal-500/10 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Lessons</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-text-cream100 truncate">
              {song.title}
            </h1>
            <p className="text-text-cream300 text-sm sm:text-base">
              by {song.artist} • {song.language.charAt(0).toUpperCase() + song.language.slice(1)} • {song.difficulty_level.charAt(0).toUpperCase() + song.difficulty_level.slice(1)}
            </p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container-center py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SongPlayer song={song} lyrics={lyrics} />
        </motion.div>
      </main>
    </div>
  );
}