// JARVIS O5-R2B/R2D — Path B recovery: fact reader + minimal disposition writer.
//
// Law: the checkpoint is evidence about a prior execution; it is never authority
// to execute the next act. This module reads three durable facts that already
// exist (grant ledger · durable result · W4 envelope), hands them to the pure
// classifier (scripts/builder/o5-recovery-path-b-v1.mjs), and then does exactly
// one of:
//
//   RECORD     settle a still-CLAIMED grant, then ledger the WITNESSED durable
//              result into W4 through the existing appendCanonicalExecutionResultV2
//              — the same call the interrupted execution would have made.
//   CONVERGED  nothing to ledger; settle a still-CLAIMED grant if needed.
//   GATED      append a visible disposition to work-units-v2/recovery/<id>.jsonl.
//   NONE       nothing was dispatched; nothing is written.
//
// ⛔ It never issues, claims, reissues or dispatches anything; no provider,
// model or process is invoked. ⛔ It never transitions W2 lifecycle state.
// ⛔ It never writes a result it did not read byte-for-byte from disk.
// Surfacing dispositions to an operator inbox is O7 and is NOT admitted here;
// the append-only disposition record is the visibility.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const C = require('./canonical-work-unit-v2.js');

const RECOVERY_VERSION = 'O5R2D.v1';
const ACTOR = 'system:jarvis-o5-recovery';

function homeOf(env = process.env) {
  return env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
}
const v2Dir = (env) => path.join(homeOf(env), 'work-units-v2');
const resultFile = (env, id, grantId) => path.join(v2Dir(env), 'results', id, grantId + '.json');
const dispositionFile = (env, id) => path.join(v2Dir(env), 'recovery', id + '.jsonl');

async function loadModules(root) {
  const url = (rel) => pathToFileURL(path.join(root, rel)).href + '?t=' + Date.now();
  const [classifier, store, lifecycle, lease] = await Promise.all([
    import(url('scripts/builder/o5-recovery-path-b-v1.mjs')),
    import(url('scripts/builder/canonical-provider-execution-grant-store-v1.mjs')),
    import(url('scripts/builder/work-unit-lifecycle-v2.mjs')),
    import(url('scripts/builder/grant-writer-lease-v1.mjs')),
  ]);
  return { classifier, store, lifecycle, lease };
}

function listWorkUnitIds(env) {
  const dir = v2Dir(env);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.json') && !f.endsWith('.desktop.json') && !f.includes('.tmp-'))
    .map((f) => f.slice(0, -'.json'.length))
    .sort();
}

/** Read the witness exactly as bytes: digest what is on disk, never a re-serialization. */
function readWitness(env, id, grantId) {
  const file = resultFile(env, id, grantId);
  if (!fs.existsSync(file)) return { present: false };
  let raw;
  try { raw = fs.readFileSync(file); } catch { return { present: true, readable: false }; }
  const digest = 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex');
  try { return { present: true, readable: true, body: JSON.parse(raw.toString('utf8')), digest }; }
  catch { return { present: true, readable: false, digest }; }
}

function readFacts(mods, id, env) {
  const home = homeOf(env);
  let envelope;
  try {
    envelope = JSON.parse(fs.readFileSync(C.workUnitPath(id, env), 'utf8'));
  } catch { envelope = { unreadable: true }; }
  let coreSnapshotNow = null;
  if (envelope && !envelope.unreadable && envelope.work_unit) {
    try { coreSnapshotNow = mods.lifecycle.authorizedCoreSnapshotV2(envelope.work_unit); } catch { coreSnapshotNow = null; }
  }
  let grants = [];
  let grantsUnreadable = false;
  try { grants = mods.store.listCanonicalGrantStandingsV1(id, { home }); } catch { grantsUnreadable = true; }
  const results = {};
  for (const g of grants) {
    const gid = g?.grant?.grant_id;
    if (gid) results[gid] = readWitness(env, id, gid);
  }
  return { work_unit_id: id, envelope, core_snapshot_now: coreSnapshotNow, grants, grants_unreadable: grantsUnreadable, results };
}

function lastDisposition(env, id, grantId) {
  const file = dispositionFile(env, id);
  if (!fs.existsSync(file)) return null;
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    try {
      const rec = JSON.parse(lines[i]);
      if (rec.grant_id === grantId) return rec;
    } catch { /* an unreadable line is skipped for dedupe only; it is never rewritten */ }
  }
  return null;
}

/** Append-only. An identical consecutive disposition for the same grant is not repeated. */
function appendDisposition(env, id, rec, now) {
  const prev = lastDisposition(env, id, rec.grant_id);
  if (prev && prev.action === rec.action && prev.gate === rec.gate && prev.reason === rec.reason) {
    return { appended: false, deduplicated: true };
  }
  const file = dispositionFile(env, id);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify({ recovery_version: RECOVERY_VERSION, at: now(), ...rec }) + '\n', { mode: 0o600 });
  return { appended: true };
}

function settleGrant(mods, env, id, grantId, now) {
  const out = mods.store.consumeCanonicalExecutionGrantV1(id, grantId, {
    home: homeOf(env), at: now(), outcome: 'recovered_after_interruption',
  });
  if (out.ok) return { ok: true };
  // Someone else settled it between read and write: that is convergence, not failure.
  if (out.reason === 'GRANT_NOT_CLAIMED' && out.standing === 'CONSUMED') return { ok: true, already: true };
  return { ok: false, reason: out.reason || 'GRANT_SETTLE_REFUSED' };
}

async function recoverWorkUnit(root, mods, id, { env, write, now }) {
  const facts = readFacts(mods, id, env);
  const decisions = mods.classifier.classifyWorkUnit(facts);
  const outcomes = [];
  for (const d of decisions) {
    const out = { ...d, written: [] };
    if (!write) { outcomes.push(out); continue; }
    const base = { work_unit_id: id, grant_id: d.grant_id, phase: d.phase ?? null, classifier_version: d.classifier_version };

    if (d.action === 'GATED') {
      const a = appendDisposition(env, id, { ...base, action: 'GATED', gate: d.gate, reason: d.reason }, now);
      if (a.appended) out.written.push('disposition');
    } else if (d.action === 'CONVERGED') {
      if (d.settle_grant) {
        const s = settleGrant(mods, env, id, d.grant_id, now);
        if (s.ok) {
          out.written.push('grant:CONSUMED');
          appendDisposition(env, id, { ...base, action: 'SETTLED', gate: null, reason: 'GRANT_SETTLED_AFTER_LEDGER' }, now);
        } else {
          appendDisposition(env, id, { ...base, action: 'GATED', gate: 'BLOCKED_BY_EVIDENCE', reason: s.reason }, now);
          out.written.push('disposition');
        }
      }
    } else if (d.action === 'RECORD') {
      if (d.settle_grant) {
        const s = settleGrant(mods, env, id, d.grant_id, now);
        if (!s.ok) {
          appendDisposition(env, id, { ...base, action: 'GATED', gate: 'BLOCKED_BY_EVIDENCE', reason: s.reason }, now);
          out.written.push('disposition');
          outcomes.push(out);
          continue;
        }
        if (!s.already) out.written.push('grant:CONSUMED');
      }
      const recorded = await C.appendCanonicalExecutionResultV2(root, id, {
        route_participant_id: d.record.route_participant_id,
        transport_binding_id: d.record.transport_binding_id,
        provider_admission: { ok: true, disposition: 'ADMITTED' },
        wrapper_exit_code: d.record.wrapper_exit_code,
        durable_result: d.record.durable_result,
        result_ref: d.record.result_ref,
        result_digest: d.record.result_digest,
      }, { env, actorId: ACTOR });
      if (recorded.ok) {
        out.written.push('w4:attempt');
        appendDisposition(env, id, { ...base, action: 'RECORDED', gate: null, reason: 'WITNESSED_RESULT_LEDGERED', result_ref: d.record.result_ref, result_digest: d.record.result_digest }, now);
      } else {
        out.w4_refusal = recorded.reason || recorded.status;
        appendDisposition(env, id, { ...base, action: 'GATED', gate: 'NEEDS_OPERATOR_AUTHORITY', reason: 'W4_REFUSED:' + String(out.w4_refusal) }, now);
        out.written.push('disposition');
      }
    }
    outcomes.push(out);
  }
  return outcomes;
}

/**
 * Recover every Path B Work Unit under the delegation home.
 * `write: false` classifies only (read-only report).
 */
async function recoverPathB(root, { env = process.env, write = true, now = () => new Date().toISOString(), ids } = {}) {
  const mods = await loadModules(root);
  const report = { recovery_version: RECOVERY_VERSION, write, units: [] };
  // O5-R3: a writing recovery pass is a grant writer and must hold the lease (R3-R1/R3-R3).
  // A read-only pass never touches it (R3-R4).
  let acquiredHere = null;
  if (write) {
    const held = mods.lease.ensureGrantWriterLeaseV1(homeOf(env));
    if (!held.ok) {
      report.refused = { reason: 'GRANT_WRITER_LEASE_UNAVAILABLE', lease_reason: held.reason,
        holder: held.holder ? { host: held.holder.host, pid: held.holder.pid, acquired_at: held.holder.acquired_at } : null };
      return report;
    }
    if (!held.reused) acquiredHere = held.lease;
  }
  try {
    await recoverAll();
  } finally {
    if (acquiredHere) report.lease_release = mods.lease.releaseGrantWriterLeaseV1(homeOf(env), acquiredHere);
  }
  return report;

  async function recoverAll() {
  for (const id of ids || listWorkUnitIds(env)) {
    try {
      const outcomes = await recoverWorkUnit(root, mods, id, { env, write, now });
      if (outcomes.length) report.units.push({ work_unit_id: id, outcomes });
    } catch (e) {
      report.units.push({ work_unit_id: id, error: String(e?.message || e).slice(0, 300) });
    }
  }
  }
}

module.exports = {
  RECOVERY_VERSION,
  ACTOR,
  dispositionFile,
  resultFile,
  readFacts,
  loadModules,
  recoverPathB,
};
