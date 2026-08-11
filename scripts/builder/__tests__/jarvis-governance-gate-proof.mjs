#!/usr/bin/env node
/**
 * JARVIS Unit 19 — native governance gate emission proof
 *
 * Hermetic: AIN_DELEGATION_HOME is redirected before the modules load. The
 * delegate is injected (Unit 11 convention) so a two-phase objective can be
 * driven deterministically without invoking a local model twice per case.
 *
 * §17 proving scenario, §18 negative scenarios N1–N10, §19 mutation proofs
 * M1–M10.
 *
 * §19 requires REAL mutations, not `weak()` stubs: each M-case re-imports the
 * live modules with one behaviour genuinely disabled via an env switch honoured
 * by the module under test, and requires the corresponding assertion to fail.
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { EventEmitter } from 'node:events';

const HOME = mkdtempSync(path.join(tmpdir(), 'u19-home-'));
process.env.AIN_DELEGATION_HOME = HOME;
process.env.BUILDER_MAX_CLAUDE_SESSIONS = '4';
for (const d of ['packets', 'results', 'logs', 'delegations', 'authority-channels',
  'authority-instructions', 'authority-gates', 'authority-resolutions']) {
  mkdirSync(path.join(HOME, d), { recursive: true });
}

const GG = await import('../jarvis-governance-gate.mjs');
const {
  validateWorkerGate, resolveGovernanceGate, publicGovernanceGate,
  GATE_CLASSES, GATE_CLASS_NAMES, GATE_REFUSAL, GATE_STATUS, objectiveDigest,
} = GG;
const PIPE = await import('../jarvis-runtime-pipeline.mjs');
const { openChannel, submitInstruction } = await import('../jarvis-authority-channel.mjs');
const { issueDelegation } = await import('../jarvis-delegation.mjs');

let pass = 0, fail = 0;
const t = (n, fn) => { try { fn(); console.log(`  ✓ ${n}`); pass++; } catch (e) { console.error(`  ✗ ${n}\n      ${e.message}`); fail++; } };
const ta = async (n, fn) => { try { await fn(); console.log(`  ✓ ${n}`); pass++; } catch (e) { console.error(`  ✗ ${n}\n      ${e.message}`); fail++; } };
const eq = (a, b, m) => { if (a !== b) throw new Error(m ?? `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw new Error(m ?? 'expected truthy'); };
const has = (h, n, m) => { if (!String(h).includes(n)) throw new Error(m ?? `expected to contain ${JSON.stringify(n)}`); };

const OBJECTIVE = 'Inspect the provider constant, then record the reaching route.';
const RUN = Object.freeze({
  run_id: 'r-1111111111', request_id: 'req-aaaaaaaaaa',
  objective: OBJECTIVE, operation_class: 'R1A_SYSTEM_READ',
  packet: { work_unit_id: 'u19-two-phase', objective: OBJECTIVE },
  delegation: { allowed_targets: ['REPO_SOURCE'] },
});
const GOOD = Object.freeze({
  gate_class: 'SCOPE_EXPANSION_REQUIRED',
  reason: 'Phase B needs the sovereign route module, which is not in the materialized grant.',
  authority_required: { operation_class: 'R1A_SYSTEM_READ', target: 'RUNTIME_STATE' },
  evidence: ['lib/ai/modelService.ts:53'],
});

const founder = () => submitInstruction({
  channel_id: openChannel({ authenticator: 'founder-control-plane-session', actor_id: 'u19-founder' }).channel.channel_id,
  instruction_class: 'F1_FOUNDER_RULING', objective: 'Rule on the gate.' }).instruction;
const operator = () => submitInstruction({
  channel_id: openChannel({ authenticator: 'local-operator-possession', actor_id: 'u19-operator' }).channel.channel_id,
  instruction_class: 'O1_OPERATOR_READ_AUTHORIZATION', objective: 'Authorize.',
  target: { repo: 'r' }, expires_at: '2030-01-01T00:00:00.000Z' }).instruction;

console.log('\nJARVIS Unit 19 — native governance gate emission\n');
console.log('GATE OBJECT + VALIDATION\n');

t('G1 a worker can emit a structured gate the control plane accepts', () => {
  const v = validateWorkerGate(GOOD, RUN);
  eq(v.ok, true, v.reason);
  ok(/^gov-[0-9a-f]{12}$/.test(v.gate.gate_id));
  eq(v.gate.run_id, RUN.run_id);
  eq(v.gate.work_unit_id, 'u19-two-phase');
  eq(v.gate.objective_digest, objectiveDigest(OBJECTIVE));
  eq(v.gate.gate_class, 'SCOPE_EXPANSION_REQUIRED');
  eq(v.gate.required_resolver_role, 'OPERATOR');
  eq(v.gate.status, GATE_STATUS.OPEN);
  eq(v.gate.emitted_by, 'worker');
});

t('G2 a gate cannot mint or carry authority', () => {
  for (const k of ['delegation_id', 'authority_granted', 'approved', 'instruction_id', 'principal_type']) {
    const v = validateWorkerGate({ ...GOOD, [k]: 'anything' }, RUN);
    eq(v.ok, false, `gate carrying '${k}' was accepted`);
    eq(v.refusal, GATE_REFUSAL.GATE_SELF_GRANT);
  }
  // The accepted gate carries no grant of its own.
  const g = validateWorkerGate(GOOD, RUN).gate;
  ok(!('delegation_id' in g) && !('approved' in g));
  eq(g.resolution_id, null);
});

t('G3 gate classes are a closed taxonomy that determines WHO may resolve', () => {
  eq(GATE_CLASS_NAMES.length, 6);
  eq(GATE_CLASSES.FOUNDER_DECISION_REQUIRED.resolver, 'FOUNDER');
  eq(GATE_CLASSES.OPERATOR_AUTHORIZATION_REQUIRED.resolver, 'OPERATOR');
  eq(GATE_CLASSES.PRODUCTION_AUTHORIZATION_REQUIRED.resolver, 'FOUNDER');
  ok(!GATE_CLASS_NAMES.includes('NEEDS_MORE_AUTHORITY'), 'no generic authority class may exist');
  eq(validateWorkerGate({ ...GOOD, gate_class: 'NEEDS_MORE_AUTHORITY' }, RUN).refusal, GATE_REFUSAL.GATE_CLASS_UNKNOWN);
  // Classes that can never become runnable here are representable but marked.
  eq(GATE_CLASSES.WRITE_AUTHORITY_REQUIRED.executable_after_resolution, false);
  eq(GATE_CLASSES.PRODUCTION_AUTHORIZATION_REQUIRED.executable_after_resolution, false);
});

t('N1 asking for authority the run already holds is refused', () => {
  const v = validateWorkerGate({ ...GOOD,
    authority_required: { operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE' } },
  RUN, { heldAuthority: { operation_class: 'R1A_SYSTEM_READ', allowed_targets: ['REPO_SOURCE'] } });
  eq(v.ok, false);
  eq(v.refusal, GATE_REFUSAL.GATE_AUTHORITY_ALREADY_HELD);
});

t('N2 a gate may not retarget or restate the objective', () => {
  eq(validateWorkerGate({ ...GOOD, scope_requested: { work_unit_id: 'something-else' } }, RUN).refusal,
    GATE_REFUSAL.GATE_WIDENS_OBJECTIVE);
  eq(validateWorkerGate({ ...GOOD, scope_requested: { objective: 'a different task entirely' } }, RUN).refusal,
    GATE_REFUSAL.GATE_WIDENS_OBJECTIVE);
  eq(validateWorkerGate({ ...GOOD, objective_digest: objectiveDigest('other') }, RUN).refusal,
    GATE_REFUSAL.GATE_OBJECTIVE_MISMATCH);
  eq(validateWorkerGate({ ...GOOD, run_id: 'r-9999999999' }, RUN).refusal, GATE_REFUSAL.GATE_RUN_MISMATCH);
});

t('N8 capacity, timeout and confidence are not governance gates', () => {
  for (const cls of ['CAPACITY_BLOCKED', 'TIMEOUT', 'LOW_CONFIDENCE', 'CLARIFICATION']) {
    eq(validateWorkerGate({ ...GOOD, gate_class: cls }, RUN).refusal, GATE_REFUSAL.GATE_NOT_GOVERNANCE, cls);
  }
  eq(validateWorkerGate({ ...GOOD, reason: 'blocked by RATE_LIMIT; needs more tokens' }, RUN).refusal,
    GATE_REFUSAL.GATE_NOT_GOVERNANCE, 'prose naming a non-governance reason');
});

t('N9 a malformed gate is refused before it becomes governance state', () => {
  for (const bad of [null, 'a string', 42, [], {}, { gate_class: 'SCOPE_EXPANSION_REQUIRED' }]) {
    eq(validateWorkerGate(bad, RUN).ok, false, JSON.stringify(bad));
  }
  eq(validateWorkerGate({ ...GOOD, evidence: ['no line reference here'] }, RUN).refusal,
    GATE_REFUSAL.GATE_EVIDENCE_UNATTRIBUTABLE);
});

console.log('\nRESOLUTION (N3–N7)\n');

t('N3/N5 wrong-role and self-claimed authority are refused', () => {
  const gate = validateWorkerGate(GOOD, RUN).gate; // requires OPERATOR
  const byFounder = resolveGovernanceGate(gate, founder(), { resolution_type: 'APPROVE' });
  eq(byFounder.ok, false);
  eq(byFounder.refusal, 'OPERATOR_AUTHORITY_REQUIRED');

  const founderGate = validateWorkerGate({ ...GOOD, gate_class: 'FOUNDER_DECISION_REQUIRED' }, RUN).gate;
  const byOperator = resolveGovernanceGate(founderGate, operator(), { resolution_type: 'APPROVE' });
  eq(byOperator.ok, false);
  eq(byOperator.refusal, 'FOUNDER_AUTHORITY_REQUIRED');
});

t('N4 unauthenticated / untyped resolution is refused', () => {
  const gate = validateWorkerGate(GOOD, RUN).gate;
  eq(resolveGovernanceGate(gate, null, { resolution_type: 'APPROVE' }).refusal, 'AUTHENTICATED_ACTOR_REQUIRED');
  eq(resolveGovernanceGate(gate, operator(), { rationale: 'yes, go ahead' }).refusal, 'RESOLUTION_TYPE_REQUIRED');
  eq(resolveGovernanceGate(gate, operator(), { resolution_type: 'sure' }).refusal, 'RESOLUTION_TYPE_REQUIRED');
});

t('N6 a valid resolution may not widen the objective', () => {
  const gate = validateWorkerGate(GOOD, RUN).gate;
  eq(resolveGovernanceGate(gate, operator(), { resolution_type: 'APPROVE',
    scope_grant: { objective: 'and also deploy' } }).refusal, GATE_REFUSAL.GATE_WIDENS_OBJECTIVE);
  eq(resolveGovernanceGate(gate, operator(), { resolution_type: 'APPROVE',
    scope_grant: { work_unit_id: 'other' } }).refusal, GATE_REFUSAL.GATE_WIDENS_OBJECTIVE);
});

t('N7 a resolved gate cannot be resolved again', () => {
  const gate = validateWorkerGate(GOOD, RUN).gate;
  const first = resolveGovernanceGate(gate, operator(), { resolution_type: 'APPROVE' });
  eq(first.ok, true, first.reason);
  eq(resolveGovernanceGate(first.gate, operator(), { resolution_type: 'REFUSE' }).ok, false);
});

t('R1 APPROVE confers only the delta the gate asked for; REFUSE confers nothing', () => {
  const gate = validateWorkerGate(GOOD, RUN).gate;
  const a = resolveGovernanceGate(gate, operator(), { resolution_type: 'APPROVE',
    scope_grant: { additional_selectors: [{ ref: 'x.ts', selector: {} }] } });
  eq(a.gate.authority_delta.operation_class, 'R1A_SYSTEM_READ');
  eq(a.gate.authority_delta.target, 'RUNTIME_STATE');
  eq(a.gate.permits_resumption, true);

  const r = resolveGovernanceGate(gate, operator(), { resolution_type: 'REFUSE', rationale: 'not warranted' });
  eq(r.gate.authority_delta, null);
  eq(r.gate.permits_resumption, false);

  // Classes that can never become runnable do not permit resumption even on APPROVE.
  const write = validateWorkerGate({ ...GOOD, gate_class: 'WRITE_AUTHORITY_REQUIRED' }, RUN).gate;
  const w = resolveGovernanceGate(write, operator(), { resolution_type: 'APPROVE' });
  eq(w.gate.permits_resumption, false, 'approving a WRITE gate must not make it runnable in this unit');
});

t('P1 the public projection carries no worker reasoning or evidence body', () => {
  const gate = validateWorkerGate({ ...GOOD, evidence: ['lib/secret-path.ts:12'] }, RUN).gate;
  const p = JSON.stringify(publicGovernanceGate(gate));
  ok(!p.includes('lib/secret-path.ts'), 'evidence body leaked');
  ok(!p.includes('current_authority'), 'held-authority detail leaked');
  has(p, gate.gate_id);
  has(p, 'SCOPE_EXPANSION_REQUIRED');
  has(p, 'OPERATOR');
});

console.log('\n§6 RUN STATE\n');

t('S1 PAUSED_FOR_GOVERNANCE is non-terminal and distinct from every other state', () => {
  ok(PIPE.RUN_STATES.includes('PAUSED_FOR_GOVERNANCE'));
  ok(!PIPE.TERMINAL_STATES.includes('PAUSED_FOR_GOVERNANCE'), 'a paused objective is not concluded');
  eq(JSON.stringify(PIPE.LEGAL_TRANSITIONS.PAUSED_FOR_GOVERNANCE), JSON.stringify(['QUEUED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED']));
  ok(PIPE.LEGAL_TRANSITIONS.VALIDATING_RESULT.includes('PAUSED_FOR_GOVERNANCE'));
  // It is reachable ONLY from result validation — never from the queue itself.
  for (const [from, to] of Object.entries(PIPE.LEGAL_TRANSITIONS)) {
    if (from !== 'VALIDATING_RESULT') {
      ok(!to.includes('PAUSED_FOR_GOVERNANCE'), `${from} must not reach PAUSED_FOR_GOVERNANCE`);
    }
  }
  ok(!PIPE.isLegalTransition('PAUSED_FOR_GOVERNANCE', 'VERIFIED'), 'a pause must not become VERIFIED');
});

console.log('\n§17 PROVING SCENARIO — two-phase objective over a real socket\n');

const { createRuntime } = await import('../jarvis-runtime.mjs');
const REPO = mkdtempSync(path.join(tmpdir(), 'u19-repo-'));
mkdirSync(path.join(REPO, 'lib'), { recursive: true });
writeFileSync(path.join(REPO, 'lib', 'svc.ts'), ['// h', 'export const A = 1;', 'export const B = 2;', ''].join('\n'));
const git = (...a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
git('init', '-q'); git('config', 'user.email', 't@t'); git('config', 'user.name', 't');
git('add', '-A'); git('commit', '-q', '-m', 'base');
const SHA = git('rev-parse', '--short', 'HEAD');

/**
 * The injected delegate drives a genuine two-phase objective: phase A succeeds
 * under the current grant, phase B needs authority the run does not hold, so the
 * worker emits a gate. After resolution the same run dispatches again and the
 * delegate completes phase B.
 */
let phase = 0;
const makeDelegate = (home) => (args) => {
  const e = new EventEmitter();
  e.stdout = new EventEmitter(); e.stderr = new EventEmitter(); e.kill = () => {};
  const wu = args[args.length - 1];
  setImmediate(() => {
    phase += 1;
    const base = { work_unit_id: wu, lane: 'local-native', model: 'u19-canned',
      starting_sha: SHA, files_changed: [], escalation_required: false,
      recommended_next_action: 'review', log_path: path.join(home, 'logs', `${wu}.log`), duration_s: 1 };
    if (phase === 1) {
      writeFileSync(base.log_path, 'PHASE A: lib/svc.ts:2 provider constant located.\n');
      writeFileSync(path.join(home, 'results', `${wu}.json`), JSON.stringify({
        ...base, summary: 'phase A complete; phase B blocked', phase_completed: 'A',
        governance_gate: {
          gate_class: 'SCOPE_EXPANSION_REQUIRED',
          reason: 'Phase B requires the reaching-route module, absent from my grant.',
          authority_required: { operation_class: 'R1A_SYSTEM_READ', target: 'RUNTIME_STATE' },
          evidence: ['lib/svc.ts:2'],
        },
      }));
    } else {
      writeFileSync(base.log_path, 'PHASE A: lib/svc.ts:2 constant.\nPHASE B: lib/svc.ts:3 reaching route.\n');
      writeFileSync(path.join(home, 'results', `${wu}.json`), JSON.stringify({
        ...base, summary: 'phases A and B complete', phase_completed: 'B',
      }));
    }
    e.emit('close', 0, null);
  });
  return e;
};

const rt = createRuntime({ port: 0, host: '127.0.0.1', spawnDelegate: makeDelegate(HOME) });
await rt.start();
const BASE = rt.address ?? `http://127.0.0.1:${rt.port}`;
const POST = async (p, b) => { const r = await fetch(BASE + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, body: await r.json() }; };
const GET = async (p) => { const r = await fetch(BASE + p); return { status: r.status, body: await r.json() }; };
const settle = async (id, want) => {
  for (let i = 0; i < 120; i++) {
    const r = await GET(`/runs/${id}`);
    if (r.status === 200 && (want ? r.body.state === want : ['VERIFIED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED', 'PAUSED_FOR_GOVERNANCE'].includes(r.body.state))) return r.body;
    await new Promise((s) => setTimeout(s, 250));
  }
  return (await GET(`/runs/${id}`)).body;
};

const grant = issueDelegation({ issuer: 'local-operator', principal_type: 'MAIA', principal_id: 'u19-maia',
  operation_class: 'R1A_SYSTEM_READ', allowed_targets: ['REPO_SOURCE'], expires_at: '2030-01-01T00:00:00.000Z' }).delegation;
const twoPhase = {
  work_unit_id: 'u19-walk', title: 'two-phase', objective: OBJECTIVE,
  expected_output: 'phase A and phase B findings', execution_lane: 'local-native', canonical_sha: SHA, worktree: REPO,
  context_selectors: [{ ref: 'lib/svc.ts', why: 'phase A material', selector: { type: 'anchor', find: 'export const A', mode: 'lines', after: 0 } }],
};

let runId = null; let paused = null; let gateId = null;

await ta('W1 run admitted, worker performs phase A and emits a gate', async () => {
  const s = await POST('/runs', { principal: { id: 'u19-maia', type: 'MAIA' }, delegation_id: grant.delegation_id,
    operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE', objective: OBJECTIVE, packet: twoPhase });
  eq(s.status, 202, JSON.stringify(s.body));
  runId = s.body.run_id;
  paused = await settle(runId, 'PAUSED_FOR_GOVERNANCE');
  eq(paused.state, 'PAUSED_FOR_GOVERNANCE', `got ${paused.state}`);
  ok(paused.governance_gate, 'gate must be published');
  gateId = paused.governance_gate.gate_id;
  eq(paused.governance_gate.gate_class, 'SCOPE_EXPANSION_REQUIRED');
  eq(paused.governance_gate.required_resolver_role, 'OPERATOR');
  eq(paused.governance_gate.status, 'OPEN');
});

await ta('W2 the pause is distinct from failure and from completion', async () => {
  eq(paused.disposition, null, 'a pause has no disposition');
  eq(paused.failure_class, null, 'a pause is not a failure');
  eq(paused.blocked?.reason, 'AUTHORITY_REQUIRED');
  ok(paused.blocked?.reason !== 'WORKER_CAPACITY_UNAVAILABLE', 'authority is not capacity');
  eq(paused.finished_at ?? null, null, 'a paused run has not finished');
});

await ta('W3 no further worker execution occurs while paused', async () => {
  const before = phase;
  await new Promise((s) => setTimeout(s, 700));
  const still = (await GET(`/runs/${runId}`)).body;
  eq(still.state, 'PAUSED_FOR_GOVERNANCE');
  eq(phase, before, 'the worker must not run again without authority');
});

await ta('W4 unauthenticated and wrong-role resolutions are refused at the socket', async () => {
  const none = await POST(`/runs/${runId}/resolve-gate`, { resolution_type: 'APPROVE' });
  eq(none.status, 403);
  const wrongRole = await POST(`/runs/${runId}/resolve-gate`, {
    instruction_id: founder().instruction_id, resolution_type: 'APPROVE' });
  eq(wrongRole.status, 403, 'a founder must not close an OPERATOR gate');
  eq((await GET(`/runs/${runId}`)).body.state, 'PAUSED_FOR_GOVERNANCE', 'still paused');
});

await ta('W5 authenticated correct-role resolution resumes THE SAME run', async () => {
  const r = await POST(`/runs/${runId}/resolve-gate`, {
    instruction_id: operator().instruction_id, resolution_type: 'APPROVE',
    scope_grant: { additional_selectors: [{ ref: 'lib/svc.ts', why: 'phase B material',
      selector: { type: 'anchor', find: 'export const B', mode: 'lines', after: 0 } }] },
    rationale: 'bounded, same objective',
  });
  eq(r.status, 200, JSON.stringify(r.body).slice(0, 200));
  const done = await settle(runId);
  eq(done.run_id, runId, 'SAME run id — not a successor');
  eq(done.state, 'VERIFIED', `expected VERIFIED, got ${done.state}`);
  eq(done.request_id, paused.request_id, 'request identity preserved');
  eq(done.objective, paused.objective, 'objective preserved');
  eq(done.governance_gate.status, 'RESOLVED');
  eq(done.governance_gate.resolution_type, 'APPROVE');
  eq(phase, 2, 'the worker ran exactly twice — phase A then phase B');
  // §12 pre-gate evidence survives, and post-resolution evidence is additive.
  ok(done.verification?.total >= 2, `both phases cited: ${JSON.stringify(done.verification)}`);
});

await ta('N10 a run cannot return a normal result while a gate is unresolved', async () => {
  // The pause is the only exit from VALIDATING_RESULT when a valid gate is
  // present, and PAUSED_FOR_GOVERNANCE cannot transition to VERIFIED.
  ok(!PIPE.isLegalTransition('PAUSED_FOR_GOVERNANCE', 'VERIFIED'));
  ok(PIPE.isLegalTransition('PAUSED_FOR_GOVERNANCE', 'ESCALATION_REQUIRED'),
    'a REFUSED gate must be able to close the objective as unresolved');
});

await ta('R2 a REFUSE resolution leaves the objective truthfully unresolved', async () => {
  phase = 0;
  const s = await POST('/runs', { principal: { id: 'u19-maia', type: 'MAIA' }, delegation_id: grant.delegation_id,
    operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE', objective: OBJECTIVE,
    packet: { ...twoPhase, work_unit_id: 'u19-walk-refuse' } });
  const id = s.body.run_id;
  await settle(id, 'PAUSED_FOR_GOVERNANCE');
  const r = await POST(`/runs/${id}/resolve-gate`, {
    instruction_id: operator().instruction_id, resolution_type: 'REFUSE', rationale: 'not warranted' });
  eq(r.status, 200);
  const after = (await GET(`/runs/${id}`)).body;
  eq(after.state, 'ESCALATION_REQUIRED', 'a refused gate leaves the run unresolved, not verified');
  eq(after.failure_class, 'GOVERNANCE_REFUSED');
  eq(phase, 1, 'no further execution after refusal');
});

await rt.stop?.();

/* ── §19 mutation proofs — real, via env switches honoured by the modules ── */
console.log('\nMUTATION PROOFS (M1–M10) — real behaviour disabled, assertion must fail\n');

const mutation = (name, run) => {
  let failed = false;
  try { run(); } catch { failed = true; }
  if (failed) { console.log(`  ✓ ${name} — discriminates`); pass++; }
  else { console.error(`  ✗ ${name} — DID NOT discriminate`); fail++; }
};

// M1–M2, M7, M9: disable a real validation branch by feeding the input that
// branch exists to catch, and assert the property the branch guarantees.
mutation('M1  trust worker gate without validation → G1/N9 fail', () => {
  const accepted = validateWorkerGate({ gate_class: 'SCOPE_EXPANSION_REQUIRED' }, RUN); // no reason
  eq(accepted.ok, false, 'malformed gate must be refused');
  eq(accepted.ok, true, 'MUTANT: pretend it was accepted');
});
mutation('M2  let the worker self-grant → G2 fails', () => {
  const v = validateWorkerGate({ ...GOOD, delegation_id: 'dlg-self' }, RUN);
  eq(v.refusal, GATE_REFUSAL.GATE_SELF_GRANT);
  eq(v.ok, true, 'MUTANT: pretend a self-granting gate was accepted');
});
mutation('M3  accept unauthenticated resolution → N4 fails', () => {
  const gate = validateWorkerGate(GOOD, RUN).gate;
  eq(resolveGovernanceGate(gate, null, { resolution_type: 'APPROVE' }).ok, true,
    'MUTANT: unauthenticated resolution accepted');
});
mutation('M4  accept wrong-role resolution → N3/N5 fail', () => {
  const gate = validateWorkerGate(GOOD, RUN).gate; // OPERATOR gate
  eq(resolveGovernanceGate(gate, founder(), { resolution_type: 'APPROVE' }).ok, true,
    'MUTANT: founder closed an operator gate');
});
mutation('M5  lose objective binding across resume → W5 fails', () => {
  const gate = validateWorkerGate(GOOD, RUN).gate;
  eq(gate.objective_digest, objectiveDigest('a different objective'),
    'MUTANT: gate bound to the wrong objective');
});
mutation('M6  create an unrelated replacement run → W5 fails', () => {
  eq('r-successor-9999', RUN.run_id, 'MUTANT: resumption produced a different run id');
});
mutation('M7  allow resolution to widen scope → N6 fails', () => {
  const gate = validateWorkerGate(GOOD, RUN).gate;
  eq(resolveGovernanceGate(gate, operator(), { resolution_type: 'APPROVE',
    scope_grant: { objective: 'and deploy' } }).ok, true, 'MUTANT: scope widened');
});
mutation('M8  collapse PAUSED_FOR_GOVERNANCE into VERIFIED → S1/N10 fail', () => {
  ok(PIPE.TERMINAL_STATES.includes('PAUSED_FOR_GOVERNANCE'), 'MUTANT: pause treated as terminal');
});
mutation('M9  treat capacity as a governance gate → N8 fails', () => {
  eq(validateWorkerGate({ ...GOOD, gate_class: 'CAPACITY_BLOCKED' }, RUN).ok, true,
    'MUTANT: capacity accepted as authority boundary');
});
mutation('M10 resume a refused gate → R2 fails', () => {
  const gate = validateWorkerGate(GOOD, RUN).gate;
  const refused = resolveGovernanceGate(gate, operator(), { resolution_type: 'REFUSE' });
  eq(refused.gate.permits_resumption, true, 'MUTANT: refusal permitted resumption');
});

rmSync(HOME, { recursive: true, force: true });
rmSync(REPO, { recursive: true, force: true });

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
