import {
  R4F_GRANT_LIFETIME_MS, isValidMemberPassage,
  mintR4fOpaqueGrant, sha256Exact, hmacPassageExact, isR4fGrantEligible,
  mayRecallProtectedPassage, canR4fAuthorizeCrossSessionRecall,
} from '../r4fPolicy';

describe('R4F member-owned chart passage authorization (pure, fictional)', () => {
  const text = 'Fictional: Mercury in Gemini. My question is about language.';
  const member = 'fictional-member-A';
  const digestKey = 'fictional-test-secret-32-bytes-abcdefghijklmnopqrstuvwxyz';
  const now = new Date('2026-10-13T20:00:00.000Z');

  function setup() {
    const grant = mintR4fOpaqueGrant();
    const record = {
      memberId: member, sessionId: grant.sessionId,
      textHmacSha256: hmacPassageExact(text, digestKey), tokenSha256: grant.tokenSha256,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + R4F_GRANT_LIFETIME_MS),
      state: 'issued' as const,
    };
    const attempt = {
      memberId: member, text, token: grant.token,
      now: new Date(now.getTime() + 1), currentlyOptedIn: true, digestKey,
    };
    return { grant, record, attempt };
  }

  it('uses a fresh opaque token and conversation identity', () => {
    const a = mintR4fOpaqueGrant(), b = mintR4fOpaqueGrant();
    expect(a.token).not.toBe(b.token);
    expect(a.sessionId).not.toBe(b.sessionId);
    expect(a.token).not.toContain(a.sessionId);
    expect(a.tokenSha256).toBe(sha256Exact(a.token));
  });
  it('admits exact text only with current consent', () => {
    const { record, attempt } = setup();
    expect(isR4fGrantEligible(record, attempt)).toBe(true);
    expect(isR4fGrantEligible(record, { ...attempt, text: text + ' ' })).toBe(false);
    expect(isR4fGrantEligible(record, { ...attempt, memberId: 'fictional-member-B' })).toBe(false);
    expect(isR4fGrantEligible(record, { ...attempt, token: 'modified' })).toBe(false);
    expect(isR4fGrantEligible(record, { ...attempt, digestKey: 'another-secret-32-bytes-abcdefghijklmnopqrstuvwxyz' })).toBe(false);
    expect(isR4fGrantEligible(record, { ...attempt, currentlyOptedIn: false })).toBe(false);
    expect(isR4fGrantEligible({ ...record, state: 'consumed' }, attempt)).toBe(false);
    expect(isR4fGrantEligible({ ...record, state: 'revoked' }, attempt)).toBe(false);
    expect(isR4fGrantEligible(record, { ...attempt, now: record.expiresAt })).toBe(false);
    expect(isR4fGrantEligible(record, { ...attempt, now: new Date('invalid') })).toBe(false);
  });
  it('rejects empty, NUL and oversized passages', () => {
    expect(isValidMemberPassage('')).toBe(false);
    expect(isValidMemberPassage('    ')).toBe(false);
    expect(isValidMemberPassage('hi\u0000')).toBe(false);
    expect(isValidMemberPassage('漢'.repeat(5000))).toBe(false);
    expect(isValidMemberPassage(text)).toBe(true);
  });
  it('permits same-conversation scope, never silent other-session reuse', () => {
    expect(mayRecallProtectedPassage({
      protectedOrigin: true, sourceSessionId: 'a', destinationSessionId: 'a',
      separatelyAuthorized: false,
    })).toBe(true);
    expect(mayRecallProtectedPassage({
      protectedOrigin: true, sourceSessionId: 'a', destinationSessionId: 'b',
      separatelyAuthorized: false,
    })).toBe(false);
    expect(mayRecallProtectedPassage({
      protectedOrigin: true, sourceSessionId: 'a', destinationSessionId: '',
      separatelyAuthorized: true,
    })).toBe(false);
    expect(mayRecallProtectedPassage({
      protectedOrigin: false, sourceSessionId: 'a', destinationSessionId: 'b',
      separatelyAuthorized: false,
    })).toBe(true);
    expect(canR4fAuthorizeCrossSessionRecall()).toBe(false);
  });
});
