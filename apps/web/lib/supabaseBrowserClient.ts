// STUB: Browser client disabled for build stability
// This is a placeholder to prevent import errors while transitioning to API-only approach

export function getBrowserSupabaseClient() {
  throw new Error('Browser Supabase client is disabled. Use API routes instead.');
}

// Legacy alias for components that import createClient from this file
export const createClient = getBrowserSupabaseClient;
