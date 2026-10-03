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

import { getSessionRoomName } from './sessionRoom';

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
 *  - 'reveal' (fetch the link/state): a 'used' token still reveals (client returns); 'pre'/'active' ok.
 *  - 'join'   (mint a live-room credential, Phase 3): same token-level rules as reveal — a 'used'
 *     token may rejoin, refused/revoked are terminal, the room must be 'pre' or 'active' — but join
 *     is a DISTINCT security object from reveal. A room credential and a reveal credential have
 *     different lifetimes and downstream blast radius, so the room-mint path MUST pass 'join' (never
 *     'reveal'); and join authority is *completed* by the ledger gate in authorizeClientRoomJoin
 *     (which denies on any later refuse/revoke), not by token status alone.
 * All purposes reject expired, cancelled, and stale-version tokens (new version => new token).
 */
export function validateJoinToken(t: JoinTokenState, now: number, purpose: 'decide' | 'reveal' | 'join'): TokenCheck {
  if (t.sessionCancelled) return { ok: false, reason: 'cancelled' };
  if (now >= t.expiresAt) return { ok: false, reason: 'expired' };
  if (t.agreementVersion !== t.currentAgreementVersion) return { ok: false, reason: 'stale_version' };

  if (purpose === 'decide') {
    if (t.status !== 'active') return { ok: false, reason: 'terminal' };
    if (t.roomState !== 'pre') return { ok: false, reason: 'session_started' };
  } else {
    // 'reveal' | 'join': accepted ('used') tokens still work (return / rejoin); refused/revoked terminal.
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

// --- Phase 3: room authorization (consent ledger -> live-room credential) ---------------------
// The hardest Phase 3 boundary. authorizeClientRoomJoin is the single decision point for
// "may this client be minted a live-room credential, and as what identity/role?" — the analog of
// evaluateLinkReveal, but for entering live media instead of revealing a link. PURE: the (future)
// LiveKit signing layer turns an allow into a short-TTL room JWT (PR3); grants/Sanctuary specifics
// are applied at signing, not here. The participant identity is CONSTRUCTED server-side from the
// authenticated clientId — never taken from the request body (prevents identity spoofing).

export type RoomRole = 'client' | 'practitioner' | 'scribe';

export interface RoomAuthorization {
  room: string; // LiveKit room name = session id
  identity: string; // server-derived participant identity (never client-supplied)
  role: RoomRole;
}

export type RoomAuthzResult =
  | { status: 200; authorization: RoomAuthorization }
  | { status: 401 | 403; reason: string };

/**
 * Client room-join authorization. Reuses the same gate as the reveal path — the token `'join'`
 * check plus the ledger consent gate — and on success returns the server-derived identity + role
 * to sign into a room credential. The ledger gate (isClientConsentActive) is the authority: it
 * denies on no-accept and on ANY later refuse/revoke for the current version, so a client who
 * accepted then revoked gets no new credential. (Killing an already-live connection mid-session is
 * a separate, runtime server-side action — RemoveParticipant — not modeled here; see plan PR5.)
 */
export function authorizeClientRoomJoin(args: {
  token: JoinTokenState | null;
  ledger: LedgerEvent[];
  now: number;
  sessionId: string;
  clientId: string;
}): RoomAuthzResult {
  const { token, ledger, now, sessionId, clientId } = args;
  if (!token) return { status: 401, reason: 'no_token' };

  const check = validateJoinToken(token, now, 'join');
  if (!check.ok) return { status: 403, reason: check.reason };

  if (!isClientConsentActive(ledger, token.currentAgreementVersion)) {
    return { status: 403, reason: 'no_consent' };
  }

  return {
    status: 200,
    authorization: { room: getSessionRoomName(sessionId), identity: `client:${clientId}`, role: 'client' },
  };
}

export type PractitionerRoomAuthzResult =
  | { status: 200; authorization: RoomAuthorization }
  | { status: 403 | 409; reason: string };

/**
 * Practitioner room-join authorization (pure). The PRACTITIONER is the HOST: unlike the client they
 * are NOT consent-ledger-gated (they author the agreement, they don't accept it), so they may enter
 * a PRE-ENCOUNTER (empty) room before the client accepts — "arranging chairs," not the encounter.
 * The encounter becomes live only when the consent-gated CLIENT joins (authorizeClientRoomJoin).
 *
 * Gate: the caller must OWN the session (session.member_id === caller's member id); an agreement
 * must already be SET (so the room has a defined retention/Sanctuary posture before anyone enters);
 * and the room must be non-terminal ('pre' = preparing, 'active' = live). Identity is CONSTRUCTED
 * server-side from the practitioner id (never request-supplied). The room name comes from
 * getSessionRoomName — the SAME function authorizeClientRoomJoin uses — so both parties always
 * resolve to one room (room parity; prevents a "session:123" vs "123" split).
 */
export function authorizePractitionerRoomJoin(args: {
  sessionId: string;
  sessionMemberId: string | null; // scribe_sessions.member_id (the owning practitioner's member id)
  callerMemberId: string; // authenticated caller (already resolved to a practitioner)
  practitionerId: string; // server-derived practitioner id (identity source)
  agreementSet: boolean; // consent_practitioner_at present => the agreement/retention posture exists
  roomState: string; // scribe_sessions.room_state
}): PractitionerRoomAuthzResult {
  const { sessionId, sessionMemberId, callerMemberId, practitionerId, agreementSet, roomState } = args;
  if (!sessionMemberId || sessionMemberId !== callerMemberId) {
    return { status: 403, reason: 'not_session_owner' };
  }
  if (!agreementSet) {
    return { status: 409, reason: 'agreement_not_set' };
  }
  if (roomState !== 'pre' && roomState !== 'active') {
    return { status: 409, reason: 'session_not_joinable' };
  }
  return {
    status: 200,
    authorization: {
      room: getSessionRoomName(sessionId),
      identity: `practitioner:${practitionerId}`,
      role: 'practitioner',
    },
  };
}
