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
  isPlaying?: boolean;
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
  isPlaying = false,
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
            top: '15%',
            left: '15%',
          }}
        >
          <div className="flex items-center justify-center">
            <motion.div
              className={cn(
                'relative overflow-hidden rounded-xl shadow-2xl group',
                aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square',
                'w-36 h-36 sm:w-40 sm:h-40',
                className
              )}
              style={{ width, height }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {/* Vinyl Record */}
              <motion.div
                className={cn(
                  "absolute inset-0 z-0 flex items-center justify-center",
                  isPlaying ? "vinyl-spinning" : "vinyl-paused"
                )}
                initial={{ opacity: 0.7 }}
                animate={{ 
                  opacity: isPlaying ? 0.9 : 0.7,
                  scale: isPlaying ? 1 : 0.98
                }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-full shadow-2xl">
                  <div className="absolute inset-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full">
                    <div className="absolute inset-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full">
                      <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  {/* Vinyl grooves */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute border border-gray-700/30 rounded-full"
                      style={{
                        top: `${12 + i * 10}%`,
                        left: `${12 + i * 10}%`,
                        right: `${12 + i * 10}%`,
                        bottom: `${12 + i * 10}%`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
              <motion.div
                animate={{ opacity: 1 }}
              >
                {/* Album Artwork */}
                <motion.div
                  className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 mx-auto my-auto"
                  initial={{ opacity: 0.95 }}
                  animate={{ 
                    opacity: imageLoaded ? (isPlaying ? 1 : 0.95) : 0.95,
                    scale: isPlaying ? 1 : 0.98
                  }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <img
                    src={albumArt}
                    alt={`${music} by ${artist}`}
                    className="w-full h-full object-cover rounded-xl"
                    onLoad={() => setImageLoaded(true)}
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl" />
                  
                  {/* Loading state */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-accent-teal-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </motion.div>
              </motion.div>

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
              {/* Loading indicator for songs */}
              {isSong && isLoading && (
                <motion.div
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-8 h-8 border-2 border-accent-teal-400 border-t-transparent rounded-full animate-spin" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MusicArtwork;