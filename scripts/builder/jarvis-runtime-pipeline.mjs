#!/usr/bin/env node
/**
 * JARVIS Unit 11 — the runtime→pipeline seam
 * ═══════════════════════════════════════════════════════════════════════════
 * §1: "Do NOT create a second JARVIS implementation inside a server."
 *
 * This module contains NO delegation logic of its own. It is the smallest seam
 * that lets a process invoke the Units 7–10 pipeline programmatically:
 *
 *   packet  → jarvis-packet-guard.mjs   (leakage lint, SHA binding — Unit 10)
 *           → jarvis-context.mjs        (materialize + budget gate — Unit 8)
 *           → session.mjs status        (Builder capacity — Unit 3/6)
 *           → ain-delegate.sh local-native  (claim → bounded prompt → toolless Qwen →
 *                                            NPA1 diff admission → verifier → JARVIS
 *                                            candidate commit → result contract)
 *           → independent candidate/ledger/verifier re-validation (this file)
 *
 * The one thing genuinely missing from Units 7–10 was a MECHANICAL verifier.
 * In every prior run the worker self-reported `escalation_required: false` and a
 * human read the transcript against the materialized fragments. §7 requires the
 * runtime to drive verification itself, so `verifyEvidence()` re-derives the same
 * fragments the worker was given and checks every citation against them. It is
 * deterministic and never consults the worker's self-assessment — the standing
 * observation across Runs 001–003R is that the self-report is worthless.
 */

import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintLeakage } from './jarvis-packet-guard.mjs';
import { validateWorkerGate } from './jarvis-governance-gate.mjs';
import { materializePacket, budget } from './jarvis-context.mjs';
import { validateNativeExecutionBoundary } from './jarvis-native-prompt.mjs';
import { derivePermissionEnvelope } from './work-unit.mjs';
import { ledgerPath, pathAllowed } from './jarvis-native-patch-admission.mjs';
import { AIN_HOME, nowISO } from './jarvis-runtime-store.mjs';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DELEGATE = path.join(REPO_ROOT, 'scripts', 'ain-delegate.sh');
const SESSION = path.join(REPO_ROOT, 'scripts', 'builder', 'session.mjs');
const PACKETS_DIR = path.join(AIN_HOME, 'packets');
const RESULTS_DIR = path.join(AIN_HOME, 'results');
const LOGS_DIR = path.join(AIN_HOME, 'logs');

// ── §5 run state machine ─────────────────────────────────────────────────────
export const RUN_STATES = [
  'QUEUED', 'VALIDATING', 'CONTEXT_ROUTING', 'READY_FOR_WORKER', 'RUNNING',
  'VALIDATING_RESULT', 'VERIFYING_EVIDENCE',
  // Unit 19 — the run stopped because continuing would require authority it does
  // not hold. Deliberately NON-terminal: the objective is still open, and the
  // same run resumes once legitimate authority arrives. This is not FAILED (no
  // fault), not VERIFIED (nothing was concluded), and not QUEUED (no amount of
  // capacity will start it).
  'PAUSED_FOR_GOVERNANCE',
  'VERIFIED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED',
];
export const TERMINAL_STATES = ['VERIFIED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED'];

/**
 * Legal transitions. Every non-terminal state may reach FAILED or CANCELLED —
 * but FAILED is a *destination*, never a shortcut past a stage, and a failure
 * always carries its own failure_class so "where JARVIS is" survives the collapse
 * into a terminal state (§5: do not collapse all failures into FAILED).
 */
export const LEGAL_TRANSITIONS = {
  QUEUED: ['VALIDATING', 'FAILED', 'CANCELLED'],
  VALIDATING: ['CONTEXT_ROUTING', 'FAILED', 'CANCELLED'],
  CONTEXT_ROUTING: ['READY_FOR_WORKER', 'FAILED', 'CANCELLED'],
  // back to QUEUED is the governed "runtime accepted, worker capacity absent" path (§9)
  READY_FOR_WORKER: ['RUNNING', 'QUEUED', 'FAILED', 'CANCELLED'],
  RUNNING: ['VALIDATING_RESULT', 'FAILED', 'CANCELLED'],
  // Unit 19: a VALIDATED result may instead carry a governance gate the control
  // plane accepted, which pauses rather than concludes.
  VALIDATING_RESULT: ['VERIFYING_EVIDENCE', 'PAUSED_FOR_GOVERNANCE', 'FAILED', 'CANCELLED'],
  VERIFYING_EVIDENCE: ['VERIFIED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED'],
  // Unit 19: the ONLY way out of a pause is back through the queue, and only
  // after an authenticated resolution has widened the grant. The run keeps its
  // identity, objective and pre-gate evidence — this is the same run resuming,
  // not a successor. CANCELLED/FAILED remain reachable so a paused objective can
  // still be abandoned or fail.
  // ESCALATION_REQUIRED is reachable because a REFUSED gate closes the objective
  // truthfully: authority was asked for and denied. Not VERIFIED (nothing was
  // concluded) and not FAILED (nothing malfunctioned).
  PAUSED_FOR_GOVERNANCE: ['QUEUED', 'ESCALATION_REQUIRED', 'FAILED', 'CANCELLED'],
  VERIFIED: [], ESCALATION_REQUIRED: [], FAILED: [], CANCELLED: [],
};

export function isLegalTransition(from, to) {
  return Array.isArray(LEGAL_TRANSITIONS[from]) && LEGAL_TRANSITIONS[from].includes(to);
}

// ── §8 authority ─────────────────────────────────────────────────────────────
/**
 * The MODEL on local-native is read-only/toolless. JARVIS itself may hold a
 * bounded worktree-write envelope so NPA1 can admit, verify and candidate-commit
 * a model-proposed diff. Worker authority and integration authority are distinct.
 *
 * READ_ONLY_LANES is preserved as a compatibility export: it names MODEL
 * authority, not the mutation authority of the JARVIS control plane.
 */
export const READ_ONLY_LANES = ['local-native'];
const WRITE_REQUESTING_KEYS = [
  'allow_write', 'requested_write_authority', 'write_authority',
  'permission_mode', 'repo_write_scope', 'worker_authority',
];

export function checkAuthority(packet) {
  if (!READ_ONLY_LANES.includes(packet.execution_lane)) {
    return { ok: false, failure_class: 'LANE_NOT_PERMITTED',
      detail: `runtime accepts ${READ_ONLY_LANES.join(', ')} only; got '${packet.execution_lane}'` };
  }

  // Legacy/direct worker-write knobs remain forbidden. Worktree mutation is
  // granted only through the canonical Work Unit permission envelope below.
  for (const k of WRITE_REQUESTING_KEYS) {
    if (!(k in packet)) continue;
    const v = packet[k];
    const requestsWrite = v === true || (typeof v === 'string' && /write|worktree|bypass|acceptedits/i.test(v));
    if (requestsWrite) {
      return { ok: false, failure_class: 'LOCAL_WORKER_WRITE_AUTHORITY_REFUSED',
        detail: `packet field '${k}' attempts to grant write authority to the worker; the model is toolless` };
    }
  }

  const envelope = derivePermissionEnvelope(packet);
  if (!envelope.repo_read || envelope.repo_write_scope !== 'worktree') {
    return { ok: false, failure_class: 'NATIVE_WORKTREE_WRITE_AUTHORITY_REQUIRED',
      detail: 'local-native coding V1 requires repo.read + bounded repo.write:worktree for JARVIS patch admission' };
  }
  if (envelope.integration_actor !== 'jarvis') {
    return { ok: false, failure_class: 'JARVIS_INTEGRATION_ACTOR_REQUIRED',
      detail: `local-native candidate integration belongs to JARVIS; got '${envelope.integration_actor}'` };
  }
  if (envelope.production_read || envelope.production_write || envelope.deploy
      || envelope.authority_change || envelope.external_network
      || envelope.external_repo_disclosure || envelope.provider_spend) {
    return { ok: false, failure_class: 'NATIVE_AUTHORITY_TOO_BROAD',
      detail: 'local-native V1 admits only local repo read + worktree write + checks; production/network/spend authority is refused' };
  }
  if (!envelope.execute_checks
      || !Array.isArray(packet.verification_commands)
      || packet.verification_commands.length === 0) {
    return { ok: false, failure_class: 'NATIVE_VERIFICATION_REQUIRED',
      detail: 'local-native coding V1 requires at least one packet verification command' };
  }
  return { ok: true, envelope };
}

// ── §14 packet validation ────────────────────────────────────────────────────
/** Slug, not free text: this value becomes a filename, a branch name and an argv entry. */
export const WORK_UNIT_ID_RE = /^[a-z0-9][a-z0-9-]{2,63}$/;
const SHA_RE = /^[0-9a-f]{7,40}$/;

export function validatePacket(packet) {
  const errors = [];
  const str = (k) => typeof packet?.[k] === 'string' && packet[k].trim().length > 0;
  if (!packet || typeof packet !== 'object' || Array.isArray(packet)) {
    return { ok: false, failure_class: 'PACKET_SCHEMA_INVALID', errors: ['packet must be a JSON object'] };
  }
  if (!str('work_unit_id')) errors.push('work_unit_id: required non-empty string');
  else if (!WORK_UNIT_ID_RE.test(packet.work_unit_id)) errors.push(`work_unit_id: must match ${WORK_UNIT_ID_RE}`);
  if (!str('objective')) errors.push('objective: required non-empty string');
  if (!str('expected_output')) errors.push('expected_output: required non-empty string');
  if (!str('execution_lane')) errors.push('execution_lane: required non-empty string');
  if (!str('canonical_sha')) errors.push('canonical_sha: required non-empty string');
  else if (!SHA_RE.test(packet.canonical_sha)) errors.push('canonical_sha: must be a hex git sha');
  if (packet.branch != null && (typeof packet.branch !== 'string' || !/^(feature|fix|chore)\//.test(packet.branch))) {
    errors.push('branch: must start with feature/, fix/ or chore/ (git hook policy)');
  }
  for (const k of ['established_facts', 'allowed_files', 'prohibited_files_actions',
                   'acceptance_criteria', 'escalation_conditions', 'context_selectors']) {
    if (packet[k] != null && !Array.isArray(packet[k])) errors.push(`${k}: must be an array when present`);
  }
  return errors.length
    ? { ok: false, failure_class: 'PACKET_SCHEMA_INVALID', errors }
    : { ok: true, errors: [] };
}

// ── §9 capacity — reuse Builder OS, never a second capacity system ───────────
export function capacity() {
  try {
    const out = execFileSync('node', [SESSION, 'status', '--json'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20000 });
    const j = JSON.parse(out);
    return { ok: true, active: j.active, limit: j.limit, limit_source: j.limit_source,
             available: j.active < j.limit };
  } catch (e) {
    // Fail CLOSED: an unreadable capacity ledger is not permission to dispatch.
    return { ok: false, available: false, error: e.message };
  }
}

// ── evidence verification (independent of the worker's self-report) ──────────
const CITATION_RE = /([A-Za-z0-9_./-]+\.(?:ts|tsx|js|jsx|mjs|cjs|json|md|sh)):(\d+)(?:\s*[-–]\s*(\d+))?/g;

/**
 * Every citation must land inside a fragment the worker was actually shown.
 * A worker with no tools cannot have read anything else — so a citation outside
 * the materialized ranges is, by construction, fabricated. This is precisely the
 * defect class that made Run 003 EVIDENCE INSUFFICIENT.
 */
export function verifyEvidence(output, fragments) {
  const index = fragments.map((f) => ({
    file: f.source_file, base: path.basename(f.source_file),
    start: f.start_line, end: f.end_line, sha: f.source_sha,
  }));
  const seen = new Set();
  const citations = [];
  for (const m of String(output || '').matchAll(CITATION_RE)) {
    const [, ref, a, b] = m;
    const lines = b ? [Number(a), Number(b)] : [Number(a)];
    for (const line of lines) {
      const key = `${ref}:${line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const frag = index.find((f) =>
        (f.file === ref || f.file.endsWith(`/${ref}`) || ref.endsWith(`/${f.file}`) || f.base === path.basename(ref))
        && line >= f.start && line <= f.end);
      citations.push(frag
        ? { citation: key, in_context: true, fragment: `${frag.file}:${frag.start}-${frag.end}`, source_sha: frag.sha }
        : { citation: key, in_context: false, reason: 'not inside any materialized fragment' });
    }
  }
  const valid = citations.filter((c) => c.in_context);
  const invalid = citations.filter((c) => !c.in_context);
  return {
    method: 'materialized-fragment-containment',
    total: citations.length, valid: valid.length, invalid: invalid.length,
    citations, invalid_citations: invalid,
    fragments_offered: index.length,
    ok: citations.length > 0 && invalid.length === 0,
  };
}

// ── result contract validation (§ AIN_RESULT_CONTRACT) ───────────────────────
const RESULT_REQUIRED = ['work_unit_id', 'lane', 'model', 'starting_sha', 'files_changed',
  'escalation_required', 'recommended_next_action', 'log_path', 'duration_s'];

export function validateResult(result) {
  const missing = RESULT_REQUIRED.filter((k) => result?.[k] === undefined);
  return missing.length
    ? { ok: false, failure_class: 'RESULT_CONTRACT_INVALID', missing }
    : { ok: true, missing: [] };
}

const COMMIT_SHA_RE = /^[0-9a-f]{7,40}$/i;

const exactPaths = (value) => {
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string' || !v.trim())) {
    return { ok: false, paths: [] };
  }
  const paths = value.map((v) => v.trim());
  const unique = [...new Set(paths)].sort();
  return { ok: unique.length === paths.length, paths: unique };
};
const samePaths = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

const nativeGit = (worktree, args) => execFileSync('git', ['-C', worktree, ...args], {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000,
}).trim();

const nativeRefusal = (failure_class, detail) => ({ ok: false, failure_class, detail });

/**
 * Validate a successful local-native coding result independently of the worker
 * and independently of the delegate's summary. This proves the mutation was one
 * JARVIS-authored candidate commit created from one NPA1-admitted patch, on the
 * packet's exact canonical parent, and that the packet's verifier commands pass
 * again against that committed candidate without mutating it.
 */
export function validateNativePatchResult(packet, result, worktree, {
  runGit = nativeGit,
  runVerification = null,
} = {}) {
  if (result?.lane !== 'local-native') {
    return nativeRefusal('NATIVE_RESULT_LANE_MISMATCH', `got lane '${result?.lane}'`);
  }
  if (result?.model !== 'qwen3-coder:30b') {
    return nativeRefusal('NATIVE_RESULT_MODEL_MISMATCH', `got model '${result?.model}'`);
  }
  if (result?.exit_code !== 0) {
    return nativeRefusal('NATIVE_RESULT_EXIT_NONZERO', `exit_code=${result?.exit_code}`);
  }
  if (result?.test_results !== 'pass') {
    return nativeRefusal('NATIVE_VERIFICATION_NOT_PASSING', `test_results=${result?.test_results}`);
  }
  if (result?.escalation_required === true) {
    return nativeRefusal('NATIVE_LEGACY_ESCALATION_UNSUPPORTED', 'coding result may gate, but may not carry legacy escalation');
  }

  const admission = result?.patch_admission;
  if (!admission || admission.ok !== true || admission.status !== 'APPLIED'
      || admission.code !== 'PATCH_APPLIED' || admission.event?.applied !== true) {
    return nativeRefusal('NATIVE_PATCH_ADMISSION_MISSING', 'result lacks a successful NPA1 APPLIED record');
  }

  const admitted = exactPaths(admission.changed_paths);
  const proposed = exactPaths(admission.patch_paths);
  const reported = exactPaths(result.files_changed);
  if (!admitted.ok || !proposed.ok || !reported.ok || admitted.paths.length === 0) {
    return nativeRefusal('NATIVE_PATH_EVIDENCE_INVALID', 'changed/patch/result paths must be unique non-empty string arrays');
  }
  if (!samePaths(admitted.paths, proposed.paths) || !samePaths(admitted.paths, reported.paths)) {
    return nativeRefusal('NATIVE_PATH_EVIDENCE_MISMATCH',
      `admitted=${admitted.paths.join(',')} proposed=${proposed.paths.join(',')} reported=${reported.paths.join(',')}`);
  }
  const unauthorized = admitted.paths.filter((file) => !pathAllowed(file, packet.allowed_files ?? []));
  if (unauthorized.length) {
    return nativeRefusal('NATIVE_PATH_OUTSIDE_PACKET', unauthorized.join(','));
  }

  if (!COMMIT_SHA_RE.test(String(packet.canonical_sha || ''))
      || !COMMIT_SHA_RE.test(String(result.starting_sha || ''))
      || !COMMIT_SHA_RE.test(String(result.ending_sha || ''))) {
    return nativeRefusal('NATIVE_COMMIT_ID_INVALID', 'base/start/end must be immutable hex commit ids');
  }

  let base;
  let start;
  let head;
  let ending;
  let parent;
  let count;
  let commitPaths;
  let authorName;
  let authorEmail;
  let committerName;
  let committerEmail;
  let subject;
  let status;
  try {
    base = runGit(worktree, ['rev-parse', packet.canonical_sha + '^{commit}']);
    start = runGit(worktree, ['rev-parse', result.starting_sha + '^{commit}']);
    head = runGit(worktree, ['rev-parse', 'HEAD']);
    ending = runGit(worktree, ['rev-parse', result.ending_sha + '^{commit}']);
    parent = runGit(worktree, ['rev-parse', head + '^']);
    count = Number(runGit(worktree, ['rev-list', '--count', base + '..' + head]));
    commitPaths = runGit(worktree, ['diff', '--name-only', base + '..' + head, '--'])
      .split('\n').map((v) => v.trim()).filter(Boolean).sort();
    authorName = runGit(worktree, ['show', '-s', '--format=%an', head]);
    authorEmail = runGit(worktree, ['show', '-s', '--format=%ae', head]);
    committerName = runGit(worktree, ['show', '-s', '--format=%cn', head]);
    committerEmail = runGit(worktree, ['show', '-s', '--format=%ce', head]);
    subject = runGit(worktree, ['show', '-s', '--format=%s', head]);
    status = runGit(worktree, ['status', '--porcelain', '--untracked-files=all']);
  } catch (error) {
    return nativeRefusal('NATIVE_COMMIT_CUSTODY_UNREADABLE', String(error?.message || error).slice(0, 500));
  }

  if (base !== start || head !== ending || parent !== base || count !== 1) {
    return nativeRefusal('NATIVE_COMMIT_LINEAGE_INVALID',
      `base=${base} start=${start} parent=${parent} head=${head} ending=${ending} count=${count}`);
  }
  if (!samePaths(admitted.paths, commitPaths)) {
    return nativeRefusal('NATIVE_COMMIT_PATH_MISMATCH',
      `admitted=${admitted.paths.join(',')} commit=${commitPaths.join(',')}`);
  }
  if (authorName !== 'JARVIS' || authorEmail !== 'jarvis@local.invalid'
      || committerName !== 'JARVIS' || committerEmail !== 'jarvis@local.invalid') {
    return nativeRefusal('NATIVE_COMMIT_ACTOR_INVALID',
      `author=${authorName}<${authorEmail}> committer=${committerName}<${committerEmail}>`);
  }
  if (subject !== `chore(jarvis): ${packet.work_unit_id}`) {
    return nativeRefusal('NATIVE_COMMIT_MESSAGE_INVALID', subject);
  }
  if (status) {
    return nativeRefusal('NATIVE_WORKTREE_NOT_CLEAN_AFTER_COMMIT', status.slice(0, 500));
  }

  const expectedLedger = path.resolve(ledgerPath(packet.work_unit_id));
  if (path.resolve(String(admission.evidence_path || '')) !== expectedLedger || !existsSync(expectedLedger)) {
    return nativeRefusal('NATIVE_PATCH_LEDGER_MISSING', expectedLedger);
  }
  let ledgerEvents;
  try {
    ledgerEvents = readFileSync(expectedLedger, 'utf8').trim().split('\n')
      .filter(Boolean).map((line) => JSON.parse(line));
  } catch (error) {
    return nativeRefusal('NATIVE_PATCH_LEDGER_INVALID', String(error?.message || error).slice(0, 500));
  }
  const appliedEvent = [...ledgerEvents].reverse().find((event) =>
    event?.work_unit_id === packet.work_unit_id
    && event?.event === 'APPLIED'
    && event?.code === 'PATCH_APPLIED'
    && event?.applied === true
    && event?.patch_digest === admission.patch_digest);
  if (!appliedEvent) {
    return nativeRefusal('NATIVE_PATCH_LEDGER_APPLIED_EVENT_MISSING', admission.patch_digest);
  }
  const ledgerPaths = exactPaths(appliedEvent.changed_paths);
  if (!ledgerPaths.ok || !samePaths(admitted.paths, ledgerPaths.paths)) {
    return nativeRefusal('NATIVE_PATCH_LEDGER_PATH_MISMATCH', JSON.stringify(appliedEvent.changed_paths ?? []));
  }

  const commands = packet.verification_commands;
  if (!Array.isArray(commands) || commands.length === 0) {
    return nativeRefusal('NATIVE_VERIFICATION_REQUIRED', 'no verification commands');
  }
  const verify = runVerification ?? ((command) => execFileSync('bash', ['-lc', command], {
    cwd: worktree, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000,
  }));
  const verification = [];
  for (const command of commands) {
    try {
      verify(command, worktree);
      verification.push({ command, status: 'PASS' });
    } catch (error) {
      return nativeRefusal('NATIVE_VERIFICATION_FAILED',
        `${command}: ${String(error?.stderr || error?.message || error).slice(0, 300)}`);
    }
    try {
      const verifyHead = runGit(worktree, ['rev-parse', 'HEAD']);
      const verifyStatus = runGit(worktree, ['status', '--porcelain', '--untracked-files=all']);
      if (verifyHead !== head || verifyStatus) {
        return nativeRefusal('NATIVE_VERIFICATION_MUTATED_CANDIDATE',
          `command=${command} head=${verifyHead} status=${verifyStatus.slice(0, 300)}`);
      }
    } catch (error) {
      return nativeRefusal('NATIVE_VERIFICATION_CUSTODY_UNREADABLE',
        String(error?.message || error).slice(0, 500));
    }
  }

  return {
    ok: true,
    method: 'NPA1 + candidate-commit custody + independent verifier replay',
    commit_sha: head,
    parent_sha: base,
    patch_digest: admission.patch_digest,
    changed_paths: admitted.paths,
    verification,
  };
}

// ── the run driver ───────────────────────────────────────────────────────────
const packetFile = (id) => path.join(PACKETS_DIR, `${id}.json`);
const resultFile = (id) => path.join(RESULTS_DIR, `${id}.json`);
const logFile = (id) => path.join(LOGS_DIR, `${id}.log`);

const DELEGATE_EXIT_FAILURES = {
  1: 'BUILDER_OWNERSHIP_REFUSED',
  2: 'CONTENDED_OR_UNKNOWN_LANE',
  5: 'CONTEXT_BUDGET_EXCEEDED',
  7: 'PACKET_ANSWER_LEAKAGE',
  8: 'SELECTOR_SHA_MISMATCH',
  9: 'NATIVE_PATCH_ADMISSION_REFUSED',
  10: 'NATIVE_OUTPUT_CONTRACT_INVALID',
  11: 'NATIVE_CUSTODY_FAILURE',
  12: 'NATIVE_VERIFICATION_FAILED',
};

/**
 * Drive one run. `ctx.transition(state, patch)` is supplied by the caller so the
 * runtime owns persistence and event emission and this module owns only the seam.
 * `ctx.registerChild(child)` lets the caller cancel an in-flight worker (§4).
 */
export async function executeRun(run, ctx) {
  const T = (state, patch) => ctx.transition(run, state, patch);
  const fail = (failure_class, detail) => {
    T('FAILED', { failure_class, failure_detail: detail, disposition: 'FAILED' });
    return run;
  };
  const packet = run.packet;

  // ── VALIDATING ─────────────────────────────────────────────────────────────
  T('VALIDATING', {});
  const v = validatePacket(packet);
  if (!v.ok) return fail(v.failure_class, v.errors.join('; '));
  const auth = checkAuthority(packet);
  if (!auth.ok) return fail(auth.failure_class, auth.detail);

  // The delegation substrate is shared. Never silently overwrite another unit's packet.
  const pf = packetFile(packet.work_unit_id);
  if (existsSync(pf) && !run.owns_packet) {
    let existing = null;
    try { existing = JSON.parse(readFileSync(pf, 'utf8')); } catch { /* unreadable */ }
    if (existing?.runtime_run_id !== run.run_id) {
      return fail('WORK_UNIT_ID_IN_USE', `a packet already exists at ${pf}; choose another work_unit_id`);
    }
  }
  const onDisk = { ...packet, runtime_run_id: run.run_id, runtime_submitted_at: nowISO() };
  writeFileSync(pf, JSON.stringify(onDisk, null, 2));
  run.owns_packet = true;
  run.packet_path = pf;

  if (ctx.cancelled(run)) return run;

  // ── CONTEXT_ROUTING ────────────────────────────────────────────────────────
  T('CONTEXT_ROUTING', {});

  // Leakage is a property of the packet alone — it needs no repository. Lint FIRST
  // so a leaking packet is refused before it can claim a worktree or a Builder slot.
  const lint = lintLeakage(packet);
  if (!lint.ok) return fail('PACKET_ANSWER_LEAKAGE', JSON.stringify(lint.violations).slice(0, 500));

  let worktree = packet.worktree;
  if (!worktree || !existsSync(worktree)) {
    try {
      worktree = execFileSync('bash', [DELEGATE, 'claim', packet.work_unit_id],
        { encoding: 'utf8', cwd: REPO_ROOT, timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] }).trim().split('\n').pop();
    } catch (e) {
      return fail('WORKTREE_CLAIM_FAILED', String(e.stderr || e.message).slice(0, 500));
    }
  }
  if (!worktree || !existsSync(worktree)) return fail('WORKTREE_CLAIM_FAILED', `no worktree at ${worktree}`);
  run.worktree = worktree;

  const bound = { ...onDisk, worktree };
  writeFileSync(pf, JSON.stringify(bound, null, 2));

  // Unit 10's SHA gate, run here so the runtime can report WHICH gate refused
  // rather than only that the delegate exited non-zero. ain-delegate re-runs both
  // gates itself before invoking any worker; both paths fail closed on the same modules.
  let nativeBoundary;
  try {
    nativeBoundary = validateNativeExecutionBoundary(bound, worktree);
  } catch (error) {
    return fail(error?.code || 'NATIVE_CONTEXT_BOUNDARY_REFUSED',
      JSON.stringify(error?.detail ?? error?.message ?? error).slice(0, 500));
  }
  const execHead = nativeBoundary.execHead;

  let fragments, budgetReport;
  try {
    budgetReport = budget(bound, worktree);
    fragments = materializePacket(bound, worktree);
  } catch (e) {
    return fail('CONTEXT_SELECTION_FAILED', String(e.message).slice(0, 500));
  }
  if (!budgetReport.within_budget) {
    return fail('CONTEXT_BUDGET_EXCEEDED',
      `est ${budgetReport.estimated_input_tokens} tok > threshold ${budgetReport.safe_threshold}`);
  }
  run.context = {
    execution_head: execHead,
    fragment_count: budgetReport.fragment_count,
    estimated_input_tokens: budgetReport.estimated_input_tokens,
    safe_threshold: budgetReport.safe_threshold,
    // provenance only — never fragment CONTENT (§6: telemetry, not the audit artifact)
    manifest: budgetReport.fragments,
  };
  ctx.emit('context.selected', {
    run_id: run.run_id, fragments: budgetReport.fragment_count,
    estimated_input_tokens: budgetReport.estimated_input_tokens, execution_head: execHead,
  });

  if (ctx.cancelled(run)) return run;

  // ── READY_FOR_WORKER — runtime accepted ≠ worker capacity available (§9) ────
  T('READY_FOR_WORKER', {});
  const cap = capacity();
  if (!cap.available) {
    T('QUEUED', { blocked: { reason: 'WORKER_CAPACITY_UNAVAILABLE', ...cap, at: nowISO() } });
    return run;
  }
  run.blocked = null;

  // ── RUNNING ────────────────────────────────────────────────────────────────
  T('RUNNING', { worker: { lane: packet.execution_lane, model: 'qwen3-coder:30b',
                           transport: 'ollama-native-toolless', started_at: nowISO() } });
  ctx.emit('worker.started', { run_id: run.run_id, lane: packet.execution_lane });

  // The ONE seam into the proven pipeline. `ctx.spawnDelegate` exists so the proof
  // harness can drive every surrounding stage for real against a canned delegate;
  // in the runtime it is always the real ain-delegate.sh invocation below.
  const spawnDelegate = ctx.spawnDelegate
    ?? ((args) => spawn('bash', [DELEGATE, ...args], { cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'] }));

  const delegate = await new Promise((resolve) => {
    const child = spawnDelegate(['local-native', packet.work_unit_id]);
    ctx.registerChild(run, child);
    let err = '';
    child.stdout.on('data', () => { /* the result contract is the artifact, not stdout */ });
    child.stderr.on('data', (d) => { err += d.toString().slice(0, 4000); });
    child.on('error', (e) => resolve({ code: -1, stderr: e.message }));
    child.on('close', (code, signal) => resolve({ code, signal, stderr: err }));
  });
  ctx.registerChild(run, null);
  ctx.emit('worker.completed', { run_id: run.run_id, exit_code: delegate.code });

  if (ctx.cancelled(run)) return run;
  if (delegate.signal) return fail('WORKER_TERMINATED', `worker terminated by ${delegate.signal}`);
  if (delegate.code !== 0) {
    return fail(DELEGATE_EXIT_FAILURES[delegate.code] || 'WORKER_EXECUTION_FAILED',
      (delegate.stderr || '').trim().slice(-600));
  }

  // ── VALIDATING_RESULT ──────────────────────────────────────────────────────
  T('VALIDATING_RESULT', {});
  const rf = resultFile(packet.work_unit_id);
  if (!existsSync(rf)) return fail('RESULT_MISSING', `no result contract at ${rf}`);
  let result;
  try { result = JSON.parse(readFileSync(rf, 'utf8')); }
  catch (e) { return fail('RESULT_CONTRACT_INVALID', e.message); }

  const rv = validateResult(result);
  if (!rv.ok) return fail(rv.failure_class, `missing: ${rv.missing.join(', ')}`);

  // ── Unit 19: native governance gate ────────────────────────────────────────
  // A worker may return a structured claim that it cannot legitimately continue.
  // The claim is validated against THIS run before it becomes governance state;
  // an invalid gate is a result-contract failure, never an indefinite pause, so
  // a worker cannot suspend its own run by emitting nonsense.
  if (result.governance_gate !== undefined) {
    if ((result.files_changed?.length ?? 0) > 0 || result.ending_sha || result.patch_admission !== undefined) {
      return fail('GOVERNANCE_GATE_MUTATION_CONFLICT',
        'a worker gate may identify missing authority; it may not coexist with an applied patch or candidate commit');
    }
    const held = {
      operation_class: run.operation_class ?? run.admission?.operation_class ?? null,
      allowed_targets: run.delegation?.allowed_targets ?? [],
    };
    const gv = validateWorkerGate(result.governance_gate, run, { heldAuthority: held }, nowISO());
    if (!gv.ok) {
      return fail('GOVERNANCE_GATE_INVALID', `${gv.refusal}: ${gv.reason}`);
    }
    // Pre-gate evidence is preserved on the run so resumption continues the same
    // work rather than restarting it (§12 of the mandate).
    run.pre_gate_result = {
      lane: result.lane, model: result.model, exit_summary: result.summary,
      duration_s: result.duration_s, starting_sha: result.starting_sha,
      phase_completed: result.phase_completed ?? null,
    };
    run.governance_gate = gv.gate;
    T('PAUSED_FOR_GOVERNANCE', {
      blocked: { reason: 'AUTHORITY_REQUIRED', gate_class: gv.gate.gate_class,
        gate_id: gv.gate.gate_id, at: nowISO() },
    });
    ctx.emit('governance.gate_opened', {
      run_id: run.run_id, gate_id: gv.gate.gate_id, gate_class: gv.gate.gate_class,
      required_resolver_role: gv.gate.required_resolver_role,
    });
    return run;
  }

  run.result_path = rf;
  run.log_path = result.log_path || logFile(packet.work_unit_id);
  run.result = {
    lane: result.lane, model: result.model, exit_summary: result.summary,
    duration_s: result.duration_s, starting_sha: result.starting_sha,
    ending_sha: result.ending_sha, files_changed: result.files_changed,
    test_results: result.test_results, patch_admission: result.patch_admission ?? null,
    worker_self_reported_escalation: result.escalation_required,
    recommended_next_action: result.recommended_next_action,
  };

  // ── VERIFYING_EVIDENCE ─────────────────────────────────────────────────────
  // Coding evidence is not prose citation evidence. The worker produced a diff;
  // JARVIS admitted/applied it and created the candidate commit. Re-prove that
  // custody here and independently replay the Work Unit verifier commands.
  T('VERIFYING_EVIDENCE', {});
  ctx.emit('verification.started', { run_id: run.run_id });
  const nativeVerification = validateNativePatchResult(packet, result, worktree);
  run.verification = {
    ...nativeVerification,
    decided_by: 'runtime (independent) — model has no mutation or commit authority',
  };
  if (!nativeVerification.ok) {
    ctx.emit('verification.completed', {
      run_id: run.run_id, ok: false, failure_class: nativeVerification.failure_class,
    });
    return fail(nativeVerification.failure_class, nativeVerification.detail);
  }
  ctx.emit('verification.completed', {
    run_id: run.run_id, ok: true, commit_sha: nativeVerification.commit_sha,
    changed_paths: nativeVerification.changed_paths,
  });
  T('VERIFIED', { disposition: 'VERIFIED', failure_class: null });
  return run;
}

/** Release the run's Builder claim + worktree ownership. Never touches another lane. */
export function releaseRun(run, state = 'completed') {
  if (!run?.packet?.work_unit_id || !run.owns_packet) return { released: false, reason: 'no owned work unit' };
  try {
    execFileSync('bash', [DELEGATE, 'release', run.packet.work_unit_id, state],
      { cwd: REPO_ROOT, encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] });
    return { released: true, state };
  } catch (e) {
    return { released: false, reason: String(e.stderr || e.message).slice(0, 300) };
  }
}

export const _internal = { packetFile, resultFile, logFile, DELEGATE, unlinkSync };
