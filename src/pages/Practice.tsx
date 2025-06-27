import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Brain, RotateCcw, Volume2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSongData } from '@/lib/hooks';
import { Practice } from '@/components/ui/practice';
import { fetchQuizForSong, saveGeneratedQuizToDatabase, saveQuizResultToDatabase, getUserVocabulary, updateUserVocabularyProgress } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { ListeningExerciseData } from '@/components/ui/listening-exercise';
import { PronunciationExerciseData } from '@/components/ui/pronunciation-exercise';

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
            last_practiced_at: item.last_practiced_at
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


// Initialize vocabulary session start time
useEffect(() => {
  if (practiceData?.practiceType === 'vocabulary' && currentIndex === 0 && !vocabularyStartTime) {
    setVocabularyStartTime(new Date());
    setVocabularyOutcomes([]); // Reset outcomes for a new session
    console.log('⏱️ Vocabulary session started!');
  }
}, [practiceData, currentIndex, vocabularyStartTime, practiceType]);


  // Handle mastery updates for vocabulary practice
  const handleMasteryUpdate = async (vocabularyItem: VocabularyItem, knewIt: boolean) => {
    try {
      await updateUserVocabularyProgress({
        word: vocabularyItem.word,
        translation: vocabularyItem.translation,
        source: vocabularyItem.source,
        user_vocabulary_id: vocabularyItem.user_vocabulary_id,
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
          last_practiced_at: item.last_practiced_at
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
  
      const userProficiencyLevel = userProfile?.proficiency_level || 'intermediate';
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
      
      if (practiceType === 'listening' || practiceType === 'pronunciation') {
        // For now, use mock data for listening and pronunciation
        generateMockContent(practiceType);
      } else {
        await generateNewContent(userProficiencyLevel);
      }
      
    } catch (error) {
      console.error('Error in generatePracticeContent:', error);
      setError('Failed to load practice content. Please try again.');
      setIsGenerating(false);
    }
  };

  // Add this function
const generateMockContent = (type: 'listening' | 'pronunciation') => {
  if (!songData?.song) return;

  if (type === 'listening') {
    const mockListeningExercises = [
      {
        id: 'listen-1',
        audio_url: 'mock-audio-url-1', // Replace with actual mock audio URLs if available
        question: `What is the speaker saying in ${songData.song.title}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 'Option A',
        explanation: 'This is the correct interpretation of the audio.',
        difficulty_level: 'beginner',
      },
      {
        id: 'listen-2',
        audio_url: 'mock-audio-url-2',
        question: `Which phrase best describes the mood of the music in ${songData.song.title}?`,
        options: ['Happy and upbeat', 'Sad and melancholic', 'Energetic and fast', 'Calm and soothing'],
        correct_answer: 'Calm and soothing',
        explanation: 'The music has a slow tempo and soft instrumentation.',
        difficulty_level: 'intermediate',
      },
      {
        id: 'listen-3',
        audio_url: 'mock-audio-url-3',
        question: `What is the cultural reference implied in this part of ${songData.song.title}?`,
        options: ['A traditional festival', 'A historical event', 'A common idiom', 'A famous landmark'],
        correct_answer: 'A traditional festival',
        explanation: 'The lyrics mention elements commonly associated with [specific festival].',
        difficulty_level: 'advanced',
      },
    ];
    setPracticeData({
      listening: mockListeningExercises,
      songId: songData.song.id,
      practiceType: type,
      timestamp: new Date().toISOString(),
    });
  } else if (type === 'pronunciation') {
    const mockPronunciationExercises = [
      {
        id: 'pron-1',
        word_or_phrase: 'Bonjour',
        phonetic_transcription: 'bɔ̃ʒuʁ',
        reference_audio_url: 'mock-pron-audio-1',
        difficulty_level: 'beginner',
        language: songData.song.language,
        context: 'Common greeting',
      },
      {
        id: 'pron-2',
        word_or_phrase: 'Rendezvous',
        phonetic_transcription: 'ʁɑ̃devu',
        reference_audio_url: 'mock-pron-audio-2',
        difficulty_level: 'intermediate',
        language: songData.song.language,
        context: 'Meeting point',
      },
      {
        id: 'pron-3',
        word_or_phrase: 'Écureuil',
        phonetic_transcription: 'ekyʁœj',
        reference_audio_url: 'mock-pron-audio-3',
        difficulty_level: 'advanced',
        language: songData.song.language,
        context: 'Squirrel (challenging sound)',
      },
    ];
    setPracticeData({
      pronunciation: mockPronunciationExercises,
      songId: songData.song.id,
      practiceType: type,
      timestamp: new Date().toISOString(),
    });
  }
  setIsGenerating(false);
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
  
  const handleQuizAnswer = (answer: string, isCorrect: boolean) => {
    const newCorrectAnswers = [...correctAnswers];
    newCorrectAnswers[currentIndex] = isCorrect;
    setCorrectAnswers(newCorrectAnswers);
    
    // Track the actual answer selected
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentIndex] = answer;
    setUserAnswers(newUserAnswers);
    console.log('✅ handleQuizAnswer called:', { currentIndex, isCorrect, answer });
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
    ? (practiceData?.pronunciation?.length || 0) // Add this line
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

  
  const handleTryAgain = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers([]);
    setQuizCompleted(false);
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
  }, [practiceData]);
  
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

  // Quiz completion screen
  if (quizCompleted && practiceData) {
    const scorePercentage = Math.round((finalScore / practiceData.questions.length) * 100);
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
                  {finalScore} out of {practiceData.questions.length} correct
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
                  onClick={() => navigate('/practice')}
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
        ) : practiceData ? (
          <Practice 
            practiceData={practiceData}
            songData={songData}
            correctAnswers={correctAnswers}
            currentIndex={currentIndex}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            onQuizStart={handleQuizStart}
            onQuizAnswer={handleQuizAnswer}
            onNext={handleNext}
            onAnswerSelect={setSelectedAnswer}
            onShowResult={setShowResult}
            onMasteryUpdate={handleMasteryUpdate}
          />
        ) : (
          <Card className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-accent-teal-400" />
            <h3 className="text-lg font-semibold text-text-cream100 mb-2">
              Ready to Practice
            </h3>
            <p className="text-text-cream300 mb-4">
              Click the button below to generate {practiceType} exercises
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