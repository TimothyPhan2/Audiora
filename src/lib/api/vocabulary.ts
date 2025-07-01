import { supabase } from '../supabase';
import { checkAndAwardAchievements, ACHIEVEMENT_DEFINITIONS } from '../achievements';
import { toast } from 'sonner';
import { translateWord } from './translations';

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
      .maybeSingle();
    
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