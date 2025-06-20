import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MusicArtworkProps {
  albumArt: string;
  music: string;
  artist: string;
  isSong: boolean;
  isPlaying?: boolean;
  isLoading?: boolean;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  className?: string;
}

const MusicArtwork: React.FC<MusicArtworkProps> = ({
  albumArt,
  music,
  artist,
  isSong,
  isPlaying = false,
  isLoading = false,
  aspectRatio = "portrait",
  width,
  height,
  className
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={cn(
      "relative flex items-center justify-center",
      aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square",
      className
    )}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Vinyl Record - Behind album art, 30% larger */}
        <motion.div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "w-[calc(100%+21%)] h-[calc(100%+21%)]",
            isPlaying ? "opacity-90" : "opacity-70"
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='vinyl' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23000000'/%3E%3Cstop offset='15%25' style='stop-color:%23111111'/%3E%3Cstop offset='30%25' style='stop-color:%23000000'/%3E%3Cstop offset='45%25' style='stop-color:%23222222'/%3E%3Cstop offset='60%25' style='stop-color:%23000000'/%3E%3Cstop offset='75%25' style='stop-color:%23111111'/%3E%3Cstop offset='90%25' style='stop-color:%23000000'/%3E%3Cstop offset='100%25' style='stop-color:%23333333'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='100' cy='100' r='100' fill='url(%23vinyl)'/%3E%3Ccircle cx='100' cy='100' r='15' fill='%23000000'/%3E%3Ccircle cx='100' cy='100' r='8' fill='%23333333'/%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 1.8, // 33rpm simulation
            repeat: isPlaying ? Infinity : 0,
            ease: "linear",
            repeatType: "loop"
          }}
        />

        {/* Album Artwork */}
        <motion.div
          className={cn(
            "relative w-full h-full rounded-lg overflow-hidden shadow-2xl",
            "transition-all duration-200 ease-in-out",
            isPlaying ? "opacity-100 scale-100" : "opacity-95 scale-[0.98]"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {/* Loading State */}
          {(isLoading || !imageLoaded) && !imageError && (
            <div className="absolute inset-0 bg-base-dark3/60 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-accent-teal-400 animate-spin" />
            </div>
          )}

          {/* Album Art Image */}
          {!imageError ? (
            <img
              src={albumArt}
              alt={`${music} by ${artist}`}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{
                width: width ? `${width}px` : undefined,
                height: height ? `${height}px` : undefined,
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-base-dark3 to-base-dark2 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-accent-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Play className="w-8 h-8 text-accent-teal-400" />
                </div>
                <p className="text-text-cream200 font-medium text-sm">{music}</p>
                <p className="text-text-cream400 text-xs">{artist}</p>
              </div>
            </div>
          )}

          {/* Play/Pause Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
            whileHover={{ opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </motion.div>
          </motion.div>

          {/* Song Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            <h3 className="text-white font-semibold text-lg leading-tight mb-1 truncate">
              {music}
            </h3>
            <p className="text-white/80 text-sm truncate">{artist}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MusicArtwork;