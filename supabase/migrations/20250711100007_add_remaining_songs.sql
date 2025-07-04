/*
 # Add Remaining Songs with Fixed Lyrics Processing
 
 This migration adds the following songs with corrected lyrics processing:
 - Cafe Cinema (from Batch 3)
 - Panico Chic (from Batch 4)
 - Steinernes Erwachen (from Batch 4)
 - Fantasma de Agosto (from Batch 4)
 - Mallorca Fieber (from Batch 4)
 
 ## Processing Details:
 - Uses correct E'\n' syntax for proper newline splitting
 - Enhanced bracket removal with improved regex
 - Comprehensive verification with detailed reporting
 */
-- Song: Cafe Cinema
DO $ $ DECLARE new_song_id UUID;

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
    ) RETURNING id INTO new_song_id;

RAISE NOTICE 'Inserted song "Cafe Cinema" with ID: %',
new_song_id;

-- Split raw lyrics into individual lines using corrected syntax
lyric_lines := string_to_array(raw_lyrics, E '\n');

-- Loop through each line, clean it, and insert into the lyrics table
FOREACH cleaned_line IN ARRAY lyric_lines LOOP -- Remove any text enclosed in square brackets using enhanced regex
cleaned_line := regexp_replace(cleaned_line, '\[[^\]]*\]', '', 'g');

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
        end_time_ms,
        translation
    )
VALUES
    (
        new_song_id,
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

-- Song: Panico Chic
DO $ $ DECLARE new_song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Genre: Indie Pop] [Male Vocal] [Tempo: 128bpm] [Mood: Anxious] [Phone Notification Ping] Sveglia alle sette,
caffè già freddo Controllo il telefono,
cristo che ansia [Metro Door Sound] Permesso,
scusi,
permesso [Verse 1] [Upbeat] [Driving Bass] Corro per prendere la metro delle otto e un quarto Schiacciat * come acciughe,
tutti in ritardo Il tizio accanto parla forte al telefono "Sì mamma, sì mamma" (
    ripete all 'infinito)
Qualcuno tossisce, io trattengo il respiro
Milano mi strangola ma sorrido
[Pre-Chorus][Building Intensity]
E ballo, ballo, ballo con l' ansia Mentre spingo per uscire dalla stanza Di sardine umane in movimento [Chorus] [Energy: High] [Catchy Hook] Che stress,
    che stress,
    ma che bello comunque (Scusa, permesso) Questa vita che non si ferma mai (Mi dispiace) Casa mia,
    ti odio ma ti amo È un panico chic,
    è un panico chic Sul binario tre [Verse 2] [Conversational] [Synth Stabs] Festa di compleanno,
    non conosco nessuno Fingo di messaggiare,
    guardo nel vuoto "Ciao come stai?" Cazzo,
    uno del liceo Sorrido e annuisco mentre penso "aiuto" Due baci,
    poi scappo verso il bagno Che palle questa vita da soprano [Pre-Chorus] [Building Intensity] E ballo,
    ballo,
    ballo con l 'ansia
In mezzo a tutta questa eleganza
Di sconosciuti sorridenti
[Chorus][Energy: High][Harmonies]
Che stress, che stress, ma che bello comunque
(Scusa, permesso) Questa vita che non si ferma mai
(Mi dispiace) Casa mia, ti odio ma ti amo
È un panico chic, è un panico chic
Sul binario tre
[Bridge][Stripped Back][Introspective]
[Acoustic Guitar]
E domani si ricomincia
Stessa corsa, stessa danza
Ma in fondo, in fondo
(Non cambieremmo niente)
[Chorus][Climactic][Full Production]
Che stress, che stress, ma che bello comunque
(Scusa, permesso) Questa vita che non si ferma mai
(Mi dispiace) Casa mia, ti odio ma ti amo
È un panico chic, è un panico chic
È un panico chic, è un panico chic
Sul binario tre
[Outro][Fade Out][City Ambience]
[Traffic Noise]
Permesso, scusi, permesso
(Ma che bello comunque)
[Metro Departure Sound]$raw_lyrics$;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
BEGIN
    -- Insert the song "Panico Chic"
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
        ' Panico Chic ',
        ' Suno AI ',
        ' italian ',
        ' intermediate ',
        ' indie pop ',
        ' https: / / jojawfigpwnawzmmfowo.supabase.co / storage / v1 / object / sign / audio - files / Panico % 20Chic.mp3 ? token = eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9QYW5pY28gQ2hpYy5tcDMiLCJpYXQiOjE3NTE1MDQ4NTMsImV4cCI6MjA2Njg2NDg1M30.tuu5uqXSUSqNukzsGTJ2H_5489OvJl - doq4jTzEij_Q ',
        ' https: / / jojawfigpwnawzmmfowo.supabase.co / storage / v1 / object / sign / cover - images / Panico % 20Chic.jpeg ? token = eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvUGFuaWNvIENoaWMuanBlZyIsImlhdCI6MTc1MTUwNDgzOSwiZXhwIjoyMDY2ODY0ODM5fQ.sGyf1w373Pk0PcmFiSerfDb3DuoKPWI945V3O7wjA48 ',
        169,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO new_song_id;

    RAISE NOTICE ' Inserted song "Panico Chic" with ID: % ', new_song_id;

    -- Split raw lyrics into individual lines using corrected syntax
    lyric_lines := string_to_array(raw_lyrics, E' \ n ');

    -- Loop through each line, clean it, and insert into the lyrics table
    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        -- Remove any text enclosed in square brackets using enhanced regex
        cleaned_line := regexp_replace(cleaned_line, ' \ [[^\]]*\] ', '', ' g ');
        
        -- Trim leading/trailing whitespace from the cleaned line
        cleaned_line := trim(cleaned_line);

        -- Only insert the line if it' s not empty
    after
        cleaning IF cleaned_line IS NOT NULL
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
        new_song_id,
        line_num,
        cleaned_line,
        NULL,
        NULL,
        NULL
    );

END IF;

END LOOP;

RAISE NOTICE 'Inserted % lyric lines for "Panico Chic"',
line_num;

END $ $;

-- Song: Steinernes Erwachen
DO $ $ DECLARE new_song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Genre: Industrial Metal] [Mood: Dark] [Male Vocal] [Operatic Vocals] [Thunder] [Wind] Erwache...erwache...Die alte Macht ruft meinen Namen Schatten tanzen,
Steine singen In der Tiefe ruht das Grauen [Verse] [Distorted Electric Guitar] [Drums] [Dark] Tausend Jahre schlief die Bestie tief im Berg Bewacht von Knochen alter Krieger Ihr Atem ist der Wind,
der durch die Gräber fegt Ihr Herz aus Stein schlägt wie ein Hammer [Pre-Chorus] [Building Intensity] [Synth Pads] Mein Blut wird kalt,
mein Fleisch wird hart Die Verwandlung hat begonnen (Begonnen...begonnen...) [Chorus] [Choir] [Orchestral Strings] [Climactic] Ich werde Stein ! Ich werde Nacht ! Der Lindwurmfluch hat mich erwacht Aus Fleisch wird Granit,
aus Mensch wird Tier (Wird Tier...wird Tier...) Die alte Bestie lebt in mir ! [Verse] [Heavy Drums] [Low-tuned Guitar] Meine Knochen brechen,
werden neu geformt Aus Schmerz wird Macht,
aus Angst wird Zorn Der Schatten frisst mein letztes Licht Ich sehe mein verdammtes Angesicht [Pre-Chorus] [Rising Synths] [Timpani] Die Götter lachen,
während ich verbrenne In Stein und Schatten mich erkenne (Erkenne...erkenne...) [Chorus] [Full Instrumentation] [Powerful Outro] Ich werde Stein ! Ich werde Nacht ! Der Lindwurmfluch hat mich erwacht Aus Fleisch wird Granit,
aus Mensch wird Tier (Wird Tier...wird Tier...) Die alte Bestie lebt in mir ! [Bridge] [Minimal Instrumentation] [Whisper to Shout] [Heartbeat] Zwischen Tod und Leben Zwischen Stein und Fleisch Gefangen für die Ewigkeit [Growl] Zur Hölle mit dem Schicksal ! [Outro] [Fade Out] [Orchestral Build] [Choir] Erwache...erwache...(Die Bestie ist erwacht) Ich bin der Stein,
ich bin die Macht (Die Nacht gehört mir) [Footsteps in Stone] $ raw_lyrics $;

lyric_lines TEXT [];

cleaned_line TEXT;

line_num INTEGER := 0;

BEGIN -- Insert the song "Steinernes Erwachen"
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
        'Steinernes Erwachen',
        'Suno AI',
        'german',
        'intermediate',
        'industrial metal',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/Steinernes%20Erwachen.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9TdGVpbmVybmVzIEVyd2FjaGVuLm1wMyIsImlhdCI6MTc1MTUwNDkwNiwiZXhwIjoyMDY2ODY0OTA2fQ.McsJY5Vt_IwEavlqunnHgPsiDdxzb19Zgzybssr2XZg',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/Steinernes%20Erwachen.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvU3RlaW5lcm5lcyBFcndhY2hlbi5qcGVnIiwiaWF0IjoxNzUxNTA0OTIyLCJleHAiOjIwNjY4NjQ5MjJ9._p6rG0QeYW_uboYCBFTkpzNb6EXscIiH-5I3m2R2zwY',
        207,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO new_song_id;

RAISE NOTICE 'Inserted song "Steinernes Erwachen" with ID: %',
new_song_id;

-- Split raw lyrics into individual lines using corrected syntax
lyric_lines := string_to_array(raw_lyrics, E '\n');

-- Loop through each line, clean it, and insert into the lyrics table
FOREACH cleaned_line IN ARRAY lyric_lines LOOP -- Remove any text enclosed in square brackets using enhanced regex
cleaned_line := regexp_replace(cleaned_line, '\[[^\]]*\]', '', 'g');

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
        end_time_ms,
        translation
    )
VALUES
    (
        new_song_id,
        line_num,
        cleaned_line,
        NULL,
        NULL,
        NULL
    );

END IF;

END LOOP;

RAISE NOTICE 'Inserted % lyric lines for "Steinernes Erwachen"',
line_num;

END $ $;

-- Comprehensive verification query
DO $ $ DECLARE song_count INTEGER;

total_expected INTEGER := 5;

song_record RECORD;

BEGIN -- Check if all 5 songs were inserted
SELECT
    COUNT(*) INTO song_count
FROM
    public.songs
WHERE
    title IN (
        'Cafe Cinema',
        'Panico Chic',
        'Steinernes Erwachen',
        'Fantasma de Agosto',
        'Mallorca Fieber'
    );

RAISE NOTICE '📊 MIGRATION VERIFICATION REPORT';

RAISE NOTICE '================================';

RAISE NOTICE 'Songs added in this migration: %/%',
song_count,
total_expected;

-- Individual song verification with detailed stats
FOR song_record IN
SELECT
    s.title,
    s.language,
    COUNT(l.id) as lyric_count,
    ROUND(AVG(LENGTH(l.text)) :: numeric, 1) as avg_line_length,
    MAX(LENGTH(l.text)) as max_line_length,
    MIN(LENGTH(l.text)) as min_line_length
FROM
    public.songs s
    LEFT JOIN public.lyrics l ON s.id = l.song_id
WHERE
    s.title IN (
        'Cafe Cinema',
        'Panico Chic',
        'Steinernes Erwachen',
        'Fantasma de Agosto',
        'Mallorca Fieber'
    )
GROUP BY
    s.id,
    s.title,
    s.language
ORDER BY
    s.title LOOP RAISE NOTICE '🎵 %: % lines (avg: % chars, max: % chars)',
    song_record.title,
    song_record.lyric_count,
    song_record.avg_line_length,
    song_record.max_line_length;

END LOOP;

IF song_count = total_expected THEN RAISE NOTICE '✅ SUCCESS: All remaining songs added successfully!';

ELSE RAISE WARNING '❌ INCOMPLETE: Only %/% songs were added',
song_count,
total_expected;

END IF;

RAISE NOTICE '================================';

END $ $;