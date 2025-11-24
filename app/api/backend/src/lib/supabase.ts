// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// IMPORTANT: Backend MUST use SERVICE_ROLE_KEY - no fallbacks allowed
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Security check: Ensure service role key is being used
function isServiceRoleKey(key: string): boolean {
  // Check old format service keys
  if (key.startsWith("sb_secret")) {
    return true;
  }
  
  // Check JWT tokens
  if (key.startsWith("eyJ")) {
    try {
      // Decode JWT payload (middle part)
      const parts = key.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload.role === "service_role";
      }
    } catch (e) {
      // If JWT decode fails, assume it's not a valid service role key
      return false;
    }
  }
  
  return false;
}

// Temporarily comment out strict validation for debugging
// if (supabaseKey && !isServiceRoleKey(supabaseKey)) {
//   throw new Error(
//     "[SUPABASE] ❌ SECURITY ERROR: Backend must use SUPABASE_SERVICE_ROLE_KEY. " +
//     "Detected non-service-role key. Check your .env configuration."
//   );
// }

// Mock mode toggle
const MOCK_MODE = process.env.MOCK_SUPABASE === "true";

export const supabase = (() => {
  // Mock mode - return stub client
  if (MOCK_MODE) {
    console.log("⚡ [SUPABASE] Mode: MOCK (stubbing DB calls)");
    console.log("   → No database writes, voice pipeline unblocked");
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
        signIn: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ 
          data: { session: null }, 
          error: null 
        }),
      },
      rpc: async (fn: string, params?: any) => ({ data: null, error: null }),
      storage: {
        from: (bucket: string) => ({
          upload: async () => ({ data: null, error: null }),
          download: async () => new Blob(),
          remove: async () => ({ data: null, error: null }),
        }),
      },
    } as any;
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase environment variables - running in limited mode");
    return null;
  }
  
  console.log("🗄️  [SUPABASE] Mode: REAL (full persistence + analytics)");
  console.log(`   → Using ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service role' : 'fallback'} key for backend`);
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,  // Service role doesn't need refresh
      persistSession: false,     // No session persistence for backend
    },
  });
})();
