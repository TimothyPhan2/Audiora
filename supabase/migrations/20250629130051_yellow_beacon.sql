-- Enhanced Achievement System
-- Add better indexing and RLS for achievements

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);

-- Add RLS policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert achievements" ON user_achievements
FOR INSERT WITH CHECK (true); -- This will be called by server functions

-- Create a function to award achievements
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id UUID,
  p_achievement_type TEXT,
  p_achievement_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  existing_achievement UUID;
BEGIN
  -- Check if user already has this achievement
  SELECT id INTO existing_achievement
  FROM user_achievements
  WHERE user_id = p_user_id AND achievement_type = p_achievement_type;
  
  -- If achievement doesn't exist, award it
  IF existing_achievement IS NULL THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_data)
    VALUES (p_user_id, p_achievement_type, p_achievement_data);
    
    RETURN TRUE; -- New achievement awarded
  END IF;
  
  RETURN FALSE; -- Achievement already exists
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create achievement checking function
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  new_achievements JSONB := '[]'::jsonb;
  vocab_count INTEGER;
  quiz_count INTEGER;
  avg_quiz_score NUMERIC;
  perfect_quizzes INTEGER;
  song_count INTEGER;
  high_mastery_words INTEGER;
  achievement_awarded BOOLEAN;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO vocab_count
  FROM user_vocabulary
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*), AVG(score) INTO quiz_count, avg_quiz_score
  FROM user_quiz_results
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO perfect_quizzes
  FROM user_quiz_results
  WHERE user_id = p_user_id AND score = 100;
  
  SELECT COUNT(*) INTO song_count
  FROM user_song_progress
  WHERE user_id = p_user_id AND completed = true;
  
  SELECT COUNT(*) INTO high_mastery_words
  FROM user_vocabulary
  WHERE user_id = p_user_id AND mastery_score >= 80;
  
  -- Award achievements based on criteria
  
  -- Vocabulary achievements
  IF vocab_count >= 1 THEN
    SELECT award_achievement(p_user_id, 'first_word', jsonb_build_object('words', vocab_count)) INTO achievement_awarded;
    IF achievement_awarded THEN
      new_achievements := new_achievements || jsonb_build_array('first_word');
    END IF;
  END IF;
  
  IF vocab_count >= 10 THEN
    SELECT award_achievement(p_user_id, 'vocab_collector', jsonb_build_object('words', vocab_count)) INTO achievement_awarded;
    IF achievement_awarded THEN
      new_achievements := new_achievements || jsonb_build_array('vocab_collector');
    END IF;
  END IF;
  
  IF vocab_count >= 50 THEN
    SELECT award_achievement(p_user_id, 'word_master', jsonb_build_object('words', vocab_count)) INTO achievement_awarded;
    IF achievement_awarded THEN
      new_achievements := new_achievements || jsonb_build_array('word_master');
    END IF;
  END IF;
  
  -- Quiz achievements
  IF quiz_count >= 1 THEN
    SELECT award_achievement(p_user_id, 'first_quiz', jsonb_build_object('quizzes', quiz_count)) INTO achievement_awarded;
    IF achievement_awarded THEN
      new_achievements := new_achievements || jsonb_build_array('first_quiz');
    END IF;
  END IF;
  
  IF quiz_count >= 5 THEN
    SELECT award_achievement(p_user_id, 'quiz_enthusiast', jsonb_build_object('quizzes', quiz_count)) INTO achievement_awarded;
    IF achievement_awarded THEN
      new_achievements := new_achievements || jsonb_build_array('quiz_enthusiast');
    END IF;
  END IF;
  
  IF perfect_quizzes >= 1 THEN
    SELECT award_achievement(p_user_id, 'perfectionist', jsonb_build_object('perfect_quizzes', perfect_quizzes)) INTO achievement_awarded;
    IF achievement_awarded THEN
      new_achievements := new_achievements || jsonb_build_array('perfectionist');
    END IF;
  END IF;
  
  IF avg_quiz_score >= 90 AND quiz_count >= 3 THEN
    SELECT award_achievement(p_user_id, 'high_achiever', jsonb_build_object('avg_score', avg_quiz_score, 'quizzes', quiz_count)) INTO achievement_awarded;
    IF achievement_awarded THEN
      new_achievements := new_achievements || jsonb_build_array('high_achiever');
    END IF;
  END IF;
  
  -- Song achievements
  IF song_count >= 1 THEN
    SELECT award_achievement(p_user_id, 'music_lover', jsonb_build_object('songs', song_count)) INTO achievement_awarded;
    IF achievement_awarded THEN
      new_achievements := new_achievements || jsonb_build_array('music_lover');
    END IF;
  END IF;
  
  IF song_count >= 5 THEN
    SELECT award_achievement(p_user_id, 'melody_master', jsonb_build_object('songs', song_count)) INTO achievement_awarded;
    IF achievement_awarded THEN
      new_achievements := new_achievements || jsonb_build_array('melody_master');
    END IF;
  END IF;
  
  -- Mastery achievement
  IF high_mastery_words >= 20 THEN
    SELECT award_achievement(p_user_id, 'mastery_expert', jsonb_build_object('mastered_words', high_mastery_words)) INTO achievement_awarded;
    IF achievement_awarded THEN
      new_achievements := new_achievements || jsonb_build_array('mastery_expert');
    END IF;
  END IF;
  
  RETURN new_achievements;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;