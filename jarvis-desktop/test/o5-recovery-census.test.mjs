// O5-R2 census witness — the admission instrument for first contact with real state.
//
// A throwaway "real home" is built containing every historical shape the census
// must name. The census must (1) leave the home byte-for-byte unchanged, (2) group
// and sub-classify correctly, (3) answer the four RECORD questions, and (4) its
// rehearsed W4 append must equal what the admitted write pass then actually does.
// The write pass must refuse any digest that is not the reviewed one.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import {
  C, REPO, store, routedReady, authorize, interrupted,
  attempts, grantEvents, count, dispositions, treeDigest,
} from './helpers/o5-path-b-fixtures.mjs';

const censusMod = await import(pathToFileURL(path.join(REPO, 'scripts/builder/o5-recovery-census.mjs')).href);

const deadPid = Number(spawnSync(process.execPath, ['-e', 'process.stdout.write(String(process.pid))'], { encoding: 'utf8' }).stdout.trim());

/** Build a home with every shape. Returns ids by role. */
async function buildHome() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'o5-census-home-'));
  const env = { ...process.env, AIN_DELEGATION_HOME: home, USER: 'o5-census' };
  const u = {};
  u.noWitness = (await interrupted(env, 5100, { witness: false })).id;
  const rec = await interrupted(env, 5200, { witness: true });
  u.record = rec.id; u.recordGrant = rec.grantId; u.recordFile = rec.witness.file;
  const torn = await interrupted(env, 5300, { witness: true });
  u.torn = torn.id;
  const b = fs.readFileSync(torn.witness.file); fs.writeFileSync(torn.witness.file, b.subarray(0, b.length >> 1));
  u.authority = (await interrupted(env, 5400, { witness: true })).id;
  { const f = C.workUnitPath(u.authority, env); const e = JSON.parse(fs.readFileSync(f, 'utf8')); e.work_unit.identity.objective += ' (widened)'; fs.writeFileSync(f, JSON.stringify(e, null, 2)); }
  const conv = await interrupted(env, 5500, { witness: true });
  u.converged = conv.id;
  { const body = JSON.parse(fs.readFileSync(conv.witness.file, 'utf8'));
    const r = await C.appendCanonicalExecutionResultV2(REPO, conv.id, { route_participant_id: body.route_participant_id, transport_binding_id: body.transport_binding_id,
      provider_admission: { ok: true, disposition: 'ADMITTED' }, wrapper_exit_code: 0, durable_result: body, result_ref: conv.witness.ref, result_digest: conv.witness.digest }, { env, actorId: 'human:x' });
    assert.equal(r.ok, true); }
  u.none = await routedReady(env, 5600); await authorize(env, u.none);
  const wrong = await interrupted(env, 5700, { witness: true });
  u.wrongIdentity = wrong.id;
  { const body = JSON.parse(fs.readFileSync(wrong.witness.file, 'utf8')); body.work_unit_id = 'v2-someone-else'; fs.writeFileSync(wrong.witness.file, JSON.stringify(body, null, 2) + '\n'); }
  const amb = await interrupted(env, 5800, { witness: false });
  u.ambiguous = amb.id;
  fs.writeFileSync(C.workUnitPath(amb.id, env), '{"work_unit": {"identity"');                 // torn envelope
  // Historical shapes the classifier does not model:
  const v2 = path.join(home, 'work-units-v2');
  fs.writeFileSync(path.join(v2, 'results', u.record, 'grant-that-never-existed.json'), '{}');  // ORPHAN_DURABLE_RESULT
  fs.writeFileSync(path.join(v2, 'execution-grants', u.noWitness + '.lock'), '');             // GRANT_LEDGER_LOCK_PRESENT
  fs.writeFileSync(path.join(v2, 'execution-grants', 'v2-ghost.jsonl'), '');                  // GRANT_LEDGER_WITHOUT_ENVELOPE
  fs.writeFileSync(path.join(v2, u.none + '.json.tmp-999'), '{}');                             // TEMP_FILE_RESIDUE
  // Path A runs:
  const runs = path.join(home, 'runtime', 'runs'); fs.mkdirSync(runs, { recursive: true });
  fs.writeFileSync(path.join(runs, 'r-0000000001.json'), JSON.stringify({ run_id: 'r-0000000001', state: 'RUNNING', created_at: '2026-09-01T00:00:00Z', owner: { pid: deadPid, host: os.hostname() } }));
  fs.writeFileSync(path.join(runs, 'r-0000000002.json'), JSON.stringify({ run_id: 'r-0000000002', state: 'RUNNING', created_at: '2026-08-01T00:00:00Z' }));
  return { home, env, u };
}

async function withHome(fn) {
  const prev = process.env.AIN_DELEGATION_HOME;
  const h = await buildHome();
  process.env.AIN_DELEGATION_HOME = h.home;        // Path A store reads process.env at import
  try { await fn(h); } finally {
    if (prev === undefined) delete process.env.AIN_DELEGATION_HOME; else process.env.AIN_DELEGATION_HOME = prev;
    fs.rmSync(h.home, { recursive: true, force: true });
  }
}
const ids = (arr) => arr.map((e) => e.work_unit_id).sort();

test('CENSUS-1 read-only: the delegation home is byte-for-byte unchanged, including every RECORD rehearsal', async () => {
  await withHome(async ({ home, env }) => {
    const before = treeDigest(home);
    // Instrument self-check: the tree digest must see a one-byte change.
    const probe = path.join(home, 'work-units-v2', 'execution-grants', 'v2-ghost.jsonl');
    fs.appendFileSync(probe, ' '); assert.notEqual(treeDigest(home).digest, before.digest, 'instrument blind');
    fs.writeFileSync(probe, ''); assert.equal(treeDigest(home).digest, before.digest);
    const c = await censusMod.census(REPO, { env });
    const after = treeDigest(home);
    assert.equal(after.digest, before.digest, 'census mutated the home');
    assert.equal(after.entries, before.entries);
    assert.equal(c.mode, 'READ_ONLY');
    assert.ok(c.path_b.RECORD.length >= 1, 'instrument: a RECORD was rehearsed');
  });
});

test('CENSUS-2 grouped by disposition; stops sub-classified into the founder\'s categories', async () => {
  await withHome(async ({ env, u }) => {
    const c = await censusMod.census(REPO, { env });
    assert.deepEqual(ids(c.path_b.NONE), [u.none]);
    assert.deepEqual(ids(c.path_b.RECORD), [u.record]);
    assert.deepEqual(ids(c.path_b.CONVERGED), [u.converged]);
    assert.equal(c.path_b.CONVERGED[0].settle_grant, true);
    const cat = Object.fromEntries([...c.path_b.BLOCKED_BY_EVIDENCE, ...c.path_b.NEEDS_OPERATOR_AUTHORITY].map((e) => [e.work_unit_id, e.category]));
    assert.equal(cat[u.noWitness], 'no_durable_result');
    assert.equal(cat[u.torn], 'torn_or_unreadable_result');
    assert.equal(cat[u.wrongIdentity], 'wrong_work_unit_identity');
    assert.equal(cat[u.authority], 'authority_no_longer_sufficient');
    assert.equal(cat[u.ambiguous], 'ambiguous_historical_state');
    assert.deepEqual(ids(c.path_b.NEEDS_OPERATOR_AUTHORITY), [u.authority]);
    assert.equal(c.counts.UNCLASSIFIED_OR_MALFORMED, 0);
    assert.equal(c.admissible, true);
    for (const reason of Object.keys(censusMod.STOP_CATEGORY)) assert.ok(censusMod.STOP_CATEGORY[reason]);
  });
});

test('CENSUS-3 every RECORD answers the four questions from durable facts', async () => {
  await withHome(async ({ env, u }) => {
    const c = await censusMod.census(REPO, { env });
    const ev = c.path_b.RECORD[0].evidence;
    assert.equal(ev.q1_grant_claimed.grant_id, u.recordGrant);
    assert.deepEqual(ev.q1_grant_claimed.events.map((e) => e.event), ['ISSUED', 'CLAIMED']);
    const bytes = fs.readFileSync(u.recordFile);
    assert.equal(ev.q2_durable_result.path, u.recordFile);
    assert.equal(ev.q2_durable_result.digest_of_bytes_on_disk, 'sha256:' + crypto.createHash('sha256').update(bytes).digest('hex'));
    assert.equal(ev.q2_durable_result.body_work_unit_id, u.record);
    assert.equal(ev.q3_authority_now.lifecycle_state, 'EXECUTING');
    assert.equal(ev.q3_authority_now.core_unchanged, true);
    assert.equal(ev.q3_authority_now.grant_not_withdrawn, true);
    assert.equal(ev.q4_exact_w4_append.args.result_ref, `canonical-result:${u.record}:${u.recordGrant}`);
    const reh = ev.q4_exact_w4_append.rehearsal;
    assert.equal(reh.ok, true);
    assert.equal(reh.w4_appended.attempts.length, 1);
    assert.equal(reh.w4_appended.artifacts[0].digest, ev.q2_durable_result.digest_of_bytes_on_disk);
    assert.deepEqual(reh.grant_events_appended.map((e) => e.event), ['CONSUMED']);
  });
});

test('CENSUS-4 historical shapes the classifier does not model are named, and Path A is reported without mutation', async () => {
  await withHome(async ({ env, u }) => {
    const c = await censusMod.census(REPO, { env });
    const shapes = c.shape_observations.map((s) => s.shape);
    for (const s of ['ORPHAN_DURABLE_RESULT', 'GRANT_LEDGER_LOCK_PRESENT', 'GRANT_LEDGER_WITHOUT_ENVELOPE', 'TEMP_FILE_RESIDUE']) assert.ok(shapes.includes(s), `names ${s}`);
    assert.deepEqual(c.path_a.would_reconcile.map((r) => r.run_id), ['r-0000000001']);
    assert.deepEqual(c.path_a.unproven.map((r) => `${r.run_id}:${r.reason}`), ['r-0000000002:OWNER_UNRECORDED']);
    assert.equal(JSON.parse(fs.readFileSync(path.join(env.AIN_DELEGATION_HOME, 'runtime/runs/r-0000000001.json'), 'utf8')).state, 'RUNNING');
    assert.ok(c.shape_observations.find((s) => s.shape === 'GRANT_LEDGER_LOCK_PRESENT').work_unit_id === u.noWitness);
  });
});

test('CENSUS-5 the census digest is deterministic and changes when state changes', async () => {
  await withHome(async ({ home, env, u }) => {
    const a = await censusMod.census(REPO, { env });
    const b = await censusMod.census(REPO, { env });
    assert.equal(a.census_digest, b.census_digest);
    fs.rmSync(path.join(home, 'work-units-v2', 'execution-grants', u.noWitness + '.lock'));
    const c = await censusMod.census(REPO, { env });
    assert.notEqual(c.census_digest, a.census_digest);
  });
});

test('CENSUS-6 the write pass refuses without admission, or with a stale digest, and writes nothing', async () => {
  await withHome(async ({ home, env }) => {
    const c = await censusMod.census(REPO, { env });
    const before = treeDigest(home);
    const none = await censusMod.admittedWrite(REPO, { env });
    assert.equal(none.ok, false); assert.equal(none.refused, 'CENSUS_DIGEST_MISMATCH');
    const wrong = await censusMod.admittedWrite(REPO, { env, admit: 'sha256:' + '0'.repeat(64) });
    assert.equal(wrong.refused, 'CENSUS_DIGEST_MISMATCH');
    assert.equal(treeDigest(home).digest, before.digest);
    fs.writeFileSync(path.join(home, 'work-units-v2', 'late-arrival.json.tmp-1'), '{}');
    const stale = await censusMod.admittedWrite(REPO, { env, admit: c.census_digest });
    assert.equal(stale.refused, 'CENSUS_DIGEST_MISMATCH', 'state changed since review');
  });
});

test('CENSUS-7 fidelity: the admitted write pass does exactly what the census rehearsed — and nothing unreviewed', async () => {
  await withHome(async ({ env, u }) => {
    const c = await censusMod.census(REPO, { env });
    const rehearsed = c.path_b.RECORD[0].evidence.q4_exact_w4_append.rehearsal.w4_appended;
    const beforeAttempts = Object.fromEntries([u.noWitness, u.torn, u.authority, u.wrongIdentity, u.none].map((id) => [id, attempts(env, id).length]));
    const w = await censusMod.admittedWrite(REPO, { env, admit: c.census_digest });
    assert.equal(w.ok, true, JSON.stringify(w));
    const actual = attempts(env, u.record);
    assert.deepEqual(actual.map((a) => a.attempt_id), rehearsed.attempts.map((a) => a.attempt_id));
    assert.deepEqual(JSON.parse(fs.readFileSync(C.workUnitPath(u.record, env), 'utf8')).work_unit.execution.artifacts.map((a) => [a.artifact_id, a.ref, a.digest]),
      rehearsed.artifacts.map((a) => [a.artifact_id, a.ref, a.digest]));
    assert.equal(count(grantEvents(env, u.record), 'CONSUMED'), 1);
    assert.equal(count(grantEvents(env, u.converged), 'CONSUMED'), 1, 'converged grant settled');
    for (const [id, n] of Object.entries(beforeAttempts)) assert.equal(attempts(env, id).length, n, `${id}: nothing ledgered for a stopped unit`);
    for (const id of [u.noWitness, u.torn, u.authority, u.wrongIdentity]) {
      assert.equal(count(grantEvents(env, id), 'ISSUED'), 1, 'no grant reissued');
      assert.equal(count(grantEvents(env, id), 'CONSUMED'), 0, 'no stopped grant settled');
      assert.equal(dispositions(env, id).at(-1).action, 'GATED');
    }
    const runA = JSON.parse(fs.readFileSync(path.join(env.AIN_DELEGATION_HOME, 'runtime/runs/r-0000000001.json'), 'utf8'));
    assert.equal(runA.state, 'FAILED'); assert.equal(runA.disposition, 'BLOCKED_BY_EVIDENCE');
    const runB = JSON.parse(fs.readFileSync(path.join(env.AIN_DELEGATION_HOME, 'runtime/runs/r-0000000002.json'), 'utf8'));
    assert.equal(runB.state, 'RUNNING', 'unproven legacy run left visibly unresolved');
  });
});

test('CENSUS-8 every classifier stop reason has a founder category; an unmapped one is UNCLASSIFIED and the census inadmissible', async () => {
  const src = fs.readFileSync(path.join(REPO, 'scripts/builder/o5-recovery-path-b-v1.mjs'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const reasons = new Set([...src.matchAll(/gated\(GATES\.\w+,\s*'([A-Z0-9_]+)'/g)].map((m) => m[1]));
  for (const m of src.matchAll(/gate: GATES\.\w+, reason: '([A-Z0-9_]+)'/g)) reasons.add(m[1]);
  for (const standing of ['REVOKED', 'INVALIDATED']) reasons.add(`GRANT_${standing}`);   // reason: `GRANT_${standing}`
  for (const r of ['DURABLE_RESULT_UNREADABLE', 'DURABLE_RESULT_UNBOUND', 'DURABLE_RESULT_DIGEST_MISSING']) reasons.add(r); // via witnessStanding
  assert.ok(reasons.size >= 12, `instrument: found ${reasons.size} reasons`);
  for (const r of reasons) assert.ok(r in censusMod.STOP_CATEGORY, `classifier stop reason ${r} has no founder category`);

  await withHome(async ({ env, u }) => {
    const { DISPATCHED_WITHOUT_WITNESS_NO_PROBE, ...missingOne } = censusMod.STOP_CATEGORY;
    const c = await censusMod.census(REPO, { env, categories: missingOne });
    assert.equal(c.admissible, false);
    assert.ok(c.path_b.UNCLASSIFIED_OR_MALFORMED.some((e) => e.work_unit_id === u.noWitness && e.reason_unmapped === 'DISPATCHED_WITHOUT_WITNESS_NO_PROBE'));
    const w = await censusMod.admittedWrite(REPO, { env, admit: c.census_digest });
    assert.equal(w.ok, false, 'an inadmissible census can never be admitted');
  });
});

test('CENSUS-9 structural: Desktop startup recovery is read-only until a census is admitted', () => {
  const src = fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/main.js'), 'utf8');
  const start = src.indexOf('async function runStartupRecovery');
  const body = src.slice(start, src.indexOf('\n}\n', start));
  assert.ok(start > 0, 'instrument: startup recovery found');
  assert.match(body, /recoverPathB\(root, \{[^}]*write: false[^}]*\}\)/);
  assert.match(body, /reconcileOrphans\(root, \{ dryRun: true \}\)/);
  assert.doesNotMatch(body, /write:\s*true|dryRun:\s*false|admittedWrite/);
});
