#!/usr/bin/env node
// BUILD-STAMP-PROVENANCE — write the immutable description of the source state
// that produced this artifact.
//
// This was an inline `node -e` one-liner in package.json capturing two fields:
// {app_build_sha, built_at}. It is the SAME stamp and the SAME file — extracted
// so it can be exercised by a test, and widened to carry the facts a running
// artifact needs in order to say what produced it.
//
// The governing rule: a running artifact may claim its source identity ONLY
// from information bound at build time. Never from the current checkout, never
// from `git HEAD` at launch, never from the directory a developer stands in.
// This script is the only place that binding happens.
//
//   node scripts/stamp.mjs [--out build/build-info.json] [--cwd <dir>]
//
// A dirty build is recorded as dirty and NEVER presented as equal to HEAD:
// the commit does not describe uncommitted work, so the stamp says so.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const STAMP_VERSION = 2;

function git(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/**
 * Collect the build identity. Pure apart from reading git; returns a plain
 * object so a test can assert on it without packaging anything.
 *
 * Every field is nullable and null MEANS unknown. Nothing is defaulted, and no
 * field is ever filled in from a different field — an unknown branch does not
 * become 'main', and an unreadable dirty state does not become false. Reporting
 * clean when we could not look is the same lie as reporting sent when the
 * provider refused.
 */
export function collectBuildIdentity({ cwd = process.cwd(), now = new Date() } = {}) {
  const sha = git(['rev-parse', '--short', 'HEAD'], cwd);
  const status = git(['status', '--porcelain'], cwd);
  const commonDir = git(['rev-parse', '--path-format=absolute', '--git-common-dir'], cwd)
    || git(['rev-parse', '--git-common-dir'], cwd);
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);

  return {
    stamp_version: STAMP_VERSION,

    // --- the two original fields, unchanged in name and meaning ---
    app_build_sha: sha,
    built_at: now.toISOString(),

    // --- repository identity: WHICH repository, not which directory ---
    // A worktree path alone never establishes repository identity: 21 linked
    // worktrees share one common git dir and hold different content at the
    // same paths. The common dir is the thing that is actually the repo.
    build_repo_common_dir: commonDir,
    build_worktree: git(['rev-parse', '--show-toplevel'], cwd),
    build_branch: branch === 'HEAD' ? null : branch,   // detached HEAD is not a branch

    // --- exactly what the source looked like ---
    build_commit: git(['rev-parse', 'HEAD'], cwd),      // full sha, unabbreviated
    build_tree_hash: git(['rev-parse', 'HEAD^{tree}'], cwd),
    build_dirty: status === null ? null : status.length > 0,
    build_dirty_paths: status === null ? null : status.split('\n').filter(Boolean).length,
  };
}

export function writeStamp({ cwd = process.cwd(), out = 'build/build-info.json', now = new Date() } = {}) {
  const identity = collectBuildIdentity({ cwd, now });
  const target = resolve(cwd, out);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(identity, null, 2) + '\n');
  return { target, identity };
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^.*?(?=\/scripts\/)/, ''));
if (invokedDirectly || process.argv[1]?.endsWith('stamp.mjs')) {
  const argv = process.argv.slice(2);
  const opt = (flag, fallback) => {
    const i = argv.indexOf(flag);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
  };
  const { target, identity } = writeStamp({
    cwd: opt('--cwd', process.cwd()),
    out: opt('--out', 'build/build-info.json'),
  });
  const dirty = identity.build_dirty === null ? 'unknown' : String(identity.build_dirty);
  console.log(
    `stamped ${target}  sha=${identity.app_build_sha ?? 'unknown'}  branch=${identity.build_branch ?? 'detached/unknown'}  dirty=${dirty}`
  );
  if (identity.build_dirty) {
    console.warn(
      `⚠  DIRTY BUILD — ${identity.build_dirty_paths} uncommitted path(s). ` +
      `Commit ${identity.app_build_sha} does NOT fully describe this artifact.`
    );
  }
}
