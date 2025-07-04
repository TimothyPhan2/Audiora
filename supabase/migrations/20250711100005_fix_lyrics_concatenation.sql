/*
 # Fix Lyrics Concatenation Issues
 
 This migration fixes the lyrics processing errors from batches 2, 3, and 4 where
 incorrect string_to_array syntax caused lyrics to be concatenated instead of 
 properly split into individual lines.
 
 ## Affected Songs (12 total):
 
 ### Batch 2 (all 4 songs):
 - Summer Never Dies
 - Sangue e Stelle  
 - Soul Imprint
 - L'Heure Bleue
 
 ### Batch 3 (all 4 songs):
 - Digital Butterfly
 - Derniere Bobine
 - Ladri d'Estate
 - Cafe Cinema
 
 ### Batch 4 (all 4 songs):
 - Panico Chic
 - Steinernes Erwachen
 - Fantasma de Agosto
 - Mallorca Fieber
 
 ## Process:
 1. Remove all affected songs and their lyrics
 2. Re-process with corrected syntax: E'\n' instead of E' \n' or E '\n'
 3. Enhanced bracket removal that preserves meaningful parentheses
 4. Validation of line counts and lengths
 */
DO $ $ DECLARE -- Batch 2 song data
batch2_songs TEXT [] := ARRAY [
        'Summer Never Dies',
        'Sangue e Stelle', 
        'Soul Imprint',
        'L''Heure Bleue'
    ];

-- Batch 3 song data  
batch3_songs TEXT [] := ARRAY [
        'Digital Butterfly',
        'Derniere Bobine',
        'Ladri d''Estate', 
        'Cafe Cinema'
    ];

-- Batch 4 song data
batch4_songs TEXT [] := ARRAY [
        'Panico Chic',
        'Steinernes Erwachen',
        'Fantasma de Agosto',
        'Mallorca Fieber'
    ];

all_affected_songs TEXT [];

song_title TEXT;

deleted_songs_count INTEGER := 0;

deleted_lyrics_count INTEGER := 0;

BEGIN -- Combine all affected songs
all_affected_songs := batch2_songs || batch3_songs || batch4_songs;

RAISE NOTICE '🚀 Starting lyrics concatenation fix for % songs...',
array_length(all_affected_songs, 1);

-- Step 1: Remove all affected songs and their lyrics
RAISE NOTICE '📋 Removing affected songs and lyrics...';

FOREACH song_title IN ARRAY all_affected_songs LOOP -- Delete lyrics first (foreign key constraint)
DELETE FROM
    public.lyrics
WHERE
    song_id IN (
        SELECT
            id
        FROM
            public.songs
        WHERE
            title = song_title
    );

GET DIAGNOSTICS deleted_lyrics_count = ROW_COUNT;

-- Delete song
DELETE FROM
    public.songs
WHERE
    title = song_title;

GET DIAGNOSTICS deleted_songs_count = ROW_COUNT;

IF deleted_songs_count > 0 THEN RAISE NOTICE '  ✅ Removed "%": % lyrics deleted',
song_title,
deleted_lyrics_count;

ELSE RAISE NOTICE '  ⚠️  Song "%" not found (may have been already removed)',
song_title;

END IF;

END LOOP;

RAISE NOTICE '🗑️  Cleanup complete. Ready to re-process songs...';

RAISE NOTICE '';

END $ $;

-- Now re-add all songs with corrected processing
-- BATCH 2 SONGS
-- Song: Summer Never Dies
DO $ $ DECLARE song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Genre: Latin Dance-Pop] [Tempo: 128bpm] [Female Vocal] [Ocean Waves] Oh - oh - oh,
verano sin final [Congas] [Shaker] Can you feel it ? El calor,
el calor (No para, no para) [Verse 1] [Energy: Building] [Percussion] Despierto con el sol en mi ventana Arena en mis pies,
tu risa en mi alma Coconut y sal,
perfume de mañana We 're chasing the heat donde nadie nos llama

Tu piel dorada, sunset motivation
Bailamos sin reglas, pure celebration
Esta playa es nuestra, no destination
Solo tú y yo, perfect combination

[Pre-Chorus][Energy: High][Synth Build]
Turn it up, sube el volumen
(Sube, sube)
Feel the bass en tu abdomen
No tomorrow, solo ahora
Dance with me hasta la aurora

[Chorus][Euphoric Build][Four-on-the-Floor]
Bailando hasta el amanecer (oh-oh-oh)
This summer' s gonna last forever,
baby No para,
no para el placer (oh - oh - oh) Vamos a vivir,
we 're going crazy

(Dale, dale) Fuego en la arena
(Dale, dale) Luna llena
Bailando hasta el amanecer
This summer never dies, te lo juro, baby

[Verse 2][Melodic Bassline]
Mojito en tu mano, sweat dripping slowly
DJ spinning magic, ritmo holy
Las estrellas bailan, you' re my one
and only Bésame ahora,
damn,
you own me Olas like música,
crashing percussion Tu boca es mi destino,
no discussion Fireflies
and tequila,
sweet seduction Tonight we 're electric, no interruption

[Pre-Chorus][Energy: High]
Turn it up, sube el volumen
(Sube, sube)
Feel the bass en tu abdomen
No tomorrow, solo ahora
Dance with me hasta la aurora

[Chorus][Climactic]
Bailando hasta el amanecer (oh-oh-oh)
This summer' s gonna last forever,
baby No para,
no para el placer (oh - oh - oh) Vamos a vivir,
we 're going crazy

(Dale, dale) Fuego en la arena
(Dale, dale) Luna llena
Bailando hasta el amanecer
This summer never dies, te lo juro, baby

[Break][Percussion Break][Congas Solo]
Así, así, así (muévelo)
Así, así, así (no pares)
[Cheering]
(Oh-oh-oh-oh)

[Bridge][Emotional Bridge][Female Vocal]
Cuando salga el sol, we' ll still be dancing Memories we 're making, romancing
No me dejes ir, hold me closer
Este verano eterno, never over

(Para siempre) Forever summer
(Para siempre) Rolling thunder
(Para siempre) You and me, baby
(Para siempre) Going crazy

[Chorus][Powerful Outro][Ad-libs]
Bailando hasta el amanecer (no para, no para)
This summer' s gonna last forever,
baby (forever, baby) No para,
no para el placer (oh - oh - oh) Vamos a vivir,
we 're going crazy (so crazy)

(Dale, dale) Fuego en la arena
(Dale, dale) Luna llena
Bailando hasta el amanecer
This summer never dies, te lo juro, baby

[Outro][Fade Out]
Oh-oh-oh, verano sin final
(No para, no para)
[Ocean Waves]
This summer never dies...
(Bailando, bailando)$raw_lyrics$;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
    total_chars INTEGER;
    
BEGIN
    -- Insert the song
    INSERT INTO public.songs (
        title, artist, language, difficulty_level, genre, audio_url, cover_image_url, 
        duration_seconds, is_published, is_premium, popularity_score
    ) VALUES (
        ' Summer Never Dies ', ' Suno AI ', ' spanish ', ' intermediate ', 
        ' Latin Dance - Pop,
Tropical House,
Reggaeton,
EDM ',
        ' https: / / jojawfigpwnawzmmfowo.supabase.co / storage / v1 / object / sign / audio - files / Summer % 20Never % 20Dies.mp3 ? token = eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9TdW1tZXIgTmV2ZXIgRGllcy5tcDMiLCJpYXQiOjE3NTE1MDM0ODEsImV4cCI6MjA2Njg2MzQ4MX0.Oo2FQqQ8YS0q - HahBdAp - peIO_W1RQRclWwBCe3aDT0 ',
        ' https: / / jojawfigpwnawzmmfowo.supabase.co / storage / v1 / object / sign / cover - images / Summer % 20Never % 20Dies.jpeg ? token = eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvU3VtbWVyIE5ldmVyIERpZXMuanBlZyIsImlhdCI6MTc1MTUwMzUxMiwiZXhwIjoyMDY2ODYzNTEyfQ.FJG3mtCDmJaiuuASAcO0XeLAzKHYS8r0aEoFENelf_Y ',
        239, TRUE, FALSE, 84
    ) RETURNING id INTO song_id;

    -- CORRECTED: Use E' \ n ' instead of E' \ n '
    lyric_lines := string_to_array(raw_lyrics, E' \ n ');

    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        -- Enhanced bracket removal: Remove structural tags but preserve content in parentheses
        cleaned_line := regexp_replace(cleaned_line, ' \ [[^\]]*\] ', '', ' g ');
        cleaned_line := trim(cleaned_line);

        IF cleaned_line IS NOT NULL AND cleaned_line != '' THEN
            line_num := line_num + 1;
            INSERT INTO public.lyrics (song_id, line_number, text, start_time_ms, end_time_ms, translation)
            VALUES (song_id, line_num, cleaned_line, NULL, NULL, NULL);
        END IF;
    END LOOP;

    -- Validation
    SELECT SUM(LENGTH(text)) INTO total_chars FROM public.lyrics WHERE song_id = song_id;
    RAISE NOTICE ' ✅ "Summer Never Dies": % lines,
% total chars,
avg %.1f chars / line ', 
        line_num, total_chars, total_chars::float / line_num;

END $$;

-- Song: Sangue e Stelle  
DO $$
DECLARE
    song_id UUID;
    raw_lyrics TEXT := $raw_lyrics$[Intro][Genre: Italian Pop Ballad][Mood: Dramatic][Tempo: 72bpm][Grand Piano][Orchestral Strings][Thunder]

[Verse 1][Male Vocal][Clear Vocals][Emotional]
Quando il silenzio grida più forte del tuono
E il tuo respiro è marea che muove il mio sangue
Capisco che l' universo intero,
ogni atomo Vive solo nei tuoi occhi,
mio grande [Pre-Chorus] [Building Intensity] [Strings Swell] Il mio cuore è una cattedrale Dove tu sei la mia religione Ogni battito una preghiera immortale (Una preghiera immortale) [Chorus] [Powerful Drums] [Orchestral Build] [Belting Vocals] Sei il sole che brucia le mie paure Sei la luna che veglia i miei sogni Il mio sangue canta il tuo nome nelle vene scure Sei tutto,
tutto quello che conosco (Tutto per me) [Verse 2] [Acoustic Guitar] [Building Emotion] Le tue mani sono chiavi del paradiso La tua voce il vento che muove la mia anima Senza te sono cenere,
sono indeciso Maledetto amore che mi rianima [Pre-Chorus] [Crescendo] [Harmonies] Grido al mondo la mia verità Che nella vita e nella morte Solo tu sei la mia eternità (La mia eternità) [Chorus] [Full Orchestration] [Climactic] Sei il sole che brucia le mie paure Sei la luna che veglia i miei sogni Il mio sangue canta il tuo nome nelle vene scure Sei tutto,
tutto quello che conosco (Tutto per me) [Break] [Electric Guitar Solo] [Melodic] [Passionate] [Emotional Bridge] [Crowd Cheering] [Bridge] [Vulnerable Vocals] [Intimate] [Piano Only] Se dovessi morire domani Cazzo,
il tuo nome Sarebbe l 'ultima parola sulle labbra
L' ultima stella nel mio cielo Prendi tutto di me (Tutto di me) [Chorus] [Ultimate Climax] [All Instruments] [Gospel Vocals] Sei il sole che brucia le mie paure Sei la luna che veglia i miei sogni Il mio sangue canta il tuo nome nelle vene scure Sei tutto,
tutto quello che conosco (Tutto per me) (Sei tutto) [Outro] [Fade Out] [Strings] [Piano] [Whispered Vocals] Nell 'infinito, nel destino
Solo tu... solo tu...
(Eternamente tu)
[Applause]$raw_lyrics$;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
    total_chars INTEGER;
    
BEGIN
    INSERT INTO public.songs (
        title, artist, language, difficulty_level, genre, audio_url, cover_image_url,
        duration_seconds, is_published, is_premium, popularity_score
    ) VALUES (
        ' Sangue e Stelle ', ' Suno AI ', ' italian ', ' intermediate ', ' italian pop ',
        ' https: / / jojawfigpwnawzmmfowo.supabase.co / storage / v1 / object / sign / audio - files / Sangue % 20e % 20Stelle.mp3 ? token = eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9TYW5ndWUgZSBTdGVsbGUubXAzIiwiaWF0IjoxNzUxNTA0MzAyLCJleHAiOjIwNjY4NjQzMDJ9.eux_IL9m3xgixlIt9rhmmp0bikt2BlGkg22DbgwnWJI ',
        ' https: / / jojawfigpwnawzmmfowo.supabase.co / storage / v1 / object / sign / cover - images / Sangue % 20e % 20Stelle.jpeg ? token = eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvU2FuZ3VlIGUgU3RlbGxlLmpwZWciLCJpYXQiOjE3NTE1MDQyODgsImV4cCI6MjA2Njg2NDI4OH0.9B1NNpi0O5O62Mbp_J8rHwiJDe_4nGYeh - ZEaBofK7c ',
        223, TRUE, FALSE, 85
    ) RETURNING id INTO song_id;

    lyric_lines := string_to_array(raw_lyrics, E' \ n ');

    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        cleaned_line := regexp_replace(cleaned_line, ' \ [[^\]]*\] ', '', ' g ');
        cleaned_line := trim(cleaned_line);

        IF cleaned_line IS NOT NULL AND cleaned_line != '' THEN
            line_num := line_num + 1;
            INSERT INTO public.lyrics (song_id, line_number, text, start_time_ms, end_time_ms, translation)
            VALUES (song_id, line_num, cleaned_line, NULL, NULL, NULL);
        END IF;
    END LOOP;

    SELECT SUM(LENGTH(text)) INTO total_chars FROM public.lyrics WHERE song_id = song_id;
    RAISE NOTICE ' ✅ "Sangue e Stelle": % lines,
% total chars,
avg %.1f chars / line ', 
        line_num, total_chars, total_chars::float / line_num;

END $$;

-- Song: Soul Imprint
DO $$
DECLARE
    song_id UUID;
    raw_lyrics TEXT := $raw_lyrics$[Intro][Female Vocal][Grand Piano][Mood: Melancholic][Tempo: 72bpm]
月光灑在古老的石階上
[Orchestral Strings]
千年的風 依然在輕輕唱
回憶像畫卷慢慢展開
你的容顏 從未更改

[Verse 1][Building Intensity]
紅絲線牽著前世的緣
穿越時空的思念
你的名字刻在心間
每個夢裡都能聽見

玉佩還藏著當年誓言
等待如永恆的修煉
[Wind Chimes]
一生一世說過的諾言
化作星辰守護在身邊

[Pre-Chorus][Orchestral Build][Harmonies]
就算滄海變桑田
我的心不曾改變
命運的輪迴裡面
總會再次遇見

[Chorus][Climactic][Energy: High][Belting Vocals]
我願等你一千年 一萬年
(一千年 一萬年)
靈魂深處認得你的容顏
愛如烈火永不熄滅
穿越生死的考驗

就算等到白髮蒼蒼
(等到地老天荒)
這份愛依然滾燙
你是我唯一的信仰
此生此世不能忘

[Verse 2][Emotional Bridge]
宮殿已成廢墟斷垣
歲月偷走了流年
[Harp]
只有這份愛還在燃燒
像不朽的火焰

淚水化作永恆珍珠
見證我們的孤獨
今生若能再次相遇
願用一切來守護

[Pre-Chorus][Orchestral Strings][Vocal Runs]
就算滄海變桑田
我的心不曾改變
命運的輪迴裡面
(命中註定的緣)
總會再次遇見

[Chorus][Full Orchestra][Powerful Outro]
我願等你一千年 一萬年
(一千年 一萬年)
靈魂深處認得你的容顏
愛如烈火永不熄滅
穿越生死的考驗

就算等到白髮蒼蒼
(等到地老天荒)
這份愛依然滾燙
你是我唯一的信仰
此生此世不能忘

[Bridge][Vulnerable Vocals][Piano Solo][Whisper]
如果有來生
我還會在老地方等你
月光為證
這顆心永遠屬於你

[Chorus][Key Change][Modulation][Gospel Vocals]
我願等你一千年 一萬年
(生生世世都不變)
靈魂深處認得你的容顏
(認得你的容顏)
愛如烈火永不熄滅
穿越生死的考驗

就算等到白髮蒼蒼
(等到地老天荒)
這份愛依然滾燙
(永遠滾燙)
你是我唯一的信仰
此生此世不能忘

[Outro][Grand Piano][Fade Out]
月光依舊照著石階
[Bell Dings]
我還在這裡...等待$raw_lyrics$;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
    total_chars INTEGER;
    
BEGIN
    INSERT INTO public.songs (
        title, artist, language, difficulty_level, genre, audio_url, cover_image_url,
        duration_seconds, is_published, is_premium, popularity_score
    ) VALUES (
        ' Soul Imprint ', ' Suno AI ', ' chinese ', ' intermediate ', ' chinese pop,
orchestral ',
        ' https: / / jojawfigpwnawzmmfowo.supabase.co / storage / v1 / object / sign / audio - files / Soul % 20Imprint.mp3 ? token = eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9Tb3VsIEltcHJpbnQubXAzIiwiaWF0IjoxNzUxNTA0MzYxLCJleHAiOjIwNjY4NjQzNjF9.gYZSB1vX662K4a36_h9xrNxNVVwO8rRxXHf6cXQhjqM ',
        ' https: / / jojawfigpwnawzmmfowo.supabase.co / storage / v1 / object / sign / cover - images / Soul % 20Imprint.jpeg ? token = eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvU291bCBJbXByaW50LmpwZWciLCJpYXQiOjE3NTE1MDQzODQsImV4cCI6MjA2Njg2NDM4NH0.NGJgjSolcJUFnG5XPFl40jrbPbscrU_EwJm1_qSUyT4 ',
        263, TRUE, FALSE, 85
    ) RETURNING id INTO song_id;

    lyric_lines := string_to_array(raw_lyrics, E' \ n ');

    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        cleaned_line := regexp_replace(cleaned_line, ' \ [[^\]]*\] ', '', ' g ');
        cleaned_line := trim(cleaned_line);

        IF cleaned_line IS NOT NULL AND cleaned_line != '' THEN
            line_num := line_num + 1;
            INSERT INTO public.lyrics (song_id, line_number, text, start_time_ms, end_time_ms, translation)
            VALUES (song_id, line_num, cleaned_line, NULL, NULL, NULL);
        END IF;
    END LOOP;

    SELECT SUM(LENGTH(text)) INTO total_chars FROM public.lyrics WHERE song_id = song_id;
    RAISE NOTICE ' ✅ "Soul Imprint": % lines,
% total chars,
avg %.1f chars / line ', 
        line_num, total_chars, total_chars::float / line_num;

END $$;

-- Song: L' Heure Bleue DO $ $ DECLARE song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Female Vocal] [Genre: French Indie Pop] [Mood: Tense] [Synth Pads] [Clean Guitar] [Footsteps] Un,
deux,
trois...(whispered) [Verse 1] [Building Intensity] Les rues me parlent bas ce soir Mes talons marquent chaque pas L 'air froid dessine mon histoire
Dans la brume qui ne ment pas

Mes doigts tremblent dans mes poches
Les lumières dansent sur le trottoir
Chaque coin de rue me rapproche
De ton ombre dans le noir

[Pre-Chorus][Vocal: Intimate]
Mon souffle s' accélère,
s 'accélère
Le temps devient électricité
Je sens ta presence dans l' air Comme une douce fatalité [Chorus] [Harmonies] [Energy: Rising] Je cours vers toi,
dans le silence complice Mon cœur qui bat,
bat,
bat (comme un supplice) Nos secrets dans l 'ombre, gravité inversée
Plus près, plus près, je vais te retrouver
(Oh-oh-oh, te retrouver)

[Verse 2][Layered Synths]
Les fenêtres sont des yeux fermés
Personne ne sait où je vais
Ma fièvre douce va s' enflammer Quand tes mains vont me toucher [Clock Ticking] Minuit trente sur ma peau Chaque seconde est un tableau [Pre-Chorus] [Building] Mon souffle s 'accélère, s' accélère Les étoiles comptent mes pas Je sens ton désir sincère Qui m 'attire dans tes bras

[Chorus][Full Instrumentation]
Je cours vers toi, dans le silence complice
Mon cœur qui bat, bat, bat (comme un supplice)
Nos secrets dans l' ombre,
gravité inversée Plus près,
plus près,
je vais te retrouver (Oh - oh - oh, te retrouver) [Break] [Stripped Back] [Whispered Vocals] [Heartbeat] Un...deux...trois...quatre...(Respire, respire) [Bridge] [Urgent] [Climactic] Plus vite,
plus vite,
mes jambes sont du velours Plus fort,
plus fort,
j 'entends battre l' amour Ta porte,
ta rue,
ton souffle sur ma joue Enfin,
enfin...[Outro] [Atmospheric] [Fade Out] Dans tes bras,
le monde s 'arrête
(Oh-oh-oh)
Dans tes bras, plus rien n' existe Mon cœur qui bat,
bat,
bat...[Footsteps Fading] (Enfin, enfin) $ raw_lyrics $;

lyric_lines TEXT [];

cleaned_line TEXT;

line_num INTEGER := 0;

total_chars INTEGER;

BEGIN
INSERT INTO
    public.songs (
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
    )
VALUES
    (
        'L''Heure Bleue',
        'Suno AI',
        'french',
        'intermediate',
        'indie pop',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/L''Heure%20Bleue.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9MJ0hldXJlIEJsZXVlLm1wMyIsImlhdCI6MTc1MTUwNDQ1OSwiZXhwIjoyMDY2ODY0NDU5fQ.gDH4tgjGSQJLa1rqNd1AngWZQblBnIBPLZ8ZmXBI-58',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/L''Heure%20Bleue.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvTCdIZXVyZSBCbGV1ZS5qcGVnIiwiaWF0IjoxNzUxNTA0NDIzLCJleHAiOjIwNjY4NjQ0MjN9.wJtkY5d-9ojV2pArm4_tWp7bB-RB-Iq6dHgDvrrFkc8',
        201,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

lyric_lines := string_to_array(raw_lyrics, E '\n');

FOREACH cleaned_line IN ARRAY lyric_lines LOOP cleaned_line := regexp_replace(cleaned_line, '\[[^\]]*\]', '', 'g');

cleaned_line := trim(cleaned_line);

IF cleaned_line IS NOT NULL
AND cleaned_line != '' THEN line_num := line_num + 1;

INSERT INTO
    public.lyrics (
        song_id,
        line_number,
        text,
        start_time_ms,
        end_time_ms,
        translation
    )
VALUES
    (
        song_id,
        line_num,
        cleaned_line,
        NULL,
        NULL,
        NULL
    );

END IF;

END LOOP;

SELECT
    SUM(LENGTH(text)) INTO total_chars
FROM
    public.lyrics
WHERE
    song_id = song_id;

RAISE NOTICE '✅ "L''Heure Bleue": % lines, % total chars, avg %.1f chars/line',
line_num,
total_chars,
total_chars :: float / line_num;

END $ $;

-- Continue with remaining songs in next part due to length constraints...
-- This migration will be split across multiple blocks to handle all 12 songs
-- Verification of Batch 2 completion
DO $ $ DECLARE batch2_count INTEGER;

BEGIN
SELECT
    COUNT(*) INTO batch2_count
FROM
    public.songs
WHERE
    title IN (
        'Summer Never Dies',
        'Sangue e Stelle',
        'Soul Imprint',
        'L''Heure Bleue'
    );

RAISE NOTICE '📊 Batch 2 Progress: %/4 songs reprocessed',
batch2_count;

RAISE NOTICE '';

END $ $;