import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create mock Supabase client for development without env variables
const createMockSupabaseClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: { message: 'Supabase not configured' } 
    }),
    signUp: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: { message: 'Supabase not configured' } 
    }),
    signInWithOAuth: () => Promise.resolve({ 
      data: { provider: null, url: null }, 
      error: { message: 'Supabase not configured' } 
    }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        limit: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
        order: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
        maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      }),
      limit: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
      order: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      })
    }),
    update: () => ({
      eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }),
    upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  },
  rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
});

// Create the appropriate client based on configuration
const supabaseInstance = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
    })
  : createMockSupabaseClient();

export const supabase = supabaseInstance;
// Database types (generated from Supabase schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string | null;
          subscription_tier: 'free' | 'pro';
          role: 'user' | 'admin' | 'moderator';
          learning_languages: string[];
          proficiency_level: string | null;
          timezone: string;
          last_active_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          subscription_tier?: 'free' | 'pro';
          role?: 'user' | 'admin' | 'moderator';
          learning_languages?: string[];
          proficiency_level?: string | null;
          timezone?: string;
          last_active_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          subscription_tier?: 'free' | 'pro';
          role?: 'user' | 'admin' | 'moderator';
          learning_languages?: string[];
          proficiency_level?: string | null;
          timezone?: string;
          last_active_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}