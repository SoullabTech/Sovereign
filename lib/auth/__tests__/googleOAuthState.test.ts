/**
 * OAUTH STATE — a transaction, not an identity.
 * =============================================
 *
 * The callback read `const userId = state`, so the URL carried identity. These
 * tests pin the replacement: the URL carries a lookup key, the identity lives
 * server-side, and redemption happens exactly once.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({ query: (s: string, p?: unknown[]) => mockQuery(s, p) }));

import { beginOAuthTransaction, consumeOAuthState } from '../googleOAuthState';

const MEMBER = '11111111-1111-1111-1111-111111111111';

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ rows: [] });
});

describe('beginOAuthTransaction', () => {
  it('returns an opaque value that does NOT contain the member id', async () => {
    // The whole defect was identity travelling in the URL.
    const state = await beginOAuthTransaction(MEMBER);
    expect(state).not.toContain(MEMBER);
    expect(state.length).toBeGreaterThan(32);
  });

  it('is unguessable — distinct on every call', async () => {
    const states = new Set<string>();
    for (let i = 0; i < 200; i++) states.add(await beginOAuthTransaction(MEMBER));
    expect(states.size).toBe(200);
  });

  it('records the member SERVER-SIDE, with an expiry', async () => {
    await beginOAuthTransaction(MEMBER, '203.0.113.9');
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO google_oauth_state/i);
    expect(sql).toMatch(/expires_at/i);
    expect(params).toContain(MEMBER);
  });

  it('refuses to begin a transaction with no member', async () => {
    await expect(beginOAuthTransaction('')).rejects.toThrow();
  });
});

describe('consumeOAuthState', () => {
  it('returns the bound member and consumes atomically', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ member_id: MEMBER }] });

    const r = await consumeOAuthState('opaque-value');

    expect(r).toEqual({ ok: true, memberId: MEMBER });
    // One statement that both claims and reads. A SELECT-then-UPDATE would let
    // a replayed callback race the original and both store tokens.
    const [sql] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/UPDATE google_oauth_state/i);
    expect(sql).toMatch(/consumed_at IS NULL/i);
    expect(sql).toMatch(/expires_at > NOW\(\)/i);
  });

  it('REFUSES a replay, and says so distinctly', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })                                     // claim fails
      .mockResolvedValueOnce({ rows: [{ consumed_at: new Date(), is_expired: false }] });

    // A replay is a security event; it must not look like a typo in the logs.
    expect(await consumeOAuthState('used')).toEqual({ ok: false, reason: 'replayed' });
  });

  it('REFUSES an expired state', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ consumed_at: null, is_expired: true }] });

    expect(await consumeOAuthState('stale')).toEqual({ ok: false, reason: 'expired' });
  });

  it('REFUSES a forged value', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });
    expect(await consumeOAuthState('made-up')).toEqual({ ok: false, reason: 'unknown' });
  });

  it('REFUSES an empty state without touching the database', async () => {
    expect(await consumeOAuthState('')).toEqual({ ok: false, reason: 'unknown' });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('never returns a member id the caller supplied', async () => {
    // Passing a member id AS the state must not resolve to that member.
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });
    const r = await consumeOAuthState(MEMBER);
    expect(r).toEqual({ ok: false, reason: 'unknown' });
  });
});
