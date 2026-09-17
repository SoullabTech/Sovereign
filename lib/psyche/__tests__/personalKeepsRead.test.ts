/**
 * MAIA-MAVEN-T1A · J5-1 — canonical Personal Keep selector falsifiers.
 *
 * This suite pins the repository-earned selection law before it moves out of
 * the Workbench adapter. The database mock records SQL; it does not simulate
 * any guard, so a constitutional claim passes only when the predicate is
 * actually emitted.
 */

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
}));

import {
  searchPersonalKeeps,
  resolvePersonalKeep,
} from '../personalKeepsRead';
import { query } from '@/lib/db/postgres';

const mockQuery = query as jest.MockedFunction<typeof query>;
const MEMBER = '11111111-1111-1111-1111-111111111111';
const KEEP = '22222222-2222-2222-2222-222222222222';

function row(over: Record<string, unknown> = {}) {
  return {
    id: KEEP,
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

const GUARDS: Array<[string, RegExp]> = [
  ['calling member', /member_id\s*=\s*\$1/],
  ['member gesture', /generated_by\s*=\s*'member-gesture'/],
  ['active status', /status\s+IN\s*\(\s*'active'\s*,\s*'still_alive'\s*\)/],
  ['personal scope', /memory_scope\s*=\s*'personal'/],
  ['non-Sanctuary', /posture_at_creation\s+IS\s+DISTINCT\s+FROM\s+'sanctuary'/],
  ['attributed practitioner guard', /NOT\s*\(\s*source_type\s*=\s*'practitioner_observation'\s+AND\s+facilitator_id\s+IS\s+NULL\s*\)/],
];

describe('canonical Personal Keep search', () => {
  it.each(GUARDS)('emits the %s guard', async (_label, pattern) => {
    await searchPersonalKeeps({ memberId: MEMBER });
    expect(lastSql()).toMatch(pattern);
  });

  it('preserves Workbench chronology and ceiling exactly', async () => {
    await searchPersonalKeeps({ memberId: MEMBER });
    expect(lastSql()).toMatch(/ORDER BY\s+kept_at\s+DESC\s+LIMIT\s+200/);
  });

  it('does not make ambient return preference part of explicit member access', async () => {
    await searchPersonalKeeps({ memberId: MEMBER });
    expect(lastSql()).not.toMatch(/return_preference/);
  });

  it('binds free text and date filters without interpolation', async () => {
    await searchPersonalKeeps({
      memberId: MEMBER,
      text: "'; DROP TABLE members; --",
      from: '2026-01-01',
      to: '2026-12-31',
    });
    expect(lastSql()).not.toContain('DROP TABLE');
    expect(lastParams()).toEqual([
      MEMBER,
      "%'; DROP TABLE members; --%",
      '2026-01-01',
      '2026-12-31',
    ]);
  });

  it('returns the domain row without inventing presentation semantics', async () => {
    const keeps = await searchPersonalKeeps({ memberId: MEMBER });
    expect(keeps[0]).toEqual(row());
  });
});

describe('canonical Personal Keep resolve', () => {
  it.each(GUARDS)('emits the %s guard', async (_label, pattern) => {
    await resolvePersonalKeep({ memberId: MEMBER, keepId: KEEP });
    expect(lastSql()).toMatch(pattern);
  });

  it('binds member and keep identity separately', async () => {
    await resolvePersonalKeep({ memberId: MEMBER, keepId: KEEP });
    expect(lastSql()).toMatch(/id\s*=\s*\$2/);
    expect(lastParams()).toEqual([MEMBER, KEEP]);
  });

  it('returns null when no qualifying Keep exists', async () => {
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(resolvePersonalKeep({ memberId: MEMBER, keepId: KEEP })).resolves.toBeNull();
  });
});

describe('selector is read-only', () => {
  it('issues SELECT only', async () => {
    await searchPersonalKeeps({ memberId: MEMBER, text: 'x' });
    await resolvePersonalKeep({ memberId: MEMBER, keepId: KEEP });
    for (const [sql] of mockQuery.mock.calls) {
      expect(String(sql)).toMatch(/^\s*SELECT/);
      expect(String(sql)).not.toMatch(/\b(INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP)\b/i);
    }
  });
});
