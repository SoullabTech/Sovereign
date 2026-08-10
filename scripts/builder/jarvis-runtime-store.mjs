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

/**
 * A stopped runtime that was killed cannot rewrite its own record. Any run left
 * mid-flight by a hard stop is reconciled at next start: an in-flight state is not
 * evidence of a running worker once the owning process is gone.
 */
export function reconcileOrphanedRuns(inFlightStates) {
  const { runs } = listRuns({ limit: 10_000 });
  const reconciled = [];
  for (const r of runs) {
    if (!inFlightStates.includes(r.state)) continue;
    r.state = 'FAILED';
    r.failure_class = 'RUNTIME_STOPPED_MID_RUN';
    r.disposition = 'FAILED';
    r.reconciled_at = nowISO();
    saveRun(r);
    reconciled.push(r.run_id);
  }
  return reconciled;
}
