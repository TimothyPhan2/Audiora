/*
  Audiora - Complete Supabase PostgreSQL Schema
  
  INSTRUCTIONS:
  1. Copy this entire script
  2. Open your Supabase project dashboard
  3. Go to SQL Editor
  4. Paste this script and click "Run"
  
  This script will create the complete database schema for Audiora,
  including all tables, indexes, RLS policies, and helper functions.
  
  Schema Features:
  - Freemium access control with RLS
  - Optimized for performance with proper indexing
  - Secure user authentication extending auth.users
  - Support for AI-generated music content
  - Progress tracking and subscription management
*/

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE proficiency_level_enum AS ENUM ('beginner', 'intermediate', 'advanced', 'fluent');
CREATE TYPE lesson_type_enum AS ENUM ('vocabulary', 'listening', 'pronunciation', 'grammar', 'cultural', 'mixed');
CREATE TYPE quiz_type_enum AS ENUM ('vocabulary', 'listening', 'comprehension', 'pronunciation', 'mixed');
CREATE TYPE question_type_enum AS ENUM ('multiple_choice', 'fill_in_blank', 'matching', 'listening', 'pronunciation', 'true_false');
CREATE TYPE lesson_status_enum AS ENUM ('not_started', 'in_progress', 'completed', 'abandoned');
CREATE TYPE user_role_enum AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE subscription_tier_enum AS ENUM ('free', 'premium', 'pro');

-- =============================================================================
-- CORE CONTENT TABLES
-- =============================================================================

-- Songs table - stores AI-generated music content
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT,
  language TEXT NOT NULL,
  difficulty_level proficiency_level_enum NOT NULL,
  genre TEXT,
  audio_url TEXT,
  cover_image_url TEXT,
  duration_seconds INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lyrics table - stores synchronized lyrics with timestamps
CREATE TABLE lyrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  start_time_ms INTEGER,
  end_time_ms INTEGER,
  translation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(song_id, line_number)
);

-- Vocabulary table - stores words and phrases for learning
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  language TEXT NOT NULL,
  translation TEXT NOT NULL,
  phonetic TEXT,
  difficulty_level proficiency_level_enum NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(word, language)
);

-- Junction table linking lyrics to vocabulary
CREATE TABLE lyric_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lyric_id UUID NOT NULL REFERENCES lyrics(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  position_start INTEGER,
  position_end INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lyric_id, vocabulary_id)
);

-- =============================================================================
-- USER MANAGEMENT AND SUBSCRIPTIONS
-- =============================================================================

-- Users table - extends Supabase auth.users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  profile_picture TEXT,
  subscription_tier subscription_tier_enum DEFAULT 'free',
  role user_role_enum DEFAULT 'user',
  preferred_language TEXT,
  learning_languages TEXT[] DEFAULT '{}',
  timezone TEXT DEFAULT 'UTC',
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table - manages user subscription status
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier subscription_tier_enum NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'trial')),
  payment_method TEXT,
  payment_reference TEXT,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- LESSONS AND QUIZZES
-- =============================================================================

-- Lessons table - structured learning content
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  lesson_type lesson_type_enum NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  difficulty_level proficiency_level_enum NOT NULL,
  language TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  estimated_duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes table - assessment content
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quiz_type quiz_type_enum NOT NULL,
  time_limit_seconds INTEGER,
  passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions table - individual quiz questions
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type question_type_enum NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  audio_url TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- USER PROGRESS AND LEARNING DATA
-- =============================================================================

-- User song progress - tracks listening progress
CREATE TABLE user_song_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  play_time_seconds INTEGER DEFAULT 0,
  last_position_ms INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  first_played_at TIMESTAMPTZ DEFAULT NOW(),
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

-- User quiz results - tracks quiz performance
CREATE TABLE user_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  attempts INTEGER DEFAULT 1,
  time_taken_seconds INTEGER,
  submitted_answers JSONB NOT NULL,
  passed BOOLEAN GENERATED ALWAYS AS (score >= (SELECT passing_score FROM quizzes WHERE id = quiz_id)) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User lesson progress - tracks lesson completion
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status lesson_status_enum DEFAULT 'not_started',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  time_spent_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- User vocabulary - tracks learned vocabulary
CREATE TABLE user_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  mastery_score INTEGER DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  times_practiced INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  learned_from_song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vocabulary_id)
);

-- User achievements - gamification
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- Songs indexes
CREATE INDEX idx_songs_language ON songs(language);
CREATE INDEX idx_songs_difficulty_level ON songs(difficulty_level);
CREATE INDEX idx_songs_is_published ON songs(is_published);
CREATE INDEX idx_songs_is_premium ON songs(is_premium);
CREATE INDEX idx_songs_popularity_score ON songs(popularity_score DESC);

-- Lyrics indexes
CREATE INDEX idx_lyrics_song_id ON lyrics(song_id);
CREATE INDEX idx_lyrics_line_number ON lyrics(song_id, line_number);

-- Vocabulary indexes
CREATE INDEX idx_vocabulary_language ON vocabulary(language);
CREATE INDEX idx_vocabulary_difficulty_level ON vocabulary(difficulty_level);
CREATE INDEX idx_vocabulary_is_premium ON vocabulary(is_premium);

-- User indexes
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_last_active_at ON users(last_active_at);

-- Subscription indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

-- Lesson indexes
CREATE INDEX idx_lessons_difficulty_level ON lessons(difficulty_level);
CREATE INDEX idx_lessons_language ON lessons(language);
CREATE INDEX idx_lessons_is_premium ON lessons(is_premium);
CREATE INDEX idx_lessons_is_published ON lessons(is_published);
CREATE INDEX idx_lessons_song_id ON lessons(song_id);

-- Quiz indexes
CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- Progress indexes
CREATE INDEX idx_user_song_progress_user_id ON user_song_progress(user_id);
CREATE INDEX idx_user_song_progress_song_id ON user_song_progress(song_id);
CREATE INDEX idx_user_song_progress_completed ON user_song_progress(completed);

CREATE INDEX idx_user_quiz_results_user_id ON user_quiz_results(user_id);
CREATE INDEX idx_user_quiz_results_quiz_id ON user_quiz_results(quiz_id);

CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_status ON user_lesson_progress(status);

CREATE INDEX idx_user_vocabulary_user_id ON user_vocabulary(user_id);
CREATE INDEX idx_user_vocabulary_vocabulary_id ON user_vocabulary(vocabulary_id);
CREATE INDEX idx_user_vocabulary_mastery_score ON user_vocabulary(mastery_score);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyric_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_song_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to check if user has premium access
CREATE OR REPLACE FUNCTION user_has_premium_access(user_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
  user_tier subscription_tier_enum;
BEGIN
  target_user_id := COALESCE(user_uuid, (SELECT auth.uid()));
  
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT subscription_tier INTO user_tier
  FROM users
  WHERE id = target_user_id;
  
  RETURN user_tier IN ('premium', 'pro');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION user_is_admin(user_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
  user_role_val user_role_enum;
BEGIN
  target_user_id := COALESCE(user_uuid, (SELECT auth.uid()));
  
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT role INTO user_role_val
  FROM users
  WHERE id = target_user_id;
  
  RETURN user_role_val IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current subscription tier
CREATE OR REPLACE FUNCTION get_user_subscription_tier(user_uuid UUID DEFAULT NULL)
RETURNS subscription_tier_enum AS $$
DECLARE
  target_user_id UUID;
  user_tier subscription_tier_enum;
BEGIN
  target_user_id := COALESCE(user_uuid, (SELECT auth.uid()));
  
  IF target_user_id IS NULL THEN
    RETURN 'free';
  END IF;
  
  SELECT subscription_tier INTO user_tier
  FROM users
  WHERE id = target_user_id;
  
  RETURN COALESCE(user_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Function to update user subscription tier when subscription changes
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscription_tier_trigger
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscription_tier();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to relevant tables
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Songs policies
CREATE POLICY "Anyone can view published song metadata"
  ON songs FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Premium users can access premium songs"
  ON songs FOR SELECT
  TO authenticated
  USING (
    is_published = true AND (
      is_premium = false OR 
      user_has_premium_access((SELECT auth.uid())) OR
      user_is_admin((SELECT auth.uid()))
    )
  );

CREATE POLICY "Admins can manage all songs"
  ON songs FOR ALL
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

-- Lyrics policies
CREATE POLICY "Free users can view first 3 lines of lyrics"
  ON lyrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM songs s 
      WHERE s.id = song_id 
      AND s.is_published = true
      AND (
        line_number <= 3 OR
        s.is_premium = false OR
        user_has_premium_access((SELECT auth.uid())) OR
        user_is_admin((SELECT auth.uid()))
      )
    )
  );

CREATE POLICY "Anonymous users can view basic lyric info"
  ON lyrics FOR SELECT
  TO anon
  USING (
    line_number <= 1 AND
    EXISTS (
      SELECT 1 FROM songs s 
      WHERE s.id = song_id 
      AND s.is_published = true
    )
  );

CREATE POLICY "Admins can manage all lyrics"
  ON lyrics FOR ALL
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

-- Vocabulary policies
CREATE POLICY "Users can view vocabulary based on premium status"
  ON vocabulary FOR SELECT
  TO authenticated
  USING (
    is_premium = false OR 
    user_has_premium_access((SELECT auth.uid())) OR
    user_is_admin((SELECT auth.uid()))
  );

CREATE POLICY "Anonymous users can view basic vocabulary"
  ON vocabulary FOR SELECT
  TO anon
  USING (is_premium = false);

CREATE POLICY "Admins can manage vocabulary"
  ON vocabulary FOR ALL
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

-- Lyric vocabulary policies
CREATE POLICY "Users can view lyric vocabulary based on access"
  ON lyric_vocabulary FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lyrics l
      JOIN songs s ON l.song_id = s.id
      WHERE l.id = lyric_id
      AND s.is_published = true
    )
  );

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

-- Lessons policies
CREATE POLICY "Users can view published lessons based on premium status"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    is_published = true AND (
      is_premium = false OR 
      user_has_premium_access((SELECT auth.uid())) OR
      user_is_admin((SELECT auth.uid()))
    )
  );

CREATE POLICY "Admins can manage all lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

-- Quizzes policies
CREATE POLICY "Users can view quizzes for accessible lessons"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = lesson_id
      AND l.is_published = true
      AND (
        l.is_premium = false OR
        user_has_premium_access((SELECT auth.uid())) OR
        user_is_admin((SELECT auth.uid()))
      )
    )
  );

CREATE POLICY "Admins can manage all quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

-- Quiz questions policies
CREATE POLICY "Users can view questions for accessible quizzes"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON q.lesson_id = l.id
      WHERE q.id = quiz_id
      AND q.is_published = true
      AND l.is_published = true
      AND (
        l.is_premium = false OR
        user_has_premium_access((SELECT auth.uid())) OR
        user_is_admin((SELECT auth.uid()))
      )
    )
  );

CREATE POLICY "Admins can manage all quiz questions"
  ON quiz_questions FOR ALL
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

-- User progress policies
CREATE POLICY "Users can manage their own song progress"
  ON user_song_progress FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can manage their own quiz results"
  ON user_quiz_results FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can manage their own lesson progress"
  ON user_lesson_progress FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can manage their own vocabulary"
  ON user_vocabulary FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can manage their own achievements"
  ON user_achievements FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Admin policies for viewing user progress
CREATE POLICY "Admins can view all user progress"
  ON user_song_progress FOR SELECT
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

CREATE POLICY "Admins can view all quiz results"
  ON user_quiz_results FOR SELECT
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

CREATE POLICY "Admins can view all lesson progress"
  ON user_lesson_progress FOR SELECT
  TO authenticated
  USING (user_is_admin((SELECT auth.uid())));

-- =============================================================================
-- USEFUL VIEWS
-- =============================================================================

-- Active subscribers view
CREATE VIEW active_subscribers AS
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.subscription_tier,
  s.started_at,
  s.expires_at,
  s.auto_renew
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.status = 'active'
AND (s.expires_at IS NULL OR s.expires_at > NOW());

-- Content metrics view
CREATE VIEW content_metrics AS
SELECT 
  'songs' as content_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_published = true) as published_count,
  COUNT(*) FILTER (WHERE is_premium = true) as premium_count,
  AVG(popularity_score) as avg_popularity
FROM songs
UNION ALL
SELECT 
  'lessons' as content_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_published = true) as published_count,
  COUNT(*) FILTER (WHERE is_premium = true) as premium_count,
  NULL as avg_popularity
FROM lessons;

-- User learning progress view
CREATE VIEW user_learning_progress AS
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

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Insert some sample data for testing (optional)
-- This can be removed in production

-- Sample vocabulary
INSERT INTO vocabulary (word, language, translation, difficulty_level, is_premium) VALUES
('hola', 'spanish', 'hello', 'beginner', false),
('adiós', 'spanish', 'goodbye', 'beginner', false),
('amor', 'spanish', 'love', 'intermediate', false),
('corazón', 'spanish', 'heart', 'intermediate', false),
('bonjour', 'french', 'hello', 'beginner', false),
('au revoir', 'french', 'goodbye', 'beginner', false),
('amour', 'french', 'love', 'intermediate', false),
('cœur', 'french', 'heart', 'intermediate', false);

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Schema creation completed successfully!
-- You can now start using your Audiora database.
-- 
-- Next steps:
-- 1. Test the schema by inserting some sample data
-- 2. Verify RLS policies are working correctly
-- 3. Set up your application to use these tables
-- 4. Configure Supabase Auth settings in your dashboard