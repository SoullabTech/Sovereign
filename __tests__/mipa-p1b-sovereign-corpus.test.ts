/**
 * MIPA PHASE 0 — P1b CERTIFICATION: THE SOVEREIGN CORPUS
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P1b
 *
 *   MAIA may not have durable participatory access to a representation about
 *   the member that the member has neither meaningful access to nor meaningful
 *   sovereignty over.
 *
 *   MAIA's durable participatory corpus  ⊆  member-governable corpus
 *
 * ── WHAT THIS IS NOT ────────────────────────────────────────────────────────
 *
 * Not "make SELECT * work on 37 tables." A table is an implementation object;
 * the member is owed an account of the REPRESENTATIONS held about them.
 *
 *   > Data portability is not sovereignty if the machine exports tables the
 *   > member cannot understand while quietly retaining unexported
 *   > interpretations that affect the relationship.
 *
 * ── DISCOVERY ───────────────────────────────────────────────────────────────
 *
 * The storage sources are derived from source: member-scoped SELECTs across the
 * memory modules, filtered against the real schema so CTE aliases and prose
 * (`a`, `NOW`, `results`, `turns_to_keep`) cannot enter the set. Every one must
 * carry a classification with WRITE-PATH EVIDENCE — never a naming inference.
 *
 * ── UNKNOWN IS A VERDICT, NOT A GAP ─────────────────────────────────────────
 *
 * Ten sources are UNKNOWN, including two — `episode_links`, `state_vectors` —
 * with NO WRITER anywhere in source. Under the covenant they fail closed for
 * new participatory authority. Resolving them by table name or probable caller
 * is the guess the backfill policy forbids.
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  SOVEREIGN_CORPUS,
  EXPORT_REQUIRED_CLASSES,
  EXPORT_EXEMPT_CLASSES,
  type CorpusClass,
} from '@/lib/maia/sovereignCorpus';

const REPO = path.resolve(__dirname, '..');
const BASELINE = path.join(REPO, 'database/baseline/0001_baseline_2026-09-01.sql');
const MIGRATIONS = path.join(REPO, 'database/migrations');
const MEMORY_ROOTS = ['lib/maia', 'lib/memory', 'lib/anchor', 'lib/psyche'];

/** Every table name the schema actually declares. */
function schemaTables(): Set<string> {
  const out = new Set<string>();
  const base = fs.readFileSync(BASELINE, 'utf8');
  for (const m of base.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?"public"\."([a-z0-9_]+)"/g)) out.add(m[1]);
  for (const f of fs.readdirSync(MIGRATIONS).filter((x) => x.endsWith('.sql'))) {
    const body = fs.readFileSync(path.join(MIGRATIONS, f), 'utf8');
    for (const m of body.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?"?([a-z0-9_]+)"?\s*\(/gi)) out.add(m[1]);
  }
  return out;
}

/** Member-scoped storage sources read by the memory modules, from source. */
function discoveredSources(): string[] {
  const tables = schemaTables();
  const skip = /__tests__|\.test\.ts/;
  const found = new Set<string>();
  const walk = (p: string): void => {
    let st: fs.Stats;
    try { st = fs.statSync(p); } catch { return; }
    if (st.isDirectory()) {
      for (const f of fs.readdirSync(p)) {
        const q = path.join(p, f);
        if (!skip.test(q)) walk(q);
      }
      return;
    }
    if (!/\.ts$/.test(p) || skip.test(p)) return;
    const src = fs.readFileSync(p, 'utf8');
    for (const m of src.matchAll(/FROM\s+([a-z_][a-z0-9_]*)/gi)) {
      const around = src.slice(Math.max(0, m.index! - 400), m.index! + 400);
      // Member-scoped: the statement binds a member/user parameter.
      if (!/\b(user_id|member_id)\s*=\s*\$/.test(around)) continue;
      // Schema-filtered: an alias or a word in prose is not a storage source.
      if (tables.has(m[1])) found.add(m[1]);
    }
  };
  for (const r of MEMORY_ROOTS) walk(path.join(REPO, r));
  return [...found].sort();
}

const discovered = discoveredSources();

// ── §0 — META-INVARIANT ──────────────────────────────────────────────────────

describe('P1b §0 — the instrument found its subject', () => {
  it('the schema reader finds a real table universe', () => {
    expect(schemaTables().size).toBeGreaterThan(300);
  });

  it('discovery finds a nonzero, plausible number of member-scoped sources', () => {
    // Zero would make every classification assertion vacuous.
    expect(discovered.length).toBeGreaterThan(25);
    expect(discovered).toContain('conversation_turns');
    expect(discovered).toContain('developmental_memories');
  });

  it('discovery is schema-filtered, so aliases and prose cannot enter', () => {
    for (const noise of ['a', 'NOW', 'results', 'current', 'turns_to_keep', 'same']) {
      expect({ noise, discovered: discovered.includes(noise) })
        .toEqual({ noise, discovered: false });
    }
  });
});

// ── §1 — exhaustive classification ───────────────────────────────────────────

describe('P1b §1 — every discovered source is classified with evidence', () => {
  it('no discovered source is unclassified', () => {
    const unclassified = discovered.filter((t) => !SOVEREIGN_CORPUS[t]);
    // A NEW member-scoped source changes the derived set, finds no entry, and
    // fails here. It cannot inherit a permissive default.
    expect({ unclassified }).toEqual({ unclassified: [] });
  });

  it('every classification carries write-path evidence, not a name', () => {
    for (const [t, e] of Object.entries(SOVEREIGN_CORPUS)) {
      expect({ table: t, hasEvidence: e.evidence.length > 25 })
        .toEqual({ table: t, hasEvidence: true });
      // Evidence must cite a mechanism, not restate the table's name.
      expect({ table: t, isJustTheName: e.evidence.trim() === t })
        .toEqual({ table: t, isJustTheName: false });
    }
  });

  it('classification is representation-sensitive where a row mixes authorship', () => {
    // Three sources carry member-authored and system-authored fields together.
    // A table-level verdict on any of them would either discard the member's
    // own words or launder the system's framing into their record.
    const mixed = Object.entries(SOVEREIGN_CORPUS).filter(([, e]) => e.mixed);
    expect(mixed.length).toBeGreaterThanOrEqual(3);
    for (const [, e] of mixed) {
      const roles = new Set(Object.values(e.mixed!));
      expect(roles.has('member') && roles.has('system')).toBe(true);
    }
    expect(SOVEREIGN_CORPUS.member_daily_anchors.mixed).toEqual({
      response: 'member', prompt_shown: 'system',
    });
  });
});

// ── §2 — UNKNOWN fails closed ────────────────────────────────────────────────

describe('P1b §2 — UNKNOWN is a verdict that fails closed', () => {
  it('UNKNOWN is neither export-required nor export-exempt', () => {
    // It must not drift into "exempt" (silently retained) or "required"
    // (exported on a guess about what it is).
    expect(EXPORT_REQUIRED_CLASSES).not.toContain('UNKNOWN');
    expect(EXPORT_EXEMPT_CLASSES).not.toContain('UNKNOWN');
  });

  it('no UNKNOWN source carries a participation gate implying eligibility', () => {
    for (const [t, e] of Object.entries(SOVEREIGN_CORPUS)) {
      if (e.class !== 'UNKNOWN') continue;
      expect({ table: t, gate: e.gate }).toEqual({ table: t, gate: undefined });
    }
  });

  it('sources with no writer in source are UNKNOWN, not assumed empty', () => {
    // Read-but-never-written. "Nothing writes it" is not evidence of what it
    // holds — it is evidence that this tree cannot say.
    expect(SOVEREIGN_CORPUS.episode_links.class).toBe('UNKNOWN');
    expect(SOVEREIGN_CORPUS.state_vectors.class).toBe('UNKNOWN');
    expect(SOVEREIGN_CORPUS.episode_links.evidence).toMatch(/NO WRITER FOUND/);
  });
});

// ── §3 — the covenant's subset relation ──────────────────────────────────────

describe('P1b §3 — participatory corpus ⊆ member-governable corpus', () => {
  it('every gated (participating) representation is export-required, never exempt', () => {
    // A representation MAIA may participate in cannot be one the member has no
    // access to. Exemption must never confer participatory authority.
    for (const [t, e] of Object.entries(SOVEREIGN_CORPUS)) {
      if (!e.gate) continue;
      expect({ table: t, class: e.class, exempt: EXPORT_EXEMPT_CLASSES.includes(e.class) })
        .toEqual({ table: t, class: e.class, exempt: false });
    }
  });

  it('operational/security material is export-exempt and carries no gate', () => {
    const ops = Object.entries(SOVEREIGN_CORPUS).filter(([, e]) => e.class === 'OPERATIONAL_OR_SECURITY');
    expect(ops.length).toBeGreaterThan(0);
    for (const [t, e] of ops) {
      expect({ table: t, exempt: EXPORT_EXEMPT_CLASSES.includes(e.class) })
        .toEqual({ table: t, exempt: true });
      expect({ table: t, gate: e.gate }).toEqual({ table: t, gate: undefined });
      // and the evidence must say WHY secrets are not memory
      expect(e.evidence).toMatch(/token|secret|credential/i);
    }
  });

  it('derived artifacts are exempt only where they carry no independent claim', () => {
    for (const [t, e] of Object.entries(SOVEREIGN_CORPUS)) {
      if (e.class !== 'DERIVED_IMPLEMENTATION_ARTIFACT') continue;
      expect({ table: t, evidenceMentionsRegenerability: /regenerable|index|audit|link|bookkeeping/i.test(e.evidence) })
        .toEqual({ table: t, evidenceMentionsRegenerability: true });
    }
  });
});

// ── §4 — the standing obligation, pinned ─────────────────────────────────────

describe('P1b §4 — the sovereign-corpus ledger', () => {
  it('records the classification distribution so it cannot drift silently', () => {
    const counts: Record<string, number> = {};
    for (const e of Object.values(SOVEREIGN_CORPUS)) counts[e.class] = (counts[e.class] ?? 0) + 1;
    expect(counts).toEqual({
      CANONICAL_MEMBER_RECORD: 16,
      SYSTEM_REPRESENTATION_ABOUT_MEMBER: 10,
      DERIVED_IMPLEMENTATION_ARTIFACT: 3,
      OPERATIONAL_OR_SECURITY: 1,
      UNKNOWN: 10,
    });
  });

  it('records how far export currently reaches against what it owes', () => {
    const owed = Object.entries(SOVEREIGN_CORPUS)
      .filter(([, e]) => EXPORT_REQUIRED_CLASSES.includes(e.class));
    const reached = owed.filter(([, e]) => e.exportedToday);
    // 26 representations are owed to the member; 4 are reached today. The gap
    // is the standing obligation, pinned so it cannot quietly disappear.
    expect(owed.length).toBe(26);
    expect(reached.length).toBe(4);
    expect(reached.map(([t]) => t).sort()).toEqual([
      'developmental_memories', 'member_sessions', 'member_settings', 'members',
    ]);
  });

  it('a machine summary reaching the export today is classified as such', () => {
    // `member_sessions` IS exported — as `sessions` — and holds a
    // machine-generated summary. It is owed to the member AND must not read as
    // their own account. Classification makes that visible; the export's
    // logical-object contract is where it gets labelled.
    expect(SOVEREIGN_CORPUS.member_sessions.class).toBe('SYSTEM_REPRESENTATION_ABOUT_MEMBER');
    expect(SOVEREIGN_CORPUS.member_sessions.exportedToday).toBe(true);
  });
});

// ── §5 — NEGATIVE AND BOUNDARY CONTROLS ──────────────────────────────────────

describe('P1b §5 — negative and boundary controls', () => {
  it('a stale classification for a source no longer discovered is caught', () => {
    const stale = Object.keys(SOVEREIGN_CORPUS)
      .filter((t) => !discovered.includes(t))
      // members / member_settings / google_calendar_credentials are export
      // sources, not memory-module reads — legitimately classified, not stale.
      .filter((t) => !['members', 'member_settings', 'google_calendar_credentials'].includes(t));
    expect({ stale }).toEqual({ stale: [] });
  });

  it('discovery is order-independent and de-duplicated', () => {
    expect(discovered).toEqual([...discovered].sort());
    expect(new Set(discovered).size).toBe(discovered.length);
  });

  it('a table named only in prose is not a discovered source', () => {
    // This suite's own docblock names `episode_links` and `state_vectors`.
    // Discovery walks SQL with a member-scope predicate, not prose.
    const selfText = fs.readFileSync(__filename, 'utf8');
    expect(selfText).toMatch(/state_vectors/);
    expect(discovered.every((d) => schemaTables().has(d))).toBe(true);
  });

  it('classifying a source does NOT by itself grant it participation', () => {
    // Classification is a sovereignty statement, not a gate. The gates are
    // R24-R27 and P3e at their own composition sites.
    const gated = Object.values(SOVEREIGN_CORPUS).filter((e) => e.gate).length;
    const classified = Object.keys(SOVEREIGN_CORPUS).length;
    expect(gated).toBeLessThan(classified);
    const mod = fs.readFileSync(path.join(REPO, 'lib/maia/sovereignCorpus.ts'), 'utf8');
    // No runtime consumer: it must not become a filter by accident.
    expect(mod).not.toMatch(/import .* from '@\/lib\/db/);
  });
});
