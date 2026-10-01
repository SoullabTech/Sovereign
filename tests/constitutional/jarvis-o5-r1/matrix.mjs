#!/usr/bin/env node
/**
 * JARVIS O5-R1 — EXECUTION MATRIX.
 *
 * PASS requires ALL of:
 *   1. the reference double passes F1…F8 (the laws are mutually satisfiable);
 *   2. every defeat candidate DIES on its named falsifier (LETHAL);
 *   3. every falsifier is the named killer of at least one candidate;
 *   4. every extra death is CLASSIFIED collateral with a stated reason
 *      (irreducible: removing it would un-make the candidate's error);
 *      an UNCLASSIFIED death is an isolation defect → exit 1 (DISCRIMINATING);
 *   5. every declared collateral actually occurs (no stale declarations).
 */
import { FALSIFIERS } from './falsifiers.mjs';
import { REFERENCE } from './reference.mjs';
import { CANDIDATES } from './candidates.mjs';

const ids = Object.keys(FALSIFIERS);
let bad = 0;
const out = (s) => process.stdout.write(`${s}\n`);

out('JARVIS O5-R1 · Execution Continuity & Recovery · falsifier matrix');
out('Recovery preserves lawful consequence, not merely computational position.\n');

out('Reference double:');
for (const id of ids) {
  const r = FALSIFIERS[id](REFERENCE);
  out(`  ${id} ${r.pass ? 'PASS' : 'FAIL'}${r.pass ? '' : `  ${r.failures.join(' | ')}`}`);
  if (!r.pass) bad += 1;
}

const namedKillers = new Set();
out('\nDefeat candidates:');
for (const c of CANDIDATES) {
  const deaths = ids.filter((id) => !FALSIFIERS[id](c.decisions).pass);
  const namedDied = deaths.includes(c.named);
  if (namedDied) namedKillers.add(c.named);
  const extra = deaths.filter((id) => id !== c.named);
  const unclassified = extra.filter((id) => !(id in c.collateral));
  const stale = Object.keys(c.collateral).filter((id) => !deaths.includes(id));
  const verdict = namedDied && !unclassified.length && !stale.length ? 'KILLED' : 'DEFECT';
  if (verdict !== 'KILLED') bad += 1;
  out(`  ${c.id} → ${verdict} on ${c.named}${namedDied ? '' : ' (SURVIVED — repair the suite)'}`);
  out(`        ${c.law}`);
  for (const id of extra) out(`        + ${id} ${id in c.collateral ? `CLASSIFIED: ${c.collateral[id]}` : 'UNCLASSIFIED'}`);
  for (const id of stale) out(`        ! declared collateral ${id} did not occur (stale)`);
}

const orphan = ids.filter((id) => !namedKillers.has(id));
if (orphan.length) { bad += 1; out(`\nFalsifiers with no candidate proven killed by them: ${orphan.join(', ')}`); }

out(`\n${bad === 0 ? 'MATRIX LETHAL + DISCRIMINATING' : `MATRIX DEFECT (${bad})`}`);
process.exit(bad === 0 ? 0 : 1);
