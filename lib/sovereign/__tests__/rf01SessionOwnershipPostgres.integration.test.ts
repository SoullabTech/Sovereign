/**
 * RF01 S0-A2 physical PostgreSQL 16 qualification, invented members only.
 * Run solely against the disposable local Docker loopback fixture.
 */
import { describe, it, expect, afterAll, beforeAll } from '@jest/globals';
import { query, closePool } from '@/lib/db/postgres';
import {
  ensureOwnedMemberSession, ensureGuestSession,
  requireExistingOwnedSession,
} from '../memberSessionOwnership';
import { getSessionContinuityWindow, addConversationExchange } from '../sessionManager';
import { finalizeSession } from '../sessionFinalizer';
import { TurnsStore, ExchangeIdentityConflict } from '@/lib/memory/stores/TurnsStore';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const u = new URL(process.env.DATABASE_URL || 'postgresql://invalid:invalid@localhost/');
if (process.env.RF01_A2_PG16 !== '1' ||
    u.hostname !== '127.0.0.1' || u.port !== '55470' ||
    u.pathname !== '/rf01_a2_fixture' || u.username !== 'rf01') {
  throw new Error('RF01 A2 refuses non-fictional PostgreSQL connection');
}

beforeAll(async () => {
  const version = await query<{ db: string; v: number }>(
    "SELECT current_database() AS db, current_setting('server_version_num')::integer AS v",
  );
  expect(version.rows[0]?.db).toBe('rf01_a2_fixture');
  expect(version.rows[0]?.v).toBeGreaterThanOrEqual(160000);
});
afterAll(async () => { await closePool(); });

describe('RF01 A2 PostgreSQL ownership and content isolation', () => {
  it('authoritatively reopens an owned session', async () => {
    expect((await ensureOwnedMemberSession('owned-a', A)).id).toBe('owned-a');
    await expect(requireExistingOwnedSession('owned-a', A)).resolves.toBeUndefined();
  });
  it('refuses cross-member session claiming without changing its owner', async () => {
    await expect(ensureOwnedMemberSession('owned-b', A))
      .rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
    const r = await query<{ member_id: string }>(
      'SELECT member_id FROM maia_sessions WHERE id=$1', ['owned-b'],
    );
    expect(r.rows[0].member_id).toBe(B);
  });
  it('legacy NULL-owner session is not claimed by a member', async () => {
    await expect(ensureOwnedMemberSession('legacy-null', A))
      .rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
    const r = await query<{ member_id: string | null }>(
      'SELECT member_id FROM maia_sessions WHERE id=$1', ['legacy-null'],
    );
    expect(r.rows[0].member_id).toBeNull();
  });
  it('concurrent conflicting creators produce one permanent owner', async () => {
    const results = await Promise.allSettled([
      ensureOwnedMemberSession('fresh-race-a2', A),
      ensureOwnedMemberSession('fresh-race-a2', B),
    ]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
    const q = await query<{ member_id: string }>(
      'SELECT member_id FROM maia_sessions WHERE id=$1', ['fresh-race-a2'],
    );
    expect([A, B]).toContain(q.rows[0].member_id);
  });
  it('guest cannot enter a member session, member cannot adopt a guest', async () => {
    await expect(ensureGuestSession('owned-a'))
      .rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
    expect((await ensureGuestSession('guest-1')).id).toBe('guest-1');
    await expect(ensureOwnedMemberSession('guest-1', A))
      .rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
  });
  it('owner-scoped continuity excludes B turns incorrectly filed under A session', async () => {
    const window = await getSessionContinuityWindow('owned-a', 10);
    // This fixture also exercises permitted later A writes; don't assume
    // history has only its original pair when the suite is rerun.
    expect(window.exchanges.some(x => x.userMessage === 'RF01_A_QUESTION')).toBe(true);
    expect(JSON.stringify(window)).not.toContain('RF01_B_SHOULD_NOT_APPEAR');
  });
  it('foreign actor cannot append JSONB history or turn rows under owner A', async () => {
    const before = await query<{ conversation_history: unknown }>(
      'SELECT conversation_history FROM maia_sessions WHERE id=$1', ['owned-a'],
    );
    const countBefore = await query<{ n: string }>(
      'SELECT COUNT(*)::text AS n FROM conversation_turns',
    );
    await expect(addConversationExchange('owned-a', 'INJECTED_B', 'NO', {
      userId: B, exchangeId: '33333333-3333-4333-8333-333333333333',
    })).rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
    const after = await query<{ conversation_history: unknown }>(
      'SELECT conversation_history FROM maia_sessions WHERE id=$1', ['owned-a'],
    );
    const countAfter = await query<{ n: string }>(
      'SELECT COUNT(*)::text AS n FROM conversation_turns',
    );
    expect(after.rows[0].conversation_history).toEqual(before.rows[0].conversation_history);
    expect(countAfter.rows[0].n).toBe(countBefore.rows[0].n);
  });
  it('protected finalization cannot erase earlier ordinary turns', async () => {
    const countBefore = await query<{ n: string }>(
      'SELECT COUNT(*)::text AS n FROM conversation_turns WHERE session_id=$1', ['owned-a'],
    );
    const result = await finalizeSession({
      memberId: A, sessionId: 'owned-a', isSanctuary: true,
    });
    expect(result).toMatchObject({ ok: false, sanctuary: true });
    const countAfter = await query<{ n: string }>(
      'SELECT COUNT(*)::text AS n FROM conversation_turns WHERE session_id=$1', ['owned-a'],
    );
    expect(countAfter.rows[0].n).toBe(countBefore.rows[0].n);
  });
  it('foreign finalization refuses before any delete or status change', async () => {
    const before = await query<{ status: string }>(
      'SELECT status FROM maia_sessions WHERE id=$1', ['owned-b'],
    );
    await expect(finalizeSession({
      memberId: A, sessionId: 'owned-b', isSanctuary: true,
    })).rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
    const after = await query<{ status: string }>(
      'SELECT status FROM maia_sessions WHERE id=$1', ['owned-b'],
    );
    expect(after.rows[0].status).toBe(before.rows[0].status);
  });
});

describe('RF01 PostgreSQL 16 exact exchange custody', () => {
  const posture = TurnPosture.resolve({ sanctuary: false });
  const exchangeId = '44444444-4444-4444-8444-444444444444';
  it('accepts one early member half and dedupes the identical retry', async () => {
    const entry = {
      userId: A, sessionId: 'owned-a', role: 'user' as const,
      content: 'RF01_EXACT_MEMBER_TURN', exchangeId,
    };
    expect(await TurnsStore.addExchangeTurn(posture, entry)).toBe(true);
    expect(await TurnsStore.addExchangeTurn(posture, entry)).toBe(true);
    const r = await query<{ n: string }>(
      'SELECT COUNT(*)::text AS n FROM conversation_turns WHERE exchange_id = $1 AND seq = 0',
      [exchangeId],
    );
    expect(r.rows[0].n).toBe('1');
  });
  it('refuses another member using the same exchange ID', async () => {
    await expect(TurnsStore.addExchangeTurn(posture, {
      userId: B, sessionId: 'owned-b', role: 'user',
      content: 'RF01_EXACT_MEMBER_TURN', exchangeId,
    })).rejects.toBeInstanceOf(ExchangeIdentityConflict);
  });
  it('refuses changed content under the same member/session/exchange', async () => {
    await expect(TurnsStore.addExchangeTurn(posture, {
      userId: A, sessionId: 'owned-a', role: 'user',
      content: 'RF01_DIFFERENT_MEMBER_TURN', exchangeId,
    })).rejects.toBeInstanceOf(ExchangeIdentityConflict);
  });
  it('persists the assistant half once and matches an exact retry', async () => {
    const reply = {
      userId: A, sessionId: 'owned-a', role: 'assistant' as const,
      content: 'RF01_EXACT_ASSISTANT_TURN', exchangeId,
    };
    expect(await TurnsStore.addExchangeTurn(posture, reply)).toBe(true);
    expect(await TurnsStore.addExchangeTurn(posture, reply)).toBe(true);
    const r = await query<{ n: string }>(
      'SELECT COUNT(*)::text AS n FROM conversation_turns WHERE exchange_id = $1 AND seq = 1',
      [exchangeId],
    );
    expect(r.rows[0].n).toBe('1');
  });
  it('pair writer refuses a duplicate ID belonging to another session', async () => {
    const pairId = '55555555-5555-4555-8555-555555555555';
    await TurnsStore.addExchange(posture, A, 'owned-a',
      'RF01_PAIR_MEMBER', 'RF01_PAIR_ASSISTANT', pairId);
    await expect(TurnsStore.addExchange(posture, B, 'owned-b',
      'RF01_PAIR_MEMBER', 'RF01_PAIR_ASSISTANT', pairId))
      .rejects.toBeInstanceOf(ExchangeIdentityConflict);
    const r = await query<{ n: string }>(
      'SELECT COUNT(*)::text AS n FROM conversation_turns WHERE exchange_id = $1',
      [pairId],
    );
    expect(r.rows[0].n).toBe('2');
  });
});

describe('RF01 session lifecycle safety', () => {
  it('does not reopen an already-completed authenticated session', async () => {
    await query("UPDATE maia_sessions SET status = 'completed' WHERE id = $1", ['owned-b']);
    try {
      await expect(ensureOwnedMemberSession('owned-b', B))
        .rejects.toMatchObject({ code: 'SESSION_NOT_OWNED' });
    } finally {
      await query("UPDATE maia_sessions SET status = 'active' WHERE id = $1", ['owned-b']);
    }
  });
});
