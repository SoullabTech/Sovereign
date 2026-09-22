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

test('MODEL MODE GPT-OSS remains ollama-direct even when OpenCode ancestor sentinel exists', async () => {
  const { home } = tempEnv();
  const probeRuntime = WUC.createCanonicalOpenCodeRuntime();
  const sentinel = path.join(probeRuntime.neutralRoot, 'opencode.json');
  fs.rmSync(probeRuntime.runRoot, { recursive: true, force: true });
  assert.equal(fs.existsSync(sentinel), false, 'neutral root must start sentinel-free');
  fs.writeFileSync(sentinel, 'MODEL_MODE_MUST_NOT_ENTER_OPENCODE\n');

  let localCalls = 0;
  let openCodeCalls = 0;
  try {
    const out = await WUC.executeCanonicalResolvedProvider(
      REPO,
      {
        workUnitId: 'm1-gpt-oss-sentinel-proof',
        grantId: 'm1-gpt-oss-sentinel-grant',
        workUnit: {
          identity: { objective: 'Prove MODEL MODE remains direct.' },
          custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
          scope: {
            base_ref: SHA,
            allowed_paths: ['scripts/builder/work-unit-v2.mjs'],
          },
          evaluation: { acceptance_conditions: [], stop_conditions: [] },
        },
        binding: {
          route_participant_id: 'local-review-1',
          transport_binding_id: 'tb-gpt-model-mode',
          provider_id: 'gpt-oss-local',
          model_id: 'gpt-oss:20b',
          adapter_id: 'ollama-direct',
        },
        resolved: {
          execution_adapter: 'ollama-direct',
          model_ref: 'ollama/gpt-oss:20b',
          model_id: 'gpt-oss:20b',
        },
        sourceEnv: { ...process.env, AIN_DELEGATION_HOME: home },
      },
      {
        localWorkerRun: async ({ model }) => {
          localCalls += 1;
          assert.equal(model, 'gpt-oss:20b');
          return { ok: true, output: 'SYNTHETIC_GPT_OSS_MODEL_MODE_OK' };
        },
        execFile: () => {
          openCodeCalls += 1;
          throw new Error('MODEL MODE must not launch OpenCode');
        },
      },
    );
    assert.equal(out.ok, true);
    assert.equal(localCalls, 1);
    assert.equal(openCodeCalls, 0);
  } finally {
    fs.rmSync(sentinel, { force: true });
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



test('explicit GPT-OSS AGENT MODE helper remains standalone and D1d-contained', async () => {
  const { home } = tempEnv();
  const sourceEnv = {
    ...process.env,
    AIN_DELEGATION_HOME: home,
    HOME: '/tmp/leaky-user-home',
    TMPDIR: '/tmp/leaky-tmp',
    XDG_CONFIG_HOME: '/tmp/leaky-user-config',
    XDG_DATA_HOME: '/tmp/leaky-user-data',
    XDG_CACHE_HOME: '/tmp/leaky-user-cache',
    XDG_STATE_HOME: '/tmp/leaky-user-state',
    OPENCODE_CONFIG: '/tmp/leaky-opencode.json',
    OPENCODE_CONFIG_CONTENT: '{"leak":true}',
    OPENCODE_CLI_CONFIG_CONTENT: '{"cliLeak":true}',
    OPENCODE_TEST_HOME: '/tmp/leaky-test-home',
    OPENCODE_CONFIG_PROJECT_DISABLE: '1',
    OPENCODE_DISABLE_PROJECT_CONFIG: '1',
    HTTP_PROXY: 'http://ambient.invalid',
    HTTPS_PROXY: 'http://ambient.invalid',
    ALL_PROXY: 'http://ambient.invalid',
    WS_PROXY: 'ws://ambient.invalid',
    WSS_PROXY: 'wss://ambient.invalid',
    OTEL_EXPORTER_OTLP_ENDPOINT: 'http://ambient.invalid/otel',
    OPENCODE_PTY_BIN: '/tmp/ambient-pty',
    OPENCODE_TREE_SITTER_WASM_PATH: '/tmp/ambient-wasm',
    NVIDIA_API_KEY: 'must-not-cross',
    TINKER_API_KEY: 'must-not-cross',
    AWS_REGION: 'must-not-cross',
  };
  let seen = null;
  try {
    const out = await WUC.executeCanonicalResolvedProvider(
      REPO,
      {
        workUnitId: 'e3-v2-gpt-oss-proof',
        grantId: 'e3-gpt-oss-grant-proof',
        workUnit: {
          identity: { objective: 'Prove canonical GPT-OSS v2 D1d containment.' },
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
          route_participant_id: 'challenger',
          transport_binding_id: 'tb-gpt-oss-proof',
          provider_id: 'gpt-oss-local',
          model_id: 'gpt-oss:20b',
          adapter_id: 'opencode',
        },
        resolved: {
          execution_adapter: 'opencode',
          agent: 'jarvis-readonly',
          model_ref: 'ollama/gpt-oss:20b',
          model_id: 'gpt-oss:20b',
        },
        sourceEnv,
      },
      {
        execFile: (file, args, options, callback) => {
          const config = JSON.parse(fs.readFileSync(
            path.join(options.env.OPENCODE_CONFIG_DIR, 'opencode.json'),
            'utf8',
          ));
          seen = {
            file,
            args: [...args],
            cwd: options.cwd,
            env: { ...options.env },
            config,
            projectConfigExists: fs.existsSync(path.join(options.cwd, '.opencode')),
          };
          callback(null, 'SYNTHETIC_GPT_OSS_V2_OK', '');
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
    assert.equal(seen.args[seen.args.indexOf('--model') + 1], 'ollama/gpt-oss:20b');

    const env = seen.env;
    const runRoot = path.dirname(env.HOME);
    assert.equal(seen.cwd, path.join(runRoot, 'workspace'));
    assert.equal(env.TMPDIR, path.join(runRoot, 'tmp'));
    assert.equal(env.XDG_CONFIG_HOME, path.join(runRoot, 'xdg-config'));
    assert.equal(env.XDG_DATA_HOME, path.join(runRoot, 'xdg-data'));
    assert.equal(env.XDG_CACHE_HOME, path.join(runRoot, 'xdg-cache'));
    assert.equal(env.XDG_STATE_HOME, path.join(runRoot, 'xdg-state'));
    assert.equal(env.OPENCODE_CONFIG_DIR, path.join(runRoot, 'opencode-config'));
    assert.equal(env.OPENCODE_DISABLE_MODELS_FETCH, '1');
    assert.equal(env.OPENCODE_DISABLE_AUTOUPDATE, '1');
    assert.equal(seen.projectConfigExists, false);

    for (const forbidden of [
      'AIN_DELEGATION_HOME', 'OPENCODE_CONFIG', 'OPENCODE_CONFIG_CONTENT',
      'OPENCODE_CLI_CONFIG_CONTENT', 'OPENCODE_TEST_HOME',
      'OPENCODE_CONFIG_PROJECT_DISABLE', 'OPENCODE_DISABLE_PROJECT_CONFIG',
      'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'WS_PROXY', 'WSS_PROXY',
      'OTEL_EXPORTER_OTLP_ENDPOINT', 'OPENCODE_PTY_BIN',
      'OPENCODE_TREE_SITTER_WASM_PATH', 'NVIDIA_API_KEY', 'TINKER_API_KEY',
      'AWS_REGION',
    ]) {
      assert.equal(env[forbidden], undefined, forbidden + ' leaked into canonical OpenCode');
    }

    assert.deepEqual(Object.keys(seen.config.provider), ['ollama']);
    assert.deepEqual(Object.keys(seen.config.provider.ollama.models), ['gpt-oss:20b']);
    assert.equal(seen.config.provider.ollama.options.baseURL, 'http://127.0.0.1:11434/v1');
    assert.deepEqual(Object.keys(seen.config.agents), ['jarvis-readonly']);
    const agent = seen.config.agents['jarvis-readonly'];
    assert.equal(agent.mode, 'primary');
    assert.equal(agent.steps, 8);
    assert.deepEqual(agent.permissions[0], {
      action: '*', resource: '*', effect: 'deny',
    });
    assert.equal(
      agent.permissions.some(
        (rule) => rule.action === 'read' && rule.resource === '*' && rule.effect === 'allow',
      ),
      true,
    );
    assert.equal(JSON.stringify(seen.config).includes('qwen3-coder:30b'), false);
    assert.equal(JSON.stringify(seen.config).includes('tinker'), false);
    assert.equal(JSON.stringify(seen.config).includes('nvidia'), false);
    assert.equal(fs.existsSync(runRoot), false);
  } finally {
    cleanup(home);
  }
});

test('unreconciled non-local OpenCode refuses before process creation', async () => {
  let processCalls = 0;
  const out = await WUC.executeCanonicalResolvedProvider(
    REPO,
    {
      workUnitId: 'e3-v2-nvidia-refusal',
      grantId: 'e3-nvidia-grant-proof',
      workUnit: {
        identity: { objective: 'Refuse unreconciled external OpenCode.' },
        custody: { evidence_class: 'E0_TASK_TEXT' },
        scope: { allowed_paths: [] },
        evaluation: { acceptance_conditions: [], stop_conditions: [] },
      },
      binding: {
        route_participant_id: 'challenger',
        transport_binding_id: 'tb-nvidia-proof',
        provider_id: 'nemotron-nvidia',
        model_id: 'nemotron-3-ultra-550b-a55b',
        adapter_id: 'opencode',
      },
      resolved: {
        execution_adapter: 'opencode',
        agent: 'jarvis-readonly',
        model_ref: 'nvidia/nemotron-3-ultra-550b-a55b',
        model_id: 'nemotron-3-ultra-550b-a55b',
      },
      sourceEnv: { PATH: process.env.PATH },
    },
    {
      execFile: () => {
        processCalls += 1;
        throw new Error('must not create provider process');
      },
    },
  );
  assert.equal(out.ok, false);
  assert.equal(out.status, 'REFUSED');
  assert.equal(out.reason, 'CANONICAL_OPENCODE_V2_PROVIDER_NOT_RECONCILED');
  assert.equal(processCalls, 0);
});

test('canonical Qwen direct launch reuses Unit 9 native worker with bounded evidence and JARVIS 65K identity', async () => {
  const { home } = tempEnv();
  let seen = null;
  try {
    const out = await WUC.executeCanonicalResolvedProvider(
      REPO,
      {
        workUnitId: 'e3-direct-qwen-proof',
        grantId: 'e3-direct-grant-proof',
        workUnit: {
          identity: { objective: 'Prove canonical Qwen direct containment.' },
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
          adapter_id: 'ollama-direct',
        },
        resolved: {
          execution_adapter: 'ollama-direct',
          model_ref: 'ollama/qwen3-coder:30b',
          model_id: 'qwen3-coder:30b',
        },
        sourceEnv: { ...process.env, AIN_DELEGATION_HOME: home },
      },
      {
        localWorkerRun: async (args) => {
          seen = args;
          return {
            ok: true,
            transport: 'ollama-native',
            model: 'jarvis-qwen3-coder:65k',
            output: 'SYNTHETIC_DIRECT_QWEN_OK',
            duration_s: 0,
            prompt_eval_count: 10,
            eval_count: 2,
            done_reason: 'stop',
            failure_class: null,
          };
        },
      },
    );

    assert.equal(out.ok, true);
    assert.equal(out.status, 'COMPLETED');
    assert.equal(out.run.exit_code, 0);
    assert.equal(out.run.stdout, 'SYNTHETIC_DIRECT_QWEN_OK');
    assert.ok(seen);
    assert.equal(seen.model, 'jarvis-qwen3-coder:65k');
    assert.equal(seen.host, 'http://127.0.0.1:11434');
    assert.equal(seen.temperature, 0);
    assert.equal(typeof seen.timeoutMs, 'number');
    assert.match(seen.prompt, /=== scripts\/builder\/work-unit-v2\.mjs ===/);
    assert.match(seen.prompt, /createWorkUnitDraftV2/);
    assert.doesNotMatch(seen.prompt, /jarvis-desktop\/src\/work-unit-control\.js/);
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

test('M1 MODEL MODE uses exact frozen local realizations and never invokes OpenCode', async () => {
  assert.equal(Object.isFrozen(WUC.LOCAL_OLLAMA_DIRECT_REALIZATIONS), true);
  assert.equal(Object.isFrozen(WUC.LOCAL_OLLAMA_DIRECT_REALIZATIONS['qwen-local']), true);
  assert.equal(Object.isFrozen(WUC.LOCAL_OLLAMA_DIRECT_REALIZATIONS['gpt-oss-local']), true);
  assert.deepEqual(
    WUC.canonicalLocalOllamaDirectRealization({
      provider_id: 'qwen-local', model_id: 'qwen3-coder:30b', adapter_id: 'ollama-direct',
    }),
    { governed_model_id: 'qwen3-coder:30b', runtime_model: 'jarvis-qwen3-coder:65k' },
  );
  assert.deepEqual(
    WUC.canonicalLocalOllamaDirectRealization({
      provider_id: 'gpt-oss-local', model_id: 'gpt-oss:20b', adapter_id: 'ollama-direct',
    }),
    { governed_model_id: 'gpt-oss:20b', runtime_model: 'gpt-oss:20b' },
  );
  assert.equal(WUC.canonicalLocalOllamaDirectRealization({
    provider_id: 'gpt-oss-local', model_id: 'gpt-oss:not-admitted', adapter_id: 'ollama-direct',
  }), null);
  assert.equal(WUC.canonicalLocalOllamaDirectRealization({
    provider_id: 'gpt-oss-local', model_id: 'gpt-oss:20b', adapter_id: 'opencode',
  }), null);
  assert.equal(WUC.canonicalLocalOllamaDirectRealization({
    provider_id: 'unknown-local', model_id: 'gpt-oss:20b', adapter_id: 'ollama-direct',
  }), null);

  const { home, env } = tempEnv();
  try {
    const { id, status } = await routedReady(env, 3150);
    const calls = [];
    let openCodeCalls = 0;
    const executionOpts = {
      env,
      actorId: 'human:m1-proof',
      localWorkerRun: async ({ prompt, model, host, timeoutMs, temperature }) => {
        calls.push({ model, host, timeoutMs, temperature, prompt_length: prompt.length });
        return { ok: true, output: 'bounded MODEL MODE evidence', model, host };
      },
      execFile: () => {
        openCodeCalls += 1;
        throw new Error('OpenCode must not run in MODEL MODE');
      },
    };

    const primary = status.routing.participants.find((entry) => entry.participant_id === 'primary');
    assert.ok(primary);
    const primaryGrant = await WUC.canonicalAuthorizeExecutionOnce(
      REPO, id, primary.participant_id, { env, actorId: 'human:m1-proof' },
    );
    assert.equal(primaryGrant.ok, true, JSON.stringify(primaryGrant.blockers));
    const primaryResult = await WUC.canonicalConfirmAuthorizedExecution(
      REPO, id, primaryGrant.grant.grant_id, executionOpts,
    );
    assert.equal(primaryResult.ok, true, JSON.stringify(primaryResult.blockers));

    const afterPrimary = await WUC.canonicalExecutionStatus(REPO, id, { env });
    const challenger = afterPrimary.routing.participants.find(
      (entry) => entry.participant_id === 'local-review-1',
    );
    assert.ok(challenger);
    const challengerActive = challenger.transport_bindings.find(
      (binding) => binding.readiness.status === 'READY' && binding.adapter_id === 'ollama-direct',
    );
    assert.ok(challengerActive);
    assert.equal(challengerActive.provider_id, 'gpt-oss-local');
    assert.equal(challengerActive.model_id, 'gpt-oss:20b');

    const challengerGrant = await WUC.canonicalAuthorizeExecutionOnce(
      REPO, id, challenger.participant_id, { env, actorId: 'human:m1-proof' },
    );
    assert.equal(challengerGrant.ok, true, JSON.stringify(challengerGrant.blockers));
    const challengerResult = await WUC.canonicalConfirmAuthorizedExecution(
      REPO, id, challengerGrant.grant.grant_id, executionOpts,
    );
    assert.equal(challengerResult.ok, true, JSON.stringify(challengerResult.blockers));

    assert.deepEqual(
      calls.map(({ model, host, temperature }) => ({ model, host, temperature })),
      [
        { model: 'jarvis-qwen3-coder:65k', host: 'http://127.0.0.1:11434', temperature: 0 },
        { model: 'gpt-oss:20b', host: 'http://127.0.0.1:11434', temperature: 0 },
      ],
    );
    assert.equal(openCodeCalls, 0);
    assert.ok(calls.every((call) => call.prompt_length > 0));

    const final = await WUC.canonicalExecutionStatus(REPO, id, { env });
    assert.deepEqual(final.work_unit.authority, status.work_unit.authority);
    assert.equal(final.provenance.attempts.length, 2);
    assert.equal(final.provenance.attempts[0].adapter_id, 'ollama-direct');
    assert.equal(final.provenance.attempts[1].adapter_id, 'ollama-direct');
    assert.equal(final.provenance.attempts[0].status, 'completed');
    assert.equal(final.provenance.attempts[1].status, 'completed');
  } finally {
    cleanup(home);
  }
});
