// Shared O5-R2 Path B fixtures: real W v2 units driven by the real code, with
// interrupted states produced by a runner that never returns (a hard stop).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
export const C = require('../../src/canonical-work-unit-v2.js');
export const WUC = require('../../src/work-unit-control.js');
export const R = require('../../src/o5-path-b-recovery.js');
export const REPO = path.resolve(import.meta.dirname, '..', '..', '..');
// A SHA that exists in ANY checkout, including a shallow clone.
export const SHA = execFileSync('git', ['-C', REPO, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
export const ACTOR = 'human:o5-r2-proof';
export const store = await import(pathToFileURL(path.join(REPO, 'scripts/builder/canonical-provider-execution-grant-store-v1.mjs')).href);

const SPEC = {
  objective: 'O5-R2 Path B recovery witness', workClass: 'VERIFICATION', taskShape: 'CODE_GROUNDED', capability: '',
  evidenceClass: 'E1_REPOSITORY_LOCAL', requestedPosture: 'default', reviewPressure: 'ordinary',
  evidenceFocus: 'scripts/builder/work-unit-v2.mjs', acceptanceCriteria: 'durable canonical evidence exists',
  falsificationConditions: 'authority or route changes', stopConditions: 'stop on stale grant',
  authorityRequest: { networkExternal: false, providerSpend: false, externalDisclosure: 'none' },
};

export async function routedReady(env, nowMs) {
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

export function durableBody(args) {
  return {
    execution_version: 'E1.v1', work_unit_id: args.workUnitId, grant_id: args.grantId,
    route_participant_id: args.binding.route_participant_id, transport_binding_id: args.binding.transport_binding_id,
    provider_id: args.binding.provider_id, model_id: args.binding.model_id, adapter_id: args.binding.adapter_id,
    exit_code: 0, test_results: 'pass', escalation_required: false, recommended_next_action: 'review-evidence',
    output_excerpt: 'synthetic evidence', stderr_excerpt: '',
  };
}
/** Persist exactly as work-unit-control.js persistCanonicalDurableResult does. */
export function persist(env, args, result) {
  const file = R.resultFile(env, args.workUnitId, args.grantId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = JSON.stringify(result, null, 2) + '\n';
  fs.writeFileSync(file, body, { mode: 0o600 });
  return { ref: 'canonical-result:' + args.workUnitId + ':' + args.grantId, digest: 'sha256:' + crypto.createHash('sha256').update(body).digest('hex'), file };
}

export async function authorize(env, id) {
  const issued = await WUC.canonicalAuthorizeExecutionOnce(REPO, id, 'primary', { env, actorId: ACTOR });
  assert.equal(issued.ok, true, JSON.stringify(issued));
  return issued.grant.grant_id;
}

/** Real execution, hard-stopped inside the runner. `witness`: write the result before stopping. */
export async function interrupted(env, nowMs, { witness }) {
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

export async function reference(env, nowMs) {
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

export const envelope = (env, id) => JSON.parse(fs.readFileSync(C.workUnitPath(id, env), 'utf8'));
export const attempts = (env, id) => envelope(env, id).work_unit.execution.attempts;
export const artifacts = (env, id) => envelope(env, id).work_unit.execution.artifacts;
export const grantEvents = (env, id) => store.readCanonicalGrantEventsV1(id, { home: env.AIN_DELEGATION_HOME });
export const count = (events, kind) => events.filter((e) => e.event === kind).length;
export const dispositions = (env, id) => {
  const f = R.dispositionFile(env, id);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l)) : [];
};

/** Content-addressed snapshot of an entire directory tree: paths, bytes, and file modes. */
export function treeDigest(root) {
  const out = [];
  const walk = (dir, rel) => {
    for (const name of fs.readdirSync(dir).sort()) {
      const abs = path.join(dir, name);
      const r = path.join(rel, name);
      const st = fs.lstatSync(abs);
      if (st.isDirectory()) { out.push(`d ${r}`); walk(abs, r); }
      else out.push(`f ${r} ${st.mode.toString(8)} ${crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex')}`);
    }
  };
  walk(root, '');
  return { digest: crypto.createHash('sha256').update(out.join('\n')).digest('hex'), entries: out.length };
}
