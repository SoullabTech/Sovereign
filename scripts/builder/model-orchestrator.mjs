#!/usr/bin/env node
/**
 * JARVIS-ROUTER-02 — multi-model orchestration over ONE canonical Work Unit.
 *
 * The router chooses participation. This module executes that plan sequentially
 * through the EXISTING ain-delegate.sh adapters, snapshots every role attempt,
 * records each attempt in the existing Work Unit history, and never promotes
 * model agreement into epistemic or governance authority.
 */
import {
  existsSync, mkdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadWorkUnit, recordAttempt } from './work-unit.mjs';
import { planWorkUnitRoute } from './work-unit-route.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DELEGATE = path.join(REPO, 'scripts', 'ain-delegate.sh');
const HOME = () => process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const resultPath = (id) => path.join(HOME(), 'results', `${id}.json`);
const orchestrationBase = (id) => path.join(HOME(), 'orchestrations', id);

const validBudget = (value) => Number.isInteger(value) && value >= 0;

export function routingInvariant(workUnit) {
  return {
    work_unit_id: workUnit.work_unit_id,
    objective: workUnit.objective,
    governing_authority: workUnit.governing_authority,
    task_class: workUnit.task_class,
    risk_class: workUnit.risk_class,
    authorized_acts: workUnit.authorized_acts,
    not_authorized_acts: workUnit.not_authorized_acts,
    routing_profile: workUnit.routing_profile,
    review_policy: workUnit.review_policy,
    data_class: workUnit.data_class,
    external_review: workUnit.external_review,
    external_tiebreaker: workUnit.external_tiebreaker,
    model_stage_budget: workUnit.model_stage_budget,
    external_call_budget: workUnit.external_call_budget,
  };
}

function providerStage(card, index) {
  return Object.freeze({
    index,
    role: index === 0 ? 'primary' : 'challenger',
    provider_id: card.provider_id,
    model_ref: card.model_ref,
    execution_adapter: card.execution_adapter,
    external: card.external_network === true,
    provider_standing: card.provider_standing,
    evidence_policy: card.evidence_policy,
  });
}

export function compileModelOrchestration(workUnitId) {
  const workUnit = loadWorkUnit(workUnitId);
  if (!workUnit) return { ok: false, status: 'WORK_UNIT_NOT_FOUND', work_unit_id: workUnitId };

  const projected = planWorkUnitRoute(workUnitId);
  if (!projected.ok) return projected;
  const plan = projected.plan;

  if (projected.permission_envelope?.repo_write_scope !== 'none') {
    return {
      ok: true,
      status: 'WRITE_CAPABLE_MODEL_ADAPTER_REQUIRED',
      work_unit_id: workUnitId,
      plan,
      executable: false,
      repo_write_scope: projected.permission_envelope?.repo_write_scope ?? null,
      reason: 'ROUTER-02 executes model stages read-only; write-capable model execution requires a separately proven adapter.',
    };
  }

  const basis = {
    work_unit_id: workUnitId, canonical_sha: workUnit.canonical_sha,
    routing_inputs: projected.routing_inputs, permission_envelope: projected.permission_envelope, plan,
  };
  const routePlanId = 'route-' + createHash('sha256').update(JSON.stringify(basis)).digest('hex').slice(0, 16);

  if (plan.status === 'deterministic') {
    return { ok: true, status: 'NO_MODEL_REQUIRED', route_plan_id: routePlanId, work_unit_id: workUnitId, plan, stages: [], executable: false };
  }
  if (plan.status !== 'planned') {
    return { ok: true, status: 'ROUTING_BLOCKED', route_plan_id: routePlanId, work_unit_id: workUnitId, plan, stages: [], executable: false, blocker: plan.status };
  }

  const cards = [plan.primary, ...(plan.challengers ?? [])].filter(Boolean);
  const stages = cards.map(providerStage);
  const stageBudget = workUnit.model_stage_budget;
  const externalBudget = workUnit.external_call_budget;
  const externalCalls = stages.filter((s) => s.external).length;

  if (!validBudget(stageBudget) || !validBudget(externalBudget)) {
    return {
      ok: true, status: 'BUDGET_INVALID', route_plan_id: routePlanId, work_unit_id: workUnitId,
      plan, stages, executable: false,
      model_stage_budget: stageBudget, external_call_budget: externalBudget,
    };
  }

  if (stages.length > stageBudget) {
    return {
      ok: true, status: 'STAGE_BUDGET_EXCEEDED', route_plan_id: routePlanId, work_unit_id: workUnitId,
      plan, stages, executable: false, required_stages: stages.length, model_stage_budget: stageBudget,
    };
  }
  if (externalCalls > externalBudget) {
    return {
      ok: true, status: 'EXTERNAL_CALL_BUDGET_EXCEEDED', route_plan_id: routePlanId, work_unit_id: workUnitId,
      plan, stages, executable: false, required_external_calls: externalCalls, external_call_budget: externalBudget,
    };
  }

  return {
    ok: true, status: 'READY', route_plan_id: routePlanId, work_unit_id: workUnitId,
    canonical_sha: workUnit.canonical_sha, plan, stages, executable: true,
    budgets: { model_stage_budget: stageBudget, external_call_budget: externalBudget, external_calls_planned: externalCalls },
    routing_invariant: routingInvariant(workUnit),
  };
}

export function extractModelText(result, logText) {
  if (result?.lane === 'tinker') {
    try {
      const payload = JSON.parse(logText);
      return typeof payload.text === 'string' ? payload.text.trim() : '';
    } catch { return ''; }
  }
  return String(logText ?? '').replace(/\x1b\[[0-9;]*m/g, '').trim();
}

export function parseChallengeMarker(text) {
  const rx = /JARVIS_CHALLENGE_RESULT_JSON:\s*(\{[^\n]*\})/g;
  let match, last = null;
  while ((match = rx.exec(String(text ?? ''))) !== null) last = match[1];
  if (!last) return { status: 'UNRESOLVED', summary: 'challenge marker missing', findings: [] };
  try {
    const value = JSON.parse(last);
    const allowed = new Set(['NO_MATERIAL_CHALLENGE', 'MATERIAL_CHALLENGE', 'UNRESOLVED']);
    if (!allowed.has(value.status)) return { status: 'UNRESOLVED', summary: 'invalid challenge status', findings: [] };
    return {
      status: value.status,
      summary: typeof value.summary === 'string' ? value.summary.slice(0, 600) : '',
      findings: Array.isArray(value.findings) ? value.findings.filter((x) => typeof x === 'string').slice(0, 20) : [],
    };
  } catch {
    return { status: 'UNRESOLVED', summary: 'challenge marker JSON invalid', findings: [] };
  }
}

function laneForStage(stage) {
  if (stage.execution_adapter === 'opencode') return 'opencode';
  if (stage.execution_adapter === 'tinker-direct') return 'tinker';
  throw new Error(`ORCHESTRATOR_ADAPTER_UNSUPPORTED:${stage.execution_adapter}`);
}

function snapshotName(stage) {
  return `${String(stage.index + 1).padStart(2, '0')}-${stage.role}-${stage.provider_id}`;
}

function invokeDelegate(stage, workUnitId, env) {
  const lane = laneForStage(stage);
  const args = [DELEGATE, lane, workUnitId, stage.provider_id, stage.model_ref];
  return spawnSync('bash', args, {
    cwd: REPO, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 10 * 60 * 1000,
  });
}

function releaseDelegate(workUnitId, env, state = 'completed') {
  return spawnSync('bash', [DELEGATE, 'release', workUnitId, state], {
    cwd: REPO, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60 * 1000,
  });
}

function writeOrchestrationRecord(dir, record) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'orchestration.json'), JSON.stringify(record, null, 2) + '\n');
}

function readCurrentResult(workUnitId) {
  const file = resultPath(workUnitId);
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; }
}

function sameInvariant(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function executeModelOrchestration(workUnitId, opts = {}) {
  const compiled = compileModelOrchestration(workUnitId);
  if (!compiled.ok || !compiled.executable) return { ...compiled, executed: false };

  const runId = opts.runId || `orch-${Date.now()}-${randomBytes(4).toString('hex')}`;
  const dir = path.join(orchestrationBase(workUnitId), runId);
  mkdirSync(dir, { recursive: true });

  const record = {
    orchestration_id: runId,
    route_plan_id: compiled.route_plan_id,
    work_unit_id: workUnitId,
    canonical_sha: compiled.canonical_sha,
    status: 'RUNNING',
    disposition: null,
    stages: [],
    budgets: compiled.budgets,
    advancement: compiled.plan.advancement,
    disagreement_policy: compiled.plan.disagreement_policy ?? null,
    tie_breaker_nominated: null,
    created_at: new Date().toISOString(),
    completed_at: null,
  };
  writeFileSync(path.join(dir, 'plan.json'), JSON.stringify(compiled, null, 2) + '\n');
  writeOrchestrationRecord(dir, record);

  let primaryPeerFile = null;
  let primaryAttemptRef = null;

  for (const stage of compiled.stages) {
    const name = snapshotName(stage);
    const env = {
      ...process.env,
      JARVIS_ATTEMPT_ROLE: stage.role,
      JARVIS_ROUTE_PLAN_ID: compiled.route_plan_id,
    };
    if (stage.role === 'challenger') {
      env.JARVIS_PEER_CONTEXT_FILE = primaryPeerFile ?? '';
      env.JARVIS_PEER_ATTEMPT_REF = primaryAttemptRef ?? '';
    }

    const child = (opts.invokeStage ?? invokeDelegate)(stage, workUnitId, env);
    const result = readCurrentResult(workUnitId);
    const stageRecord = {
      stage: name, index: stage.index, role: stage.role, provider_id: stage.provider_id,
      model_ref: stage.model_ref, execution_adapter: stage.execution_adapter,
      child_status: child?.status ?? null, child_error: child?.error ? String(child.error.message ?? child.error) : null,
      result: null, challenge: null,
    };

    if (!result) {
      stageRecord.result = { error: 'RESULT_MISSING' };
      record.stages.push(stageRecord);
      record.status = 'STOPPED';
      record.disposition = 'RESULT_MISSING';
      releaseDelegate(workUnitId, env, 'failed');
      break;
    }

    let logText = '';
    try { logText = readFileSync(result.log_path, 'utf8'); } catch { /* handled below */ }
    const attempt = recordAttempt(workUnitId, {
      ...result,
      orchestration: { orchestration_id: runId, route_plan_id: compiled.route_plan_id, stage: name, role: stage.role },
    });

    const resultSnapshot = path.join(dir, `${name}.result.json`);
    const logSnapshot = path.join(dir, `${name}.log`);
    writeFileSync(resultSnapshot, JSON.stringify({ ...result, attempt_number: attempt.attempt_number }, null, 2) + '\n');
    writeFileSync(logSnapshot, logText);
    stageRecord.result = {
      attempt_number: attempt.attempt_number,
      exit_code: result.exit_code ?? null,
      test_results: result.test_results ?? null,
      escalation_required: result.escalation_required === true,
      files_changed: result.files_changed ?? [],
      result_snapshot: resultSnapshot,
      log_snapshot: logSnapshot,
    };

    const released = releaseDelegate(workUnitId, env, 'completed');
    stageRecord.release_status = released.status;

    const current = loadWorkUnit(workUnitId);
    if (!current || !sameInvariant(compiled.routing_invariant, routingInvariant(current))) {
      record.stages.push(stageRecord);
      record.status = 'STOPPED';
      record.disposition = 'WORK_UNIT_ROUTING_INTENT_DRIFT';
      break;
    }

    if ((result.exit_code ?? 1) !== 0 || result.escalation_required === true
        || result.recommended_next_action === 'reject') {
      record.stages.push(stageRecord);
      record.status = 'STOPPED';
      record.disposition = 'STAGE_FAILED';
      break;
    }

    const modelText = extractModelText(result, logText);
    if (!modelText) {
      record.stages.push(stageRecord);
      record.status = 'STOPPED';
      record.disposition = 'MODEL_OUTPUT_EMPTY';
      break;
    }

    if (stage.role === 'primary') {
      if (Buffer.byteLength(modelText, 'utf8') > 65536) {
        record.stages.push(stageRecord);
        record.status = 'STOPPED';
        record.disposition = 'PRIMARY_OUTPUT_TOO_LARGE_FOR_CHALLENGE';
        break;
      }
      primaryPeerFile = path.join(dir, 'primary-output.untrusted.txt');
      writeFileSync(primaryPeerFile, modelText + '\n');
      primaryAttemptRef = resultSnapshot;
    } else {
      const challenge = parseChallengeMarker(modelText);
      stageRecord.challenge = challenge;
      if (challenge.status !== 'NO_MATERIAL_CHALLENGE') {
        record.stages.push(stageRecord);
        record.status = 'STOPPED';
        record.disposition = 'REVIEW_REQUIRED';
        if (compiled.plan.escalation?.provider) {
          record.tie_breaker_nominated = {
            provider_id: compiled.plan.escalation.provider.provider_id,
            model_ref: compiled.plan.escalation.provider.model_ref,
            automatic: false,
            reason: 'material disagreement or unresolved challenge',
          };
        }
        break;
      }
    }

    record.stages.push(stageRecord);
  }

  if (record.status === 'RUNNING') {
    record.status = 'COMPLETE';
    record.disposition = 'READY_FOR_EXISTING_GATE';
  }
  record.completed_at = new Date().toISOString();
  writeOrchestrationRecord(dir, record);
  return { ...record, orchestration_dir: dir, executed: true };
}

const isMain = process.argv[1] && import.meta.url === 'file://' + path.resolve(process.argv[1]);
if (isMain) {
  const id = process.argv[2];
  const execute = process.argv.includes('--execute');
  if (!id) {
    console.error('usage: model-orchestrator.mjs <work_unit_id> [--execute]');
    process.exit(2);
  }
  const out = execute ? executeModelOrchestration(id) : compileModelOrchestration(id);
  console.log(JSON.stringify(out, null, 2));
  const ok = out.ok !== false && ![
    'WORK_UNIT_NOT_FOUND', 'ROUTING_BLOCKED', 'WRITE_CAPABLE_MODEL_ADAPTER_REQUIRED',
    'BUDGET_INVALID', 'STAGE_BUDGET_EXCEEDED', 'EXTERNAL_CALL_BUDGET_EXCEEDED',
  ].includes(out.status);
  process.exit(ok ? 0 : 1);
}
