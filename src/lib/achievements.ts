import { supabase } from './supabase';

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic';
  rewards?: {
    xp?: number;
  };
}

export interface UserAchievement {
  id: string;
  achievement_type: string;
  achievement_data: any;
  earned_at: string;
  user_id: string;
}

// Streamlined achievement definitions for hackathon
export const ACHIEVEMENT_DEFINITIONS: Record<string, Achievement> = {
  first_word: {
    id: 'first_word',
    type: 'first_word',
    title: 'First Steps',
    description: 'Learn your first word',
    icon: 'star',
    rarity: 'common',
    rewards: { xp: 10 }
  },
  vocab_collector: {
    id: 'vocab_collector',
    type: 'vocab_collector',
    title: 'Word Collector',
    description: 'Learn 10 words',
    icon: 'book',
    rarity: 'common',
    rewards: { xp: 50 }
  },
  word_master: {
    id: 'word_master',
    type: 'word_master',
    title: 'Word Master',
    description: 'Learn 50 words',
    icon: 'target',
    rarity: 'rare',
    rewards: { xp: 200 }
  },
  first_quiz: {
    id: 'first_quiz',
    type: 'first_quiz',
    title: 'Quiz Rookie',
    description: 'Complete your first quiz',
    icon: 'brain',
    rarity: 'common',
    rewards: { xp: 15 }
  },
  quiz_enthusiast: {
    id: 'quiz_enthusiast',
    type: 'quiz_enthusiast',
    title: 'Quiz Enthusiast',
    description: 'Complete 5 quizzes',
    icon: 'lightbulb',
    rarity: 'common',
    rewards: { xp: 75 }
  },
  perfectionist: {
    id: 'perfectionist',
    type: 'perfectionist',
    title: 'Perfectionist',
    description: 'Score 100% on a quiz',
    icon: 'trophy',
    rarity: 'rare',
    rewards: { xp: 100 }
  },
  high_achiever: {
    id: 'high_achiever',
    type: 'high_achiever',
    title: 'High Achiever',
    description: 'Maintain 90%+ average',
    icon: 'medal',
    rarity: 'rare',
    rewards: { xp: 150 }
  },
  music_lover: {
    id: 'music_lover',
    type: 'music_lover',
    title: 'Music Lover',
    description: 'Complete your first song',
    icon: 'music',
    rarity: 'common',
    rewards: { xp: 25 }
  },
  melody_master: {
    id: 'melody_master',
    type: 'melody_master',
    title: 'Melody Master',
    description: 'Complete 5 songs',
    icon: 'headphones',
    rarity: 'rare',
    rewards: { xp: 125 }
  },
  mastery_expert: {
    id: 'mastery_expert',
    type: 'mastery_expert',
    title: 'Mastery Expert',
    description: 'Master 20 words (80%+ score)',
    icon: 'gem',
    rarity: 'epic',
    rewards: { xp: 300 }
  }
};

/**
 * Check and award achievements for a user
 */
export async function checkAndAwardAchievements(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    const { data, error } = await supabase.rpc('check_and_award_achievements', {
      p_user_id: user.id
    });

    if (error) {
      console.error('Error checking achievements:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in checkAndAwardAchievements:', error);
    return [];
  }
}

/**
 * Get user's recent achievements for dashboard display
 */
export async function getRecentAchievements(limit: number = 4): Promise<{
  achievement: Achievement;
  earnedAt: string;
}[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent achievements:', error);
    return [];
  }

  return (data || []).map(userAchievement => ({
    achievement: ACHIEVEMENT_DEFINITIONS[userAchievement.achievement_type],
    earnedAt: userAchievement.earned_at
  })).filter(item => item.achievement); // Filter out undefined achievements
}

/**
 * Get achievement stats for dashboard
 */
export async function getAchievementStats(): Promise<{
  totalEarned: number;
  totalXP: number;
  recentAchievements: { achievement: Achievement; earnedAt: string; }[];
}> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { totalEarned: 0, totalXP: 0, recentAchievements: [] };
  }

  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching achievement stats:', error);
    return { totalEarned: 0, totalXP: 0, recentAchievements: [] };
  }

  const totalEarned = data?.length || 0;
  const totalXP = (data || []).reduce((sum, userAchievement) => {
    const achievement = ACHIEVEMENT_DEFINITIONS[userAchievement.achievement_type];
    return sum + (achievement?.rewards?.xp || 0);
  }, 0);

  const recentAchievements = (data || [])
    .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 4)
    .map(userAchievement => ({
      achievement: ACHIEVEMENT_DEFINITIONS[userAchievement.achievement_type],
      earnedAt: userAchievement.earned_at
    }))
    .filter(item => item.achievement);

  return { totalEarned, totalXP, recentAchievements };
}