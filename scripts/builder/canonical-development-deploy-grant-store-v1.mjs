/**
 * D7 append-only one-shot deployment grant store.
 */
import {
  appendFileSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createDevelopmentDeployGrantV1 } from './canonical-development-deploy-v1.mjs';

const HOME = (home) => home
  || process.env.AIN_DELEGATION_HOME
  || path.join(os.homedir(), '.claude', 'ain-delegation');
const STORE = (home) => path.join(HOME(home), 'work-units-v2', 'deploy-grants');

function safeId(value) {
  return /^[a-z0-9][a-z0-9-]{2,127}$/i.test(String(value || ''));
}
function ledgerPath(id, home) {
  if (!safeId(id)) throw new Error('invalid deploy identity');
  return path.join(STORE(home), id + '.jsonl');
}
function withLock(id, { home } = {}, fn) {
  const lock = ledgerPath(id, home) + '.lock';
  mkdirSync(path.dirname(lock), { recursive: true });
  let fd;
  try {
    fd = openSync(lock, 'wx', 0o600);
    closeSync(fd);
  } catch (error) {
    if (error?.code === 'EEXIST') return { ok: false, status: 'REFUSED', reason: 'DEPLOY_GRANT_LEDGER_BUSY' };
    throw error;
  }
  try { return fn(); }
  finally { try { unlinkSync(lock); } catch (error) { if (error?.code !== 'ENOENT') throw error; } }
}
function readEvents(id, { home } = {}) {
  const file = ledgerPath(id, home);
  if (!existsSync(file)) return [];
  const out = [];
  let line = 0;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    line += 1;
    if (!raw.trim()) continue;
    try { out.push(JSON.parse(raw)); }
    catch { throw new Error('DEVELOPMENT_DEPLOY_GRANT_LEDGER_CORRUPT at line ' + line); }
  }
  return out;
}
function append(id, event, { home } = {}) {
  const file = ledgerPath(id, home);
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(event) + '\n', { mode: 0o600 });
}
function grantStream(events, grantId) {
  return events.filter((e) => e?.grant?.grant_id === grantId || e?.grant_id === grantId);
}
function standing(events, grantId) {
  const stream = grantStream(events, grantId);
  const grant = stream.find((e) => e.event === 'ISSUED')?.grant || null;
  if (!grant) return { exists: false, standing: 'MISSING', grant: null, events: [] };
  let state = 'ACTIVE';
  for (const event of stream) {
    if (event.event === 'CLAIMED') state = 'CLAIMED';
    if (event.event === 'CONSUMED') state = 'CONSUMED';
    if (event.event === 'REVOKED') state = 'REVOKED';
    if (event.event === 'INVALIDATED') state = 'INVALIDATED';
  }
  return { exists: true, standing: state, grant, events: stream };
}
export function deploymentGrantStandingV1(deployIdentity, grantId, { home } = {}) {
  return standing(readEvents(deployIdentity, { home }), grantId);
}
function unresolved(id, { home } = {}) {
  const events = readEvents(id, { home });
  for (const event of events.filter((e) => e.event === 'ISSUED')) {
    const s = standing(events, event.grant.grant_id);
    if (['ACTIVE', 'CLAIMED'].includes(s.standing)) return s;
  }
  return null;
}
export function issueDevelopmentDeployGrantV1(prepared, {
  home,
  actor_id,
  issued_at = new Date().toISOString(),
} = {}) {
  if (!prepared?.ok || !prepared.preview?.merge_commit_sha) {
    return { ok: false, status: 'REFUSED', reason: 'DEPLOY_PREVIEW_REQUIRED' };
  }
  const id = 'pr-' + prepared.preview.pull_request_number + '-' + prepared.preview.merge_commit_sha.slice(0, 12);
  return withLock(id, { home }, () => {
    const prior = unresolved(id, { home });
    if (prior) return { ok: false, status: 'REFUSED', reason: 'UNRESOLVED_DEPLOY_GRANT_EXISTS', standing: prior.standing };
    const events = readEvents(id, { home });
    const sequence = events.filter((e) => e.event === 'ISSUED').length + 1;
    const made = createDevelopmentDeployGrantV1(prepared, {
      sequence,
      actor_id,
      issued_at,
    });
    if (!made.ok) return { ...made, reason: made.blockers?.[0]?.code || 'DEPLOY_GRANT_CREATION_REFUSED' };
    append(id, { event: 'ISSUED', at: issued_at, grant: made.grant }, { home });
    return { ok: true, status: 'AUTHORIZED_ONCE', standing: 'ACTIVE', deploy_identity: id, grant: made.grant };
  });
}
export function claimDevelopmentDeployGrantV1(deployIdentity, grantId, {
  home,
  at = new Date().toISOString(),
} = {}) {
  return withLock(deployIdentity, { home }, () => {
    const current = deploymentGrantStandingV1(deployIdentity, grantId, { home });
    if (!current.exists) return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
    if (current.standing !== 'ACTIVE') return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_ACTIVE', standing: current.standing };
    append(deployIdentity, { event: 'CLAIMED', at, grant_id: grantId }, { home });
    return { ok: true, status: 'CLAIMED', grant: current.grant };
  });
}
export function consumeDevelopmentDeployGrantV1(deployIdentity, grantId, {
  home,
  at = new Date().toISOString(),
  outcome = 'deployment_attempted',
} = {}) {
  return withLock(deployIdentity, { home }, () => {
    const current = deploymentGrantStandingV1(deployIdentity, grantId, { home });
    if (!current.exists) return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
    if (current.standing !== 'CLAIMED') return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_CLAIMED', standing: current.standing };
    append(deployIdentity, { event: 'CONSUMED', at, grant_id: grantId, outcome }, { home });
    return { ok: true, status: 'CONSUMED', grant: current.grant };
  });
}
