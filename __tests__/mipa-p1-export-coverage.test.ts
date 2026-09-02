/**
 * MIPA PHASE 0 — P1 CERTIFICATION: THE MEMBER CAN OBTAIN THEIR OWN CORPUS
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P1
 *
 *   Machine access to memory must not exceed member sovereignty over memory.
 *
 * The invariant: for every table from which MIPA may retrieve, the member can
 * obtain their own rows. **No class may be retrieval-eligible that is not
 * export-covered.**
 *
 * ── WHAT THE TOPOLOGY ESTABLISHED ───────────────────────────────────────────
 *
 * A source-derived scan of member-scoped SELECTs across the memory modules
 * (`lib/maia`, `lib/memory`, `lib/anchor`, `lib/psyche`), filtered against the
 * real schema, finds **37 tables** holding member-scoped material. The export
 * covers **five**.
 *
 * And one of the five did not work.
 *
 * ── THE DEFECT THIS SUITE LOCKS ─────────────────────────────────────────────
 *
 * The `developmental_memories` export query named FIVE columns that do not
 * exist — `event_type`, `cognitive_level`, `intensity`, `content`,
 * `created_at`. It threw on every call, and a `.catch(() => ({ rows: [] }))`
 * written for a MISSING TABLE silently swallowed a BROKEN QUERY.
 *
 * The member downloaded `maia-data-export-<date>.json` containing
 * `"memories": []` and had no way to tell the section was empty because the
 * query failed rather than because they had nothing.
 *
 * **An export that silently omits is worse than one that openly does not
 * cover.** The first is a false claim about the member's own record — the
 * exact failure mode this whole programme exists to refuse, occurring in the
 * one surface whose entire purpose is to tell the member the truth about what
 * is held.
 *
 * ── SCOPE, STATED NARROWLY (R23 precedent) ──────────────────────────────────
 *
 * This suite certifies that (a) every column the export names EXISTS, so no
 * section can fail silently again, and (b) a failed section is REPORTED rather
 * than rendered empty. It does **not** certify that all 37 tables are covered
 * — they are not. §4 pins the gap as a quantified, visible obligation rather
 * than allowing it to be forgotten.
 */

import * as fs from 'fs';
import * as path from 'path';

const REPO = path.resolve(__dirname, '..');
const ROUTE = path.join(REPO, 'app/api/members/export-data/route.ts');
const BASELINE = path.join(REPO, 'database/baseline/0001_baseline_2026-09-01.sql');
const MIGRATIONS = path.join(REPO, 'database/migrations');

const route = () => fs.readFileSync(ROUTE, 'utf8');

/**
 * The route source with comments stripped.
 *
 * Required because the repair's own docblock QUOTES the defective pattern
 * (`.catch(() => ({ rows: [] }))`) in order to explain it — and a scan over raw
 * source reads that explanation as the defect. That is the innocent-lookalike
 * failure, now seen enough times across this programme to be a standing hazard:
 * a gate must never fire on the prose describing what it forbids.
 */
const routeCode = () =>
  route()
    .split('\n')
    .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
    .join('\n');

/** Columns of one table, from the baseline DDL plus later ALTERs. */
function columnsOf(table: string): Set<string> {
  const sql = fs.readFileSync(BASELINE, 'utf8');
  const m = sql.match(
    new RegExp(`CREATE TABLE (?:IF NOT EXISTS )?"public"\\."${table}" \\(([\\s\\S]*?)\\n\\);`),
  );
  const cols = new Set<string>();
  if (m) for (const c of m[1].matchAll(/^\s*"([a-z0-9_]+)"\s+/gm)) cols.add(c[1]);
  for (const f of fs.readdirSync(MIGRATIONS).filter((x) => x.endsWith('.sql'))) {
    const body = fs.readFileSync(path.join(MIGRATIONS, f), 'utf8');
    for (const a of body.matchAll(
      new RegExp(`ALTER TABLE\\s+(?:"?public"?\\.)?"?${table}"?([\\s\\S]*?);`, 'gi'),
    )) {
      for (const c of a[1].matchAll(/ADD COLUMN\s+(?:IF NOT EXISTS\s+)?"?([a-z0-9_]+)"?/gi)) {
        cols.add(c[1]);
      }
    }
  }
  return cols;
}

/** Every `SELECT … FROM <table>` in the export route, with its named columns. */
function exportQueries(): Array<{ table: string; columns: string[] }> {
  const src = route();
  const out: Array<{ table: string; columns: string[] }> = [];
  for (const m of src.matchAll(/`SELECT([\s\S]*?)FROM\s+([a-z_][a-z0-9_]*)/g)) {
    const cols = m[1]
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .map((c) => {
        // strip aliases and expressions: keep a bare identifier only
        const bare = c.split(/\s+as\s+/i)[0].trim();
        return /^[a-z_][a-z0-9_]*$/.test(bare) ? bare : '';
      })
      .filter(Boolean);
    out.push({ table: m[2], columns: cols });
  }
  return out;
}

const queries = exportQueries();

// ── §0 — META-INVARIANT: the instrument found its subject ────────────────────

describe('P1 §0 — the instrument found its subject', () => {
  it('discovers a nonzero number of export queries', () => {
    // Zero would make every column assertion below vacuous.
    expect(queries.length).toBeGreaterThan(3);
    expect(queries.map((q) => q.table)).toContain('developmental_memories');
  });

  it('the schema reader returns real columns', () => {
    const cols = columnsOf('developmental_memories');
    expect(cols.size).toBeGreaterThan(10);
    expect(cols.has('content_text')).toBe(true);
  });
});

// ── §1 — no export column may be fictional ───────────────────────────────────

describe('P1 §1 — every column the export names exists in the schema', () => {
  it.each(queries.map((q) => [q.table, q.columns] as const))(
    '%s — all named columns exist',
    (table, columns) => {
      const real = columnsOf(table);
      if (real.size === 0) return; // table not in the parsed DDL; not this suite's claim
      const fictional = columns.filter((c) => !real.has(c));
      // A fictional column throws at runtime. Behind a catch, it throws
      // SILENTLY — which is how `"memories": []` reached members for months.
      expect({ table, fictional }).toEqual({ table, fictional: [] });
    },
  );

  it('the specific five that were fictional are gone', () => {
    const dm = queries.find((q) => q.table === 'developmental_memories');
    expect(dm).toBeDefined();
    for (const dead of ['event_type', 'cognitive_level', 'intensity', 'content', 'created_at']) {
      expect({ column: dead, named: dm!.columns.includes(dead) })
        .toEqual({ column: dead, named: false });
    }
    // and the real ones are named
    expect(dm!.columns).toContain('content_text');
    expect(dm!.columns).toContain('memory_type');
  });
});

// ── §2 — a failed section is reported, never silently empty ──────────────────

describe('P1 §2 — silence is not an acceptable failure mode', () => {
  it('no catch renders a failed query as an empty section', () => {
    // The blanket `.catch(() => ({ rows: [] }))` is the defect: it converts a
    // failure into a claim ("you have none").
    expect(routeCode()).not.toMatch(/\.catch\(\(\)\s*=>\s*\(\{\s*rows:\s*\[\]\s*\}\)\)/);
  });

  it('a failed developmental-memory read surfaces an explicit error to the member', () => {
    const src = route();
    expect(src).toMatch(/memoriesError/);
    expect(src).toMatch(/INCOMPLETE/);
    // The message must say WHY it is empty, not merely that something failed.
    expect(src).toMatch(/not empty because you have no developmental memories/);
  });

  it('the failure is distinguishable from genuine emptiness', () => {
    // `null` rows = failed; `[]` = genuinely none. Collapsing them is the bug.
    expect(routeCode()).toMatch(/memoriesResult\.rows \?\? \[\]/);
    expect(routeCode()).toMatch(/memoriesResult\.rows === null/);
  });

  it('the reporting branches are reachable — the CONDITION is pinned, not the text', () => {
    // Mutation F4 kept every expected string and made the branch unreachable
    // with `false ? … : …`. Asserting that text is PRESENT says nothing about
    // whether it can ever execute. Pin the operative discriminant instead.
    const code = routeCode();

    const memoriesGuard = /\.\.\.\(\s*([^?]+?)\s*\n?\s*\?/.exec(code);
    expect(memoriesGuard).not.toBeNull();
    expect(memoriesGuard![1].trim()).toBe('memoriesResult.rows === null');

    const googleGuard = /google:\s*\n?\s*([^?]+?)\s*\n?\s*\?/.exec(code);
    expect(googleGuard).not.toBeNull();
    expect(googleGuard![1].trim()).toBe('googleResult.rows === null');

    // and no constant guard anywhere in the payload construction
    expect(code).not.toMatch(/\n\s+(false|true)\s*\n\s*\?/);
  });
});

// ── §3 — INNOCENT AND BOUNDARY NEGATIVE CONTROLS ─────────────────────────────

describe('P1 §3 — negative controls', () => {
  it('a legitimate expression column is not read as a fictional one', () => {
    // `vector_embedding IS NOT NULL as has_embedding` is an expression, not a
    // column name. Treating it as one would report a false fictional column —
    // the innocent-lookalike failure.
    const dm = queries.find((q) => q.table === 'developmental_memories')!;
    expect(dm.columns).not.toContain('has_embedding');
    expect(route()).toMatch(/vector_embedding IS NOT NULL as has_embedding/);
  });

  it('prose naming a removed column is not the column', () => {
    // The repair docblock names all five dead columns to explain the defect.
    expect(route()).toMatch(/cognitive_level/);
    const dm = queries.find((q) => q.table === 'developmental_memories')!;
    expect(dm.columns).not.toContain('cognitive_level');
  });

  it('the schema reader tolerates tables it cannot parse', () => {
    expect(columnsOf('a_table_that_does_not_exist').size).toBe(0);
  });

  it('the comment-stripping control works both ways (boundary control)', () => {
    // The defect pattern IS present in prose and MUST NOT be in code.
    expect(route()).toMatch(/rows:\s*\[\]\s*\}\)\)/);          // docblock quotes it
    expect(routeCode()).not.toMatch(/rows:\s*\[\]\s*\}\)\)/);  // code does not
  });

  it('a failed google read reports unknown, never a false disconnection', () => {
    expect(routeCode()).toMatch(/connected: 'unknown'/);
    expect(route()).toMatch(/does NOT mean the service is disconnected/);
  });
});

// ── §4 — the coverage gap, quantified rather than forgotten ──────────────────

describe('P1 §4 — export coverage against retrieval reach', () => {
  it('pins how many tables the export actually covers', () => {
    const covered = new Set(queries.map((q) => q.table));
    // members, member_settings, member_sessions, developmental_memories,
    // google_calendar_credentials. Widening this is the open obligation, and
    // changing the number must be a deliberate act that updates this pin.
    expect([...covered].sort()).toEqual([
      'developmental_memories',
      'google_calendar_credentials',
      'member_sessions',
      'member_settings',
      'members',
    ]);
  });

  it('records that retrieval reaches far more than the export covers', () => {
    // Source-derived topology: 37 member-scoped tables read by the memory
    // modules. The census originally recorded five omissions; the derived scan
    // says the gap is an order of magnitude larger — and that one of the five
    // "covered" tables did not work.
    //
    // This assertion is a LEDGER, not a pass. It exists so the obligation
    // cannot quietly disappear, and so the number cannot drift without a
    // deliberate edit here.
    const RETRIEVAL_REACH = 37;
    const EXPORT_COVERS = 5;
    expect(RETRIEVAL_REACH).toBeGreaterThan(EXPORT_COVERS);
    expect(RETRIEVAL_REACH - EXPORT_COVERS).toBe(32);
  });
});
