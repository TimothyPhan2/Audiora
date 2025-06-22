import { supabase } from './supabase';

interface TranslationResponse {
  translation?: string;
  translations?: string[];
  error?: string;
}

// Debug function to track API usage
let apiCallCount = 0;
export function logTranslationStats() {
  console.log(`🔍 Translation Stats:
    - API Calls Made: ${apiCallCount}
    - Cache Size: ${translationCache.size}
    - Cache Keys: ${Array.from(translationCache.keys()).slice(0, 5).join(', ')}...
  `);
}

// In-memory cache for translations
const translationCache = new Map<string, string>();

const TRANSLATION_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-translate`;

// Unicode-safe cache key generation
function getCacheKey(type: string, content: string, language: string): string {
  // Create a simple hash from the content for cache key
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `translation_${type}_${language}_${Math.abs(hash).toString(36).slice(0, 10)}`;
}

// Enhanced API call with retry logic and request cancellation
async function callTranslationAPI(type: string, content: string, language: string, abortController?: AbortController): Promise<string> {
  apiCallCount++; // Increment counter
  console.log(`🔥 API CALL #${apiCallCount} - Type: ${type}, Content: ${content.slice(0, 20)}...`);

  // Check if online
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('You appear to be offline. Please check your internet connection and try again.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Authentication required for translation');
  }

  // Prepare payload based on type
  let payload: any;
  switch (type) {
    case 'word':
      payload = { type: 'word', word: content, language };
      break;
    case 'line':
      payload = { type: 'line', text: content, language };
      break;
    default:
      throw new Error(`Unsupported translation type: ${type}`);
  }

  // Implement exponential backoff for retries
  const maxRetries = 3;
  const initialDelay = 1000;
  const maxDelay = 8000;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(TRANSLATION_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: abortController?.signal,
      });

      if (response.ok) {
        const result: TranslationResponse = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }
        return result.translation || '';
      }

      // Handle rate limiting and server errors with retry
      if (response.status === 429 || response.status >= 500) {
        const errorData = await response.json().catch(() => ({}));
        lastError = new Error(errorData.error || `API error: ${response.status}`);
        
        if (attempt < maxRetries) {
          const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
          console.log(`Retrying translation request in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // Non-retryable error
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Translation API error: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Translation request was cancelled');
      }
      
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      
      if (attempt < maxRetries && !abortController?.signal.aborted) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        console.log(`Retrying translation request in ${delay}ms due to error: ${lastError.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError;
}

export async function translateLyricLine(text: string, language: string, abortController?: AbortController): Promise<string> {
  const cacheKey = getCacheKey('line', text, language);
  
  // Check memory cache first
  if (translationCache.has(cacheKey)) {
    console.log('🎯 Cache HIT for line:', text.slice(0, 30) + '...');
    return translationCache.get(cacheKey)!;
  }

  // Call API only if not cached
  console.log('🔥 API CALL for line:', text.slice(0, 30) + '...');
  try {
    const translation = await callTranslationAPI('line', text, language, abortController);
    
    // Cache the result
    translationCache.set(cacheKey, translation);
    
    return translation;
  } catch (error) {
    console.error('Translation failed for line:', text.slice(0, 30), error);
    return text; // Return original text as fallback
  }
}

export async function translateWord(word: string, context: string = '', language: string, abortController?: AbortController): Promise<string> {
  const cacheKey = getCacheKey('word', word, language);
  
  // Check memory cache first
  if (translationCache.has(cacheKey)) {
    console.log('🎯 Cache HIT for word:', word);
    return translationCache.get(cacheKey)!;
  }

  // Check database cache
  const { data: cached } = await supabase
    .from('vocabulary')
    .select('translation')
    .eq('word', word.toLowerCase())
    .eq('language', language)
    .single();

  if (cached?.translation) {
    console.log('💾 DB Cache HIT for word:', word);
    translationCache.set(cacheKey, cached.translation);
    return cached.translation;
  }

  // Call API only if not cached
  console.log('🔥 API CALL for word:', word);
  try {
    const translation = await callTranslationAPI('word', word, language, abortController);
    
    // Cache the result
    translationCache.set(cacheKey, translation);
    
    // Store in database (non-blocking)
    supabase.from('vocabulary').upsert({
      word: word.toLowerCase(),
      translation: translation,
      language: language,
      difficulty_level: 'intermediate',
      is_premium: false,
    }, {
      onConflict: 'word,language'
    }).catch(err => console.warn('Failed to cache word:', err));
    
    return translation;
  } catch (error) {
    console.error('Translation failed for word:', word, error);
    return word; // Return original word as fallback
  }
}

export async function batchTranslateLyrics(lyrics: string[], language: string, abortController?: AbortController): Promise<string[]> {
  console.log('🚀 Starting batch translation for', lyrics.length, 'lines');
  
  const results = await Promise.all(lyrics.map(async (line, index) => {
    const cacheKey = getCacheKey('line', line, language);
    
    if (translationCache.has(cacheKey)) {
      console.log(`✅ Line ${index + 1} cached`);
      return translationCache.get(cacheKey)!;
    }

    console.log(`🔥 Line ${index + 1} needs API call`);
    try {
      const translated = await callTranslationAPI('line', line, language, abortController);
      translationCache.set(cacheKey, translated);
      return translated;
    } catch (error) {
      console.error(`Failed to translate line ${index + 1}:`, error);
      return line; // Fallback to original
    }
  }));
  
  logTranslationStats(); // Show usage stats
  return results;
}

// Test function - call this from console to verify caching
export async function testTranslationCaching() {
  console.log('🧪 Testing translation caching...');
  
  // Test Japanese word
  const word = 'こんにちは';
  console.log('First call (should hit API):');
  const result1 = await translateWord(word, '', 'japanese');
  
  console.log('Second call (should hit cache):');
  const result2 = await translateWord(word, '', 'japanese');
  
  console.log('Results match:', result1 === result2);
  logTranslationStats();
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