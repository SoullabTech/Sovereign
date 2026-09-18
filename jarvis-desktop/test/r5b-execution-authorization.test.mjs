import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { routeIntelligence } from '../../scripts/builder/routing-intelligence.mjs';
import { routeDigest } from '../../scripts/builder/routing-route-integrity.mjs';

const require = createRequire(import.meta.url);
const C = require('../src/work-unit-control.js');
const SHA = '0123456789abcdef0123456789abcdef01234567';

function inklingPacket(id) {
  const route = routeIntelligence({
    task_shape: 'mechanical_code',
    review_pressure: 'ordinary',
    challenge_mode: 'adversarial',
    frontier_posture: 'none',
    evidence: {
      local_worktree_available: true,
      external_bundle_refs: ['scripts/builder/routing-intelligence.mjs'],
      task_text_available: true,
    },
    authority: {
      repo_read: true,
      repo_write_scope: 'none',
      network_external: false,
      provider_spend: false,
      repository_external_disclosure: false,
    },
    work_unit: { risk_class: 'high', explicit_independent_review: true },
  });
  return {
    work_unit_id: id,
    title: 'R5B Desktop proof',
    objective: 'Review one bounded repository file',
    execution_lane: 'opencode',
    canonical_sha: SHA,
    branch: 'chore/' + id,
    worktree: null,
    governing_authority: 'test fixture',
    established_facts: [],
    allowed_files: ['scripts/builder/routing-intelligence.mjs'],
    prohibited_files_actions: [],
    acceptance_criteria: ['Return evidence'],
    verification_commands: [],
    escalation_conditions: [],
    max_attempts: 2,
    expected_output: 'review',
    capability: 'routing-intelligence-preview',
    task_class: 'routed_review_plan',
    risk_class: 'high',
    authorized_acts: ['repo.read'],
    not_authorized_acts: [
      'repo.write:worktree',
      'production.read',
      'production.write',
      'deploy',
      'authority.change',
    ],
    integration_actor: 'founder',
    autonomy_ceiling: 'LEVEL_1_REVIEW',
    provider_strategy: [],
    routing: {
      evidence_class: 'E1_REPOSITORY_LOCAL',
      task_shape: 'mechanical_code',
    },
    routing_intelligence: {
      route_record: route,
      route_digest: routeDigest(route),
      route_version: route.route_version,
      execution_connected: false,
      source: 'R2-pure-router',
      bound_at_sha: SHA,
    },
    disclosure: {
      repository_read_only_external: false,
      provider_spend_authorized: false,
    },
  };
}

function withHome(fn) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'r5b-desktop-'));
  const old = process.env.AIN_DELEGATION_HOME;
  process.env.AIN_DELEGATION_HOME = home;
  fs.mkdirSync(path.join(home, 'packets'), { recursive: true });
  return Promise.resolve()
    .then(() => fn(home))
    .finally(() => {
      if (old === undefined) delete process.env.AIN_DELEGATION_HOME;
      else process.env.AIN_DELEGATION_HOME = old;
      fs.rmSync(home, { recursive: true, force: true });
    });
}

test('preview and Authorize once do not touch credentials; Confirm Execute does so only after final R4 admission', async () => {
  await withHome(async (home) => {
    const id = 'r5b-desktop-ordering';
    fs.writeFileSync(
      path.join(home, 'packets', id + '.json'),
      JSON.stringify(inklingPacket(id), null, 2),
    );
    const env = { AIN_DELEGATION_HOME: home, PATH: process.env.PATH, USER: 'soullab' };
    let keychainCalls = 0;
    const keychainProbe = () => { keychainCalls += 1; return true; };

    const preview = await C.executionAuthorizationPreview(
      process.cwd(), id, 'inkling-tinker', { env, keychainProbe },
    );
    assert.equal(preview.ok, true);
    assert.equal(preview.status, 'HELD_FOR_HUMAN_AUTHORIZATION');
    assert.equal(preview.r4_disposition, 'HELD_FOR_AUTHORITY');
    assert.equal(preview.provider.model_ref, 'tinker/thinkingmachines/Inkling-Small');
    assert.equal(keychainCalls, 0);

    const authorized = await C.authorizeExecutionOnce(
      process.cwd(), id, 'inkling-tinker', { env, keychainProbe },
    );
    assert.equal(authorized.ok, true);
    assert.equal(authorized.status, 'AUTHORIZED_ONCE');
    assert.equal(keychainCalls, 0);

    let runnerCalls = 0;
    const confirmed = await C.confirmAuthorizedExecution(
      process.cwd(), id, authorized.grant.grant_id,
      {
        env,
        keychainProbe,
        executeResolvedProvider: async (_root, args) => {
          runnerCalls += 1;
          assert.equal(args.providerId, 'inkling-tinker');
          assert.equal(args.model, 'tinker/thinkingmachines/Inkling-Small');
          assert.equal(args.resolved.execution_adapter, 'tinker-direct');
          return {
            ok: true,
            status: 'COMPLETED',
            recorded_attempt: { attempt_number: 1 },
          };
        },
      },
    );
    assert.equal(confirmed.ok, true);
    assert.equal(confirmed.final_admission.provider_acts.find(
      (act) => act.provider_id === 'inkling-tinker',
    ).disposition, 'ADMITTED');
    assert.equal(keychainCalls, 1);
    assert.equal(runnerCalls, 1);
    assert.equal(confirmed.execution_grant.standing, 'CONSUMED');

    const second = await C.confirmAuthorizedExecution(
      process.cwd(), id, authorized.grant.grant_id,
      { env, keychainProbe, executeResolvedProvider: async () => { runnerCalls += 1; } },
    );
    assert.equal(second.ok, false);
    assert.equal(second.reason, 'GRANT_NOT_ACTIVE');
    assert.equal(runnerCalls, 1);
  });
});

test('material Work Unit change invalidates grant before credential lookup or provider execution', async () => {
  await withHome(async (home) => {
    const id = 'r5b-desktop-stale';
    const packetPath = path.join(home, 'packets', id + '.json');
    const packet = inklingPacket(id);
    fs.writeFileSync(packetPath, JSON.stringify(packet, null, 2));
    const env = { AIN_DELEGATION_HOME: home, PATH: process.env.PATH, USER: 'soullab' };
    let keychainCalls = 0;
    let runnerCalls = 0;
    const authorized = await C.authorizeExecutionOnce(
      process.cwd(), id, 'inkling-tinker',
      { env, keychainProbe: () => { keychainCalls += 1; return true; } },
    );
    assert.equal(authorized.ok, true);
    assert.equal(keychainCalls, 0);

    packet.objective = 'Changed after authorization';
    fs.writeFileSync(packetPath, JSON.stringify(packet, null, 2));

    const result = await C.confirmAuthorizedExecution(
      process.cwd(), id, authorized.grant.grant_id,
      {
        env,
        keychainProbe: () => { keychainCalls += 1; return true; },
        executeResolvedProvider: async () => { runnerCalls += 1; return { ok: true }; },
      },
    );
    assert.equal(result.ok, false);
    assert.equal(result.status, 'GRANT_INVALID');
    assert.equal(keychainCalls, 0);
    assert.equal(runnerCalls, 0);

    const snapshot = await C.status(process.cwd(), id, { env });
    const standing = snapshot.execution_grants.find(
      (entry) => entry.grant.grant_id === authorized.grant.grant_id,
    );
    assert.equal(standing.standing, 'INVALIDATED');
  });
});
