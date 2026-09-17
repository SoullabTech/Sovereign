/**
 * EAA-03 / P1.2 — the Home Arrival continuity adapter.
 *
 * Mock discipline (mirrors lib/workbench/__tests__/keepSourceAdapter and the
 * LF-SCOPE-01 suite): the db mock RECORDS calls and returns canned rows
 * UNFILTERED. It never simulates a guard. Every eligibility claim is asserted
 * against the SQL the adapter actually emits, so a test passes only because the
 * predicate really reached the wire.
 *
 * The complementary behavioural proof — real PostgreSQL, real fixtures, real
 * inclusion and exclusion, plus a discriminating negative control — is
 * scripts/witness/p1-field-now-eligibility.sql.
 */

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { loadEligibleKeeps, FIELD_NOW_MAX_THREADS } from '../eligibleKeeps';
import { livingFieldAtomGuards } from '@/lib/maia/living-field/atomEligibility';

const mockQuery = query as jest.MockedFunction<typeof query>;
const MEMBER = '11111111-1111-1111-1111-111111111111';

const sql = () => String(mockQuery.mock.calls[0]?.[0] ?? '');
const params = () => (mockQuery.mock.calls[0]?.[1] ?? []) as unknown[];
const flat = (s: string) => s.replace(/\s+/g, ' ');

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as never);
});

describe('P1 continuity · eligibility reaches the wire', () => {
  it('scopes to the current member', async () => {
    await loadEligibleKeeps(MEMBER);
    expect(flat(sql())).toContain('WHERE member_id = $1');
    expect(params()[0]).toBe(MEMBER);
  });

  it('requires explicit Keep formation', async () => {
    await loadEligibleKeeps(MEMBER);
    expect(flat(sql())).toContain('kept_at IS NOT NULL');
  });

  it('reuses the LF-SCOPE-01 boundary rather than restating it', async () => {
    await loadEligibleKeeps(MEMBER);
    // The imported guard, spliced whole — Home and Living Field cannot drift.
    expect(sql()).toContain(livingFieldAtomGuards());
  });

  it('carries the scope and authorship boundary', async () => {
    await loadEligibleKeeps(MEMBER);
    const f = flat(sql());
    expect(f).toContain("memory_scope = 'personal'");
    expect(f).toContain("source_type <> 'practitioner_observation'");
    expect(f).toContain("member_response_status IS DISTINCT FROM 'rejected'");
    expect(f).toContain("posture_at_creation IS DISTINCT FROM 'sanctuary'");
  });

  it('honours return_preference, because Home surfaces material unbidden', async () => {
    await loadEligibleKeeps(MEMBER);
    // member_pulled means "only when the member asks directly". Arriving is not
    // asking for these particular items, so they are excluded here — a stricter
    // posture than Living Field, which the member navigates into deliberately.
    expect(flat(sql())).toContain(
      "return_preference IN ('contextual_doorway', 'ritual_review_opt_in')",
    );
  });

  it('does not surface material the member parked', async () => {
    await loadEligibleKeeps(MEMBER);
    expect(flat(sql())).toContain("status IN ('active', 'still_alive')");
  });

  it('does NOT filter generated_by — historical Keeps remain the member’s own', async () => {
    // P1-D §I: the column defaults to 'unattributed-historical' before
    // 20260718000001, so an allowlist would erase legitimate historical
    // continuity rather than contain unauthorized context.
    await loadEligibleKeeps(MEMBER);
    expect(sql()).not.toContain('generated_by');
  });
});

describe('P1 continuity · ordering and bound', () => {
  it('orders by the member’s own Keep act, with a deterministic tie-break', async () => {
    await loadEligibleKeeps(MEMBER);
    expect(flat(sql())).toContain('ORDER BY kept_at DESC, id DESC');
  });

  it('never ranks by relevance, similarity, score or frequency', async () => {
    await loadEligibleKeeps(MEMBER);
    const f = flat(sql()).toLowerCase();
    for (const forbidden of ['affinity', 'score', 'similarity', 'embedding', 'relevance', 'rank(']) {
      expect(f).not.toContain(forbidden);
    }
  });

  it('asks for at most three', async () => {
    await loadEligibleKeeps(MEMBER);
    expect(flat(sql())).toContain('LIMIT $2');
    expect(params()[1]).toBe(FIELD_NOW_MAX_THREADS);
    expect(FIELD_NOW_MAX_THREADS).toBe(3);
  });

  it('clamps a caller asking for more than three', async () => {
    await loadEligibleKeeps(MEMBER, 50);
    expect(params()[1]).toBe(3);
  });

  it('asks the database nothing when the bound is zero', async () => {
    const out = await loadEligibleKeeps(MEMBER, 0);
    expect(out).toEqual([]);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('zero eligible Keeps is a valid, complete result', async () => {
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as never);
    await expect(loadEligibleKeeps(MEMBER)).resolves.toEqual([]);
  });
});

describe('P1 continuity · independence and read-only-ness', () => {
  it('has no dependency on living_field_affinities, direct or indirect', async () => {
    await loadEligibleKeeps(MEMBER);
    expect(sql()).not.toContain('living_field_affinities');
    expect(sql()).not.toContain('affinity');
  });

  it('emits no write of any kind', async () => {
    await loadEligibleKeeps(MEMBER);
    expect(sql()).not.toMatch(/\b(INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP|CREATE)\b/i);
  });

  it('reads exactly one table', async () => {
    await loadEligibleKeeps(MEMBER);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const tables = flat(sql()).match(/FROM\s+(\w+)/gi) ?? [];
    expect(tables).toEqual(['FROM member_memory_atoms']);
  });

  it('returns only member-authored fields — nothing generated', async () => {
    mockQuery.mockResolvedValue({
      rows: [{ id: 'a', title: 'a thing I kept', source_type: 'journal', kept_at: new Date(0) }],
      rowCount: 1,
    } as never);
    const [row] = await loadEligibleKeeps(MEMBER);
    expect(Object.keys(row).sort()).toEqual(['id', 'keptAt', 'sourceType', 'title']);
    expect(row.title).toBe('a thing I kept');
  });
});
