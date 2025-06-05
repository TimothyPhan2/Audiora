// User types
export interface User {
  id: string;
  email: string;
  name: string;
  language: string;
  level: LanguageLevel;
  savedVocabulary: VocabularyItem[];
  completedSongs: string[];
  completedQuizzes: string[];
}

export type LanguageLevel = 'beginner' | 'intermediate' | 'advanced' | 'fluent';

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
  name?: string;
  language?: string;
  level?: LanguageLevel;
}

// Filter types
export interface SongFilters {
  language?: string;
  level?: LanguageLevel;
  genre?: string;
  searchQuery?: string;
}