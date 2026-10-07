import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const parent = readFileSync(resolve(root, 'docs/programme/RGR-05_FLOW_PRIMITIVE_CHALLENGE_2026-10-07.md'), 'utf8');
const result = readFileSync(resolve(root, 'docs/programme/RGR-05A_FLOW_REDUCIBILITY_RESULT_2026-10-07.md'), 'utf8');
const sources = readFileSync(resolve(root, 'docs/programme/RGR-05A_SOURCE_GROUNDING_2026-10-07.md'), 'utf8');

assert.ok(parent.includes('Flow as primitive #11: CANDIDATE_UNESTABLISHED'));
assert.ok(result.includes('M0 SURVIVES. M1 HAS NOT EARNED PRIMITIVE STATUS.'));
assert.ok(result.includes('**RGR-05A standing: CLOSED.**'));
assert.ok(result.includes('Flow should be treated as a first-class derived dynamical object'));
assert.ok(result.includes('FLOW: NOT EARNED'));
assert.ok(result.includes('FLOW: STRONGLY SUPPORTED AS A FIRST-CLASS DERIVED OBJECT'));
assert.ok(result.includes('Runtime status'));
assert.ok(result.includes('RGR-05B:'));
assert.ok(result.includes('OPEN BY FOUNDER ACT'));
assert.ok(result.includes('NOT AUTHORIZED'));
assert.ok(sources.includes('Only class 1 is used to decide whether Flow currently requires universal primitive status.'));
assert.ok(sources.includes('FORMAL PRIMITIVE #11: NOT EARNED'));
assert.ok(sources.includes('FIRST-CLASS DERIVED AIN OBJECT: RECOMMENDED'));

const porcelain = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8' }).split('\n').filter((line) => line.trim().length > 0);
const allowed = new Set([
  'docs/programme/RGR-05A_FLOW_REDUCIBILITY_RESULT_2026-10-07.md',
  'docs/programme/RGR-05A_SOURCE_GROUNDING_2026-10-07.md',
  'docs/programme/RGR-05A_WORK_UNIT_2026-10-07.json',
  'tests/constitutional/rgr-flow-05a/matrix.mjs',
]);
for (const line of porcelain) {
  const raw = line.slice(3);
  const path = raw.includes(' -> ') ? raw.split(' -> ').at(-1) : raw;
  assert.ok(allowed.has(path), `RGR-05A scope escape: ${path}`);
}

console.log(JSON.stringify({
  matrix: 'RGR-05A-FLOW-REDUCIBILITY',
  m0: 'SURVIVES',
  m1: 'NOT_EARNED',
  architecturalFlow: 'FIRST_CLASS_DERIVED_OBJECT',
  runtimeAuthority: false,
  memberFacingAuthority: false,
  scope: 'PASS'
}, null, 2));
