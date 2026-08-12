#!/usr/bin/env node
/**
 * JARVIS Unit 21 — gate admissibility by objective authority · PROOF
 *
 * Founder ruling 2026-08-12: **D + A + always-record.**
 *
 *   D  admissibility is derived from the GRANTED objective contract before the
 *      worker executes — not inferred from the worker's prose, and not repaired
 *      afterwards.
 *   A  a residual inadmissible gate is REJECTED. The worker's testimony is never
 *      normalized away (B) nor translated into a tidier neighbour (C).
 *   R  the admissibility decision is recorded whether or not the gate was
 *      admitted. Recording a gate is not accepting a gate.
 *
 * The corpus this is built against (33 real runs, runtime rt-04751f2a):
 *   6x SCOPE_EXPANSION_REQUIRED   objective=R1A_SYSTEM_READ  claim=READ
 *   2x WRITE_AUTHORITY_REQUIRED   objective=R1A_SYSTEM_READ  claim=READ
 *   3x WRITE_AUTHORITY_REQUIRED   objective=R1A_SYSTEM_READ  claim=WRITE   ← C would falsify these
 *   2x CONSTITUTIONAL_AMBIGUITY   objective=R1A_SYSTEM_READ  claim=READ
 *
 * Hermetic: AIN_DELEGATION_HOME is redirected before the modules load.
 */

import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const HOME = mkdtempSync(path.join(tmpdir(), 'u21-home-'));
process.env.AIN_DELEGATION_HOME = HOME;
for (const d of ['packets', 'results', 'logs', 'runtime', 'runtime/runs']) {
  mkdirSync(path.join(HOME, d), { recursive: true });
}

const GG = await import('../jarvis-governance-gate.mjs');
const {
  validateWorkerGate, GATE_REFUSAL, deriveAdmissibleGateClasses,
  UNCONDITIONALLY_ADMISSIBLE_GATES,
} = GG;
const STORE = await import('../jarvis-runtime-store.mjs');

let pass = 0, fail = 0;
const t = (n, fn) => { try { fn(); console.log(`  ✓ ${n}`); pass++; } catch (e) { console.error(`  ✗ ${n}\n      ${e.message}`); fail++; } };
const eq = (a, b, m) => { if (a !== b) throw new Error(m ?? `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw new Error(m ?? 'expected truthy'); };

const OBJECTIVE = 'Identify the module-level constant governing the text-model backend.';
const READ_RUN = Object.freeze({
  run_id: 'r-21aaaaaaaa', request_id: 'req-21aaaaaa',
  objective: OBJECTIVE, operation_class: 'R1A_SYSTEM_READ',
  packet: { work_unit_id: 'u21-read-only', objective: OBJECTIVE },
  delegation: { allowed_targets: ['REPO_SOURCE'] },
});
const READ_GRANT = { heldAuthority: { operation_class: 'R1A_SYSTEM_READ', allowed_targets: ['REPO_SOURCE'] },
  grantedOperationClass: 'R1A_SYSTEM_READ' };

/** The 2/5 corpus shape: worker names the WRITE gate but asks for READ. */
const WRITE_GATE_CLAIMING_READ = Object.freeze({
  gate_class: 'WRITE_AUTHORITY_REQUIRED',
  reason: 'Objective asks to identify a module-level constant, but the task is read-only.',
  authority_required: { operation_class: 'READ', target: 'REPO_SOURCE' },
  evidence: ['lib/ai/modelService.ts:53'],
});
/** The 3/5 corpus shape: worker names the WRITE gate AND asks for WRITE. */
const WRITE_GATE_CLAIMING_WRITE = Object.freeze({
  ...WRITE_GATE_CLAIMING_READ,
  authority_required: { operation_class: 'WRITE', target: 'REPO_SOURCE' },
});

console.log('\n§A  D — ADMISSIBILITY DERIVED FROM THE GRANT\n');

t('A1 a READ grant admits only reach/decision gates — never WRITE or PRODUCTION', () => {
  const s = deriveAdmissibleGateClasses('R1A_SYSTEM_READ');
  ok(!s.includes('WRITE_AUTHORITY_REQUIRED'), 'WRITE admissible under a read grant');
  ok(!s.includes('PRODUCTION_AUTHORIZATION_REQUIRED'), 'PRODUCTION admissible under a read grant');
  for (const g of UNCONDITIONALLY_ADMISSIBLE_GATES) ok(s.includes(g), `${g} must stay admissible`);
});

t('A2 a mutating grant admits WRITE; only a production grant admits PRODUCTION', () => {
  ok(deriveAdmissibleGateClasses('R4_WRITE').includes('WRITE_AUTHORITY_REQUIRED'));
  ok(!deriveAdmissibleGateClasses('R4_WRITE').includes('PRODUCTION_AUTHORIZATION_REQUIRED'));
  ok(deriveAdmissibleGateClasses('R5_PRODUCTION').includes('PRODUCTION_AUTHORIZATION_REQUIRED'));
});

t('A3 an undeclared grant fails CLOSED — absence of a grant licenses nothing extra', () => {
  const s = deriveAdmissibleGateClasses(null);
  ok(!s.includes('WRITE_AUTHORITY_REQUIRED'), 'undeclared grant admitted a WRITE gate');
  eq(s.length, UNCONDITIONALLY_ADMISSIBLE_GATES.length);
});

t('A4 R1-A SCOPE LIMIT — target-level reach stays raisable under every read grant', () => {
  // D decides CLASS admissibility only. It must not absorb the operation-bound
  // authority derivation R1-A still requires, so the gate that asks "may I look
  // at X?" must remain available precisely because that question is unresolved.
  ok(deriveAdmissibleGateClasses('R1A_SYSTEM_READ').includes('SCOPE_EXPANSION_REQUIRED'));
  const v = validateWorkerGate({
    gate_class: 'SCOPE_EXPANSION_REQUIRED',
    reason: 'The sovereign HTTP route module is not in the materialized grant.',
    authority_required: { operation_class: 'READ', target: 'RUNTIME_STATE' },
    evidence: ['app/api/sovereign/route.ts:14'],
  }, READ_RUN, READ_GRANT);
  eq(v.ok, true, v.reason);
  eq(v.admissibility.comparison_result, 'ADMISSIBLE');
});

console.log('\n§B  ACCEPTANCE 4 — A READ OBJECTIVE CANNOT HONOR AN INADMISSIBLE WRITE GATE\n');

t('B1 corpus shape 2/5 (claim=READ) is refused as inadmissible', () => {
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_READ, READ_RUN, READ_GRANT);
  eq(v.ok, false);
  eq(v.refusal, GATE_REFUSAL.GATE_INADMISSIBLE_FOR_GRANT);
});

t('B2 corpus shape 3/5 (claim=WRITE) is refused by the SAME rule', () => {
  // The rule keys on the GRANT, so both corpus shapes are covered. A rule keyed
  // on the claim would have fixed only B1 and left these three defective.
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_WRITE, READ_RUN, READ_GRANT);
  eq(v.ok, false);
  eq(v.refusal, GATE_REFUSAL.GATE_INADMISSIBLE_FOR_GRANT);
});

t('B3 the same gate IS admitted under a grant that could produce it', () => {
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_WRITE,
    { ...READ_RUN, operation_class: 'R4_WRITE' },
    { heldAuthority: { operation_class: 'R4_WRITE', allowed_targets: [] }, grantedOperationClass: 'R4_WRITE' });
  eq(v.ok, true, v.reason);
  eq(v.gate.gate_class, 'WRITE_AUTHORITY_REQUIRED');
});

console.log('\n§C  ACCEPTANCE 5 + 6 — REJECTED, NOT NORMALIZED; TESTIMONY PRESERVED\n');

t('C1 rejection produces NO gate — the run does not pause on an inadmissible claim', () => {
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_WRITE, READ_RUN, READ_GRANT);
  eq(v.gate, undefined, 'an inadmissible claim must not become governance state');
});

t('C2 NOT reclassified — the tidier neighbour is never substituted (C rejected)', () => {
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_WRITE, READ_RUN, READ_GRANT);
  const blob = JSON.stringify(v);
  ok(!blob.includes('"gate_class":"SCOPE_EXPANSION_REQUIRED"'),
    'control plane authored a gate the worker did not emit');
  eq(v.admissibility.worker_assertion.gate_class, 'WRITE_AUTHORITY_REQUIRED');
});

t('C3 NOT normalized away — the refusal is explicit and named (B rejected)', () => {
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_WRITE, READ_RUN, READ_GRANT);
  eq(v.ok, false, 'the gate was silently dropped and the run continued');
  ok(String(v.reason).includes('not admissible'), 'refusal must say why');
});

t('C4 worker testimony survives verbatim, including the axis it named', () => {
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_WRITE, READ_RUN, READ_GRANT);
  const a = v.admissibility.worker_assertion;
  eq(a.gate_class, 'WRITE_AUTHORITY_REQUIRED');
  eq(a.authority_required.operation_class, 'WRITE');
  eq(a.reason, WRITE_GATE_CLAIMING_WRITE.reason);
  eq(v.admissibility.emitted_by, 'worker');
  eq(v.admissibility.decided_by, 'control_plane:unit_21_admissibility',
    'the deciding layer must be distinguishable from the testifying layer');
});

console.log('\n§D  ACCEPTANCE 7 — ALWAYS RECORD\n');

const REQUIRED_RECORD_FIELDS = ['worker_assertion', 'proposed_operation_class', 'granted_authority',
  'derived_admissible_gate_classes', 'comparison_result', 'evidence', 'emitted_by', 'disposition'];

t('D1 the record carries every ruled field on the REJECT path', () => {
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_WRITE, READ_RUN, READ_GRANT);
  for (const f of REQUIRED_RECORD_FIELDS) ok(f in v.admissibility, `missing '${f}'`);
  eq(v.admissibility.comparison_result, 'INADMISSIBLE_FOR_GRANT');
  eq(v.admissibility.disposition, 'GATE_REFUSED_INADMISSIBLE');
  eq(v.admissibility.granted_authority.operation_class, 'R1A_SYSTEM_READ');
  eq(v.admissibility.proposed_operation_class, 'WRITE');
});

t('D2 the record carries every ruled field on the ADMIT path too', () => {
  const v = validateWorkerGate({
    gate_class: 'FOUNDER_DECISION_REQUIRED',
    reason: 'Two canon sections conflict on this boundary; a founder must choose.',
    authority_required: { operation_class: 'READ', target: 'REPO_SOURCE' },
    evidence: ['docs/canon/MAIA_OATH.md:12'],
  }, READ_RUN, READ_GRANT);
  eq(v.ok, true, v.reason);
  for (const f of REQUIRED_RECORD_FIELDS) ok(f in v.admissibility, `missing '${f}'`);
  eq(v.admissibility.disposition, 'GATE_ADMITTED');
  ok(v.gate.admissibility, 'the admitted gate must carry its own admissibility decision');
});

t('D3 the decision is DURABLE — it survives a run store round-trip', () => {
  STORE.initStore();
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_WRITE, READ_RUN, READ_GRANT);
  const run = { ...READ_RUN, state: 'FAILED', failure_class: 'GOVERNANCE_GATE_INVALID',
    gate_admissibility: v.admissibility };
  STORE.saveRun(run);
  const back = STORE.loadRun(READ_RUN.run_id);
  ok(back, 'run did not persist');
  eq(back.gate_admissibility.comparison_result, 'INADMISSIBLE_FOR_GRANT');
  eq(back.gate_admissibility.worker_assertion.gate_class, 'WRITE_AUTHORITY_REQUIRED');
  eq(back.gate_admissibility.worker_assertion.authority_required.operation_class, 'WRITE');
});

console.log('\nMUTATION PROOFS — the control must discriminate\n');

const mutation = (name, run) => {
  let failed = false;
  try { run(); } catch { failed = true; }
  if (failed) { console.log(`  ✓ ${name} — discriminates`); pass++; }
  else { console.error(`  ✗ ${name} — DID NOT discriminate`); fail++; }
};

mutation('MU1 admit an inadmissible WRITE gate under READ → B1/B2 fail', () => {
  eq(validateWorkerGate(WRITE_GATE_CLAIMING_WRITE, READ_RUN, READ_GRANT).ok, true,
    'MUTANT: inadmissible gate admitted');
});
mutation('MU2 reclassify to the tidier neighbour → C2 fails', () => {
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_WRITE, READ_RUN, READ_GRANT);
  eq(v.admissibility.worker_assertion.gate_class, 'SCOPE_EXPANSION_REQUIRED',
    'MUTANT: testimony rewritten');
});
mutation('MU3 drop the record on the reject path → D1 fails', () => {
  const v = validateWorkerGate(WRITE_GATE_CLAIMING_WRITE, READ_RUN, READ_GRANT);
  eq(v.admissibility, undefined, 'MUTANT: refusal recorded nothing');
});
mutation('MU4 let an undeclared grant admit WRITE → A3 fails', () => {
  ok(deriveAdmissibleGateClasses(null).includes('WRITE_AUTHORITY_REQUIRED'),
    'MUTANT: undeclared grant opened the broadest gate');
});
mutation('MU5 close SCOPE_EXPANSION under READ → A4 fails (R1-A absorbed)', () => {
  ok(!deriveAdmissibleGateClasses('R1A_SYSTEM_READ').includes('SCOPE_EXPANSION_REQUIRED'),
    'MUTANT: target-level reach no longer raisable');
});

rmSync(HOME, { recursive: true, force: true });

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
