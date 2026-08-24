#!/usr/bin/env node
/**
 * JEM-00 — the JARVIS runtime's canonical repository binding.
 * ═══════════════════════════════════════════════════════════════════════════
 * Gate 0 of the Agent Experience Memory program: no memory architecture gets
 * built on an unbound runtime.
 *
 * THE DEFECT THIS CLOSES
 * ──────────────────────
 * The Desktop app has had a durable, verified, provenance-carrying resolver
 * since JOP-04: env -> config -> default, walk-first in dev, every candidate
 * re-verified against the canonical markers on every launch, every rung named
 * on screen. The JARVIS *runtime* — the plane that validates packets, claims
 * worktrees and routes work — had this instead:
 *
 *     export const REPO_ROOT = path.resolve(__dirname, '..', '..');
 *
 * One line, and three separate things missing from it. It verified nothing, so
 * the runtime would happily route work into a directory that was not a
 * Sovereign checkout and only discover it downstream as an unrelated failure.
 * It consulted no explicit binding, so `JARVIS_REPO_ROOT` and the repository
 * the founder named in Preferences meant nothing at all to the process that
 * actually does the work. And it carried no provenance, so nothing could ever
 * report which repository the runtime believed it was operating on, or notice
 * that it was a different one from the Desktop's.
 *
 * That is the same shape of defect as JOP-04, one plane over, and it is worse
 * here: the Desktop reads, the runtime WRITES — it claims git worktrees and
 * spawns workers. Silence about identity is affordable in a viewer. It is not
 * affordable in something that mutates a filesystem.
 *
 * WHAT THIS IS NOT
 * ────────────────
 * Not a second resolver. The ORDER comes from jarvis-desktop/src/
 * repo-resolution.js — the same module the Desktop uses, proven by the same
 * JOP-04 tests. The MARKERS come from repo-markers.js. The persisted binding
 * comes from repo-config.js, reading the same file Preferences writes. This
 * module contributes exactly one thing the Desktop does not need: the runtime's
 * own ladder, and a refusal where the Desktop has a fallback.
 *
 * WHY NO `DEFAULT` RUNG
 * ─────────────────────
 * The Desktop's ladder ends at a hard-coded candidate, reported DEGRADED. That
 * is right for a viewer: a founder staring at a window deserves a populated
 * screen that says "nobody chose this" over an empty one that says nothing.
 *
 * The runtime's equivalent of showing a screen is REFUSING. A process that is
 * about to claim a worktree and run a worker must not bind itself to a
 * repository nobody named. So this ladder ends at NONE, and the caller is
 * expected to fail closed with REPO_BINDING_UNRESOLVED rather than proceed.
 * A named refusal is a fact the founder can act on; a silent bind to somewhere
 * plausible is the thing that produces "why did it edit THAT checkout".
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, renameSync } from 'node:fs';
import { AIN_HOME } from './jarvis-runtime-store.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP_SRC = path.join(HERE, '..', '..', 'jarvis-desktop', 'src');

// The three shared modules. Required by path rather than re-implemented: a
// second copy of "what is a marker" or "how do I read the config" is the
// sibling-implementation failure this codebase keeps paying for, and it is the
// exact failure JEM-00 exists to stop paying.
const { markerNames, isValidRepoRoot, findRepoRootByWalk } = require(path.join(DESKTOP_SRC, 'repo-markers.js'));
const RepoConfig = require(path.join(DESKTOP_SRC, 'repo-config.js'));
const { resolveDevMode } = require(path.join(DESKTOP_SRC, 'repo-resolution.js'));
const PROV = require(path.join(DESKTOP_SRC, 'provenance.js'));

export const RESOLUTION = PROV.RESOLUTION;
export const BINDING_UNRESOLVED = 'REPO_BINDING_UNRESOLVED';

// Where the runtime records what it bound to, so a later process can ask what
// an earlier one believed. Sibling of runs/ and events.jsonl under the same
// AIN_HOME — the store already owns "durable run history"; this is durable
// binding history, and it belongs in the same place for the same reason.
export const BINDING_RECORD = path.join(AIN_HOME, 'runtime', 'binding.json');

/**
 * Resolve the repository this runtime is bound to.
 *
 * Every source is injectable so the ladder can be proven without a filesystem
 * shaped like production. Defaults are the real sources.
 *
 * @returns {{
 *   root: string|null, resolution: string, explicit: boolean,
 *   markers_verified: boolean, markers: string[], launched_from: string,
 *   config_path: string, config_root: string|null, config_problem: string|null,
 *   conflicting_config_root: string|null, env_root: string|null,
 *   divergence: string|null, ok: boolean, failure_class: string|null
 * }}
 */
export function resolveBinding({
  from = HERE,
  env = process.env,
  appSupportDir = RepoConfig.defaultAppSupportDir(),
  isValid = isValidRepoRoot,
  walk = findRepoRootByWalk,
} = {}) {
  const cfg = RepoConfig.readConfig(appSupportDir);
  const envRoot = env.JARVIS_REPO_ROOT || null;

  // The runtime's ladder: what was explicitly named, and nothing else. Env
  // outranks config for the same reason it does in the Desktop — it is the
  // more present-tense statement — and the conflict between them is REPORTED
  // rather than silently resolved, because a variable exported in one shell is
  // invisible to a founder reading Preferences.
  const ladder = () => {
    if (envRoot && isValid(envRoot)) {
      const conflict = cfg.present && cfg.repo_root !== envRoot
        ? `JARVIS_REPO_ROOT (${envRoot}) is set in this process's environment and OVERRIDES the saved binding (${cfg.repo_root}). Unset it to route against the repository you named in Preferences.`
        : null;
      return {
        root: envRoot,
        resolution: RESOLUTION.ENV,
        configProblem: conflict,
        conflictingConfigRoot: conflict ? cfg.repo_root : null,
      };
    }
    if (cfg.present && isValid(cfg.repo_root)) {
      return { root: cfg.repo_root, resolution: RESOLUTION.CONFIG, configProblem: null, conflictingConfigRoot: null };
    }
    // Name which failure this is. "You never chose one", "the file is corrupt"
    // and "the repository you chose has moved" call for three different actions
    // and must not collapse into a single absence.
    const configProblem = cfg.problem
      ? cfg.problem
      : cfg.present
        ? `the saved binding no longer carries the canonical markers: ${cfg.repo_root}`
        : envRoot
          ? `JARVIS_REPO_ROOT is set to ${envRoot}, which does not carry the canonical markers`
          : null;
    return { root: null, resolution: RESOLUTION.NONE, configProblem, conflictingConfigRoot: null };
  };

  // The walk wins, and it means something slightly different here than it does
  // in the Desktop. There, it means "you launched from inside this checkout".
  // Here, it means "the module now executing physically lives in this checkout"
  // — which is the strongest present-tense statement available to a runtime,
  // and is what the old one-liner was reaching for. The difference is that this
  // one is VERIFIED against the markers and falls through instead of off a
  // cliff, so a checkout that has lost them reaches the explicit ladder rather
  // than binding the runtime to a directory that cannot answer for itself.
  const resolved = resolveDevMode({
    walk: () => walk(from),
    ladder,
    launchedFrom: () => from,
    RESOLUTION,
  });

  const root = resolved.root;
  const explicit = resolved.resolution === RESOLUTION.ENV
    || resolved.resolution === RESOLUTION.CONFIG
    || resolved.resolution === RESOLUTION.WALK;

  // Divergence is its own fact, not an error. Two planes legitimately bound to
  // two checkouts is a normal thing to do on purpose and a catastrophic thing to
  // do by accident; the only intolerable version is the one nobody can see.
  const divergence = root && cfg.present && cfg.repo_root !== root
    ? `the JARVIS runtime is bound to ${root} (${resolved.resolution}) while the Desktop's saved binding is ${cfg.repo_root}. Work routed by this runtime lands in the former.`
    : null;

  return {
    root,
    resolution: resolved.resolution,
    explicit,
    markers_verified: root ? isValid(root) : false,
    markers: markerNames(),
    launched_from: from,
    config_path: cfg.path,
    config_root: cfg.repo_root,
    config_problem: resolved.configProblem ?? null,
    conflicting_config_root: resolved.conflictingConfigRoot ?? null,
    env_root: envRoot,
    divergence,
    ok: Boolean(root),
    failure_class: root ? null : BINDING_UNRESOLVED,
  };
}

/** Git identity of the bound checkout — reported as facts, never inferred from each other. */
export function substrateIdentity(root) {
  const unread = { git_connected: false, head: null, branch: null, dirty: null };
  if (!root || !existsSync(root)) return unread;
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try {
    const head = git(['rev-parse', 'HEAD']);
    let branch = null;
    try { branch = git(['rev-parse', '--abbrev-ref', 'HEAD']); } catch { branch = null; }
    return {
      git_connected: true,
      head,
      // Empty on a detached HEAD, which is a legitimate state for a worktree
      // cut at a SHA — reported as 'detached' rather than as a failure.
      branch: branch === 'HEAD' || !branch ? 'detached' : branch,
      dirty: git(['status', '--porcelain']).length > 0,
    };
  } catch {
    // A real directory carrying all four markers can still not be a git
    // worktree, and "this is not a repository" needs a different response from
    // "this is a repository I could not read". Neither is inferred from the other.
    return unread;
  }
}

/**
 * Persist the binding this process resolved, and report what the LAST process
 * resolved.
 *
 * This is the restart half of Gate 0. A binding that is merely correct in one
 * process is not a binding — it is a coincidence that held for one run. The
 * record makes two things answerable after a restart that were unanswerable
 * before: what did JARVIS believe it was operating on, and did that change
 * without anyone saying so.
 */
export function recordBinding(binding, { at = new Date().toISOString(), file = BINDING_RECORD } = {}) {
  const previous = readBindingRecord(file);
  const record = {
    version: 1,
    recorded_at: at,
    pid: process.pid,
    root: binding.root,
    resolution: binding.resolution,
    explicit: binding.explicit,
    markers_verified: binding.markers_verified,
    config_path: binding.config_path,
    divergence: binding.divergence,
    substrate: substrateIdentity(binding.root),
    // A rebind is not a failure and is not silently overwritten. The previous
    // root travels forward in the record so the change is legible after the
    // fact, which is the only time anyone ever goes looking for it.
    previous_root: previous ? previous.root : null,
    rebound_since_last_run: Boolean(previous && previous.root !== binding.root),
  };
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  renameSync(tmp, file);
  return record;
}

export function readBindingRecord(file = BINDING_RECORD) {
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; }
}

// ── CLI ──────────────────────────────────────────────────────────────────────
// `node scripts/builder/jarvis-binding.mjs [--json] [--record]`
// Exits 0 when bound, 3 when unresolved — a shell gate can branch on it without
// reading prose.
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const b = resolveBinding();
  if (argv.includes('--record')) recordBinding(b);
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ ...b, substrate: substrateIdentity(b.root) }, null, 2));
  } else {
    console.log(`root:        ${b.root ?? `UNRESOLVED — ${b.failure_class}`}`);
    console.log(`resolution:  ${b.resolution}${b.explicit ? ' (explicit)' : ''}`);
    console.log(`markers:     ${b.markers_verified ? 'verified' : 'NOT VERIFIED'} — ${b.markers.join(', ')}`);
    console.log(`config:      ${b.config_root ?? 'none saved'}  (${b.config_path})`);
    if (b.divergence) console.log(`DIVERGENCE:  ${b.divergence}`);
    if (b.config_problem) console.log(`problem:     ${b.config_problem}`);
  }
  process.exit(b.ok ? 0 : 3);
}
