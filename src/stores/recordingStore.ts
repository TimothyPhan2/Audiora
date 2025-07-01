import { create } from 'zustand';

interface RecordingState {
  isRecording: boolean;
  recordingUrl: string | null;
  feedback: string | null;
  startRecording: () => void;
  stopRecording: () => Promise<void>;
  clearRecording: () => void;
}

// Recording state for pronunciation practice
export const useRecordingStore = create<RecordingState>()((set) => ({
  isRecording: false,
  recordingUrl: null,
  feedback: null,
  
  startRecording: () => {
    set({ isRecording: true, feedback: null });
  },
  
  stopRecording: async () => {
    set({ isRecording: false });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock recording URL and feedback
      const mockUrl = 'mock-recording-url';
      
      // Generate random feedback
      const feedbackOptions = [
        'Great pronunciation! Your accent is improving.',
        'Good effort! Try to emphasize the vowel sounds more.',
        'Nice job! Work on the rhythm of the phrase.',
        'Well done! Your intonation is getting better.'
      ];
      
      const randomFeedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
      
      set({ recordingUrl: mockUrl, feedback: randomFeedback });
    } catch (error) {
      set({ 
        feedback: 'Failed to process recording. Please try again.',
        recordingUrl: null
      });
    }
  },
  
  clearRecording: () => {
    set({ recordingUrl: null, feedback: null });
  },
})); 