import React from 'react';
import { cn } from '@/lib/utils';

interface MusicArtworkProps {
  albumArt: string;
  music: string;
  artist: string;
  isPlaying?: boolean;
  isLoading?: boolean;
  aspectRatio?: 'portrait' | 'square';
  className?: string;
}

const MusicArtwork: React.FC<MusicArtworkProps> = ({
  albumArt,
  music,
  artist,
  isPlaying = false,
  isLoading = false,
  aspectRatio = 'portrait',
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="overflow-hidden rounded-md">
        <div
          className={cn(
            'relative flex items-center justify-center',
            aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'
          )}
        >
          {/* Vinyl Record Background */}
          <div 
            className={cn(
              'absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-2xl',
              isPlaying && !isLoading ? 'vinyl-spinning' : 'vinyl-paused'
            )}
            style={{
              background: `
                radial-gradient(circle at center, 
                  #1a1a1a 15%, 
                  #2a2a2a 15.5%, 
                  #1a1a1a 16%, 
                  #2a2a2a 25%, 
                  #1a1a1a 25.5%, 
                  #2a2a2a 35%, 
                  #1a1a1a 35.5%, 
                  #2a2a2a 45%, 
                  #1a1a1a 45.5%, 
                  #000000 100%
                )
              `
            }}
          >
            {/* Center hole */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-900 rounded-full border border-gray-700" />
            
            {/* Vinyl grooves effect */}
            <div className="absolute inset-2 rounded-full border border-gray-700/30" />
            <div className="absolute inset-4 rounded-full border border-gray-700/20" />
            <div className="absolute inset-6 rounded-full border border-gray-700/10" />
          </div>

          {/* Album Art - positioned on top of vinyl */}
          <div className="relative z-10 w-3/5 h-3/5 rounded-lg overflow-hidden shadow-xl">
            <img
              src={albumArt}
              alt={`${music} by ${artist}`}
              className={cn(
                'w-full h-full object-cover transition-all duration-300',
                isLoading && 'opacity-50 blur-sm'
              )}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/white_circle_360x360.png';
              }}
            />
            
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            
            {/* Playing indicator */}
            {isPlaying && !isLoading && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-3 bg-accent-teal-400 rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-accent-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-2 bg-accent-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Song Info */}
      <div className="space-y-1 text-center">
        <h3 className="font-medium leading-none text-text-cream100 truncate">
          {music}
        </h3>
        <p className="text-sm text-text-cream300 truncate">
          {artist}
        </p>
      </div>
    </div>
  );
};

export default MusicArtwork;