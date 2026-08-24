// JARVIS Desktop — what counts as a bindable substrate, and where an
// unconfigured packaged launch is allowed to look for one.
//
// Pure of Electron on purpose (fs only, injected base directories), so the
// binding rules can be proven with real directories in a test instead of being
// asserted about a running app.
//
// WHY THIS EXISTS (packaged-binding defect, founder walk 2026-08-24).
// The packaged app's implicit-default step was a single hard-coded absolute
// path checked with a boolean. Two consequences, both observed:
//
//   1. If that one path did not verify, resolution returned NONE with
//      configProblem === null — literally no explanation. Home read "no
//      repository is bound" and Work read "repo root not found — cannot
//      route": two restatements of the same nothing. The founder was told a
//      binding was missing and never told what was looked at or what was
//      wrong with it.
//   2. A boolean cannot distinguish "there is no checkout there" from "there
//      is a checkout there, and it is the right repository, but the branch it
//      is currently on does not carry the Builder OS cluster". Those call for
//      completely different actions — clone/choose versus `git checkout` —
//      and the second is the ordinary case on a machine where branches move.
//
// So: inspection returns FACTS, not a boolean, and discovery looks at an
// ordered, bounded list of candidates rather than one string. What it does NOT
// do is relax the bar for binding. A candidate is still only usable with ALL
// FOUR canonical markers present, an implicitly-discovered root is still
// DEGRADED because nobody chose it, and — the safety this adds rather than
// removes — when the canonical path is gone and more than one discovered
// candidate verifies, nothing binds. Two plausible repositories is exactly the
// condition under which guessing produces work executed against the wrong
// substrate, so it is reported and left to the founder.
'use strict';

const path = require('node:path');
const fs = require('node:fs');

// A candidate root is valid only if ALL FOUR are present — the existence of a
// directory, or of a .git, is never accepted as sufficient on its own.
const CANONICAL_MARKERS = [
  ['scripts', 'builder', 'session.mjs'],
  ['scripts', 'builder', 'deterministic.mjs'],
  ['scripts', 'builder', 'router.mjs'],
  ['package.json'],
];

const MARKER_NAMES = CANONICAL_MARKERS.map((parts) => parts.join('/'));

/** The canonical checkout on the founder's machine, per CLAUDE.md. */
const CANONICAL_ROOT = '/Users/soullab/MAIA-SOVEREIGN';

const REPO_DIRNAME = 'MAIA-SOVEREIGN';

/**
 * Look at one candidate directory and report what is actually there.
 *
 * Never throws: an unreadable or nonexistent path is a fact about the
 * candidate, not an error condition for the caller to handle separately.
 *
 * @returns {{path: string, exists: boolean, is_git_worktree: boolean,
 *            markers_present: string[], markers_missing: string[],
 *            usable: boolean, why: string|null}}
 */
function inspectCandidate(dir) {
  const out = {
    path: dir,
    exists: false,
    is_git_worktree: false,
    markers_present: [],
    markers_missing: MARKER_NAMES.slice(),
    usable: false,
    why: null,
  };
  if (!dir || typeof dir !== 'string') {
    return { ...out, path: String(dir || ''), why: 'no path given' };
  }

  try {
    out.exists = fs.statSync(dir).isDirectory();
  } catch {
    out.exists = false;
  }
  if (!out.exists) return { ...out, why: `nothing is at ${dir}` };

  // `.git` is a directory in a normal clone and a FILE in a linked worktree.
  // Both are worktrees; only the presence of the entry is checked, because
  // reading it would mean shelling out to git and this module stays pure.
  out.is_git_worktree = fs.existsSync(path.join(dir, '.git'));

  out.markers_present = [];
  out.markers_missing = [];
  for (const parts of CANONICAL_MARKERS) {
    const name = parts.join('/');
    if (fs.existsSync(path.join(dir, ...parts))) out.markers_present.push(name);
    else out.markers_missing.push(name);
  }
  out.usable = out.markers_missing.length === 0;

  if (out.usable) return out;

  // The distinction this whole module exists for. A git worktree that is
  // missing the builder cluster is almost never the wrong directory — it is
  // the right repository on a branch that predates the cluster, or a worktree
  // cut from one. Saying so is the difference between a founder running
  // `git checkout` and a founder re-cloning.
  out.why = out.is_git_worktree
    ? `${dir} is a git checkout but does not carry ${out.markers_missing.join(', ')} — it may be on a branch that predates the Builder OS cluster`
    : `${dir} is not a Sovereign checkout — missing ${out.markers_missing.join(', ')}`;
  return out;
}

/**
 * Where an unconfigured packaged launch may look, in order.
 *
 * Bounded and derived — never a scan. The canonical path stays FIRST so a
 * machine where it verifies binds exactly what it binds today; the rest exist
 * so a machine where it does not is not left with nothing to say.
 */
function defaultCandidates(homeDir) {
  const list = [CANONICAL_ROOT];
  if (homeDir) {
    for (const rel of [[], ['Projects'], ['Developer'], ['code'], ['src'], ['Documents']]) {
      list.push(path.join(homeDir, ...rel, REPO_DIRNAME));
    }
  }
  // Dedupe, preserving order: on the founder's machine ~/MAIA-SOVEREIGN IS the
  // canonical path, and a duplicate would read on screen as two candidates.
  return list.filter((p, i) => list.indexOf(p) === i);
}

/**
 * Decide the implicit-default binding from inspected candidates.
 *
 * Rules, in order:
 *   - the canonical path verifies -> bind it (today's behaviour, unchanged);
 *     any OTHER candidate that also verifies is reported, never hidden.
 *   - canonical absent, exactly one other verifies -> bind that one.
 *   - canonical absent, two or more verify -> bind NOTHING and say which.
 *
 * @param {Array} inspected  results of inspectCandidate, in candidate order
 * @returns {{root: string|null, ambiguous: boolean, verified: string[], problem: string|null}}
 */
function chooseDefaultCandidate(inspected) {
  const verified = inspected.filter((c) => c.usable).map((c) => c.path);
  if (!verified.length) return { root: null, ambiguous: false, verified, problem: null };

  const canonical = verified.includes(CANONICAL_ROOT) ? CANONICAL_ROOT : null;
  if (canonical) {
    const others = verified.filter((p) => p !== canonical);
    return {
      root: canonical,
      ambiguous: false,
      verified,
      problem: others.length
        ? `more than one checkout carries the canonical markers (${verified.join(', ')}). JARVIS is using ${canonical} because it is the canonical path — choose one in Preferences to make that a decision rather than a default.`
        : null,
    };
  }

  if (verified.length === 1) {
    return { root: verified[0], ambiguous: false, verified, problem: null };
  }

  return {
    root: null,
    ambiguous: true,
    verified,
    problem: `${verified.length} checkouts carry the canonical markers (${verified.join(', ')}) and none of them is the canonical path ${CANONICAL_ROOT}. JARVIS will not guess which one your work should execute against — choose one in Preferences.`,
  };
}

/**
 * One sentence naming what was looked at and what was wrong with it.
 *
 * Replaces the null that used to reach the surface. Leads with any candidate
 * that is a git checkout — that is the one the founder can most likely fix in
 * a single command — and never lists more than a few paths, because a wall of
 * "nothing is at …" is the same as saying nothing.
 */
function describeUnbound(inspected) {
  const checkouts = inspected.filter((c) => c.exists && c.is_git_worktree && !c.usable);
  if (checkouts.length) {
    return checkouts.map((c) => c.why).join('; ');
  }
  const present = inspected.filter((c) => c.exists && !c.usable);
  if (present.length) return present.map((c) => c.why).join('; ');
  return `no checkout carrying the canonical Builder OS markers (${MARKER_NAMES.join(', ')}) was found. Looked at: ${inspected.map((c) => c.path).join(', ')}.`;
}

module.exports = {
  CANONICAL_MARKERS, MARKER_NAMES, CANONICAL_ROOT,
  inspectCandidate, defaultCandidates, chooseDefaultCandidate, describeUnbound,
};
