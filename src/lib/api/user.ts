import { supabase } from '../supabase';
import { ACHIEVEMENT_DEFINITIONS } from '../achievements';

export interface UserStats {
  vocabularyCount: number;
  completedSongs: number;
  completedQuizzes: number;
  averageQuizScore: number;
  totalListeningTime: number; // in minutes
  streakDays: number;
  totalXP: number;
  hasVocabulary: boolean;
  levelProgress: number;
  masteredWords: number;
}

export interface ActivityItem {
  id: string;
  type: 'lesson' | 'achievement' | 'practice' | 'quiz';
  title: string;
  description: string;
  timestamp: string;
  icon: 'lesson' | 'achievement' | 'practice' | 'quiz';
  metadata?: any;
}

/**
 * Get comprehensive user statistics for dashboard
 */
export async function getUserStats(): Promise<UserStats> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  try {
    // Use the existing user_learning_progress view
    const { data: progressData, error: progressError } = await supabase
      .from('user_learning_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progressError && progressError.code !== 'PGRST116') { // Ignore "not found" error
      console.error('Error fetching user progress:', progressError);
    }

    // Get vocabulary stats
    const { data: vocabularyData, error: vocabError } = await supabase
      .from('user_vocabulary')
      .select('mastery_score, times_practiced, last_practiced_at')
      .eq('user_id', user.id);

    if (vocabError) {
      console.error('Error fetching vocabulary data:', vocabError);
    }

    // Get quiz results for average score
    const { data: quizData, error: quizError } = await supabase
      .from('user_quiz_results')
      .select('score, time_taken_seconds, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (quizError) {
      console.error('Error fetching quiz data:', quizError);
    }

    // Get song progress for listening time
    const { data: songData, error: songError } = await supabase
      .from('user_song_progress')
      .select('play_time_seconds, completed, last_played_at')
      .eq('user_id', user.id);

    if (songError) {
      console.error('Error fetching song data:', songError);
    }

    // Calculate stats
    const vocabularyCount = vocabularyData?.length || 0;
    const completedSongs = progressData?.songs_completed || 0;
    const completedQuizzes = progressData?.quizzes_passed || 0;
    const averageQuizScore = quizData && quizData.length > 0 
      ? Math.round(quizData.reduce((sum, quiz) => sum + quiz.score, 0) / quizData.length)
      : 0;
    
    const totalListeningTime = songData 
      ? Math.round(songData.reduce((sum, song) => sum + (song.play_time_seconds || 0), 0) / 60)
      : 0;

    const masteredWords = vocabularyData
      ? vocabularyData.filter(word => (word.mastery_score || 0) >= 80).length
      : 0;

    // Calculate streak (simplified - count days with activity in last 30 days)
    const streakDays = calculateUserStreak(quizData || [], songData || [], vocabularyData || []);

    // Calculate level progress
    const levelProgress = calculateLevelProgress(vocabularyCount, completedSongs, completedQuizzes, averageQuizScore);

    return {
      vocabularyCount,
      completedSongs,
      completedQuizzes,
      averageQuizScore,
      totalListeningTime,
      streakDays,
      totalXP: 0, // Will be populated by achievements
      hasVocabulary: vocabularyCount > 0,
      levelProgress,
      masteredWords
    };

  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

/**
 * Calculate user's learning streak based on activity
 */
function calculateUserStreak(quizData: any[], songData: any[], vocabularyData: any[]): number {
  const now = new Date();
  const activeDays = new Set<string>();

  // Add quiz activity days
  quizData?.forEach(quiz => {
    const date = new Date(quiz.created_at).toDateString();
    activeDays.add(date);
  });

  // Add song activity days
  songData?.forEach(song => {
    if (song.last_played_at) {
      const date = new Date(song.last_played_at).toDateString();
      activeDays.add(date);
    }
  });

  // Add vocabulary practice days
  vocabularyData?.forEach(vocab => {
    if (vocab.last_practiced_at) {
      const date = new Date(vocab.last_practiced_at).toDateString();
      activeDays.add(date);
    }
  });

  // Calculate consecutive days from today backwards
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - i);
    const dateString = checkDate.toDateString();
    
    if (activeDays.has(dateString)) {
      streak++;
    } else if (i > 0) { // Don't break on first day (today) if no activity
      break;
    }
  }

  return streak;
}

/**
 * Calculate sophisticated level progress based on multiple factors
 */
function calculateLevelProgress(vocabularyCount: number, completedSongs: number, completedQuizzes: number, averageScore: number): number {
  // Weighted scoring system
  const vocabularyPoints = vocabularyCount * 2;
  const songPoints = completedSongs * 5;
  const quizPoints = completedQuizzes * 3;
  const scoreBonus = averageScore > 80 ? Math.floor(averageScore / 10) : 0;
  
  const totalPoints = vocabularyPoints + songPoints + quizPoints + scoreBonus;
  
  // Level thresholds (more sophisticated than before)
  const levelThresholds = {
    beginner: 100,
    intermediate: 300,
    advanced: 600,
    fluent: 1000
  };

  // Calculate progress within current level
  if (totalPoints <= levelThresholds.beginner) {
    return Math.min((totalPoints / levelThresholds.beginner) * 100, 100);
  } else if (totalPoints <= levelThresholds.intermediate) {
    return Math.min(((totalPoints - levelThresholds.beginner) / (levelThresholds.intermediate - levelThresholds.beginner)) * 100, 100);
  } else if (totalPoints <= levelThresholds.advanced) {
    return Math.min(((totalPoints - levelThresholds.intermediate) / (levelThresholds.advanced - levelThresholds.intermediate)) * 100, 100);
  } else {
    return Math.min(((totalPoints - levelThresholds.advanced) / (levelThresholds.fluent - levelThresholds.advanced)) * 100, 100);
  }
}

/**
 * Get recent user activity for activity feed
 */
export async function getUserActivity(limit: number = 10): Promise<ActivityItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  try {
    const activities: ActivityItem[] = [];

    // Get recent quiz completions
    const { data: quizResults, error: quizError } = await supabase
      .from('user_quiz_results')
      .select(`
        id,
        score,
        created_at,
        quiz:quizzes(title),
        passed
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!quizError && quizResults) {
      quizResults.forEach(result => {
        activities.push({
          id: result.id,
          type: 'quiz',
          title: `${result.passed ? 'Passed' : 'Completed'} "${result.quiz[0]?.title || 'Quiz'}"`,
          description: `Score: ${result.score}%`,
          timestamp: formatRelativeTime(result.created_at),
          icon: 'quiz',
          metadata: { score: result.score, passed: result.passed }
        });
      });
    }

    // Get recent song completions
    const { data: songProgress, error: songError } = await supabase
      .from('user_song_progress')
      .select(`
        id,
        completed,
        completion_percentage,
        last_played_at,
        song:songs(title, artist)
      `)
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('last_played_at', { ascending: false })
      .limit(5);

    if (!songError && songProgress) {
      songProgress.forEach(progress => {
        activities.push({
          id: progress.id,
          type: 'lesson',
          title: `Completed "${progress.song[0]?.title || 'Song'}"`,
          description: `by ${progress.song[0]?.artist || 'Unknown Artist'}`,
          timestamp: formatRelativeTime(progress.last_played_at),
          icon: 'lesson',
          metadata: { completion: progress.completion_percentage }
        });
      });
    }

    // Get recent achievements
    const { data: achievements, error: achievementError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(5);

    if (!achievementError && achievements) {
      achievements.forEach(achievement => {
        const achievementData = ACHIEVEMENT_DEFINITIONS[achievement.achievement_type];
        if (achievementData) {
          activities.push({
            id: achievement.id,
            type: 'achievement',
            title: `Earned "${achievementData.title}"`,
            description: achievementData.description,
            timestamp: formatRelativeTime(achievement.earned_at),
            icon: 'achievement',
            metadata: { rarity: achievementData.rarity, xp: achievementData.rewards?.xp }
          });
        }
      });
    }

    // Get recent vocabulary additions (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: recentVocab, error: vocabError } = await supabase
      .from('user_vocabulary')
      .select(`
        id,
        created_at,
        vocabulary:vocabulary(word, translation)
      `)
      .eq('user_id', user.id)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    if (!vocabError && recentVocab && recentVocab.length > 0) {
      // Group vocabulary by day
      const vocabByDay = recentVocab.reduce((acc, vocab) => {
        const day = new Date(vocab.created_at).toDateString();
        if (!acc[day]) acc[day] = [];
        acc[day].push(vocab);
        return acc;
      }, {} as Record<string, any[]>);

      // Create activity entries for each day
      Object.entries(vocabByDay).forEach(([day, words]) => {
        activities.push({
          id: `vocab-${day}`,
          type: 'practice',
          title: 'Vocabulary Practice',
          description: `Learned ${words.length} new word${words.length > 1 ? 's' : ''}`,
          timestamp: formatRelativeTime(words[0].created_at),
          icon: 'practice',
          metadata: { wordCount: words.length, words: words.map(w => w.vocabulary?.word) }
        });
      });
    }

    // Sort all activities by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

  } catch (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
} 