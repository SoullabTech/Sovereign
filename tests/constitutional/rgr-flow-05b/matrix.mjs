import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const a = readFileSync(resolve(root, 'docs/programme/RGR-05A_FLOW_REDUCIBILITY_RESULT_2026-10-07.md'), 'utf8');
const b = readFileSync(resolve(root, 'docs/programme/RGR-05B_SYNTHETIC_FLOW_REPRESENTATION_BENCHMARK_2026-10-07.md'), 'utf8');

assert.ok(a.includes('**RGR-05A standing: CLOSED.**'));
assert.ok(b.includes('FLOW_D — first-class derived dynamical object'));
assert.ok(b.includes('Primitive #11:** NOT EARNED'));
assert.ok(b.includes('Receives exactly the same raw observable as View G.'));
assert.ok(b.includes('## CF-3 · Passage-field counterfactual'));
assert.ok(b.includes('graph topology;'));
assert.ok(b.includes('complete multiset of edge-attribute tuples'));
assert.ok(b.includes('## CF-4 · Coherent carrier relabeling invariance'));
assert.ok(b.includes('## CF-5 · Node relabeling invariance'));
assert.ok(b.includes('Task B — RETURN'));
assert.ok(b.includes('Elemental quarantine'));
assert.ok(b.includes('benchmark data:\nNOT MATERIALIZED'));
assert.ok(b.includes('MAIA runtime:\nUNCHANGED'));

const porcelain = execFileSync(
  'git',
  ['status', '--porcelain', '--untracked-files=all'],
  { cwd: root, encoding: 'utf8' },
).split('\n').filter((line) => line.trim().length > 0);

const allowed = new Set([
  'docs/programme/RGR-05B_SYNTHETIC_FLOW_REPRESENTATION_BENCHMARK_2026-10-07.md',
  'docs/programme/RGR-05B_BENCHMARK_DESIGN_RATIONALE_2026-10-07.md',
  'docs/programme/RGR-05B_WORK_UNIT_2026-10-07.json',
  'tests/constitutional/rgr-flow-05b/matrix.mjs',
]);

for (const line of porcelain) {
  const raw = line.slice(3);
  const path = raw.includes(' -> ') ? raw.split(' -> ').at(-1) : raw;
  assert.ok(allowed.has(path), `RGR-05B scope escape: ${path}`);
}

const forbidden = [
  'Fire labels',
  'Water labels',
  'Earth labels',
  'Air labels',
  'Aether labels',
];
for (const item of forbidden) assert.ok(b.includes(item));

console.log(JSON.stringify({
  matrix: 'RGR-05B-SYNTHETIC-FLOW-REPRESENTATION-BENCHMARK',
  rgr05aClosed: true,
  primitive11: 'NOT_EARNED',
  benchmarkMaterialized: false,
  runtimeAuthority: false,
  memberData: false,
  elementalPrimaryLabels: false,
  scope: 'PASS',
}, null, 2));
