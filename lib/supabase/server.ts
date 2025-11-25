import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/types/database'

// Mock mode toggle
const MOCK_MODE = process.env.MOCK_SUPABASE === "true";

export const createServerSupabaseClient = () => {
  // Return mock client in mock mode
  if (MOCK_MODE) {
    console.warn("[Server DB] MOCK MODE – returning stub client");
    return {
      from: (table: string) => ({
        insert: async (data: any) => ({ data: null, error: null }),
        upsert: async (data: any) => ({ data: null, error: null }),
        update: async (data: any) => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
        select: async (query?: string) => ({ data: [], error: null }),
      }),
      auth: {
        getUser: async () => ({ 
          data: { user: { id: "mock-user-123", email: "mock@test.com" } }, 
          error: null 
        }),
        getSession: async () => ({ 
          data: { session: null }, 
          error: null 
        }),
      },
      rpc: async (fn: string, params?: any) => ({ data: null, error: null }),
    } as any;
  }
  
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore
  })
}

export const getServerSession = async () => {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}

export const getServerUser = async () => {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}

// Database operations with error handling
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
) => {
  try {
    const result = await queryFn()
    if (result.error) {
      console.error('Database query error:', result.error)
      return { data: null, error: result.error }
    }
    return result
  } catch (error) {
    console.error('Unexpected query error:', error)
    return { data: null, error }
  }
}

// Alias for compatibility
export const createClient = createServerSupabaseClient

export default createServerSupabaseClient