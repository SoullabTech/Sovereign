'use client';

import { useState, useEffect, useCallback } from 'react';

export interface EmergenceEvent {
  event_type: string;
  event_data: Record<string, any>;
  context?: Record<string, any>;
  user_id?: string;
}

export interface EmergenceResponse {
  emergence_detected: boolean;
  event_logged: boolean;
  emergence_type?: string;
  novelty_score?: number;
  adjacent_possible_delta?: number;
  evidence?: Record<string, any>;
}

export interface EmergenceDashboard {
  total_events: number;
  ontological_count: number;
  emergence_by_type: Record<string, number>;
  velocity: number;
  velocity_window: number;
  recent_niches: string[];
  autocatalytic_sets: number;
}

export function useEmergenceTracking(userId?: string) {
  const [enabled, setEnabled] = useState(false);
  const [dashboard, setDashboard] = useState<EmergenceDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if emergence tracking is enabled
    const isEnabled = process.env.NEXT_PUBLIC_EMERGENCE_ENABLED === 'true';
    setEnabled(isEnabled);

    // Fetch dashboard if enabled
    if (isEnabled) {
      fetchDashboard();
      const interval = setInterval(fetchDashboard, 30000); // Every 30s
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL('/api/emergence/dashboard', window.location.origin);
      if (userId) {
        url.searchParams.set('user_id', userId);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
      }

      const data = await response.json();
      setDashboard(data);

    } catch (err) {
      console.error('Failed to fetch emergence dashboard:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const logEvent = useCallback(async (event: EmergenceEvent): Promise<EmergenceResponse | null> => {
    if (!enabled) {
      console.debug('Emergence tracking disabled');
      return null;
    }

    try {
      const response = await fetch('/api/emergence/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          user_id: userId || event.user_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log emergence event');
      }

      const data = await response.json();

      // Refresh dashboard if emergence detected
      if (data.emergence_detected) {
        console.log('✨ Emergence detected:', data.emergence_type);
        fetchDashboard();
      }

      return data;

    } catch (err) {
      console.error('Emergence event logging failed:', err);
      return null;
    }
  }, [enabled, userId, fetchDashboard]);

  return {
    enabled,
    dashboard,
    loading,
    error,
    logEvent,
    refreshDashboard: fetchDashboard,
  };
}
