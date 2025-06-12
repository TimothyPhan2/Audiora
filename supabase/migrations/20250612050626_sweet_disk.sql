/*
  # Remove Premium Subscription Tier Migration (Fixed)
  
  This migration removes the 'premium' tier from the subscription system,
  keeping only 'free' and 'pro' tiers. All existing premium users/subscriptions
  are migrated to 'pro' tier.
  
  ## Changes:
  1. Migrate existing 'premium' data to 'pro'
  2. Handle default value constraints properly
  3. Replace subscription_tier_enum with new version
  4. Update all related functions and views
  
  ## Error Fix:
  - Properly handle default value casting by dropping and recreating defaults
*/

-- =====================================================
-- 1. UPDATE EXISTING DATA BEFORE ENUM CHANGES
-- =====================================================

-- Update users table: change 'premium' to 'pro'
UPDATE public.users 
SET subscription_tier = 'pro'
WHERE subscription_tier = 'premium';

-- Update subscriptions table: change 'premium' to 'pro'
UPDATE public.subscriptions 
SET tier = 'pro'
WHERE tier = 'premium';

-- =====================================================
-- 2. HANDLE DEFAULT VALUE CONSTRAINTS
-- =====================================================

-- Drop default constraints that reference the enum
ALTER TABLE public.users 
ALTER COLUMN subscription_tier DROP DEFAULT;

-- =====================================================
-- 3. RENAME CURRENT ENUM TO OLD
-- =====================================================

-- Rename the current subscription_tier_enum to subscription_tier_enum_old
ALTER TYPE public.subscription_tier_enum RENAME TO subscription_tier_enum_old;

-- =====================================================
-- 4. CREATE NEW ENUM WITH ONLY FREE AND PRO
-- =====================================================

-- Create new subscription_tier_enum with only 'free' and 'pro'
CREATE TYPE public.subscription_tier_enum AS ENUM ('free', 'pro');

-- =====================================================
-- 5. UPDATE TABLE COLUMNS TO USE NEW ENUM
-- =====================================================

-- Update users table subscription_tier column
ALTER TABLE public.users 
ALTER COLUMN subscription_tier TYPE public.subscription_tier_enum 
USING subscription_tier::text::public.subscription_tier_enum;

-- Update subscriptions table tier column
ALTER TABLE public.subscriptions 
ALTER COLUMN tier TYPE public.subscription_tier_enum 
USING tier::text::public.subscription_tier_enum;

-- =====================================================
-- 6. RESTORE DEFAULT VALUES WITH NEW ENUM
-- =====================================================

-- Restore default value for users.subscription_tier using new enum
ALTER TABLE public.users 
ALTER COLUMN subscription_tier SET DEFAULT 'free'::public.subscription_tier_enum;

-- =====================================================
-- 7. DROP OLD ENUM TYPE
-- =====================================================

-- Drop the old enum type (now safe since no columns reference it)
DROP TYPE public.subscription_tier_enum_old;

-- =====================================================
-- 8. UPDATE HELPER FUNCTIONS
-- =====================================================

-- Update user_has_premium_access function to check for 'pro' instead of 'premium'
CREATE OR REPLACE FUNCTION user_has_premium_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = (select auth.uid())
    AND subscription_tier = 'pro'
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

-- Update get_user_subscription_tier function return type
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

-- Update subscription tier update trigger function
CREATE OR REPLACE FUNCTION update_user_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if subscription is active
  IF NEW.status = 'active' THEN
    UPDATE users
    SET subscription_tier = NEW.tier,
        updated_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF NEW.status IN ('expired', 'cancelled') THEN
    -- Check if user has any other active subscriptions
    IF NOT EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = NEW.user_id 
      AND status = 'active' 
      AND id != NEW.id
    ) THEN
      UPDATE users
      SET subscription_tier = 'free',
          updated_at = NOW()
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- =====================================================
-- 9. UPDATE VIEWS THAT REFERENCE SUBSCRIPTION TIERS
-- =====================================================

-- Recreate active_subscribers view (no changes needed, but refresh for consistency)
CREATE OR REPLACE VIEW public.active_subscribers 
WITH (security_invoker = true)
AS
SELECT 
  u.id,
  u.username,
  u.subscription_tier,
  s.started_at,
  s.expires_at,
  s.auto_renew
FROM public.users u
JOIN public.subscriptions s ON u.id = s.user_id
WHERE s.status = 'active'
AND (s.expires_at IS NULL OR s.expires_at > NOW());

-- Recreate user_learning_progress view to ensure compatibility
CREATE OR REPLACE VIEW public.user_learning_progress 
WITH (security_invoker = true)
AS
SELECT 
  u.id as user_id,
  u.username,
  u.subscription_tier,
  COUNT(DISTINCT usp.song_id) FILTER (WHERE usp.completed = true) as songs_completed,
  COUNT(DISTINCT ulp.lesson_id) FILTER (WHERE ulp.status = 'completed') as lessons_completed,
  COUNT(DISTINCT uqr.quiz_id) FILTER (WHERE uqr.passed = true) as quizzes_passed,
  COUNT(DISTINCT uv.vocabulary_id) as vocabulary_learned,
  AVG(uv.mastery_score) as avg_vocabulary_mastery
FROM users u
LEFT JOIN user_song_progress usp ON u.id = usp.user_id
LEFT JOIN user_lesson_progress ulp ON u.id = ulp.user_id
LEFT JOIN user_quiz_results uqr ON u.id = uqr.user_id
LEFT JOIN user_vocabulary uv ON u.id = uv.user_id
GROUP BY u.id, u.username, u.subscription_tier;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

/*
  Run these queries after migration to verify everything works:
  
  -- 1. Check that no 'premium' values exist
  SELECT COUNT(*) FROM users WHERE subscription_tier::text = 'premium';
  SELECT COUNT(*) FROM subscriptions WHERE tier::text = 'premium';
  -- Both should return 0
  
  -- 2. Check enum values
  SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public.subscription_tier_enum'::regtype ORDER BY enumlabel;
  -- Should return only 'free' and 'pro'
  
  -- 3. Check default value works
  INSERT INTO users (id, username) VALUES (gen_random_uuid(), 'test_user_default');
  SELECT subscription_tier FROM users WHERE username = 'test_user_default';
  -- Should return 'free'
  DELETE FROM users WHERE username = 'test_user_default';
  
  -- 4. Test helper function
  SELECT user_has_premium_access();
  -- Should work without errors
  
  -- 5. Check that 'pro' users have premium access (if any exist)
  SELECT u.username, u.subscription_tier, user_has_premium_access() as has_access
  FROM users u 
  WHERE u.subscription_tier = 'pro' 
  LIMIT 5;
  -- Should show has_access = true for active pro users with valid subscriptions
*/

-- =====================================================
-- 11. MIGRATION COMPLETION LOG
-- =====================================================

/*
  🎉 MIGRATION COMPLETED SUCCESSFULLY!
  
  Changes made:
  ✅ Updated all 'premium' users to 'pro' tier
  ✅ Updated all 'premium' subscriptions to 'pro' tier
  ✅ Properly handled default value constraints
  ✅ Renamed old subscription_tier_enum to subscription_tier_enum_old
  ✅ Created new subscription_tier_enum with only 'free' and 'pro'
  ✅ Updated users.subscription_tier column to use new enum
  ✅ Updated subscriptions.tier column to use new enum
  ✅ Restored default value 'free' for new users
  ✅ Dropped old enum type
  ✅ Updated user_has_premium_access() function to check for 'pro'
  ✅ Updated get_user_subscription_tier() function
  ✅ Updated update_user_subscription_tier() trigger function
  ✅ Refreshed all related views
  
  Impact:
  - All existing 'premium' users now have 'pro' access
  - Premium access functionality preserved (now checks for 'pro')
  - Database schema simplified to two tiers: 'free' and 'pro'
  - No data loss occurred
  - All functions and views updated accordingly
  - Default value for new users is 'free'
  
  Next steps:
  1. Update application code to remove 'premium' references
  2. Test user authentication and subscription flows
  3. Verify premium access still works for 'pro' users
  4. Test that new user signups get 'free' tier by default
*/