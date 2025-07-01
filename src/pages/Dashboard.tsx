import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DashboardAchievements } from '@/components/achievements/DashboardAchievements';
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  User,
  BookMarked,
  Brain,
  Flame,
  Clock,
  Volume2,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { getUserVocabulary, getUserStats, UserStats } from '@/lib/api';

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="text-text-cream200 h-5 w-5 flex-shrink-0" />
  },
  {
    label: "Lessons",
    href: "/lessons",
    icon: <BookOpen className="text-text-cream200 h-5 w-5 flex-shrink-0" />
  },
  {
    label: "Progress",
    href: "/progress",
    icon: <TrendingUp className="text-text-cream200 h-5 w-5 flex-shrink-0" />
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="text-text-cream200 h-5 w-5 flex-shrink-0" />
  }
];

const languageFlags = {
  spanish: '🇪🇸',
  french: '🇫🇷',
  italian: '🇮🇹',
  german: '🇩🇪'
};

const levelColors = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  fluent: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

export function Dashboard() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    vocabularyCount: 0,
    completedSongs: 0,
    completedQuizzes: 0,
    streakDays: 5, // This could be calculated from user activity
    totalXP: 0,
    totalListeningTime: 0,
    averageQuizScore: 0,
    levelProgress: 0,
    masteredWords: 0,
    hasVocabulary: false
  });


  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // Redirect to onboarding if user hasn't completed it
    if (user && (user.learning_languages.length === 0 || !user.proficiency_level)) {
      navigate('/onboarding', { replace: true });
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch real user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      

      try {
        const realStats = await getUserStats();
        setUserStats(realStats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        // Fallback to basic stats if API fails
        try {
          const vocabularyData = await getUserVocabulary();
          setUserStats(prevStats => ({
            ...prevStats,
            vocabularyCount: vocabularyData.length,
            hasVocabulary: vocabularyData.length > 0,
          }));
        } catch (fallbackError) {
          console.error('Fallback stats fetch failed:', fallbackError);
        }
      } 
    };

    fetchUserStats();
  }, [user]);

  // Don't render anything while checking authentication/onboarding status
  if (!isAuthenticated || !user || user.learning_languages.length === 0 || !user.proficiency_level) {
    return null;
  }

  const userLanguage = user.learning_languages[0] || 'spanish';
  const userLevel = user.proficiency_level?.toLowerCase() || 'beginner';
  const userName = user.username || 'Language Learner';

  const handleContinueLearning = () => {
    navigate('/lessons');
  };


  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 overflow-hidden">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo - Hidden on mobile since it's in the sheet header */}
            <div className="hidden md:flex items-center gap-2 py-2">
              <img src="/audiora_logo_variant1.png" alt="Audiora Logo" className="h-8 w-8 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-text-cream100 text-xl whitespace-pre"
              >
                Audiora
              </motion.span>
            </div>

            {/* User Profile Section */}
            <motion.div 
              className={`mt-6 md:mt-6 frosted-glass rounded-xl border border-accent-teal-500/20 transition-all duration-300 ${
                open ? 'p-4' : 'p-2 md:p-2'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={`flex items-center transition-all duration-300 ${
                open ? 'gap-3 mb-3' : 'gap-3 md:gap-0 mb-3 md:mb-0 md:justify-center'
              }`}>
                <div className={`bg-gradient-to-r from-accent-teal-400 to-accent-mint-400 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  open ? 'w-12 h-12' : 'w-12 h-12 md:w-10 md:h-10'
                }`}>
                  <User className={`text-base-dark2 transition-all duration-300 ${
                    open ? 'h-6 w-6' : 'h-6 w-6 md:h-5 md:w-5'
                  }`} />
                </div>
                <motion.div 
                  className={`flex-1 min-w-0 ${open ? 'block' : 'block md:hidden'}`}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm font-medium text-text-cream100 truncate">{userName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{languageFlags[userLanguage as keyof typeof languageFlags]}</span>
                    <span className="text-xs text-text-cream300 capitalize">{userLanguage}</span>
                  </div>
                </motion.div>
              </div>
              <motion.div
                className={open ? 'block' : 'block md:hidden'}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${levelColors[userLevel as keyof typeof levelColors]}`}>
                  {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}
                </div>
              </motion.div>
              {!open && (
                <motion.div 
                  className="hidden md:flex justify-center mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-2 h-2 bg-accent-teal-400 rounded-full"></div>
                </motion.div>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="mt-8 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header 
          className="bg-base-dark2/80 backdrop-blur-md border-b border-accent-teal-500/20 p-4 sm:p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-text-cream100 truncate">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-text-cream300 mt-1 text-sm sm:text-base">Ready to continue your language learning journey?</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 ml-4">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-accent-teal-500/20 rounded-lg">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                <span className="text-xs sm:text-sm font-medium text-text-cream100 hidden sm:inline">{userStats.streakDays} day streak</span>
                <span className="text-xs font-medium text-text-cream100 sm:hidden">{userStats.streakDays}d</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Progress Overview */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Main Progress Ring */}
              <div className="lg:col-span-1">
                <div className="frosted-glass p-4 sm:p-6 rounded-xl border border-accent-teal-500/20 text-center">
                  <h3 className="text-base sm:text-lg font-semibold text-text-cream100 mb-4">Level Progress</h3>
                  <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                    <ProgressRing progress={userStats.levelProgress} size={140} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-text-cream300">{userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} Level</div>
                    <div className="text-xs text-text-cream400">
                      {Math.round(100 - userStats.levelProgress)}% to {userLevel === 'beginner' ? 'Intermediate' : 
                                                 userLevel === 'intermediate' ? 'Advanced' : 
                                                 userLevel === 'advanced' ? 'Fluent' : 'Master'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                  title="Learning Streak"
                  value={`${userStats.streakDays} days`}
                  icon={Flame}
                  trend={userStats.streakDays > 1 ? { value: userStats.streakDays, isPositive: true } : undefined}
                />
                <MetricCard
                  title="Songs Completed"
                  value={userStats.completedSongs.toString()}
                  subtitle="Total"
                  icon={BookOpen}
                />
                <MetricCard
                  title="Vocabulary Learned"
                  value={userStats.vocabularyCount.toString()}
                  subtitle={`${userStats.masteredWords} mastered`}
                  icon={BookMarked}
                  trend={userStats.vocabularyCount > 10 ? { value: Math.round((userStats.masteredWords / userStats.vocabularyCount) * 100), isPositive: true } : undefined}
                />
                <MetricCard
                  title="Quiz Average"
                  value={userStats.averageQuizScore > 0 ? `${userStats.averageQuizScore}%` : '--'}
                  subtitle={`${userStats.completedQuizzes} completed`}
                  icon={Brain}
                  trend={userStats.averageQuizScore > 0 ? { value: userStats.averageQuizScore, isPositive: userStats.averageQuizScore >= 70 } : undefined}
                />
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              className="frosted-glass p-4 sm:p-6 rounded-xl border border-accent-teal-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-base sm:text-lg font-semibold text-text-cream100 mb-4">Quick Action</h3>
               <Button 
                onClick={handleContinueLearning}
                className="button-gradient-primary text-white h-12 flex items-center gap-2 text-sm sm:text-base w-full"
              >
                <BookMarked className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {userStats.hasVocabulary ? 'Continue Learning' : 'Start Learning'}
                </span>
                <span className="sm:hidden">
                  {userStats.hasVocabulary ? 'Continue' : 'Start'}
                </span>
              </Button>
            </motion.div>

            {/* Achievements Section */}
            <DashboardAchievements />

            {/* Performance Metrics */}
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <MetricCard
                title="Listening Time"
                value={`${userStats.totalListeningTime}min`}
                subtitle="Total"
                icon={Volume2}
              />
              <MetricCard
                title="Mastery Rate"
                value={userStats.vocabularyCount > 0 ? `${Math.round((userStats.masteredWords / userStats.vocabularyCount) * 100)}%` : '--'}
                subtitle="Words mastered"
                icon={BarChart3}
              />
              <MetricCard
                title="Study Streak"
                value={`${userStats.streakDays} days`}
                subtitle="Current"
                icon={Flame}
              />
              <MetricCard
                title="Total Sessions"
                value={(userStats.completedSongs + userStats.completedQuizzes).toString()}
                subtitle="Songs + Quizzes"
                icon={Clock}
              />
            </motion.div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 gap-6">
              {/* Activity Feed - now takes full width */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ActivityFeed />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}