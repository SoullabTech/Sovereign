import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const rgr02 = readFileSync(resolve(root, 'docs/programme/RGR-02_FORMAL_VOCABULARY_CANDIDATE_STRUCTURES_2026-09-18.md'), 'utf8');
const rgr05 = readFileSync(resolve(root, 'docs/programme/RGR-05_FLOW_PRIMITIVE_CHALLENGE_2026-10-07.md'), 'utf8');
const contract = readFileSync(resolve(root, 'docs/programme/AIN-OS-FLOW-INTEGRATION-CONTRACT_2026-10-07.md'), 'utf8');

const canonical = [
  'ENTITY / STATE',
  'RELATION',
  'TRANSFORMATION',
  'EQUIVALENCE / INVARIANT',
  'CONTEXT',
  'PERSPECTIVE',
  'TRAJECTORY',
  'BOUNDARY',
  'COMPATIBILITY',
  'OBSTRUCTION',
];

for (const primitive of canonical) assert.ok(rgr02.includes(primitive), `RGR-02 missing canonical heading: ${primitive}`);
assert.ok(rgr05.includes('Flow as primitive #11: CANDIDATE_UNESTABLISHED'));
assert.ok(rgr05.includes('RGR-05 does not rewrite RGR-02.'));
assert.ok(rgr05.includes('No carrier may inherit the standing of another'));
assert.ok(rgr05.includes('F05-1 COMPLETE REDUCTION'));
assert.ok(rgr05.includes('Stage 05D — AIN Flow Witness shadow'));
assert.ok(contract.includes('This document does not authorize runtime use.'));
assert.ok(contract.includes('RELATION ≠ FLOW'));
assert.ok(contract.includes('FLOW ≠ ENERGY'));
assert.ok(contract.includes('FLOW PATTERN ≠ PERSON'));

const porcelain = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const allowed = new Set([
  'docs/programme/RGR-05_FLOW_PRIMITIVE_CHALLENGE_2026-10-07.md',
  'docs/programme/AIN-OS-FLOW-INTEGRATION-CONTRACT_2026-10-07.md',
  'docs/programme/RGR-05_WORK_UNIT_2026-10-07.json',
  'tests/constitutional/rgr-flow/matrix.mjs',
]);
for (const line of porcelain) {
  const raw = line.slice(3);
  const path = raw.includes(' -> ') ? raw.split(' -> ').at(-1) : raw;
  assert.ok(allowed.has(path), `RGR-05 scope escape: ${path}`);
}

console.log(JSON.stringify({
  matrix: 'RGR-05-FLOW-PRIMITIVE-CHALLENGE',
  canonicalPrimitiveHeadingsPreserved: canonical.length,
  flowPrimitiveStanding: 'CANDIDATE_UNESTABLISHED',
  runtimeAuthority: false,
  memberFacingAuthority: false,
  scope: 'PASS',
}, null, 2));
