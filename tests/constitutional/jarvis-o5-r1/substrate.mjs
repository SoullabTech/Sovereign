/**
 * JARVIS O5-R1 — shared SUBSTRATE for the falsifier matrix.
 *
 * A deterministic simulated world: one authorized unit of N steps, each step
 * sending ONE external effect whose receipt the world issues. Re-sending an
 * effect issues a NEW receipt and increments the world's effect count — so a
 * duplicated consequence is observable, never inferred.
 *
 * The engine is identical for every candidate. Candidates differ only in the
 * decisions (contract.mjs · ContinuityDecisions). ⛔ This file is an
 * instrument, not an implementation: no filesystem, no clock, no randomness,
 * no store, no schema. ⛔ Never a seed for O5 implementation.
 */
import { createHash } from 'node:crypto';

export class Interrupt extends Error {
  constructor(at) { super(`interrupted at ${at.step}/${at.point}`); this.at = at; }
}

// Crash points, in engine order within one step. Each maps to the checkpoint
// phase left behind (contract EFFECT_PHASES).
export const CRASH_POINTS = Object.freeze([
  'before-dispatch', // phase left: authorized        (effect NOT sent)
  'after-dispatch',  // phase left: dispatched        (effect SENT, unwitnessed)
  'after-witness',   // phase left: effect_witnessed  (receipt held, not ledgered)
  'after-ledger',    // phase left: ledgered          (clean boundary)
]);

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
export const digest = (v) => createHash('sha256').update(canonical(v)).digest('hex');
const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

/** Integrity seal: detects corruption, ⛔ not an adversary holding the store. */
export function seal(cp) {
  const { integrity, ...body } = cp;
  return { ...body, integrity: digest(body) };
}
export function sealValid(cp) {
  if (!cp || typeof cp !== 'object') return false;
  const { integrity, ...body } = cp;
  return integrity === digest(body);
}

export const compute = (state, receipt) => ({ acc: [...state.acc, receipt] });
export const effectKey = (unitId, step) => `${unitId}:e${step}`;

export function makeWorld({ unitId = 'wu-o5r1', steps = 4, salt = 's' } = {}) {
  const core = { allowed_paths: ['lib/example/**'], authorities: ['repo.read', 'repo.write:worktree'] };
  const unit = Object.freeze({
    id: unitId, steps, base_head: 'a'.repeat(40), core, core_digest: digest(core),
    initial_state: Object.freeze({ acc: Object.freeze([]) }),
  });
  const cpStore = new Map();
  const world = {
    salt, unit,
    head: unit.base_head,
    guard: { core_digest: unit.core_digest, state: 'EXECUTING' },
    effects: new Map(),     // effectKey -> times actually sent
    receipts: new Map(),    // effectKey -> latest receipt
    probeOverride: new Map(),
    dropNext: new Set(),    // effectKeys whose next send silently does not land
    ledger: [],
    cp: {
      reads: 0, writes: 0,
      read(id) { this.reads += 1; return clone(cpStore.get(id) ?? null); },
      write(cp) { this.writes += 1; cpStore.set(cp.unit_id, clone(cp)); },
      raw: cpStore,
    },
    programme: {
      o2: { version: 'o2.work-graph.v1', nodes: [{ id: 'n1', kind: 'INSPECT' }, { id: 'n2', kind: 'MODIFY' }] },
      o3: { version: 'o3.authority-plan.v1', entries: [{ id: 'n1', held: ['repo.read'] }] },
      o1Candidates: [],
    },
    lanes: { 'lane-b': { inbox: [], writes: [] } },
  };
  return world;
}

function send(world, key) {
  if (world.dropNext.has(key)) { world.dropNext.delete(key); return; } // sent, never landed
  const n = (world.effects.get(key) ?? 0) + 1;
  world.effects.set(key, n);
  const receipt = `r:${world.salt}:${key}:${n}`;
  world.receipts.set(key, receipt);
  return receipt;
}

export function probe(world, key) {
  if (world.probeOverride.has(key)) return { status: world.probeOverride.get(key) };
  return world.receipts.has(key) ? { status: 'PRESENT', receipt: world.receipts.get(key) } : { status: 'ABSENT' };
}

function writeCp(world, step, phase, state, extra = {}) {
  world.cp.write(seal({
    unit_id: world.unit.id, base_head: world.unit.base_head, core_digest: world.unit.core_digest,
    step, phase, state: clone(state), ...extra,
  }));
}

function ledgerEffect(world, step, receipt, state) {
  world.ledger.push(Object.freeze({ kind: 'attempt', unit_id: world.unit.id, step, receipt }));
  const next = compute(state, receipt);
  writeCp(world, step, 'ledgered', next);
  return next;
}

function executeStep(world, i, state, crash) {
  const hit = (point) => { if (crash && crash.step === i && crash.point === point) throw new Interrupt(crash); };
  writeCp(world, i, 'authorized', state);
  hit('before-dispatch');
  writeCp(world, i, 'dispatched', state);            // written BEFORE sending
  const receipt = send(world, effectKey(world.unit.id, i));
  hit('after-dispatch');
  if (receipt === undefined) throw new Error('substrate: dropped send outside a crash scenario');
  writeCp(world, i, 'effect_witnessed', state, { receipt });
  hit('after-witness');
  const next = ledgerEffect(world, i, receipt, state);
  hit('after-ledger');
  return next;
}

/** Uninterrupted execution from a given step (substrate, identical for all). */
export function runFrom(world, from, state, crash) {
  let s = state;
  for (let i = from; i < world.unit.steps; i += 1) s = executeStep(world, i, s, crash);
  world.final = s;
  return s;
}

/** Apply a candidate's ResumePlan faithfully. The substrate does not judge. */
export function applyPlan(world, plan) {
  if (!plan || plan.disposition !== 'RESUMED') { world.final = null; return; }
  let state = clone(plan.state);
  for (const item of plan.settle ?? []) {
    if (item.action === 'RECORD') state = ledgerEffect(world, item.step, item.receipt, state);
    else if (item.action === 'DISPATCH') state = executeStep(world, item.step, state, null);
  }
  runFrom(world, plan.fromStep, state, null);
}

export function resumeContext(world) {
  const view = Object.freeze(world.ledger.slice());
  return Object.freeze({
    unitId: world.unit.id,
    checkpoints: { read: (id) => world.cp.read(id) },
    unit: world.unit,
    currentGuard: Object.freeze({ ...world.guard }),
    currentHead: world.head,
    probe: (key) => probe(world, key),
    ledger: view,
    effectKey: (step) => effectKey(world.unit.id, step),
  });
}

/**
 * The standard scenario: run, interrupt at `crash`, optionally perturb the
 * world (authority revoked, head moved, store tampered), then resume through
 * the candidate and apply its plan.
 */
export function interruptAndResume(decisions, { crash, perturb, worldOpts } = {}) {
  const world = makeWorld(worldOpts);
  if (typeof worldOpts?.before === 'function') worldOpts.before(world);
  try { runFrom(world, 0, world.unit.initial_state, crash); }
  catch (e) { if (!(e instanceof Interrupt)) throw e; }
  const sentBeforeResume = new Map(world.effects);
  const ledgerBeforeResume = world.ledger.length;
  if (perturb) perturb(world);
  world.cp.reads = 0;
  const plan = decisions.resume(resumeContext(world));
  applyPlan(world, plan);
  return { world, plan, sentBeforeResume, ledgerBeforeResume };
}

/** The uninterrupted history for the same world parameters (the reference outcome). */
export function uninterrupted(worldOpts) {
  const world = makeWorld(worldOpts);
  runFrom(world, 0, world.unit.initial_state, null);
  return world;
}

/** Deliver an admitted consequence finding. Models a NAIVE downstream consumer:
 *  it will act on anything executable the record carries. The law must hold at
 *  admission, because consumers cannot be trusted to ignore what they receive. */
export function deliverFinding(world, admission) {
  if (!admission?.admitted) return;
  const r = admission.record;
  const lane = world.lanes[r.affected_lane];
  if (!lane) return;
  lane.inbox.push(r);
  for (const f of ['patch', 'suggested_patch', 'diff', 'command', 'commands', 'script', 'apply', 'mutation', 'next_act']) {
    if (r[f] !== undefined) lane.writes.push({ field: f, value: r[f] });
  }
}

/** Apply an evidence admission faithfully to ledger and programme. */
export function applyEvidence(world, admission) {
  if (!admission) return;
  if (admission.ledgerEntry) world.ledger.push(admission.ledgerEntry);
  if (admission.o1Candidate) world.programme.o1Candidates.push(admission.o1Candidate);
  for (const n of admission.o2Additions ?? []) world.programme.o2.nodes.push(n);
  for (const e of admission.o3Additions ?? []) world.programme.o3.entries.push(e);
}
