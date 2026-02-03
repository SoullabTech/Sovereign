'use client';

import { useState, useEffect, ReactNode } from 'react';
import { TeamContext } from '@/hooks/useStudioData';

const STORAGE_KEY = 'studio_team_context';

interface StoredContext {
  teamId: string | null;
  includePersonal: boolean;
}

export function TeamContextProvider({ children }: { children: ReactNode }) {
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [includePersonal, setIncludePersonal] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredContext = JSON.parse(stored);
        setCurrentTeamId(parsed.teamId);
        setIncludePersonal(parsed.includePersonal ?? true);
      }
    } catch (e) {
      // Ignore parse errors
    }
    setInitialized(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ teamId: currentTeamId, includePersonal })
      );
    } catch (e) {
      // Ignore storage errors
    }
  }, [currentTeamId, includePersonal, initialized]);

  return (
    <TeamContext.Provider
      value={{
        currentTeamId,
        setCurrentTeamId,
        includePersonal,
        setIncludePersonal,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export default TeamContextProvider;
