import {
  evaluateLinkReveal,
  isClientConsentActive,
  validateJoinToken,
  authorizeClientRoomJoin,
  authorizePractitionerRoomJoin,
  type JoinTokenState,
  type LedgerEvent,
  type ConsentAction,
} from '../ClientConsent';
import { getSessionRoomName } from '../sessionRoom';

const V = 'v2';
const NOW = 1000;
const FUTURE = NOW + 100000;

function token(overrides: Partial<JoinTokenState> = {}): JoinTokenState {
  return {
    status: 'active',
    agreementVersion: V,
    currentAgreementVersion: V,
    expiresAt: FUTURE,
    roomState: 'pre',
    ...overrides,
  };
}

function clientEvent(action: ConsentAction, version = V, createdAt = NOW): LedgerEvent {
  return { actorType: 'client', action, agreementVersion: version, createdAt };
}

// The proof Kelly asked for: the link is revealed only because the client accepted the
// current agreement version — never because a token merely exists.
describe('reveal gate — the six behavioral proofs', () => {
  it('1. no token → 401', () => {
    expect(evaluateLinkReveal(null, [], NOW).status).toBe(401);
  });

  it('2. valid token, no consent → 403', () => {
    const r = evaluateLinkReveal(token(), [], NOW);
    expect(r.status).toBe(403);
    expect(r.revealLink).toBe(false);
  });

  it('3. refusal recorded → 403', () => {
    const r = evaluateLinkReveal(token(), [clientEvent('refuse')], NOW);
    expect(r.status).toBe(403);
    expect(r.revealLink).toBe(false);
  });

  it('4. acceptance recorded → 200 + video link', () => {
    const r = evaluateLinkReveal(token(), [clientEvent('accept')], NOW);
    expect(r.status).toBe(200);
    expect(r.revealLink).toBe(true);
  });

  it('5. old accepted token after version change → 403', () => {
    const stale = token({ agreementVersion: 'v1', currentAgreementVersion: 'v2' });
    const r = evaluateLinkReveal(stale, [clientEvent('accept', 'v1')], NOW);
    expect(r.status).toBe(403);
    expect(r.revealLink).toBe(false);
  });

  it('6. new version, no accept yet → 403', () => {
    const r = evaluateLinkReveal(token({ agreementVersion: 'v2', currentAgreementVersion: 'v2' }), [clientEvent('accept', 'v1')], NOW);
    expect(r.status).toBe(403);
    expect(r.revealLink).toBe(false);
  });
});

describe('isClientConsentActive — latest client event wins, current version only', () => {
  it('accept → active', () => {
    expect(isClientConsentActive([clientEvent('accept')], V)).toBe(true);
  });
  it('accept then later refuse → not active', () => {
    expect(isClientConsentActive([clientEvent('accept', V, 1), clientEvent('refuse', V, 2)], V)).toBe(false);
  });
  it('a practitioner accept does not count as client consent', () => {
    expect(isClientConsentActive([{ actorType: 'practitioner', action: 'accept', agreementVersion: V, createdAt: 1 }], V)).toBe(false);
  });
});

describe('validateJoinToken — purpose-specific gates', () => {
  it('expired token is rejected', () => {
    expect(validateJoinToken(token({ expiresAt: NOW - 1 }), NOW, 'reveal')).toEqual({ ok: false, reason: 'expired' });
  });
  it('decide requires an active token and a pre-session room', () => {
    expect(validateJoinToken(token({ status: 'used' }), NOW, 'decide')).toEqual({ ok: false, reason: 'terminal' });
    expect(validateJoinToken(token({ roomState: 'active' }), NOW, 'decide')).toEqual({ ok: false, reason: 'session_started' });
  });
  it('a refused token cannot decide again (refusal is terminal)', () => {
    expect(validateJoinToken(token({ status: 'refused' }), NOW, 'decide')).toEqual({ ok: false, reason: 'terminal' });
  });
  it('a used (accepted) token can still reveal the link when the client returns', () => {
    expect(validateJoinToken(token({ status: 'used' }), NOW, 'reveal')).toEqual({ ok: true });
  });
});

// PR1 — Phase 3 room authorization. 'join' is a DISTINCT security object from 'reveal', and the
// ledger gate (not token status alone) is the authority for entering live media.
describe('validateJoinToken — join purpose', () => {
  it('a used (accepted) token may rejoin', () => {
    expect(validateJoinToken(token({ status: 'used' }), NOW, 'join')).toEqual({ ok: true });
  });
  it('a used token may join while the session is active (rejoin mid-session)', () => {
    expect(validateJoinToken(token({ status: 'used', roomState: 'active' }), NOW, 'join')).toEqual({ ok: true });
  });
  it('refused or revoked tokens cannot join (terminal)', () => {
    expect(validateJoinToken(token({ status: 'refused' }), NOW, 'join')).toEqual({ ok: false, reason: 'terminal' });
    expect(validateJoinToken(token({ status: 'revoked' }), NOW, 'join')).toEqual({ ok: false, reason: 'terminal' });
  });
  it('cannot join a closing/closed session', () => {
    expect(validateJoinToken(token({ roomState: 'closing' }), NOW, 'join')).toEqual({ ok: false, reason: 'session_started' });
  });
  it('expired and stale-version tokens cannot join', () => {
    expect(validateJoinToken(token({ expiresAt: NOW - 1 }), NOW, 'join')).toEqual({ ok: false, reason: 'expired' });
    expect(validateJoinToken(token({ agreementVersion: 'v1', currentAgreementVersion: 'v2' }), NOW, 'join')).toEqual({ ok: false, reason: 'stale_version' });
  });
});

describe('authorizeClientRoomJoin — consent ledger → room authorization (the PR1 seam)', () => {
  const base = { now: NOW, sessionId: 'sess-1', clientId: 'cli-1' };

  it('no token → 401', () => {
    expect(authorizeClientRoomJoin({ token: null, ledger: [], ...base }).status).toBe(401);
  });
  it('valid token, no consent → 403 no_consent', () => {
    expect(authorizeClientRoomJoin({ token: token(), ledger: [], ...base })).toEqual({ status: 403, reason: 'no_consent' });
  });
  it('accepted current version → 200 with server-derived identity + client role', () => {
    const r = authorizeClientRoomJoin({ token: token(), ledger: [clientEvent('accept')], ...base });
    expect(r).toEqual({ status: 200, authorization: { room: 'sess-1', identity: 'client:cli-1', role: 'client' } });
  });
  it('accept then later revoke → 403 (no NEW credential after revocation)', () => {
    const r = authorizeClientRoomJoin({ token: token({ status: 'used' }), ledger: [clientEvent('accept', V, 1), clientEvent('revoke', V, 2)], ...base });
    expect(r).toEqual({ status: 403, reason: 'no_consent' });
  });
  it('a used (accepted) token may rejoin while consent is active', () => {
    expect(authorizeClientRoomJoin({ token: token({ status: 'used' }), ledger: [clientEvent('accept')], ...base }).status).toBe(200);
  });
  it('a spent old-version token cannot join (stale_version) even with a prior accept', () => {
    const stale = token({ status: 'used', agreementVersion: 'v1', currentAgreementVersion: 'v2' });
    expect(authorizeClientRoomJoin({ token: stale, ledger: [clientEvent('accept', 'v1')], ...base })).toEqual({ status: 403, reason: 'stale_version' });
  });
  it('a refused token → 403 terminal', () => {
    expect(authorizeClientRoomJoin({ token: token({ status: 'refused' }), ledger: [clientEvent('refuse')], ...base })).toEqual({ status: 403, reason: 'terminal' });
  });
  it('identity is server-constructed from clientId, not caller-supplied', () => {
    const r = authorizeClientRoomJoin({ token: token(), ledger: [clientEvent('accept')], ...base, clientId: 'other-client' });
    expect(r).toMatchObject({ status: 200, authorization: { identity: 'client:other-client' } });
  });
});

// PR4a — practitioner room authorization. The HOST may enter a pre-encounter room before the client
// accepts (owns-session, NOT consent-gated); identity is server-derived; the room name comes from
// the SAME getSessionRoomName as the client path.
describe('authorizePractitionerRoomJoin — owns-session gate (PR4a)', () => {
  const base = {
    sessionId: 'sess-1',
    sessionMemberId: 'mem-1',
    callerMemberId: 'mem-1',
    practitionerId: 'prac-1',
    agreementSet: true,
    roomState: 'pre',
  };

  it('owner + agreement set + pre → 200 with server-derived practitioner identity', () => {
    expect(authorizePractitionerRoomJoin(base)).toEqual({
      status: 200,
      authorization: { room: 'sess-1', identity: 'practitioner:prac-1', role: 'practitioner' },
    });
  });

  it('owner may enter while the session is active (rejoin)', () => {
    expect(authorizePractitionerRoomJoin({ ...base, roomState: 'active' }).status).toBe(200);
  });

  it('owner may enter BEFORE any client accepts — the host is not consent-gated', () => {
    // There is no ledger parameter at all: pre-encounter entry is by design.
    expect(authorizePractitionerRoomJoin(base).status).toBe(200);
  });

  it('wrong practitioner (does not own the session) → 403 not_session_owner', () => {
    expect(authorizePractitionerRoomJoin({ ...base, callerMemberId: 'mem-2' })).toEqual({
      status: 403,
      reason: 'not_session_owner',
    });
  });

  it('null session owner never matches a caller → 403 not_session_owner', () => {
    expect(authorizePractitionerRoomJoin({ ...base, sessionMemberId: null })).toEqual({
      status: 403,
      reason: 'not_session_owner',
    });
  });

  it('agreement not set → 409 agreement_not_set (no retention posture defined yet)', () => {
    expect(authorizePractitionerRoomJoin({ ...base, agreementSet: false })).toEqual({
      status: 409,
      reason: 'agreement_not_set',
    });
  });

  it('terminal/closed session → 409 session_not_joinable', () => {
    expect(authorizePractitionerRoomJoin({ ...base, roomState: 'closing' })).toEqual({
      status: 409,
      reason: 'session_not_joinable',
    });
    expect(authorizePractitionerRoomJoin({ ...base, roomState: 'closed' })).toEqual({
      status: 409,
      reason: 'session_not_joinable',
    });
  });

  it('identity is server-constructed from practitionerId, not request-supplied', () => {
    const r = authorizePractitionerRoomJoin({ ...base, practitionerId: 'prac-99' });
    expect(r).toMatchObject({ status: 200, authorization: { identity: 'practitioner:prac-99' } });
  });
});

// THE guard against the silent "two participants in different rooms" failure: both mint paths derive
// the room name from the SAME function, so a practitioner and an accepted client for one session
// always resolve to one room.
describe('room-name parity — client and practitioner resolve to the SAME room', () => {
  it('both authorizations derive room from getSessionRoomName(sessionId)', () => {
    const sessionId = 'sess-parity-123';
    const client = authorizeClientRoomJoin({
      token: token(),
      ledger: [clientEvent('accept')],
      now: NOW,
      sessionId,
      clientId: 'cli-1',
    });
    const practitioner = authorizePractitionerRoomJoin({
      sessionId,
      sessionMemberId: 'mem-1',
      callerMemberId: 'mem-1',
      practitionerId: 'prac-1',
      agreementSet: true,
      roomState: 'pre',
    });
    if (client.status !== 200 || practitioner.status !== 200) throw new Error('expected both authorized');
    expect(client.authorization.room).toBe(getSessionRoomName(sessionId));
    expect(practitioner.authorization.room).toBe(getSessionRoomName(sessionId));
    expect(client.authorization.room).toBe(practitioner.authorization.room);
  });
});
