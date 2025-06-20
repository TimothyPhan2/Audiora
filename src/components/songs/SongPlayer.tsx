import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

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

interface SongPlayerProps {
  song: Song;
  lyrics: Lyric[];
}

export function SongPlayer({ song, lyrics }: SongPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Audio Player Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* Album Art */}
        <div className="relative">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={song.cover_image_url}
              alt={`${song.title} cover`}
              className="w-full h-full object-cover"
            />
          </div>
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Loading audio...</p>
              </div>
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-cream100">{song.title}</h2>
          <p className="text-lg text-text-cream300">{song.artist}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-text-cream400">
            <span className="px-3 py-1 bg-accent-teal-500/20 rounded-full">
              {song.language.charAt(0).toUpperCase() + song.language.slice(1)}
            </span>
            <span className="px-3 py-1 bg-accent-teal-500/20 rounded-full">
              {song.difficulty_level.charAt(0).toUpperCase() + song.difficulty_level.slice(1)}
            </span>
            <span className="px-3 py-1 bg-accent-teal-500/20 rounded-full">
              {song.genre.charAt(0).toUpperCase() + song.genre.slice(1)}
            </span>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-text-cream400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={restart}
              variant="ghost"
              size="sm"
              className="text-text-cream300 hover:text-text-cream100 hover:bg-accent-teal-500/10"
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              onClick={skipBackward}
              variant="ghost"
              size="sm"
              className="text-text-cream300 hover:text-text-cream100 hover:bg-accent-teal-500/10"
              disabled={isLoading}
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full button-gradient-primary text-white"
              disabled={isLoading}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            <Button
              onClick={skipForward}
              variant="ghost"
              size="sm"
              className="text-text-cream300 hover:text-text-cream100 hover:bg-accent-teal-500/10"
              disabled={isLoading}
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className="text-text-cream300 hover:text-text-cream100 hover:bg-accent-teal-500/10"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={song.audio_url}
          preload="metadata"
        />
      </motion.div>

      {/* Lyrics Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-text-cream100">Lyrics</h3>
          <div className="text-sm text-text-cream400">
            {lyrics.length} lines
          </div>
        </div>

        <div className="frosted-glass rounded-xl border border-accent-teal-500/20 max-h-[600px] overflow-hidden">
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {lyrics.length > 0 ? (
              lyrics.map((lyric, index) => (
                <motion.div
                  key={lyric.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-3 rounded-lg hover:bg-accent-teal-500/5 transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-text-cream400 font-mono mt-1 min-w-[2rem]">
                      {lyric.line_number.toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-text-cream100 leading-relaxed">
                        {lyric.text}
                      </p>
                      {lyric.translation && (
                        <p className="text-text-cream300 text-sm italic">
                          {lyric.translation}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-text-cream400">No lyrics available for this song.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(45, 212, 191, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 212, 191, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 212, 191, 0.5);
        }
      `}</style>
    </div>
  );
}