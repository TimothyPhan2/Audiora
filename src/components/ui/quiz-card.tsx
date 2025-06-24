import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Brain, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Quiz Card Types
interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

interface QuizCardProps {
  question?: QuizQuestion;
  onAnswer?: (optionId: string, isCorrect: boolean) => void;
  onNext?: () => void;
  showResult?: boolean;
  selectedOption?: string;
  className?: string;
}

// Quiz Card Component
export function QuizCard({
  question = {
    id: '1',
    question: 'What is the correct translation of "Hello" in Spanish?',
    options: [
      { id: 'a', text: 'Hola', isCorrect: true },
      { id: 'b', text: 'Adiós', isCorrect: false },
      { id: 'c', text: 'Gracias', isCorrect: false },
      { id: 'd', text: 'Por favor', isCorrect: false },
    ],
    explanation: 'Hola is the most common way to say "Hello" in Spanish.',
    difficulty: 'beginner' as const,
    category: 'Vocabulary',
  },
  onAnswer = () => {},
  onNext = () => {},
  showResult = false,
  selectedOption = '',
  className,
}: QuizCardProps) {

  const handleOptionSelect = (optionId: string) => {
    if (showResult) return;
    
    const option = question.options.find(opt => opt.id === optionId);
    if (option) {
      onAnswer(optionId, option.isCorrect);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-accent-teal-500/20 text-accent-teal-400 border-accent-teal-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-text-cream400/20 text-text-cream400 border-text-cream400/30';
    }
  };

  const correctOption = question.options.find(opt => opt.isCorrect);
  const selectedOptionData = question.options.find(opt => opt.id === selectedOption);
  const isCorrect = selectedOptionData?.isCorrect || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'w-full max-w-2xl mx-auto frosted-glass rounded-xl border border-accent-teal-500/20 shadow-lg overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-teal-500/10 to-accent-persian-500/10 p-6 border-b border-accent-teal-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-teal-500/20 rounded-lg">
              <Brain className="w-5 h-5 text-accent-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-text-cream100">{question.category}</h3>
              <p className="text-sm text-text-cream300">AI Language Learning</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={getDifficultyColor(question.difficulty)}
            >
              {question.difficulty}
            </Badge>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-text-cream100 leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="p-6 space-y-3">
        <AnimatePresence mode="wait">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === option.id;
            const isCorrectOption = option.isCorrect;
            const showCorrect = showResult && isCorrectOption;
            const showIncorrect = showResult && isSelected && !isCorrectOption;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleOptionSelect(option.id)}
                disabled={showResult}
                className={cn(
                  'w-full p-4 text-left rounded-xl border-2 transition-all duration-300 group',
                  'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-teal-400/20',
                  !showResult && 'hover:border-accent-teal-400/50 hover:bg-accent-teal-500/5',
                  isSelected && !showResult && 'border-accent-teal-400 bg-accent-teal-500/10',
                  showCorrect && 'border-green-500 bg-green-500/10',
                  showIncorrect && 'border-red-500 bg-red-500/10',
                  !isSelected && !showCorrect && showResult && 'opacity-60',
                  !showResult && 'cursor-pointer border-accent-teal-500/20',
                  showResult && 'cursor-default'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors',
                      !showResult && 'border-text-cream400/30 text-text-cream400 group-hover:border-accent-teal-400 group-hover:text-accent-teal-400',
                      isSelected && !showResult && 'border-accent-teal-400 text-accent-teal-400 bg-accent-teal-500/10',
                      showCorrect && 'border-green-500 text-green-400 bg-green-500/20',
                      showIncorrect && 'border-red-500 text-red-400 bg-red-500/20'
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={cn(
                      'font-medium transition-colors text-text-cream100',
                      showCorrect && 'text-green-400',
                      showIncorrect && 'text-red-400'
                    )}>
                      {option.text}
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {showCorrect && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </motion.div>
                    )}
                    {showIncorrect && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <XCircle className="w-5 h-5 text-red-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-accent-teal-500/20 bg-base-dark3/30"
          >
            <div className="p-6">
              <div className={cn(
                'flex items-center gap-3 mb-4 p-4 rounded-lg',
                isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
              )}>
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className={cn(
                    'font-semibold',
                    isCorrect ? 'text-green-400' : 'text-red-400'
                  )}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h4>
                  {!isCorrect && correctOption && (
                    <p className="text-sm text-text-cream300 mt-1">
                      The correct answer is: <span className="font-medium text-text-cream100">{correctOption.text}</span>
                    </p>
                  )}
                </div>
              </div>

              {question.explanation && (
                <div className="mb-4 p-4 bg-accent-teal-500/10 border border-accent-teal-500/20 rounded-lg">
                  <h5 className="font-medium text-accent-teal-400 mb-2">Explanation</h5>
                  <p className="text-sm text-text-cream200">{question.explanation}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={onNext} className="flex-1 button-gradient-primary">
                  Next Question
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      {!showResult && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 text-sm text-text-cream300">
            <Clock className="w-4 h-4" />
            <span>Select your answer to continue</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default QuizCard;