// JARVIS-SVE-01 / SVE-01 — S1 Specification Contract witness.
// Positive admission plus one deliberately violating fixture per refusal law.
// Every refusal witness asserts the EXACT blocker set, so a fixture that died
// for a different (earlier) rule is identified rather than counted as proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const S1 = require('../src/sve-spec-contract.js');

// A fully explicit, conforming specification. Deliberately names a Founder
// authorization and a canonical-merge objective so S1-F11 can show that
// naming them grants nothing.
function completeSpec(overrides = {}) {
  return {
    spec_id: 'SVE-01-WITNESS-001',
    intent: 'Admit the ratified SVE constitution to canonical through the protected path.',
    current_state: 'The constitution is founder-ratified on a chore branch; canonical does not contain it.',
    target_state: 'Canonical contains the exact ratified blob at the constitution path (a canonical merge).',
    scope: ['docs/programme/JARVIS-SVE-01_CONSTITUTION_2026-09-23.md'],
    exclusions: ['CLAUDE.md', 'any runtime path', 'any second SVE document'],
    authority_basis: ['FOUNDER-ADJUDICATION: JARVIS-SVE-01 / SVE-00R2', 'SVE constitution §XV'],
    inputs: ['ratified blob be8ca60ceb9fac37b5f7433dea9ab0c0748b8f51'],
    expected_outputs: ['one merge commit on clean-main-no-secrets'],
    success_criteria: ['canonical blob at the path equals the ratified blob'],
    failure_criteria: ['canonical blob differs', 'a second path entered'],
    stop_conditions: ['canonical advanced before merge'],
    checkpoint: 'Founder canonical-admission adjudication before merge.',
    ...overrides,
  };
}

function codes(out) {
  return out.blockers.map((b) => b.code);
}

// Asserts the fixture was refused for EXACTLY the named law and nothing else.
function refusedExactly(out, code, field) {
  assert.equal(out.ok, false, 'fixture must be refused');
  assert.equal(out.standing, S1.STANDING.REFUSED);
  assert.equal(out.spec, null);
  assert.deepEqual(codes(out), [code], `refused for ${JSON.stringify(codes(out))}, expected only ${code}`);
  if (field !== undefined) assert.equal(out.blockers[0].field, field);
}

test('S1-F1 — complete explicit specification admits with exact sve.spec.v1 standing', () => {
  const out = S1.admitSpec(completeSpec());
  assert.equal(out.ok, true);
  assert.equal(out.standing, S1.STANDING.ADMITTED);
  assert.equal(out.version, 'sve.spec.v1');
  assert.equal(out.spec.version, 'sve.spec.v1');
  assert.deepEqual(out.blockers, []);
  assert.deepEqual(Object.keys(out.spec), [...S1.SVE_SPEC_FIELDS]);
});

test('S1-F1b — an explicit matching version is accepted; a historical version is not reinterpreted', () => {
  assert.equal(S1.admitSpec(completeSpec({ version: 'sve.spec.v1' })).ok, true);
  refusedExactly(S1.admitSpec(completeSpec({ version: 'sve.spec.v0' })), S1.REFUSAL.VERSION_MISMATCH, 'version');
});

test('S1-F2 — empty intent refuses; the contract does not invent purpose', () => {
  refusedExactly(S1.admitSpec(completeSpec({ intent: '' })), S1.REFUSAL.MISSING_INTENT, 'intent');
  refusedExactly(S1.admitSpec(completeSpec({ intent: '   \n ' })), S1.REFUSAL.MISSING_INTENT, 'intent');
  const absent = completeSpec();
  delete absent.intent;
  refusedExactly(S1.admitSpec(absent), S1.REFUSAL.MISSING_INTENT, 'intent');
});

test('S1-F3 — missing current state refuses; the starting premise must be explicit', () => {
  const absent = completeSpec();
  delete absent.current_state;
  refusedExactly(S1.admitSpec(absent), S1.REFUSAL.MISSING_CURRENT_STATE, 'current_state');
  refusedExactly(S1.admitSpec(completeSpec({ current_state: '' })), S1.REFUSAL.MISSING_CURRENT_STATE, 'current_state');
});

test('S1-F4 — missing target state refuses', () => {
  const absent = completeSpec();
  delete absent.target_state;
  refusedExactly(S1.admitSpec(absent), S1.REFUSAL.MISSING_TARGET_STATE, 'target_state');
});

test('S1-F5 — missing or empty scope refuses; no unbounded specification', () => {
  const absent = completeSpec();
  delete absent.scope;
  refusedExactly(S1.admitSpec(absent), S1.REFUSAL.MISSING_SCOPE, 'scope');
  refusedExactly(S1.admitSpec(completeSpec({ scope: [] })), S1.REFUSAL.MISSING_SCOPE, 'scope');
});

test('S1-F6 — exclusions required; absence is not "everything else is allowed"', () => {
  const absent = completeSpec();
  delete absent.exclusions;
  refusedExactly(S1.admitSpec(absent), S1.REFUSAL.MISSING_EXCLUSIONS, 'exclusions');
  refusedExactly(S1.admitSpec(completeSpec({ exclusions: [] })), S1.REFUSAL.MISSING_EXCLUSIONS, 'exclusions');
  // An intentionally empty exclusion set is expressed explicitly, and admits.
  const explicit = S1.admitSpec(completeSpec({ exclusions: ['none beyond stated scope'] }));
  assert.equal(explicit.ok, true);
  assert.deepEqual(explicit.spec.exclusions, ['none beyond stated scope']);
});

test('S1-F7 — success criteria required; no default completion criterion', () => {
  refusedExactly(S1.admitSpec(completeSpec({ success_criteria: [] })), S1.REFUSAL.MISSING_SUCCESS_CRITERIA, 'success_criteria');
  const absent = completeSpec();
  delete absent.success_criteria;
  refusedExactly(S1.admitSpec(absent), S1.REFUSAL.MISSING_SUCCESS_CRITERIA, 'success_criteria');
});

test('S1-F8 — failure criteria required; failure must be representable before execution', () => {
  refusedExactly(S1.admitSpec(completeSpec({ failure_criteria: [] })), S1.REFUSAL.MISSING_FAILURE_CRITERIA, 'failure_criteria');
});

test('S1-F9 — stop conditions required; no default continuation', () => {
  refusedExactly(S1.admitSpec(completeSpec({ stop_conditions: [] })), S1.REFUSAL.MISSING_STOP_CONDITIONS, 'stop_conditions');
  const absent = completeSpec();
  delete absent.stop_conditions;
  refusedExactly(S1.admitSpec(absent), S1.REFUSAL.MISSING_STOP_CONDITIONS, 'stop_conditions');
});

test('S1-F10 — checkpoint required; no autonomous continuation inferred from silence', () => {
  const absent = completeSpec();
  delete absent.checkpoint;
  refusedExactly(S1.admitSpec(absent), S1.REFUSAL.MISSING_CHECKPOINT, 'checkpoint');
  refusedExactly(S1.admitSpec(completeSpec({ checkpoint: ' ' })), S1.REFUSAL.MISSING_CHECKPOINT, 'checkpoint');
});

test('S1-F10b — authority basis required and opaque; the contract does not supply one', () => {
  const absent = completeSpec();
  delete absent.authority_basis;
  refusedExactly(S1.admitSpec(absent), S1.REFUSAL.MISSING_AUTHORITY_BASIS, 'authority_basis');
  refusedExactly(S1.admitSpec(completeSpec({ authority_basis: [] })), S1.REFUSAL.MISSING_AUTHORITY_BASIS, 'authority_basis');
});

test('S1-F11 — authority basis does not grant authority', () => {
  const out = S1.admitSpec(completeSpec());
  assert.equal(out.ok, true);
  // The record names a Founder authorization and a canonical-merge objective…
  assert.match(out.spec.authority_basis[0], /FOUNDER/);
  assert.match(out.spec.target_state, /canonical merge/);
  // …and exposes no grant-shaped field of any name.
  for (const key of S1.AUTHORITY_GRANT_FIELDS) assert.equal(key in out.spec, false, `${key} must not exist`);
  assert.deepEqual(Object.keys(out.spec), [...S1.SVE_SPEC_FIELDS]);
  assert.ok(out.constraints.some((line) => /grants no authority/i.test(line)));
  // Attempting to add a grant field refuses under the authority law itself,
  // not under the generic unknown-field law.
  refusedExactly(S1.admitSpec(completeSpec({ authority_grants: ['merge'] })), S1.REFUSAL.AUTHORITY_GRANT_FIELD, 'authority_grants');
  refusedExactly(S1.admitSpec(completeSpec({ merge_permission: true })), S1.REFUSAL.AUTHORITY_GRANT_FIELD, 'merge_permission');
});

test('S1-F12 — unknown top-level field refuses (fail closed)', () => {
  refusedExactly(S1.admitSpec(completeSpec({ notes: 'harmless' })), S1.REFUSAL.UNKNOWN_FIELD, 'notes');
});

test('S1-F13 — execution field refuses and is attributed to its stage', () => {
  const out = S1.admitSpec(completeSpec({ execution: { status: 'running' } }));
  refusedExactly(out, S1.REFUSAL.LATER_STAGE_FIELD, 'execution');
  assert.match(out.blockers[0].message, /SVE-04/);
});

test('S1-F14 — environment-binding fields refuse; canonical_sha, branch, worktree are SVE-03', () => {
  for (const field of ['canonical_sha', 'branch', 'worktree', 'model', 'provider']) {
    const out = S1.admitSpec(completeSpec({ [field]: 'x' }));
    refusedExactly(out, S1.REFUSAL.LATER_STAGE_FIELD, field);
    assert.match(out.blockers[0].message, /SVE-03/);
  }
});

test('S1-F15 — verification-contract fields refuse; falsifiers and critic_requirement are SVE-02', () => {
  for (const field of ['falsifiers', 'critic_requirement', 'world_state_evidence', 'verifier_results']) {
    const out = S1.admitSpec(completeSpec({ [field]: ['x'] }));
    refusedExactly(out, S1.REFUSAL.LATER_STAGE_FIELD, field);
    assert.match(out.blockers[0].message, /SVE-02/);
  }
});

test('S1-F16 — human wording is preserved, not semantically enlarged', () => {
  const plain = completeSpec({
    intent: '  Fix the passage flow.  ',
    target_state: 'The passage conversation no longer disappears.',
    scope: ['components/OracleConversation.tsx'],
    exclusions: ['none beyond stated scope'],
    authority_basis: ['founder direction 2026-09-23'],
    inputs: [],
    expected_outputs: [],
    success_criteria: ['the passage conversation persists across a reload'],
    failure_criteria: ['the passage conversation disappears'],
    stop_conditions: ['a second component must change'],
    checkpoint: 'founder review of the diff',
  });
  const out = S1.admitSpec(plain);
  assert.equal(out.ok, true);
  // Only trim is applied; internal wording is verbatim.
  assert.equal(out.spec.intent, 'Fix the passage flow.');
  assert.equal(out.spec.target_state, 'The passage conversation no longer disappears.');
  assert.deepEqual(out.spec.inputs, []);
  assert.deepEqual(out.spec.expected_outputs, []);
  // No inferred level, authority mention, deployment, production or merge objective appears anywhere.
  const text = S1.serializeSpec(out.spec);
  for (const word of ['deploy', 'production', 'merge', 'grant', 'requested_level', 'inferred']) {
    assert.equal(text.includes(word), false, `serialized record must not contain "${word}"`);
  }
  assert.deepEqual(Object.keys(out.spec), [...S1.SVE_SPEC_FIELDS]);
});

test('S1-F16b — non-string content refuses rather than being coerced into meaning', () => {
  refusedExactly(S1.admitSpec(completeSpec({ intent: { text: 'Fix it' } })), S1.REFUSAL.INVALID_FIELD_TYPE, 'intent');
  refusedExactly(S1.admitSpec(completeSpec({ scope: 'everything' })), S1.REFUSAL.INVALID_FIELD_TYPE, 'scope');
  refusedExactly(S1.admitSpec(completeSpec({ success_criteria: ['ok', 42] })), S1.REFUSAL.INVALID_FIELD_TYPE, 'success_criteria');
  refusedExactly(S1.admitSpec(null), S1.REFUSAL.INVALID_INPUT);
  refusedExactly(S1.admitSpec([]), S1.REFUSAL.INVALID_INPUT);
});

test('S1-F17 — admitted record is deeply immutable', () => {
  const input = completeSpec();
  const out = S1.admitSpec(input);
  assert.ok(Object.isFrozen(out));
  assert.ok(Object.isFrozen(out.spec));
  assert.ok(Object.isFrozen(out.spec.scope));
  assert.throws(() => { out.spec.intent = 'Deploy to production.'; }, TypeError);
  assert.throws(() => { out.spec.scope.push('lib/**'); }, TypeError);
  assert.throws(() => { out.spec.grants = ['merge']; }, TypeError);
  assert.throws(() => { out.ok = false; }, TypeError);
  assert.equal(out.spec.intent, input.intent);
  // Mutating the caller's input after admission does not reach the record.
  input.scope.push('lib/**');
  input.intent = 'changed';
  assert.deepEqual(out.spec.scope, ['docs/programme/JARVIS-SVE-01_CONSTITUTION_2026-09-23.md']);
  assert.notEqual(out.spec.intent, 'changed');
});

test('S1-F18 — deterministic equality independent of key order, process state or time', () => {
  const a = S1.admitSpec(completeSpec());
  // Same meaning, reversed key order, built from a fresh object.
  const reversed = Object.fromEntries(Object.entries(completeSpec()).reverse());
  const b = S1.admitSpec(reversed);
  assert.deepEqual(a, b);
  assert.equal(S1.serializeSpec(a.spec), S1.serializeSpec(b.spec));
  // Serialized form is in canonical field order regardless of input order.
  assert.deepEqual(Object.keys(JSON.parse(S1.serializeSpec(b.spec))), [...S1.SVE_SPEC_FIELDS]);
  // Refusals are deterministic too.
  assert.deepEqual(S1.admitSpec(completeSpec({ intent: '' })), S1.admitSpec(completeSpec({ intent: '' })));
});

test('S1-DEFEAT — a multiply-broken fixture reports every violated law, so a single-law witness cannot be satisfied by an earlier rule', () => {
  const broken = completeSpec({ intent: '', scope: [], canonical_sha: 'abc', authority_grants: ['merge'] });
  const out = S1.admitSpec(broken);
  assert.equal(out.ok, false);
  assert.deepEqual(codes(out).sort(), [
    S1.REFUSAL.AUTHORITY_GRANT_FIELD,
    S1.REFUSAL.LATER_STAGE_FIELD,
    S1.REFUSAL.MISSING_INTENT,
    S1.REFUSAL.MISSING_SCOPE,
  ].sort());
});

test('S1-PURITY — the contract module reaches no filesystem, shell, network, clock, randomness or DOM API', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const url = await import('node:url');
  const file = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'src', 'sve-spec-contract.js');
  const source = fs.readFileSync(file, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const forbidden of [
    /\brequire\s*\(/, /\bimport\s*\(/, /\bprocess\b/, /\bDate\b/, /\bMath\.random\b/, /\bfetch\s*\(/,
    /\bdocument\b/, /\bwindow\b/, /\bchild_process\b/, /\bfs\b/, /\bcrypto\b/, /\bsetTimeout\b/,
  ]) {
    assert.equal(forbidden.test(source), false, `contract source must not match ${forbidden}`);
  }
});
