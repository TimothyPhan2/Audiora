import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Book, Target, Brain, Lightbulb, Medal, Music, Headphones, Gem } from 'lucide-react';
import { getAchievementStats, Achievement } from '@/lib/achievements';

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

  if (stats.recentAchievements.length === 0) {
    return null; // Don't show section if no achievements
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-text-cream100">Recent Achievements</h3>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.recentAchievements.map((item, index) => {
          const IconComponent = iconMap[item.achievement.icon as keyof typeof iconMap] || Star;
          const colorClass = rarityColors[item.achievement.rarity];
          
          return (
            <motion.div
              key={`${item.achievement.id}-${item.earnedAt}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-base-dark3/50 p-3 rounded-lg text-center border border-accent-teal-500/10"
            >
              <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-medium text-text-cream100 mb-1">
                {item.achievement.title}
              </div>
              <div className="text-xs text-text-cream400">
                {new Date(item.earnedAt).toLocaleDateString()}
              </div>
              {item.achievement.rewards?.xp && (
                <div className="text-xs text-yellow-400 mt-1">
                  +{item.achievement.rewards.xp} XP
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}