import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  inspectDeadLease,
  executeDeadLeaseNormalization,
} from '../o5-normalize-dead-lease.mjs';
import * as LEASE from '../grant-writer-lease-v1.mjs';

function makeHome({ released = false, live = false } = {}) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'o5-r3-dead-lease-'));
  const dir = path.join(home, LEASE.LEASE_DIR);
  fs.mkdirSync(dir, { recursive: true });
  const ident = live ? LEASE.currentProcessIdentity() : {
    host: os.hostname(),
    pid: 99999999,
    process_start_time: 'ps-lstart:dead-holder',
  };
  const record = released
    ? { version: LEASE.LEASE_VERSION, generation: 8, released: true,
        owner_nonce: 'old-owner', released_at: '2026-10-01T00:00:00.000Z' }
    : { version: LEASE.LEASE_VERSION, generation: 8, owner_nonce: 'old-owner',
        ...ident, acquired_at: '2026-10-01T00:00:00.000Z' };

  fs.writeFileSync(
    path.join(dir, 'g-000000000008.json'),
    JSON.stringify(record) + '\n',
  );
  return home;
}
const cleanup = (home) => fs.rmSync(home, { recursive: true, force: true });

let home = makeHome();
try {
  const i = inspectDeadLease({ home, expectGeneration: 8 });
  assert.equal(i.ready, true);
  assert.equal(i.lease.holder_proof, 'DEAD');
  assert.equal(i.proposed_effect.append_takeover_generation, 9);
  assert.equal(i.proposed_effect.append_release_generation, 10);
} finally { cleanup(home); }
console.log('PASS N1 exact dead holder is ready');

home = makeHome();
try {
  const i = inspectDeadLease({ home, expectGeneration: 8 });
  const bad = executeDeadLeaseNormalization({
    home, expectGeneration: 8, admit: 'sha256:not-reviewed',
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.refused, 'ADMISSION_DIGEST_MISMATCH');
  assert.equal(LEASE.readLeaseState(home).generation, 8);

  const out = executeDeadLeaseNormalization({
    home, expectGeneration: 8, admit: i.admission_digest,
  });
  assert.equal(out.ok, true);
  assert.equal(out.status, 'DEAD_LEASE_NORMALIZED');
  assert.equal(out.takeover.generation, 9);
  assert.equal(out.takeover.proof, 'DEAD');
  const final = LEASE.readLeaseState(home);
  assert.equal(final.generation, 10);
  assert.equal(final.record.released, true);
} finally { cleanup(home); }
console.log('PASS N2 reviewed normalization appends takeover then release');

home = makeHome({ live: true });
try {
  const i = inspectDeadLease({ home, expectGeneration: 8 });
  assert.equal(i.ready, false);
  assert.ok(i.errors.some((e) => e.includes('THIS_PROCESS')));
} finally { cleanup(home); }
console.log('PASS N3 live holder blocks normalization');

home = makeHome({ released: true });
try {
  const i = inspectDeadLease({ home, expectGeneration: 8 });
  assert.equal(i.ready, false);
  assert.ok(i.errors.includes('LATEST_LEASE_ALREADY_RELEASED'));
} finally { cleanup(home); }
console.log('PASS N4 already-released latest generation blocks normalization');

home = makeHome();
try {
  const i = inspectDeadLease({ home, expectGeneration: 7 });
  assert.equal(i.ready, false);
  assert.ok(i.errors.includes('LEASE_GENERATION_MISMATCH:8'));
} finally { cleanup(home); }
console.log('PASS N5 expected-generation mismatch blocks normalization');
