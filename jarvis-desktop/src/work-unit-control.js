// JARVIS Desktop — narrow controller over canonical Work Unit + OpenCode provider seams.
// No provider policy is duplicated here: provider resolution and authority remain in
// scripts/builder/opencode-provider.mjs and scripts/ain-delegate.sh.
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile, execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { childEnv, allowlistedChildEnv, resolveNodeBinary } = require('./child-env.js');
const FRONTIER = require('./frontier-worker.js');
const CWUV2 = require('./canonical-work-unit-v2.js');

const MAX_LOG_CHARS = 12000;
const RUN_TIMEOUT_MS = 10 * 60 * 1000;
const KEYCHAIN_CREDENTIALS = Object.freeze({
  TINKER_API_KEY: Object.freeze({ service: 'soullab.tinker.api' }),
});

const homeOf = (env = process.env) => env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const resultPath = (id, env = process.env) => path.join(homeOf(env), 'results', `${id}.json`);

function defaultKeychainProbe(service, account) {
  if (process.platform !== 'darwin') return false;
  try {
    execFileSync('/usr/bin/security', [
      'find-generic-password', '-a', account, '-s', service,
    ], { stdio: 'ignore' });
    return true;
  } catch { return false; }
}

function credentialAvailability(credentialEnv, opts = {}) {
  const env = opts.env || process.env;
  if (!credentialEnv) return { ready: true, source: null };
  if (env[credentialEnv]) return { ready: true, source: 'environment' };
  const keychain = KEYCHAIN_CREDENTIALS[credentialEnv];
  if (!keychain) return { ready: false, source: null };
  const account = env.USER || os.userInfo().username;
  const probe = opts.keychainProbe || defaultKeychainProbe;
  return probe(keychain.service, account)
    ? { ready: true, source: 'keychain' }
    : { ready: false, source: null };
}

async function importBound(root, rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) throw new Error(`bound repository is missing ${rel}`);
  return import(`${pathToFileURL(file).href}?t=${Date.now()}`);
}

function readLogExcerpt(logPath) {
  if (!logPath || !fs.existsSync(logPath)) return null;
  try {
    const text = fs.readFileSync(logPath, 'utf8');
    if (text.length <= MAX_LOG_CHARS) return text;
    return `${text.slice(0, MAX_LOG_CHARS / 2)}\n… [truncated locally] …\n${text.slice(-MAX_LOG_CHARS / 2)}`;
  } catch { return null; }
}

function exitCodeFromSummary(summary) {
  const m = /delegate exited\s+(-?\d+)/i.exec(String(summary || ''));
  return m ? Number(m[1]) : null;
}

function modelFamilyFromAttempt(attempt = {}) {
  const declared = String(attempt.model_family || '').trim().toUpperCase();
  if (['QWEN', 'GPT_OSS', 'INKLING', 'NEMOTRON'].includes(declared)) return declared;
  if (String(attempt.lane || '').toLowerCase() === 'deterministic') {
    const verifier = String(attempt.model || attempt.verifier_id || 'deterministic').trim();
    return verifier ? 'DETERMINISTIC:' + verifier : 'DETERMINISTIC';
  }
  const value = (String(attempt.lane || '') + ' ' + String(attempt.model || '')).toLowerCase();
  if (value.includes('qwen')) return 'QWEN';
  if (value.includes('gpt-oss') || value.includes('gpt_oss')) return 'GPT_OSS';
  if (value.includes('inkling')) return 'INKLING';
  if (value.includes('nemotron')) return 'NEMOTRON';
  return null;
}

function durableProviderOutcome(run = {}, recordedAttempt = null) {
  if (!recordedAttempt) {
    return {
      ok: false,
      status: 'FAILED',
      reason: 'NO_DURABLE_PROVIDER_RESULT',
      source: 'durable_result',
      wrapper_exit_code: Number.isInteger(run.exit_code) ? run.exit_code : null,
      durable_exit_code: null,
    };
  }
  const exitCode = Number.isInteger(recordedAttempt.exit_code)
    ? recordedAttempt.exit_code
    : exitCodeFromSummary(recordedAttempt.summary);
  const failed = recordedAttempt.test_results === 'fail'
    || recordedAttempt.recommended_next_action === 'reject'
    || (exitCode != null && exitCode !== 0);
  return {
    ok: !failed,
    status: failed ? 'FAILED' : 'COMPLETED',
    reason: failed ? 'DURABLE_PROVIDER_RESULT_FAILED' : null,
    source: 'durable_result',
    wrapper_exit_code: Number.isInteger(run.exit_code) ? run.exit_code : null,
    durable_exit_code: exitCode,
  };
}

function reconcileAttempts(attempts = []) {
  if (!attempts.length) {
    return { standing: 'NOT_RUN', needs_kelly: false, summary: 'No provider attempt has run yet.', disagreements: [], attempts: [] };
  }
  const normalized = attempts.map((a) => ({
    attempt_number: a.attempt_number ?? null,
    lane: a.lane ?? null,
    model: a.model ?? null,
    test_results: a.test_results ?? 'not_run',
    escalation_required: a.escalation_required === true,
    recommended_next_action: a.recommended_next_action ?? null,
    exit_code: Number.isInteger(a.exit_code) ? a.exit_code : exitCodeFromSummary(a.summary),
    duration_s: a.duration_s ?? null,
    log_path: a.log_path ?? null,
    output_excerpt: readLogExcerpt(a.log_path),
    unresolved_questions: a.unresolved_questions ?? [],
    model_family: modelFamilyFromAttempt(a),
  }));

  const escalations = normalized.filter(a => a.escalation_required);
  const hardFailures = normalized.filter(a => a.test_results === 'fail' || a.recommended_next_action === 'reject' || (a.exit_code != null && a.exit_code !== 0));
  const recommendations = [...new Set(normalized.map(a => a.recommended_next_action).filter(Boolean))];
  const disagreements = [];
  if (recommendations.length > 1) disagreements.push(`Provider attempts disagree on next action: ${recommendations.join(' vs ')}`);
  if (new Set(normalized.map(a => a.test_results)).size > 1) disagreements.push('Provider attempts do not share the same mechanical test result.');

  if (escalations.length) {
    return { standing: 'NEEDS_KELLY', needs_kelly: true, summary: `${escalations.length} attempt(s) explicitly require founder resolution.`, disagreements, attempts: normalized };
  }
  if (hardFailures.length) {
    return { standing: 'REPAIR_BEFORE_WITNESS', needs_kelly: true, summary: `${hardFailures.length} attempt(s) failed, exited non-zero, or recommended rejection.`, disagreements, attempts: normalized };
  }
  if (disagreements.length) {
    return { standing: 'REVIEW_DISAGREEMENT', needs_kelly: true, summary: 'The structured provider evidence disagrees; JARVIS will not pick a winner automatically.', disagreements, attempts: normalized };
  }
  const independentFamilies = [...new Set(normalized.map(a => a.model_family).filter(Boolean))];
  if (normalized.length < 2 || independentFamilies.length < 2) {
    return {
      standing: 'SECOND_REVIEW_OWED',
      needs_kelly: false,
      summary: normalized.length < 2
        ? 'Primary review completed; an independent second review is still owed.'
        : 'Additional attempts exist, but no independent model family or deterministic falsifier has reviewed the work.',
      disagreements,
      attempts: normalized,
      independent_review_count: independentFamilies.length,
      review_families: independentFamilies,
    };
  }
  return {
    standing: 'EVIDENCE_PRESENTED',
    needs_kelly: true,
    summary: 'Independent attempts completed without structured disagreement. Semantic findings remain evidence for founder review, not an automated verdict.',
    disagreements,
    attempts: normalized,
    independent_review_count: independentFamilies.length,
    review_families: independentFamilies,
  };
}

function providerChildEnv(sourceEnv = process.env) {
  const built = childEnv(sourceEnv).env;
  const dirs = [];
  const node = resolveNodeBinary({ env: built });
  if (node.path && node.path !== 'node') dirs.push(path.dirname(node.path));
  const oc = FRONTIER.resolveOpenCodeBinary(built, os.homedir());
  if (oc.path) dirs.push(path.dirname(oc.path));
  dirs.push('/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin');
  built.PATH = [...new Set([...dirs, ...(String(built.PATH || '').split(':').filter(Boolean))])].join(':');
  return built;
}

async function providers(root, opts = {}) {
  const env = opts.env || process.env;
  const mod = await importBound(root, 'scripts/builder/opencode-provider.mjs');
  const specs = mod.OPENCODE_PROVIDERS || {};
  const frontier = FRONTIER.status({ env, home: opts.home || os.homedir() });
  return Object.entries(specs).map(([id, spec]) => {
    let state = 'AVAILABLE';
    let detail = 'Provider is registered and locally resolvable; Work Unit authority is still required per run.';
    const credential = credentialAvailability(spec.credential_env, {
      env, keychainProbe: opts.keychainProbe,
    });
    if (id === 'nemotron-zen' && !frontier.ready) {
      state = 'NEEDS_SETUP'; detail = frontier.detail;
    } else if (!credential.ready) {
      state = 'NEEDS_SETUP'; detail = `${spec.credential_env} is not available through an approved credential source.`;
    } else if (credential.source === 'keychain') {
      detail = 'Credential is present in macOS Keychain; its value is not loaded into JARVIS. Work Unit authority is still required per run.';
    }
    return {
      id, state, detail,
      model_ref: `${spec.opencode_provider}/${spec.default_model}`,
      standing: spec.standing,
      external_network: spec.external_network,
      metered_provider: spec.metered_provider,
      credential_required: spec.credential_env || null,
      credential_source: credential.source,
    };
  });
}

async function create(root, packet, opts = {}) {
  const mod = await importBound(root, 'scripts/builder/work-unit-create.mjs');
  return mod.createWorkUnit(packet, { home: opts.home });
}

async function planRouting(root, input = {}) {
  const mod = await importBound(root, 'scripts/builder/routing-intelligence-j6.mjs');
  return mod.planRouting(input);
}

async function planWorkUnitRouting(root, workUnitId, req = {}, opts = {}) {
  const workUnitMod = await importBound(root, 'scripts/builder/work-unit.mjs');
  const providerMod = await importBound(root, 'scripts/builder/opencode-provider.mjs');
  const workUnit = workUnitMod.loadWorkUnit(workUnitId);
  if (!workUnit) return { ok: false, status: 'REFUSED', reason: 'WORK_UNIT_NOT_FOUND' };

  const catalog = await providers(root, opts);
  const providerAvailability = Object.fromEntries(
    catalog.map((provider) => [provider.id, provider.state === 'AVAILABLE']),
  );
  const plan = await planRouting(root, {
    capability: workUnit.capability,
    task_shape: req.task_shape || workUnit.routing?.task_shape || workUnit.task_class,
    evidence_class: providerMod.deriveWorkUnitEvidenceClass(workUnit),
    permission_envelope: workUnitMod.derivePermissionEnvelope(workUnit),
    provider_availability: providerAvailability,
    requested_external_family: req.requested_external_family || null,
  });
  return {
    ok: true,
    status: 'PLANNED',
    work_unit_id: workUnitId,
    route_plan: plan,
  };
}

async function r5bContext(root, workUnitId, providerId, opts = {}) {
  const [workUnitMod, providerMod, grantMod] = await Promise.all([
    importBound(root, 'scripts/builder/work-unit.mjs'),
    importBound(root, 'scripts/builder/opencode-provider.mjs'),
    importBound(root, 'scripts/builder/human-provider-execution-grant.mjs'),
  ]);
  const workUnit = workUnitMod.loadWorkUnit(workUnitId);
  if (!workUnit) return { ok: false, status: 'REFUSED', reason: 'WORK_UNIT_NOT_FOUND' };
  const spec = providerMod.OPENCODE_PROVIDERS?.[providerId];
  if (!spec) return { ok: false, status: 'REFUSED', reason: 'UNKNOWN_PROVIDER' };
  const modelRef = `${spec.opencode_provider}/${spec.default_model}`;
  const attempts = workUnitMod.loadAttempts(workUnitId);
  const localSubstrate = fs.existsSync(root)
    && fs.existsSync(path.join(root, 'scripts', 'ain-delegate.sh'));
  const preview = grantMod.prepareHumanExecutionAuthorization({
    work_unit: workUnit,
    binding: workUnit.routing_intelligence ?? null,
    attempts,
    provider_id: providerId,
    model_ref: modelRef,
    local_worktree_available: localSubstrate,
  });
  return {
    ok: preview.ok,
    status: preview.status,
    reason: preview.blockers?.[0]?.code || null,
    work_unit: workUnit,
    attempts,
    providerMod,
    grantMod,
    provider_spec: spec,
    provider: {
      id: providerId,
      model_ref: modelRef,
      standing: spec.standing,
      external_network: spec.external_network === true,
      metered_provider: spec.metered_provider === true,
    },
    preview,
  };
}

async function executionAuthorizationPreview(root, workUnitId, providerId, opts = {}) {
  if (CWUV2.existsCanonicalV2(workUnitId, opts.env || process.env)) {
    return {
      ok: false,
      status: 'CANONICAL_V2_EXECUTION_DISCONNECTED',
      reason: 'Canonical W0.v2 Work Units do not expose R5B execution authorization in I4.',
    };
  }
  const ctx = await r5bContext(root, workUnitId, providerId, opts);
  if (!ctx.ok) {
    return {
      ok: false,
      status: ctx.status || 'REFUSED',
      reason: ctx.reason || 'R5B_PREVIEW_REFUSED',
      blockers: ctx.preview?.blockers || [],
      provider: ctx.provider || null,
    };
  }
  const store = await importBound(
    root,
    'scripts/builder/human-provider-execution-grant-store.mjs',
  );
  const grants = store.listGrantStandings(workUnitId, {
    home: homeOf(opts.env || process.env),
  });
  return {
    ...ctx.preview,
    ok: true,
    status: 'HELD_FOR_HUMAN_AUTHORIZATION',
    r4_disposition: ctx.preview.admission_before,
    provider: ctx.provider,
    execution_grants: grants,
  };
}

async function authorizeExecutionOnce(root, workUnitId, providerId, opts = {}) {
  if (CWUV2.existsCanonicalV2(workUnitId, opts.env || process.env)) {
    return {
      ok: false,
      status: 'CANONICAL_V2_EXECUTION_DISCONNECTED',
      reason: 'Canonical W0.v2 Work Units do not create provider execution authority in I4.',
    };
  }
  const ctx = await r5bContext(root, workUnitId, providerId, opts);
  if (!ctx.ok) {
    return {
      ok: false,
      status: ctx.status || 'REFUSED',
      reason: ctx.reason || 'R5B_PREVIEW_REFUSED',
      blockers: ctx.preview?.blockers || [],
    };
  }
  const store = await importBound(
    root,
    'scripts/builder/human-provider-execution-grant-store.mjs',
  );
  const issued = store.issueHumanExecutionGrant(ctx.preview, {
    home: homeOf(opts.env || process.env),
    grantor: 'founder',
    authorization_act: 'JARVIS_DESKTOP_R5B_AUTHORIZE_ONCE',
  });
  return {
    ...issued,
    provider: ctx.provider,
    preview: ctx.preview,
  };
}

async function revokeExecutionGrant(root, workUnitId, grantId, opts = {}) {
  const store = await importBound(
    root,
    'scripts/builder/human-provider-execution-grant-store.mjs',
  );
  return store.revokeHumanExecutionGrant(workUnitId, grantId, {
    home: homeOf(opts.env || process.env),
    reason: 'HUMAN_REVOKED',
  });
}

async function status(root, workUnitId, opts = {}) {
  const [mod, grantStore] = await Promise.all([
    importBound(root, 'scripts/builder/work-unit.mjs'),
    importBound(root, 'scripts/builder/human-provider-execution-grant-store.mjs'),
  ]);
  const workUnit = mod.workUnitStatus(workUnitId);
  const raw = mod.loadWorkUnit(workUnitId);
  const attempts = mod.loadAttempts(workUnitId);
  const executionGrants = raw
    ? grantStore.listGrantStandings(workUnitId, {
      home: homeOf(opts.env || process.env),
    })
    : [];
  return {
    ok: workUnit.exists === true,
    work_unit: workUnit,
    provider_strategy: raw?.provider_strategy ?? [],
    routing_intelligence: raw?.routing_intelligence ?? null,
    disclosure: raw?.disclosure ?? null,
    attempts,
    execution_grants: executionGrants,
    reconciliation: reconcileAttempts(attempts),
  };
}

async function canonicalExecutionStatus(root, workUnitId, opts = {}) {
  const snapshot = await CWUV2.statusCanonicalV2(root, workUnitId, opts);
  if (!snapshot?.ok) return snapshot;
  const store = await importBound(
    root,
    'scripts/builder/canonical-provider-execution-grant-store-v1.mjs',
  );
  const home = homeOf(opts.env || process.env);
  const grants = store.listCanonicalGrantStandingsV1(workUnitId, { home });
  return {
    ...snapshot,
    execution_bridge: {
      version: 'E1.v1',
      available: true,
      authority_created_by_routing: false,
      authorize_is_execute: false,
      grants,
    },
  };
}

async function canonicalPrepareTransport(root, workUnitId, participantId, opts = {}) {
  const out = await CWUV2.prepareCanonicalTransportForExecutionV2(
    root,
    workUnitId,
    participantId,
    opts,
  );
  if (!out?.ok) return out;
  return canonicalExecutionStatus(root, workUnitId, opts);
}

function canonicalEvidenceSubstrateAvailable(root, workUnit) {
  if (!root || !fs.existsSync(root) || !workUnit) return false;
  const evidenceClass = workUnit.custody?.evidence_class;
  if (evidenceClass === 'E0_TASK_TEXT') {
    return typeof workUnit.identity?.objective === 'string'
      && workUnit.identity.objective.trim().length > 0;
  }
  const sha = String(workUnit.scope?.base_ref || '');
  const allowed = boundedCanonicalPaths(workUnit);
  if (!/^[0-9a-f]{40}$/i.test(sha) || !allowed.length) return false;
  try {
    execFileSync('git', ['cat-file', '-e', sha + '^{commit}'], {
      cwd: root,
      stdio: 'ignore',
    });
    const listed = execFileSync('git', [
      'ls-tree', '-r', '--name-only', sha, '--', ...allowed,
    ], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 4 * 1024 * 1024,
    });
    return String(listed).split('\n').some((line) => line.trim());
  } catch {
    return false;
  }
}

async function canonicalExecutionContext(root, workUnitId, participantId, opts = {}) {
  const envelope = CWUV2.readCanonicalExecutionEnvelopeV2(
    workUnitId,
    opts.env || process.env,
  );
  if (!envelope) {
    return { ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND' };
  }
  const e1 = await importBound(root, 'scripts/builder/canonical-provider-execution-v1.mjs');
  const preview = e1.prepareCanonicalExecutionAuthorizationV1({
    envelope,
    route_participant_id: participantId,
    local_worktree_available: canonicalEvidenceSubstrateAvailable(root, envelope.work_unit),
  });
  return {
    ok: preview.ok,
    status: preview.status,
    reason: preview.blockers?.[0]?.code || null,
    envelope,
    e1,
    preview,
  };
}

async function canonicalExecutionPreview(root, workUnitId, participantId, opts = {}) {
  const ctx = await canonicalExecutionContext(root, workUnitId, participantId, opts);
  if (!ctx.ok) {
    return {
      ok: false,
      status: ctx.status || 'REFUSED',
      reason: ctx.reason || 'CANONICAL_E1_PREVIEW_REFUSED',
      blockers: ctx.preview?.blockers || [],
    };
  }
  const store = await importBound(
    root,
    'scripts/builder/canonical-provider-execution-grant-store-v1.mjs',
  );
  return {
    ...ctx.preview,
    status: 'HELD_FOR_HUMAN_AUTHORIZATION',
    grants: store.listCanonicalGrantStandingsV1(workUnitId, {
      home: homeOf(opts.env || process.env),
    }),
  };
}

async function canonicalAuthorizeExecutionOnce(root, workUnitId, participantId, opts = {}) {
  const ctx = await canonicalExecutionContext(root, workUnitId, participantId, opts);
  if (!ctx.ok) {
    return {
      ok: false,
      status: ctx.status || 'REFUSED',
      reason: ctx.reason || 'CANONICAL_E1_PREVIEW_REFUSED',
      blockers: ctx.preview?.blockers || [],
    };
  }
  const store = await importBound(
    root,
    'scripts/builder/canonical-provider-execution-grant-store-v1.mjs',
  );
  const issued = store.issueCanonicalExecutionGrantV1(ctx.preview, {
    home: homeOf(opts.env || process.env),
    actor_id: opts.actorId || 'human:jarvis-desktop:operator',
    authorization_act: 'JARVIS_DESKTOP_E1_AUTHORIZE_ONCE',
  });
  return {
    ...issued,
    preview: ctx.preview,
  };
}

async function canonicalRevokeExecutionGrant(root, workUnitId, grantId, opts = {}) {
  const store = await importBound(
    root,
    'scripts/builder/canonical-provider-execution-grant-store-v1.mjs',
  );
  return store.revokeCanonicalExecutionGrantV1(workUnitId, grantId, {
    home: homeOf(opts.env || process.env),
    reason: 'HUMAN_REVOKED',
  });
}

function canonicalResultLocation(workUnitId, grantId, env = process.env) {
  const dir = path.join(homeOf(env), 'work-units-v2', 'results', workUnitId);
  return {
    dir,
    file: path.join(dir, grantId + '.json'),
    ref: 'canonical-result:' + workUnitId + ':' + grantId,
  };
}

function persistCanonicalDurableResult(workUnitId, grantId, result, env = process.env) {
  const loc = canonicalResultLocation(workUnitId, grantId, env);
  fs.mkdirSync(loc.dir, { recursive: true });
  const body = JSON.stringify(result, null, 2) + '\n';
  fs.writeFileSync(loc.file, body, { mode: 0o600 });
  return {
    path: loc.file,
    ref: loc.ref,
    digest: 'sha256:' + crypto.createHash('sha256').update(body).digest('hex'),
  };
}

function boundedCanonicalPaths(workUnit) {
  return (workUnit?.scope?.allowed_paths || []).filter((value) =>
    typeof value === 'string'
    && value.trim()
    && !value.startsWith('/')
    && !value.startsWith('../')
    && !value.includes('/../')
    && !value.includes('\\'));
}

const OPENCODE_PROJECT_DISCOVERY_NAMES = Object.freeze([
  '.claude',
  '.agents',
  '.opencode',
  'opencode.json',
  'opencode.jsonc',
]);

function canonicalOpenCodeNeutralRoot() {
  const uid = os.userInfo().uid;
  const base = process.platform === 'darwin' ? '/private/tmp' : '/tmp';
  const neutralRoot = path.join(base, 'jarvis-canonical-opencode-' + uid);
  fs.mkdirSync(neutralRoot, { recursive: true, mode: 0o700 });
  try { fs.chmodSync(neutralRoot, 0o700); } catch {}
  return neutralRoot;
}

function createCanonicalOpenCodeRuntime() {
  const neutralRoot = canonicalOpenCodeNeutralRoot();
  const runRoot = fs.mkdtempSync(path.join(neutralRoot, 'run-'));
  const runtime = {
    neutralRoot,
    runRoot,
    workspace: path.join(runRoot, 'workspace'),
    tmp: path.join(runRoot, 'tmp'),
    home: path.join(runRoot, 'home'),
    xdgConfig: path.join(runRoot, 'xdg-config'),
    xdgData: path.join(runRoot, 'xdg-data'),
    xdgCache: path.join(runRoot, 'xdg-cache'),
    xdgState: path.join(runRoot, 'xdg-state'),
    configDir: path.join(runRoot, 'opencode-config'),
  };
  for (const dir of Object.values(runtime).filter((value) =>
    typeof value === 'string' && value.startsWith(runRoot))) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  return runtime;
}

function canonicalOpenCodeAncestorPreflight(cwd) {
  let current = path.resolve(cwd);
  while (true) {
    for (const name of OPENCODE_PROJECT_DISCOVERY_NAMES) {
      const candidate = path.join(current, name);
      try {
        fs.lstatSync(candidate);
        return {
          ok: false,
          status: 'REFUSED',
          reason: 'AMBIENT_OPENCODE_PROJECT_CONFIGURATION',
          offending_path: candidate,
          discovery_class: name.startsWith('.') ? 'directory:' + name : 'file:' + name,
        };
      } catch (error) {
        if (error?.code !== 'ENOENT') {
          return {
            ok: false,
            status: 'REFUSED',
            reason: 'OPENCODE_DISCOVERY_PREFLIGHT_ERROR',
            offending_path: candidate,
            discovery_class: name.startsWith('.') ? 'directory:' + name : 'file:' + name,
            error_code: error?.code || 'UNKNOWN',
          };
        }
      }
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return { ok: true, status: 'ADMITTED', reason: null };
}

function materializeCanonicalEvidenceSandbox(root, workUnit, opts = {}) {
  const sha = String(workUnit?.scope?.base_ref || '');
  const allowed = boundedCanonicalPaths(workUnit);
  const taskTextOnly = workUnit?.custody?.evidence_class === 'E0_TASK_TEXT';
  if (!taskTextOnly && (!/^[0-9a-f]{40}$/i.test(sha) || !allowed.length)) {
    throw new Error('CANONICAL_EVIDENCE_SCOPE_INVALID');
  }

  let files = [];
  if (!taskTextOnly) {
    const listing = execFileSync('git', [
      'ls-tree', '-r', '--name-only', sha, '--', ...allowed,
    ], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 4 * 1024 * 1024,
    });
    files = [...new Set(String(listing).split('\n').map((v) => v.trim()).filter(Boolean))];
    if (!files.length) throw new Error('CANONICAL_EVIDENCE_SCOPE_EMPTY');
  }

  const workspace = opts.workspace || fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-e1-evidence-'));
  fs.mkdirSync(workspace, { recursive: true, mode: 0o700 });
  let totalBytes = 0;
  for (const rel of files) {
    const bytes = execFileSync('git', ['show', sha + ':' + rel], {
      cwd: root,
      encoding: null,
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 8 * 1024 * 1024,
    });
    totalBytes += bytes.length;
    if (totalBytes > 2 * 1024 * 1024) {
      fs.rmSync(workspace, { recursive: true, force: true });
      throw new Error('CANONICAL_EVIDENCE_BUNDLE_TOO_LARGE');
    }
    const target = path.join(workspace, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  }

  return { workspace, files };
}

function governedReadonlyAgentConfig(root) {
  const file = path.join(root, '.opencode', 'agents', 'jarvis-readonly.md');
  if (!fs.existsSync(file)) throw new Error('JARVIS_READONLY_AGENT_MISSING');

  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const lines = raw.split('\n');
  if (lines[0] !== '---') throw new Error('JARVIS_READONLY_AGENT_FRONTMATTER_REQUIRED');
  const end = lines.indexOf('---', 1);
  if (end < 0) throw new Error('JARVIS_READONLY_AGENT_FRONTMATTER_UNTERMINATED');

  const agent = { description: '', mode: '', permission: {} };
  let section = null;
  for (const line of lines.slice(1, end)) {
    if (!line.trim()) continue;
    const nested = /^  ([A-Za-z0-9_]+):\s*(allow|deny|ask)\s*$/.exec(line);
    if (nested) {
      if (section !== 'permission') throw new Error('JARVIS_READONLY_AGENT_FRONTMATTER_INVALID');
      agent.permission[nested[1]] = nested[2];
      continue;
    }
    const top = /^([A-Za-z0-9_]+):(?:\s*(.*))?$/.exec(line);
    if (!top) throw new Error('JARVIS_READONLY_AGENT_FRONTMATTER_INVALID');
    const [, key, value = ''] = top;
    if (key === 'permission' && !value.trim()) {
      section = 'permission';
      continue;
    }
    if (!['description', 'mode'].includes(key)) {
      throw new Error('JARVIS_READONLY_AGENT_FRONTMATTER_UNSUPPORTED:' + key);
    }
    section = null;
    agent[key] = value.trim();
  }

  const prompt = lines.slice(end + 1).join('\n').trim();
  if (!agent.description || agent.mode !== 'primary' || !prompt) {
    throw new Error('JARVIS_READONLY_AGENT_REQUIRED_FIELDS');
  }
  const required = {
    read: 'allow', glob: 'allow', grep: 'allow', list: 'allow', lsp: 'allow',
    edit: 'deny', bash: 'deny', task: 'deny', external_directory: 'deny',
    webfetch: 'deny', websearch: 'deny', skill: 'deny', question: 'deny',
    doom_loop: 'deny',
  };
  for (const [action, effect] of Object.entries(required)) {
    if (agent.permission[action] !== effect) {
      throw new Error('JARVIS_READONLY_AGENT_POLICY_MISMATCH:' + action);
    }
  }
  if (Object.keys(agent.permission).length !== Object.keys(required).length) {
    throw new Error('JARVIS_READONLY_AGENT_POLICY_UNEXPECTED');
  }
  return {
    description: agent.description,
    mode: agent.mode,
    prompt,
    permission: agent.permission,
  };
}

function materializeGovernedOpenCodeConfig(root, resolved, runtime) {
  const config = {
    $schema: 'https://opencode.ai/config.json',
    agent: {
      'jarvis-readonly': governedReadonlyAgentConfig(root),
    },
  };
  if (resolved?.model_ref?.startsWith('ollama/')) {
    config.provider = {
      ollama: {
        npm: '@ai-sdk/openai-compatible',
        name: 'Ollama (local)',
        options: { baseURL: 'http://127.0.0.1:11434/v1' },
        models: { [resolved.model_id]: { name: resolved.model_id + ' (governed local)' } },
      },
    };
  }
  const file = path.join(runtime.configDir, 'opencode.json');
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });

  // Preserve the governed markdown bytes alongside the v2 JSON projection for
  // custody/debug evidence. OpenCode v2 consumes the JSON agent entry above.
  const source = path.join(root, '.opencode', 'agents', 'jarvis-readonly.md');
  const target = path.join(runtime.configDir, 'agents', 'jarvis-readonly.md');
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  fs.copyFileSync(source, target);
}

function canonicalOpenCodeEnv(sourceEnv, runtime) {
  const built = allowlistedChildEnv(sourceEnv, {
    overrides: {
      HOME: runtime.home,
      TMPDIR: runtime.tmp,
      XDG_CONFIG_HOME: runtime.xdgConfig,
      XDG_DATA_HOME: runtime.xdgData,
      XDG_CACHE_HOME: runtime.xdgCache,
      XDG_STATE_HOME: runtime.xdgState,
      OPENCODE_CONFIG_DIR: runtime.configDir,
      OPENCODE_DISABLE_MODELS_FETCH: '1',
      OPENCODE_DISABLE_AUTOUPDATE: '1',
    },
  }).env;

  // Finder-launched JARVIS may not inherit the founder's executable paths.
  // Add only the already-resolved executable directories; do not carry the
  // corresponding ambient configuration variables into the canonical child.
  const dirs = [];
  const node = resolveNodeBinary({ env: built });
  if (node.path && node.path !== 'node') dirs.push(path.dirname(node.path));
  const oc = FRONTIER.resolveOpenCodeBinary(built, os.homedir());
  if (oc.path) dirs.push(path.dirname(oc.path));
  dirs.push('/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin');
  built.PATH = [...new Set([...dirs, ...(String(built.PATH || '').split(':').filter(Boolean))])].join(':');
  return built;
}

function prepareCanonicalOpenCodeContainment(root, workUnit, resolved, sourceEnv) {
  const runtime = createCanonicalOpenCodeRuntime();
  const sandbox = materializeCanonicalEvidenceSandbox(root, workUnit, {
    workspace: runtime.workspace,
  });
  materializeGovernedOpenCodeConfig(root, resolved, runtime);
  const preflight = canonicalOpenCodeAncestorPreflight(sandbox.workspace);
  if (!preflight.ok) {
    fs.rmSync(runtime.runRoot, { recursive: true, force: true });
    return preflight;
  }
  return {
    ok: true,
    status: 'ADMITTED',
    runtime,
    sandbox,
    env: canonicalOpenCodeEnv(sourceEnv, runtime),
  };
}

function canonicalProviderPrompt(workUnit, files, { inlineEvidence = false, workspace } = {}) {
  const acceptance = (workUnit?.evaluation?.acceptance_conditions || [])
    .map((v) => '- ' + v).join('\n') || '(none)';
  const stops = (workUnit?.evaluation?.stop_conditions || [])
    .map((v) => '- ' + v).join('\n') || '(none)';
  let evidence = files.length
    ? files.map((v) => '- ' + v).join('\n')
    : '(task text only; no repository file evidence disclosed)';
  if (inlineEvidence && files.length) {
    evidence = files.map((rel) => {
      const file = path.join(workspace, rel);
      return '=== ' + rel + ' ===\n' + fs.readFileSync(file, 'utf8');
    }).join('\n\n');
  }
  return [
    'You are executing one read-only canonical JARVIS Work Unit.',
    'Routing, provider selection, authority, and adjudication are already governed outside you.',
    'Do not edit files. Do not infer authority. Return evidence, uncertainty, and falsifiers only.',
    '',
    'OBJECTIVE:',
    String(workUnit?.identity?.objective || ''),
    '',
    'AUTHORIZED EVIDENCE:',
    evidence,
    '',
    'ACCEPTANCE CONDITIONS:',
    acceptance,
    '',
    'STOP CONDITIONS:',
    stops,
  ].join('\n');
}

async function executeCanonicalResolvedProvider(
  root,
  {
    workUnitId,
    grantId,
    workUnit,
    binding,
    resolved,
    sourceEnv,
  },
  opts = {},
) {
  let sandbox = null;
  let containment = opts.preparedContainment || null;
  try {
    let env;
    if (resolved.execution_adapter === 'opencode') {
      if (!containment) {
        const runtime = createCanonicalOpenCodeRuntime();
        sandbox = materializeCanonicalEvidenceSandbox(root, workUnit, {
          workspace: runtime.workspace,
        });
        materializeGovernedOpenCodeConfig(root, resolved, runtime);
        const preflight = canonicalOpenCodeAncestorPreflight(sandbox.workspace);
        if (!preflight.ok) return preflight;
        containment = { runtime, sandbox, env: canonicalOpenCodeEnv(sourceEnv, runtime) };
      }
      sandbox = containment.sandbox;
      env = containment.env;
    } else {
      sandbox = materializeCanonicalEvidenceSandbox(root, workUnit);
      env = providerChildEnv(sourceEnv);
    }
    const timeout = opts.timeoutMs || RUN_TIMEOUT_MS;
    let run;

    if (resolved.execution_adapter === 'opencode') {
      run = await new Promise((resolve) => {
        execFile('opencode', [
          'run', '--standalone',
          '--agent', resolved.agent || 'jarvis-readonly',
          '--model', resolved.model_ref,
          canonicalProviderPrompt(workUnit, sandbox.files, {
            inlineEvidence: false,
            workspace: sandbox.workspace,
          }),
        ], {
          cwd: sandbox.workspace,
          env,
          timeout,
          maxBuffer: 4 * 1024 * 1024,
        }, (error, stdout, stderr) => resolve({
          exit_code: error && typeof error.code === 'number' ? error.code : error ? -1 : 0,
          signal: error?.signal || null,
          stdout: String(stdout || '').slice(-MAX_LOG_CHARS),
          stderr: String(stderr || '').slice(-MAX_LOG_CHARS),
        }));
      });
    } else if (resolved.execution_adapter === 'tinker-direct') {
      const node = resolveNodeBinary();
      if (!node.path) throw new Error('NODE_RUNTIME_UNAVAILABLE');
      const prompt = canonicalProviderPrompt(workUnit, sandbox.files, {
        inlineEvidence: true,
        workspace: sandbox.workspace,
      });
      run = await new Promise((resolve) => {
        // Credential value custody stays in this child. The Desktop parent has
        // checked only presence after final R4/R5A admission.
        const child = execFile(node.path, [
          path.join(root, 'scripts', 'builder', 'canonical-provider-child-v1.mjs'),
          'tinker-direct',
          resolved.model_id,
        ], {
          cwd: sandbox.workspace,
          env,
          timeout,
          maxBuffer: 4 * 1024 * 1024,
        }, (error, stdout, stderr) => resolve({
          exit_code: error && typeof error.code === 'number' ? error.code : error ? -1 : 0,
          signal: error?.signal || null,
          stdout: String(stdout || '').slice(-MAX_LOG_CHARS),
          stderr: String(stderr || '').slice(-MAX_LOG_CHARS),
        }));
        child.stdin?.end(prompt);
      });
    } else {
      run = {
        exit_code: -1,
        signal: null,
        stdout: '',
        stderr: 'CANONICAL_PROVIDER_AUTOMATION_UNSUPPORTED',
      };
    }

    const escalation = /ESCALATE_TO_CLAUDE:/i.test(run.stdout + '\n' + run.stderr);
    const durableResult = {
      execution_version: 'E1.v1',
      work_unit_id: workUnitId,
      grant_id: grantId,
      route_participant_id: binding.route_participant_id,
      transport_binding_id: binding.transport_binding_id,
      provider_id: binding.provider_id,
      model_id: binding.model_id,
      adapter_id: binding.adapter_id,
      exit_code: run.exit_code,
      test_results: 'not_run',
      escalation_required: escalation,
      recommended_next_action: run.exit_code === 0 && !escalation ? 'review-evidence' : 'reject',
      output_excerpt: String(run.stdout || '').slice(-MAX_LOG_CHARS),
      stderr_excerpt: String(run.stderr || '').slice(-MAX_LOG_CHARS),
    };
    const persisted = persistCanonicalDurableResult(
      workUnitId,
      grantId,
      durableResult,
      sourceEnv,
    );
    return {
      ok: run.exit_code === 0 && !escalation,
      status: run.exit_code === 0 && !escalation ? 'COMPLETED' : 'FAILED',
      run,
      durable_result: durableResult,
      result_ref: persisted.ref,
      result_digest: persisted.digest,
      result_path: persisted.path,
    };
  } finally {
    if (sandbox?.workspace) fs.rmSync(sandbox.workspace, { recursive: true, force: true });
  }
}

async function canonicalConfirmAuthorizedExecution(root, workUnitId, grantId, opts = {}) {
  const sourceEnv = opts.env || process.env;
  const home = homeOf(sourceEnv);
  const store = await importBound(
    root,
    'scripts/builder/canonical-provider-execution-grant-store-v1.mjs',
  );
  const standing = store.canonicalGrantStandingV1(workUnitId, grantId, { home });
  if (!standing.exists) return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
  if (standing.standing !== 'ACTIVE') {
    return {
      ok: false,
      status: 'REFUSED',
      reason: 'GRANT_NOT_ACTIVE',
      grant_standing: standing.standing,
    };
  }

  const envelope = CWUV2.readCanonicalExecutionEnvelopeV2(workUnitId, sourceEnv);
  if (!envelope) return { ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND' };
  const e1 = await importBound(root, 'scripts/builder/canonical-provider-execution-v1.mjs');
  const finalAdmission = e1.evaluateCanonicalExecutionGrantV1({
    grant: standing.grant,
    envelope,
    local_worktree_available: canonicalEvidenceSubstrateAvailable(root, envelope.work_unit),
  });
  if (!finalAdmission.ok) {
    store.invalidateCanonicalExecutionGrantV1(workUnitId, grantId, {
      home,
      reason: finalAdmission.status || 'FINAL_CANONICAL_ADMISSION_REFUSED',
    });
    return {
      ok: false,
      status: finalAdmission.status,
      reason: finalAdmission.blockers?.[0]?.code || 'FINAL_CANONICAL_ADMISSION_REFUSED',
      blockers: finalAdmission.blockers || [],
    };
  }

  const providerMod = await importBound(root, 'scripts/builder/opencode-provider.mjs');
  const binding = finalAdmission.transport_binding;
  const resolved = providerMod.resolveOpenCodeProvider({
    providerId: binding.provider_id,
    model: binding.model_id,
    permissionEnvelope: finalAdmission.permission_envelope,
    evidenceClass: binding.evidence_class,
    env: sourceEnv,
    skipCredentialCheck: true,
  });
  const exactTransport = resolved.ok
    && resolved.provider_id === binding.provider_id
    && resolved.model_id === binding.model_id
    && resolved.execution_adapter === binding.adapter_id;
  if (!exactTransport) {
    store.invalidateCanonicalExecutionGrantV1(workUnitId, grantId, {
      home,
      reason: resolved.code || 'REGISTERED_TRANSPORT_IDENTITY_MISMATCH',
    });
    return {
      ok: false,
      status: 'GRANT_INVALID',
      reason: resolved.code || 'REGISTERED_TRANSPORT_IDENTITY_MISMATCH',
    };
  }

  const credential = credentialAvailability(resolved.credential_env, {
    env: sourceEnv,
    keychainProbe: opts.keychainProbe,
  });
  if (!credential.ready) {
    return {
      ok: false,
      status: 'HELD_FOR_CREDENTIAL',
      reason: 'PROVIDER_CREDENTIAL_MISSING',
      grant_standing: 'ACTIVE',
    };
  }

  let preparedContainment = null;
  if (resolved.execution_adapter === 'opencode') {
    preparedContainment = prepareCanonicalOpenCodeContainment(
      root, envelope.work_unit, resolved, sourceEnv,
    );
    if (!preparedContainment.ok) {
      return {
        ...preparedContainment,
        grant_standing: 'ACTIVE',
      };
    }
  }

  const claimed = store.claimCanonicalExecutionGrantV1(workUnitId, grantId, { home });
  if (!claimed.ok) {
    if (preparedContainment?.runtime?.runRoot) {
      fs.rmSync(preparedContainment.runtime.runRoot, { recursive: true, force: true });
    }
    return claimed;
  }

  if (envelope.work_unit.state.lifecycle_state === 'ROUTED') {
    const executing = await CWUV2.transitionCanonicalV2(root, workUnitId, 'EXECUTING', {
      env: sourceEnv,
      actorId: opts.actorId || 'human:jarvis-desktop:operator',
    });
    if (!executing.ok) {
      if (preparedContainment?.runtime?.runRoot) {
        fs.rmSync(preparedContainment.runtime.runRoot, { recursive: true, force: true });
      }
      store.invalidateCanonicalExecutionGrantV1(workUnitId, grantId, {
        home,
        reason: executing.reason || 'W2_V2_EXECUTING_TRANSITION_REFUSED',
      });
      return {
        ok: false,
        status: 'EXECUTING_TRANSITION_REFUSED',
        reason: executing.reason || 'W2_V2_EXECUTING_TRANSITION_REFUSED',
        blockers: executing.blockers || [],
      };
    }
  }

  let executionResult;
  try {
    const runner = opts.executeCanonicalProvider || executeCanonicalResolvedProvider;
    executionResult = await runner(root, {
      workUnitId,
      grantId,
      workUnit: envelope.work_unit,
      binding,
      resolved,
      sourceEnv,
    }, { ...opts, preparedContainment });
  } catch (error) {
    const durableResult = {
      execution_version: 'E1.v1',
      work_unit_id: workUnitId,
      grant_id: grantId,
      route_participant_id: binding.route_participant_id,
      transport_binding_id: binding.transport_binding_id,
      provider_id: binding.provider_id,
      model_id: binding.model_id,
      adapter_id: binding.adapter_id,
      exit_code: -1,
      test_results: 'not_run',
      escalation_required: false,
      recommended_next_action: 'reject',
      output_excerpt: '',
      stderr_excerpt: String(error?.message || error).slice(-MAX_LOG_CHARS),
    };
    const persisted = persistCanonicalDurableResult(workUnitId, grantId, durableResult, sourceEnv);
    executionResult = {
      ok: false,
      status: 'EXECUTION_ERROR',
      reason: String(error?.message || error),
      run: { exit_code: -1, stdout: '', stderr: durableResult.stderr_excerpt },
      durable_result: durableResult,
      result_ref: persisted.ref,
      result_digest: persisted.digest,
      result_path: persisted.path,
    };
  } finally {
    if (preparedContainment?.runtime?.runRoot) {
      fs.rmSync(preparedContainment.runtime.runRoot, { recursive: true, force: true });
    }
  }

  const consumed = store.consumeCanonicalExecutionGrantV1(workUnitId, grantId, {
    home,
    outcome: executionResult?.status || 'execution_attempted',
  });

  const recorded = await CWUV2.appendCanonicalExecutionResultV2(
    root,
    workUnitId,
    {
      route_participant_id: binding.route_participant_id,
      transport_binding_id: binding.transport_binding_id,
      provider_admission: { ok: true, disposition: 'ADMITTED' },
      wrapper_exit_code: Number.isInteger(executionResult?.run?.exit_code)
        ? executionResult.run.exit_code
        : null,
      durable_result: executionResult?.durable_result || {},
      result_ref: executionResult?.result_ref,
      result_digest: executionResult?.result_digest,
    },
    { env: sourceEnv, actorId: opts.actorId },
  );
  if (!recorded.ok) {
    return {
      ...executionResult,
      ok: false,
      status: 'CANONICAL_EVIDENCE_RECORD_FAILED',
      reason: recorded.reason || recorded.blockers?.[0]?.code,
      blockers: recorded.blockers || [],
      execution_grant: {
        grant_id: grantId,
        standing: consumed.ok ? 'CONSUMED' : 'CLAIMED',
      },
    };
  }

  const snapshot = await canonicalExecutionStatus(root, workUnitId, {
    env: sourceEnv,
    actorId: opts.actorId,
  });
  return {
    ...snapshot,
    execution_result: executionResult,
    canonical_attempt: recorded.canonical_attempt,
    durable_mapping: recorded.durable_mapping,
    final_admission: finalAdmission.admission,
    r5a_integrity: finalAdmission.r5a_integrity,
    execution_grant: {
      grant_id: grantId,
      standing: consumed.ok ? 'CONSUMED' : 'CLAIMED',
      consume_status: consumed.status,
    },
  };
}

async function canonicalRecordVerifier(root, workUnitId, req = {}, opts = {}) {
  const out = await CWUV2.appendCanonicalVerifierResultV2(
    root,
    workUnitId,
    req,
    opts,
  );
  if (!out?.ok) return out;
  return canonicalExecutionStatus(root, workUnitId, opts);
}

async function canonicalMarkEvidenceReady(root, workUnitId, opts = {}) {
  const out = await CWUV2.markCanonicalEvidenceReadyV2(root, workUnitId, opts);
  if (!out?.ok) return out;
  return canonicalExecutionStatus(root, workUnitId, opts);
}

function delegateLaneForProvider(resolved) {
  if (resolved?.execution_adapter === 'opencode') return 'opencode';
  if (resolved?.execution_adapter === 'tinker-direct') return 'tinker';
  return null;
}

async function executeResolvedProvider(
  root,
  {
    id,
    providerId,
    model,
    resolved,
    sourceEnv,
  },
  opts = {},
) {
  const lane = delegateLaneForProvider(resolved);
  if (!lane) {
    return {
      ok: false,
      status: 'REFUSED',
      reason: 'PROVIDER_AUTOMATION_UNSUPPORTED',
      provider: providerId,
    };
  }

  const delegate = path.join(root, 'scripts', 'ain-delegate.sh');
  const args = [delegate, lane, id, providerId];
  if (model) args.push(model);
  const env = providerChildEnv(sourceEnv);
  const resultBefore = resultPath(id, env);
  const beforeMtime = fs.existsSync(resultBefore) ? fs.statSync(resultBefore).mtimeMs : 0;

  const run = await new Promise((resolve) => {
    execFile('/bin/bash', args, {
      cwd: root, env, timeout: opts.timeoutMs || RUN_TIMEOUT_MS,
      maxBuffer: 4 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      resolve({
        exit_code: error && typeof error.code === 'number' ? error.code : error ? -1 : 0,
        signal: error?.signal || null,
        stdout: String(stdout || '').slice(-12000),
        stderr: String(stderr || '').slice(-12000),
      });
    });
  });

  let recorded = null;
  const rf = resultPath(id, env);
  if (fs.existsSync(rf) && fs.statSync(rf).mtimeMs > beforeMtime) {
    try {
      const wu = await importBound(root, 'scripts/builder/work-unit.mjs');
      recorded = wu.recordAttempt(id);
    } catch (e) {
      return {
        ok: false,
        status: 'ATTEMPT_RECORD_FAILED',
        reason: e.message,
        provider: resolved,
        run,
      };
    }
  }

  const snapshot = await status(root, id, { env: sourceEnv });
  const outcome = durableProviderOutcome(run, recorded);
  return {
    ...outcome,
    provider: resolved,
    run,
    recorded_attempt: recorded,
    ...snapshot,
  };
}

async function runProvider(root, req, opts = {}) {
  const id = String(req?.work_unit_id || '');
  if (CWUV2.existsCanonicalV2(id, opts.env || process.env)) {
    return {
      ok: false,
      status: 'CANONICAL_V2_EXECUTION_DISCONNECTED',
      reason: 'Canonical W0.v2 Work Units cannot use legacy run-provider.',
    };
  }
  const providerId = String(req?.provider_id || '');
  const model = req?.model ? String(req.model) : '';
  if (!id || !providerId) {
    return {
      ok: false,
      status: 'REFUSED',
      reason: 'work_unit_id and provider_id are required',
    };
  }

  // Legacy/manual provider path. Route-bound Work Units remain blocked from this
  // verb in MAIN; R5B uses confirmAuthorizedExecution instead.
  const sourceEnv = opts.env || process.env;
  const providerMod = await importBound(root, 'scripts/builder/opencode-provider.mjs');
  const resolved = providerMod.resolveWorkUnitProvider(
    id, providerId, model, sourceEnv, { skipCredentialCheck: true },
  );
  if (!resolved.ok) {
    return {
      ok: false,
      status: 'REFUSED',
      reason: resolved.code,
      provider: providerId,
    };
  }

  const credential = credentialAvailability(resolved.credential_env, {
    env: sourceEnv,
    keychainProbe: opts.keychainProbe,
  });
  if (!credential.ready) {
    return {
      ok: false,
      status: 'REFUSED',
      reason: 'PROVIDER_CREDENTIAL_MISSING',
      provider: providerId,
    };
  }

  return executeResolvedProvider(root, {
    id,
    providerId,
    model,
    resolved,
    sourceEnv,
  }, opts);
}

async function confirmAuthorizedExecution(root, workUnitId, grantId, opts = {}) {
  const sourceEnv = opts.env || process.env;
  if (CWUV2.existsCanonicalV2(workUnitId, sourceEnv)) {
    return {
      ok: false,
      status: 'CANONICAL_V2_EXECUTION_DISCONNECTED',
      reason: 'Canonical W0.v2 Work Units cannot execute providers in I4.',
    };
  }
  const home = homeOf(sourceEnv);
  const store = await importBound(
    root,
    'scripts/builder/human-provider-execution-grant-store.mjs',
  );
  const standing = store.grantStanding(workUnitId, grantId, { home });
  if (!standing.exists) {
    return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
  }
  if (standing.standing !== 'ACTIVE') {
    return {
      ok: false,
      status: 'REFUSED',
      reason: 'GRANT_NOT_ACTIVE',
      grant_standing: standing.standing,
    };
  }

  const grant = standing.grant;
  const ctx = await r5bContext(root, workUnitId, grant.provider_id, opts);
  if (!ctx.ok) {
    store.invalidateHumanExecutionGrant(workUnitId, grantId, {
      home,
      reason: ctx.reason || 'CURRENT_FACTS_CHANGED',
    });
    return {
      ok: false,
      status: 'GRANT_INVALID',
      reason: ctx.reason || 'CURRENT_FACTS_CHANGED',
      blockers: ctx.preview?.blockers || [],
    };
  }

  // Recompute exact R4 admission immediately before any credential lookup.
  const finalAdmission = ctx.grantMod.evaluateHumanExecutionGrant({
    grant,
    work_unit: ctx.work_unit,
    binding: ctx.work_unit.routing_intelligence ?? null,
    attempts: ctx.attempts,
    provider_id: grant.provider_id,
    model_ref: ctx.provider.model_ref,
    local_worktree_available: true,
  });
  if (!finalAdmission.ok) {
    store.invalidateHumanExecutionGrant(workUnitId, grantId, {
      home,
      reason: finalAdmission.status || 'FINAL_R4_ADMISSION_REFUSED',
    });
    return {
      ok: false,
      status: finalAdmission.status,
      reason: finalAdmission.blockers?.[0]?.code || 'FINAL_R4_ADMISSION_REFUSED',
      blockers: finalAdmission.blockers || [],
    };
  }

  const resolved = ctx.providerMod.resolveOpenCodeProvider({
    providerId: grant.provider_id,
    model: grant.model_ref,
    permissionEnvelope: finalAdmission.permission_envelope,
    evidenceClass: ctx.providerMod.deriveWorkUnitEvidenceClass(
      ctx.work_unit,
      { external: ctx.provider_spec.external_network === true },
    ),
    env: sourceEnv,
    skipCredentialCheck: true,
  });
  if (!resolved.ok) {
    store.invalidateHumanExecutionGrant(workUnitId, grantId, {
      home,
      reason: resolved.code,
    });
    return {
      ok: false,
      status: 'GRANT_INVALID',
      reason: resolved.code,
    };
  }

  // Credential presence is consulted only after human grant validation and a
  // fresh R4 ADMITTED result. The credential value never enters this process.
  const credential = credentialAvailability(resolved.credential_env, {
    env: sourceEnv,
    keychainProbe: opts.keychainProbe,
  });
  if (!credential.ready) {
    return {
      ok: false,
      status: 'HELD_FOR_CREDENTIAL',
      reason: 'PROVIDER_CREDENTIAL_MISSING',
      provider: grant.provider_id,
      grant_standing: 'ACTIVE',
    };
  }

  const lane = delegateLaneForProvider(resolved);
  if (!lane) {
    store.invalidateHumanExecutionGrant(workUnitId, grantId, {
      home,
      reason: 'PROVIDER_AUTOMATION_UNSUPPORTED',
    });
    return {
      ok: false,
      status: 'GRANT_INVALID',
      reason: 'PROVIDER_AUTOMATION_UNSUPPORTED',
    };
  }

  // Claim before provider execution so double-clicks, crashes, or retries can
  // never reuse the one-shot authority. CONSUMED is appended after the attempt.
  const claimed = store.claimHumanExecutionGrant(workUnitId, grantId, { home });
  if (!claimed.ok) return claimed;

  let executionResult;
  try {
    const runner = opts.executeResolvedProvider || executeResolvedProvider;
    executionResult = await runner(root, {
      id: workUnitId,
      providerId: grant.provider_id,
      model: grant.model_ref,
      resolved,
      sourceEnv,
    }, opts);
  } catch (error) {
    executionResult = {
      ok: false,
      status: 'EXECUTION_ERROR',
      reason: String(error?.message || error),
    };
  }

  const consumed = store.consumeHumanExecutionGrant(workUnitId, grantId, {
    home,
    outcome: executionResult?.recorded_attempt
      ? 'attempt_recorded'
      : String(executionResult?.status || 'execution_attempted'),
  });

  return {
    ...executionResult,
    final_admission: finalAdmission.admission,
    execution_grant: {
      grant_id: grantId,
      standing: consumed.ok ? 'CONSUMED' : 'CLAIMED',
      consume_status: consumed.status,
    },
  };
}

module.exports = {
  MAX_LOG_CHARS, RUN_TIMEOUT_MS, KEYCHAIN_CREDENTIALS,
  homeOf, resultPath, readLogExcerpt, exitCodeFromSummary,
  credentialAvailability, delegateLaneForProvider,
  modelFamilyFromAttempt, durableProviderOutcome,
  reconcileAttempts, providerChildEnv, providers, create, planRouting, planWorkUnitRouting,
  OPENCODE_PROJECT_DISCOVERY_NAMES, canonicalOpenCodeAncestorPreflight,
  createCanonicalOpenCodeRuntime, canonicalOpenCodeEnv, prepareCanonicalOpenCodeContainment,
  canonicalExecutionStatus, canonicalPrepareTransport,
  canonicalExecutionPreview, canonicalAuthorizeExecutionOnce, canonicalRevokeExecutionGrant,
  canonicalConfirmAuthorizedExecution, canonicalRecordVerifier, canonicalMarkEvidenceReady,
  executeCanonicalResolvedProvider,
  executionAuthorizationPreview, authorizeExecutionOnce, revokeExecutionGrant,
  confirmAuthorizedExecution, executeResolvedProvider, status, runProvider,
};
