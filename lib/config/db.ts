/**
 * Supabase Configuration
 */

export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_DATABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_DATABASE_ANON_KEY || '',
    enabled: !!(process.env.NEXT_PUBLIC_DATABASE_URL && process.env.NEXT_PUBLIC_DATABASE_ANON_KEY)
  };
}

export const supabaseConfig = getSupabaseConfig();