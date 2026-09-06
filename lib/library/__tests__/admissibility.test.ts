/**
 * HOUSE-SOURCE ADMISSIBILITY — acceptance tests.
 *
 * Two of these are RELEASE BLOCKERS by founder ruling (2026-08-11): if either
 * fails, the mechanism is BROKEN, not PARTIAL.
 *
 *   A. checksum change revokes effective admission
 *   B. the full-text fallback obeys the same admission gate
 *
 * The gate is enforced in SQL, so these tests assert on the SQL actually handed
 * to the driver. That is deliberate: a test that mocked the gate away would pass
 * while the gate rotted. Here, deleting the join from either read path fails a
 * test.
 */

import {
  admissionGateJoin,
  isAdmissibilityState,
  isAdmissionScope,
  isUseConstraint,
  ADMISSIBILITY_STATES,
  ADMISSION_SCOPES,
  USE_CONSTRAINTS,
  DEFAULT_ADMISSION_SCOPE,
  DEFAULT_USE_CONSTRAINT,
} from '../admissibility';

// ── capture every SQL statement the service issues ───────────────────────────
const issued: Array<{ sql: string; params: any[] }> = [];

jest.mock('@/lib/database/postgres', () => ({
  query: jest.fn(async (sql: string, params: any[] = []) => {
    issued.push({ sql, params });
    return [];
  }),
  queryOne: jest.fn(async () => null),
  transaction: jest.fn(async (fn: any) => fn({ query: jest.fn(async () => []) })),
}));

jest.mock('@/lib/memory/embeddings', () => ({
  generateLocalEmbedding: jest.fn(async () => new Array(768).fill(0.01)),
}));

jest.mock('@/lib/ai/kimiClient', () => ({
  generateWithKimi: jest.fn(async () => ''),
  isKimiAvailable: jest.fn(() => false),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { libraryService } = require('../LibraryService');

const retrievalSql = () =>
  issued.filter(q => /FROM library_chunks c/i.test(q.sql));
const semanticSql = () =>
  retrievalSql().filter(q => /c\.embedding <=>/i.test(q.sql));
const fullTextSql = () =>
  retrievalSql().filter(q => /content_tsv/i.test(q.sql));

beforeEach(() => { issued.length = 0; });

// ─────────────────────────────────────────────────────────────────────────────
describe('admission gate — SQL semantics', () => {
  const join = admissionGateJoin('$3');

  it('A (RELEASE BLOCKER): binds the admission to the exact content version', () => {
    // This single line is what makes "a changed source does not inherit prior
    // admission" structural. If the checksum equality is removed, an admission
    // silently carries forward onto different content.
    expect(join).toMatch(/a\.source_checksum\s*=\s*s\.checksum/);
  });

  it('only an "admitted" judgment opens the gate', () => {
    expect(join).toMatch(/a\.admissibility_state\s*=\s*'admitted'/);
  });

  it('consults only the LATEST judgment, so a later reversal supersedes', () => {
    expect(join).toMatch(/MAX\(a2\.version\)/i);
    expect(join).toMatch(/a2\.scope\s*=\s*a\.scope/);
  });

  it('D: scope is bound as a parameter, never interpolated', () => {
    expect(join).toContain('a.scope = $3');
    expect(admissionGateJoin('$7')).toContain('a.scope = $7');
    // No scope literal may be baked in — that would let one scope satisfy another.
    expect(join).not.toContain("a.scope = 'member_wisdom_retrieval'");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('searchAdmitted — both retrieval paths', () => {
  it('B (RELEASE BLOCKER): semantic AND full-text fallback are gated identically', async () => {
    await libraryService.searchAdmitted('jung individuation');

    const sem = semanticSql();
    const ft = fullTextSql();

    // The fallback only fires because the mocked driver returns no rows — which
    // is exactly the real-world condition under which an ungated fallback would
    // go unnoticed.
    expect(sem.length).toBeGreaterThan(0);
    expect(ft.length).toBeGreaterThan(0);

    for (const q of [...sem, ...ft]) {
      expect(q.sql).toMatch(/JOIN library_source_admissions a/);
      expect(q.sql).toMatch(/a\.source_checksum\s*=\s*s\.checksum/);
      expect(q.sql).toMatch(/a\.admissibility_state\s*=\s*'admitted'/);
      expect(q.params).toContain(DEFAULT_ADMISSION_SCOPE);
    }
  });

  it('C: the universal ownership invariant still applies on the admitted path', async () => {
    await libraryService.searchAdmitted('anything');
    for (const q of retrievalSql()) {
      expect(q.sql).toMatch(/s\.practitioner_member_id IS NULL/);
      expect(q.sql).toMatch(/s\.vault_file_id IS NULL/);
      expect(q.sql).toMatch(/s\.field_slug IS NULL/);
    }
    // Two boundaries, both present, neither substituting for the other.
  });

  it('C: an unrecognised scope fails closed rather than widening eligibility', async () => {
    const res = await libraryService.searchAdmitted('x', { scope: 'some_other_surface' as any });
    expect(res.chunks).toEqual([]);
    expect(retrievalSql()).toHaveLength(0); // never reached the database
  });

  it('placeholder indices stay correct when sourceTypes is also bound', async () => {
    // Regression guard: sourceTypes used to be hard-coded to $2. Adding the scope
    // parameter would silently mis-bind if indices were not computed.
    await libraryService.searchAdmitted('x', { sourceTypes: ['book'] });
    for (const q of retrievalSql()) {
      const scopeIdx = q.params.indexOf(DEFAULT_ADMISSION_SCOPE) + 1;
      expect(scopeIdx).toBeGreaterThan(0);
      expect(q.sql).toContain(`a.scope = $${scopeIdx}`);
      const typesIdx = q.params.findIndex(p => Array.isArray(p) && p[0] === 'book') + 1;
      expect(q.sql).toContain(`s.type = ANY($${typesIdx})`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('search() — the unrestricted path is unchanged', () => {
  it('does NOT apply the admission gate (admin/ingest/audit read the whole corpus)', async () => {
    await libraryService.search('jung individuation');
    const all = retrievalSql();
    expect(all.length).toBeGreaterThan(0);
    for (const q of all) {
      expect(q.sql).not.toMatch(/library_source_admissions/);
      // …but the safety invariant is never optional.
      expect(q.sql).toMatch(/s\.practitioner_member_id IS NULL/);
    }
  });

  it('exposes no admittedOnly flag — the member path must select by name', () => {
    // A flag can be forgotten at the wire site; a separate method cannot be
    // reached by omission.
    expect(typeof libraryService.searchAdmitted).toBe('function');
    expect(libraryService.search.length).toBeLessThanOrEqual(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('governed vocabularies', () => {
  it('defaults fail safe', () => {
    expect(DEFAULT_USE_CONSTRAINT).toBe('synthesis_only'); // most restrictive
    expect(DEFAULT_ADMISSION_SCOPE).toBe('member_wisdom_retrieval');
  });

  it('v1 vocabularies are exactly as ruled', () => {
    expect([...ADMISSIBILITY_STATES]).toEqual(['unreviewed', 'admitted', 'excluded', 'superseded']);
    expect([...ADMISSION_SCOPES]).toEqual(['member_wisdom_retrieval']);
    expect([...USE_CONSTRAINTS]).toEqual(['synthesis_only', 'synthesis_and_short_quote', 'unrestricted']);
  });

  it('validators reject unknown values (no folklore variants)', () => {
    expect(isAdmissionScope('member_wisdom')).toBe(false);
    expect(isAdmissionScope('member-wisdom-retrieval')).toBe(false);
    expect(isUseConstraint('unlimited')).toBe(false);
    expect(isAdmissibilityState('approved')).toBe(false);
    expect(isAdmissibilityState('admitted')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('E: automation cannot self-admit (writer contract)', () => {
  const routeSrc = require('fs').readFileSync(
    require('path').join(process.cwd(), 'app/api/founder/library-admissions/route.ts'),
    'utf-8'
  );

  it('requires a founder session before anything else', () => {
    expect(routeSrc).toMatch(/requireFounder\(\)/);
    expect(routeSrc).toMatch(/status:\s*auth\.status/);
  });

  it('derives admitted_by from the session and REJECTS a body-supplied value', () => {
    expect(routeSrc).toMatch(/auth\.memberId/);
    expect(routeSrc).toMatch(/'admitted_by'.*'admitted_at'.*'source_checksum'.*'version'/s);
    expect(routeSrc).toMatch(/may not be supplied/);
  });

  it('F: reads source_checksum server-side rather than trusting the caller', () => {
    expect(routeSrc).toMatch(/s\.checksum/);
  });

  it('F: refuses to admit without a human-entered admitted_title', () => {
    // Never defaults from library_sources.title — D3 measured that field as
    // H1-derived, which is how a transcript came to be titled like a book.
    expect(routeSrc).toMatch(/admitted_title is required when admitting/);
    expect(routeSrc).not.toMatch(/admitted_title\s*=\s*s\.title/);
  });

  it('is the only writer of the table in the repo', () => {
    const { execSync } = require('child_process');
    const hits = execSync(
      `grep -rIl "INSERT INTO library_source_admissions" --include=*.ts --include=*.sql . ` +
      `| grep -v node_modules | grep -v "/.claude/worktrees/" | grep -v __tests__ || true`,
      { encoding: 'utf-8', cwd: process.cwd() }
    ).trim().split('\n').filter(Boolean);
    expect(hits).toEqual(['./app/api/founder/library-admissions/route.ts']);
  });
});
