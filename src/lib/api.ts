https://cdn.jsdelivr.net/gh/TimothyPhan2/Audiora@783981a647f1242daa8f93692b1727a0946b010c/src/lib/api.ts

// Generate listening exercise for a song
export async function generateListeningExercise(songId: string, language: string, difficulty: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User must be logged in to generate listening exercises');
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

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate listening exercise');
  }

  return result.data;
}

// Update user vocabulary progress
export async function updateUserVocabularyProgress(
  vocabularyData: {