import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Song } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SongCardProps {
  song: Song;
  progress?: number; // 0-100
  onStartLesson: (songId: string) => void;
  className?: string;
}

const languageFlags = {
  spanish: '🇪🇸',
  french: '🇫🇷',
  italian: '🇮🇹',
  german: '🇩🇪'
};

const levelColors = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  fluent: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

export function SongCard({ song, progress = 0, onStartLesson, className }: SongCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleStartLesson = () => {
    onStartLesson(song.id);
  };

  const isStarted = progress > 0;
  const isCompleted = progress >= 100;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "card-gradient backdrop-blur-sm rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300 border border-accent-teal-500/10 hover:border-accent-teal-400/30",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageError ? 'https://images.pexels.com/photos/1001850/pexels-photo-1001850.jpeg?auto=compress&cs=tinysrgb&w=600' : song.coverUrl}
          alt={`${song.title} cover`}
          className={cn(
            "w-full h-full object-cover transition-all duration-300 group-hover:scale-110",
            !imageLoaded ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
        
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-base-dark3/50 animate-pulse" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Language flag */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-lg">
              {languageFlags[song.language as keyof typeof languageFlags] || '🌍'}
            </span>
            <span className="text-xs text-white font-medium capitalize">
              {song.language}
            </span>
          </div>
        </div>

        {/* Proficiency level */}
        <div className="absolute top-3 right-3">
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium border",
            levelColors[song.level as keyof typeof levelColors]
          )}>
            {song.level.charAt(0).toUpperCase() + song.level.slice(1)}
          </div>
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-accent-teal-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Progress bar */}
        {isStarted && (
          <div className="absolute bottom-0 left-0 right-0">
            <ProgressBar progress={progress} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Artist */}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-text-cream100 line-clamp-1 group-hover:text-accent-teal-400 transition-colors duration-300">
            {song.title}
          </h3>
          <p className="text-text-cream300 text-sm line-clamp-1">{song.artist}</p>
        </div>

        {/* Genre and Duration */}
        <div className="flex items-center gap-4 text-xs text-text-cream400">
          <div className="flex items-center gap-1">
            <Music className="w-3 h-3" />
            <span className="capitalize">{song.genre}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>3-5 min</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleStartLesson}
          className={cn(
            "w-full font-medium transition-all duration-300",
            isCompleted
              ? "bg-green-600 hover:bg-green-500 text-white"
              : isStarted
              ? "button-gradient-secondary text-text-cream200 hover:border-accent-teal-400/60"
              : "button-gradient-primary text-white"
          )}
        >
          {isCompleted ? 'Review Lesson' : isStarted ? 'Continue' : 'Start Lesson'}
        </Button>
      </div>
    </motion.div>
  );
}