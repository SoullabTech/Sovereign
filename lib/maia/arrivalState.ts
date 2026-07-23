/**
 * Arrival state — the single owner of "should the member meet Arrival right now?"
 *
 * Ruling (Kelly, 2026-07-22):
 *
 *   Returning to Arrival is opening a room, not undoing an initiation.
 *
 * That sentence is the whole reason this module exists. There are TWO states,
 * and collapsing them into one boolean is the ambiguity this prevents:
 *
 *   hasArrivedBefore — DURABLE. The member's first crossing into conversation,
 *                      persisted under ARRIVAL_MARKER_KEY. Written exactly once,
 *                      never cleared, never overwritten. It records WHEN arrival
 *                      happened, not when the member last spoke.
 *
 *   arrivalInvoked   — TEMPORARY. The member asked for Arrival in this session,
 *                      through The House. Lives in React state only; never
 *                      persisted; dies with the tab.
 *
 * A single flag would make "is looking at Arrival now" and "has never crossed"
 * the same fact — so a deliberate return would have to erase the first crossing
 * in order to render the room. That is the collapse this module refuses.
 *
 * No inference lives here. Both inputs are member acts: crossing into speech,
 * and choosing Return to Arrival. Nothing reads readiness, mood, or absence.
 */

/** localStorage key for the durable first-crossing marker. */
export const ARRIVAL_MARKER_KEY = 'maia_has_arrived';

export interface ArrivalStateInputs {
  /** The arrivalEntry feature flag — a kill-switch, never an eligibility signal. */
  arrivalEntryEnabled: boolean;
  /** Durable: has this member ever crossed into conversation before? */
  hasArrivedBefore: boolean;
  /** Temporary: did the member invoke a return from The House this session? */
  arrivalInvoked: boolean;
}

/**
 * The one calculated truth. Every consumer — the shell's receding rail, the
 * transcript greeting suppression, the renderer itself — reads this, so the
 * renderer and the suppression can never disagree about whether Arrival is up.
 *
 * ⚠️ Never substitute the raw `arrivalEntry` flag for this at a call site. The
 * flag is default-ON for every member; keying anything to it treats returning
 * members as though they were arriving.
 */
export function deriveShouldRenderArrival({
  arrivalEntryEnabled,
  hasArrivedBefore,
  arrivalInvoked,
}: ArrivalStateInputs): boolean {
  if (!arrivalEntryEnabled) return false;      // kill-switch wins over everything
  return !hasArrivedBefore || arrivalInvoked;  // first visit, or member-invoked return
}

/**
 * Read the durable marker. SSR-safe: returns true on the server so the majority
 * (returning members) render their normal surface with no flash of Arrival
 * before the marker can be read on the client.
 */
export function readHasArrivedBefore(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return Boolean(window.localStorage.getItem(ARRIVAL_MARKER_KEY));
  } catch {
    return true; // private mode — fail toward the unchanged returning surface
  }
}

/**
 * Record the first crossing. Idempotent AND write-once: called on every member
 * turn, but only the first one is kept. Re-writing on later turns would turn a
 * record of "when they arrived" into "when they last spoke".
 *
 * Returns true if this call performed the write (i.e. this was the crossing).
 */
export function recordFirstArrival(now: number = Date.now()): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.localStorage.getItem(ARRIVAL_MARKER_KEY)) return false;
    window.localStorage.setItem(ARRIVAL_MARKER_KEY, String(now));
    return true;
  } catch {
    return false; // private mode — the session still works, it just won't persist
  }
}
