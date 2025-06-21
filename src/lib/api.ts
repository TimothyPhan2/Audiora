import { supabase } from './supabase';

interface TranslationResponse {
  translation?: string;
  translations?: string[];
  error?: string;
}

const TRANSLATION_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-translate`;

async function callTranslationAPI(payload: any): Promise<TranslationResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Authentication required for translation');
  }

  const response = await fetch(TRANSLATION_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Translation API error: ${response.status}`);
  }

  return response.json();
}

export async function translateLyricLine(text: string, language: string): Promise<string> {
  const response = await callTranslationAPI({
    type: 'line',
    text,
    language,
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.translation || '';
}

export async function translateWord(word: string, context: string = '', language: string): Promise<string> {
  // First check if word already exists in vocabulary table
  const { data: existingWord } = await supabase
    .from('vocabulary')
    .select('translation')
    .eq('word', word.toLowerCase())
    .eq('language', language)
    .single();

  if (existingWord?.translation) {
    return existingWord.translation;
  }

  // If not found, translate using API
  const response = await callTranslationAPI({
    type: 'word',
    word,
    context,
    language,
  });

  if (response.error) {
    throw new Error(response.error);
  }

  const translation = response.translation || '';

  // Cache the translation in vocabulary table
  if (translation) {
    await supabase
      .from('vocabulary')
      .upsert({
        word: word.toLowerCase(),
        language,
        translation,
        difficulty_level: 'intermediate', // Default level
        is_premium: false,
      }, {
        onConflict: 'word,language'
      });
  }

  return translation;
}

export async function batchTranslateLyrics(lines: string[], language: string): Promise<string[]> {
  const response = await callTranslationAPI({
    type: 'batch',
    lines,
    language,
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.translations || [];
}

export async function addWordToVocabulary(word: string, translation: string, language: string, songId?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to add vocabulary');
  }

  // First ensure the word exists in the vocabulary table
  const { data: vocabularyItem, error: vocabError } = await supabase
    .from('vocabulary')
    .upsert({
      word: word.toLowerCase(),
      language,
      translation,
      difficulty_level: 'intermediate',
      is_premium: false,
    }, {
      onConflict: 'word,language'
    })
    .select('id')
    .single();

  if (vocabError) {
    throw new Error('Failed to add word to vocabulary: ' + vocabError.message);
  }

  // Then add to user's personal vocabulary
  const { error: userVocabError } = await supabase
    .from('user_vocabulary')
    .upsert({
      user_id: user.id,
      vocabulary_id: vocabularyItem.id,
      learned_from_song_id: songId,
      mastery_score: 0,
      times_practiced: 0,
      times_correct: 0,
    }, {
      onConflict: 'user_id,vocabulary_id'
    });

  if (userVocabError) {
    throw new Error('Failed to add word to user vocabulary: ' + userVocabError.message);
  }

  // Update usage count
  await supabase
    .from('vocabulary')
    .update({ usage_count: vocabularyItem.usage_count + 1 })
    .eq('id', vocabularyItem.id);
}

export async function removeWordFromVocabulary(vocabularyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to remove vocabulary');
  }

  const { error } = await supabase
    .from('user_vocabulary')
    .delete()
    .eq('user_id', user.id)
    .eq('vocabulary_id', vocabularyId);

  if (error) {
    throw new Error('Failed to remove word from vocabulary: ' + error.message);
  }
}

export async function getUserVocabulary(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_vocabulary')
    .select(`
      id,
      mastery_score,
      times_practiced,
      times_correct,
      last_practiced_at,
      vocabulary:vocabulary_id (
        id,
        word,
        language,
        translation,
        difficulty_level
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Failed to fetch user vocabulary:', error);
    return [];
  }

  return data || [];
}