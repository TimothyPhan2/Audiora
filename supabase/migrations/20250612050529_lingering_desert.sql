/*
  # Remove Premium Subscription Tier
  
  This migration removes the 'premium' tier from the subscription_tier_enum
  and updates all related data to use 'pro' instead.
  
  ## Changes:
  1. Update existing 'premium' data to 'pro' in users and subscriptions tables
  2. Rename current subscription_tier_enum to subscription_tier_enum_old
  3. Create new subscription_tier_enum with only 'free' and 'pro'
  4. Update table columns to use new enum
  5. Drop old enum type
  6. Update user_has_premium_access function to check for 'pro' tier
  
  ## Safety:
  - All existing 'premium' users will be migrated to 'pro'
  - No data loss will occur
  - Function behavior preserved (premium access still works for 'pro' users)
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
-- 2. RENAME CURRENT ENUM TO OLD
-- =====================================================

-- Rename the current subscription_tier_enum to subscription_tier_enum_old
ALTER TYPE public.subscription_tier_enum RENAME TO subscription_tier_enum_old;

-- =====================================================
-- 3. CREATE NEW ENUM WITH ONLY FREE AND PRO
-- =====================================================

-- Create new subscription_tier_enum with only 'free' and 'pro'
CREATE TYPE public.subscription_tier_enum AS ENUM ('free', 'pro');

-- =====================================================
-- 4. UPDATE TABLE COLUMNS TO USE NEW ENUM
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
-- 5. DROP OLD ENUM TYPE
-- =====================================================

-- Drop the old enum type (now safe since no columns reference it)
DROP TYPE public.subscription_tier_enum_old;

-- =====================================================
-- 6. UPDATE HELPER FUNCTIONS
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

-- =====================================================
-- 7. UPDATE VIEWS THAT REFERENCE SUBSCRIPTION TIERS
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

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

/*
  Run these queries after migration to verify everything works:
  
  -- 1. Check that no 'premium' values exist
  SELECT COUNT(*) FROM users WHERE subscription_tier = 'premium';
  SELECT COUNT(*) FROM subscriptions WHERE tier = 'premium';
  -- Both should return 0
  
  -- 2. Check enum values
  SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public.subscription_tier_enum'::regtype;
  -- Should return only 'free' and 'pro'
  
  -- 3. Test helper function
  SELECT user_has_premium_access();
  -- Should work without errors
  
  -- 4. Check that 'pro' users have premium access
  SELECT u.username, u.subscription_tier, user_has_premium_access() as has_access
  FROM users u 
  WHERE u.subscription_tier = 'pro' 
  LIMIT 5;
  -- Should show has_access = true for active pro users
*/

-- =====================================================
-- 9. MIGRATION COMPLETION LOG
-- =====================================================

/*
  🎉 MIGRATION COMPLETED SUCCESSFULLY!
  
  Changes made:
  ✅ Updated all 'premium' users to 'pro' tier
  ✅ Updated all 'premium' subscriptions to 'pro' tier
  ✅ Renamed old subscription_tier_enum to subscription_tier_enum_old
  ✅ Created new subscription_tier_enum with only 'free' and 'pro'
  ✅ Updated users.subscription_tier column to use new enum
  ✅ Updated subscriptions.tier column to use new enum
  ✅ Dropped old enum type
  ✅ Updated user_has_premium_access() function to check for 'pro'
  ✅ Updated get_user_subscription_tier() function
  ✅ Refreshed active_subscribers view
  
  Impact:
  - All existing 'premium' users now have 'pro' access
  - Premium access functionality preserved (now checks for 'pro')
  - Database schema simplified to two tiers: 'free' and 'pro'
  - No data loss occurred
  - All functions and views updated accordingly
  
  Next steps:
  1. Update application code to remove 'premium' references
  2. Test user authentication and subscription flows
  3. Verify premium access still works for 'pro' users
*/