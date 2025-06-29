import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, RotateCcw, AlertCircle } from 'lucide-react';
import { transcribeAudioWithElevenLabs } from '@/lib/api';

export interface PronunciationExerciseData {
  id: string;
  word_or_phrase: string;
  phonetic_transcription?: string;
  reference_audio_url: string;
  context_sentence?: string;
  user_vocabulary_id?: string;
  difficulty_level: string;
}

interface PronunciationExerciseProps {
  exercise: PronunciationExerciseData;
  onComplete: (result: {
    transcribed_text: string;
    accuracy_score: number;
    feedback: string;
  }) => void;
  onNext?: () => void;
}

export function PronunciationExercise({ exercise, onComplete, onNext }: PronunciationExerciseProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const referenceAudioRef = useRef<HTMLAudioElement>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkMicrophonePermission();
    
    // Cleanup on unmount
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Your browser does not support audio recording.');
        return;
      }

      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasPermission(permission.state === 'granted');
      
      permission.addEventListener('change', () => {
        setHasPermission(permission.state === 'granted');
      });
    } catch (error) {
      console.log('Permission API not supported, will request on first use');
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop()); // Stop the stream
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      setError('Microphone access was denied. Please allow microphone access and try again.');
      return false;
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    try {
      setError(null);
      setTranscription('');
      setScore(null);
      setFeedback('');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Check for supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: audioChunksRef.current[0]?.type || 'audio/webm' 
        });
        await processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 10 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not access microphone. Please check permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Transcribe with Eleven Labs STT via secure Edge Function
      const { text, confidence } = await transcribeAudioWithElevenLabs(audioBlob);
      
      if (!text || text.trim().length === 0) {
        setError('No speech detected. Please try speaking more clearly.');
        return;
      }

      setTranscription(text);

      // Calculate accuracy score
      const accuracyScore = calculateAccuracyScore(exercise.word_or_phrase, text);
      setScore(accuracyScore);

      // Generate feedback
      const feedbackText = generateFeedback(exercise.word_or_phrase, text, accuracyScore);
      setFeedback(feedbackText);

      // Mark as completed
      setHasCompleted(true);

      // Report result to parent
      onComplete({
        transcribed_text: text,
        accuracy_score: accuracyScore,
        feedback: feedbackText
      });

    } catch (error) {
      console.error('Error processing recording:', error);
      setError('Failed to process your recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateAccuracyScore = (target: string, transcribed: string): number => {
    const normalizeText = (text: string) => 
      text.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
    
    const targetNormalized = normalizeText(target);
    const transcribedNormalized = normalizeText(transcribed);

    // Exact match
    if (targetNormalized === transcribedNormalized) return 100;

    // Check if target word is contained in transcription
    if (transcribedNormalized.includes(targetNormalized)) return 85;

    // Check if transcription contains target (word order might be different)
    const targetWords = targetNormalized.split(' ');
    const transcribedWords = transcribedNormalized.split(' ');
    
    let matchedWords = 0;
    for (const word of targetWords) {
      if (transcribedWords.includes(word)) {
        matchedWords++;
      }
    }
    
    if (matchedWords > 0) {
      const wordMatchScore = (matchedWords / targetWords.length) * 70;
      return Math.round(wordMatchScore);
    }

    // Simple character similarity (Levenshtein-like)
    const similarity = calculateSimilarity(targetNormalized, transcribedNormalized);
    return Math.max(0, Math.round(similarity * 100));
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const generateFeedback = (target: string, transcribed: string, score: number): string => {
    if (score >= 90) return "Excellent pronunciation! 🎉";
    if (score >= 75) return "Good job! Your pronunciation is clear. 👍";
    if (score >= 60) return "Not bad! Keep practicing for better clarity. 📈";
    if (score >= 40) return "Keep trying! Focus on the sounds and rhythm. 🎯";
    return "Let's try again! Listen to the reference audio first. 🔄";
  };

  const playReferenceAudio = () => {
    if (referenceAudioRef.current) {
      referenceAudioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setError('Could not play reference audio. Please check your connection.');
      });
    }
  };

  const resetExercise = () => {
    setTranscription('');
    setScore(null);
    setFeedback('');
    setError(null);
    setHasCompleted(false);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Exercise Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2 text-text-cream100">Pronounce this word:</h3>
          <div className="text-4xl font-bold text-accent-teal-400 mb-2">
            {exercise.word_or_phrase}
          </div>
          {exercise.phonetic_transcription && (
            <div className="text-lg text-text-cream300 mb-2">
              /{exercise.phonetic_transcription}/
            </div>
          )}
          {exercise.context_sentence && (
            <div className="text-sm text-text-cream400 italic">
              Example: "{exercise.context_sentence}"
            </div>
          )}
        </div>

        {/* Reference Audio */}
        <div className="text-center">
          <Button 
            onClick={playReferenceAudio}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Listen to Reference
          </Button>
          <audio 
            ref={referenceAudioRef} 
            src={exercise.reference_audio_url}
            preload="auto"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="text-center space-y-4">
          {hasPermission === false && !error && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-400 mb-2">
                Microphone access is required for pronunciation practice.
              </p>
              <Button onClick={requestMicrophonePermission} variant="outline">
                Grant Microphone Permission
              </Button>
            </div>
          )}

          {hasPermission !== false && !error && (
            <div className="space-y-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-32 h-32 rounded-full text-white font-bold text-lg ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'button-gradient-primary'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-8 h-8 mb-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 mb-2" />
                    Record
                  </>
                )}
              </Button>
              
              {isRecording && (
                <p className="text-sm text-text-cream300">
                  Recording... (max 10 seconds)
                </p>
              )}
              
              {isProcessing && (
                <p className="text-sm text-accent-teal-400">
                  Processing your pronunciation...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {transcription && (
          <div className="space-y-4">
            <div className="bg-base-dark3 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-text-cream100">What I heard:</h4>
              <p className="text-lg text-text-cream200">{transcription}</p>
            </div>

            {score !== null && (
              <div className={`rounded-lg p-4 ${
                score >= 80 ? 'bg-green-500/10 border border-green-500/20' :
                score >= 60 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                'bg-red-500/10 border border-red-500/20'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  score >= 80 ? 'text-green-400' :
                  score >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>Score: {score}/100</h4>
                <p className="text-text-cream300">{feedback}</p>
              </div>
            )}

            {hasCompleted && (
              <div className="flex gap-2 justify-center">
                <Button onClick={resetExercise} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                {onNext && (
                  <Button 
                    onClick={onNext}
                    className="button-gradient-primary"
                  >
                    Next Exercise
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default PronunciationExercise;