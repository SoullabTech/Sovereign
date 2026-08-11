#!/usr/bin/env node
// JARVIS — multi-run orchestrator (Alpha).
//
// The bridge the fabric was missing:
//   objective → plan → bounded runs → lane selection → dependency execution → synthesis
//
// What this module DOES do:
//   - consume the EXISTING router (scripts/builder/router.mjs) — no second
//     classification system (§3)
//   - select a lane per step and execute it: C0 deterministic in-process,
//     C1 through the REAL runtime at POST /runs (§3, §4)
//   - run a dependency graph with explicit states (§5)
//   - validate every child result against a contract that refuses empty
//     evidence (§6)
//   - verify worker CLAIMS with independent deterministic verifiers (§7)
//   - pause at authority boundaries, block only what actually depends on the
//     pause, and let unrelated branches continue (§8)
//   - bounded retry / escalate / block, never unlimited retry (§9)
//   - record lane, model and wall time so later cost routing has evidence (§10)
//
// What this module DELIBERATELY does not do:
//   - decompose free-text objectives with a model (that lives in jarvis-plan.mjs
//     as a refusal, not a feature)
//   - auto-invoke Claude for C3. C3 means "this needs stronger reasoning than
//     the local lane", NOT "call the frontier model automatically" (§3).
//     A C3 step pauses for founder authority. That is the whole point.
//   - mutate the repository. Alpha is read-only end to end.

import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, createHash } from 'node:crypto';

import { route, COST_CLASS } from './router.mjs';
import { runCapability } from './deterministic.mjs';
import { createClient } from './jarvis-runtime-client.mjs';
import { AIN_HOME, RUNTIME_HOME } from './jarvis-runtime-store.mjs';
import { buildPlan, validatePlan, REPO_ROOT, RECIPES } from './jarvis-plan.mjs';

export const PLANS_DIR = path.join(RUNTIME_HOME, 'plans');
export const PLAN_EVENTS = path.join(RUNTIME_HOME, 'plan-events.jsonl');

// ── §5 graph state machine ───────────────────────────────────────────────────
//
// The §5 minimum set, plus two states the minimum set cannot express honestly:
//   AWAITING_FOUNDER_LANE — authority was GRANTED, but the work itself happens
//     in the founder/Claude lane. Calling that PASSED would credit JARVIS with
//     work it did not do; calling it RUNNING would imply an autonomous frontier
//     call that Alpha does not make.
//   REFUSED — the founder said no. Not FAILED (nothing malfunctioned) and not
//     PASSED. Mirrors the runtime's own ESCALATION_REQUIRED reasoning.
export const STEP_STATES = Object.freeze([
  'PENDING', 'READY', 'RUNNING', 'PASSED', 'FAILED',
  'PAUSED_FOR_GOVERNANCE', 'AWAITING_FOUNDER_LANE', 'REFUSED', 'BLOCKED', 'CANCELLED',
]);

const SETTLED_OK = new Set(['PASSED']);
const SETTLED_BAD = new Set(['FAILED', 'REFUSED', 'CANCELLED']);
const WAITING = new Set(['PAUSED_FOR_GOVERNANCE', 'AWAITING_FOUNDER_LANE']);

// ── §6 result contract ───────────────────────────────────────────────────────
export const STEP_RESULT_REQUIRED = Object.freeze([
  'status', 'objective', 'evidence', 'tests', 'artifacts',
  'findings', 'uncertainties', 'authority_boundary', 'recommended_next_action',
]);

const isEmptyEvidence = (e) =>
  e == null ||
  (typeof e === 'string' && e.trim() === '') ||
  (Array.isArray(e) && e.length === 0);

/**
 * §6 — "Empty evidence cannot be PASS."
 *
 * The archived local results were exit-0 with nothing in them. Structural
 * presence of a key is not the contract; a key holding nothing is the same
 * silence with better manners.
 */
export function validateStepResult(step, result) {
  const errors = [];
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return { ok: false, failure_class: 'RESULT_CONTRACT_INVALID', errors: ['result must be a JSON object'] };
  }
  for (const k of STEP_RESULT_REQUIRED) {
    if (result[k] === undefined) errors.push(`missing required field '${k}'`);
  }
  const rc = step.result_contract ?? {};
  if (rc.requires_evidence && isEmptyEvidence(result.evidence)) {
    errors.push("evidence is empty but result_contract.requires_evidence is true — an empty evidence field cannot be PASS (§6)");
  }
  if (rc.requires_tests && (result.tests === 'not_run' || isEmptyEvidence(result.tests))) {
    errors.push("tests is 'not_run' but result_contract.requires_tests is true (§6)");
  }
  return errors.length
    ? { ok: false, failure_class: 'RESULT_CONTRACT_INVALID', errors }
    : { ok: true, errors: [] };
}

// ── §7 verification: worker CLAIM ≠ VERIFIED RESULT ──────────────────────────
/**
 * Run the step's declared deterministic verifier. The verifier never reads the
 * worker's output — it re-derives the fact from the repository. That is the
 * whole guard: the same unsupported assertion cannot be both the work result
 * and the proof of the work result.
 */
export function runVerifier(step, repo) {
  const v = step.verification;
  if (!v || v.kind === 'none') {
    return {
      verified: false,
      method: 'none-declared',
      reason: v?.reason ?? '(no reason recorded)',
      confidence_label: 'claimed',
    };
  }
  let out;
  try {
    out = runCapability(v.capability, v.args ?? {}, repo);
  } catch (e) {
    return { verified: false, method: `capability:${v.capability}`, error: String(e.message ?? e), confidence_label: 'unverified' };
  }
  const actual = String(out?.stdout ?? '').trim();
  const exp = v.expect ?? {};
  let pass = true;
  const checks = [];

  if (exp.equals !== undefined) {
    const p = actual === String(exp.equals);
    checks.push({ check: 'equals', expected: exp.equals, pass: p });
    pass = pass && p;
  }
  if (exp.contains !== undefined) {
    const p = actual.includes(String(exp.contains));
    checks.push({ check: 'contains', expected: exp.contains, pass: p });
    pass = pass && p;
  }
  if (exp.matches !== undefined) {
    let p = false;
    try { p = new RegExp(exp.matches).test(actual); } catch { p = false; }
    checks.push({ check: 'matches', expected: exp.matches, pass: p });
    pass = pass && p;
  }
  if (exp.min_count !== undefined) {
    const n = Number.parseInt(actual, 10);
    const p = Number.isFinite(n) && n >= exp.min_count;
    checks.push({ check: 'min_count', expected: exp.min_count, actual: n, pass: p });
    pass = pass && p;
  }
  if (checks.length === 0) {
    return { verified: false, method: `capability:${v.capability}`, error: 'verification.expect declared no checks', confidence_label: 'unverified' };
  }

  return {
    verified: pass,
    method: `capability:${v.capability}`,
    checks,
    actual: actual.length > 400 ? `${actual.slice(0, 400)}…` : actual,
    confidence_label: pass ? 'verified' : 'unverified',
  };
}

// ── §3 router consumer edge ──────────────────────────────────────────────────
/**
 * The ONLY place a lane is chosen. It calls the existing router with the shape
 * the step declared — it does not read the objective prose and guess, because
 * router.mjs deliberately does not, and a second guessing layer here would be a
 * second classification system by the back door (§3).
 */
export function routeStep(step) {
  const input_chars = step.bounded_for_local
    ? JSON.stringify(step.packet ?? {}).length + String(step.objective).length
    : 0;
  const decision = route({
    capability: step.capability,
    bounded_for_local: step.bounded_for_local === true,
    input_chars,
  });
  return decision;
}

// ── persistence ──────────────────────────────────────────────────────────────
const nowISO = () => new Date().toISOString();
const newPlanRunId = () => `pr-${randomBytes(5).toString('hex')}`;
const digest = (s) => createHash('sha256').update(String(s ?? ''), 'utf8').digest('hex');

function ensureDirs() {
  fs.mkdirSync(PLANS_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(PLAN_EVENTS), { recursive: true });
}
const planFile = (id) => path.join(PLANS_DIR, `${id}.json`);

export function savePlanRun(pr) {
  ensureDirs();
  pr.updated_at = nowISO();
  const tmp = `${planFile(pr.plan_run_id)}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(pr, null, 2));
  fs.renameSync(tmp, planFile(pr.plan_run_id));
  return pr;
}
export function loadPlanRun(id) {
  try { return JSON.parse(fs.readFileSync(planFile(id), 'utf8')); } catch { return null; }
}
export function listPlanRuns() {
  ensureDirs();
  return fs.readdirSync(PLANS_DIR).filter((f) => f.endsWith('.json'))
    .map((f) => { try { return JSON.parse(fs.readFileSync(path.join(PLANS_DIR, f), 'utf8')); } catch { return null; } })
    .filter(Boolean)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}
function emit(pr, type, data) {
  ensureDirs();
  const ev = { at: nowISO(), plan_run_id: pr.plan_run_id, type, ...data };
  pr.events.push(ev);
  try { fs.appendFileSync(PLAN_EVENTS, `${JSON.stringify(ev)}\n`); } catch { /* telemetry only */ }
  return ev;
}

/** Create an unexecuted plan run from a validated plan. */
export function createPlanRun(plan, { runtime_url = 'http://127.0.0.1:8787' } = {}) {
  const v = validatePlan(plan);
  if (!v.ok) return { ok: false, refusal: 'PLAN_INVALID', detail: v.errors.join('\n') };

  const pr = {
    plan_run_id: newPlanRunId(),
    created_at: nowISO(),
    updated_at: nowISO(),
    state: 'PLANNED',
    approved: false,
    runtime_url,
    repo: plan.repo ?? REPO_ROOT,
    plan,
    order: v.order,
    steps: Object.fromEntries(plan.steps.map((s) => [s.step_id, {
      step_id: s.step_id,
      state: 'PENDING',
      attempts: 0,
      lane: null, cost_class: null, route_reason: null,
      run_id: null, result: null, result_validation: null, verification: null,
      gate: null, blocked_reason: null, amendments: [],
      cost: null,
      history: [{ at: nowISO(), state: 'PENDING' }],
    }])),
    events: [],
    synthesis: null,
  };
  emit(pr, 'plan.created', { plan_id: plan.plan_id, steps: plan.steps.length, strategy: plan.planning_strategy });
  return { ok: true, plan_run: savePlanRun(pr) };
}

function setState(pr, stepId, state, patch = {}) {
  const st = pr.steps[stepId];
  const from = st.state;
  Object.assign(st, patch, { state });
  st.history.push({ at: nowISO(), from, state, ...(patch.blocked_reason ? { blocked_reason: patch.blocked_reason } : {}) });
  emit(pr, 'step.state', { step_id: stepId, from, to: state });
  return st;
}

// ── §5 dependency advance ────────────────────────────────────────────────────
/**
 * Recompute which steps are READY and which are BLOCKED.
 *
 * A dependency that is merely waiting (paused / awaiting founder) blocks its
 * dependents with a RECOVERABLE reason, so a later APPROVE can un-block them.
 * A dependency that settled badly blocks them permanently. Independent branches
 * are untouched — that is §8's "do not globally stall safe independent work".
 */
export function advance(pr) {
  const stepById = Object.fromEntries(pr.plan.steps.map((s) => [s.step_id, s]));
  let changed = false;

  for (const s of pr.plan.steps) {
    const st = pr.steps[s.step_id];
    if (!['PENDING', 'BLOCKED'].includes(st.state)) continue;

    const deps = s.depends_on ?? [];
    const depStates = deps.map((d) => pr.steps[d]?.state);

    const badDep = deps.find((d) => SETTLED_BAD.has(pr.steps[d]?.state));
    if (badDep) {
      if (st.state !== 'BLOCKED' || st.blocked_reason !== `UPSTREAM_${pr.steps[badDep].state}:${badDep}`) {
        setState(pr, s.step_id, 'BLOCKED', { blocked_reason: `UPSTREAM_${pr.steps[badDep].state}:${badDep}`, recoverable: false });
        changed = true;
      }
      continue;
    }

    const waitDep = deps.find((d) => WAITING.has(pr.steps[d]?.state));
    if (waitDep) {
      if (st.state !== 'BLOCKED' || st.blocked_reason !== `UPSTREAM_PAUSED:${waitDep}`) {
        setState(pr, s.step_id, 'BLOCKED', { blocked_reason: `UPSTREAM_PAUSED:${waitDep}`, recoverable: true });
        changed = true;
      }
      continue;
    }

    if (deps.every((d) => SETTLED_OK.has(pr.steps[d]?.state))) {
      if (st.state !== 'READY') {
        setState(pr, s.step_id, 'READY', { blocked_reason: null, recoverable: null });
        changed = true;
      }
    } else if (st.state === 'BLOCKED' && st.recoverable) {
      // upstream recovered but has not passed yet — back to waiting
      setState(pr, s.step_id, 'PENDING', { blocked_reason: null, recoverable: null });
      changed = true;
    }
    void stepById; void depStates;
  }
  return changed;
}

// ── lane executors ───────────────────────────────────────────────────────────

/**
 * C0 — deterministic capability, in-process.
 *
 * KNOWN LIMITATION, stated rather than hidden: this does NOT traverse POST
 * /runs. The runtime's checkAuthority accepts execution_lane 'local-native'
 * only (READ_ONLY_LANES), so there is no deterministic lane to submit to on
 * this branch. A deterministic runtime lane exists on
 * feature/builder-os-deterministic-lane and is not merged here. Until it is,
 * C0 executes here and is recorded with submitted_to_runtime:false.
 */
async function executeC0(pr, step) {
  const t0 = Date.now();
  let out;
  try {
    out = runCapability(step.capability, step.capability_args ?? {}, pr.repo);
  } catch (e) {
    return {
      ok: false, failure_class: 'CAPABILITY_ERROR', detail: String(e.message ?? e),
      cost: { lane: 'C0', cost_class: COST_CLASS.C0, provider: 'deterministic', model: null, wall_ms: Date.now() - t0, submitted_to_runtime: false },
    };
  }
  const stdout = String(out?.stdout ?? '');
  const result = {
    status: out?.exit_code === 0 ? 'ok' : 'error',
    objective: step.objective,
    evidence: stdout,
    tests: 'n/a-deterministic',
    artifacts: [],
    findings: stdout ? stdout.split('\n').slice(0, 20) : [],
    uncertainties: [],
    authority_boundary: step.authority.scope,
    recommended_next_action: 'none',
  };
  return {
    ok: true, result,
    cost: { lane: 'C0', cost_class: COST_CLASS.C0, provider: 'deterministic', model: `capability:${step.capability}`, wall_ms: Date.now() - t0, submitted_to_runtime: false },
  };
}

const rand4 = () => randomBytes(2).toString('hex');

/** Build the runtime packet for a C1 step. Read-only by construction. */
export function buildPacket(pr, step) {
  const p = step.packet ?? {};
  // Unique per ATTEMPT, not per step. The branch is derived from it for the
  // same reason: ain-delegate.sh's claim creates a git worktree on that branch,
  // and git refuses a branch already checked out elsewhere. A per-step branch
  // therefore made every retry — and every re-run of the same recipe — fail
  // with WORKTREE_CLAIM_FAILED against its own leftover worktree.
  const workUnitId = `jp-${step.step_id}-${rand4()}`.toLowerCase().slice(0, 64);
  return {
    work_unit_id: workUnitId,
    title: `plan ${pr.plan.plan_id} step ${step.step_id}`,
    objective: step.objective,
    expected_output: p.expected_output ?? step.completion_criterion,
    execution_lane: 'local-native',
    canonical_sha: pr.plan.canonical_sha,
    branch: `chore/${workUnitId}`.slice(0, 80),
    // NO `worktree` field, deliberately.
    //
    // ain-delegate.sh's _run_lane claims an isolated worktree ONLY when the
    // packet does not already name one. Setting it here to the orchestrator's
    // own checkout handed a bypassPermissions worker write access to the live
    // tree — and it used it (it rewrote the trailing newline of
    // jarvis-local-worker.mjs on the first real C1 run). The isolated worktree
    // is the structural safety boundary for the read-only lane, not the
    // permission prompt. Omitting this field is what keeps it.
    governing_authority: 'JARVIS MULTI-RUN PLANNER + ROUTER INTEGRATION — ALPHA',
    established_facts: p.established_facts ?? ['Your authority is READ-ONLY.'],
    context_selectors: p.context_selectors ?? [],
    allowed_files: p.allowed_files ?? [],
    acceptance_criteria: [step.completion_criterion],
    escalation_conditions: [step.stop_condition],
  };
}

/** C1 — the real consumer edge: step → router → /runs → local worker → result. */
async function executeC1(pr, step, client) {
  const t0 = Date.now();
  const packet = buildPacket(pr, step);
  let created;
  try {
    created = await client.createRun(packet);
  } catch (e) {
    return {
      ok: false, failure_class: 'RUNTIME_REFUSED_PACKET', detail: `${e.message}${e.body ? ` ${JSON.stringify(e.body)}` : ''}`,
      cost: { lane: 'C1', cost_class: COST_CLASS.C1, provider: 'runtime', model: null, wall_ms: Date.now() - t0, submitted_to_runtime: true },
    };
  }

  let run;
  try {
    run = await client.waitForRun(created.run_id, { timeoutMs: 600_000, pollMs: 1500 });
  } catch (e) {
    // A pause is not terminal, so waitForRun times out on it — check directly.
    run = await client.getRun(created.run_id).catch(() => null);
    if (!run || run.state !== 'PAUSED_FOR_GOVERNANCE') {
      return {
        ok: false, failure_class: 'RUN_WAIT_FAILED', detail: String(e.message ?? e), run_id: created.run_id,
        cost: { lane: 'C1', cost_class: COST_CLASS.C1, provider: 'runtime', model: run?.worker?.model ?? null, wall_ms: Date.now() - t0, submitted_to_runtime: true, run_id: created.run_id },
      };
    }
  }

  const cost = {
    lane: 'C1', cost_class: COST_CLASS.C1, provider: 'local-native',
    model: run.worker?.model ?? null, wall_ms: Date.now() - t0,
    submitted_to_runtime: true, run_id: run.run_id,
    runtime_state: run.state,
    // §10 — recorded because it exists, not because Alpha routes on it yet.
    tokens: run.context?.est_tokens ?? null,
  };

  if (run.state === 'PAUSED_FOR_GOVERNANCE') {
    return { ok: false, paused: true, run_id: run.run_id, gate: run.governance_gate, cost };
  }
  if (run.state !== 'VERIFIED') {
    return {
      ok: false, failure_class: run.failure_class ?? `RUN_${run.state}`,
      detail: run.failure_detail ?? `run ended in ${run.state}`, run_id: run.run_id, cost,
    };
  }

  // The runtime already proved citation containment (verifyEvidence). That is
  // evidence about the worker's output; it is NOT the step's verifier, which
  // re-derives the fact from the repo independently.
  //
  // Where the evidence actually lives, established by run r-dcf91adf09: the
  // public projection's `result` carries only delegate exit metadata — its
  // summary field is named `exit_summary` and reads "delegate exited 0; see
  // log_path for transcript". There is NO `result.summary`. Reading one yielded
  // '' and made this orchestrator refuse a run the runtime had VERIFIED with
  // 2/2 valid citations. The worker's actual findings are the transcript at
  // audit.log_path, and the strongest evidence is `run.verification` — the
  // runtime's OWN independently-derived citation containment, which is why it
  // leads here rather than the worker's self-report.
  const verifiedCitations = (run.verification?.citations ?? []).filter((c) => c.in_context).map((c) => c.citation);
  let transcript = '';
  try { if (run.audit?.log_path) transcript = fs.readFileSync(run.audit.log_path, 'utf8').trim(); } catch { /* log unreadable — evidence falls back to citations */ }
  const evidence = [
    verifiedCitations.length ? `verified citations: ${verifiedCitations.join(', ')}` : '',
    transcript,
  ].filter(Boolean).join('\n\n');

  const result = {
    status: 'ok',
    objective: step.objective,
    evidence,
    tests: 'n/a-read-only',
    artifacts: [run.audit?.result_path, run.audit?.log_path].filter(Boolean),
    findings: verifiedCitations,
    uncertainties: run.verification?.invalid_citations ?? [],
    authority_boundary: step.authority.scope,
    recommended_next_action: run.result?.recommended_next_action ?? 'none',
    runtime_evidence_verification: run.verification ?? null,
    worker_exit_summary: run.result?.exit_summary ?? null,
  };
  return { ok: true, result, run_id: run.run_id, cost };
}

/**
 * C3 — stronger reasoning required.
 *
 * §3: "Do not assume C3 means 'always auto-call Claude.'" Alpha does not call
 * a frontier model at all. C3 raises an authority boundary and stops that
 * branch, which is exactly what §8 asks for.
 */
function executeC3(pr, step) {
  const gate = {
    gate_id: `g-${randomBytes(4).toString('hex')}`,
    opened_at: nowISO(),
    step_id: step.step_id,
    question: step.authority?.boundary
      ? `${step.objective}\n\nAuthority boundary: ${step.authority.boundary}`
      : `${step.objective}\n\nThis step requires reasoning beyond the local lane. Authorize a stronger lane, refuse, or amend the step.`,
    objective_digest: digest(step.objective),
    required_authority: step.authority?.scope ?? 'founder-decision',
    affected_downstream: pr.plan.steps.filter((s) => (s.depends_on ?? []).includes(step.step_id)).map((s) => s.step_id),
    resolution_vocabulary: ['APPROVE', 'REFUSE', 'AMEND'],
    resolution: null,
  };
  return { paused: true, gate };
}

// ── §9 failure policy ────────────────────────────────────────────────────────
function applyFailure(pr, step, st, failure) {
  const policy = step.on_failure ?? 'block';
  const maxRetries = step.max_retries ?? (policy === 'retry' ? 1 : 0);

  if (policy === 'retry' && st.attempts <= maxRetries) {
    emit(pr, 'step.retry', { step_id: step.step_id, attempt: st.attempts, of: maxRetries, failure_class: failure.failure_class });
    setState(pr, step.step_id, 'READY', { last_failure: failure });
    return 'retried';
  }
  if (policy === 'escalate') {
    const gate = {
      gate_id: `g-${randomBytes(4).toString('hex')}`,
      opened_at: nowISO(),
      step_id: step.step_id,
      question: `Step '${step.step_id}' failed after ${st.attempts} attempt(s): ${failure.failure_class}. ` +
        `\n\n${failure.detail ?? ''}\n\nEscalating rather than retrying further. Approve a different approach, refuse the step, or amend it.`,
      objective_digest: digest(step.objective),
      required_authority: 'founder-decision',
      affected_downstream: pr.plan.steps.filter((s) => (s.depends_on ?? []).includes(step.step_id)).map((s) => s.step_id),
      resolution_vocabulary: ['APPROVE', 'REFUSE', 'AMEND'],
      resolution: null,
      cause: failure,
    };
    setState(pr, step.step_id, 'PAUSED_FOR_GOVERNANCE', { gate, last_failure: failure });
    emit(pr, 'governance.paused', { step_id: step.step_id, gate_id: gate.gate_id, cause: failure.failure_class });
    return 'escalated';
  }
  setState(pr, step.step_id, 'FAILED', { last_failure: failure });
  emit(pr, 'step.failed', { step_id: step.step_id, failure_class: failure.failure_class });
  return 'failed';
}

// ── the engine ───────────────────────────────────────────────────────────────
/**
 * Execute every step that can legally run right now, then stop.
 *
 * Stopping is not giving up: a run that ends with paused steps is a run
 * awaiting authority, and calling execute() again after a resolution continues
 * the same graph.
 */
export async function executeGraph(pr, { client, maxSteps = 200 } = {}) {
  if (!pr.approved) {
    return { ok: false, refusal: 'PLAN_NOT_APPROVED', detail: 'Alpha requires explicit plan approval before execution (§11). Re-run with approval.' };
  }
  const runtimeClient = client ?? createClient({ baseUrl: pr.runtime_url });
  const stepById = Object.fromEntries(pr.plan.steps.map((s) => [s.step_id, s]));
  pr.state = 'EXECUTING';
  savePlanRun(pr);

  let guard = 0;
  for (;;) {
    if (++guard > maxSteps) { emit(pr, 'engine.guard_tripped', { maxSteps }); break; }
    advance(pr);
    savePlanRun(pr);

    const ready = Object.values(pr.steps).filter((s) => s.state === 'READY');
    if (ready.length === 0) break;

    for (const st of ready) {
      const step = stepById[st.step_id];

      // §3 — route once per attempt, and record why.
      const decision = routeStep(step);
      if (decision.status !== 'routed') {
        applyFailure(pr, step, st, { failure_class: decision.status.toUpperCase(), detail: decision.reason });
        continue;
      }
      st.lane = decision.execution_lane;
      st.cost_class = decision.cost_class;
      st.route_reason = decision.reason;
      st.attempts += 1;
      setState(pr, st.step_id, 'RUNNING', {});
      emit(pr, 'step.routed', { step_id: st.step_id, lane: st.lane, cost_class: st.cost_class, attempt: st.attempts });
      savePlanRun(pr);

      let outcome;
      if (decision.execution_lane === 'C0') outcome = await executeC0(pr, step);
      else if (decision.execution_lane === 'C1') outcome = await executeC1(pr, step, runtimeClient);
      else outcome = executeC3(pr, step);

      if (outcome.cost) st.cost = outcome.cost;
      if (outcome.run_id) st.run_id = outcome.run_id;

      if (outcome.paused) {
        setState(pr, st.step_id, 'PAUSED_FOR_GOVERNANCE', { gate: outcome.gate ?? st.gate });
        emit(pr, 'governance.paused', { step_id: st.step_id, gate_id: outcome.gate?.gate_id ?? null, lane: st.lane });
        savePlanRun(pr);
        continue;
      }
      if (!outcome.ok) {
        applyFailure(pr, step, st, { failure_class: outcome.failure_class, detail: outcome.detail });
        savePlanRun(pr);
        continue;
      }

      // §6 result contract
      const rv = validateStepResult(step, outcome.result);
      st.result = outcome.result;
      st.result_validation = rv;
      if (!rv.ok) {
        applyFailure(pr, step, st, { failure_class: rv.failure_class, detail: rv.errors.join('; ') });
        savePlanRun(pr);
        continue;
      }

      // §7 independent verification
      const ver = runVerifier(step, pr.repo);
      st.verification = ver;
      if (ver.method !== 'none-declared' && !ver.verified) {
        applyFailure(pr, step, st, {
          failure_class: 'EVIDENCE_UNVERIFIED',
          detail: `verifier ${ver.method} did not confirm the claim: ${JSON.stringify(ver.checks ?? ver.error ?? null)}`,
        });
        savePlanRun(pr);
        continue;
      }

      setState(pr, st.step_id, 'PASSED', {});
      emit(pr, 'step.passed', { step_id: st.step_id, lane: st.lane, confidence: ver.confidence_label });
      savePlanRun(pr);
    }
  }

  advance(pr);
  pr.synthesis = synthesize(pr);
  pr.state = graphState(pr);
  emit(pr, 'plan.settled', { state: pr.state });
  savePlanRun(pr);
  return { ok: true, plan_run: pr };
}

export function graphState(pr) {
  const states = Object.values(pr.steps).map((s) => s.state);
  if (states.some((s) => s === 'PAUSED_FOR_GOVERNANCE' || s === 'AWAITING_FOUNDER_LANE')) return 'AWAITING_AUTHORITY';
  if (states.every((s) => s === 'PASSED')) return 'COMPLETE';
  if (states.some((s) => SETTLED_BAD.has(s) || s === 'BLOCKED')) return 'INCOMPLETE';
  return 'EXECUTING';
}

// ── §8 governance resolution ─────────────────────────────────────────────────
/**
 * APPROVE / REFUSE / AMEND against one paused step.
 *
 * APPROVE on a C3 step does NOT make JARVIS call a frontier model. It grants
 * authority and moves the step to AWAITING_FOUNDER_LANE, whose result must be
 * submitted back through submitStepResult(). Anything else would be Alpha
 * claiming an autonomy it does not have.
 */
export function resolveStepGate(pr, stepId, { resolution_type, rationale, amend }) {
  const st = pr.steps[stepId];
  if (!st) return { ok: false, refusal: 'UNKNOWN_STEP' };
  if (st.state !== 'PAUSED_FOR_GOVERNANCE' || !st.gate) {
    return { ok: false, refusal: 'NO_OPEN_GATE', state: st.state };
  }
  if (!['APPROVE', 'REFUSE', 'AMEND'].includes(resolution_type)) {
    return { ok: false, refusal: 'UNKNOWN_RESOLUTION', detail: 'expected APPROVE, REFUSE or AMEND' };
  }
  if (!(typeof rationale === 'string' && rationale.trim())) {
    return { ok: false, refusal: 'RATIONALE_REQUIRED', detail: 'a resolution without a recorded rationale is an unexplained exercise of authority' };
  }

  st.gate.resolution = { resolution_type, rationale, at: nowISO() };
  emit(pr, 'governance.resolved', { step_id: stepId, gate_id: st.gate.gate_id, resolution_type });

  if (resolution_type === 'REFUSE') {
    setState(pr, stepId, 'REFUSED', {});
  } else if (resolution_type === 'APPROVE') {
    setState(pr, stepId, 'AWAITING_FOUNDER_LANE', {});
  } else {
    const step = pr.plan.steps.find((s) => s.step_id === stepId);
    if (!amend || typeof amend !== 'object') {
      return { ok: false, refusal: 'AMENDMENT_REQUIRED', detail: 'AMEND must carry the amended objective and/or authority' };
    }
    const before = { objective: step.objective, authority: { ...step.authority } };
    if (amend.objective) step.objective = amend.objective;
    if (amend.authority) step.authority = { ...step.authority, ...amend.authority };
    if (amend.capability !== undefined) step.capability = amend.capability;
    if (amend.capability_args !== undefined) step.capability_args = amend.capability_args;
    if (amend.bounded_for_local !== undefined) step.bounded_for_local = amend.bounded_for_local;

    const v = validatePlan(pr.plan);
    if (!v.ok) {
      Object.assign(step, before);
      return { ok: false, refusal: 'AMENDMENT_INVALID', detail: v.errors.join('\n') };
    }
    st.amendments.push({ at: nowISO(), before, after: { objective: step.objective, authority: step.authority }, rationale });
    st.gate = null;
    setState(pr, stepId, 'PENDING', {});
  }

  advance(pr);
  // Refresh the synthesis so a resolved gate is not still reported as open.
  // A stale synthesis is worse than none: it reads as current.
  pr.synthesis = synthesize(pr);
  pr.state = graphState(pr);
  savePlanRun(pr);
  return { ok: true, plan_run: pr };
}

/** Submit the result of a step that was approved into the founder/Claude lane. */
export function submitStepResult(pr, stepId, result) {
  const st = pr.steps[stepId];
  if (!st) return { ok: false, refusal: 'UNKNOWN_STEP' };
  if (st.state !== 'AWAITING_FOUNDER_LANE') {
    return { ok: false, refusal: 'NOT_AWAITING_RESULT', state: st.state };
  }
  const step = pr.plan.steps.find((s) => s.step_id === stepId);
  const rv = validateStepResult(step, result);
  st.result = result;
  st.result_validation = rv;
  if (!rv.ok) {
    setState(pr, stepId, 'FAILED', { last_failure: { failure_class: rv.failure_class, detail: rv.errors.join('; ') } });
    savePlanRun(pr);
    return { ok: false, refusal: rv.failure_class, detail: rv.errors.join('; ') };
  }
  const ver = runVerifier(step, pr.repo);
  st.verification = ver;
  if (ver.method !== 'none-declared' && !ver.verified) {
    setState(pr, stepId, 'FAILED', { last_failure: { failure_class: 'EVIDENCE_UNVERIFIED', detail: JSON.stringify(ver.checks ?? ver.error) } });
    savePlanRun(pr);
    return { ok: false, refusal: 'EVIDENCE_UNVERIFIED' };
  }
  st.cost = st.cost ?? { lane: 'C3', cost_class: COST_CLASS.C3, provider: 'founder-lane', model: null, wall_ms: null, submitted_to_runtime: false };
  setState(pr, stepId, 'PASSED', {});
  advance(pr);
  pr.synthesis = synthesize(pr);
  pr.state = graphState(pr);
  savePlanRun(pr);
  return { ok: true, plan_run: pr };
}

export function cancelPlanRun(pr, reason = 'cancelled by operator') {
  for (const st of Object.values(pr.steps)) {
    if (!SETTLED_OK.has(st.state) && !SETTLED_BAD.has(st.state)) setState(pr, st.step_id, 'CANCELLED', { blocked_reason: reason });
  }
  pr.state = 'CANCELLED';
  emit(pr, 'plan.cancelled', { reason });
  return savePlanRun(pr);
}

// ── §11 synthesis ────────────────────────────────────────────────────────────
/**
 * Deterministic assembly. Alpha does NOT synthesize with a model: a model
 * summary of steps whose evidence is already recorded would add fluency and
 * subtract traceability, and any sentence it produced would be unattributable.
 * Model synthesis is a named Beta seam.
 */
export function synthesize(pr) {
  const steps = pr.plan.steps.map((s) => ({ step: s, st: pr.steps[s.step_id] }));
  const passed = steps.filter(({ st }) => st.state === 'PASSED');
  const verified = passed.filter(({ st }) => st.verification?.verified);
  const claimed = passed.filter(({ st }) => !st.verification?.verified);

  return {
    method: 'deterministic-assembly',
    model_synthesis: false,
    objective: pr.plan.objective,
    answered: verified.map(({ step, st }) => ({
      step_id: step.step_id,
      objective: step.objective,
      lane: st.lane,
      confidence: 'verified',
      evidence: typeof st.result?.evidence === 'string' ? st.result.evidence.slice(0, 600) : st.result?.evidence ?? null,
      verifier: st.verification?.method ?? null,
    })),
    claimed_but_unverified: claimed.map(({ step, st }) => ({
      step_id: step.step_id,
      objective: step.objective,
      reason: st.verification?.reason ?? 'no verifier declared',
    })),
    open: steps.filter(({ st }) => WAITING.has(st.state)).map(({ step, st }) => ({
      step_id: step.step_id, state: st.state, question: st.gate?.question ?? null, gate_id: st.gate?.gate_id ?? null,
    })),
    blocked: steps.filter(({ st }) => st.state === 'BLOCKED').map(({ step, st }) => ({
      step_id: step.step_id, blocked_reason: st.blocked_reason, recoverable: !!st.recoverable,
    })),
    failed: steps.filter(({ st }) => ['FAILED', 'REFUSED', 'CANCELLED'].includes(st.state)).map(({ step, st }) => ({
      step_id: step.step_id, state: st.state, failure: st.last_failure ?? null,
    })),
    cost_observability: costReport(pr),
    limitations: [
      'C0 steps execute in-process and do not traverse POST /runs — the runtime has no deterministic lane on this branch.',
      'C3 never auto-invokes a frontier model; it raises an authority boundary.',
      'Synthesis is deterministic assembly, not model synthesis.',
      'Token/cost figures are recorded where the runtime already exposes them; they are not yet an input to routing.',
    ],
  };
}

/** §10 — record, do not optimise. */
export function costReport(pr) {
  const rows = Object.values(pr.steps).filter((s) => s.cost).map((s) => ({ step_id: s.step_id, ...s.cost }));
  const byLane = {};
  for (const r of rows) {
    byLane[r.lane] = byLane[r.lane] ?? { steps: 0, wall_ms: 0, models: new Set() };
    byLane[r.lane].steps += 1;
    byLane[r.lane].wall_ms += r.wall_ms ?? 0;
    if (r.model) byLane[r.lane].models.add(r.model);
  }
  return {
    classification: 'PARTIAL — recorded, not consumed by routing decisions',
    rows,
    by_lane: Object.fromEntries(Object.entries(byLane).map(([k, v]) => [k, { steps: v.steps, wall_ms: v.wall_ms, models: [...v.models] }])),
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function usage() {
  return `usage: jarvis-orchestrator.mjs <command> [flags]

  plan     --recipe <name> | --plan <file>  [--objective "..."] [--out <file>]
           → build and VALIDATE a work graph. Prints the plan. Executes nothing.

  execute  (--recipe <name> | --plan <file> | --run <plan_run_id>) --approve-plan
           [--runtime <url>]
           → run every step that can legally run now, then stop.

  status   --run <plan_run_id> [--json]
  list
  resolve  --run <id> --step <id> --resolution APPROVE|REFUSE|AMEND
           --rationale "<why>" [--amend-objective "..."] [--amend-scope <scope>]
  submit   --run <id> --step <id> --file <result.json>
  cancel   --run <id> [--reason "<why>"]

  recipes: ${Object.keys(RECIPES).join(', ')}

  Alpha is READ-ONLY. Plan approval is explicit (§11). C3 pauses for founder
  authority — it does not call a frontier model (§3).`;
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[k] = true;
      else { out[k] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

function renderStatus(pr) {
  const lines = [];
  lines.push(`PLAN RUN ${pr.plan_run_id}   ${pr.state}`);
  lines.push(`  objective: ${pr.plan.objective}`);
  lines.push(`  strategy:  ${pr.plan.planning_strategy}   authority: ${pr.plan.authority_scope}   sha: ${pr.plan.canonical_sha}`);
  lines.push('');
  for (const s of pr.plan.steps) {
    const st = pr.steps[s.step_id];
    const lane = st.lane ? `${st.lane}` : '—';
    const conf = st.verification ? (st.verification.verified ? 'verified' : (st.verification.method === 'none-declared' ? 'claimed' : 'UNVERIFIED')) : '';
    const dep = (s.depends_on ?? []).length ? `  ⟵ ${(s.depends_on ?? []).join(', ')}` : '';
    lines.push(`  ${st.state.padEnd(23)} ${lane.padEnd(4)} ${s.step_id}${dep}`);
    if (st.blocked_reason) lines.push(`      blocked: ${st.blocked_reason}${st.recoverable ? ' (recoverable)' : ''}`);
    if (conf) lines.push(`      evidence: ${conf}  via ${st.verification.method}`);
    if (st.gate && !st.gate.resolution) lines.push(`      GATE ${st.gate.gate_id} — needs ${st.gate.resolution_vocabulary.join(' / ')}`);
    if (st.last_failure) lines.push(`      failure: ${st.last_failure.failure_class}`);
  }
  if (pr.synthesis) {
    lines.push('');
    lines.push(`  answered (verified): ${pr.synthesis.answered.length}   claimed: ${pr.synthesis.claimed_but_unverified.length}   open: ${pr.synthesis.open.length}   blocked: ${pr.synthesis.blocked.length}   failed: ${pr.synthesis.failed.length}`);
    for (const o of pr.synthesis.open) lines.push(`  ⏸  ${o.step_id} — ${String(o.question).split('\n')[0]}`);
  }
  return lines.join('\n');
}

async function main(argv) {
  const cmd = argv[0];
  const a = parseArgs(argv.slice(1));

  if (!cmd || a.help) { console.log(usage()); return 0; }

  if (cmd === 'plan' || (cmd === 'execute' && !a.run)) {
    const input = {};
    if (a.plan) input.plan = JSON.parse(fs.readFileSync(a.plan, 'utf8'));
    if (a.recipe) input.recipe = a.recipe;
    if (a.objective && typeof a.objective === 'string') input.objective = a.objective;
    const built = buildPlan(input);
    if (!built.ok) {
      console.error(`[jarvis/plan] ${built.refusal}\n${built.detail}`);
      return 2;
    }
    if (cmd === 'plan') {
      const text = JSON.stringify(built.plan, null, 2);
      if (a.out && typeof a.out === 'string') { fs.writeFileSync(a.out, text); console.log(`[jarvis/plan] wrote ${a.out}`); }
      else console.log(text);
      console.log(`\n[jarvis/plan] VALID — ${built.plan.steps.length} bounded steps, order: ${built.order.join(' → ')}`);
      return 0;
    }
    const created = createPlanRun(built.plan, { runtime_url: typeof a.runtime === 'string' ? a.runtime : undefined });
    if (!created.ok) { console.error(`[jarvis/plan] ${created.refusal}\n${created.detail}`); return 2; }
    a.run = created.plan_run.plan_run_id;
    console.log(`[jarvis/plan] plan run ${a.run} created from ${built.plan.planning_strategy}`);
  }

  if (cmd === 'execute') {
    const pr = loadPlanRun(a.run);
    if (!pr) { console.error(`[jarvis/exec] unknown plan run '${a.run}'`); return 2; }
    if (!a['approve-plan'] && !pr.approved) {
      console.error(renderStatus(pr));
      console.error('\n[jarvis/exec] PLAN_NOT_APPROVED — inspect the plan above, then re-run with --approve-plan (§11).');
      return 3;
    }
    if (a['approve-plan']) { pr.approved = true; emit(pr, 'plan.approved', {}); savePlanRun(pr); }
    if (typeof a.runtime === 'string') pr.runtime_url = a.runtime;
    const r = await executeGraph(pr);
    if (!r.ok) { console.error(`[jarvis/exec] ${r.refusal}: ${r.detail}`); return 3; }
    console.log(renderStatus(r.plan_run));
    return r.plan_run.state === 'COMPLETE' ? 0 : (r.plan_run.state === 'AWAITING_AUTHORITY' ? 4 : 1);
  }

  if (cmd === 'status') {
    const pr = loadPlanRun(a.run);
    if (!pr) { console.error(`unknown plan run '${a.run}'`); return 2; }
    console.log(a.json ? JSON.stringify(pr, null, 2) : renderStatus(pr));
    return 0;
  }

  if (cmd === 'list') {
    for (const pr of listPlanRuns()) console.log(`${pr.plan_run_id}  ${String(pr.state).padEnd(18)} ${pr.plan.planning_strategy.padEnd(34)} ${pr.plan.objective.slice(0, 60)}`);
    return 0;
  }

  if (cmd === 'resolve') {
    const pr = loadPlanRun(a.run);
    if (!pr) { console.error(`unknown plan run '${a.run}'`); return 2; }
    const amend = {};
    if (typeof a['amend-objective'] === 'string') amend.objective = a['amend-objective'];
    if (typeof a['amend-scope'] === 'string') amend.authority = { scope: a['amend-scope'] };
    const r = resolveStepGate(pr, a.step, {
      resolution_type: a.resolution,
      rationale: typeof a.rationale === 'string' ? a.rationale : '',
      amend: Object.keys(amend).length ? amend : undefined,
    });
    if (!r.ok) { console.error(`[jarvis/resolve] ${r.refusal}${r.detail ? `: ${r.detail}` : ''}`); return 2; }
    console.log(renderStatus(r.plan_run));
    return 0;
  }

  if (cmd === 'submit') {
    const pr = loadPlanRun(a.run);
    if (!pr) { console.error(`unknown plan run '${a.run}'`); return 2; }
    const result = JSON.parse(fs.readFileSync(a.file, 'utf8'));
    const r = submitStepResult(pr, a.step, result);
    if (!r.ok) { console.error(`[jarvis/submit] ${r.refusal}${r.detail ? `: ${r.detail}` : ''}`); return 2; }
    console.log(renderStatus(r.plan_run));
    return 0;
  }

  if (cmd === 'cancel') {
    const pr = loadPlanRun(a.run);
    if (!pr) { console.error(`unknown plan run '${a.run}'`); return 2; }
    console.log(renderStatus(cancelPlanRun(pr, typeof a.reason === 'string' ? a.reason : undefined)));
    return 0;
  }

  console.log(usage());
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).then((c) => process.exit(c)).catch((e) => { console.error(e); process.exit(1); });
}

export { AIN_HOME, renderStatus, usage };
