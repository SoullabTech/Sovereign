// JARVIS — what makes a directory a canonical Sovereign checkout.
//
// This file exists so that there is exactly ONE answer to that question, shared
// by every plane that has to ask it.
//
// Before JEM-00 there were two askers with two answers. The Desktop app had a
// verified, provenance-carrying resolver (env -> config -> default, walk-first
// in dev; see repo-resolution.js and main.js). The JARVIS runtime — the thing
// that actually routes work packets — had this, at the top of
// scripts/builder/jarvis-runtime-pipeline.mjs:
//
//     export const REPO_ROOT = path.resolve(__dirname, '..', '..');
//
// That is an INFERENCE from where a source file happens to sit. It is usually
// right, and it was never verified: it checked no markers, consulted no
// explicit binding, and carried no provenance. So the Desktop and the runtime
// could bind to two different repositories with nothing on any screen saying
// so, and the runtime could route work into a directory that was not a
// Sovereign checkout at all and only discover it downstream as some unrelated
// failure.
//
// The markers themselves were also main.js-local, which meant "canonical
// checkout" was a Desktop opinion rather than a system fact. Extracting them
// here is the smaller half of the fix and the load-bearing one: with a single
// definition, the two planes are structurally incapable of disagreeing about
// what they are looking for.
//
// Deliberately free of Electron, of `require` beyond node builtins, and of any
// environment or config reading. It owns one thing: the marker set and the two
// pure operations over it.
'use strict';

const path = require('node:path');
const fs = require('node:fs');

// ALL FOUR must be present. Existence of a directory — even a directory with
// the right NAME — is not accepted as a checkout. The three builder modules are
// chosen because they are the substrate the runtime actually executes against;
// a checkout that cannot answer `session.mjs status` is not a checkout JARVIS
// can route work into, whatever it is called.
const CANONICAL_MARKERS = [
  ['scripts', 'builder', 'session.mjs'],
  ['scripts', 'builder', 'deterministic.mjs'],
  ['scripts', 'builder', 'router.mjs'],
  ['package.json'],
];

/** Human-readable marker list, for the one place a founder has to read it. */
function markerNames() {
  return CANONICAL_MARKERS.map((parts) => parts.join('/'));
}

/**
 * Is `dir` a canonical Sovereign checkout?
 *
 * Returns false for anything unreadable rather than throwing: a candidate that
 * cannot be inspected is a candidate that has not been verified, and the caller
 * needs a verdict it can report, not an exception it has to guess about.
 */
function isValidRepoRoot(dir) {
  if (typeof dir !== 'string' || !dir) return false;
  try {
    return CANONICAL_MARKERS.every((parts) => fs.existsSync(path.join(dir, ...parts)));
  } catch {
    return false;
  }
}

/**
 * Walk upward from `start` looking for a canonical checkout.
 *
 * Bounded at 8 levels: deep enough for a src/ directory inside a package inside
 * a worktree, shallow enough that a wrong starting point cannot wander to / and
 * pick up something unrelated on the way.
 */
function findRepoRootByWalk(start, maxLevels = 8) {
  let dir = start;
  for (let i = 0; i < maxLevels; i++) {
    if (isValidRepoRoot(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

module.exports = { CANONICAL_MARKERS, markerNames, isValidRepoRoot, findRepoRootByWalk };
