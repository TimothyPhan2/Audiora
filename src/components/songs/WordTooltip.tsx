import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Check } from 'lucide-react';
import { translateWordDebounced, addWordToVocabulary } from '@/lib/api';
import { toast } from 'sonner';

// Debounce hook for translation requests
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface WordTooltipProps {
  word: string;
  context: string;
  language: string;
  songId?: string;
  position: { x: number; y: number };
  isVisible: boolean;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

export function WordTooltip({ 
  word, 
  context, 
  language, 
  songId, 
  position, 
  isVisible, 
  onClose,
  containerRef
}: WordTooltipProps) {
  const [translation, setTranslation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Timer refs for auto-hide functionality
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gracePeriodTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce the word to reduce API calls - increased delay for better UX
  const debouncedWord = useDebounce(word, 1000);

  // Clear all timers function
  const clearAllTimers = useCallback(() => {
    console.log('🧹 Clearing all tooltip timers');
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
    if (gracePeriodTimerRef.current) {
      clearTimeout(gracePeriodTimerRef.current);
      gracePeriodTimerRef.current = null;
    }
  }, []);

  // Start auto-hide timer (7 seconds)
  const startAutoHideTimer = useCallback(() => {
    console.log('⏰ Starting auto-hide timer (7 seconds)');
    clearAllTimers();
    autoHideTimerRef.current = setTimeout(() => {
      console.log('🕐 Auto-hide timer expired - closing tooltip');
      onClose();
    }, 7000);
  }, [onClose, clearAllTimers]);

  // Start grace period timer (3 seconds)
  const startGracePeriodTimer = useCallback(() => {
    console.log('⏳ Starting grace period timer (3 seconds)');
    clearAllTimers();
    gracePeriodTimerRef.current = setTimeout(() => {
      console.log('🕒 Grace period expired - closing tooltip');
      onClose();
    }, 3000);
  }, [onClose, clearAllTimers]);

  // Handle tooltip mouse enter (pause auto-hide)
  const handleTooltipMouseEnter = useCallback(() => {
    console.log('🖱️ Mouse entered tooltip - pausing timers');
    clearAllTimers();
  }, [clearAllTimers]);

  // Handle tooltip mouse leave (start grace period)
  const handleTooltipMouseLeave = useCallback(() => {
    console.log('🖱️ Mouse left tooltip - starting grace period');
    startGracePeriodTimer();
  }, [startGracePeriodTimer]);

  // Auto-hide functionality
  useEffect(() => {
    if (isVisible) {
      console.log('👁️ Tooltip became visible - starting auto-hide timer');
      startAutoHideTimer();
    } else {
      console.log('👁️ Tooltip became hidden - clearing all timers');
      clearAllTimers();
    }

    // Cleanup on unmount or visibility change
    return () => {
      clearAllTimers();
    };
  }, [isVisible, startAutoHideTimer, clearAllTimers]);

  useEffect(() => {
    if (isVisible && debouncedWord && debouncedWord === word) {
      fetchTranslation();
    }
    
    // Cleanup function to cancel pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isVisible, debouncedWord, word, context, language]);

  // Cancel requests when component unmounts or tooltip closes
  useEffect(() => {
    if (!isVisible) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [isVisible]);

  const fetchTranslation = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Use debounced translation to prevent rapid API calls
      const result = await translateWordDebounced(word, context, language, 500);
      setTranslation(result);
    } catch (err) {
      console.error('Translation error:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('cancelled')) {
          // Request was cancelled, don't show error
          return;
        } else if (err.message.includes('offline')) {
          setError('You appear to be offline');
        } else if (err.message.includes('Rate limit')) {
          setError('Too many requests. Please wait a moment.');
        } else {
          setError('Failed to translate word');
        }
      } else {
        setError('Failed to translate word');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToVocabulary = async () => {
    if (!translation || isAdding) return;

    // Clear timers when user takes action
    clearAllTimers();

    setIsAdding(true);
    try {
      // ✅ This is the ONLY place where words should be saved to database
      await addWordToVocabulary(word, translation, language, songId);
      setIsAdded(true);
      toast.success('Word added to vocabulary!');
      
      // Reset after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Add to vocabulary error:', err);
      toast.error('Failed to add word to vocabulary');
    } finally {
      setIsAdding(false);
    }
  };

  // ✅ FIX: Constrained positioning within lyrics container
  const getConstrainedPosition = () => {
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const padding = 16;
    const arrowSize = 8;

    // Get container bounds if available, otherwise use viewport
    let containerBounds = {
      left: 0, 
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight
    };

    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerBounds = {
        left: rect.left, 
        top: rect.top,
        right: rect.right, 
        bottom: rect.bottom
      };
    }

    // Calculate initial position (centered above the word)
    let left = position.x - (tooltipWidth / 2);
    let top = position.y - tooltipHeight - arrowSize - 10;
    let arrowPosition = 'bottom'; // Arrow points down to word
    let arrowLeft = tooltipWidth / 2; // Center arrow horizontally

    // Constrain horizontally
    if (left + tooltipWidth > containerBounds.right - padding) {
      const overflow = (left + tooltipWidth) - (containerBounds.right - padding);
      left = containerBounds.right - tooltipWidth - padding;
      arrowLeft = (tooltipWidth / 2) + overflow; // Adjust arrow position
    }
    if (left < containerBounds.left + padding) {
      const underflow = (containerBounds.left + padding) - left;
      left = containerBounds.left + padding;
      arrowLeft = (tooltipWidth / 2) - underflow; // Adjust arrow position
    }

    // Constrain vertically
    if (top < containerBounds.top + padding) {
      top = position.y + 20; // Position below word instead
      arrowPosition = 'top'; // Arrow points up to word
    }
    if (top + tooltipHeight > containerBounds.bottom - padding) {
      top = containerBounds.bottom - tooltipHeight - padding;
    }

    // Ensure arrow stays within tooltip bounds
    arrowLeft = Math.max(arrowSize, Math.min(tooltipWidth - arrowSize, arrowLeft));

    console.log('📍 Tooltip positioning:', {
      wordPosition: position,
      tooltipPosition: { left, top },
      arrowPosition,
      arrowLeft,
      containerBounds
    });

    return { left, top, arrowPosition, arrowLeft };
  };

  const { left, top, arrowPosition, arrowLeft } = getConstrainedPosition();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bg-base-dark2 border border-accent-teal-500/30 rounded-lg shadow-xl p-4 max-w-xs pointer-events-auto"
          style={{ 
            left, 
            top, 
            zIndex: 9999 
          }}
          data-x={left}
          data-y={top}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          {/* Dynamic arrow pointing to word */}
          <div 
            className={`absolute w-4 h-4 bg-base-dark2 border border-accent-teal-500/30 rotate-45 ${
              arrowPosition === 'bottom' 
                ? '-bottom-2 border-t-0 border-l-0' 
                : '-top-2 border-b-0 border-r-0'
            }`}
            style={{ 
              left: `${arrowLeft}px`,
              transform: 'translateX(-50%) rotate(45deg)'
            }}
          />
          
          <div className="space-y-3">
            {/* Word */}
            <div className="text-accent-teal-400 font-semibold text-lg">
              {word}
            </div>

            {/* Translation */}
            <div className="min-h-[1.5rem]">
              {isLoading ? (
                <div className="flex items-center gap-2 text-text-cream300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    {debouncedWord !== word ? 'Waiting...' : 'Translating...'}
                  </span>
                </div>
              ) : error ? (
                <div className="text-red-400 text-sm">
                  {error}
                  {error.includes('offline') && (
                    <div className="text-xs mt-1 text-text-cream400">
                      Check your connection and try again
                    </div>
                  )}
                </div>
              ) : translation ? (
                <div className="text-text-cream100 text-sm font-medium">
                  {translation}
                </div>
              ) : null}
            </div>

            {/* Context */}
            {context && (
              <div className="text-text-cream400 text-xs italic border-t border-accent-teal-500/20 pt-2">
                "{context}"
              </div>
            )}

            {/* Add to Vocabulary Button */}
            {translation && !error && (
              <Button
                onClick={handleAddToVocabulary}
                disabled={isAdding || isAdded}
                className={`w-full text-sm transition-all duration-300 ${
                  isAdded 
                    ? 'bg-green-600 hover:bg-green-600 text-white' 
                    : 'button-gradient-primary text-white hover:shadow-lg'
                }`}
                size="sm"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : isAdded ? (
                  <>
                    <Check className="w-3 h-3 mr-2" />
                    Added!
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 mr-2" />
                    Add to Vocab
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}