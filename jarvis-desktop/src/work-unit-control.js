// JARVIS Desktop — narrow controller over canonical Work Unit + OpenCode provider seams.
// No provider policy is duplicated here: provider resolution and authority remain in
// scripts/builder/opencode-provider.mjs and scripts/ain-delegate.sh.
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile, execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { childEnv, resolveNodeBinary } = require('./child-env.js');
const FRONTIER = require('./frontier-worker.js');

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
  const node = resolveNodeBinary({ env: sourceEnv });
  if (node.path && node.path !== 'node') dirs.push(path.dirname(node.path));
  const oc = FRONTIER.resolveOpenCodeBinary(sourceEnv, os.homedir());
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

async function status(root, workUnitId) {
  const mod = await importBound(root, 'scripts/builder/work-unit.mjs');
  const workUnit = mod.workUnitStatus(workUnitId);
  const raw = mod.loadWorkUnit(workUnitId);
  const attempts = mod.loadAttempts(workUnitId);
  return {
    ok: workUnit.exists === true,
    work_unit: workUnit,
    provider_strategy: raw?.provider_strategy ?? [],
    routing_intelligence: raw?.routing_intelligence ?? null,
    disclosure: raw?.disclosure ?? null,
    attempts,
    reconciliation: reconcileAttempts(attempts),
  };
}

function delegateLaneForProvider(resolved) {
  if (resolved?.execution_adapter === 'opencode') return 'opencode';
  if (resolved?.execution_adapter === 'tinker-direct') return 'tinker';
  return null;
}

async function runProvider(root, req, opts = {}) {
  const id = String(req?.work_unit_id || '');
  const providerId = String(req?.provider_id || '');
  const model = req?.model ? String(req.model) : '';
  if (!id || !providerId) return { ok: false, status: 'REFUSED', reason: 'work_unit_id and provider_id are required' };

  // Prove Work Unit/provider authority FIRST, deliberately without touching a
  // credential source. Only after authority passes may discovery check whether
  // the approved credential source is ready. The secret value remains the
  // delegate's concern and is never loaded into the Desktop process.
  const sourceEnv = opts.env || process.env;
  const providerMod = await importBound(root, 'scripts/builder/opencode-provider.mjs');
  const resolved = providerMod.resolveWorkUnitProvider(
    id, providerId, model, sourceEnv, { skipCredentialCheck: true },
  );
  if (!resolved.ok) return { ok: false, status: 'REFUSED', reason: resolved.code, provider: providerId };

  const credential = credentialAvailability(resolved.credential_env, {
    env: sourceEnv, keychainProbe: opts.keychainProbe,
  });
  if (!credential.ready) {
    return { ok: false, status: 'REFUSED', reason: 'PROVIDER_CREDENTIAL_MISSING', provider: providerId };
  }

  const lane = delegateLaneForProvider(resolved);
  if (!lane) return { ok: false, status: 'REFUSED', reason: 'PROVIDER_AUTOMATION_UNSUPPORTED', provider: providerId };

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

  // Record only a result created/updated by this attempt; never duplicate a stale result
  // when provider resolution or launch failed before the delegate could write one.
  let recorded = null;
  const rf = resultPath(id, env);
  if (fs.existsSync(rf) && fs.statSync(rf).mtimeMs > beforeMtime) {
    try {
      const wu = await importBound(root, 'scripts/builder/work-unit.mjs');
      recorded = wu.recordAttempt(id);
    } catch (e) {
      return { ok: false, status: 'ATTEMPT_RECORD_FAILED', reason: e.message, provider: resolved, run };
    }
  }

  const snapshot = await status(root, id);
  const outcome = durableProviderOutcome(run, recorded);
  return {
    ...outcome,
    provider: resolved,
    run,
    recorded_attempt: recorded,
    ...snapshot,
  };
}

module.exports = {
  MAX_LOG_CHARS, RUN_TIMEOUT_MS, KEYCHAIN_CREDENTIALS,
  homeOf, resultPath, readLogExcerpt, exitCodeFromSummary,
  credentialAvailability, delegateLaneForProvider,
  modelFamilyFromAttempt, durableProviderOutcome,
  reconcileAttempts, providerChildEnv, providers, create, planRouting, planWorkUnitRouting, status, runProvider,
};
