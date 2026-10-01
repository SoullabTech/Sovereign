/**
 * JARVIS O5-R1 — FALSIFIERS F1…F8 (pre-implementation, to be FROZEN).
 *
 * Each falsifier is a pure function of a ContinuityDecisions candidate and
 * returns { id, pass, failures[] }. A falsifier is only admissible if a
 * named defeat candidate (candidates.mjs) dies on it — lethality is proved by
 * matrix.mjs, never assumed.
 *
 * Governing sentence: RECOVERY PRESERVES LAWFUL CONSEQUENCE, NOT MERELY
 * COMPUTATIONAL POSITION.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CAUSES, CAUSE_RESPONSE, CLASSIFICATION_FORBIDDEN_FIELDS, FAILURE_CODE_SOURCES,
  EVIDENCE_KINDS, O1_CANDIDATE_STANDING, CONSEQUENCE_FINDING_FIELDS,
  CONSEQUENCE_FORBIDDEN_FIELDS, O0_GATES,
} from './contract.mjs';
import {
  interruptAndResume, uninterrupted, effectKey, digest, seal, makeWorld,
  applyEvidence, deliverFinding,
} from './substrate.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const STEPS = 4;

function result(id, failures) { return { id, pass: failures.length === 0, failures }; }
function safely(id, fn) {
  try { return result(id, fn()); } catch (e) { return result(id, [`threw: ${e.message}`]); }
}
const count = (world, step) => world.effects.get(effectKey(world.unit.id, step)) ?? 0;
function ledgerSteps(world) {
  const m = new Map();
  for (const e of world.ledger) if (e.kind === 'attempt') m.set(e.step, (m.get(e.step) ?? 0) + 1);
  return m;
}
function completedOnce(world, f, tag) {
  const m = ledgerSteps(world);
  for (let i = 0; i < STEPS; i += 1) {
    if (count(world, i) !== 1) f.push(`${tag}: effect e${i} sent ${count(world, i)}× (must be exactly 1)`);
    if ((m.get(i) ?? 0) !== 1) f.push(`${tag}: step ${i} ledgered ${m.get(i) ?? 0}× (must be exactly 1)`);
  }
}

// ── F1 — Restart-from-zero ────────────────────────────────────────────────────
// Kills: interruption discards lawful completed progress and reruns the unit.
export function F1(d) {
  return safely('F1', () => {
    const f = [];
    const { world, plan } = interruptAndResume(d, { crash: { step: 1, point: 'after-ledger' } });
    if (plan?.disposition !== 'RESUMED') f.push(`clean-boundary interruption must RESUME, got ${plan?.disposition}/${plan?.gate}`);
    if (count(world, 0) > 1 || count(world, 1) > 1) f.push('completed effects e0/e1 were re-sent after resume');
    completedOnce(world, f, 'clean boundary');
    return f;
  });
}

// ── F2 — Blind resume ─────────────────────────────────────────────────────────
// Kills: resume trusts checkpoint state without rechecking current authority,
// freshness, or checkpoint validity. Every case must GATE and send nothing.
export function F2(d) {
  return safely('F2', () => {
    const f = [];
    const crash = { step: 1, point: 'after-ledger' };
    const cases = [
      ['authority re-scoped (W2 authorized core changed)', (w) => { w.guard.core_digest = digest({ changed: true }); }, 'NEEDS_OPERATOR_AUTHORITY'],
      ['authority withdrawn (unit no longer EXECUTING)', (w) => { w.guard.state = 'STOPPED'; }, 'NEEDS_OPERATOR_AUTHORITY'],
      ['canonical tip moved (O2 freshness precondition)', (w) => { w.head = 'b'.repeat(40); }, 'BLOCKED_BY_EVIDENCE'],
      ['checkpoint claims a WIDER core than held (resealed)', (w) => {
        const cp = w.cp.raw.get(w.unit.id);
        w.cp.raw.set(w.unit.id, seal({ ...cp, core_digest: digest({ allowed_paths: ['**'], authorities: ['merge', 'deploy'] }) }));
      }, 'NEEDS_OPERATOR_AUTHORITY'],
      ['checkpoint corrupted (seal broken)', (w) => {
        const cp = w.cp.raw.get(w.unit.id);
        w.cp.raw.set(w.unit.id, { ...cp, step: 0 });
      }, null],
      ['checkpoint belongs to another unit', (w) => {
        const cp = w.cp.raw.get(w.unit.id);
        w.cp.raw.set(w.unit.id, seal({ ...cp, unit_id: 'wu-other' }));
      }, null],
    ];
    for (const [label, perturb, gate] of cases) {
      const { world, plan, sentBeforeResume, ledgerBeforeResume } = interruptAndResume(d, { crash, perturb });
      if (plan?.disposition !== 'GATED') { f.push(`${label}: resumed instead of gating`); }
      else if (gate && plan.gate !== gate) f.push(`${label}: gate ${plan.gate}, expected ${gate}`);
      else if (!gate && (!O0_GATES.includes(plan.gate) || plan.gate === 'CONTINUE')) f.push(`${label}: invalid gate ${plan.gate}`);
      for (const [k, n] of world.effects) if (n !== (sentBeforeResume.get(k) ?? 0)) f.push(`${label}: effect ${k} sent after gating`);
      for (const k of world.effects.keys()) if (!sentBeforeResume.has(k)) f.push(`${label}: new effect ${k} sent`);
      if (world.ledger.length !== ledgerBeforeResume) f.push(`${label}: ledger advanced while gated`);
    }
    return f;
  });
}

// ── F3 — Dead checkpoint ──────────────────────────────────────────────────────
// Kills: checkpoint durably written, but no resume path consumes it.
export function F3(d) {
  return safely('F3', () => {
    const f = [];
    const { world } = interruptAndResume(d, { crash: { step: 1, point: 'after-ledger' } });
    if (world.cp.writes === 0) f.push('substrate wrote no checkpoint (instrument fault)');
    if (world.cp.reads === 0) f.push('resume never read the checkpoint');
    return f;
  });
}

// ── F4 — Error flattening ─────────────────────────────────────────────────────
// Kills: the cause classifier replaces or erases the specific failure code,
// guesses a cause for an unknown code, or carries authority.
export function existingFailureCodes() {
  const codes = new Set();
  for (const rel of FAILURE_CODE_SOURCES) {
    const src = readFileSync(path.join(REPO_ROOT, rel), 'utf8');
    for (const m of src.matchAll(/failure_class\s*[:=]\s*([^,}\n;]+)/g)) {
      for (const lit of m[1].matchAll(/'([A-Z][A-Z0-9_]{2,})'/g)) codes.add(lit[1]);
    }
    for (const m of src.matchAll(/\b(?:fail|nativeRefusal)\(\s*'([A-Z][A-Z0-9_]{2,})'/g)) codes.add(m[1]);
  }
  return [...codes].sort();
}
export function F4(d) {
  return safely('F4', () => {
    const f = [];
    const codes = existingFailureCodes();
    if (codes.length < 40) f.push(`instrument fault: only ${codes.length} existing codes found`);
    for (const code of codes) {
      const c = d.classify(code);
      if (!c || c.code !== code) { f.push(`${code}: specific code not preserved (got ${c?.code})`); continue; }
      if (!CAUSES.includes(c.cause)) f.push(`${code}: cause ${c.cause} not one of the seven`);
      else if (c.response !== CAUSE_RESPONSE[c.cause]) f.push(`${code}: response ${c.response} ≠ lawful ${CAUSE_RESPONSE[c.cause]}`);
      for (const k of CLASSIFICATION_FORBIDDEN_FIELDS) if (k in c) f.push(`${code}: classification carries '${k}'`);
    }
    const run = Object.freeze({ run_id: 'r1', failure_class: 'NATIVE_PATH_OUTSIDE_PACKET' });
    const annotated = { ...run, failure_cause: d.classify(run.failure_class) };
    if (annotated.failure_class !== run.failure_class || annotated.failure_cause?.code !== run.failure_class) {
      f.push('annotated run record lost its specific failure_class');
    }
    const u = d.classify('O5_R1_SYNTHETIC_UNKNOWN_CODE');
    if (!u || u.code !== 'O5_R1_SYNTHETIC_UNKNOWN_CODE') f.push('unknown code not preserved');
    if (u?.cause !== null || u?.classified !== false || u?.response !== 'STOP') f.push(`unknown code guessed into cause ${u?.cause} (must fail closed)`);
    return f;
  });
}

// ── F5 — Evidence escalation ──────────────────────────────────────────────────
// Kills: a proposal or finding becomes O2 work or O3 authority.
export function F5(d) {
  return safely('F5', () => {
    const f = [];
    const inputs = [
      { kind: 'proposal', source_act: 'wu-o5r1', summary: 'inspect adjacent resolver', proposed_kind: 'INSPECT' },
      { kind: 'proposal', source_act: 'wu-o5r1', summary: 'repair the resolver', proposed_kind: 'MODIFY' },
      { kind: 'finding', source_act: 'wu-o5r1', summary: 'unexpected second manuscript', urgency: 'high' },
    ];
    for (const entry of inputs) {
      const world = makeWorld();
      const o2 = digest(world.programme.o2); const o3 = digest(world.programme.o3);
      const adm = d.admitEvidence(entry, world.programme);
      applyEvidence(world, adm);
      const tag = `${entry.kind}/${entry.proposed_kind ?? entry.urgency}`;
      if (digest(world.programme.o2) !== o2) f.push(`${tag}: O2 work graph changed`);
      if (digest(world.programme.o3) !== o3) f.push(`${tag}: O3 authority plan changed`);
      const le = world.ledger.at(-1);
      if (!le || !EVIDENCE_KINDS.includes(le.kind) || le.kind !== entry.kind) f.push(`${tag}: not recorded as '${entry.kind}' ledger evidence`);
      if (le && ('authorized' in le || 'grant' in le || 'grants' in le)) f.push(`${tag}: ledger entry carries authority`);
      const cands = world.programme.o1Candidates;
      if (entry.kind === 'proposal') {
        if (cands.length !== 1) f.push(`${tag}: proposal must surface as exactly one O1 candidate`);
        const c = cands[0];
        if (c && c.standing !== O1_CANDIDATE_STANDING) f.push(`${tag}: O1 standing ${c.standing} (must be ${O1_CANDIDATE_STANDING})`);
        if (c && (!Array.isArray(c.authority_grants) || c.authority_grants.length !== 0)) f.push(`${tag}: O1 candidate carries grants`);
      } else if (cands.length !== 0) f.push(`${tag}: a finding became an O1 candidate`);
    }
    return f;
  });
}

// ── F6 — Cross-lane write leakage ─────────────────────────────────────────────
// Kills: a consequence finding can carry mutation, grant or instruction into
// another lane. Refusal must be explicit; the admitted field set is closed.
export function F6(d) {
  return safely('F6', () => {
    const f = [];
    const lawful = { kind: 'finding', source_act: 'wu-o5r1', affected_lane: 'lane-b', reason: 'identity resolution now differs', evidence_refs: ['ledger:3'], urgency: 'normal' };
    const ok = d.admitConsequenceFinding(lawful);
    if (!ok?.admitted) f.push('lawful consequence finding refused');
    else {
      for (const k of Object.keys(ok.record)) if (!CONSEQUENCE_FINDING_FIELDS.includes(k)) f.push(`admitted record carries '${k}'`);
      const w = makeWorld(); deliverFinding(w, ok);
      if (w.lanes['lane-b'].inbox.length !== 1) f.push('lawful finding did not reach the affected lane');
    }
    const attacks = [
      ...CONSEQUENCE_FORBIDDEN_FIELDS.map((k) => [k, { ...lawful, [k]: k === 'allowed_paths' ? ['lane-b/**'] : `x-${k}` }]),
      ['unlisted field', { ...lawful, target_file: 'lane-b/resolver.ts' }],
    ];
    for (const [label, input] of attacks) {
      const w = makeWorld();
      const adm = d.admitConsequenceFinding(input);
      deliverFinding(w, adm);
      if (adm?.admitted) f.push(`'${label}': admitted`);
      if (w.lanes['lane-b'].writes.length) f.push(`'${label}': wrote into lane-b`);
    }
    return f;
  });
}

// ── F7 — Cosmetic recovery ────────────────────────────────────────────────────
// Kills: resume reads the checkpoint but reconstructs execution state from the
// original unit instead of the checkpointed state. The pre-interruption
// history (its receipts) must be exactly what the continuation carries.
export function F7(d) {
  return safely('F7', () => {
    const f = [];
    for (const salt of ['s', 't']) {
      for (const crash of [{ step: 1, point: 'after-ledger' }, { step: 2, point: 'after-ledger' }]) {
        const ref = uninterrupted({ salt }).final.acc;
        const { world, plan } = interruptAndResume(d, { crash, worldOpts: { salt } });
        const tag = `salt=${salt} crash=${crash.step}/${crash.point}`;
        if (plan?.disposition !== 'RESUMED') { f.push(`${tag}: did not continue`); continue; }
        const got = world.final?.acc ?? [];
        if (JSON.stringify(got) !== JSON.stringify(ref)) f.push(`${tag}: continuation state ${JSON.stringify(got)} ≠ lawful history ${JSON.stringify(ref)}`);
      }
    }
    return f;
  });
}

// ── F8 — Effect repetition (idempotence boundary) ─────────────────────────────
// Kills: resume continues from "step N" and re-sends an effect that already
// happened. Lawful consequence must be recorded exactly once; an effect of
// unknown standing must GATE; an effect proven ABSENT may lawfully be re-sent.
export function F8(d) {
  return safely('F8', () => {
    const f = [];
    // (a) receipt witnessed, not ledgered
    {
      const { world, plan } = interruptAndResume(d, { crash: { step: 1, point: 'after-witness' } });
      if (plan?.disposition !== 'RESUMED') f.push('(a) witnessed-not-ledgered: did not continue');
      completedOnce(world, f, '(a) witnessed-not-ledgered');
      const e1 = world.ledger.find((e) => e.kind === 'attempt' && e.step === 1);
      if (e1 && !e1.receipt.endsWith(':e1:1')) f.push('(a) ledgered a receipt other than the witnessed one');
    }
    // (b) sent, unwitnessed, probe PRESENT
    {
      const { world, plan } = interruptAndResume(d, { crash: { step: 1, point: 'after-dispatch' } });
      if (plan?.disposition !== 'RESUMED') f.push('(b) dispatched/PRESENT: did not continue');
      completedOnce(world, f, '(b) dispatched/PRESENT');
    }
    // (c) sent, standing UNKNOWN → must gate on evidence, send nothing
    {
      const { world, plan } = interruptAndResume(d, {
        crash: { step: 1, point: 'after-dispatch' },
        perturb: (w) => w.probeOverride.set(effectKey(w.unit.id, 1), 'UNKNOWN'),
      });
      if (plan?.disposition !== 'GATED' || plan.gate !== 'BLOCKED_BY_EVIDENCE') f.push(`(c) unknown effect standing: ${plan?.disposition}/${plan?.gate}, expected GATED/BLOCKED_BY_EVIDENCE`);
      if (count(world, 1) !== 1) f.push(`(c) unknown effect re-sent (${count(world, 1)}×)`);
    }
    // (d) positive control: never sent → must send exactly once
    {
      const { world, plan } = interruptAndResume(d, { crash: { step: 1, point: 'before-dispatch' } });
      if (plan?.disposition !== 'RESUMED') f.push('(d) authorized-not-sent: did not continue');
      completedOnce(world, f, '(d) authorized-not-sent');
    }
    // (e) positive control: sent but proven ABSENT → lawful re-send, lands once
    {
      const { world, plan } = interruptAndResume(d, {
        crash: { step: 1, point: 'after-dispatch' },
        worldOpts: { before: (w) => w.dropNext.add(effectKey(w.unit.id, 1)) },
      });
      if (plan?.disposition !== 'RESUMED') f.push('(e) dispatched/ABSENT: did not continue');
      completedOnce(world, f, '(e) dispatched/ABSENT');
    }
    return f;
  });
}

export const FALSIFIERS = Object.freeze({ F1, F2, F3, F4, F5, F6, F7, F8 });
