'use client';

/**
 * useAuth Hook - STUB
 *
 * This hook previously used Supabase for authentication.
 * Now using postgres-only architecture.
 *
 * @deprecated Use a postgres-based auth hook instead
 */

import { useState, useCallback, useMemo } from 'react';

interface AuthUser {
  id: string;
  email: string;
  sacredName?: string;
  lastLogin?: string;
}

interface OracleAgent {
  id: string;
  name: string;
  archetype: string;
  personality_config: any;
  conversations_count: number;
  wisdom_level: number;
  last_conversation_at?: string;
  created_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [oracleAgent, setOracleAgent] = useState<OracleAgent | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (_email: string, _password: string) => {
    setError('Auth deprecated - use postgres auth');
    return { error: new Error('Auth deprecated') };
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setSession(null);
    setOracleAgent(null);
  }, []);

  const signUp = useCallback(async (_email: string, _password: string, _sacredName?: string) => {
    setError('Auth deprecated - use postgres auth');
    return { error: new Error('Auth deprecated') };
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  return {
    user,
    oracleAgent,
    session,
    isLoading,
    error,
    isAuthenticated,
    signIn,
    signOut,
    signUp,
    refreshSession: async () => {},
    updateProfile: async () => ({ error: null }),
  };
}

export default useAuth;
