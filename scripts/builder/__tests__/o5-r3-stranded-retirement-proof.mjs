#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import * as LEASE from '../grant-writer-lease-v1.mjs';
import * as STORE from '../canonical-provider-execution-grant-store-v1.mjs';
import {
  RETIRE_REASON,
  retirementCandidate,
  retireStrandedGrant,
} from '../o5-r3-retire-stranded-grant.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LEASE_URL = pathToFileURL(path.join(ROOT, 'scripts/builder/grant-writer-lease-v1.mjs')).href;
const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push(true);
    process.stdout.write('PASS  ' + name + '\n');
  } catch (e) {
    results.push(false);
    process.stdout.write('FAIL  ' + name + '\n      ' + String(e?.stack || e).split('\n').slice(0, 4).join('\n      ') + '\n');
  }
}
const blocked = (wu='wu-a', grant='g-a') => ({
  admissible: true,
  census_digest: 'sha256:test',
  path_b: { BLOCKED_BY_EVIDENCE: [{
    work_unit_id: wu,
    grant_id: grant,
    reason: 'DISPATCHED_WITHOUT_WITNESS_NO_PROBE',
    category: 'no_durable_result',
  }] },
});
await check('SR-1 exact blocked-by-evidence shape is eligible', () => {
  assert.equal(retirementCandidate(blocked(), 'wu-a', 'g-a').ok, true);
});

await check('SR-2 wrong reason/category/target are refused', () => {
  const c1 = blocked();
  c1.path_b.BLOCKED_BY_EVIDENCE[0].reason = 'W2_NOT_EXECUTING';
  assert.equal(retirementCandidate(c1, 'wu-a', 'g-a').ok, false);
  const c2 = blocked();
  c2.path_b.BLOCKED_BY_EVIDENCE[0].category = 'ambiguous_historical_state';
  assert.equal(retirementCandidate(c2, 'wu-a', 'g-a').ok, false);
  assert.equal(retirementCandidate(blocked(), 'wu-x', 'g-a').ok, false);
});

await check('SR-3 retirement takes over proven-dead lease, invalidates only, then releases', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'o5r3-retire-'));
  const wu = 'wu-a';
  const grant = 'g-a';
  const ledger = STORE.canonicalGrantLedgerPathV1(wu, home);
  fs.mkdirSync(path.dirname(ledger), { recursive: true });
  fs.writeFileSync(ledger,
    JSON.stringify({ event: 'ISSUED', at: 't0', grant: { grant_id: grant, work_unit_id: wu } }) + '\n'
    + JSON.stringify({ event: 'CLAIMED', at: 't1', grant_id: grant }) + '\n');

  const child = [
    'import * as L from ' + JSON.stringify(LEASE_URL) + ';',
    'const r=L.acquireGrantWriterLeaseV1(process.argv[1]);',
    'if(!r.ok) process.exit(2);',
  ].join('');
  execFileSync(process.execPath, ['--input-type=module', '-e', child, home]);

  const before = LEASE.readLeaseState(home);
  assert.equal(before.generation, 1);
  assert.equal(before.record.released, undefined);

  const out = await retireStrandedGrant(ROOT, {
    env: { ...process.env, AIN_DELEGATION_HOME: home },
    admit: 'sha256:test',
    workUnitId: wu,
    grantId: grant,
    censusFn: async () => blocked(wu, grant),
  });
  assert.equal(out.ok, true);
  assert.equal(out.outcome, 'UNKNOWN');
  assert.equal(out.provider_replayed, false);
  assert.equal(out.w4_result_written, false);
  assert.equal(out.prior_lease_generation, 1);
  assert.equal(out.acquired_generation, 2);
  assert.equal(out.released_generation, 3);
  assert.equal(out.invalidation_reason, RETIRE_REASON);

  const events = STORE.readCanonicalGrantEventsV1(wu, { home });
  assert.deepEqual(events.map((e) => e.event), ['ISSUED', 'CLAIMED', 'INVALIDATED']);
  assert.equal(events[2].reason, RETIRE_REASON);
  assert.equal(events.some((e) => e.event === 'CONSUMED'), false);

  const after = LEASE.readLeaseState(home);
  assert.equal(after.generation, 3);
  assert.equal(after.record.released, true);
  assert.equal(
    fs.existsSync(path.join(home, 'work-units-v2', 'results', wu, grant + '.json')),
    false,
  );
});

await check('SR-4 wrong census digest cannot acquire or mutate', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'o5r3-retire-digest-'));
  const out = await retireStrandedGrant(ROOT, {
    env: { ...process.env, AIN_DELEGATION_HOME: home },
    admit: 'sha256:wrong',
    workUnitId: 'wu-a',
    grantId: 'g-a',
    censusFn: async () => blocked(),
  });
  assert.equal(out.ok, false);
  assert.equal(out.reason, 'CENSUS_DIGEST_MISMATCH');
  assert.equal(LEASE.readLeaseState(home).generation, 0);
});

const failed = results.filter((v) => !v).length;
process.stdout.write('\n' + (results.length - failed) + ' passed · ' + failed + ' failed\n');
process.exit(failed ? 1 : 0);
