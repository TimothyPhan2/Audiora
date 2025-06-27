import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QuizCard } from '@/components/ui/quiz-card'
import { ListeningExercise } from '@/components/ui/listening-exercise'
import { PronunciationExercise } from '@/components/ui/pronunciation-exercise'

// Types for practice content
interface VocabularyItem {
  word: string;
  translation: string;
  example_sentence: string;
  difficulty_level: string;
  part_of_speech: string;
  source: 'review' | 'new';
  user_vocabulary_id?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty_level: string;
  question_type: string;
}

interface ListeningExerciseData {
  id: string;
  audio_url: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  difficulty_level: string;
}

interface PronunciationExerciseData {
  id: string;
  word_or_phrase: string;
  phonetic_transcription?: string;
  reference_audio_url?: string;
  difficulty_level: string;
  language: string;
  context?: string;
}

interface PracticeData {
  questions?: QuizQuestion[];
  vocabulary?: VocabularyItem[];
  listening?: ListeningExerciseData[];
  pronunciation?: PronunciationExerciseData[];
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
  onAnswer: (answer: string, isCorrect: boolean) => void;  // Generic answer handler
  onNext: () => void;
  onAnswerSelect: (answer: string | null) => void;
  onShowResult: (show: boolean) => void;
  onMasteryUpdate?: (vocabularyItem: VocabularyItem, knewIt: boolean) => Promise<void>;
}

export function Practice({
  practiceData,
  songData,
  currentIndex,
  selectedAnswer,
  showResult,
  correctAnswers,
  onQuizStart,
  onAnswer,
  onNext,
  onAnswerSelect,
  onShowResult,
  onMasteryUpdate
}: PracticeProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isUpdatingMastery, setIsUpdatingMastery] = useState(false);

  // Reset states when moving to next item
  useEffect(() => {
    setIsFlipped(false);
    setHasAnswered(false);
    setIsUpdatingMastery(false);
  }, [currentIndex]);

  // Call onQuizStart when quiz session begins
  useEffect(() => {
    if (practiceData.practiceType === 'quiz' && currentIndex === 0) {
      onQuizStart();
    }
  }, [practiceData.practiceType]);

  // Determine the current session data and type
  const isQuiz = practiceData.practiceType === 'quiz' && practiceData.questions;
  const isVocabulary = practiceData.practiceType === 'vocabulary' && practiceData.vocabulary;
  const isListening = practiceData.practiceType === 'listening' && practiceData.listening;
  const isPronunciation = practiceData.practiceType === 'pronunciation' && practiceData.pronunciation;
  
  const currentSessionData = isQuiz ? practiceData.questions : 
                           isVocabulary ? practiceData.vocabulary :
                           isListening ? practiceData.listening :
                           isPronunciation ? practiceData.pronunciation : null;
  const currentItem = currentSessionData?.[currentIndex];
  
  const progress = currentSessionData ? ((currentIndex + 1) / currentSessionData.length) * 100 : 0;



  const renderVocabularySession = () => {
    if (!currentItem) return null;
    const vocabItem = currentItem as VocabularyItem;
    
    const handleMasteryUpdate = async (knewIt: boolean) => {
      if (isUpdatingMastery || !onMasteryUpdate) return;
      
      setIsUpdatingMastery(true);
      setHasAnswered(true);
      
      try {
        await onMasteryUpdate(vocabItem, knewIt);
        
        // Auto-advance after feedback
        setTimeout(() => {
          onNext();
        }, 1500);
      } catch (error) {
        console.error('Failed to update mastery:', error);
        setIsUpdatingMastery(false);
        setHasAnswered(false);
      }
    };

    const getSourceBadge = () => {
      if (vocabItem.source === 'review') {
        return (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
            Review
          </span>
        );
      } else {
        return (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            New
          </span>
        );
      }
    };
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          className="w-80 h-48 relative cursor-pointer mb-8"
          onClick={() => !hasAnswered && setIsFlipped(!isFlipped)}
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="w-full h-full absolute"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front of card */}
            <Card className="w-full h-full absolute backface-hidden bg-gradient-to-br from-accent-teal-500 to-accent-teal-400 border-accent-teal-400/30 flex items-center justify-center">
              {getSourceBadge()}
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">{vocabItem.word}</h3>
                <p className="text-accent-teal-100">
                  {vocabItem.source === 'review' ? 'Do you remember this?' : 'Tap to learn meaning'}
                </p>
              </div>
            </Card>
            
            {/* Back of card */}
            <Card className="w-full h-full absolute backface-hidden bg-gradient-to-br from-green-500 to-green-600 border-green-400/30 flex items-center justify-center"
                  style={{ transform: "rotateY(180deg)" }}>
              <div className="text-center text-white p-4">
                <h3 className="text-xl font-semibold mb-2">{vocabItem.translation}</h3>
                <p className="text-green-100 text-sm">{vocabItem.example_sentence}</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Interaction buttons */}
        <div className="flex gap-4">
          {!isFlipped ? (
            <Button 
              onClick={() => setIsFlipped(true)} 
              className="button-gradient-primary text-white"
            >
              {vocabItem.source === 'review' ? 'Check Answer' : 'Reveal Meaning'}
            </Button>
          ) : !hasAnswered ? (
            <>
              <Button 
                onClick={() => handleMasteryUpdate(false)}
                variant="outline" 
                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                disabled={isUpdatingMastery}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {vocabItem.source === 'review' ? "Didn't Remember" : "Need Practice"}
              </Button>
              <Button 
                onClick={() => handleMasteryUpdate(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
                disabled={isUpdatingMastery}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {vocabItem.source === 'review' ? "I Remembered" : "Got It!"}
              </Button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-accent-teal-400 mb-2">
                {isUpdatingMastery ? "Updating progress..." : "Progress updated!"}
              </p>
              <Button 
                onClick={onNext} 
                className="button-gradient-primary text-white"
              >
                {currentSessionData && currentIndex === currentSessionData.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderListeningSession = () => {
    if (!currentItem) return null;
    const listeningItem = currentItem as ListeningExerciseData;
    
    const handleListeningAnswer = (answer: string, isCorrect: boolean) => {
      onAnswerSelect(answer);
      onShowResult(true);
      onAnswer(answer, isCorrect);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <ListeningExercise
          key={currentIndex}
          exercise={listeningItem}
          selectedAnswer={selectedAnswer ?? ""}
          showResult={showResult}
          onAnswer={handleListeningAnswer}
          onNext={onNext}
        />
      </div>
    );
  };

  const renderPronunciationSession = () => {
    if (!currentItem) return null;
    const pronunciationItem = currentItem as PronunciationExerciseData;
    
    const handlePronunciationComplete = (score: number) => {
      // For pronunciation, we consider it "correct" if score >= 70
      const isCorrect = score >= 70;
      onAnswer(`Score: ${score}%`, isCorrect);
      onShowResult(true);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <PronunciationExercise
          key={currentIndex}
          exercise={pronunciationItem}
          onComplete={handlePronunciationComplete}
          onNext={onNext}
        />
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
      onAnswerSelect(optionId);
      onShowResult(true);
      onAnswer(selectedOptionText, isCorrect);
    };

    

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <QuizCard
          key={currentIndex}
          question={quizCardQuestion}
          selectedOption={selectedAnswer ?? ""}
          showResult={showResult}
          onAnswer={handleQuizAnswer}
          onNext={onNext}
        />
      </div>
    );
  };

  const renderSession = () => {
    if (isQuiz) {
      return renderQuizSession();
    } else if (isVocabulary) {
      return renderVocabularySession();
    } else if (isListening) {
      return renderListeningSession();
    } else if (isPronunciation) {
      return renderPronunciationSession();
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