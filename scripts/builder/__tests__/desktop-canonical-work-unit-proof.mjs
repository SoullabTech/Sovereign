#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  buildCanonicalDesktopWorkUnitV1,
  createCanonicalDesktopWorkUnitV1,
  readCanonicalWorkUnitV1,
  projectCompatibilityPacketV1,
  projectDesktopCanonicalStatusV1,
  ensureCanonicalModelIdentityV1,
  beginCanonicalExecutionV1,
  recordCanonicalProviderAttemptV1,
  recordCanonicalTestResultV1,
  recordCanonicalVerifierAndReadyV1,
  humanAdjudicateCanonicalWorkUnitV1,
  closeCanonicalWorkUnitV1,
} from '../desktop-canonical-work-unit-v1.mjs';

const SHA = '0123456789abcdef0123456789abcdef01234567';
let pass = 0;
let fail = 0;

function check(name, fn) {
  try {
    fn();
    pass += 1;
    console.log('PASS  ' + name);
  } catch (error) {
    fail += 1;
    console.log('FAIL  ' + name);
    console.log('      ' + error.message);
  }
}

function input(id, patch = {}) {
  return {
    identity: {
      id,
      programme: 'JARVIS-WORK-UNIT-DESKTOP-CONVERGENCE-01',
      parent_work_unit: null,
      objective: 'Review the canonical Desktop convergence',
      work_class: 'VERIFICATION',
      task_shape: patch.task_shape || 'deep_reasoning',
    },
    context: {
      context_refs: [],
      evidence_refs: [
        'local-worktree:' + SHA,
        'external-bundle:scripts/builder/work-unit-v1.mjs',
        'approved-task-text:Review the canonical Desktop convergence',
      ],
      assumptions: [],
      unknowns: [],
    },
    scope: {
      repository: 'SoullabTech/Sovereign',
      base_ref: SHA,
      allowed_paths: ['scripts/builder/work-unit-v1.mjs'],
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
    routing: {
      requested_posture: patch.requested_posture || 'default',
    },
    evaluation: {
      acceptance_conditions: ['Evidence is inspectable.'],
      falsification_conditions: ['Authority never widens.'],
      stop_conditions: ['Stop on missing evidence.'],
    },
    provenance: {
      creator: 'founder:jarvis-desktop',
      authorizing_act: null,
      source_commits: [SHA],
    },
    state: { supersedes: null },
  };
}

const home = fs.mkdtempSync(path.join(os.tmpdir(), 'd1-canonical-'));
try {
  check('D1-1 — W1/W2/W3 build reaches ROUTED through canonical modules', () => {
    const built = buildCanonicalDesktopWorkUnitV1(input('d1-proof-main'));
    assert.equal(built.ok, true, JSON.stringify(built.blockers));
    assert.equal(built.record.envelope.work_unit.state.lifecycle_state, 'ROUTED');
    assert.deepEqual(
      built.transition_history?.map?.((x) => x.to) || built.record.transition_history.map((x) => x.to),
      ['BOUNDED', 'AUTHORIZED', 'ROUTED'],
    );
  });

  check('D1-2 — persisted canonical record, not packet, owns lifecycle truth', () => {
    const created = createCanonicalDesktopWorkUnitV1(input('d1-proof-main'), { home });
    assert.equal(created.ok, true, JSON.stringify(created.blockers));
    const loaded = readCanonicalWorkUnitV1('d1-proof-main', { home });
    assert.equal(loaded.canonical_truth, 'W1-W5');
    assert.equal(loaded.envelope.guard.current_state, 'ROUTED');
    assert.equal(loaded.envelope.work_unit.provenance.authorizing_act,
      'founder:jarvis-desktop:create-and-authorize');
  });

  check('D1-3 — compatibility packet is deterministic projection and carries no provider execution authority', () => {
    const record = readCanonicalWorkUnitV1('d1-proof-main', { home });
    const packet = projectCompatibilityPacketV1(record);
    assert.equal(packet.work_unit_id, 'd1-proof-main');
    assert.equal(packet.capability, 'canonical-work-unit-execution-adapter');
    assert.deepEqual(packet.provider_strategy, []);
    assert.equal(packet.routing_intelligence.route_digest, record.envelope.work_unit.routing.route_digest);
    assert.equal(packet.authorized_acts.some((x) => x.startsWith('provider.execute:')), false);
    assert.ok(packet.not_authorized_acts.includes('repo.write:worktree'));
    assert.ok(packet.not_authorized_acts.includes('deploy'));
  });

  check('D1-4 — canonical status exposes W1-W5 truth and compatibility is labelled adapter-only', () => {
    const status = projectDesktopCanonicalStatusV1(
      readCanonicalWorkUnitV1('d1-proof-main', { home }),
    );
    assert.equal(status.canonical, true);
    assert.equal(status.work_unit.lifecycle_state, 'ROUTED');
    assert.match(status.work_unit.compatibility.note, /canonical W1-W5 truth/i);
    assert.equal(status.routing_intelligence.execution_connected, false);
  });

  check('D1-5 — W4 model identity can be appended while ROUTED without lifecycle mutation', () => {
    const identity = ensureCanonicalModelIdentityV1(
      'd1-proof-main', 'gpt-oss-local', 'ollama/gpt-oss:20b', { home },
    );
    assert.equal(identity.ok, true, JSON.stringify(identity.blockers));
    assert.equal(identity.record.envelope.work_unit.state.lifecycle_state, 'ROUTED');
    assert.equal(identity.record.envelope.work_unit.provenance.model_identity.length, 1);
  });

  check('D1-6 — only W2 advances ROUTED to EXECUTING', () => {
    const begun = beginCanonicalExecutionV1('d1-proof-main', { home });
    assert.equal(begun.ok, true);
    assert.equal(begun.record.envelope.work_unit.state.lifecycle_state, 'EXECUTING');
    assert.equal(begun.transition.reason_code, 'DESKTOP_D1_CONFIRM_EXECUTE');
  });

  check('D1-7 — primary provider result becomes a W4 append-only attempt', () => {
    const attempt = recordCanonicalProviderAttemptV1('d1-proof-main', {
      provider_id: 'gpt-oss-local',
      model_ref: 'ollama/gpt-oss:20b',
      outcome: { ok: true, status: 'COMPLETED' },
    }, { home });
    assert.equal(attempt.ok, true, JSON.stringify(attempt.blockers));
    assert.equal(attempt.attempt.attempt_kind, 'initial');
    assert.equal(attempt.attempt.status, 'completed');
    assert.equal(attempt.record.envelope.work_unit.execution.attempts.length, 1);
  });

  check('D1-8 — compatibility test result becomes W4 evidence', () => {
    const result = recordCanonicalTestResultV1('d1-proof-main', {
      attempt_id: 'd1-attempt-01-gpt-oss-local',
      result: 'pass',
    }, { home });
    assert.equal(result.ok, true, JSON.stringify(result.blockers));
    assert.equal(result.record.envelope.work_unit.execution.test_results.length, 1);
  });

  check('D1-9 — challenger provider attempt is independent_review, never a retry', () => {
    const attempt = recordCanonicalProviderAttemptV1('d1-proof-main', {
      provider_id: 'qwen-local',
      model_ref: 'ollama/qwen3-coder:30b',
      outcome: { ok: true, status: 'COMPLETED' },
    }, { home });
    assert.equal(attempt.ok, true, JSON.stringify(attempt.blockers));
    assert.equal(attempt.attempt.attempt_kind, 'independent_review');
    assert.equal(attempt.attempt.parent_attempt_id, 'd1-attempt-01-gpt-oss-local');
  });

  check('D1-10 — verifier evidence is W4 append-only and only then reaches EVIDENCE_READY', () => {
    const verified = recordCanonicalVerifierAndReadyV1('d1-proof-main', {
      review_attempt_id: 'd1-attempt-02-qwen-local',
      disposition: 'supports',
    }, { home });
    assert.equal(verified.ok, true, JSON.stringify(verified.blockers));
    assert.equal(verified.status, 'EVIDENCE_READY');
    assert.equal(verified.record.envelope.work_unit.evaluation.verifier_results.length, 1);
    assert.equal(verified.record.envelope.work_unit.state.lifecycle_state, 'EVIDENCE_READY');
  });

  check('D1-11 — explicit human accept reaches ADJUDICATED; no model can do it implicitly', () => {
    const adjudicated = humanAdjudicateCanonicalWorkUnitV1('d1-proof-main', {
      outcome: 'accepted',
    }, { home });
    assert.equal(adjudicated.ok, true);
    assert.equal(adjudicated.record.envelope.work_unit.state.lifecycle_state, 'ADJUDICATED');
    assert.equal(adjudicated.transition.reason_code, 'DESKTOP_D1_HUMAN_ACCEPTED');
  });

  check('D1-12 — W2 alone closes an already human-adjudicated Work Unit', () => {
    const closed = closeCanonicalWorkUnitV1('d1-proof-main', { home });
    assert.equal(closed.ok, true);
    assert.equal(closed.record.envelope.work_unit.state.lifecycle_state, 'CLOSED');
    assert.deepEqual(
      closed.record.transition_history.map((x) => x.to),
      ['BOUNDED','AUTHORIZED','ROUTED','EXECUTING','EVIDENCE_READY','ADJUDICATED','CLOSED'],
    );
  });

  check('D1-13 — compatibility surfaces cannot rewrite closed canonical history', () => {
    const before = fs.readFileSync(
      path.join(home, 'canonical-work-units', 'd1-proof-main.json'), 'utf8',
    );
    const packet = projectCompatibilityPacketV1(
      readCanonicalWorkUnitV1('d1-proof-main', { home }),
    );
    packet.authorized_acts.push('deploy');
    const after = fs.readFileSync(
      path.join(home, 'canonical-work-units', 'd1-proof-main.json'), 'utf8',
    );
    assert.equal(after, before);
  });

  check('D1-14 — external challenge fails closed because D1 does not widen network/spend/disclosure authority', () => {
    const built = buildCanonicalDesktopWorkUnitV1(
      input('d1-external-refused', { requested_posture: 'adversarial_challenge' }),
    );
    assert.equal(built.ok, false);
    const codes = (built.blockers || []).map((x) => x.code);
    assert.ok(codes.includes('EXACT_BUNDLE_DISCLOSURE_AUTHORITY_REQUIRED')
      || codes.includes('ROUTER_EXTERNAL_NETWORK_AUTHORITY_REQUIRED')
      || codes.includes('ROUTE_NOT_BINDABLE'));
  });

  check('D1-15 — single-provider mechanical route may use explicit human verifier evidence', () => {
    const created = createCanonicalDesktopWorkUnitV1(
      input('d1-human-verifier', { task_shape: 'mechanical_code' }),
      { home },
    );
    assert.equal(created.ok, true, JSON.stringify(created.blockers));
    assert.equal(beginCanonicalExecutionV1('d1-human-verifier', { home }).ok, true);
    const attempt = recordCanonicalProviderAttemptV1('d1-human-verifier', {
      provider_id: 'qwen-local',
      model_ref: 'ollama/qwen3-coder:30b',
      outcome: { ok: true, status: 'COMPLETED' },
    }, { home });
    assert.equal(attempt.ok, true, JSON.stringify(attempt.blockers));
    const verified = recordCanonicalVerifierAndReadyV1('d1-human-verifier', {
      disposition: 'mechanical_pass',
    }, { home });
    assert.equal(verified.ok, true, JSON.stringify(verified.blockers));
    assert.equal(verified.verifier.verifier_kind, 'human');
    assert.equal(verified.status, 'EVIDENCE_READY');
  });

  check('D1-16 — RETURNED / STOPPED / SUPERSEDED remain W2 terminal exits', () => {
    for (const [id, outcome, extra, expected] of [
      ['d1-return', 'returned', {}, 'RETURNED'],
      ['d1-stop', 'stopped', {}, 'STOPPED'],
      ['d1-super', 'superseded', { superseded_by: 'd1-successor' }, 'SUPERSEDED'],
    ]) {
      const created = createCanonicalDesktopWorkUnitV1(
        input(id, { task_shape: 'mechanical_code' }),
        { home },
      );
      assert.equal(created.ok, true, JSON.stringify(created.blockers));
      const exited = humanAdjudicateCanonicalWorkUnitV1(id, { outcome, ...extra }, { home });
      assert.equal(exited.ok, true, JSON.stringify(exited.blockers));
      assert.equal(exited.record.envelope.work_unit.state.lifecycle_state, expected);
    }
  });

  check('D1-17 — convergence adapter has no provider, network, credential, or model execution capability', () => {
    const source = fs.readFileSync(
      new URL('../desktop-canonical-work-unit-v1.mjs', import.meta.url),
      'utf8',
    );
    assert.doesNotMatch(source, /fetch\s*\(/);
    assert.doesNotMatch(source, /execFile|spawn\s*\(|child_process/);
    assert.doesNotMatch(source, /find-generic-password|Keychain|API_KEY/);
    assert.doesNotMatch(source, /tinker-direct|opencode-provider/);
    assert.match(source, /createWorkUnitDraftV1/);
    assert.match(source, /transitionLifecycleV1/);
    assert.match(source, /bindAuthorizedRouteV1/);
    assert.match(source, /appendLedgerRecordV1/);
  });
} finally {
  fs.rmSync(home, { recursive: true, force: true });
}

console.log();
console.log(pass + ' passed · ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
