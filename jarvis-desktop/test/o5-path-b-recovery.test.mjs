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
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const C = require('../src/canonical-work-unit-v2.js');
const WUC = require('../src/work-unit-control.js');
const R = require('../src/o5-path-b-recovery.js');

const REPO = path.resolve(import.meta.dirname, '..', '..');
// A SHA that exists in ANY checkout, including a shallow clone.
const SHA = execFileSync('git', ['-C', REPO, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const ACTOR = 'human:o5-r2-proof';
const store = await import(pathToFileURL(path.join(REPO, 'scripts/builder/canonical-provider-execution-grant-store-v1.mjs')).href);

function tempEnv() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'o5r2-'));
  return { home, env: { ...process.env, AIN_DELEGATION_HOME: home, USER: 'o5-r2-proof' } };
}
const cleanup = (home) => fs.rmSync(home, { recursive: true, force: true });

const SPEC = {
  objective: 'O5-R2 Path B recovery witness', workClass: 'VERIFICATION', taskShape: 'CODE_GROUNDED', capability: '',
  evidenceClass: 'E1_REPOSITORY_LOCAL', requestedPosture: 'default', reviewPressure: 'ordinary',
  evidenceFocus: 'scripts/builder/work-unit-v2.mjs', acceptanceCriteria: 'durable canonical evidence exists',
  falsificationConditions: 'authority or route changes', stopConditions: 'stop on stale grant',
  authorityRequest: { networkExternal: false, providerSpend: false, externalDisclosure: 'none' },
};

async function routedReady(env, nowMs) {
  let out = await C.createCanonicalV2(REPO, SPEC, { canonicalSha: SHA, nowMs, env, actorId: ACTOR });
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  const id = out.work_unit_id;
  for (const to of ['BOUNDED', 'AUTHORIZED']) {
    out = await C.transitionCanonicalV2(REPO, id, to, { env, actorId: ACTOR });
    assert.equal(out.ok, true, JSON.stringify(out.blockers));
  }
  out = await C.bindCanonicalRouteV2(REPO, id, { env, actorId: ACTOR });
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  for (const p of out.routing.participants) {
    if (p.required_for_completion !== true) continue;
    let b = await C.bindCanonicalTransportV2(REPO, id, p.participant_id, { env, actorId: ACTOR });
    assert.equal(b.ok, true, JSON.stringify(b.blockers));
    b = await WUC.canonicalPrepareTransport(REPO, id, p.participant_id, { env, actorId: ACTOR });
    assert.equal(b.ok, true, JSON.stringify(b.blockers));
  }
  return id;
}

function durableBody(args) {
  return {
    execution_version: 'E1.v1', work_unit_id: args.workUnitId, grant_id: args.grantId,
    route_participant_id: args.binding.route_participant_id, transport_binding_id: args.binding.transport_binding_id,
    provider_id: args.binding.provider_id, model_id: args.binding.model_id, adapter_id: args.binding.adapter_id,
    exit_code: 0, test_results: 'pass', escalation_required: false, recommended_next_action: 'review-evidence',
    output_excerpt: 'synthetic evidence', stderr_excerpt: '',
  };
}
/** Persist exactly as work-unit-control.js persistCanonicalDurableResult does. */
function persist(env, args, result) {
  const file = R.resultFile(env, args.workUnitId, args.grantId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = JSON.stringify(result, null, 2) + '\n';
  fs.writeFileSync(file, body, { mode: 0o600 });
  return { ref: 'canonical-result:' + args.workUnitId + ':' + args.grantId, digest: 'sha256:' + crypto.createHash('sha256').update(body).digest('hex'), file };
}

async function authorize(env, id) {
  const issued = await WUC.canonicalAuthorizeExecutionOnce(REPO, id, 'primary', { env, actorId: ACTOR });
  assert.equal(issued.ok, true, JSON.stringify(issued));
  return issued.grant.grant_id;
}

/** Real execution, hard-stopped inside the runner. `witness`: write the result before stopping. */
async function interrupted(env, nowMs, { witness }) {
  const id = await routedReady(env, nowMs);
  const grantId = await authorize(env, id);
  let entered;
  const inRunner = new Promise((r) => { entered = r; });
  WUC.canonicalConfirmAuthorizedExecution(REPO, id, grantId, {
    env, actorId: ACTOR,
    executeCanonicalProvider: async (_root, args) => {
      const w = witness ? persist(env, args, durableBody(args)) : null;
      entered(w);
      return new Promise(() => {}); // the process never returns: a hard stop
    },
  });
  const w = await inRunner;
  return { id, grantId, witness: w };
}

async function reference(env, nowMs) {
  const id = await routedReady(env, nowMs);
  const grantId = await authorize(env, id);
  const done = await WUC.canonicalConfirmAuthorizedExecution(REPO, id, grantId, {
    env, actorId: ACTOR,
    executeCanonicalProvider: async (_root, args) => {
      const d = durableBody(args);
      const p = persist(env, args, d);
      return { ok: true, status: 'COMPLETED', run: { exit_code: 0, stdout: 'synthetic evidence', stderr: '' }, durable_result: d, result_ref: p.ref, result_digest: p.digest };
    },
  });
  assert.equal(done.ok, true, JSON.stringify(done.blockers));
  return { id, grantId };
}

const envelope = (env, id) => JSON.parse(fs.readFileSync(C.workUnitPath(id, env), 'utf8'));
const attempts = (env, id) => envelope(env, id).work_unit.execution.attempts;
const artifacts = (env, id) => envelope(env, id).work_unit.execution.artifacts;
const grantEvents = (env, id) => store.readCanonicalGrantEventsV1(id, { home: env.AIN_DELEGATION_HOME });
const count = (events, kind) => events.filter((e) => e.event === kind).length;
const dispositions = (env, id) => {
  const f = R.dispositionFile(env, id);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l)) : [];
};
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
