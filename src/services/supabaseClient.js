/**
 * Supabase Client Initialization
 * Connects to PostgreSQL and GoTrue Auth using safe public client credentials.
 * NEVER expose the service_role key here.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === 'string' &&
    typeof supabaseAnonKey === 'string' &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder.supabase.co') &&
    supabaseAnonKey !== 'placeholder-anon-key' &&
    supabaseAnonKey.length > 20
  );
};

// Safe client instantiation
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
