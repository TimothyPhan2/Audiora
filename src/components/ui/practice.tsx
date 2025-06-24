import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QuizCard } from '@/components/ui/quiz-card'

// Types for practice content
interface VocabularyItem {
  word: string;
  translation: string;
  example_sentence: string;
  difficulty_level: string;
  part_of_speech: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty_level: string;
  question_type: string;
}

interface PracticeData {
  questions?: QuizQuestion[];
  vocabulary?: VocabularyItem[];
  songId: string;
  practiceType: string;
  timestamp: string;
}

interface PracticeProps {
  practiceData: PracticeData;
  songData: any;
  currentIndex: number;
  selectedAnswer: string | null;
  showResult: boolean;
  correctAnswers: boolean[];
  onQuizStart: () => void;
  onQuizAnswer: (answer: string, isCorrect: boolean) => void;
  onNext: () => void;
  onAnswerSelect: (answer: string | null) => void;
  onShowResult: (show: boolean) => void;
}

export function Practice({
  practiceData,
  songData,
  currentIndex,
  selectedAnswer,
  showResult,
  correctAnswers,
  onQuizStart,
  onQuizAnswer,
  onNext,
  onAnswerSelect,
  onShowResult
}: PracticeProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Call onQuizStart when quiz session begins
  useEffect(() => {
    if (practiceData.practiceType === 'quiz' && currentIndex === 0) {
      onQuizStart();
    }
  }, [practiceData.practiceType, currentIndex, onQuizStart]);

  // Determine the current session data and type
  const isQuiz = practiceData.practiceType === 'quiz' && practiceData.questions;
  const isVocabulary = practiceData.practiceType === 'vocabulary' && practiceData.vocabulary;
  
  const currentSessionData = isQuiz ? practiceData.questions : practiceData.vocabulary;
  const currentItem = currentSessionData?.[currentIndex];
  
  const progress = currentSessionData ? ((currentIndex + 1) / currentSessionData.length) * 100 : 0;

  const handleNext = () => {
    // Reset state for next question
    setIsFlipped(false);
    onAnswerSelect(null);
    onShowResult(false);
    
    // Call the parent's onNext handler
    onNext();
  };

  const handleSkip = () => {
    handleNext();
  };

  const renderVocabularySession = () => {
    if (!currentItem) return null;
    const vocabItem = currentItem as VocabularyItem;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          className="w-80 h-48 relative cursor-pointer mb-8"
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="w-full h-full absolute"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Card className="w-full h-full absolute backface-hidden bg-gradient-to-br from-accent-teal-500 to-accent-teal-400 border-accent-teal-400/30 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">{vocabItem.word}</h3>
                <p className="text-accent-teal-100">Tap to reveal meaning</p>
              </div>
            </Card>
            <Card className="w-full h-full absolute backface-hidden bg-gradient-to-br from-green-500 to-green-600 border-green-400/30 flex items-center justify-center"
                  style={{ transform: "rotateY(180deg)" }}>
              <div className="text-center text-white">
                <h3 className="text-xl font-semibold mb-2">{vocabItem.translation}</h3>
                <p className="text-green-100 text-sm">{vocabItem.example_sentence}</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSkip} className="button-gradient-secondary">
            Skip
          </Button>
          <Button onClick={handleNext} className="button-gradient-primary text-white">
            {currentSessionData && currentIndex === currentSessionData.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    );
  };

  const renderQuizSession = () => {
    if (!currentItem) return null;
    
    const quizItem = currentItem as QuizQuestion;
    
    // Transform current question to QuizCard format
    const quizCardQuestion = {
      id: currentIndex.toString(),
      question: quizItem.question,
      options: quizItem.options.map((option: string, index: number) => ({
        id: String.fromCharCode(97 + index), // 'a', 'b', 'c', 'd'
        text: option,
        isCorrect: option === quizItem.correct_answer
      })),
      explanation: quizItem.explanation,
      difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
      category: 'Quiz'
    };

    const handleQuizAnswer = async (optionId: string, isCorrect: boolean) => {
      const answerIndex = optionId.charCodeAt(0) - 97; // Convert 'a', 'b', 'c', 'd' back to 0, 1, 2, 3
      const selectedOptionText = quizItem.options[answerIndex];
      onAnswerSelect(selectedOptionText);
      onShowResult(true);
      onQuizAnswer(selectedOptionText, isCorrect);
    };

    const handleNextQuestion = () => {
      // Reset state before calling parent's handleNext to prevent state carryover
      onShowResult(false);       // Hide result immediately
      onAnswerSelect(null);      // Clear selected answer
      setTimeout(() => {         // Use timeout to ensure UI updates before transition
        handleNext();            // Then call parent's handleNext
      }, 10);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <QuizCard
          key={currentIndex}
          question={quizCardQuestion}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          onAnswer={handleQuizAnswer}
          onNext={handleNextQuestion}
        />
      </div>
    );
  };

  const renderSession = () => {
    if (isQuiz) {
      return renderQuizSession();
    } else if (isVocabulary) {
      return renderVocabularySession();
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Add song info header */}
      <div className="mb-4 text-center">
        <h1 className="text-xl font-bold text-text-cream100">{songData?.song?.title}</h1>
        <p className="text-text-cream300">{songData?.song?.artist}</p>
      </div>

      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold capitalize text-text-cream100">
            {practiceData.practiceType} Practice
          </h2>
          <div className="flex items-center gap-2">
            {/* Show correct answers progress for quiz */}
            {practiceData.practiceType === 'quiz' && (
              <span className="text-sm text-text-cream400">
                ✓ {correctAnswers.filter(Boolean).length}/{correctAnswers.length}
              </span>
            )}
            <span className="text-sm text-text-cream300">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="w-full bg-base-dark3 rounded-full h-2">
          <div 
            className="bg-accent-teal-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-text-cream300 mt-2">
          Question {currentIndex + 1} of {currentSessionData?.length || 0}
        </p>
      </div>

      {/* Session Content */}
      <Card className="p-6">
        {renderSession()}
      </Card>
    </div>
  );
}