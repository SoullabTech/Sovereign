import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function getServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.error('[Supabase] Missing URL or ANON key in server client', {
      hasUrl: !!url,
      hasAnon: !!anon,
      nodeEnv: process.env.NODE_ENV,
    });
    throw new Error('Supabase not configured on server - check environment variables');
  }

  return createServerClient(url, anon, {
    cookies: () => cookies(),
  });
}