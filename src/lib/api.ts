import { supabase } from './supabase';

interface TranslationResponse {
  translation?: string;
  translations?: string[];
  error?: string;
}

interface CachedTranslation {
  translation: string;
  timestamp: number;
  expiresAt: number;
}

interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  payload: any;
  abortController: AbortController;
}

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_KEY_PREFIX = 'audiora_translation_';

// Rate limiting configuration
const REQUEST_DELAY = 200; // 200ms between requests (5 requests per second)
const MAX_CONCURRENT_REQUESTS = 3;

// Request queue and rate limiting
let requestQueue: QueuedRequest[] = [];
let activeRequests = 0;
let lastRequestTime = 0;

const TRANSLATION_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-translate`;

// Client-side caching functions
function getCacheKey(type: string, content: string, language: string): string {
  return `${CACHE_KEY_PREFIX}${type}_${language}_${btoa(content).slice(0, 50)}`;
}

function setCachedTranslation(key: string, translation: string): void {
  try {
    const cached: CachedTranslation = {
      translation,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION
    };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to cache translation:', error);
  }
}

function getCachedTranslation(key: string): string | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsedCache: CachedTranslation = JSON.parse(cached);
    
    // Check if cache has expired
    if (Date.now() > parsedCache.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return parsedCache.translation;
  } catch (error) {
    console.warn('Failed to retrieve cached translation:', error);
    return null;
  }
}

function clearExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '');
          if (now > cached.expiresAt) {
            localStorage.removeItem(key);
          }
        } catch {
          // Remove invalid cache entries
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn('Failed to clear expired cache:', error);
  }
}

// Clear expired cache on module load
clearExpiredCache();

// Enhanced API call with retry logic, rate limiting, and offline handling
async function callTranslationAPI(payload: any, abortController?: AbortController): Promise<TranslationResponse> {
  // Check if online
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('You appear to be offline. Please check your internet connection and try again.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Authentication required for translation');
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
        return await response.json();
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

// Request queue processor with rate limiting
async function processRequestQueue(): Promise<void> {
  if (requestQueue.length === 0 || activeRequests >= MAX_CONCURRENT_REQUESTS) {
    return;
  }

  // Ensure minimum delay between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    setTimeout(processRequestQueue, REQUEST_DELAY - timeSinceLastRequest);
    return;
  }

  const request = requestQueue.shift();
  if (!request) return;

  activeRequests++;
  lastRequestTime = Date.now();

  try {
    const result = await callTranslationAPI(request.payload, request.abortController);
    request.resolve(result);
  } catch (error) {
    request.reject(error);
  } finally {
    activeRequests--;
    // Process next request after delay
    setTimeout(processRequestQueue, REQUEST_DELAY);
  }
}

// Queued API call function
function queueTranslationRequest(payload: any, abortController?: AbortController): Promise<TranslationResponse> {
  return new Promise((resolve, reject) => {
    const queuedRequest: QueuedRequest = {
      resolve,
      reject,
      payload,
      abortController: abortController || new AbortController()
    };

    requestQueue.push(queuedRequest);
    processRequestQueue();
  });
}

export async function translateLyricLine(text: string, language: string, abortController?: AbortController): Promise<string> {
  const cacheKey = getCacheKey('line', text, language);
  const cached = getCachedTranslation(cacheKey);
  
  if (cached) {
    return cached;
  }

  const response = await queueTranslationRequest({
    type: 'line',
    text,
    language,
  }, abortController);

  if (response.error) {
    throw new Error(response.error);
  }

  const translation = response.translation || '';
  
  // Cache the result
  if (translation) {
    setCachedTranslation(cacheKey, translation);
  }

  return translation;
}

export async function translateWord(word: string, context: string = '', language: string, abortController?: AbortController): Promise<string> {
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

  // Check client-side cache
  const cacheKey = getCacheKey('word', `${word}_${context}`, language);
  const cached = getCachedTranslation(cacheKey);
  
  if (cached) {
    return cached;
  }

  // If not found, translate using API
  const response = await queueTranslationRequest({
    type: 'word',
    word,
    context,
    language,
  }, abortController);

  if (response.error) {
    throw new Error(response.error);
  }

  const translation = response.translation || '';

  // Cache the translation both client-side and in database
  if (translation) {
    setCachedTranslation(cacheKey, translation);
    
    // Cache in vocabulary table (don't await to avoid blocking)
    supabase
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
      .catch(error => console.warn('Failed to cache word in database:', error));
  }

  return translation;
}

export async function batchTranslateLyrics(lines: string[], language: string, abortController?: AbortController): Promise<string[]> {
  // Check cache for each line first
  const cachedTranslations: (string | null)[] = lines.map(line => {
    const cacheKey = getCacheKey('line', line, language);
    return getCachedTranslation(cacheKey);
  });

  // Find lines that need translation
  const linesToTranslate: string[] = [];
  const lineIndices: number[] = [];
  
  lines.forEach((line, index) => {
    if (!cachedTranslations[index]) {
      linesToTranslate.push(line);
      lineIndices.push(index);
    }
  });

  // If all lines are cached, return cached results
  if (linesToTranslate.length === 0) {
    return cachedTranslations as string[];
  }

  // Translate missing lines
  const response = await queueTranslationRequest({
    type: 'batch',
    lines: linesToTranslate,
    language,
  }, abortController);

  if (response.error) {
    throw new Error(response.error);
  }

  const newTranslations = response.translations || [];

  // Cache new translations
  newTranslations.forEach((translation, index) => {
    if (translation && lineIndices[index] !== undefined) {
      const originalLine = linesToTranslate[index];
      const cacheKey = getCacheKey('line', originalLine, language);
      setCachedTranslation(cacheKey, translation);
    }
  });

  // Merge cached and new translations
  const result: string[] = [];
  let newTranslationIndex = 0;

  lines.forEach((line, index) => {
    if (cachedTranslations[index]) {
      result[index] = cachedTranslations[index]!;
    } else {
      result[index] = newTranslations[newTranslationIndex] || '';
      newTranslationIndex++;
    }
  });

  return result;
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

// Utility function to cancel all pending requests
export function cancelAllTranslationRequests(): void {
  requestQueue.forEach(request => {
    request.abortController.abort();
    request.reject(new Error('Translation request was cancelled'));
  });
  requestQueue = [];
}

// Utility function to clear translation cache
export function clearTranslationCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear translation cache:', error);
  }
}