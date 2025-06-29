import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY');

if (!elevenLabsApiKey) {
  throw new Error('ELEVEN_LABS_API_KEY is not set');
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, User-Agent, x-client-info',
};

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

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Processing STT for file:', audioFile.name, 'Size:', audioFile.size, 'Type:', audioFile.type);

    // Forward to Eleven Labs STT with server-side API key
    const sttFormData = new FormData();
    sttFormData.append('audio', audioFile);
    sttFormData.append('model_id', 'eleven_multilingual_v1');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey // Server-side key
      },
      body: sttFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Eleven Labs STT error:', response.status, errorText);
      throw new Error(`STT API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('STT result:', result);
    
    return new Response(JSON.stringify({
      text: result.text,
      confidence: result.confidence
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('STT processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});