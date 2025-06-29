import { supabase } from './supabase';
import { checkAndAwardAchievements, ACHIEVEMENT_DEFINITIONS } from './achievements';

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

// Database persistence test function
export async function testDatabasePersistence(): Promise<void> {
  console.log('🧪 Testing database persistence...');
  
  // Test vocabulary table
  const testWord = 'テスト' + Date.now();
  const testTranslation = 'test_' + Date.now();
  
  console.log('1. Testing vocabulary table insert...');
  const { data: vocabResult, error: vocabError } = await supabase
    .from('vocabulary')
    .upsert({
      word: testWord,
      language: 'japanese',
      translation: testTranslation,
      difficulty_level: 'beginner',
      is_premium: false
    }, {
      onConflict: 'word,language'
    })
    .select()
    .single();
    
  if (vocabError) {
    console.error('❌ Vocabulary insert FAILED:', vocabError);
    console.error('❌ Error details:', JSON.stringify(vocabError, null, 2));
  } else {
    console.log('✅ Vocabulary insert SUCCESS:', vocabResult);
  }
  
  // Test lyrics table update (get first available lyric)
  console.log('2. Testing lyrics table update...');
  const { data: firstLyric } = await supabase
    .from('lyrics')
    .select('id')
    .limit(1)
    .single();
    
  if (firstLyric) {
    const { error: lyricsError } = await supabase
      .from('lyrics')
      .update({ translation: 'Test translation ' + Date.now() })
      .eq('id', firstLyric.id);
      
    if (lyricsError) {
      console.error('❌ Lyrics update FAILED:', lyricsError);
      console.error('❌ Error details:', JSON.stringify(lyricsError, null, 2));
    } else {
      console.log('✅ Lyrics update SUCCESS');
    }
  } else {
    console.log('⚠️ No lyrics found to test update');
  }
  
  console.log('🧪 Database persistence test complete!');
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

  // Calculate difficulty level based on word characteristics
  const calculateDifficultyLevel = (word: string, language: string): 'beginner' | 'intermediate' | 'advanced' | 'fluent' => {
    const cleanWord = word.toLowerCase().trim();
    const wordLength = cleanWord.length;
    
    // Common beginner words (manually curated for major languages)
    const beginnerWords = {
      spanish: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'pero', 'todo', 'bien', 'más', 'muy', 'aquí', 'ahora', 'casa', 'agua', 'amor', 'vida', 'tiempo', 'día', 'año', 'hola', 'adiós', 'sí', 'gracias'],
      french: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'en', 'une', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'bonjour', 'merci', 'oui', 'non', 'eau', 'pain', 'maison', 'temps', 'jour', 'année'],
      italian: ['il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'con', 'del', 'da', 'a', 'al', 'le', 'si', 'dei', 'sul', 'una', 'su', 'per', 'tra', 'nel', 'da', 'casa', 'acqua', 'pane', 'tempo', 'giorno', 'anno', 'ciao', 'grazie', 'sì', 'no'],
      german: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'sein', 'wurde', 'sei', 'in', 'hallo', 'danke', 'ja', 'nein', 'wasser', 'haus', 'zeit', 'tag', 'jahr'],
      japanese: ['は', 'の', 'が', 'を', 'に', 'で', 'と', 'から', 'まで', 'より', 'こんにちは', 'ありがとう', 'はい', 'いいえ', 'みず', 'いえ', 'じかん', 'ひ', 'とし', 'わたし', 'あなた', 'これ', 'それ', 'あれ', 'ここ', 'そこ', 'あそこ', 'いま', 'きょう', 'あした', 'きのう'],
      chinese: ['我', '你', '他', '她', '的', '是', '在', '有', '和', '不', '这', '那', '了', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '好', '吃', '喝', '看', '听', '说', '走', '来', '去', '大', '小', '多', '少', '什么', '哪里', '谁', '怎么', '为什么', '今天', '明天', '昨天', '现在', '家', '水', '饭', '人', '朋友', '爱', '喜欢', '谢谢', '你好', '再见', '对不起', '没关系'],
      korean: ['나', '너', '그', '그녀', '의', '이', '그', '저', '은', '는', '을', '를', '에', '에서', '와', '과', '하고', '안', '못', '아니다', '있다', '없다', '하다', '되다', '오다', '가다', '보다', '듣다', '말하다', '먹다', '마시다', '좋다', '나쁘다', '크다', '작다', '많다', '적다', '뭐', '어디', '누구', '어떻게', '왜', '언제', '오늘', '내일', '어제', '지금', '집', '물', '밥', '사람', '친구', '사랑', '좋아하다', '감사합니다', '안녕하세요', '안녕히 가세요', '죄송합니다', '괜찮아요']
    };
    
    const langBeginnerWords = beginnerWords[language.toLowerCase() as keyof typeof beginnerWords] || [];
    
    // Check if it's a common beginner word
    if (langBeginnerWords.includes(cleanWord)) {
      return 'beginner';
    }
    
    // Length-based classification with language-specific adjustments
    if (language.toLowerCase() === 'japanese' || language.toLowerCase() === 'chinese' || language.toLowerCase() === 'mandarin') {
      // For character-based languages, use character count
      if (wordLength <= 2) return 'beginner';
      if (wordLength <= 4) return 'intermediate';
      if (wordLength <= 6) return 'advanced';
      return 'fluent';
    } else {
      // For alphabetic languages, use letter count
      if (wordLength <= 3) return 'beginner';
      if (wordLength <= 6) return 'intermediate';
      if (wordLength <= 9) return 'advanced';
      return 'fluent';
    }
  };

  const difficultyLevel = calculateDifficultyLevel(word, language);

  // First ensure the word exists in the vocabulary table
  const { data: vocabularyItem, error: vocabError } = await supabase
    .from('vocabulary')
    .upsert({
      word: word.toLowerCase(),
      language,
      translation,
      difficulty_level: difficultyLevel,
      is_premium: false,
    }, {
      onConflict: 'word,language'
    })
    .select('id, usage_count')
    .maybeSingle();

  if (vocabError) {
    throw new Error('Failed to add word to vocabulary: ' + vocabError.message);
  }

  if (!vocabularyItem) {
    throw new Error('Failed to create vocabulary item');
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
  const currentUsageCount = vocabularyItem.usage_count || 0;
  await supabase
    .from('vocabulary')
    .update({ usage_count: currentUsageCount + 1 })
    .eq('id', vocabularyItem.id);
}

/**
 * Updates user vocabulary mastery based on practice results
 * Consolidated function that handles both new and existing vocabulary using server-side upserts
 */
export async function updateUserVocabularyProgress(
  vocabularyItem: { 
    word: string; 
    translation?: string; // Made optional - will fetch if not provided
    user_vocabulary_entry_id?: string; // For priority lookup
    language: string;
    songId?: string;
    difficulty_level?: string;
  }, 
  knewIt: boolean
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update vocabulary progress');
  }

  console.log('🔄 Processing vocabulary update:', { 
    word: vocabularyItem.word, 
    knewIt, 
    user_vocabulary_entry_id: vocabularyItem.user_vocabulary_entry_id 
  });

  // Step 1: Ensure base vocabulary entry exists, fetch translation if needed
  let translation = vocabularyItem.translation;
  if (!translation) {
    console.log('🔍 No translation provided, fetching from database or API...');
    
    // Try to fetch from existing vocabulary table first
    const { data: existingVocab } = await supabase
      .from('vocabulary')
      .select('translation')
      .eq('word', vocabularyItem.word.toLowerCase())
      .eq('language', vocabularyItem.language)
      .single();
    
    if (existingVocab?.translation) {
      translation = existingVocab.translation;
      console.log('✅ Found existing translation:', translation);
    } else {
      // Fallback to translation API
      try {
        translation = await translateWord(vocabularyItem.word, '', vocabularyItem.language);
        console.log('✅ Generated new translation:', translation);
      } catch (error) {
        console.warn('⚠️ Translation failed, using empty string');
        translation = '';
      }
    }
  }

  // Step 2: Upsert vocabulary entry
  const { data: vocabData, error: vocabError } = await supabase
    .from('vocabulary')
    .upsert({
      word: vocabularyItem.word.toLowerCase(),
      language: vocabularyItem.language,
      translation: translation,
      difficulty_level: vocabularyItem.difficulty_level || 'intermediate',
      is_premium: false,
    }, {
      onConflict: 'word,language'
    })
    .select('id')
    .single();

  if (vocabError) {
    console.error('❌ Failed to upsert vocabulary entry:', vocabError);
    throw new Error('Failed to create vocabulary entry: ' + vocabError.message);
  }

  if (!vocabData) {
    throw new Error('Failed to create vocabulary entry: No data returned.');
  }

  console.log('✅ Vocabulary entry ready. Vocab ID:', vocabData.id);

  // Step 3: Fetch current user_vocabulary progress
  // Priority: user_vocabulary_entry_id > user_id + vocabulary_id lookup
  let currentProgress = null;
  
  if (vocabularyItem.user_vocabulary_entry_id && vocabularyItem.user_vocabulary_entry_id !== 'null') {
    console.log('🔍 Looking up by user_vocabulary_entry_id:', vocabularyItem.user_vocabulary_entry_id);
    const { data } = await supabase
      .from('user_vocabulary')
      .select('times_practiced, times_correct, mastery_score')
      .eq('id', vocabularyItem.user_vocabulary_entry_id)
      .single();
    currentProgress = data;
  } else {
    console.log('🔍 Looking up by user_id + vocabulary_id');
    const { data } = await supabase
      .from('user_vocabulary')
      .select('times_practiced, times_correct, mastery_score')
      .eq('user_id', user.id)
      .eq('vocabulary_id', vocabData.id)
      .single();
    currentProgress = data;
  }

  // Step 4: Calculate new progress values
  const currentTimesPracticed = currentProgress?.times_practiced || 0;
  const currentTimesCorrect = currentProgress?.times_correct || 0;
  
  const newTimesPracticed = currentTimesPracticed + 1;
  const newTimesCorrect = currentTimesCorrect + (knewIt ? 1 : 0);
  const newMasteryScore = Math.round((newTimesCorrect / newTimesPracticed) * 100);

  console.log('📊 Progress calculation:', {
    previous: { practiced: currentTimesPracticed, correct: currentTimesCorrect },
    new: { practiced: newTimesPracticed, correct: newTimesCorrect, mastery: newMasteryScore }
  });

  // Step 5: Upsert user_vocabulary entry
  const { error: upsertError } = await supabase
    .from('user_vocabulary')
    .upsert({
      user_id: user.id,
      vocabulary_id: vocabData.id,
      mastery_score: newMasteryScore,
      times_practiced: newTimesPracticed,
      times_correct: newTimesCorrect,
      last_practiced_at: new Date().toISOString(),
      learned_from_song_id: vocabularyItem.songId
    }, {
      onConflict: 'user_id,vocabulary_id'
    });

  if (upsertError) {
    console.error('❌ Failed to upsert user_vocabulary:', upsertError);
    throw new Error('Failed to update user vocabulary progress: ' + upsertError.message);
  }

  const isNewEntry = currentTimesPracticed === 0;
  console.log(`✅ ${isNewEntry ? 'Added new' : 'Updated existing'} user vocabulary: ${newMasteryScore}% mastery (${newTimesCorrect}/${newTimesPracticed})`);

  // Check for new achievements after vocabulary update
  try {
    const newAchievements = await checkAndAwardAchievements();
    
    // Trigger achievement notifications if any new achievements were earned
    if (newAchievements.length > 0) {
      // Emit custom event for achievement notifications
      window.dispatchEvent(new CustomEvent('achievementsEarned', {
        detail: newAchievements.map(type => ACHIEVEMENT_DEFINITIONS[type])
      }));
    }
  } catch (error) {
    console.error('Error checking achievements after vocabulary update:', error);
  }
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
        window.dispatchEvent(new CustomEvent('achievementsEarned', {
          detail: newAchievements.map(type => ACHIEVEMENT_DEFINITIONS[type])
        }));
      }
    } catch (error) {
      console.error('Error checking achievements after quiz completion:', error);
    }
    
  } catch (error) {
    console.error('Error in saveQuizResultToDatabase:', error);
    throw error;
  }
}

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
