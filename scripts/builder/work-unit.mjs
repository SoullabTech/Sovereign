#!/usr/bin/env node
/**
 * Builder OS — Canonical Work Unit reconciliation layer (MVJ Unit 5).
 *
 * WHY THIS EXISTS
 *   JARVIS has, until this unit, maintained the same piece of work in two places that
 *   could silently drift: the execution PACKET (`AIN_WORK_PACKET_CONTRACT.md`, read by
 *   `ain-delegate.sh`) and the Builder SESSION/CLAIM record (`session.mjs`, the runtime
 *   attempt). Neither knows the other exists except by a shared `work_unit_id` string.
 *   This module does not replace either. It makes the packet file the canonical home for
 *   Work-Unit-level facts (identity, intent, authority, dependencies, proof spec) by
 *   EXTENDING its schema with optional fields, and adds a query/derivation layer that
 *   assembles packet + session + result(s) into one deterministic answer to "what is this
 *   Work Unit, right now" — without requiring any prior conversation transcript.
 *
 * WHAT DID NOT CHANGE (frozen, proven, not reopened by this unit)
 *   - ain-delegate.sh: untouched. Every existing packet, including proving-case-add-fn.json,
 *     remains valid and executable exactly as before.
 *   - session.mjs: untouched. Concurrency/ownership/collision governance is unchanged.
 *   - results/<id>.json: untouched as the single-file "latest attempt" read/write path
 *     ain-delegate.sh already uses. This module adds an ADDITIVE attempts history
 *     alongside it, never instead of it.
 *
 * THE DISTINCTION THIS FILE EXISTS TO PRESERVE
 *   A Work Unit is the durable, attempt-invariant definition of bounded intended work.
 *   An execution attempt (a Builder session/claim, one delegate run, one result) is ONE
 *   governed try at that Work Unit. A Work Unit must survive worker change, retry,
 *   escalation, and transcript loss — a session/result must not.
 *
 * CANONICAL WORK UNIT — schema (packet file, extended)
 *   Unchanged from AIN_WORK_PACKET_CONTRACT.md (still consumed as-is by ain-delegate.sh):
 *     work_unit_id, title, objective, execution_lane, canonical_sha, branch, worktree,
 *     governing_authority, established_facts[], allowed_files[], prohibited_files_actions[],
 *     acceptance_criteria[], verification_commands[], escalation_conditions[], max_attempts,
 *     expected_output
 *   New, OPTIONAL, defaulted when absent (this is the whole compatibility story — an
 *   existing packet with none of these fields is a completely valid canonical Work Unit):
 *     project, capability, task_class, risk_class, priority, dependencies[], blockers[],
 *     authorized_acts[], not_authorized_acts[], integration_actor, autonomy_ceiling
 *
 * AUTHORITY VS CAPABILITY (preserved, not re-litigated)
 *   authorized_acts / not_authorized_acts / integration_actor express what this Work Unit
 *   PERMITS. Which worker executes it (local/kimi/future) is CAPABILITY — a property of
 *   the execution attempt, chosen by a worker adapter, never expanding what was authorized.
 *   `derivePermissionEnvelope()` below is deliberately provider-agnostic: it never contains
 *   a string like "--permission-mode" or "bypassPermissions". Translating a generic envelope
 *   into a specific harness's flags is an ADAPTER's job, out of scope here (directive §6).
 *
 * LIFECYCLE DERIVATION — honest about its own folding
 *   The full vocabulary (directive §10) has more states than three files on disk can always
 *   distinguish. Documented folds, not silent ones:
 *     - "proposed" and "ready" are not distinguished (packets are authored ready-to-run;
 *       nothing today represents a lighter-weight "idea" stage) — both report as READY.
 *     - "claimed" and "running" are not distinguished (an active session with no result yet
 *       could be either; nothing observable from disk tells them apart) — both report as
 *       CLAIMED.
 *     - "verifying", "review_required", "ready_to_integrate" fold to READY_TO_INTEGRATE once
 *       a passing result exists with no integration recorded yet.
 *     - deployment/live-verification/superseded states are preserved in the vocabulary but
 *       UNREACHABLE by derivation — nothing in this delegation system tracks deployment yet.
 *   `dependencies` are recorded and queryable but do NOT recursively drive lifecycle (that
 *   would require resolving other Work Units' own lifecycle and risks unbounded recursion
 *   for a "keep it small" unit). Only explicit `blockers` (human-authored strings) block.
 *
 * CLI
 *   node scripts/builder/work-unit.mjs status <id> [--json]
 *   node scripts/builder/work-unit.mjs project-packet <id> [--json]
 *   node scripts/builder/work-unit.mjs permission-envelope <id> [--json]
 *   node scripts/builder/work-unit.mjs record-attempt <id>          # append current result.json to attempts.jsonl
 *   node scripts/builder/work-unit.mjs list-attempts <id> [--json]
 */
import { existsSync, readFileSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Lazy, not module-top-level: AIN_DELEGATION_HOME must be re-read on every call, not
// frozen at import time. A static top-level const here would silently ignore a test (or
// caller) that sets the env var after this module is first imported — which is exactly
// how ESM import hoisting works, so this is not a hypothetical.
const HOME = () => process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const PACKETS_DIR = () => path.join(HOME(), 'packets');
const RESULTS_DIR = () => path.join(HOME(), 'results');
const SESSIONS_DIR = () => path.join(HOME(), 'sessions');

const packetPath = (id) => path.join(PACKETS_DIR(), `${id}.json`);
const resultPath = (id) => path.join(RESULTS_DIR(), `${id}.json`);
const attemptsPath = (id) => path.join(RESULTS_DIR(), `${id}.attempts.jsonl`);

// ---------------------------------------------------------------- defaults (compatibility)
export const DEFAULT_AUTHORIZED_ACTS = ['repo.read', 'repo.write:worktree', 'tests.run'];
export const DEFAULT_NOT_AUTHORIZED_ACTS = ['production.read', 'production.write', 'deploy', 'authority.change'];
export const DEFAULT_INTEGRATION_ACTOR = 'jarvis';
export const DEFAULT_RISK_CLASS = 'mechanical';
export const DEFAULT_AUTONOMY_CEILING = 'LEVEL_2_IMPLEMENT';

export const LIFECYCLE_VOCABULARY = [
  'proposed', 'ready', 'blocked', 'needs_founder', 'claimed', 'running', 'verifying',
  'review_required', 'ready_to_integrate', 'integrated', 'deployment_required', 'deployed',
  'live_verification_required', 'closed', 'failed', 'superseded', 'contended',
];

// -------------------------------------------------------------------------- read primitives
/** Read a packet file as a canonical Work Unit, applying documented defaults. Never mutates
 *  the file on disk — reading an old packet must never require writing to it. */
export function loadWorkUnit(id) {
  const p = packetPath(id);
  if (!existsSync(p)) return null;
  const raw = JSON.parse(readFileSync(p, 'utf8'));
  return {
    ...raw,
    project: raw.project ?? null,
    capability: raw.capability ?? null,
    task_class: raw.task_class ?? null,
    risk_class: raw.risk_class ?? DEFAULT_RISK_CLASS,
    priority: raw.priority ?? null,
    dependencies: raw.dependencies ?? [],
    blockers: raw.blockers ?? [],
    authorized_acts: raw.authorized_acts ?? DEFAULT_AUTHORIZED_ACTS,
    not_authorized_acts: raw.not_authorized_acts ?? DEFAULT_NOT_AUTHORIZED_ACTS,
    integration_actor: raw.integration_actor ?? DEFAULT_INTEGRATION_ACTOR,
    autonomy_ceiling: raw.autonomy_ceiling ?? DEFAULT_AUTONOMY_CEILING,
    _defaults_applied: Object.keys({
      project: 1, capability: 1, task_class: 1, risk_class: 1, priority: 1, dependencies: 1,
      blockers: 1, authorized_acts: 1, not_authorized_acts: 1, integration_actor: 1,
      autonomy_ceiling: 1,
    }).filter((k) => raw[k] === undefined),
  };
}

/** The exact subset ain-delegate.sh actually reads — proves the packet file remains a valid
 *  execution packet even carrying WU-only fields no delegate script has ever heard of. */
const PACKET_CONTRACT_FIELDS = [
  'work_unit_id', 'title', 'objective', 'execution_lane', 'canonical_sha', 'branch',
  'worktree', 'governing_authority', 'established_facts', 'allowed_files',
  'prohibited_files_actions', 'acceptance_criteria', 'verification_commands',
  'escalation_conditions', 'max_attempts', 'expected_output',
];
export function projectPacket(workUnit) {
  const out = {};
  for (const f of PACKET_CONTRACT_FIELDS) if (f in workUnit) out[f] = workUnit[f];
  return out;
}

/** Current execution attempt, if any — read directly from the session registry's own files,
 *  not reimplemented. session.mjs itself is never modified or duplicated. */
function loadActiveSession(workUnitId) {
  const sessionsDir = SESSIONS_DIR();
  if (!existsSync(sessionsDir)) return null;
  for (const f of readdirSync(sessionsDir)) {
    if (!f.endsWith('.json')) continue;
    let rec;
    try { rec = JSON.parse(readFileSync(path.join(sessionsDir, f), 'utf8')); } catch { continue; }
    if (rec.work_unit === workUnitId && rec.state === 'active') return rec;
  }
  return null;
}

/** Latest single-file result — the exact file ain-delegate.sh already writes and reads.
 *  Untouched format; read-only here. */
function loadLatestResult(id) {
  const p = resultPath(id);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

/** Attempts history — additive, append-only, never required for existing tools to function.
 *  If no history file exists yet but a single result.json does, that IS attempt 1 — this is
 *  the backward-compatibility read path: nothing needs migrating for old work units. */
export function loadAttempts(id) {
  const jsonlPath = attemptsPath(id);
  const attempts = [];
  if (existsSync(jsonlPath)) {
    for (const line of readFileSync(jsonlPath, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try { attempts.push(JSON.parse(line)); } catch { /* skip a corrupt line, don't crash the read */ }
    }
  }
  if (attempts.length === 0) {
    const latest = loadLatestResult(id);
    if (latest) attempts.push({ attempt_number: 1, recorded_at: null, source: 'result.json (implicit attempt 1 — no attempts.jsonl yet)', ...latest });
  }
  return attempts;
}

/** Append the CURRENT result.json as the next attempt in the history. Purely additive —
 *  never required for ain-delegate.sh, session.mjs, or any existing consumer to keep working. */
export function recordAttempt(id, resultOverride = null) {
  const result = resultOverride ?? loadLatestResult(id);
  if (!result) throw new Error(`no result to record for '${id}' — nothing at ${resultPath(id)}`);
  mkdirSync(RESULTS_DIR(), { recursive: true });
  // Count ONLY real entries already appended to attempts.jsonl. Do NOT use loadAttempts()
  // here — its implicit-attempt-1 fallback exists for READ-time backward compatibility
  // (querying a work unit that has a result.json but no history file yet) and would
  // double-count: the result about to be recorded is exactly what that fallback synthesizes,
  // so counting through it here always overcounts by one on the very first recordAttempt call.
  const jsonlFile = attemptsPath(id);
  const alreadyRecorded = existsSync(jsonlFile)
    ? readFileSync(jsonlFile, 'utf8').split('\n').filter((l) => l.trim()).length
    : 0;
  const entry = { attempt_number: alreadyRecorded + 1, recorded_at: new Date().toISOString(), ...result };
  appendFileSync(jsonlFile, JSON.stringify(entry) + '\n');
  return entry;
}

// ------------------------------------------------------------------------ lifecycle + envelope
/**
 * Derive Work-Unit-level lifecycle from packet + active session + latest result.
 * Priority-ordered; first match wins. See the header comment for documented folds.
 */
export function deriveLifecycle({ workUnit, session, result }) {
  if (!workUnit) return null;
  if ((workUnit.blockers ?? []).length > 0) return 'blocked';
  if (session && session.state === 'active' && (session.collisions ?? []).length > 0) return 'contended';
  if (session && session.state === 'active' && !result) return 'claimed'; // folds claimed+running
  if (result && result.escalation_required) return 'needs_founder';
  if (result && result.integration && result.integration.commit_sha) return 'integrated';
  if (result && result.test_results === 'fail') return 'failed';
  if (result && result.test_results === 'pass' && !(result.integration && result.integration.commit_sha)) {
    return 'ready_to_integrate'; // folds verifying+review_required+ready_to_integrate
  }
  if (session && session.state !== 'active' && !result) return 'failed'; // attempt closed, no result — do not report ready
  return 'ready'; // folds proposed+ready
}

/**
 * Provider-agnostic permission envelope. Deliberately contains no vendor-specific flag
 * names — see the header comment. An adapter (out of scope for Unit 5) translates this
 * into e.g. Claude Code's --permission-mode, or any future provider's equivalent.
 */
export function derivePermissionEnvelope(workUnit) {
  const acts = new Set(workUnit.authorized_acts ?? DEFAULT_AUTHORIZED_ACTS);
  const not = new Set(workUnit.not_authorized_acts ?? DEFAULT_NOT_AUTHORIZED_ACTS);
  const allow = (act) => acts.has(act) && !not.has(act);
  return {
    repo_read: allow('repo.read'),
    repo_write_scope: allow('repo.write:worktree') ? 'worktree' : 'none',
    execute_checks: allow('tests.run'),
    // WHO may integrate (commit/merge) verified work — not who may execute it.
    integration_actor: workUnit.integration_actor ?? DEFAULT_INTEGRATION_ACTOR,
    production_read: allow('production.read'),
    production_write: allow('production.write'),
    deploy: allow('deploy'),
    authority_change: allow('authority.change'),
  };
}

// --------------------------------------------------------------------------------- status
/** The single deterministic answer to "what is this Work Unit, right now" — no transcript
 *  of any prior session required to reconstruct it. */
export function workUnitStatus(id) {
  const workUnit = loadWorkUnit(id);
  if (!workUnit) return { work_unit_id: id, exists: false };
  const session = loadActiveSession(id);
  const result = loadLatestResult(id);
  const attempts = loadAttempts(id);
  const lifecycle = deriveLifecycle({ workUnit, session, result });
  return {
    work_unit_id: id,
    exists: true,
    identity: { project: workUnit.project, capability: workUnit.capability, title: workUnit.title },
    intent: { objective: workUnit.objective, task_class: workUnit.task_class, risk_class: workUnit.risk_class, priority: workUnit.priority },
    authority: {
      governing_authority: workUnit.governing_authority,
      authorized_acts: workUnit.authorized_acts,
      not_authorized_acts: workUnit.not_authorized_acts,
      integration_actor: workUnit.integration_actor,
      autonomy_ceiling: workUnit.autonomy_ceiling,
    },
    dependencies: { dependencies: workUnit.dependencies, blockers: workUnit.blockers },
    workspace: { canonical_sha: workUnit.canonical_sha, branch: workUnit.branch, worktree: workUnit.worktree },
    proof_spec: {
      acceptance_criteria: workUnit.acceptance_criteria,
      verification_commands: workUnit.verification_commands,
      max_attempts: workUnit.max_attempts,
    },
    active_execution: session ? {
      session_id: session.session_id, mode: session.mode, model: session.model,
      owner: session.owner, opened_at: session.opened_at, state: session.state,
    } : null,
    latest_result: result ? {
      lane: result.lane, model: result.model, test_results: result.test_results,
      files_changed: result.files_changed,
      integration: result.integration ?? null,
      release: result.release ?? null,
    } : null,
    attempt_count: attempts.length,
    lifecycle_state: lifecycle,
    lifecycle_vocabulary: LIFECYCLE_VOCABULARY,
    permission_envelope: derivePermissionEnvelope(workUnit),
    compatibility: {
      defaults_applied_for: workUnit._defaults_applied,
      note: workUnit._defaults_applied.length > 0
        ? 'this Work Unit predates the Unit 5 schema extension — all missing fields defaulted, nothing migrated'
        : 'all Work-Unit-level fields present explicitly',
    },
  };
}

// -------------------------------------------------------------------------------------- CLI
const isMain = process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`;
if (isMain) {
  const args = process.argv.slice(2);
  const flag = (n) => args.includes(n);
  const cmd = args[0];
  const id = args[1];

  if (!cmd || !id) {
    console.error('usage: work-unit.mjs {status|project-packet|permission-envelope|record-attempt|list-attempts} <work_unit_id> [--json]');
    process.exit(2);
  }

  if (cmd === 'status') {
    const s = workUnitStatus(id);
    if (flag('--json')) { console.log(JSON.stringify(s, null, 2)); process.exit(s.exists ? 0 : 1); }
    if (!s.exists) { console.log(`Work Unit '${id}' does not exist (no packet at ${packetPath(id)})`); process.exit(1); }
    console.log(`WORK UNIT  ${s.work_unit_id}`);
    console.log(`  lifecycle        ${s.lifecycle_state}`);
    console.log(`  title            ${s.identity.title}`);
    console.log(`  risk/task class  ${s.intent.risk_class} / ${s.intent.task_class ?? 'UNSET'}`);
    console.log(`  authority        ${s.authority.governing_authority}`);
    console.log(`  integration by   ${s.authority.integration_actor}`);
    console.log(`  blockers         ${s.dependencies.blockers.length ? s.dependencies.blockers.join('; ') : '(none)'}`);
    console.log(`  active execution ${s.active_execution ? `${s.active_execution.session_id} (${s.active_execution.model})` : '(none)'}`);
    console.log(`  latest result    ${s.latest_result ? `${s.latest_result.test_results} via ${s.latest_result.lane}` : '(none)'}`);
    console.log(`  attempts         ${s.attempt_count}`);
    console.log(`  ${s.compatibility.note}`);
    process.exit(0);
  }

  if (cmd === 'project-packet') {
    const wu = loadWorkUnit(id);
    if (!wu) { console.error(`no such work unit: ${id}`); process.exit(1); }
    console.log(JSON.stringify(projectPacket(wu), null, 2));
    process.exit(0);
  }

  if (cmd === 'permission-envelope') {
    const wu = loadWorkUnit(id);
    if (!wu) { console.error(`no such work unit: ${id}`); process.exit(1); }
    console.log(JSON.stringify(derivePermissionEnvelope(wu), null, 2));
    process.exit(0);
  }

  if (cmd === 'record-attempt') {
    try {
      const entry = recordAttempt(id);
      console.log(`[work-unit] recorded attempt ${entry.attempt_number} for '${id}' -> ${attemptsPath(id)}`);
      process.exit(0);
    } catch (e) { console.error(`🛑 ${e.message}`); process.exit(1); }
  }

  if (cmd === 'list-attempts') {
    const attempts = loadAttempts(id);
    if (flag('--json')) { console.log(JSON.stringify(attempts, null, 2)); process.exit(0); }
    for (const a of attempts) {
      console.log(`#${a.attempt_number}  ${a.recorded_at ?? '(implicit)'}  lane=${a.lane} model=${a.model} test=${a.test_results}`);
    }
    process.exit(0);
  }

  console.error(`unknown command: ${cmd}`);
  process.exit(2);
}
