'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
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

  const supabase = createClientComponentClient();
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Checking user auth status...');

      const explorerId = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
      const explorerName = localStorage.getItem('explorerName');
      let userName = localStorage.getItem('userName');

      // One-time migration: Map explorer codes to real names if userName is missing
      console.log('🔍 MIGRATION CHECK - userName:', userName, 'explorerName:', explorerName);
      if (!userName && explorerName) {
        const nameMapping: Record<string, string> = {
          'MAIA-ARCHITECT': 'Kelly',
          'MAIA-APPRENTICE': 'Alex',
          'MAIA-ALCHEMIST': 'Jordan',
        };

        if (nameMapping[explorerName]) {
          userName = nameMapping[explorerName];
          localStorage.setItem('userName', userName);
          console.log('🔧 Migrated user name for', explorerName, 'to', userName);
        }
      }

      const localOnboarded = localStorage.getItem('betaOnboardingComplete') === 'true';

      console.log('📦 localStorage check:', {
        explorerId: explorerId?.substring(0, 8) + '...',
        explorerName,
        localOnboarded
      });

      if (!explorerId || !explorerName) {
        console.log('❌ No credentials in localStorage');
        setIsOnboarded(false);
        setIsLoading(false);
        return { authenticated: false, onboarded: false };
      }

      try {
        console.log('🔍 Querying Supabase for user data...');

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, sacred_name, name, email, beta_onboarded_at, last_login')
          .eq('id', explorerId)
          .single();

        if (userError) {
          console.log('⚠️ User not found in Supabase, using localStorage fallback');
          setUser({
            id: explorerId,
            sacredName: explorerName,
            name: userName || explorerName,
          });
          setIsOnboarded(localOnboarded);
          setIsLoading(false);
          return { authenticated: true, onboarded: localOnboarded };
        }

        console.log('✅ User data loaded from Supabase:', {
          id: userData.id.substring(0, 8) + '...',
          name: userData.sacred_name,
          onboarded: !!userData.beta_onboarded_at
        });

        setUser({
          id: userData.id,
          sacredName: userData.sacred_name,
          name: userData.name || userName || userData.sacred_name,
          email: userData.email,
          betaOnboardedAt: userData.beta_onboarded_at,
          lastLogin: userData.last_login,
        });
        console.log('🔍 SUPABASE USER SET - name:', userData.name || userName || userData.sacred_name, 'sacredName:', userData.sacred_name);

        const dbOnboarded = !!userData.beta_onboarded_at;
        setIsOnboarded(dbOnboarded);

        if (dbOnboarded && !localOnboarded) {
          console.log('🔄 Syncing onboarding status to localStorage');
          localStorage.setItem('betaOnboardingComplete', 'true');
        }

        const { data: agentData } = await supabase
          .from('oracle_agents')
          .select('id, name, archetype, personality_config')
          .eq('user_id', explorerId)
          .single();

        if (agentData) {
          setOracleAgent({
            id: agentData.id,
            name: agentData.name,
            archetype: agentData.archetype,
            personalityConfig: agentData.personality_config,
          });
        }

        // Load user preferences
        const { data: prefsData } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', explorerId)
          .single();

        if (prefsData) {
          setPreferences({
            tone: prefsData.tone,
            style: prefsData.style,
            theme: prefsData.theme,
            voice_enabled: prefsData.voice_enabled,
            voice_speed: prefsData.voice_speed,
            show_thinking: prefsData.show_thinking,
            auto_play_voice: prefsData.auto_play_voice,
          });
          console.log('✅ User preferences loaded:', prefsData);
        }

        setIsLoading(false);
        return { authenticated: true, onboarded: dbOnboarded };

      } catch (supabaseError) {
        console.log('Supabase check failed, using localStorage fallback');
        setUser({
          id: explorerId,
          sacredName: explorerName,
          name: userName || explorerName,
        });
        console.log('🔍 FALLBACK USER SET - name:', userName || explorerName, 'sacredName:', explorerName);
        setIsOnboarded(localOnboarded);
        setIsLoading(false);
        return { authenticated: true, onboarded: localOnboarded };
      }

    } catch (err) {
      console.error('Auth check error:', err);
      setError(err instanceof Error ? err.message : 'Authentication error');
      setIsLoading(false);
      return { authenticated: false, onboarded: false };
    }
  }, [supabase]);

  const redirectBasedOnStatus = useCallback(async () => {
    const status = await checkAuthStatus();

    if (!status.authenticated) {
      router.replace('/beta-signup');
    } else if (!status.onboarded) {
      router.replace('/beta-entry');
    } else {
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