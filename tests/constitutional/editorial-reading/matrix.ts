/**
 * `EDITORIAL-READING-01 / A2` — the execution matrix.
 *
 * ⭐ Proves the suite LETHAL (every candidate dies on its named falsifier) and
 * DISCRIMINATING (the conforming reference passes all of them).
 *
 * ⛔ A surviving candidate repairs the SUITE, never the candidate.
 * ⛔ Unclassified collateral is an isolation defect and fails the run.
 */

import { composeEditorialReading } from './contract';
import { FALSIFIERS } from './falsifiers';
import { CANDIDATES } from './candidates';

let failed = 0;
const line = (s: string) => process.stdout.write(`${s}\n`);

line('── reference (conforming composer) ───────────────────────────────────');
const refFailures: string[] = [];
for (const f of FALSIFIERS) {
  const r = f.run(composeEditorialReading);
  if (!r.pass) refFailures.push(`${f.id}: ${r.detail}`);
}
if (refFailures.length === 0) {
  line(`  ✅ ${FALSIFIERS.length}/${FALSIFIERS.length} PASS`);
} else {
  failed += refFailures.length;
  line(`  ❌ reference fails ${refFailures.length}:`);
  for (const d of refFailures) line(`     ${d}`);
}

line('');
line('── defeat candidates ─────────────────────────────────────────────────');
let killed = 0;
for (const c of CANDIDATES) {
  const dead: string[] = [];
  for (const f of FALSIFIERS) {
    if (!f.run(c.composer).pass) dead.push(f.id);
  }
  const onTarget = dead.includes(c.targets);
  const collateral = dead.filter((d) => d !== c.targets);
  const declared = c.classifiedCollateral ?? {};
  const unclassified = collateral.filter((d) => declared[d] === undefined);

  if (!onTarget) {
    failed += 1;
    line(`  ❌ ${c.id} SURVIVED ${c.targets} — repair the SUITE, never the candidate`);
    continue;
  }
  killed += 1;
  if (unclassified.length === 0) {
    const note = collateral.length > 0 ? ` · ${collateral.length} CLASSIFIED collateral` : '';
    line(`  ✅ ${c.id} KILLED on ${c.targets}${note}`);
  } else {
    failed += 1;
    line(`  ❌ ${c.id} KILLED on target but UNCLASSIFIED collateral: ${unclassified.join(', ')}`);
  }
}

line('');
line('── verdict ───────────────────────────────────────────────────────────');
line(`  laws        ${FALSIFIERS.length}`);
line(`  candidates  ${CANDIDATES.length}`);
line(`  killed      ${killed}/${CANDIDATES.length}`);
line(failed === 0
  ? '  ⭐ MATRIX LETHAL + DISCRIMINATING'
  : `  ⛔ ${failed} problem(s) — the suite is not yet evidence`);
process.exit(failed === 0 ? 0 : 1);
