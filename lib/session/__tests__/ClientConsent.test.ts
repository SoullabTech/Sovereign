import {
  evaluateLinkReveal,
  isClientConsentActive,
  validateJoinToken,
  type JoinTokenState,
  type LedgerEvent,
  type ConsentAction,
} from '../ClientConsent';

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
