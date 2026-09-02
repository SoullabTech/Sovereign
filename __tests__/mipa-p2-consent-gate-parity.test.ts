/**
 * MIPA PHASE 0 — P2 CERTIFICATION: READ IMPLIES WRITABLE
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P2
 *
 *   Every column read as a consent gate on a live path is writable by the
 *   member through an authenticated surface.
 *
 * A gate the member cannot set is not consent. It is a default wearing a
 * consent-shaped name.
 *
 * ── THE DEFECT THIS CERTIFIES AGAINST ───────────────────────────────────────
 *
 * `members.episodic_recall_enabled` was added by migration 20260531000001,
 * read on every authenticated turn by `loadEpisodicRecallPref`, and absent from
 * the preferences route's gate list — a constant that file itself documented as
 * "the single source of truth for which gates exist". Two lists, each believing
 * it was the only one. Nothing detected the divergence for three months.
 *
 * ── WHY THE CLOSED SET IS OVER THE SCHEMA, NOT OVER CALL SITES ──────────────
 *
 * `__tests__/voice-non-degradation.test.ts` documents four gate designs that
 * failed the same way: each asked "does this look like something we thought
 * of?" and answered no. A denylist fails open on the unknown.
 *
 * The tempting closed set here is "every SQL read of the members table". That
 * set has ~75 members across ~45 files, most of them team notifications and
 * profile reads that have nothing to do with consent. A gate that fires on all
 * of them is a gate that gets disabled — the failure mode is social, not
 * technical, but it is still failure.
 *
 * So the closed set is drawn where gates actually ORIGINATE: the schema. Every
 * boolean column on `members` must be classified into exactly one of three
 * buckets. A newly added column belongs to none of them and fails BECAUSE IT IS
 * UNKNOWN — without the test ever learning its name, and before any loader that
 * would read it exists.
 *
 * The three buckets are not equally trusted. DECLARED_UNREAD_GATES could
 * otherwise become a place to hide a live gate, so §3 gives it a falsifiable
 * condition: zero readers. A gate parked there while being consulted fails.
 *
 * ── HOSTILE FORK MUST CHANGE (falsification) ────────────────────────────────
 *
 *   §1  Add a boolean column to `members` without classifying it.
 *   §2  Remove a gate from MEMBER_CONSENT_GATES while a loader still reads it
 *       (also a compile error — `ConsentGateName` would not contain it).
 *   §3  Add a reader for a column parked in DECLARED_UNREAD_GATES.
 *   §4  Read a registered gate in SQL outside lib/maia/consentGates.ts.
 *   §5  Give the preferences route its own gate list again.
 *
 * Each is a visible diff. None can be done by editing a string.
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  MEMBER_CONSENT_GATES,
  CONSENT_GATE_NAMES,
  DECLARED_UNREAD_GATES,
  NOT_CONSENT_GATES,
  isConsentGateName,
} from '@/lib/maia/consentGates';

const REPO = path.resolve(__dirname, '..');
const BASELINE = path.join(REPO, 'database/baseline/0001_baseline_2026-09-01.sql');
const MIGRATIONS = path.join(REPO, 'database/migrations');
const GATES_MODULE = 'lib/maia/consentGates.ts';

// ── source enumeration helpers ───────────────────────────────────────────────

/** Boolean columns on `members`, derived from the baseline DDL + later ALTERs. */
function membersBooleanColumns(): string[] {
  const sql = fs.readFileSync(BASELINE, 'utf8');
  const table = sql.match(
    /CREATE TABLE (?:IF NOT EXISTS )?"public"\."members" \(([\s\S]*?)\n\);/,
  );
  if (!table) throw new Error('members table not found in baseline — update BASELINE path');

  const cols = new Set<string>();
  for (const m of table[1].matchAll(/^\s*"([a-z0-9_]+)"\s+([^,\n]+)/gm)) {
    if (/\bboolean\b/i.test(m[2])) cols.add(m[1]);
  }

  // Post-baseline additions. The baseline is a snapshot; migrations dated after
  // it are the live delta, and a gate added there must classify too.
  for (const file of fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql'))) {
    const body = fs.readFileSync(path.join(MIGRATIONS, file), 'utf8');
    const alters = body.matchAll(
      /ALTER TABLE\s+(?:"?public"?\.)?"?members"?([\s\S]*?);/gi,
    );
    for (const a of alters) {
      for (const c of a[1].matchAll(
        /ADD COLUMN\s+(?:IF NOT EXISTS\s+)?"?([a-z0-9_]+)"?\s+BOOLEAN/gi,
      )) {
        cols.add(c[1]);
      }
    }
  }
  return [...cols].sort();
}

/** Every .ts/.tsx source file that could read a gate. */
function sourceFiles(): string[] {
  const out: string[] = [];
  const skip = /node_modules|\.next|__tests__|\.test\.tsx?$|_backend|dist-minimal|\.d\.ts$/;
  const walk = (p: string) => {
    let st: fs.Stats;
    try { st = fs.statSync(p); } catch { return; }
    if (st.isDirectory()) {
      for (const f of fs.readdirSync(p)) {
        const q = path.join(p, f);
        if (!skip.test(q)) walk(q);
      }
      return;
    }
    if (/\.tsx?$/.test(p) && !skip.test(p)) out.push(p);
  };
  for (const r of ['lib', 'app', 'components']) walk(path.join(REPO, r));
  return out;
}

/**
 * Locations where `name` appears inside something SQL-shaped.
 *
 * Deliberately conservative about what counts as a read: a bare mention in a
 * comment is not a read, and treating it as one would make the test cry wolf
 * (`recurrenceDetector.ts` names its future gate in prose twice). The signal is
 * the column name co-occurring with SQL keywords on the same line.
 */
function sqlReferences(name: string): Array<{ file: string; line: number }> {
  const hits: Array<{ file: string; line: number }> = [];
  // Word-boundaried keywords. Without \b, `SET` matches inside `setPreferences(`
  // and the client component's React state update reads as a SQL write — which
  // is how this detector first failed. A gate that fires on things merely
  // SHAPED like what it hunts is the same epistemic error as one that misses
  // the unknown, and it is the one that gets a gate switched off.
  const sqlish = new RegExp(
    String.raw`\b(SELECT|UPDATE|WHERE|SET|RETURNING|INSERT)\b[^\n]*\b${name}\b|\b${name}\b[^\n]*(FROM\s+members|=\s*\$)`,
    'i',
  );
  for (const file of sourceFiles()) {
    const rel = path.relative(REPO, file);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((l, i) => {
      if (!l.includes(name)) return;
      const stripped = l.replace(/^\s*(\/\/|\*|\/\*).*/, ''); // drop comment lines
      if (stripped.includes(name) && sqlish.test(stripped)) {
        hits.push({ file: rel, line: i + 1 });
      }
    });
  }
  return hits;
}

// ── §1 — the closed set ──────────────────────────────────────────────────────

describe('P2 §1 — every members boolean column is classified', () => {
  it('classifies each column into exactly one bucket', () => {
    const columns = membersBooleanColumns();
    expect(columns.length).toBeGreaterThan(0);

    const gates = new Set<string>(CONSENT_GATE_NAMES);
    const unread = new Set<string>(DECLARED_UNREAD_GATES);
    const notGates = new Set<string>(NOT_CONSENT_GATES);

    const unclassified = columns.filter(
      (c) => !gates.has(c) && !unread.has(c) && !notGates.has(c),
    );

    expect({ unclassified }).toEqual({ unclassified: [] });

    // Exactly one bucket, never two.
    for (const c of columns) {
      const memberships = [gates.has(c), unread.has(c), notGates.has(c)].filter(Boolean);
      expect({ column: c, buckets: memberships.length }).toEqual({ column: c, buckets: 1 });
    }
  });

  it('does not classify columns that no longer exist', () => {
    const columns = new Set(membersBooleanColumns());
    const stale = [...CONSENT_GATE_NAMES, ...DECLARED_UNREAD_GATES, ...NOT_CONSENT_GATES]
      .filter((c) => !columns.has(c));
    expect({ stale }).toEqual({ stale: [] });
  });
});

// ── §2 — read implies writable ───────────────────────────────────────────────

describe('P2 §2 — read set and write set are the same object', () => {
  it('the preferences route derives its columns from the gate registry', () => {
    const route = fs.readFileSync(
      path.join(REPO, 'app/api/members/recall-preferences/route.ts'),
      'utf8',
    );
    // It must import from the shared module...
    expect(route).toMatch(/from '@\/lib\/maia\/consentGates'/);
    // ...and must not re-declare a literal gate list of its own. A second list
    // is the exact shape of the defect (§ header).
    expect(route).not.toMatch(/RECALL_PREFERENCE_COLUMNS\s*=\s*\[/);
  });

  it('every registered gate is member-writable through that route', () => {
    for (const gate of CONSENT_GATE_NAMES) {
      expect(isConsentGateName(gate)).toBe(true);
      expect(MEMBER_CONSENT_GATES[gate]).toBeDefined();
    }
    expect(CONSENT_GATE_NAMES.length).toBe(Object.keys(MEMBER_CONSENT_GATES).length);
  });

  it('rejects a name that is not a registered gate', () => {
    expect(isConsentGateName('developmental_recall_enabled')).toBe(false);
    expect(isConsentGateName('tester')).toBe(false);
  });
});

// ── §3 — the parking-lot cannot hide a live gate ─────────────────────────────

describe('P2 §3 — declared-unread gates have zero readers', () => {
  it.each([...DECLARED_UNREAD_GATES])('%s is read by nothing', (gate) => {
    const readers = sqlReferences(gate);
    // A reader means the gate is live and must move into MEMBER_CONSENT_GATES
    // (which makes it member-writable) before that reader ships.
    expect({ gate, readers }).toEqual({ gate, readers: [] });
  });
});

// ── §4 — gate reads go through the shared module ─────────────────────────────

describe('P2 §4 — no registered gate is read outside consentGates.ts', () => {
  it.each([...CONSENT_GATE_NAMES])('%s is only read in the shared module', (gate) => {
    const outside = sqlReferences(gate).filter((h) => h.file !== GATES_MODULE);
    expect({ gate, outside }).toEqual({ gate, outside: [] });
  });
});

// ── §5 — behavior preserved ──────────────────────────────────────────────────

describe('P2 §5 — default-on opt-out semantics unchanged', () => {
  it('both former loaders still resolve through the shared reader', () => {
    const loaders = fs.readFileSync(path.join(REPO, 'lib/maia/memoryLoaders.ts'), 'utf8');
    expect(loaders).toMatch(/readConsentGate\(userId, 'conversational_recall_enabled'\)/);
    expect(loaders).toMatch(/readConsentGate\(userId, 'episodic_recall_enabled'\)/);
  });

  it('the reader defaults TRUE on every failure path', () => {
    const mod = fs.readFileSync(path.join(REPO, GATES_MODULE), 'utf8');
    // missing input, member-not-found, and thrown error all return true —
    // preserving the semantics both prior loaders implemented.
    expect(mod).toMatch(/if \(!memberId\) return true;/);
    expect(mod).toMatch(/if \(result\.rows\.length === 0\) return true;/);
    expect(mod).toMatch(/return true; \/\/ graceful: default-on/);
    // and the gate is TRUE unless explicitly FALSE
    expect(mod).toMatch(/!== false/);
  });
});
