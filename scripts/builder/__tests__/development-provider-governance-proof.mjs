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
const sovereigntyWorkflow = readFileSync(
  new URL('../../../.github/workflows/sovereignty-gate.yml', import.meta.url),
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

// JEV-INT-01R3R1 — HOLD-01/HOLD-02 previously asserted the pre-ratification VALUES
// (canon_status === 'candidate_not_ratified', interim_hold === 'active', and the human
// canon reading "CANDIDATE · NOT RATIFIED"). Those were state snapshots, correct while the
// hold stood and unsatisfiable by any lawful founder ratification. They are replaced by the
// durable invariants they were protecting. The mechanisms are NOT weakened: the guard's own
// refusal of `lifted` before `ratified`, and the canonical prior-authorization barrier on
// every repository-class assignment, are unchanged and separately asserted.

/**
 * The exact permitted (canon_status, interim_hold) pairs over the declared vocabularies.
 * Enumerated, not expressed as a one-way implication, so an unlisted pair fails loudly.
 *
 * ratified + active is lawful and deliberately listed: ratifying the dev-lane canon
 * discharges the hold's first lift condition without itself lifting the hold, so the
 * transient state between the two founder acts must not be rejected. The guard permits it
 * too; a proof stricter than the mechanism it guards would refuse a lawful transition.
 */
const COHERENT_BOUNDARY_STATES = [
  ['candidate_not_ratified', 'active'],
  ['ratified', 'active'],
  ['ratified', 'lifted'],
];
const INCOHERENT_BOUNDARY_STATE = ['candidate_not_ratified', 'lifted'];

check('HOLD-01 — ratification and hold state are coherent', () => {
  const { canon_status: status, interim_hold: hold } = policy.development_boundary;

  // the observed pair is one of the enumerated coherent states
  assert.equal(
    COHERENT_BOUNDARY_STATES.some(([s, h]) => s === status && h === hold),
    true,
    `incoherent development-boundary state: ${status} + ${hold}`,
  );

  // the incoherent pair is never coherent — a hold may not be lifted before ratification
  assert.equal(
    COHERENT_BOUNDARY_STATES.some(
      ([s, h]) => s === INCOHERENT_BOUNDARY_STATE[0] && h === INCOHERENT_BOUNDARY_STATE[1],
    ),
    false,
  );
  assert.equal(status === 'candidate_not_ratified' && hold === 'lifted', false);

  // the human canon's status language must agree with the machine-readable status
  if (status === 'ratified') {
    assert.match(devCanon, /RATIFIED/);
    assert.equal(/\*\*Status:\*\*\s*CANDIDATE · NOT RATIFIED/.test(devCanon), false);
  } else {
    assert.match(devCanon, /CANDIDATE · NOT RATIFIED/);
  }
});

check('HOLD-02 — lifting the hold grants nothing', () => {
  const { interim_hold: hold } = policy.development_boundary;
  assert.equal(['active', 'lifted'].includes(hold), true);

  // the held-class vocabulary is durable and survives the lift
  assert.deepEqual(
    policy.development_boundary.held_lab_data_classes,
    ['repository_source', 'constitutional_canon'],
  );

  // whatever the hold state, a lift confers no repository or provider capability
  const assigned = new Set(assignments().map((x) => x.capability));
  for (const name of requiredRepositoryClasses) {
    assert.equal(assigned.has(name), false, `${name} assigned while hold is ${hold}`);
  }
  assert.deepEqual(
    policy.development_boundary.repository_assignment_authorizations ?? {},
    {},
  );
  const providerNames = assignments().map((x) => x.provider.toLowerCase());
  for (const forbidden of ['jev', 'typesafe']) {
    assert.equal(providerNames.some((p) => p.includes(forbidden)), false);
  }
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

check('HOLD-06 — repository data-class set is exact and assignment authorization map starts empty', () => {
  assert.deepEqual(
    policy.development_boundary.repository_data_classes,
    requiredRepositoryClasses,
  );
  assert.deepEqual(
    policy.development_boundary.repository_assignment_authorizations,
    {},
  );
});

check('HOLD-07 — assignment requires a prior ratified pinned authorization record', () => {
  assert.match(providerCanon, /canonical prior-authorization gate/);
  assert.match(providerCanon, /record_path/);
  assert.match(providerCanon, /record_blob/);
  assert.match(providerCanon, /record_commit/);
  assert.match(devCanon, /separately ratified provider-assignment authorization record/);
  assert.match(devCanon, /predates the assignment candidate/);
  assert.match(devCanon, /Delisting alone is never assignment authority/);
});

check('HOLD-08 — prior commit must already be admitted to the exact canonical base', () => {
  assert.match(providerCanon, /ancestor of the exact canonical base under adjudication/);
  assert.match(providerCanon, /canonical base still resolves/);
  assert.match(devCanon, /two-commit sequence on one unmerged branch is also/);
  assert.match(devCanon, /two-admission sequence/);
  assert.match(devCanon, /canonical custody and record identity/);
});

check('HOLD-09 — CI supplies exact base SHA and full history for ancestry evidence', () => {
  assert.match(sovereigntyWorkflow, /PROVIDER_GOVERNANCE_CANONICAL_SHA/);
  assert.match(sovereigntyWorkflow, /github\.event\.pull_request\.base\.sha/);
  assert.match(sovereigntyWorkflow, /fetch-depth:\s*0/);
  assert.match(providerCanon, /instrument error/i);
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
