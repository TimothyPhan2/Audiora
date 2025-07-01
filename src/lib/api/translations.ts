import { supabase } from '../supabase';
import { getCacheKey, translationCache, incrementApiCallCount, logTranslationStats } from './cache';

interface TranslationResponse {
  translation?: string;
  translations?: string[];
  error?: string;
}

const TRANSLATION_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-translate`;

// Enhanced API call with retry logic and request cancellation
async function callTranslationAPI(type: string, content: string, language: string, abortController?: AbortController): Promise<string> {
  incrementApiCallCount(); // Increment counter
  console.log(`🔥 API CALL - Type: ${type}, Content: ${content.slice(0, 20)}...`);

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
  let lastError: Error = new Error('Translation failed');

  // Enhanced request headers with proper content negotiation
  const headers = {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'User-Agent': 'Audiora/1.0'
  };

  console.log('📤 Request Headers:', headers);
  console.log('📤 Request Payload:', JSON.stringify(payload, null, 2));

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Create timeout controller for this attempt
    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Request timeout after 30 seconds');
      controller.abort();
    }, 30000); // 30 second timeout

    try {
      const response = await fetch(TRANSLATION_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Enhanced response debugging
      console.log('🔍 Response Debug:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok,
        url: response.url
      });

      // Clone response for debugging before consuming it
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      console.log('📄 Raw Response Body:', responseText);

      // Enhanced response validation
      if (response.status >= 200 && response.status < 300) {
        // Check content type
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error('❌ Unexpected content type:', contentType);
          throw new Error(`Expected JSON response, got: ${contentType}. Response: ${responseText.slice(0, 200)}`);
        }

        try {
          const result: TranslationResponse = await response.json();
          console.log('✅ Parsed JSON Result:', result);
          
          if (result.error) {
            console.error('❌ API returned error in JSON:', result.error);
            throw new Error(result.error);
          }
          
          if (!result.translation) {
            console.warn('⚠️ No translation in response:', result);
            return '';
          }
          
          return result.translation;
        } catch (jsonError) {
          console.error('❌ JSON parsing failed:', jsonError);
          console.error('❌ Response text was:', responseText);
          throw new Error(`Failed to parse translation response: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'}`);
        }
      }

      // Specific handling for 406 errors
      if (response.status === 406) {
        console.error('❌ 406 Not Acceptable - Check Accept headers');
        console.error('❌ 406 Response body:', responseText);
        throw new Error(`Server cannot produce acceptable response format. Response: ${responseText}`);
      }

      // Handle rate limiting and server errors with retry
      if (response.status === 429 || response.status >= 500) {
        try {
          const errorData = await response.json();
          lastError = new Error(errorData.error || `API error: ${response.status}`);
        } catch {
          lastError = new Error(`API error: ${response.status} - ${responseText}`);
        }
        
        if (attempt < maxRetries) {
          const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
          console.log(`Retrying translation request in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // Non-retryable error
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Translation API error: ${response.status}`);
        } catch {
          throw new Error(`Translation API error: ${response.status} - ${responseText}`);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
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

// Add database persistence function for lyrics translations
export async function saveLyricsTranslations(lyrics: Array<{id: string, translation: string}>): Promise<void> {
  console.log('💾 Saving lyrics translations to database...');
  
  for (const lyric of lyrics) {
    const { error } = await supabase
      .from('lyrics')
      .update({ translation: lyric.translation })
      .eq('id', lyric.id);
      
    if (error) {
      console.error('❌ Failed to save lyric translation:', lyric.id, error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Saved lyric translation:', lyric.id);
    }
  }
}

// Debouncing for word hover tooltips
const wordTranslationDebounce = new Map<string, NodeJS.Timeout>();

export async function translateWordDebounced(
  word: string, 
  context: string = '', 
  language: string, 
  delay: number = 800
): Promise<string> {
  const cacheKey = getCacheKey('word', word, language);
  
  // Check cache first (immediate)
  if (translationCache.has(cacheKey)) {
    console.log('🎯 Cache HIT for debounced word:', word);
    return translationCache.get(cacheKey)!;
  }
  
  // Debounce API calls
  return new Promise((resolve) => {
    const debounceKey = `${word}_${language}`;
    
    // Clear existing timeout
    if (wordTranslationDebounce.has(debounceKey)) {
      clearTimeout(wordTranslationDebounce.get(debounceKey)!);
    }
    
    // Set new timeout
    const timeoutId = setTimeout(async () => {
      try {
        const result = await translateWord(word, context, language);
        resolve(result);
      } catch (error) {
        console.error('Debounced translation failed:', error);
        resolve(word); // Fallback
      }
      wordTranslationDebounce.delete(debounceKey);
    }, delay);
    
    wordTranslationDebounce.set(debounceKey, timeoutId);
  });
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

export async function translateWord(word: string, _context: string = '', language: string, abortController?: AbortController): Promise<string> {
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
    .maybeSingle();

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
    
    // Only cache the translation, NO automatic database save
    // Database saves only happen when user explicitly clicks "Add to Vocab"
    
    return translation;
  } catch (error) {
    console.error('Translation failed for word:', word, error);
    return word; // Return original word as fallback
  }
}

export async function batchTranslateLyrics(lyrics: string[], language: string, lyricIds?: string[], abortController?: AbortController): Promise<string[]> {
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
  
  // Save translations to database if lyric IDs provided
  if (lyricIds && lyricIds.length === results.length) {
    const lyricsToSave = results.map((translation, index) => ({
      id: lyricIds[index],
      translation
    }));
    
    try {
      await saveLyricsTranslations(lyricsToSave);
    } catch (error) {
      console.error('❌ Failed to save lyrics batch to database:', error);
    }
  }
  
  logTranslationStats(); // Show usage stats
  return results;
} 