// O5-R2D integration witness — Path B recovery against the REAL W v2 substrate.
//
// Interrupted states are not hand-built JSON. Each is produced by the real
// canonicalConfirmAuthorizedExecution, frozen mid-flight by a runner that never
// returns (a hard stop): the grant is CLAIMED and the unit EXECUTING because the
// real code put them there; the durable result exists only if the runner wrote
// it exactly as the real runner does. Recovery is then run and compared with an
// uninterrupted reference execution of the same unit shape.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  C, R, REPO, ACTOR, store, persist, routedReady, authorize, interrupted, reference,
  attempts, artifacts, grantEvents, count, dispositions,
} from './helpers/o5-path-b-fixtures.mjs';

function tempEnv() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'o5r2-'));
  return { home, env: { ...process.env, AIN_DELEGATION_HOME: home, USER: 'o5-r2-proof' } };
}
const cleanup = (home) => fs.rmSync(home, { recursive: true, force: true });
const outcomeFor = (report, id) => report.units.find((u) => u.work_unit_id === id)?.outcomes?.[0];

test('R2D-1 claimed, no witness → BLOCKED_BY_EVIDENCE, nothing reissued, nothing ledgered, visible and deduplicated', async () => {
  const { home, env } = tempEnv();
  try {
    const { id } = await interrupted(env, 4100, { witness: false });
    const before = grantEvents(env, id);
    assert.equal(count(before, 'CLAIMED'), 1);
    const r1 = await R.recoverPathB(REPO, { env, ids: [id] });
    const o = outcomeFor(r1, id);
    assert.equal(o.action, 'GATED'); assert.equal(o.gate, 'BLOCKED_BY_EVIDENCE');
    assert.equal(o.reason, 'DISPATCHED_WITHOUT_WITNESS_NO_PROBE');
    const after = grantEvents(env, id);
    assert.equal(after.length, before.length, 'grant ledger unchanged');
    assert.equal(count(after, 'ISSUED'), 1); assert.equal(count(after, 'CLAIMED'), 1);
    assert.equal(attempts(env, id).length, 0, 'nothing invented into W4');
    assert.equal(dispositions(env, id).length, 1);
    await R.recoverPathB(REPO, { env, ids: [id] });
    assert.equal(dispositions(env, id).length, 1, 'identical disposition not repeated');
  } finally { cleanup(home); }
});

test('R2D-2 claimed + witnessed → RECORD: grant settled, W4 equals the uninterrupted reference, second pass converges', async () => {
  const { home, env } = tempEnv();
  try {
    const ref = await reference(env, 4200);
    const refAttempt = attempts(env, ref.id)[0];
    const refArtifact = artifacts(env, ref.id)[0];

    const { id, grantId, witness } = await interrupted(env, 4300, { witness: true });
    assert.equal(attempts(env, id).length, 0);
    const r = await R.recoverPathB(REPO, { env, ids: [id] });
    const o = outcomeFor(r, id);
    assert.equal(o.action, 'RECORD'); assert.deepEqual(o.written, ['grant:CONSUMED', 'w4:attempt']);

    const events = grantEvents(env, id);
    assert.equal(count(events, 'ISSUED'), 1, 'no grant reissued');
    assert.equal(count(events, 'CLAIMED'), 1, 'no grant re-claimed');
    assert.equal(count(events, 'CONSUMED'), 1);

    const got = attempts(env, id);
    assert.equal(got.length, 1);
    for (const k of ['attempt_kind', 'status', 'route_participant_id', 'transport_binding_id', 'model_family']) {
      assert.equal(got[0][k], refAttempt[k], `attempt.${k} matches uninterrupted reference`);
    }
    assert.deepEqual(got[0].evidence_refs, ['canonical-result:' + id + ':' + grantId]);
    const art = artifacts(env, id)[0];
    assert.equal(art.ref, witness.ref);
    assert.equal(art.digest, witness.digest, 'ledgered digest is the witnessed bytes');
    assert.equal(art.kind, refArtifact.kind);

    const again = await R.recoverPathB(REPO, { env, ids: [id] });
    assert.equal(outcomeFor(again, id).action, 'CONVERGED');
    assert.equal(attempts(env, id).length, 1, 'idempotent');
    assert.equal(count(grantEvents(env, id), 'CONSUMED'), 1);
  } finally { cleanup(home); }
});

test('R2D-3 consumed + witnessed, W4 missing (crash between consume and ledger) → RECORD without re-settling', async () => {
  const { home, env } = tempEnv();
  try {
    const { id, grantId } = await interrupted(env, 4400, { witness: true });
    const c = store.consumeCanonicalExecutionGrantV1(id, grantId, { home });
    assert.equal(c.ok, true);
    const o = outcomeFor(await R.recoverPathB(REPO, { env, ids: [id] }), id);
    assert.equal(o.action, 'RECORD'); assert.equal(o.settle_grant, false);
    assert.deepEqual(o.written, ['w4:attempt']);
    assert.equal(count(grantEvents(env, id), 'CONSUMED'), 1);
    assert.equal(attempts(env, id).length, 1);
  } finally { cleanup(home); }
});

test('R2D-4 truncated witness (non-atomic write torn) → BLOCKED_BY_EVIDENCE, never recorded, never treated as absent', async () => {
  const { home, env } = tempEnv();
  try {
    const { id, witness } = await interrupted(env, 4500, { witness: true });
    const bytes = fs.readFileSync(witness.file);
    fs.writeFileSync(witness.file, bytes.subarray(0, Math.floor(bytes.length / 2)));
    const o = outcomeFor(await R.recoverPathB(REPO, { env, ids: [id] }), id);
    assert.equal(o.action, 'GATED'); assert.equal(o.gate, 'BLOCKED_BY_EVIDENCE'); assert.equal(o.reason, 'DURABLE_RESULT_UNREADABLE');
    assert.equal(attempts(env, id).length, 0);
    assert.equal(count(grantEvents(env, id), 'CONSUMED'), 0);
  } finally { cleanup(home); }
});

test('R2D-5 witnessed, but the authorized core moved → NEEDS_OPERATOR_AUTHORITY, nothing written but the disposition', async () => {
  const { home, env } = tempEnv();
  try {
    const { id } = await interrupted(env, 4600, { witness: true });
    const file = C.workUnitPath(id, env);
    const e = JSON.parse(fs.readFileSync(file, 'utf8'));
    e.work_unit.identity.objective += ' (widened after authorization)';
    fs.writeFileSync(file, JSON.stringify(e, null, 2));
    const o = outcomeFor(await R.recoverPathB(REPO, { env, ids: [id] }), id);
    assert.equal(o.action, 'GATED'); assert.equal(o.gate, 'NEEDS_OPERATOR_AUTHORITY'); assert.equal(o.reason, 'W2_AUTHORIZED_CORE_MUTATED');
    assert.equal(attempts(env, id).length, 0);
    assert.equal(count(grantEvents(env, id), 'CONSUMED'), 0, 'grant not settled under withdrawn authority');
  } finally { cleanup(home); }
});

test('R2D-6 ledgered but grant still CLAIMED (consume refused) → CONVERGED, grant settled, no second attempt', async () => {
  const { home, env } = tempEnv();
  try {
    const { id, witness } = await interrupted(env, 4700, { witness: true });
    const body = JSON.parse(fs.readFileSync(witness.file, 'utf8'));
    const rec = await C.appendCanonicalExecutionResultV2(REPO, id, {
      route_participant_id: body.route_participant_id, transport_binding_id: body.transport_binding_id,
      provider_admission: { ok: true, disposition: 'ADMITTED' }, wrapper_exit_code: 0,
      durable_result: body, result_ref: witness.ref, result_digest: witness.digest,
    }, { env, actorId: ACTOR });
    assert.equal(rec.ok, true, JSON.stringify(rec.blockers));
    const o = outcomeFor(await R.recoverPathB(REPO, { env, ids: [id] }), id);
    assert.equal(o.action, 'CONVERGED'); assert.deepEqual(o.written, ['grant:CONSUMED']);
    assert.equal(attempts(env, id).length, 1);
  } finally { cleanup(home); }
});

test('R2D-7 authorized but never claimed → NONE; read-only mode writes nothing at all', async () => {
  const { home, env } = tempEnv();
  try {
    const id = await routedReady(env, 4800);
    await authorize(env, id);
    const o = outcomeFor(await R.recoverPathB(REPO, { env, ids: [id] }), id);
    assert.equal(o.action, 'NONE');
    assert.equal(dispositions(env, id).length, 0);

    const x = await interrupted(env, 4900, { witness: true });
    const beforeEvents = grantEvents(env, x.id).length;
    const ro = await R.recoverPathB(REPO, { env, ids: [x.id], write: false });
    assert.equal(outcomeFor(ro, x.id).action, 'RECORD');
    assert.equal(grantEvents(env, x.id).length, beforeEvents);
    assert.equal(attempts(env, x.id).length, 0);
    assert.equal(dispositions(env, x.id).length, 0);
  } finally { cleanup(home); }
});

test('R2D-8 structural: the recovery modules cannot issue, claim or dispatch', () => {
  const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const writer = strip(fs.readFileSync(path.join(REPO, 'jarvis-desktop/src/o5-path-b-recovery.js'), 'utf8'));
  const classifier = strip(fs.readFileSync(path.join(REPO, 'scripts/builder/o5-recovery-path-b-v1.mjs'), 'utf8'));
  for (const [name, src] of [['writer', writer], ['classifier', classifier]]) {
    for (const forbidden of ['issueCanonicalExecutionGrantV1', 'claimCanonicalExecutionGrantV1', 'canonicalConfirmAuthorizedExecution',
      'canonicalAuthorizeExecutionOnce', 'executeCanonical', 'transitionCanonicalV2', 'child_process', 'spawn(', 'execFile']) {
      assert.equal(src.includes(forbidden), false, `${name} references ${forbidden}`);
    }
  }
  for (const forbidden of ["from 'node:fs'", "require('node:fs')", 'readFileSync', 'writeFileSync']) {
    assert.equal(classifier.includes(forbidden), false, `classifier is pure: found ${forbidden}`);
  }
});
