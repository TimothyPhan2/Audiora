import { Song, User, VocabularyItem, Quiz } from './types';

// Mock users data
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'demo@audiora.com',
    username: 'demo_user',
    learning_languages: ['spanish'],
    proficiency_level: 'Intermediate',
    level: 'beginner',
    savedVocabulary: [],
    completedSongs: [],
    completedQuizzes: [],
    subscription_tier: 'pro',
    role: 'user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'test@audiora.com',
    username: 'test_user',
    learning_languages: ['french'],
    proficiency_level: 'Advanced',
    level: 'intermediate',
    savedVocabulary: [],
    completedSongs: [],
    completedQuizzes: [],
    subscription_tier: 'free',
    role: 'user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Mock vocabulary items
export const mockVocabulary: VocabularyItem[] = [
  {
    id: 'vocab-1',
    original: 'corazón',
    translation: 'heart',
    context: 'Mi corazón late por ti',
    language: 'spanish',
    songId: 'song-1',
  },
  {
    id: 'vocab-2',
    original: 'vida',
    translation: 'life',
    context: 'Esta es mi vida',
    language: 'spanish',
    songId: 'song-1',
  },
  {
    id: 'vocab-3',
    original: 'amour',
    translation: 'love',
    context: 'L\'amour est tout',
    language: 'french',
    songId: 'song-2',
  },
  {
    id: 'vocab-4',
    original: 'tiempo',
    translation: 'time',
    context: 'El tiempo pasa lentamente',
    language: 'spanish',
    songId: 'song-3',
  },
  {
    id: 'vocab-5',
    original: 'jour',
    translation: 'day',
    context: 'C\'est un beau jour',
    language: 'french',
    songId: 'song-2',
  },
];

// Mock songs data
export const mockSongs: Song[] = [
  {
    id: 'song-1',
    title: 'Despacito',
    artist: 'Luis Fonsi',
    language: 'spanish',
    level: 'beginner',
    genre: 'pop',
    coverUrl: 'https://images.pexels.com/photos/1001850/pexels-photo-1001850.jpeg?auto=compress&cs=tinysrgb&w=600',
    audioUrl: 'mock-audio-url-1',
    popularity: 95,
    lyrics: [
      {
        id: 'lyric-1-1',
        text: 'Sí, sabes que ya llevo un rato mirándote',
        startTime: 0,
        endTime: 5,
        translation: 'Yes, you know I\'ve been looking at you for a while',
        vocabulary: [
          {
            id: 'vocab-1-1',
            original: 'sabes',
            translation: 'you know',
            context: 'Sí, sabes que ya llevo un rato mirándote',
            language: 'spanish',
          },
          {
            id: 'vocab-1-2',
            original: 'mirándote',
            translation: 'looking at you',
            context: 'Sí, sabes que ya llevo un rato mirándote',
            language: 'spanish',
          },
        ],
      },
      {
        id: 'lyric-1-2',
        text: 'Tengo que bailar contigo hoy',
        startTime: 5,
        endTime: 10,
        translation: 'I have to dance with you today',
        vocabulary: [
          {
            id: 'vocab-1-3',
            original: 'bailar',
            translation: 'to dance',
            context: 'Tengo que bailar contigo hoy',
            language: 'spanish',
          },
          {
            id: 'vocab-1-4',
            original: 'contigo',
            translation: 'with you',
            context: 'Tengo que bailar contigo hoy',
            language: 'spanish',
          },
        ],
      },
    ],
  },
  {
    id: 'song-2',
    title: 'La Vie En Rose',
    artist: 'Edith Piaf',
    language: 'french',
    level: 'intermediate',
    genre: 'classic',
    coverUrl: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=600',
    audioUrl: 'mock-audio-url-2',
    popularity: 85,
    lyrics: [
      {
        id: 'lyric-2-1',
        text: 'Des yeux qui font baisser les miens',
        startTime: 0,
        endTime: 5,
        translation: 'Eyes that make mine look down',
        vocabulary: [
          {
            id: 'vocab-2-1',
            original: 'yeux',
            translation: 'eyes',
            context: 'Des yeux qui font baisser les miens',
            language: 'french',
          },
          {
            id: 'vocab-2-2',
            original: 'baisser',
            translation: 'to lower',
            context: 'Des yeux qui font baisser les miens',
            language: 'french',
          },
        ],
      },
      {
        id: 'lyric-2-2',
        text: 'Un rire qui se perd sur sa bouche',
        startTime: 5,
        endTime: 10,
        translation: 'A laugh that gets lost on his lips',
        vocabulary: [
          {
            id: 'vocab-2-3',
            original: 'rire',
            translation: 'laugh',
            context: 'Un rire qui se perd sur sa bouche',
            language: 'french',
          },
          {
            id: 'vocab-2-4',
            original: 'bouche',
            translation: 'mouth',
            context: 'Un rire qui se perd sur sa bouche',
            language: 'french',
          },
        ],
      },
    ],
  },
  {
    id: 'song-3',
    title: 'Bailando',
    artist: 'Enrique Iglesias',
    language: 'spanish',
    level: 'intermediate',
    genre: 'pop',
    coverUrl: 'https://images.pexels.com/photos/2113566/pexels-photo-2113566.jpeg?auto=compress&cs=tinysrgb&w=600',
    audioUrl: 'mock-audio-url-3',
    popularity: 88,
    lyrics: [
      {
        id: 'lyric-3-1',
        text: 'Yo te miro y se me corta la respiración',
        startTime: 0,
        endTime: 5,
        translation: 'I look at you and my breath gets cut short',
        vocabulary: [
          {
            id: 'vocab-3-1',
            original: 'miro',
            translation: 'I look',
            context: 'Yo te miro y se me corta la respiración',
            language: 'spanish',
          },
          {
            id: 'vocab-3-2',
            original: 'respiración',
            translation: 'breathing',
            context: 'Yo te miro y se me corta la respiración',
            language: 'spanish',
          },
        ],
      },
      {
        id: 'lyric-3-2',
        text: 'Cuando tú me miras se detiene el tiempo',
        startTime: 5,
        endTime: 10,
        translation: 'When you look at me time stops',
        vocabulary: [
          {
            id: 'vocab-3-3',
            original: 'detiene',
            translation: 'stops',
            context: 'Cuando tú me miras se detiene el tiempo',
            language: 'spanish',
          },
          {
            id: 'vocab-3-4',
            original: 'tiempo',
            translation: 'time',
            context: 'Cuando tú me miras se detiene el tiempo',
            language: 'spanish',
          },
        ],
      },
    ],
  },
  {
    id: 'song-4',
    title: 'Je Veux',
    artist: 'Zaz',
    language: 'french',
    level: 'advanced',
    genre: 'jazz',
    coverUrl: 'https://images.pexels.com/photos/4087996/pexels-photo-4087996.jpeg?auto=compress&cs=tinysrgb&w=600',
    audioUrl: 'mock-audio-url-4',
    popularity: 78,
    lyrics: [
      {
        id: 'lyric-4-1',
        text: 'Donnez-moi une suite au Ritz, je n\'en veux pas',
        startTime: 0,
        endTime: 5,
        translation: 'Give me a suite at the Ritz, I don\'t want it',
        vocabulary: [
          {
            id: 'vocab-4-1',
            original: 'donnez-moi',
            translation: 'give me',
            context: 'Donnez-moi une suite au Ritz, je n\'en veux pas',
            language: 'french',
          },
          {
            id: 'vocab-4-2',
            original: 'veux',
            translation: 'want',
            context: 'Donnez-moi une suite au Ritz, je n\'en veux pas',
            language: 'french',
          },
        ],
      },
    ],
  },
];

// Mock quizzes
export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Spanish Basics - Song Vocabulary',
    language: 'spanish',
    level: 'beginner',
    questions: [
      {
        id: 'question-1-1',
        type: 'multiple-choice',
        question: 'What does "corazón" mean?',
        options: ['Heart', 'Head', 'Hand', 'Home'],
        correctAnswer: 'Heart',
        explanation: '"Corazón" means "heart" in Spanish.',
      },
      {
        id: 'question-1-2',
        type: 'fill-in-blank',
        question: 'Complete: "Tengo que _____ contigo hoy" (I have to _____ with you today)',
        correctAnswer: 'bailar',
        explanation: '"Bailar" means "to dance" in Spanish.',
      },
    ],
  },
  {
    id: 'quiz-2',
    title: 'French Intermediate - La Vie En Rose',
    language: 'french',
    level: 'intermediate',
    questions: [
      {
        id: 'question-2-1',
        type: 'multiple-choice',
        question: 'What does "yeux" mean?',
        options: ['Eyes', 'Ears', 'Mouth', 'Nose'],
        correctAnswer: 'Eyes',
        explanation: '"Yeux" means "eyes" in French.',
      },
      {
        id: 'question-2-2',
        type: 'match',
        question: 'Match the French words with their English translations',
        options: ['rire', 'bouche', 'amour', 'jour'],
        correctAnswer: ['laugh', 'mouth', 'love', 'day'],
        explanation: 'These are common words from the song "La Vie En Rose".',
      },
    ],
  },
];

// Mock pricing plans (updated to remove premium tier)
export const mockPricingPlans = [
  {
    id: 'plan-1',
    name: 'Free',
    price: 0,
    features: [
      'Access to 10 songs',
      'Basic vocabulary tools',
      'Limited quizzes',
    ],
    popular: false,
  },
  {
    id: 'plan-2',
    name: 'Pro',
    price: 9.99,
    features: [
      'Unlimited song access',
      'Advanced vocabulary tools',
      'Unlimited quizzes',
      'Pronunciation feedback',
      'Progress tracking',
      'Personalized learning path',
      'Priority support',
    ],
    popular: true,
  },
];

// Features for the landing page
export const landingFeatures = [
  {
    id: 'feature-1',
    title: 'Learn with Real Music',
    description: 'Pick your favorite songs to learn new words and phrases in context.',
    icon: 'Music'
  },
  {
    id: 'feature-2',
    title: 'Smart AI Translation',
    description: 'Get accurate translations and grammar insights powered by AI.',
    icon: 'Brain'
  },
  {
    id: 'feature-3',
    title: 'Personalized Vocabulary',
    description: 'Build and practice your personal vocabulary list from songs you love.',
    icon: 'BookMarked'
  },
  {
    id: 'feature-4',
    title: 'Interactive Quizzes',
    description: 'Reinforce your learning with smart quizzes based on your progress.',
    icon: 'ListChecks'
  }
];

// Learning steps for the landing page
export const learningSteps = [
  {
    id: 'step-1',
    title: 'Choose Your Songs',
    description: 'Browse our curated collection of songs in your target language.',
    icon: 'Music'
  },
  {
    id: 'step-2',
    title: 'Learn with AI',
    description: 'Get instant translations and explanations as you listen.',
    icon: 'Brain'
  },
  {
    id: 'step-3',
    title: 'Practice & Improve',
    description: 'Test your knowledge with personalized quizzes and exercises.',
    icon: 'GraduationCap'
  }
];