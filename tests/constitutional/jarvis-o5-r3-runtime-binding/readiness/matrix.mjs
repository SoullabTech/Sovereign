#!/usr/bin/env node
/** O5-R3 RB-A3 — Runtime Binding Readiness matrix. */
import fs from 'node:fs';
import path from 'node:path';
import { RD_FALSIFIERS, ROOT } from './falsifiers.mjs';
import { REAL, RD_CANDIDATES } from './candidates.mjs';

let bad = 0;
const out = (s) => process.stdout.write(`${s}\n`);
out('O5-R3 · runtime binding readiness · RB-A3');

const ids = Object.keys(RD_FALSIFIERS);
for (const id of ids) {
  const r = await RD_FALSIFIERS[id](REAL);
  out(`  ${id} real ${r.pass ? 'PASS' : 'FAIL'}${r.pass ? '' : '  ' + r.failures.join(' | ')}`);
  if (!r.pass) bad += 1;
}
const killers = new Set();
for (const c of RD_CANDIDATES) {
  const deaths = [];
  let why = '';
  for (const id of ids) {
    const r = await RD_FALSIFIERS[id](c.subject);
    if (!r.pass) { deaths.push(id); if (id === c.named) why = r.failures[0]; }
  }
  const namedDied = deaths.includes(c.named);
  if (namedDied) killers.add(c.named);
  const extra = deaths.filter((id) => id !== c.named);
  const ok = namedDied && extra.length === 0;
  if (!ok) bad += 1;
  out(`  ${c.id} → ${ok ? 'KILLED' : 'DEFECT'} on ${c.named}${namedDied ? '' : ' (SURVIVED)'}`);
  out(`        ${c.law}`);
  if (why) out(`        why: ${why}`);
  if (extra.length) out(`        unclassified collateral: ${extra.join(', ')}`);
}
const orphan = ids.filter((id) => !killers.has(id));
if (orphan.length) { bad += 1; out(`  falsifiers with no proven kill: ${orphan.join(', ')}`); }

out('\nRD-W · wiring');
const witness = fs.readFileSync(path.join(ROOT, 'scripts/witness/o5-r3-runtime-witness.mjs'), 'utf8');
const helper = fs.readFileSync(path.join(ROOT, 'scripts/witness/o5-r3-binding-readiness.mjs'), 'utf8');
const record = fs.readFileSync(path.join(ROOT, 'docs/programme/JARVIS-ORCHESTRATION-OPERATOR-01_O5-R3_RUNTIME_BINDING_WITNESS_2026-10-01.md'), 'utf8');
const checks = [
  ['RD-W1 witness imports the readiness classifier', /o5-r3-binding-readiness\.mjs/.test(witness)],
  ['RD-W2 bounded await-current option exists', /--await-current-ms/.test(witness) && /Date\.now\(\) >= deadline/.test(witness)],
  ['RD-W3 readiness is evaluated before C1', witness.indexOf('classifyBindingReadiness') < witness.indexOf("C('C1'")],
  ['RD-W4 timed-out readiness cannot pass C1', /live === 'LIVE' && \(awaitCurrentMs === 0 \|\| readiness\.ready\)/.test(witness)],
  ['RD-W5 Step 5 uses a bounded current-binding wait', /--phase pre-write --await-current-ms 60000 --snapshot ~\/o5r3-prewrite\.json/.test(record)],
  ['RD-W6 readiness helper is read-only classification only', !/writeFile|appendFile|renameSync|unlinkSync|rmSync/.test(helper)],
];
for (const [name, ok] of checks) {
  out(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) bad += 1;
}

out(`\n${bad === 0 ? 'MATRIX LETHAL + DISCRIMINATING · WIRING INTACT' : `MATRIX DEFECT (${bad})`}`);
process.exit(bad === 0 ? 0 : 1);
