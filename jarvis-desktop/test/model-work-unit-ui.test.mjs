import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const UI = require('../src/model-work-unit-ui.js');

const localReady = {
  outcome: 'READY',
  admission: {
    disposition: null,
    orchestration: {
      status: 'READY',
      executable: true,
      route_plan_id: 'route-proof-01',
      plan: {
        primary: { provider_id: 'gpt-oss-local', role: 'reasoning_worker', external_network: false, provider_standing: 'local-established' },
        challengers: [
          { provider_id: 'qwen-local', role: 'local_challenger', external_network: false, provider_standing: 'local-established' },
        ],
      },
      stages: [{ role: 'primary' }, { role: 'challenger' }],
      budgets: { model_stage_budget: 2, external_call_budget: 0, external_calls_planned: 0 },
    },
  },
};

test('Work Unit id validation is local preflight only and path-safe', () => {
  assert.deepEqual(UI.validateWorkUnitId('alpha-work-01'), { ok: true, id: 'alpha-work-01', error: null });
  assert.equal(UI.validateWorkUnitId('../alpha').ok, false);
  assert.equal(UI.validateWorkUnitId('UPPER').ok, false);
  assert.equal(UI.validateWorkUnitId('x').ok, false);
});

test('READY local plan exposes only role/standing/budget presentation facts', () => {
  const s = UI.summarizePlan(localReady, 'alpha-work-01');
  assert.equal(s.status, 'READY');
  assert.equal(s.ready_to_execute, true);
  assert.deepEqual(s.primary, {
    provider_id: 'gpt-oss-local', role: 'reasoning worker', locality: 'LOCAL', provider_standing: 'local established',
  });
  assert.equal(s.challengers[0].provider_id, 'qwen-local');
  assert.equal(s.challengers[0].locality, 'LOCAL');
  assert.deepEqual(s.budget, { stages_planned: 2, stage_budget: 2, external_calls_planned: 0, external_call_budget: 0 });
  assert.equal(s.blocker, null);
  assert.ok(!JSON.stringify(s).includes('routing_profile'));
  assert.ok(!JSON.stringify(s).includes('authorized_acts'));
});

test('external-deep plan is visibly external without exposing editable routing metadata', () => {
  const response = structuredClone(localReady);
  response.admission.orchestration.plan.primary = {
    provider_id: 'nemotron-tinker', role: 'deep_reasoner', external_network: true, provider_standing: 'external-candidate',
  };
  response.admission.orchestration.plan.challengers = [{
    provider_id: 'inkling-tinker', role: 'adversarial_challenger', external_network: true, provider_standing: 'evaluation-only',
  }];
  response.admission.orchestration.budgets = { model_stage_budget: 2, external_call_budget: 2, external_calls_planned: 2 };
  const s = UI.summarizePlan(response, 'external-review-01');
  assert.equal(s.primary.locality, 'EXTERNAL');
  assert.equal(s.challengers[0].locality, 'EXTERNAL');
  assert.equal(s.budget.external_calls_planned, 2);
  assert.equal(s.budget.external_call_budget, 2);
});

test('execution guard binds route identity, stages, and both budgets', () => {
  const first = UI.summarizePlan(localReady, 'alpha-work-01');
  const guard1 = UI.executionGuard(localReady, first);
  const same = structuredClone(localReady);
  const guard2 = UI.executionGuard(same, UI.summarizePlan(same, 'alpha-work-01'));
  assert.equal(guard1, guard2);

  const budgetChanged = structuredClone(localReady);
  budgetChanged.admission.orchestration.budgets.model_stage_budget = 3;
  const guard3 = UI.executionGuard(
    budgetChanged, UI.summarizePlan(budgetChanged, 'alpha-work-01'));
  assert.notEqual(guard1, guard3);

  const routeChanged = structuredClone(localReady);
  routeChanged.admission.orchestration.route_plan_id = 'route-proof-02';
  const guard4 = UI.executionGuard(routeChanged, UI.summarizePlan(routeChanged, 'alpha-work-01'));
  assert.notEqual(guard1, guard4);
});

test('typed blocker never becomes executable', () => {
  const blocked = {
    outcome: 'STAGE_BUDGET_EXCEEDED',
    admission: { orchestration: {
      status: 'STAGE_BUDGET_EXCEEDED', executable: false,
      plan: localReady.admission.orchestration.plan,
      stages: [{}, {}], model_stage_budget: 1, reason: 'two stages require a larger canonical budget',
    } },
  };
  const s = UI.summarizePlan(blocked, 'blocked-work-01');
  assert.equal(s.ready_to_execute, false);
  assert.equal(s.blocker.status, 'STAGE_BUDGET_EXCEEDED');
  assert.match(s.blocker.detail, /canonical budget/);
});

test('successful execution preserves planned roles but requires a fresh plan before another execution', () => {
  const plan = UI.summarizePlan(localReady, 'alpha-work-01');
  const s = UI.summarizeExecution({
    outcome: 'COMPLETE', disposition: 'READY_FOR_EXISTING_GATE',
    admission: { status: 'COMPLETE', disposition: 'READY_FOR_EXISTING_GATE' },
  }, plan);
  assert.equal(s.status, 'COMPLETE');
  assert.equal(s.disposition, 'READY_FOR_EXISTING_GATE');
  assert.equal(s.ready_to_execute, false);
  assert.equal(s.primary.provider_id, 'gpt-oss-local');
  assert.equal(s.blocker, null);
});

test('stopped execution is rendered as governed blocker, never upgraded', () => {
  const plan = UI.summarizePlan(localReady, 'alpha-work-01');
  const s = UI.summarizeExecution({
    outcome: 'STOPPED', disposition: 'REVIEW_REQUIRED',
    admission: { status: 'STOPPED', disposition: 'REVIEW_REQUIRED', orchestration: { disposition: 'REVIEW_REQUIRED' } },
  }, plan);
  assert.equal(s.status, 'STOPPED');
  assert.equal(s.disposition, 'REVIEW_REQUIRED');
  assert.equal(s.ready_to_execute, false);
  assert.equal(s.blocker.status, 'STOPPED');
});
