'use client';

// Sovereignty mode: Supabase removed
// This hook now provides a null user until local auth is wired

export type SovereignUser = {
  id?: string | null;
  email?: string | null;
} | null;

export type UseUserAuthResult = {
  user: SovereignUser;
  loading: boolean;
  error: Error | null;
  signIn?: () => Promise<void>;
  signOut?: () => Promise<void>;
};

export function useUserAuth(): UseUserAuthResult {
  return {
    user: null,
    loading: false,
    error: null,
    signIn: async () => {
      throw new Error('Auth disabled in Sovereign mode (Supabase removed).');
    },
    signOut: async () => {
      // no-op
    },
  };
}

export default useUserAuth;
