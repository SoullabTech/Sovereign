// Server-side Supabase helper with complete isolation
// This prevents build-time errors in Vercel

export async function getSupabaseClient() {
  // Check environment variables at runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase environment variables not configured');
    return null;
  }

  try {
    // Use eval to completely bypass build-time checking
    // This is a workaround for Vercel's aggressive build optimization
    const supabaseModule = eval('require("@supabase/supabase-js")');

    if (!supabaseModule || !supabaseModule.createClient) {
      console.log('Supabase module not available');
      return null;
    }

    const client = supabaseModule.createClient(supabaseUrl, supabaseKey);
    return client;
  } catch (error) {
    console.log('Failed to load Supabase:', error);
    return null;
  }
}