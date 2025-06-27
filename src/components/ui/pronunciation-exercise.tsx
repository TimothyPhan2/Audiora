import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Volume2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PronunciationExerciseData {
  id: string;
  word_or_phrase: string;
  phonetic_transcription?: string;
  reference_audio_url?: string;
  difficulty_level: string;
  language: string;
  context?: string;
}

interface PronunciationExerciseProps {
  exercise: PronunciationExerciseData;
  onComplete: (score: number) => void;
  onNext: () => void;
  className?: string;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'completed';

export function PronunciationExercise({
  exercise,
  onComplete,
  onNext,
  className,
}: PronunciationExerciseProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    score: number;
    message: string;
    improvements: string[];
  } | null>(null);
  const [hasPlayedReference, setHasPlayedReference] = useState(false);

  const handleStartRecording = () => {
    setRecordingState('recording');
    setRecordingUrl(null);
    setFeedback(null);
    
    // Mock recording - in real implementation, this would use MediaRecorder API
    setTimeout(() => {
      setRecordingState('idle');
      setRecordingUrl('mock-recording-url');
    }, 3000);
  };

  const handleStopRecording = () => {
    if (recordingState === 'recording') {
      setRecordingState('processing');
      
      // Mock processing and feedback generation
      setTimeout(() => {
        const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
        const mockFeedback = {
          score: mockScore,
          message: mockScore >= 85 
            ? "Excellent pronunciation! Your accent is very clear."
            : mockScore >= 70 
            ? "Good job! Your pronunciation is improving."
            : "Keep practicing! Focus on the highlighted areas.",
          improvements: mockScore < 85 ? [
            "Try to emphasize the vowel sounds more",
            "Work on the rhythm and stress patterns",
            "Practice the 'r' sound pronunciation"
          ] : []
        };
        
        setFeedback(mockFeedback);
        setRecordingState('completed');
        onComplete(mockScore);
      }, 2000);
    }
  };

  const handlePlayReference = () => {
    setHasPlayedReference(true);
    // Mock reference audio playback
    console.log('Playing reference audio for:', exercise.word_or_phrase);
  };

  const handlePlayRecording = () => {
    // Mock user recording playback
    console.log('Playing user recording');
  };

  const getRecordingButtonContent = () => {
    switch (recordingState) {
      case 'recording':
        return {
          icon: <Square className="w-6 h-6" />,
          text: 'Stop Recording',
          className: 'bg-red-500 hover:bg-red-600'
        };
      case 'processing':
        return {
          icon: <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent" />,
          text: 'Processing...',
          className: 'bg-yellow-500 cursor-not-allowed'
        };
      default:
        return {
          icon: <Mic className="w-6 h-6" />,
          text: recordingUrl ? 'Record Again' : 'Start Recording',
          className: 'button-gradient-primary'
        };
    }
  };

  const buttonContent = getRecordingButtonContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full max-w-2xl mx-auto", className)}
    >
      <Card className="p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mic className="w-6 h-6 text-accent-teal-400" />
            <h3 className="text-xl font-semibold text-text-cream100">
              Pronunciation Exercise
            </h3>
          </div>
          <p className="text-text-cream300">
            Practice pronouncing the word or phrase
          </p>
        </div>

        {/* Word/Phrase Display */}
        <div className="text-center space-y-4">
          <div className="p-6 bg-gradient-to-br from-accent-teal-500/10 to-accent-persian-500/10 rounded-xl border border-accent-teal-500/20">
            <h2 className="text-3xl font-bold text-text-cream100 mb-2">
              {exercise.word_or_phrase}
            </h2>
            {exercise.phonetic_transcription && (
              <p className="text-lg text-accent-teal-400 font-mono">
                /{exercise.phonetic_transcription}/
              </p>
            )}
            {exercise.context && (
              <p className="text-sm text-text-cream300 mt-3 italic">
                Context: {exercise.context}
              </p>
            )}
          </div>

          {/* Reference Audio */}
          {exercise.reference_audio_url && (
            <div className="flex justify-center">
              <Button
                onClick={handlePlayReference}
                variant="outline"
                className="border-accent-teal-500/30 text-accent-teal-400 hover:bg-accent-teal-500/10"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {hasPlayedReference ? 'Play Again' : 'Listen to Example'}
              </Button>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            whileHover={{ scale: recordingState === 'processing' ? 1 : 1.05 }}
            whileTap={{ scale: recordingState === 'processing' ? 1 : 0.95 }}
            className="relative"
          >
            <Button
              onClick={recordingState === 'recording' ? handleStopRecording : handleStartRecording}
              disabled={recordingState === 'processing'}
              size="lg"
              className={cn(
                "w-24 h-24 rounded-full text-white shadow-lg transition-all duration-300",
                buttonContent.className
              )}
            >
              {buttonContent.icon}
            </Button>
            
            {recordingState === 'recording' && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
          
          <p className="text-sm text-text-cream400 text-center">
            {buttonContent.text}
          </p>

          {/* Playback Controls */}
          {recordingUrl && recordingState !== 'recording' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Button
                onClick={handlePlayRecording}
                variant="outline"
                size="sm"
                className="border-accent-teal-500/30 text-accent-teal-400 hover:bg-accent-teal-500/10"
              >
                <Play className="w-4 h-4 mr-2" />
                Play My Recording
              </Button>
            </motion.div>
          )}
        </div>

        {/* Feedback Section */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-accent-teal-500/20 pt-6 space-y-4"
            >
              {/* Score Display */}
              <div className="text-center">
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold",
                  feedback.score >= 85 ? "bg-green-500/20 text-green-400" :
                  feedback.score >= 70 ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                )}>
                  {feedback.score >= 70 ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  {feedback.score}% Accuracy
                </div>
              </div>

              {/* Feedback Message */}
              <div className="p-4 bg-accent-teal-500/10 border border-accent-teal-500/20 rounded-lg">
                <p className="text-text-cream200 text-center">{feedback.message}</p>
              </div>

              {/* Improvement Suggestions */}
              {feedback.improvements.length > 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <h5 className="font-medium text-yellow-400 mb-2">Areas for Improvement:</h5>
                  <ul className="space-y-1">
                    {feedback.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-text-cream300 flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Button */}
              <Button onClick={onNext} className="w-full button-gradient-primary">
                Next Exercise
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {recordingState === 'idle' && !recordingUrl && (
          <div className="text-center space-y-2">
            <p className="text-sm text-text-cream400">
              Click the microphone to start recording your pronunciation
            </p>
            {exercise.reference_audio_url && !hasPlayedReference && (
              <p className="text-xs text-text-cream500">
                Tip: Listen to the example first for better results
              </p>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default PronunciationExercise;