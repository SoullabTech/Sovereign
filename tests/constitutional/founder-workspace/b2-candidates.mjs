// @ts-check
/** Defeat candidates for the B2 read organs and adapters. Each embodies one wrong belief. */
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { resolveAinHome } from '../../../scripts/builder/founder-workspace/read-organs.mjs';

/** DC-R1: "a read may create the directory it wants to read" (the `initStore()` shape) @param {NodeJS.ProcessEnv} env */
export function listRunsCreatesOnRead(env) {
  const dir = path.join(resolveAinHome(env), 'runtime', 'runs');
  mkdirSync(dir, { recursive: true });
  return { organ: 'runtime-runs', present: true, dir, observed_at: new Date().toISOString(), runs: [], unreadable: [], truncated: false };
}

/** DC-R2: "an unreadable file is best skipped quietly" (the `listRuns` catch-and-skip shape) @param {NodeJS.ProcessEnv} env */
export function listRunsSkipsUnreadable(env) {
  const dir = path.join(resolveAinHome(env), 'runtime', 'runs');
  const runs = [];
  for (const f of readdirSync(dir)) { try { runs.push({ file: path.join(dir, f), file_mtime: null, run: JSON.parse(readFileSync(path.join(dir, f), 'utf8')) }); } catch { /* skip unreadable */ } }
  return { organ: 'runtime-runs', present: true, dir, observed_at: new Date().toISOString(), runs, unreadable: [], truncated: false };
}

/** DC-R3: "an organ state we don't recognise is probably fine" @param {unknown} state */
export function levelOfOptimistic(state) {
  const s = String(state ?? '').toUpperCase();
  if (['DEGRADED', 'WARN'].includes(s)) return 'warn';
  if (['UNREACHABLE', 'FAULT', 'FAILED'].includes(s)) return 'failed';
  return 'good';
}
