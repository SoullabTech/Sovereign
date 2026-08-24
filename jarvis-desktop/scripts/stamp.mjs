#!/usr/bin/env node
// JARVIS Desktop — build stamp.
//
// Extracted from a package.json `node -e` one-liner (which recorded ONLY
// `app_build_sha`) because a bare SHA is not build identity. A commit SHA does
// not say which checkout produced it, and two worktrees of the same repository
// can sit at different commits with the same history behind them. The stamp
// that shipped JARVIS.app from one worktree while the founder read another
// could not have revealed the mismatch, because it never recorded a worktree.
//
// This writes the BUILD SOURCE identity in full, from the directory packaging
// actually runs in — repository (shared object store), worktree, branch,
// commit, dirty. The running app compares it against the substrate it operates
// and reports the relationship (src/repo-topology.js).
//
// Refuses to stamp a build whose source cannot be identified: an unidentifiable
// build is exactly the artifact this whole discipline exists to prevent.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const require = createRequire(import.meta.url);
const { readTopology } = require(path.join(DESKTOP, 'src', 'repo-topology.js'));

// Packaging runs from the desktop directory, so THAT is the build source —
// not process.cwd(), which npm can set elsewhere, and not the repo root, which
// would erase which checkout of it we are in.
const topo = readTopology(DESKTOP);

if (!topo.git_connected) {
  console.error(
    `stamp REFUSED: cannot identify the build source at ${DESKTOP} — ${topo.read_error || 'not a git worktree'}.\n` +
    `An artifact that cannot name the checkout that produced it must not be packaged.`,
  );
  process.exit(1);
}

const stamp = {
  // Kept under its original name: provenance.js and every prior binding record
  // read `app_build_sha`, and renaming it would silently blank the artifact
  // identity of a build rather than enrich it.
  app_build_sha: topo.commit,
  built_at: new Date().toISOString(),
  // The identities that were missing. Named for what they are, not for "repo".
  build_source_repository: topo.repository,
  build_source_worktree: topo.worktree,
  build_source_branch: topo.branch,
  build_source_commit: topo.commit,
  build_source_dirty: topo.dirty,
  build_source_is_linked_worktree: topo.is_linked_worktree,
  stamp_version: 2,
};

mkdirSync(path.join(DESKTOP, 'build'), { recursive: true });
writeFileSync(path.join(DESKTOP, 'build', 'build-info.json'), JSON.stringify(stamp, null, 2));

console.log(`stamped build/build-info.json`);
console.log(`  build source worktree : ${stamp.build_source_worktree}${stamp.build_source_is_linked_worktree ? ' (linked worktree)' : ''}`);
console.log(`  build source branch   : ${stamp.build_source_branch}`);
console.log(`  build source commit   : ${stamp.build_source_commit}${stamp.build_source_dirty ? ' (DIRTY — uncommitted changes are in this build)' : ''}`);
console.log(`  repository            : ${stamp.build_source_repository}`);

if (stamp.build_source_dirty) {
  // Not fatal: packaging a dirty tree is a legitimate thing to do deliberately.
  // It is announced so it cannot be done accidentally and read as a clean SHA.
  console.log(`\n  NOTE: this build contains uncommitted changes. ${stamp.build_source_commit} does not fully describe it.`);
}
