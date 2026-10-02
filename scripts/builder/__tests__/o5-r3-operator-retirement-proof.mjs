import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  inspectIncident, executeRetirement, RETIRE_REASON,
} from '../o5-operator-retire-claimed-grant.mjs';
import * as LEASE from '../grant-writer-lease-v1.mjs';
import * as STORE from '../canonical-provider-execution-grant-store-v1.mjs';

const WU = 'wu-operator-retire';
const GRANT = 'e1-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function makeHome({ claimed = true, result = false, liveHolder = false } = {}) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'o5-r3-retire-proof-'));
  fs.mkdirSync(path.join(home, 'grant-writer-lease'), { recursive: true });
  fs.mkdirSync(path.join(home, 'work-units-v2', 'execution-grants'), { recursive: true });
  const ident = liveHolder ? LEASE.currentProcessIdentity() : {
    host: os.hostname(), pid: 99999999, process_start_time: 'ps-lstart:dead-holder',
  };
  const lease = {
    version: LEASE.LEASE_VERSION, generation: 3, owner_nonce: 'old-owner',
    ...ident, acquired_at: '2026-10-01T00:00:00.000Z',
  };
  fs.writeFileSync(path.join(home, 'grant-writer-lease', 'g-000000000003.json'),
    JSON.stringify(lease) + '\n');

  const envelope = {
    work_unit: {
      identity: { id: WU },
      state: { lifecycle_state: 'EXECUTING' },
      execution: { attempts: [], artifacts: [] },
    },
    guard: { work_unit_id: WU, current_state: 'EXECUTING' },
  };
  fs.writeFileSync(path.join(home, 'work-units-v2', WU + '.json'),
    JSON.stringify(envelope, null, 2) + '\n');

  const issued = {
    event: 'ISSUED', at: '2026-10-01T00:00:01.000Z',
    grant: { grant_id: GRANT, work_unit_id: WU, route_participant_id: 'primary' },
  };
  const events = [issued];
  if (claimed) events.push({ event: 'CLAIMED', at: '2026-10-01T00:00:02.000Z', grant_id: GRANT });
  fs.writeFileSync(STORE.canonicalGrantLedgerPathV1(WU, home),
    events.map((e) => JSON.stringify(e)).join('\n') + '\n');
  if (result) {
    const dir = path.join(home, 'work-units-v2', 'results', WU);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, GRANT + '.json'),
      JSON.stringify({ work_unit_id: WU, grant_id: GRANT }) + '\n');
  }
  return { home, envelopeBytes: fs.readFileSync(path.join(home, 'work-units-v2', WU + '.json')) };
}

function cleanup(home) {
  fs.rmSync(home, { recursive: true, force: true });
}

let h = makeHome();
try {
  const i = inspectIncident({ home: h.home, workUnitId: WU, grantId: GRANT, expectGeneration: 3 });
  assert.equal(i.ready, true);
  assert.equal(i.lease.holder_proof, 'DEAD');
  assert.equal(i.grant.standing, 'CLAIMED');
  assert.equal(i.work_unit.durable_result_present, false);
  assert.equal(i.work_unit.w4_records_result, false);
} finally { cleanup(h.home); }
console.log('PASS R1 exact stranded incident is ready');

h = makeHome();
try {
  const i = inspectIncident({ home: h.home, workUnitId: WU, grantId: GRANT, expectGeneration: 3 });
  const bad = executeRetirement({
    home: h.home, workUnitId: WU, grantId: GRANT, expectGeneration: 3,
    admit: 'sha256:not-the-reviewed-state',
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.refused, 'ADMISSION_DIGEST_MISMATCH');
  assert.equal(LEASE.readLeaseState(h.home).generation, 3);
  assert.equal(STORE.canonicalGrantStandingV1(WU, GRANT, { home: h.home }).standing, 'CLAIMED');

  const out = executeRetirement({
    home: h.home, workUnitId: WU, grantId: GRANT, expectGeneration: 3,
    admit: i.admission_digest,
  });
  assert.equal(out.ok, true);
  assert.equal(out.execution_outcome, 'UNKNOWN');
  assert.equal(out.provider_retried, false);
  assert.equal(out.w4_written, false);
  assert.equal(out.authority.after, 'INVALIDATED');
  assert.equal(out.authority.reason, RETIRE_REASON);
  const finalLease = LEASE.readLeaseState(h.home);
  assert.equal(finalLease.generation, 5);
  assert.equal(finalLease.record.released, true);
  assert.equal(STORE.canonicalGrantStandingV1(WU, GRANT, { home: h.home }).standing, 'INVALIDATED');
  assert.deepEqual(fs.readFileSync(path.join(h.home, 'work-units-v2', WU + '.json')), h.envelopeBytes);
} finally { cleanup(h.home); }
console.log('PASS R2 admitted retirement takes over, invalidates only authority, and releases');

h = makeHome({ claimed: false });
try {
  const i = inspectIncident({ home: h.home, workUnitId: WU, grantId: GRANT, expectGeneration: 3 });
  assert.equal(i.ready, false);
  assert.ok(i.errors.some((e) => e.startsWith('GRANT_NOT_CLAIMED:ACTIVE')));
} finally { cleanup(h.home); }
console.log('PASS R3 ACTIVE grant is not eligible');

h = makeHome({ result: true });
try {
  const i = inspectIncident({ home: h.home, workUnitId: WU, grantId: GRANT, expectGeneration: 3 });
  assert.equal(i.ready, false);
  assert.ok(i.errors.includes('DURABLE_RESULT_PRESENT'));
} finally { cleanup(h.home); }
console.log('PASS R4 durable-result presence blocks retirement');

h = makeHome({ liveHolder: true });
try {
  const i = inspectIncident({ home: h.home, workUnitId: WU, grantId: GRANT, expectGeneration: 3 });
  assert.equal(i.ready, false);
  assert.ok(i.errors.some((e) => e.startsWith('LEASE_HOLDER_NOT_PROVEN_DEAD:THIS_PROCESS')));
} finally { cleanup(h.home); }
console.log('PASS R5 live/current holder blocks operator takeover');

h = makeHome();
try {
  const file = path.join(h.home, 'work-units-v2', WU + '.json');
  const env = JSON.parse(fs.readFileSync(file, 'utf8'));
  env.work_unit.execution.artifacts.push({ ref: `canonical-result:${WU}:${GRANT}` });
  fs.writeFileSync(file, JSON.stringify(env, null, 2) + '\n');
  const i = inspectIncident({ home: h.home, workUnitId: WU, grantId: GRANT, expectGeneration: 3 });
  assert.equal(i.ready, false);
  assert.ok(i.errors.includes('W4_ALREADY_RECORDS_RESULT'));
} finally { cleanup(h.home); }
console.log('PASS R6 existing W4 result evidence blocks retirement');
