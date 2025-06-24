import * as React from "react"
import { useState, useEffect} from "react"
import { motion } from "framer-motion"
import { 
  Mic, 
  BookOpen, 
  Headphones, 
  Target, 
  Play, 
  Pause, 
  X, 
  ChevronRight,
  Clock,
  Flame,
  Hourglass,
  ArrowLeft,
  Brain,
  Star,
  Trophy,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuizCard } from '@/components/ui/quiz-card'
import { useAuthStore } from '@/lib/store';
import { useVocabularyStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

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

interface PracticeProps {
  songId?: string;
  songData?: any;
  practiceType?: string;
  onExit?: () => void;
}

interface PracticeTypeCardProps {
  icon: React.ReactNode
  title: string
  currentIndex: number;
  selectedAnswer: string | null;
  showResult: boolean;
  correctAnswers: boolean[];
  onQuizStart: () => void;
  onQuizAnswer: (answer: string, isCorrect: boolean) => void;
  onNext: () => void;
  onAnswerSelect: (answer: string | null) => void;
  onShowResult: (show: boolean) => void;
  description: string
  emoji: string
  onClick: () => void
  className?: string
}

const PracticeTypeCard: React.FC<PracticeTypeCardProps> = ({
  icon,
  title,
  description,
  emoji,
  onClick,
  className = ""
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      <Card className="p-6 h-full card-gradient border-accent-teal-500/20 hover:border-accent-teal-400/30 transition-all duration-300 group">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{emoji}</div>
          <div className="text-accent-teal-400 group-hover:scale-105 transition-transform">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-text-cream100 mb-2">{title}</h3>
        <p className="text-text-cream300 text-sm">{description}</p>
        <div className="mt-4 flex items-center text-text-cream400 text-sm">
          <span>Start practicing</span>
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </motion.div>
  )
}

interface PracticeRecommendationProps {
  title: string
  description: string
  duration: string
  difficulty: "Easy" | "Medium" | "Hard"
  onStart: () => void
}

const PracticeRecommendation: React.FC<PracticeRecommendationProps> = ({
  title,
  description,
  duration,
  difficulty,
  onStart
}) => {
  const difficultyColors = {
    Easy: "bg-green-500/20 text-green-400 border-green-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Hard: "bg-red-500/20 text-red-400 border-red-500/30"
  }

  return (
    <Card className="p-4 frosted-glass border-accent-teal-500/20 hover:border-accent-teal-400/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-text-cream100 mb-1">{title}</h4>
          <p className="text-sm text-text-cream300">{description}</p>
        </div>
        <Badge className={`ml-3 ${difficultyColors[difficulty]}`}>
          {difficulty}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-text-cream400">
          <Clock className="w-4 h-4" />
          <span>{duration}</span>
        </div>
        <Button size="sm" onClick={onStart} className="button-gradient-primary text-white">
          Start Drill
        </Button>
      </div>
    </Card>
  )
}

interface SessionInterfaceProps {
  type: "vocabulary" | "pronunciation" | "listening" | "quiz"
  onExit: () => void
  vocabularyData?: any[]
  quizData?: any[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
  selectedAnswer: string
  setSelectedAnswer: (answer: string) => void
  showResult: boolean
  setShowResult: (show: boolean) => void
  score: number
  setScore: (score: number) => void
  answers: boolean[]
  setAnswers: (answers: boolean[]) => void
  sessionComplete: boolean
  setSessionComplete: (complete: boolean) => void
}

const SessionInterface: React.FC<SessionInterfaceProps> = ({
  type,
  onExit,
  vocabularyData,
  quizData,
  currentIndex,
  setCurrentIndex,
  selectedAnswer,
  setSelectedAnswer,
  showResult,
  setShowResult
}) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Use the data from props instead of mockSessionData
  const currentSessionData = type === 'vocabulary' ? vocabularyData : quizData;

  const currentItem = currentSessionData?.[currentIndex];

  const progress = currentSessionData ? ((currentIndex + 1) / currentSessionData.length) * 100 : 0

  const handleNext = () => {
    if (currentSessionData && currentIndex < currentSessionData.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setSelectedAnswer('')
      setShowResult(false)
    } else {
      onExit()
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const renderVocabularySession = () => {
    if (!currentItem) return null;
    
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
                <h3 className="text-2xl font-bold mb-2">{currentItem.word}</h3>
                <p className="text-accent-teal-100">Tap to reveal meaning</p>
              </div>
            </Card>
            <Card className="w-full h-full absolute backface-hidden bg-gradient-to-br from-green-500 to-green-600 border-green-400/30 flex items-center justify-center"
                  style={{ transform: "rotateY(180deg)" }}>
              <div className="text-center text-white">
                <h3 className="text-xl font-semibold mb-2">{currentItem.translation}</h3>
                <p className="text-green-100 text-sm">{currentItem.example_sentence}</p>
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
    )
  }

  const renderPronunciationSession = () => {
    if (!currentItem) return null;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="p-8 mb-8 frosted-glass border-accent-teal-500/20 text-center max-w-md">
          <h3 className="text-2xl font-bold mb-4 text-text-cream100">{currentItem.phrase}</h3>
          <p className="text-text-cream300 mb-6">{currentItem.phonetic}</p>
          <motion.button
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isRecording ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-accent-teal-500 to-accent-teal-400 hover:from-accent-teal-400 hover:to-accent-teal-500"
            } transition-all duration-300`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRecording(!isRecording)}
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.button>
          <p className="text-sm text-text-cream400">
            {isRecording ? "Recording... Tap to stop" : "Tap to record"}
          </p>
        </Card>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSkip} className="button-gradient-secondary">
            Skip
          </Button>
          <Button onClick={handleNext} className="button-gradient-primary text-white">
            {currentSessionData && currentIndex === currentSessionData.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    )
  }

  const renderListeningSession = () => {
    if (!currentItem) return null;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="p-6 mb-6 frosted-glass border-accent-teal-500/20 text-center max-w-lg">
          <div className="flex items-center justify-center mb-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full button-gradient-secondary"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
          </div>
          <h3 className="text-lg font-semibold mb-4 text-text-cream100">{currentItem.question}</h3>
          <div className="space-y-2">
            {currentItem.options.map((option: string, index: number) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "default" : "outline"}
                className={`w-full justify-start ${
                  selectedAnswer === option 
                    ? "button-gradient-primary text-white" 
                    : "button-gradient-secondary"
                }`}
                onClick={() => setSelectedAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </Card>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSkip} className="button-gradient-secondary">
            Skip
          </Button>
          <Button 
            onClick={handleNext} 
            className="button-gradient-primary text-white"
            disabled={!selectedAnswer}
          >
            {currentSessionData && currentIndex === currentSessionData.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    )
  }

  const renderQuizSession = () => {
    if (!currentItem) return null;
    
    // Transform current question to QuizCard format
    const quizCardQuestion = {
      id: currentIndex.toString(),
      question: currentItem.question,
      options: currentItem.options.map((option: string, index: number) => ({
        id: String.fromCharCode(97 + index), // 'a', 'b', 'c', 'd'
        text: option,
        isCorrect: index === 0 // Assuming first option is correct for mock data
      })),
      explanation: currentItem.explanation,
      difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
      category: 'Quiz'
    };

    const handleQuizAnswer = (optionId: string, isCorrect: boolean) => {
      const answerIndex = optionId.charCodeAt(0) - 97; // Convert 'a', 'b', 'c', 'd' back to 0, 1, 2, 3
      setSelectedAnswer(currentItem.options[answerIndex]);
      setShowResult(true);

       // TODO: Track correctness for user progress/vocabulary mastery
      console.log(`Answer ${isCorrect ? 'correct' : 'incorrect'} for:`, currentItem.question);
    };

    const handleNextQuestion = () => {
      handleNext();
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <QuizCard
          question={quizCardQuestion}
          onAnswer={handleQuizAnswer}
          onNext={handleNextQuestion}
          showResult={showResult}
          selectedOption={selectedAnswer ? String.fromCharCode(97 + currentItem.options.indexOf(selectedAnswer)) : ''}
        />
      </div>
    )
  }

  const renderSession = () => {
    switch (type) {
      case "vocabulary":
        return renderVocabularySession()
      case "pronunciation":
        return renderPronunciationSession()
      case "listening":
        return renderListeningSession()
      case "quiz":
        return renderQuizSession()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      {/* Session Header */}
      <div className="border-b border-accent-teal-500/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit} className="text-text-cream400 hover:text-text-cream200">
              <X className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold capitalize text-text-cream100">{type} Practice</h2>
              <p className="text-sm text-text-cream300">
                Question {currentIndex + 1} of {currentSessionData?.length || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-cream300">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Session Content */}
      <div className="max-w-4xl mx-auto p-6">
        {renderSession()}
      </div>
    </div>
  )
}

export default Practice
