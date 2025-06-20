/*
  # Insert Midnight Clarity Song and Lyrics
  
  This migration inserts the "Midnight Clarity" song and its cleaned lyrics into the database.
  It removes descriptive tags (e.g., [Intro], [Chorus]) from the lyrics and stores only the actual lyrical content.
  
  ## Song Details:
  - Title: Midnight Clarity
  - Artist: Suno AI
  - Language: Japanese
  - Duration: 4:20 (260 seconds)
  - Genre: Indie Rock
  - Difficulty: Intermediate
  
  ## Lyrics Processing:
  - Removes all text enclosed in square brackets [like this]
  - Trims whitespace
  - Skips empty lines
  - Numbers lines sequentially
  - Leaves timestamps and translations as NULL for future implementation
*/

DO $$
DECLARE
    midnight_clarity_song_id UUID;
    raw_lyrics TEXT := $raw_lyrics$
[Intro][Genre: Indie Rock][Female Vocal][Clean Electric Guitar][Ambient]
[Rain]
雨上がりの街　午前3時
濡れたアスファルト　光を映して
[Verse 1][Mood: Introspective][Fingerpicked Guitar]
重かった肩が　ふと軽くなって
昨日の涙も　もう乾いてる
深呼吸ひとつ　空を見上げたら
星がひとつ　瞬いてた
[Pre-Chorus][Building Intensity]
怖かったものが
溶けていくように
心の中で　何かが変わる
[Chorus][Energy: High][Soaring Vocals][Full Band]
もう大丈夫　星が落ちても
Everything's alright　明日は来るから
足音響かせ　前を向いて
(息ができる)　やっと息ができる
[Verse 2][Return to Introspection]
桜の花びら　靴に張り付いて
春の記憶が　優しく香る
長かったトンネル　出口が見えて
朝の光が　待っている
[Pre-Chorus][Stronger Build]
苦しかった日々が
遠く霞んでく
新しい朝が　もうすぐそこに
[Chorus][Even Higher Energy]
もう怖くない　嵐が来ても
Everything's alright　君がいなくても
深呼吸して　空を見上げて
(自由になれる)　やっと自由になれる
[Bridge][Mood: Bittersweet][Orchestral Strings]
あの日　傘を分け合った
知らない人と　一瞬だけ
桜吹雪の中で　目が合って
That moment, frozen in time
刹那の永遠　覚えてる
Damn, 愛は儚くて美しい
[Chorus][Climactic][Gospel Vocals]
もう大丈夫　世界が終わっても
Everything's alright　一人でも歩ける
星屑になって　散っていっても
(明日を信じる)　明日を信じてる
[Outro][Fade Out][Dawn Ambience]
雨上がりの朝　鳥が鳴いて
新しい一日が　始まる
(Everything's alright)
(もう大丈夫)
$raw_lyrics$;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
BEGIN
    -- Insert the song "Midnight Clarity"
    INSERT INTO public.songs (
        title,
        artist,
        language,
        difficulty_level,
        genre,
        audio_url,
        cover_image_url,
        duration_seconds,
        is_published,
        is_premium,
        popularity_score
    ) VALUES (
        'Midnight Clarity',
        'Suno AI',
        'japanese',
        'intermediate',
        'indie rock',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/Midnight%20Clarity.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9NaWRuaWdodCBDbGFyaXR5Lm1wMyIsImlhdCI6MTc1MDQwMDU5NiwiZXhwIjoyMDY1NzYwNTk2fQ.Cx7gdjYllN-AdIHOTVpgepYZrN49hv7kEQpX-1t4Su8',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/midnightclarity.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvbWlkbmlnaHRjbGFyaXR5LmpwZWciLCJpYXQiOjE3NTA0MDA2NDIsImV4cCI6MjA2NTc2MDY0Mn0.hBesekdABk5dCH0T-60B66kxTDni8ThixbaY1zV6oIQ',
        260, -- 4 minutes and 20 seconds
        TRUE, -- Published
        FALSE, -- Not premium
        85 -- Good popularity score for a featured song
    ) RETURNING id INTO midnight_clarity_song_id;

    RAISE NOTICE 'Inserted song "Midnight Clarity" with ID: %', midnight_clarity_song_id;

    -- Split raw lyrics into individual lines
    lyric_lines := string_to_array(raw_lyrics, E'\n');

    -- Loop through each line, clean it, and insert into the lyrics table
    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus], [Mood: Introspective])
        cleaned_line := regexp_replace(cleaned_line, '\[.*?\]', '', 'g');
        
        -- Trim leading/trailing whitespace from the cleaned line
        cleaned_line := trim(cleaned_line);

        -- Only insert the line if it's not empty after cleaning
        IF cleaned_line IS NOT NULL AND cleaned_line != '' THEN
            line_num := line_num + 1;
            INSERT INTO public.lyrics (
                song_id,
                line_number,
                text,
                start_time_ms, -- No timestamps provided yet
                end_time_ms,   -- No timestamps provided yet
                translation    -- No translation provided yet
            ) VALUES (
                midnight_clarity_song_id,
                line_num,
                cleaned_line,
                NULL,
                NULL,
                NULL
            );
        END IF;
    END LOOP;

    RAISE NOTICE 'Inserted % lyric lines for "Midnight Clarity"', line_num;

END $$;

-- Verification query to check the inserted data
DO $$
DECLARE
    song_count INTEGER;
    lyric_count INTEGER;
BEGIN
    -- Check if song was inserted
    SELECT COUNT(*) INTO song_count FROM public.songs WHERE title = 'Midnight Clarity';
    RAISE NOTICE 'Songs with title "Midnight Clarity": %', song_count;
    
    -- Check lyric count
    SELECT COUNT(*) INTO lyric_count 
    FROM public.lyrics l 
    JOIN public.songs s ON l.song_id = s.id 
    WHERE s.title = 'Midnight Clarity';
    RAISE NOTICE 'Lyric lines for "Midnight Clarity": %', lyric_count;
    
    IF song_count = 1 AND lyric_count > 0 THEN
        RAISE NOTICE '✅ Migration completed successfully!';
    ELSE
        RAISE WARNING '❌ Migration may have failed. Song count: %, Lyric count: %', song_count, lyric_count;
    END IF;
END $$;

/*
  Expected Results After Migration:
  
  ✅ 1 new song record in public.songs table:
     - Title: "Midnight Clarity"
     - Artist: "Suno AI" 
     - Language: "japanese"
     - Duration: 260 seconds (4:20)
     - Genre: "indie rock"
     - Published and ready for lessons
  
  ✅ ~30+ lyric lines in public.lyrics table:
     - All descriptive tags removed (e.g., [Intro], [Chorus])
     - Only actual lyrical content preserved
     - Sequential line numbering
     - Timestamps and translations set to NULL for future implementation
  
  Next Steps:
  1. Apply this migration in your Supabase dashboard
  2. Create the dynamic route for individual songs (/lessons/[song_id])
  3. Update the music-artwork component to display lyrics
  4. Add the song to your lessons page for user selection
*/