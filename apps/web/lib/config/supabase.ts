// Centralized Supabase configuration with safe fallbacks
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  isDemoMode: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const isConfigured = !!(
    url &&
    anonKey &&
    url !== "your_supabase_url_here" &&
    anonKey !== "your_supabase_anon_key_here" &&
    url.startsWith("https://") &&
    anonKey.length > 20
  );

  return {
    url: isConfigured ? url : "https://demo.supabase.co", // Safe fallback
    anonKey: isConfigured ? anonKey : "demo-key", // Safe fallback
    isConfigured,
    isDemoMode: !isConfigured,
  };
}

export function requireSupabaseConfig(): SupabaseConfig {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    throw new Error(
      "Supabase configuration not available. Running in demo mode.",
    );
  }

  return config;
}
