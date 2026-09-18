#!/usr/bin/env node
/**
 * JARVIS-ROUTER-03 — canonical runtime admission for multi-model orchestration.
 *
 * The caller may name only an existing canonical Work Unit and one action:
 * plan or execute. It cannot provide model names, routing metadata, budgets,
 * authority, or evidence classification. Those facts must already exist in the
 * canonical Work Unit consumed by ROUTER-01/02.
 */
import path from 'node:path';
import { WORK_UNIT_ID_RE } from './jarvis-runtime-pipeline.mjs';
import { compileModelOrchestration, executeModelOrchestration } from './model-orchestrator.mjs';

export const MODEL_RUNTIME_ACTIONS = Object.freeze(['plan', 'execute']);
export const MODEL_RUNTIME_REQUEST_FIELDS = Object.freeze(['action', 'work_unit_id']);

export function validateModelRuntimeRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { ok: false, status: 'REQUEST_SHAPE_INVALID', errors: ['request must be an object'] };
  }
  const unknown = Object.keys(request).filter((k) => !MODEL_RUNTIME_REQUEST_FIELDS.includes(k));
  if (unknown.length) {
    return { ok: false, status: 'REQUEST_SHAPE_INVALID', errors: [`unknown fields: ${unknown.sort().join(', ')}`] };
  }
  if (!MODEL_RUNTIME_ACTIONS.includes(request.action)) {
    return { ok: false, status: 'REQUEST_SHAPE_INVALID', errors: [`action must be one of: ${MODEL_RUNTIME_ACTIONS.join(', ')}`] };
  }
  if (typeof request.work_unit_id !== 'string' || !WORK_UNIT_ID_RE.test(request.work_unit_id)) {
    return { ok: false, status: 'REQUEST_SHAPE_INVALID', errors: [`work_unit_id must match ${WORK_UNIT_ID_RE}`] };
  }
  return { ok: true, status: 'REQUEST_VALID', errors: [] };
}

export function admitModelRuntimeRequest(request, deps = {}) {
  const validation = validateModelRuntimeRequest(request);
  if (!validation.ok) {
    return {
      admitted: false, executed: false, action: request?.action ?? null,
      work_unit_id: request?.work_unit_id ?? null,
      status: validation.status, errors: validation.errors, orchestration: null,
    };
  }

  const compileFn = deps.compileFn ?? compileModelOrchestration;
  const executeFn = deps.executeFn ?? executeModelOrchestration;
  const compiled = compileFn(request.work_unit_id);

  if (request.action === 'plan') {
    return {
      admitted: compiled?.status === 'READY',
      executed: false,
      action: 'plan',
      work_unit_id: request.work_unit_id,
      status: compiled?.status ?? 'PLANNER_RESULT_INVALID',
      orchestration: compiled ?? null,
    };
  }

  if (!compiled || compiled.status !== 'READY' || compiled.executable !== true) {
    return {
      admitted: false, executed: false, action: 'execute',
      work_unit_id: request.work_unit_id,
      status: compiled?.status ?? 'PLANNER_RESULT_INVALID',
      orchestration: compiled ?? null,
    };
  }

  const outcome = executeFn(request.work_unit_id);
  return {
    admitted: true,
    executed: outcome?.executed === true,
    action: 'execute',
    work_unit_id: request.work_unit_id,
    status: outcome?.status ?? 'ORCHESTRATION_RESULT_INVALID',
    disposition: outcome?.disposition ?? null,
    orchestration: outcome ?? null,
  };
}

const isMain = process.argv[1] && import.meta.url === 'file://' + path.resolve(process.argv[1]);
if (isMain) {
  const [action, workUnitId] = process.argv.slice(2);
  const result = admitModelRuntimeRequest({ action, work_unit_id: workUnitId });
  process.stdout.write(JSON.stringify(result) + '\n');
  const success = result.action === 'plan'
    ? !['REQUEST_SHAPE_INVALID', 'WORK_UNIT_NOT_FOUND', 'PLANNER_RESULT_INVALID'].includes(result.status)
    : result.executed === true;
  process.exit(success ? 0 : 1);
}
