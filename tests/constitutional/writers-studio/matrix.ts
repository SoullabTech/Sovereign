/**
 * LETHALITY PROOF (§VIII) — the suite must KILL each deliberately wrong
 * candidate. ⛔ A surviving candidate repairs the SUITE, never the candidate.
 *
 * ⭐ CLASSIFIED vs UNCLASSIFIED collateral, carried from the S3 matrix: a
 * candidate that trips checks beyond its named one is not thereby sloppy —
 * some constitutional errors have an irreducible blast radius, and a candidate
 * narrowed until it kills only its named check would no longer BE the error it
 * models. Unclassified collateral is an isolation defect.
 */

import { REFERENCE, DEFEAT_CANDIDATES, type Engine } from './candidates';
import { runTestA, runCompassSeparation } from './testA';

const NAMED_KILL: Readonly<Record<string, string>> = {
  D1_TEXT_IDENTITY: 'A0-identity-minted-at-admission',
  D2_EVIDENCE_IDENTITY: 'A0-required-falsifier',
  D3_PER_FACET_REREAD: 'A3-no-reading-on-render',
  D4_GUIDED_EXPANSION: 'A1-set-equals-admitted',
  D5_HIDDEN_REACHABILITY: 'A1-set-invariant',
  D6_TIE_RANKING: 'A4-manuscript-order',
};

const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {
  /* ⭐ Identity IS the basis, so every distinctness property collapses at once —
     and it additionally trips A0-identity-minted-at-admission because a
     content-derived identity is stable across admissions BY CONSTRUCTION.
     ⛔ Narrowing it to spare that check would mean no longer using the basis as
     the identity, i.e. no longer being D2. */
  D2_EVIDENCE_IDENTITY: ['A0-distinct-admission', 'A0-identity-minted-at-admission',
    'A1-set-equals-admitted', 'A1-set-invariant', 'A4-manuscript-order'],
  /* ⭐ Re-reading to render manufactures a different observation set per facet,
     so every id-keyed property diverges — including what MAIA may author, since
     proposals are keyed on the observation. ⛔ Narrowing it to spare that check
     would mean not re-reading, i.e. no longer being D3. */
  D3_PER_FACET_REREAD: ['A1-set-invariant', 'A1-set-equals-admitted', 'A2-basis-invariant',
    'A3-authorship-facet-invariant', 'A4-manuscript-order'],
  /* An added claim is an added id AND something more for MAIA to author. */
  D4_GUIDED_EXPANSION: ['A1-set-invariant', 'A2-basis-invariant', 'A3-authorship-facet-invariant', 'A4-manuscript-order'],
  /* A subset differs from the admitted set from the other direction. */
  D5_HIDDEN_REACHABILITY: ['A1-set-equals-admitted', 'A4-manuscript-order', 'A3-authorship-facet-invariant'],
};

function report(engine: Engine) {
  const results = runTestA(engine);
  return { failed: results.filter((r) => !r.ok).map((r) => r.id), results };
}

let exitCode = 0;
const line = (s: string) => process.stdout.write(s + '\n');

line('── REFERENCE ──────────────────────────────────────────────');
const refRun = report(REFERENCE);
for (const r of refRun.results) line(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id}  — ${r.detail}`);
const compass = runCompassSeparation();
for (const r of compass) line(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id}  — ${r.detail}`);
if (refRun.failed.length > 0 || compass.some((c) => !c.ok)) {
  exitCode = 1;
  line(`  ⛔ REFERENCE MUST PASS EVERY CHECK. Failed: ${refRun.failed.join(', ')}`);
}

line('');
line('── DEFEAT CANDIDATES (each must DIE on its named check) ────');
for (const cand of DEFEAT_CANDIDATES) {
  const { failed } = report(cand);
  const named = NAMED_KILL[cand.name]!;
  const died = failed.includes(named);
  const collateral = failed.filter((f) => f !== named);
  const allowed = CLASSIFIED[cand.name] ?? [];
  const unclassified = collateral.filter((c) => !allowed.includes(c));
  line(`  ${died ? 'KILLED' : 'SURVIVED'}  ${cand.name}  on ${named}`);
  if (collateral.length > 0) {
    line(`            collateral: ${collateral.join(', ')}${unclassified.length ? '  ⛔ UNCLASSIFIED' : '  (classified)'}`);
  }
  if (!died) { exitCode = 1; line(`            ⛔ SURVIVING CANDIDATE — REPAIR THE SUITE, NEVER THE CANDIDATE`); }
  if (unclassified.length > 0) { exitCode = 1; line(`            ⛔ isolation defect: ${unclassified.join(', ')}`); }
}

line('');
line('── §IX PROMPT BOUNDARY ────────────────────────────────────');
line(`  ${compass.every((c) => c.ok) ? 'KILLED' : 'SURVIVED'}  D7_COMPASS_IN_PROMPT  on A7-kills-D7`);

line('');
line(exitCode === 0
  ? '⭐ MATRIX LETHAL — reference passes every check; all six named candidates die; D7 dies.'
  : '⛔ MATRIX NOT LETHAL.');
process.exit(exitCode);
