// JOP-04 RB-6B — host-side C0 occurrence + execution-decision custody.
'use strict';
const crypto = require('node:crypto');
const path = require('node:path');

const VERSION = 'JOP04-RB6B.v1';
const pending = new Map();

function clone(v) { return JSON.parse(JSON.stringify(v)); }
function canonical(v) {
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
  }
  return JSON.stringify(v ?? null);
}
function digest(v) {
  return 'sha256:' + crypto.createHash('sha256').update(canonical(v)).digest('hex');
}
function occurrenceId() {
  return 'c0-' + crypto.randomBytes(10).toString('hex');
}
function decisionId() {
  return 'exec-' + crypto.randomBytes(10).toString('hex');
}
function routeProjection(routeDecision) {
  return {
    execution_lane: routeDecision?.execution_lane ?? null,
    cost_class: routeDecision?.cost_class ?? null,
    status: routeDecision?.status ?? null,
  };
}
function binding(root, invocation, routeDecision) {
  return Object.freeze({
    binding_version: 'JOP04-CI.v1',
    root: path.resolve(root),
    invocation: clone(invocation),
    route: routeProjection(routeDecision),
  });
}
function stage({ task, routeDecision, root, invocation }) {
  if (!task || !routeDecision || !root || !invocation) {
    return { ok:false, status:'REFUSED', reason:'ROUTED_INVOCATION_REQUIRED' };
  }
  if (routeDecision.execution_lane !== 'C0' || routeDecision.status !== 'routed') {
    return { ok:false, status:'REFUSED', reason:'C0_ROUTE_REQUIRED' };
  }
  // JOP-04 semantic contract: repository-defined check.run remains held.
  if (task.capability === 'check.run') {
    return {
      ok:false,
      status:'ROUTED_IDENTITY_UNRESOLVED',
      reason:'CHECK_RUN_EXECUTION_PLAN_IDENTITY_UNRESOLVED',
      occurrence_id:null,
    };
  }
  const id = occurrenceId();
  const bound = binding(root, invocation, routeDecision);
  const record = Object.freeze({
    version: VERSION,
    occurrence_id: id,
    task: clone(task),
    route: clone(routeDecision),
    binding: bound,
    binding_digest: digest(bound),
    decided: false,
  });
  pending.set(id, record);
  return {
    ok:true,
    status:'ROUTED_AWAITING_EXECUTION_DECISION',
    occurrence_id:id,
    binding_digest:record.binding_digest,
  };
}

function inspect(id) {
  const r = pending.get(String(id || ''));
  return r ? clone(r) : null;
}

function verify(id, { root, invocation, routeDecision }) {
  const r = pending.get(String(id || ''));
  if (!r) return { ok:false, status:'REFUSED', reason:'PENDING_OCCURRENCE_NOT_FOUND' };
  if (r.decided) return { ok:false, status:'REFUSED', reason:'OCCURRENCE_ALREADY_DECIDED' };
  const current = binding(root, invocation, routeDecision);
  if (digest(current) !== r.binding_digest) {
    return { ok:false, status:'REFUSED', reason:'INVOCATION_BINDING_CHANGED' };
  }
  return { ok:true, record:clone(r) };
}
function constitute(id, { root, invocation, routeDecision, source = 'host:native-confirmation' }) {
  const checked = verify(id, { root, invocation, routeDecision });
  if (!checked.ok) return checked;
  const current = pending.get(String(id));
  const decision = Object.freeze({
    decision_version: VERSION,
    decision_id: decisionId(),
    occurrence_id: current.occurrence_id,
    binding_digest: current.binding_digest,
    source,
    constituted_at: new Date().toISOString(),
    one_shot: true,
  });
  pending.set(String(id), Object.freeze({ ...current, decided:true, execution_decision:decision }));
  return {
    ok:true,
    status:'EXECUTION_DECISION_CONSTITUTED',
    record:clone(current),
    execution_decision:clone(decision),
  };
}

function forget(id) {
  return pending.delete(String(id || ''));
}

module.exports = {
  VERSION,
  stage,
  inspect,
  verify,
  constitute,
  forget,
  _bindingForTest: binding,
  _digestForTest: digest,
};
