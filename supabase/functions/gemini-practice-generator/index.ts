import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

// CORS headers (match existing functions)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, User-Agent',
};

// Request interface
interface PracticeRequest {
  songId: string;
  practiceType: 'vocabulary' | 'quiz';
  userProficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Fluent';
  targetLanguage: string;
  lyrics?: string;
  userVocabulary?: Array<{word: string, translation: string, mastery_score: number}>;
}

// Response schemas for Gemini
const VOCABULARY_SCHEMA = {
  type: "object",
  properties: {
    vocabulary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          word: { type: "string" },
          translation: { type: "string" },
          example_sentence: { type: "string" },
          difficulty_level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          part_of_speech: { type: "string" }
        },
        required: ["word", "translation", "example_sentence", "difficulty_level", "part_of_speech"]
      }
    }
  },
  required: ["vocabulary"]
};

const QUIZ_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correct_answer: { type: "string" },
          explanation: { type: "string" },
          difficulty_level: { type: "string" },
          question_type: { type: "string", enum: ["vocabulary", "grammar", "comprehension"] }
        },
        required: ["question", "options", "correct_answer", "explanation", "difficulty_level", "question_type"]
      }
    }
  },
  required: ["questions"]
};

// System Prompts
const VOCABULARY_PROMPT = `You are an expert language learning instructor specializing in music-based language acquisition. Your role is to extract and enhance vocabulary from song lyrics for language learners.

TASK: Generate vocabulary cards from the provided song lyrics.

CONTEXT:
- User's proficiency level: {proficiencyLevel}
- Target language: {targetLanguage}
- Song lyrics: {lyrics}
- User's existing vocabulary knowledge: {userVocabulary}

REQUIREMENTS:
1. Extract 8-12 meaningful words from the song lyrics
2. Prioritize words that appear in the song but avoid basic articles/prepositions
3. Include words slightly above the user's current level for growth
4. Avoid words the user already has high mastery (>80%) unless they're key to the song
5. Provide clear, contextual translations
6. Create example sentences using the word in the song's context/theme
7. Assign appropriate difficulty levels based on user's proficiency

DIFFICULTY MAPPING:
- Beginner: Common words, basic vocabulary, present tense
- Intermediate: Idiomatic expressions, past/future tenses, cultural references
- Advanced: Abstract concepts, complex grammar, poetic language

Return the response in JSON format matching the vocabulary schema.`;

const QUIZ_PROMPT = `You are an expert language assessment designer specializing in music-based language learning. Your role is to create engaging, contextual quizzes from song content.

TASK: Generate a 5-question quiz based on the provided song lyrics.

CONTEXT:
- User's proficiency level: {proficiencyLevel}
- Target language: {targetLanguage}
- Song lyrics: {lyrics}
- Focus on both vocabulary and cultural understanding

REQUIREMENTS:
1. Create exactly 5 questions with 4 multiple choice options each
2. Question distribution: 60% vocabulary, 40% comprehension/grammar
3. All questions and answers in English for accessibility
4. Reference specific lyrics or song themes
5. Include cultural context when relevant
6. Difficulty appropriate for user's proficiency level
7. Provide educational explanations for each answer

QUESTION TYPES:
- Vocabulary: "What does [word from song] mean?"
- Grammar: "What verb tense is used in [lyric excerpt]?"
- Comprehension: "What cultural theme does this song represent?"
- Context: "In the lyric [excerpt], what emotion is being expressed?"

Return the response in JSON format matching the quiz schema.`;

// Helper function to call Gemini API
async function callGeminiAPI(prompt: string, schema: any): Promise<any> {
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
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: schema
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

// Helper function to format prompt with variables
function formatPrompt(template: string, variables: Record<string, any>): string {
  let formatted = template;
  for (const [key, value] of Object.entries(variables)) {
    formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }
  return formatted;
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
    const requestData: PracticeRequest = await req.json();
    const { 
      songId, 
      practiceType, 
      userProficiencyLevel, 
      targetLanguage, 
      lyrics = '', 
      userVocabulary = [] 
    } = requestData;

    // Validate required fields
    if (!songId || !practiceType || !userProficiencyLevel || !targetLanguage) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders });
    }

    // Fetch song data if lyrics not provided
    let songLyrics = lyrics;
    if (!songLyrics) {
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select(`
          title,
          artist,
          lyrics:lyrics(text)
        `)
        .eq('id', songId)
        .single();

      if (songError || !songData) {
        return new Response('Song not found', { status: 404, headers: corsHeaders });
      }

      songLyrics = songData.lyrics?.map((l: any) => l.text).join('\n') || '';
    }

    let result: any;
    let prompt: string;
    let schema: any;

    // Generate content based on practice type
    if (practiceType === 'vocabulary') {
      prompt = formatPrompt(VOCABULARY_PROMPT, {
        proficiencyLevel: userProficiencyLevel,
        targetLanguage: targetLanguage,
        lyrics: songLyrics,
        userVocabulary: JSON.stringify(userVocabulary)
      });
      schema = VOCABULARY_SCHEMA;
    } else if (practiceType === 'quiz') {
      prompt = formatPrompt(QUIZ_PROMPT, {
        proficiencyLevel: userProficiencyLevel,
        targetLanguage: targetLanguage,
        lyrics: songLyrics
      });
      schema = QUIZ_SCHEMA;
    } else {
      return new Response('Invalid practice type', { status: 400, headers: corsHeaders });
    }

    // Call Gemini API
    result = await callGeminiAPI(prompt, schema);

    // Return generated content
    return new Response(JSON.stringify({
      ...result,
      songId,
      practiceType,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json; charset=utf-8'
      },
    });

  } catch (error) {
    console.error('Practice generation error:', error);
    
    let status = 500;
    let message = 'Practice content generation failed';
    
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