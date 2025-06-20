import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MusicArtworkProps {
  albumArt: string;
  music: string;
  artist: string;
  isSong?: boolean;
  isPlaying?: boolean;
  isLoading?: boolean;
  aspectRatio?: 'portrait' | 'square';
  width?: number;
  height?: number;
  className?: string;
  onPlayPause?: () => void;
}

const MusicArtwork: React.FC<MusicArtworkProps> = ({
  albumArt,
  music,
  artist,
  isSong = false,
  isPlaying = false,
  isLoading = false,
  aspectRatio = 'portrait',
  width,
  height,
  className,
  onPlayPause,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [albumArt]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handlePlayPause = () => {
    if (onPlayPause) {
      onPlayPause();
    }
  };

  // Calculate dimensions based on aspect ratio
  const getDimensions = () => {
    if (width && height) {
      return { width, height };
    }
    
    const baseSize = 320;
    if (aspectRatio === 'square') {
      return { width: baseSize, height: baseSize };
    }
    return { width: baseSize, height: baseSize * 1.2 };
  };

  const dimensions = getDimensions();

  // Visual state classes
  const getVisualState = () => {
    if (isPlaying) {
      return {
        artwork: 'opacity-100',
        vinyl: 'opacity-90',
        scale: 'scale-100'
      };
    } else if (isHovered) {
      return {
        artwork: 'opacity-95',
        vinyl: 'opacity-70',
        scale: 'scale-102'
      };
    } else {
      return {
        artwork: 'opacity-95',
        vinyl: 'opacity-70',
        scale: 'scale-98'
      };
    }
  };

  const visualState = getVisualState();

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center p-8",
        className
      )}
      style={{ 
        minHeight: dimensions.height + 64,
        minWidth: dimensions.width + 64
      }}
    >
      <motion.div
        ref={containerRef}
        className="relative group cursor-pointer"
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePlayPause}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {/* Vinyl Record - Behind artwork, 30% smaller */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-200 ease-in-out",
            "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
            "shadow-2xl border-4 border-gray-700",
            visualState.vinyl,
            visualState.scale
          )}
          style={{
            width: dimensions.width * 0.7,
            height: dimensions.height * 0.7,
            top: '15%',
            left: '15%',
            zIndex: 1
          }}
          animate={{
            rotate: isPlaying ? 360 : 0
          }}
          transition={{
            duration: isPlaying ? 2 : 0,
            repeat: isPlaying ? Infinity : 0,
            ease: "linear"
          }}
        >
          {/* Vinyl grooves */}
          <div className="absolute inset-4 rounded-full border border-gray-600 opacity-30" />
          <div className="absolute inset-8 rounded-full border border-gray-600 opacity-20" />
          <div className="absolute inset-12 rounded-full border border-gray-600 opacity-10" />
          
          {/* Center label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-red-800 to-red-900 rounded-full border-2 border-red-700 flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
          
          {/* Label text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-[6px] text-red-200 font-bold tracking-wider opacity-80 mt-6">
              SCRATCH
            </div>
            <div className="text-[4px] text-red-300 opacity-60">
              RECORDS
            </div>
          </div>
        </motion.div>

        {/* Album Artwork */}
        <motion.div
          className={cn(
            "relative rounded-lg overflow-hidden shadow-2xl transition-all duration-200 ease-in-out",
            "border-2 border-gray-600",
            visualState.artwork,
            visualState.scale
          )}
          style={{
            width: dimensions.width * 0.8,
            height: dimensions.height * 0.8,
            top: '10%',
            left: '10%',
            zIndex: 2
          }}
        >
          {/* Loading State */}
          <AnimatePresence>
            {(isLoading || !imageLoaded) && !imageError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center z-10"
              >
                <Loader2 className="w-8 h-8 text-accent-teal-400 animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Album Art Image */}
          {!imageError ? (
            <img
              src={albumArt}
              alt={`${music} by ${artist}`}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs">No Image</p>
              </div>
            </div>
          )}

          {/* Play/Pause Overlay */}
          <AnimatePresence>
            {(isHovered || isLoading) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Song Info */}
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-text-cream100 mb-1 truncate max-w-xs">
            {music}
          </h3>
          <p className="text-sm text-text-cream300 truncate max-w-xs">
            {artist}
          </p>
        </motion.div>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-lg border border-white/20 whitespace-nowrap z-20"
            >
              {isPlaying ? 'Click to pause' : 'Click to play'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MusicArtwork;