-- Update Digital Butterfly lyrics with correct version
-- Migration: 20250717030000_update_digital_butterfly_lyrics.sql

DO $$
DECLARE
    digital_butterfly_song_id UUID;
    raw_lyrics TEXT;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
BEGIN
    -- Find Digital Butterfly song ID
    SELECT id INTO digital_butterfly_song_id 
    FROM public.songs 
    WHERE title = 'Digital Butterfly';

    IF digital_butterfly_song_id IS NULL THEN
        RAISE EXCEPTION 'Digital Butterfly song not found';
    END IF;

    RAISE NOTICE 'Found Digital Butterfly song with ID: %', digital_butterfly_song_id;

    -- Delete existing lyrics for Digital Butterfly
    DELETE FROM public.lyrics WHERE song_id = digital_butterfly_song_id;
    RAISE NOTICE 'Deleted existing lyrics for Digital Butterfly';

    -- New correct lyrics for Digital Butterfly
    raw_lyrics := '[Intro][Genre: J-Core Hyperpop][Tempo: 170bpm][Female Vocal][Mood: Building Euphoria]
システム起動、準備完了
(ログイン、ログイン)
新しい私が目覚める
(解放、解放)
[Verse 1][Energy: Rising][Vocoder Vocals]
灰色の街で息が詰まる
同じ顔ばかり、誰も見えない
窓の外はモノクロ写真
でも画面の向こうに答えがある
[Pre-Chorus][Building Intensity][Pitched Vocal Sample]
指先が震える、エンターキー
もう我慢できない、飛び出したい
3、2、1...
[Chorus][Energy: Maximum][Auto-tuned Vocals][Glitchy]
ログイン！色が爆発する！
ピクセルの翼で空を飛ぶ
本当の私がここにいる (ここにいる！)
デジタル世界で生まれ変わる
クソつまらない現実なんて
バイバイ！自由だ！最高だ！
(デジタル解放！デジタル解放！)
[Glass Break]
[Verse 2][Glitched Vocals][Energy: High]
アバターの肌が虹色に輝く
データの風が髪を撫でる
仮想の丘を駆け上がって
誰かとつながる、本物の絆
[Pre-Chorus][Vocal Chops]
心臓がビート刻む、BPM170
もう止まらない、進むだけ
無限大へ...
[Chorus][Harmonies][Maximum Energy]
ログイン！色が爆発する！
ピクセルの翼で空を飛ぶ
本当の私がここにいる (ここにいる！)
デジタル世界で生まれ変わる
クソつまらない現実なんて
バイバイ！自由だ！最高だ！
(デジタル解放！デジタル解放！)
[Break][Instrumental][Glitch Sound][Synth Solo]
[Bridge][Ethereal][Whisper to Belting]
01になって 10になって
二進法で愛を語る
みんなの光がつながって
銀河みたいに美しい
これが私たちの場所
(ここが私たちの場所！)
[Power Up Sound]
[Chorus][Final][Energy: Transcendent][Gang Vocals]
ログイン！色が爆発する！
ピクセルの翼で空を飛ぶ
本当の私がここにいる (永遠に！)
デジタル世界で生まれ変わる
グレーな過去なんて消去して
ヤバい！自由だ！最高だ！
(デジタル解放！デジタル解放！)
(みんな一緒に！みんな一緒に！)
[Outro][Fade Out][Pitched Samples]
ログアウトなんてしない
(ずっとここにいる)
色とりどりの未来へ
(デジタル蝶々...)';

    -- Split raw lyrics into individual lines
    lyric_lines := string_to_array(raw_lyrics, E'\n');

    -- Loop through each line, clean it, and insert into the lyrics table
    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus], [Mood: Building Euphoria])
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
                digital_butterfly_song_id,
                line_num,
                cleaned_line,
                NULL,
                NULL,
                NULL
            );
        END IF;
    END LOOP;

    RAISE NOTICE 'Inserted % lyrics lines for Digital Butterfly', line_num;

END $$;
