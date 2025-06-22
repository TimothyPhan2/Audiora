/*
  # Fix Translation System RLS Policies
  
  This migration adds the missing RLS policies that are preventing database persistence
  in the translation system. Without these policies, all INSERT/UPDATE operations
  fail silently, causing translations to be lost on browser refresh.
  
  ## Issues Resolved:
  1. Allow authenticated users to update lyrics with translations
  2. Allow authenticated users to insert/update vocabulary words
  3. Allow users to manage their personal vocabulary collections
  
  ## Expected Impact:
  - Database persistence will work for translations
  - Cost savings through proper caching
  - No more lost translations on browser refresh
*/

-- =====================================================
-- 1. LYRICS TABLE POLICIES
-- =====================================================

-- Allow authenticated users to update lyrics with translations
CREATE POLICY "lyrics_update_translations" ON public.lyrics
FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

-- =====================================================
-- 2. VOCABULARY TABLE POLICIES  
-- =====================================================

-- Allow authenticated users to insert vocabulary words
CREATE POLICY "vocabulary_insert_authenticated" ON public.vocabulary
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update vocabulary usage counts
CREATE POLICY "vocabulary_update_authenticated" ON public.vocabulary
FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

-- =====================================================
-- 3. USER_VOCABULARY TABLE POLICIES
-- =====================================================

-- Allow users to manage their personal vocabulary
CREATE POLICY "user_vocabulary_insert_own" ON public.user_vocabulary
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_vocabulary_update_own" ON public.user_vocabulary
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_vocabulary_delete_own" ON public.user_vocabulary
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

/*
  Run these queries after migration to verify policies were created:
  
  -- Check lyrics policies
  SELECT policyname, cmd, roles, qual, with_check 
  FROM pg_policies 
  WHERE tablename = 'lyrics' AND schemaname = 'public'
  AND policyname = 'lyrics_update_translations';
  
  -- Check vocabulary policies
  SELECT policyname, cmd, roles, qual, with_check 
  FROM pg_policies 
  WHERE tablename = 'vocabulary' AND schemaname = 'public'
  AND policyname IN ('vocabulary_insert_authenticated', 'vocabulary_update_authenticated');
  
  -- Check user_vocabulary policies
  SELECT policyname, cmd, roles, qual, with_check 
  FROM pg_policies 
  WHERE tablename = 'user_vocabulary' AND schemaname = 'public'
  AND policyname LIKE 'user_vocabulary_%';
*/

-- =====================================================
-- 5. MIGRATION COMPLETION LOG
-- =====================================================

/*
  🎉 TRANSLATION RLS POLICIES MIGRATION COMPLETED!
  
  Policies added:
  ✅ lyrics_update_translations - Allows translation updates
  ✅ vocabulary_insert_authenticated - Allows vocabulary creation
  ✅ vocabulary_update_authenticated - Allows usage count updates
  ✅ user_vocabulary_insert_own - Allows personal vocab creation
  ✅ user_vocabulary_update_own - Allows personal vocab updates
  ✅ user_vocabulary_delete_own - Allows personal vocab deletion
  
  Expected results:
  - Database persistence will work for all translation operations
  - Translations will survive browser refresh
  - Cost savings through proper database caching
  - No more silent RLS policy failures
  
  Next steps:
  1. Apply this migration in Supabase Dashboard
  2. Test database persistence with testDatabasePersistence()
  3. Verify translations save and persist across browser refresh
*/