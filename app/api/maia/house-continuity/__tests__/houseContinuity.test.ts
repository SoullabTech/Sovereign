/**
 * House continuity — member-view channel, pinned at the wire.
 *
 * MLX-06 Unit 1. These tests characterize what the endpoint ACTUALLY emits to
 * Postgres and what it returns, not what we intend it to do.
 *
 * Mock discipline (load-bearing, mirroring lib/anchor/__tests__): the db mock
 * only RECORDS calls and returns canned rows UNFILTERED — it never simulates a
 * scope, status or sanctuary gate. Every boundary claim below is therefore
 * asserted against the captured SQL the route really emits, so a removed
 * predicate fails the test rather than being masked by a helpful mock.
 *
 * Constitutional anchors:
 *   - two-channel rule (MLX-01 §6.2): this is the MEMBER-VIEW channel; it must
 *     not consult or mutate return_preference / surface_preference, which
 *     govern what MAIA receives.
 *   - Sanctuary invariants (CLAUDE.md): sanctuary sessions never enter
 *     continuity.
 *   - memory_scope containment (20260630000005): client/encounter atoms are
 *     never personal-House material.
 */

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/serverSessions', () => ({ getCurrentSession: jest.fn() }));

import { GET } from '../route';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockSession = getCurrentSession as jest.MockedFunction<typeof getCurrentSession>;

const MEMBER = '11111111-2222-3333-4444-555555555555';
const sql = () => mockQuery.mock.calls.map((c) => String(c[0]));
const allSql = () => sql().join('\n---\n');

beforeEach(() => {
  jest.clearAllMocks();
  mockSession.mockResolvedValue({ memberId: MEMBER } as any);
  mockQuery.mockResolvedValue({ rows: [] } as any);
});

describe('auth', () => {
  it('refuses without a session and touches the database not at all', async () => {
    mockSession.mockResolvedValue(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('consent boundaries, asserted at the wire', () => {
  it('excludes sanctuary sessions from Continue', async () => {
    await GET();
    const sessionQuery = sql().find((s) => s.includes('maia_sessions'))!;
    expect(sessionQuery).toMatch(/privacy_mode\s*<>\s*'sanctuary'/);
  });

  it('shows only personal-scope atoms — never client or encounter material', async () => {
    await GET();
    const atomQueries = sql().filter((s) => s.includes('member_memory_atoms'));
    expect(atomQueries.length).toBeGreaterThan(0);
    for (const q of atomQueries) expect(q).toMatch(/memory_scope\s*=\s*'personal'/);
  });

  it('shows only active atoms — archived and protected are not ambient', async () => {
    await GET();
    for (const q of sql().filter((s) => s.includes('member_memory_atoms'))) {
      expect(q).toMatch(/status\s*=\s*'active'/);
    }
  });

  it('scopes every read to the authenticated member', async () => {
    await GET();
    expect(mockQuery).toHaveBeenCalledTimes(3);
    for (const call of mockQuery.mock.calls) {
      expect(String(call[0])).toMatch(/member_id\s*=\s*\$1/);
      expect((call[1] as unknown[])[0]).toBe(MEMBER);
    }
  });

  it('does NOT consult the MAIA-prompt consent gates (two-channel rule)', async () => {
    await GET();
    expect(allSql()).not.toMatch(/return_preference|surface_preference/);
  });

  it('writes nothing', async () => {
    await GET();
    expect(allSql()).not.toMatch(/\b(INSERT|UPDATE|DELETE)\b/i);
  });
});

describe('evidence gating', () => {
  it('returns an empty world for a member with nothing — not a placeholder', async () => {
    const res = await GET();
    const body = await res.json();
    expect(body).toMatchObject({ success: true, continue: null, kept: [], keptTotal: 0 });
  });

  it('returns the member’s own titles verbatim when they exist', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 's1', started_at: 'A', last_activity_at: 'B' }] } as any)
      .mockResolvedValueOnce({
        rows: [{ id: 'a1', title: 'the moment it turns', is_breakthrough: true, created_at: 'C' }],
      } as any)
      .mockResolvedValueOnce({ rows: [{ n: 7 }] } as any);
    const body = await (await GET()).json();
    expect(body.continue).toEqual({ sessionId: 's1', startedAt: 'A', lastActivityAt: 'B' });
    expect(body.kept).toEqual([
      { id: 'a1', title: 'the moment it turns', isBreakthrough: true, createdAt: 'C' },
    ]);
    expect(body.keptTotal).toBe(7);
  });
});

describe('degradation', () => {
  it('still opens the House when continuity cannot be read', async () => {
    mockQuery.mockRejectedValue(new Error('db down'));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, continue: null, kept: [], keptTotal: 0 });
  });
});
