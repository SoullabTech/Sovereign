#!/usr/bin/env node
import { LAW_IDS } from './contract.mjs';
import { REFERENCE } from './reference.mjs';
import { FALSIFIERS } from './falsifiers.mjs';
import { CANDIDATES } from './candidates.mjs';

let bad = 0;
const out = (s = '') => process.stdout.write(s + '\n');

out('JARVIS EXECUTION CONVERGENCE EC1-R3 · governed candidate-effect matrix');
out('Candidate standing is entailed by agreement among Work, grant, NPA1, Git, W4 and verification evidence.');
out();

out('Reference:');
for (const id of LAW_IDS) {
  const r = FALSIFIERS[id](REFERENCE);
  out(`  ${id} ${r.pass ? 'PASS' : 'FAIL: ' + r.failures.join(' | ')}`);
  if (!r.pass) bad += 1;
}

const namedKillers = new Set();
out();
out('Defeat candidates:');
for (const c of CANDIDATES) {
  const changed = Object.keys(REFERENCE).filter((k) => c.decisions[k] !== REFERENCE[k]);
  if (changed.length !== 1) {
    bad += 1;
    out(`  ${c.id} → DEFECT: changed decisions = ${changed.join(', ') || '<none>'}`);
    continue;
  }
  const deaths = LAW_IDS.filter((id) => !FALSIFIERS[id](c.decisions).pass);
  const namedDied = deaths.includes(c.named);
  if (namedDied) namedKillers.add(c.named);
  const extra = deaths.filter((id) => id !== c.named);
  const unclassified = extra.filter((id) => !(id in c.collateral));
  const stale = Object.keys(c.collateral).filter((id) => !deaths.includes(id));
  const verdict = namedDied && !unclassified.length && !stale.length ? 'KILLED' : 'DEFECT';
  if (verdict !== 'KILLED') bad += 1;
  out(`  ${c.id} → ${verdict} on ${c.named}${namedDied ? '' : ' (SURVIVED)'}`);
  out(`        ${c.law}`);
  for (const id of extra) {
    out(`        + ${id} ${id in c.collateral ? 'CLASSIFIED: ' + c.collateral[id] : 'UNCLASSIFIED'}`);
  }
  for (const id of stale) out(`        ! stale collateral declaration ${id}`);
}

const orphan = LAW_IDS.filter((id) => !namedKillers.has(id));
if (orphan.length) {
  bad += 1;
  out();
  out('Falsifiers with no named kill: ' + orphan.join(', '));
}

out();
out(bad === 0
  ? 'MATRIX LETHAL + DISCRIMINATING'
  : `MATRIX DEFECT (${bad})`);
process.exit(bad === 0 ? 0 : 1);
