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
const VOICE_CONFIG = {
  // Nichalia Schwartz - Multilingual European voice
  "XfNU2rGpBa01ckF309OY": {
    name: "Nichalia Schwartz",
    languages: ["spanish", "italian", "german", "french"],
  },
  
  // Manav - Chinese voice  
  "6MoEUz34rbRrmmyxgRm4": {
    name: "Manav", 
    languages: ["chinese"],
  },
  // Jhenny - Japanese voice
  "D9MdulIxfrCUUJcGNQon": {
    name: "Jhenny", 
    languages: ["japanese"],
  }
};

const LANGUAGE_VOICE_MAPPING = {
  spanish: "XfNU2rGpBa01ckF309OY",
  italian: "XfNU2rGpBa01ckF309OY", 
  german: "XfNU2rGpBa01ckF309OY",
  french: "XfNU2rGpBa01ckF309OY",
  japanese: "D9MdulIxfrCUUJcGNQon",
  chinese: "6MoEUz34rbRrmmyxgRm4"
};

// TypeScript interfaces
interface ListeningExerciseRequest {
  songId: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lyrics?: string;
  title?: string;
}

interface GeminiExerciseResponse {
  exercises: Array<{
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    audio_transcript: string;
  }>;
}

interface ListeningExerciseResponse {
  success: boolean;
  data?: Array<{
    id: string;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    audio_url: string;
    difficulty_level: string;
  }>;
  error?: string;
}

// Gemini API response schema
const LISTENING_EXERCISE_SCHEMA = {
  type: "object",
  properties: {
    exercises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { 
            type: "string",
            description: "The listening comprehension question"
          },
          options: { 
            type: "array", 
            items: { type: "string" },
            minItems: 4,
            maxItems: 4,
            description: "Exactly 4 multiple choice options"
          },
          correct_answer: { 
            type: "string",
            description: "The correct answer from the options"
          },
          explanation: { 
            type: "string",
            description: "Explanation of why the answer is correct"
          },
          audio_transcript: { 
            type: "string",
            description: "Short audio text in target language (3-5 seconds when spoken, roughly 5-8 words)"
          }
        },
        required: ["question", "options", "correct_answer", "explanation", "audio_transcript"]
      },
      minItems: 5,
      maxItems: 5,
      description: "Exactly 5 listening exercises"
    }
  },
  required: ["exercises"]
};

// Helper function to call Gemini API
async function callGeminiAPI(prompt: string): Promise<GeminiExerciseResponse> {
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
        responseSchema: LISTENING_EXERCISE_SCHEMA
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
        similarity_boost: 0.5,
        style: 0.0,
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
    .from('listening-files')
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
    .from('listening-files')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

// Helper function to save exercise to database
async function saveExerciseToDatabase(
  songId: string,
  exercise: {
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    audio_transcript: string;
  },
  audioUrl: string,
  difficulty: string
): Promise<string> {
  const { data, error } = await supabase
    .from('listening_exercises')
    .insert({
      song_id: songId,
      question: exercise.question,
      options: exercise.options,
      correct_answer: exercise.correct_answer,
      explanation: exercise.explanation,
      audio_url: audioUrl,
      difficulty_level: difficulty
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data.id;
}

// Helper function to format prompt for Gemini
function createListeningExercisePrompt(
  title: string,
  lyrics: string,
  language: string,
  difficulty: string
): string {
  return `You are an expert language learning instructor creating listening comprehension exercises.

TASK: Create 5 listening exercises based on the song "${title}" in ${language}.

SONG LYRICS:
${lyrics}

DIFFICULTY LEVEL: ${difficulty}

REQUIREMENTS:
1. Create a listening comprehension question about the song content
2. Provide exactly 4 multiple choice options (A, B, C, D)
3. Specify the correct answer
4. Provide a clear explanation
5. Generate a short audio transcript (3-5 seconds when spoken) in ${language} that relates to the song

DIFFICULTY GUIDELINES:
- Beginner: Simple vocabulary, basic grammar, clear pronunciation cues
- Intermediate: Moderate vocabulary, some idiomatic expressions, cultural context
- Advanced: Complex vocabulary, advanced grammar, nuanced cultural references

AUDIO TRANSCRIPT GUIDELINES:
- Should be 3-5 seconds when spoken aloud
- Roughly 5-8 words (varies by language)
- Must be in ${language}
- Should relate to the song's theme or content
- Appropriate for ${difficulty} level learners
- Clear and pronounceable

Return the response in JSON format matching the schema.`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Authorization required', { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response('Invalid token', { status: 401, headers: corsHeaders });
    }

    // Parse request body
    const requestData: ListeningExerciseRequest = await req.json();
    const { songId, language, difficulty, lyrics, title } = requestData;

    // Validate required fields
    if (!songId || !language || !difficulty) {
      return new Response('Missing required fields: songId, language, difficulty', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Validate difficulty level
    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return new Response('Invalid difficulty level', { status: 400, headers: corsHeaders });
    }

    // Get voice ID for the language
    const voiceId = LANGUAGE_VOICE_MAPPING[language as keyof typeof LANGUAGE_VOICE_MAPPING];
    if (!voiceId) {
      return new Response(`Unsupported language: ${language}`, { status: 400, headers: corsHeaders });
    }

    // Fetch song data if not provided
    let songLyrics = lyrics;
    let songTitle = title;
    
    if (!songLyrics || !songTitle) {
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select(`
          title,
          lyrics (text)
        `)
        .eq('id', songId)
        .single();

      if (songError || !songData) {
        return new Response('Song not found', { status: 404, headers: corsHeaders });
      }

      songTitle = songData.title;
      songLyrics = songData.lyrics?.map((l: any) => l.text).join('\n') || '';
    }

    if (!songLyrics) {
      return new Response('No lyrics available for this song', { status: 400, headers: corsHeaders });
    }

    console.log(`🎧 Generating 5 listening exercise for song: ${songTitle} (${language}, ${difficulty})`);

    // Step 1: Generate exercise content with Gemini
    const prompt = createListeningExercisePrompt(songTitle, songLyrics, language, difficulty);
    const exerciseData = await callGeminiAPI(prompt);

    console.log(`✅ Generated ${exerciseData.exercises.length} exercises`);

   // Step 2-4: Process each exercise
    const exerciseResults: Array<{
      id: string;
      question: string;
      options: string[];
      correct_answer: string;
      explanation: string;
      audio_url: string;
      difficulty_level: string;
    }> = [];

    for (let i = 0; i < geminiResponse.exercises.length; i++) {
      const exercise = geminiResponse.exercises[i];
      
      console.log(`🎵 Processing exercise ${i + 1}: "${exercise.audio_transcript}"`);
      
      // Generate audio for this exercise
      const audioBuffer = await callElevenLabsTTS(exercise.audio_transcript, voiceId);
      
      // Upload audio to storage with unique filename
      const filename = `listening-exercise-${songId}-${i + 1}-${crypto.randomUUID()}.mp3`;
      const audioUrl = await uploadAudioToStorage(audioBuffer, filename);
      
      console.log(`📁 Uploaded audio ${i + 1} to storage: ${filename}`);
      
      // Save exercise to database  
      const exerciseId = await saveExerciseToDatabase(songId, exercise, audioUrl, difficulty);
      
      // Add to results
      exerciseResults.push({
        id: exerciseId,
        question: exercise.question,
        options: exercise.options,
        correct_answer: exercise.correct_answer,
        explanation: exercise.explanation,
        audio_url: audioUrl,
        difficulty_level: difficulty
      });
      
      console.log(`✅ Completed exercise ${i + 1}/${geminiResponse.exercises.length} with ID: ${exerciseId}`);
    }

    console.log(`🎉 Successfully generated ${exerciseResults.length} listening exercises!`);

    // Return success response with all exercises
    const response: ListeningExerciseResponse = {
      success: true,
      data: exerciseResults
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json; charset=utf-8'
      },
    });

  } catch (error) {
    console.error('Listening exercise generation error:', error);
    
    let status = 500;
    let message = 'Listening exercise generation failed';
    
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
    
    const errorResponse: ListeningExerciseResponse = {
      success: false,
      error: message
    };
    
    return new Response(
      JSON.stringify(errorResponse),
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