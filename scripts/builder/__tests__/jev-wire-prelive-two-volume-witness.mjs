#!/usr/bin/env node
/**
 * Mac/T7 independent-storage witness. No provider, no real credential; literal loopback only.
 * All stores live under fresh temporary prefixes and are removed after the assertions complete.
 * Passing this test is NOT founder approval or an external-network/TLS test.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as RuntimeWire from '../jev-wire-v1.mjs';
import { makeVariant } from './jev-wire-variant-lib.mjs';
import { createJevPreliveWrapper } from '../jev-wire-prelive-wrapper-v1.mjs';

const checkpointRoot = process.argv[2];
assert.equal(typeof checkpointRoot, 'string', 'pass an already mounted independent checkpoint volume');
assert.ok(statSync(checkpointRoot).isDirectory());
assert.notEqual(statSync(tmpdir()).dev, statSync(checkpointRoot).dev, 'two physically distinct devices required');
const localRoot = mkdtempSync(join(tmpdir(), 'jev-prelive-mac-synthetic-'));
const remoteRoot = mkdtempSync(join(checkpointRoot, 'jev-prelive-anchor-synthetic-'));
const WV = makeVariant([], { witnessed: true });
const W = await import(WV.url);
const hex = (b) => createHash('sha256').update(b).digest('hex');
const good = { model: 'jev-1.13.0', usage: { input_tokens: 300, output_tokens: 5 },
  answers: { Q_RISK: { type: 'noul', noul: 0.25 } } };
let server;
const requestChecks = [];
const state = { status: 200, actual_requests: 0 };
try {
  const local = join(localRoot, 'ledger'); const cpDir = join(remoteRoot, 'checkpoint');
  mkdirSync(local); mkdirSync(cpDir);
  const ledgerPath = join(local, 'ledger.jsonl'), checkpointPath = join(cpDir, 'anchor.json');
  server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      state.actual_requests++;
      const bytes = Buffer.concat(chunks);
      const records = W.createLedger(ledgerPath).read();
      const reserved = records.at(-1);
      const anchor = JSON.parse(readFileSync(checkpointPath, 'utf8'));
      requestChecks.push({ match: reserved.kind === 'reserved' &&
        reserved.wire_body_hash === hex(bytes) && anchor.head === reserved.hash &&
        anchor.seq === reserved.seq && req.method === 'POST' &&
        req.url === '/v1/systemone' &&
        req.headers.authorization === 'Bearer JEV-INT05-SYNTHETIC-DUMMY-NOT-A-PROVIDER-KEY' });
      res.writeHead(state.status, { 'content-type': 'application/json' });
      res.end(state.status === 200 ? JSON.stringify(good) : '{}');
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const endpoint = 'http://127.0.0.1:' + server.address().port + '/v1/systemone';
  const pins = {
    ledgerPath, checkpointPath, loopbackEndpoint: endpoint,
    expectedLedgerDevice: statSync(local).dev,
    expectedCheckpointDevice: statSync(cpDir).dev,
    requireDistinctDevices: true, enableLocalMock: true,
  };
  const session = createJevPreliveWrapper(pins, { wire: W });
  assert.equal(session.preflight().ok, true);
  assert.equal(session.preflight().devices_distinct, true);
  assert.equal(session.activation_ready, false);
  assert.equal(session.initialize({ acknowledgeFreshSyntheticExperiment: true }).initialized, true);
  const list = W.fixtureAttemptIds();
  assert.equal(list.length, 31);
  // Explicit first-attempt observation; this call counts as one of the frozen 31, not a bonus.
  assert.equal((await session.run(list[0])).outcome, 'ok');
  assert.equal(state.actual_requests, 1);
  const first = W.createLedger(ledgerPath).read();
  assert.deepEqual(first.map((x) => x.kind), ['init', 'reserved', 'observed', 'settled']);
  assert.equal(JSON.parse(readFileSync(checkpointPath, 'utf8')).head, first.at(-1).hash);
  for (const id of list.slice(1)) assert.equal((await session.run(id)).outcome, 'ok', id);
  assert.equal(state.actual_requests, 31);
  assert.ok(requestChecks.every((x) => x.match));
  const last = W.createLedger(ledgerPath).read();
  assert.equal(last.filter((x) => x.kind === 'observed').length, 31);
  assert.equal(last.filter((x) => x.kind === 'reserved').length, 31);
  assert.equal(last.filter((x) => x.kind === 'settled').length, 31);
  assert.equal(JSON.parse(readFileSync(checkpointPath, 'utf8')).head, last.at(-1).hash);
  assert.ok(Math.abs(W.createLedger(ledgerPath).state().usd - 0.0003906) < 1e-12);
  const another = createJevPreliveWrapper(pins, { wire: W });
  assert.equal((await another.run(list[0])).reason, 'ATTEMPT_ALREADY_USED');
  assert.equal(state.actual_requests, 31);
  const inactive = createJevPreliveWrapper({ ...pins, enableLocalMock: false }, { wire: RuntimeWire });
  assert.equal((await inactive.run('F01')).reason, 'PRELIVE_INACTIVE');
  const committed = createJevPreliveWrapper(pins, { wire: RuntimeWire });
  assert.equal((await committed.run('F01')).reason, 'RESPONSE_SHAPE_UNWITNESSED');
  assert.equal(state.actual_requests, 31);
  const wrongPin = createJevPreliveWrapper({ ...pins, expectedCheckpointDevice: pins.expectedCheckpointDevice + 1 }, { wire: W });
  assert.equal((await wrongPin.run('F01')).reason, 'PRELIVE_MOUNT_IDENTITY_CHANGED');
  assert.equal(state.actual_requests, 31);
  console.log(JSON.stringify({
    source:'JEV-INT-05-PRELIVE-LOCAL-MOCK',
    tests:'PASS', actual_provider_requests:0, actual_spend_usd:0,
    synthetic_mock_requests:state.actual_requests,
    reserved_before_mock:requestChecks.filter((x) => x.match).length,
    persisted_observations:31, replay_refused:true,
    initial_attempt_counted_in_31:true,
    committed_gate_send_count:0, remote_allowed:false,
    simulated_usd:0.0003906,
    ledger_device:pins.expectedLedgerDevice, checkpoint_device:pins.expectedCheckpointDevice,
    independent_devices:pins.expectedLedgerDevice !== pins.expectedCheckpointDevice,
  }));
} finally {
  if (server) await new Promise((resolve) => server.closeAllConnections?.() || server.close(resolve));
  // Only exactly these newly allocated synthetic directories; do not inspect or alter any pilot data.
  rmSync(localRoot, { recursive: true, force: true });
  rmSync(remoteRoot, { recursive: true, force: true });
}
