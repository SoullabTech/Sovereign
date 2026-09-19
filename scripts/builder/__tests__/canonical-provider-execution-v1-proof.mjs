#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import {
  createLifecycleEnvelopeV2,
  transitionLifecycleV2,
} from '../work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from '../work-unit-routing-v2.mjs';
import {
  appendTransportBindingV1,
  governedTransportForParticipantV1,
} from '../work-unit-transport-v1.mjs';
import { appendLedgerRecordV2 } from '../work-unit-ledger-v2.mjs';
import {
  prepareCanonicalExecutionAuthorizationV1,
  createCanonicalExecutionGrantV1,
  validateCanonicalExecutionGrantV1,
  evaluateCanonicalExecutionGrantV1,
} from '../canonical-provider-execution-v1.mjs';

const SHA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('PASS  ' + name);
  } catch (error) {
    failed += 1;
    console.log('FAIL  ' + name);
    console.log('      ' + error.message);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function input() {
  return {
    identity: {
      id: 'e1-proof-canonical',
      programme: 'JARVIS-CANONICAL-PROVIDER-EXECUTION-01',
      parent_work_unit: null,
      objective: 'Prove canonical one-shot execution bridge',
      work_class: 'VERIFICATION',
      task_shape: 'CODE_GROUNDED',
      capability: null,
    },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    routing_request: { requested_posture: 'default', review_pressure: 'ordinary' },
    context: {
      context_refs: [],
      evidence_refs: ['local-worktree:' + SHA],
      assumptions: [],
      unknowns: [],
    },
    scope: {
      repository: 'synthetic/e1',
      base_ref: SHA,
      allowed_paths: ['scripts/builder'],
      forbidden_paths: [],
    },
    authority: {
      repository_read: true,
      repository_write: 'none',
      shell: 'none',
      network_external: false,
      provider_spend: false,
      external_disclosure: 'none',
      merge: false,
      deploy: false,
      production_read: false,
      production_write: false,
    },
    evaluation: {
      acceptance_conditions: ['one-shot execution remains human-governed'],
      falsification_conditions: ['route or authority mutates'],
      stop_conditions: ['stop on stale grant'],
    },
    provenance: {
      creator: 'synthetic:e1',
      authorizing_act: null,
      source_commits: [SHA],
    },
    state: { supersedes: null },
  };
}

function tx(envelope, to, extra = {}) {
  const out = transitionLifecycleV2(envelope, {
    to,
    evidence_ref: 'e1-proof:' + to.toLowerCase(),
    reason_code: 'E1_PROOF_' + to,
    ...extra,
  });
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  return out.envelope;
}

function routedEnvelope() {
  const draft = createWorkUnitDraftV2(input());
  assert.equal(draft.ok, true, JSON.stringify(draft.blockers));
  const life = createLifecycleEnvelopeV2(draft.work_unit);
  assert.equal(life.ok, true);
  let env = life.envelope;
  env = tx(env, 'BOUNDED');
  env = tx(env, 'AUTHORIZED', { authorization_ref: 'human:e1-proof' });
  const routed = bindAuthorizedRouteV2(env);
  assert.equal(routed.ok, true, JSON.stringify(routed.blockers));
  return routed.envelope;
}

function bind(env, participantId, status = 'READY', supersedes = null, suffix = '1') {
  const governed = governedTransportForParticipantV1(env.work_unit, participantId);
  assert.ok(governed);
  const out = appendTransportBindingV1(env, {
    transport_binding_id: 'e1-' + participantId + '-' + suffix,
    supersedes_binding_id: supersedes,
    route_participant_id: participantId,
    provider_id: governed.provider_id,
    model_id: governed.model_id,
    adapter_id: governed.adapter_id,
    readiness: {
      status,
      evidence_ref: 'e1-proof:structural-ready:' + participantId + ':' + suffix,
    },
  });
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  return out.envelope;
}

function readyEnvelope() {
  let env = routedEnvelope();
  for (const participant of [
    env.work_unit.routing.route_record.primary,
    ...(env.work_unit.routing.route_record.challengers || []),
  ]) {
    if (participant.required_for_completion === true) {
      env = bind(env, participant.participant_id, 'READY');
    }
  }
  return env;
}

function preview(env, participantId = 'primary') {
  return prepareCanonicalExecutionAuthorizationV1({
    envelope: env,
    route_participant_id: participantId,
    local_worktree_available: true,
  });
}

function grantFor(env, participantId = 'primary') {
  const p = preview(env, participantId);
  assert.equal(p.ok, true, JSON.stringify(p.blockers));
  const made = createCanonicalExecutionGrantV1(p, {
    sequence: 1,
    issued_at: '2026-09-18T20:00:00.000Z',
    actor_id: 'human:e1-proof',
  });
  assert.equal(made.ok, true, JSON.stringify(made.blockers));
  return { preview: p, grant: made.grant };
}

console.log('=== E1 pure structural boundary ===');

check('E1-1 — pure law has no filesystem/network/credential/provider execution capability', () => {
  const source = readFileSync(new URL('../canonical-provider-execution-v1.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /node:(fs|path|os|net|http|https|child_process)/);
  assert.doesNotMatch(source, /process\.env|fetch\s*\(|execFile|spawn\s*\(|Keychain|API_KEY/);
  assert.match(source, /evaluateExecutionAdmission/);
  assert.match(source, /routeDigest/);
});

check('E1-2 — route recommendation without W3T binding cannot authorize execution', () => {
  const out = preview(routedEnvelope());
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'ACTIVE_TRANSPORT_BINDING_REQUIRED'));
});

check('E1-3 — W3T HOLD alone cannot authorize execution', () => {
  let env = routedEnvelope();
  env = bind(env, 'primary', 'HOLD');
  const out = preview(env);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'TRANSPORT_NOT_READY_FOR_EXECUTION'));
});

check('E1-4 — READY transport plus exact W0/W2/W3 facts reaches only human-authorization preview', () => {
  const p = preview(readyEnvelope());
  assert.equal(p.ok, true, JSON.stringify(p.blockers));
  assert.equal(p.status, 'READY_FOR_HUMAN_AUTHORIZATION');
  assert.equal(p.r4_admission_before.provider_acts[0].disposition, 'HELD_FOR_AUTHORITY');
  assert.deepEqual(p.grant_scope.acts, ['provider.execute:qwen-local']);
  assert.equal(p.r5a_integrity.exact, true);
});

check('E1-5 — human grant is exact, one-shot, non-transferable, and does not execute', () => {
  const { grant } = grantFor(readyEnvelope());
  assert.equal(grant.actor_kind, 'human');
  assert.equal(grant.one_shot, true);
  assert.equal(grant.non_transferable, true);
  assert.equal(grant.route_participant.model_family, 'QWEN');
  assert.equal(grant.transport_binding.provider_id, 'qwen-local');
  assert.deepEqual(grant.granted_authority.acts, ['provider.execute:qwen-local']);
});

check('E1-6 — fresh grant re-runs R4 and R5A to ADMITTED', () => {
  const env = readyEnvelope();
  const { grant } = grantFor(env);
  const out = evaluateCanonicalExecutionGrantV1({
    grant,
    envelope: env,
    local_worktree_available: true,
  });
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  assert.equal(out.status, 'ADMITTED');
  assert.equal(out.r5a_integrity.exact, true);
  const act = out.admission.provider_acts.find((item) => item.provider_id === 'qwen-local');
  assert.equal(act.disposition, 'ADMITTED');
});

check('E1-7 — provider availability cannot substitute a different family/provider transport', () => {
  const env = readyEnvelope();
  const { grant } = grantFor(env);
  const changed = clone(env);
  const binding = changed.work_unit.routing.transport_bindings.find(
    (item) => item.route_participant_id === 'primary',
  );
  binding.provider_id = 'gpt-oss-local';
  const current = preview(changed);
  const checked = validateCanonicalExecutionGrantV1(grant, current);
  assert.equal(checked.ok, false);
});

check('E1-8 — superseding transport binding invalidates the old grant', () => {
  let env = readyEnvelope();
  const { grant } = grantFor(env);
  const active = env.work_unit.routing.transport_bindings.find(
    (item) => item.route_participant_id === 'primary',
  );
  env = bind(env, 'primary', 'READY', active.transport_binding_id, '2');
  const current = preview(env);
  assert.equal(current.ok, true, JSON.stringify(current.blockers));
  assert.equal(validateCanonicalExecutionGrantV1(grant, current).ok, false);
});

check('E1-9 — changed canonical SHA invalidates the grant before final admission', () => {
  const env = readyEnvelope();
  const { grant } = grantFor(env);
  const changed = clone(env);
  changed.work_unit.scope.base_ref = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const out = evaluateCanonicalExecutionGrantV1({ grant, envelope: changed });
  assert.equal(out.ok, false);
});

check('E1-10 — changed route digest invalidates the grant', () => {
  const env = readyEnvelope();
  const { grant } = grantFor(env);
  const changed = clone(env);
  changed.work_unit.routing.route_digest = 'sha256:' + 'f'.repeat(64);
  const out = evaluateCanonicalExecutionGrantV1({ grant, envelope: changed });
  assert.equal(out.ok, false);
});

check('E1-11 — changed W2 authorized core invalidates the grant', () => {
  const env = readyEnvelope();
  const { grant } = grantFor(env);
  const changed = clone(env);
  changed.work_unit.authority.deploy = true;
  const out = evaluateCanonicalExecutionGrantV1({ grant, envelope: changed });
  assert.equal(out.ok, false);
});

check('E1-12 — attempt/evidence population change invalidates grant; retry cannot inherit authority', () => {
  let env = readyEnvelope();
  const { grant } = grantFor(env);
  env = tx(env, 'EXECUTING');
  const binding = env.work_unit.routing.transport_bindings.find(
    (item) => item.route_participant_id === 'primary' && !item.supersedes_binding_id,
  );
  const identity = {
    model_identity_id: 'mi-e1-qwen',
    route_participant_id: 'primary',
    transport_binding_id: binding.transport_binding_id,
    model_family: 'QWEN',
    provider_id: 'qwen-local',
    model_id: 'qwen3-coder:30b',
    adapter_id: 'opencode',
    role: env.work_unit.routing.route_record.primary.role,
  };
  let appended = appendLedgerRecordV2(env, { kind: 'model_identity', entry: identity });
  assert.equal(appended.ok, true, JSON.stringify(appended.blockers));
  env = appended.envelope;
  appended = appendLedgerRecordV2(env, {
    kind: 'attempt',
    entry: {
      attempt_id: 'attempt-e1-primary',
      ...identity,
      actor_id: null,
      attempt_kind: 'primary',
      parent_attempt_id: null,
      status: 'completed',
      evidence_refs: ['result:e1-primary'],
    },
  });
  assert.equal(appended.ok, true, JSON.stringify(appended.blockers));
  env = appended.envelope;
  const current = preview(env);
  assert.equal(current.ok, true, JSON.stringify(current.blockers));
  assert.equal(validateCanonicalExecutionGrantV1(grant, current).ok, false);
});

check('E1-13 — missing local substrate is refused by fresh R4 admission', () => {
  const env = readyEnvelope();
  const p = prepareCanonicalExecutionAuthorizationV1({
    envelope: env,
    route_participant_id: 'primary',
    local_worktree_available: false,
  });
  assert.equal(p.ok, false);
  assert.equal(p.status, 'R4_PREAUTHORITY_REFUSED');
});

check('E1-14 — grant digest tamper is detected', () => {
  const env = readyEnvelope();
  const { grant } = grantFor(env);
  const tampered = clone(grant);
  tampered.transport_binding.model_id = 'gpt-oss:20b';
  const checked = validateCanonicalExecutionGrantV1(tampered, preview(env));
  assert.equal(checked.ok, false);
  assert.ok(checked.blockers.some((b) => b.code === 'GRANT_DIGEST_MISMATCH'));
});

check('E1-15 — response-budget drift cannot become execution-ready authority', () => {
  const changed = clone(readyEnvelope());
  const bindings = changed.work_unit.routing.transport_bindings;
  const superseded = new Set(bindings.map((b) => b.supersedes_binding_id).filter(Boolean));
  const binding = bindings.find((b) =>
    b.route_participant_id === 'primary'
    && !superseded.has(b.transport_binding_id));
  binding.response_budget_profile_id = 'WRONG_BUDGET_PROFILE';
  const out = preview(changed);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'TRANSPORT_RESPONSE_BUDGET_MISMATCH'));
});

console.log();
console.log(passed + ' passed · ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
