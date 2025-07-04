/*
 # Insert Songs: Batch 1
 
 This migration inserts the following songs and their cleaned lyrics into the database:
 - Sunshine Soda
 - When I Think of You
 - Fantasma de Terciopelo
 - Doko Made Mo
 
 ## Processing Details:
 - For each song, this script first inserts the main song record into the `public.songs` table.
 - It then processes the `raw_lyrics`, removing all descriptive tags (e.g., [Intro], [Chorus]) to store only the lyrical content.
 - Each cleaned lyric line is inserted into the `public.lyrics` table, linked to its parent song.
 - Timestamps and translations are left as NULL for future implementation.
 */
-- Song: Sunshine Soda
DO $ $ DECLARE song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Genre: Synth-Pop] [Mood: Euphoric] [Ocean Waves] [Birds Chirping] 陽光灑滿天空 海風輕輕哼著歌 [Synth Build-up] Are you ready ? Summer 's calling!
[Female Vocal][Ad-libs: "Let' s
go
    ! "]
[Verse 1]
[Energy: Building]
收拾行李裝滿期待 和你們一起逃離都市塵埃
手機關機模式現在 只想聽見海浪的節拍
[Female Vocal][Clear Vocals]
墨鏡反射著天空的藍 防曬霜是今天的香水品牌
踩著節奏往前走不回頭看 自由的感覺該死的讚
[Pre-Chorus]
[Tempo: Accelerating]
倒數三二一 (Three, two, one!)
派對要開始 (Let's have fun!)
[Harmonies]
今天我們是宇宙的中心
快樂像汽水般冒泡不停
[Chorus]
[Drop][Energy: High][Genre: EDM-Pop]
Summer party 在海邊 笑聲比陽光還耀眼
Dancing all night 星星是我們的 spotlight
[Female Vocal][Belting Vocals]
把音量開最大聲 青春就該這麼瘋
Beach time best time 讓回憶發光
(Oh-oh-oh 一起飛!)
[Verse 2]
[Groovy Bassline]
沙灘排球變成水戰 你的笑容是最美的明信片
烤肉香味混著鹹鹹海風 這個瞬間值得用心體驗
[Female Vocal][Playful Delivery]
收集貝殼像收集小星星 每個都是獨一無二的心情
夕陽把我們畫成剪影 這幅畫我要永遠收藏
[Pre-Chorus]
[Building Intensity]
倒數三二一 (Three, two, one!)
派對要開始 (Let's have fun!)
[Gang Vocals]
今天我們是宇宙的中心
快樂像汽水般冒泡不停
[Chorus]
[Energy: Maximum][Vocal Runs]
Summer party 在海邊 笑聲比陽光還耀眼
Dancing all night 星星是我們的 spotlight
[Ad-libs: " Yeah yeah ! "]
把音量開最大聲 青春就該這麼瘋
Beach time best time 讓回憶發光
(Oh-oh-oh 一起飛!)
[Bridge]
[Mood: Emotional][Tempo: Half-time]
當營火慢慢燃燒 影子在沙灘上舞蹈
[Harmonized Vocals]
這些時光太美好 希望時間能夠停靠
朋友是最珍貴的寶藏 比任何夏天都要閃亮
[Building Energy]
就算明天要分開 這份回憶永遠不會fade
[Chorus]
[Energy: Climactic][All Elements Combined]
Summer party 在海邊 笑聲比陽光還耀眼
(每一秒都燦爛!)
Dancing all night 星星是我們的 spotlight
(Shine so bright!)
[Powerful Vocals][Vocal Chops]
把音量開最大聲 青春就該這麼瘋
Beach time best time 讓回憶發光
(Oh-oh-oh 一起飛!)
[Applause]
[Outro]
[Fade Out][Ocean Waves][Distant Laughter]
陽光汽水的夏天 我們的故事未完
(Summer never ends...)
[Whispered Vocals]
See you next summer...
$raw_lyrics$;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
BEGIN
    -- Insert the song " Sunshine Soda "
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
        'Sunshine Soda',
        'Suno AI',
        'chinese',
        'intermediate',
        'chinese pop',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/Sunshine%20Soda.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9TdW5zaGluZSBTb2RhLm1wMyIsImlhdCI6MTc1MTQ5NzYwNywiZXhwIjoyMDY2ODU3NjA3fQ.H5sAviPbEdGaM-JXWwrY5KsNjC9IcXQpB-vTgZQQ-wM',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/Sunshine%20Soda.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvU3Vuc2hpbmUgU29kYS5qcGVnIiwiaWF0IjoxNzUxNDk3NjI1LCJleHAiOjIwNjY4NTc2MjV9.I7OXKXQKCMs8wbl3GmFT-QmrK5mkM593XNN6c51n96o',
        208,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

    RAISE NOTICE 'Inserted song " Sunshine Soda " with ID: %', song_id;

    -- Split raw lyrics into individual lines
    lyric_lines := string_to_array(raw_lyrics, E'\n');

    -- Loop through each line, clean it, and insert into the lyrics table
    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus])
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
                start_time_ms, -- Not provided
                end_time_ms,   -- Not provided
                translation    -- Not provided
            ) VALUES (
                song_id,
                line_num,
                cleaned_line,
                NULL,
                NULL,
                NULL
            );
        END IF;
    END LOOP;

    RAISE NOTICE 'Inserted % lyric lines for " Sunshine Soda "', line_num;

END $$;

-- Song: When I Think of You
DO $$
DECLARE
    song_id UUID;
    raw_lyrics TEXT := $raw_lyrics$
[Intro][Acoustic Guitar][Female Vocal][Mood: Dreamy][Genre: C-Pop]
清晨的阳光透过窗帘
想起你昨夜的温柔话语
咖啡香气弥漫房间
你的笑容还在我心里
[Verse][Acoustic Guitar][Piano][Shaker]
起床时看见你的毛衣
还挂在椅子上静静等待
手机里你发的晚安信息
让我的心跳都变得轻快
那些平凡的小小瞬间
都成了我最珍贵的画面
[Pre-Chorus][Building Intensity]
想你的时候
连空气都变甜了
想你的时候
时间都停止了
[Chorus][Harmonies][Emotional Bridge]
你在我心里每个角落
像春天的微风轻抚着我
想你的时候世界都温柔
你就是我心中最美的歌
(最美的歌，最美的歌)
每一天都想着你
(想着你，想着你)
[Verse][Acoustic Guitar][Piano]
回忆里你专注的侧脸
读书时皱眉的可爱模样
你说话时眼中的星光
让我忍不住想要靠近你
那些我们一起走过的路
现在独自经过也会想起你
[Pre-Chorus][Building Intensity]
想你的时候
连呼吸都是甜的
想你的时候
整个世界都亮了
[Chorus][Harmonies][Climactic]
你在我心里每个角落
像春天的微风轻抚着我
想你的时候世界都温柔
你就是我心中最美的歌
(最美的歌，最美的歌)
每一天都想着你
(想着你，想着你)
[Bridge][Whisper][Vulnerable Vocals]
如果你知道我有多想你
每个夜晚都梦见你的笑容
如果你知道你对我的意义
你就是我心中永遠的光
[Outro][Fade Out][Acoustic Guitar][Soft]
想你的时候
世界都变温柔了
你在我心里
永远不会离开
(永远不会离开)
$raw_lyrics$;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
BEGIN
    -- Insert the song "
    When I Think of You "
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
        'When I Think of You',
        'Suno AI',
        'chinese',
        'intermediate',
        'chinese pop',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/When%20I%20Think%20of%20You.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9XaGVuIEkgVGhpbmsgb2YgWW91Lm1wMyIsImlhdCI6MTc1MTUwMTk0NCwiZXhwIjoyMDY2ODYxOTQ0fQ.U0owoEi2U303Nwb48dbWJj2KPDKGexnZoWuoPvZD8jE',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/When%20I%20Think%20of%20You.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvV2hlbiBJIFRoaW5rIG9mIFlvdS5qcGVnIiwiaWF0IjoxNzUxNTAxOTMyLCJleHAiOjIwNjY4NjE5MzJ9.Kqrn3Ew7SknF_UdRoAjjIIcfnFbvPGv8tWOsYJwbV5k',
        239,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

    RAISE NOTICE 'Inserted song "
    When I Think of You " with ID: %', song_id;

    -- Split raw lyrics into individual lines
    lyric_lines := string_to_array(raw_lyrics, E'\n');

    -- Loop through each line, clean it, and insert into the lyrics table
    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus])
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
                start_time_ms, -- Not provided
                end_time_ms,   -- Not provided
                translation    -- Not provided
            ) VALUES (
                song_id,
                line_num,
                cleaned_line,
                NULL,
                NULL,
                NULL
            );
        END IF;
    END LOOP;

    RAISE NOTICE 'Inserted % lyric lines for "
    When I Think of You "', line_num;

END $$;

-- Song: Fantasma de Terciopelo
DO $$
DECLARE
    song_id UUID;
    raw_lyrics TEXT := $raw_lyrics$
[Intro][Male Vocal][Nylon Guitar][Melancholic Atmosphere]
[Guitar Solo]
Mmm... ah...
[Verse 1][Male Vocal][Sensual]
En esta habitación vacía
Tu perfume aún vive en mi almohada
Las fotos se vuelven ceniza
Mientras bailo con tu mirada
[Footsteps]
Soy un reloj parado en tu hora
Un náufrago en mi propia cama
El espejo sólo me devora
La mitad de quien te amaba
[Pre-Chorus][Male Vocal][Building Intensity]
Y aunque sé que ya no volverás
(No volverás)
Tu fantasma aquí se quedará
(Se quedará)
[Chorus][Male Vocal][Emotional Bridge][Syncopated Rhythm]
Bailo con tu sombra en la penumbra
De este cuarto donde el silencio zumba
Eres terciopelo que me envuelve y tumba
Un fantasma dulce que me derrumba
(Que me derrumba)
[Verse 2][Male Vocal][Vulnerable Vocals]
[Whisper]
Dos copas de vino en la mesa
Una llena de tu ausencia
Mi corazón es la promesa
De un teatro sin tu presencia
[Rain]
Las paredes guardan los secretos
De tus risas y mis derrotas
Soy un libro de versos incompletos
Donde tu nombre aún me agota
[Pre-Chorus][Male Vocal][Harmonies]
Y aunque sé que ya no volverás
(No volverás)
Tu fantasma aquí se quedará
(Se quedará)
[Chorus][Male Vocal][Climactic]
Bailo con tu sombra en la penumbra
De este cuarto donde el silencio zumba
Eres terciopelo que me envuelve y tumba
Un fantasma dulce que me derrumba
(Que me derrumba)
[Bridge][Male Vocal][Percussion Break][Ad-libs]
Maldigo el día que aprendí tu nombre
(Maldita sea)
Bendigo las noches que fuiste mi hombre
Me dejaste medio muerto, medio vivo
(Medio vivo)
Un fantasma de mí mismo, fugitivo
[Heartbeat]
[Chorus][Male Vocal][Powerful Outro]
Bailo con tu sombra en la penumbra
De este cuarto donde el silencio zumba
Eres terciopelo que me envuelve y tumba
Un fantasma dulce que me derrumba
[Outro][Male Vocal][Fade Out][Whisper]
Y sigo aquí... bailando solo
(Bailando solo)
Con tu fantasma de terciopelo
(De terciopelo)
[Footsteps in Distance]
$raw_lyrics$;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
BEGIN
    -- Insert the song " Fantasma de Terciopelo "
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
        'Fantasma de Terciopelo',
        'Suno AI',
        'spanish',
        'intermediate',
        'bachata, latin',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/Fantasma%20de%20Terciopelo.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9GYW50YXNtYSBkZSBUZXJjaW9wZWxvLm1wMyIsImlhdCI6MTc1MTUwMzIzNiwiZXhwIjoyMDY2ODYzMjM2fQ.cB3Gr4bDYLiq5PolgrowkRM9MzVeziEqV6cgWJ79B54',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/Fantasma%20de%20Terciopelo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvRmFudGFzbWEgZGUgVGVyY2lvcGVsby5qcGVnIiwiaWF0IjoxNzUxNTAzMjUzLCJleHAiOjIwNjY4NjMyNTN9.VJ2veYCHtiMJNu6moopEKdWAJE0Iia29C7DKGeJdOqU',
        218,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

    RAISE NOTICE 'Inserted song " Fantasma de Terciopelo " with ID: %', song_id;

    -- Split raw lyrics into individual lines
    lyric_lines := string_to_array(raw_lyrics, E'\n');

    -- Loop through each line, clean it, and insert into the lyrics table
    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus])
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
                start_time_ms, -- Not provided
                end_time_ms,   -- Not provided
                translation    -- Not provided
            ) VALUES (
                song_id,
                line_num,
                cleaned_line,
                NULL,
                NULL,
                NULL
            );
        END IF;
    END LOOP;

    RAISE NOTICE 'Inserted % lyric lines for " Fantasma de Terciopelo "', line_num;

END $$;

-- Song: Doko Made Mo
DO $$
DECLARE
    song_id UUID;
    raw_lyrics TEXT := $raw_lyrics$
[Intro][Female Vocal][Acoustic Guitar][Mood: Peaceful]
午後の光が
窓に踊る
[Train Passing]
[Verse 1][Tempo: 74bpm][Genre: Indie Folk]
ローカル線に揺られて
行き先は決めないまま
緑の田んぼ 小さな町
ガタンゴトン リズムに乗って
[Pre-Chorus][Harmonies]
窓の外 流れる景色
まるで映画みたいに
時間がゆっくり
溶けていく
[Chorus][Mood: Uplifting][Shaker]
どこへ行こう どこまでも
My easy day (my easy day)
青い空と一緒に
ゆらゆら揺れて
[Verse 2][Acoustic Guitar][Walking Bass Line]
知らない駅で
誰かが降りて
また新しい物語
始まるのかな
[Pre-Chorus][Soft Percussion]
午後の風が
頬を撫でて
この瞬間が
愛おしい
[Chorus][Female Vocal][Harmonies]
どこへ行こう どこまでも
My easy day (my easy day)
青い空と一緒に
ゆらゆら揺れて
[Bridge][Mood: Introspective][Minimal Instrumentation]
時刻表も地図もいらない
心のままに
[Birds Chirping]
ただ座って
景色を見てる
[Chorus][Build-up][Brushed Snare]
どこへ行こう どこまでも
Going my way (going my way)
夕陽に染まる
車窓の向こう
[Outro][Fade Out][Acoustic Guitar]
ガタン... ゴトン...
My easy day
ガタン... ゴトン...
[Train Whistle]
$raw_lyrics$;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
BEGIN
    -- Insert the song " Doko Made Mo "
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
        'Doko Made Mo',
        'Suno AI',
        'japanese',
        'intermediate',
        'indie folk',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/Doko%20Made%20Mo.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9Eb2tvIE1hZGUgTW8ubXAzIiwiaWF0IjoxNzUxNTAzMzU5LCJleHAiOjIwNjY4NjMzNTl9.tC9beyyuUQcl0Jk6mKdstiJ1Ied2AblMPwEiBXqv1fs',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/Doko%20Made%20Mo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvRG9rbyBNYWRlIE1vLmpwZWciLCJpYXQiOjE3NTE1MDMzNDMsImV4cCI6MjA2Njg2MzM0M30.zsajN9hTNsyA4y0AjUj5dRUTZtGdTWiFdQTSjweiOW8',
        188,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

    RAISE NOTICE 'Inserted song " Doko Made Mo " with ID: %', song_id;

    -- Split raw lyrics into individual lines
    lyric_lines := string_to_array(raw_lyrics, E'\n');

    -- Loop through each line, clean it, and insert into the lyrics table
    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus])
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
                start_time_ms, -- Not provided
                end_time_ms,   -- Not provided
                translation    -- Not provided
            ) VALUES (
                song_id,
                line_num,
                cleaned_line,
                NULL,
                NULL,
                NULL
            );
        END IF;
    END LOOP;

    RAISE NOTICE 'Inserted % lyric lines for " Doko Made Mo "', line_num;

END $$;

-- Verification query to check the inserted data for batch 1
DO $$
DECLARE
    song_count INTEGER;
    sunshinesoda_lyrics_count INTEGER;
    whenithinkofyou_lyrics_count INTEGER;
    fantsmadeterciopelo_lyrics_count INTEGER;
    dokomademo_lyrics_count INTEGER;
BEGIN
    -- Check if all songs were inserted
    SELECT COUNT(*) INTO song_count FROM public.songs WHERE title IN ('Sunshine Soda', 'When I Think of You', 'Fantasma de Terciopelo', 'Doko Made Mo');
    RAISE NOTICE 'Songs from batch 1 inserted: %/4', song_count;
    
    -- Check lyric counts for each song

    SELECT COUNT(*) INTO sunshinesoda_lyrics_count
    FROM public.lyrics l 
    JOIN public.songs s ON l.song_id = s.id 
    WHERE s.title = 'Sunshine Soda';
    SELECT COUNT(*) INTO whenithinkofyou_lyrics_count
    FROM public.lyrics l 
    JOIN public.songs s ON l.song_id = s.id 
    WHERE s.title = 'When I Think of You';
    SELECT COUNT(*) INTO fantsmadeterciopelo_lyrics_count
    FROM public.lyrics l 
    JOIN public.songs s ON l.song_id = s.id 
    WHERE s.title = 'Fantasma de Terciopelo';
    SELECT COUNT(*) INTO dokomademo_lyrics_count
    FROM public.lyrics l 
    JOIN public.songs s ON l.song_id = s.id 
    WHERE s.title = 'Doko Made Mo';
RAISE NOTICE 'Lyric lines for " Sunshine Soda ": %', sunshinesoda_lyrics_count;
RAISE NOTICE 'Lyric lines for "
    When I Think of You ": %', whenithinkofyou_lyrics_count;
RAISE NOTICE 'Lyric lines for " Fantasma de Terciopelo ": %', fantsmadeterciopelo_lyrics_count;
RAISE NOTICE 'Lyric lines for " Doko Made Mo ": %', dokomademo_lyrics_count;
    
    IF song_count = 4 AND sunshinesoda_lyrics_count > 0 AND whenithinkofyou_lyrics_count > 0 AND fantsmadeterciopelo_lyrics_count > 0 AND dokomademo_lyrics_count > 0 THEN
        RAISE NOTICE '✅ Migration for batch 1 completed successfully!';
    ELSE
        RAISE WARNING '❌ Migration for batch 1 may have failed. Song count: %, check lyric counts above.', song_count;
    END IF;
END $$;