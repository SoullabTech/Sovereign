/**
 * SERVER IDENTITY PARITY CHECK
 *
 * The app has historically carried two notions of "who is signed in":
 *
 *   • CLIENT-BELIEVED  — `beta_user` / `memberId` in localStorage. Drives the
 *     UI: the greeting, the name, whether we show a signed-in room at all.
 *   • SERVER-VERIFIED  — the member behind a valid `auth_sessions` row, reached
 *     via the `maia_session` cookie (web) or the `x-session-token` header
 *     (iOS/Capacitor + Safari). This is the ONLY identity the memory path
 *     honours (`lib/auth/getMemberFromRequest.ts`).
 *
 * On the web these cannot drift far: the cookie is set by the same sign-in that
 * writes localStorage, and `middleware.ts` bounces a page load with no cookie
 * to /signin. On iOS neither guard exists — the cookie cannot travel
 * cross-origin from `capacitor://localhost`, and the middleware is replaced by
 * a no-op stub for the static export (`scripts/capacitor-patch-routes.sh`). A
 * native device whose `maia_session_token` is missing, expired or revoked
 * therefore keeps presenting as a recognized member while every conversation
 * turn resolves to `null` server-side: MAIA answers fluently and recalls
 * nothing, because it was never told who it is speaking to.
 *
 * This module asks the server directly and reports the divergence. It is
 * DIAGNOSTIC AND NON-DESTRUCTIVE: it never clears credentials and never
 * redirects. A transient network failure must not be able to sign a member out
 * of their own device, so an unreachable server is reported as 'unknown', not
 * as a lost session. What to do about a real split — prompt, re-auth, or
 * simply tell the member plainly — is the caller's decision.
 *
 * Consent note: this sends no conversation content and stores nothing. It reads
 * an identity the device already holds and asks whether the server agrees.
 */

import { apiFetch, getValidMemberId } from '@/lib/http/apiBase';

export type IdentityParity =
  /** Client and server agree on the same member. Memory path is eligible. */
  | 'aligned'
  /**
   * The device believes it is signed in; the server does not recognize it.
   * THIS is the "MAIA forgot me" state — conversation works, memory is off.
   */
  | 'client-only'
  /** Server recognizes a DIFFERENT member than the device believes. */
  | 'mismatch'
  /** Neither side claims a member. Correct for a signed-out device. */
  | 'anonymous'
  /** Server unreachable or check timed out. Nothing is concluded. */
  | 'unknown';

export interface IdentityParityResult {
  parity: IdentityParity;
  /** What the device believed, before asking. */
  clientMemberId: string | null;
  /** What the server verified. Null when no valid session credential arrived. */
  serverMemberId: string | null;
  /** Which verified credential reached the server: 'cookie' | 'header' | 'none'. */
  credentialSource: string | null;
  /** Server's reason when it did not authenticate (e.g. 'expired_session'). */
  reason: string | null;
}

const CHECK_TIMEOUT_MS = 6000;

/**
 * Ask the server who it thinks we are and compare with what this device
 * believes. Never throws — an unusable answer is reported as 'unknown'.
 */
export async function verifyServerIdentity(): Promise<IdentityParityResult> {
  const clientMemberId = getValidMemberId();

  const base: IdentityParityResult = {
    parity: 'unknown',
    clientMemberId,
    serverMemberId: null,
    credentialSource: null,
    reason: null,
  };

  if (typeof window === 'undefined') return base;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    // apiFetch — NOT bare fetch. It resolves the absolute origin on native
    // (a relative /api/* path resolves to capacitor://localhost and never
    // reaches the server) and attaches x-session-token, the only credential
    // that can authenticate a cross-origin native request.
    const res = await apiFetch('/api/auth/whoami', {
      method: 'GET',
      signal: controller.signal,
    });

    if (!res.ok) return base;

    const data = await res.json().catch(() => null);
    if (!data || typeof data !== 'object') return base;

    const serverMemberId: string | null = data.authed && data.memberId ? data.memberId : null;
    const credentialSource: string | null = data.credentialSource ?? null;
    const reason: string | null = data.reason ?? null;

    let parity: IdentityParity;
    if (serverMemberId && clientMemberId) {
      parity = serverMemberId === clientMemberId ? 'aligned' : 'mismatch';
    } else if (!serverMemberId && clientMemberId) {
      parity = 'client-only';
    } else if (serverMemberId && !clientMemberId) {
      // Server knows us, device forgot. Memory still works; the UI is behind.
      parity = 'mismatch';
    } else {
      parity = 'anonymous';
    }

    return { parity, clientMemberId, serverMemberId, credentialSource, reason };
  } catch {
    // Aborted, offline, CORS — conclude nothing.
    return base;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run the parity check and emit one discoverable log line. Returns the result
 * so a caller can act on it; callers that only want the observability can
 * ignore the return. Fire-and-forget safe — never rejects.
 *
 * Log marker (grep contract): `[identity] parity`
 */
export async function reportServerIdentityParity(): Promise<IdentityParityResult> {
  const result = await verifyServerIdentity();

  const line = {
    parity: result.parity,
    credentialSource: result.credentialSource,
    reason: result.reason,
    // Prefixes only — member UUIDs are client-exposed and must not be logged whole.
    client: result.clientMemberId ? `${result.clientMemberId.slice(0, 8)}…` : null,
    server: result.serverMemberId ? `${result.serverMemberId.slice(0, 8)}…` : null,
  };

  if (result.parity === 'client-only' || result.parity === 'mismatch') {
    console.warn(
      '[identity] parity — device believes it is signed in but the server does not agree. ' +
        'Conversation will work; cross-session memory will NOT. Re-authentication is required.',
      line
    );
  } else {
    console.log('[identity] parity', line);
  }

  return result;
}
