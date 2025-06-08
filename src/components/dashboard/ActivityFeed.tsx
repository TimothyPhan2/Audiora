import { motion } from 'framer-motion';
import { Music, Trophy, Target } from 'lucide-react';

interface Activity {
  id: string;
  type: 'lesson' | 'achievement' | 'practice';
  title: string;
  description: string;
  timestamp: string;
  icon: 'lesson' | 'achievement' | 'practice';
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'lesson',
    title: 'Completed "Despacito" Lesson',
    description: 'Learned 12 new vocabulary words',
    timestamp: '2 hours ago',
    icon: 'lesson'
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Earned "Music Lover" Badge',
    description: 'Completed 10 song lessons',
    timestamp: '1 day ago',
    icon: 'achievement'
  },
  {
    id: '3',
    type: 'practice',
    title: 'Pronunciation Practice',
    description: 'Practiced Spanish pronunciation for 15 minutes',
    timestamp: '2 days ago',
    icon: 'practice'
  },
  {
    id: '4',
    type: 'lesson',
    title: 'Started "La Vie En Rose"',
    description: 'French intermediate lesson',
    timestamp: '3 days ago',
    icon: 'lesson'
  }
];

const iconMap = {
  lesson: Music,
  achievement: Trophy,
  practice: Target
};

export function ActivityFeed() {
  return (
    <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20">
      <h3 className="text-lg font-semibold text-text-cream100 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {mockActivities.map((activity, index) => {
          const IconComponent = iconMap[activity.icon];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent-teal-500/5 transition-colors duration-200"
            >
              <div className="p-2 bg-accent-teal-500/20 rounded-full flex-shrink-0">
                <IconComponent className="h-4 w-4 text-accent-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-cream100">{activity.title}</div>
                <div className="text-xs text-text-cream300 mt-1">{activity.description}</div>
                <div className="text-xs text-text-cream400 mt-1">{activity.timestamp}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}