/**
 * RF01 S0-A2 — fictional-only ownership contract.
 * No production member identities or persistence are used.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as fs from 'node:fs';
import * as path from 'node:path';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const mockQuery = jest.fn<(sql: string, args?: unknown[]) => Promise<{ rows: any[] }>>();
jest.mock('@/lib/db/postgres', () => ({ query: (sql: string, args?: unknown[]) => mockQuery(sql, args) }));
import {
  normalizedSessionId, ensureOwnedMemberSession, ensureGuestSession,
  requireExistingOwnedSession, SessionOwnershipRefusal,
} from '../memberSessionOwnership';

const rows = new Map<string, string | null>();
beforeEach(() => {
  mockQuery.mockReset();
  rows.clear();
  mockQuery.mockImplementation(async (sql, args) => {
    const id = String(args?.[0]);
    if (sql.startsWith('INSERT INTO maia_sessions')) {
      if (!rows.has(id)) rows.set(id, args?.[1] == null ? null : String(args?.[1]));
      return { rows: [] };
    }
    if (sql.includes('SELECT 1 FROM maia_sessions')) {
      return { rows: rows.get(id) === args?.[1] ? [{ '?column?': 1 }] : [] };
    }
    if (sql.includes('member_id IS NULL')) {
      return { rows: rows.has(id) && rows.get(id) === null ? [{ id, turn_count: 0 }] : [] };
    }
    if (sql.includes('member_id = $2')) {
      return { rows: rows.get(id) === args?.[1] ? [{ id, turn_count: 0 }] : [] };
    }
    throw new Error('Unexpected SQL in ownership fixture');
  });
});

describe('RF01 member session ownership', () => {
  it('binds a new member session exactly once to verified A', async () => {
    const s = await ensureOwnedMemberSession('session_123', A);
    expect(s.id).toBe('session_123');
    expect(rows.get('session_123')).toBe(A);
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });
  it('reuses an existing member session only for its owner', async () => {
    rows.set('existing', A);
    expect((await ensureOwnedMemberSession('existing', A)).id).toBe('existing');
    expect(rows.get('existing')).toBe(A);
  });
  it('refuses an existing member B session without changing it', async () => {
    rows.set('foreign', B);
    await expect(ensureOwnedMemberSession('foreign', A))
      .rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
    expect(rows.get('foreign')).toBe(B);
  });
  it('never auto-claims a legacy NULL-owner session', async () => {
    rows.set('legacy', null);
    await expect(ensureOwnedMemberSession('legacy', A))
      .rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
    expect(rows.get('legacy')).toBeNull();
  });
  it('competing first-writer actors cannot both claim the same ID', async () => {
    const outcomes = await Promise.allSettled([
      ensureOwnedMemberSession('race', A),
      ensureOwnedMemberSession('race', B),
    ]);
    expect(outcomes.filter(x => x.status === 'fulfilled')).toHaveLength(1);
    expect(outcomes.filter(x => x.status === 'rejected')).toHaveLength(1);
  });
  it('guest cannot enter an owned member session', async () => {
    rows.set('owned', A);
    await expect(ensureGuestSession('owned'))
      .rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
  });
  it('guest session cannot be silently promoted to a member', async () => {
    await ensureGuestSession('anonymous');
    await expect(ensureOwnedMemberSession('anonymous', A))
      .rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
    expect(rows.get('anonymous')).toBeNull();
  });
  it('read-only ownership check refuses absent, foreign, or NULL owner', async () => {
    rows.set('foreign', B);
    rows.set('old', null);
    for (const id of ['absent', 'foreign', 'old']) {
      await expect(requireExistingOwnedSession(id, A))
        .rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
    }
    rows.set('my', A);
    await expect(requireExistingOwnedSession('my', A)).resolves.toBeUndefined();
  });
  it('malformed, hostile, or oversized IDs never become a session key', () => {
    for (const val of ['has\nnewline', ' trailing ', 'z'.repeat(201), {}, 2]) {
      expect(() => normalizedSessionId(val)).toThrow(SessionOwnershipRefusal);
    }
    expect(normalizedSessionId(undefined)).toMatch(/^[a-f0-9-]{36}$/);
  });
});

describe('RF01 F1 source ordering', () => {
  const route = fs.readFileSync(
    path.join(process.cwd(), 'app/api/sovereign/app/maia/list/route.ts'), 'utf8');
  it('acceptance write follows the owner-bound gate and precedes model work', () => {
    const owner = route.indexOf('await ensureOwnedMemberSession(acceptedSessionId, userId!)');
    const store = route.indexOf('await TurnsStore.addExchangeTurn(turnPosture');
    const model = route.indexOf('getMaiaResponse({');
    expect(owner).toBeGreaterThan(0);
    expect(store).toBeGreaterThan(owner);
    expect(model).toBeGreaterThan(store);
  });
  it('both later session paths reuse only the bound session ID', () => {
    expect(route).toContain('ensureSession(acceptedSessionId)');
    expect(route).not.toContain('ensureSession(sessionId)');
  });
});
