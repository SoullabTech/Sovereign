#!/usr/bin/env node
// Proof: JARVIS multi-run planner + router integration (Alpha).
//
// Covers the parts that must hold with NO live runtime and NO model: bounding
// refusals, the router consumer edge, the dependency engine, result-contract
// refusal of empty evidence, independent verification, and the full
// APPROVE / REFUSE / AMEND governance vocabulary.
//
// The live end-to-end acceptance (real POST /runs → ain-delegate.sh → local
// worker) is deliberately NOT here: it needs a running runtime and Ollama, and
// a proof that silently stubs that seam is exactly how the seam stayed broken
// (see docs/ops/JARVIS_PLANNER_ROUTER_ALPHA.md, defect D1). Run it with:
//   node scripts/builder/jarvis-orchestrator.mjs execute \
//     --recipe runtime-canonical-audit --approve-plan --runtime <url>

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-planner-proof-'));
process.env.AIN_DELEGATION_HOME = HOME;

const { validateStep, validatePlan, buildPlan, topoOrder } = await import('../jarvis-plan.mjs');
const {
  routeStep, validateStepResult, runVerifier, createPlanRun, advance,
  resolveStepGate, submitStepResult, executeGraph, synthesize, cancelPlanRun,
} = await import('../jarvis-orchestrator.mjs');

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};
const tAsync = async (name, fn) => {
  try { await fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');

const okStep = (o = {}) => ({
  step_id: 'a-step',
  objective: 'Resolve the git HEAD commit of this checkout.',
  depends_on: [],
  capability: 'git.rev_parse',
  capability_args: { ref: 'HEAD' },
  authority: { scope: 'read-only' },
  completion_criterion: 'A hex sha is returned.',
  stop_condition: 'Not a git checkout.',
  result_contract: { requires_evidence: true, requires_tests: false },
  verification: { kind: 'capability', capability: 'git.rev_parse', args: { ref: 'HEAD' }, expect: { matches: '^[0-9a-f]{40}$' } },
});

console.log('\n§2 BOUNDING RULE');
t('accepts a bounded step', () => assert.equal(validateStep(okStep(), new Set(['a-step'])).ok, true));
t('rejects "Step 1: finish MAIA."', () => {
  const r = validateStep(okStep({ }), new Set(['a-step']));
  void r;
  const bad = validateStep({ ...okStep(), objective: 'Step 1: finish MAIA.' }, new Set(['a-step']));
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => e.includes('UNBOUNDED')), bad.errors.join('|'));
});
t('rejects a two-objective step', () => {
  const bad = validateStep({ ...okStep(), objective: 'Trace the canonical route and then measure vector coverage.' }, new Set(['a-step']));
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => e.includes('MULTI_OBJECTIVE')));
});
t('rejects a step with no completion criterion', () => {
  const s = okStep(); delete s.completion_criterion;
  assert.equal(validateStep(s, new Set(['a-step'])).ok, false);
});
t('rejects an undeclared verifier (§7 — absence must be declared)', () => {
  const s = okStep(); delete s.verification;
  const r = validateStep(s, new Set(['a-step']));
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.startsWith('verification:')));
});
t('rejects verification kind:none with no reason', () => {
  const s = { ...okStep(), verification: { kind: 'none' } };
  assert.equal(validateStep(s, new Set(['a-step'])).ok, false);
});
t('rejects an invented capability', () => {
  const s = { ...okStep(), capability: 'git.time_travel', capability_args: {} };
  assert.equal(validateStep(s, new Set(['a-step'])).ok, false);
});
t('rejects a misnamed capability argument at PLAN time', () => {
  const s = { ...okStep(), capability: 'repo.find_file', capability_args: { name: 'x.mjs' } };
  const r = validateStep(s, new Set(['a-step']));
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("has no argument 'name'")), r.errors.join('|'));
});
t('rejects unlimited retry', () => {
  const s = { ...okStep(), on_failure: 'retry', max_retries: 99 };
  assert.equal(validateStep(s, new Set(['a-step'])).ok, false);
});

console.log('\n§1 PLANNER CONTRACT');
t('refuses to decompose a free-text objective', () => {
  const r = buildPlan({ objective: 'audit MAIA continuity' });
  assert.equal(r.ok, false);
  assert.equal(r.refusal, 'PLAN_UNRESOLVED');
});
t('builds a valid plan from a recipe', () => {
  const r = buildPlan({ recipe: 'runtime-canonical-audit', repo: REPO });
  assert.equal(r.ok, true, r.detail);
  assert.ok(r.plan.steps.length >= 4);
  assert.equal(r.plan.planning_strategy, 'recipe:runtime-canonical-audit');
});
t('rejects a plan whose step claims authority above the plan', () => {
  const r = validatePlan({
    plan_id: 'p1', objective: 'x', canonical_sha: 'abc1234', planning_strategy: 'explicit',
    authority_scope: 'read-only',
    steps: [{ ...okStep(), authority: { scope: 'founder-decision' } }],
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('exceeds plan authority_scope')));
});
t('detects a dependency cycle', () => {
  const r = topoOrder([
    { step_id: 'a', depends_on: ['b'] },
    { step_id: 'b', depends_on: ['a'] },
  ]);
  assert.equal(r.ok, false);
});

console.log('\n§3 ROUTER CONSUMER EDGE (existing router, no second classifier)');
t('a registered capability routes C0', () => assert.equal(routeStep(okStep()).execution_lane, 'C0'));
t('a bounded local step routes C1', () => {
  const s = { ...okStep() }; delete s.capability; delete s.capability_args; s.bounded_for_local = true;
  assert.equal(routeStep(s).execution_lane, 'C1');
});
t('neither → C3 (needs stronger reasoning)', () => {
  const s = { ...okStep() }; delete s.capability; delete s.capability_args;
  assert.equal(routeStep(s).execution_lane, 'C3');
});
t('oversized local packet is REJECTED, not escalated', () => {
  const s = { ...okStep(), packet: { blob: 'x'.repeat(5000) } };
  delete s.capability; delete s.capability_args; s.bounded_for_local = true;
  const d = routeStep(s);
  assert.equal(d.status, 'rejected_oversized');
  assert.equal(d.execution_lane, null);
});

console.log('\n§6 RESULT CONTRACT — empty evidence cannot be PASS');
const fullResult = {
  status: 'ok', objective: 'o', evidence: 'abc123', tests: 'n/a', artifacts: [],
  findings: [], uncertainties: [], authority_boundary: 'read-only', recommended_next_action: 'none',
};
t('accepts a complete result', () => assert.equal(validateStepResult(okStep(), fullResult).ok, true));
t('refuses empty evidence', () => {
  const r = validateStepResult(okStep(), { ...fullResult, evidence: '' });
  assert.equal(r.ok, false);
  assert.ok(r.errors[0].includes('evidence is empty'));
});
t('refuses missing contract fields', () => {
  const { findings, ...missing } = fullResult; void findings;
  assert.equal(validateStepResult(okStep(), missing).ok, false);
});
t("refuses tests:'not_run' when tests are required", () => {
  const s = { ...okStep(), result_contract: { requires_evidence: true, requires_tests: true } };
  assert.equal(validateStepResult(s, { ...fullResult, tests: 'not_run' }).ok, false);
});

console.log('\n§7 VERIFICATION — claim ≠ verified');
t('a real verifier confirms a real fact', () => {
  const v = runVerifier(okStep(), REPO);
  assert.equal(v.verified, true, JSON.stringify(v));
  assert.equal(v.confidence_label, 'verified');
});
t('a verifier that does not match refuses', () => {
  const s = { ...okStep(), verification: { ...okStep().verification, expect: { equals: 'deadbeef' } } };
  assert.equal(runVerifier(s, REPO).verified, false);
});
t('kind:none yields "claimed", never "verified"', () => {
  const s = { ...okStep(), verification: { kind: 'none', reason: 'no deterministic verifier exists' } };
  const v = runVerifier(s, REPO);
  assert.equal(v.verified, false);
  assert.equal(v.confidence_label, 'claimed');
});

console.log('\n§5/§8 DEPENDENCY ENGINE + GOVERNANCE');
const govPlan = () => buildPlan({ recipe: 'governance-boundary-probe', repo: REPO }).plan;

await tAsync('safe branch completes while the governed branch pauses', async () => {
  const pr = createPlanRun(govPlan()).plan_run;
  pr.approved = true;
  const r = await executeGraph(pr, { client: { createRun: async () => { throw new Error('no C1 in this proof'); } } });
  assert.equal(r.ok, true);
  assert.equal(r.plan_run.steps['safe-head'].state, 'PASSED');
  assert.equal(r.plan_run.steps['safe-followup'].state, 'PASSED', 'independent branch must NOT be stalled by the pause');
  assert.equal(r.plan_run.steps['governed-decision'].state, 'PAUSED_FOR_GOVERNANCE');
  assert.equal(r.plan_run.steps['downstream-of-decision'].state, 'BLOCKED');
  assert.equal(r.plan_run.state, 'AWAITING_AUTHORITY');
});

await tAsync('the gate carries a question, a digest and its affected downstream', async () => {
  const pr = createPlanRun(govPlan()).plan_run;
  pr.approved = true;
  const r = await executeGraph(pr, { client: {} });
  const g = r.plan_run.steps['governed-decision'].gate;
  assert.ok(g.question.length > 20);
  assert.match(g.objective_digest, /^[0-9a-f]{64}$/);
  assert.deepEqual(g.affected_downstream, ['downstream-of-decision']);
  assert.deepEqual(g.resolution_vocabulary, ['APPROVE', 'REFUSE', 'AMEND']);
});

await tAsync('REFUSE closes the branch and permanently blocks downstream', async () => {
  const pr = createPlanRun(govPlan()).plan_run;
  pr.approved = true;
  const r = await executeGraph(pr, { client: {} });
  const res = resolveStepGate(r.plan_run, 'governed-decision', { resolution_type: 'REFUSE', rationale: 'not authorized' });
  assert.equal(res.ok, true);
  assert.equal(res.plan_run.steps['governed-decision'].state, 'REFUSED');
  assert.equal(res.plan_run.steps['downstream-of-decision'].state, 'BLOCKED');
  assert.equal(res.plan_run.steps['downstream-of-decision'].recoverable, false);
});

await tAsync('APPROVE grants authority WITHOUT auto-calling a frontier model', async () => {
  const pr = createPlanRun(govPlan()).plan_run;
  pr.approved = true;
  const r = await executeGraph(pr, { client: {} });
  const res = resolveStepGate(r.plan_run, 'governed-decision', { resolution_type: 'APPROVE', rationale: 'authorized' });
  assert.equal(res.plan_run.steps['governed-decision'].state, 'AWAITING_FOUNDER_LANE');

  const sub = submitStepResult(res.plan_run, 'governed-decision', {
    ...fullResult, objective: 'decision', evidence: 'founder ruling recorded', authority_boundary: 'founder-decision',
  });
  assert.equal(sub.ok, true);
  assert.equal(sub.plan_run.steps['governed-decision'].state, 'PASSED');
  assert.equal(sub.plan_run.steps['governed-decision'].verification.confidence_label, 'claimed');
  assert.equal(sub.plan_run.steps['downstream-of-decision'].state, 'READY');
});

await tAsync('an approved step still refuses an empty-evidence result', async () => {
  const pr = createPlanRun(govPlan()).plan_run;
  pr.approved = true;
  const r = await executeGraph(pr, { client: {} });
  resolveStepGate(r.plan_run, 'governed-decision', { resolution_type: 'APPROVE', rationale: 'ok' });
  const sub = submitStepResult(r.plan_run, 'governed-decision', { ...fullResult, evidence: '' });
  assert.equal(sub.ok, false);
  assert.equal(r.plan_run.steps['governed-decision'].state, 'FAILED');
});

await tAsync('AMEND re-opens the step and re-validates the plan', async () => {
  const pr = createPlanRun(govPlan()).plan_run;
  pr.approved = true;
  const r = await executeGraph(pr, { client: {} });
  const res = resolveStepGate(r.plan_run, 'governed-decision', {
    resolution_type: 'AMEND', rationale: 'narrow to something read-only',
    amend: { objective: 'Record the git HEAD sha as the pre-cutover provenance marker.', authority: { scope: 'read-only' } },
  });
  assert.equal(res.ok, true);
  assert.equal(res.plan_run.steps['governed-decision'].state, 'READY');
  assert.equal(res.plan_run.steps['governed-decision'].amendments.length, 1);
});

await tAsync('AMEND that produces an unbounded objective is REJECTED and rolled back', async () => {
  const pr = createPlanRun(govPlan()).plan_run;
  pr.approved = true;
  const r = await executeGraph(pr, { client: {} });
  const before = r.plan_run.plan.steps.find((s) => s.step_id === 'governed-decision').objective;
  const res = resolveStepGate(r.plan_run, 'governed-decision', {
    resolution_type: 'AMEND', rationale: 'sloppy', amend: { objective: 'just finish it' },
  });
  assert.equal(res.ok, false);
  assert.equal(res.refusal, 'AMENDMENT_INVALID');
  assert.equal(r.plan_run.plan.steps.find((s) => s.step_id === 'governed-decision').objective, before);
});

t('a resolution without a rationale is refused', () => {
  const pr = createPlanRun(govPlan()).plan_run;
  pr.steps['governed-decision'].state = 'PAUSED_FOR_GOVERNANCE';
  pr.steps['governed-decision'].gate = { gate_id: 'g', resolution_vocabulary: ['APPROVE'] };
  const res = resolveStepGate(pr, 'governed-decision', { resolution_type: 'APPROVE', rationale: '  ' });
  assert.equal(res.ok, false);
  assert.equal(res.refusal, 'RATIONALE_REQUIRED');
});

console.log('\n§11 APPROVAL + §10 COST OBSERVABILITY');
await tAsync('execution refuses an unapproved plan', async () => {
  const pr = createPlanRun(govPlan()).plan_run;
  const r = await executeGraph(pr, { client: {} });
  assert.equal(r.ok, false);
  assert.equal(r.refusal, 'PLAN_NOT_APPROVED');
});
await tAsync('cost is recorded per step and marked PARTIAL', async () => {
  const pr = createPlanRun(govPlan()).plan_run;
  pr.approved = true;
  const r = await executeGraph(pr, { client: {} });
  const s = synthesize(r.plan_run);
  assert.match(s.cost_observability.classification, /^PARTIAL/);
  assert.ok(s.cost_observability.rows.length >= 2);
  assert.ok(s.cost_observability.rows.every((row) => row.lane && typeof row.wall_ms === 'number'));
  assert.equal(s.model_synthesis, false);
});
await tAsync('cancel settles every unsettled step', async () => {
  const pr = createPlanRun(govPlan()).plan_run;
  pr.approved = true;
  const r = await executeGraph(pr, { client: {} });
  const c = cancelPlanRun(r.plan_run, 'proof');
  assert.equal(c.state, 'CANCELLED');
  assert.ok(Object.values(c.steps).every((s) => ['PASSED', 'CANCELLED', 'FAILED', 'REFUSED'].includes(s.state)));
});

t('advance() is idempotent', () => {
  const pr = createPlanRun(govPlan()).plan_run;
  advance(pr);
  const first = JSON.stringify(Object.fromEntries(Object.entries(pr.steps).map(([k, v]) => [k, v.state])));
  advance(pr);
  assert.equal(JSON.stringify(Object.fromEntries(Object.entries(pr.steps).map(([k, v]) => [k, v.state]))), first);
});

console.log(`\n${pass} passed · ${fail} failed\n`);
try { fs.rmSync(HOME, { recursive: true, force: true }); } catch { /* best effort */ }
process.exit(fail === 0 ? 0 : 1);
