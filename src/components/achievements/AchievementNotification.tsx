import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { Achievement } from '@/lib/achievements';
import { Button } from '@/components/ui/button';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  isVisible: boolean;
  onClose: () => void;
}

export function AchievementNotification({ 
  achievement, 
  isVisible, 
  onClose 
}: AchievementNotificationProps) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-1 rounded-xl shadow-2xl">
            <div className="bg-base-dark2 rounded-lg p-6 relative max-w-sm">
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-text-cream300 hover:text-text-cream100"
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-base-dark2" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-text-cream100">
                    Achievement Unlocked!
                  </h3>
                  <p className="text-text-cream200 font-medium">
                    {achievement.title}
                  </p>
                  <p className="text-text-cream300 text-sm">
                    {achievement.description}
                  </p>
                  {achievement.rewards?.xp && (
                    <p className="text-yellow-400 text-sm font-medium">
                      +{achievement.rewards.xp} XP
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}