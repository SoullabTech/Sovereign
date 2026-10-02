#!/usr/bin/env node
/**
 * JARVIS O5-R2 — real-home recovery CENSUS (read-only) · the admission witness.
 *
 * Founder ruling 2026-09-30: first contact with historical real state is a
 * separate witnessed act, because it can mutate W4 and settle grants. Run a
 * read-only census first; nothing writes until the census is reviewed.
 *
 * Governing law: RECOVERY MAY COMPLETE THE RECORDING OF AN EFFECT ALREADY
 * WITNESSED; IT MAY NEVER MANUFACTURE EVIDENCE BY REPEATING THE EFFECT.
 *
 *   node scripts/builder/o5-recovery-census.mjs [--out census.json]
 *       Read-only. Never writes inside the delegation home. Groups every Path B
 *       grant by disposition, answers the four RECORD questions, sub-classifies
 *       every stop, reports Path A would-reconcile / unproven runs and any
 *       historical SHAPE the classifier does not model, and prints a census_digest.
 *
 *   node scripts/builder/o5-recovery-census.mjs --write --admit <census_digest>
 *       The witnessed write pass. Recomputes the census and REFUSES unless the
 *       digest equals the admitted one (state unchanged since review) and
 *       nothing is unclassified or malformed. Then runs exactly the reviewed pass.
 *
 * RECORD "exact W4 append" is not predicted by re-implementing the writer: the
 * real writer is REHEARSED on a throwaway copy of that unit's files in a temp
 * directory, and the records it appended there are reported. The real home is
 * opened read-only throughout.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import * as LEASE from './grant-writer-lease-v1.mjs';

const require = createRequire(import.meta.url);
const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CENSUS_VERSION = 'O5R2-CENSUS.v1';

/** Founder's stop categories. A reason missing from this map is UNCLASSIFIED — a new
 *  classifier reason must force an explicit categorization decision here. */
export const STOP_CATEGORY = Object.freeze({
  DISPATCHED_WITHOUT_WITNESS_NO_PROBE: 'no_durable_result',
  DURABLE_RESULT_UNREADABLE: 'torn_or_unreadable_result',
  DURABLE_RESULT_DIGEST_MISSING: 'torn_or_unreadable_result',
  DURABLE_RESULT_UNBOUND: 'wrong_work_unit_identity',
  W0_ENVELOPE_FOREIGN: 'wrong_work_unit_identity',
  GRANT_FOREIGN: 'wrong_work_unit_identity',
  W2_NOT_EXECUTING: 'authority_no_longer_sufficient',
  // O5-R3 — RATIFIED (founder, 2026-09-30): execution authority was successfully claimed, but no
  // dispatch was ever evidenced for the associated routed Work Unit. DESCRIPTIVE, NOT CAUSAL: it
  // says where the lifecycle stopped, never why (crash, cancellation, operator act, bug …). The
  // reason code is the machine classification; this category is the lifecycle state; a cause, if
  // known, is separate evidence and is never inferred here.
  CLAIMED_NEVER_DISPATCHED: 'claimed_never_dispatched',
  W2_AUTHORIZED_CORE_MUTATED: 'authority_no_longer_sufficient',
  GRANT_REVOKED: 'authority_no_longer_sufficient',
  GRANT_INVALIDATED: 'authority_no_longer_sufficient',
  W0_ENVELOPE_UNREADABLE: 'ambiguous_historical_state',
  W0_ENVELOPE_INCOMPLETE: 'ambiguous_historical_state',
  GRANT_LEDGER_UNREADABLE: 'ambiguous_historical_state',
  GRANT_RECORD_MALFORMED: 'ambiguous_historical_state',
});

const sha = (buf) => 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex');
function canonical(v) {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`;
  return JSON.stringify(v ?? null);
}
const homeOf = (env) => env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const ls = (dir) => { try { return fs.readdirSync(dir); } catch { return []; } };

function loadDesktop(root) {
  return {
    R: require(path.join(root, 'jarvis-desktop/src/o5-path-b-recovery.js')),
    MECH: require(path.join(root, 'jarvis-desktop/src/builder-mechanism.js')),
  };
}

/** Copy ONLY this unit's files into a fresh temp home (read from real, write to temp). */
function sandboxCopy(realHome, id) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'o5-census-rehearsal-'));
  const src = path.join(realHome, 'work-units-v2');
  const dst = path.join(tmp, 'work-units-v2');
  const copy = (rel) => {
    const a = path.join(src, rel);
    if (!fs.existsSync(a)) return;
    fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true });
    fs.cpSync(a, path.join(dst, rel), { recursive: true });
  };
  for (const rel of [`${id}.json`, `${id}.desktop.json`, `execution-grants/${id}.jsonl`, `results/${id}`]) copy(rel);
  return tmp;
}

function w4Arrays(env, R, id) {
  const e = JSON.parse(fs.readFileSync(path.join(homeOf(env), 'work-units-v2', id + '.json'), 'utf8'));
  const x = e.work_unit?.execution || {};
  return {
    model_identity: e.work_unit?.provenance?.model_identity || [], attempts: x.attempts || [],
    artifacts: x.artifacts || [], test_results: x.test_results || [],
  };
}
const idOf = (kind, rec) => rec?.[{ model_identity: 'model_identity_id', attempts: 'attempt_id', artifacts: 'artifact_id', test_results: 'test_result_id' }[kind]];

/** Run the REAL writer on a copy; report exactly what it appended there. */
async function rehearse(root, realHome, id, R, store) {
  const tmp = sandboxCopy(realHome, id);
  const env = { ...process.env, AIN_DELEGATION_HOME: tmp };
  try {
    const before = w4Arrays(env, R, id);
    const grantsBefore = store.readCanonicalGrantEventsV1(id, { home: tmp }).length;
    const rep = await R.recoverPathB(root, { env, ids: [id], write: true, now: () => 'REHEARSAL' });
    const after = w4Arrays(env, R, id);
    const appended = {};
    for (const k of Object.keys(after)) {
      const seen = new Set(before[k].map((r) => idOf(k, r)));
      appended[k] = after[k].filter((r) => !seen.has(idOf(k, r)));
    }
    const grantEvents = store.readCanonicalGrantEventsV1(id, { home: tmp }).slice(grantsBefore);
    return { ok: true, outcomes: rep.units[0]?.outcomes ?? [], w4_appended: appended, grant_events_appended: grantEvents };
  } catch (e) {
    return { ok: false, error: String(e?.message || e).slice(0, 300) };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function recordEvidence(facts, d, grantEntry, realHome, id, rehearsal) {
  const env = facts.envelope;
  const w = facts.results[d.grant_id];
  const file = path.join(realHome, 'work-units-v2', 'results', id, d.grant_id + '.json');
  return {
    q1_grant_claimed: {
      grant_id: d.grant_id, standing: grantEntry.standing,
      route_participant_id: grantEntry.grant?.route_participant_id, transport_binding_id: grantEntry.grant?.transport_binding_id,
      canonical_sha: grantEntry.grant?.canonical_sha ?? null,
      events: (grantEntry.events || []).map((e) => ({ event: e.event, at: e.at ?? null, outcome: e.outcome ?? null })),
    },
    q2_durable_result: {
      path: file, bytes: fs.statSync(file).size, digest_of_bytes_on_disk: w.digest,
      body_work_unit_id: w.body?.work_unit_id, body_grant_id: w.body?.grant_id,
      exit_code: w.body?.exit_code ?? null, test_results: w.body?.test_results ?? null, execution_version: w.body?.execution_version ?? null,
    },
    q3_authority_now: {
      lifecycle_state: env.work_unit?.state?.lifecycle_state, guard_current_state: env.guard?.current_state,
      guard_work_unit_id: env.guard?.work_unit_id,
      authorized_core_snapshot_digest: sha(String(env.guard?.authorized_core_snapshot ?? '')),
      authorized_core_now_digest: sha(String(facts.core_snapshot_now ?? '')),
      core_unchanged: env.guard?.authorized_core_snapshot === facts.core_snapshot_now,
      grant_not_withdrawn: !['REVOKED', 'INVALIDATED'].includes(grantEntry.standing),
    },
    q4_exact_w4_append: {
      call: 'appendCanonicalExecutionResultV2 (jarvis-desktop/src/canonical-work-unit-v2.js)',
      args: {
        route_participant_id: d.record.route_participant_id, transport_binding_id: d.record.transport_binding_id,
        provider_admission: { ok: true, disposition: 'ADMITTED' }, wrapper_exit_code: d.record.wrapper_exit_code,
        result_ref: d.record.result_ref, result_digest: d.record.result_digest,
        durable_result: '<the bytes at q2_durable_result.path, digest ' + w.digest + '>',
      },
      grant_settlement_first: d.settle_grant ? 'consumeCanonicalExecutionGrantV1 (CLAIMED → CONSUMED, outcome recovered_after_interruption)' : 'none (already CONSUMED)',
      rehearsal: rehearsal,
    },
  };
}

function shapeObservations(realHome, envelopes, factsById) {
  const v2 = path.join(realHome, 'work-units-v2');
  const obs = [];
  const ids = new Set(envelopes);
  for (const f of ls(path.join(v2, 'execution-grants'))) {
    if (f.endsWith('.lock')) obs.push({ shape: 'GRANT_LEDGER_LOCK_PRESENT', work_unit_id: f.slice(0, -5), note: 'an O_EXCL lock left behind; a write pass would fail to settle this grant (O5-R3 hazard)' });
    else if (f.endsWith('.jsonl') && !ids.has(f.slice(0, -6))) obs.push({ shape: 'GRANT_LEDGER_WITHOUT_ENVELOPE', work_unit_id: f.slice(0, -6) });
  }
  for (const unit of ls(path.join(v2, 'results'))) {
    const facts = factsById.get(unit);
    for (const f of ls(path.join(v2, 'results', unit))) {
      const gid = f.replace(/\.json$/, '');
      if (!facts) obs.push({ shape: 'DURABLE_RESULT_WITHOUT_ENVELOPE', work_unit_id: unit, grant_id: gid });
      else if (!(facts.grants || []).some((g) => g.grant?.grant_id === gid)) obs.push({ shape: 'ORPHAN_DURABLE_RESULT', work_unit_id: unit, grant_id: gid, note: 'result file names a grant absent from the grant ledger' });
    }
  }
  for (const f of ls(v2)) if (f.includes('.tmp-')) obs.push({ shape: 'TEMP_FILE_RESIDUE', file: f, note: 'an interrupted atomicWrite left a temp sibling' });
  for (const f of ls(path.join(v2, 'recovery'))) obs.push({ shape: 'PRIOR_RECOVERY_DISPOSITIONS', work_unit_id: f.replace(/\.jsonl$/, '') });
  for (const [id, facts] of factsById) {
    const env = facts.envelope;
    if (!env || env.unreadable) continue;
    const unresolved = {};
    for (const g of facts.grants || []) if (['ACTIVE', 'CLAIMED'].includes(g.standing)) {
      const p = g.grant?.route_participant_id; unresolved[p] = (unresolved[p] || 0) + 1;
    }
    for (const [p, n] of Object.entries(unresolved)) if (n > 1) obs.push({ shape: 'MULTIPLE_UNRESOLVED_GRANTS', work_unit_id: id, route_participant_id: p, count: n });
    const refs = new Set((facts.grants || []).map((g) => `canonical-result:${id}:${g.grant?.grant_id}`));
    for (const a of env.work_unit?.execution?.attempts || []) {
      if (!(a.evidence_refs || []).some((r) => refs.has(r))) obs.push({ shape: 'W4_ATTEMPT_WITHOUT_GRANT', work_unit_id: id, attempt_id: a.attempt_id, evidence_refs: a.evidence_refs || [] });
    }
    if (env.work_unit?.state?.lifecycle_state === 'EXECUTING' && !(facts.grants || []).length) obs.push({ shape: 'EXECUTING_WITHOUT_GRANT', work_unit_id: id });
  }
  return obs;
}

export async function census(root = DEFAULT_ROOT, { env = process.env, rehearseRecords = true, categories: stopCategory = STOP_CATEGORY } = {}) {
  const { R, MECH } = loadDesktop(root);
  const realHome = homeOf(env);
  const mods = await R.loadModules(root);
  const groups = { NONE: [], CONVERGED: [], RECORD: [], BLOCKED_BY_EVIDENCE: [], NEEDS_OPERATOR_AUTHORITY: [], UNCLASSIFIED_OR_MALFORMED: [] };

  const classified = await R.recoverPathB(root, { env, write: false });
  const envelopes = ls(path.join(realHome, 'work-units-v2')).filter((f) => f.endsWith('.json') && !f.endsWith('.desktop.json') && !f.includes('.tmp-')).map((f) => f.slice(0, -5)).sort();
  const factsById = new Map();
  for (const id of envelopes) factsById.set(id, R.readFacts(mods, id, env));

  for (const u of classified.units) {
    const id = u.work_unit_id;
    if (u.error) { groups.UNCLASSIFIED_OR_MALFORMED.push({ work_unit_id: id, reason: 'CLASSIFIER_ERROR', detail: u.error }); continue; }
    const facts = factsById.get(id);
    const again = facts ? mods.classifier.classifyWorkUnit(facts) : [];
    for (const [i, d] of u.outcomes.entries()) {
      const base = { work_unit_id: id, grant_id: d.grant_id, phase: d.phase ?? null, reason: d.reason };
      if (!again[i] || again[i].action !== d.action || again[i].reason !== d.reason) {
        groups.UNCLASSIFIED_OR_MALFORMED.push({ ...base, reason: 'STATE_CHANGED_DURING_CENSUS', note: 're-run with JARVIS Desktop closed' });
        continue;
      }
      if (d.action === 'NONE') groups.NONE.push(base);
      else if (d.action === 'CONVERGED') groups.CONVERGED.push({ ...base, settle_grant: Boolean(d.settle_grant) });
      else if (d.action === 'RECORD') {
        const grantEntry = facts.grants.find((g) => g.grant?.grant_id === d.grant_id);
        const rehearsal = rehearseRecords ? await rehearse(root, realHome, id, R, mods.store) : { ok: false, skipped: true };
        groups.RECORD.push({ ...base, settle_grant: Boolean(d.settle_grant), evidence: recordEvidence(facts, d, grantEntry, realHome, id, rehearsal) });
      } else if (d.action === 'GATED') {
        const category = stopCategory[d.reason];
        const entry = { ...base, gate: d.gate, category: category ?? null };
        if (!category) groups.UNCLASSIFIED_OR_MALFORMED.push({ ...entry, reason_unmapped: d.reason });
        else if (d.gate === 'NEEDS_OPERATOR_AUTHORITY') groups.NEEDS_OPERATOR_AUTHORITY.push(entry);
        else groups.BLOCKED_BY_EVIDENCE.push(entry);
      } else groups.UNCLASSIFIED_OR_MALFORMED.push({ ...base, reason: 'UNKNOWN_ACTION', action: d.action });
    }
  }
  for (const rec of groups.RECORD) {
    if (!rec.evidence.q4_exact_w4_append.rehearsal.ok) groups.UNCLASSIFIED_OR_MALFORMED.push({ work_unit_id: rec.work_unit_id, grant_id: rec.grant_id, reason: 'REHEARSAL_FAILED', detail: rec.evidence.q4_exact_w4_append.rehearsal.error ?? 'skipped' });
    else if (!rec.evidence.q4_exact_w4_append.rehearsal.outcomes.some((o) => o.written?.includes('w4:attempt'))) {
      groups.UNCLASSIFIED_OR_MALFORMED.push({ work_unit_id: rec.work_unit_id, grant_id: rec.grant_id, reason: 'REHEARSAL_DID_NOT_LEDGER', outcomes: rec.evidence.q4_exact_w4_append.rehearsal.outcomes });
    }
  }

  let pathA;
  try {
    const a = await MECH.reconcileOrphans(root, { dryRun: true });
    pathA = a.ok ? { would_reconcile: a.reconciled, unproven: a.unproven } : { unavailable: a.reason };
  } catch (e) { pathA = { error: String(e?.message || e).slice(0, 300) }; }

  const shapes = shapeObservations(realHome, envelopes, factsById);
  const counts = Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length]));
  const stopCounts = {};
  for (const e of [...groups.BLOCKED_BY_EVIDENCE, ...groups.NEEDS_OPERATOR_AUTHORITY]) stopCounts[e.category] = (stopCounts[e.category] || 0) + 1;

  // The digest binds admission to exactly what was reviewed. Timestamps from the
  // rehearsal are excluded; identities, actions, reasons and witnessed digests are not.
  const digestInput = {
    path_b: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.map((e) => ({
      work_unit_id: e.work_unit_id, grant_id: e.grant_id ?? null, reason: e.reason, gate: e.gate ?? null, settle_grant: e.settle_grant ?? null,
      result_digest: e.evidence?.q2_durable_result?.digest_of_bytes_on_disk ?? null,
      appended: e.evidence ? Object.fromEntries(Object.entries(e.evidence.q4_exact_w4_append.rehearsal.w4_appended || {}).map(([k2, v2]) => [k2, v2.map((r) => idOf(k2, r))])) : null,
    }))])),
    path_a: { would_reconcile: (pathA.would_reconcile || []).map((r) => r.run_id), unproven: (pathA.unproven || []).map((r) => `${r.run_id}:${r.reason}`) },
    shapes: shapes.map((s) => canonical(s)),
  };
  const census_digest = sha(canonical(digestInput));
  const admissible = counts.UNCLASSIFIED_OR_MALFORMED === 0;
  return {
    census_version: CENSUS_VERSION, mode: 'READ_ONLY', delegation_home: realHome, repo_root: root,
    law: 'Recovery may complete the recording of an effect already witnessed; it may never manufacture evidence by repeating the effect.',
    census_digest, admissible, counts, stop_categories: stopCounts,
    path_b: groups, path_a: pathA, shape_observations: shapes,
  };
}

export async function admittedWrite(root, { env = process.env, admit } = {}) {
  // O5-R3: the write pass is a grant writer. It takes the lease BEFORE re-reading the census,
  // so no other writer can move the state between the digest check and the write; with
  // Desktop holding the lease it refuses structurally (no longer "run with Desktop closed").
  const home = env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
  const held = LEASE.ensureGrantWriterLeaseV1(home);
  if (!held.ok) {
    // The full refusal: which lease generation, held by which process incarnation, defeated this writer.
    return { ok: false, refused: 'GRANT_WRITER_LEASE_UNAVAILABLE', lease_reason: held.reason,
      lease_generation: held.generation ?? null, refused_at: new Date().toISOString(),
      holder: held.holder ? { host: held.holder.host, pid: held.holder.pid, process_start_time: held.holder.process_start_time ?? null,
        generation: held.holder.generation ?? null, acquired_at: held.holder.acquired_at } : null };
  }
  try {
    return await admittedWriteUnderLease(root, { env, admit });
  } finally {
    if (!held.reused) LEASE.releaseGrantWriterLeaseV1(home, held.lease);
  }
}

async function admittedWriteUnderLease(root, { env, admit }) {
  const c = await census(root, { env });
  if (!admit || admit !== c.census_digest) return { ok: false, refused: 'CENSUS_DIGEST_MISMATCH', admitted: admit ?? null, current: c.census_digest, note: 'state changed since review, or no admission given — re-run the census and review it' };
  if (!c.admissible) return { ok: false, refused: 'CENSUS_NOT_ADMISSIBLE', unclassified: c.path_b.UNCLASSIFIED_OR_MALFORMED };
  const { R, MECH } = loadDesktop(root);
  const b = await R.recoverPathB(root, { env, write: true });
  const a = await MECH.reconcileOrphans(root, { dryRun: false });
  return { ok: true, census_digest: c.census_digest, path_b: b, path_a: a };
}

function summary(c) {
  const lines = [`O5-R2 recovery census · READ-ONLY · ${c.delegation_home}`, `census_digest ${c.census_digest}`, `admissible: ${c.admissible}`, 'Path B dispositions:'];
  for (const [k, n] of Object.entries(c.counts)) lines.push(`  ${k.padEnd(28)} ${n}`);
  if (Object.keys(c.stop_categories).length) { lines.push('Stop categories:'); for (const [k, n] of Object.entries(c.stop_categories)) lines.push(`  ${k.padEnd(34)} ${n}`); }
  lines.push(`Path A: would_reconcile ${(c.path_a.would_reconcile || []).length} · unproven ${(c.path_a.unproven || []).length}${c.path_a.unavailable ? ' · unavailable: ' + c.path_a.unavailable : ''}`);
  lines.push(`Shape observations: ${c.shape_observations.length}`);
  for (const s of c.shape_observations) lines.push(`  ${s.shape} ${s.work_unit_id ?? s.file ?? ''}`);
  return lines.join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const val = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; };
  if (args.includes('--write')) {
    const r = await admittedWrite(DEFAULT_ROOT, { admit: val('--admit') });
    process.stdout.write(JSON.stringify(r, null, 2) + '\n');
    process.exit(r.ok ? 0 : 2);
  }
  const c = await census(DEFAULT_ROOT);
  const out = val('--out');
  if (out) fs.writeFileSync(out, JSON.stringify(c, null, 2) + '\n');
  process.stdout.write(summary(c) + '\n' + (out ? `full census written to ${out}\n` : ''));
  process.exit(0);
}
