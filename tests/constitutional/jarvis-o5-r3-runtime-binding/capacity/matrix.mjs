#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LC_FALSIFIERS, REAL_CAPACITY } from './falsifiers.mjs';
import { LC_CANDIDATES } from './candidates.mjs';

let bad = 0;
const out = (s) => process.stdout.write(s + '\n');
out('O5-R3 · E1 local capacity admission · RB-A6');

for (const [id, f] of Object.entries(LC_FALSIFIERS)) {
  const got = REAL_CAPACITY(f.model, f.sample);
  const ok = got.ok === f.ok && (f.ok || got.reason === f.reason);
  out(`  ${id} ${f.name} real ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) bad += 1;
}

for (const [id, c] of Object.entries(LC_CANDIDATES)) {
  const f = LC_FALSIFIERS[c.kills];
  const got = c.run(f.model, f.sample);
  const survives = got.ok === f.ok && (f.ok || got.reason === f.reason);
  out(`  ${id} → ${survives ? 'SURVIVED' : 'KILLED'} on ${c.kills} ${f.name}`);
  out('        ' + c.name);
  if (survives) bad += 1;
}const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const control = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/work-unit-control.js'), 'utf8');
const integration = fs.readFileSync(
  path.join(ROOT, 'jarvis-desktop/test/canonical-provider-execution-e1.test.mjs'), 'utf8',
);

out('\nLC-W · execution wiring');
const checks = [
  ['LC-W1 capacity module is part of canonical control',
    control.includes("require('./e1-local-capacity.js')")],
  ['LC-W2 final local-capacity admission precedes grant CLAIMED',
    control.indexOf('evaluateLocalCapacity(realization.runtime_model, sample)')
      < control.indexOf('claimCanonicalExecutionGrantV1(workUnitId, grantId')],
  ['LC-W3 capacity admission precedes ROUTED → EXECUTING',
    control.indexOf('evaluateLocalCapacity(realization.runtime_model, sample)')
      < control.indexOf("transitionCanonicalV2(root, workUnitId, 'EXECUTING'")],
  ['LC-W4 refusal preserves ACTIVE grant standing',
    control.includes("status: 'HELD_FOR_LOCAL_CAPACITY'")
      && control.includes("grant_standing: 'ACTIVE'")],
  ['LC-W5 exact governed realization is converted to its runtime model before capacity judgment',
    control.includes('canonicalLocalOllamaDirectRealization(binding)')
      && control.includes('realization.runtime_model')],
  ['LC-W6 integration proves no claim, lifecycle transition, attempt, or provider call on refusal',
    integration.includes('provider must not launch')
      && integration.includes("assert.equal(after.lifecycle.state, 'ROUTED')")
      && integration.includes("assert.equal(standing.standing, 'ACTIVE')")
      && integration.includes('assert.equal(runnerCalls, 0)')],
];for (const [name, ok] of checks) {
  out(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) bad += 1;
}

if (bad) {
  out(`\nMATRIX FAILED · ${bad} defect(s)`);
  process.exit(1);
}
out('\nMATRIX LETHAL + DISCRIMINATING · WIRING INTACT');
