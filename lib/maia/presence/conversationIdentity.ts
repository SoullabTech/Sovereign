/**
 * Canonical MAIA conversation identity — the ONE place session identity is
 * minted or restored. Extracted verbatim-in-semantics from app/maia/page.tsx
 * (localStorage `maia_session_id` + `maia_session_date`, daily rotation) so
 * the /maia page and the global MaiaPresence provider can never mint
 * competing sessions for the same member on the same day.
 *
 * DAILY ROTATION IS PRESERVED DELIBERATELY. Whether yesterday's visible
 * conversation should carry forward is a product decision (one continuous
 * thread vs. daily chapters vs. consciously closed sessions) — documented in
 * docs/architecture/MAIA_HOUSE_PRESENCE_IMPLEMENTATION.md and awaiting
 * Kelly's ruling. Do not change the rotation here without that ruling.
 */

const SESSION_ID_KEY = 'maia_session_id';
const SESSION_DATE_KEY = 'maia_session_date';

export interface MaiaSessionIdentity {
  sessionId: string;
  /** True when this call minted a fresh session (new day or first visit). */
  isNew: boolean;
}

/**
 * Get the member's canonical MAIA sessionId for today, minting one if the
 * stored session is absent or from a previous calendar day. Client-only —
 * returns null during SSR.
 */
export function getOrCreateMaiaSessionId(): MaiaSessionIdentity | null {
  if (typeof window === 'undefined') return null;

  const existing = localStorage.getItem(SESSION_ID_KEY);
  const lastDate = localStorage.getItem(SESSION_DATE_KEY);
  const today = new Date().toDateString();

  if (existing && lastDate === today) {
    return { sessionId: existing, isNew: false };
  }

  const sessionId = `session_${Date.now()}`;
  localStorage.setItem(SESSION_ID_KEY, sessionId);
  localStorage.setItem(SESSION_DATE_KEY, today);
  return { sessionId, isNew: true };
}

/** Read the current session without minting (null if absent or stale-day). */
export function peekMaiaSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  const existing = localStorage.getItem(SESSION_ID_KEY);
  const lastDate = localStorage.getItem(SESSION_DATE_KEY);
  if (existing && lastDate === new Date().toDateString()) return existing;
  return null;
}
