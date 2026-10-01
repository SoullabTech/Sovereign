#!/usr/bin/env node
/**
 * JARVIS Unit 11 — durable runtime store
 * ═══════════════════════════════════════════════════════════════════════════
 * §10: "Restarting the process must not destroy durable run history."
 *
 * Deliberately NOT a database. Units 7–10 already established a canonical audit
 * substrate at $AIN_DELEGATION_HOME (packets/ results/ logs/ episodes.jsonl).
 * This adds one sibling directory — runtime/ — holding the run index the API
 * serves. The authoritative worker evidence stays where the pipeline already
 * writes it; a run record REFERENCES those paths rather than copying them, so
 * there is exactly one audit artifact per run and the runtime cannot drift from it.
 *
 *   $AIN_HOME/runtime/runs/<run_id>.json   one file per run (atomic write)
 *   $AIN_HOME/runtime/events.jsonl         append-only transition log
 *   $AIN_HOME/runtime/runtime.json         current/last runtime process record
 *
 * Process state lives in memory. Run evidence never does.
 */

import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, renameSync, appendFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomBytes } from 'node:crypto';

export const AIN_HOME = process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
export const RUNTIME_HOME = path.join(AIN_HOME, 'runtime');
export const RUNS_DIR = path.join(RUNTIME_HOME, 'runs');
export const EVENTS_LOG = path.join(RUNTIME_HOME, 'events.jsonl');
export const RUNTIME_RECORD = path.join(RUNTIME_HOME, 'runtime.json');

export function initStore() {
  mkdirSync(RUNS_DIR, { recursive: true });
  return { RUNTIME_HOME, RUNS_DIR, EVENTS_LOG, RUNTIME_RECORD };
}

export const newRunId = () => `r-${randomBytes(5).toString('hex')}`;
export const nowISO = () => new Date().toISOString();

/** Atomic: write to a temp sibling then rename, so a crash mid-write cannot truncate a run. */
function writeAtomic(file, text) {
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, text);
  renameSync(tmp, file);
}

const runFile = (id) => path.join(RUNS_DIR, `${id}.json`);

export function saveRun(run) {
  initStore();
  run.updated_at = nowISO();
  writeAtomic(runFile(run.run_id), JSON.stringify(run, null, 2));
  return run;
}

export function loadRun(id) {
  const f = runFile(id);
  if (!/^r-[0-9a-f]{10}$/.test(id) || !existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
}

/** Newest first, bounded. The API never returns an unbounded list. */
export function listRuns({ limit = 25, offset = 0 } = {}) {
  initStore();
  const files = readdirSync(RUNS_DIR).filter((f) => f.endsWith('.json') && !f.includes('.tmp-'));
  const runs = [];
  for (const f of files) {
    try { runs.push(JSON.parse(readFileSync(path.join(RUNS_DIR, f), 'utf8'))); } catch { /* skip unreadable */ }
  }
  runs.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return { total: runs.length, limit, offset, runs: runs.slice(offset, offset + limit) };
}

export function appendEvent(ev) {
  initStore();
  const rec = { at: nowISO(), ...ev };
  try { appendFileSync(EVENTS_LOG, JSON.stringify(rec) + '\n'); } catch { /* telemetry is never load-bearing */ }
  return rec;
}

export function writeRuntimeRecord(rec) {
  initStore();
  writeAtomic(RUNTIME_RECORD, JSON.stringify(rec, null, 2));
  return rec;
}

export function readRuntimeRecord() {
  if (!existsSync(RUNTIME_RECORD)) return null;
  try { return JSON.parse(readFileSync(RUNTIME_RECORD, 'utf8')); } catch { return null; }
}

export function clearRuntimeRecord() {
  try { if (existsSync(RUNTIME_RECORD)) unlinkSync(RUNTIME_RECORD); } catch { /* best effort */ }
}

/** Liveness of a recorded owner process, on THIS host only. EPERM means it exists. */
export function ownerProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return null;
  try { process.kill(pid, 0); return true; }
  catch (e) { return e?.code === 'EPERM' ? true : e?.code === 'ESRCH' ? false : null; }
}

/**
 * O5-R2E — Path A orphan VISIBILITY. Not recovery.
 *
 * A runtime that was killed cannot rewrite its own record, so a run it owned is
 * left in an in-flight state forever: dark work. Path A records no per-effect
 * witness (every effect happens inside one child process), so the only honest
 * outcome is to STOP VISIBLY: the run becomes terminal FAILED (the one lawful
 * destination from every in-flight state) with the existing code
 * RUNTIME_STOPPED_MID_RUN and disposition BLOCKED_BY_EVIDENCE, and records what
 * MAY have happened. ⛔ It is never resumed, re-dispatched or re-queued.
 *
 * A run is reconciled only on PROOF its owner is gone: an owner stamp for THIS
 * host whose pid no longer exists. Runs with no owner stamp (created before the
 * stamp existed), another host's owner, or an undeterminable owner are reported
 * as UNPROVEN and left untouched — absence of evidence is not evidence of death.
 */
export function reconcileOrphanedRuns(inFlightStates, {
  host = os.hostname(),
  selfPid = process.pid,
  isAlive = ownerProcessAlive,
  effectsByState = {},
  dryRun = false,
} = {}) {
  const { runs } = listRuns({ limit: 10_000 });
  const reconciled = [];
  const unproven = [];
  for (const r of runs) {
    if (!inFlightStates.includes(r.state)) continue;
    const owner = r.owner;
    let why = null;
    if (!owner || !Number.isInteger(owner.pid)) why = 'OWNER_UNRECORDED';
    else if (owner.host !== host) why = 'OWNER_ON_OTHER_HOST';
    else if (owner.pid === selfPid) why = 'OWNER_IS_THIS_PROCESS';
    else {
      const alive = isAlive(owner.pid);
      if (alive === true) why = 'OWNER_ALIVE';
      else if (alive !== false) why = 'OWNER_UNDETERMINABLE';
    }
    if (why) { unproven.push({ run_id: r.run_id, state: r.state, reason: why, owner: owner ?? null, created_at: r.created_at ?? null, updated_at: r.updated_at ?? null }); continue; }
    if (dryRun) {
      // Read-only census: report what WOULD be reconciled, write nothing.
      reconciled.push({ run_id: r.run_id, state: r.state, owner, created_at: r.created_at ?? null, updated_at: r.updated_at ?? null,
        effects_possible: effectsByState[r.state] ?? ['unknown'] });
      continue;
    }
    const lastState = r.state;
    const at = nowISO();
    r.state = 'FAILED';
    r.failure_class = 'RUNTIME_STOPPED_MID_RUN';
    r.disposition = 'BLOCKED_BY_EVIDENCE';
    r.failure_detail = `owner pid ${owner.pid} on ${owner.host} is gone; run was interrupted in ${lastState}; effects are of unknown standing`;
    r.interruption = {
      last_state: lastState,
      owner,
      effects_possible: effectsByState[lastState] ?? ['unknown'],
      recovery: 'NONE — Path A records no per-effect witness; no resume, re-dispatch or requeue is lawful',
      reconciled_at: at,
    };
    r.reconciled_at = at;
    saveRun(r);
    appendEvent({ run_id: r.run_id, kind: 'transition', from: lastState, to: 'FAILED', disposition: 'BLOCKED_BY_EVIDENCE', reason: 'O5-R2E orphan reconciliation' });
    reconciled.push(r.run_id);
  }
  return { dry_run: dryRun, reconciled, unproven };
}
