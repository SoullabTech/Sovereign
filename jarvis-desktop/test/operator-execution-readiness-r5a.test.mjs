import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BINDING_FIELDS,
  createRuntimeBindingR5A,
  decideExecutionReadinessR5A,
  evaluateExecutionReadinessR5A,
  liveSessionRecheckAllowsR5A,
  selectCurrentReachableR5A,
} from '../src/operator-execution-readiness-r5a.mjs';
import { world, protectedRuntimeView } from '../../tests/constitutional/jarvis-o5-r5/substrate.mjs';

test('R5A binding is exact, immutable evidence only', () => {
  const w = world();
  const result = createRuntimeBindingR5A(w.bindings[2], w.graph);
  assert.equal(result.ok, true);
  assert.deepEqual(Object.keys(result.binding).sort(), [...BINDING_FIELDS].sort());
  assert.equal(Object.isFrozen(result.binding), true);
  const widened = { ...w.bindings[2], dispatch_authorized: true };
  assert.equal(createRuntimeBindingR5A(widened, w.graph).ok, false);
});

test('R5A selects only current-reachable ROUTED node with CLOSED predecessor', () => {
  const w = world();
  assert.deepEqual(selectCurrentReachableR5A(w), ['p3']);
  const p3 = evaluateExecutionReadinessR5A(w).find((x) => x.planned_work_unit_id === 'p3');
  assert.equal(p3.status, 'READY');
});

test('R5A fails closed on noncanonical graph, duplicate binding, missing evidence, and wrong states', () => {
  const cases = [];
  {
    const w = world(); w.graph.canonical_replay = false; cases.push(w);
  }
  {
    const w = world(); w.runtimes.w9 = { id:'w9', state:'ROUTED', guard:'valid' };
    w.bindings.push({ ...w.bindings[2], canonical_work_unit_id:'w9' }); cases.push(w);
  }
  {
    const w = world(); delete w.runtimes.w2; cases.push(w);
  }
  {
    const w = world(); w.runtimes.w2.state = 'ADJUDICATED'; cases.push(w);
  }
  {
    const w = world(); w.runtimes.w3.state = 'EXECUTING'; cases.push(w);
  }
  for (const w of cases) assert.deepEqual(selectCurrentReachableR5A(w), []);
});

test('R5A capacity is only a selection gate and never widens to parallel dispatch', () => {
  for (const [slots, expected] of [[0,0],[-1,0],[null,0],[1,1],[5,1]]) {
    const w = world(); w.capacity.available_slots = slots;
    assert.equal(selectCurrentReachableR5A(w).length, expected);
  }
});

test('R5A decision is deterministic and mutates no protected runtime/session surface', () => {
  const w = world();
  const before = protectedRuntimeView(w);
  const a = decideExecutionReadinessR5A(w);
  const b = decideExecutionReadinessR5A(structuredClone(w));
  assert.deepEqual(a, b);
  assert.equal(a.dispatch_authorized, false);
  assert.equal(a.protected_unchanged, true);
  assert.equal(protectedRuntimeView(w), before);
});

test('R5A live session recheck remains authoritative over stale observed capacity', () => {
  assert.equal(liveSessionRecheckAllowsR5A({ observed_slots:1, live_active:2, live_limit:2 }), false);
  assert.equal(liveSessionRecheckAllowsR5A({ observed_slots:1, live_active:1, live_limit:2 }), true);
  assert.equal(liveSessionRecheckAllowsR5A({ observed_slots:0, live_active:0, live_limit:2 }), false);
});
