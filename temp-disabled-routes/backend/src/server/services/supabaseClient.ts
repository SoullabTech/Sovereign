// oracle-backend/src/services/supabaseClient.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config";

const { url, anonKey, serviceRoleKey } = config.supabase;

if (!url || !anonKey) {
  throw new Error(
    "❌ Missing Supabase configuration in environment variables.",
  );
}

// Public client (used by frontend-safe operations)
export const supabase: SupabaseClient = createClient(url, anonKey);

// Admin client (used for backend server-side operations)
export const supabaseAdmin: SupabaseClient | null = serviceRoleKey
  ? createClient(url, serviceRoleKey)
  : null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    console.warn(
      "⚠️ Falling back to public Supabase client. Admin operations may be restricted.",
    );
    return supabase;
  }
  return supabaseAdmin;
}
