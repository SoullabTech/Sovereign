/**
 * LETHALITY MATRIX — the suite must KILL each deliberately wrong room.
 *
 * ⛔ A surviving candidate repairs the SUITE, never the candidate.
 *
 * ⭐ CLASSIFIED vs UNCLASSIFIED collateral: a candidate that trips checks beyond
 * its named one is not thereby sloppy — some constitutional errors have an
 * irreducible blast radius, and a candidate narrowed until it kills only its
 * named check would no longer BE the error it models. Unclassified collateral
 * is an isolation defect and must be repaired before the freeze.
 */

import { REFERENCE, DEFEAT_CANDIDATES } from './candidates';
import { runArrivalLaws, runLaws, type LawResult } from './laws';
import type { Engine } from './engine';

const NAMED_KILL: Readonly<Record<string, string>> = {
  D1_HELD_ASSERTS: 'F4-held-asserts-nothing',
  D2_APPLY_FROM_ALTS: 'F5-apply-only-from-context-review',
  D3_RANKED: 'F6-no-ranking',
  D4_COVERAGE_DISCHARGES: 'F7-permanent-limits-never-discharged',
  D5_RECEIPT_DEAD_END: 'F8-no-dead-end',
  D6_REFETCH_LOSES_PLACE: 'F9-place-invariant',
  D7_UNDO_DELETES: 'F10-undo-appends',
  D8_WITH_DEAD_ACTION: 'F11-no-unofferable-action',
};

const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {
  /* ⭐ Applying from the list produces a real `applied` phase whose history and
     version are correct, so nothing else diverges. Recorded as expecting none. */
};

const line = (s: string) => process.stdout.write(s + '\n');
let exitCode = 0;

function evaluate(engine: Engine): { failed: string[]; results: readonly LawResult[]; error?: string } {
  try {
    const results = [...runLaws(engine), ...runArrivalLaws(engine)];
    return { failed: results.filter((r) => !r.ok).map((r) => r.id), results };
  } catch (err) {
    /* ⭐ A candidate that CRASHES the walk has not been killed by a law — it has
       broken the instrument. Reported as an isolation defect, ⛔ never counted
       as a kill. */
    return { failed: [], results: [], error: err instanceof Error ? err.message : String(err) };
  }
}

line('── REFERENCE ────────────────────────────────────────────────────────');
const ref = evaluate(REFERENCE);
if (ref.error) { line(`  ⛔ REFERENCE THREW: ${ref.error}`); exitCode = 1; }
for (const r of ref.results) line(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id}  — ${r.detail}`);
if (ref.failed.length > 0) {
  exitCode = 1;
  line(`  ⛔ THE REFERENCE MUST PASS EVERY LAW. Failed: ${ref.failed.join(', ')}`);
}

line('');
line('── DEFEAT CANDIDATES ────────────────────────────────────────────────');
let dead = 0;
for (const candidate of DEFEAT_CANDIDATES) {
  const named = NAMED_KILL[candidate.name];
  const run = evaluate(candidate);
  if (run.error) {
    exitCode = 1;
    line(`  ⛔ ISOLATION DEFECT  ${candidate.name} — instrument threw: ${run.error}`);
    continue;
  }
  const killed = named !== undefined && run.failed.includes(named);
  const collateral = run.failed.filter((f) => f !== named);
  const declared = CLASSIFIED[candidate.name] ?? [];
  const unclassified = collateral.filter((c) => !declared.includes(c));

  if (!killed) {
    exitCode = 1;
    line(`  ⛔ SURVIVED  ${candidate.name} — expected to die on ${named}. Failed: ${run.failed.join(', ') || 'nothing'}`);
    line(`              ⚠️ A SURVIVING CANDIDATE REPAIRS THE SUITE, NEVER THE CANDIDATE.`);
    continue;
  }
  dead += 1;
  const tail = collateral.length === 0
    ? ''
    : ` · collateral ${collateral.join(', ')}${unclassified.length > 0 ? ' ⚠️ UNCLASSIFIED' : ' (classified)'}`;
  if (unclassified.length > 0) {
    exitCode = 1;
    line(`  DEAD ⚠️     ${candidate.name} → ${named}${tail}`);
    line(`              ⛔ UNCLASSIFIED COLLATERAL IS AN ISOLATION DEFECT. Classify with a stated reason, or narrow.`);
  } else {
    line(`  DEAD        ${candidate.name} → ${named}${tail}`);
  }
}

line('');
line('── VERDICT ──────────────────────────────────────────────────────────');
line(`  reference            ${ref.failed.length === 0 && !ref.error ? `${ref.results.length}/${ref.results.length} PASS` : 'FAIL'}`);
line(`  candidates dead      ${dead}/${DEFEAT_CANDIDATES.length}`);
line(`  matrix               ${exitCode === 0 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'}`);
line('');
line('  ⚠️ SCOPE: these are the EIGHT machine-level laws (F4–F11) of the approved');
line('     D0 acceptance set. F1 no-permanent-furniture · F2 measure-invariance ·');
line('     F3 MAIA-inline · F12 coverage-in-one-gesture are COMPOSITION laws and');
line('     are ⛔ NOT proved here. They land with B2/B3/B6 against a rendered room.');
line('     ⛔ H1–H6 remain UNKNOWN — REQUIRE THE FOUNDER WALK.');

process.exit(exitCode);
