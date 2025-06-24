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
export function PracticeInterface({ 
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
}: PracticeInterfaceProps) {

const Practice: React.FC<PracticeProps> = ({ 
  songId, 
    return (
      <SessionInterface 
        practiceData={practiceData} 
        songData={songData}
        currentIndex={currentIndex}
        selectedAnswer={selectedAnswer}
        showResult={showResult}
        correctAnswers={correctAnswers}
        onQuizStart={onQuizStart}
        onQuizAnswer={onQuizAnswer}
        onNext={onNext}
        onAnswerSelect={onAnswerSelect}
        onShowResult={onShowResult}
      />
    );
  practiceType: initialPracticeType,
  onExit 
}) => {
function SessionInterface({ 
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
}: {
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
}) {
  const [hasStarted, setHasStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [vocabularyData, setVocabularyData] = useState<VocabularyItem[]>([]);
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const { savedWords } = useVocabularyStore();

  const [practiceFilter, setPracticeFilter] = useState<string>("All")

  // Generate practice content using Gemini API
  const generatePracticeContent = async (type: 'vocabulary' | 'quiz') => {
    if (!songId || !songData) {
      setApiError('Song data not available');
      return null;
    }

    setIsLoading(true);
    setApiError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      // Prepare lyrics text
      const lyrics = songData.lyrics?.map((l: any) => l.text).join('\n') || '';
      
      // Prepare user vocabulary for context
      const userVocabulary = savedWords.map(word => ({
        word: word.original,
        translation: word.translation,
        mastery_score: word.mastery_score || 0
      }));

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-practice-generator`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          songId,
          practiceType: type,
          userProficiencyLevel: user?.proficiency_level || 'Intermediate',
          targetLanguage: songData.language || 'spanish',
          lyrics,
          userVocabulary
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
  // Start quiz on first render
  useEffect(() => {
    if (!hasStarted) {
      onQuizStart();
      setHasStarted(true);
    }
  }, [hasStarted, onQuizStart]);
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
    onAnswerSelect(answer);
    onShowResult(true);
    onQuizAnswer(answer, answer === currentQuestion.correct_answer);
      return data;
    } catch (error) {
      console.error('Failed to generate practice content:', error);
    // Clear all visual indicators and reset state
    onAnswerSelect(null);
    onShowResult(false);
    onNext();
  };

  // Mock data fallback
  const mockVocabularyData: VocabularyItem[] = [
    {
      word: "corazón",
      translation: "heart",
      example_sentence: "Mi corazón late por ti",
      difficulty_level: "intermediate",
      part_of_speech: "noun"
    },
    // ... rest of mock data
  ];

  const mockQuizData: QuizQuestion[] = [
    {
      question: "What does 'corazón' mean in English?",
      options: ["Heart", "Soul", "Mind", "Love"],
      correct_answer: "Heart",
      explanation: "'Corazón' is the Spanish word for heart, both literally and metaphorically.",
      difficulty_level: "beginner",
      question_type: "vocabulary"
    },
    // ... rest of mock data
  ];

  // Initialize practice type from URL parameter
  useEffect(() => {
    if (initialPracticeType === 'vocabulary') {
      handleStartVocabulary();
    } else if (initialPracticeType === 'quiz') {
      handleStartQuiz();
    }
  }, [initialPracticeType, songId]);

  const practiceTypes = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Pronunciation Practice",
      description: "Record & Compare",
      emoji: "🎤",
      type: "pronunciation" as const
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Vocabulary Drill",
      description: "Flashcard Review",
      emoji: "📚",
      type: "vocabulary" as const
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Listening Exercise",
      description: "Audio Comprehension",
      emoji: "👂",
      type: "listening" as const
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Quick Quiz",
      description: "Mixed Review",
      emoji: "🎯",
      type: "quiz" as const
    }
  ]

  const recommendations = [
    {
      title: "Spanish Ballads Vocabulary",
      description: "Practice words from 'Bésame Mucho'",
      duration: "5 min",
      difficulty: "Easy" as const
    },
    {
      title: "Rolling R Pronunciation",
      description: "Master the Spanish 'rr' sound",
      duration: "8 min",
      difficulty: "Medium" as const
    },
    {
      title: "Flamenco Rhythm Recognition",
      description: "Identify different flamenco styles",
      duration: "10 min",
      difficulty: "Hard" as const
    }
  ]

  const continueSession = {
    title: "Vocabulary: Love Songs",
    progress: 65,
    timeLeft: "3 min"
  }

  const filters = ["All", "Vocabulary", "Pronunciation", "Listening", "Quizzes"]

  const handleStartVocabulary = async () => {
    // Reset all state when starting new session
    setCurrentIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setSessionComplete(false);
    
    if (songId && songData) {
      const content = await generatePracticeContent('vocabulary');
      if (content?.vocabulary) {
        setVocabularyData(content.vocabulary);
      } else {
        // Fallback to mock data
        setVocabularyData(mockVocabularyData);
      }
    } else {
      // Use mock data if no song data
      setVocabularyData(mockVocabularyData);
    }
    setActiveSession('vocabulary');
  };

  const handleStartQuiz = async () => {
    // Reset all state when starting new session
    setCurrentIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setSessionComplete(false);
    
    if (songId && songData) {
      const content = await generatePracticeContent('quiz');
      if (content?.questions) {
        setQuizData(content.questions);
      } else {
        // Fallback to mock data
        setQuizData(mockQuizData);
      }
    } else {
      // Use mock data if no song data
      setQuizData(mockQuizData);
    }
    setActiveSession('quiz');
  };

  const startPractice = (type: "vocabulary" | "pronunciation" | "listening" | "quiz") => {
     if (type === 'vocabulary') {
      handleStartVocabulary();
    } else if (type === 'quiz') {
      handleStartQuiz();
    }
    // Note: pronunciation and listening not implemented yet
  }

  const handleBackToMenu = () => {
    if (onExit) {
      onExit();
      return;
    }
    setActiveSession('menu');
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setSessionComplete(false);
    setSelectedAnswer('');
    setShowResult(false);
    setApiError(null);
  };

  const exitSession = () => {
    setActiveSession('menu')
  }

  const renderMainMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          {(onExit || songData) && (
            <Button
              onClick={handleBackToMenu}
              variant="ghost"
              className="absolute top-6 left-6 text-text-cream300 hover:text-cream100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}
         
         <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-accent-teal-500 to-accent-persian-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-10 h-10 text-white" />
          </div>
          {songData ? (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-text-cream100 mb-4">
                Practice with "{songData.song.title}"
              </h1>
              <p className="text-xl text-text-cream300 max-w-2xl mx-auto">
                by {songData.song.artist} • {songData.song.language.charAt(0).toUpperCase() + songData.song.language.slice(1)}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-text-cream100 mb-4">
                Practice Session
              </h1>
              <p className="text-xl text-text-cream300 max-w-2xl mx-auto">
                Choose your practice mode and start improving your language skills
              </p>
            </>
          )}
        </motion.div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center mb-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-teal-400 mx-auto mb-4"></div>
              <p className="text-text-cream200">Generating practice content...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {apiError && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-red-400 text-center">{apiError}</p>
            <p className="text-red-300 text-sm text-center mt-2">
              Don't worry! We'll use practice content to keep you learning.
            </p>
          </div>
        )}

        {/* Practice Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto" style={{ opacity: isLoading ? 0.5 : 1 }}>
          {/* Vocabulary Practice */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-gradient hover:border-accent-teal-400/50 transition-all duration-300 group cursor-pointer h-full"
                  onClick={isLoading ? undefined : handleStartVocabulary}>
              <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-accent-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent-teal-500/30 transition-colors">
                    <BookOpen className="w-8 h-8 text-accent-teal-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-text-cream100 mb-4">
                    Vocabulary Drill
                  </h3>
                  <p className="text-text-cream300 mb-6">
                    {songData ? 
                      'Learn vocabulary from this song with AI-generated flashcards' :
                      'Learn new words and phrases with interactive flashcards'
                    }
                  </p>
                </div>
                <div className="space-y-2 text-sm text-text-cream400">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>{songData ? 'Song-specific vocabulary' : '8-12 vocabulary cards'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>5-10 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quiz Practice */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="card-gradient hover:border-accent-teal-400/50 transition-all duration-300 group cursor-pointer h-full"
                  onClick={isLoading ? undefined : handleStartQuiz}>
              <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-accent-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent-teal-500/30 transition-colors">
                    <Brain className="w-8 h-8 text-accent-teal-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-text-cream100 mb-4">
                    Quick Quiz
                  </h3>
                  <p className="text-text-cream300 mb-6">
                    {songData ? 
                      'Test your understanding with questions about this song' :
                      'Test your knowledge with multiple choice questions'
                    }
                  </p>
                </div>
                <div className="space-y-2 text-sm text-text-cream400">
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>5 questions</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>3-5 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );

  if (activeSession === 'vocabulary') {
    return (
      <SessionInterface
        type="vocabulary"
        onExit={exitSession}
        vocabularyData={vocabularyData}
        quizData={[]}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        selectedAnswer={selectedAnswer}
        setSelectedAnswer={setSelectedAnswer}
        showResult={showResult}
        setShowResult={setShowResult}
        score={score}
        setScore={setScore}
        answers={answers}
        setAnswers={setAnswers}
        sessionComplete={sessionComplete}
        setSessionComplete={setSessionComplete}
      />
    )
  }

  if (activeSession === 'quiz') {
    return (
      <SessionInterface
        type="quiz"
        onExit={exitSession}
        vocabularyData={[]}
        quizData={quizData}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        selectedAnswer={selectedAnswer}
        setSelectedAnswer={setSelectedAnswer}
        showResult={showResult}
        setShowResult={setShowResult}
        score={score}
        setScore={setScore}
        answers={answers}
        setAnswers={setAnswers}
        sessionComplete={sessionComplete}
        setSessionComplete={setSessionComplete}
      />
    )
  }

  if (songData || onExit) {
    return renderMainMenu();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-cream100 mb-2">Ready to Practice?</h1>
              <p className="text-text-cream300">Choose your practice type and start learning</p>
        
        {/* Score indicator */}
        {correctAnswers.length > 0 && (
          <div className="text-center text-sm text-text-cream300">
            Score: {correctAnswers.filter(Boolean).length} / {correctAnswers.length} correct
          </div>
        )}
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center p-3 rounded-lg frosted-glass border border-accent-teal-500/20 shadow-sm">
                <div className="flex items-center justify-center text-2xl font-bold text-accent-teal-400 mb-1">
                  <Hourglass className="w-6 h-6 mr-2 text-accent-teal-400" />
                  23
                </div>
                <div className="text-xs text-text-cream400">Minutes Practiced</div>
              </div>
              <div className="text-center p-3 rounded-lg frosted-glass border border-accent-teal-500/20 shadow-sm">
                <div className="flex items-center justify-center text-2xl font-bold text-accent-teal-400 mb-1">
                  <Flame className="w-6 h-6 mr-2 text-orange-400" />
                  7
                </div>
                <div className="text-xs text-text-cream400">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Type Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={practiceFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setPracticeFilter(filter)}
              className={`whitespace-nowrap ${
                practiceFilter === filter 
                  ? "button-gradient-primary text-white" 
                  : "button-gradient-secondary"
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Continue Session */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-text-cream100">Continue Where You Left Off</h2>
          <Card className="p-4 bg-gradient-to-r from-accent-teal-500/10 to-accent-teal-400/5 border-accent-teal-500/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-text-cream100">{continueSession.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-text-cream300">{continueSession.progress}% complete</span>
                  <div className="flex items-center gap-1 text-sm text-text-cream400">
                    <Clock className="w-4 h-4" />
                    <span>{continueSession.timeLeft} left</span>
                  </div>
                </div>
              </div>
              <Button onClick={() => startPractice("vocabulary")} className="button-gradient-primary text-white">
                Resume
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Practice Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-text-cream100">Practice Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {practiceTypes.map((practice) => (
              <PracticeTypeCard
                key={practice.type}
                icon={practice.icon}
                title={practice.title}
                description={practice.description}
                emoji={practice.emoji}
                onClick={() => startPractice(practice.type)}
              />
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-text-cream100">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <PracticeRecommendation
                key={index}
                title={rec.title}
                description={rec.description}
                duration={rec.duration}
                difficulty={rec.difficulty}
                onStart={() => startPractice("vocabulary")}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Practice
                  {currentIndex === practiceData.questions.length - 1 ? 'Complete Quiz' : 'Next Question'}