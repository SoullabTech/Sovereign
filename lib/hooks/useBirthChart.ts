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
 * Broadcasts: 'birthchart:updated' event for cross-tab sync
 *
 * Persistence contract: birth data belongs to the authenticated member account,
 * not to whichever browser happened to collect it first. localStorage is a cache
 * for fast reads and for keeping the current session working; the server profile
 * is canonical. save() therefore returns true ONLY when the server write
 * succeeded — a local-only write reports failure and sets `error`, because on
 * iOS a local-only copy is deleted by ITP and the member loses the data.
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

/**
 * Members whose legacy-local promotion has already been attempted in this page
 * session. Without this, a server that keeps rejecting the write would be
 * re-attempted on every load() — and load() runs on mount, on the
 * 'birthchart:updated' event, and on cross-tab storage events.
 */
const legacyPromotionAttempted = new Set<string>();

type ServerWriteOutcome =
  | { ok: true }
  | { ok: false; reason: 'no_session' | 'rejected' | 'unreachable'; message: string };

/**
 * Write birth data to the member's account. This — not localStorage — is what
 * makes birth data durable and account-owned. The route derives identity from
 * the verified session, so no id is sent.
 *
 * Must be PUT: /api/members/profile exports only GET and PUT. A PATCH here
 * returned 405 and, because a 405 is a Response rather than a throw, the old
 * catch never fired — birth data silently never reached the server, localStorage
 * looked authoritative, and when iOS Safari/Brave evicted script-writable
 * storage (ITP caps it at 7 days for sites not installed to the home screen)
 * the member's birth data vanished.
 */
export async function putBirthDataToServer(data: BirthData): Promise<ServerWriteOutcome> {
  try {
    const res = await apiFetch('/api/members/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthData: {
          date: data.date,
          time: data.time,
          location: data.location,
        },
      }),
    });

    if (res.ok) return { ok: true };

    if (res.status === 401) {
      return {
        ok: false,
        reason: 'no_session',
        message:
          'Your session has expired, so your birth details were not saved to your account. Sign in again to save them.',
      };
    }

    console.warn('[useBirthChart] Server save rejected:', res.status);
    return {
      ok: false,
      reason: 'rejected',
      message: `Your birth details could not be saved to your account (server returned ${res.status}). They are held on this device only.`,
    };
  } catch (e) {
    console.warn('[useBirthChart] Server save failed:', e);
    return {
      ok: false,
      reason: 'unreachable',
      message:
        'Your birth details could not be saved to your account — the server could not be reached. They are held on this device only.',
    };
  }
}

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

/**
 * Mirror an established value into the local cache for fast reads.
 *
 * Only ever called with data whose durability is already settled — either the
 * server write just succeeded, or (on the legacy path) the data already exists
 * locally and its ownership is proven. Never call this speculatively: a cache
 * holding a value the server rejected is read by later consumers as current.
 */
function mirrorToLocalCache(data: BirthData): void {
  try {
    localStorage.setItem(LS_KEY_CHART, JSON.stringify(data));

    const betaUser = safeJsonParse<any>(localStorage.getItem(LS_KEY_BETA_USER)) ?? {};
    betaUser.birthData = {
      date: data.date,
      time: data.time,
      location: data.location,
      houseSystem: data.houseSystem,
    };
    localStorage.setItem(LS_KEY_BETA_USER, JSON.stringify(betaUser));
  } catch (e) {
    // A full or partitioned store is not fatal — the account copy has landed.
    console.warn('[useBirthChart] Local cache mirror failed:', e);
  }
}

/**
 * Legacy-local birth data that provably belongs to the authenticated member.
 *
 * Two populations exist. Members who entered birth data after the server write
 * was fixed already have it on their account, and any device loads it. Members
 * who entered it earlier have it only in this browser's localStorage, so a new
 * device (an iPhone) cannot see it and asks them to enter it again.
 *
 * Promotion is only safe when the local copy can be bound to THIS member:
 * `beta_user.birthData` is written alongside `beta_user.id`, so a matching id is
 * proof of ownership. `birthChartData` carries no member binding at all — on a
 * shared or re-signed-in browser it could belong to someone else — so it is
 * deliberately NOT promotable. If ownership cannot be proven, do not migrate.
 */
export function ownedLegacyBirthData(profileId: unknown, betaUser: any): BirthData | null {
  const serverId = typeof profileId === 'string' ? profileId : null;
  const localId = typeof betaUser?.id === 'string' ? betaUser.id : null;
  if (!serverId || !localId || serverId !== localId) return null;

  const local = normalizeBirthData(betaUser?.birthData);
  if (!local || !isBirthDataComplete(local)) return null;
  return local;
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

              // Canonical value straight from the account — safe to mirror.
              mirrorToLocalCache(serverBirth);

              setIsLoading(false);
              return;
            }

            // Server has no birth data. One-time promotion of legacy PWA-local
            // data, but only when it provably belongs to this member.
            const legacy = ownedLegacyBirthData(profile?.id, betaUser);
            if (legacy && !legacyPromotionAttempted.has(profile.id)) {
              legacyPromotionAttempted.add(profile.id);
              const outcome = await putBirthDataToServer(legacy);
              if (outcome.ok) {
                // The account is now canonical for this data.
                console.info('[useBirthChart] Promoted legacy local birth data to the member account');
                mirrorToLocalCache(legacy);
                setBirthData(legacy);
                setIsLoading(false);
                return;
              }
              // Promotion failed — fall through to the local read below. Unlike a
              // new edit, the owned local copy is preserved: it already existed,
              // its ownership is proven, and discarding it would lose the
              // member's data. It is simply not canonical yet.
              console.warn('[useBirthChart] Legacy promotion failed:', outcome.reason);
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
    setError(null);

    // The account write goes FIRST and nothing local moves until it lands.
    // Writing the cache first would leave the newest value on the device after a
    // rejected save, where a later reader picks it up as current — the same
    // masquerade this contract exists to remove, just one layer down.
    const outcome = await putBirthDataToServer(data);

    if (!outcome.ok) {
      // Nothing was mutated: the previous durable value and its cache both stand.
      // No setBirthData, no emit — a rejected save must not look like a change.
      setError(outcome.message);
      return false;
    }

    // Persistence established — now the cache and the UI may follow.
    mirrorToLocalCache(data);
    setBirthData(data);
    emitBirthChartUpdated();

    return true;
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

      // Clear server. Same PATCH → 405 defect as save(): the member was shown a
      // successful deletion while the server kept the birth data. Consent
      // boundary, so a failure here must be reported rather than swallowed.
      let serverCleared = true;
      try {
        const res = await apiFetch('/api/members/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthData: null }),
        });
        if (!res.ok) {
          console.warn('[useBirthChart] Server clear rejected:', res.status);
          serverCleared = false;
        }
      } catch (e) {
        console.warn('[useBirthChart] Server clear failed:', e);
        serverCleared = false;
      }

      // The local clear did happen, so reflect it either way — otherwise the UI
      // would still show data that localStorage no longer holds.
      setBirthData(null);
      emitBirthChartUpdated();

      if (!serverCleared) {
        setError('Birth data was removed from this device, but the server copy could not be cleared.');
        return false;
      }

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
