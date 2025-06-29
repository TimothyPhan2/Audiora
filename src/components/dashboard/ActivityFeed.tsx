import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Trophy, Target, Brain } from 'lucide-react';
import { getUserActivity, ActivityItem } from '@/lib/api';

const iconMap = {
  lesson: Music,
  achievement: Trophy,
  practice: Target,
  quiz: Brain
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setIsLoading(true);
        const userActivity = await getUserActivity(8);
        setActivities(userActivity);
      } catch (err) {
        console.error('Failed to fetch user activity:', err);
        setError('Failed to load recent activity');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (isLoading) {
    return (
      <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20">
        <h3 className="text-lg font-semibold text-text-cream100 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-accent-teal-500/20 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-accent-teal-500/20 rounded w-3/4" />
                <div className="h-3 bg-accent-teal-500/10 rounded w-1/2" />
                <div className="h-3 bg-accent-teal-500/10 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20">
        <h3 className="text-lg font-semibold text-text-cream100 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <div className="text-text-cream400 mb-2">⚠️ Unable to load activity</div>
          <div className="text-xs text-text-cream500">{error}</div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20">
        <h3 className="text-lg font-semibold text-text-cream100 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎵</div>
          <div className="text-text-cream300 mb-2">Start your learning journey!</div>
          <div className="text-xs text-text-cream400">
            Complete lessons, take quizzes, or practice vocabulary to see your activity here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20">
      <h3 className="text-lg font-semibold text-text-cream100 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const IconComponent = iconMap[activity.icon];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent-teal-500/5 transition-colors duration-200"
            >
              <div className={`p-2 rounded-full flex-shrink-0 ${
                activity.type === 'achievement' ? 'bg-yellow-500/20' :
                activity.type === 'quiz' ? 'bg-blue-500/20' :
                'bg-accent-teal-500/20'
              }`}>
                <IconComponent className={`h-4 w-4 ${
                  activity.type === 'achievement' ? 'text-yellow-400' :
                  activity.type === 'quiz' ? 'text-blue-400' :
                  'text-accent-teal-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-cream100">{activity.title}</div>
                <div className="text-xs text-text-cream300 mt-1">{activity.description}</div>
                <div className="text-xs text-text-cream400 mt-1 flex items-center gap-2">
                  <span>{activity.timestamp}</span>
                  {activity.metadata?.score && (
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      activity.metadata.score >= 80 ? 'bg-green-500/20 text-green-400' :
                      activity.metadata.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {activity.metadata.score}%
                    </span>
                  )}
                  {activity.metadata?.xp && (
                    <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">
                      +{activity.metadata.xp} XP
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}