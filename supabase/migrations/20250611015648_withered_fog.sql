/*
  # Security Fix: Function Search Path Mutable Warnings
  
  This migration resolves critical security warnings by setting explicit 
  search_path for all database functions to prevent privilege escalation attacks.
  
  ## Security Issues Resolved:
  1. user_has_premium_access() - Missing search_path protection
  2. user_is_admin() - Missing search_path protection
  
  ## Security Impact:
  - Prevents search_path manipulation attacks
  - Ensures functions only access intended schemas
  - Maintains function behavior consistency
*/

-- 1. Fix user_has_premium_access function with secure search_path
CREATE OR REPLACE FUNCTION user_has_premium_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = (select auth.uid())
    AND subscription_tier IN ('premium', 'pro')
    AND (EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = (select auth.uid()) 
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    ))
  );
END;
$$ LANGUAGE plpgsql 
STABLE
SECURITY DEFINER
SET search_path = public, auth;

-- 2. Fix user_is_admin function with secure search_path
CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql 
STABLE
SECURITY DEFINER
SET search_path = public, auth;

-- 3. Verify and fix any other functions that might have this issue
-- Update the updated_at trigger function as well
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 4. Fix subscription tier update function
CREATE OR REPLACE FUNCTION update_user_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET subscription_tier = NEW.tier
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 5. Fix quiz passed status function
CREATE OR REPLACE FUNCTION update_quiz_passed_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Set passed status based on quiz passing score
  IF NEW.score >= (
    SELECT passing_score 
    FROM quizzes 
    WHERE id = NEW.quiz_id
  ) THEN
    NEW.passed = TRUE;
  ELSE
    NEW.passed = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 6. Create a helper function to validate all functions have proper search_path
CREATE OR REPLACE FUNCTION validate_function_security()
RETURNS TABLE(
  function_name text,
  has_search_path boolean,
  security_status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.proname::text as function_name,
    (p.proconfig IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM unnest(p.proconfig) as config 
       WHERE config LIKE 'search_path=%'
     )) as has_search_path,
    CASE 
      WHEN p.proconfig IS NOT NULL AND 
           EXISTS (
             SELECT 1 FROM unnest(p.proconfig) as config 
             WHERE config LIKE 'search_path=%'
           ) 
      THEN 'SECURE' 
      ELSE 'VULNERABLE' 
    END as security_status
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'user_has_premium_access',
      'user_is_admin', 
      'update_updated_at_column',
      'update_user_subscription_tier',
      'update_quiz_passed_status'
    );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog;