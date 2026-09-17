/**
 * LF-SCOPE-01 — Living Field context containment.
 *
 * Mock discipline (load-bearing, mirrors lib/workbench/__tests__/keepSourceAdapter):
 * the db mock only RECORDS calls and returns canned rows UNFILTERED. It never
 * simulates a guard. Every containment claim below is asserted against the SQL
 * text the read path actually emits, so a test passes only because the
 * predicate really reached the wire — not because a fake row set was
 * pre-filtered.
 *
 * Covers ALL THREE read variants of the affinity path, which is the point: a
 * fix that protected the count and left the content reachable through the
 * encounter path would pass a narrower suite than this one.
 *
 *   app/api/maia/living-field/route.ts                        counts + denominator
 *   app/api/maia/living-field/[fieldKey]/gathering/route.ts   member-visible list
 *   lib/maia/living-field/encounterContext.ts                 MAIA cognition
 */

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/authPostureProbe', () => ({ probeAuthPosture: jest.fn() }));
jest.mock('@/lib/consciousness/spiralStatePersistence', () => ({
  loadSpiralState: jest.fn().mockResolvedValue(null),
}));

import { query } from '@/lib/db/postgres';
import { probeAuthPosture } from '@/lib/auth/authPostureProbe';
import { livingFieldAtomGuards } from '../atomEligibility';
import { PRACTITIONER_ATTRIBUTION_GUARD } from '@/lib/maia/memoryAtomsLoader';

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockProbe = probeAuthPosture as jest.MockedFunction<typeof probeAuthPosture>;

const MEMBER = '11111111-1111-1111-1111-111111111111';

/** Every SQL string the path under test put on the wire. */
function emittedSql(): string[] {
  return mockQuery.mock.calls.map((c) => String(c[0]));
}

/** SQL statements that read atoms — the ones containment must reach. */
function atomSql(): string[] {
  return emittedSql().filter((s) => /member_memory_atoms/.test(s));
}

/** Collapse whitespace so assertions survive indentation changes. */
const flat = (s: string) => s.replace(/\s+/g, ' ');

beforeEach(() => {
  jest.clearAllMocks();
  mockProbe.mockReturnValue(MEMBER);
  // Canned rows, deliberately UNFILTERED — see mock discipline above.
  mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as never);
});

// ───────────────────────────────────────────────────────────────────────────
describe('LF-SCOPE-01 · the predicate itself', () => {
  const g = livingFieldAtomGuards('a');

  it('restricts to personal scope — the boundary the canonical loader enforces', () => {
    expect(flat(g)).toContain("a.memory_scope = 'personal'");
  });

  it('excludes practitioner observations, so nothing authored BY a practitioner is shown as a member Keep', () => {
    expect(flat(g)).toContain("a.source_type <> 'practitioner_observation'");
  });

  it('carries the canonical attribution guard verbatim, not a re-derivation of it', () => {
    // Imported symbol — it cannot drift from lib/maia/memoryAtomsLoader.
    expect(g).toContain(PRACTITIONER_ATTRIBUTION_GUARD);
  });

  it('honours a member who rejected an observation about themselves', () => {
    expect(flat(g)).toContain("a.member_response_status IS DISTINCT FROM 'rejected'");
  });

  it('excludes sanctuary-posture material', () => {
    expect(flat(g)).toContain("a.posture_at_creation IS DISTINCT FROM 'sanctuary'");
  });

  it('preserves the pre-existing sacred / protected / archived guards', () => {
    const f = flat(g);
    expect(f).toContain("a.status NOT IN ('protected', 'archived')");
    expect(f).toContain("a.primary_register IS DISTINCT FROM 'sacred_protected'");
    expect(f).toContain("NOT ('sacred_protected' = ANY(a.registers))");
  });

  it('applies the alias to atom columns, and leaves the imported guard unqualified', () => {
    expect(flat(livingFieldAtomGuards())).toContain("memory_scope = 'personal'");
    expect(flat(livingFieldAtomGuards())).not.toContain('a.memory_scope');
    // Unqualified is safe: source_type / facilitator_id exist on no other table
    // in these joins. Qualifying it would fork the imported constant.
    expect(g).toContain("(source_type <> 'practitioner_observation' OR facilitator_id IS NOT NULL)");
  });

  // ── The three deliberate departures, pinned so a later tidy cannot take them ──

  it('does NOT restrict generated_by — that would erase every pre-provenance Keep', () => {
    // generated_by defaults to 'unattributed-historical' (20260718000001), so
    // keep.ts's allowlist would empty the Living Field of historical material.
    expect(g).not.toContain('generated_by');
  });

  it('does NOT filter return_preference — Living Field is a surface the member opens', () => {
    expect(g).not.toContain('return_preference');
  });

  it('keeps status as a denylist, admitting set_aside as it always has', () => {
    expect(g).not.toContain("status IN ('active'");
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('LF-SCOPE-01 · counts (app/api/maia/living-field/route.ts)', () => {
  async function callList() {
    const { GET } = await import('@/app/api/maia/living-field/route');
    return GET({ url: 'http://t/api/maia/living-field' } as never);
  }

  it('counts by JOINing the atoms it counts, so a count cannot exceed what opens', async () => {
    await callList();
    const counting = atomSql().filter((s) => /living_field_affinities/.test(s));
    expect(counting).toHaveLength(1);
    expect(flat(counting[0])).toContain('JOIN member_memory_atoms a ON a.id = lfa.atom_id');
  });

  it('non-personal atoms cannot contribute to a Living Field count', async () => {
    await callList();
    const counting = atomSql().filter((s) => /living_field_affinities/.test(s));
    expect(flat(counting[0])).toContain("a.memory_scope = 'personal'");
  });

  it('practitioner observations cannot contribute to a Living Field count', async () => {
    await callList();
    const counting = atomSql().filter((s) => /living_field_affinities/.test(s));
    expect(flat(counting[0])).toContain("a.source_type <> 'practitioner_observation'");
  });

  it('the denominator is bounded by the same predicate as the numerator', async () => {
    await callList();
    const denom = atomSql().filter((s) => !/living_field_affinities/.test(s));
    expect(denom).toHaveLength(1);
    const f = flat(denom[0]);
    expect(f).toContain("memory_scope = 'personal'");
    expect(f).toContain("source_type <> 'practitioner_observation'");
    expect(f).toContain("member_response_status IS DISTINCT FROM 'rejected'");
  });

  it('every atom-reading statement on this path carries the full predicate', async () => {
    await callList();
    const reads = atomSql();
    expect(reads.length).toBeGreaterThan(0);
    for (const sql of reads) {
      const f = flat(sql);
      expect(f).toContain("memory_scope = 'personal'");
      expect(f).toContain("source_type <> 'practitioner_observation'");
      expect(f).toContain("posture_at_creation IS DISTINCT FROM 'sanctuary'");
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('LF-SCOPE-01 · gathered content (gathering route)', () => {
  async function callGathering() {
    const { GET } = await import('@/app/api/maia/living-field/[fieldKey]/gathering/route');
    return GET({ url: 'http://t/g' } as never, { params: { fieldKey: 'relationships' } });
  }

  it('non-personal atoms cannot appear in gathered results', async () => {
    await callGathering();
    const listing = atomSql().filter((s) => /living_field_affinities/.test(s));
    expect(listing).toHaveLength(1);
    expect(flat(listing[0])).toContain("a.memory_scope = 'personal'");
  });

  it('practitioner observations cannot appear under "Keeps you have held"', async () => {
    await callGathering();
    const listing = atomSql().filter((s) => /living_field_affinities/.test(s));
    expect(flat(listing[0])).toContain("a.source_type <> 'practitioner_observation'");
    expect(listing[0]).toContain(PRACTITIONER_ATTRIBUTION_GUARD);
  });

  it('every atom-reading statement on this path carries the full predicate', async () => {
    await callGathering();
    const reads = atomSql();
    expect(reads.length).toBe(2); // gathered list + denominator
    for (const sql of reads) {
      const f = flat(sql);
      expect(f).toContain("memory_scope = 'personal'");
      expect(f).toContain("member_response_status IS DISTINCT FROM 'rejected'");
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('LF-SCOPE-01 · MAIA cognition (encounterContext)', () => {
  it('out-of-scope and practitioner material cannot reach the encounter context', async () => {
    const { buildEncounterContext } = await import('../encounterContext');
    await buildEncounterContext(MEMBER, 'relationships');

    const listing = atomSql().filter((s) => /living_field_affinities/.test(s));
    expect(listing).toHaveLength(1);
    const f = flat(listing[0]);
    expect(f).toContain("a.memory_scope = 'personal'");
    expect(f).toContain("a.source_type <> 'practitioner_observation'");
    expect(f).toContain("a.member_response_status IS DISTINCT FROM 'rejected'");
    expect(f).toContain("a.posture_at_creation IS DISTINCT FROM 'sanctuary'");
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('LF-SCOPE-01 · containment is read-only', () => {
  it('no read path emits a write, and affinity rows are never mutated', async () => {
    const { GET: listGet } = await import('@/app/api/maia/living-field/route');
    await listGet({ url: 'http://t/l' } as never);
    const { GET: gatherGet } = await import('@/app/api/maia/living-field/[fieldKey]/gathering/route');
    await gatherGet({ url: 'http://t/g' } as never, { params: { fieldKey: 'relationships' } });
    const { buildEncounterContext } = await import('../encounterContext');
    await buildEncounterContext(MEMBER, 'relationships');

    for (const sql of emittedSql()) {
      expect(sql).not.toMatch(/\b(INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP|CREATE)\b/i);
    }
  });

  it('an excluded atom is filtered at read time, never altered or removed', () => {
    // The predicate is a WHERE clause and nothing else: no row is rewritten,
    // no affinity is deleted, and the atom stays reachable everywhere it was
    // legitimately reachable before.
    const g = livingFieldAtomGuards('a');
    expect(g).not.toMatch(/\b(INSERT|UPDATE|DELETE)\b/i);
  });
});
