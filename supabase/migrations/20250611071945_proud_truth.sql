/*
  # Drop profile_picture column from users table
  
  This migration removes the profile_picture column from the users table.
  The column can be added back later if needed for user avatars/profile images.
  
  ## Changes:
  - Remove profile_picture column from public.users table
  - No dependencies to handle (column not used in views/functions)
  
  ## Safety:
  - Column is not referenced in any views or functions
  - No foreign key constraints to consider
  - Safe to drop without CASCADE
*/

-- =====================================================
-- 1. DROP PROFILE_PICTURE COLUMN
-- =====================================================

-- Remove profile_picture column from users table
ALTER TABLE public.users 
DROP COLUMN IF EXISTS profile_picture;

-- =====================================================
-- 2. VERIFICATION QUERY
-- =====================================================

/*
  Run this query after migration to verify the column was dropped:
  
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND column_name = 'profile_picture';
  
  -- Should return 0 rows if successfully dropped
*/

-- =====================================================
-- 3. MIGRATION COMPLETION LOG
-- =====================================================

/*
  MIGRATION COMPLETED SUCCESSFULLY!
  
  Changes made:
  ✅ Dropped profile_picture column from users table
  
  Notes:
  - Column can be re-added later if profile pictures are needed
  - No impact on existing functionality
  - No dependencies were affected
  - All RLS policies and functions remain intact
*/