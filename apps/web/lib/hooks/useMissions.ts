'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mission } from '@/lib/story/types';

interface UseMissionsReturn {
  missions: Mission[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createMission: (missionData: any) => Promise<Mission>;
  updateMission: (missionId: string, updates: any) => Promise<Mission>;
  deleteMission: (missionId: string) => Promise<void>;
  updateMilestone: (milestoneId: string, updates: any) => Promise<void>;
}

export function useMissions(): UseMissionsReturn {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/missions');
      if (!response.ok) {
        throw new Error('Failed to fetch missions');
      }

      const data = await response.json();
      setMissions(data.missions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching missions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMission = useCallback(async (missionData: any): Promise<Mission> => {
    const response = await fetch('/api/missions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(missionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create mission');
    }

    const result = await response.json();
    const newMission = result.mission;

    // Update local state
    setMissions(prev => [newMission, ...prev]);

    return newMission;
  }, []);

  const updateMission = useCallback(async (missionId: string, updates: any): Promise<Mission> => {
    const response = await fetch(`/api/missions/${missionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update mission');
    }

    const result = await response.json();
    const updatedMission = result.mission;

    // Update local state
    setMissions(prev => prev.map(mission =>
      mission.id === missionId ? updatedMission : mission
    ));

    return updatedMission;
  }, []);

  const deleteMission = useCallback(async (missionId: string): Promise<void> => {
    const response = await fetch(`/api/missions/${missionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete mission');
    }

    // Update local state
    setMissions(prev => prev.filter(mission => mission.id !== missionId));
  }, []);

  const updateMilestone = useCallback(async (milestoneId: string, updates: any): Promise<void> => {
    const response = await fetch(`/api/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update milestone');
    }

    // Refetch missions to get updated progress
    await fetchMissions();
  }, [fetchMissions]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return {
    missions,
    loading,
    error,
    refetch: fetchMissions,
    createMission,
    updateMission,
    deleteMission,
    updateMilestone
  };
}