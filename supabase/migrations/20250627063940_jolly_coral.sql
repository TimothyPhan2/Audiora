/*
  # Create listening exercises table and storage

  1. New Tables
    - `listening_exercises`
      - `id` (uuid, primary key)
      - `song_id` (uuid, foreign key to songs)
      - `question` (text)
      - `options` (jsonb)
      - `correct_answer` (text)
      - `explanation` (text, optional)
      - `audio_url` (text)
      - `difficulty_level` (proficiency_level_enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create `listening-files` bucket for audio files
    - Set up proper storage policies for public access

  3. Security
    - Enable RLS on `listening_exercises` table
    - Add policies for authenticated users and anonymous access
    - Add storage policies for file management

  4. Performance
    - Add indexes on `song_id` and `difficulty_level`
    - Add update trigger for `updated_at` column
*/

-- Create the listening_exercises table
CREATE TABLE public.listening_exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id uuid REFERENCES public.songs(id) ON DELETE CASCADE,
    question text NOT NULL,
    options jsonb NOT NULL,
    correct_answer text NOT NULL,
    explanation text,
    audio_url text NOT NULL,
    difficulty_level proficiency_level_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_listening_exercises_song_id ON public.listening_exercises USING btree (song_id);
CREATE INDEX idx_listening_exercises_difficulty_level ON public.listening_exercises USING btree (difficulty_level);

-- Enable Row Level Security (RLS) for listening_exercises table
ALTER TABLE public.listening_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listening_exercises table
-- Allow authenticated users to insert new exercises (e.g., admins or content creators)
CREATE POLICY "Allow authenticated insert for listening_exercises"
ON public.listening_exercises
FOR INSERT
TO authenticated
WITH CHECK (true); -- You might want to add more restrictive checks here, e.g., user_is_admin()

-- Allow authenticated users to select exercises
CREATE POLICY "Allow authenticated select for listening_exercises"
ON public.listening_exercises
FOR SELECT
TO authenticated
USING (true);

-- Allow anonymous users to select exercises (if they are public/published)
-- This policy assumes you might add a 'is_published' column later, or link to song's 'is_published'
CREATE POLICY "Allow anon select for listening_exercises"
ON public.listening_exercises
FOR SELECT
TO anon
USING (EXISTS (SELECT 1 FROM public.songs s WHERE s.id = listening_exercises.song_id AND s.is_published = true));

-- Allow authenticated users to update exercises (e.g., admins or content creators)
CREATE POLICY "Allow authenticated update for listening_exercises"
ON public.listening_exercises
FOR UPDATE
TO authenticated
USING (true); -- You might want to add more restrictive checks here, e.g., user_is_admin()

-- Allow authenticated users to delete exercises (e.g., admins or content creators)
CREATE POLICY "Allow authenticated delete for listening_exercises"
ON public.listening_exercises
FOR DELETE
TO authenticated
USING (true); -- You might want to add more restrictive checks here, e.g., user_is_admin()

-- Create a trigger to update the 'updated_at' column automatically
CREATE TRIGGER update_listening_exercises_updated_at
BEFORE UPDATE ON public.listening_exercises
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a storage bucket for listening exercise audio files
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
    'listening-files',
    'listening-files',
    TRUE, -- Public access for playback
    ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg'], -- Allowed audio types
    5242880 -- 5MB limit (5 * 1024 * 1024 bytes)
) ON CONFLICT (id) DO NOTHING; -- Prevents error if bucket already exists

-- RLS Policies for the new storage bucket
-- Allow authenticated users to upload files to this bucket
CREATE POLICY "Allow authenticated uploads to listening-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listening-files');

-- Allow anyone to read files from this bucket (since it's public)
CREATE POLICY "Allow public read access to listening-files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listening-files');

-- Allow authenticated users to delete their own files (if needed, or restrict to admin)
CREATE POLICY "Allow authenticated delete of own files in listening-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'listening-files' AND auth.uid() = owner);

-- Allow authenticated users to update their own files (if needed, or restrict to admin)
CREATE POLICY "Allow authenticated update of own files in listening-files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'listening-files' AND auth.uid() = owner);