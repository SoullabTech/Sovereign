// Proof for the C0 -> validateWorkerGate -> executeRun wire, scoped to
// `local-native` (founder ruling 2026-08-14).
//
// WHAT THIS ESTABLISHES. That the Desktop seam does not become an authority of
// its own: refusals come from the mechanism, arrive intact, and the bound root
// is the only place a mechanism is ever loaded from.
//
// WHAT IT DOES NOT ESTABLISH. That a work unit completes end to end. The delegate
// is canned at `ctx.spawnDelegate` — the ONE seam the pipeline exposes for this —
// so the stages around it run for real while no ain-delegate.sh is invoked. Tests
// are named for the stage they actually reach.
//
// Side effects are contained: AIN_DELEGATION_HOME is redirected to a temp dir
// before every mechanism load, so the live delegation substrate is never touched.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { EventEmitter } from 'node:events';

const require = createRequire(import.meta.url);
const MECH = require('../src/builder-mechanism.js');

const SRC = fs.readFileSync(new URL('../src/builder-mechanism.js', import.meta.url), 'utf8');

/**
 * Assert on CODE, not prose. The file's comments legitimately NAME the checks it
 * must not perform (READ_ONLY_LANES, the gate) in order to explain where those
 * checks live. Asserting against raw source would therefore fail on the very
 * documentation that makes the boundary legible.
 */
const CODE = SRC
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((l) => !l.trim().startsWith('//'))
  .join('\n');

/** A checkout that genuinely carries the cluster: the branch that landed it. */
const CLUSTER_ROOT = '/Users/soullab/.claude/worktrees/jarvis-builder-cluster';

let tmp, emptyRoot, ainHome, fakeWorktree;

before(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-wire-'));
  emptyRoot = path.join(tmp, 'empty-root');
  fs.mkdirSync(path.join(emptyRoot, 'scripts', 'builder'), { recursive: true });
  fs.writeFileSync(path.join(emptyRoot, 'package.json'), '{"name":"empty"}');
  ainHome = path.join(tmp, 'ain-home');
  // The pipeline writes packets/results/logs under AIN_HOME; initStore() only
  // creates the runs dir. In live operation these already exist, so create them
  // here rather than treating their absence as a wire defect.
  for (const d of ['packets', 'results', 'logs', 'runtime']) {
    fs.mkdirSync(path.join(ainHome, d), { recursive: true });
  }
  fakeWorktree = path.join(tmp, 'worktree');
  fs.mkdirSync(fakeWorktree, { recursive: true });
  process.env.AIN_DELEGATION_HOME = ainHome;
});

after(() => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {} });

const packet = (over = {}) => ({
  work_unit_id: 'wire-proof-unit',
  objective: 'Prove the Desktop seam does not become an authority of its own.',
  expected_output: 'A recorded run whose refusals originate in the mechanism.',
  canonical_sha: '334c11f92',
  execution_lane: MECH.AUTHORIZED_LANE,
  worktree: fakeWorktree, // supplied so no real worktree is claimed
  ...over,
});

/** A delegate that exits 0 without doing anything. Never spawns a process. */
const cannedDelegate = () => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  setImmediate(() => child.emit('close', 0, null));
  return child;
};

// ── availability, named failure modes ───────────────────────────────────────

test('no repository bound -> unavailable, and says so by name', () => {
  const s = MECH.mechanismState(null);
  assert.equal(s.available, false);
  assert.match(s.reason, /no execution substrate is bound/);
  assert.equal(s.source, null);
});

test('bound root without the cluster -> unavailable, naming every missing module and the directory', () => {
  const s = MECH.mechanismState(emptyRoot);
  assert.equal(s.available, false);
  for (const m of MECH.MECHANISM_MODULES) assert.ok(s.reason.includes(m), `reason omits ${m}`);
  assert.ok(s.reason.includes(path.join(emptyRoot, 'scripts', 'builder')));
  assert.equal(s.modules.filter((m) => m.present).length, 0);
});

test('bound root carrying the cluster -> available on the local-native lane', (t) => {
  if (!fs.existsSync(CLUSTER_ROOT)) return t.skip('cluster worktree absent on this machine');
  const s = MECH.mechanismState(CLUSTER_ROOT);
  assert.equal(s.available, true);
  assert.equal(s.lane, 'local-native');
  assert.equal(s.source, path.join(CLUSTER_ROOT, 'scripts', 'builder'));
  assert.equal(s.reason, null);
});

// ── the referent discipline this wire exists under ──────────────────────────

test('NO SUBSTITUTION: an empty bound root stays unavailable even though a real mechanism exists elsewhere on disk', async (t) => {
  if (!fs.existsSync(CLUSTER_ROOT)) return t.skip('cluster worktree absent on this machine');
  assert.equal(MECH.mechanismState(CLUSTER_ROOT).available, true, 'precondition: a valid mechanism exists elsewhere');
  const r = await MECH.runWorkUnit(emptyRoot, packet(), {});
  assert.equal(r.submitted, false);
  assert.equal(r.outcome, 'MECHANISM_UNAVAILABLE');
  assert.equal(r.run, null);
  assert.match(r.reason, /does not carry the builder execution mechanism/);
});

test('NO SUBSTITUTION: the source contains no fallback path of any kind', () => {
  assert.doesNotMatch(CODE, /require\.resolve/);
  assert.doesNotMatch(CODE, /process\.resourcesPath/);
  // The only directory the mechanism is read from is derived from the passed root.
  const dirDerivations = CODE.match(/path\.join\([^)]*'scripts',\s*'builder'/g) || [];
  assert.equal(dirDerivations.length, 1, 'exactly one mechanism directory derivation');
  assert.match(CODE, /const mechanismDir = \(root\) => path\.join\(root, 'scripts', 'builder'\)/);
});

test('re-binding the repository re-evaluates availability in the same process', (t) => {
  if (!fs.existsSync(CLUSTER_ROOT)) return t.skip('cluster worktree absent on this machine');
  assert.equal(MECH.mechanismState(emptyRoot).available, false);
  assert.equal(MECH.mechanismState(CLUSTER_ROOT).available, true);
  assert.equal(MECH.mechanismState(emptyRoot).available, false);
});

// ── admission belongs to the mechanism ──────────────────────────────────────

test('a non-permitted lane is refused BY THE MECHANISM, with its own failure_class', async (t) => {
  if (!fs.existsSync(CLUSTER_ROOT)) return t.skip('cluster worktree absent on this machine');
  const r = await MECH.runWorkUnit(CLUSTER_ROOT, packet({ execution_lane: 'C3' }), { spawnDelegate: cannedDelegate });
  assert.equal(r.submitted, true, 'Desktop submits it rather than pre-judging it');
  assert.equal(r.outcome, 'FAILED');
  assert.equal(r.failure_class, 'LANE_NOT_PERMITTED');
  assert.match(r.failure_detail, /local-native/);
});

test('a write-requesting packet is refused BY THE MECHANISM', async (t) => {
  if (!fs.existsSync(CLUSTER_ROOT)) return t.skip('cluster worktree absent on this machine');
  const r = await MECH.runWorkUnit(CLUSTER_ROOT, packet({ allow_write: true }), { spawnDelegate: cannedDelegate });
  assert.equal(r.outcome, 'FAILED');
  assert.equal(r.failure_class, 'LOCAL_WRITE_AUTHORITY_REFUSED');
});

test('Desktop does not imitate the mechanism\'s authority checks', () => {
  // No Desktop-side copy of the boundary: these belong to the pipeline alone.
  assert.doesNotMatch(CODE, /READ_ONLY_LANES/);
  assert.doesNotMatch(CODE, /LANE_NOT_PERMITTED/);
  assert.doesNotMatch(CODE, /LOCAL_WRITE_AUTHORITY_REFUSED/);
  assert.doesNotMatch(CODE, /WRITE_REQUESTING_KEYS/);
  // The advisory preflight is labelled as advisory and decides nothing.
  const note = MECH.advisoryLaneNote('C3');
  assert.equal(note.advisory, true);
  assert.equal(note.expected, 'refusal');
  assert.match(note.note, /not Desktop's decision/);
});

test('the advisory preflight never blocks a submission', async (t) => {
  if (!fs.existsSync(CLUSTER_ROOT)) return t.skip('cluster worktree absent on this machine');
  assert.equal(MECH.advisoryLaneNote('C3').expected, 'refusal');
  // Submitted anyway, and answered by the mechanism — not short-circuited here.
  const r = await MECH.runWorkUnit(CLUSTER_ROOT, packet({ execution_lane: 'C3' }), { spawnDelegate: cannedDelegate });
  assert.equal(r.submitted, true);
  assert.equal(r.failure_class, 'LANE_NOT_PERMITTED');
});

// ── the admissible lane proceeds through the governed stages ────────────────

test('local-native is admitted and proceeds through the governed stages to the delegate seam', async (t) => {
  if (!fs.existsSync(CLUSTER_ROOT)) return t.skip('cluster worktree absent on this machine');
  const r = await MECH.runWorkUnit(CLUSTER_ROOT, packet(), { spawnDelegate: cannedDelegate });
  assert.equal(r.submitted, true);
  const states = r.events.filter((e) => e.kind === 'transition').map((e) => e.to);
  // Admission passed: it got past VALIDATING (validatePacket + checkAuthority).
  assert.ok(states.includes('VALIDATING'), `never validated: ${states.join(' -> ')}`);
  assert.ok(!['LANE_NOT_PERMITTED', 'LOCAL_WRITE_AUTHORITY_REFUSED'].includes(r.failure_class),
    `admission refused the authorized lane: ${r.failure_class}`);
  // Context routing passed: leakage lint and worktree binding were satisfied.
  assert.ok(states.includes('CONTEXT_ROUTING'), `never routed: ${states.join(' -> ')}`);
  // Every transition the mechanism made was one its own state machine allows.
  const illegal = r.events.filter((e) => e.kind === 'transition' && !e.legal);
  assert.deepEqual(illegal, [], `illegal transitions: ${JSON.stringify(illegal)}`);
});

test('the run is persisted under the redirected AIN home, not the live substrate', async (t) => {
  if (!fs.existsSync(CLUSTER_ROOT)) return t.skip('cluster worktree absent on this machine');
  const r = await MECH.runWorkUnit(CLUSTER_ROOT, packet(), { spawnDelegate: cannedDelegate });
  const runFile = path.join(ainHome, 'runtime', 'runs', `${r.run.run_id}.json`);
  assert.ok(fs.existsSync(runFile), `run not persisted at ${runFile}`);
  const saved = JSON.parse(fs.readFileSync(runFile, 'utf8'));
  assert.equal(saved.origin, 'jarvis-desktop');
});

// ── refusals and gates arrive intact ────────────────────────────────────────

test('Desktop never constructs, amends or resolves a governance gate', () => {
  // It may only pass one through. Anything else would make Desktop the resolver.
  assert.doesNotMatch(CODE, /GATE_[A-Z_]+/);
  assert.doesNotMatch(CODE, /gate_class/);
  assert.doesNotMatch(CODE, /resolveGovernanceGate|publicGovernanceGate/);
  assert.match(CODE, /governance_gate: finished\.governance_gate \?\? null/,
    'the gate must be surfaced verbatim from the finished run');
});

test('the mechanism\'s gate validator is loaded from the same directory as the pipeline that calls it', (t) => {
  if (!fs.existsSync(CLUSTER_ROOT)) return t.skip('cluster worktree absent on this machine');
  const pipelineSrc = fs.readFileSync(path.join(CLUSTER_ROOT, 'scripts', 'builder', 'jarvis-runtime-pipeline.mjs'), 'utf8');
  assert.match(pipelineSrc, /import \{ validateWorkerGate \} from '\.\/jarvis-governance-gate\.mjs'/);
  // Desktop imports only the pipeline and the store; it never reaches past them
  // to hand the pipeline a different gate.
  assert.doesNotMatch(CODE, /jarvis-governance-gate\.mjs'\)/);
});

test('a Desktop-side fault is labelled as a fault, never as a governed refusal', () => {
  assert.match(CODE, /outcome: 'MECHANISM_UNAVAILABLE'/);
  // FAILED / refusal classes are never authored here — they only ever arrive
  // from the mechanism's own finished run.
  assert.doesNotMatch(CODE, /outcome: 'FAILED'/);
});
