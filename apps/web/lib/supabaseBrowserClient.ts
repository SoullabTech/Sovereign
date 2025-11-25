// Browser Supabase Client for client-side components
import { createClient } from '@supabase/supabase-js';

// Get client-side environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mockMode = process.env.NEXT_PUBLIC_MOCK_SUPABASE === "true";

export function getBrowserSupabaseClient() {
  if (mockMode) {
    console.log("⚡ [SUPABASE] Browser client in MOCK mode (no DB operations)");
    return null;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ [SUPABASE] Missing environment variables for browser client');
    return null;
  }

  // Create and return Supabase client for browser use
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false // Disable session persistence for now
    }
  });

  console.log('🔥 [SUPABASE] Browser client initialized');
  return client;
}

// Legacy alias for components that import createClient from this file
export { createClient };
