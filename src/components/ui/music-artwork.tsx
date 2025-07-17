import { useState, useEffect, useRef } from 'react';

// Component-specific styles
const componentStyles = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

interface MusicArtworkProps {
  artist: string;
  music: string;
  albumArt: string;
  isPlaying?: boolean;
  isLoading?: boolean;
  aspectRatio?: 'square' | 'video';
}

export default function MusicArtwork({
  artist,
  music,
  albumArt,
  isPlaying = false,
  isLoading = false,
  aspectRatio = 'square'
}: MusicArtworkProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const vinylRef = useRef<HTMLDivElement>(null);

  // Calculate spin duration: 0.75 rev/sec for songs
  const spinDuration = 1 / 0.75; // Convert rev/sec to seconds per revolution

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const tooltipWidth = 300;
        const tooltipHeight = 60;
        const offset = 20;

        let x = e.clientX + offset;
        let y = e.clientY - tooltipHeight - 10;

        // Prevent tooltip from going off right edge
        if (x + tooltipWidth > window.innerWidth) {
          x = e.clientX - tooltipWidth - offset;
        }

        // Prevent tooltip from going off top edge
        if (y < 0) {
          y = e.clientY + offset;
        }

        // Prevent tooltip from going off bottom edge
        if (y + tooltipHeight > window.innerHeight) {
          y = e.clientY - tooltipHeight - offset;
        }

        setMousePosition({ x, y });
      });
    };

    if (isHovered) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);

  // Handle play/pause state changes for vinyl rotation
  useEffect(() => {
    if (!isPlaying && vinylRef.current) {
      // Pause: capture current rotation
      const computedStyle = window.getComputedStyle(vinylRef.current);
      const transform = computedStyle.transform;
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrix(transform);
        const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
        setRotation(angle < 0 ? angle + 360 : angle);
      }
    }
  }, [isPlaying]);

  if (isLoading) {
    return (
      <div className="relative">
        <div className="relative group">
          {/* Loading skeleton */}
          <div className={`bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse ${aspectRatio === 'square' ? 'w-48 h-48 sm:w-64 sm:h-64' : 'w-full aspect-video'
            }`} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Component-specific styles */}
      <style>{componentStyles}</style>

      {/* Enhanced Tooltip that follows cursor - Desktop only */}
      {isHovered && (
        <div
          className="fixed z-50 pointer-events-none hidden sm:block"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            transform: 'translateZ(0)', // Force hardware acceleration
          }}
        >
          <div className="bg-neutral-900/90 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg border border-neutral-700/50 animate-in fade-in zoom-in-95 duration-200">
            <span className="font-bold">{artist}</span> &nbsp;•&nbsp; {music}
          </div>
        </div>
      )}

      {/* Main container */}
      <div className="relative group">
        {/* Vinyl record with enhanced animation and glow - Always visible */}
        <div className="absolute -left-16 sm:-left-20 top-0 h-full flex items-center transition-all duration-500 ease-out z-0">
          <div className={`relative ${aspectRatio === 'square' ? 'w-48 h-48 sm:w-64 sm:h-64' : 'w-full aspect-video'}`}>
            <div
              ref={vinylRef}
              className="w-full h-full"
              style={{
                transform: isPlaying ? undefined : `rotate(${rotation}deg)`,
                animation: isPlaying ? `spin ${spinDuration}s linear infinite` : 'none',
                animationDelay: isPlaying ? `${-rotation / (360 / spinDuration)}s` : undefined
              }}
            >
              <img
                src="https://pngimg.com/d/vinyl_PNG95.png"
                alt="Vinyl Record"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Album artwork */}
        <div
          className={`relative z-10 overflow-hidden rounded-lg shadow-2xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-3xl cursor-pointer ${aspectRatio === 'square' ? 'w-48 h-48 sm:w-64 sm:h-64' : 'w-full aspect-video'
            }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={albumArt}
            alt={`${music} Cover`}
            className={`w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-110 ${!imageLoaded ? 'opacity-0' : 'opacity-100'
              }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              // Handle error with fallback image
              setImageLoaded(true);
            }}
          />

          {/* Loading state overlay */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          )}

          {/* Play/Pause indicator with text on mobile */}
          <div className={`absolute bottom-2 left-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
            <div className="flex items-center gap-2">
              {/* Play/Pause indicator */}
              <div className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center shadow-lg">
                {isPlaying ? (
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-white rounded"></div>
                    <div className="w-0.5 h-3 bg-white rounded"></div>
                  </div>
                ) : (
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                )}
              </div>
              {/* Text for mobile only */}
              <div className="sm:hidden">
                <div className="text-white text-[10px] font-medium whitespace-nowrap bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                  <span className="font-bold">{artist}</span> • {music}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  );
}