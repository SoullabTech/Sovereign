#!/usr/bin/env node
/**
 * JEV-INT-01 — development-provider governance candidate proof.
 * No provider call. No network activity.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const policy = JSON.parse(readFileSync(
  new URL('../../provider-policy.json', import.meta.url),
  'utf8',
));
const providerCanon = readFileSync(
  new URL('../../../docs/canon/PROVIDER_GOVERNANCE.md', import.meta.url),
  'utf8',
);
const devCanon = readFileSync(
  new URL('../../../docs/canon/DEVELOPMENT_PROVIDER_GOVERNANCE_CANDIDATE_2026-09-22.md', import.meta.url),
  'utf8',
);

let pass = 0;
let fail = 0;
function check(name, fn) {
  try {
    fn();
    pass += 1;
    console.log('PASS  ' + name);
  } catch (error) {
    fail += 1;
    console.log('FAIL  ' + name);
    console.log('      ' + error.message);
  }
}

const requiredRepositoryClasses = [
  'repository_derived_metadata',
  'repository_source',
  'constitutional_canon',
];

function assignments() {
  const out = [];
  for (const tier of ['production', 'lab']) {
    for (const [provider, spec] of Object.entries(policy.tiers[tier].providers)) {
      for (const capability of spec.capabilities) out.push({ tier, provider, capability });
    }
  }
  return out;
}

console.log('=== vocabulary ===');

check('GOV-01 — function/data capability vocabulary is explicit', () => {
  for (const name of ['chat', 'embedding', 'tts', 'stt', 'benchmark']) {
    assert.equal(policy.capability_classes[name].kind, 'function');
  }
  for (const name of ['member_data', 'member_audio', ...requiredRepositoryClasses]) {
    assert.equal(policy.capability_classes[name].kind, 'data');
  }
});

check('GOV-02 — all provider assignments reference declared capabilities', () => {
  for (const { capability } of assignments()) {
    assert.ok(policy.capability_classes[capability], 'unknown capability: ' + capability);
  }
});
check('GOV-03 — three repository classes are explicit in human canon', () => {
  for (const name of requiredRepositoryClasses) {
    assert.equal(providerCanon.includes(name), true);
  }
});

console.log();
console.log('=== interim hold ===');

check('HOLD-01 — dev-lane canon is explicitly candidate, not ratified', () => {
  assert.equal(policy.development_boundary.canon_status, 'candidate_not_ratified');
  assert.match(devCanon, /CANDIDATE · NOT RATIFIED/);
});

check('HOLD-02 — interim hold is machine-readable and active', () => {
  assert.equal(policy.development_boundary.interim_hold, 'active');
  assert.deepEqual(
    policy.development_boundary.held_lab_data_classes,
    ['repository_source', 'constitutional_canon'],
  );
});

check('HOLD-03 — repository classes are assigned to no provider', () => {
  const assigned = new Set(assignments().map((x) => x.capability));
  for (const name of requiredRepositoryClasses) assert.equal(assigned.has(name), false);
});

check('HOLD-04 — Lab providers receive no held repository class', () => {
  for (const row of assignments().filter((x) => x.tier === 'lab')) {
    assert.equal(
      policy.development_boundary.held_lab_data_classes.includes(row.capability),
      false,
    );
  }
});

check('HOLD-05 — naming a class is explicitly not a grant', () => {
  assert.match(providerCanon, /Adding a class to this vocabulary grants it to no provider/);
  assert.match(devCanon, /Adding a class to the vocabulary creates no permission for any provider/);
});
console.log();
console.log('=== authority separation ===');

check('AUTH-01 — dev canon requires network, disclosure, spend, and provider execution independently', () => {
  assert.match(devCanon, /network\.external/);
  assert.match(devCanon, /provider\.spend/);
  assert.match(devCanon, /disclosure\.<exact data class>/);
  assert.match(devCanon, /provider\.execute:<provider>/);
});

check('AUTH-02 — Jev host work is permitted without transport, transport remains unauthorized', () => {
  assert.match(devCanon, /JEV-INT-02H may implement/);
  assert.match(devCanon, /without transport/);
  assert.match(devCanon, /does not authorize Jev transport/);
});

check('AUTH-03 — repository source and constitutional canon require future membranes before assignment', () => {
  assert.match(devCanon, /future membranes must be separately/);
  assert.match(devCanon, /before either class can be assigned/);
});

console.log();
console.log('=== verdict ===');
console.log('passes: ' + pass);
console.log('failures: ' + fail);
if (fail) process.exit(1);
console.log('JEV-INT-01 GOVERNANCE CANDIDATE — PASS');
process.exit(0);
