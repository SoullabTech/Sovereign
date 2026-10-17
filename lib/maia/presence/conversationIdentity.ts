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

import { apiFetch } from '@/lib/http/apiBase';

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


/**
 * RF01 R1-D — a real new encounter, not a screen clear.
 *
 * The server mints an unused, verified member-owned session ID. Only after a
 * successful authenticated response is it persisted as today's canonical
 * identity and announced to all mounted MAIA hosts. No existing conversation
 * or member writing is deleted, and no privacy/retention choice is carried.
 */
export async function startVerifiedNewMaiaConversation(): Promise<MaiaSessionIdentity> {
  if (typeof window === 'undefined') throw new Error('NEW_SESSION_CLIENT_REQUIRED');
  const res = await apiFetch('/api/sovereign/privacy/new-conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) throw new Error('NEW_SESSION_NOT_VERIFIED');
  const payload: unknown = await res.json();
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('NEW_SESSION_RECEIPT_INVALID');
  }
  const data = payload as Record<string, unknown>;
  if (data.ok !== true ||
      typeof data.sessionId !== 'string' ||
      !/^session_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.sessionId) ||
      data.privacyChoice !== null || data.remembranceAuthorized !== false) {
    throw new Error('NEW_SESSION_RECEIPT_INVALID');
  }
  const previous = localStorage.getItem(SESSION_ID_KEY);
  if (data.sessionId === previous) throw new Error('NEW_SESSION_ID_NOT_FRESH');

  // Only this verified response can move the canonical local identity.
  localStorage.setItem(SESSION_ID_KEY, data.sessionId);
  localStorage.setItem(SESSION_DATE_KEY, new Date().toDateString());
  window.dispatchEvent(new CustomEvent('maia-session-identity-changed', {
    detail: { sessionId: data.sessionId },
  }));
  return { sessionId: data.sessionId, isNew: true };
}

/** Same-tab MAIA hosts subscribe; no component may infer identity from a
 * "clear messages" event or a stale localStorage cache. */
export function subscribeMaiaSessionIdentityChanged(
  onChange: (identity: MaiaSessionIdentity) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    if (detail && typeof detail.sessionId === 'string' &&
        detail.sessionId === localStorage.getItem(SESSION_ID_KEY)) {
      onChange({ sessionId: detail.sessionId, isNew: true });
    }
  };
  window.addEventListener('maia-session-identity-changed', listener);
  return () => window.removeEventListener('maia-session-identity-changed', listener);
}
