'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  sacredName: string;
  name?: string; // Real name
  email?: string;
  betaOnboardedAt?: string;
  lastLogin?: string;
}

interface OracleAgent {
  id: string;
  name: string;
  archetype: string;
  personalityConfig: any;
}

interface UserPreferences {
  tone: number;
  style: string;
  theme: string;
  voice_enabled: boolean;
  voice_speed: number;
  show_thinking: boolean;
  auto_play_voice: boolean;
}

export function useUserAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [oracleAgent, setOracleAgent] = useState<OracleAgent | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Checking user auth status...');

      // Check localStorage for session
      const explorerId = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
      const explorerName = localStorage.getItem('explorerName');
      const userName = localStorage.getItem('userName');
      const betaUserJson = localStorage.getItem('beta_user');
      const localOnboarded = localStorage.getItem('betaOnboardingComplete') === 'true';

      console.log('📦 localStorage check:', {
        explorerId: explorerId?.substring(0, 8) + '...',
        explorerName,
        localOnboarded,
        hasBetaUser: !!betaUserJson
      });

      // Parse beta_user if available
      let betaUser = null;
      if (betaUserJson) {
        try {
          betaUser = JSON.parse(betaUserJson);
        } catch (e) {
          console.error('Failed to parse beta_user:', e);
        }
      }

      // No credentials at all - not authenticated
      if (!explorerId && !betaUser) {
        console.log('❌ No credentials in localStorage');
        setIsOnboarded(false);
        setIsLoading(false);
        return { authenticated: false, onboarded: false };
      }

      // Use beta_user data if available (from server-side members system)
      if (betaUser) {
        setUser({
          id: betaUser.id || explorerId || '',
          sacredName: betaUser.username || explorerName || '',
          name: betaUser.name || userName || betaUser.username || '',
        });

        const onboarded = betaUser.onboarded || localOnboarded;
        setIsOnboarded(onboarded);
        setIsLoading(false);
        return { authenticated: true, onboarded };
      }

      // Fallback to explorerId/explorerName (legacy local-only users)
      if (explorerId && explorerName) {
        setUser({
          id: explorerId,
          sacredName: explorerName,
          name: userName || explorerName,
        });
        setIsOnboarded(localOnboarded);
        setIsLoading(false);
        return { authenticated: true, onboarded: localOnboarded };
      }

      setIsLoading(false);
      return { authenticated: false, onboarded: false };

    } catch (err) {
      console.error('Auth check error:', err);
      setError(err instanceof Error ? err.message : 'Authentication error');
      setIsLoading(false);
      return { authenticated: false, onboarded: false };
    }
  }, []);

  const redirectBasedOnStatus = useCallback(async () => {
    const status = await checkAuthStatus();

    if (!status.authenticated) {
      // Check if returning user (has existing account) or new user
      const existingUser = typeof window !== 'undefined'
        ? localStorage.getItem('beta_user')
        : null;

      if (existingUser) {
        // Returning user - go to sign in
        router.replace('/signin');
      } else {
        // New user - start onboarding
        router.replace('/begin');
      }
    } else if (!status.onboarded) {
      // Authenticated but hasn't completed onboarding
      router.replace('/begin');
    } else {
      // Fully authenticated and onboarded
      router.replace('/maia');
    }
  }, [checkAuthStatus, router]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    oracleAgent,
    preferences,
    isOnboarded,
    isLoading,
    error,
    checkAuthStatus,
    redirectBasedOnStatus,
  };
}
