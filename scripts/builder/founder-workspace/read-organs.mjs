// @ts-check
/**
 * Founder Workspace read organs (B2) — read-only enumeration over the
 * governed $AIN substrate. JARVIS-FOUNDER-WORKSPACE-01 / B2.
 *
 * READ LAW (founder, P0 adjudication §VI): a read must not create directories
 * or mutate state merely to discover that nothing exists. Missing storage
 * means `present: false`, never "create it so I can read it". This module
 * therefore imports NO write primitive (static guard RL-0 in the matrix) and
 * never reuses `initStore()` / `ensureHome()` / `ensureStore()` paths.
 *
 * FAILURE LAW: corrupt or unreadable objects are surfaced explicitly as
 * `unreadable[]` entries, never silently dropped.
 *
 * Composition, not reimplementation: per-unit state comes from the canonical
 * `statusCanonicalV2` reader (desktop-native standing 2026-09-18) via
 * createRequire; this module adds only enumeration and unreadable custody.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
/** Repository root (this file lives at scripts/builder/founder-workspace/). */
export const REPO_ROOT = path.resolve(here, '../../..');

/**
 * @typedef {{ file: string, error: string, kind: string }} Unreadable
 */

/** Resolve the AIN home without touching the filesystem. @param {NodeJS.ProcessEnv} [env] */
export function resolveAinHome(env = process.env) {
  return env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
}

/** @param {string} dir */
function dirPresent(dir) {
  try { return existsSync(dir) && statSync(dir).isDirectory(); } catch { return false; }
}

/** @param {string} file @returns {{ ok: true, value: any } | { ok: false, error: string }} */
function readJson(file) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch (e) { return { ok: false, error: `read: ${errMsg(e)}` }; }
  try { return { ok: true, value: JSON.parse(text) }; } catch (e) { return { ok: false, error: `parse: ${errMsg(e)}` }; }
}
/** @param {unknown} e */
function errMsg(e) { return e instanceof Error ? e.message : String(e); }
/** @param {string} file */
function mtimeIso(file) { try { return statSync(file).mtime.toISOString(); } catch { return null; } }

// ── Work Units (canonical v2) ─────────────────────────────────────────────────

/**
 * Enumerate every canonical v2 Work Unit under `$AIN/work-units-v2` and read
 * each through the canonical status reader. No function in the repository
 * listed across units before this (F2 §2); this is that read organ.
 *
 * @param {{ env?: NodeJS.ProcessEnv, root?: string, statusReader?: (root: string, id: string, opts: {env: NodeJS.ProcessEnv}) => Promise<any> }} [opts]
 * @returns {Promise<{ organ: 'work-units-v2', present: boolean, dir: string, observed_at: string, units: Array<{ id: string, file: string, file_mtime: string|null, status: any }>, unreadable: Unreadable[] }>}
 */
export async function listWorkUnitsV2(opts = {}) {
  const env = opts.env || process.env;
  const root = opts.root || REPO_ROOT;
  const dir = path.join(resolveAinHome(env), 'work-units-v2');
  const observed_at = new Date().toISOString();
  /** @type {Unreadable[]} */ const unreadable = [];
  /** @type {Array<{ id: string, file: string, file_mtime: string|null, status: any }>} */ const units = [];
  if (!dirPresent(dir)) return { organ: 'work-units-v2', present: false, dir, observed_at, units, unreadable };

  const statusReader = opts.statusReader || canonicalStatusReader();
  let entries;
  try { entries = readdirSync(dir); } catch (e) { unreadable.push({ file: dir, error: `readdir: ${errMsg(e)}`, kind: 'directory' }); return { organ: 'work-units-v2', present: true, dir, observed_at, units, unreadable }; }
  for (const f of entries.sort()) {
    if (!f.endsWith('.json') || f.endsWith('.desktop.json') || f.includes('.tmp')) continue;
    const file = path.join(dir, f);
    const id = f.slice(0, -'.json'.length);
    const raw = readJson(file);
    if (!raw.ok) { unreadable.push({ file, error: raw.error, kind: 'work-unit' }); continue; }
    if (!raw.value || typeof raw.value !== 'object' || !raw.value.work_unit) { unreadable.push({ file, error: 'not a canonical v2 envelope (no work_unit)', kind: 'work-unit' }); continue; }
    let status;
    try { status = await statusReader(root, id, { env }); } catch (e) { unreadable.push({ file, error: `status reader threw: ${errMsg(e)}`, kind: 'work-unit' }); continue; }
    if (!status || status.ok !== true) { unreadable.push({ file, error: `status reader refused: ${status?.reason || status?.status || 'unknown'}`, kind: 'work-unit' }); continue; }
    units.push({ id, file, file_mtime: mtimeIso(file), status });
  }
  return { organ: 'work-units-v2', present: true, dir, observed_at, units, unreadable };
}

/** The canonical v2 status reader, resolved once (CommonJS, jarvis-desktop/src). Read-only by construction: readEnvelope + readMeta + pure read models. */
function canonicalStatusReader() {
  const require = createRequire(import.meta.url);
  const C = require(path.join(REPO_ROOT, 'jarvis-desktop/src/canonical-work-unit-v2.js'));
  return C.statusCanonicalV2;
}

// ── Runtime runs + events ─────────────────────────────────────────────────────

/**
 * Read-only replacement for `jarvis-runtime-store.listRuns` (which mkdirs on
 * read and drops unreadable files). Newest first, bounded.
 * @param {{ env?: NodeJS.ProcessEnv, limit?: number }} [opts]
 */
export function listRunsReadOnly(opts = {}) {
  const env = opts.env || process.env;
  const limit = Number.isInteger(opts.limit) && /** @type {number} */ (opts.limit) > 0 ? /** @type {number} */ (opts.limit) : 25;
  const dir = path.join(resolveAinHome(env), 'runtime', 'runs');
  const observed_at = new Date().toISOString();
  /** @type {Unreadable[]} */ const unreadable = [];
  /** @type {any[]} */ const runs = [];
  if (!dirPresent(dir)) return { organ: 'runtime-runs', present: false, dir, observed_at, runs, unreadable, truncated: false };
  let files;
  try { files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.includes('.tmp-')); } catch (e) { unreadable.push({ file: dir, error: `readdir: ${errMsg(e)}`, kind: 'directory' }); return { organ: 'runtime-runs', present: true, dir, observed_at, runs, unreadable, truncated: false }; }
  for (const f of files) {
    const file = path.join(dir, f);
    const r = readJson(file);
    if (!r.ok) { unreadable.push({ file, error: r.error, kind: 'run' }); continue; }
    runs.push({ file, file_mtime: mtimeIso(file), run: r.value });
  }
  runs.sort((a, b) => String(b.run?.created_at ?? '').localeCompare(String(a.run?.created_at ?? '')));
  return { organ: 'runtime-runs', present: true, dir, observed_at, runs: runs.slice(0, limit), unreadable, truncated: runs.length > limit };
}

/**
 * Last `n` entries of `$AIN/runtime/events.jsonl` (no reader existed — F2 §2).
 * A malformed line is surfaced as an unreadable entry with its line number,
 * never skipped.
 * @param {{ env?: NodeJS.ProcessEnv, n?: number }} [opts]
 */
export function readEventsTail(opts = {}) {
  const env = opts.env || process.env;
  const n = Number.isInteger(opts.n) && /** @type {number} */ (opts.n) > 0 ? /** @type {number} */ (opts.n) : 50;
  const file = path.join(resolveAinHome(env), 'runtime', 'events.jsonl');
  const observed_at = new Date().toISOString();
  /** @type {Unreadable[]} */ const unreadable = [];
  /** @type {Array<{ line_no: number, event: any }>} */ const entries = [];
  if (!existsSync(file)) return { organ: 'runtime-events', present: false, file, observed_at, entries, unreadable, total_lines: 0, truncated: false };
  let text;
  try { text = readFileSync(file, 'utf8'); } catch (e) { unreadable.push({ file, error: `read: ${errMsg(e)}`, kind: 'events' }); return { organ: 'runtime-events', present: true, file, observed_at, entries, unreadable, total_lines: 0, truncated: false }; }
  const lines = text.split('\n').filter((l) => l.length > 0);
  const start = Math.max(0, lines.length - n);
  for (let i = start; i < lines.length; i++) {
    try { entries.push({ line_no: i + 1, event: JSON.parse(lines[i]) }); }
    catch (e) { unreadable.push({ file: `${file}:${i + 1}`, error: `parse: ${errMsg(e)} (line ${i + 1}, ${lines[i].length} chars)`, kind: 'event-line' }); }
  }
  return { organ: 'runtime-events', present: true, file, observed_at, entries, unreadable, total_lines: lines.length, truncated: start > 0 };
}

// ── Sessions + governor ───────────────────────────────────────────────────────

/**
 * Session records (`$AIN/sessions/*.json`) read directly. Substrate: the
 * Builder session governor (`scripts/builder/session.mjs`). Includes closed
 * states (completed · handed-off · paused · abandoned), which `status --json`
 * omits; that is what Work's handoffs and resume need.
 * @param {{ env?: NodeJS.ProcessEnv }} [opts]
 */
export function listSessions(opts = {}) {
  const env = opts.env || process.env;
  const dir = path.join(resolveAinHome(env), 'sessions');
  const observed_at = new Date().toISOString();
  /** @type {Unreadable[]} */ const unreadable = [];
  /** @type {Array<{ file: string, file_mtime: string|null, session: any }>} */ const sessions = [];
  if (!dirPresent(dir)) return { organ: 'sessions', present: false, dir, observed_at, sessions, unreadable };
  let files;
  try { files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.endsWith('.tmp')); } catch (e) { unreadable.push({ file: dir, error: `readdir: ${errMsg(e)}`, kind: 'directory' }); return { organ: 'sessions', present: true, dir, observed_at, sessions, unreadable }; }
  for (const f of files.sort()) {
    const file = path.join(dir, f);
    const r = readJson(file);
    if (!r.ok) { unreadable.push({ file, error: r.error, kind: 'session' }); continue; }
    sessions.push({ file, file_mtime: mtimeIso(file), session: r.value });
  }
  return { organ: 'sessions', present: true, dir, observed_at, sessions, unreadable };
}

/**
 * Read-only wrapper over `session.mjs report --json`.
 * ⚠️ The governor's `allRecs()` calls `ensureHome()` (mkdirSync) on every
 * read (`scripts/builder/session.mjs:142`) — a read that writes, recorded as
 * an observation for its owner, ⛔ not repaired here. This wrapper is
 * PRESENCE-GATED: when `$AIN/sessions` is absent it returns `present:false`
 * WITHOUT invoking the CLI, so no directory is ever created by a Founder
 * Workspace read. When present, the governor's mkdir is a no-op.
 * @param {{ env?: NodeJS.ProcessEnv, root?: string, since?: string, exec?: (file: string, args: string[], opts: any) => string }} [opts]
 */
export async function governorReportReadOnly(opts = {}) {
  const env = opts.env || process.env;
  const root = opts.root || REPO_ROOT;
  const dir = path.join(resolveAinHome(env), 'sessions');
  const observed_at = new Date().toISOString();
  if (!dirPresent(dir)) return { organ: 'governor-report', present: false, dir, observed_at, report: null, unreadable: [] };
  const args = [path.join(root, 'scripts/builder/session.mjs'), 'report', '--json'];
  if (opts.since) args.push('--since', opts.since);
  let exec = opts.exec;
  if (!exec) { const cp = await import('node:child_process'); exec = (file, a, o) => cp.execFileSync(file, a, o).toString(); }
  let out;
  try { out = exec(process.execPath, args, { env, encoding: 'utf8', timeout: 15000, stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { return { organ: 'governor-report', present: true, dir, observed_at, report: null, unreadable: [{ file: args[0], error: `governor exec: ${errMsg(e)}`, kind: 'governor' }] }; }
  try { return { organ: 'governor-report', present: true, dir, observed_at, report: JSON.parse(out), unreadable: [] }; }
  catch (e) { return { organ: 'governor-report', present: true, dir, observed_at, report: null, unreadable: [{ file: args[0], error: `governor output parse: ${errMsg(e)}`, kind: 'governor' }] }; }
}

// ── Results ───────────────────────────────────────────────────────────────────

/**
 * Results enumeration: `$AIN/results/<work_unit_id>.json` (ain-delegate.sh:57)
 * plus `packets/` and `logs/` presence. Results are first-class (humane law 8).
 * @param {{ env?: NodeJS.ProcessEnv, limit?: number }} [opts]
 */
export function listResults(opts = {}) {
  const env = opts.env || process.env;
  const home = resolveAinHome(env);
  const limit = Number.isInteger(opts.limit) && /** @type {number} */ (opts.limit) > 0 ? /** @type {number} */ (opts.limit) : 100;
  const dir = path.join(home, 'results');
  const observed_at = new Date().toISOString();
  /** @type {Unreadable[]} */ const unreadable = [];
  /** @type {Array<{ work_unit_id: string, file: string, file_mtime: string|null, result: any }>} */ const results = [];
  const siblings = { packets: dirPresent(path.join(home, 'packets')), logs: dirPresent(path.join(home, 'logs')) };
  if (!dirPresent(dir)) return { organ: 'results', present: false, dir, observed_at, results, unreadable, siblings, truncated: false };
  let files;
  try { files = readdirSync(dir).filter((f) => f.endsWith('.json')); } catch (e) { unreadable.push({ file: dir, error: `readdir: ${errMsg(e)}`, kind: 'directory' }); return { organ: 'results', present: true, dir, observed_at, results, unreadable, siblings, truncated: false }; }
  for (const f of files.sort()) {
    const file = path.join(dir, f);
    const r = readJson(file);
    if (!r.ok) { unreadable.push({ file, error: r.error, kind: 'result' }); continue; }
    results.push({ work_unit_id: f.slice(0, -'.json'.length), file, file_mtime: mtimeIso(file), result: r.value });
  }
  results.sort((a, b) => String(b.file_mtime ?? '').localeCompare(String(a.file_mtime ?? '')));
  return { organ: 'results', present: true, dir, observed_at, results: results.slice(0, limit), unreadable, siblings, truncated: results.length > limit };
}

/**
 * Every read organ at once, for the composer. Nothing here writes.
 * @param {{ env?: NodeJS.ProcessEnv, root?: string, runsLimit?: number, eventsN?: number, resultsLimit?: number, since?: string, exec?: any, statusReader?: any }} [opts]
 */
export async function readAllOrgans(opts = {}) {
  const env = opts.env || process.env;
  const root = opts.root || REPO_ROOT;
  const [units, governor] = await Promise.all([
    listWorkUnitsV2({ env, root, statusReader: opts.statusReader }),
    governorReportReadOnly({ env, root, since: opts.since, exec: opts.exec }),
  ]);
  return {
    home: resolveAinHome(env),
    units,
    runs: listRunsReadOnly({ env, limit: opts.runsLimit }),
    events: readEventsTail({ env, n: opts.eventsN }),
    sessions: listSessions({ env }),
    governor,
    results: listResults({ env, limit: opts.resultsLimit }),
  };
}
