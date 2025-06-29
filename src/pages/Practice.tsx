import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Brain, RotateCcw, Volume2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSongData } from '@/lib/hooks';
import { Practice } from '@/components/ui/practice';
import { 
  fetchQuizForSong, 
  saveGeneratedQuizToDatabase, 
  saveQuizResultToDatabase, 
  getUserVocabulary, 
  updateUserVocabularyProgress, 
  generateListeningExercise,
  fetchCachedListeningExercises,  // ADD THIS
  generatePronunciationExercises, // ADD THIS
  fetchCachedPronunciationExercises, // ADD THIS
  savePronunciationResult // ADD THIS
} from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { ListeningExerciseData } from '@/components/ui/listening-exercise';
import { PronunciationExercise, PronunciationExerciseData } from '@/components/ui/pronunciation-exercise'; // ADD THIS

interface VocabularyItem {
  word: string;
  translation: string;
  example_sentence: string;
  difficulty_level: string;
  part_of_speech: string;
  source: 'review' | 'new';
  user_vocabulary_id?: string;
}

interface PracticeQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty_level: string;
  question_type: string;
}

interface PracticeData {
  questions?: PracticeQuestion[]; 
  vocabulary?: VocabularyItem[];
  listening?: ListeningExerciseData[]; 
  pronunciation?: PronunciationExerciseData[]; 
  songId: string;
  practiceType: string;
  timestamp: string;
}

export default function PracticePage() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: songData, isLoading: songLoading, error: songError } = useSongData(songId);
  
  const urlPracticeType = searchParams.get('type') as 'vocabulary' | 'quiz' | 'listening' | 'pronunciation' | null;
  const [practiceType, setPracticeType] = useState<'vocabulary' | 'quiz' | 'listening' | 'pronunciation'>(urlPracticeType || 'quiz');
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  
  // Quiz session state - moved up from SessionInterface
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  
  // User vocabulary state for enhanced generation
  const [userVocabulary, setUserVocabulary] = useState<any[]>([]);
  const [vocabularyStartTime, setVocabularyStartTime] = useState<Date | null>(null);
  const [vocabularyCompleted, setVocabularyCompleted] = useState(false);
  const [vocabularyResults, setVocabularyResults] = useState<{
  gotIt: number;
  needPractice: number;
  totalWords: number;
  timeTaken: number;
} | null>(null);
const [vocabularyOutcomes, setVocabularyOutcomes] = useState<boolean[]>([]); // To track "Got It" vs "Need Practice" for each word
  // Listening exercise state
  const [listeningStartTime, setListeningStartTime] = useState<Date | null>(null);
  const [listeningCompleted, setListeningCompleted] = useState(false);
  const [listeningResults, setListeningResults] = useState<{
    correct: number;
    total: number;
    timeTaken: number;
  } | null>(null);
  const [listeningOutcomes, setListeningOutcomes] = useState<boolean[]>([]); // To track correctness for each listening exercise

  // Pronunciation exercise state (ADD THESE)
  const [pronunciationExercises, setPronunciationExercises] = useState<PronunciationExerciseData[]>([]);
  const [currentPronunciationIndex, setCurrentPronunciationIndex] = useState(0);
  const [pronunciationResults, setPronunciationResults] = useState<any[]>([]);
  const [pronunciationCompleted, setPronunciationCompleted] = useState(false);
  const [pronunciationStartTime, setPronunciationStartTime] = useState<Date | null>(null);

  
  const [userProficiencyLevel, setUserProficiencyLevel] = useState<string>('intermediate');
  
  useEffect(() => {
    if (songData?.song) {
      generatePracticeContent();
    }
  }, [songData, practiceType]);

  // Fetch user vocabulary data for enhanced generation
  useEffect(() => {
    const fetchUserVocab = async () => {
      if (!songData?.song) return;
      
      try {
        const vocabularyData = await getUserVocabulary();
        
        // Filter vocabulary for the same language as the song
        const relevantVocab = vocabularyData
          .filter(item => item.vocabulary?.language === songData.song.language)
          .map(item => ({
            word: item.vocabulary.word,
            translation: item.vocabulary.translation,
            mastery_score: item.mastery_score || 0,
            times_practiced: item.times_practiced || 0,
            times_correct: item.times_correct || 0,
            last_practiced_at: item.last_practiced_at,
            user_vocabulary_id: item.id
          }));
        
        setUserVocabulary(relevantVocab);
        console.log('📚 Fetched user vocabulary for generation:', relevantVocab.length, 'words');
      } catch (error) {
        console.error('Error fetching user vocabulary:', error);
        setUserVocabulary([]); // Continue with empty array if fetch fails
      } 
    };
    
    fetchUserVocab();
  }, [songData?.song?.language]);


// Initialize vocabulary session and listening session start time
useEffect(() => {
  if (practiceData?.practiceType === 'vocabulary' && currentIndex === 0 && !vocabularyStartTime) {
    setVocabularyStartTime(new Date());
    setVocabularyOutcomes([]); // Reset outcomes for a new session
    console.log('⏱️ Vocabulary session started!');
  }else if (practiceData?.practiceType === 'listening' && currentIndex === 0 && !listeningStartTime) {
    setListeningStartTime(new Date());
    setListeningOutcomes([]); // Reset outcomes for a new session
    console.log('⏱️ Listening session started!');
  } else if (practiceType === 'pronunciation' && currentPronunciationIndex === 0 && !pronunciationStartTime) {
    setPronunciationStartTime(new Date());
    setPronunciationResults([]); // Reset results for a new session
    console.log('⏱️ Pronunciation session started!');
  }
}, [practiceData, currentIndex, vocabularyStartTime, listeningStartTime, practiceType, currentPronunciationIndex, pronunciationStartTime]);


  // Handle mastery updates for vocabulary practice
  const handleMasteryUpdate = async (vocabularyItem: VocabularyItem, knewIt: boolean) => {
    try {
      await updateUserVocabularyProgress({
        word: vocabularyItem.word,
        translation: vocabularyItem.translation,
        source: vocabularyItem.source,
        user_vocabulary_entry_id: vocabularyItem.user_vocabulary_id,
        language: songData?.song.language || '',
        songId: songData?.song.id,
        difficulty_level: vocabularyItem.difficulty_level
      }, knewIt);
      
      // Refresh user vocabulary data after update
      const updatedVocabData = await getUserVocabulary();
      const relevantVocab = updatedVocabData
        .filter(item => item.vocabulary?.language === songData?.song.language)
        .map(item => ({
          word: item.vocabulary.word,
          translation: item.vocabulary.translation,
          mastery_score: item.mastery_score || 0,
          times_practiced: item.times_practiced || 0,
          times_correct: item.times_correct || 0,
          last_practiced_at: item.last_practiced_at,
          user_vocabulary_id: item.id
        }));
      setUserVocabulary(relevantVocab);

       // Track outcome for current word
      setVocabularyOutcomes(prev => {
        const newOutcomes = [...prev];
        newOutcomes[currentIndex] = knewIt;
        return newOutcomes;
      });
      
    } catch (error) {
      console.error('Failed to update mastery:', error);
      // TODO: Show error toast/notification
    }
  };
  const generatePracticeContent = async () => {
    if (!songData?.song) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('User must be logged in to generate practice content');
      }

      // Fetch user's proficiency level from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('proficiency_level')
        .eq('id', session.user.id)
        .single();
  
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }
  
      const userProficiencyLevel = userProfile?.proficiency_level.toLowerCase() || 'intermediate';
      setUserProficiencyLevel(userProficiencyLevel);
      console.log('👤 User proficiency level:', userProficiencyLevel);

      
      if (practiceType === 'quiz') {
        // First, check if quiz already exists in database
        console.log('🔍 Checking for existing quiz...');
        const existingQuiz = await fetchQuizForSong(songData.song.id);
        
        if (existingQuiz) {
          console.log('✅ Found existing quiz, using cached version');
          setQuizId(existingQuiz.id);
          setPracticeData({
            questions: existingQuiz.questions.map((q: any) => ({
              question: q.question_text,
              options: q.options ? JSON.parse(q.options) : [],
              correct_answer: typeof q.correct_answer === 'string' ? JSON.parse(q.correct_answer) : q.correct_answer,
              explanation: q.explanation || '',
              difficulty_level: userProficiencyLevel,
              question_type: q.question_type
            })),
            songId: songData.song.id,
            practiceType: practiceType,
            timestamp: new Date().toISOString()
          });
          setIsGenerating(false);
          return;
        }
      }
      
      // Generate new content using Gemini API
      console.log(`🤖 Generating new ${practiceType} with Gemini...`);
      
      if (practiceType === 'listening') {
        await generateListeningContent(userProficiencyLevel);
      } else if (practiceType === 'pronunciation') {
        await generatePronunciationContent(userProficiencyLevel); // CALL NEW FUNCTION
      } else {
        await generateNewContent(userProficiencyLevel);
      }
      
    } catch (error) {
      console.error('Error in generatePracticeContent:', error);
      setError('Failed to load practice content. Please try again.');
      setIsGenerating(false);
    }
  };

  // Generate real listening content using the edge function
  const generateListeningContent = async (userProficiencyLevel: string) => {
    try {
      // First check for cached exercises
      console.log('🔍 Checking for cached listening exercises...');
      const cachedExercises = await fetchCachedListeningExercises(
        songData?.song.id || '',
        userProficiencyLevel.toLowerCase()
      );
      
      if (cachedExercises && cachedExercises.length > 0) {
        console.log('✅ Using cached listening exercises');
        setPracticeData({
          listening: cachedExercises,
          songId: songData?.song.id || '',
          practiceType: 'listening',
          timestamp: new Date().toISOString()
        });
        setIsGenerating(false);
        return;
      }

      // No cached exercises found, generate new ones
      console.log('🎧 Generating NEW listening exercises...');
      
      const listeningData = await generateListeningExercise(
        songData?.song.id || '',
        songData?.song.language || '',
        userProficiencyLevel.toLowerCase()
      );
      
      console.log('✅ Generated new listening exercises:', listeningData);
      
      // Edge Function automatically saves to listening_exercises table
      // So future calls will find cached versions
      
      setPracticeData({
        listening: listeningData.data, 
        songId: songData?.song.id || '',
        practiceType: 'listening',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error generating listening exercise:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate listening exercise');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add pronunciation generation function (NEW)
  const generatePronunciationContent = async (userProficiencyLevel: string) => {
    try {
      setIsGenerating(true);
      setError(null);

      if (!songData?.song) {
        throw new Error('Song data not available');
      }

      // Check for cached exercises first
      const cachedExercises = await fetchCachedPronunciationExercises(
        songData.song.id, 
        userProficiencyLevel
      );

      if (cachedExercises && cachedExercises.length > 0) {
        console.log('Using cached pronunciation exercises');
        setPronunciationExercises(cachedExercises);
      } else {
        console.log('Generating new pronunciation exercises');
        
        // Get user vocabulary for intelligent selection
        const relevantVocab = userVocabulary
          .map(item => ({
            id: item.vocabulary?.id || item.id,
            word: item.vocabulary?.word || item.word,
            translation: item.vocabulary?.translation || item.translation,
            mastery_score: item.mastery_score || 0,
            user_vocabulary_id: item.user_vocabulary_id || item.id
          }));

        const exercises = await generatePronunciationExercises(
          songData.song.id,
          userProficiencyLevel,
          songData.song.language,
          relevantVocab
        );

        setPronunciationExercises(exercises);
      }
      
      // Set start time
      setPronunciationStartTime(new Date());
    } catch (error) {
      console.error('Pronunciation generation error:', error);
      setError('Failed to generate pronunciation exercises. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  

  const generateNewContent = async (userProficiencyLevel: string) => {
    try {
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('User must be logged in to generate practice content');
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-practice-generator`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId: songData?.song.id,
          practiceType: practiceType,
          userProficiencyLevel: userProficiencyLevel,
          targetLanguage: songData?.song.language,
          lyrics: songData?.lyrics.map(l => l.text).join('\n'),
          userVocabulary: userVocabulary // Pass user vocabulary data
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Save generated quiz to database (only for quiz type)
      if (practiceType === 'quiz' && data.questions) {
        try {
          console.log('💾 Saving quiz to database...');
          const savedQuizId = await saveGeneratedQuizToDatabase({
            title: `Practice Quiz: ${songData?.song.title}`,
            description: `Interactive quiz for ${songData?.song.title} by ${songData?.song.artist}`,
            quiz_type: 'mixed',
            passing_score: 70,
            max_attempts: 3,
            questions: data.questions.map((q: any, index: number) => ({
              question_type: 'multiple_choice',
              question_text: q.question,
              options: q.options,
              correct_answer: q.correct_answer,
              explanation: q.explanation,
              points: 1,
              order_index: index
            }))
          }, songData?.song);
          
          setQuizId(savedQuizId);
          console.log('✅ Quiz saved with ID:', savedQuizId);
        } catch (saveError) {
          console.error('Failed to save quiz to database:', saveError);
          // Continue with generated quiz even if save fails
        }
      }
      
      setPracticeData(data);
    } catch (error) {
      console.error('Error generating practice content:', error);
      setError('Failed to generate practice content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleQuizStart = () => {
    setQuizStartTime(new Date());
    setCorrectAnswers([]);
    setCurrentIndex(0);
    setQuizCompleted(false);
  };
  
const handleAnswer = (answer: string, isCorrect: boolean) => {
  if (practiceType === 'quiz') {
    const newCorrectAnswers = [...correctAnswers];
    newCorrectAnswers[currentIndex] = isCorrect;
    setCorrectAnswers(newCorrectAnswers);
    
    // Track the actual answer selected
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentIndex] = answer;
    setUserAnswers(newUserAnswers);
    console.log('✅ handleAnswer called (Quiz):', { currentIndex, isCorrect, answer });
  } else if (practiceType === 'listening') {
    setListeningOutcomes(prev => {
      const newOutcomes = [...prev];
      newOutcomes[currentIndex] = isCorrect;
      return newOutcomes;
    });
    console.log('✅ handleAnswer called (Listening):', { currentIndex, isCorrect, answer });
  }
};
  
  const handleNext = () => {
      console.log('🚀 handleNext called, currentIndex (before update):', currentIndex);
    const totalItems = practiceType === 'quiz'
    ? (practiceData?.questions?.length || 0)
    : practiceType === 'vocabulary'
    ? (practiceData?.vocabulary?.length || 0)
    : practiceType === 'listening' // Add this line
    ? (practiceData?.listening?.length || 0) // Add this line
    : practiceType === 'pronunciation' // Add this line
    ? (pronunciationExercises?.length || 0) // Use pronunciationExercises length
    : 0;  // Default to 0 if practiceData or type is unexpected
      
    if (currentIndex < totalItems - 1) {
      console.log('✅ IF block executing - about to call setCurrentIndex');
       setCurrentIndex(prev => {
      console.log('📈 setCurrentIndex: prev =', prev, 'new =', prev + 1);
      return prev + 1;
    });
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Practice session completed
      if (practiceType === 'quiz') {
        completeQuiz();
      } else if (practiceType === 'vocabulary'){
        // For vocabulary, just navigate back or show completion
        completeVocabulary(); // Call new function for vocabulary completion
      }else if(practiceType === 'listening'){
        completeListening();
      } else if (practiceType === 'pronunciation') { // ADD THIS
        setPronunciationCompleted(true); // Mark pronunciation as completed
      }
      else{
          // For listening and pronunciation, just navigate back or show completion
      // For now, we'll just navigate back to the song detail page
      // You might want to implement a completion screen for these too later
      handleBackToSong();
      }
    }
  };
  
  const completeQuiz = async () => {
    console.log('🏁 completeQuiz called');
    if (!quizStartTime || !practiceData) return;
    
    const endTime = new Date();
    const timeTakenSeconds = Math.round((endTime.getTime() - quizStartTime.getTime()) / 1000);
    const score = correctAnswers.filter(Boolean).length;
    const totalQuestions = practiceData.questions?.length || 0;
    
    setFinalScore(score);
    setTimeTaken(timeTakenSeconds);
    setQuizCompleted(true);
    const submittedAnswers = practiceData.questions?.reduce((acc, question, index) => {
      acc[`question_${index}`] = {
      question: question.question,
      selected_answer: userAnswers[index] || '', // Use tracked answers
      correct_answer: question.correct_answer,
      is_correct: correctAnswers[index] || false
      };
      return acc;
    }, {} as Record<string, any>) || {};
    
    // Save quiz result to database
    if (quizId) {
      try {
        
        await saveQuizResultToDatabase(
          quizId,
          score,
          totalQuestions,
          timeTakenSeconds,
          submittedAnswers
        );
        console.log('✅ Quiz result saved successfully');
      } catch (error) {
        console.error('Failed to save quiz result:', error);
        // Retry once after 1 second
        setTimeout(async () => {
          try {
            await saveQuizResultToDatabase(quizId, score, totalQuestions, timeTakenSeconds, submittedAnswers);
            console.log('✅ Quiz result saved on retry');
          } catch (retryError) {
            console.error('Failed to save quiz result on retry:', retryError);
          }
        }, 1000);
      }
    }
  };

  const completeVocabulary = () => {
  console.log('🏁 completeVocabulary called');
  if (!vocabularyStartTime || !practiceData?.vocabulary) return;

  const endTime = new Date();
  const timeTakenSeconds = Math.round((endTime.getTime() - vocabularyStartTime.getTime()) / 1000);

  const gotItCount = vocabularyOutcomes.filter(outcome => outcome).length;
  const needPracticeCount = vocabularyOutcomes.filter(outcome => !outcome).length;
  const totalWords = practiceData.vocabulary.length;

  setVocabularyResults({
    gotIt: gotItCount,
    needPractice: needPracticeCount,
    totalWords: totalWords,
    timeTaken: timeTakenSeconds,
  });
  setVocabularyCompleted(true);
};

  const completeListening = () => {
  console.log('🏁 completeListening called');
  if (!listeningStartTime || !practiceData?.listening) return;

  const endTime = new Date();
  const timeTakenSeconds = Math.round((endTime.getTime() - listeningStartTime.getTime()) / 1000);

  const correctCount = listeningOutcomes.filter(outcome => outcome).length;
  const totalExercises = practiceData.listening.length;

  setListeningResults({
    correct: correctCount,
    total: totalExercises,
    timeTaken: timeTakenSeconds,
  });
  setListeningCompleted(true);
};

  // Add pronunciation completion handler (NEW)
  const completePronunciationExercise = async (
    result: {
      transcribed_text: string;
      accuracy_score: number;
      feedback: string;
      confidence?: number;
      user_vocabulary_id?: string;
    }
  ) => {
    const currentExercise = practiceData?.pronunciation?.[currentIndex];
    if (!currentExercise) return;

    // Determine if this was correct (70% threshold)
    const isCorrect = result.accuracy_score >= 70;

    // Save result to database if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await savePronunciationResult({
        pronunciation_exercise_id: currentExercise.id,
        transcribed_text: result.transcribed_text,
        accuracy_score: result.accuracy_score,
        feedback: result.feedback,
      });
    }

    // Update vocabulary mastery - simplified call
    if (currentExercise.word_or_phrase) {
      console.log('📚 Processing vocabulary update for:', currentExercise.word_or_phrase);
      
      await updateUserVocabularyProgress({
        word: currentExercise.word_or_phrase,
        translation: '', // Let the API function handle translation retrieval
        user_vocabulary_entry_id: result.user_vocabulary_id, // For priority lookup
        language: songData?.song.language || '',
        songId: songData?.song.id,
        difficulty_level: currentExercise.difficulty_level
      }, isCorrect);
    }

    // Track results locally
    const newResults = [...pronunciationResults, {
      exercise: currentExercise,
      ...result
    }];
    setPronunciationResults(newResults);

    // Move to next exercise or complete
    if (currentPronunciationIndex < pronunciationExercises.length - 1) {
      setCurrentPronunciationIndex(currentPronunciationIndex + 1);
    } else {
      setPronunciationCompleted(true);
    }
  };

  const handleTryAgain = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers([]);
    setQuizCompleted(false);
    setUserAnswers([]); // Reset user answers for quiz
    setError(null);
    // Reset listening specific states
    setListeningStartTime(null);
    setListeningCompleted(false);
    setListeningResults(null);
    setListeningOutcomes([]);
    // Reset vocabulary specific states
    setVocabularyStartTime(null);
    setVocabularyCompleted(false);
    setVocabularyResults(null);
    setVocabularyOutcomes([]);
    // Reset pronunciation specific states (NEW)
    setPronunciationExercises([]);
    setCurrentPronunciationIndex(0);
    setPronunciationResults([]);
    setPronunciationCompleted(false);
    setPronunciationStartTime(null);
    setQuizStartTime(new Date());
  };



  const handleBackToSong = () => {
    navigate(`/lessons/${songId}`);
  };

 useEffect(() => {
    if (practiceData?.questions) {
      console.log('📊 Quiz loaded - Total questions:', practiceData.questions.length);
      console.log('📊 Questions preview:', practiceData.questions.map((q, i) => `${i}: ${q.question.substring(0, 50)}...`));
    }
    if (practiceData?.vocabulary) {
      console.log('📚 Vocabulary loaded - Total words:', practiceData.vocabulary.length);
      console.log('📚 Vocabulary preview:', practiceData.vocabulary.map((v, i) => `${i}: ${v.word}`));
    }
    // Add condition to prevent multiple calls
    if (
      practiceType === 'pronunciation' && 
      songData?.song && 
      userVocabulary.length > 0 &&
      pronunciationExercises.length === 0 && // ← Only generate if not already loaded
      !isGenerating // ← And not currently generating
    ) {
      generatePronunciationContent(userProficiencyLevel);
    }
  }, [practiceData, practiceType, songData, userVocabulary, pronunciationExercises.length, isGenerating]);
  
  if (songLoading) {
    return (
      <div className="min-h-screen bg-base-dark2 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-teal-400 mx-auto mb-4"></div>
          <p className="text-text-cream300">Loading song data...</p>
        </div>
      </div>
    );
  }

  if (songError || !songData) {
    return (
      <div className="min-h-screen bg-base-dark2 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load song data</p>
          <Button onClick={() => navigate('/lessons')} variant="outline">
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }
// Vocabulary completion screen
if (vocabularyCompleted && vocabularyResults && songData) {
  const masteryPercentage = Math.round((vocabularyResults.gotIt / vocabularyResults.totalWords) * 100);
  const message = masteryPercentage >= 70 ? "Excellent work! You're making great progress with these words." :
                  masteryPercentage > 0 ? "Good effort! Keep practicing to improve your mastery." : "Keep practicing! You got this.";

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-base-dark2 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-cream100 mb-2">
              Vocabulary Complete!
            </h1>
            <p className="text-text-cream300">
              {songData.song.title} by {songData.song.artist}
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${masteryPercentage >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                {masteryPercentage}%
              </div>
              <p className="text-text-cream300 text-lg">
                Mastery Score
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-text-cream400 text-sm">Words Mastered</p>
                <p className="text-green-400 font-semibold">
                  {vocabularyResults.gotIt}
                </p>
              </div>
              <div>
                <p className="text-text-cream400 text-sm">Words to Practice</p>
                <p className="text-yellow-400 font-semibold">
                  {vocabularyResults.needPractice}
                </p>
              </div>
              <div>
                <p className="text-text-cream400 text-sm">Time Taken</p>
                <p className="text-text-cream100 font-semibold">
                  {formatTime(vocabularyResults.timeTaken)}
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-text-cream300 mb-4">
                {message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => {
                  // Reset vocabulary specific states and regenerate content
                  setVocabularyStartTime(null);
                  setVocabularyCompleted(false);
                  setVocabularyResults(null);
                  setVocabularyOutcomes([]);
                  setCurrentIndex(0); // Start from the beginning
                  setSelectedAnswer(null);
                  setShowResult(false);
                  generatePracticeContent(); // Regenerate content for a new session
                }}
                className="button-gradient-primary"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
              <Button
                onClick={() => {
                  // Switch to quiz practice type and navigate
                  setPracticeType('quiz');
                  setQuizCompleted(false); // Ensure quiz completion state is reset
                  setVocabularyCompleted(false); // Ensure vocabulary completion state is reset
                  setVocabularyStartTime(null);
                  setVocabularyResults(null);
                  setVocabularyOutcomes([]);
                  setCurrentIndex(0);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setUserAnswers([]);
                  navigate(`/practice/${songId}?type=quiz`); // Navigate with query param
                }}
                variant="outline"
              >
                <Brain className="w-4 h-4 mr-2" />
                Take Quiz
              </Button>
              <Button
                onClick={() => navigate(`/lessons/${songId}`)}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Song
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
// Listening completion screen
if (listeningCompleted && listeningResults && songData) {
  const scorePercentage = Math.round((listeningResults.correct / listeningResults.total) * 100);
  const message = scorePercentage >= 70 ? "Excellent work! You're a great listener." :
                  scorePercentage > 0 ? "Good effort! Keep practicing your listening skills." : "Keep practicing! You'll get there.";

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-base-dark2 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-cream100 mb-2">
              Listening Practice Complete!
            </h1>
            <p className="text-text-cream300">
              {songData.song.title} by {songData.song.artist}
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${scorePercentage >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                {scorePercentage}%
              </div>
              <p className="text-text-cream300 text-lg">
                {listeningResults.correct} out of {listeningResults.total} correct
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-text-cream400 text-sm">Time Taken</p>
                <p className="text-text-cream100 font-semibold">
                  {formatTime(listeningResults.timeTaken)}
                </p>
              </div>
              <div>
                <p className="text-text-cream400 text-sm">Status</p>
                <p className={`font-semibold ${scorePercentage >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {scorePercentage >= 70 ? 'Great Job!' : 'Keep Practicing'}
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-text-cream300 mb-4">
                {message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => {
                  // Just reset listening state, reuse same exercises
                  setListeningStartTime(null);
                  setListeningCompleted(false);
                  setListeningResults(null);
                  setListeningOutcomes([]);
                  setCurrentIndex(0); // Start from the beginning
                  setSelectedAnswer(null);
                  setShowResult(false);
                  // No need to regenerate - practiceData already contains exercises
                }}
                className="button-gradient-primary"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
              <Button
                onClick={() => {
                  // Switch to quiz practice type and navigate
                  setPracticeType('quiz');
                  setQuizCompleted(false); // Ensure quiz completion state is reset
                  setListeningCompleted(false); // Ensure listening completion state is reset
                  setListeningStartTime(null);
                  setListeningResults(null);
                  setListeningOutcomes([]);
                  setCurrentIndex(0);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setUserAnswers([]);
                  navigate(`/practice/${songId}?type=quiz`); // Navigate with query param
                }}
                variant="outline"
              >
                <Brain className="w-4 h-4 mr-2" />
                Take Quiz
              </Button>
              <Button
                onClick={() => navigate(`/lessons/${songId}`)}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Song
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

    // Pronunciation completion screen (NEW)
    if (pronunciationCompleted && pronunciationResults.length > 0 && songData) {
      const totalScore = pronunciationResults.reduce((sum, r) => sum + r.accuracy_score, 0);
      const averageScore = Math.round(totalScore / pronunciationResults.length);
      const message = averageScore >= 70 ? "Excellent work! Your pronunciation is on point." :
                      averageScore > 0 ? "Good effort! Keep practicing to refine your pronunciation." : "Keep practicing! You'll get there.";

      return (
        <div className="min-h-screen bg-base-dark2 p-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-cream100 mb-2">
                  Pronunciation Practice Complete!
                </h1>
                <p className="text-text-cream300">
                  {songData.song.title} by {songData.song.artist}
                </p>
              </div>

              <Card className="p-8 space-y-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 ${averageScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {averageScore}%
                  </div>
                  <p className="text-text-cream300 text-lg">
                    Average Accuracy
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-text-cream100">Individual Results:</h3>
                  {pronunciationResults.map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-base-dark3 rounded-lg">
                      <span className="font-medium text-text-cream200">{result.exercise.word_or_phrase}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.accuracy_score >= 80 ? 'bg-green-500/20 text-green-400' :
                        result.accuracy_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {result.accuracy_score}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-text-cream300 mb-4">
                    {message}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleTryAgain}
                    className="button-gradient-primary"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Practice Again
                  </Button>
                  <Button
                    onClick={() => navigate(`/lessons/${songId}`)}
                    variant="outline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Song
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      );
    }

  // Quiz completion screen
  if (quizCompleted && practiceData) {
    const scorePercentage = Math.round((finalScore / (practiceData.questions?.length || 0)) * 100);
    const passed = scorePercentage >= 70;
    
    return (
      <div className="min-h-screen bg-base-dark2 p-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-cream100 mb-2">
                Quiz Complete!
              </h1>
              <p className="text-text-cream300">
                {songData.song.title} by {songData.song.artist}
              </p>
            </div>
            
            <Card className="p-8 space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${passed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {scorePercentage}%
                </div>
                <p className="text-text-cream300 text-lg">
                  {finalScore} out of {practiceData.questions?.length || 0} correct
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-text-cream400 text-sm">Time Taken</p>
                  <p className="text-text-cream100 font-semibold">
                    {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <div>
                  <p className="text-text-cream400 text-sm">Status</p>
                  <p className={`font-semibold ${passed ? 'text-green-400' : 'text-yellow-400'}`}>
                    {passed ? 'Passed' : 'Keep Practicing'}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-text-cream300 mb-4">
                  {passed 
                    ? "Great job! You've mastered this content." 
                    : "Good effort! Try again to improve your score."
                  }
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleTryAgain}
                  className="button-gradient-primary"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => navigate(`/practice/${songId}?type=vocabulary`)}
                  variant="outline"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Practice Vocabulary
                </Button>
                <Button 
                  onClick={handleBackToSong}
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Song
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-base-dark2">
      {/* Header */}
      <div className="border-b border-accent-teal-500/20 bg-base-dark1/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(`/lessons/${songId}`)}
                variant="ghost"
                size="sm"
                className="text-text-cream300 hover:text-text-cream100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Song
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-text-cream100">
                  Practice: {songData.song.title}
                </h1>
                <p className="text-sm text-text-cream400">
                  {songData.song.artist}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Practice Type Selection */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => {
                setPracticeType('quiz');
                // Reset state when switching to quiz
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setCorrectAnswers([]);
                setQuizCompleted(false);
                setUserAnswers([]);
                setPracticeData(null);
                // New vocabulary-specific resets
                setVocabularyStartTime(null);
                setVocabularyCompleted(false);
                setVocabularyResults(null);
                setVocabularyOutcomes([]);
                setListeningStartTime(null);
                setListeningCompleted(false);
                setListeningResults(null);
                // Pronunciation-specific resets (NEW)
                setPronunciationExercises([]);
                setCurrentPronunciationIndex(0);
                setPronunciationResults([]);
                setPronunciationCompleted(false);
                setPronunciationStartTime(null);
              }}
              variant={practiceType === 'quiz' ? 'default' : 'outline'}
              className={practiceType === 'quiz' ? 'button-gradient-primary' : ''}
            >
              <Brain className="w-4 h-4 mr-2" />
              Quiz
            </Button>
            <Button
              onClick={() => {
                setPracticeType('vocabulary');
                // Reset state when switching to vocabulary
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setCorrectAnswers([]);
                setQuizCompleted(false);
                setUserAnswers([]);
                setPracticeData(null);
                // New vocabulary-specific resets
                setVocabularyStartTime(null);
                setVocabularyCompleted(false);
                setVocabularyResults(null);
                setVocabularyOutcomes([]);
                setListeningStartTime(null);
                setListeningCompleted(false);
                setListeningResults(null);
                // Pronunciation-specific resets (NEW)
                setPronunciationExercises([]);
                setCurrentPronunciationIndex(0);
                setPronunciationResults([]);
                setPronunciationCompleted(false);
                setPronunciationStartTime(null);
              }}
              variant={practiceType === 'vocabulary' ? 'default' : 'outline'}
              className={practiceType === 'vocabulary' ? 'button-gradient-primary' : ''}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Vocabulary
            </Button>
            <Button
              onClick={() => {
                setPracticeType('listening');
                // Reset state when switching to listening
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setCorrectAnswers([]);
                setQuizCompleted(false);
                setUserAnswers([]);
                setPracticeData(null);
                setVocabularyStartTime(null);
                setVocabularyCompleted(false);
                setVocabularyResults(null);
                setVocabularyOutcomes([]);
                setListeningStartTime(null);
                setListeningCompleted(false);
                setListeningResults(null);
                // Pronunciation-specific resets (NEW)
                setPronunciationExercises([]);
                setCurrentPronunciationIndex(0);
                setPronunciationResults([]);
                setPronunciationCompleted(false);
                setPronunciationStartTime(null);
              }}
              variant={practiceType === 'listening' ? 'default' : 'outline'}
              className={practiceType === 'listening' ? 'button-gradient-primary' : ''}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Listening
            </Button>
            <Button
              onClick={() => {
                setPracticeType('pronunciation');
                // Reset state when switching to pronunciation
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setCorrectAnswers([]);
                setQuizCompleted(false);
                setUserAnswers([]);
                setPracticeData(null);
                setVocabularyStartTime(null);
                setVocabularyCompleted(false);
                setVocabularyResults(null);
                setVocabularyOutcomes([]);
                setListeningStartTime(null);
                setListeningCompleted(false);
                setListeningResults(null);
                // Pronunciation-specific resets (NEW)
                setPronunciationExercises([]);
                setCurrentPronunciationIndex(0);
                setPronunciationResults([]);
                setPronunciationCompleted(false);
                setPronunciationStartTime(null);
              }}
              variant={practiceType === 'pronunciation' ? 'default' : 'outline'}
              className={practiceType === 'pronunciation' ? 'button-gradient-primary' : ''}
            >
              <Mic className="w-4 h-4 mr-2" />
              Pronunciation
            </Button>
          </div>
        </div>

        {/* Practice Content */}
        {isGenerating ? (
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-teal-400 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-text-cream100 mb-2">
              Generating Practice Content
            </h3>
            <p className="text-text-cream300">
              Creating personalized {practiceType} exercises for you...
            </p>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <div className="text-red-400 mb-4">
              <Brain className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">Generation Failed</h3>
              <p>{error}</p>
            </div>
            <Button 
              onClick={generatePracticeContent}
              className="button-gradient-primary"
            >
              Try Again
            </Button>
          </Card>
        ) : practiceType === 'pronunciation' ? ( // ADD THIS BLOCK
          pronunciationExercises.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-text-cream300">
                  Exercise {currentPronunciationIndex + 1} of {pronunciationExercises.length}
                </p>
                <div className="w-full bg-base-dark3 rounded-full h-2 mt-2">
                  <div 
                    className="bg-accent-teal-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentPronunciationIndex) / pronunciationExercises.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <PronunciationExercise
                exercise={pronunciationExercises[currentPronunciationIndex]}
                onComplete={completePronunciationExercise}
                onNext={currentPronunciationIndex < pronunciationExercises.length - 1 ? 
                  () => setCurrentPronunciationIndex(prev => prev + 1) : undefined}
              />
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Mic className="w-12 h-12 mx-auto mb-4 text-accent-teal-400" />
              <h3 className="text-lg font-semibold text-text-cream100 mb-2">
                Ready to Practice Pronunciation
              </h3>
              <p className="text-text-cream300 mb-4">
                Click the button below to generate pronunciation exercises
              </p>
              <Button 
                onClick={generatePracticeContent}
                className="button-gradient-primary"
              >
                Generate Pronunciation Exercises
              </Button>
            </Card>
          )
        ) : practiceData ? (
          <Practice 
            practiceData={practiceData}
            songData={songData}
            correctAnswers={correctAnswers}
            currentIndex={currentIndex}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            onQuizStart={handleQuizStart}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onAnswerSelect={setSelectedAnswer}
            onShowResult={setShowResult}
            onMasteryUpdate={handleMasteryUpdate}
            onPronunciationExerciseCompleted={completePronunciationExercise}
          />
        ) : (
          <Card className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-accent-teal-400" />
            <h3 className="text-lg font-semibold text-text-cream100 mb-2">
              Ready to Practice
            </h3>
            <p className="text-text-cream300 mb-4">
              Click the button below to generate {practiceType === 'vocabulary' ? 'Vocabulary' : 
                       practiceType === 'quiz' ? 'Quiz' :
                       practiceType === 'listening' ? 'Listening' :
                       'Pronunciation'} Exercises
            </p>
            <Button 
              onClick={generatePracticeContent}
              className="button-gradient-primary"
            >
              Generate {practiceType === 'vocabulary' ? 'Vocabulary' : 
                       practiceType === 'quiz' ? 'Quiz' :
                       practiceType === 'listening' ? 'Listening' :
                       'Pronunciation'} Exercises
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}