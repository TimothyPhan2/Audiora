/*
  # Add user_vocabulary_id to pronunciation_exercises table

  1. Schema Changes
    - Add `user_vocabulary_id` column to `pronunciation_exercises` table
    - This column references `user_vocabulary(id)` to track which user vocabulary entry
      a pronunciation exercise is associated with (for review words)

  2. Purpose
    - Enables proper tracking of pronunciation practice for words in user's vocabulary
    - Allows updating mastery scores when users practice pronunciation of known words
    - Fixes null UUID error when saving pronunciation results for review words
*/

-- Add user_vocabulary_id column to pronunciation_exercises table
ALTER TABLE public.pronunciation_exercises
ADD COLUMN user_vocabulary_id UUID REFERENCES public.user_vocabulary(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_pronunciation_exercises_user_vocabulary_id 
ON public.pronunciation_exercises(user_vocabulary_id);