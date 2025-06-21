import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import MusicArtwork from '@/components/ui/music-artwork';
import { WordTooltip } from './WordTooltip';
import { cn } from '@/lib/utils';

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
  const lyricsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [hoveredWord, setHoveredWord] = useState<{
    word: string;
    context: string;
    position: { x: number; y: number };
  } | null>(null);

  // Initialize lyrics refs array
  useEffect(() => {
    lyricsRefs.current = lyricsRefs.current.slice(0, lyrics.length);
  }, [lyrics.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Find active lyric based on current time
      const currentTimeMs = audio.currentTime * 1000;
      let newActiveLyricIndex = -1;
      
      for (let i = 0; i < lyrics.length; i++) {
        const lyric = lyrics[i];
        if (lyric.start_time_ms && lyric.end_time_ms) {
          if (currentTimeMs >= lyric.start_time_ms && currentTimeMs <= lyric.end_time_ms) {
            newActiveLyricIndex = i;
            break;
          }
        }
      }
      
      setActiveLyricIndex(newActiveLyricIndex);
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

  // Auto-scroll to active lyric
  useEffect(() => {
    if (activeLyricIndex >= 0 && lyricsRefs.current[activeLyricIndex]) {
      lyricsRefs.current[activeLyricIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLyricIndex]);

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

  const handleWordHover = (word: string, context: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredWord({
      word: word.replace(/[.,!?;:]$/, ''), // Remove punctuation
      context,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    });
  };

  const handleWordLeave = () => {
    setHoveredWord(null);
  };

  const renderInteractiveText = (text: string, isTranslation: boolean = false) => {
    if (isTranslation) {
      return <span className="italic">{text}</span>;
    }

    const words = text.split(' ');
    return (
      <span>
        {words.map((word, wordIndex) => (
          <span key={wordIndex}>
            <span
              className="hover:bg-accent-teal-500/20 hover:text-accent-teal-300 cursor-pointer rounded px-1 transition-all duration-200"
              onMouseEnter={(e) => handleWordHover(word, text, e)}
              onMouseLeave={handleWordLeave}
            >
              {word}
            </span>
            {wordIndex < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Audio Player Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* Album Art */}
        <div className="relative space-y-6 flex justify-center">
          <MusicArtwork
            albumArt={song.cover_image_url}
            music={song.title}
            artist={song.artist}
            isPlaying={isPlaying}
            isLoading={isLoading}
            aspectRatio="square"
          />
        </div>

        {/* Song Info */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 text-sm">
            <motion.span 
              className="px-3 py-1 bg-accent-teal-500/20 rounded-full text-accent-teal-400 border border-accent-teal-500/30"
              whileHover={{ scale: 1.05 }}
            >
              {song.language.charAt(0).toUpperCase() + song.language.slice(1)}
            </motion.span>
            <motion.span 
              className="px-3 py-1 bg-accent-teal-500/20 rounded-full text-accent-teal-400 border border-accent-teal-500/30"
              whileHover={{ scale: 1.05 }}
            >
              {song.difficulty_level.charAt(0).toUpperCase() + song.difficulty_level.slice(1)}
            </motion.span>
            <motion.span 
              className="px-3 py-1 bg-accent-teal-500/20 rounded-full text-accent-teal-400 border border-accent-teal-500/30"
              whileHover={{ scale: 1.05 }}
            >
              {song.genre.charAt(0).toUpperCase() + song.genre.slice(1)}
            </motion.span>
          </div>
        </div>

        {/* Audio Controls */}
        <motion.div 
          className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20 space-y-4"
          whileHover={{ borderColor: 'rgba(45, 212, 191, 0.4)' }}
          transition={{ duration: 0.3 }}
        >
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
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={restart}
                variant="ghost"
                size="sm"
                className="text-text-cream300 hover:text-text-cream100 hover:bg-accent-teal-500/10"
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={skipBackward}
                variant="ghost"
                size="sm"
                className="text-text-cream300 hover:text-text-cream100 hover:bg-accent-teal-500/10"
                disabled={isLoading}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              animate={isPlaying ? { 
                boxShadow: [
                  "0 0 0 0 rgba(45, 212, 191, 0.4)",
                  "0 0 0 10px rgba(45, 212, 191, 0)",
                  "0 0 0 0 rgba(45, 212, 191, 0)"
                ]
              } : {}}
              transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
            >
              <Button
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full button-gradient-primary text-white"
                disabled={isLoading}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={skipForward}
                variant="ghost"
                size="sm"
                className="text-text-cream300 hover:text-text-cream100 hover:bg-accent-teal-500/10"
                disabled={isLoading}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </motion.div>

            <div className="flex items-center gap-2 ml-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="sm"
                  className="text-text-cream300 hover:text-text-cream100 hover:bg-accent-teal-500/10"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </motion.div>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>
        </motion.div>

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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-semibold text-text-cream100">
            Lyrics & Translation
          </h3>
          <div className="flex items-center gap-3">
            {activeLyricIndex >= 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 bg-accent-teal-500/20 rounded-full"
              >
                <div className="w-2 h-2 bg-accent-teal-400 rounded-full animate-pulse" />
                <span className="text-xs text-accent-teal-400 font-medium">
                  Line {activeLyricIndex + 1}
                </span>
              </motion.div>
            )}
            <div className="text-sm text-text-cream400">
              {lyrics.length} lines
            </div>
          </div>
        </div>

        <motion.div 
          className="frosted-glass rounded-xl border border-accent-teal-500/20 max-h-[600px] overflow-hidden"
          whileHover={{ borderColor: 'rgba(45, 212, 191, 0.4)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 sm:p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {lyrics.length > 0 ? (
              lyrics.map((lyric, index) => (
                <motion.div
                  ref={(el) => (lyricsRefs.current[index] = el)}
                  key={lyric.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group p-3 rounded-lg transition-all duration-300 space-y-2",
                    activeLyricIndex === index
                      ? "bg-accent-teal-500/20 border border-accent-teal-400/50 shadow-lg scale-105"
                      : "hover:bg-accent-teal-500/5"
                  )}
                  whileHover={{ scale: activeLyricIndex === index ? 1.05 : 1.02 }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className={cn(
                      "text-xs font-mono mt-1 min-w-[2rem] transition-colors duration-300",
                      activeLyricIndex === index 
                        ? "text-accent-teal-400 font-bold" 
                        : "text-text-cream400"
                    )}>
                      {lyric.line_number.toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      {/* Original Text */}
                      <p className={cn(
                        "leading-relaxed transition-colors duration-300",
                        activeLyricIndex === index 
                          ? "text-white font-medium" 
                          : "text-text-cream100"
                      )}>
                        {renderInteractiveText(lyric.text)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Translation */}
                  {lyric.translation && (
                    <div className="ml-8 pl-3 border-l-2 border-accent-teal-500/30">
                      <p className={cn(
                        "text-sm transition-colors duration-300",
                        activeLyricIndex === index 
                          ? "text-accent-teal-200" 
                          : "text-text-cream300"
                      )}>
                        {renderInteractiveText(lyric.translation, true)}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-text-cream400">No lyrics available for this song.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Word Tooltip */}
      {hoveredWord && (
        <WordTooltip
          word={hoveredWord.word}
          context={hoveredWord.context}
          language={song.language}
          songId={song.id}
          position={hoveredWord.position}
          isVisible={!!hoveredWord}
          onClose={() => setHoveredWord(null)}
        />
      )}
    </div>
  );
}