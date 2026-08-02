/**
 * Keep source adapter — the guards that make a Workbench card truthful.
 *
 * Mock discipline (load-bearing, mirrors lib/anchor/__tests__/loadRecentAnchors):
 * the db mock only RECORDS calls and returns canned rows UNFILTERED. It never
 * simulates a guard. Every guard claim below is asserted against the SQL text
 * the adapter actually emits, so a test passes only because the predicate
 * really reached the wire — not because a fake row set was pre-filtered.
 *
 * The complementary behavioural proof (real Postgres, real fixtures, verified
 * exclusion and non-mutation) was run against the dev database during the
 * build; these tests pin the wiring so it cannot silently regress.
 *
 * Anchors:
 *   docs/book-studio/WORKBENCH_ARCHITECTURE_v0.md §5, §8
 *   docs/architecture/KEEP_CAPTURE_TO_ATOMS_AUDIT_2026-05-26.md §0, §8
 */

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
}));

import { keepSource } from '../sources/keep';
import { query } from '@/lib/db/postgres';

const mockQuery = query as jest.MockedFunction<typeof query>;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const OTHER_REF = '22222222-2222-2222-2222-222222222222';

function row(over: Record<string, unknown> = {}) {
  return {
    id: OTHER_REF,
    title: 'a kept thing',
    body: 'the body',
    source_type: 'spontaneous',
    status: 'active',
    kept_at: new Date('2026-01-01T00:00:00Z'),
    is_breakthrough: false,
    ...over,
  };
}

function lastSql(): string {
  return mockQuery.mock.calls[mockQuery.mock.calls.length - 1][0] as string;
}
function lastParams(): unknown[] {
  return mockQuery.mock.calls[mockQuery.mock.calls.length - 1][1] as unknown[];
}

beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockResolvedValue({ rows: [row()], rowCount: 1 } as never);
});

// Every guard, asserted against emitted SQL, for BOTH entry points.
const GUARDS: Array<[string, RegExp]> = [
  ['scopes to the calling member', /member_id\s*=\s*\$1/],
  ["admits only member-authored Keeps", /generated_by\s*=\s*'member-gesture'/],
  ['admits only active / still_alive', /status\s+IN\s*\(\s*'active'\s*,\s*'still_alive'\s*\)/],
  ['admits only personal scope', /memory_scope\s*=\s*'personal'/],
  ['excludes sanctuary posture', /posture_at_creation\s+IS\s+DISTINCT\s+FROM\s+'sanctuary'/],
  [
    'excludes unattributed practitioner observations',
    /NOT\s*\(\s*source_type\s*=\s*'practitioner_observation'\s+AND\s+facilitator_id\s+IS\s+NULL\s*\)/,
  ],
];

describe('keep adapter — search()', () => {
  it.each(GUARDS)('%s', async (_label, pattern) => {
    await keepSource.search({ arrangerId: MEMBER });
    expect(lastSql()).toMatch(pattern);
  });

  it('reads the atoms table, and only that table', async () => {
    await keepSource.search({ arrangerId: MEMBER });
    expect(lastSql()).toMatch(/FROM\s+member_memory_atoms/);
  });

  it('passes the member id as a bound parameter, never interpolated', async () => {
    await keepSource.search({ arrangerId: MEMBER });
    expect(lastParams()[0]).toBe(MEMBER);
    expect(lastSql()).not.toContain(MEMBER);
  });

  it('does NOT filter by return_preference — a private atom is private from MAIA, not from its member', async () => {
    await keepSource.search({ arrangerId: MEMBER });
    expect(lastSql()).not.toMatch(/return_preference/);
  });

  it('binds free text rather than concatenating it', async () => {
    await keepSource.search({ arrangerId: MEMBER, text: "'; DROP TABLE members; --" });
    expect(lastSql()).not.toContain('DROP TABLE');
    expect(lastParams()).toContain("%'; DROP TABLE members; --%");
  });

  it('emits cards whose ref is the atom id — the atom is the pointer', async () => {
    const cards = await keepSource.search({ arrangerId: MEMBER });
    expect(cards[0]).toMatchObject({ source: 'keep', ref: OTHER_REF, title: 'a kept thing' });
  });
});

describe('keep adapter — resolve()', () => {
  it.each(GUARDS)('%s', async (_label, pattern) => {
    await keepSource.resolve(OTHER_REF, MEMBER);
    expect(lastSql()).toMatch(pattern);
  });

  it('scopes by member AND id, so another member\'s atom cannot resolve', async () => {
    await keepSource.resolve(OTHER_REF, MEMBER);
    expect(lastSql()).toMatch(/member_id\s*=\s*\$1/);
    expect(lastSql()).toMatch(/id\s*=\s*\$2/);
    expect(lastParams()).toEqual([MEMBER, OTHER_REF]);
  });

  it('returns null when the guarded query matches nothing', async () => {
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as never);
    expect(await keepSource.resolve(OTHER_REF, MEMBER)).toBeNull();
  });

  it('does NOT filter by return_preference', async () => {
    await keepSource.resolve(OTHER_REF, MEMBER);
    expect(lastSql()).not.toMatch(/return_preference/);
  });

  it('surfaces the atom title for display', async () => {
    const r = await keepSource.resolve(OTHER_REF, MEMBER);
    expect(r?.meta.title).toBe('a kept thing');
    expect(r?.content).toBe('the body');
  });
});

describe('keep adapter is read-only — placement must never change meaning', () => {
  it('issues no write statement on any path', async () => {
    await keepSource.search({ arrangerId: MEMBER });
    await keepSource.search({ arrangerId: MEMBER, text: 'x', from: '2026-01-01', to: '2026-12-31' });
    await keepSource.resolve(OTHER_REF, MEMBER);

    expect(mockQuery.mock.calls.length).toBeGreaterThan(0);
    for (const [sql] of mockQuery.mock.calls) {
      expect(String(sql)).not.toMatch(/\b(INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP)\b/i);
      expect(String(sql)).toMatch(/^\s*SELECT/);
    }
  });

  it('never names a mutable consent or surfacing column', async () => {
    await keepSource.search({ arrangerId: MEMBER });
    await keepSource.resolve(OTHER_REF, MEMBER);
    for (const [sql] of mockQuery.mock.calls) {
      expect(String(sql)).not.toMatch(/return_preference|surface_count|last_surfaced_at|is_breakthrough\s*=/);
    }
  });
});
