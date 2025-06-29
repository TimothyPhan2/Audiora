import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Book, 
  Flame, 
  Music, 
  Target, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  Star, 
  Zap, 
  Award,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getUserStats, getUserActivity, UserStats, ActivityItem } from '@/lib/api';
import { cn } from '@/lib/utils';

// CircleProgress component
interface CircleProgressProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const CircleProgress: React.FC<CircleProgressProps> = ({
  value,
  maxValue,
  size = 40,
  strokeWidth = 3,
  className
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = Math.min(animatedValue / maxValue, 1);
  const strokeDashoffset = circumference * (1 - fillPercentage);

  return (
    <div className={cn(className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-transparent stroke-accent-teal-500/20"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-transparent stroke-accent-teal-400"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out'
          }}
        />
      </svg>
    </div>
  );
};

// ProgressCard component
interface ProgressCardProps {
  title: string;
  value: number;
  maxValue?: number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  maxValue = 100,
  icon,
  description,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "frosted-glass p-6 rounded-xl border border-accent-teal-500/20 hover:border-accent-teal-400/30 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-teal-500/20 rounded-lg text-accent-teal-400">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-cream100">{title}</h3>
            {description && (
              <p className="text-sm text-text-cream400">{description}</p>
            )}
          </div>
        </div>
        <CircleProgress value={value} maxValue={maxValue} size={60} strokeWidth={4} />
      </div>
      <div className="text-right">
        <span className="text-2xl font-bold text-text-cream100">{value}</span>
        <span className="text-text-cream400 ml-1">/ {maxValue}</span>
      </div>
    </motion.div>
  );
};

// MilestoneTimeline component
interface Milestone {
  id: string;
  title: string;
  date: string;
  icon: string;
  completed: boolean;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => (
        <motion.div
          key={milestone.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex items-center gap-4 p-4 frosted-glass rounded-lg border border-accent-teal-500/20"
        >
          <div className="text-2xl">{milestone.icon}</div>
          <div className="flex-1">
            <h4 className="text-text-cream100 font-medium">{milestone.title}</h4>
            <p className="text-sm text-text-cream400">{milestone.date}</p>
          </div>
          {milestone.completed && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

// SkillBar component
interface SkillBarProps {
  skill: string;
  percentage: number;
  isStrong?: boolean;
  needsFocus?: boolean;
}

const SkillBar: React.FC<SkillBarProps> = ({ skill, percentage, isStrong, needsFocus }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-text-cream100 font-medium">{skill}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-cream400">{percentage}%</span>
          {isStrong && <CheckCircle className="w-4 h-4 text-green-400" />}
          {needsFocus && <TrendingUp className="w-4 h-4 text-amber-400" />}
        </div>
      </div>
      <div className="w-full bg-base-dark3/50 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={cn(
            "h-2 rounded-full",
            isStrong ? "bg-green-400" : needsFocus ? "bg-amber-400" : "bg-accent-teal-400"
          )}
        />
      </div>
    </motion.div>
  );
};

// StreakVisualizer component
interface StreakVisualizerProps {
  days: boolean[];
  currentStreak: number;
}

const StreakVisualizer: React.FC<StreakVisualizerProps> = ({ days, currentStreak }) => {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {days.map((practiced, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                practiced 
                  ? "bg-accent-teal-400 border-accent-teal-400 text-base-dark2" 
                  : "border-accent-teal-500/30 text-text-cream400"
              )}
            >
              {practiced && <CheckCircle className="w-4 h-4" />}
            </motion.div>
            <span className="text-xs text-text-cream400">{dayLabels[index]}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-text-cream300">
        {currentStreak} out of 7 days this week - {currentStreak >= 5 ? 'great consistency!' : 'keep it up!'} 🔥
      </p>
    </div>
  );
};

// Main Progress component
export function ProgressPageComponent() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userActivity, setUserActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

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

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const [stats, activity] = await Promise.all([
          getUserStats(),
          getUserActivity(10)
        ]);
        
        setUserStats(stats);
        setUserActivity(activity);
      } catch (error) {
        console.error('Failed to fetch user progress data:', error);
        setError('Failed to load progress data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Don't render anything while checking authentication/onboarding status
  if (!isAuthenticated || !user || user.learning_languages.length === 0 || !user.proficiency_level) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-teal-400 mx-auto" />
          <p className="text-text-cream300 mt-2">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-accent-teal-500 text-white rounded-lg hover:bg-accent-teal-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userStats) return null;

  // Replace the hardcoded milestones with real activity data
  // Helper function to get appropriate icons
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '🎵';
      case 'achievement': return '🏆';
      case 'practice': return '📚';
      case 'quiz': return '🎤';
      default: return '✨';
    }
  };

  const milestones: Milestone[] = userActivity.slice(0, 4).map((activity) => ({
    id: activity.id,
    title: activity.title,
    date: activity.timestamp || 'Recently',
    icon: getActivityIcon(activity.type),
    completed: true
  }));

  // Generate weekly streak (mock data for now, could be enhanced with real daily activity tracking)
  const weeklyStreak = Array.from({ length: 7 }, (_, i) => {
    return i < userStats.streakDays && userStats.streakDays > 0;
  });
  const currentStreak = weeklyStreak.filter(Boolean).length;

  // Calculate skill percentages based on user stats
  const vocabularyPercentage = Math.min((userStats.vocabularyCount / 100) * 100, 100);
  const pronunciationPercentage = Math.min(userStats.averageQuizScore || 0, 100);
  const listeningPercentage = Math.min((userStats.totalListeningTime / 60) * 100, 100); // Convert minutes to percentage

  // Generate insights based on user data
  const getTopInsight = () => {
    if (vocabularyPercentage >= 80) return {
      icon: "📈",
      title: "Vocabulary is your strongest skill",
      description: `${Math.round(vocabularyPercentage)}% mastery - well above average for your level`
    };
    if (userStats.streakDays >= 5) return {
      icon: "🌟", 
      title: "Consistent learner",
      description: `${userStats.streakDays} day streak shows great dedication`
    };
    return {
      icon: "🎵",
      title: "Music-based learning works for you",
      description: "Song-based exercises are helping you retain vocabulary better"
    };
  };

  const topInsight = getTopInsight();

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold gradient-text">
            Your Learning Journey
          </h1>
          <p className="text-xl text-text-cream300">
            Celebrating your progress with Audiora
          </p>
        </motion.div>

        {/* Your Learning Story */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-text-cream100 flex items-center gap-2">
            <Star className="w-6 h-6 text-accent-teal-400" />
            Your Learning Story
          </h2>
          <MilestoneTimeline milestones={milestones} />
        </motion.section>

        {/* This Week's Wins */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-text-cream100 flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent-teal-400" />
            This Week's Wins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6 text-center"
            >
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                Completed {userStats.completedSongs + userStats.completedQuizzes} practice sessions!
              </h3>
              <p className="text-green-300/80">Keep up the momentum!</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 rounded-xl p-6 text-center"
            >
              <div className="text-3xl mb-2">🔥</div>
              <h3 className="text-lg font-semibold text-orange-400 mb-2">
                {userStats.streakDays}-day learning streak!
              </h3>
              <p className="text-orange-300/80">{userStats.streakDays >= 5 ? "You're on fire!" : "Building consistency!"}</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 text-center"
            >
              <div className="text-3xl mb-2">📈</div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                {userStats.vocabularyCount} words learned!
              </h3>
              <p className="text-blue-300/80">Amazing progress!</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Learning Overview */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-text-cream100 flex items-center gap-2">
            <Award className="w-6 h-6 text-accent-teal-400" />
            Learning Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProgressCard
              title="Total Words"
              value={userStats.vocabularyCount}
              maxValue={Math.max(userStats.vocabularyCount + 20, 100)}
              icon={<Book className="w-5 h-5" />}
              description="Words learned"
            />
            <ProgressCard
              title="Practice Streak"
              value={userStats.streakDays}
              maxValue={7}
              icon={<Flame className="w-5 h-5" />}
              description="Days this week"
            />
            <ProgressCard
              title="Songs Completed"
              value={userStats.completedSongs}
              maxValue={Math.max(userStats.completedSongs + 2, 5)}
              icon={<Music className="w-5 h-5" />}
              description="This month"
            />
            <ProgressCard
              title="Quiz Accuracy"
              value={Math.round(userStats.averageQuizScore)}
              maxValue={100}
              icon={<Target className="w-5 h-5" />}
              description="Average score"
            />
          </div>
        </motion.section>

        {/* Skills Progress */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-text-cream100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent-teal-400" />
            Skills Progress
          </h2>
          <div className="frosted-glass border border-accent-teal-500/20 rounded-xl p-6 space-y-6">
            <SkillBar 
              skill="Vocabulary" 
              percentage={Math.round(vocabularyPercentage)} 
              isStrong={vocabularyPercentage >= 70} 
            />
            <SkillBar 
              skill="Quiz Performance" 
              percentage={Math.round(pronunciationPercentage)} 
              isStrong={pronunciationPercentage >= 80}
            />
            <SkillBar 
              skill="Listening Time" 
              percentage={Math.round(listeningPercentage)} 
              needsFocus={listeningPercentage < 30}
            />
            <SkillBar 
              skill="Consistency" 
              percentage={Math.round((userStats.streakDays / 7) * 100)} 
              needsFocus={userStats.streakDays < 3}
            />
          </div>
        </motion.section>

        {/* Practice Consistency */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-text-cream100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-accent-teal-400" />
            Practice Consistency
          </h2>
          <div className="frosted-glass border border-accent-teal-500/20 rounded-xl p-6">
            <StreakVisualizer days={weeklyStreak} currentStreak={currentStreak} />
          </div>
        </motion.section>

        {/* Insights */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-text-cream100 flex items-center gap-2">
            <Star className="w-6 h-6 text-accent-teal-400" />
            Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="frosted-glass border border-accent-teal-500/20 rounded-xl p-6"
            >
              <div className="text-2xl mb-3">{topInsight.icon}</div>
              <h3 className="text-lg font-semibold text-text-cream100 mb-2">
                {topInsight.title}
              </h3>
              <p className="text-text-cream400 text-sm">
                {topInsight.description}
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="frosted-glass border border-accent-teal-500/20 rounded-xl p-6"
            >
              <div className="text-2xl mb-3">⏰</div>
              <h3 className="text-lg font-semibold text-text-cream100 mb-2">
                Total study time
              </h3>
              <p className="text-text-cream400 text-sm">
                {userStats.totalListeningTime} minutes of focused learning
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="frosted-glass border border-accent-teal-500/20 rounded-xl p-6"
            >
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-text-cream100 mb-2">
                Mastery rate
              </h3>
              <p className="text-text-cream400 text-sm">
                {userStats.vocabularyCount > 0 
                  ? `${Math.round((userStats.masteredWords / userStats.vocabularyCount) * 100)}% of words mastered`
                  : "Start learning to see your mastery rate"
                }
              </p>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}