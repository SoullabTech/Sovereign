import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const C = require('../src/canonical-work-unit-v2.js');
const WUC = require('../src/work-unit-control.js');

const REPO = path.resolve(import.meta.dirname, '..', '..');
const SHA = '9580ad382089e8ce2e454d28ff3d97c2aa8efe11';

function tempEnv() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'e1-desktop-'));
  return {
    home,
    env: {
      ...process.env,
      AIN_DELEGATION_HOME: home,
      USER: 'e1-proof',
    },
  };
}
function cleanup(home) {
  fs.rmSync(home, { recursive: true, force: true });
}

function spec(patch = {}) {
  return {
    objective: 'E1 canonical provider execution proof',
    workClass: 'VERIFICATION',
    taskShape: 'CODE_GROUNDED',
    capability: '',
    evidenceClass: 'E1_REPOSITORY_LOCAL',
    requestedPosture: 'default',
    reviewPressure: 'ordinary',
    evidenceFocus: 'scripts/builder/work-unit-v2.mjs',
    acceptanceCriteria: 'durable canonical evidence exists',
    falsificationConditions: 'authority or route changes',
    stopConditions: 'stop on stale grant',
    authorityRequest: {
      networkExternal: false,
      providerSpend: false,
      externalDisclosure: 'none',
    },
    ...patch,
  };
}

async function routedReady(env, nowMs = 3000, s = spec()) {
  let out = await C.createCanonicalV2(REPO, s, {
    canonicalSha: SHA,
    nowMs,
    env,
    actorId: 'human:e1-proof',
  });
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  const id = out.work_unit_id;

  out = await C.transitionCanonicalV2(REPO, id, 'BOUNDED', {
    env, actorId: 'human:e1-proof',
  });
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  out = await C.transitionCanonicalV2(REPO, id, 'AUTHORIZED', {
    env, actorId: 'human:e1-proof',
  });
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  out = await C.bindCanonicalRouteV2(REPO, id, {
    env, actorId: 'human:e1-proof',
  });
  assert.equal(out.ok, true, JSON.stringify(out.blockers));

  for (const participant of out.routing.participants) {
    if (participant.required_for_completion !== true) continue;
    let bound = await C.bindCanonicalTransportV2(
      REPO, id, participant.participant_id,
      { env, actorId: 'human:e1-proof' },
    );
    assert.equal(bound.ok, true, JSON.stringify(bound.blockers));
    assert.equal(bound.transport_binding.readiness.status, 'HOLD');

    bound = await WUC.canonicalPrepareTransport(
      REPO, id, participant.participant_id,
      { env, actorId: 'human:e1-proof' },
    );
    assert.equal(bound.ok, true, JSON.stringify(bound.blockers));
    const current = bound.routing.participants
      .find((p) => p.participant_id === participant.participant_id);
    const active = current.transport_bindings
      .filter((binding) => !current.transport_bindings
        .some((next) => next.supersedes_binding_id === binding.transport_binding_id));
    assert.equal(active.length, 1);
    assert.equal(active[0].readiness.status, 'READY');
  }
  return { id, status: await WUC.canonicalExecutionStatus(REPO, id, { env }) };
}

function stubResult(args, {
  exitCode = 0,
  testResults = 'not_run',
  escalation = false,
} = {}) {
  return {
    ok: exitCode === 0 && !escalation,
    status: exitCode === 0 && !escalation ? 'COMPLETED' : 'FAILED',
    run: { exit_code: exitCode, stdout: 'synthetic evidence', stderr: '' },
    durable_result: {
      execution_version: 'E1.v1',
      work_unit_id: args.workUnitId,
      grant_id: args.grantId,
      route_participant_id: args.binding.route_participant_id,
      transport_binding_id: args.binding.transport_binding_id,
      provider_id: args.binding.provider_id,
      model_id: args.binding.model_id,
      adapter_id: args.binding.adapter_id,
      exit_code: exitCode,
      test_results: testResults,
      escalation_required: escalation,
      recommended_next_action: exitCode === 0 && !escalation ? 'review-evidence' : 'reject',
      output_excerpt: 'synthetic evidence',
      stderr_excerpt: '',
    },
    result_ref: 'synthetic-result:' + args.grantId,
    result_digest: 'sha256:' + 'a'.repeat(64),
  };
}

test('E1 full canonical local flow: Authorize Once != Confirm Execute, DR1/W4 evidence, verifier, explicit evidence-ready', async () => {
  const { home, env } = tempEnv();
  try {
    const { id, status } = await routedReady(env, 3100);
    assert.equal(status.lifecycle.state, 'ROUTED');
    assert.equal(status.execution_bridge.available, true);

    const primary = status.routing.participants.find((p) => p.required_for_completion
      && p.participant_id === 'primary');
    assert.ok(primary);

    let runnerCalls = 0;
    let preview = await WUC.canonicalExecutionPreview(
      REPO, id, primary.participant_id,
      { env, actorId: 'human:e1-proof' },
    );
    assert.equal(preview.ok, true, JSON.stringify(preview.blockers));
    assert.equal(preview.status, 'HELD_FOR_HUMAN_AUTHORIZATION');
    assert.equal(runnerCalls, 0);

    const issued = await WUC.canonicalAuthorizeExecutionOnce(
      REPO, id, primary.participant_id,
      { env, actorId: 'human:e1-proof' },
    );
    assert.equal(issued.ok, true, JSON.stringify(issued.blockers));
    assert.equal(issued.standing, 'ACTIVE');
    assert.equal(runnerCalls, 0);

    const confirmed = await WUC.canonicalConfirmAuthorizedExecution(
      REPO, id, issued.grant.grant_id,
      {
        env,
        actorId: 'human:e1-proof',
        executeCanonicalProvider: async (_root, args) => {
          runnerCalls += 1;
          return stubResult(args, { exitCode: 0, testResults: 'pass' });
        },
      },
    );
    assert.equal(confirmed.ok, true, JSON.stringify(confirmed.blockers));
    assert.equal(runnerCalls, 1);
    assert.equal(confirmed.lifecycle.state, 'EXECUTING');
    assert.equal(confirmed.execution_grant.standing, 'CONSUMED');
    assert.equal(confirmed.canonical_attempt.attempt_kind, 'primary');
    assert.equal(confirmed.canonical_attempt.status, 'completed');
    assert.equal(confirmed.durable_mapping.mapper_version, 'DR1.v1');

    const afterPrimary = await WUC.canonicalExecutionStatus(REPO, id, { env });
    const challenger = afterPrimary.routing.participants.find(
      (p) => p.required_for_completion && p.participant_id !== 'primary',
    );
    assert.ok(challenger);

    preview = await WUC.canonicalExecutionPreview(
      REPO, id, challenger.participant_id,
      { env, actorId: 'human:e1-proof' },
    );
    assert.equal(preview.ok, true, JSON.stringify(preview.blockers));

    const challengerGrant = await WUC.canonicalAuthorizeExecutionOnce(
      REPO, id, challenger.participant_id,
      { env, actorId: 'human:e1-proof' },
    );
    assert.equal(challengerGrant.ok, true);

    const reviewed = await WUC.canonicalConfirmAuthorizedExecution(
      REPO, id, challengerGrant.grant.grant_id,
      {
        env,
        actorId: 'human:e1-proof',
        executeCanonicalProvider: async (_root, args) => {
          runnerCalls += 1;
          return stubResult(args, { exitCode: 0, testResults: 'not_run' });
        },
      },
    );
    assert.equal(reviewed.ok, true, JSON.stringify(reviewed.blockers));
    assert.equal(reviewed.canonical_attempt.attempt_kind, 'independent_model_review');
    assert.equal(runnerCalls, 2);

    const current = await WUC.canonicalExecutionStatus(REPO, id, { env });
    const attempts = current.provenance.attempts;
    const primaryAttempt = attempts.find((a) => a.attempt_kind === 'primary');
    const reviewAttempt = attempts.find((a) => a.attempt_kind === 'independent_model_review');
    assert.ok(primaryAttempt && reviewAttempt);
    assert.equal(current.lifecycle.state, 'EXECUTING');
    assert.equal(current.provenance.verifier_results.length, 0);

    const verifier = await WUC.canonicalRecordVerifier(
      REPO, id, {
        target_attempt_id: primaryAttempt.attempt_id,
        verifier_attempt_id: reviewAttempt.attempt_id,
        disposition: 'supports',
        evidence_refs: ['synthetic:independent-review'],
      },
      { env, actorId: 'human:e1-proof' },
    );
    assert.equal(verifier.ok, true, JSON.stringify(verifier.blockers));
    assert.equal(verifier.lifecycle.state, 'EXECUTING');
    assert.equal(verifier.provenance.verifier_results.length, 1);

    const ready = await WUC.canonicalMarkEvidenceReady(
      REPO, id, { env, actorId: 'human:e1-proof' },
    );
    assert.equal(ready.ok, true, JSON.stringify(ready.blockers));
    assert.equal(ready.lifecycle.state, 'EVIDENCE_READY');
    assert.equal(ready.provenance.adjudication, null);
    assert.deepEqual(ready.work_unit.authority, status.work_unit.authority);
    assert.equal(ready.routing.route_digest, status.routing.route_digest);
  } finally {
    cleanup(home);
  }
});


test('E1 executes a develop Work Unit through a read-only provider projection', async () => {
  const { home, env } = tempEnv();
  try {
    const { id, status } = await routedReady(env, 3150, spec({
      executionIntent: 'develop',
      workClass: 'PATCH',
    }));
    assert.equal(status.work_unit.authority.repository_write, 'worktree');
    assert.equal(status.work_unit.authority.shell, 'none');

    const primary = status.routing.participants.find((p) =>
      p.required_for_completion && p.participant_id === 'primary');
    assert.ok(primary);

    const issued = await WUC.canonicalAuthorizeExecutionOnce(
      REPO, id, primary.participant_id,
      { env, actorId: 'human:e1-proof' },
    );
    assert.equal(issued.ok, true, JSON.stringify(issued.blockers));

    let seen = null;
    const confirmed = await WUC.canonicalConfirmAuthorizedExecution(
      REPO, id, issued.grant.grant_id,
      {
        env,
        actorId: 'human:e1-proof',
        executeCanonicalProvider: async (_root, args) => {
          seen = args;
          return stubResult(args, { exitCode: 0, testResults: 'not_run' });
        },
      },
    );
    assert.equal(confirmed.ok, true, JSON.stringify(confirmed.blockers));
    assert.ok(seen);
    assert.equal(seen.binding.provider_id, 'qwen-local');
    assert.equal(seen.binding.model_id, 'qwen3-coder:30b');
    assert.equal(seen.binding.adapter_id, 'opencode');
    assert.equal(confirmed.work_unit.authority.repository_write, 'worktree');
    const act = confirmed.final_admission.provider_acts
      .find((entry) => entry.provider_id === 'qwen-local');
    assert.ok(act);
    assert.equal(act.disposition, 'ADMITTED');
    assert.equal(act.required_authority.acts.includes('repo.write:worktree'), false);
  } finally {
    cleanup(home);
  }
});

test('E1 provider failure consumes grant and DR1/W4 preserve failed attempt without automatic retry', async () => {
  const { home, env } = tempEnv();
  try {
    const { id, status } = await routedReady(env, 3200);
    const primary = status.routing.participants.find((p) => p.participant_id === 'primary');
    const issued = await WUC.canonicalAuthorizeExecutionOnce(
      REPO, id, primary.participant_id,
      { env, actorId: 'human:e1-proof' },
    );
    assert.equal(issued.ok, true);

    const failed = await WUC.canonicalConfirmAuthorizedExecution(
      REPO, id, issued.grant.grant_id,
      {
        env,
        actorId: 'human:e1-proof',
        executeCanonicalProvider: async (_root, args) =>
          stubResult(args, { exitCode: 9, testResults: 'fail' }),
      },
    );
    assert.equal(failed.execution_grant.standing, 'CONSUMED');
    assert.equal(failed.canonical_attempt.status, 'failed');
    assert.equal(failed.durable_mapping.status, 'failed');

    const replay = await WUC.canonicalConfirmAuthorizedExecution(
      REPO, id, issued.grant.grant_id,
      {
        env,
        actorId: 'human:e1-proof',
        executeCanonicalProvider: async () => {
          throw new Error('must not run');
        },
      },
    );
    assert.equal(replay.ok, false);
    assert.equal(replay.reason, 'GRANT_NOT_ACTIVE');

    const statusAfter = await WUC.canonicalExecutionStatus(REPO, id, { env });
    assert.equal(statusAfter.provenance.attempts.length, 1);
    assert.equal(statusAfter.provenance.attempts[0].status, 'failed');
  } finally {
    cleanup(home);
  }
});

test('E1 external preview/Authorize Once do not inspect credentials; Confirm Execute checks only after fresh admission', async () => {
  const { home, env } = tempEnv();
  try {
    const externalSpec = spec({
      taskShape: 'CODE_GROUNDED',
      evidenceClass: 'E3_EXTERNAL_REPO_BUNDLE',
      requestedPosture: 'adversarial_challenge',
      authorityRequest: {
        networkExternal: true,
        providerSpend: true,
        externalDisclosure: 'exact_bundle',
      },
    });
    const { id, status } = await routedReady(env, 3300, externalSpec);
    const external = status.routing.participants.find((p) =>
      p.transport_bindings.some((b) => b.provider_id === 'inkling-tinker'));
    assert.ok(external, JSON.stringify(status.routing.participants));

    // The external challenger is a governed review, so establish the required
    // primary attempt first. This remains a deterministic stub: no provider call.
    const primaryId = status.work_unit.routing.route_record.primary.participant_id;
    const primary = status.routing.participants.find((p) => p.participant_id === primaryId);
    const primaryGrant = await WUC.canonicalAuthorizeExecutionOnce(
      REPO, id, primary.participant_id,
      { env, actorId: 'human:e1-proof' },
    );
    assert.equal(primaryGrant.ok, true, JSON.stringify(primaryGrant.blockers));
    const primaryResult = await WUC.canonicalConfirmAuthorizedExecution(
      REPO, id, primaryGrant.grant.grant_id,
      {
        env,
        actorId: 'human:e1-proof',
        executeCanonicalProvider: async (_root, args) => stubResult(args),
      },
    );
    assert.equal(primaryResult.ok, true, JSON.stringify(primaryResult.blockers));

    let keychainCalls = 0;
    const keychainProbe = () => {
      keychainCalls += 1;
      return true;
    };
    const preview = await WUC.canonicalExecutionPreview(
      REPO, id, external.participant_id,
      { env, actorId: 'human:e1-proof', keychainProbe },
    );
    assert.equal(preview.ok, true, JSON.stringify(preview.blockers));
    assert.equal(keychainCalls, 0);

    const issued = await WUC.canonicalAuthorizeExecutionOnce(
      REPO, id, external.participant_id,
      { env, actorId: 'human:e1-proof', keychainProbe },
    );
    assert.equal(issued.ok, true, JSON.stringify(issued.blockers));
    assert.equal(keychainCalls, 0);

    let runnerCalls = 0;
    const out = await WUC.canonicalConfirmAuthorizedExecution(
      REPO, id, issued.grant.grant_id,
      {
        env,
        actorId: 'human:e1-proof',
        keychainProbe,
        executeCanonicalProvider: async (_root, args) => {
          runnerCalls += 1;
          return stubResult(args);
        },
      },
    );
    assert.equal(out.ok, true, JSON.stringify(out.blockers));
    assert.equal(keychainCalls, 1);
    assert.equal(runnerCalls, 1);
  } finally {
    cleanup(home);
  }
});

test('legacy R5B/run-provider surfaces still refuse canonical W0.v2 and cannot impersonate E1', async () => {
  const { home, env } = tempEnv();
  try {
    const out = await C.createCanonicalV2(REPO, spec(), {
      canonicalSha: SHA,
      nowMs: 3400,
      env,
      actorId: 'human:e1-proof',
    });
    assert.equal(out.ok, true);
    const id = out.work_unit_id;

    const legacyPreview = await WUC.executionAuthorizationPreview(
      REPO, id, 'qwen-local', { env },
    );
    assert.equal(legacyPreview.ok, false);
    assert.equal(legacyPreview.status, 'CANONICAL_V2_EXECUTION_DISCONNECTED');

    const legacyRun = await WUC.runProvider(
      REPO, { work_unit_id: id, provider_id: 'qwen-local' }, { env },
    );
    assert.equal(legacyRun.ok, false);
    assert.equal(legacyRun.status, 'CANONICAL_V2_EXECUTION_DISCONNECTED');
  } finally {
    cleanup(home);
  }
});



test('canonical Qwen v2 launch is standalone and isolated from user OpenCode config without provider inference', async () => {
  const { home } = tempEnv();
  const sourceEnv = {
    ...process.env,
    AIN_DELEGATION_HOME: home,
    HOME: '/tmp/leaky-user-home',
    XDG_CONFIG_HOME: '/tmp/leaky-user-config',
    XDG_DATA_HOME: '/tmp/leaky-user-data',
    OPENCODE_CONFIG: '/tmp/leaky-opencode.json',
    OPENCODE_CONFIG_DIR: '/tmp/leaky-opencode-dir',
    OPENCODE_CLI_CONFIG_CONTENT: '{"leak":true}',
    OPENCODE_CONFIG_PROJECT_DISABLE: '1',
    OPENCODE_DISABLE_PROJECT_CONFIG: '1',
  };
  let seen = null;
  try {
    const out = await WUC.executeCanonicalResolvedProvider(
      REPO,
      {
        workUnitId: 'e3-v2-qwen-proof',
        grantId: 'e3-grant-proof',
        workUnit: {
          identity: { objective: 'Prove canonical Qwen v2 launch containment.' },
          custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
          scope: {
            base_ref: SHA,
            allowed_paths: ['scripts/builder/work-unit-v2.mjs'],
          },
          evaluation: {
            acceptance_conditions: ['Return bounded evidence only.'],
            stop_conditions: ['Stop before any write.'],
          },
        },
        binding: {
          route_participant_id: 'primary',
          transport_binding_id: 'tb-qwen-proof',
          provider_id: 'qwen-local',
          model_id: 'qwen3-coder:30b',
          adapter_id: 'opencode',
        },
        resolved: {
          execution_adapter: 'opencode',
          agent: 'jarvis-readonly',
          model_ref: 'ollama/qwen3-coder:30b',
          model_id: 'qwen3-coder:30b',
        },
        sourceEnv,
      },
      {
        execFile: (file, args, options, callback) => {
          seen = {
            file,
            args: [...args],
            options: { ...options, env: { ...options.env } },
            projectConfigExists: fs.existsSync(path.join(options.cwd, '.opencode')),
            runtimeHomeExists: fs.existsSync(options.env.HOME),
          };
          callback(null, 'SYNTHETIC_QWEN_V2_OK', '');
        },
      },
    );

    assert.equal(out.ok, true);
    assert.equal(out.status, 'COMPLETED');
    assert.ok(seen);
    assert.equal(seen.file, 'opencode');
    assert.deepEqual(seen.args.slice(0, 2), ['run', '--standalone']);
    assert.equal(seen.args.includes('--pure'), false);
    assert.equal(seen.args[seen.args.indexOf('--agent') + 1], 'jarvis-readonly');
    assert.equal(seen.args[seen.args.indexOf('--model') + 1], 'ollama/qwen3-coder:30b');

    const env = seen.options.env;
    assert.match(env.HOME, /jarvis-e1-opencode-v2-[^/]+\/home$/);
    assert.match(env.XDG_CONFIG_HOME, /jarvis-e1-opencode-v2-[^/]+\/config$/);
    assert.match(env.XDG_DATA_HOME, /jarvis-e1-opencode-v2-[^/]+\/data$/);
    assert.equal(env.HOME.startsWith(seen.options.cwd), false);
    assert.equal(env.XDG_CONFIG_HOME.startsWith(seen.options.cwd), false);
    assert.equal(env.XDG_DATA_HOME.startsWith(seen.options.cwd), false);
    assert.equal(seen.projectConfigExists, false);
    assert.equal(seen.runtimeHomeExists, true);
    assert.equal(env.XDG_CACHE_HOME, '/tmp/leaky-user-home/.cache');
    assert.equal(env.OPENCODE_CONFIG, undefined);
    assert.equal(env.OPENCODE_CONFIG_DIR, undefined);
    assert.equal(env.OPENCODE_CLI_CONFIG_CONTENT, undefined);
    assert.equal(env.OPENCODE_CONFIG_PROJECT_DISABLE, '1');
    assert.equal(env.OPENCODE_DISABLE_PROJECT_CONFIG, '1');
    assert.equal(env.OPENCODE_DISABLE_MODELS_FETCH, '1');
    assert.equal(env.OPENCODE_DISABLE_AUTOUPDATE, '1');

    const config = JSON.parse(env.OPENCODE_CONFIG_CONTENT);
    assert.deepEqual(Object.keys(config.provider), ['ollama']);
    assert.deepEqual(Object.keys(config.provider.ollama.models), ['qwen3-coder:30b']);
    assert.equal(config.provider.ollama.options.baseURL, 'http://127.0.0.1:11434/v1');
    assert.equal(config.agent, undefined);
    assert.deepEqual(Object.keys(config.agents), ['jarvis-readonly']);
    const agent = config.agents['jarvis-readonly'];
    assert.equal(agent.mode, 'primary');
    assert.equal(agent.permission, undefined);
    assert.equal(agent.prompt, undefined);
    assert.match(agent.system, /bounded JARVIS work unit/);
    assert.equal(agent.steps, 8);
    assert.deepEqual(agent.permissions, [
      { action: '*', resource: '*', effect: 'deny' },
      { action: 'read', resource: '*', effect: 'allow' },
      { action: 'glob', resource: '*', effect: 'allow' },
      { action: 'grep', resource: '*', effect: 'allow' },
    ]);
    assert.equal(JSON.stringify(config).includes('gpt-oss'), false);
    assert.equal(JSON.stringify(config).includes('tinker'), false);
    assert.equal(JSON.stringify(config).includes('nvidia'), false);
  } finally {
    cleanup(home);
  }
});


test('D2 valid local Qwen development proposal is persisted as bounded durable patch evidence', async () => {
  const { home, env } = tempEnv();
  const workUnitId = 'd2-valid-development-proposal';
  const grantId = 'd2-valid-grant';
  const allowed = 'scripts/builder/work-unit-v2.mjs';
  const patch = [
    'diff --git a/' + allowed + ' b/' + allowed,
    '--- a/' + allowed,
    '+++ b/' + allowed,
    '@@ -1,1 +1,1 @@',
    '-/**',
    '+/**',
  ].join('\n');
  const workUnit = {
    work_unit_version: 'W0.v2',
    identity: {
      id: workUnitId,
      programme: 'JARVIS-D2-PROOF',
      parent_work_unit: null,
      objective: 'Propose one bounded development patch.',
      work_class: 'PATCH',
      task_shape: 'CODE_GROUNDED',
      capability: null,
    },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    scope: {
      repository: 'bound-desktop-repository',
      base_ref: SHA,
      allowed_paths: [allowed],
      forbidden_paths: [],
    },
    authority: {
      repository_read: true,
      repository_write: 'worktree',
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
      route_record: { primary: { participant_id: 'primary' } },
    },
    evaluation: {
      acceptance_conditions: ['Proposal remains inside allowed path.'],
      stop_conditions: ['Stop before JARVIS applies any patch.'],
    },
  };
  const binding = {
    route_participant_id: 'primary',
    transport_binding_id: 'd2-qwen-binding',
    provider_id: 'qwen-local',
    model_id: 'qwen3-coder:30b',
    adapter_id: 'opencode',
  };
  const resolved = {
    execution_adapter: 'opencode',
    agent: 'jarvis-readonly',
    model_ref: 'ollama/qwen3-coder:30b',
    model_id: 'qwen3-coder:30b',
  };

  try {
    let seenArgs = null;
    const out = await WUC.executeCanonicalResolvedProvider(
      REPO,
      {
        workUnitId,
        grantId,
        workUnit,
        binding,
        resolved,
        sourceEnv: env,
      },
      {
        execFile: (_file, args, _options, callback) => {
          seenArgs = [...args];
          callback(null, [
            'BEGIN_JARVIS_PATCH',
            patch,
            'END_JARVIS_PATCH',
          ].join('\n'), '');
        },
      },
    );

    assert.equal(out.ok, true, JSON.stringify(out.durable_result));
    assert.equal(out.status, 'COMPLETED');
    assert.ok(seenArgs);
    const prompt = seenArgs[seenArgs.length - 1];
    assert.match(prompt, /DEVELOPMENT PROPOSAL CONTRACT/);
    assert.match(prompt, /READ-ONLY model/);
    assert.match(prompt, /BEGIN_JARVIS_PATCH/);

    assert.equal(out.durable_result.exit_code, 0);
    assert.equal(out.durable_result.development_contract_version, 'D1.v1');
    assert.equal(out.durable_result.development_proposal_status, 'admitted');
    assert.deepEqual(out.durable_result.development_proposal_paths, [allowed]);
    assert.equal(out.durable_result.recommended_next_action, 'review-development-proposal');
    assert.match(out.durable_result.development_proposal_digest, /^sha256:[0-9a-f]{64}$/);

    const loc = WUC.canonicalDevelopmentProposalLocation(workUnitId, grantId, env);
    assert.equal(fs.existsSync(loc.file), true);
    assert.equal(fs.readFileSync(loc.file, 'utf8'), patch + '\n');
    const mode = fs.statSync(loc.file).mode & 0o777;
    assert.equal(mode, 0o600);
    assert.equal(out.development_proposal.ref, loc.ref);
    assert.equal(out.development_proposal.digest, out.durable_result.development_proposal_digest);
  } finally {
    cleanup(home);
  }
});

test('D2 out-of-scope patch fails durably even when OpenCode wrapper exits zero', async () => {
  const { home, env } = tempEnv();
  const workUnitId = 'd2-refused-development-proposal';
  const grantId = 'd2-refused-grant';
  const allowed = 'scripts/builder/work-unit-v2.mjs';
  const escaped = 'scripts/deploy-production.sh';
  const patch = [
    'diff --git a/' + escaped + ' b/' + escaped,
    '--- a/' + escaped,
    '+++ b/' + escaped,
    '@@ -1,1 +1,1 @@',
    '-old',
    '+new',
  ].join('\n');
  const workUnit = {
    work_unit_version: 'W0.v2',
    identity: {
      id: workUnitId,
      programme: 'JARVIS-D2-PROOF',
      parent_work_unit: null,
      objective: 'Attempt an out-of-scope patch.',
      work_class: 'PATCH',
      task_shape: 'CODE_GROUNDED',
      capability: null,
    },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    scope: {
      repository: 'bound-desktop-repository',
      base_ref: SHA,
      allowed_paths: [allowed],
      forbidden_paths: [],
    },
    authority: {
      repository_read: true,
      repository_write: 'worktree',
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
      route_record: { primary: { participant_id: 'primary' } },
    },
    evaluation: {
      acceptance_conditions: ['Out-of-scope patch must fail.'],
      stop_conditions: ['Stop before mutation.'],
    },
  };
  const binding = {
    route_participant_id: 'primary',
    transport_binding_id: 'd2-qwen-binding-refused',
    provider_id: 'qwen-local',
    model_id: 'qwen3-coder:30b',
    adapter_id: 'opencode',
  };
  const resolved = {
    execution_adapter: 'opencode',
    agent: 'jarvis-readonly',
    model_ref: 'ollama/qwen3-coder:30b',
    model_id: 'qwen3-coder:30b',
  };

  try {
    const out = await WUC.executeCanonicalResolvedProvider(
      REPO,
      {
        workUnitId,
        grantId,
        workUnit,
        binding,
        resolved,
        sourceEnv: env,
      },
      {
        execFile: (_file, _args, _options, callback) => {
          callback(null, [
            'BEGIN_JARVIS_PATCH',
            patch,
            'END_JARVIS_PATCH',
          ].join('\n'), '');
        },
      },
    );

    assert.equal(out.run.exit_code, 0);
    assert.equal(out.ok, false);
    assert.equal(out.status, 'FAILED');
    assert.equal(out.durable_result.exit_code, 65);
    assert.equal(out.durable_result.development_proposal_status, 'refused');
    assert.equal(out.durable_result.recommended_next_action, 'reject');
    assert.ok(out.durable_result.development_proposal_blockers
      .some((b) => b.code === 'PATCH_PATH_OUTSIDE_AUTHORIZED_SCOPE'));

    const loc = WUC.canonicalDevelopmentProposalLocation(workUnitId, grantId, env);
    assert.equal(fs.existsSync(loc.file), false);
  } finally {
    cleanup(home);
  }
});

test('E1 reuses one existing Work Unit IPC channel and renderer cannot supply provider/model/raw authority on Confirm Execute', () => {
  const renderer = fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/renderer.js'), 'utf8');
  const preload = fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/preload.js'), 'utf8');
  const main = fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/main.js'), 'utf8');
  const controller = fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/work-unit-control.js'), 'utf8');

  assert.match(preload, /workUnitAction: \(req\) => ipcRenderer\.invoke\('jarvis:work-unit-action', req\)/);
  assert.doesNotMatch(preload, /canonical-confirm-execute|canonical-authorize-execution-once/);
  assert.match(main, /action === 'canonical-execution-auth-preview'/);
  assert.match(main, /action === 'canonical-authorize-execution-once'/);
  assert.match(main, /action === 'canonical-confirm-execute'/);
  assert.match(main, /action === 'canonical-record-verifier'/);
  assert.match(main, /action === 'canonical-evidence-ready'/);

  assert.match(
    renderer,
    /action: 'canonical-confirm-execute',\s*work_unit_id: activeWorkUnitId,\s*grant_id: grantId/s,
  );
  assert.doesNotMatch(
    renderer,
    /action: 'canonical-confirm-execute'[\s\S]{0,180}(provider_id|model_id|adapter_id|permission_envelope|route_digest)\s*:/,
  );

  const finalAdmission = controller.indexOf('const finalAdmission = e1.evaluateCanonicalExecutionGrantV1');
  const providerResolve = controller.indexOf('const resolved = providerMod.resolveOpenCodeProvider', finalAdmission);
  const credential = controller.indexOf('const credential = credentialAvailability', providerResolve);
  const claim = controller.indexOf('const claimed = store.claimCanonicalExecutionGrantV1', credential);
  assert.ok(finalAdmission >= 0 && providerResolve > finalAdmission && credential > providerResolve && claim > credential);
});

test('E1 Desktop keeps authorization, execution, verification, evidence-ready, and adjudication as separate gestures', () => {
  const renderer = fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/renderer.js'), 'utf8');

  assert.match(renderer, /Authorize this execution once/);
  assert.match(renderer, /Authorize is not Execute/);
  assert.match(renderer, /Confirm Execute/);
  assert.match(renderer, /Record verifier evidence/);
  assert.match(renderer, /Mark evidence ready/);
  assert.match(renderer, /Routing ≠ authorization ≠ execution ≠ evidence ≠ adjudication/);
  assert.match(renderer, /action: 'canonical-record-verifier'/);
  assert.match(renderer, /action: 'canonical-evidence-ready'/);

  const evidenceReadyAction = renderer.indexOf("action: 'canonical-evidence-ready'");
  const adjudicationAction = renderer.indexOf("'canonical-adjudicate'");
  assert.ok(evidenceReadyAction >= 0);
  assert.ok(adjudicationAction >= 0);
  assert.notEqual(evidenceReadyAction, adjudicationAction);
});
