/*
  # Fix Function Search Path Security Issues
  
  This migration addresses Supabase security warnings by setting explicit search_path
  for all functions to prevent schema injection attacks and ensure consistent behavior.
  
  Security Issue: Function Search Path Mutable
  Solution: Set search_path = '' for all functions to force explicit schema qualification
*/

-- =============================================================================
-- FIX HELPER FUNCTIONS
-- =============================================================================

-- Function to check if user has premium access
CREATE OR REPLACE FUNCTION user_has_premium_access()
RETURNS BOOLEAN 
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (SELECT auth.uid())
    AND subscription_tier IN ('premium', 'pro')
    AND (EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE user_id = (SELECT auth.uid()) 
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    ))
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS BOOLEAN 
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (SELECT auth.uid())
    AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current subscription tier
CREATE OR REPLACE FUNCTION get_user_subscription_tier()
RETURNS public.subscription_tier_enum 
SET search_path = ''
AS $$
DECLARE
  user_tier public.subscription_tier_enum;
BEGIN
  SELECT subscription_tier INTO user_tier
  FROM public.users
  WHERE id = (SELECT auth.uid());
  
  RETURN COALESCE(user_tier, 'free');
END;
$$ LANGUAGE plpgsql;

-- Function to check if quiz result passed
CREATE OR REPLACE FUNCTION check_quiz_passed(quiz_result_id UUID)
RETURNS BOOLEAN 
SET search_path = ''
AS $$
DECLARE
  result_score INTEGER;
  required_score INTEGER;
BEGIN
  SELECT uqr.score, q.passing_score
  INTO result_score, required_score
  FROM public.user_quiz_results uqr
  JOIN public.quizzes q ON uqr.quiz_id = q.id
  WHERE uqr.id = quiz_result_id;
  
  RETURN result_score >= required_score;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FIX TRIGGER FUNCTIONS
-- =============================================================================

-- Function to update user subscription tier when subscription changes
CREATE OR REPLACE FUNCTION update_user_subscription_tier()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
  -- Only update if subscription is active
  IF NEW.status = 'active' THEN
    UPDATE public.users
    SET subscription_tier = NEW.tier,
        updated_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF NEW.status IN ('expired', 'cancelled') THEN
    -- Check if user has any other active subscriptions
    IF NOT EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE user_id = NEW.user_id 
      AND status = 'active' 
      AND id != NEW.id
    ) THEN
      UPDATE public.users
      SET subscription_tier = 'free',
          updated_at = NOW()
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update quiz passed status
CREATE OR REPLACE FUNCTION update_quiz_passed_status()
RETURNS TRIGGER 
SET search_path = ''
AS $$
DECLARE
  required_score INTEGER;
BEGIN
  -- Get the passing score for this quiz
  SELECT passing_score INTO required_score
  FROM public.quizzes
  WHERE id = NEW.quiz_id;
  
  -- Update the passed status based on score
  NEW.passed := (NEW.score >= required_score);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================

/*
  Run this query after the migration to verify all functions now have secure search_path:
  
  SELECT 
    proname as function_name,
    proconfig as search_path_config
  FROM pg_proc 
  WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN (
    'user_has_premium_access',
    'user_is_admin', 
    'get_user_subscription_tier',
    'check_quiz_passed',
    'update_user_subscription_tier',
    'update_quiz_passed_status',
    'update_updated_at_column'
  );
  
  Expected result: All functions should show search_path='' in the proconfig column
*/