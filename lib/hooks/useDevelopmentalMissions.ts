'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DevelopmentalMission } from '@/lib/consciousness/developmentalMission';

interface UseDevelopmentalMissionsReturn {
  missions: DevelopmentalMission[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  acceptMission: (id: string) => void;
  releaseMission: (id: string) => void;
  completeMission: (id: string) => void;
}

export function useDevelopmentalMissions(): UseDevelopmentalMissionsReturn {
  const [missions, setMissions] = useState<DevelopmentalMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/missions/developmental');
      if (!response.ok) {
        if (response.status === 401) {
          setMissions([]);
          return;
        }
        throw new Error('Failed to fetch developmental missions');
      }

      const data = await response.json();
      setMissions(data.missions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('[DevMissions] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const patchMission = useCallback(async (id: string, action: string) => {
    try {
      const response = await fetch('/api/missions/developmental', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} mission`);
      }

      const data = await response.json();
      const updated = data.mission as DevelopmentalMission;

      // Update local state — remove released missions, update others
      if (action === 'release') {
        setMissions(prev => prev.filter(m => m.id !== id));
      } else {
        setMissions(prev => prev.map(m => m.id === id ? updated : m));
      }
    } catch (err) {
      console.error(`[DevMissions] ${action} error:`, err);
    }
  }, []);

  const acceptMission = useCallback((id: string) => patchMission(id, 'accept'), [patchMission]);
  const releaseMission = useCallback((id: string) => patchMission(id, 'release'), [patchMission]);
  const completeMission = useCallback((id: string) => patchMission(id, 'complete'), [patchMission]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return {
    missions,
    loading,
    error,
    refetch: fetchMissions,
    acceptMission,
    releaseMission,
    completeMission,
  };
}
