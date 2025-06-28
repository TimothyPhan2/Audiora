-- Migration: Create pronunciation_exercises table
CREATE TABLE pronunciation_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id),
  word_or_phrase TEXT NOT NULL,
  phonetic_transcription TEXT, -- IPA notation optional
  reference_audio_url TEXT NOT NULL, -- Eleven Labs TTS audio
  difficulty_level proficiency_level_enum NOT NULL,
  language TEXT NOT NULL,
  context_sentence TEXT, -- Example usage
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policy
ALTER TABLE pronunciation_exercises ENABLE ROW LEVEL SECURITY;

-- Allow users to read published exercises
CREATE POLICY "Users can view pronunciation exercises" ON pronunciation_exercises
  FOR SELECT USING (true);

-- Add index for efficient querying
CREATE INDEX idx_pronunciation_exercises_song_difficulty 
  ON pronunciation_exercises(song_id, difficulty_level);

-- Add index for language-based queries
CREATE INDEX idx_pronunciation_exercises_language 
  ON pronunciation_exercises(language);

-- Migration: Create user pronunciation results tracking
CREATE TABLE user_pronunciation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pronunciation_exercise_id UUID NOT NULL REFERENCES pronunciation_exercises(id),
  user_audio_url TEXT, -- Recorded audio (optional storage)
  transcribed_text TEXT NOT NULL, -- What STT heard
  accuracy_score INTEGER CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  feedback TEXT, -- Automated feedback
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policy
ALTER TABLE user_pronunciation_results ENABLE ROW LEVEL SECURITY;

-- Users can only access their own results
CREATE POLICY "Users can manage their pronunciation results" ON user_pronunciation_results
  FOR ALL USING (auth.uid() = user_id);

-- Add indexes for efficient querying
CREATE INDEX idx_user_pronunciation_results_user_exercise 
  ON user_pronunciation_results(user_id, pronunciation_exercise_id);

CREATE INDEX idx_user_pronunciation_results_user_created 
  ON user_pronunciation_results(user_id, created_at DESC);

-- Create bucket for pronunciation reference audio (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pronunciation-files', 'pronunciation-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for bucket access
CREATE POLICY "Public read access for pronunciation files" 
ON storage.objects FOR SELECT USING (bucket_id = 'pronunciation-files');

CREATE POLICY "Authenticated users can upload pronunciation files" 
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'pronunciation-files' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Service role can manage pronunciation files" 
ON storage.objects FOR ALL USING (
  bucket_id = 'pronunciation-files' AND 
  auth.role() = 'service_role'
);