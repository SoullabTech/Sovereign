import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createWorkUnitDraftV1 } from '../work-unit-v1.mjs';
import {
  LIFECYCLE_VERSION,
  authorizedCoreSnapshotV1,
  createLifecycleEnvelopeV1,
  transitionLifecycleV1,
} from '../work-unit-lifecycle-v1.mjs';

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL  ${name}`);
    console.log(`      ${error.message}`);
  }
}

const BASE = 'add54c8e3f86656fdfc235adab39ae81e54cfed3';

function merge(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return override;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value)
      && base?.[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      result[key] = merge(base[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function makeInput(overrides = {}) {
  const base = {
    identity: {
      id: 'synthetic-w2-work-unit',
      programme: 'JARVIS-WORK-UNIT-01',
      parent_work_unit: null,
      objective: 'Prove the deterministic Work Unit lifecycle.',
      work_class: 'ARCHITECTURE',
      task_shape: 'deep_reasoning',
    },
    context: {
      context_refs: ['W0', 'W1'],
      evidence_refs: ['W1:22/22'],
      assumptions: [],
      unknowns: [],
    },
    scope: {
      repository: 'SoullabTech/Sovereign',
      base_ref: BASE,
      allowed_paths: [
        'scripts/builder/work-unit-lifecycle-v1.mjs',
        'scripts/builder/__tests__/work-unit-lifecycle-v1-proof.mjs',
      ],
      forbidden_paths: ['app/api'],
    },
    authority: {
      repository_read: true,
      repository_write: 'worktree',
      shell: 'bounded_write',
      network_external: false,
      provider_spend: false,
      external_disclosure: 'none',
      merge: false,
      deploy: false,
      production_read: false,
      production_write: false,
    },
    routing: {
      requested_posture: 'local_only',
    },
    evaluation: {
      acceptance_conditions: ['Legal lifecycle transitions succeed deterministically.'],
      falsification_conditions: ['Illegal transitions or core mutation are admitted.'],
      stop_conditions: ['Any provider, network, merge, deploy, or production dependency appears.'],
    },
    provenance: {
      creator: 'JARVIS',
      authorizing_act: null,
      source_commits: [BASE],
    },
    state: {
      supersedes: null,
    },
  };
  return merge(base, overrides);
}

function draftWorkUnit(overrides = {}) {
  const result = createWorkUnitDraftV1(makeInput(overrides));
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  return result.work_unit;
}

function startEnvelope(overrides = {}) {
  const result = createLifecycleEnvelopeV1(draftWorkUnit(overrides));
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  return result.envelope;
}

function tx(envelope, to, extra = {}) {
  return transitionLifecycleV1(envelope, {
    to,
    evidence_ref: `evidence:${envelope.work_unit.state.lifecycle_state}->${to}`,
    reason_code: `${envelope.work_unit.state.lifecycle_state}_TO_${to}`,
    ...extra,
  });
}

function mustTx(envelope, to, extra = {}) {
  const result = tx(envelope, to, extra);
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  return result.envelope;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withRuntime(envelope, mutate) {
  const next = clone(envelope);
  mutate(next.work_unit);
  return next;
}

function toBounded() {
  return mustTx(startEnvelope(), 'BOUNDED');
}

function toAuthorized() {
  return mustTx(toBounded(), 'AUTHORIZED', {
    authorization_ref: 'founder:synthetic-w2-authority',
  });
}

function routeBound(envelope = toAuthorized()) {
  return withRuntime(envelope, (workUnit) => {
    workUnit.routing.router_version = 'R1.v1';
    workUnit.routing.route_record = {
      route_version: 'R1.v1',
      execution_disposition: 'admitted_local',
    };
    workUnit.routing.primary = {
      provider_id: 'gpt-oss-local',
      role: 'deep_reasoning_primary',
    };
  });
}

function toRouted() {
  return mustTx(routeBound(), 'ROUTED');
}

function toExecuting() {
  return mustTx(toRouted(), 'EXECUTING');
}

function attemptBound(envelope = toExecuting()) {
  return withRuntime(envelope, (workUnit) => {
    workUnit.execution.attempts.push({
      attempt_id: 'attempt-1',
      status: 'completed',
      provider_id: 'synthetic-local',
    });
  });
}

function toEvidenceReady() {
  return mustTx(attemptBound(), 'EVIDENCE_READY');
}

function verifierBound(envelope = toEvidenceReady()) {
  return withRuntime(envelope, (workUnit) => {
    workUnit.evaluation.verifier_results.push({
      verifier_id: 'synthetic-verifier',
      disposition: 'accept',
    });
  });
}

function toAdjudicated() {
  return mustTx(verifierBound(), 'ADJUDICATED', {
    adjudication: 'accepted',
  });
}

function codes(result) {
  return result.blockers.map((b) => b.code);
}

console.log('=== structural purity ===');

check('W2-PURE — only the pure W1 schema module is imported', () => {
  const source = readFileSync(new URL('../work-unit-lifecycle-v1.mjs', import.meta.url), 'utf8');
  const imports = source.split('\n').filter((line) => line.trimStart().startsWith('import '));
  assert.equal(imports.length, 1);
  assert.match(imports[0], /from '\.\/work-unit-v1\.mjs';$/);
  for (const forbidden of [
    'fetch(',
    'process.env',
    'Date.now',
    'new Date(',
    'Math.random',
    'crypto.random',
    'execFile',
    'spawn(',
    'child_process',
    'TINKER_API_KEY',
    'NVIDIA_API_KEY',
  ]) {
    assert.equal(source.includes(forbidden), false, `forbidden surface present: ${forbidden}`);
  }
});

check('W2-PURE — lifecycle envelopes, guards, and transition records are deeply immutable', () => {
  const created = createLifecycleEnvelopeV1(draftWorkUnit());
  assert.equal(created.ok, true);
  assert.equal(Object.isFrozen(created), true);
  assert.equal(Object.isFrozen(created.envelope), true);
  assert.equal(Object.isFrozen(created.envelope.work_unit), true);
  assert.equal(Object.isFrozen(created.envelope.guard), true);

  const bounded = tx(created.envelope, 'BOUNDED');
  assert.equal(bounded.ok, true);
  assert.equal(Object.isFrozen(bounded), true);
  assert.equal(Object.isFrozen(bounded.transition), true);
});

console.log();
console.log('=== W-L1 through W-L7 — legal spine and authorization ===');

check('W-L1 — W1 DRAFT creates a W2.v1 envelope with no authorized-core snapshot', () => {
  const created = createLifecycleEnvelopeV1(draftWorkUnit());
  assert.equal(created.ok, true);
  assert.equal(created.envelope.guard.lifecycle_version, LIFECYCLE_VERSION);
  assert.equal(created.envelope.guard.current_state, 'DRAFT');
  assert.equal(created.envelope.guard.authorized_core_snapshot, null);
});

check('W-L2 — DRAFT advances only to BOUNDED', () => {
  const bounded = tx(startEnvelope(), 'BOUNDED');
  assert.equal(bounded.ok, true);
  assert.equal(bounded.envelope.work_unit.state.lifecycle_state, 'BOUNDED');

  const illegal = tx(startEnvelope(), 'AUTHORIZED', {
    authorization_ref: 'founder:skip',
  });
  assert.equal(illegal.ok, false);
  assert.ok(codes(illegal).includes('ILLEGAL_LIFECYCLE_TRANSITION'));
});

check('W-L3 — entering AUTHORIZED requires an explicit authorization reference', () => {
  const result = tx(toBounded(), 'AUTHORIZED');
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('AUTHORIZATION_REF_REQUIRED'));
});

check('W-L4 — AUTHORIZED binds the authorization reference and captures the core snapshot', () => {
  const result = tx(toBounded(), 'AUTHORIZED', {
    authorization_ref: 'founder:w2-test',
  });
  assert.equal(result.ok, true);
  assert.equal(result.envelope.work_unit.provenance.authorizing_act, 'founder:w2-test');
  assert.equal(
    result.envelope.guard.authorized_core_snapshot,
    authorizedCoreSnapshotV1(result.envelope.work_unit),
  );
});

check('W-L5 — conflicting pre-existing authorizing act is refused', () => {
  const bounded = mustTx(startEnvelope({
    provenance: { authorizing_act: 'founder:prior-act' },
  }), 'BOUNDED');

  const result = tx(bounded, 'AUTHORIZED', {
    authorization_ref: 'founder:different-act',
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('AUTHORIZATION_REF_CONFLICT'));
});

check('W-L6 — AUTHORIZED cannot become ROUTED until a route is actually bound', () => {
  const result = tx(toAuthorized(), 'ROUTED');
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('BOUND_ROUTE_REQUIRED'));
});

check('W-L7 — route binding is non-core and AUTHORIZED advances to ROUTED without changing core', () => {
  const authorized = toAuthorized();
  const snapshot = authorized.guard.authorized_core_snapshot;
  const bound = routeBound(authorized);
  const result = tx(bound, 'ROUTED');
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.envelope.guard.authorized_core_snapshot, snapshot);
  assert.equal(authorizedCoreSnapshotV1(result.envelope.work_unit), snapshot);
});

console.log();
console.log('=== W-L8 through W-L14 — execution, evidence, adjudication, closure ===');

check('W-L8 — ROUTED advances to EXECUTING only while the route remains bound', () => {
  const result = tx(toRouted(), 'EXECUTING');
  assert.equal(result.ok, true);
  assert.equal(result.envelope.work_unit.state.lifecycle_state, 'EXECUTING');

  const broken = withRuntime(toRouted(), (workUnit) => {
    workUnit.routing.route_record = null;
  });
  const refused = tx(broken, 'EXECUTING');
  assert.equal(refused.ok, false);
  assert.ok(codes(refused).includes('ROUTE_RECORD_REQUIRED'));
});

check('W-L9 — EXECUTING cannot become EVIDENCE_READY without at least one attempt', () => {
  const result = tx(toExecuting(), 'EVIDENCE_READY');
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('EXECUTION_ATTEMPT_REQUIRED'));
});

check('W-L10 — append-only runtime attempt evidence is non-core and admits EVIDENCE_READY', () => {
  const executing = toExecuting();
  const snapshot = executing.guard.authorized_core_snapshot;
  const result = tx(attemptBound(executing), 'EVIDENCE_READY');
  assert.equal(result.ok, true);
  assert.equal(result.envelope.guard.authorized_core_snapshot, snapshot);
});

check('W-L11 — EVIDENCE_READY cannot be ADJUDICATED without verifier evidence', () => {
  const result = tx(toEvidenceReady(), 'ADJUDICATED', {
    adjudication: 'accepted',
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('VERIFIER_RESULT_REQUIRED'));
});

check('W-L12 — ADJUDICATED admits only accepted adjudication; returned/stopped are exit states', () => {
  const result = tx(verifierBound(), 'ADJUDICATED', {
    adjudication: 'rejected',
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('ACCEPTED_ADJUDICATION_REQUIRED'));
});

check('W-L13 — verifier evidence plus accepted adjudication advances to ADJUDICATED', () => {
  const result = tx(verifierBound(), 'ADJUDICATED', {
    adjudication: 'accepted',
  });
  assert.equal(result.ok, true);
  assert.equal(result.envelope.work_unit.state.lifecycle_state, 'ADJUDICATED');
  assert.equal(result.envelope.work_unit.state.disposition, 'accepted');
});

check('W-L14 — only ADJUDICATED may close; EXECUTING → CLOSED is impossible', () => {
  const illegal = tx(toExecuting(), 'CLOSED');
  assert.equal(illegal.ok, false);
  assert.ok(codes(illegal).includes('ILLEGAL_LIFECYCLE_TRANSITION'));

  const closed = tx(toAdjudicated(), 'CLOSED');
  assert.equal(closed.ok, true);
  assert.equal(closed.envelope.work_unit.state.lifecycle_state, 'CLOSED');
  assert.equal(closed.envelope.work_unit.state.disposition, 'closed');
});

console.log();
console.log('=== W-L15 through W-L22 — terminal exits and authorized-core immutability ===');

check('W-L15 — terminal states are sealed against further transitions', () => {
  const closed = mustTx(toAdjudicated(), 'CLOSED');
  const result = tx(closed, 'RETURNED');
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('TERMINAL_STATE_SEALED'));
});

check('W-L16 — STOPPED and RETURNED are available from active states with explicit evidence', () => {
  const stopped = tx(toAuthorized(), 'STOPPED');
  assert.equal(stopped.ok, true);
  assert.equal(stopped.envelope.work_unit.state.disposition, 'stopped');

  const returned = tx(toRouted(), 'RETURNED');
  assert.equal(returned.ok, true);
  assert.equal(returned.envelope.work_unit.state.disposition, 'returned');
});

check('W-L17 — SUPERSEDED requires a distinct successor Work Unit id', () => {
  const missing = tx(toAuthorized(), 'SUPERSEDED');
  assert.equal(missing.ok, false);
  assert.ok(codes(missing).includes('SUPERSEDING_WORK_UNIT_REQUIRED'));

  const self = tx(toAuthorized(), 'SUPERSEDED', {
    superseded_by: 'synthetic-w2-work-unit',
  });
  assert.equal(self.ok, false);
  assert.ok(codes(self).includes('SELF_SUPERSESSION_FORBIDDEN'));

  const valid = tx(toAuthorized(), 'SUPERSEDED', {
    superseded_by: 'synthetic-w2-successor',
  });
  assert.equal(valid.ok, true);
  assert.equal(valid.transition.superseded_by, 'synthetic-w2-successor');
});

check('W-L18 — post-authorization authority mutation is refused', () => {
  const mutated = withRuntime(toAuthorized(), (workUnit) => {
    workUnit.authority.deploy = true;
  });
  const result = tx(mutated, 'ROUTED');
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('AUTHORIZED_CORE_MUTATED'));
});

check('W-L19 — post-authorization objective mutation is refused', () => {
  const mutated = withRuntime(toAuthorized(), (workUnit) => {
    workUnit.identity.objective = 'A different objective';
    workUnit.routing.router_version = 'R1.v1';
    workUnit.routing.route_record = {};
  });
  const result = tx(mutated, 'ROUTED');
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('AUTHORIZED_CORE_MUTATED'));
});

check('W-L20 — post-authorization evaluation-law mutation is refused', () => {
  const mutated = withRuntime(toAuthorized(), (workUnit) => {
    workUnit.evaluation.stop_conditions.push('new stop law');
    workUnit.routing.router_version = 'R1.v1';
    workUnit.routing.route_record = {};
  });
  const result = tx(mutated, 'ROUTED');
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('AUTHORIZED_CORE_MUTATED'));
});

check('W-L21 — non-core context/evidence may evolve without changing authorized core', () => {
  const authorized = toAuthorized();
  const snapshot = authorized.guard.authorized_core_snapshot;
  const evolved = withRuntime(authorized, (workUnit) => {
    workUnit.context.evidence_refs.push('later:evidence-ref');
    workUnit.routing.router_version = 'R1.v1';
    workUnit.routing.route_record = {};
  });
  const result = tx(evolved, 'ROUTED');
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.envelope.guard.authorized_core_snapshot, snapshot);
});

check('W-L22 — lifecycle guard/state mismatch fails closed', () => {
  const broken = clone(toAuthorized());
  broken.guard.current_state = 'ROUTED';
  broken.work_unit.routing.router_version = 'R1.v1';
  broken.work_unit.routing.route_record = {};
  const result = tx(broken, 'ROUTED');
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('LIFECYCLE_STATE_MISMATCH'));
});

console.log();
console.log('=== supplementary lifecycle controls ===');

check('unknown transition fields fail closed instead of being silently ignored', () => {
  const result = transitionLifecycleV1(startEnvelope(), {
    to: 'BOUNDED',
    evidence_ref: 'evidence:bounds',
    reason_code: 'BOUNDS',
    authority_patch: { deploy: true },
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('UNKNOWN_TRANSITION_FIELD'));
});

check('state/disposition inconsistency fails closed', () => {
  const broken = clone(startEnvelope());
  broken.work_unit.state.disposition = 'accepted';
  const result = tx(broken, 'BOUNDED');
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('STATE_DISPOSITION_MISMATCH'));
});

check('every successful transition emits a deterministic inspectable transition record', () => {
  const envelope = startEnvelope();
  const a = tx(envelope, 'BOUNDED');
  const b = tx(envelope, 'BOUNDED');
  assert.equal(a.ok, true);
  assert.equal(JSON.stringify(a.transition), JSON.stringify(b.transition));
  assert.deepEqual(a.transition, {
    lifecycle_version: LIFECYCLE_VERSION,
    work_unit_id: 'synthetic-w2-work-unit',
    from: 'DRAFT',
    to: 'BOUNDED',
    evidence_ref: 'evidence:DRAFT->BOUNDED',
    reason_code: 'DRAFT_TO_BOUNDED',
    authorization_ref: null,
    adjudication: null,
    superseded_by: null,
  });
});

console.log();
console.log(`${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
