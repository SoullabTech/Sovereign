import { createClient } from '@supabase/supabase-js';

/**
 * Lazy initialization of Supabase client with fallback handling
 * Returns null if no proper configuration is available
 */
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
              'placeholder-key';
  
  // Return null if no proper configuration
  if (url === 'https://placeholder.supabase.co' || 
      url === 'your-prod-supabase/' ||
      key === 'placeholder-key') {
    return null;
  }
  
  try {
    return createClient(url, key);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
}

/**
 * Get Supabase client for browser/client-side usage
 */
export function getSupabaseClientBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  // Return null if no proper configuration
  if (url === 'https://placeholder.supabase.co' || 
      url === 'your-prod-supabase/' ||
      anonKey === 'placeholder-key') {
    return null;
  }
  
  try {
    return createClient(url, anonKey);
  } catch (error) {
    console.error('Failed to create browser Supabase client:', error);
    return null;
  }
}