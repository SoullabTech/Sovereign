// JARVIS Desktop — repository topology.
//
// Pure, DOM-free, Electron-free. Loaded by main, by the stamp, and by proofs.
//
// ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
// "The repo" is not one identity. It is at least four, and they diverge:
//
//   REPOSITORY IDENTITY   which git object store / history is this?
//   WORKTREE IDENTITY     which checkout am I looking at?
//   COMMIT IDENTITY       exactly what source state is in that checkout?
//   ARTIFACT IDENTITY     exactly which commit produced the running binary?
//
// Two worktrees of the SAME repository share history and object storage and
// still contain different source. So a developer can fix a bug in one checkout,
// package the app from another, and ship the old implementation — while every
// surface truthfully reports "the repo". That is not a hypothetical: it is the
// shape of the 2026-08-24 finding that JARVIS.app was built from one worktree
// and operates against another.
//
// A filesystem directory is therefore NOT sufficient repository identity. This
// module keeps the identities apart and reports their relationship as its own
// named fact, so nothing downstream can flatten them by accident.
//
// ── WHAT IT DOES NOT DO ─────────────────────────────────────────────────────
// It decides nothing. Divergence between build source and operated worktree is
// REPORTED, never resolved: an intentional split (packaged app operating a
// separate canonical checkout) and an accidental one (built from a stale fix
// worktree) look identical from here, and only the founder can say which it is.
// The contract is declared in config; this module compares against it.
'use strict';

const { execFileSync } = require('node:child_process');
const path = require('node:path');

/**
 * Read git identity for one directory.
 *
 * `git rev-parse --git-common-dir` is the load-bearing call: linked worktrees
 * each have their own `--git-dir` but SHARE `--git-common-dir`, so it is the
 * only cheap answer to "are these the same repository?". Resolved to an
 * absolute real path because git returns it relative when cwd is the main
 * checkout.
 *
 * Every field is independently nullable. A directory can be real, carry the
 * canonical markers, and not be a git worktree at all — "not a repository" and
 * "a repository I could not read" call for different founder responses, so they
 * are never collapsed into one falsy value.
 *
 * @param {string|null} dir
 * @param {object}      [io]  injectable for proofs; defaults to real git
 * @returns {{worktree:string|null, repository:string|null, git_dir:string|null,
 *            is_linked_worktree:boolean|null, branch:string|null,
 *            commit:string|null, dirty:boolean|null, git_connected:boolean,
 *            read_error:string|null}}
 */
function readTopology(dir, io = {}) {
  const unread = {
    worktree: dir || null,
    repository: null,
    git_dir: null,
    is_linked_worktree: null,
    branch: null,
    commit: null,
    dirty: null,
    git_connected: false,
    read_error: null,
  };
  if (!dir) return { ...unread, read_error: 'no directory given' };

  const run =
    io.git ||
    ((args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', env: io.env || process.env }).trim());

  try {
    if (run(['rev-parse', '--is-inside-work-tree']) !== 'true') {
      return { ...unread, read_error: 'not a git worktree' };
    }
    // Ask git for the worktree root rather than trusting the directory handed
    // in: a path pointing at a SUBDIRECTORY of a checkout would otherwise be
    // recorded as if it were the checkout itself.
    const worktree = path.resolve(dir, run(['rev-parse', '--show-toplevel']));
    const gitDir = path.resolve(dir, run(['rev-parse', '--absolute-git-dir']));
    const common = path.resolve(dir, run(['rev-parse', '--git-common-dir']));
    const branch = run(['rev-parse', '--abbrev-ref', 'HEAD']);
    return {
      worktree,
      repository: common,
      git_dir: gitDir,
      // A linked worktree's own git dir sits INSIDE the common dir
      // (<common>/worktrees/<name>); the main checkout's git dir IS the common
      // dir. That difference is the whole distinction between "another checkout
      // of this repo" and "the repo's primary checkout".
      is_linked_worktree: gitDir !== common,
      branch: branch === 'HEAD' ? 'detached' : branch,
      commit: run(['rev-parse', '--short', 'HEAD']),
      dirty: run(['status', '--porcelain']).length > 0,
      git_connected: true,
      read_error: null,
    };
  } catch (e) {
    return { ...unread, read_error: String(e.message).slice(0, 200) };
  }
}

/** Same repository? Answered from the shared object store, never from the path. */
function sameRepository(a, b) {
  if (!a || !b || !a.repository || !b.repository) return null;
  return a.repository === b.repository;
}

/** Same checkout? A worktree path, not a repository, answers this one. */
function sameWorktree(a, b) {
  if (!a || !b || !a.worktree || !b.worktree) return null;
  return a.worktree === b.worktree;
}

/**
 * Compare BUILD SOURCE against OPERATED SUBSTRATE and name the relationship.
 *
 * `declaredContract` is the founder's statement that a split is intentional —
 * see docs/ops/JARVIS_REPOSITORY_TOPOLOGY_INVARIANT.md. Without it, divergence
 * is UNDECLARED, which is the state that shipped the wrong implementation.
 *
 * States, and why each is separate:
 *   ALIGNED            build source and operated substrate are the same commit
 *                      in the same checkout — nothing to explain.
 *   SAME_WORKTREE_DRIFT same checkout, different commit. The build is stale
 *                      relative to what is being operated (or vice versa).
 *   DIVERGED_DECLARED  different checkouts, and the contract says so.
 *   DIVERGED_UNDECLARED different checkouts with no contract. THIS is the
 *                      2026-08-24 hazard and must read as a problem.
 *   CROSS_REPOSITORY   not even the same object store — the strongest form of
 *                      "these are not what you think they are".
 *   UNKNOWN            something could not be read. Never optimistically
 *                      collapsed into ALIGNED.
 */
function compareBuildToOperated({ build, operated, declaredContract = null }) {
  const unknown = (why) => ({
    state: 'UNKNOWN',
    same_repository: null,
    same_worktree: null,
    same_commit: null,
    declared: !!declaredContract,
    detail: why,
  });
  if (!build) return unknown('no build-source identity was stamped — this artifact cannot say which checkout produced it');
  if (!operated) return unknown('no operated substrate is bound — nothing to compare the build against');

  const sameRepo = sameRepository(build, operated);
  const sameTree = sameWorktree(build, operated);
  const sameCommit = build.commit && operated.commit ? build.commit === operated.commit : null;
  const base = { same_repository: sameRepo, same_worktree: sameTree, same_commit: sameCommit, declared: !!declaredContract };

  if (sameRepo === null || sameTree === null) {
    return { ...unknown('build or operated identity is incomplete — comparison would be a guess'), ...base };
  }

  if (sameRepo === false) {
    return {
      ...base,
      state: 'CROSS_REPOSITORY',
      detail:
        `The running artifact was built from a DIFFERENT REPOSITORY than the one it operates. ` +
        `Build: ${build.worktree} (repo ${build.repository}). Operated: ${operated.worktree} (repo ${operated.repository}). ` +
        `These do not share history or object storage.`,
    };
  }

  if (sameTree === true) {
    if (sameCommit === true) {
      return { ...base, state: 'ALIGNED', detail: `Built from and operating ${operated.worktree} @ ${operated.commit}.` };
    }
    return {
      ...base,
      state: 'SAME_WORKTREE_DRIFT',
      detail:
        `Same checkout, different commit. The running artifact was built at ${build.commit}; ` +
        `${operated.worktree} is now at ${operated.commit}. Code you read there is not necessarily code the app runs.`,
    };
  }

  // Same repository, different worktrees — the exact shape of the finding.
  const shared =
    `Build worktree ${build.worktree} @ ${build.commit}; operated worktree ${operated.worktree} @ ${operated.commit}. ` +
    `Same repository (${operated.repository}), so they share history — but they are different checkouts and may contain different source.`;
  if (declaredContract) {
    return { ...base, state: 'DIVERGED_DECLARED', detail: `${shared} This split is declared: ${declaredContract}` };
  }
  return {
    ...base,
    state: 'DIVERGED_UNDECLARED',
    detail:
      `${shared} No contract declares this split. A fix made in the operated worktree is NOT in the running app, ` +
      `and a fix made in the build worktree is NOT what you are reading. Resolve it, or declare the contract.`,
  };
}

/** States in which a build/operated relationship must not read as clean. */
const UNCLEAN_STATES = Object.freeze(['DIVERGED_UNDECLARED', 'CROSS_REPOSITORY', 'SAME_WORKTREE_DRIFT', 'UNKNOWN']);

/**
 * The full eight-identity record, flattened for storage on a run.
 *
 * Deliberately verbose keys. A run record retrieved after a restart must be
 * readable on its own, without the reader knowing which field meant which
 * identity — that ambiguity is what the invariant exists to remove.
 */
function topologyRecord({ build, operated, artifactSha = null, declaredContract = null }) {
  return {
    repository_identity: operated ? operated.repository : null,
    operated_worktree: operated ? operated.worktree : null,
    operated_branch: operated ? operated.branch : null,
    operated_commit: operated ? operated.commit : null,
    operated_dirty: operated ? operated.dirty : null,
    operated_is_linked_worktree: operated ? operated.is_linked_worktree : null,
    build_source_repository: build ? build.repository : null,
    build_source_worktree: build ? build.worktree : null,
    build_source_branch: build ? build.branch : null,
    build_source_commit: build ? build.commit : null,
    build_source_dirty: build ? build.dirty : null,
    // The SHA the RUNNING BINARY carries. Normally equal to build_source_commit,
    // and kept separate anyway: one is what the stamp claims about the source,
    // the other is what this process was launched as. Equality is a fact worth
    // being able to check, not an assumption worth baking in.
    running_artifact_sha: artifactSha,
    relationship: compareBuildToOperated({ build, operated, declaredContract }),
    identities_distinct: true,
  };
}

module.exports = {
  readTopology,
  sameRepository,
  sameWorktree,
  compareBuildToOperated,
  topologyRecord,
  UNCLEAN_STATES,
};
