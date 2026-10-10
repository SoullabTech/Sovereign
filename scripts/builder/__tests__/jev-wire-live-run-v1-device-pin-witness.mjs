#!/usr/bin/env node
/**
 * JEV-INT-05 — bounded TEST-ONLY storage device-pin witness.
 *
 * Uses three genuine device identities (Mac temp, T7, LaCie), but only
 * WRITES on the authorized Mac/T7 mounts: LaCie is readable but this account
 * cannot create a disposable test directory there. NEVER unmount/remount. An isolated in-memory source copy injects
 * synthetic drift ONLY into the final admitted-device comparison;
 * every preflight/mount/free-space check continues to use the real fs.
 * Two negative controls remove one pin comparison at a time and must
 * expose a local mock HTTP send. Nothing changes committed wrapper bytes.
 *
 * Required: JEV_TEST_SECOND_DEVICE_ROOT, JEV_TEST_THIRD_DEVICE_ROOT.
 * No real credentials, endpoints, member data, or grant authorization.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync,
  realpathSync, rmSync, statfsSync, statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeVariant } from './jev-wire-variant-lib.mjs';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'jev-wire-live-run-v1.mjs');
const MIN_BYTES = 64 * 1024 * 1024;
const REPLY = { model: 'jev-1.13.0', usage: { input_tokens: 300, output_tokens: 5 },
  answers: { Q_RISK: { type: 'noul', noul: 0.25 } } };
const DUMMY = 'TEST-ONLY-dummy-key-not-a-real-credential';
const TEMP = realpathSync(tmpdir());
const results = [];
const scratch = [];
const variants = [];

function verifyRoot(name, supplied, requireMount) {
  assert.ok(supplied && isAbsolute(supplied), name + ': an explicit absolute root is required');
  const root = resolve(supplied);
  const info = lstatSync(root);
  assert.ok(info.isDirectory() && !info.isSymbolicLink(), name + ': directory cannot be a link');
  assert.equal(realpathSync(root), root, name + ': root must not traverse aliases');
  const dev = statSync(root).dev;
  if (requireMount) assert.notEqual(dev, statSync(dirname(root)).dev, name + ': root is not a mount');
  const v = statfsSync(root);
  const free = Number(v.bavail) * Number(v.bsize);
  assert.ok(free >= MIN_BYTES, name + ': below minimum free space');
  return { name, root, dev, free };
}

const roots = {
  mac: verifyRoot('mac', TEMP, false),
  t7: verifyRoot('t7', process.env.JEV_TEST_SECOND_DEVICE_ROOT, true),
  lacie: verifyRoot('lacie', process.env.JEV_TEST_THIRD_DEVICE_ROOT, true),
};
assert.equal(new Set(Object.values(roots).map((r) => r.dev)).size, 3,
  'Mac, T7 and LaCie must be distinct physical devices');
for (const r of Object.values(roots)) console.log('VOLUME ' + r.name + ' ' + r.root + ' dev=' + r.dev);

function exactlyOnce(source, needle, label) {
  assert.equal(source.split(needle).length - 1, 1, label + ': source anchor must be unique');
}

const original = readFileSync(SRC, 'utf8');
const PIN = [
  '      if (statSync(dirname(resolve(ledgerPath))).dev !== admittedDevices.ledger ||',
  '          statSync(dirname(resolve(checkpointPath))).dev !== admittedDevices.checkpoint)',
  "        return 'STORAGE_DEVICE_CHANGED';",
].join('\n');
const ANCHOR = '  const storageRefusal = () => {';
exactlyOnce(original, PIN, 'the unmodified admitted-device guard');
exactlyOnce(original, ANCHOR, 'the storageRefusal entrypoint');

const led = "__pinObservedDev(statSync(dirname(resolve(ledgerPath))).dev, 'ledger')";
const cp = "__pinObservedDev(statSync(dirname(resolve(checkpointPath))).dev, 'checkpoint')";
const guarded = PIN
  .replace('statSync(dirname(resolve(ledgerPath))).dev', led)
  .replace('statSync(dirname(resolve(checkpointPath))).dev', cp);
const helper = [
  '  // TEST COPY ONLY: affects the already-admitted device comparison, not storage validation.',
  '  const __pinObservedDev = (actual, role) => {',
  '    const drift = globalThis.__JEV_TEST_PIN_DRIFT__;',
  '    return drift && Object.hasOwn(drift, role) ? drift[role] : actual;',
  '  };',
  ANCHOR,
].join('\n');

const WV = makeVariant([], { witnessed: true }); variants.push(WV);
const closedWV = makeVariant([], { witnessed: false }); variants.push(closedWV);
const PIN_MODULE = makeVariant([[ANCHOR, helper], [PIN, guarded]], {
  from: SRC, importMap: { './jev-wire-v1.mjs': WV.url },
}); variants.push(PIN_MODULE);
const NO_LEDGER = makeVariant([[led, 'admittedDevices.ledger']], { source: PIN_MODULE.source });
const NO_CHECKPOINT = makeVariant([[cp, 'admittedDevices.checkpoint']], { source: PIN_MODULE.source });
variants.push(NO_LEDGER, NO_CHECKPOINT);
const CLOSED = makeVariant([], { from: SRC, importMap: { './jev-wire-v1.mjs': closedWV.url } });
variants.push(CLOSED);
const R = await import(PIN_MODULE.url);
const C = await import(CLOSED.url);
const MutLedger = await import(NO_LEDGER.url);
const MutCheckpoint = await import(NO_CHECKPOINT.url);
const W = await import(WV.url);

function createScratch(r) {
  const path = mkdtempSync(join(r.root, 'jev-pin-test-'));
  assert.equal(statSync(path).dev, r.dev, 'new disposable dir not on admitted device');
  scratch.push({ path, expectedParent: r.root, expectedDev: r.dev });
  return path;
}
function layout(ledgerRole, checkpointRole) {
  const ledger = createScratch(roots[ledgerRole]);
  const checkpoint = createScratch(roots[checkpointRole]);
  const ldir = join(ledger, 'ledger'); const cdir = join(checkpoint, 'anchor');
  mkdirSync(ldir); mkdirSync(cdir);
  return { ledgerPath: join(ldir, 'ledger.jsonl'), checkpointPath: join(cdir, 'anchor.json'),
    checkpointMountPoint: roots[checkpointRole].root };
}
function iso(t) { return new Date(t).toISOString(); }
function grant(url) {
  return { instrument: 'jev-int05-execution-grant/v1', state: 'AUTHORIZED',
    experiment_id: 'JEV-INT-05-PIN-TEST-ONLY', provider_id: 'typesafe-jev',
    model: 'jev-1.13.0', endpoint: url, network: 'LOOPBACK_ONLY',
    table_hash: W.questionTableHash(), fixture_list_hash: W.fixtureListHash(),
    schema_sha256: W.RESPONSE_SHAPE.schema_sha256,
    max_attempts: 1, ceiling_usd: 1,
    not_before: iso(Date.now() - 60000), expires_at: iso(Date.now() + 60000),
    volume_policy: 'DISTINCT_DEVICES', operator: 'synthetic', authorized_by: 'synthetic',
    authorization_ref: 'TEST-ONLY-NOT-A-REAL-GRANT' };
}
function config(l, g) {
  return { ...l, grant: g, confirmGrantHash: R.grantHash(g), mode: 'initialize' };
}

async function mock() {
  let requests = 0;
  const server = http.createServer((req, res) => {
    req.resume();
    req.on('end', () => {
      requests += 1;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(REPLY));
    });
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return {
    get requests() { return requests; },
    url: 'http://127.0.0.1:' + server.address().port + '/v1/systemone',
    close: () => new Promise((done) => { server.closeAllConnections(); server.close(done); }),
  };
}

async function scenario(name, { ledger, checkpoint, override = null, variant = R, expectedRequests = 0,
  expectedStop = 'STORAGE_DEVICE_CHANGED', committedClosed = false }) {
  const m = await mock();
  let credentialsRead = 0;
  try {
    // Keep the localhost mock under a finally even if fixture creation fails.
    const l = layout(ledger, checkpoint);
    const g = grant(m.url);
    const c = config(l, g);
    globalThis.__JEV_TEST_PIN_DRIFT__ = override;
    if (!committedClosed) {
      const pf = R.preflight(c);
      assert.equal(pf.ok, true, name + ': real mount preflight must pass');
    }
    const out = await variant.executeLiveRun(c, { credential: () => {
      credentialsRead += 1;
      return DUMMY;
    } });
    assert.equal(m.requests, expectedRequests, name + ': local request count');
    if (committedClosed) {
      assert.equal(out.ran, false);
      assert.equal(out.refusal, 'OFF_SWITCH_CLOSED');
      assert.equal(existsSync(l.ledgerPath), false, 'closed wrapper must never create ledger');
      assert.equal(credentialsRead, 0);
    } else if (expectedRequests === 0) {
      assert.equal(out.ran, true, name + ': admitted then blocked');
      assert.equal(out.stopped_reason, expectedStop, name + ': must specifically exercise the pin');
      assert.equal(out.completed, false);
      assert.equal(out.attempts.length, 0);
      assert.equal(credentialsRead, 0, 'no credential callback before guard');
    } else {
      assert.equal(out.ran, true, name);
      assert.equal(out.attempts.length, 1);
      assert.equal(out.attempts[0].sent, true);
      assert.equal(credentialsRead, 1);
    }
    results.push({ name, ledgerDevice: roots[ledger].dev, checkpointDevice: roots[checkpoint].dev,
      observedOverride: override, localRequests: m.requests,
      stoppedReason: out.stopped_reason ?? out.refusal ?? null, passed: true });
    console.log('PASS ' + name + ' requests=' + m.requests + ' stop=' + (out.stopped_reason ?? out.refusal ?? '-'));
  } finally {
    delete globalThis.__JEV_TEST_PIN_DRIFT__;
    await m.close();
  }
}

function cleanup() {
  const failures = [];
  for (const s of scratch.reverse()) {
    try {
      const st = lstatSync(s.path);
      assert.ok(st.isDirectory() && !st.isSymbolicLink(), 'not a real scratch directory');
      assert.equal(st.dev, s.expectedDev, 'scratch device unexpectedly changed');
      assert.equal(realpathSync(dirname(s.path)), s.expectedParent, 'scratch parent changed');
      assert.ok(s.path.startsWith(s.expectedParent + sep), 'scratch outside admitted root');
      assert.ok(s.path.split(sep).pop().startsWith('jev-pin-test-'), 'not a probe scratch');
      rmSync(s.path, { recursive: true, force: true });
    } catch (e) { failures.push(s.path + ': ' + String(e.message)); }
  }
  for (const v of variants) {
    const dir = dirname(v.file);
    try {
      assert.equal(realpathSync(dirname(dir)), TEMP, 'variant parent must be mac temp');
      assert.ok(lstatSync(dir).isDirectory() && !lstatSync(dir).isSymbolicLink());
      assert.ok(dir.split(sep).pop().startsWith('jev-wire-variant-'));
      rmSync(dir, { recursive: true, force: true });
    } catch (e) { failures.push(dir + ': ' + String(e.message)); }
  }
  return failures;
}

let error = null;
try {
  await scenario('closed-committed-Mac-T7', { ledger: 'mac', checkpoint: 't7',
    variant: C, committedClosed: true });
  await scenario('baseline-Mac-T7-one-loopback-send', { ledger: 'mac', checkpoint: 't7',
    expectedRequests: 1 });
  await scenario('pin-checkpoint-T7-to-LaCie', { ledger: 'mac', checkpoint: 't7',
    override: { checkpoint: roots.lacie.dev } });
  await scenario('pin-checkpoint-T7-to-Mac', { ledger: 'mac', checkpoint: 't7',
    override: { checkpoint: roots.mac.dev } });
  await scenario('pin-ledger-Mac-to-LaCie', { ledger: 'mac', checkpoint: 't7',
    override: { ledger: roots.lacie.dev } });
  await scenario('pin-ledger-Mac-to-T7', { ledger: 'mac', checkpoint: 't7',
    override: { ledger: roots.t7.dev } });
  await scenario('mutant-no-checkpoint-pin-exposes-send', { ledger: 'mac', checkpoint: 't7',
    variant: MutCheckpoint, override: { checkpoint: roots.lacie.dev },
    expectedRequests: 1 });
  await scenario('mutant-no-ledger-pin-exposes-send', { ledger: 'mac', checkpoint: 't7',
    variant: MutLedger, override: { ledger: roots.lacie.dev },
    expectedRequests: 1 });
} catch (e) { error = e; console.error('WITNESS_FAILURE', e.stack || String(e)); }
const cleanupFailures = cleanup();
if (cleanupFailures.length) console.error('CLEANUP_HOLD', JSON.stringify(cleanupFailures));
const allValid = !error && cleanupFailures.length === 0 && results.length === 8;
console.log('PIN_WITNESS ' + results.length + '/8 scenarios; Mac/T7 real mounts verified; LaCie read-only identity; simulated ID drift; '
  + 'two expected-send mutants; cleanup=' + (cleanupFailures.length ? 'HOLD' : 'CLEAN'));
console.log('PIN_WITNESS_ALL_VALID ' + allValid);
if (!allValid) process.exitCode = 1;
