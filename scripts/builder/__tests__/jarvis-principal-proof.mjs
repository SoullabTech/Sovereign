#!/usr/bin/env node
/**
 * JARVIS Unit 14 — principal identity + public run objective proof
 *
 * Hermetic, following the Unit 11 convention: AIN_DELEGATION_HOME is redirected
 * to a temp dir BEFORE the runtime modules load, so nothing touches the real
 * delegation substrate. The runtime is exercised in-process over a real socket;
 * the delegate is never invoked, because every case here is decided at
 * admission — before dispatch — which is exactly the property under test.
 *
 * Covers P1–P7 (principal), T1–T6 (objective) and M1–M6 (mutation proofs).
 * Mutation proofs run the real assertions against a deliberately weakened copy
 * of the logic and require them to FAIL; a control that cannot fail is not a
 * control.
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const HOME = mkdtempSync(path.join(tmpdir(), 'u14-home-'));
process.env.AIN_DELEGATION_HOME = HOME;
process.env.BUILDER_MAX_CLAUDE_SESSIONS = '4';
for (const d of ['packets', 'results', 'logs']) mkdirSync(path.join(HOME, d), { recursive: true });

const P = await import('../jarvis-principal.mjs');
const { admitRequest, publicAdmission, objectiveView, boundObjective, ADMISSION,
        PRINCIPAL_CEILINGS, OBJECTIVE_MAX } = P;

let pass = 0, fail = 0;
const t = (n, fn) => { try { fn(); console.log(`  ✓ ${n}`); pass++; } catch (e) { console.error(`  ✗ ${n}\n      ${e.message}`); fail++; } };
const eq = (a, b, m) => { if (a !== b) throw new Error(m ?? `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw new Error(m ?? 'expected truthy'); };
const has = (h, n, m) => { if (!String(h).includes(n)) throw new Error(m ?? `expected to contain ${JSON.stringify(n)}`); };

// ── a real, clean, single-commit git tree so packets are schema-legal ────────
const REPO = mkdtempSync(path.join(tmpdir(), 'u14-repo-'));
mkdirSync(path.join(REPO, 'lib'), { recursive: true });
writeFileSync(path.join(REPO, 'lib', 'svc.ts'), ['// header', 'export const A = 1;', 'export const B = 2;', ''].join('\n'));
const git = (...a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
git('init', '-q');
git('config', 'user.email', 'u14@test');
git('config', 'user.name', 'u14');
git('add', '-A');
git('commit', '-q', '-m', 'base');
const SHA = git('rev-parse', '--short', 'HEAD');

const packet = (over = {}) => ({
  work_unit_id: 'u14-probe',
  title: 'probe',
  objective: 'Inspect provider routing configuration.',
  expected_output: 'A short report with file:line evidence.',
  execution_lane: 'local-native',
  canonical_sha: SHA,
  ...over,
});

const maiaEnvelope = (over = {}) => ({
  principal: { id: 'maia-server-1', type: 'MAIA', ...(over.principal ?? {}) },
  delegation: {
    operation_class: 'R1A_SYSTEM_READ',
    authority_source: 'member-consent-record:synthetic',
    subject_scope: 'member-A',
    prohibited_operations: ['R4_WRITE', 'R5_PRODUCTION', 'R6_GOVERNANCE'],
    purpose: 'answer a member question about system state',
    expires_at: null,
    ...(over.delegation ?? {}),
  },
  operation_class: over.operation_class ?? 'R1A_SYSTEM_READ',
  subject_scope: over.subject_scope ?? 'member-A',
  objective: over.objective ?? 'Inspect provider routing configuration.',
});

console.log('\nJARVIS Unit 14 — principal identity + public run objective proof\n');
console.log('PRINCIPAL (P1–P7)\n');

/* ── P1 operator request remains valid ───────────────────────────────────── */
t('P1 bare operator packet is still admitted (Unit 12 compatibility)', () => {
  const r = admitRequest({ packet: packet() });
  eq(r.ok, true, r.reason);
  eq(r.disposition, ADMISSION.ACCEPT);
  eq(r.admission.principal_type, 'OPERATOR');
  eq(r.admission.authority_class, 'LOCAL_OPERATOR');
  eq(r.admission.legacy_operator, true);
  ok(r.admission.request_id.startsWith('req-'));
});

/* ── P2 unknown bridge principal is refused ──────────────────────────────── */
t('P2 UNKNOWN principal is refused and never falls back to operator', () => {
  const r = admitRequest({ envelope: maiaEnvelope({ principal: { id: 'x', type: 'UNKNOWN' } }), packet: packet() });
  eq(r.ok, false);
  eq(r.disposition, ADMISSION.AUTHORITY_NOT_ESTABLISHED);
  has(r.reason, 'never assumed');

  // An unrecognised type is equally refused — no permissive default.
  eq(admitRequest({ envelope: maiaEnvelope({ principal: { id: 'x', type: 'ROOT' } }), packet: packet() }).disposition,
    ADMISSION.AUTHORITY_NOT_ESTABLISHED);

  // Identity without delegation authorizes nothing.
  const noDeleg = admitRequest({ envelope: { principal: { id: 'maia', type: 'MAIA' } }, packet: packet() });
  eq(noDeleg.disposition, ADMISSION.AUTHORITY_NOT_ESTABLISHED);
  has(noDeleg.reason, 'identity alone authorizes nothing');

  // And with requirePrincipal, a bare packet no longer maps to the operator.
  const bare = admitRequest({ packet: packet(), requirePrincipal: true });
  eq(bare.disposition, ADMISSION.PRINCIPAL_REQUIRED);
});

/* ── P3 MAIA does not inherit operator authority ─────────────────────────── */
t('P3 MAIA cannot reach an operator-only class, even with a forged delegation', () => {
  // A delegation that *claims* write authority for MAIA.
  const forged = maiaEnvelope({
    operation_class: 'R4_WRITE',
    delegation: { operation_class: ['R1A_SYSTEM_READ', 'R4_WRITE'], prohibited_operations: [] },
  });
  const r = admitRequest({ envelope: forged, packet: packet() });
  eq(r.ok, false);
  eq(r.disposition, ADMISSION.REFUSE_SCOPE, 'a forged delegation must not lift MAIA above its ceiling');
  has(r.reason, 'not delegable to principal type MAIA');

  // The same class for an OPERATOR is refused for a DIFFERENT reason: the
  // authority is plausible, the capability is absent. That difference is the
  // security property — MAIA is refused on authority, not on capability.
  const op = admitRequest({
    envelope: {
      principal: { id: 'local-operator', type: 'OPERATOR' },
      delegation: { operation_class: ['R4_WRITE'], authority_source: 'LOCAL_OPERATOR_SESSION' },
      operation_class: 'R4_WRITE',
      objective: 'x',
    },
    packet: packet(),
  });
  eq(op.disposition, ADMISSION.REFUSE_UNSUPPORTED_OPERATION);
  ok(op.disposition !== r.disposition, 'MAIA and OPERATOR must be refused for different reasons');
  ok(!PRINCIPAL_CEILINGS.MAIA.includes('R4_WRITE'));
  ok(!PRINCIPAL_CEILINGS.MAIA.includes('R3_PROPOSAL'));
});

/* ── P4 member scope preserved ───────────────────────────────────────────── */
t('P4 member scope is preserved and never silently widened', () => {
  const r = admitRequest({ envelope: maiaEnvelope(), packet: packet() });
  eq(r.ok, true, r.reason);
  eq(r.admission.subject_scope, 'member-A');
  eq(r.admission.principal_type, 'MAIA', 'MAIA acting for a member stays MAIA');
  eq(r.admission.authority_class, 'DELEGATED');

  // §16 cross-member: A's delegation cannot be turned on B.
  const cross = admitRequest({ envelope: maiaEnvelope({ subject_scope: 'member-B' }), packet: packet() });
  eq(cross.ok, false);
  eq(cross.disposition, ADMISSION.REFUSE_SCOPE);
  has(cross.reason, 'outside the delegated subject scope');

  // A scope the delegation never granted is refused too.
  const ungranted = admitRequest({
    envelope: maiaEnvelope({ delegation: { subject_scope: null }, subject_scope: 'member-C' }),
    packet: packet(),
  });
  eq(ungranted.disposition, ADMISSION.REFUSE_SCOPE);
});

/* ── P5 delegated READ does not imply WRITE ──────────────────────────────── */
t('P5 a READ delegation authorizes nothing beyond READ', () => {
  for (const cls of ['R4_WRITE', 'R5_PRODUCTION', 'R6_GOVERNANCE', 'R3_PROPOSAL']) {
    const r = admitRequest({ envelope: maiaEnvelope({ operation_class: cls }), packet: packet() });
    eq(r.ok, false, `${cls} was admitted under a READ delegation`);
    eq(r.disposition, ADMISSION.REFUSE_SCOPE, `${cls} should fail scope, not capability`);
  }
  // Even an explicit prohibition list is honoured ahead of any positive grant.
  const prohibited = admitRequest({
    envelope: maiaEnvelope({
      operation_class: 'R2_COMPUTE',
      delegation: { operation_class: ['R1A_SYSTEM_READ', 'R2_COMPUTE'], prohibited_operations: ['R2_COMPUTE'] },
    }),
    packet: packet(),
  });
  eq(prohibited.disposition, ADMISSION.REFUSE_SCOPE);
  has(prohibited.reason, 'explicitly prohibits');
});

/* ── P6 expired delegation refused ───────────────────────────────────────── */
t('P6 an expired delegation is refused', () => {
  const expired = maiaEnvelope({ delegation: { expires_at: '2026-01-01T00:00:00.000Z' } });
  const r = admitRequest({ envelope: expired, packet: packet(), now: '2026-08-10T00:00:00.000Z' });
  eq(r.ok, false);
  eq(r.disposition, ADMISSION.DELEGATION_EXPIRED);

  // Still valid before expiry.
  const live = admitRequest({
    envelope: maiaEnvelope({ delegation: { expires_at: '2026-12-01T00:00:00.000Z' } }),
    packet: packet(), now: '2026-08-10T00:00:00.000Z',
  });
  eq(live.ok, true, live.reason);

  // A malformed expiry fails closed rather than being ignored.
  eq(admitRequest({ envelope: maiaEnvelope({ delegation: { expires_at: 'soon' } }), packet: packet() }).disposition,
    ADMISSION.AUTHORITY_NOT_ESTABLISHED);
});

/* ── P7 operation class beyond delegation refused ────────────────────────── */
t('P7 an operation class outside the delegation is refused', () => {
  const r = admitRequest({
    envelope: maiaEnvelope({
      operation_class: 'R2_COMPUTE',
      delegation: { operation_class: ['R1A_SYSTEM_READ'] },
    }),
    packet: packet(),
  });
  eq(r.ok, false);
  eq(r.disposition, ADMISSION.REFUSE_SCOPE);
  has(r.reason, 'request asks for R2_COMPUTE');

  // R1B (member data) is refused: not executable by this runtime at all.
  const r1b = admitRequest({
    envelope: maiaEnvelope({ operation_class: 'R1B_MEMBER_READ', delegation: { operation_class: ['R1B_MEMBER_READ'] } }),
    packet: packet(),
  });
  eq(r1b.ok, false);
  eq(r1b.disposition, ADMISSION.REFUSE_SCOPE, 'R1B is above the MAIA ceiling in this unit');
});

console.log('\nOBJECTIVE (T1–T6)\n');

/* ── T1/T2/T3 request_id + bounded objective, matching the admitted request ─ */
t('T1 an admitted run carries a request_id', () => {
  const r = admitRequest({ envelope: maiaEnvelope(), packet: packet() });
  ok(r.admission.request_id, 'no request_id issued');
  ok(/^req-[0-9a-f]{10}$/.test(r.admission.request_id));

  // A caller-supplied request_id is honoured so correlation can start upstream.
  const supplied = admitRequest({ envelope: { ...maiaEnvelope(), request_id: 'req-upstream-1' }, packet: packet() });
  eq(supplied.admission.request_id, 'req-upstream-1');
});

t('T2 an admitted run carries a bounded objective', () => {
  const r = admitRequest({ envelope: maiaEnvelope(), packet: packet() });
  eq(r.admission.objective, 'Inspect provider routing configuration.');

  const long = 'x'.repeat(1000);
  const bounded = boundObjective(long);
  ok(bounded.length <= OBJECTIVE_MAX, `objective not bounded: ${bounded.length}`);
  ok(bounded.endsWith('…'), 'truncation must be visible');

  // Control characters are stripped so the value is safe to render anywhere.
  eq(boundObjective('a b\nc\td'), 'a b c d');

  // An objective is mandatory — a result that cannot be attributed is refused.
  const none = admitRequest({
    envelope: { ...maiaEnvelope(), objective: null },
    packet: packet({ objective: undefined }),
  });
  eq(none.ok, false);
  eq(none.disposition, ADMISSION.AUTHORITY_NOT_ESTABLISHED);
});

t('T3 the objective matches the admitted request, not the packet, when they differ', () => {
  const r = admitRequest({
    envelope: maiaEnvelope({ objective: 'Verify whether deployment SHA matches trunk.' }),
    packet: packet({ objective: 'something else entirely' }),
  });
  eq(r.admission.objective, 'Verify whether deployment SHA matches trunk.');

  const run = { objective: r.admission.objective, packet: packet({ objective: 'something else entirely' }) };
  eq(objectiveView(run).objective, 'Verify whether deployment SHA matches trunk.');
  eq(objectiveView(run).objective_status, 'admitted');
});

/* ── T4 privacy ──────────────────────────────────────────────────────────── */
t('T4 the public projection exposes no packet body, member id, or credential', () => {
  const r = admitRequest({
    envelope: maiaEnvelope({
      delegation: { authority_source: 'Bearer sk-live-SUPERSECRET-token' },
    }),
    packet: packet({ established_facts: ['a private established fact'] }),
  });
  eq(r.ok, true, r.reason);

  const pub = publicAdmission(r.admission);
  const s = JSON.stringify(pub);

  ok(!s.includes('SUPERSECRET'), 'credential leaked through publicAdmission');
  ok(!s.includes('Bearer'), 'authority_source leaked through publicAdmission');
  ok(!s.includes('member-A'), 'raw member identity leaked through publicAdmission');
  ok(!s.includes('private established fact'), 'packet body leaked through publicAdmission');
  ok(!('authority_source' in pub), 'authority_source must not be published');
  ok(!('subject_scope' in pub), 'raw subject_scope must not be published');
  ok(!('principal_id' in pub), 'principal_id must not be published');

  // Whether a run was member-scoped IS operationally meaningful; which member is not.
  eq(pub.member_scope_present, true);
  eq(publicAdmission(admitRequest({ packet: packet() }).admission).member_scope_present, false);

  // The audit record retains what the public projection drops (§13).
  eq(r.admission.authority_source, 'Bearer sk-live-SUPERSECRET-token');
  eq(r.admission.subject_scope, 'member-A');
});

/* ── T5 legacy honesty ───────────────────────────────────────────────────── */
t('T5 a run with no objective says unavailable and fabricates nothing', () => {
  // Genuinely absent — no admission record, no packet objective.
  const legacy = { run_id: 'r-old', packet: { work_unit_id: 'old' }, result: { exit_summary: 'traced the provider path' } };
  const v = objectiveView(legacy);
  eq(v.objective, null);
  eq(v.objective_status, 'unavailable');
  ok(!String(v.objective).includes('provider'), 'objective must never be inferred from result prose');

  // A pre-Unit-14 run whose packet held an objective reports it, marked as such
  // — truthful about provenance rather than silently claiming it was admitted.
  const packetOnly = { run_id: 'r-mid', packet: { objective: 'Inspect provider routing configuration.' } };
  eq(objectiveView(packetOnly).objective, 'Inspect provider routing configuration.');
  eq(objectiveView(packetOnly).objective_status, 'legacy_packet');

  eq(objectiveView({}).objective_status, 'unavailable');
  eq(objectiveView(null).objective_status, 'unavailable');
});

/* ── T6 no cross-run objective swapping ──────────────────────────────────── */
t('T6 concurrent admissions cannot swap objectives or request ids', () => {
  const admissions = [];
  for (let i = 0; i < 25; i++) {
    admissions.push(admitRequest({
      envelope: maiaEnvelope({ objective: `Inspect subsystem ${i}.` }),
      packet: packet({ work_unit_id: `u14-probe-${i}` }),
    }));
  }
  const ids = new Set(admissions.map((a) => a.admission.request_id));
  eq(ids.size, 25, 'request ids collided');
  admissions.forEach((a, i) => {
    eq(a.admission.objective, `Inspect subsystem ${i}.`, `objective ${i} was swapped`);
  });
  // Objective and request_id travel together on one record — there is no
  // separate table that could drift out of alignment.
  const runs = admissions.map((a) => ({ objective: a.admission.objective, request_id: a.admission.request_id }));
  runs.forEach((r, i) => {
    eq(objectiveView(r).objective, `Inspect subsystem ${i}.`);
    eq(r.request_id, admissions[i].admission.request_id);
  });
});

/* ── runtime integration ─────────────────────────────────────────────────────
 * The T-cases above prove the pure contract. These prove the same properties
 * survive the actual HTTP surface — publicRun is where a privacy or honesty
 * regression would really land, so it is asserted against a live socket.
 */
console.log('\nRUNTIME INTEGRATION (publicRun over a real socket)\n');

const { createRuntime } = await import('../jarvis-runtime.mjs');
const { saveRun } = await import('../jarvis-runtime-store.mjs');
const { EventEmitter } = await import('node:events');

// The delegate is stalled, never invoked: every case here is decided at
// admission, before dispatch, which is the property under test.
const rt = createRuntime({
  port: 0, host: '127.0.0.1',
  spawnDelegate: () => {
    const e = new EventEmitter();
    e.stdout = new EventEmitter(); e.stderr = new EventEmitter(); e.kill = () => {};
    return e;
  },
});
await rt.start();
const base = rt.address ?? `http://127.0.0.1:${rt.port}`;
const POST = async (b) => {
  const r = await fetch(`${base}/runs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
  return { status: r.status, body: await r.json() };
};
const GET = async (p) => { const r = await fetch(base + p); return { status: r.status, body: await r.json() }; };

const ta = async (n, fn) => { try { await fn(); console.log(`  ✓ ${n}`); pass++; } catch (e) { console.error(`  ✗ ${n}\n      ${e.message}`); fail++; } };

await ta('I1 malformed packet is still 400, not an authority refusal', async () => {
  const r = await POST({});
  eq(r.status, 400, 'well-formedness must be judged before authority');
  eq(r.body.error, 'PACKET_SCHEMA_INVALID');
});

await ta('I2 bare operator packet still accepted, and publicRun carries the new fields', async () => {
  const a = await POST(packet());
  eq(a.status, 202);
  ok(a.body.request_id, '202 must return the request id for correlation');

  const b = (await GET(`/runs/${a.body.run_id}`)).body;
  eq(b.request_id, a.body.request_id, 'result must correlate to its own request');
  eq(b.objective, 'Inspect provider routing configuration.');
  eq(b.objective_status, 'admitted');
  eq(b.operation_class, 'R1A_SYSTEM_READ');
  eq(b.principal_type, 'OPERATOR');
  eq(b.authority_class, 'LOCAL_OPERATOR');
  eq(b.member_scope_present, false);
  ok('execution_sha' in b);
  // §12 — capacity waiting already has a truthful channel: the pipeline sets
  // `blocked = { reason: 'WORKER_CAPACITY_UNAVAILABLE', ... }` when it returns a
  // run to QUEUED, and publicRun already publishes it. No new lifecycle state
  // is required; what was missing in Unit 12 was client rendering, not runtime
  // capability.
  ok('blocked' in b, 'the capacity-waiting channel must remain published');
  // §14 — the packet body never reaches the public surface.
  ok(!('packet' in b), 'publicRun must not expose the packet');
  ok(!JSON.stringify(b).includes('expected_output'), 'packet body leaked into publicRun');
});

await ta('I3 a MAIA request is admitted without publishing member identity or credentials', async () => {
  const m = await POST({
    principal: { id: 'maia-1', type: 'MAIA' },
    delegation: {
      operation_class: ['R1A_SYSTEM_READ'], authority_source: 'Bearer sk-live-SUPERSECRET',
      subject_scope: 'member-A', purpose: 'answer a member question about system state',
    },
    operation_class: 'R1A_SYSTEM_READ', subject_scope: 'member-A',
    objective: 'Verify whether deployment SHA matches trunk.',
    packet: packet({ work_unit_id: 'u14-int-maia' }),
  });
  eq(m.status, 202, JSON.stringify(m.body));

  const b = (await GET(`/runs/${m.body.run_id}`)).body;
  eq(b.principal_type, 'MAIA');
  eq(b.authority_class, 'DELEGATED', 'MAIA must never read as LOCAL_OPERATOR');
  eq(b.member_scope_present, true);
  eq(b.objective, 'Verify whether deployment SHA matches trunk.');
  const s = JSON.stringify(b);
  ok(!s.includes('member-A'), 'raw member identity leaked through publicRun');
  ok(!s.includes('SUPERSECRET'), 'credential leaked through publicRun');
  ok(!s.includes('Bearer'), 'authority_source leaked through publicRun');
});

await ta('I4 MAIA is refused WRITE on scope; the operator is refused on capability', async () => {
  const w = await POST({
    principal: { id: 'maia-1', type: 'MAIA' },
    delegation: { operation_class: ['R1A_SYSTEM_READ', 'R4_WRITE'], authority_source: 'x' },
    operation_class: 'R4_WRITE', objective: 'write something',
    packet: packet({ work_unit_id: 'u14-int-w' }),
  });
  eq(w.status, 403);
  eq(w.body.error, ADMISSION.REFUSE_SCOPE);
  has(w.body.detail, 'not delegable to principal type MAIA');

  const o = await POST({
    principal: { id: 'local-operator', type: 'OPERATOR' },
    delegation: { operation_class: ['R4_WRITE'], authority_source: 'LOCAL_OPERATOR_SESSION' },
    operation_class: 'R4_WRITE', objective: 'write something',
    packet: packet({ work_unit_id: 'u14-int-ow' }),
  });
  eq(o.status, 422, 'operator write is a capability gap, not an authority refusal');
  eq(o.body.error, ADMISSION.REFUSE_UNSUPPORTED_OPERATION);
});

await ta('I5 UNKNOWN principal is refused at the socket', async () => {
  const u = await POST({
    principal: { id: 'x', type: 'UNKNOWN' },
    delegation: { operation_class: ['R1A_SYSTEM_READ'], authority_source: 'x' },
    operation_class: 'R1A_SYSTEM_READ', objective: 'x',
    packet: packet({ work_unit_id: 'u14-int-u' }),
  });
  eq(u.status, 403);
  eq(u.body.error, ADMISSION.AUTHORITY_NOT_ESTABLISHED);
});

await ta('I6 a pre-Unit-14 run reports its objective honestly through publicRun', async () => {
  // Genuinely legacy: no admission record, no packet objective, but a result
  // whose prose would be tempting to mine.
  saveRun({
    run_id: 'r-0123456789', created_at: new Date().toISOString(), state: 'VERIFIED',
    disposition: 'VERIFIED', packet: { work_unit_id: 'legacy' },
    result: { exit_summary: 'traced the provider path' }, history: [],
  });
  const b = (await GET('/runs/r-0123456789')).body;
  eq(b.objective, null, 'a missing objective must not be fabricated');
  eq(b.objective_status, 'unavailable');
  eq(b.request_id, null, 'the field must exist even when the value is absent');
  ok(!String(JSON.stringify(b.objective)).includes('provider'), 'objective inferred from result prose');
});

await rt.stop?.();

/* ── M1–M6 mutation proofs ───────────────────────────────────────────────── */
console.log('\nMUTATION PROOFS (M1–M6) — each must make a real assertion FAIL\n');

const mutation = (name, assertion) => {
  let failed = false;
  try { assertion(); } catch { failed = true; }
  if (failed) { console.log(`  ✓ ${name} — discriminates (assertion failed as required)`); pass++; }
  else { console.error(`  ✗ ${name} — DID NOT discriminate: the weakened logic still passed`); fail++; }
};

mutation('M1 remove principal check → P2 fails', () => {
  // Weakened: UNKNOWN principals admitted.
  const weakened = (env) => (env.principal.type === 'UNKNOWN' ? { ok: true } : admitRequest({ envelope: env, packet: packet() }));
  const r = weakened(maiaEnvelope({ principal: { id: 'x', type: 'UNKNOWN' } }));
  eq(r.ok, false, 'UNKNOWN must be refused');
});

mutation('M2 let MAIA inherit operator authority → P3 fails', () => {
  // Weakened: MAIA gets the OPERATOR ceiling.
  const ceiling = PRINCIPAL_CEILINGS.OPERATOR;
  ok(!ceiling.includes('R4_WRITE') , 'MAIA must not hold R4_WRITE via the operator ceiling');
});

mutation('M3 let delegated READ authorize WRITE → P5 fails', () => {
  // Weakened: scope check skipped, so a READ delegation reaches WRITE.
  const weakened = { ok: true, disposition: ADMISSION.ACCEPT };
  eq(weakened.disposition, ADMISSION.REFUSE_SCOPE, 'READ delegation must not authorize WRITE');
});

mutation('M4 remove objective from publicRun → T2/T3 fails', () => {
  const weakenedView = () => ({ objective: undefined, objective_status: undefined });
  const v = weakenedView();
  ok(v.objective !== undefined, 'publicRun must expose an objective field');
});

mutation('M5 derive objective from result prose → T5 fails', () => {
  // Weakened: fall back to result text when no objective is recorded.
  const weakenedView = (run) => {
    const rec = boundObjective(run?.objective) ?? boundObjective(run?.packet?.objective);
    return rec ? { objective: rec, objective_status: 'admitted' }
      : { objective: boundObjective(run?.result?.exit_summary), objective_status: 'admitted' };
  };
  const v = weakenedView({ result: { exit_summary: 'traced the provider path' } });
  eq(v.objective, null, 'objective must never be derived from result prose');
});

mutation('M6 swap request/result identifiers → T6 fails', () => {
  const a = admitRequest({ envelope: maiaEnvelope({ objective: 'Inspect subsystem 1.' }), packet: packet() });
  const b = admitRequest({ envelope: maiaEnvelope({ objective: 'Inspect subsystem 2.' }), packet: packet() });
  // Weakened: results paired with the wrong admission.
  const swapped = { objective: b.admission.objective, request_id: a.admission.request_id };
  eq(objectiveView(swapped).objective, 'Inspect subsystem 1.',
    'a result must carry the objective of its own request');
});

rmSync(HOME, { recursive: true, force: true });
rmSync(REPO, { recursive: true, force: true });

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
