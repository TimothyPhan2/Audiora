import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Brain, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSongData } from '@/lib/hooks';
import { Practice } from '@/components/ui/practice';
import { fetchQuizForSong, saveGeneratedQuizToDatabase, saveQuizResultToDatabase } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface VocabularyItem {
  word: string;
  translation: string;
  example_sentence: string;
  difficulty_level: string;
  part_of_speech: string;
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
  questions: PracticeQuestion[];
  vocabulary?: VocabularyItem[];
  songId: string;
  practiceType: string;
  timestamp: string;
}

export default function PracticePage() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: songData, isLoading: songLoading, error: songError } = useSongData(songId);
  
  const [practiceType, setPracticeType] = useState<'vocabulary' | 'quiz'>('quiz');
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

  
  useEffect(() => {
    if (songData?.song) {
      generatePracticeContent();
    }
  }, [songData, practiceType]);

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
      await generateNewContent(userProficiencyLevel);
      
    } catch (error) {
      console.error('Error in generatePracticeContent:', error);
      setError('Failed to load practice content. Please try again.');
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
          lyrics: songData?.lyrics.map(l => l.text).join('\n')
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
      : (practiceData?.vocabulary?.length || 0);
      
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
      } else {
        // For vocabulary, just navigate back or show completion
        navigate(`/lessons/${songId}`);
      }
    }
  };
  
  const completeQuiz = async () => {
    console.log('🏁 completeQuiz called');
    if (!quizStartTime || !practiceData) return;
    
    const endTime = new Date();
    const timeTakenSeconds = Math.round((endTime.getTime() - quizStartTime.getTime()) / 1000);
    const score = correctAnswers.filter(Boolean).length;
    const totalQuestions = practiceData.questions.length;
    
    setFinalScore(score);
    setTimeTaken(timeTakenSeconds);
    setQuizCompleted(true);
    const submittedAnswers = practiceData.questions.reduce((acc, question, index) => {
      acc[`question_${index}`] = {
      question: question.question,
      selected_answer: userAnswers[index] || '', // Use tracked answers
      correct_answer: question.correct_answer,
      is_correct: correctAnswers[index] || false
      };
      return acc;
    }, {} as Record<string, any>);
    
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
                setPracticeType('vocabulary');
                // Reset state when switching to vocabulary
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setCorrectAnswers([]);
                setQuizCompleted(false);
                setUserAnswers([]);
                setPracticeData(null);
              }}
              variant={practiceType === 'vocabulary' ? 'default' : 'outline'}
              className={practiceType === 'vocabulary' ? 'button-gradient-primary' : ''}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Vocabulary
            </Button>
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
              }}
              variant={practiceType === 'quiz' ? 'default' : 'outline'}
              className={practiceType === 'quiz' ? 'button-gradient-primary' : ''}
            >
              <Brain className="w-4 h-4 mr-2" />
              Quiz
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
              Generate {practiceType === 'vocabulary' ? 'Vocabulary' : 'Quiz'}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}