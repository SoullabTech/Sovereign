#!/usr/bin/env node
/** JEV-INT-05 pre-live wrapper checks. All calls go to an ephemeral 127.0.0.1 mock. */
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeVariant } from './jev-wire-variant-lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const variantEdits = process.env.PRELIVE_EDITS ? JSON.parse(process.env.PRELIVE_EDITS) : [];
const MODULE_PATH = join(HERE, '..', 'jev-wire-prelive-wrapper-v1.mjs');
const PV = makeVariant(variantEdits, { from: MODULE_PATH });
const P = await import(PV.url);
const WV = makeVariant([], { witnessed: true });
const W = await import(WV.url);
const sha = (x) => createHash('sha256').update(x).digest('hex');
const response = { model: 'jev-1.13.0', usage: { input_tokens: 300, output_tokens: 5 },
  answers: { Q_RISK: { type: 'noul', noul: 0.25 } } };
const scratch = () => mkdtempSync(join(tmpdir(), 'jev-prelive-synthetic-'));
function stores() {
  const root = scratch(); mkdirSync(join(root, 'ledger')); mkdirSync(join(root, 'anchor'));
  const L = join(root, 'ledger', 'l.jsonl'); const C = join(root, 'anchor', 'c.json');
  const opts = { ledgerPath: L, checkpointPath: C, requireDistinctDevices: false };
  return { root, L, C, opts, open: (extra = {}, deps = { wire: W }) => P.createJevPreliveWrapper({ ...opts, ...extra }, deps) };
}
async function mock() {
  const m = { requests: [], mode: 'ok', onRequest: null };
  const server = http.createServer((req, res) => {
    const parts = [];
    req.on('data', (b) => parts.push(b));
    req.on('end', () => {
      const bytes = Buffer.concat(parts);
      m.requests.push({ path: req.url, method: req.method, auth: req.headers.authorization, bytes });
      m.onRequest?.(bytes, req);
      res.writeHead(m.mode === 'fail' ? 429 : 200, { 'content-type': 'application/json' });
      res.end(m.mode === 'fail' ? '{}' : JSON.stringify(response));
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  m.url = 'http://127.0.0.1:' + server.address().port + '/v1/systemone';
  m.close = () => new Promise((resolve) => server.close(resolve));
  return m;
}
const checkNames = [];
let pass = 0, fail = 0;
const only = process.env.PRELIVE_ONLY_CHECK;
async function check(id, fn) {
  if (only && id !== only) return;
  checkNames.push(id);
  try { await fn(); pass++; console.log('PASS  ' + id); }
  catch (e) { fail++; console.log('FAIL  ' + id + ' — ' + e.message); }
}

await check('P01-inactive-by-default-does-not-initialize-or-send', async () => {
  const s = stores(); const m = await mock();
  try {
    const off = s.open({ loopbackEndpoint: m.url, enableLocalMock: false });
    assert.equal(off.mode, 'INACTIVE'); assert.equal(off.activation_ready, false);
    assert.equal(off.external_calls_authorized, false);
    assert.equal((await off.run('F01')).reason, 'PRELIVE_INACTIVE');
    assert.throws(() => off.initialize({ acknowledgeFreshSyntheticExperiment: true }), /PRELIVE_INACTIVE/);
    assert.equal(existsSync(s.L), false); assert.equal(existsSync(s.C), false);
    assert.equal(m.requests.length, 0);
  } finally { await m.close(); }
});

await check('P02-no-remote-endpoint-under-any-mode', () => {
  const s = stores();
  for (const endpoint of ['https://api.typesafe.ai/v1/systemone',
    'http://localhost:9999/v1/systemone', 'http://0.0.0.0:9999/v1/systemone',
    'http://127.0.0.1:99/other', 'http://127.0.0.1:99/v1/systemone?x=1',
    'http://user:key@127.0.0.1:99/v1/systemone']) {
    assert.throws(() => s.open({ loopbackEndpoint: endpoint, enableLocalMock: true }), /PRELIVE_LOOPBACK_ONLY/, endpoint);
  }
  assert.throws(() => s.open({ enableLocalMock: true }), /PRELIVE_LOOPBACK_ONLY/);
});

await check('P03-table-fixtures-model-and-caps-are-pinned', () => {
  const s = stores();
  assert.equal(P.PRELIVE_FIXTURE_SHA256, W.fixtureListHash());
  assert.equal(P.PRELIVE_EXPERIMENT_ID, 'JEV-INT-05-SYNTHETIC-Q_RISK-1');
  for (const bad of [
    { ...W, QUESTION_TABLE: { ...W.QUESTION_TABLE, model: 'jev-other' } },
    { ...W, BUDGET: { ...W.BUDGET, max_attempts: 120 } },
    { ...W, fixtureListHash: () => 'tampered' },
  ]) assert.throws(() => s.open({}, { wire: bad }), /PRELIVE_WIRE_BINDING/);
  assert.equal(s.open().activation_ready, false);
});

await check('P04-physical-device-pins-are-required-and-verified', () => {
  const s = stores();
  const dev = statSync(dirname(s.L)).dev;
  assert.throws(() => s.open({ requireDistinctDevices: true }), /PRELIVE_DEVICE_PINS_REQUIRED/);
  const same = s.open({ requireDistinctDevices: true, expectedLedgerDevice: dev, expectedCheckpointDevice: dev });
  assert.equal(same.preflight().reason, 'PRELIVE_STORES_NOT_INDEPENDENT');
  const changed = s.open({ expectedLedgerDevice: dev + 999 });
  assert.equal(changed.preflight().reason, 'PRELIVE_MOUNT_IDENTITY_CHANGED');
  assert.equal(existsSync(s.L), false);
});

await check('P05-first-initialization-is-explicit-and-never-resets', async () => {
  const s = stores(); const m = await mock();
  try {
    const w = s.open({ enableLocalMock: true, loopbackEndpoint: m.url });
    assert.throws(() => w.initialize(), /PRELIVE_EXPLICIT_INIT_REQUIRED/);
    assert.equal(existsSync(s.L), false);
    assert.equal(w.initialize({ acknowledgeFreshSyntheticExperiment: true }).initialized, true);
    assert.throws(() => w.initialize({ acknowledgeFreshSyntheticExperiment: true }), /PAIR_ALREADY_INITIALIZED/);
    assert.equal((await w.run('F01')).outcome, 'ok');
    assert.equal(m.requests.length, 1);
    const reopened = s.open({ enableLocalMock: true, loopbackEndpoint: m.url });
    assert.equal((await reopened.run('F01')).reason, 'ATTEMPT_ALREADY_USED');
    assert.equal(m.requests.length, 1);
  } finally { await m.close(); }
});

await check('P06-all-31-local-requests-are-anchored-and-replay-is-blocked', async () => {
  const s = stores(); const m = await mock(); const snaps = [];
  try {
    const w = s.open({ enableLocalMock: true, loopbackEndpoint: m.url });
    w.initialize({ acknowledgeFreshSyntheticExperiment: true });
    m.onRequest = (bytes) => {
      const recs = W.createLedger(s.L).read(); const last = recs.at(-1);
      const cp = JSON.parse(readFileSync(s.C, 'utf8'));
      snaps.push({ head: last.hash, cp: cp.head, seq: last.seq, cpseq: cp.seq,
        kind: last.kind, requestHash: sha(bytes), reservationHash: last.wire_body_hash });
    };
    for (const id of W.fixtureAttemptIds()) {
      const r = await w.run(id); assert.equal(r.outcome, 'ok', id);
      const recs = W.createLedger(s.L).read(); const cp = JSON.parse(readFileSync(s.C, 'utf8'));
      assert.equal(cp.head, recs.at(-1).hash, id + ': complete anchor');
      assert.equal(r.ledger_head, cp.head);
    }
    assert.equal(m.requests.length, 31); assert.equal(snaps.length, 31);
    assert.ok(snaps.every((x) => x.head === x.cp && x.seq === x.cpseq &&
      x.kind === 'reserved' && x.requestHash === x.reservationHash));
    assert.ok(m.requests.every((r) => r.path === '/v1/systemone' && r.method === 'POST' &&
      r.auth === 'Bearer JEV-INT05-SYNTHETIC-DUMMY-NOT-A-PROVIDER-KEY'));
    const ledger = W.createLedger(s.L);
    const records = ledger.read();
    assert.equal(records.filter((r) => r.kind === 'reserved').length, 31);
    assert.equal(records.filter((r) => r.kind === 'observed').length, 31);
    assert.equal(records.filter((r) => r.kind === 'settled').length, 31);
    assert.ok(Math.abs(ledger.state().usd - 31 * 300 * 0.042 / 1e6) < 1e-12);
    assert.equal((await s.open({ enableLocalMock: true, loopbackEndpoint: m.url }).run('F01')).reason, 'ATTEMPT_ALREADY_USED');
    assert.equal(m.requests.length, 31);
  } finally { await m.close(); }
});

await check('P07-committed-gate-remains-closed-even-when-mock-opted-in', async () => {
  const s = stores(); const m = await mock();
  try {
    const off = s.open({ enableLocalMock: true, loopbackEndpoint: m.url }, { wire: await import('../jev-wire-v1.mjs') });
    assert.equal((await off.run('F01')).reason, 'RESPONSE_SHAPE_UNWITNESSED');
    assert.equal(m.requests.length, 0);
    assert.equal(existsSync(s.L), false); // does not create an experiment
  } finally { await m.close(); }
});

await check('P08-429-stops-experiment-no-retry-no-next-send', async () => {
  const s = stores(); const m = await mock();
  try {
    const w = s.open({ enableLocalMock: true, loopbackEndpoint: m.url });
    w.initialize({ acknowledgeFreshSyntheticExperiment: true });
    m.mode = 'fail';
    const r = await w.run('F01');
    assert.equal(r.outcome, 'crossing_unknown'); assert.equal(m.requests.length, 1);
    assert.equal(W.createLedger(s.L).state().halted, true);
    assert.equal((await w.run('F02')).reason, 'HALTED');
    assert.equal(m.requests.length, 1);
  } finally { await m.close(); }
});

await check('P09-storage-drift-refused-before-reservation', async () => {
  const s = stores(); const m = await mock();
  try {
    const w = s.open({ enableLocalMock: true, loopbackEndpoint: m.url });
    w.initialize({ acknowledgeFreshSyntheticExperiment: true });
    renameSync(dirname(s.C), dirname(s.C) + '.absent');
    assert.equal((await w.run('F01')).reason, 'PRELIVE_STORAGE_UNAVAILABLE');
    assert.equal(m.requests.length, 0);
    assert.equal(W.createLedger(s.L).state().attempts, 0);
  } finally { await m.close(); }
});

await check('P10-invalid-attempt-never-reaches-the-mock', async () => {
  const s = stores(); const m = await mock();
  try {
    const w = s.open({ enableLocalMock: true, loopbackEndpoint: m.url });
    w.initialize({ acknowledgeFreshSyntheticExperiment: true });
    assert.equal((await w.run('F99')).reason, 'NOT_IN_ALLOWLIST');
    assert.equal(m.requests.length, 0);
  } finally { await m.close(); }
});

await check('P11-preflight-only-does-not-create-ledger-checkpoint-or-locks', () => {
  const s = stores(); const w = s.open();
  assert.equal(w.preflight().ok, true);
  assert.equal(existsSync(s.L), false); assert.equal(existsSync(s.C), false);
  assert.equal(existsSync(s.L + '.lock'), false);
  assert.equal(existsSync(s.L + '.pair.lock'), false);
});

await check('P12-no-real-endpoint-credentials-external-permissions-or-recovery', async () => {
  const src = readFileSync(PV.file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const forbidden of ['process.env', 'process.argv', 'api.typesafe.ai', 'allowRemote: true',
    'fetch(', 'readFileSync(', 'unlinkSync(', 'resume(', 'console.', 'Authorization:']) {
    assert.equal(src.includes(forbidden), false, forbidden);
  }
  const s = stores(); const w = s.open();
  assert.equal(typeof w.resume, 'undefined'); assert.equal(typeof w.clearLock, 'undefined');
});

console.log('\n' + pass + ' passed · ' + fail + ' failed; checks_completed=' + checkNames.length);
process.exit(fail ? 1 : 0);
