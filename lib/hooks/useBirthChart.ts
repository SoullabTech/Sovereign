'use client';

/**
 * useBirthChart - Shared birth chart state hook
 *
 * One source of truth for birth data across all pages:
 * - /journey (interactive map)
 * - /astrology (cosmic blueprint)
 * - Account Settings (Birth Chart section)
 *
 * Reads from: authenticated server profile only
 * Writes: authenticated server profile only; legacy browser bytes are preserved but never auto-used
 * Broadcasts: 'birthchart:updated' event for cross-tab sync
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { normalizeBirthCoordinates } from '@/lib/astrology/birthCoordinates';

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
    // A present canonical lng wins even when it is zero or invalid. The legacy
    // lon alias is used only when the canonical property is absent.
    const coordinates = normalizeBirthCoordinates(
      data.location.lat,
      Object.prototype.hasOwnProperty.call(data.location, 'lng')
        ? data.location.lng
        : data.location.lon,
    );
    if (coordinates) {
      location = {
        name: data.location.name || data.location.display_name || '',
        lat: coordinates.lat,
        lng: coordinates.lng,
        timezone: data.location.timezone || 'UTC',
      };
    }
  } else {
    const coordinates = normalizeBirthCoordinates(data.lat, data.lng);
    if (coordinates) {
      location = {
        name: data.place || data.locationName || '',
        lat: coordinates.lat,
        lng: coordinates.lng,
        timezone: data.tz || data.timezone || 'UTC',
      };
    }
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
    typeof data.location?.lat === 'number' &&
    typeof data.location?.lng === 'number' &&
    normalizeBirthCoordinates(data.location.lat, data.location.lng)
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
    console.warn('[useBirthChart] PROFILE_SAVE_TRANSPORT_FAILED');
    return false;
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
  const loadEpoch = useRef(0);
  const load = useCallback(async () => {
    const epoch = ++loadEpoch.current;
    // Immediately mask the previous account's chart while authority is checked.
    setBirthData(null);
    setIsLoading(true);
    setError(null);
    setMigrationUnresolved(false);
    try {
      const res = await apiFetch('/api/members/profile');
      if (epoch !== loadEpoch.current) return;
      if (!res.ok) {
        // Missing, expired, denied, or unreachable authorization never falls
        // back to a browser-owned birth record.
        setBirthData(null);
        setIsLoading(false);
        return;
      }
      const profile = await res.json();
      if (epoch !== loadEpoch.current) return;
      if (typeof profile?.id !== 'string' || !profile.id) {
        setBirthData(null);
        setError('Your saved birth details could not be verified.');
        setIsLoading(false);
        return;
      }
      const serverBirth = normalizeBirthData(profile.birthData);
      setBirthData(serverBirth && isBirthDataComplete(serverBirth) ? serverBirth : null);
      setIsLoading(false);
    } catch {
      if (epoch !== loadEpoch.current) return;
      setBirthData(null);
      setError('Your saved birth details could not be verified. Please reconnect and try again.');
      setIsLoading(false);
    }
  }, []);

  /** Save birth data to the authenticated member profile only. */
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
      setBirthData(data);
      emitBirthChartUpdated();

      return true;
    } catch (e) {
      console.error('[useBirthChart] BIRTH_DATA_SAVE_FAILED');
      setError('Could not save your birth details. Please try again.');
      return false;
    }
  }, []);

  /** Clear birth data from the authenticated member profile only. */
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

      // Historic unbound browser copies remain untouched; their deletion/recovery
      // is governed separately and is not claimed by this profile operation.

      setBirthData(null);
      emitBirthChartUpdated();

      return true;
    } catch (e) {
      console.error('[useBirthChart] BIRTH_DATA_CLEAR_FAILED');
      setError('Could not remove your birth details. Please try again.');
      return false;
    }
  }, []);

  /** Recheck the current authenticated profile; never retry legacy cache migration. */
  const retryMigration = useCallback(async (): Promise<void> => {
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
    /** Preserved compatibility field; automatic legacy cache migration is disabled. */
    migrationUnresolved,
    retryMigration,
    reload: load,
    save,
    clear,
  };
}
