/**
 * JARVIS O5-R5A — pure execution readiness evidence.
 *
 * This module selects at most one current-reachable O2 node whose exact runtime
 * binding is proven, whose runtime is ROUTED, and whose predecessor (if any) is
 * CLOSED. It grants no authority and performs no dispatch or lifecycle mutation.
 */

export const R5A_VERSION = 'O5-R5A.v1';
export const EVIDENCE_GATE = 'BLOCKED_BY_EVIDENCE';
export const SATISFIED_DEPENDENCY_STATE = 'CLOSED';
export const ELIGIBLE_OWN_STATE = 'ROUTED';
export const BINDING_FIELDS = Object.freeze([
  'graph_id', 'graph_digest', 'planned_work_unit_id',
  'canonical_work_unit_id', 'bound_at_sha',
]);

const validSha = (v) => typeof v === 'string' && /^[0-9a-f]{40}$/i.test(v);
const exactKeys = (value, keys) =>
  value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).sort().join('|') === [...keys].sort().join('|');

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function canonicalGraphEvidenceOk(graph) {
  return graph?.canonical_replay === true
    && typeof graph?.graph_id === 'string'
    && graph.graph_id.length > 0
    && typeof graph?.graph_digest === 'string'
    && /^sha256:[0-9a-f]{64}$/i.test(graph.graph_digest)
    && Array.isArray(graph?.work_units)
    && Array.isArray(graph?.topological_order);
}

export function validateRuntimeBindingR5A(binding, graph) {
  if (!exactKeys(binding, BINDING_FIELDS) || !canonicalGraphEvidenceOk(graph)) return false;
  if (binding.graph_id !== graph.graph_id || binding.graph_digest !== graph.graph_digest) return false;
  if (!validSha(binding.bound_at_sha)) return false;
  if (typeof binding.canonical_work_unit_id !== 'string' || !binding.canonical_work_unit_id) return false;
  return graph.work_units.some((node) => node?.work_unit_id === binding.planned_work_unit_id);
}

export function createRuntimeBindingR5A(input, graph) {
  if (!validateRuntimeBindingR5A(input, graph)) {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'INVALID_RUNTIME_BINDING_EVIDENCE' });
  }
  return deepFreeze({ ok: true, status: 'BOUND', binding: { ...input } });
}

export function indexRuntimeBindingsR5A(world) {
  const byPlan = new Map();
  const byRuntime = new Map();
  const errors = [];
  for (const binding of Array.isArray(world?.bindings) ? world.bindings : []) {
    if (!validateRuntimeBindingR5A(binding, world?.graph)) {
      errors.push('INVALID_BINDING');
      continue;
    }
    if (byPlan.has(binding.planned_work_unit_id)) errors.push('MULTIPLE_RUNTIME_BINDINGS');
    else byPlan.set(binding.planned_work_unit_id, binding);
    if (byRuntime.has(binding.canonical_work_unit_id)) errors.push('RUNTIME_BOUND_TO_MULTIPLE_NODES');
    else byRuntime.set(binding.canonical_work_unit_id, binding);
  }
  return { byPlan, byRuntime, errors };
}

function blocked(planned_work_unit_id, reason) {
  return { planned_work_unit_id, status: 'BLOCKED', gate: EVIDENCE_GATE, reason };
}

export function evaluateExecutionReadinessR5A(world) {
  const graph = world?.graph;
  if (!canonicalGraphEvidenceOk(graph)) {
    const order = Array.isArray(graph?.topological_order) ? graph.topological_order : [];
    return deepFreeze(order.map((pid) => blocked(pid, 'O2_CANONICAL_GRAPH_REQUIRED')));
  }
  const idx = indexRuntimeBindingsR5A(world);
  const rows = [];
  for (const pid of graph.topological_order) {
    const node = graph.work_units.find((x) => x?.work_unit_id === pid);
    const binding = idx.byPlan.get(pid);
    if (idx.errors.length || !node || !binding) {
      rows.push(blocked(pid, 'BINDING_EVIDENCE_INCOMPLETE'));
      continue;
    }
    const runtime = world?.runtimes?.[binding.canonical_work_unit_id];
    if (!runtime || runtime.guard !== 'valid') {
      rows.push(blocked(pid, 'RUNTIME_EVIDENCE_INCOMPLETE'));
      continue;
    }
    if (runtime.state !== ELIGIBLE_OWN_STATE) {
      rows.push({ planned_work_unit_id: pid, status: 'INELIGIBLE', reason: 'OWN_STATE_' + runtime.state });
      continue;
    }
    const deps = Array.isArray(node.depends_on) ? node.depends_on : [];
    const predecessor = deps[0];
    if (predecessor) {
      const depBinding = idx.byPlan.get(predecessor);
      if (!depBinding) {
        rows.push(blocked(pid, 'DEPENDENCY_BINDING_MISSING'));
        continue;
      }
      const depRuntime = world?.runtimes?.[depBinding.canonical_work_unit_id];
      if (!depRuntime || depRuntime.guard !== 'valid') {
        rows.push(blocked(pid, 'DEPENDENCY_EVIDENCE_MISSING'));
        continue;
      }
      if (depRuntime.state !== SATISFIED_DEPENDENCY_STATE) {
        rows.push(blocked(pid, 'DEPENDENCY_NOT_CLOSED'));
        continue;
      }
    }
    rows.push({ planned_work_unit_id: pid, status: 'READY', reason: 'PREDECESSOR_CLOSED' });
  }
  return deepFreeze(rows);
}

export function selectCurrentReachableR5A(world) {
  const hasCapacity = Number.isInteger(world?.capacity?.available_slots)
    && world.capacity.available_slots > 0;
  if (!hasCapacity) return deepFreeze([]);
  return deepFreeze(
    evaluateExecutionReadinessR5A(world)
      .filter((row) => row.status === 'READY')
      .slice(0, 1)
      .map((row) => row.planned_work_unit_id),
  );
}

export function decideExecutionReadinessR5A(world) {
  const selected = selectCurrentReachableR5A(world);
  return deepFreeze({
    version: R5A_VERSION,
    selected,
    protected_unchanged: true,
    dispatch_authorized: false,
  });
}

export function liveSessionRecheckAllowsR5A({ observed_slots, live_active, live_limit } = {}) {
  if (!Number.isInteger(live_active) || !Number.isInteger(live_limit)) return false;
  if (live_active >= live_limit) return false;
  return Number.isInteger(observed_slots) && observed_slots > 0;
}
