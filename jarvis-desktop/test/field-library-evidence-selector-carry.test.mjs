import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const CWU = require('../src/canonical-work-unit-v2.js');
const Control = require('../src/work-unit-control.js');
const root = path.resolve(new URL('../../', import.meta.url).pathname);
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const source = 'docs/programme/KELLYS-WORLD-LIVING-FIELD-LIBRARY-01_R9_DELIBERATIVE_WORK_UNIT_CENSUS_2026-10-01.md';

function spec(range = source + ':25-31') {
  return {
    objective: 'Deliberative Grokker synthesis',
    workClass: 'RESEARCH',
    taskShape: 'EVIDENCE_SYNTHESIS',
    capability: '',
    evidenceClass: 'E1_REPOSITORY_LOCAL',
    requestedPosture: 'local_only',
    reviewPressure: 'high_value_uncertain',
    evidenceFocus: range,
    acceptanceCriteria: 'preserve source custody',
    falsificationConditions: 'scope widens',
    stopConditions: 'stop before write',
    authorityRequest: { networkExternal:false, providerSpend:false, externalDisclosure:'none' },
  };
}

test('Desktop W0.v2 carries exact line selectors instead of widening them into path strings', () => {
  const built = CWU.canonicalInputFromSpec(spec(), { canonicalSha: sha, workUnitId: 'grokker-selector-test' });
  assert.equal(built.ok, true);
  assert.deepEqual(built.input.scope.allowed_paths, [source]);
  assert.deepEqual(built.input.scope.evidence_selectors, [{
    ref: source,
    selector: { type: 'lines', start: 25, end: 31 },
  }]);
});

test('malformed selector is refused rather than silently becoming whole-file authority', () => {
  const built = CWU.canonicalInputFromSpec(spec(source + ':31-25'), {
    canonicalSha: sha,
    workUnitId: 'grokker-selector-bad-range',
  });
  assert.equal(built.ok, false);
  assert.ok(built.blockers.some(b => b.code === 'INVALID_EVIDENCE_FOCUS'));
});

test('OpenCode containment preserves canonical line coordinates and does not expose unselected lines', () => {
  const original = execFileSync('git', ['show', sha + ':' + source], {
    cwd: root, encoding: 'utf8',
  }).split('\n');

  const workUnit = {
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    scope: {
      base_ref: sha,
      allowed_paths: [source],
      evidence_selectors: [{
        ref: source,
        selector: { type: 'lines', start: 25, end: 31 },
      }],
    },
  };
  const binding = {
    provider_id: 'gpt-oss-local',
    model_id: 'gpt-oss:20b',
    adapter_id: 'opencode',
  };

  const prepared = Control.prepareCanonicalOpenCodeContainment(root, workUnit, binding, process.env);
  assert.equal(prepared.ok, true);
  try {
    const materialized = fs.readFileSync(path.join(prepared.sandbox.workspace, source), 'utf8').split('\n');
    const expected = Array(31).fill('');
    for (let i = 24; i <= 30; i += 1) expected[i] = original[i];
    assert.deepEqual(materialized, expected);
  } finally {
    fs.rmSync(prepared.runtime.runRoot, { recursive: true, force: true });
  }
});
