/*
  # Update Users Schema for Onboarding System
  
  This migration updates the users table to support the new onboarding flow:
  - Removes full_name and preferred_language columns
  - Adds proficiency_level column with proper constraints
  - Updates indexes for performance
*/

-- Remove old columns that are no longer needed
ALTER TABLE public.users 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS preferred_language;

-- Add proficiency_level column with proper constraints
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS proficiency_level TEXT 
CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Fluent'));

-- Add index for proficiency_level for better query performance
CREATE INDEX IF NOT EXISTS idx_users_proficiency_level 
ON public.users (proficiency_level);

-- Update the users table to ensure learning_languages is properly configured
ALTER TABLE public.users 
ALTER COLUMN learning_languages SET DEFAULT '{}';

-- Add a function to check if user has completed onboarding
CREATE OR REPLACE FUNCTION user_has_completed_onboarding(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id 
    AND learning_languages IS NOT NULL 
    AND array_length(learning_languages, 1) > 0
    AND proficiency_level IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public;

-- Add RLS policy for onboarding status
CREATE POLICY "Users can check onboarding status" ON public.users
FOR SELECT TO authenticated
USING (
  id = (SELECT auth.uid()) 
  OR user_is_admin()
);