// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  learning_languages: string[];
  proficiency_level?: ProficiencyLevel;
  level: LanguageLevel;
  savedVocabulary: VocabularyItem[];
  completedSongs: string[];
  completedQuizzes: string[];
  subscription_tier: 'free' | 'pro';
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
}

export type LanguageLevel = 'beginner' | 'intermediate' | 'advanced' | 'fluent';
export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Fluent';
export type SupportedLanguage = 'Spanish' | 'French' | 'Italian' | 'German';

// Song and lyrics types
export interface Song {
  id: string;
  title: string;
  artist: string;
  language: string;
  level: LanguageLevel;
  genre: string;
  coverUrl: string;
  audioUrl: string;
  lyrics: Lyric[];
  popularity: number;
}

export interface Lyric {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  translation?: string;
  vocabulary?: VocabularyItem[];
}

export interface VocabularyItem {
  id: string;
  original: string;
  translation: string;
  context: string;
  language: string;
  songId?: string;
}

// Quiz types
export interface Quiz {
  id: string;
  title: string;
  language: string;
  level: LanguageLevel;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'match' | 'listening';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

// User progress tracking
export interface UserProgress {
  userId: string;
  songsProgress: {
    [songId: string]: {
      completedSections: number;
      totalSections: number;
      lastPlayed: Date;
    };
  };
  vocabulary: {
    [wordId: string]: {
      correctCount: number;
      incorrectCount: number;
      lastReviewed: Date;
    };
  };
  quizResults: {
    [quizId: string]: {
      score: number;
      totalQuestions: number;
      completedAt: Date;
    };
  };
}

// Authentication types
export interface AuthFormData {
  email: string;
  password: string;
  username?: string;
}

export interface OnboardingData {
  selectedLanguage: SupportedLanguage;
  proficiencyLevel: ProficiencyLevel;
}

export interface PreferenceUpdate {
  userId: string;
  selectedLanguage: SupportedLanguage;
  proficiencyLevel: ProficiencyLevel;
}

export interface SignupResult {
  needsEmailConfirmation: boolean;
}

// Filter types
export interface SongFilters {
  language?: string;
  level?: LanguageLevel;
  genre?: string;
  searchQuery?: string;
}