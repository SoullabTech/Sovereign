// Supabase client for both server and client use
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
}

// Pre-configured singleton instance
export const supabase = createSupabaseClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Factory function that returns the configured Supabase client
 * This ensures all API routes use the same configuration
 */
export function createClient() {
  return supabase;
}

// Helper function for components that need createClientComponentClient
export function createClientComponentClient() {
  return supabase;
}