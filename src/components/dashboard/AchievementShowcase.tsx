import { motion } from 'framer-motion';
import { Trophy, Star, Target, Music, Flame, Award } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'star',
    earned: true
  },
  {
    id: '2',
    title: 'Music Lover',
    description: 'Complete 10 song lessons',
    icon: 'music',
    earned: true
  },
  {
    id: '3',
    title: 'Streak Master',
    description: 'Maintain a 7-day learning streak',
    icon: 'flame',
    earned: false,
    progress: 5,
    maxProgress: 7
  },
  {
    id: '4',
    title: 'Vocabulary Builder',
    description: 'Learn 100 new words',
    icon: 'target',
    earned: false,
    progress: 67,
    maxProgress: 100
  }
];

const iconMap = {
  star: Star,
  music: Music,
  flame: Flame,
  target: Target,
  trophy: Trophy,
  award: Award
};

export function AchievementShowcase() {
  return (
    <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20">
      <h3 className="text-lg font-semibold text-text-cream100 mb-4">Achievements</h3>
      <div className="grid grid-cols-2 gap-4">
        {mockAchievements.map((achievement, index) => {
          const IconComponent = iconMap[achievement.icon as keyof typeof iconMap];
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                achievement.earned
                  ? 'bg-accent-teal-500/10 border-accent-teal-400/30 hover:border-accent-teal-400/50'
                  : 'bg-base-dark3/30 border-accent-teal-500/10 hover:border-accent-teal-500/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-full ${
                  achievement.earned 
                    ? 'bg-accent-teal-500/20' 
                    : 'bg-base-dark3/50'
                }`}>
                  <IconComponent className={`h-4 w-4 ${
                    achievement.earned 
                      ? 'text-accent-teal-400' 
                      : 'text-text-cream400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${
                    achievement.earned 
                      ? 'text-text-cream100' 
                      : 'text-text-cream300'
                  }`}>
                    {achievement.title}
                  </div>
                </div>
              </div>
              <div className={`text-xs ${
                achievement.earned 
                  ? 'text-text-cream300' 
                  : 'text-text-cream400'
              }`}>
                {achievement.description}
              </div>
              {!achievement.earned && achievement.progress && achievement.maxProgress && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-text-cream400 mb-1">
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                    <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                  </div>
                  <div className="w-full bg-base-dark3/50 rounded-full h-1.5">
                    <motion.div
                      className="bg-gradient-to-r from-accent-teal-400 to-accent-mint-400 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}