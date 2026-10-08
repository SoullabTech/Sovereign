/**
 * JEV-INT-05 — pre-live assembly candidate, LOCAL MOCK ONLY.
 *
 * This is not a provider activation path. No remote option, account credential, environment
 * read, auto-resume, operator assignment, or ability to turn on the committed J1 gate exists
 * here. A test-only wire copy may open that gate solely to exercise a literal loopback mock.
 * A later, separately reviewed implementation and founder authorization would be required
 * for any external request.
 */
import { realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute } from 'node:path';
import * as CommittedWire from './jev-wire-v1.mjs';
import { assertDistinctStores, createCheckpointedLedger } from './jev-wire-checkpoint-v1.mjs';
import { createJevHttpTransport } from './jev-wire-http-adapter-v1.mjs';

export const PRELIVE_VERSION = 'JEV-INT-05-PRELIVE.v1';
export const PRELIVE_EXPERIMENT_ID = 'JEV-INT-05-SYNTHETIC-Q_RISK-1';
export const PRELIVE_TABLE_SHA256 = '6bb269d84c674d14730ecd0519ef48caef430e764fde9e32eb2f1f267610064e';
export const PRELIVE_FIXTURE_SHA256 = 'a0f4a26cea085527783a62c8875fdf60f2fed93d1f4ff48d2285ab5288c24f60';
export const PRELIVE_SCHEMA_SHA256 = 'a191f8a7df6bd6fedced8120dd0fd106f88575d1d1c8360d08900a6c7c0360d5';
const DUMMY_ONLY = 'JEV-INT05-SYNTHETIC-DUMMY-NOT-A-PROVIDER-KEY';

const fail = (reason) => { throw new Error(reason); };
const refuse = (reason) => Object.freeze({ sent: false, reason });
const safeDevice = (x) => Number.isSafeInteger(x) && x > 0;

function verifyPinnedWire(wire) {
  const shape = wire?.RESPONSE_SHAPE;
  const q = wire?.QUESTION_TABLE;
  const budget = wire?.BUDGET;
  if (!shape || !q || !budget || q.table_version !== 'jev-wire-q2' ||
      q.model !== 'jev-1.13.0' || shape.schema_sha256 !== PRELIVE_SCHEMA_SHA256 ||
      budget.max_attempts !== 31 || budget.ceiling_usd !== 1 ||
      budget.reserve_usd !== 0.005 || budget.timeout_ms !== 30_000 ||
      budget.usd_per_input_token !== 0.042 / 1_000_000 ||
      typeof wire.canonicalJson !== 'function' || typeof wire.sha256Hex !== 'function' ||
      typeof wire.fixtureListHash !== 'function' || typeof wire.fixtureAttemptIds !== 'function' ||
      typeof wire.createLedger !== 'function' || typeof wire.runAttempt !== 'function' ||
      typeof wire.planAttempt !== 'function') fail('PRELIVE_WIRE_BINDING');
  // The ONLY permitted test variant changes witnessed:true, never the table or response fields.
  const normalizedTable = { ...q, response_shape: { ...q.response_shape, witnessed: false } };
  if (wire.sha256Hex(wire.canonicalJson(normalizedTable)) !== PRELIVE_TABLE_SHA256 ||
      wire.fixtureListHash() !== PRELIVE_FIXTURE_SHA256 ||
      wire.fixtureAttemptIds().length !== 31) fail('PRELIVE_WIRE_BINDING');
}

function validateLoopbackEndpoint(endpoint) {
  let u;
  try { u = new URL(endpoint); } catch { return fail('PRELIVE_LOOPBACK_ONLY'); }
  if (u.protocol !== 'http:' || u.hostname !== '127.0.0.1' ||
      !u.port || u.pathname !== '/v1/systemone' ||
      u.username || u.password || u.search || u.hash) fail('PRELIVE_LOOPBACK_ONLY');
  return u.toString();
}

function checkStorage(config) {
  try {
    if (!isAbsolute(config.ledgerPath) || !isAbsolute(config.checkpointPath))
      return { ok: false, reason: 'PRELIVE_ABSOLUTE_PATHS_REQUIRED' };
    assertDistinctStores(config.ledgerPath, config.checkpointPath);
    const ld = realpathSync(dirname(config.ledgerPath));
    const cd = realpathSync(dirname(config.checkpointPath));
    const ls = statSync(ld); const cs = statSync(cd);
    if (!ls.isDirectory() || !cs.isDirectory()) return { ok: false, reason: 'PRELIVE_STORAGE_UNAVAILABLE' };
    if (config.requireDistinctDevices && ls.dev === cs.dev)
      return { ok: false, reason: 'PRELIVE_STORES_NOT_INDEPENDENT' };
    if ((config.expectedLedgerDevice !== undefined && ls.dev !== config.expectedLedgerDevice) ||
        (config.expectedCheckpointDevice !== undefined && cs.dev !== config.expectedCheckpointDevice))
      return { ok: false, reason: 'PRELIVE_MOUNT_IDENTITY_CHANGED' };
    return { ok: true, ledger_device: ls.dev, checkpoint_device: cs.dev,
      devices_distinct: ls.dev !== cs.dev, live_approved: false };
  } catch (e) {
    if (e?.message === 'PAIR_PATH_COLLISION') return { ok: false, reason: 'PAIR_PATH_COLLISION' };
    return { ok: false, reason: 'PRELIVE_STORAGE_UNAVAILABLE' };
  }
}

export function createJevPreliveWrapper({
  ledgerPath, checkpointPath, loopbackEndpoint = null, enableLocalMock = false,
  requireDistinctDevices = true, expectedLedgerDevice, expectedCheckpointDevice,
  timeoutMs = CommittedWire.BUDGET.timeout_ms,
} = {}, { wire = CommittedWire } = {}) {
  if (CommittedWire.RESPONSE_SHAPE.witnessed !== false) fail('PRELIVE_COMMITTED_GATE_CHANGED');
  if (typeof ledgerPath !== 'string' || typeof checkpointPath !== 'string' ||
      !isAbsolute(ledgerPath) || !isAbsolute(checkpointPath)) fail('PRELIVE_ABSOLUTE_PATHS_REQUIRED');
  if (typeof enableLocalMock !== 'boolean' || typeof requireDistinctDevices !== 'boolean' ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 30_000)
    fail('PRELIVE_CONFIG_INVALID');
  if ((expectedLedgerDevice !== undefined && !safeDevice(expectedLedgerDevice)) ||
      (expectedCheckpointDevice !== undefined && !safeDevice(expectedCheckpointDevice)))
    fail('PRELIVE_CONFIG_INVALID');
  if (requireDistinctDevices && (!safeDevice(expectedLedgerDevice) || !safeDevice(expectedCheckpointDevice)))
    fail('PRELIVE_DEVICE_PINS_REQUIRED');
  if (loopbackEndpoint !== null) validateLoopbackEndpoint(loopbackEndpoint);
  if (enableLocalMock && loopbackEndpoint === null) fail('PRELIVE_LOOPBACK_ONLY');
  verifyPinnedWire(wire);

  const config = Object.freeze({ ledgerPath, checkpointPath, requireDistinctDevices,
    expectedLedgerDevice, expectedCheckpointDevice });
  const ledger = wire.createLedger(ledgerPath, { experiment_id: PRELIVE_EXPERIMENT_ID });
  const pair = createCheckpointedLedger(ledger, checkpointPath);
  const transport = enableLocalMock
    ? createJevHttpTransport({ endpoint: loopbackEndpoint, credential: DUMMY_ONLY,
      allowRemote: false, timeoutMs, maxResponseBytes: 65_536 })
    : null;

  const placement = () => Object.freeze(checkStorage(config));
  const assertReady = () => {
    const p = placement();
    if (!p.ok) fail(p.reason);
    return p;
  };
  const initialization = ({ acknowledgeFreshSyntheticExperiment = false } = {}) => {
    if (!enableLocalMock) fail('PRELIVE_INACTIVE');
    if (!acknowledgeFreshSyntheticExperiment) fail('PRELIVE_EXPLICIT_INIT_REQUIRED');
    assertReady();
    pair.initialize(); // never reset history; no automatic establishment or resume
    return Object.freeze({ initialized: true, mode: 'LOCAL_MOCK_ONLY',
      experiment_id: PRELIVE_EXPERIMENT_ID });
  };

  async function run(attemptId) {
    if (!enableLocalMock) return refuse('PRELIVE_INACTIVE');
    // The production module remains OFF. Only temporary test copies may exercise a loopback server.
    if (wire.RESPONSE_SHAPE.witnessed !== true) return refuse('RESPONSE_SHAPE_UNWITNESSED');
    const place = placement();
    if (!place.ok) return refuse(place.reason);
    if (!wire.fixtureAttemptIds().includes(attemptId)) return refuse('NOT_IN_ALLOWLIST');
    // The existing runner performs the ledger reservation under a lock; the checkpoint wrapper
    // anchors that reservation before calling send. Recheck mounts and pairing AT send.
    const guardedTransport = {
      async send(bytes, opts) {
        const current = placement();
        if (!current.ok) throw new Error(current.reason);
        const pairStatus = pair.verify();
        if (!pairStatus.consistent) throw new Error('PRELIVE_PAIR_NOT_CONSISTENT');
        const records = pair.read();
        const last = records.at(-1);
        if (!last || last.kind !== 'reserved' || last.attempt_id !== attemptId ||
            last.wire_body_hash !== opts.bodyHash) throw new Error('PRELIVE_RESERVATION_MISMATCH');
        return transport.send(bytes, opts);
      },
    };
    return wire.runAttempt({ attemptId, ledger: pair, transport: guardedTransport, timeoutMs });
  }

  return Object.freeze({
    mode: enableLocalMock ? 'LOCAL_MOCK_ONLY' : 'INACTIVE',
    external_calls_authorized: false,
    activation_ready: false,
    experiment_id: PRELIVE_EXPERIMENT_ID,
    preflight: placement,
    initialize: initialization,
    run,
  });
}
