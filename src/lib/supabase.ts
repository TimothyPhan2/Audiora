import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

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