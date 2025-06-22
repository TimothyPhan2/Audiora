import { useState, useEffect, useRef } from 'react';
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
  
  // Debounce the word to reduce API calls - increased delay for better UX
  const debouncedWord = useDebounce(word, 1000);

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

    let left = position.x + 15;
    let top = position.y - 130;

    // Constrain horizontally
    if (left + tooltipWidth > containerBounds.right - padding) {
      left = containerBounds.right - tooltipWidth - padding;
    }
    if (left < containerBounds.left + padding) {
      left = containerBounds.left + padding;
    }

    // Constrain vertically
    if (top < containerBounds.top + padding) {
      top = position.y + 20; // Position below cursor instead
    }
    if (top + tooltipHeight > containerBounds.bottom - padding) {
      top = containerBounds.bottom - tooltipHeight - padding;
    }

    return { left, top };
  };

  const tooltipStyle = getConstrainedPosition();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 bg-base-dark2 border border-accent-teal-500/30 rounded-lg shadow-xl p-4 max-w-xs pointer-events-auto"
          style={tooltipStyle}
        >
          {/* Arrow pointing down */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-base-dark2 border-r border-b border-accent-teal-500/30 rotate-45" />
          
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