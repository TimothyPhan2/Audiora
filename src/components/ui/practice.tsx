'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  Headphones, 
  Mic, 
  BookOpen, 
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Home
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Mock data for practice sessions
const practiceData = {
  vocabulary: [
    {
      id: 1,
      word: 'corazón',
      translation: 'heart',
      pronunciation: 'ko-ra-THON',
      example: 'Mi corazón late por ti',
      exampleTranslation: 'My heart beats for you',
      difficulty: 'intermediate'
    },
    {
      id: 2,
      word: 'bailar',
      translation: 'to dance',
      pronunciation: 'bai-LAR',
      example: 'Quiero bailar contigo',
      exampleTranslation: 'I want to dance with you',
      difficulty: 'beginner'
    },
    {
      id: 3,
      word: 'música',
      translation: 'music',
      pronunciation: 'MU-si-ka',
      example: 'La música es vida',
      exampleTranslation: 'Music is life',
      difficulty: 'beginner'
    }
  ],
  listening: [
    {
      id: 1,
      title: 'Despacito - Chorus',
      artist: 'Luis Fonsi',
      audioUrl: '/audio/despacito-chorus.mp3',
      lyrics: 'Despacito, quiero respirar tu cuello despacito',
      translation: 'Slowly, I want to breathe on your neck slowly',
      difficulty: 'intermediate'
    }
  ],
  pronunciation: [
    {
      id: 1,
      phrase: 'Buenos días',
      translation: 'Good morning',
      phonetic: 'BWAY-nos DEE-ahs',
      difficulty: 'beginner'
    },
    {
      id: 2,
      phrase: 'Me gusta la música',
      translation: 'I like music',
      phonetic: 'meh GOOS-tah lah MU-see-kah',
      difficulty: 'intermediate'
    }
  ]
}

export default function Practice() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('vocabulary')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const getCurrentData = () => {
    switch (activeTab) {
      case 'vocabulary':
        return practiceData.vocabulary
      case 'listening':
        return practiceData.listening
      case 'pronunciation':
        return practiceData.pronunciation
      default:
        return []
    }
  }

  const currentData = getCurrentData()
  const currentItem = currentData[currentIndex]
  const progress = ((currentIndex + 1) / currentData.length) * 100

  const handleNext = () => {
    if (currentIndex < currentData.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowAnswer(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentIndex(0)
    setShowAnswer(false)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // In a real app, this would control audio playback
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real app, this would control microphone recording
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-text-cream300 hover:text-text-cream100"
            >
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Practice Session</h1>
              <p className="text-text-cream300">Improve your skills with interactive exercises</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent-teal-400">{score}</div>
            <div className="text-sm text-text-cream400">Points</div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-cream300">Progress</span>
            <span className="text-sm text-text-cream300">
              {currentIndex + 1} of {currentData.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Practice Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-base-dark3/60">
              <TabsTrigger value="vocabulary" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Vocabulary
              </TabsTrigger>
              <TabsTrigger value="listening" className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                Listening
              </TabsTrigger>
              <TabsTrigger value="pronunciation" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Pronunciation
              </TabsTrigger>
            </TabsList>

            {/* Vocabulary Practice */}
            <TabsContent value="vocabulary">
              {currentItem && (
                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-text-cream100">Vocabulary Practice</CardTitle>
                      <Badge className={getDifficultyColor((currentItem as any).difficulty)}>
                        {(currentItem as any).difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-accent-teal-400 mb-2">
                        {(currentItem as any).word}
                      </div>
                      <div className="text-text-cream300 mb-4">
                        /{(currentItem as any).pronunciation}/
                      </div>
                      
                      {showAnswer && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="text-2xl text-text-cream100">
                            {(currentItem as any).translation}
                          </div>
                          <div className="p-4 bg-base-dark2/50 rounded-lg">
                            <div className="text-text-cream200 mb-1">
                              "{(currentItem as any).example}"
                            </div>
                            <div className="text-text-cream400 text-sm">
                              "{(currentItem as any).exampleTranslation}"
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex justify-center gap-4">
                      {!showAnswer ? (
                        <Button 
                          onClick={() => setShowAnswer(true)}
                          className="button-gradient-primary"
                        >
                          Show Answer
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setScore(score + 5)}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Correct
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Incorrect
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Listening Practice */}
            <TabsContent value="listening">
              {currentItem && (
                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-text-cream100">Listening Practice</CardTitle>
                      <Badge className={getDifficultyColor((currentItem as any).difficulty)}>
                        {(currentItem as any).difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-text-cream100 mb-2">
                        {(currentItem as any).title}
                      </h3>
                      <p className="text-text-cream300 mb-6">
                        by {(currentItem as any).artist}
                      </p>

                      <div className="flex justify-center mb-6">
                        <Button
                          onClick={togglePlayback}
                          className="button-gradient-primary w-16 h-16 rounded-full"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>
                      </div>

                      {showAnswer && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="p-4 bg-base-dark2/50 rounded-lg">
                            <div className="text-text-cream200 mb-2 italic">
                              "{(currentItem as any).lyrics}"
                            </div>
                            <div className="text-text-cream400">
                              "{(currentItem as any).translation}"
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex justify-center">
                      {!showAnswer ? (
                        <Button 
                          onClick={() => setShowAnswer(true)}
                          className="button-gradient-primary"
                        >
                          Show Lyrics & Translation
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setScore(score + 10)}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Understood
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Need Practice
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pronunciation Practice */}
            <TabsContent value="pronunciation">
              {currentItem && (
                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-text-cream100">Pronunciation Practice</CardTitle>
                      <Badge className={getDifficultyColor((currentItem as any).difficulty)}>
                        {(currentItem as any).difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-teal-400 mb-2">
                        {(currentItem as any).phrase}
                      </div>
                      <div className="text-text-cream300 mb-2">
                        /{(currentItem as any).phonetic}/
                      </div>
                      <div className="text-text-cream400 mb-6">
                        "{(currentItem as any).translation}"
                      </div>

                      <div className="flex justify-center mb-6">
                        <Button
                          onClick={toggleRecording}
                          className={`w-16 h-16 rounded-full ${
                            isRecording 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'button-gradient-primary'
                          }`}
                        >
                          <Mic className="h-6 w-6" />
                        </Button>
                      </div>

                      {isRecording && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-400 text-sm"
                        >
                          Recording... Speak clearly into your microphone
                        </motion.div>
                      )}
                    </div>

                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setScore(score + 8)}
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Good Pronunciation
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Navigation */}
        <motion.div 
          className="flex justify-between items-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="border-accent-teal-500/30 text-text-cream200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentData.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex 
                    ? 'bg-accent-teal-400' 
                    : index < currentIndex 
                      ? 'bg-accent-teal-400/50' 
                      : 'bg-text-cream400/30'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === currentData.length - 1}
            className="button-gradient-primary"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>

        {/* Completion Message */}
        {currentIndex === currentData.length - 1 && showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <Card className="bg-gradient-to-r from-accent-teal-500/20 to-accent-mint-500/20 border-accent-teal-400/30">
              <CardContent className="p-6">
                <Target className="h-12 w-12 text-accent-teal-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-cream100 mb-2">
                  Practice Session Complete!
                </h3>
                <p className="text-text-cream300 mb-4">
                  Great job! You've completed this practice session.
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={() => {
                      setCurrentIndex(0)
                      setShowAnswer(false)
                    }}
                    variant="outline"
                    className="border-accent-teal-500/30 text-text-cream200"
                  >
                    Practice Again
                  </Button>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="button-gradient-primary"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}