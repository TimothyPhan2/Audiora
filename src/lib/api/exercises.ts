import { supabase } from '../supabase';

/**
 * Generate a listening exercise for a song using Gemini AI and ElevenLabs TTS
 */
export async function generateListeningExercise(songId: string, language: string, difficulty: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User must be logged in');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/listening-exercise-generator`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      songId,
      language,
      difficulty
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate listening exercise: ${errorText}`);
  }

  return await response.json();
}

/**
 * Check if cached listening exercises exist for a song and difficulty
 */
export async function fetchCachedListeningExercises(
  songId: string, 
  difficulty: string
): Promise<any[] | null> {
  try {
    console.log('🔍 Checking for cached listening exercises:', songId, difficulty);
    
    const { data: exercises, error } = await supabase
      .from('listening_exercises')
      .select('*')
      .eq('song_id', songId)
      .eq('difficulty_level', difficulty)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching cached exercises:', error);
      return null;
    }
    
    if (!exercises || exercises.length === 0) {
      console.log('📝 No cached exercises found');
      return null;
    }
    
    console.log('✅ Found', exercises.length, 'cached exercises');
    
    // Format to match expected ListeningExerciseData interface
    return exercises.map(exercise => ({
      id: exercise.id,
      audio_url: exercise.audio_url,
      question: exercise.question,
      options: exercise.options,
      correct_answer: exercise.correct_answer,
      explanation: exercise.explanation,
      difficulty_level: exercise.difficulty_level
    }));
    
  } catch (error) {
    console.error('Error in fetchCachedListeningExercises:', error);
    return null;
  }
}

/**
 * Check if any listening exercises exist for a song (any difficulty)
 * Used to avoid unnecessary API calls when exercises exist
 */
export async function checkListeningExercisesExist(songId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('listening_exercises')
      .select('id')
      .eq('song_id', songId)
      .limit(1);
    
    if (error) {
      console.error('Error checking exercise existence:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkListeningExercisesExist:', error);
    return false;
  }
}

// =====================================================
// PRONUNCIATION EXERCISE FUNCTIONS
// =====================================================

export async function generatePronunciationExercises(
  songId: string, 
  difficulty: string, 
  language: string, 
  userVocabulary: any[]
) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User must be logged in');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pronunciation-exercise-generator`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      songId,
      difficulty,
      language,
      userVocabulary
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate pronunciation exercises: ${errorText}`);
  }

  const data = await response.json();
  return data.exercises;
}

export async function fetchCachedPronunciationExercises(songId: string, difficulty: string) {
  const { data, error } = await supabase
    .from('pronunciation_exercises')
    .select('*')
    .eq('song_id', songId)
    .eq('difficulty_level', difficulty)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function savePronunciationResult(result: {
  pronunciation_exercise_id: string;
  transcribed_text: string;
  accuracy_score: number;
  feedback: string;
  user_audio_url?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_pronunciation_results')
    .insert({
      user_id: user.id,
      ...result
    });

  if (error) throw error;
  return data;
}

// 🔒 SECURE: Eleven Labs STT via Edge Function (no frontend API key)
export async function transcribeAudioWithElevenLabs(audioBlob: Blob): Promise<{
  text: string;
  confidence?: number;
}> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User must be logged in');
  }

  const formData = new FormData();
  // Convert Blob to File with proper filename and MIME type
  const audioFile = new File([audioBlob], 'recording.webm', { 
    type: audioBlob.type || 'audio/webm' 
  });
  formData.append('audio', audioFile);

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pronunciation-stt-processor`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to transcribe audio: ${errorText}`);
  }

  const result = await response.json();
  return {
    text: result.text,
    confidence: result.confidence
  };
} 