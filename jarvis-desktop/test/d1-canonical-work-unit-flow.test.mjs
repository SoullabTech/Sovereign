import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const C = require('../src/work-unit-control.js');
const OWU = require('../src/operator-work-unit.js');

const SHA = '0123456789abcdef0123456789abcdef01234567';

function withHome(fn) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'd1-desktop-flow-'));
  const old = process.env.AIN_DELEGATION_HOME;
  process.env.AIN_DELEGATION_HOME = home;
  return Promise.resolve()
    .then(() => fn(home))
    .finally(() => {
      if (old === undefined) delete process.env.AIN_DELEGATION_HOME;
      else process.env.AIN_DELEGATION_HOME = old;
      fs.rmSync(home, { recursive: true, force: true });
    });
}

function canonicalInput() {
  const built = OWU.buildCanonicalInput({
    objective: 'Review the D1 canonical Work Unit flow',
    acceptanceCriteria: 'Canonical history is complete\nHuman adjudication is explicit',
    evidenceFocus: 'scripts/builder/work-unit-v1.mjs',
    providers: [],
    routing: {
      taskShape: 'deep_reasoning',
      reviewPressure: 'ordinary',
      challengeMode: 'none',
      explicitIndependentReview: false,
    },
  }, {
    canonicalSha: SHA,
    repository: 'SoullabTech/Sovereign',
    nowMs: 1,
  });
  assert.equal(built.ok, true, JSON.stringify(built.errors));
  return built.input;
}

test('D1 Desktop flow uses canonical W1-W5 truth through R5B execution and human closure', async () => {
  await withHome(async (home) => {
    const env = {
      AIN_DELEGATION_HOME: home,
      PATH: process.env.PATH,
      USER: 'soullab',
    };

    const created = await C.createCanonical(process.cwd(), canonicalInput(), { home, env });
    assert.equal(created.ok, true, JSON.stringify(created.blockers || created.errors));
    const id = created.work_unit_id;

    assert.equal(fs.existsSync(path.join(home, 'canonical-work-units', id + '.json')), true);
    assert.equal(fs.existsSync(path.join(home, 'packets', id + '.json')), true);

    let snapshot = await C.status(process.cwd(), id, { env });
    assert.equal(snapshot.ok, true);
    assert.equal(snapshot.canonical, true);
    assert.equal(snapshot.work_unit.lifecycle_state, 'ROUTED');
    assert.equal(snapshot.canonical_work_unit.state.lifecycle_state, 'ROUTED');
    assert.deepEqual(
      snapshot.transition_history.map((entry) => entry.to),
      ['BOUNDED', 'AUTHORIZED', 'ROUTED'],
    );

    const primaryPreview = await C.executionAuthorizationPreview(
      process.cwd(), id, 'gpt-oss-local', { env },
    );
    assert.equal(primaryPreview.ok, true, JSON.stringify(primaryPreview.blockers));
    assert.equal(primaryPreview.r4_disposition, 'HELD_FOR_AUTHORITY');

    const primaryGrant = await C.authorizeExecutionOnce(
      process.cwd(), id, 'gpt-oss-local', { env },
    );
    assert.equal(primaryGrant.ok, true);

    const primary = await C.confirmAuthorizedExecution(
      process.cwd(), id, primaryGrant.grant.grant_id,
      {
        env,
        executeResolvedProvider: async () => ({
          ok: true,
          status: 'COMPLETED',
          recorded_attempt: {
            attempt_number: 1,
            test_results: 'pass',
            recommended_next_action: 'review-diff',
          },
        }),
      },
    );
    assert.equal(primary.ok, true, JSON.stringify(primary.blockers));
    assert.equal(primary.execution_grant.standing, 'CONSUMED');

    snapshot = await C.status(process.cwd(), id, { env });
    assert.equal(snapshot.work_unit.lifecycle_state, 'EXECUTING');
    assert.equal(snapshot.canonical_evidence.attempts.length, 1);
    assert.equal(snapshot.canonical_evidence.attempts[0].attempt_kind, 'initial');
    assert.equal(snapshot.canonical_evidence.attempts[0].provider_id, 'gpt-oss-local');

    const challengerPreview = await C.executionAuthorizationPreview(
      process.cwd(), id, 'qwen-local', { env },
    );
    assert.equal(challengerPreview.ok, true, JSON.stringify(challengerPreview.blockers));

    const challengerGrant = await C.authorizeExecutionOnce(
      process.cwd(), id, 'qwen-local', { env },
    );
    assert.equal(challengerGrant.ok, true);

    const challenger = await C.confirmAuthorizedExecution(
      process.cwd(), id, challengerGrant.grant.grant_id,
      {
        env,
        executeResolvedProvider: async () => ({
          ok: true,
          status: 'COMPLETED',
          recorded_attempt: {
            attempt_number: 2,
            test_results: 'pass',
            recommended_next_action: 'review-diff',
          },
        }),
      },
    );
    assert.equal(challenger.ok, true, JSON.stringify(challenger.blockers));

    snapshot = await C.status(process.cwd(), id, { env });
    assert.equal(snapshot.canonical_evidence.attempts.length, 2);
    const review = snapshot.canonical_evidence.attempts.find(
      (entry) => entry.attempt_kind === 'independent_review',
    );
    assert.ok(review);
    assert.equal(review.provider_id, 'qwen-local');

    const verified = await C.recordCanonicalVerifier(
      process.cwd(), id,
      {
        review_attempt_id: review.attempt_id,
        disposition: 'supports',
      },
      { env },
    );
    assert.equal(verified.ok, true, JSON.stringify(verified.blockers));
    assert.equal(verified.work_unit.lifecycle_state, 'EVIDENCE_READY');
    assert.equal(verified.canonical_evidence.verifier_results.length, 1);

    const adjudicated = await C.humanAdjudicate(
      process.cwd(), id, { outcome: 'accepted' }, { env },
    );
    assert.equal(adjudicated.ok, true);
    assert.equal(adjudicated.work_unit.lifecycle_state, 'ADJUDICATED');

    const closed = await C.closeCanonical(process.cwd(), id, { env });
    assert.equal(closed.ok, true);
    assert.equal(closed.work_unit.lifecycle_state, 'CLOSED');
    assert.deepEqual(
      closed.transition_history.map((entry) => entry.to),
      ['BOUNDED','AUTHORIZED','ROUTED','EXECUTING','EVIDENCE_READY','ADJUDICATED','CLOSED'],
    );

    const before = fs.readFileSync(
      path.join(home, 'canonical-work-units', id + '.json'), 'utf8',
    );
    const packetPath = path.join(home, 'packets', id + '.json');
    const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
    packet.authorized_acts = [...(packet.authorized_acts || []), 'deploy'];
    fs.writeFileSync(packetPath, JSON.stringify(packet, null, 2));
    const after = fs.readFileSync(
      path.join(home, 'canonical-work-units', id + '.json'), 'utf8',
    );
    assert.equal(after, before, 'compatibility packet may not rewrite canonical truth');
  });
});

test('D1 refuses challenger execution before the primary attempt exists', async () => {
  await withHome(async (home) => {
    const env = {
      AIN_DELEGATION_HOME: home,
      PATH: process.env.PATH,
      USER: 'soullab',
    };
    const created = await C.createCanonical(process.cwd(), canonicalInput(), { home, env });
    assert.equal(created.ok, true, JSON.stringify(created.blockers || created.errors));

    const preview = await C.executionAuthorizationPreview(
      process.cwd(), created.work_unit_id, 'qwen-local', { env },
    );
    assert.equal(preview.ok, false);
    assert.equal(preview.reason, 'PRIMARY_ATTEMPT_REQUIRED_BEFORE_INDEPENDENT_REVIEW');
  });
});
