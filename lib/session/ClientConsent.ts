/**
 * Session Room — client consent + join-token decision logic (PURE, no IO).
 *
 * Design: docs/specs/SESSION_ROOM_JOIN_TOKEN_DESIGN_2026-06-14.md
 *
 * Key invariant (Kelly 2026-06-14): the video link is NOT revealed because a token exists —
 * it is revealed only because the client accepted the CURRENT agreement version. The authority
 * is the consent ledger; the token gates who may decide and identifies the session/client.
 *
 * These functions are pure so the security model is unit-tested before any DB migration is
 * applied. The HTTP routes are thin IO wrappers over them.
 */

export type ConsentActorType = 'practitioner' | 'client' | 'system';
export type ConsentAction = 'set' | 'accept' | 'refuse' | 'change' | 'revoke';

export interface LedgerEvent {
  actorType: ConsentActorType;
  action: ConsentAction;
  agreementVersion: string;
  createdAt: number; // epoch ms — deterministic ordering
}

/**
 * The reveal authority. True iff the latest CLIENT event for `currentVersion` is `accept`.
 * No accept for the current version (or a later refuse/revoke) => false.
 */
export function isClientConsentActive(events: LedgerEvent[], currentVersion: string): boolean {
  const relevant = events.filter((e) => e.actorType === 'client' && e.agreementVersion === currentVersion);
  if (relevant.length === 0) return false;
  const latest = relevant.reduce((a, b) => (b.createdAt >= a.createdAt ? b : a));
  return latest.action === 'accept';
}

export type TokenStatus = 'active' | 'used' | 'refused' | 'revoked';

export interface JoinTokenState {
  status: TokenStatus;
  agreementVersion: string; // version the token was minted for
  currentAgreementVersion: string; // session's current version
  expiresAt: number; // epoch ms
  roomState: string; // session room_state
  sessionCancelled?: boolean;
}

export type TokenInvalidReason = 'expired' | 'terminal' | 'stale_version' | 'session_started' | 'cancelled';
export type TokenCheck = { ok: true } | { ok: false; reason: TokenInvalidReason };

/**
 * Validate the token for a purpose.
 *  - 'decide' (accept/refuse): must be active and the session still in 'pre' (decide before start).
 *  - 'reveal' (fetch the link): a 'used' token still reveals (client returns to join); 'pre' or 'active' ok.
 * Both purposes reject expired, cancelled, and stale-version tokens (new version => new token).
 */
export function validateJoinToken(t: JoinTokenState, now: number, purpose: 'decide' | 'reveal'): TokenCheck {
  if (t.sessionCancelled) return { ok: false, reason: 'cancelled' };
  if (now >= t.expiresAt) return { ok: false, reason: 'expired' };
  if (t.agreementVersion !== t.currentAgreementVersion) return { ok: false, reason: 'stale_version' };

  if (purpose === 'decide') {
    if (t.status !== 'active') return { ok: false, reason: 'terminal' };
    if (t.roomState !== 'pre') return { ok: false, reason: 'session_started' };
  } else {
    if (t.status === 'refused' || t.status === 'revoked') return { ok: false, reason: 'terminal' };
    if (t.roomState !== 'pre' && t.roomState !== 'active') return { ok: false, reason: 'session_started' };
  }
  return { ok: true };
}

export interface RevealOutcome {
  status: 200 | 401 | 403;
  revealLink: boolean;
  reason?: string;
}

/**
 * The single decision point for "may we return the video link?" — maps directly to the
 * behavioral tests. token === null models "no token / not found" => 401.
 */
export function evaluateLinkReveal(token: JoinTokenState | null, ledger: LedgerEvent[], now: number): RevealOutcome {
  if (!token) return { status: 401, revealLink: false, reason: 'no_token' };

  const check = validateJoinToken(token, now, 'reveal');
  if (!check.ok) return { status: 403, revealLink: false, reason: check.reason };

  if (isClientConsentActive(ledger, token.currentAgreementVersion)) {
    return { status: 200, revealLink: true };
  }
  return { status: 403, revealLink: false, reason: 'no_consent' };
}

/** Accept/refuse gate — used by the decision routes before writing the ledger event. */
export function evaluateDecision(token: JoinTokenState | null, now: number): { status: 200 | 401 | 403; reason?: string } {
  if (!token) return { status: 401, reason: 'no_token' };
  const check = validateJoinToken(token, now, 'decide');
  if (!check.ok) return { status: 403, reason: check.reason };
  return { status: 200 };
}
