/**
 * JARVIS-JEV-01 / JEV-INT-05 — DEFAULT-DISABLED live-run wrapper for the synthetic Q_RISK connection experiment.
 *
 * STATUS: CANDIDATE. Tested against a loopback mock with dummy credentials only. It is a LIBRARY: it has no command line,
 * reads no environment, no file for a credential, and nothing in the repository calls it. It cannot run the experiment by itself:
 *
 *   OFF-SWITCH   `RESPONSE_SHAPE.witnessed` (in jev-wire-v1.mjs) is false in the committed code. This wrapper READS it and refuses
 *                before it touches a store, a credential or a transport. It never assigns it. Opening it is a reviewed source change.
 *   GRANT        A run needs an execution grant document that (a) is in state AUTHORIZED, (b) names exactly this experiment, provider,
 *                model, endpoint, question-table hash, fixture-list hash and response-schema hash, (c) can only NARROW the code's caps
 *                (31 attempts, $1.00), (d) is inside its validity window, and (e) is CONFIRMED by the operator passing the grant's own
 *                SHA-256. The wrapper cannot prove a human ratified the grant; it can only refuse a document that does not match.
 *   STORAGE      Ledger and checkpoint directories are preflighted (real directories, not links, writable, enough space, no path
 *                collisions, no stale locks). Real runs must be on DISTINCT devices and the checkpoint must sit under a verified MOUNT POINT
 *                (a directory on the wrong volume because a drive was not mounted is refused). A same-device layout is accepted only
 *                for a loopback-only mock run.
 *   MODES        `initialize` needs both stores absent; `resume` needs both present, consistent, not halted, nothing unresolved. The wrapper
 *                never resumes, repairs, re-initializes or removes a lock on its own.
 *   EXECUTION    Attempts run strictly one at a time in the frozen order through the checkpointed runner; the run stops at the first
 *                non-ok outcome, at the grant's attempt or spend ceiling, at grant expiry, or when the stores stop agreeing.
 *   CREDENTIAL   Supplied by the caller as a function; called only at send time by the adapter; never logged or returned.
 */
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, realpathSync, statSync, statfsSync, accessSync, constants as fsConstants } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import {
  BUDGET, QUESTION_TABLE, RESPONSE_SHAPE, canonicalJson, createLedger, fixtureAttemptIds, fixtureListHash, questionTableHash,
  runAttempt, sha256Hex,
} from './jev-wire-v1.mjs';
import { assertDistinctStores, createCheckpointedLedger } from './jev-wire-checkpoint-v1.mjs';
import { PINNED_REMOTE, createJevHttpTransport } from './jev-wire-http-adapter-v1.mjs';

export const GRANT_INSTRUMENT = 'jev-int05-execution-grant/v1';
export const GRANT_MEMBERS = Object.freeze([
  'instrument', 'state', 'experiment_id', 'provider_id', 'model', 'endpoint', 'network', 'table_hash', 'fixture_list_hash',
  'schema_sha256', 'max_attempts', 'ceiling_usd', 'not_before', 'expires_at', 'volume_policy', 'operator', 'authorized_by', 'authorization_ref',
]);
export const MAX_WINDOW_MS = 7 * 24 * 3600 * 1000;
export const MIN_FREE_BYTES = 64 * 1024 * 1024;
const PROVIDER_ID = 'typesafe-jev';
const PINNED_ENDPOINT = `${PINNED_REMOTE.protocol}//${PINNED_REMOTE.hostname}${PINNED_REMOTE.pathname}`;

export const grantHash = (grant) => createHash('sha256').update(canonicalJson(grant)).digest('hex');

const ok = (id, detail) => ({ id, ok: true, detail });
const no = (id, detail) => ({ id, ok: false, detail });
const exactMembers = (o) => o && typeof o === 'object' && !Array.isArray(o)
  && Object.keys(o).length === GRANT_MEMBERS.length && GRANT_MEMBERS.every((m) => Object.hasOwn(o, m));
const isoMs = (v) => (typeof v === 'string' && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(v) ? Date.parse(v) : NaN);

/** Checks the grant against the code's own identities. Pure; reads nothing from disk. */
export function checkGrant(grant, { now }) {
  const checks = [];
  const push = (c) => { checks.push(c); return c.ok; };
  if (!push(exactMembers(grant) ? ok('GRANT_SHAPE') : no('GRANT_SHAPE', 'exact member set required'))) return checks;
  if (!push(grant.instrument === GRANT_INSTRUMENT ? ok('GRANT_INSTRUMENT') : no('GRANT_INSTRUMENT'))) return checks;
  if (!push(grant.state === 'AUTHORIZED' ? ok('GRANT_STATE') : no('GRANT_STATE', 'state must be AUTHORIZED'))) return checks;
  if (!push(typeof grant.experiment_id === 'string' && /^JEV-INT-05-[A-Z0-9-]{3,40}$/.test(grant.experiment_id) ? ok('EXPERIMENT_ID') : no('EXPERIMENT_ID'))) return checks;
  if (!push(grant.provider_id === PROVIDER_ID ? ok('PROVIDER') : no('PROVIDER'))) return checks;
  if (!push(grant.model === QUESTION_TABLE.model ? ok('MODEL') : no('MODEL', 'model must equal the pinned model'))) return checks;
  if (!push(grant.table_hash === questionTableHash() ? ok('TABLE_HASH') : no('TABLE_HASH', 'question table differs from the one authorized'))) return checks;
  if (!push(grant.fixture_list_hash === fixtureListHash() ? ok('FIXTURE_HASH') : no('FIXTURE_HASH'))) return checks;
  if (!push(grant.schema_sha256 === RESPONSE_SHAPE.schema_sha256 ? ok('SCHEMA_HASH') : no('SCHEMA_HASH'))) return checks;
  if (!push(Number.isSafeInteger(grant.max_attempts) && grant.max_attempts >= 1 && grant.max_attempts <= BUDGET.max_attempts
    ? ok('ATTEMPT_CAP') : no('ATTEMPT_CAP', `1..${BUDGET.max_attempts}`))) return checks;
  if (!push(typeof grant.ceiling_usd === 'number' && Number.isFinite(grant.ceiling_usd) && grant.ceiling_usd > 0 && grant.ceiling_usd <= BUDGET.ceiling_usd
    ? ok('SPEND_CAP') : no('SPEND_CAP', `0..${BUDGET.ceiling_usd}`))) return checks;
  const from = isoMs(grant.not_before); const to = isoMs(grant.expires_at); const t = now();
  if (!push(Number.isFinite(from) && Number.isFinite(to) && to > from && to - from <= MAX_WINDOW_MS ? ok('WINDOW_SHAPE') : no('WINDOW_SHAPE', 'valid ISO window of at most 7 days'))) return checks;
  if (!push(t >= from && t < to ? ok('WINDOW_OPEN') : no('WINDOW_OPEN', 'outside the grant validity window'))) return checks;
  if (!push(['DISTINCT_DEVICES', 'SAME_DEVICE_MOCK_ONLY'].includes(grant.volume_policy) ? ok('VOLUME_POLICY') : no('VOLUME_POLICY'))) return checks;
  if (!push(['EXTERNAL_PINNED', 'LOOPBACK_ONLY'].includes(grant.network) ? ok('NETWORK') : no('NETWORK'))) return checks;
  const coherent = grant.network === 'EXTERNAL_PINNED'
    ? grant.endpoint === PINNED_ENDPOINT && grant.volume_policy === 'DISTINCT_DEVICES'
    : /^http:\/\/(127\.0\.0\.1|localhost|\[::1\]):\d+\/[^?#]*$/.test(String(grant.endpoint));
  if (!push(coherent ? ok('ENDPOINT_COHERENT') : no('ENDPOINT_COHERENT', 'EXTERNAL_PINNED needs the pinned endpoint and distinct devices; LOOPBACK_ONLY needs a loopback URL'))) return checks;
  if (!push(grant.volume_policy === 'SAME_DEVICE_MOCK_ONLY' && grant.network !== 'LOOPBACK_ONLY'
    ? no('MOCK_VOLUMES_ONLY_WITH_LOOPBACK', 'a same-device layout is only for a loopback mock') : ok('MOCK_VOLUMES_ONLY_WITH_LOOPBACK'))) return checks;
  push(['operator', 'authorized_by', 'authorization_ref'].every((k) => typeof grant[k] === 'string' && grant[k].trim() !== '')
    ? ok('NAMES_RECORDED') : no('NAMES_RECORDED', 'operator, authorized_by and authorization_ref must be named'));
  return checks;
}

const dirOk = (path) => {
  try { const l = lstatSync(path); return l.isDirectory() && !l.isSymbolicLink(); } catch { return false; }
};

/** Read-only storage preflight (no file is created). */
export function checkStorage({ ledgerPath, checkpointPath, volumePolicy, checkpointMountPoint, minFreeBytes = MIN_FREE_BYTES }) {
  const checks = [];
  const push = (c) => { checks.push(c); return c.ok; };
  // the stated floor cannot be lowered or disabled by a caller (0, NaN, negatives, fractions, strings all refuse)
  if (!push(Number.isSafeInteger(minFreeBytes) && minFreeBytes >= MIN_FREE_BYTES
    ? ok('MIN_FREE_FLOOR') : no('MIN_FREE_FLOOR', `minimum free space must be a safe integer of at least ${MIN_FREE_BYTES} bytes`))) return checks;
  const ledgerDir = dirname(resolve(ledgerPath)); const cpDir = dirname(resolve(checkpointPath));
  if (!push(dirOk(ledgerDir) ? ok('LEDGER_DIR') : no('LEDGER_DIR', 'must be an existing directory, not a link'))) return checks;
  if (!push(dirOk(cpDir) ? ok('CHECKPOINT_DIR') : no('CHECKPOINT_DIR', 'must be an existing directory, not a link'))) return checks;
  for (const [id, d] of [['LEDGER_WRITABLE', ledgerDir], ['CHECKPOINT_WRITABLE', cpDir]]) {
    let writable = true; try { accessSync(d, fsConstants.W_OK); } catch { writable = false; }
    if (!push(writable ? ok(id) : no(id))) return checks;
  }
  let distinct = true; try { assertDistinctStores(ledgerPath, checkpointPath); } catch { distinct = false; }
  if (!push(distinct ? ok('PATHS_DISTINCT') : no('PATHS_DISTINCT', 'ledger and checkpoint paths collide or alias'))) return checks;
  const lDev = statSync(ledgerDir).dev; const cDev = statSync(cpDir).dev;
  if (volumePolicy === 'DISTINCT_DEVICES') {
    if (!push(lDev !== cDev ? ok('DEVICES_DISTINCT') : no('DEVICES_DISTINCT', 'ledger and checkpoint share one device'))) return checks;
    // mount-point proof: the named mount point must exist, be a real mount (device differs from its parent) and contain the checkpoint dir
    let mounted = false;
    try {
      const mp = resolve(String(checkpointMountPoint));
      const rel = relative(mp, cpDir);
      const inside = rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
      mounted = typeof checkpointMountPoint === 'string' && dirOk(mp) && statSync(mp).dev !== statSync(dirname(mp)).dev && statSync(mp).dev === cDev && inside;
    } catch { mounted = false; }
    if (!push(mounted ? ok('CHECKPOINT_MOUNTED') : no('CHECKPOINT_MOUNTED', 'checkpoint directory is not under a verified mount point'))) return checks;
  } else if (!push(volumePolicy === 'SAME_DEVICE_MOCK_ONLY' ? ok('MOCK_LAYOUT') : no('VOLUME_POLICY'))) return checks;
  for (const [id, d] of [['LEDGER_SPACE', ledgerDir], ['CHECKPOINT_SPACE', cpDir]]) {
    let free = 0; try { const f = statfsSync(d); free = Number(f.bavail) * Number(f.bsize); } catch { free = 0; }
    if (!push(free >= minFreeBytes ? ok(id) : no(id, `needs at least ${minFreeBytes} bytes free`))) return checks;
  }
  push(!existsSync(ledgerPath + '.lock') && !existsSync(ledgerPath + '.pair.lock')
    ? ok('NO_LOCKS') : no('NO_LOCKS', 'a lock file is present: inspect per the runbook; it is never removed automatically'));
  return checks;
}

/** The physical identity of the two store directories (and mount point) as first verified. Content-free. */
export function captureStorageIdentity({ ledgerPath, checkpointPath, checkpointMountPoint, volumePolicy }) {
  const ledgerDir = dirname(resolve(ledgerPath)); const cpDir = dirname(resolve(checkpointPath));
  const id = (d) => { const st = statSync(d); return { real: realpathSync(d), dev: st.dev, ino: st.ino }; };
  const snap = { volumePolicy, ledger: id(ledgerDir), checkpoint: id(cpDir), mount: null };
  if (volumePolicy === 'DISTINCT_DEVICES') snap.mount = { path: resolve(String(checkpointMountPoint)), ...id(resolve(String(checkpointMountPoint))) };
  return Object.freeze(snap);
}

/**
 * Re-proves, against the captured identity, that the stores are still where and what they were: same real path, device and inode,
 * still real non-link directories, still on distinct devices with the checkpoint under a genuine mount point. Any change,
 * replacement, symlink, remount or unavailability refuses (conservatively); it never repairs.
 */
export function verifyStorageIdentity(snap, { ledgerPath, checkpointPath, minFreeBytes = MIN_FREE_BYTES }) {
  try {
    const ledgerDir = dirname(resolve(ledgerPath)); const cpDir = dirname(resolve(checkpointPath));
    if (!dirOk(ledgerDir) || !dirOk(cpDir)) return false;
    const same = (d, c) => { const st = statSync(d); return realpathSync(d) === c.real && st.dev === c.dev && st.ino === c.ino; };
    if (!same(ledgerDir, snap.ledger) || !same(cpDir, snap.checkpoint)) return false;
    if (snap.volumePolicy === 'DISTINCT_DEVICES') {
      if (snap.ledger.dev === statSync(cpDir).dev) return false;
      const mp = snap.mount.path;
      if (!dirOk(mp) || !same(mp, snap.mount)) return false;
      if (statSync(mp).dev === statSync(dirname(mp)).dev || statSync(mp).dev !== statSync(cpDir).dev) return false;
      const rel = relative(mp, cpDir); if (!(rel === '' || (!rel.startsWith('..') && !isAbsolute(rel)))) return false;
    }
    for (const d of [ledgerDir, cpDir]) { const f = statfsSync(d); if (Number(f.bavail) * Number(f.bsize) < minFreeBytes) return false; }
    return true;
  } catch { return false; }
}

/**
 * Which transport factory a grant may use. A real-provider grant ALWAYS gets the reviewed hardened adapter: an injected factory
 * could return fabricated replies and record them as provider observations, so it is refused outright. Injection is only for
 * explicit loopback-mock runs.
 */
export function resolveTransportFactory(grant, deps = {}) {
  if (grant.network === 'EXTERNAL_PINNED') {
    if (deps.createTransport !== undefined) throw new Error('TRANSPORT_INJECTION_REFUSED');
    return createJevHttpTransport;
  }
  return deps.createTransport ?? createJevHttpTransport;
}

/**
 * Every precondition, in order, fail-fast. Reads only (the optional consistency check for `resume` takes and releases the pair lock).
 * Order matters: the off-switch is evaluated BEFORE anything touches a credential, a transport or a store.
 */
export function preflight({ grant, confirmGrantHash, ledgerPath, checkpointPath, checkpointMountPoint, mode, minFreeBytes }, { now = () => Date.now() } = {}) {
  const checks = [];
  const stop = (c) => { checks.push(c); return { ok: false, refusal: c.id, checks }; };
  if (RESPONSE_SHAPE.witnessed !== true) return stop(no('OFF_SWITCH_CLOSED', 'the committed response-shape gate is closed; opening it is a reviewed source change'));
  checks.push(ok('OFF_SWITCH_OPEN'));
  const g = checkGrant(grant, { now });
  checks.push(...g);
  const bad = g.find((c) => !c.ok); if (bad) return { ok: false, refusal: bad.id, checks };
  const h = grantHash(grant);
  if (confirmGrantHash !== h) return stop(no('OPERATOR_CONFIRMATION', 'confirmGrantHash must equal the SHA-256 of the exact grant'));
  checks.push(ok('OPERATOR_CONFIRMATION', h));
  const st = checkStorage({ ledgerPath, checkpointPath, volumePolicy: grant.volume_policy, checkpointMountPoint, minFreeBytes });
  checks.push(...st);
  const badSt = st.find((c) => !c.ok); if (badSt) return { ok: false, refusal: badSt.id, checks };
  const ledgerThere = existsSync(ledgerPath); const cpThere = existsSync(checkpointPath);
  if (mode === 'initialize') {
    if (ledgerThere || cpThere) return stop(no('STORES_MUST_BE_ABSENT', 'initialize refuses if either store exists'));
    checks.push(ok('STORES_ABSENT'));
  } else if (mode === 'resume') {
    if (!ledgerThere || !cpThere) return stop(no('STORES_MUST_EXIST', 'resume refuses if either store is missing; it never initializes'));
    try {
      const pair = createCheckpointedLedger(createLedger(ledgerPath, { experiment_id: grant.experiment_id }), checkpointPath);
      const v = pair.verify();
      if (!v.consistent) return stop(no('STORES_INCONSISTENT', `ledger is ahead of the checkpoint by ${v.ahead}; an explicit resume() by the operator is required`));
      const s = pair.state();
      if (s.halted) return stop(no('RUN_HALTED', s.stop_reasons.join(',')));
      if (s.unresolved.length) return stop(no('RUN_UNRESOLVED', s.unresolved.join(',')));
    } catch (e) {
      return stop(no(/^(PAIR_|LEDGER_|LOCK_)/.test(e.message) ? e.message : 'STORES_UNREADABLE'));
    }
    checks.push(ok('STORES_CONSISTENT'));
  } else return stop(no('MODE', "mode must be 'initialize' or 'resume'"));
  return { ok: true, refusal: null, checks, grant_sha256: h };
}

/**
 * Runs the approved attempts. Returns a content-free summary. Never throws for an expected refusal.
 * deps: { credential: () => string, createTransport?: (opts) => transport, now?: () => number }
 */
export async function executeLiveRun(config, deps = {}) {
  const now = deps.now ?? (() => Date.now());
  const report = preflight(config, { now });
  if (!report.ok) return Object.freeze({ ran: false, refusal: report.refusal, checks: report.checks, attempts: [] });
  const { grant, ledgerPath, checkpointPath, mode } = config;
  let makeTransport;
  try { makeTransport = resolveTransportFactory(grant, deps); } catch (e) {
    return Object.freeze({ ran: false, refusal: e.message, checks: report.checks, attempts: [] });
  }
  let identity;
  try { identity = captureStorageIdentity({ ledgerPath, checkpointPath, checkpointMountPoint: config.checkpointMountPoint, volumePolicy: grant.volume_policy }); } catch {
    return Object.freeze({ ran: false, refusal: 'STORAGE_IDENTITY_UNAVAILABLE', checks: report.checks, attempts: [] });
  }
  const minFree = config.minFreeBytes ?? MIN_FREE_BYTES;
  const storageSame = () => verifyStorageIdentity(identity, { ledgerPath, checkpointPath, minFreeBytes: minFree });
  let transport;
  try {                                           // built BEFORE any store exists, so a configuration fault leaves nothing behind
    transport = makeTransport({ endpoint: grant.endpoint, credential: deps.credential, allowRemote: grant.network === 'EXTERNAL_PINNED' });
  } catch (e) {
    return Object.freeze({ ran: false, refusal: /^ADAPTER_/.test(String(e && e.message)) ? e.message : 'TRANSPORT_CONSTRUCTION', checks: report.checks, attempts: [] });
  }
  const base = createLedger(ledgerPath, { experiment_id: grant.experiment_id });
  const pair = createCheckpointedLedger(base, checkpointPath);
  if (mode === 'initialize') {
    try { pair.initialize(); } catch (e) {
      return Object.freeze({ ran: false, refusal: /^(PAIR_|LEDGER_|LOCK_)/.test(String(e && e.message)) ? e.message : 'INITIALIZE_FAILED', checks: report.checks, attempts: [] });
    }
  }

  const attempts = []; let stopped = null; let historyLost = false; let dispatchRefused = false;
  const toRun = fixtureAttemptIds();
  // the same check runs again immediately before dispatch; a refusal there is recorded by the runner as crossing-unknown (conservative: nothing was sent)
  const guarded = { send: (bodyJson, opts) => {
    if (!storageSame()) { dispatchRefused = true; return Promise.reject(new Error('STORAGE_CHANGED')); }
    return transport.send(bodyJson, opts);
  } };
  try {
    for (const id of toRun) {
      if (!storageSame()) { stopped = 'STORAGE_CHANGED'; break; }
      const before = pair.state();
      if (before.used.has(id)) continue;
      if (before.attempts >= grant.max_attempts) { stopped = 'GRANT_ATTEMPT_CAP'; break; }
      if (before.usd + BUDGET.reserve_usd > grant.ceiling_usd) { stopped = 'GRANT_SPEND_CAP'; break; }
      if (now() >= Date.parse(grant.expires_at)) { stopped = 'GRANT_EXPIRED'; break; }
      const r = await runAttempt({ attemptId: id, ledger: pair, transport: guarded, now });
      attempts.push(Object.freeze({ id, sent: r.sent, outcome: r.outcome ?? null, reason: r.reason ?? null }));
      if (r.outcome !== 'ok') { stopped = dispatchRefused ? 'STORAGE_CHANGED' : (r.reason ?? r.outcome ?? 'NOT_SENT'); break; }
      let consistent = false; try { consistent = pair.verify().consistent; } catch { consistent = false; }
      if (!consistent) { stopped = 'STORES_DISAGREE'; break; }
    }
  } catch {
    // history became unavailable mid-run: stop with a sanitized, structured result. Nothing is created, repaired or resent, and no
    // claim is made that the in-flight observation was persisted.
    historyLost = true; stopped = 'HISTORY_UNAVAILABLE';
  }
  let final = null; try { final = pair.state(); } catch { historyLost = true; stopped = stopped ?? 'HISTORY_UNAVAILABLE'; }
  if (historyLost || !final) {
    return Object.freeze({
      ran: true, refusal: null, checks: report.checks, grant_sha256: report.grant_sha256, attempts,
      stopped_reason: 'HISTORY_UNAVAILABLE', completed: false, ledger_head: null, usd: null, halted: true,
    });
  }
  return Object.freeze({
    ran: true, refusal: null, checks: report.checks, grant_sha256: report.grant_sha256, attempts,
    stopped_reason: stopped, completed: final.used.size === toRun.length && !final.halted && final.unresolved.length === 0,
    ledger_head: final.head, usd: final.usd, halted: final.halted,
  });
}
