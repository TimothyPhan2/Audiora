import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ListeningExerciseData {
  id: string;
  audio_url: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  difficulty_level: string;
}

interface ListeningExerciseProps {
  exercise: ListeningExerciseData;
  selectedAnswer: string | null;
  showResult: boolean;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onNext: () => void;
  className?: string;
}

export function ListeningExercise({
  exercise,
  selectedAnswer,
  showResult,
  onAnswer,
  onNext,
  className,
}: ListeningExerciseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    if (exercise.audio_url) {
      // Clean up previous audio if exists
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      const audio = new Audio(exercise.audio_url);
      setAudioElement(audio);
      setIsPlaying(true);
      setHasPlayedOnce(true);
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        console.error('Error loading audio from:', exercise.audio_url);
      };
    } else {
      console.error('No audio URL provided in exercise data');
      // Fallback to mock behavior for development
      setIsPlaying(false);
      setHasPlayedOnce(true);
    }
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    const isCorrect = answer === exercise.correct_answer;
    onAnswer(answer, isCorrect);
  };

  const isCorrect = selectedAnswer === exercise.correct_answer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full max-w-2xl mx-auto", className)}
    >
      <Card className="p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Volume2 className="w-6 h-6 text-accent-teal-400" />
            <h3 className="text-xl font-semibold text-text-cream100">
              Listening Exercise
            </h3>
          </div>
          <p className="text-text-cream300">
            Listen to the audio and answer the question
          </p>
        </div>

        {/* Audio Player */}
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              onClick={handlePlay}
              disabled={isPlaying}
              size="lg"
              className={cn(
                "w-24 h-24 rounded-full text-white shadow-lg transition-all duration-300",
                isPlaying 
                  ? "bg-accent-teal-600 cursor-not-allowed" 
                  : "button-gradient-primary hover:shadow-xl"
              )}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
            
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-accent-teal-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
          
          <p className="text-sm text-text-cream400">
            {isPlaying ? "Playing audio..." : hasPlayedOnce ? "Click to replay" : "Click to play audio"}
          </p>
        </div>

        {/* Question */}
        {hasPlayedOnce && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h4 className="text-lg font-medium text-text-cream100 mb-6">
              {exercise.question}
            </h4>

            {/* Answer Options */}
            <div className="space-y-3">
              {exercise.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === exercise.correct_answer;
                const showCorrect = showResult && isCorrectOption;
                const showIncorrect = showResult && isSelected && !isCorrectOption;

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showResult}
                    className={cn(
                      "w-full p-4 text-left rounded-xl border-2 transition-all duration-300",
                      "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-teal-400/20",
                      !showResult && "hover:border-accent-teal-400/50 hover:bg-accent-teal-500/5 cursor-pointer",
                      isSelected && !showResult && "border-accent-teal-400 bg-accent-teal-500/10",
                      showCorrect && "border-green-500 bg-green-500/10",
                      showIncorrect && "border-red-500 bg-red-500/10",
                      !isSelected && !showCorrect && showResult && "opacity-60",
                      !showResult && "border-accent-teal-500/20",
                      showResult && "cursor-default"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
                          !showResult && "border-text-cream400/30 text-text-cream400",
                          isSelected && !showResult && "border-accent-teal-400 text-accent-teal-400 bg-accent-teal-500/10",
                          showCorrect && "border-green-500 text-green-400 bg-green-500/20",
                          showIncorrect && "border-red-500 text-red-400 bg-red-500/20"
                        )}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className={cn(
                          "font-medium transition-colors text-text-cream100",
                          showCorrect && "text-green-400",
                          showIncorrect && "text-red-400"
                        )}>
                          {option}
                        </span>
                      </div>
                      
                      {showCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Result Section */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="border-t border-accent-teal-500/20 pt-6"
          >
            <div className={cn(
              'flex items-center gap-3 mb-4 p-4 rounded-lg',
              isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
            )}>
              <CheckCircle className={cn(
                "w-6 h-6 flex-shrink-0",
                isCorrect ? "text-green-400" : "text-red-400"
              )} />
              <div>
                <h4 className={cn(
                  'font-semibold',
                  isCorrect ? 'text-green-400' : 'text-red-400'
                )}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h4>
                {!isCorrect && (
                  <p className="text-sm text-text-cream300 mt-1">
                    The correct answer is: <span className="font-medium text-text-cream100">{exercise.correct_answer}</span>
                  </p>
                )}
              </div>
            </div>

            {exercise.explanation && (
              <div className="mb-4 p-4 bg-accent-teal-500/10 border border-accent-teal-500/20 rounded-lg">
                <h5 className="font-medium text-accent-teal-400 mb-2">Explanation</h5>
                <p className="text-sm text-text-cream200">{exercise.explanation}</p>
              </div>
            )}

            <Button onClick={onNext} className="w-full button-gradient-primary">
              Next Exercise
            </Button>
          </motion.div>
        )}

        {/* Instructions */}
        {!hasPlayedOnce && (
          <div className="text-center">
            <p className="text-sm text-text-cream400">
              Click the play button to start the listening exercise
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default ListeningExercise;