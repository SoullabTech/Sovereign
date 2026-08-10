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
 *           → ain-delegate.sh local-native  (claim → prompt → native worker →
 *                                            result contract → ledger — Units 7/9)
 *           → independent evidence verification (this file)
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
import { lintLeakage, bindSelector, headOf } from './jarvis-packet-guard.mjs';
import { validateWorkerGate } from './jarvis-governance-gate.mjs';
import { materializePacket, budget } from './jarvis-context.mjs';
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
/** The local lane is READ-ONLY. The HTTP API is not an authority bypass. */
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
  for (const k of WRITE_REQUESTING_KEYS) {
    if (!(k in packet)) continue;
    const v = packet[k];
    const requestsWrite = v === true || (typeof v === 'string' && /write|worktree|bypass|acceptedits/i.test(v));
    if (requestsWrite) {
      return { ok: false, failure_class: 'LOCAL_WRITE_AUTHORITY_REFUSED',
        detail: `packet field '${k}' requests write authority; LOCAL worker authority is READ-ONLY` };
    }
  }
  return { ok: true };
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
  const execHead = headOf(worktree);
  const bindings = (bound.context_selectors ?? []).map((s) => bindSelector(s, worktree, execHead));
  const badBinding = bindings.find((b) => b.error);
  if (badBinding) return fail(badBinding.error, JSON.stringify(badBinding).slice(0, 500));

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
  T('RUNNING', { worker: { lane: packet.execution_lane, model: process.env.JARVIS_LOCAL_MODEL || 'maia-coder:latest',
                           transport: 'ollama-native', started_at: nowISO() } });
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

  // §8 post-hoc authority enforcement: a READ-ONLY lane that changed the tree is a
  // governance failure regardless of what the worker reported about itself.
  if ((result.files_changed?.length ?? 0) > 0 || result.ending_sha) {
    return fail('LOCAL_WORKER_WROTE',
      `read-only lane mutated the worktree: files_changed=${result.files_changed?.length ?? 0} ending_sha=${result.ending_sha}`);
  }
  // ── Unit 19: native governance gate ────────────────────────────────────────
  // A worker may return a structured claim that it cannot legitimately continue.
  // The claim is validated against THIS run before it becomes governance state;
  // an invalid gate is a result-contract failure, never an indefinite pause, so
  // a worker cannot suspend its own run by emitting nonsense.
  if (result.governance_gate !== undefined) {
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
    files_changed: result.files_changed, test_results: result.test_results,
    worker_self_reported_escalation: result.escalation_required,
    recommended_next_action: result.recommended_next_action,
  };

  // ── VERIFYING_EVIDENCE ─────────────────────────────────────────────────────
  T('VERIFYING_EVIDENCE', {});
  ctx.emit('verification.started', { run_id: run.run_id });
  let output = '';
  try { output = readFileSync(run.log_path, 'utf8'); } catch { /* absent log handled below */ }
  if (!output.trim()) return fail('WORKER_OUTPUT_EMPTY', `no worker output at ${run.log_path}`);

  const evidence = verifyEvidence(output, fragments);
  const escalated = result.escalation_required === true || /^ESCALATE_TO_CLAUDE:/m.test(output);
  run.verification = {
    ...evidence,
    worker_self_reported_escalation: result.escalation_required,
    decided_by: 'runtime (independent) — worker self-report is never authoritative',
  };
  ctx.emit('verification.completed', {
    run_id: run.run_id, citations: evidence.total, valid: evidence.valid, invalid: evidence.invalid,
  });

  if (escalated) {
    T('ESCALATION_REQUIRED', { failure_class: 'WORKER_ESCALATED', disposition: 'ESCALATION_REQUIRED',
      unresolved_questions: result.unresolved_questions ?? [] });
  } else if (evidence.total === 0) {
    T('ESCALATION_REQUIRED', { failure_class: 'EVIDENCE_INSUFFICIENT', disposition: 'ESCALATION_REQUIRED',
      failure_detail: 'worker returned no citable file:line evidence' });
  } else if (evidence.invalid > 0) {
    T('ESCALATION_REQUIRED', { failure_class: 'EVIDENCE_OUT_OF_CONTEXT', disposition: 'ESCALATION_REQUIRED',
      failure_detail: `${evidence.invalid}/${evidence.total} citations fall outside the materialized context` });
  } else {
    T('VERIFIED', { disposition: 'VERIFIED', failure_class: null });
  }
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
