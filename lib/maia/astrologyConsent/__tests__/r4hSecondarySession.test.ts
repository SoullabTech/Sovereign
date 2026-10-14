import { assertR4hSecondarySession, R4hSecondaryAuthenticationRefused } from '../r4hSecondarySessionAuthority';
import { assertR4gOrdinarySession, R4gSessionHeld } from '../r4gOrdinarySessionGate';

jest.mock('../r4gOrdinarySessionGate', () => ({
  R4gSessionHeld: class R4gSessionHeld extends Error {},
  assertR4gOrdinarySession: jest.fn(),
}));
const gate = assertR4gOrdinarySession as jest.Mock;
const memberA = 'aaaaaaaa-0000-4000-8000-000000000001';
const memberB = 'bbbbbbbb-0000-4000-8000-000000000002';
const valid = () => ({
  memberId: memberA, revoked: false,
  expiresAt: new Date(Date.now() + 60000),
});
beforeEach(() => gate.mockReset());

describe('R4H secondary service identity and consent boundary', () => {
  it('admits only active server-sourced member and authorized ordinary session', async () => {
    gate.mockResolvedValue(undefined);
    const member = await assertR4hSecondarySession({
      sessionId: 'ordinary-fictional-session',
      claimedMemberId: memberA,
      resolveSession: async () => valid(),
    });
    expect(member).toBe(memberA);
    expect(gate).toHaveBeenCalledWith('ordinary-fictional-session');
  });
  it('refuses missing, revoked, expired or invalid session, before model and history', async () => {
    for (const source of [
      null, { ...valid(), revoked: true }, { ...valid(), expiresAt: new Date(Date.now() - 500) },
      { ...valid(), memberId: '' }, { ...valid(), expiresAt: new Date('invalid') },
    ]) {
      await expect(assertR4hSecondarySession({
        sessionId: 'ordinary-fictional-session',
        resolveSession: async () => source,
      })).rejects.toBeInstanceOf(R4hSecondaryAuthenticationRefused);
    }
    expect(gate).not.toHaveBeenCalled();
  });
  it('refuses conflicting claims without reading protected-memory registry', async () => {
    await expect(assertR4hSecondarySession({
      sessionId: 'ordinary-fictional-session', claimedMemberId: memberB,
      resolveSession: async () => valid(),
    })).rejects.toBeInstanceOf(R4hSecondaryAuthenticationRefused);
    expect(gate).not.toHaveBeenCalled();
  });
  it('refuses a protected session, even for its authenticated owner', async () => {
    gate.mockRejectedValue(new R4gSessionHeld());
    await expect(assertR4hSecondarySession({
      sessionId: 'fictional-chart-session',
      resolveSession: async () => valid(),
    })).rejects.toBeInstanceOf(R4gSessionHeld);
  });
  it('refuses missing session identifier and unavailable authority', async () => {
    const resolve = jest.fn(async () => valid());
    await expect(assertR4hSecondarySession({ sessionId: '', resolveSession: resolve }))
      .rejects.toBeInstanceOf(R4hSecondaryAuthenticationRefused);
    expect(resolve).not.toHaveBeenCalled();
    await expect(assertR4hSecondarySession({
      sessionId: 'ordinary-fictional-session',
      resolveSession: async () => { throw new Error('fictional auth DB unavailable'); },
    })).rejects.toThrow('fictional auth DB unavailable');
  });
});
