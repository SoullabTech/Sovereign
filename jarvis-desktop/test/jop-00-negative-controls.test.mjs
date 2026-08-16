// JOP-00 negative controls — the three the composition still owed.
//
// These prove BEHAVIOUR, not text. Each control asserts what the system does
// when the thing it needs is absent, because "it works when everything is
// present" is the easy half and never the half that fails a founder at 8am.
//
// Standing lesson these encode (2026-08-14 two-process referent error): a stale
// or nearby replica that ANSWERS is worse than one that fails. Every control
// below therefore checks not only "did it refuse" but "did it refuse instead of
// finding something else that would have answered".

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const MECH = require(path.join(REPO, 'jarvis-desktop', 'src', 'builder-mechanism.js'));

let sandbox, decoyRoot, markerOnlyRoot;

before(() => {
  sandbox = mkdtempSync(path.join(tmpdir(), 'jop00-'));

  // DECOY: a complete, perfectly valid mechanism sitting somewhere else on disk.
  // This is the whole point of control 1 — JARVIS must refuse while a working
  // mechanism is within reach, rather than opportunistically resolving to it.
  decoyRoot = path.join(sandbox, 'decoy-checkout');
  mkdirSync(path.join(decoyRoot, 'scripts', 'builder'), { recursive: true });
  for (const m of MECH.MECHANISM_MODULES) {
    cpSync(path.join(REPO, 'scripts', 'builder', m),
           path.join(decoyRoot, 'scripts', 'builder', m));
  }

  // MARKER-ONLY: a root that looks like a Sovereign checkout but predates the
  // mechanism cluster landing. "I know the repo, and this repo cannot do it."
  markerOnlyRoot = path.join(sandbox, 'marker-only-checkout');
  mkdirSync(path.join(markerOnlyRoot, 'scripts', 'builder'), { recursive: true });
  mkdirSync(path.join(markerOnlyRoot, 'app'), { recursive: true });
  mkdirSync(path.join(markerOnlyRoot, 'lib'), { recursive: true });
  mkdirSync(path.join(markerOnlyRoot, 'docs'), { recursive: true });
  writeFileSync(path.join(markerOnlyRoot, 'package.json'), '{"name":"maia-sovereign"}');
  writeFileSync(path.join(markerOnlyRoot, 'CLAUDE.md'), '# marker only');
});

after(() => { try { rmSync(sandbox, { recursive: true, force: true }); } catch {} });

// ─────────────────────────────────────────────────────────────────────────────
describe('CONTROL 1 — unbound repository', () => {
  test('mechanism is UNAVAILABLE with a named reason, not a vague one', () => {
    const s = MECH.mechanismState(null);
    assert.equal(s.available, false, 'must not be available with nothing bound');
    assert.ok(s.reason && s.reason.length > 20, 'reason must be stated, not null');
    assert.match(s.reason, /bound/i, 'reason must name binding as the cause');
  });

  test('source is NULL — nothing is claimed as the substrate', () => {
    assert.equal(MECH.mechanismState(null).source, null);
  });

  test('every module reports absent — no partial optimism', () => {
    const s = MECH.mechanismState(null);
    assert.equal(s.modules.length, MECH.MECHANISM_MODULES.length);
    assert.ok(s.modules.every((m) => m.present === false));
  });

  test('a VALID mechanism elsewhere on disk is NOT adopted (no opportunistic fallback)', () => {
    // Prove the decoy is genuinely complete and would satisfy the check if bound.
    const decoy = MECH.mechanismState(decoyRoot);
    assert.equal(decoy.available, true, 'fixture invalid: decoy must itself be usable');

    // Now the actual control: unbound must still refuse.
    const unbound = MECH.mechanismState(null);
    assert.equal(unbound.available, false, 'a nearby valid mechanism must not rescue an unbound state');
    assert.equal(unbound.source, null);
    assert.ok(!JSON.stringify(unbound).includes(decoyRoot),
      'the decoy path must not appear anywhere in the unbound answer');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CONTROL 2 — repository bound, mechanism absent', () => {
  test('this is a DIFFERENT state from unbound, not another flavour of UNKNOWN', () => {
    const unbound = MECH.mechanismState(null);
    const bound = MECH.mechanismState(markerOnlyRoot);
    assert.equal(unbound.available, false);
    assert.equal(bound.available, false);
    assert.notEqual(unbound.reason, bound.reason,
      'the two failure modes must not collapse into one message');
    assert.equal(unbound.source, null, 'unbound claims no substrate');
    assert.ok(bound.source, 'bound names the substrate it inspected');
  });

  test('the missing modules are NAMED, all five of them', () => {
    const s = MECH.mechanismState(markerOnlyRoot);
    for (const m of MECH.MECHANISM_MODULES) {
      assert.ok(s.reason.includes(m), `reason must name the missing module ${m}`);
    }
  });

  test('the inspected directory is named, so the founder can see WHERE it looked', () => {
    const s = MECH.mechanismState(markerOnlyRoot);
    assert.ok(s.reason.includes(s.source), 'reason must include the directory it inspected');
    assert.ok(s.source.startsWith(markerOnlyRoot), 'must have inspected the BOUND root');
  });

  test('no fallback: a complete mechanism elsewhere does not fill the gap', () => {
    const s = MECH.mechanismState(markerOnlyRoot);
    assert.equal(s.available, false);
    assert.ok(!JSON.stringify(s).includes(decoyRoot),
      'the bound-but-empty answer must not reach for the decoy');
  });

  test('partial presence still refuses, and names only what is actually missing', () => {
    const partial = path.join(sandbox, 'partial-checkout');
    mkdirSync(path.join(partial, 'scripts', 'builder'), { recursive: true });
    const [first, ...rest] = MECH.MECHANISM_MODULES;
    cpSync(path.join(REPO, 'scripts', 'builder', first),
           path.join(partial, 'scripts', 'builder', first));
    const s = MECH.mechanismState(partial);
    assert.equal(s.available, false, 'four of five is not a mechanism');
    assert.ok(!s.reason.includes(first), 'must not name a module that IS present');
    for (const m of rest) assert.ok(s.reason.includes(m), `must name missing ${m}`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CONTROL 3 — C3 automatic execution is absent (behavioural)', () => {
  let pipeline;
  before(async () => {
    process.env.AIN_DELEGATION_HOME = path.join(sandbox, 'runtime-home');
    pipeline = await import(
      path.join(REPO, 'scripts', 'builder', 'jarvis-runtime-pipeline.mjs'));
  });

  const c3Packet = (over = {}) => ({
    work_unit_id: 'jop-00-c3-control',
    objective: 'a C3-shaped unit that must never auto-execute',
    expected_output: 'a refusal',
    execution_lane: 'claude-c3',
    canonical_sha: '310578ca8526000000000000000000000000abcd',
    context_selectors: [],
    ...over,
  });

  test('the lane is not in the read-only admission set', () => {
    assert.deepEqual(pipeline.READ_ONLY_LANES, ['local-native']);
    assert.ok(!pipeline.READ_ONLY_LANES.includes('claude-c3'));
  });

  test('checkAuthority refuses the C3 lane by class, before anything runs', () => {
    const r = pipeline.checkAuthority(c3Packet());
    assert.equal(r.ok, false);
    assert.equal(r.failure_class, 'LANE_NOT_PERMITTED');
    assert.match(r.detail, /local-native/);
  });

  test('TRIPWIRE: executing a C3 run spawns NOTHING and mutates NOTHING', async () => {
    let spawns = 0;
    const emitted = [];
    const states = [];
    const run = { run_id: 'r-jop00c3', packet: c3Packet(), state: 'QUEUED', history: [] };

    // The runtime owns persistence; this module owns only the seam. Supply the
    // same three hooks the real caller does, each of them instrumented.
    const out = await pipeline.executeRun(run, {
      transition: (r, state, patch) => { states.push(state); Object.assign(r, { state }, patch || {}); },
      emit: (n) => emitted.push(n),
      registerChild: () => { spawns += 1; throw new Error('TRIPWIRE: child registered'); },
      spawnDelegate: () => { spawns += 1; throw new Error('TRIPWIRE: worker spawn attempted'); },
    });

    assert.equal(spawns, 0, 'a C3 packet must never reach the worker-spawn seam');
    assert.ok(states.includes('FAILED'), `expected a FAILED transition, saw ${states.join(' → ')}`);
    assert.equal(run.failure_class, 'LANE_NOT_PERMITTED', 'must fail by lane, named');
    assert.ok(!states.includes('RUNNING'), 'must never enter RUNNING');
    assert.ok(!states.includes('VERIFIED'), 'a refused lane must never end VERIFIED');
    assert.ok(!emitted.includes('worker.started'), 'no worker may be announced as started');
  });

  test('TRIPWIRE: a write-requesting packet on the AUTHORIZED lane is still refused', () => {
    for (const key of ['allow_write', 'requested_write_authority', 'repo_write_scope']) {
      const r = pipeline.checkAuthority(c3Packet({ execution_lane: 'local-native', [key]: true }));
      assert.equal(r.ok, false, `${key}: write request must be refused`);
      assert.equal(r.failure_class, 'LOCAL_WRITE_AUTHORITY_REFUSED');
    }
  });

  test('the authorized lane IS admitted — proving these controls can distinguish', () => {
    const r = pipeline.checkAuthority(c3Packet({ execution_lane: 'local-native' }));
    assert.equal(r.ok, true, 'negative controls are worthless if nothing ever passes');
  });
});
