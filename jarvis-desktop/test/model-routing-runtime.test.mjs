import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const MECH = require('../src/builder-mechanism.js');
const REPO_ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const MAIN = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const PRELOAD = fs.readFileSync(new URL('../src/preload.js', import.meta.url), 'utf8');

test('model routing mechanism is additive to the existing Builder mechanism', () => {
  assert.ok(Array.isArray(MECH.MECHANISM_MODULES));
  assert.ok(Array.isArray(MECH.MODEL_ROUTING_MODULES));
  assert.ok(!MECH.MECHANISM_MODULES.includes('model-orchestrator.mjs'));
  assert.ok(MECH.MODEL_ROUTING_MODULES.includes('model-runtime-admission.mjs'));
  assert.ok(MECH.MODEL_ROUTING_MODULES.includes('model-orchestrator.mjs'));
});

test('model routing resolves only from the bound repository', () => {
  const missing = MECH.modelRoutingState(null);
  assert.equal(missing.available, false);
  assert.match(missing.reason, /no repository is bound/);

  const live = MECH.modelRoutingState(REPO_ROOT);
  assert.equal(live.available, true, live.reason);
  assert.equal(live.source, path.join(REPO_ROOT, 'scripts', 'builder'));
  assert.equal(live.delegate_present, true);
});

test('bound Desktop mechanism can plan a real canonical Work Unit without executing a model', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-desktop-model-plan-'));
  fs.mkdirSync(path.join(home, 'packets'), { recursive: true });
  const prior = process.env.AIN_DELEGATION_HOME;
  process.env.AIN_DELEGATION_HOME = home;
  try {
    const id = 'desktop-model-plan-proof';
    fs.writeFileSync(path.join(home, 'packets', `${id}.json`), JSON.stringify({
      work_unit_id: id,
      title: 'Desktop model plan proof',
      objective: 'Plan synthetic architecture review.',
      execution_lane: 'provider-evaluation',
      canonical_sha: 'abcdef1',
      branch: 'chore/desktop-model-plan-proof',
      worktree: null,
      governing_authority: 'proof',
      established_facts: [],
      allowed_files: ['NO FILES — plan proof only'],
      prohibited_files_actions: [],
      acceptance_criteria: [],
      verification_commands: [],
      escalation_conditions: [],
      max_attempts: 1,
      expected_output: 'plan only',
      task_class: 'architecture',
      risk_class: 'high',
      routing_profile: 'local-first',
      review_policy: 'auto',
      data_class: 'repo_nonconfidential',
      external_review: false,
      external_tiebreaker: false,
      model_stage_budget: 2,
      external_call_budget: 0,
      authorized_acts: ['repo.read'],
      not_authorized_acts: [
        'repo.write:worktree', 'network.external', 'provider.spend',
        'production.read', 'production.write', 'deploy', 'authority.change',
      ],
    }, null, 2));

    const out = await MECH.planModelWorkUnit(REPO_ROOT, id);
    assert.equal(out.outcome, 'READY');
    assert.equal(out.submitted, false);
    assert.equal(out.admission.executed, false);
    assert.equal(out.admission.orchestration.stages[0].provider_id, 'gpt-oss-local');
    assert.equal(out.admission.orchestration.stages[1].provider_id, 'qwen-local');
  } finally {
    if (prior === undefined) delete process.env.AIN_DELEGATION_HOME;
    else process.env.AIN_DELEGATION_HOME = prior;
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('planning calls the bound canonical admission module and never reports execution', async () => {
  let calls = 0;
  const out = await MECH.planModelWorkUnit(REPO_ROOT, 'runtime-plan-unit', {
    async runAdmission({ root, script, action, workUnitId }) {
      calls++;
      assert.equal(root, REPO_ROOT);
      assert.equal(script, path.join(REPO_ROOT, 'scripts', 'builder', 'model-runtime-admission.mjs'));
      assert.equal(action, 'plan');
      assert.equal(workUnitId, 'runtime-plan-unit');
      return { code: 0, stdout: JSON.stringify({ admitted: true, executed: false, status: 'READY', disposition: null }), stderr: '' };
    },
  });
  assert.equal(calls, 1);
  assert.equal(out.submitted, false);
  assert.equal(out.outcome, 'READY');
  assert.equal(out.admission.executed, false);
});

test('typed governed refusal survives a non-zero admission child exit', async () => {
  const out = await MECH.executeModelWorkUnit(REPO_ROOT, 'runtime-blocked-unit', {
    async runAdmission() {
      return {
        code: 1,
        stdout: JSON.stringify({
          admitted: false, executed: false, status: 'EXTERNAL_CALL_BUDGET_EXCEEDED', disposition: null,
        }),
        stderr: 'typed refusal',
      };
    },
  });
  assert.equal(out.submitted, false);
  assert.equal(out.outcome, 'EXTERNAL_CALL_BUDGET_EXCEEDED');
  assert.equal(out.child_exit_code, 1);
});

test('explicit execute passes through one completed orchestration without reinterpretation', async () => {
  let calls = 0;
  const out = await MECH.executeModelWorkUnit(REPO_ROOT, 'runtime-execute-unit', {
    async runAdmission({ action }) {
      calls++;
      assert.equal(action, 'execute');
      return {
        code: 0,
        stdout: JSON.stringify({
          admitted: true, executed: true, status: 'COMPLETE', disposition: 'READY_FOR_EXISTING_GATE',
        }),
        stderr: '',
      };
    },
  });
  assert.equal(calls, 1);
  assert.equal(out.submitted, true);
  assert.equal(out.outcome, 'COMPLETE');
  assert.equal(out.disposition, 'READY_FOR_EXISTING_GATE');
});

test('invalid admission output is named rather than guessed', async () => {
  const out = await MECH.planModelWorkUnit(REPO_ROOT, 'runtime-invalid-output', {
    async runAdmission() { return { code: 1, stdout: 'not-json', stderr: 'bad child' }; },
  });
  assert.equal(out.submitted, false);
  assert.equal(out.outcome, 'MODEL_ADMISSION_INVALID_OUTPUT');
  assert.match(out.reason, /bad child/);
});

test('main owns one model-runtime channel, request shape, and explicit execution confirmation', () => {
  assert.match(MAIN, /jarvis:model-work-unit/);
  assert.ok(!MAIN.includes('jarvis:plan-model-work-unit'));
  assert.ok(!MAIN.includes('jarvis:execute-model-work-unit'));
  assert.match(MAIN, /action !== 'plan' && action !== 'execute'/);
  assert.match(MAIN, /confirm_execute !== true/);
  assert.match(MAIN, /EXPLICIT_EXECUTION_CONFIRMATION_REQUIRED/);
  assert.match(MAIN, /unsupported fields/);
  assert.match(MAIN, /MECH\.planModelWorkUnit\(currentRoot\(\), shaped\.work_unit_id\)/);
  assert.match(MAIN, /MECH\.executeModelWorkUnit\(currentRoot\(\), shaped\.work_unit_id\)/);
});

test('renderer preload membrane remains closed to model execution channel', () => {
  assert.ok(!PRELOAD.includes('jarvis:model-work-unit'),
    'jarvis:model-work-unit must not be exposed before preload authority is ratified');
});
