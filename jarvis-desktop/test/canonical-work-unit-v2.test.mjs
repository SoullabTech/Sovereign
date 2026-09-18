import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const require = createRequire(import.meta.url);
const C = require('../src/canonical-work-unit-v2.js');
const WUC = require('../src/work-unit-control.js');

const SHA = 'f0063747979b8104282e3f482dcd91ec6c208ad0';

function spec(patch = {}) {
  return {
    objective: 'Prove canonical Desktop convergence',
    workClass: 'VERIFICATION',
    taskShape: 'CODE_GROUNDED',
    capability: '',
    evidenceClass: 'E1_REPOSITORY_LOCAL',
    requestedPosture: 'default',
    reviewPressure: 'ordinary',
    evidenceFocus: 'scripts/builder/work-unit-v2.mjs',
    acceptanceCriteria: 'Canonical state is visible',
    falsificationConditions: 'Provider execution becomes available',
    stopConditions: 'Stop before provider execution',
    authorityRequest: {
      networkExternal: false,
      providerSpend: false,
      externalDisclosure: 'none',
    },
    ...patch,
  };
}

function withHome(fn) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-i4-canonical-'));
  const env = { ...process.env, AIN_DELEGATION_HOME: home, USER: 'i4-test' };
  return Promise.resolve()
    .then(() => fn(home, env))
    .finally(() => fs.rmSync(home, { recursive: true, force: true }));
}

test('prospective J5 preview is explicitly noncanonical and family-first', async () => {
  await withHome(async (_home, env) => {
    const out = await C.prospectivePreview(REPO, spec(), {
      canonicalSha: SHA,
      nowMs: 1000,
      env,
    });
    assert.equal(out.ok, true);
    assert.equal(out.classification, 'PROSPECTIVE_NONCANONICAL_NONEXECUTING');
    assert.equal(out.canonical_effect, 'none');
    assert.equal(out.execution_connected, false);
    assert.equal(out.route_record.primary.model_family, 'QWEN');
    assert.equal(out.route_record.challengers[0].model_family, 'GPT_OSS');
    assert.equal(Object.hasOwn(out.route_record.primary, 'provider_id'), false);
  });
});

test('canonical Desktop creates W0.v2 DRAFT, then W2/W3 advance it without using preview as route truth', async () => {
  await withHome(async (home, env) => {
    let out = await C.createCanonicalV2(REPO, spec(), {
      canonicalSha: SHA,
      nowMs: 1000,
      env,
      actorId: 'human:test',
    });
    assert.equal(out.ok, true);
    assert.equal(out.mode, 'CANONICAL_V2');
    assert.equal(out.work_unit_version, 'W0.v2');
    assert.equal(out.lifecycle.state, 'DRAFT');
    assert.equal(out.work_unit.routing.route_record, null);
    assert.equal(out.prospective_preview.classification, 'PROSPECTIVE_NONCANONICAL_NONEXECUTING');
    assert.equal(out.provider_execution.connected, false);

    const id = out.work_unit_id;
    assert.equal(fs.existsSync(C.workUnitPath(id, env)), true);
    assert.equal(fs.existsSync(path.join(home, 'packets', id + '.json')), false);

    out = await C.transitionCanonicalV2(REPO, id, 'BOUNDED', { env, actorId: 'human:test' });
    assert.equal(out.ok, true);
    assert.equal(out.lifecycle.state, 'BOUNDED');

    out = await C.transitionCanonicalV2(REPO, id, 'AUTHORIZED', { env, actorId: 'human:test' });
    assert.equal(out.ok, true);
    assert.equal(out.lifecycle.state, 'AUTHORIZED');

    out = await C.bindCanonicalRouteV2(REPO, id, { env, actorId: 'human:test' });
    assert.equal(out.ok, true);
    assert.equal(out.lifecycle.state, 'ROUTED');
    assert.equal(out.routing.route_version, 'J5.v1');
    assert.equal(out.routing.participants[0].model_family, 'QWEN');
    assert.equal(out.routing.participants[1].model_family, 'GPT_OSS');
    assert.equal(out.routing.execution_connected, false);
    assert.equal(out.preview_comparison.standing, 'MATCH');
    assert.notEqual(out.work_unit.routing.route_record, out.prospective_preview.route_record);
  });
});

test('W3T Desktop binding derives provider/model from route participant and remains HOLD/nonexecuting', async () => {
  await withHome(async (_home, env) => {
    let out = await C.createCanonicalV2(REPO, spec(), {
      canonicalSha: SHA, nowMs: 1001, env, actorId: 'human:test',
    });
    const id = out.work_unit_id;
    out = await C.transitionCanonicalV2(REPO, id, 'BOUNDED', { env, actorId: 'human:test' });
    out = await C.transitionCanonicalV2(REPO, id, 'AUTHORIZED', { env, actorId: 'human:test' });
    out = await C.bindCanonicalRouteV2(REPO, id, { env, actorId: 'human:test' });

    out = await C.bindCanonicalTransportV2(REPO, id, 'primary', { env, actorId: 'human:test' });
    assert.equal(out.ok, true);
    assert.equal(out.transport_binding.model_family, 'QWEN');
    assert.equal(out.transport_binding.provider_id, 'qwen-local');
    assert.equal(out.transport_binding.model_id, 'qwen3-coder:30b');
    assert.equal(out.transport_binding.readiness.status, 'HOLD');

    out = await C.bindCanonicalTransportV2(REPO, id, 'local-review-1', { env, actorId: 'human:test' });
    assert.equal(out.ok, true);
    assert.equal(out.transport_binding.model_family, 'GPT_OSS');
    assert.equal(out.transport_binding.provider_id, 'gpt-oss-local');
    assert.equal(out.transport_binding.readiness.status, 'HOLD');

    const status = await C.statusCanonicalV2(REPO, id, { env });
    assert.equal(status.provider_execution.connected, false);
    assert.equal(status.provider_execution.authority_created, false);
    assert.equal(status.next_actions.length, 0);
  });
});

test('canonical W0.v2 is refused by legacy run-provider and R5B lower-controller paths before execution authority', async () => {
  await withHome(async (_home, env) => {
    const created = await C.createCanonicalV2(REPO, spec(), {
      canonicalSha: SHA, nowMs: 1002, env, actorId: 'human:test',
    });
    const id = created.work_unit_id;

    const run = await WUC.runProvider(REPO, {
      work_unit_id: id,
      provider_id: 'qwen-local',
    }, { env });
    assert.equal(run.ok, false);
    assert.equal(run.status, 'CANONICAL_V2_EXECUTION_DISCONNECTED');

    const preview = await WUC.executionAuthorizationPreview(
      REPO,
      id,
      'qwen-local',
      { env, keychainProbe: () => { throw new Error('credential probe must not run'); } },
    );
    assert.equal(preview.ok, false);
    assert.equal(preview.status, 'CANONICAL_V2_EXECUTION_DISCONNECTED');

    const auth = await WUC.authorizeExecutionOnce(
      REPO,
      id,
      'qwen-local',
      { env, keychainProbe: () => { throw new Error('credential probe must not run'); } },
    );
    assert.equal(auth.ok, false);
    assert.equal(auth.status, 'CANONICAL_V2_EXECUTION_DISCONNECTED');
  });
});

test('EVIDENCE_READY canonical Work Unit requires explicit host-derived human adjudication and separate closure', async () => {
  await withHome(async (_home, env) => {
    const e2e = await import(
      new URL('../../scripts/builder/work-unit-e2e-v2.mjs', import.meta.url)
    );
    const synthetic = e2e.runSyntheticCanonicalCompositionV2();
    assert.equal(synthetic.ok, true);

    const envelope = JSON.parse(JSON.stringify(synthetic.final_envelope));
    envelope.work_unit.state.lifecycle_state = 'EVIDENCE_READY';
    envelope.work_unit.state.disposition = 'open';
    envelope.guard.current_state = 'EVIDENCE_READY';

    fs.mkdirSync(path.dirname(C.workUnitPath(envelope.work_unit.identity.id, env)), { recursive: true });
    fs.writeFileSync(
      C.workUnitPath(envelope.work_unit.identity.id, env),
      JSON.stringify(envelope, null, 2) + '\n',
    );

    let status = await C.statusCanonicalV2(REPO, envelope.work_unit.identity.id, { env });
    assert.equal(status.lifecycle.state, 'EVIDENCE_READY');
    assert.equal(status.next_actions.some((a) => a.action === 'canonical-adjudicate'), true);

    const bad = await C.adjudicateCanonicalV2(
      REPO,
      envelope.work_unit.identity.id,
      { decision: 'accepted', basis_refs: [] },
      { env, actorId: 'human:test-operator' },
    );
    assert.equal(bad.ok, false);
    assert.equal(bad.reason, 'ADJUDICATION_BASIS_REQUIRED');

    const adjudicated = await C.adjudicateCanonicalV2(
      REPO,
      envelope.work_unit.identity.id,
      {
        decision: 'accepted',
        basis_refs: ['verifier:independent-review-1'],
      },
      { env, actorId: 'human:test-operator' },
    );
    assert.equal(adjudicated.ok, true);
    assert.equal(adjudicated.lifecycle.state, 'ADJUDICATED');
    assert.equal(adjudicated.adjudication_record.actor_kind, 'human');
    assert.equal(adjudicated.adjudication_record.actor_id, 'human:test-operator');
    assert.equal(adjudicated.adjudication_record.model_authored, false);
    assert.equal(adjudicated.next_actions.some((a) => a.action === 'canonical-close'), true);

    const closed = await C.closeCanonicalV2(
      REPO,
      envelope.work_unit.identity.id,
      { env, actorId: 'human:test-operator' },
    );
    assert.equal(closed.ok, true);
    assert.equal(closed.lifecycle.state, 'CLOSED');
    assert.equal(closed.closure_record.adjudication_ref, adjudicated.adjudication_record.evidence_ref);
  });
});
