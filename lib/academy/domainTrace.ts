/**
 * Domain Trace System
 *
 * Stores minimal contact data for the Mark visualization on Academy domains.
 * Mirrors innerLandsTrace.ts pattern - sovereign, localStorage-based.
 *
 * Design principle: "Was there contact?" - not how much, not how well.
 */

// Key types for different kinds of contact
export type DomainTraceKey =
  | `domain:${string}`                 // domainId
  | `prompt:${string}:${string}`       // domainId:promptId
  | `maia:${string}:${string}`;        // domainId:promptId (MAIA contact from that prompt)

export type DomainContactType = 'enter' | 'open' | 'maia';

export interface DomainTraceEntry {
  firstContactAt: string;           // ISO timestamp
  lastContactAt: string;            // ISO timestamp
  contactTypes?: Partial<Record<DomainContactType, true>>; // optional, tiny
}

export interface DomainTraceStore {
  version: 1;
  entries: Record<DomainTraceKey, DomainTraceEntry>;
}

// Storage key for localStorage
export const DOMAIN_TRACE_STORAGE_KEY = 'domainTrace.v1';

/**
 * Get the current trace store from localStorage
 */
export function getDomainTraceStore(): DomainTraceStore {
  if (typeof window === 'undefined') {
    return { version: 1, entries: {} };
  }

  try {
    const stored = localStorage.getItem(DOMAIN_TRACE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version === 1) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[DomainTrace] Failed to parse stored trace:', e);
  }

  return { version: 1, entries: {} };
}

/**
 * Save the trace store to localStorage
 */
export function saveDomainTraceStore(store: DomainTraceStore): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(DOMAIN_TRACE_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('[DomainTrace] Failed to save trace:', e);
  }
}

/**
 * Mark a trace entry (creates or updates)
 * Returns the updated store for chaining
 */
export function markDomainTrace(
  store: DomainTraceStore,
  key: DomainTraceKey,
  contactType?: DomainContactType
): DomainTraceStore {
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
export function hasDomainTrace(store: DomainTraceStore, key: DomainTraceKey): boolean {
  return Boolean(store.entries[key]);
}

/**
 * Check if MAIA has been contacted from a specific prompt
 */
export function hasDomainMaiaContact(
  store: DomainTraceStore,
  domainId: string,
  promptId: string
): boolean {
  const key: DomainTraceKey = `maia:${domainId}:${promptId}`;
  return hasDomainTrace(store, key);
}

/**
 * Helper: record entering a domain
 */
export function recordDomainEntry(domainId: string): void {
  const store = getDomainTraceStore();
  const key: DomainTraceKey = `domain:${domainId}`;
  markDomainTrace(store, key, 'enter');
  saveDomainTraceStore(store);
}

/**
 * Helper: record opening a prompt
 */
export function recordPromptOpen(domainId: string, promptId: string): void {
  const store = getDomainTraceStore();
  const key: DomainTraceKey = `prompt:${domainId}:${promptId}`;
  markDomainTrace(store, key, 'open');
  saveDomainTraceStore(store);
}

/**
 * Helper: record talking to MAIA from a prompt
 */
export function recordDomainMaiaContact(domainId: string, promptId: string): void {
  const store = getDomainTraceStore();
  const key: DomainTraceKey = `maia:${domainId}:${promptId}`;
  markDomainTrace(store, key, 'maia');
  saveDomainTraceStore(store);
}

/**
 * Convert a title to a slug for prompt IDs
 * "The Mirror" -> "the-mirror"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
