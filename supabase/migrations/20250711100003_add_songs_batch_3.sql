/*
 # Insert Songs: Batch 3
 
 This migration inserts the following songs and their cleaned lyrics into the database:
 - Digital Butterfly
 - Derniere Bobine
 - Ladri d'Estate
 - Cafe Cinema
 
 ## Processing Details:
 - For each song, this script first inserts the main song record into the `public.songs` table.
 - It then processes the `raw_lyrics`, removing all descriptive tags (e.g., [Intro], [Chorus]) to store only the lyrical content.
 - Each cleaned lyric line is inserted into the `public.lyrics` table, linked to its parent song.
 - Timestamps and translations are left as NULL for future implementation.
 */
-- Song: Digital Butterfly
DO $ $ DECLARE song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Genre: J-Core Hyperpop] [Tempo: 170bpm] [Female Vocal] [Mood: Building Euphoria] システム起動 、 準備完了 (ログイン 、 ログイン) 新しい私が目覚める (解放 、 解放) [Verse 1] [Energy: Rising] [Vocoder Vocals] 灰色の街で息が詰まる 同じ顔ばかり 、 誰も見えない 窓の外はモノクロ写真 でも画面の向こうに答えがある [Pre-Chorus] [Building Intensity] [Pitched Vocal Sample] 指先が震える 、 エンターキー もう我慢できない 、 飛び出したい 3 、 2 、 1...[Chorus] [Energy: Maximum] [Auto-tuned Vocals] [Glitchy] ログイン ！ 色が爆発する ！ ピクセルの翼で空を飛ぶ 本当の私がここにいる (ここにいる ！) デジタル世界で生まれ変わる クソつまらない現実なんて バイバイ ！ 自由だ ！ 最高だ ！ (デジタル解放 ！ デジタル解放 ！) [Glass Break] [Verse 2] [Glitched Vocals] [Energy: High] アバターの肌が虹色に輝く データの風が髪を撫でる 仮想の丘を駆け上がって 誰かとつながる 、 本物の絆 [Pre-Chorus] [Vocal Chops] 心臓がビート刻む 、 BPM170 もう止まらない 、 進むだけ 無限大へ...[Chorus] [Harmonies] [Maximum Energy] ログイン ！ 色が爆発する ！ ピクセルの翼で空を飛ぶ 本当の私がここにいる (ここにいる ！) デジタル世界で生まれ変わる クソつまらない現実なんて バイバイ ！ 自由だ ！ 最高だ ！ (デジタル解放 ！ デジタル解放 ！) [Break] [Instrumental] [Glitch Sound] [Synth Solo] [Bridge] [Ethereal] [Whisper to Belting] 01 になって 10 になって 二進法で愛を語る みんなの光がつながって 銀河みたいに美しい これが私たちの場所 (ここが私たちの場所 ！) [Power Up Sound] [Chorus] [Final] [Energy: Transcendent] [Gang Vocals] ログイン ！ 色が爆発する ！ ピクセルの翼で空を飛ぶ 本当の私がここにいる (永遠に ！) デジタル世界で生まれ変わる グレーな過去なんて消去して ヤバい ！ 自由だ ！ 最高だ ！ (デジタル解放 ！ デジタル解放 ！) (みんな一緒に ！ みんな一緒に ！) [Outro] [Fade Out] [Pitched Samples] ログアウトなんてしない (ずっとここにいる) 色とりどりの未来へ (デジタル蝶々...) $ raw_lyrics $;

lyric_lines TEXT [];

cleaned_line TEXT;

line_num INTEGER := 0;

BEGIN -- Insert the song "Digital Butterfly"
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
        'Digital Butterfly',
        'Suno AI',
        'japanese',
        'intermediate',
        'hyperpop',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/Digital%20Butterfly.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9EaWdpdGFsIEJ1dHRlcmZseS5tcDMiLCJpYXQiOjE3NTE1MDQ1MjQsImV4cCI6MjA2Njg2NDUyNH0.Y9EPtiORvABFAVtS-vUEqFyQ6-nYnu08mAKOsBdORAc',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/Digital%20Butterfly.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvRGlnaXRhbCBCdXR0ZXJmbHkuanBlZyIsImlhdCI6MTc1MTUwNDU0NiwiZXhwIjoyMDY2ODY0NTQ2fQ.BcvcAb-a8ldnoFfZzsE-NYZQwgfPgCT9l6IRSPIokrk',
        202,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

RAISE NOTICE 'Inserted song "Digital Butterfly" with ID: %',
song_id;

-- Split raw lyrics into individual lines
lyric_lines := string_to_array(raw_lyrics, E '\n');

-- Loop through each line, clean it, and insert into the lyrics table
FOREACH cleaned_line IN ARRAY lyric_lines LOOP -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus])
cleaned_line := regexp_replace(cleaned_line, '\[.*?\]', '', 'g');

-- Trim leading/trailing whitespace from the cleaned line
cleaned_line := trim(cleaned_line);

-- Only insert the line if it's not empty after cleaning
IF cleaned_line IS NOT NULL
AND cleaned_line != '' THEN line_num := line_num + 1;

INSERT INTO
    public.lyrics (
        song_id,
        line_number,
        text,
        start_time_ms,
        -- Not provided
        end_time_ms,
        -- Not provided
        translation -- Not provided
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

RAISE NOTICE 'Inserted % lyric lines for "Digital Butterfly"',
line_num;

END $ $;

-- Song: Derniere Bobine
DO $ $ DECLARE song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Female Vocal] [Mood: Wistful] [Reverb Heavy] Mmm...comme un rêve Les lumières s 'éteignent une par une
[Verse 1][Tempo: 68bpm][Cello][Electric Guitar]
Ta voix dans le téléphone
Elle tremble et disparaît
Les photos dans mes mains
Jaunissent comme l' été Je compte les secondes Où tu riais encore Mais même ton écho S 'évapore
[Pre-Chorus][Building Intensity]
Et je sens que tout glisse
Entre mes doigts serrés
Comme du sable qui...
[Chorus][Orchestral Strings][Breathy Vocals]
Tu t' effaces doucement Comme un film qui s 'arrête
Je te perds en souriant
Dans le silence doré
(Dans le silence doré)
Les mots s' envolent Comme des oiseaux fatigués Tu deviens transparent Et c 'est parfait
(C' est parfait comme ça
) [Verse 2] [Melancholic Atmosphere] Ton parfum sur l 'oreiller
N' est plus qu 'une idée
Les lettres que tu écrivais
Pâlissent
Dans la chambre vide
Dansent des particules
De tout ce qu' on était En septembre [Pre-Chorus] Et je sens que tout glisse Entre mes doigts serrés Comme du sable qui...[Chorus] [Crescendo] Tu t 'effaces doucement
Comme un film qui s' arrête Je te perds en souriant Dans le silence doré (Dans le silence doré) Les mots s 'envolent
Comme des oiseaux fatigués
Tu deviens transparent
Et c' est parfait (
    C 'est parfait comme ça)
[Break][Instrumental][Cello Solo][Rain]
[Bridge][Whisper][Minimal Instrumentation]
Peut-être que les beaux moments
Doivent mourir pour rester beaux
Peut-être que c' est en partant Qu 'on devient éternel
[Outro][Fade Out][Ethereal]
Tu t' effaces...(tu t 'effaces)
Comme un film... (qui s' arrête) Dans le silence doré (Doré...doré...) Mmm...$ raw_lyrics $;

lyric_lines TEXT [];

cleaned_line TEXT;

line_num INTEGER := 0;

BEGIN -- Insert the song "Derniere Bobine"
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
        'Derniere Bobine',
        'Suno AI',
        'french',
        'intermediate',
        'dream pop',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/Derniere%20Bobine.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9EZXJuaWVyZSBCb2JpbmUubXAzIiwiaWF0IjoxNzUxNTA0NjM1LCJleHAiOjIwNjY4NjQ2MzV9.pOo5WbRw0wA4x5dmJwFdVLXYyKyUryWq0dzIUdNABM4',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/Derniere%20Bobine.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvRGVybmllcmUgQm9iaW5lLmpwZWciLCJpYXQiOjE3NTE1MDQ2MjEsImV4cCI6MjA2Njg2NDYyMX0.54_0q0Xm1qJZ--to_NZPlEZXy0weno_NEVzzhZqjd5E',
        231,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

RAISE NOTICE 'Inserted song "Derniere Bobine" with ID: %',
song_id;

-- Split raw lyrics into individual lines
lyric_lines := string_to_array(raw_lyrics, E '\n');

-- Loop through each line, clean it, and insert into the lyrics table
FOREACH cleaned_line IN ARRAY lyric_lines LOOP -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus])
cleaned_line := regexp_replace(cleaned_line, '\[.*?\]', '', 'g');

-- Trim leading/trailing whitespace from the cleaned line
cleaned_line := trim(cleaned_line);

-- Only insert the line if it's not empty after cleaning
IF cleaned_line IS NOT NULL
AND cleaned_line != '' THEN line_num := line_num + 1;

INSERT INTO
    public.lyrics (
        song_id,
        line_number,
        text,
        start_time_ms,
        -- Not provided
        end_time_ms,
        -- Not provided
        translation -- Not provided
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

RAISE NOTICE 'Inserted % lyric lines for "Derniere Bobine"',
line_num;

END $ $;

-- Song: Ladri d'Estate
DO $ $ DECLARE song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Male Vocal] [Genre: Italian Indie-Pop] [Mood: Nostalgic] [Acoustic Guitar] Le cicale cantano ancora quella canzone Ma noi non siamo più là [Ocean Waves] [Verse 1] [Tempo: 118bpm] Ricordo le tue mani sporche di sabbia La Vespa che non partiva mai Dormivamo in macchina vicino al faro Col vino cheap e le stelle sopra di noi Rubavamo arance alle tre del mattino Ridendo come matti per le strade vuote I tuoi capelli profumavano di sale E il mondo sembrava nostro per sempre [Pre-Chorus] [Building Intensity] Ma il tempo è un ladro silenzioso Che prende tutto senza chiedere [Chorus] [Catchy Hook] [Harmonies] Eravamo giovani,
eravamo eterni Con la sabbia nelle tasche e il sole negli occhi Quella maledetta estate che ci ha illusi (Non tornerà più, non tornerà più) Eravamo ladri,
ladri di tempo Ma alla fine è lui che ha rubato noi [Verse 2] [Jangly Electric Guitar] Le polaroid sbiadite sul cruscotto Parlano di notti che non finivano Ballavi scalza sulle pietre della spiaggia Mentre l 'alba ci sorprendeva ancora svegli
Il tuo bikini rosso, le mie mani tremanti
Il primo bacio sapeva di prosecco e libertà
Scrivevamo i nostri nomi sulla riva
Sapendo che le onde li avrebbero cancellati
[Pre-Chorus][Synth Pads]
E adesso guardo vecchie foto
Cercando quello che non c' è più [Chorus] [Energy: High] Eravamo giovani,
eravamo eterni Con la sabbia nelle tasche e il sole negli occhi Quella maledetta estate che ci ha illusi (Non tornerà più, non tornerà più) Eravamo ladri,
ladri di tempo Ma alla fine è lui che ha rubato noi [Bridge] [Orchestral Strings] [Emotional Bridge] Ora vivo in una città grigia Guardo il mare solo dal telefono [Phone Notification] E quando sento l 'odore di crema solare
Cazzo, quanto manca quella libertà
Quella versione di noi che credeva
Che l' estate non finisse mai [Chorus] [Climactic] [Ad-libs] Eravamo giovani,
eravamo eterni (eravamo, eravamo) Con la sabbia nelle tasche e il sole negli occhi Quella maledetta estate che ci ha illusi (Non tornerà più, non tornerà mai più) Eravamo ladri,
ladri di tempo Ma alla fine è lui che ha rubato noi (Ci ha rubato tutto) [Outro] [Fade Out] [Melancholic Atmosphere] Le cicale cantano ancora Ma è una canzone diversa [Distant Seagulls] (Non tornerà più...) $ raw_lyrics $;

lyric_lines TEXT [];

cleaned_line TEXT;

line_num INTEGER := 0;

BEGIN -- Insert the song "Ladri d'Estate"
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
        'Ladri d''Estate',
        'Suno AI',
        'italian',
        'intermediate',
        'indie pop',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/Ladri%20d''Estate.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9MYWRyaSBkJ0VzdGF0ZS5tcDMiLCJpYXQiOjE3NTE1MDQ2ODUsImV4cCI6MjA2Njg2NDY4NX0.IozwXHy5VmOD8H5S2-5L-NRa6oN2X2SbOSU3WoNk56s',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/Ladri%20d''Estate.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvTGFkcmkgZCdFc3RhdGUuanBlZyIsImlhdCI6MTc1MTUwNDcwMCwiZXhwIjoyMDY2ODY0NzAwfQ.jFhQ85QW5xedfDeZ0QzIwj5t7lTNDVMVmDfeobw64ZM',
        194,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

RAISE NOTICE 'Inserted song "Ladri d''Estate" with ID: %',
song_id;

-- Split raw lyrics into individual lines
lyric_lines := string_to_array(raw_lyrics, E '\n');

-- Loop through each line, clean it, and insert into the lyrics table
FOREACH cleaned_line IN ARRAY lyric_lines LOOP -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus])
cleaned_line := regexp_replace(cleaned_line, '\[.*?\]', '', 'g');

-- Trim leading/trailing whitespace from the cleaned line
cleaned_line := trim(cleaned_line);

-- Only insert the line if it's not empty after cleaning
IF cleaned_line IS NOT NULL
AND cleaned_line != '' THEN line_num := line_num + 1;

INSERT INTO
    public.lyrics (
        song_id,
        line_number,
        text,
        start_time_ms,
        -- Not provided
        end_time_ms,
        -- Not provided
        translation -- Not provided
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

RAISE NOTICE 'Inserted % lyric lines for "Ladri d''Estate"',
line_num;

END $ $;

-- Song: Cafe Cinema
DO $ $ DECLARE song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Female Vocal] [Mood: Playful] [Genre: French Yé-yé Pop] [Organ] [Tambourine] La la la,
la la la Oh là là,
quelle journée La la la,
la la la (Oh oh oh) [Verse 1] [Conversational Vocals] Au coin de la rue,
mon petit café Table en terrasse,
je vais m 'installer
Avec mon espresso et mon carnet secret
J' observe les gens qui passent sur le pavé Là voilà Madame Mystère avec son caniche (Quel chien bizarre !) Je l 'imagine espionne, cachant des microfiches
Et lui, Monsieur Sérieux avec sa mallette
Je parie qu' il danse le tango en cachette [Pre-Chorus] [Building Energy] Mon imagination s 'envole, s' envole Chaque passant devient une drôle D 'histoire que j' invente (
    j 'invente)
C' est excitant,
    excitant ! [Chorus] [Catchy Hook] [Hand Claps] Je fais mon cinéma au café (Café cinéma !) Tous les passants deviennent mes acteurs préférés Je raconte des histoires que personne ne saura (Oh là là, oh là là) Mon trottoir théâtre,
    mon café cinéma ! [Verse 2] [Giggling] [Clapping] Ces deux amoureux qui se tiennent la main C 'est Roméo et Juliette, j' en suis certain La dame au chapeau rouge court vers la gare Son amant l 'attend... ou c' est son mari qui s 'égare?
[Sound: Pigeons Cooing]
Le serveur pense que j' écris de la poésie (Mais non, mais non !) Je rigole toute seule,
    c 'est ma douce folie
Mes histoires sur des serviettes papillon
S' envolent dans le vent en tourbillon [Pre-Chorus] [Building Energy] Mon imagination s 'envole, s' envole Chaque passant devient une drôle D 'histoire que j' invente (
        j 'invente)
C' est excitant,
        excitant ! [Chorus] [Catchy Hook] [Harmonies] Je fais mon cinéma au café (Café cinéma !) Tous les passants deviennent mes acteurs préférés Je raconte des histoires que personne ne saura (Oh là là, oh là là) Mon trottoir théâtre,
        mon café cinéma ! [Bridge] [Spoken Word Elements] Parfois je me demande...et si c 'était vrai?
Si le businessman cachait des secrets?
Si la vieille dame était vraiment James Bond?
(Non non non, c' est trop con !
    ) Mais c 'est ça qui est bon!
[Outro][Fade Out][Organ Solo]
La la la, la la la
(Café cinéma!)
Je continue mes histoires jusqu' à demain La la la,
    la la la (Oh là là) Mon petit théâtre de rien [Giggling] [Fade] $ raw_lyrics $;

lyric_lines TEXT [];

cleaned_line TEXT;

line_num INTEGER := 0;

BEGIN -- Insert the song "Cafe Cinema"
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
        'Cafe Cinema',
        'Suno AI',
        'french',
        'intermediate',
        'french ye-ye, pop',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/Cafe%20Cinema.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9DYWZlIENpbmVtYS5tcDMiLCJpYXQiOjE3NTE1MDQ3NjgsImV4cCI6MjA2Njg2NDc2OH0.XO_ePE9aa35dQcrVuWES64XqS8C8PCeHlRTeuFN7-a0',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/Cafe%20Cinema.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvQ2FmZSBDaW5lbWEuanBlZyIsImlhdCI6MTc1MTUwNDgwMywiZXhwIjoyMDY2ODY0ODAzfQ.m3VbInYvS1FYTXlM4K8rprSQULQo_dApXMIt5h3fios',
        212,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

RAISE NOTICE 'Inserted song "Cafe Cinema" with ID: %',
song_id;

-- Split raw lyrics into individual lines
lyric_lines := string_to_array(raw_lyrics, E '\n');

-- Loop through each line, clean it, and insert into the lyrics table
FOREACH cleaned_line IN ARRAY lyric_lines LOOP -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus])
cleaned_line := regexp_replace(cleaned_line, '\[.*?\]', '', 'g');

-- Trim leading/trailing whitespace from the cleaned line
cleaned_line := trim(cleaned_line);

-- Only insert the line if it's not empty after cleaning
IF cleaned_line IS NOT NULL
AND cleaned_line != '' THEN line_num := line_num + 1;

INSERT INTO
    public.lyrics (
        song_id,
        line_number,
        text,
        start_time_ms,
        -- Not provided
        end_time_ms,
        -- Not provided
        translation -- Not provided
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

RAISE NOTICE 'Inserted % lyric lines for "Cafe Cinema"',
line_num;

END $ $;

-- Verification query to check the inserted data for batch 3
DO $ $ DECLARE song_count INTEGER;

digitalbutterfly_lyrics_count INTEGER;

dernierebobine_lyrics_count INTEGER;

ladridestate_lyrics_count INTEGER;

cafecinema_lyrics_count INTEGER;

BEGIN -- Check if all songs were inserted
SELECT
    COUNT(*) INTO song_count
FROM
    public.songs
WHERE
    title IN (
        'Digital Butterfly',
        'Derniere Bobine',
        'Ladri d''Estate',
        'Cafe Cinema'
    );

RAISE NOTICE 'Songs from batch 3 inserted: %/4',
song_count;

-- Check lyric counts for each song
SELECT
    COUNT(*) INTO digitalbutterfly_lyrics_count
FROM
    public.lyrics l
    JOIN public.songs s ON l.song_id = s.id
WHERE
    s.title = 'Digital Butterfly';

SELECT
    COUNT(*) INTO dernierebobine_lyrics_count
FROM
    public.lyrics l
    JOIN public.songs s ON l.song_id = s.id
WHERE
    s.title = 'Derniere Bobine';

SELECT
    COUNT(*) INTO ladridestate_lyrics_count
FROM
    public.lyrics l
    JOIN public.songs s ON l.song_id = s.id
WHERE
    s.title = 'Ladri d''Estate';

SELECT
    COUNT(*) INTO cafecinema_lyrics_count
FROM
    public.lyrics l
    JOIN public.songs s ON l.song_id = s.id
WHERE
    s.title = 'Cafe Cinema';

RAISE NOTICE 'Lyric lines for "Digital Butterfly": %',
digitalbutterfly_lyrics_count;

RAISE NOTICE 'Lyric lines for "Derniere Bobine": %',
dernierebobine_lyrics_count;

RAISE NOTICE 'Lyric lines for "Ladri d''Estate": %',
ladridestate_lyrics_count;

RAISE NOTICE 'Lyric lines for "Cafe Cinema": %',
cafecinema_lyrics_count;

IF song_count = 4
AND digitalbutterfly_lyrics_count > 0
AND dernierebobine_lyrics_count > 0
AND ladridestate_lyrics_count > 0
AND cafecinema_lyrics_count > 0 THEN RAISE NOTICE '✅ Migration for batch 3 completed successfully!';

ELSE RAISE WARNING '❌ Migration for batch 3 may have failed. Song count: %, check lyric counts above.',
song_count;

END IF;

END $ $;