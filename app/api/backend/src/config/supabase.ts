const dbUrl = process.env.NEXT_PUBLIC_DATABASE_URL || '';
const dbKey = process.env.NEXT_PUBLIC_DATABASE_ANON_KEY || '';

export const supabase = createClient(dbUrl, dbKey);

export default supabase;