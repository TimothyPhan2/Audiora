import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Award, 
  Target, 
  BookOpen, 
  Music, 
  Headphones,
  Calendar,
  BarChart3,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

// Mock data for progress tracking
const progressData = {
  overall: {
    level: 'Intermediate',
    xp: 2450,
    nextLevelXp: 3000,
    streak: 12,
    totalLessons: 45,
    completedLessons: 32
  },
  vocabulary: {
    wordsLearned: 156,
    wordsReviewed: 89,
    accuracy: 87,
    categories: [
      { name: 'Music Terms', learned: 25, total: 30 },
      { name: 'Daily Conversation', learned: 45, total: 50 },
      { name: 'Travel', learned: 18, total: 25 },
      { name: 'Food & Dining', learned: 32, total: 40 }
    ]
  },
  listening: {
    hoursListened: 24.5,
    songsCompleted: 18,
    accuracy: 82,
    recentSongs: [
      { title: 'Despacito', artist: 'Luis Fonsi', progress: 100, difficulty: 'Beginner' },
      { title: 'La Vie En Rose', artist: 'Édith Piaf', progress: 75, difficulty: 'Intermediate' },
      { title: 'Bailando', artist: 'Enrique Iglesias', progress: 60, difficulty: 'Intermediate' }
    ]
  },
  pronunciation: {
    sessionsCompleted: 28,
    averageScore: 85,
    improvementRate: 12,
    recentScores: [78, 82, 85, 88, 91, 89, 92]
  },
  achievements: [
    { id: 1, title: 'First Steps', description: 'Complete your first lesson', earned: true, date: '2024-01-15' },
    { id: 2, title: 'Music Lover', description: 'Complete 10 song lessons', earned: true, date: '2024-01-20' },
    { id: 3, title: 'Streak Master', description: 'Maintain a 7-day learning streak', earned: true, date: '2024-01-25' },
    { id: 4, title: 'Vocabulary Builder', description: 'Learn 100 new words', earned: true, date: '2024-02-01' },
    { id: 5, title: 'Pronunciation Pro', description: 'Score 90%+ on 5 pronunciation exercises', earned: false, progress: 3, total: 5 }
  ]
}

export default function ProgressPageComponent() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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
              <h1 className="text-3xl font-bold gradient-text">Learning Progress</h1>
              <p className="text-text-cream300">Track your language learning journey</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-base-dark3/60">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="vocabulary" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Vocabulary
              </TabsTrigger>
              <TabsTrigger value="listening" className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                Listening
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievements
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Level Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardHeader>
                    <CardTitle className="text-text-cream100 flex items-center gap-2">
                      <Target className="h-5 w-5 text-accent-teal-400" />
                      Current Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-teal-400 mb-2">
                        {progressData.overall.level}
                      </div>
                      <div className="space-y-2">
                        <Progress 
                          value={(progressData.overall.xp / progressData.overall.nextLevelXp) * 100} 
                          className="h-2"
                        />
                        <div className="text-sm text-text-cream300">
                          {progressData.overall.xp} / {progressData.overall.nextLevelXp} XP
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardHeader>
                    <CardTitle className="text-text-cream100 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-accent-teal-400" />
                      Learning Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-teal-400 mb-2">
                        {progressData.overall.streak}
                      </div>
                      <div className="text-text-cream300">days in a row</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardHeader>
                    <CardTitle className="text-text-cream100 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-accent-teal-400" />
                      Lessons Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-teal-400 mb-2">
                        {progressData.overall.completedLessons}
                      </div>
                      <div className="text-text-cream300">
                        of {progressData.overall.totalLessons} total
                      </div>
                      <Progress 
                        value={(progressData.overall.completedLessons / progressData.overall.totalLessons) * 100} 
                        className="h-2 mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Progress Chart */}
              <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                <CardHeader>
                  <CardTitle className="text-text-cream100 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent-teal-400" />
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-xs text-text-cream400 mb-2">{day}</div>
                        <div 
                          className={`h-16 rounded ${
                            index < 5 ? 'bg-accent-teal-400' : 'bg-text-cream400/20'
                          }`}
                          style={{ 
                            height: `${Math.random() * 40 + 20}px`,
                            backgroundColor: index < 5 ? '#2dd4bf' : 'rgba(255, 252, 247, 0.1)'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-sm text-text-cream300">
                    Great consistency this week! Keep it up!
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vocabulary Tab */}
            <TabsContent value="vocabulary" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent-teal-400 mb-2">
                      {progressData.vocabulary.wordsLearned}
                    </div>
                    <div className="text-text-cream300">Words Learned</div>
                  </CardContent>
                </Card>
                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent-teal-400 mb-2">
                      {progressData.vocabulary.wordsReviewed}
                    </div>
                    <div className="text-text-cream300">Words Reviewed</div>
                  </CardContent>
                </Card>
                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent-teal-400 mb-2">
                      {progressData.vocabulary.accuracy}%
                    </div>
                    <div className="text-text-cream300">Accuracy</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                <CardHeader>
                  <CardTitle className="text-text-cream100">Vocabulary Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {progressData.vocabulary.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-text-cream200">{category.name}</span>
                        <span className="text-text-cream400 text-sm">
                          {category.learned}/{category.total}
                        </span>
                      </div>
                      <Progress value={(category.learned / category.total) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Listening Tab */}
            <TabsContent value="listening" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent-teal-400 mb-2">
                      {progressData.listening.hoursListened}h
                    </div>
                    <div className="text-text-cream300">Hours Listened</div>
                  </CardContent>
                </Card>
                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent-teal-400 mb-2">
                      {progressData.listening.songsCompleted}
                    </div>
                    <div className="text-text-cream300">Songs Completed</div>
                  </CardContent>
                </Card>
                <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-accent-teal-400 mb-2">
                      {progressData.listening.accuracy}%
                    </div>
                    <div className="text-text-cream300">Comprehension</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-base-dark3/60 border-accent-teal-500/20">
                <CardHeader>
                  <CardTitle className="text-text-cream100">Recent Songs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {progressData.listening.recentSongs.map((song, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-base-dark2/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Music className="h-8 w-8 text-accent-teal-400" />
                        <div>
                          <div className="text-text-cream100 font-medium">{song.title}</div>
                          <div className="text-text-cream400 text-sm">{song.artist}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getDifficultyColor(song.difficulty)}>
                          {song.difficulty}
                        </Badge>
                        <div className="text-right">
                          <div className="text-accent-teal-400 font-medium">{song.progress}%</div>
                          <Progress value={song.progress} className="h-1 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {progressData.achievements.map((achievement) => (
                  <Card 
                    key={achievement.id} 
                    className={`border-2 ${
                      achievement.earned 
                        ? 'bg-gradient-to-br from-accent-teal-500/10 to-accent-mint-500/10 border-accent-teal-400/50' 
                        : 'bg-base-dark3/60 border-accent-teal-500/20'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${
                          achievement.earned 
                            ? 'bg-accent-teal-400/20' 
                            : 'bg-text-cream400/20'
                        }`}>
                          <Award className={`h-6 w-6 ${
                            achievement.earned 
                              ? 'text-accent-teal-400' 
                              : 'text-text-cream400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${
                            achievement.earned 
                              ? 'text-text-cream100' 
                              : 'text-text-cream300'
                          }`}>
                            {achievement.title}
                          </h3>
                          <p className="text-text-cream400 text-sm mb-3">
                            {achievement.description}
                          </p>
                          {achievement.earned ? (
                            <Badge className="bg-accent-teal-500/20 text-accent-teal-400 border-accent-teal-500/30">
                              Earned {achievement.date}
                            </Badge>
                          ) : achievement.progress && achievement.total ? (
                            <div className="space-y-2">
                              <div className="text-xs text-text-cream400">
                                Progress: {achievement.progress}/{achievement.total}
                              </div>
                              <Progress 
                                value={(achievement.progress / achievement.total) * 100} 
                                className="h-2"
                              />
                            </div>
                          ) : (
                            <Badge className="bg-text-cream400/20 text-text-cream400 border-text-cream400/30">
                              Not Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}