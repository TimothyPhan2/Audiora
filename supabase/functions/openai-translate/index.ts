import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY is not set');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface TranslateRequest {
  type: 'line' | 'word' | 'batch';
  text?: string;
  lines?: string[];
  word?: string;
  context?: string;
  language?: string;
  targetLanguage?: string;
}

async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in song lyrics and poetry. Provide natural, contextually appropriate translations that maintain the emotional tone and meaning of the original text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
}

async function translateLyricLine(text: string, language: string, targetLanguage: string = 'english'): Promise<string> {
  const prompt = `Translate this ${language} song lyric line to ${targetLanguage}. Maintain the poetic and emotional meaning:

"${text}"

Provide only the translation, no explanations.`;

  return await callOpenAI(prompt);
}

async function translateWord(word: string, context: string = '', language: string, targetLanguage: string = 'english'): Promise<string> {
  const contextPart = context ? `\nContext: "${context}"` : '';
  const prompt = `Translate this ${language} word to ${targetLanguage}:

Word: "${word}"${contextPart}

Provide only the most appropriate translation for this context, no explanations.`;

  return await callOpenAI(prompt);
}

async function batchTranslateLyrics(lines: string[], language: string, targetLanguage: string = 'english'): Promise<string[]> {
  const numberedLines = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
  
  const prompt = `Translate these ${language} song lyrics to ${targetLanguage}. Maintain the poetic and emotional meaning. Return each translation on a separate line with the same numbering:

${numberedLines}

Provide only the translations with their numbers, no explanations.`;

  const result = await callOpenAI(prompt);
  
  // Parse the numbered results back into an array
  const translatedLines = result.split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
  
  return translatedLines;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Authorization required', { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response('Invalid token', { status: 401, headers: corsHeaders });
    }

    const requestData: TranslateRequest = await req.json();
    const { type, text, lines, word, context, language, targetLanguage = 'english' } = requestData;

    if (!language) {
      return new Response('Language parameter is required', { status: 400, headers: corsHeaders });
    }

    let result: any;

    switch (type) {
      case 'line':
        if (!text) {
          return new Response('Text parameter is required for line translation', { status: 400, headers: corsHeaders });
        }
        result = { translation: await translateLyricLine(text, language, targetLanguage) };
        break;

      case 'word':
        if (!word) {
          return new Response('Word parameter is required for word translation', { status: 400, headers: corsHeaders });
        }
        result = { translation: await translateWord(word, context || '', language, targetLanguage) };
        break;

      case 'batch':
        if (!lines || !Array.isArray(lines)) {
          return new Response('Lines array is required for batch translation', { status: 400, headers: corsHeaders });
        }
        const translations = await batchTranslateLyrics(lines, language, targetLanguage);
        result = { translations };
        break;

      default:
        return new Response('Invalid translation type', { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Translation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});