import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY');

if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

if (!elevenLabsApiKey) {
  throw new Error('ELEVEN_LABS_API_KEY is not set');
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, User-Agent',
};

// Voice configuration for ElevenLabs TTS
const LANGUAGE_VOICE_MAPPING = {
  spanish: "XfNU2rGpBa01ckF309OY",
  italian: "XfNU2rGpBa01ckF309OY", 
  german: "XfNU2rGpBa01ckF309OY",
  french: "XfNU2rGpBa01ckF309OY",
  japanese: "H6QPv2pQZDcGqLwDTIJQ",
  chinese: "6MoEUz34rbRrmmyxgRm4"
};

interface GenerateRequest {
  songId: string;
  difficulty: string;
  language: string;
  userVocabulary: Array<{
    id: string;
    word: string;
    translation: string;
    mastery_score: number;
    user_vocabulary_id: string;
  }>;
}

interface PronunciationExercise {
  word_or_phrase: string;
  phonetic_transcription: string;
  context_sentence: string;
  user_vocabulary_id?: string;
}

// Gemini API response schema
const PRONUNCIATION_EXERCISE_SCHEMA = {
  type: "object",
  properties: {
    exercises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          word_or_phrase: { 
            type: "string",
            description: "The target word/phrase to pronounce"
          },
          phonetic_transcription: { 
            type: "string",
            description: "IPA notation (if applicable)"
          },
          context_sentence: { 
            type: "string",
            description: "Example sentence using the word"
          },
          user_vocabulary_id: { 
            type: "string",
            description: "Include if word exists in user's vocabulary"
          }
        },
        required: ["word_or_phrase", "phonetic_transcription", "context_sentence"]
      },
      minItems: 5,
      maxItems: 8,
      description: "5-8 pronunciation exercises"
    }
  },
  required: ["exercises"]
};

// Helper function to call Gemini API
async function callGeminiAPI(prompt: string): Promise<{ exercises: PronunciationExercise[] }> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: PRONUNCIATION_EXERCISE_SCHEMA
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  const content = data.candidates[0].content.parts[0].text;
  return JSON.parse(content);
}

// Helper function to call ElevenLabs TTS API
async function callElevenLabsTTS(text: string, voiceId: string): Promise<ArrayBuffer> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': elevenLabsApiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      },
      output_format: 'mp3_22050_32'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  return await response.arrayBuffer();
}

// Helper function to upload audio to Supabase storage
async function uploadAudioToStorage(audioBuffer: ArrayBuffer, filename: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('pronunciation-files')
    .upload(filename, audioBuffer, {
      contentType: 'audio/mpeg',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Storage upload error: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('pronunciation-files')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

// Helper function to save exercise to database
async function saveExerciseToDatabase(
  songId: string,
  exercise: PronunciationExercise,
  audioUrl: string,
  difficulty: string,
  language: string
): Promise<string> {
  const { data, error } = await supabase
    .from('pronunciation_exercises')
    .insert({
      song_id: songId,
      word_or_phrase: exercise.word_or_phrase,
      phonetic_transcription: exercise.phonetic_transcription,
      reference_audio_url: audioUrl,
      difficulty_level: difficulty,
      language: language,
      context_sentence: exercise.context_sentence,
      user_vocabulary_id: exercise.user_vocabulary_id || null
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data.id;
}

// Helper function to format prompt for Gemini
function createPronunciationExercisePrompt(
  songTitle: string,
  artist: string,
  lyrics: string,
  language: string,
  difficulty: string,
  userVocabulary: any[]
): string {
  return `You are a pronunciation teacher creating exercises for ${language} language learners.

Song: "${songTitle}" by ${artist}
Difficulty: ${difficulty}
User's vocabulary: ${JSON.stringify(userVocabulary)}

Create 5-8 pronunciation exercises prioritizing:
1. **User's struggling words** (mastery_score < 50%)
2. **Words from song lyrics** that appear in user vocabulary
3. **Common pronunciation challenges** for this language
4. **Difficulty-appropriate phonetic patterns**

DIFFICULTY GUIDELINES:
- Beginner: Simple vocabulary, basic sounds, clear pronunciation patterns
- Intermediate: Moderate vocabulary, some challenging sounds, rhythm patterns
- Advanced: Complex vocabulary, difficult sounds, advanced pronunciation features
IMPORTANT: word_or_phrase should be SHORT - maximum 1-3 words for pronunciation practice.

For each exercise, provide:
- word_or_phrase: The target word/phrase to pronounce (from song or user vocabulary)
- phonetic_transcription: IPA notation if applicable (can be approximate)
- context_sentence: Example sentence using the word in context
- user_vocabulary_id: Include if word exists in user's vocabulary for progress tracking

- word_or_phrase: ONLY the target word or short phrase to pronounce (1-3 words max, no sentences)
- phonetic_transcription: IPA notation if applicable
- context_sentence: A separate example sentence using the word (different from word_or_phrase)
- user_vocabulary_id: Include if word exists in user's vocabulary

  EXAMPLES:
  ✅ Good word_or_phrase: "hello", "beautiful", "in love"
  ❌ Bad word_or_phrase: "She said hello to me", "I think you are beautiful";
  Return the response in JSON format matching the schema.`;
}


        
        console.log(`✅ Completed exercise ${i + 1}/${exerciseData.exercises.length} with ID: ${exerciseId}`);
      } catch (error) {
        console.error(`Error processing exercise ${i + 1}:`, error);
        // Continue with next exercise instead of failing completely
      }
    }

    console.log(`🎉 Successfully generated ${exerciseResults.length} pronunciation exercises!`);

    // Return success response with all exercises
    return new Response(JSON.stringify({ exercises: exerciseResults }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json; charset=utf-8'
      },
    });

  } catch (error) {
    console.error('Pronunciation exercise generation error:', error);
    
    let status = 500;
    let message = 'Pronunciation exercise generation failed';
    
    if (error instanceof Error) {
      if (error.message.includes('429')) {
        status = 429;
        message = 'Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        status = 401;
        message = 'Authentication failed with AI service.';
      } else {
        message = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: message,
        timestamp: new Date().toISOString(),
        status
      }),
      { 
        status, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json; charset=utf-8' 
        } 
      }
    );
  }
});