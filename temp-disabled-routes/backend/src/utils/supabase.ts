// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using environment variables
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "", // Fetch Supabase URL from environment variables
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "", // Fetch the public API key
);
