// Frontend Supabase Client
// This file is for frontend/client-side use only
// Uses the anon key which is safe to expose in browser

import { createClient } from '@supabase/supabase-js';

// Frontend-safe environment variables
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check for mock mode first
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_SUPABASE === "true";

// Create client based on mode
export const supabase = (() => {
  if (MOCK_MODE) {
    console.log("⚡ [SUPABASE] Frontend in MOCK mode (no DB operations)");
    return null; // Frontend components should handle null gracefully
  }

  // 🚫 Security: Refuse service role key in frontend
  if (!url) {
    throw new Error("[SUPABASE] Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
    throw new Error("[SUPABASE] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  // Check if someone accidentally used a service role key
  if (anonKey.startsWith("sb_secret") || anonKey.includes("service_role")) {
    throw new Error(
      "[SUPABASE] ❌ SECURITY ERROR: Service role key detected in frontend! " +
      "Frontend must use NEXT_PUBLIC_SUPABASE_ANON_KEY only."
    );
  }

  // Check for the eyJ pattern (JWT format) to ensure it's a proper anon key
  if (!anonKey.startsWith("eyJ")) {
    console.warn(
      "[SUPABASE] Warning: Key format unexpected. Ensure using anon key."
    );
  }

  // ✅ Safe browser-only client with anon key
  console.log("[SUPABASE] Frontend client initialized with anon key");
  
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
})();

// Export helper to check if Supabase is available
export const isSupabaseConfigured = supabase !== null;