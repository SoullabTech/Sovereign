/**
 * RE-009 POSSESSION GUARD — ACT 5 persistence-repair regression test.
 *
 * WHY THIS EXISTS: the ACT 4 runtime conformity census
 * (docs/programme/MAIA-RE-01_ACT4_RUNTIME_CONFORMITY_CENSUS_2026-09-15.md)
 * confirmed a NONCONFORMS at RE-009 Act 5. `relationalObserver` wrote
 * system-originated relational-dynamic attributions — `pursue_withdraw`,
 * `overfunctioning`, `withdrawal`, `escalation`, `projection` — into
 * `relationship_entries.pattern_hint` and `relationship_entry_patterns` with a
 * 30-day TTL, on a live path, with no member participation.
 *
 * THE CONSTITUTIONAL POINT (docs/canon/PERCEPTION_WITHOUT_POSSESSION.md):
 * an expiry does not make an unadopted attribution ephemeral. RE-009 bounds
 * ephemerality to the CONVERSATIONAL WORKING CONTEXT, not to a TTL. And MAIA
 * never saying the label is irrelevant to whether MAIA possesses the label.
 *
 * WHAT THIS ASSERTS — BOTH ARMS, which is the whole point:
 *
 *   POSSESSION ARM   the observer does not durably write a system attribution
 *                    (kills: "restore the pattern_id write but keep the
 *                    member-facing language humble" — a disclosure fix)
 *
 *   PERCEPTION ARM   the observer still runs detection and still persists the
 *                    member's own evidence
 *                    (kills: "delete the detector" — a blindness fix, which
 *                    leaves the database clean and fails RE-009's other arm)
 *
 * A guard that only had the possession arm would be a possession test that a
 * lobotomy passes. A guard that only had the perception arm would be the
 * disclosure test RE-009 exists to refuse.
 *
 * SCOPE: the observer write path only. This says nothing about Act 3
 * operational use, Act 6 promotion, the dormant writers, `relationship_essences`,
 * or historical rows written before the repair — all of which remain open and
 * are recorded in the ACT 4 census and the ACT 5 record.
 */
import { readFileSync } from 'fs';
import path from 'path';

const OBSERVER = 'lib/consciousness/relationalObserver.ts';
const repoRoot = path.resolve(__dirname, '../../..');

/**
 * Strip COMMENTS ONLY — deliberately NOT string literals.
 *
 * The table and column names this guard must scan ARE string literals
 * (`insertOne('relationship_entries', ...)`), so stripping them would blind the
 * instrument to the very thing it exists to see. An earlier draft of this guard
 * stripped them and reported a false FAIL against a correctly repaired file.
 *
 * Comments are stripped because the repaired source DOCUMENTS the prohibition
 * in prose — it names `pattern_hint` and `relationship_entry_patterns` to
 * explain their absence. A raw-source scanner would fail the file precisely
 * because that file states its own compliance.
 */
function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ');
}

/** Brace-matched payload of a given insertOne('<table>', { ... }) call. */
function payload(code: string, table: string): string | null {
  const i = code.indexOf(`insertOne('${table}'`);
  if (i < 0) return null;
  const s = code.indexOf('{', i);
  if (s < 0) return null;
  let depth = 0;
  for (let j = s; j < code.length; j++) {
    if (code[j] === '{') depth++;
    else if (code[j] === '}') {
      depth--;
      if (depth === 0) return code.slice(s, j + 1);
    }
  }
  return null;
}

const writeTargets = (code: string): string[] =>
  [...code.matchAll(/insertOne\('([a-z_]+)'/g)].map(m => m[1]);

/** The only tables this observer may write. A renamed carrier fails here. */
const ALLOWED_WRITE_TARGETS = new Set(['member_relationships', 'relationship_entries']);

const code = codeOnly(readFileSync(path.join(repoRoot, OBSERVER), 'utf8'));

describe('RE-009 possession guard — relationalObserver', () => {
  // ─── POSSESSION ARM ────────────────────────────────────────────────────────

  it('does not write pattern_hint (a system attribution about the member)', () => {
    expect(code).not.toMatch(/pattern_hint/);
  });

  it('does not write to relationship_entry_patterns', () => {
    expect(code).not.toMatch(/relationship_entry_patterns/);
  });

  it('writes only to the allowlisted tables — a renamed carrier is still possession', () => {
    expect(writeTargets(code).filter(t => !ALLOWED_WRITE_TARGETS.has(t))).toEqual([]);
  });

  it('carries no attribution field in the persisted entry payload', () => {
    const p = payload(code, 'relationship_entries');
    expect(p).not.toBeNull();
    expect(p as string).not.toMatch(/pattern/i);
  });

  it('gives no detection row an expiry — a TTL does not make an attribution ephemeral', () => {
    expect(code).not.toMatch(/expires_at/);
    expect(code).not.toMatch(/TTL_DAYS/);
  });

  // ─── PERCEPTION ARM ────────────────────────────────────────────────────────

  it('still runs pattern detection on the member message — MAIA does not go blind in order not to possess', () => {
    expect(code).toMatch(/detectPatterns\s*\(\s*userMessage\s*\)/);
  });

  it("still persists the member's own words as evidence", () => {
    const p = payload(code, 'relationship_entries');
    expect(p).not.toBeNull();
    expect(p as string).toMatch(/content\s*:\s*detection\.summary/);
  });

  // ─── PRESERVED PASSES (must not regress under this repair) ─────────────────

  it('still refuses outright under Sanctuary', () => {
    expect(code).toMatch(/posture\.isSanctuary/);
  });

  it('still requires an explicit consent posture argument', () => {
    expect(code).toMatch(/RelationalObservationPosture/);
  });
});
