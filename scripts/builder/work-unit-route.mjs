#!/usr/bin/env node
/**
 * JARVIS-ROUTER-01 — canonical Work Unit → model routing projection.
 *
 * This module does not choose authority and does not invoke a model. It reads the
 * canonical Work Unit, derives its provider-agnostic permission envelope through
 * work-unit.mjs, and asks router.mjs for the deterministic model participation plan.
 */
import path from 'node:path';
import { loadWorkUnit, derivePermissionEnvelope } from './work-unit.mjs';
import { planModelRoute } from './router.mjs';

export function routingTaskFromWorkUnit(workUnit) {
  return {
    capability: workUnit.capability ?? null,
    task_class: workUnit.task_class ?? null,
    risk_class: workUnit.risk_class ?? 'mechanical',
    routing_profile: workUnit.routing_profile ?? 'local-first',
    review_policy: workUnit.review_policy ?? 'auto',
    data_class: workUnit.data_class ?? 'unspecified',
    external_review: workUnit.external_review === true,
    external_tiebreaker: workUnit.external_tiebreaker === true,
  };
}

export function planWorkUnitRoute(workUnitId) {
  const workUnit = loadWorkUnit(workUnitId);
  if (!workUnit) {
    return { ok: false, work_unit_id: workUnitId, status: 'WORK_UNIT_NOT_FOUND' };
  }

  const permissionEnvelope = derivePermissionEnvelope(workUnit);
  const routingTask = routingTaskFromWorkUnit(workUnit);
  const plan = planModelRoute(routingTask, { permissionEnvelope });

  return {
    ok: true,
    work_unit_id: workUnitId,
    canonical_sha: workUnit.canonical_sha ?? null,
    routing_inputs: routingTask,
    permission_envelope: permissionEnvelope,
    plan,
  };
}

const isMain = process.argv[1] && import.meta.url === 'file://' + path.resolve(process.argv[1]);
if (isMain) {
  const id = process.argv[2];
  if (!id) {
    console.error('usage: work-unit-route.mjs <work_unit_id>');
    process.exit(2);
  }
  const result = planWorkUnitRoute(id);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}
