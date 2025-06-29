import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Book, Target, Brain, Lightbulb, Medal, Music, Headphones, Gem, Lock } from 'lucide-react';
import { getAchievementStats, Achievement, ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements';

const iconMap = {
  star: Star,
  book: Book,
  target: Target,
  brain: Brain,
  lightbulb: Lightbulb,
  trophy: Trophy,
  medal: Medal,
  music: Music,
  headphones: Headphones,
  gem: Gem
};

const rarityColors = {
  common: 'from-blue-400 to-blue-600',
  rare: 'from-purple-400 to-purple-600',
  epic: 'from-yellow-400 to-yellow-600'
};

// Show these achievements first for new users
const priorityAchievements = ['first_word', 'music_lover', 'first_quiz', 'vocab_collector'];

export function DashboardAchievements() {
  const [stats, setStats] = useState<{
    totalEarned: number;
    totalXP: number;
    recentAchievements: { achievement: Achievement; earnedAt: string; }[];
  }>({ totalEarned: 0, totalXP: 0, recentAchievements: [] });

  useEffect(() => {
    loadAchievementStats();
  }, []);

  const loadAchievementStats = async () => {
    try {
      const data = await getAchievementStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load achievement stats:', error);
    }
  };

  // Get achievements to display
  const achievementsToShow = stats.recentAchievements.length > 0 
    ? stats.recentAchievements 
    : priorityAchievements.map(id => ({
        achievement: ACHIEVEMENT_DEFINITIONS[id],
        earnedAt: '',
        isLocked: true
      }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-text-cream100">
            {stats.recentAchievements.length > 0 ? 'Recent Achievements' : 'Available Achievements'}
          </h3>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{stats.totalEarned}</div>
            <div className="text-text-cream400">Earned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent-teal-400">{stats.totalXP}</div>
            <div className="text-text-cream400">XP</div>
          </div>
        </div>
      </div>

      {stats.recentAchievements.length === 0 && (
        <div className="text-center mb-4 p-3 bg-base-dark3/30 rounded-lg">
          <div className="text-text-cream300 text-sm">
            🏆 Start learning to unlock your first achievements!
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {achievementsToShow.map((item, index) => {
          const IconComponent = iconMap[item.achievement.icon as keyof typeof iconMap] || Star;
          const colorClass = rarityColors[item.achievement.rarity];
          const isLocked = 'isLocked' in item && item.isLocked;
          
          return (
            <motion.div
              key={`${item.achievement.id}-${item.earnedAt || 'locked'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg text-center border transition-all duration-300 ${
                isLocked 
                  ? 'bg-base-dark3/30 border-accent-teal-500/10 hover:border-accent-teal-500/20' 
                  : 'bg-base-dark3/50 border-accent-teal-500/10'
              }`}
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center relative ${
                isLocked ? 'bg-base-dark3/50' : `bg-gradient-to-r ${colorClass}`
              }`}>
                {isLocked ? (
                  <>
                    <IconComponent className="w-4 h-4 text-text-cream400" />
                    <Lock className="w-3 h-3 text-text-cream500 absolute -bottom-1 -right-1 bg-base-dark2 rounded-full p-0.5" />
                  </>
                ) : (
                  <IconComponent className="w-5 h-5 text-white" />
                )}
              </div>
              <div className={`text-xs font-medium mb-1 ${
                isLocked ? 'text-text-cream300' : 'text-text-cream100'
              }`}>
                {item.achievement.title}
              </div>
              <div className={`text-xs ${
                isLocked ? 'text-text-cream500' : 'text-text-cream400'
              }`}>
                {isLocked ? item.achievement.description : new Date(item.earnedAt).toLocaleDateString()}
              </div>
              {item.achievement.rewards?.xp && (
                <div className={`text-xs mt-1 ${
                  isLocked ? 'text-text-cream500' : 'text-yellow-400'
                }`}>
                  {isLocked ? `${item.achievement.rewards.xp} XP` : `+${item.achievement.rewards.xp} XP`}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {stats.recentAchievements.length === 0 && (
        <div className="mt-4 text-center">
          <div className="text-xs text-text-cream400">
            Complete lessons, quizzes, and songs to earn achievements and XP!
          </div>
        </div>
      )}
    </motion.div>
  );
}