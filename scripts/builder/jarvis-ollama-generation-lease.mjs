#!/usr/bin/env node
/**
 * E3R3 / S0R1R2 — host-wide local-model diagnostic isolation.
 *
 * This module is a concurrency membrane, not model-execution authority.
 * A diagnostic lease blocks covered Ollama generation. Ordinary generators
 * publish an activity marker before dispatch so diagnostic acquisition cannot
 * race an already-starting generation.
 */
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const DIAGNOSTIC_LEASE_VERSION = 'OLLAMA-DIAGNOSTIC-LEASE.v1';
export const GENERATION_ACTIVITY_VERSION = 'OLLAMA-GENERATION-ACTIVITY.v1';

const DEFAULT_LEASE_NAME = 'ollama-generation-diagnostic-lease.json';
const DEFAULT_ACTIVITY_DIR = 'ollama-generation-activities';
const RECOVERY_LOG = 'ollama-generation-diagnostic-recovery.jsonl';

function delegationHome(env = process.env) {
  return env.AIN_DELEGATION_HOME
    || path.join(os.homedir(), '.claude', 'ain-delegation');
}

export function diagnosticLeasePath(env = process.env) {
  return env.JARVIS_OLLAMA_GENERATION_LEASE_PATH
    || path.join(delegationHome(env), 'locks', DEFAULT_LEASE_NAME);
}

export function generationActivityDir(env = process.env) {
  return env.JARVIS_OLLAMA_GENERATION_ACTIVITY_DIR
    || path.join(path.dirname(diagnosticLeasePath(env)), DEFAULT_ACTIVITY_DIR);
}

function ensureParent(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
}

function writeExclusiveJson(file, value) {
  ensureParent(file);
  const fd = fs.openSync(file, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, JSON.stringify(value, null, 2) + '\n', 'utf8');
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

function validLease(record) {
  return record
    && record.version === DIAGNOSTIC_LEASE_VERSION
    && record.state === 'HELD'
    && typeof record.act_id === 'string' && record.act_id.length > 0
    && Number.isInteger(record.holder_pid) && record.holder_pid > 0
    && typeof record.host === 'string' && record.host.length > 0
    && typeof record.acquired_at === 'string' && record.acquired_at.length > 0
    && typeof record.token === 'string' && record.token.length > 0
    && typeof record.holder_process_fingerprint === 'string'
    && record.holder_process_fingerprint.length > 0;
}

function validActivity(record) {
  return record
    && record.version === GENERATION_ACTIVITY_VERSION
    && record.state === 'ACTIVE'
    && typeof record.activity_id === 'string' && record.activity_id.length > 0
    && typeof record.token === 'string' && record.token.length > 0
    && typeof record.consumer === 'string' && record.consumer.length > 0
    && Number.isInteger(record.pid) && record.pid > 0
    && typeof record.host === 'string' && record.host.length > 0
    && typeof record.started_at === 'string' && record.started_at.length > 0;
}

function readJsonState(file, validator) {
  if (!fs.existsSync(file)) return { state: 'MISSING', file };
  try {
    const record = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!validator(record)) return { state: 'UNKNOWN', file, reason: 'SCHEMA_INVALID' };
    return { state: 'VALID', file, record };
  } catch (error) {
    return { state: 'UNKNOWN', file, reason: String(error?.message || error) };
  }
}

function publicLease(record) {
  if (!record) return null;
  const { token: _token, ...visible } = record;
  return visible;
}

function sha256(text) {
  return crypto.createHash('sha256').update(String(text)).digest('hex');
}

export function processIdentity(pid) {
  try {
    const start = execFileSync('/bin/ps', ['-p', String(pid), '-o', 'lstart='], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const command = execFileSync('/bin/ps', ['-p', String(pid), '-o', 'comm='], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (!start || !command) return null;
    return {
      pid: Number(pid),
      process_name: path.basename(command),
      start,
      fingerprint: sha256(start + '\n' + command),
    };
  } catch {
    return null;
  }
}

function currentPsText() {
  try {
    return execFileSync('/bin/ps', ['-axo', 'pid=,ppid=,command='], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 4 * 1024 * 1024,
    });
  } catch (error) {
    const failure = new Error('GENERATOR_PROCESS_CENSUS_UNAVAILABLE');
    failure.cause = error;
    throw failure;
  }
}

function currentOllamaSocketText() {
  try {
    return execFileSync('/usr/sbin/lsof', [
      '-nP', '-iTCP', '-sTCP:ESTABLISHED', '-Fpcn',
    ], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 4 * 1024 * 1024,
    });
  } catch (error) {
    const failure = new Error('OLLAMA_SOCKET_CENSUS_UNAVAILABLE');
    failure.cause = error;
    throw failure;
  }
}

export function ollamaClientCensus({ lsofText = null } = {}) {
  const text = lsofText == null ? currentOllamaSocketText() : String(lsofText);
  const clients = [];
  let pid = null;
  let processName = null;
  for (const line of text.split('\n')) {
    if (line.startsWith('p')) {
      pid = Number(line.slice(1));
      processName = null;
    } else if (line.startsWith('c')) {
      processName = line.slice(1);
    } else if (line.startsWith('n')
      && /->(?:127\.0\.0\.1|\[::1\]):11434$/.test(line.slice(1))) {
      clients.push({
        pid: Number.isInteger(pid) ? pid : null,
        process_name: processName || null,
      });
    }
  }
  return clients;
}

export function legacyGeneratorCensus({ psText = null, ignorePids = [] } = {}) {
  const ignored = new Set(ignorePids.map(Number));
  const text = psText == null ? currentPsText() : String(psText);
  const rows = [];
  for (const line of text.split('\n')) {
    const match = /^\s*(\d+)\s+(\d+)\s+(.+)$/.exec(line);
    if (!match) continue;
    const pid = Number(match[1]);
    const ppid = Number(match[2]);
    const command = match[3];
    if (ignored.has(pid)) continue;
    let kind = null;
    if (/jarvis-local-worker\.mjs\s+run\b/.test(command)) kind = 'jarvis-local-worker';
    else if (/ain-delegate\.sh\s+local-native\b/.test(command)) kind = 'ain-delegate-local-native';
    else if (/ain-delegate\.sh\s+local\b/.test(command)) kind = 'ain-delegate-local';
    else if (/router-alpha-proof\.mjs\b/.test(command)) kind = 'router-alpha-local-proof';
    else if (/opencode\s+run\b/.test(command)
      && /--model\s+ollama\/(qwen3-coder:30b|gpt-oss:20b)\b/.test(command)) {
      kind = 'canonical-opencode-local';
    }
    if (kind) rows.push({ pid, ppid, kind });
  }
  return rows;
}

export function inspectDiagnosticLease({ env = process.env } = {}) {
  const state = readJsonState(diagnosticLeasePath(env), validLease);
  if (state.state === 'VALID') {
    return { ok: true, state: 'HELD', lease: publicLease(state.record) };
  }
  if (state.state === 'MISSING') return { ok: true, state: 'UNHELD', lease: null };
  return { ok: false, state: 'UNKNOWN', code: 'OLLAMA_DIAGNOSTIC_LEASE_STATE_UNKNOWN' };
}

export function checkGenerationAllowed({
  consumer = 'unspecified-local-generator',
  env = process.env,
} = {}) {
  const state = readJsonState(diagnosticLeasePath(env), validLease);
  if (state.state === 'MISSING') {
    return { ok: true, status: 'GENERATION_GATE_OPEN', consumer };
  }
  if (state.state === 'UNKNOWN') {
    return {
      ok: false,
      status: 'REFUSED',
      code: 'OLLAMA_DIAGNOSTIC_LEASE_STATE_UNKNOWN',
      consumer,
    };
  }
  return {
    ok: false,
    status: 'REFUSED',
    code: 'OLLAMA_DIAGNOSTIC_LEASE_HELD',
    consumer,
    lease: publicLease(state.record),
  };
}

export function listGenerationActivities({ env = process.env } = {}) {
  const dir = generationActivityDir(env);
  if (!fs.existsSync(dir)) return { valid: [], unknown: [] };
  const valid = [];
  const unknown = [];
  for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
    const file = path.join(dir, name);
    const state = readJsonState(file, validActivity);
    if (state.state === 'VALID') valid.push({ file, record: state.record });
    else unknown.push({ file, reason: state.reason || state.state });
  }
  return { valid, unknown };
}

export function beginGenerationActivity({
  consumer,
  providerId = null,
  modelId = null,
  env = process.env,
  pid = process.pid,
  now = () => new Date().toISOString(),
  token = crypto.randomUUID(),
} = {}) {
  if (!consumer || typeof consumer !== 'string') {
    return { ok: false, status: 'REFUSED', code: 'GENERATION_CONSUMER_REQUIRED' };
  }
  const first = checkGenerationAllowed({ consumer, env });
  if (!first.ok) return first;

  const identity = processIdentity(pid);
  const activityId = crypto.randomUUID();
  const dir = generationActivityDir(env);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, 'activity-' + activityId + '.json');
  const record = {
    version: GENERATION_ACTIVITY_VERSION,
    state: 'ACTIVE',
    activity_id: activityId,
    token,
    consumer,
    provider_id: providerId,
    model_id: modelId,
    pid: Number(pid),
    process_fingerprint: identity?.fingerprint || null,
    host: os.hostname(),
    started_at: now(),
  };

  try {
    writeExclusiveJson(file, record);
  } catch (error) {
    return {
      ok: false,
      status: 'REFUSED',
      code: 'GENERATION_ACTIVITY_CREATE_FAILED',
      detail: String(error?.message || error),
    };
  }

  const second = checkGenerationAllowed({ consumer, env });
  if (!second.ok) {
    endGenerationActivity({ activityId, token, env });
    return second;
  }
  return {
    ok: true,
    status: 'ACTIVE',
    activity_id: activityId,
    token,
    file,
    consumer,
  };
}

export function endGenerationActivity({ activityId, token, env = process.env } = {}) {
  if (!activityId || !token) {
    return { ok: false, status: 'REFUSED', code: 'GENERATION_ACTIVITY_IDENTITY_REQUIRED' };
  }
  const file = path.join(generationActivityDir(env), 'activity-' + activityId + '.json');
  const state = readJsonState(file, validActivity);
  if (state.state === 'MISSING') {
    return { ok: false, status: 'REFUSED', code: 'GENERATION_ACTIVITY_NOT_FOUND' };
  }
  if (state.state !== 'VALID') {
    return { ok: false, status: 'REFUSED', code: 'GENERATION_ACTIVITY_STATE_UNKNOWN' };
  }
  if (state.record.token !== token || state.record.activity_id !== activityId) {
    return { ok: false, status: 'REFUSED', code: 'GENERATION_ACTIVITY_TOKEN_MISMATCH' };
  }
  fs.unlinkSync(file);
  return { ok: true, status: 'RELEASED', activity_id: activityId };
}

export async function withGenerationActivity(options, fn) {
  const activity = beginGenerationActivity(options);
  if (!activity.ok) return activity;
  try {
    return await fn(activity);
  } finally {
    endGenerationActivity({
      activityId: activity.activity_id,
      token: activity.token,
      env: options?.env || process.env,
    });
  }
}

function removeLeaseOwnedBy(token, env) {
  const file = diagnosticLeasePath(env);
  const state = readJsonState(file, validLease);
  if (state.state !== 'VALID' || state.record.token !== token) return false;
  fs.unlinkSync(file);
  return true;
}

export function acquireDiagnosticLease({
  actId,
  holderPid = process.pid,
  env = process.env,
  now = () => new Date().toISOString(),
  token = crypto.randomUUID(),
  processIdentityFn = processIdentity,
  censusFn = legacyGeneratorCensus,
  socketCensusFn = ollamaClientCensus,
} = {}) {
  if (!actId || typeof actId !== 'string') {
    return { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_ACT_ID_REQUIRED' };
  }
  const identity = processIdentityFn(holderPid);
  if (!identity) {
    return { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_HOLDER_PROCESS_NOT_RUNNING' };
  }

  const file = diagnosticLeasePath(env);
  const record = {
    version: DIAGNOSTIC_LEASE_VERSION,
    state: 'HELD',
    act_id: actId,
    holder_pid: Number(holderPid),
    holder_process: identity.process_name || null,
    holder_started_at: identity.start || null,
    holder_process_fingerprint: identity.fingerprint,
    host: os.hostname(),
    acquired_at: now(),
    token,
  };

  try {
    writeExclusiveJson(file, record);
  } catch (error) {
    if (error?.code !== 'EEXIST') {
      return {
        ok: false,
        status: 'REFUSED',
        code: 'DIAGNOSTIC_LEASE_CREATE_FAILED',
        detail: String(error?.message || error),
      };
    }
    const existing = readJsonState(file, validLease);
    if (existing.state !== 'VALID') {
      return { ok: false, status: 'REFUSED', code: 'OLLAMA_DIAGNOSTIC_LEASE_STATE_UNKNOWN' };
    }
    return {
      ok: false,
      status: 'REFUSED',
      code: 'OLLAMA_DIAGNOSTIC_LEASE_ALREADY_HELD',
      lease: publicLease(existing.record),
    };
  }

  let activities;
  let legacy;
  let socketClients;
  try {
    activities = listGenerationActivities({ env });
    legacy = censusFn({ ignorePids: [process.pid, Number(holderPid)] });
    socketClients = socketCensusFn();
  } catch (error) {
    removeLeaseOwnedBy(token, env);
    return {
      ok: false,
      status: 'REFUSED',
      code: 'DIAGNOSTIC_ISOLATION_CENSUS_UNAVAILABLE',
      detail: String(error?.message || error),
    };
  }
  if (activities.valid.length || activities.unknown.length
      || legacy.length || socketClients.length) {
    removeLeaseOwnedBy(token, env);
    return {
      ok: false,
      status: 'REFUSED',
      code: 'REFUSE_LEASE_ACQUISITION',
      active_activity_count: activities.valid.length,
      unknown_activity_count: activities.unknown.length,
      legacy_generators: legacy,
      ollama_socket_clients: socketClients,
    };
  }

  return {
    ok: true,
    status: 'HELD',
    token,
    lease: publicLease(record),
  };
}

export function releaseDiagnosticLease({ token, env = process.env } = {}) {
  if (!token) return { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_LEASE_TOKEN_REQUIRED' };
  const file = diagnosticLeasePath(env);
  const state = readJsonState(file, validLease);
  if (state.state === 'MISSING') {
    return { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_LEASE_NOT_FOUND' };
  }
  if (state.state !== 'VALID') {
    return { ok: false, status: 'REFUSED', code: 'OLLAMA_DIAGNOSTIC_LEASE_STATE_UNKNOWN' };
  }
  if (state.record.token !== token) {
    return { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_LEASE_TOKEN_MISMATCH' };
  }
  fs.unlinkSync(file);
  return { ok: true, status: 'RELEASED', act_id: state.record.act_id };
}

export function recoverDiagnosticLease({
  token,
  reason,
  env = process.env,
  now = () => new Date().toISOString(),
  processIdentityFn = processIdentity,
  censusFn = legacyGeneratorCensus,
  socketCensusFn = ollamaClientCensus,
} = {}) {
  if (!token || !reason || !String(reason).trim()) {
    return { ok: false, status: 'REFUSED', code: 'EXPLICIT_RECOVERY_EVIDENCE_REQUIRED' };
  }
  const file = diagnosticLeasePath(env);
  const state = readJsonState(file, validLease);
  if (state.state !== 'VALID') {
    return {
      ok: false,
      status: 'REFUSED',
      code: state.state === 'MISSING'
        ? 'DIAGNOSTIC_LEASE_NOT_FOUND'
        : 'OLLAMA_DIAGNOSTIC_LEASE_STATE_UNKNOWN',
    };
  }
  if (state.record.token !== token) {
    return { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_LEASE_TOKEN_MISMATCH' };
  }

  const holderNow = processIdentityFn(state.record.holder_pid);
  if (holderNow && holderNow.fingerprint === state.record.holder_process_fingerprint) {
    return { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_LEASE_HOLDER_STILL_ACTIVE' };
  }

  let activities;
  let legacy;
  let socketClients;
  try {
    activities = listGenerationActivities({ env });
    legacy = censusFn({ ignorePids: [process.pid] });
    socketClients = socketCensusFn();
  } catch (error) {
    return {
      ok: false,
      status: 'REFUSED',
      code: 'DIAGNOSTIC_ISOLATION_CENSUS_UNAVAILABLE',
      detail: String(error?.message || error),
    };
  }
  if (activities.valid.length || activities.unknown.length
      || legacy.length || socketClients.length) {
    return {
      ok: false,
      status: 'REFUSED',
      code: 'DIAGNOSTIC_LEASE_RECOVERY_NOT_QUIESCENT',
      active_activity_count: activities.valid.length,
      unknown_activity_count: activities.unknown.length,
      legacy_generators: legacy,
      ollama_socket_clients: socketClients,
    };
  }

  fs.unlinkSync(file);
  const recovery = {
    at: now(),
    event: 'EXPLICIT_DIAGNOSTIC_LEASE_RECOVERY',
    act_id: state.record.act_id,
    prior_holder_pid: state.record.holder_pid,
    prior_token_digest: 'sha256:' + sha256(token),
    reason: String(reason).trim(),
  };
  const recoveryFile = path.join(path.dirname(file), RECOVERY_LOG);
  ensureParent(recoveryFile);
  fs.appendFileSync(recoveryFile, JSON.stringify(recovery) + '\n', { encoding: 'utf8', mode: 0o600 });
  return { ok: true, status: 'RECOVERED', recovery };
}

export function assertDiagnosticLeaseHeld({ token, env = process.env } = {}) {
  const state = readJsonState(diagnosticLeasePath(env), validLease);
  if (state.state !== 'VALID') {
    return {
      ok: false,
      status: 'REFUSED',
      code: state.state === 'MISSING'
        ? 'DIAGNOSTIC_LEASE_NOT_HELD'
        : 'OLLAMA_DIAGNOSTIC_LEASE_STATE_UNKNOWN',
    };
  }
  if (!token || state.record.token !== token) {
    return { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_LEASE_TOKEN_MISMATCH' };
  }
  return { ok: true, status: 'HELD', lease: publicLease(state.record) };
}

export async function withDiagnosticLease(options, fn) {
  const acquired = acquireDiagnosticLease(options);
  if (!acquired.ok) return acquired;
  try {
    return await fn(acquired);
  } finally {
    releaseDiagnosticLease({
      token: acquired.token,
      env: options?.env || process.env,
    });
  }
}

function cliArg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const cmd = process.argv[2];
  let out;
  if (cmd === 'status') {
    out = {
      lease: inspectDiagnosticLease(),
      activities: listGenerationActivities(),
      legacy_generators: legacyGeneratorCensus({ ignorePids: [process.pid] }),
      ollama_socket_clients: ollamaClientCensus(),
    };
  } else if (cmd === 'check-consumer') {
    out = checkGenerationAllowed({ consumer: cliArg('--consumer') || 'cli-consumer' });
  } else if (cmd === 'begin-generation') {
    out = beginGenerationActivity({
      consumer: cliArg('--consumer') || 'cli-consumer',
      providerId: cliArg('--provider'),
      modelId: cliArg('--model'),
    });
  } else if (cmd === 'end-generation') {
    out = endGenerationActivity({
      activityId: cliArg('--activity'),
      token: cliArg('--token'),
    });
  } else if (cmd === 'acquire') {
    const holder = Number(cliArg('--holder-pid'));
    if (!Number.isInteger(holder) || holder <= 0) {
      out = { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_HOLDER_PID_REQUIRED' };
    } else {
      out = acquireDiagnosticLease({ actId: cliArg('--act'), holderPid: holder });
    }
  } else if (cmd === 'release') {
    out = releaseDiagnosticLease({ token: cliArg('--token') });
  } else if (cmd === 'recover') {
    out = recoverDiagnosticLease({
      token: cliArg('--token'),
      reason: cliArg('--reason'),
    });
  } else {
    out = {
      ok: false,
      status: 'REFUSED',
      code: 'USAGE',
      usage: 'jarvis-ollama-generation-lease.mjs {status|check-consumer|begin-generation|end-generation|acquire|release|recover}',
    };
  }
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  if (out?.ok === false) process.exitCode = 23;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
