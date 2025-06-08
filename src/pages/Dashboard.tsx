import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AchievementShowcase } from '@/components/dashboard/AchievementShowcase';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Settings, 
  User,
  Play,
  BookMarked,
  Headphones,
  Flame,
  Clock,
  Volume2,
  BarChart3,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';

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
    label: "Practice",
    href: "/practice",
    icon: <Target className="text-text-cream200 h-5 w-5 flex-shrink-0" />
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
  const { user } = useAuthStore();

  const userLanguage = user?.language || 'spanish';
  const userLevel = user?.level || 'beginner';
  const userName = user?.name || 'Language Learner';

  return (
    <div className="flex h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 overflow-hidden">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo */}
            <div className="flex items-center gap-2 py-2">
              <div className="h-8 w-8 bg-gradient-to-r from-accent-teal-400 to-accent-mint-400 rounded-lg flex-shrink-0" />
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
              className="mt-6 p-4 frosted-glass rounded-xl border border-accent-teal-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-accent-teal-400 to-accent-mint-400 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-base-dark2" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-cream100 truncate">{userName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{languageFlags[userLanguage as keyof typeof languageFlags]}</span>
                    <span className="text-xs text-text-cream300 capitalize">{userLanguage}</span>
                  </div>
                </div>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${levelColors[userLevel as keyof typeof levelColors]}`}>
                {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}
              </div>
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
          className="bg-base-dark2/80 backdrop-blur-md border-b border-accent-teal-500/20 p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-cream100">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-text-cream300 mt-1">Ready to continue your language learning journey?</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-accent-teal-500/20 rounded-lg">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-medium text-text-cream100">5 day streak</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
                <div className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20 text-center">
                  <h3 className="text-lg font-semibold text-text-cream100 mb-4">Level Progress</h3>
                  <ProgressRing progress={68} size={140} />
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-text-cream300">Intermediate Level</div>
                    <div className="text-xs text-text-cream400">32% to Advanced</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                  title="Weekly Streak"
                  value="5 days"
                  icon={Flame}
                  trend={{ value: 25, isPositive: true }}
                />
                <MetricCard
                  title="Lessons Completed"
                  value="23/45"
                  subtitle="This month"
                  icon={BookOpen}
                />
                <MetricCard
                  title="Vocabulary Learned"
                  value="156"
                  subtitle="Total words"
                  icon={BookMarked}
                  trend={{ value: 12, isPositive: true }}
                />
                <MetricCard
                  title="Listening Time"
                  value="2.5h"
                  subtitle="This week"
                  icon={Headphones}
                />
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-text-cream100 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button className="button-gradient-primary text-white h-12 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Continue Learning
                </Button>
                <Button variant="outline" className="bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10 h-12 flex items-center gap-2">
                  <BookMarked className="h-4 w-4" />
                  Practice Vocabulary
                </Button>
                <Button variant="outline" className="bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10 h-12 flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Listening Exercise
                </Button>
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <MetricCard
                title="Listening Accuracy"
                value="87%"
                subtitle="Last 7 days"
                icon={Volume2}
                trend={{ value: 5, isPositive: true }}
              />
              <MetricCard
                title="Quiz Scores"
                value="92%"
                subtitle="Average"
                icon={BarChart3}
                trend={{ value: 8, isPositive: true }}
              />
              <MetricCard
                title="Speaking Practice"
                value="45min"
                subtitle="This week"
                icon={Mic}
              />
              <MetricCard
                title="Study Time"
                value="3.2h"
                subtitle="Daily average"
                icon={Clock}
                trend={{ value: 15, isPositive: true }}
              />
            </motion.div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <AchievementShowcase />
              </motion.div>

              {/* Activity Feed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <ActivityFeed />
              </motion.div>
            </div>

            {/* Audio Statistics */}
            <motion.div 
              className="frosted-glass p-6 rounded-xl border border-accent-teal-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-text-cream100 mb-4">Audio Learning Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-teal-400 mb-2">12.5h</div>
                  <div className="text-sm text-text-cream300">Total Listening Time</div>
                  <div className="text-xs text-text-cream400 mt-1">This month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-mint-400 mb-2">89%</div>
                  <div className="text-sm text-text-cream300">Pronunciation Accuracy</div>
                  <div className="text-xs text-text-cream400 mt-1">Last session</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-persian-500 mb-2">23</div>
                  <div className="text-sm text-text-cream300">Songs Completed</div>
                  <div className="text-xs text-text-cream400 mt-1">All time</div>
                </div>
              </div>
              
              {/* Audio Waveform Visualization */}
              <div className="mt-6 p-4 bg-base-dark3/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 h-16">
                  {Array.from({ length: 40 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="bg-gradient-to-t from-accent-teal-400 to-accent-mint-400 rounded-full"
                      style={{
                        width: '3px',
                        height: `${Math.random() * 60 + 10}%`,
                      }}
                      initial={{ height: '10%' }}
                      animate={{ 
                        height: `${Math.random() * 60 + 10}%`,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs text-text-cream400">Recent pronunciation practice waveform</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}