/**
 * Inner Lands Trace System
 *
 * Stores minimal contact data for the Mark visualization.
 * Sovereign: lives in localStorage, same shape can persist to Postgres later.
 *
 * Design principle: "Was there contact?" — not how much, not how well.
 */

// Key types for different kinds of contact
export type InnerLandsTraceKey =
  | `land:${string}`                 // landId
  | `encounter:${string}:${string}`  // landId:encounterId
  | `maia:${string}:${string}`;      // landId:encounterId (MAIA contact from that place)

export type InnerLandsContactType = 'enter' | 'open' | 'maia';

export interface InnerLandsTraceEntry {
  firstContactAt: string;           // ISO timestamp
  lastContactAt: string;            // ISO timestamp
  contactTypes?: Partial<Record<InnerLandsContactType, true>>; // optional, tiny
  // reserved for future:
  // meta?: { version?: number; source?: 'local' | 'db' }
}

export interface InnerLandsTraceStore {
  version: 1;
  entries: Record<InnerLandsTraceKey, InnerLandsTraceEntry>;
}

// Storage key for localStorage
export const TRACE_STORAGE_KEY = 'innerLandsTrace.v1';

/**
 * Get the current trace store from localStorage
 */
export function getTraceStore(): InnerLandsTraceStore {
  if (typeof window === 'undefined') {
    return { version: 1, entries: {} };
  }

  try {
    const stored = localStorage.getItem(TRACE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version === 1) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[InnerLandsTrace] Failed to parse stored trace:', e);
  }

  return { version: 1, entries: {} };
}

/**
 * Save the trace store to localStorage
 */
export function saveTraceStore(store: InnerLandsTraceStore): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(TRACE_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('[InnerLandsTrace] Failed to save trace:', e);
  }
}

/**
 * Mark a trace entry (creates or updates)
 * Returns the updated store for chaining
 */
export function markTrace(
  store: InnerLandsTraceStore,
  key: InnerLandsTraceKey,
  contactType?: InnerLandsContactType
): InnerLandsTraceStore {
  const now = new Date().toISOString();
  const prev = store.entries[key];

  store.entries[key] = prev
    ? {
        ...prev,
        lastContactAt: now,
        contactTypes: contactType
          ? { ...(prev.contactTypes || {}), [contactType]: true }
          : prev.contactTypes,
      }
    : {
        firstContactAt: now,
        lastContactAt: now,
        contactTypes: contactType ? { [contactType]: true } : undefined,
      };

  return store;
}

/**
 * Check if a key has been touched (The Mark should appear)
 */
export function hasTrace(store: InnerLandsTraceStore, key: InnerLandsTraceKey): boolean {
  return Boolean(store.entries[key]);
}

/**
 * Check if MAIA has been contacted from a specific place
 */
export function hasMaiaContact(
  store: InnerLandsTraceStore,
  landId: string,
  encounterId: string
): boolean {
  const key: InnerLandsTraceKey = `maia:${landId}:${encounterId}`;
  return hasTrace(store, key);
}

/**
 * Helper: record entering a land
 */
export function recordLandEntry(landId: string): void {
  const store = getTraceStore();
  const key: InnerLandsTraceKey = `land:${landId}`;
  markTrace(store, key, 'enter');
  saveTraceStore(store);
}

/**
 * Helper: record opening an encounter
 */
export function recordEncounterOpen(landId: string, encounterId: string): void {
  const store = getTraceStore();
  const key: InnerLandsTraceKey = `encounter:${landId}:${encounterId}`;
  markTrace(store, key, 'open');
  saveTraceStore(store);
}

/**
 * Helper: record talking to MAIA from a place
 */
export function recordMaiaContact(landId: string, encounterId: string): void {
  const store = getTraceStore();
  const key: InnerLandsTraceKey = `maia:${landId}:${encounterId}`;
  markTrace(store, key, 'maia');
  saveTraceStore(store);
}

/**
 * Convert a title to a slug for encounter IDs
 * "The Mirror" → "the-mirror"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
