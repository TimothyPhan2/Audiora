import { supabase } from '../supabase';
import { translateWord } from './translations';
import { logTranslationStats } from './cache';

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