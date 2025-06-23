import * as React from "react"
import { useState} from "react"
import { motion } from "framer-motion"
import { 
  Mic, 
  BookOpen, 
  Headphones, 
  Target, 
  Play, 
  Pause, 
  Check, 
  X, 
  ChevronRight,
  Clock,
  Flame,
  Hourglass
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuizCard } from '@/components/ui/quiz-card'

interface PracticeTypeCardProps {
  icon: React.ReactNode
  title: string
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
  sessionData: any
}

const SessionInterface: React.FC<SessionInterfaceProps> = ({ type, onExit, sessionData }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const progress = ((currentIndex + 1) / sessionData.items.length) * 100

  const handleNext = () => {
    if (currentIndex < sessionData.items.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      onExit()
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const renderVocabularySession = () => {
    const item = sessionData.items[currentIndex]
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
                <h3 className="text-2xl font-bold mb-2">{item.word}</h3>
                <p className="text-accent-teal-100">Tap to reveal meaning</p>
              </div>
            </Card>
            <Card className="w-full h-full absolute backface-hidden bg-gradient-to-br from-green-500 to-green-600 border-green-400/30 flex items-center justify-center"
                  style={{ transform: "rotateY(180deg)" }}>
              <div className="text-center text-white">
                <h3 className="text-xl font-semibold mb-2">{item.meaning}</h3>
                <p className="text-green-100 text-sm">{item.example}</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSkip} className="button-gradient-secondary">
            Skip
          </Button>
          <Button onClick={handleNext} className="button-gradient-primary text-white">
            {currentIndex === sessionData.items.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    )
  }

  const renderPronunciationSession = () => {
    const item = sessionData.items[currentIndex]
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="p-8 mb-8 frosted-glass border-accent-teal-500/20 text-center max-w-md">
          <h3 className="text-2xl font-bold mb-4 text-text-cream100">{item.phrase}</h3>
          <p className="text-text-cream300 mb-6">{item.phonetic}</p>
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
            {currentIndex === sessionData.items.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    )
  }

  const renderListeningSession = () => {
    const item = sessionData.items[currentIndex]
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
          <h3 className="text-lg font-semibold mb-4 text-text-cream100">{item.question}</h3>
          <div className="space-y-2">
            {item.options.map((option: string, index: number) => (
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
            {currentIndex === sessionData.items.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    )
  }

  const renderQuizSession = () => {
    const item = sessionData.items[currentIndex]
    
    // Transform current question to QuizCard format
    const quizCardQuestion = {
      id: currentIndex.toString(),
      question: item.question,
      options: item.options.map((option: string, index: number) => ({
        id: String.fromCharCode(97 + index), // 'a', 'b', 'c', 'd'
        text: option,
        isCorrect: index === 0 // Assuming first option is correct for mock data
      })),
      explanation: item.explanation,
      difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
      category: 'Quiz'
    };

    const handleQuizAnswer = (optionId: string, isCorrect: boolean) => {
      const answerIndex = optionId.charCodeAt(0) - 97; // Convert 'a', 'b', 'c', 'd' back to 0, 1, 2, 3
      setSelectedAnswer(item.options[answerIndex]);
      setShowResult(true);
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
          selectedOption={selectedAnswer ? String.fromCharCode(97 + item.options.indexOf(selectedAnswer)) : ''}
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
                Question {currentIndex + 1} of {sessionData.items.length}
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

const Practice: React.FC = () => {
  const [activeSession, setActiveSession] = useState<{
    type: "vocabulary" | "pronunciation" | "listening" | "quiz"
    data: any
  } | null>(null)
  const [practiceFilter, setPracticeFilter] = useState<string>("All")

  // Mock data
  const mockSessionData = {
    vocabulary: {
      items: [
        { word: "Melodía", meaning: "Melody", example: "La melodía de esta canción es hermosa" },
        { word: "Ritmo", meaning: "Rhythm", example: "El ritmo de la música es contagioso" },
        { word: "Armonía", meaning: "Harmony", example: "La armonía vocal es perfecta" }
      ]
    },
    pronunciation: {
      items: [
        { phrase: "Buenos días", phonetic: "/ˈbwe.nos ˈdi.as/" },
        { phrase: "¿Cómo estás?", phonetic: "/ˈko.mo esˈtas/" },
        { phrase: "Muchas gracias", phonetic: "/ˈmu.tʃas ˈɡɾa.θjas/" }
      ]
    },
    listening: {
      items: [
        {
          question: "What is the singer expressing in this verse?",
          options: ["Love", "Sadness", "Joy", "Anger"],
          correct: "Love"
        }
      ]
    },
    quiz: {
      items: [
        {
          question: "What does 'corazón' mean in English?",
          options: ["Heart", "Soul", "Mind", "Spirit"],
          correct: "Heart",
          explanation: "Corazón is the Spanish word for heart."
        }
      ]
    }
  }

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

  const startPractice = (type: "vocabulary" | "pronunciation" | "listening" | "quiz") => {
    setActiveSession({
      type,
      data: mockSessionData[type]
    })
  }

  const exitSession = () => {
    setActiveSession(null)
  }

  if (activeSession) {
    return (
      <SessionInterface
        type={activeSession.type}
        onExit={exitSession}
        sessionData={activeSession.data}
      />
    )
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