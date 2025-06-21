import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Check } from 'lucide-react';
import { translateWord, addWordToVocabulary } from '@/lib/api';
import { toast } from 'sonner';

interface WordTooltipProps {
  word: string;
  context: string;
  language: string;
  songId?: string;
  position: { x: number; y: number };
  isVisible: boolean;
  onClose: () => void;
}

export function WordTooltip({ 
  word, 
  context, 
  language, 
  songId, 
  position, 
  isVisible, 
  onClose 
}: WordTooltipProps) {
  const [translation, setTranslation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isVisible && word) {
      fetchTranslation();
    }
  }, [isVisible, word, context, language]);

  const fetchTranslation = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await translateWord(word, context, language);
      setTranslation(result);
    } catch (err) {
      console.error('Translation error:', err);
      setError('Failed to translate word');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToVocabulary = async () => {
    if (!translation || isAdding) return;

    setIsAdding(true);
    try {
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

  // Calculate tooltip position to avoid going off-screen
  const tooltipStyle = {
    left: Math.min(position.x, window.innerWidth - 280),
    top: position.y - 120,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 bg-base-dark2 border border-accent-teal-500/30 rounded-lg shadow-xl p-4 max-w-xs"
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
                  <span className="text-sm">Translating...</span>
                </div>
              ) : error ? (
                <div className="text-red-400 text-sm">{error}</div>
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