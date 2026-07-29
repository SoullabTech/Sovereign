/**
 * Account deletion may not claim more than it does.
 *
 * Incident (2026-07-28): the route deleted the `members` row while leaving the
 * member's journal, conversation, episodic and capsule content in place — those
 * tables key on `user_id TEXT` with no FK to `members`, so nothing cascades —
 * and then returned "Account and all associated data permanently deleted".
 *
 * The retention gap is a defect. Telling the member it had been closed when it
 * had not is the incident.
 *
 * WHAT THIS PROVES: no response from this route asserts completeness, and while
 * the containment posture is 'refuse' the route will not produce another
 * owner-orphaned record set.
 * WHAT IT DOES NOT PROVE: that deletion is correct or complete. It is neither.
 * That work is blocked on provenance (see the retention inventory).
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { readFileSync } from 'fs';
import path from 'path';

const ROUTE_REL = 'app/api/members/delete-account/route.ts';
const SRC = readFileSync(path.resolve(__dirname, '../../..', ROUTE_REL), 'utf8');

/** Comments describe the old behaviour verbatim; strip them before asserting. */
const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

describe('the route makes no completeness claim', () => {
  it('never says "all associated data"', () => {
    expect(code).not.toMatch(/all associated data/i);
  });

  it('never pairs "permanently" with "deleted" in a response string', () => {
    // The phrase is only acceptable inside commentary about the old behaviour,
    // which `code` has already removed.
    expect(code).not.toMatch(/permanently deleted/i);
  });

  it('declares the governed content classes the inventory found retained', () => {
    for (const t of [
      'conversation_turns',
      'quick_journal_entries',
      'episodic_memories',
      'reflection_capsules',
    ]) {
      expect({ table: t, declared: code.includes(t) }).toEqual({ table: t, declared: true });
    }
  });

  it('enumerates what it removed rather than asserting totality', () => {
    expect(code).toMatch(/removed:\s*\[/);
  });
});

// ---------------------------------------------------------------------------

const MEMBER = '11111111-1111-4111-8111-111111111111';

const mockResolve = jest.fn<(r: unknown) => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: (r: unknown) => mockResolve(r),
}));

const mockQuery = jest.fn<(sql: string, p?: unknown[]) => Promise<{ rows: unknown[] }>>();
const mockTransaction = jest.fn<(fn: (tx: unknown) => Promise<void>) => Promise<void>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (s: string, p?: unknown[]) => mockQuery(s, p),
  transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
}));
jest.mock('@/lib/auth/serverSessions', () => ({
  __esModule: true,
  clearSessionCookie: async () => {},
}));

function req(body: unknown): any {
  return { json: async () => body, headers: new Headers() };
}

/** username lookup + per-table counts, in the order the route asks. */
function db({ username, counts }: { username: string; counts: Record<string, number> }) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/FROM members/i.test(sql)) return { rows: [{ username }] };
    const m = sql.match(/FROM (\w+)/i);
    const table = m?.[1] ?? '';
    return { rows: [{ n: String(counts[table] ?? 0) }] };
  });
}

describe('containment: refuses rather than orphaning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolve.mockResolvedValue(MEMBER);
    mockTransaction.mockResolvedValue(undefined);
  });

  it('refuses with 409 when governed content exists, and deletes nothing', async () => {
    db({ username: 'kelly', counts: { conversation_turns: 128 } });
    const { POST } = await import('@/app/api/members/delete-account/route');
    const res = await POST(req({ confirmUsername: 'kelly' }));

    expect(res.status).toBe(409);
    expect(mockTransaction).not.toHaveBeenCalled(); // nothing was deleted
    const body: any = await res.json();
    expect(body.retained).toEqual([{ label: 'conversations', rows: 128 }]);
    expect(JSON.stringify(body)).not.toMatch(/all associated data|permanently deleted/i);
  });

  it('a refused request issues no mutating SQL at all', async () => {
    db({ username: 'kelly', counts: { conversation_turns: 1 } });
    const { POST } = await import('@/app/api/members/delete-account/route');
    await POST(req({ confirmUsername: 'kelly' }));

    const statements = mockQuery.mock.calls.map((c) => String(c[0]));
    expect(statements.length).toBeGreaterThan(0);
    for (const sql of statements) {
      expect({ sql, mutating: /\b(DELETE|UPDATE|INSERT|TRUNCATE|DROP)\b/i.test(sql) }).toEqual({
        sql,
        mutating: false,
      });
    }
  });

  it('the refusal states plainly that nothing changed, and gives a next step', async () => {
    db({ username: 'kelly', counts: { conversation_turns: 1 } });
    const { POST } = await import('@/app/api/members/delete-account/route');
    const body: any = await (await POST(req({ confirmUsername: 'kelly' }))).json();

    expect(body.accountChanged).toBe(false);
    expect(body.nextStep).toBe('contact_support');
    expect(body.message).toMatch(/have not been changed/i);
    // Must not imply deletion started, is queued, or is partially done.
    expect(body.message).not.toMatch(/in progress|has begun|started|queued|pending|partial/i);
  });

  it('covers the content classes the retention inventory found retained', async () => {
    // Journal, conversations, episodic and capsule content are the four classes
    // the inventory proved survive account closure. A preflight that cannot see
    // one of them would allow that member to be orphaned.
    for (const table of [
      'conversation_turns',
      'quick_journal_entries',
      'episodic_memories',
      'reflection_capsules',
    ]) {
      jest.clearAllMocks();
      mockResolve.mockResolvedValue(MEMBER);
      mockTransaction.mockResolvedValue(undefined);
      db({ username: 'kelly', counts: { [table]: 1 } });
      const { POST } = await import('@/app/api/members/delete-account/route');
      const res = await POST(req({ confirmUsername: 'kelly' }));
      expect({ table, status: res.status }).toEqual({ table, status: 409 });
      expect({ table, deleted: mockTransaction.mock.calls.length }).toEqual({ table, deleted: 0 });
    }
  });

  it('names every class of retained content, not just the first', async () => {
    db({
      username: 'kelly',
      counts: { conversation_turns: 3, quick_journal_entries: 2, episodic_memories: 1 },
    });
    const { POST } = await import('@/app/api/members/delete-account/route');
    const body: any = await (await POST(req({ confirmUsername: 'kelly' }))).json();
    expect(body.retained.map((r: any) => r.label).sort()).toEqual(
      ['conversations', 'journal entries', 'remembered moments'].sort(),
    );
  });

  it('proceeds when no governed content exists, claiming only what it removed', async () => {
    db({ username: 'kelly', counts: {} });
    const { POST } = await import('@/app/api/members/delete-account/route');
    const res = await POST(req({ confirmUsername: 'kelly' }));

    expect(res.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalled();
    const body: any = await res.json();
    expect(body.removed).toEqual(['account', 'settings', 'sessions', 'credentials']);
    expect(body.message).not.toMatch(/all|everything|permanently/i);
  });

  it('still refuses an unauthenticated caller before counting anything', async () => {
    mockResolve.mockResolvedValue(null);
    const { POST } = await import('@/app/api/members/delete-account/route');
    const res = await POST(req({ confirmUsername: 'kelly' }));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
