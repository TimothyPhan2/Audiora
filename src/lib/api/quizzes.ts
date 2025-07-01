import { supabase } from '../supabase';
import { checkAndAwardAchievements, ACHIEVEMENT_DEFINITIONS } from '../achievements';
import { toast } from 'sonner';

// =====================================================
// QUIZ MANAGEMENT FUNCTIONS
// =====================================================

export interface QuizData {
  title: string;
  description?: string;
  quiz_type: 'vocabulary' | 'listening' | 'comprehension' | 'pronunciation' | 'mixed';
  time_limit_seconds?: number;
  passing_score?: number;
  max_attempts?: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question_type: 'multiple_choice' | 'fill_in_blank' | 'matching' | 'listening' | 'pronunciation' | 'true_false';
  question_text: string;
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  audio_url?: string;
  points?: number;
  order_index?: number;
}

export interface QuizResult {
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  submitted_answers: Record<string, any>;
  passed: boolean;
}

/**
 * Check if a quiz already exists for a given song
 */
export async function fetchQuizForSong(songId: string): Promise<any | null> {
  try {
    console.log('🔍 Checking for existing quiz for song:', songId);
    
    // First check if quiz exists using the helper function
    const { data: quizExists, error: checkError } = await supabase
      .rpc('quiz_exists_for_song', { song_uuid: songId });
    
    if (checkError) {
      console.error('Error checking quiz existence:', checkError);
      return null;
    }
    
    if (!quizExists) {
      console.log('📝 No existing quiz found for song');
      return null;
    }
    
    // Get quiz details using the helper function
    const { data: quizData, error: quizError } = await supabase
      .rpc('get_quiz_by_song', { song_uuid: songId });
    
    if (quizError || !quizData || quizData.length === 0) {
      console.error('Error fetching quiz data:', quizError);
      return null;
    }
    
    const quiz = quizData[0];
    
    // Fetch quiz questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz.quiz_id)
      .order('order_index', { ascending: true });
    
    if (questionsError) {
      console.error('Error fetching quiz questions:', questionsError);
      return null;
    }
    
    console.log('✅ Found existing quiz with', questions?.length || 0, 'questions');
    
    return {
      id: quiz.quiz_id,
      title: quiz.quiz_title,
      description: quiz.quiz_description,
      quiz_type: quiz.quiz_type,
      time_limit_seconds: quiz.time_limit_seconds,
      passing_score: quiz.passing_score,
      max_attempts: quiz.max_attempts,
      questions: questions || []
    };
    
  } catch (error) {
    console.error('Error in fetchQuizForSong:', error);
    return null;
  }
}

/**
 * Save a generated quiz to the database
 */
export async function saveGeneratedQuizToDatabase(quizData: QuizData, songData: any): Promise<string> {
  try {
    console.log('💾 Saving generated quiz to database for song:', songData.title);
    
    // Insert quiz into quizzes table
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: quizData.title || `Practice Quiz: ${songData.title}`,
        description: quizData.description || `Interactive quiz for ${songData.title} by ${songData.artist}`,
        quiz_type: quizData.quiz_type || 'mixed',
        song_id: songData.id,
        time_limit_seconds: quizData.time_limit_seconds || null,
        passing_score: quizData.passing_score || 70,
        max_attempts: quizData.max_attempts || 3,
        is_published: true
      })
      .select('id')
      .single();
    
    if (quizError) {
      console.error('Error inserting quiz:', quizError);
      throw new Error('Failed to save quiz: ' + quizError.message);
    }
    
    const quizId = quiz.id;
    console.log('✅ Quiz saved with ID:', quizId);
    
    // Insert quiz questions
    const questionsToInsert = quizData.questions.map((question, index) => ({
      quiz_id: quizId,
      question_type: question.question_type,
      question_text: question.question_text,
      options: question.options ? JSON.stringify(question.options) : null,
      correct_answer: JSON.stringify(question.correct_answer),
      explanation: question.explanation || null,
      audio_url: question.audio_url || null,
      points: question.points || 1,
      order_index: question.order_index || index
    }));
    
    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert);
    
    if (questionsError) {
      console.error('Error inserting quiz questions:', questionsError);
      // Try to clean up the quiz if questions failed
      await supabase.from('quizzes').delete().eq('id', quizId);
      throw new Error('Failed to save quiz questions: ' + questionsError.message);
    }
    
    console.log('✅ Quiz questions saved successfully');
    return quizId;
    
  } catch (error) {
    console.error('Error in saveGeneratedQuizToDatabase:', error);
    throw error;
  }
}

/**
 * Save quiz result to database
 */
export async function saveQuizResultToDatabase(
  quizId: string,
  score: number,
  totalQuestions: number,
  timeTakenSeconds: number,
  submittedAnswers: Record<string, any>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️ User not authenticated, skipping quiz result save');
      return;
    }
    
    console.log('💾 Saving quiz result for user:', user.id);
    
    // Calculate score percentage
    const scorePercentage = Math.round((score / totalQuestions) * 100);
    
    // Get quiz passing score to determine if passed
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('passing_score')
      .eq('id', quizId)
      .single();
    
    if (quizError) {
      console.error('Error fetching quiz for passing score:', quizError);
      throw new Error('Failed to determine quiz passing score');
    }
    
    const passingScore = quiz.passing_score || 70;
    const passed = scorePercentage >= passingScore;
    
    // Check if user has already taken this quiz
    const { data: existingResult, error: checkError } = await supabase
      .from('user_quiz_results')
      .select('id, attempts')
      .eq('user_id', user.id)
      .eq('quiz_id', quizId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing quiz results:', checkError);
      throw new Error('Failed to check existing quiz results');
    }
    
    if (existingResult) {
      // Update existing result with new attempt
      const { error: updateError } = await supabase
        .from('user_quiz_results')
        .update({
          score: scorePercentage,
          attempts: (existingResult.attempts || 1) + 1,
          time_taken_seconds: timeTakenSeconds,
          submitted_answers: submittedAnswers,
          passed: passed,
          created_at: new Date().toISOString()
        })
        .eq('id', existingResult.id);
      
      if (updateError) {
        console.error('Error updating quiz result:', updateError);
        throw new Error('Failed to update quiz result: ' + updateError.message);
      }
    } else {
      // Insert new result
      const { error: insertError } = await supabase
        .from('user_quiz_results')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score: scorePercentage,
          attempts: 1,
          time_taken_seconds: timeTakenSeconds,
          submitted_answers: submittedAnswers,
          passed: passed
        });
      
      if (insertError) {
        console.error('Error inserting quiz result:', insertError);
        throw new Error('Failed to save quiz result: ' + insertError.message);
      }
    }
    
    console.log('✅ Quiz result saved successfully');
    
    // Check for new achievements after quiz completion
    try {
      const newAchievements = await checkAndAwardAchievements();
      
      if (newAchievements.length > 0) {
        // Show toast notifications for each new achievement
        newAchievements.forEach(type => {
          const achievement = ACHIEVEMENT_DEFINITIONS[type];
          if (achievement) {
            toast.success(`🏆 Achievement Unlocked!`, {
              description: `${achievement.title} - ${achievement.description}${achievement.rewards?.xp ? ` (+${achievement.rewards.xp} XP)` : ''}`,
              duration: 5000,
            });
          }
        });
      }
    } catch (error) {
      console.error('Error checking achievements after quiz completion:', error);
    }
    
  } catch (error) {
    console.error('Error in saveQuizResultToDatabase:', error);
    throw error;
  }
} 