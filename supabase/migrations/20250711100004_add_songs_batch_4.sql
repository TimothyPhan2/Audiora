/*
 # Insert Songs: Batch 4
 
 This migration inserts the following songs and their cleaned lyrics into the database:
 - Panico Chic
 - Steinernes Erwachen
 - Fantasma de Agosto
 - Mallorca Fieber
 
 ## Processing Details:
 - For each song, this script first inserts the main song record into the `public.songs` table.
 - It then processes the `raw_lyrics`, removing all descriptive tags (e.g., [Intro], [Chorus]) to store only the lyrical content.
 - Each cleaned lyric line is inserted into the `public.lyrics` table, linked to its parent song.
 - Timestamps and translations are left as NULL for future implementation.
 */
-- Song: Panico Chic
DO $ $ DECLARE song_id UUID;

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
[Metro Departure Sound]
$raw_lyrics$;
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
    ) RETURNING id INTO song_id;

    RAISE NOTICE ' Inserted song "Panico Chic" with ID: % ', song_id;

    -- Split raw lyrics into individual lines
    lyric_lines := string_to_array(raw_lyrics, E' \ n ');

    -- Loop through each line, clean it, and insert into the lyrics table
    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus])
        cleaned_line := regexp_replace(cleaned_line, ' \ [.*?\] ', '', ' g ');
        
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

RAISE NOTICE 'Inserted % lyric lines for "Panico Chic"',
line_num;

END $ $;

-- Song: Steinernes Erwachen
DO $ $ DECLARE song_id UUID;

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
    ) RETURNING id INTO song_id;

RAISE NOTICE 'Inserted song "Steinernes Erwachen" with ID: %',
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

RAISE NOTICE 'Inserted % lyric lines for "Steinernes Erwachen"',
line_num;

END $ $;

-- Song: Fantasma de Agosto
DO $ $ DECLARE song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Mood: Nostalgic] [Genre: Reggaeton] [Reverb Heavy] [Clean Electric Guitar] Arena en mis pies,
pero ya no estás aquí El eco de tu risa flota en el aire salado [Ocean Waves] [Verse 1] [Male Vocal] [Melancholic Atmosphere] Las palmeras susurran secretos al viento Agosto pintó promesas que septiembre borró Tu sombra sigue aquí cuando cierro los ojos En la hamaca vacía donde nos perdimos los dos El ron sabe amargo sin tu boca cerca Las fotos no huelen a tu perfume,
bebé Esta playa guarda cada huella nuestra Pero las mareas se llevaron tu querer [Pre-Chorus] [Building Intensity] Y aunque el tiempo siga su camino cruel Yo sigo atrapado en tu piel [Chorus] [Catchy Hook] [Emotional] Bailamos,
bailamos donde el mar besa la luna Tu fantasma baila cuando suena el dembow (Cuando suena el dembow) Fuimos fuego bajo las estrellas,
ninguna Brilla como brillabas tú,
mi amor (Como brillabas tú) [Verse 2] [Vulnerable Vocals] El calendario marca días sin sentido Desde que el verano se robó tu calor Mi celular refleja noches que he perdido Buscando mensajes que ya no tienen valor Tu piel era mi religión,
mi paraíso Ahora rezo a recuerdos en la madrugada Este maldito agosto fue nuestro hechizo Y me dejaste con el alma bronceada [Pre-Chorus] [Building Intensity] Y aunque el tiempo siga su camino cruel Yo sigo atrapado en tu piel [Chorus] [Catchy Hook] [Emotional] Bailamos,
bailamos donde el mar besa la luna Tu fantasma baila cuando suena el dembow (Cuando suena el dembow) Fuimos fuego bajo las estrellas,
ninguna Brilla como brillabas tú,
mi amor (Como brillabas tú) [Break] [Stripped Back] [Acoustic Guitar] [Minimal Percussion] [Seagulls] Solo quedan cenizas de aquella fogata Donde juraste que nunca te irías [Bridge] [Raw Emotion] [Climactic] Joder,
cómo duele cuando el sol se esconde Y no tengo tu cuerpo pa ' calentarme
Las gaviotas preguntan por ti, ¿dónde?
¿Dónde fuiste? Ya no puedo encontrarte
(No puedo encontrarte)
[Chorus][Final Hook][Powerful Outro]
Bailamos, bailamos donde el mar besa la luna
Tu fantasma baila cuando suena el dembow
(Cuando suena, cuando suena)
Fuimos fuego bajo las estrellas, ninguna
Brilla como brillabas tú, mi amor
[Outro][Fade Out][Dreamy][Whispered Vocals]
En la arena escribo tu nombre
Pero el mar siempre se lo lleva
(Siempre se lo lleva)
Agosto se fue contigo...
[Ocean Waves]
$raw_lyrics$;
    lyric_lines TEXT[];
    cleaned_line TEXT;
    line_num INTEGER := 0;
BEGIN
    -- Insert the song "Fantasma de Agosto"
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
        ' Fantasma de Agosto ',
        ' Suno AI ',
        ' spanish ',
        ' intermediate ',
        ' reggaeton,
dream pop ',
        ' https: / / jojawfigpwnawzmmfowo.supabase.co / storage / v1 / object / sign / audio - files / Fantasma % 20de % 20Agosto.mp3 ? token = eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9GYW50YXNtYSBkZSBBZ29zdG8ubXAzIiwiaWF0IjoxNzUxNTA0OTgzLCJleHAiOjIwNjY4NjQ5ODN9.Rb - 5kW9OOoag1D2ovyuALS_QH630MV8_JQMgf_acJZE ',
        ' https: / / jojawfigpwnawzmmfowo.supabase.co / storage / v1 / object / sign / cover - images / Fantasma % 20de % 20Agosto.jpeg ? token = eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvRmFudGFzbWEgZGUgQWdvc3RvLmpwZWciLCJpYXQiOjE3NTE1MDQ5NTgsImV4cCI6MjA2Njg2NDk1OH0.oDUOOB3SqxJyxFzR29mhVjngqFDKVNovqCfnyPbMRg ',
        183,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

    RAISE NOTICE ' Inserted song "Fantasma de Agosto" with ID: % ', song_id;

    -- Split raw lyrics into individual lines
    lyric_lines := string_to_array(raw_lyrics, E' \ n ');

    -- Loop through each line, clean it, and insert into the lyrics table
    FOREACH cleaned_line IN ARRAY lyric_lines
    LOOP
        -- Remove any text enclosed in square brackets (e.g., [Intro], [Chorus])
        cleaned_line := regexp_replace(cleaned_line, ' \ [.*?\] ', '', ' g ');
        
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

RAISE NOTICE 'Inserted % lyric lines for "Fantasma de Agosto"',
line_num;

END $ $;

-- Song: Mallorca Fieber
DO $ $ DECLARE song_id UUID;

raw_lyrics TEXT := $ raw_lyrics $ [Intro] [Genre: Schlager] [Mood: Euphoric] [Tempo: 128bpm] [Female Vocal] [Synth Pads] [Ocean Waves] Na na na na,
Mallorca (Mallorca, Mallorca) Pack die Koffer,
komm wir fahren ! [Verse] [Four-on-the-Floor] [Bright Synths] Grauer Himmel jeden Tag Büro - Stress,
ich kann nicht mehr Scheiß auf Meetings,
mir egal Ich brauch Sonne,
ich brauch Meer Der Wecker klingelt viel zu früh Kaffee schmeckt nach Langeweile Meine Seele braucht Magie Mallorca ruft,
ich bleib nicht hier ! [Pre-Chorus] [Building Intensity] Die Koffer sind gepackt (gepackt !) Das Flugzeug wartet schon (
    los geht 's!)
Ich hab genug vom Alltag hier
Die Insel wird mein neues Glück!
[Chorus][Energy: High][Catchy Hook][Harmonies]
Mallorca, Mallorca, wir fliegen heute Nacht! (heute Nacht!)
Wo die Sonne immer für uns lacht (für uns lacht!)
Sangria, Strand und Palmenschatten
Wir werden tanzen, bis wir nicht mehr können
Mallorca, Mallorca, das Paradies ist nah! (ist so nah!)
Blauer Himmel, blaues Meer, alles klar! (alles klar!)
(Hey, hey, hey, auf nach Mallorca!)
[Verse][Female Vocal][Upbeat]
Flip-Flops statt die High Heels an
Sonnencreme ist mein Parfüm
Barfuß durch den heißen Sand
Endlich kann ich wieder blühn
Cocktails statt der Büro-Post
Möwen sind die neuen Chefs
Hammock wird mein Arbeitsplatz
Leben kann so einfach sein!
[Pre-Chorus][Vocal Tone: Excited]
Die Koffer sind gepackt (gepackt!)
Das Flugzeug wartet schon (los geht' s !
) Ich hab genug vom Alltag hier Die Insel wird mein neues Glück ! [Chorus] [Energy: High] [Gang Vocals] [Tambourine] Mallorca,
Mallorca,
wir fliegen heute Nacht ! (heute Nacht !) Wo die Sonne immer für uns lacht (für uns lacht !) Sangria,
Strand und Palmenschatten Wir werden tanzen,
bis wir nicht mehr können Mallorca,
Mallorca,
das Paradies ist nah ! (ist so nah !) Blauer Himmel,
blaues Meer,
alles klar ! (alles klar !) (Hey, hey, hey, auf nach Mallorca !) [Bridge] [Mood: Dreamy] [Key Change] [Acoustic Guitar] Unter Sternen am Strand Hand in Hand durchs Paradies Keine Uhr,
keine Zeit Nur der Moment,
der niemals fließt [Cheering] Drei,
zwei,
eins...[Chorus] [Climactic] [Full Production] [Female Vocal] Mallorca,
Mallorca,
wir fliegen heute Nacht ! (heute Nacht !) Wo die Sonne immer für uns lacht (für uns lacht !) Sangria,
Strand und Palmenschatten Wir werden tanzen,
bis wir nicht mehr können Mallorca,
Mallorca,
das Paradies ist nah ! (ist so nah !) Blauer Himmel,
blaues Meer,
alles klar ! (alles klar !) (Alle zusammen !) [Outro] [Fade Out] [Applause] Na na na na,
Mallorca (Mallorca !) Na na na na,
wir kommen ! (wir kommen !) Na na na na,
Mallorca (Mallorca !) (Hey, hey, hey, auf nach Mallorca !) [Ocean Waves] $ raw_lyrics $;

lyric_lines TEXT [];

cleaned_line TEXT;

line_num INTEGER := 0;

BEGIN -- Insert the song "Mallorca Fieber"
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
        'Mallorca Fieber',
        'Suno AI',
        'german',
        'intermediate',
        'schlager-pop',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/audio-files/Mallorca%20Fieber.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby1maWxlcy9NYWxsb3JjYSBGaWViZXIubXAzIiwiaWF0IjoxNzUxNTA1MDQ5LCJleHAiOjIwNjY4NjUwNDl9.9I2E0SGdO1-bQGrCUedoZa7PG_rKNMHblVuevWTTJhw',
        'https://jojawfigpwnawzmmfowo.supabase.co/storage/v1/object/sign/cover-images/Mallorca%20Fieber.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NDQxODQwZi01OWU4LTQ3ZDAtOTVlYS02MWZjNDU0YTE2YmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Zlci1pbWFnZXMvTWFsbG9yY2EgRmllYmVyLmpwZWciLCJpYXQiOjE3NTE1MDUwODQsImV4cCI6MjA2Njg2NTA4NH0.R0BE80lVLeDntoKQYwsC4s4LiN54LWcAP50zqqmUa68',
        209,
        TRUE,
        FALSE,
        85
    ) RETURNING id INTO song_id;

RAISE NOTICE 'Inserted song "Mallorca Fieber" with ID: %',
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

RAISE NOTICE 'Inserted % lyric lines for "Mallorca Fieber"',
line_num;

END $ $;

-- Verification query to check the inserted data for batch 4
DO $ $ DECLARE song_count INTEGER;

panicochic_lyrics_count INTEGER;

steinerneserwachen_lyrics_count INTEGER;

fantasmadeagosto_lyrics_count INTEGER;

mallorcafieber_lyrics_count INTEGER;

BEGIN -- Check if all songs were inserted
SELECT
    COUNT(*) INTO song_count
FROM
    public.songs
WHERE
    title IN (
        'Panico Chic',
        'Steinernes Erwachen',
        'Fantasma de Agosto',
        'Mallorca Fieber'
    );

RAISE NOTICE 'Songs from batch 4 inserted: %/4',
song_count;

-- Check lyric counts for each song
SELECT
    COUNT(*) INTO panicochic_lyrics_count
FROM
    public.lyrics l
    JOIN public.songs s ON l.song_id = s.id
WHERE
    s.title = 'Panico Chic';

SELECT
    COUNT(*) INTO steinerneserwachen_lyrics_count
FROM
    public.lyrics l
    JOIN public.songs s ON l.song_id = s.id
WHERE
    s.title = 'Steinernes Erwachen';

SELECT
    COUNT(*) INTO fantasmadeagosto_lyrics_count
FROM
    public.lyrics l
    JOIN public.songs s ON l.song_id = s.id
WHERE
    s.title = 'Fantasma de Agosto';

SELECT
    COUNT(*) INTO mallorcafieber_lyrics_count
FROM
    public.lyrics l
    JOIN public.songs s ON l.song_id = s.id
WHERE
    s.title = 'Mallorca Fieber';

RAISE NOTICE 'Lyric lines for "Panico Chic": %',
panicochic_lyrics_count;

RAISE NOTICE 'Lyric lines for "Steinernes Erwachen": %',
steinerneserwachen_lyrics_count;

RAISE NOTICE 'Lyric lines for "Fantasma de Agosto": %',
fantasmadeagosto_lyrics_count;

RAISE NOTICE 'Lyric lines for "Mallorca Fieber": %',
mallorcafieber_lyrics_count;

IF song_count = 4
AND panicochic_lyrics_count > 0
AND steinerneserwachen_lyrics_count > 0
AND fantasmadeagosto_lyrics_count > 0
AND mallorcafieber_lyrics_count > 0 THEN RAISE NOTICE '✅ Migration for batch 4 completed successfully!';

ELSE RAISE WARNING '❌ Migration for batch 4 may have failed. Song count: %, check lyric counts above.',
song_count;

END IF;

END $ $;