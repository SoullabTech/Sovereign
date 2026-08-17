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
import { apiFetch } from '@/lib/http/apiBase';

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

// Legacy-migration retry guard. Keyed by authenticated member ID and held in
// sessionStorage on purpose: one automatic attempt per member per app/session
// lifecycle. A permanent flag would let a temporary outage strand the data
// forever; no guard at all would turn a persistent server rejection into a
// repeated write loop on every load.
const MIGRATION_GUARD_PREFIX = 'birthdata_migration_attempted:';

// In-memory fallback. Without this, a sessionStorage that throws (private mode,
// storage disabled) loses the guard entirely — and load() is re-entered by both
// the birthchart:updated and storage listeners, so a single page lifetime could
// fire repeated promotion PUTs. Module-scoped so it survives remounts.
//
//   sessionStorage available   → one attempt / member / app session
//   sessionStorage unavailable → one attempt / member / page lifecycle
const inMemoryMigrationGuard = new Set<string>();

function migrationAttemptedThisSession(memberId: string): boolean {
  if (inMemoryMigrationGuard.has(memberId)) return true;
  try {
    return sessionStorage.getItem(`${MIGRATION_GUARD_PREFIX}${memberId}`) === '1';
  } catch {
    return false; // in-memory guard was already consulted above
  }
}

function markMigrationAttempted(memberId: string): void {
  inMemoryMigrationGuard.add(memberId);
  try {
    sessionStorage.setItem(`${MIGRATION_GUARD_PREFIX}${memberId}`, '1');
  } catch {
    /* in-memory guard still bounds the page lifecycle */
  }
}

function clearMigrationGuard(memberId: string): void {
  inMemoryMigrationGuard.delete(memberId);
  try {
    sessionStorage.removeItem(`${MIGRATION_GUARD_PREFIX}${memberId}`);
  } catch {
    /* no-op */
  }
}

/**
 * Write birth data to the authenticated member profile.
 *
 * The server resolves identity from the verified session credential, so no
 * client-supplied id is sent — not as a query param, not in the body.
 *
 * Returns true ONLY on a 2xx. A non-2xx or a transport failure means
 * persistence was NOT established, and the caller must not claim a save.
 */
async function putBirthData(birthData: BirthData | null): Promise<boolean> {
  try {
    const res = await apiFetch('/api/members/profile', {
      method: 'PUT',
      body: JSON.stringify({
        birthData: birthData
          ? { date: birthData.date, time: birthData.time, location: birthData.location }
          : null,
      }),
    });
    if (!res.ok) {
      console.warn('[useBirthChart] Profile PUT rejected:', res.status);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[useBirthChart] Profile PUT transport failure:', e);
    return false;
  }
}

/**
 * Mirror server-established birth data into localStorage.
 *
 * This is a CACHE for instant reads only. It is written after the server has
 * accepted the value — never as a substitute for persistence.
 */
function mirrorToCache(data: BirthData): void {
  localStorage.setItem(LS_KEY_CHART, JSON.stringify(data));
  const betaUser = safeJsonParse<any>(localStorage.getItem(LS_KEY_BETA_USER));
  if (betaUser) {
    betaUser.birthData = data;
    localStorage.setItem(LS_KEY_BETA_USER, JSON.stringify(betaUser));
  }
}

/**
 * Internal seam for tests only.
 *
 * The save/clear contract and the migration guard are the load-bearing rules in
 * this module, and they live in module-scoped helpers. The repo's jest setup
 * runs ts-jest in a node environment with no React testing harness, so the
 * helpers are exposed here rather than exercised through a rendered hook.
 * Not part of the module's supported API — do not import from application code.
 */
export const __internal = {
  putBirthData,
  migrationAttemptedThisSession,
  markMigrationAttempted,
  clearMigrationGuard,
  normalizeBirthData,
};

export function useBirthChart() {
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // True when this member has ownership-bound local birth data that the server
  // has not accepted. The data is retained and shown, but it is NOT account
  // persistence — surfaces must not claim it is saved to the account.
  const [migrationUnresolved, setMigrationUnresolved] = useState(false);

  /**
   * Load birth data from all sources in priority order
   */
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMigrationUnresolved(false);

    try {
      const betaUser = safeJsonParse<any>(localStorage.getItem(LS_KEY_BETA_USER));

      // 1) The authenticated member profile is canonical. Identity comes from
      //    the verified session credential (cookie, or x-session-token on
      //    Safari/iOS) — the server decides who you are, so no id is sent.
      let authenticatedMemberId: string | null = null;
      let profileResolved = false;

      try {
        const res = await apiFetch('/api/members/profile');
        if (res.ok) {
          const profile = await res.json();
          profileResolved = true;
          authenticatedMemberId = profile?.id ?? null;

          const serverBirth = normalizeBirthData(profile.birthData);
          if (serverBirth && isBirthDataComplete(serverBirth)) {
            setBirthData(serverBirth);
            mirrorToCache(serverBirth);
            setIsLoading(false);
            return;
          }
        } else if (res.status === 401) {
          console.log('[useBirthChart] No session — local cache only');
        }
      } catch (e) {
        console.warn('[useBirthChart] Profile unreachable, falling back to cache:', e);
      }

      // 2) Legacy reconciliation. Some members entered birth data before server
      //    persistence worked, so it lives only in THIS browser. Migrate it —
      //    but ONLY when ownership is provably bound to the member the server
      //    just authenticated. beta_user carries the member id; the bare
      //    birthChartData key does not, so it can never prove ownership and is
      //    never a migration source.
      if (profileResolved && authenticatedMemberId) {
        const ownedLocal =
          betaUser && betaUser.id === authenticatedMemberId
            ? normalizeBirthData(betaUser.birthData)
            : null;

        if (ownedLocal && isBirthDataComplete(ownedLocal)) {
          // One automatic attempt per member per session; an explicit
          // retryMigration() clears the guard.
          if (migrationAttemptedThisSession(authenticatedMemberId)) {
            setBirthData(ownedLocal);
            setMigrationUnresolved(true);
            setIsLoading(false);
            return;
          }

          markMigrationAttempted(authenticatedMemberId);

          if (await putBirthData(ownedLocal)) {
            console.log('[useBirthChart] Migrated legacy local birth data to member profile');
            clearMigrationGuard(authenticatedMemberId);
            setBirthData(ownedLocal);
            mirrorToCache(ownedLocal);
            setIsLoading(false);
            return;
          }

          // Retain the owned local data — it is provably this member's — but
          // do not treat it as account persistence.
          console.warn('[useBirthChart] Legacy migration unresolved for this session');
          setBirthData(ownedLocal);
          setMigrationUnresolved(true);
          setIsLoading(false);
          return;
        }

        // Authenticated, the profile holds no birth data, and nothing local can
        // be proven to belong to this member. Report absent rather than render
        // a cache that may belong to a previously signed-in member.
        setBirthData(null);
        setIsLoading(false);
        return;
      }

      // 3) Unauthenticated or offline: cache-only read, unchanged behavior.
      const localChart = normalizeBirthData(
        safeJsonParse<any>(localStorage.getItem(LS_KEY_CHART))
      );
      if (localChart && isBirthDataComplete(localChart)) {
        setBirthData(localChart);
        setIsLoading(false);
        return;
      }

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
    try {
      // The member profile is the system of record. Persistence is ESTABLISHED
      // by a 2xx and by nothing else — previously this wrote localStorage and
      // returned true even when the server write failed, so the UI reported a
      // save that had not happened.
      //
      // Note the route implements GET/PUT only; the prior PATCH was silently
      // unhandled, which is why birth data never reached the database at all.
      if (!(await putBirthData(data))) {
        setError('Could not save your birth details. Please try again.');
        return false;
      }

      // Persistence established — the cache may now mirror it.
      mirrorToCache(data);
      setBirthData(data);
      emitBirthChartUpdated();

      return true;
    } catch (e) {
      console.error('[useBirthChart] Save error:', e);
      setError('Could not save your birth details. Please try again.');
      return false;
    }
  }, []);

  /**
   * Clear birth data from all storage locations
   */
  const clear = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      // Same contract as save: the server is the system of record. If the
      // erasure did not land, do not clear the cache and do not report success
      // — otherwise the data reappears on the next cross-device load.
      if (!(await putBirthData(null))) {
        setError('Could not remove your birth details. Please try again.');
        return false;
      }

      localStorage.removeItem(LS_KEY_CHART);
      const betaUser = safeJsonParse<any>(localStorage.getItem(LS_KEY_BETA_USER));
      if (betaUser) {
        delete betaUser.birthData;
        localStorage.setItem(LS_KEY_BETA_USER, JSON.stringify(betaUser));
      }

      setBirthData(null);
      emitBirthChartUpdated();

      return true;
    } catch (e) {
      console.error('[useBirthChart] Clear error:', e);
      setError('Could not remove your birth details. Please try again.');
      return false;
    }
  }, []);

  /**
   * Explicit member-initiated retry of an unresolved legacy migration.
   *
   * Clears this session's guard and re-runs resolution. Consumers read
   * `migrationUnresolved` afterwards for the outcome — it is not returned here,
   * because React state is not settled by the time this resolves.
   */
  const retryMigration = useCallback(async (): Promise<void> => {
    const betaUser = safeJsonParse<any>(localStorage.getItem(LS_KEY_BETA_USER));
    if (betaUser?.id) clearMigrationGuard(betaUser.id);
    await load();
  }, [load]);

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
    /** Owned local data exists but the server has not accepted it — shown, not saved. */
    migrationUnresolved,
    retryMigration,
    reload: load,
    save,
    clear,
  };
}
