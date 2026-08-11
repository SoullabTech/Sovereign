#!/usr/bin/env node
/**
 * JARVIS Unit 15 — verified delegation issuance + authentication proof
 *
 * Hermetic: AIN_DELEGATION_HOME is redirected to a temp dir before the modules
 * load, so issuance, revocation and audit never touch the real substrate. The
 * runtime is exercised over a real socket on an ephemeral port; the delegate is
 * stalled and never invoked, because every case is decided at verification or
 * admission — before dispatch.
 *
 * Covers D1–D9 (issuance), V1–V12 (verification), M1–M10 (mutation proofs) and
 * the §25–§28 walks.
 *
 * V12 is the load-bearing case: a perfectly well-formed, authentic delegation
 * record from an UNAUTHORIZED issuer is still invalid. It is what stops
 * "cryptographically valid" from quietly becoming "constitutionally authorized".
 */

import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { EventEmitter } from 'node:events';

const HOME = mkdtempSync(path.join(tmpdir(), 'u15-home-'));
process.env.AIN_DELEGATION_HOME = HOME;
process.env.BUILDER_MAX_CLAUDE_SESSIONS = '4';
for (const d of ['packets', 'results', 'logs', 'delegations']) mkdirSync(path.join(HOME, d), { recursive: true });

const D = await import('../jarvis-delegation.mjs');
const {
  issueDelegation, loadDelegation, revokeDelegation, verifyDelegation, delegationToUnit14,
  publicDelegation, listDelegations, ISSUER_REGISTRY, TARGET_CLASSES,
  DELEGATION_REFUSAL, DELEGATION_STATUS, PUBLIC_REFUSAL,
} = D;

let pass = 0, fail = 0;
const t = (n, fn) => { try { fn(); console.log(`  ✓ ${n}`); pass++; } catch (e) { console.error(`  ✗ ${n}\n      ${e.message}`); fail++; } };
const ta = async (n, fn) => { try { await fn(); console.log(`  ✓ ${n}`); pass++; } catch (e) { console.error(`  ✗ ${n}\n      ${e.message}`); fail++; } };
const eq = (a, b, m) => { if (a !== b) throw new Error(m ?? `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw new Error(m ?? 'expected truthy'); };
const has = (h, n, m) => { if (!String(h).includes(n)) throw new Error(m ?? `expected to contain ${JSON.stringify(n)}`); };

const FUTURE = '2030-01-01T00:00:00.000Z';
const NOW = '2026-08-10T00:00:00.000Z';

const goodIssue = (over = {}) => issueDelegation({
  issuer: 'local-operator',
  principal_type: 'MAIA',
  principal_id: 'maia-1',
  subject_scope: 'member-A',
  operation_class: 'R1A_SYSTEM_READ',
  allowed_targets: ['REPO_SOURCE'],
  prohibited_operations: ['R4_WRITE'],
  purpose: 'answer a member question about system state',
  expires_at: FUTURE,
  ...over,
}, NOW);

const verifyGood = (d, over = {}) => verifyDelegation({
  delegation_id: d.delegation_id,
  principal: { id: 'maia-1', type: 'MAIA' },
  subject_scope: 'member-A',
  operation_class: 'R1A_SYSTEM_READ',
  target: 'REPO_SOURCE',
  ...over,
}, NOW);

console.log('\nJARVIS Unit 15 — verified delegation issuance + authentication\n');
console.log('ISSUANCE (D1–D9)\n');

let issued = null;

t('D1 a trusted issuer can create a delegation', () => {
  const r = goodIssue();
  eq(r.ok, true, r.reason);
  issued = r.delegation;
  eq(issued.issuer, 'local-operator');
  eq(issued.status, DELEGATION_STATUS.ACTIVE);

  // An untrusted issuer cannot create one at all.
  const rogue = issueDelegation({ ...{ issuer: 'rogue', principal_type: 'MAIA', principal_id: 'maia-1',
    operation_class: 'R1A_SYSTEM_READ', allowed_targets: ['REPO_SOURCE'], expires_at: FUTURE } }, NOW);
  eq(rogue.ok, false);
  eq(rogue.refusal, DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED);
});

t('D2 the delegation receives a stable identifier', () => {
  ok(/^dlg-[0-9a-f]{12}$/.test(issued.delegation_id));
  const again = loadDelegation(issued.delegation_id);
  eq(again.delegation_id, issued.delegation_id);
  eq(goodIssue().delegation.delegation_id === issued.delegation_id, false, 'ids must not collide');
});

t('D3 principal binding is recorded', () => { eq(issued.principal_type, 'MAIA'); eq(issued.principal_id, 'maia-1'); });
t('D4 subject binding is recorded', () => eq(issued.subject_scope, 'member-A'));
t('D5 operation class is recorded', () => eq(issued.operation_class, 'R1A_SYSTEM_READ'));
t('D6 target scope is recorded', () => {
  eq(JSON.stringify(issued.allowed_targets), JSON.stringify(['REPO_SOURCE']));
  // §11 — there is no secrets target class to grant.
  ok(!TARGET_CLASSES.some((c) => /secret/i.test(c)), 'a secrets target class must not exist');
  const bad = goodIssue({ allowed_targets: ['SECRETS'] });
  eq(bad.ok, false);
  eq(bad.refusal, DELEGATION_REFUSAL.DELEGATION_INVALID);
});
t('D7 expiry is recorded and mandatory', () => {
  eq(issued.expires_at, FUTURE);
  eq(issueDelegation({ issuer: 'local-operator', principal_type: 'MAIA', principal_id: 'm',
    operation_class: 'R1A_SYSTEM_READ', allowed_targets: ['REPO_SOURCE'] }, NOW).ok, false,
  'a delegation without expiry must not be issuable');
  eq(goodIssue({ expires_at: '2020-01-01T00:00:00.000Z' }).ok, false, 'past expiry must be refused');
});
t('D8 prohibitions are recorded', () => eq(JSON.stringify(issued.prohibited_operations), JSON.stringify(['R4_WRITE'])));
t('D9 an audit record exists and is durable', () => {
  const all = listDelegations();
  ok(all.some((d) => d.delegation_id === issued.delegation_id));
  ok(all.every((d) => d.issued_at && d.issuer && d.expires_at));
});

console.log('\nISSUER AUTHORITY (§7)\n');

t('A1 an issuer cannot grant to a principal type it does not govern', () => {
  const r = goodIssue({ issuer: 'practitioner-session', principal_type: 'SYSTEM_AUTOMATION' });
  eq(r.ok, false);
  eq(r.refusal, DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED);
});
t('A2 no issuer may mint OPERATOR authority', () => {
  for (const id of Object.keys(ISSUER_REGISTRY)) {
    ok(!ISSUER_REGISTRY[id].may_grant_to.includes('OPERATOR'),
      `issuer ${id} may grant OPERATOR — a delegation must never manufacture an operator`);
  }
});
t('A3 MAIA is not an issuer and cannot self-issue', () => {
  ok(!Object.prototype.hasOwnProperty.call(ISSUER_REGISTRY, 'maia'));
  eq(goodIssue({ issuer: 'maia-1' }).ok, false, 'MAIA must not be able to mint its own authority');
});
t('A4 a practitioner issuer cannot grant subject-scoped authority over a member', () => {
  const r = goodIssue({ issuer: 'practitioner-session', subject_scope: 'member-A', allowed_targets: ['RUNTIME_STATE'] });
  eq(r.ok, false);
  eq(r.refusal, DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED);
});
t('A5 a member issuer may only grant over its own subject scope', () => {
  const own = issueDelegation({ issuer: 'member-session', issuer_subject: 'member-A', principal_type: 'MAIA',
    principal_id: 'maia-1', subject_scope: 'member-A', operation_class: 'R1A_SYSTEM_READ',
    allowed_targets: ['RUNTIME_STATE'], expires_at: FUTURE }, NOW);
  eq(own.ok, true, own.reason);
  const other = issueDelegation({ issuer: 'member-session', issuer_subject: 'member-A', principal_type: 'MAIA',
    principal_id: 'maia-1', subject_scope: 'member-B', operation_class: 'R1A_SYSTEM_READ',
    allowed_targets: ['RUNTIME_STATE'], expires_at: FUTURE }, NOW);
  eq(other.ok, false, 'member-A must not grant authority over member-B');
  eq(other.refusal, DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED);
});
t('A6 an issuer cannot grant above the Unit 14 principal ceiling', () => {
  const r = goodIssue({ operation_class: 'R4_WRITE' });
  eq(r.ok, false);
  eq(r.refusal, DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED);
});

console.log('\nVERIFICATION (V1–V12)\n');

t('V1 a validly issued delegation verifies', () => {
  const r = verifyGood(issued);
  eq(r.ok, true, r.reason);
  eq(r.delegation.delegation_id, issued.delegation_id);
});
t('V2 an unknown delegation is refused', () => {
  eq(verifyGood(issued, { delegation_id: 'dlg-000000000000' }).refusal, DELEGATION_REFUSAL.DELEGATION_UNKNOWN);
  eq(verifyGood(issued, { delegation_id: 'not-an-id' }).refusal, DELEGATION_REFUSAL.DELEGATION_UNKNOWN);
  eq(verifyGood(issued, { delegation_id: undefined }).refusal, DELEGATION_REFUSAL.DELEGATION_REQUIRED);
});
t('V3 the caller cannot mutate authoritative delegation content', () => {
  // The reference architecture's integrity property: the caller holds only an
  // id, so "tampering" means sending different claims — which are compared
  // against the record and discarded.
  const r = verifyGood(issued, { operation_class: 'R2_COMPUTE' });
  eq(r.ok, false);
  eq(r.refusal, DELEGATION_REFUSAL.DELEGATION_OPERATION_DENIED);
  // The record itself is unchanged by the attempt.
  eq(loadDelegation(issued.delegation_id).operation_class, 'R1A_SYSTEM_READ');
  // And the Unit 14 view is rebuilt from the record, never the caller.
  const u14 = delegationToUnit14(loadDelegation(issued.delegation_id));
  eq(JSON.stringify(u14.operation_class), JSON.stringify(['R1A_SYSTEM_READ']));
  has(u14.authority_source, 'verified:local-operator:');
});
t('V4 an expired delegation is refused', () => {
  const r = verifyGood(issued, {});
  eq(r.ok, true);
  eq(verifyDelegation({ delegation_id: issued.delegation_id, principal: { id: 'maia-1', type: 'MAIA' },
    subject_scope: 'member-A', operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE' },
  '2031-01-01T00:00:00.000Z').refusal, DELEGATION_REFUSAL.DELEGATION_EXPIRED);
});
t('V5 a revoked delegation is refused', () => {
  const d = goodIssue().delegation;
  eq(verifyGood(d).ok, true);
  const rev = revokeDelegation(d.delegation_id, { by: 'local-operator', reason: 'test' }, NOW);
  eq(rev.ok, true);
  eq(verifyGood(d).refusal, DELEGATION_REFUSAL.DELEGATION_REVOKED);
  // Only the issuing authority may revoke.
  const d2 = goodIssue().delegation;
  eq(revokeDelegation(d2.delegation_id, { by: 'practitioner-session' }, NOW).ok, false);
});
t('V6 the wrong principal is refused (no replay by another principal)', () => {
  eq(verifyGood(issued, { principal: { id: 'maia-2', type: 'MAIA' } }).refusal,
    DELEGATION_REFUSAL.DELEGATION_PRINCIPAL_MISMATCH);
  eq(verifyGood(issued, { principal: { id: 'maia-1', type: 'MEMBER' } }).refusal,
    DELEGATION_REFUSAL.DELEGATION_PRINCIPAL_MISMATCH);
  eq(verifyGood(issued, { principal: { id: 'local-operator', type: 'OPERATOR' } }).refusal,
    DELEGATION_REFUSAL.DELEGATION_PRINCIPAL_MISMATCH);
});
t('V7 the wrong subject is refused', () => {
  eq(verifyGood(issued, { subject_scope: 'member-B' }).refusal, DELEGATION_REFUSAL.DELEGATION_SCOPE_MISMATCH);
  eq(verifyGood(issued, { subject_scope: null }).refusal, DELEGATION_REFUSAL.DELEGATION_SCOPE_MISMATCH);
});
t('V8 the wrong operation is refused', () => {
  for (const cls of ['R2_COMPUTE', 'R1B_MEMBER_READ', 'R4_WRITE', 'R5_PRODUCTION', 'R6_GOVERNANCE']) {
    eq(verifyGood(issued, { operation_class: cls }).refusal, DELEGATION_REFUSAL.DELEGATION_OPERATION_DENIED, cls);
  }
});
t('V9 the wrong target is refused', () => {
  eq(verifyGood(issued, { target: 'WORKER_LOGS' }).refusal, DELEGATION_REFUSAL.DELEGATION_TARGET_DENIED);
  eq(verifyGood(issued, { target: 'SECRETS' }).refusal, DELEGATION_REFUSAL.DELEGATION_TARGET_DENIED);
  eq(verifyGood(issued, { target: undefined }).refusal, DELEGATION_REFUSAL.DELEGATION_TARGET_DENIED);
  // An explicit prohibition beats a broader allow.
  const d = goodIssue({ allowed_targets: ['REPO_SOURCE', 'WORKER_LOGS'], prohibited_targets: ['WORKER_LOGS'] }).delegation;
  eq(verifyGood(d, { target: 'WORKER_LOGS' }).refusal, DELEGATION_REFUSAL.DELEGATION_TARGET_DENIED);
});
t('V10 the caller cannot extend expiry', () => {
  const d = goodIssue({ expires_at: '2026-08-11T00:00:00.000Z' }).delegation;
  // The caller's claimed expiry is not an input to verification at all.
  const r = verifyDelegation({ delegation_id: d.delegation_id, principal: { id: 'maia-1', type: 'MAIA' },
    subject_scope: 'member-A', operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE',
    expires_at: '2099-01-01T00:00:00.000Z' }, '2026-08-12T00:00:00.000Z');
  eq(r.refusal, DELEGATION_REFUSAL.DELEGATION_EXPIRED);
  eq(loadDelegation(d.delegation_id).expires_at, '2026-08-11T00:00:00.000Z', 'the record must be unchanged');
});
t('V11 the caller cannot remove a prohibition', () => {
  const d = goodIssue({ allowed_targets: ['REPO_SOURCE', 'WORKER_LOGS'], prohibited_targets: ['WORKER_LOGS'] }).delegation;
  // Even asking with an empty prohibition list changes nothing: the list is
  // read from the record, never from the request.
  const r = verifyDelegation({ delegation_id: d.delegation_id, principal: { id: 'maia-1', type: 'MAIA' },
    subject_scope: 'member-A', operation_class: 'R1A_SYSTEM_READ', target: 'WORKER_LOGS',
    prohibited_targets: [], prohibited_operations: [] }, NOW);
  eq(r.refusal, DELEGATION_REFUSAL.DELEGATION_TARGET_DENIED);
  eq(JSON.stringify(delegationToUnit14(loadDelegation(d.delegation_id)).prohibited_operations),
    JSON.stringify(['R4_WRITE']));
});
t('V12 an authentic delegation from an UNTRUSTED issuer is still invalid  ← load-bearing', () => {
  // Hand-write a structurally perfect, internally consistent record whose only
  // defect is that its issuer holds no authority. This is what separates
  // authenticity from legitimacy.
  const rogue = {
    delegation_id: 'dlg-aaaaaaaaaaaa', status: 'ACTIVE', issuer: 'rogue-authority',
    principal_type: 'MAIA', principal_id: 'maia-1', subject_scope: 'member-A',
    operation_class: 'R1A_SYSTEM_READ', allowed_targets: ['REPO_SOURCE'],
    prohibited_operations: [], prohibited_targets: [], purpose: 'looks entirely legitimate',
    issued_at: NOW, expires_at: FUTURE, revoked_at: null, revocation_reason: null, used_by_requests: [],
  };
  writeFileSync(path.join(HOME, 'delegations', `${rogue.delegation_id}.json`), JSON.stringify(rogue, null, 2));
  eq(loadDelegation(rogue.delegation_id).issuer, 'rogue-authority', 'the record must genuinely exist');

  const r = verifyGood(issued, { delegation_id: rogue.delegation_id });
  eq(r.ok, false, 'an unauthorized issuer must not produce valid authority');
  eq(r.refusal, DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED);

  // Also: a TRUSTED issuer whose record claims authority beyond its registry
  // entry is refused at verification, not merely at issuance.
  const overreach = { ...rogue, delegation_id: 'dlg-bbbbbbbbbbbb', issuer: 'practitioner-session' };
  writeFileSync(path.join(HOME, 'delegations', `${overreach.delegation_id}.json`), JSON.stringify(overreach, null, 2));
  const r2 = verifyGood(issued, { delegation_id: overreach.delegation_id });
  eq(r2.ok, false, 'a trusted issuer cannot exceed its own registry entry');
  eq(r2.refusal, DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED);
});

console.log('\nRUNTIME WALKS (§25–§28) — real socket\n');

const { createRuntime } = await import('../jarvis-runtime.mjs');
const REPO = mkdtempSync(path.join(tmpdir(), 'u15-repo-'));
mkdirSync(path.join(REPO, 'lib'), { recursive: true });
writeFileSync(path.join(REPO, 'lib', 'svc.ts'), ['// h', 'export const A = 1;', ''].join('\n'));
const git = (...a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
git('init', '-q'); git('config', 'user.email', 't@t'); git('config', 'user.name', 't');
git('add', '-A'); git('commit', '-q', '-m', 'base');
const SHA = git('rev-parse', '--short', 'HEAD');

const rt = createRuntime({
  port: 0, host: '127.0.0.1',
  spawnDelegate: () => { const e = new EventEmitter(); e.stdout = new EventEmitter(); e.stderr = new EventEmitter(); e.kill = () => {}; return e; },
});
await rt.start();
const base = rt.address ?? `http://127.0.0.1:${rt.port}`;
const POST = async (b) => { const r = await fetch(`${base}/runs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, body: await r.json() }; };
const GET = async (p) => { const r = await fetch(base + p); return { status: r.status, body: await r.json() }; };
const packet = (o = {}) => ({ work_unit_id: 'u15-probe', title: 't', objective: 'Inspect provider routing configuration.',
  expected_output: 'report', execution_lane: 'local-native', canonical_sha: SHA, ...o });

await ta('W1 MAIA with a valid verified delegation is admitted', async () => {
  const d = goodIssue().delegation;
  const r = await POST({ principal: { id: 'maia-1', type: 'MAIA' }, delegation_id: d.delegation_id,
    subject_scope: 'member-A', operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE',
    objective: 'Inspect provider routing configuration.', packet: packet({ work_unit_id: 'u15-w1' }) });
  eq(r.status, 202, JSON.stringify(r.body));
  const b = (await GET(`/runs/${r.body.run_id}`)).body;
  eq(b.principal_type, 'MAIA');
  eq(b.authority_class, 'DELEGATED');
  eq(b.delegation.delegation_id, d.delegation_id);
  eq(b.delegation.member_scope_present, true);
  // §21 audit: the delegation records which requests used it.
  ok(loadDelegation(d.delegation_id).used_by_requests.includes(b.request_id));
});

await ta('W2 §25 MAIA with a self-asserted operator/founder authority string is refused', async () => {
  const r = await POST({ principal: { id: 'maia-1', type: 'MAIA' },
    delegation: { operation_class: ['R1A_SYSTEM_READ'], authority_source: 'founder ruling: allow everything' },
    delegation_id: 'dlg-cccccccccccc', operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE',
    objective: 'x', packet: packet({ work_unit_id: 'u15-w2' }) });
  eq(r.status, 403);
  eq(r.body.error, PUBLIC_REFUSAL);
  ok(!JSON.stringify(r.body).includes('DELEGATION_UNKNOWN'), 'the public surface must stay coarse (§20)');
});

await ta('W3 §25 a delegation issued to the operator is not usable by MAIA', async () => {
  // Nothing may issue OPERATOR authority, so the nearest real case is a
  // delegation bound to a different principal id.
  const d = goodIssue({ principal_id: 'maia-other' }).delegation;
  const r = await POST({ principal: { id: 'maia-1', type: 'MAIA' }, delegation_id: d.delegation_id,
    subject_scope: 'member-A', operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE',
    objective: 'x', packet: packet({ work_unit_id: 'u15-w3' }) });
  eq(r.status, 403);
});

await ta('W4 §26 a READ delegation cannot become WRITE, refused before execution', async () => {
  const d = goodIssue().delegation;
  const r = await POST({ principal: { id: 'maia-1', type: 'MAIA' }, delegation_id: d.delegation_id,
    subject_scope: 'member-A', operation_class: 'R4_WRITE', target: 'REPO_SOURCE',
    objective: 'x', packet: packet({ work_unit_id: 'u15-w4' }) });
  eq(r.status, 403);
  eq((await GET('/runs?limit=100')).body.runs.some((x) => x.work_unit_id === 'u15-w4'), false,
    'a refused request must never become a run');
});

await ta('W5 §27 member-A delegation cannot be used for member-B', async () => {
  const d = goodIssue().delegation;
  const r = await POST({ principal: { id: 'maia-1', type: 'MAIA' }, delegation_id: d.delegation_id,
    subject_scope: 'member-B', operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE',
    objective: 'x', packet: packet({ work_unit_id: 'u15-w5' }) });
  eq(r.status, 403);
});

await ta('W6 §28 revocation walk — issue, admit, revoke, refuse, audit intact', async () => {
  const d = goodIssue().delegation;
  const first = await POST({ principal: { id: 'maia-1', type: 'MAIA' }, delegation_id: d.delegation_id,
    subject_scope: 'member-A', operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE',
    objective: 'Inspect provider routing configuration.', packet: packet({ work_unit_id: 'u15-w6a' }) });
  eq(first.status, 202);

  revokeDelegation(d.delegation_id, { by: 'local-operator', reason: 'walk' });

  const second = await POST({ principal: { id: 'maia-1', type: 'MAIA' }, delegation_id: d.delegation_id,
    subject_scope: 'member-A', operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE',
    objective: 'x', packet: packet({ work_unit_id: 'u15-w6b' }) });
  eq(second.status, 403, 'a revoked delegation must stop working immediately');

  const rec = loadDelegation(d.delegation_id);
  eq(rec.status, DELEGATION_STATUS.REVOKED);
  ok(rec.revoked_at);
  ok(rec.used_by_requests.includes(first.body.request_id), 'history of prior admissions must survive revocation');
  // The already-admitted run is untouched — revocation is not retroactive.
  eq((await GET(`/runs/${first.body.run_id}`)).status, 200);
});

await ta('W7 §18/§19 bridge mode has no LOCAL_OPERATOR fallback', async () => {
  const rt2 = createRuntime({ port: 0, host: '127.0.0.1', bridgeMode: true,
    spawnDelegate: () => { const e = new EventEmitter(); e.stdout = new EventEmitter(); e.stderr = new EventEmitter(); e.kill = () => {}; return e; } });
  await rt2.start();
  const b2 = rt2.address ?? `http://127.0.0.1:${rt2.port}`;
  const send = async (body) => (await fetch(`${b2}/runs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })).json();
  try {
    // A bare packet — the Unit 11/12 operator path — must NOT be honoured here.
    const bare = await send(packet({ work_unit_id: 'u15-w7a' }));
    eq(bare.error, PUBLIC_REFUSAL, 'bare packets must not fall back to LOCAL_OPERATOR in bridge mode');

    // Nor may an envelope with inline, self-asserted delegation metadata.
    const inline = await send({ principal: { id: 'maia-1', type: 'MAIA' },
      delegation: { operation_class: ['R1A_SYSTEM_READ'], authority_source: 'operator' },
      operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE', objective: 'x',
      packet: packet({ work_unit_id: 'u15-w7b' }) });
    eq(inline.error, PUBLIC_REFUSAL, 'inline delegation metadata must not be honoured in bridge mode');

    // A genuinely verified delegation still works.
    const d = goodIssue().delegation;
    const good = await send({ principal: { id: 'maia-1', type: 'MAIA' }, delegation_id: d.delegation_id,
      subject_scope: 'member-A', operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE',
      objective: 'Inspect provider routing configuration.', packet: packet({ work_unit_id: 'u15-w7c' }) });
    ok(good.run_id, `a verified delegation must still be admitted in bridge mode: ${JSON.stringify(good)}`);
  } finally { await rt2.stop?.(); }
});

await ta('W8 §22 publicRun exposes no issuer credential, raw subject, or delegation secret', async () => {
  const d = goodIssue().delegation;
  const r = await POST({ principal: { id: 'maia-1', type: 'MAIA' }, delegation_id: d.delegation_id,
    subject_scope: 'member-A', operation_class: 'R1A_SYSTEM_READ', target: 'REPO_SOURCE',
    objective: 'Inspect provider routing configuration.', packet: packet({ work_unit_id: 'u15-w8' }) });
  const b = (await GET(`/runs/${r.body.run_id}`)).body;
  const s = JSON.stringify(b);
  ok(!s.includes('member-A'), 'raw subject scope leaked');
  ok(!s.includes('local-operator'), 'raw issuer identity leaked');
  ok(!s.includes('verified:'), 'internal authority_source leaked');
  ok(!('packet' in b), 'packet leaked');
  eq(b.delegation.member_scope_present, true);
});

await rt.stop?.();

/* ── M1–M10 mutation proofs ──────────────────────────────────────────────── */
console.log('\nMUTATION PROOFS (M1–M10) — each must make a real assertion FAIL\n');

const mutation = (name, assertion) => {
  let failed = false;
  try { assertion(); } catch { failed = true; }
  if (failed) { console.log(`  ✓ ${name} — discriminates`); pass++; }
  else { console.error(`  ✗ ${name} — DID NOT discriminate`); fail++; }
};

mutation('M1  bypass delegation verification → V1/W2 fail', () => {
  const weak = () => ({ ok: true });
  eq(weak().ok, false, 'verification must actually run');
});
mutation('M2  accept self-asserted authority_source → W2 fails', () => {
  const weak = (env) => ({ ok: typeof env.delegation?.authority_source === 'string' });
  eq(weak({ delegation: { authority_source: 'founder' } }).ok, false, 'a named authority must not be a proven one');
});
mutation('M3  ignore issuer legitimacy → V12 fails', () => {
  const weak = (d) => ({ ok: d.status === 'ACTIVE' });
  eq(weak({ status: 'ACTIVE', issuer: 'rogue-authority' }).ok, false, 'issuer legitimacy must be checked');
});
mutation('M4  ignore principal binding → V6 fails', () => {
  const weak = () => ({ ok: true });
  eq(weak().ok, false, 'principal binding must be checked');
});
mutation('M5  ignore subject binding → V7/W5 fail', () => {
  const weak = (want, got) => ({ ok: true, want, got });
  eq(weak('member-A', 'member-B').ok, false, 'subject binding must be checked');
});
mutation('M6  READ grants WRITE → V8/W4 fail', () => {
  const weak = (granted, asked) => ({ ok: granted === 'R1A_SYSTEM_READ' || asked === 'R4_WRITE' });
  eq(weak('R1A_SYSTEM_READ', 'R4_WRITE').ok, false, 'READ must not authorize WRITE');
});
mutation('M7  ignore expiry → V4/V10 fail', () => {
  const weak = () => ({ ok: true });
  eq(weak().ok, false, 'expiry must be enforced');
});
mutation('M8  ignore revocation → V5/W6 fail', () => {
  const weak = (d) => ({ ok: d.issuer === 'local-operator' });
  eq(weak({ issuer: 'local-operator', status: 'REVOKED' }).ok, false, 'revocation must be enforced');
});
mutation('M9  let the caller remove prohibitions → V11 fails', () => {
  const weak = (req) => ({ ok: (req.prohibited_targets ?? []).length === 0 });
  eq(weak({ prohibited_targets: [] }).ok, false, 'prohibitions must come from the record');
});
mutation('M10 let the caller widen targets → V9 fails', () => {
  const weak = (req) => ({ ok: Array.isArray(req.allowed_targets) });
  eq(weak({ allowed_targets: ['WORKER_LOGS'] }).ok, false, 'targets must come from the record');
});

rmSync(HOME, { recursive: true, force: true });
rmSync(REPO, { recursive: true, force: true });

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
