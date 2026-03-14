'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { TeamContext } from '@/hooks/useStudioData';
import type { StudioMode } from '@/hooks/useStudioData';
import { apiFetch } from '@/lib/http/apiBase';

const STORAGE_KEY = 'studio_team_context';

interface StoredContext {
  teamId: string | null;
  includePersonal: boolean;
  studioMode: StudioMode;
}

interface TeamContextProviderProps {
  children: ReactNode;
  /** Initial studio mode from whoami (server-authoritative) */
  initialStudioMode?: StudioMode;
}

export function TeamContextProvider({ children, initialStudioMode }: TeamContextProviderProps) {
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [includePersonal, setIncludePersonal] = useState(true);
  const [studioMode, setStudioModeLocal] = useState<StudioMode>(initialStudioMode ?? 'practice');
  const [initialized, setInitialized] = useState(false);

  // Load team/scope from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredContext = JSON.parse(stored);
        setCurrentTeamId(parsed.teamId);
        setIncludePersonal(parsed.includePersonal ?? true);
        // studioMode comes from server (initialStudioMode), not localStorage
      }
    } catch (e) {
      // Ignore parse errors
    }
    setInitialized(true);
  }, []);

  // Sync initialStudioMode when it arrives (async from whoami)
  useEffect(() => {
    if (initialStudioMode) {
      setStudioModeLocal(initialStudioMode);
    }
  }, [initialStudioMode]);

  // Save team context to localStorage on change
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ teamId: currentTeamId, includePersonal, studioMode })
      );
    } catch (e) {
      // Ignore storage errors
    }
  }, [currentTeamId, includePersonal, studioMode, initialized]);

  // setStudioMode: update local state + fire-and-forget to server
  const setStudioMode = useCallback((mode: StudioMode) => {
    setStudioModeLocal(mode);

    // Persist to server (fire-and-forget)
    apiFetch('/api/studio/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studioMode: mode }),
    }).catch((err) => {
      console.error('[TeamContext] Failed to persist studio mode:', err);
    });
  }, []);

  return (
    <TeamContext.Provider
      value={{
        currentTeamId,
        setCurrentTeamId,
        includePersonal,
        setIncludePersonal,
        studioMode,
        setStudioMode,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export default TeamContextProvider;
