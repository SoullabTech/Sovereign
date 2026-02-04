'use client';

/**
 * useBirthChart - Shared birth chart state hook
 *
 * One source of truth for birth data across all pages:
 * - /journey (interactive map)
 * - /astrology (cosmic blueprint)
 * - Account Settings (Birth Chart section)
 *
 * Reads from: server profile → localStorage.birthChartData → localStorage.beta_user.birthData
 * Writes to: all three locations simultaneously
 * Broadcasts: 'birthchart:updated' event for cross-tab sync
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, apiUrl } from '@/lib/http/apiBase';

export interface BirthLocation {
  name: string;
  lat: number;
  lng: number;
  timezone: string;
}

export interface BirthData {
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  location: BirthLocation;
  houseSystem?: string;   // porphyry, placidus, etc.
}

const LS_KEY_CHART = 'birthChartData';
const LS_KEY_BETA_USER = 'beta_user';
const BIRTH_CHART_EVENT = 'birthchart:updated';

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Emit an event to notify other tabs/components that birth chart data has changed
 */
export function emitBirthChartUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(BIRTH_CHART_EVENT));
  }
}

/**
 * Normalize birth data from various sources into consistent format
 */
function normalizeBirthData(data: any): BirthData | null {
  if (!data) return null;

  // Handle various field names from different sources
  const date = data.date;
  const time = data.time?.substring?.(0, 5) || data.time || '12:00';

  // Handle location - could be nested or flat
  let location: BirthLocation | null = null;
  if (data.location && typeof data.location === 'object') {
    location = {
      name: data.location.name || data.location.display_name || '',
      lat: parseFloat(data.location.lat) || 0,
      lng: parseFloat(data.location.lng || data.location.lon) || 0,
      timezone: data.location.timezone || 'UTC',
    };
  } else if (data.lat && data.lng) {
    location = {
      name: data.place || data.locationName || '',
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
      timezone: data.tz || data.timezone || 'UTC',
    };
  }

  if (!date || !location) return null;

  return {
    date,
    time,
    location,
    houseSystem: data.houseSystem || 'porphyry',
  };
}

/**
 * Check if birth data is complete and valid
 */
export function isBirthDataComplete(data: BirthData | null): boolean {
  if (!data) return false;
  return !!(
    data.date &&
    data.time &&
    data.location?.name &&
    data.location?.lat &&
    data.location?.lng
  );
}

export function useBirthChart() {
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load birth data from all sources in priority order
   */
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1) Try server profile first (cross-device truth)
      const betaUser = safeJsonParse<any>(localStorage.getItem(LS_KEY_BETA_USER));
      const memberId = betaUser?.id || betaUser?.passkey;

      if (memberId) {
        try {
          const res = await apiFetch(
            `/api/members/profile?id=${encodeURIComponent(memberId)}`
          );
          if (res.ok) {
            const profile = await res.json();
            const serverBirth = normalizeBirthData(profile.birthData);

            if (serverBirth && isBirthDataComplete(serverBirth)) {
              setBirthData(serverBirth);

              // Mirror to localStorage for instant reads
              localStorage.setItem(LS_KEY_CHART, JSON.stringify(serverBirth));
              if (betaUser) {
                betaUser.birthData = serverBirth;
                localStorage.setItem(LS_KEY_BETA_USER, JSON.stringify(betaUser));
              }

              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('[useBirthChart] Server fetch failed, falling back to local:', e);
        }
      }

      // 2) Try localStorage.birthChartData
      const localChart = normalizeBirthData(
        safeJsonParse<any>(localStorage.getItem(LS_KEY_CHART))
      );
      if (localChart && isBirthDataComplete(localChart)) {
        setBirthData(localChart);
        setIsLoading(false);
        return;
      }

      // 3) Try localStorage.beta_user.birthData
      const betaBirth = normalizeBirthData(betaUser?.birthData);
      if (betaBirth && isBirthDataComplete(betaBirth)) {
        setBirthData(betaBirth);
        setIsLoading(false);
        return;
      }

      // No valid birth data found
      setBirthData(null);
      setIsLoading(false);
    } catch (e) {
      console.error('[useBirthChart] Load error:', e);
      setError('Failed to load birth data');
      setIsLoading(false);
    }
  }, []);

  /**
   * Save birth data to all storage locations
   */
  const save = useCallback(async (data: BirthData): Promise<boolean> => {
    try {
      // 1) Save to localStorage.birthChartData
      localStorage.setItem(LS_KEY_CHART, JSON.stringify(data));

      // 2) Save to localStorage.beta_user.birthData
      const betaUser = safeJsonParse<any>(localStorage.getItem(LS_KEY_BETA_USER)) ?? {};
      betaUser.birthData = {
        date: data.date,
        time: data.time,
        location: data.location,
        houseSystem: data.houseSystem,
      };
      localStorage.setItem(LS_KEY_BETA_USER, JSON.stringify(betaUser));

      // 3) Save to server profile
      const memberId = betaUser.id || betaUser.passkey;
      if (memberId) {
        try {
          await apiFetch('/api/members/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: memberId,
              birthData: {
                date: data.date,
                time: data.time,
                location: data.location,
              },
            }),
          });
        } catch (e) {
          console.warn('[useBirthChart] Server save failed:', e);
          // Don't fail the whole save if server is unavailable
        }
      }

      // Update local state
      setBirthData(data);

      // Broadcast update to other components/tabs
      emitBirthChartUpdated();

      return true;
    } catch (e) {
      console.error('[useBirthChart] Save error:', e);
      setError('Failed to save birth data');
      return false;
    }
  }, []);

  /**
   * Clear birth data from all storage locations
   */
  const clear = useCallback(async (): Promise<boolean> => {
    try {
      // Clear localStorage
      localStorage.removeItem(LS_KEY_CHART);

      const betaUser = safeJsonParse<any>(localStorage.getItem(LS_KEY_BETA_USER));
      if (betaUser) {
        delete betaUser.birthData;
        localStorage.setItem(LS_KEY_BETA_USER, JSON.stringify(betaUser));
      }

      // Clear server
      const memberId = betaUser?.id || betaUser?.passkey;
      if (memberId) {
        try {
          await apiFetch('/api/members/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: memberId,
              birthData: null,
            }),
          });
        } catch (e) {
          console.warn('[useBirthChart] Server clear failed:', e);
        }
      }

      setBirthData(null);
      emitBirthChartUpdated();

      return true;
    } catch (e) {
      console.error('[useBirthChart] Clear error:', e);
      return false;
    }
  }, []);

  // Load on mount
  useEffect(() => {
    load();
  }, [load]);

  // Listen for updates from other components/tabs
  useEffect(() => {
    const handleUpdate = () => {
      load();
    };

    window.addEventListener(BIRTH_CHART_EVENT, handleUpdate);

    // Also listen for storage events from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY_CHART || e.key === LS_KEY_BETA_USER) {
        load();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(BIRTH_CHART_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [load]);

  return {
    birthData,
    isLoading,
    error,
    isComplete: isBirthDataComplete(birthData),
    reload: load,
    save,
    clear,
  };
}
