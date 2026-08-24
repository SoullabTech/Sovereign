// BUILD-STAMP-PROVENANCE
//
// THE RULE: a running artifact may claim its source identity only from
// information bound at BUILD time. Not from the current checkout. Not from
// `git HEAD` at launch. Not from the directory a developer happens to stand in.
//
// THE OBSERVED FAILURE CLASS: jarvis-reconcile moved from 84f38f89d to later
// documentation commits while the installed app correctly remained 84f38f89d.
// The artifact was right. What was missing was the machinery to SAY so — to
// hold the historical identity, read the current one separately, and label the
// difference instead of quietly rewriting provenance to whatever git says now.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const PROV = require('../src/provenance.js');
const HERE = fileURLToPath(new URL('.', import.meta.url));
const STAMP = join(HERE, '..', 'scripts', 'stamp.mjs');
const { collectBuildIdentity, writeStamp } = await import(`file://${STAMP}`);

function lab() {
  const dir = mkdtempSync(join(tmpdir(), 'jop06.'));
  const git = (...args) =>
    execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 't@t.t');
  git('config', 'user.name', 'T');
  git('config', 'commit.gpgsign', 'false');
  const commit = (name, body) => {
    writeFileSync(join(dir, name), body);
    git('add', '-A');
    git('commit', '-q', '-m', name);
    return git('rev-parse', 'HEAD');
  };
  return { dir, git, commit, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

// The artifact side of the runtime: a packaged process reading its own stamp.
const asPackagedArtifact = (stamp) => PROV.artifactIdentity({ buildInfo: stamp, isPackaged: true });

// The full runtime view: historical artifact identity + current checkout, related.
const runtimeView = (stamp, { root, head, dirty, commonDir }) =>
  PROV.describeProvenance({
    buildInfo: stamp, isPackaged: true,
    repoRoot: root, resolution: PROV.RESOLUTION.CONFIG,
    head, dirty, commonDir,
  });

describe('DECISIVE PROOF — the source moves, the artifact does not', () => {
  test('an artifact stamped at A still reports A after the checkout advances to B', () => {
    const L = lab();
    try {
      // 1. build/stamp the artifact at commit A
      const A = L.commit('a.txt', 'first');
      const { identity: stamp } = writeStamp({ cwd: L.dir, out: 'build/build-info.json' });
      assert.equal(stamp.build_commit, A, 'the stamp binds the commit it was built from');
      assert.equal(stamp.build_dirty, false);

      // the stamp is now a FILE — the artifact carries it and nothing rewrites it
      const shipped = JSON.parse(readFileSync(join(L.dir, 'build/build-info.json'), 'utf8'));

      // 2. advance the build-source checkout to B WITHOUT repackaging
      const B = L.commit('b.txt', 'second');
      assert.notEqual(A, B);

      // 3-4. the packaged artifact still reports A
      const artifact = asPackagedArtifact(shipped);
      assert.equal(artifact.state, 'AVAILABLE');
      assert.ok(A.startsWith(artifact.app_build_sha), `artifact says ${artifact.app_build_sha}, must still be A`);
      assert.equal(shipped.build_commit, A);

      // 5. the checkout, read now, reports B — separately
      const currentHead = L.git('rev-parse', '--short', 'HEAD');
      assert.ok(B.startsWith(currentHead));

      // 6. the difference is LABELLED, not resolved by rewriting provenance
      const view = runtimeView(shipped, {
        root: L.dir, head: currentHead, dirty: false,
        commonDir: L.git('rev-parse', '--path-format=absolute', '--git-common-dir'),
      });
      assert.equal(view.relation.state, PROV.RELATION.COMMIT_DIVERGED);
      assert.equal(view.relation.facts.build_commit, A);
      assert.ok(B.startsWith(view.relation.facts.operated_commit));
      // the operand was not edited by the comparison
      assert.equal(view.artifact.app_build_sha, artifact.app_build_sha);
      assert.match(view.relation.detail, /the source moved/);
    } finally { L.cleanup(); }
  });

  test('re-reading git at launch never becomes the artifact identity', () => {
    const L = lab();
    try {
      const A = L.commit('a.txt', 'first');
      const { identity: stamp } = writeStamp({ cwd: L.dir });
      L.commit('b.txt', 'second');

      // Whatever the checkout says now, the artifact's answer is unchanged.
      const before = asPackagedArtifact(stamp).app_build_sha;
      L.commit('c.txt', 'third');
      const after = asPackagedArtifact(stamp).app_build_sha;

      assert.equal(before, after);
      assert.ok(A.startsWith(after), 'artifact identity is historical, not current');
    } finally { L.cleanup(); }
  });
});

describe('NEGATIVE CONTROLS', () => {
  test('missing stamp -> UNKNOWN, never inferred from the checkout', () => {
    const artifact = asPackagedArtifact(null);
    assert.equal(artifact.state, 'DEGRADED');
    assert.equal(artifact.app_build_sha, null, 'absence must not be filled in');

    const view = runtimeView(null, { root: '/r', head: 'deadbee', dirty: false, commonDir: '/r/.git' });
    assert.equal(view.relation.state, PROV.RELATION.UNKNOWN);
    // the checkout's sha is RIGHT THERE and must not be adopted
    assert.equal(view.artifact.app_build_sha, null);
    assert.notEqual(view.relation.state, PROV.RELATION.ALIGNED);
  });

  test('malformed stamp fails closed — it cannot produce a build identity', () => {
    for (const junk of [{ __stamp_malformed: true }, {}, { app_build_sha: '' }, { app_build_sha: 42 }, { built_at: 'x' }]) {
      const artifact = asPackagedArtifact(junk);
      assert.equal(artifact.state, 'DEGRADED', `${JSON.stringify(junk)} must not be AVAILABLE`);
      assert.equal(artifact.app_build_sha, null);
      const view = runtimeView(junk, { root: '/r', head: 'deadbee', dirty: false, commonDir: '/r/.git' });
      assert.equal(view.relation.state, PROV.RELATION.UNKNOWN);
    }
  });

  test('a dirty build records dirty state, and is not presented as equal to HEAD', () => {
    const L = lab();
    try {
      const A = L.commit('a.txt', 'first');
      writeFileSync(join(L.dir, 'a.txt'), 'edited but not committed');
      const stamp = collectBuildIdentity({ cwd: L.dir });

      assert.equal(stamp.build_dirty, true);
      assert.equal(stamp.build_dirty_paths, 1);
      assert.equal(stamp.build_commit, A, 'the commit is still recorded');

      // Commit matches on both sides, yet the relation refuses to say ALIGNED.
      const view = runtimeView(stamp, {
        root: L.dir, head: L.git('rev-parse', '--short', 'HEAD'), dirty: true,
        commonDir: L.git('rev-parse', '--path-format=absolute', '--git-common-dir'),
      });
      assert.equal(view.relation.state, PROV.RELATION.WORKTREE_DIRTY);
      assert.match(view.relation.detail, /does not fully describe/);
    } finally { L.cleanup(); }
  });

  test('an operated repository different from the build repository stays visible', () => {
    const A = lab(), B = lab();
    try {
      A.commit('a.txt', 'first');
      const stamp = collectBuildIdentity({ cwd: A.dir });
      B.commit('a.txt', 'first');   // same path, same content, DIFFERENT repository

      const view = runtimeView(stamp, {
        root: B.dir,
        head: stamp.app_build_sha,   // even if the shas were identical...
        dirty: false,
        commonDir: B.git('rev-parse', '--path-format=absolute', '--git-common-dir'),
      });
      assert.equal(view.relation.state, PROV.RELATION.BUILD_SOURCE_MOVED);
      assert.match(view.relation.detail, /different local git object store/);
    } finally { A.cleanup(); B.cleanup(); }
  });

  test('a worktree path alone never establishes repository identity', () => {
    // Same path string on both sides, but neither names a common dir: the
    // comparison must decline to assert repo identity rather than infer it.
    const view = runtimeView(
      { app_build_sha: 'aaaa111', build_commit: 'aaaa111', build_dirty: false },
      { root: '/same/path', head: 'aaaa111', dirty: false, commonDir: null },
    );
    assert.equal(view.relation.facts.repo_matches, null, 'unknown, not true');
    assert.notEqual(view.relation.state, PROV.RELATION.BUILD_SOURCE_MOVED);

    // And identical paths belonging to different repositories are caught.
    const moved = runtimeView(
      { app_build_sha: 'aaaa111', build_commit: 'aaaa111', build_repo_common_dir: '/repo-one/.git', build_dirty: false },
      { root: '/same/path', head: 'aaaa111', dirty: false, commonDir: '/repo-two/.git' },
    );
    assert.equal(moved.relation.state, PROV.RELATION.BUILD_SOURCE_MOVED);
  });

  test('build identity and operated identity are never collapsed', () => {
    const view = runtimeView(
      { app_build_sha: 'aaaa111', build_commit: 'aaaa111', build_repo_common_dir: '/r/.git', build_dirty: false },
      { root: '/r', head: 'bbbb222', dirty: false, commonDir: '/r/.git' },
    );
    assert.equal(view.identities_distinct, true);
    assert.equal(view.artifact.app_build_sha, 'aaaa111');
    assert.equal(view.substrate.resolved_repo_head, 'bbbb222');
    assert.notEqual(view.artifact.app_build_sha, view.substrate.resolved_repo_head);
  });
});

describe('PROVENANCE APERTURE — the limit is stated, not silently carried', () => {
  test('BUILD_SOURCE_MOVED never claims to be a lineage comparison', () => {
    const moved = runtimeView(
      { app_build_sha: 'aaaa111', build_commit: 'aaaa111', build_repo_common_dir: '/repo-one/.git', build_dirty: false },
      { root: '/p', head: 'aaaa111', dirty: false, commonDir: '/repo-two/.git' },
    );
    // Two clones of one upstream also read as moved. The rendered sentence must
    // say so, or a reader will take this state for a lineage claim it cannot make.
    assert.match(moved.relation.detail, /local git object store/);
    assert.match(moved.relation.detail, /not repository lineage/);
  });

  test('the aperture is documented at the comparison itself', () => {
    // Structural: the caveat must survive in the source a maintainer reads.
    // If someone widens this state's meaning, they have to delete this first.
    const src = readFileSync(join(HERE, '..', 'src', 'provenance.js'), 'utf8');
    assert.match(src, /PROVENANCE APERTURE/);
    assert.match(src, /LOCAL repository-INSTANCE identity/);
    assert.match(src, /lineage identity = NOT YET REPRESENTED/i);
  });
});

describe('THE STAMP ITSELF', () => {
  test('captures every required build-identity field', () => {
    const L = lab();
    try {
      L.commit('a.txt', 'first');
      const s = collectBuildIdentity({ cwd: L.dir });
      for (const field of [
        'build_repo_common_dir', 'build_worktree', 'build_branch',
        'build_commit', 'app_build_sha', 'build_dirty', 'built_at',
      ]) assert.ok(s[field] !== undefined && s[field] !== null, `${field} must be captured`);
      assert.equal(s.build_branch, 'main');
      assert.equal(s.stamp_version, 2);
      // the two original fields keep their names, so existing readers still work
      assert.equal(typeof s.app_build_sha, 'string');
      assert.equal(typeof s.built_at, 'string');
    } finally { L.cleanup(); }
  });

  test('unknown means null — a detached HEAD is not renamed to a branch', () => {
    const L = lab();
    try {
      const A = L.commit('a.txt', 'first');
      L.commit('b.txt', 'second');
      L.git('checkout', '-q', A);
      const s = collectBuildIdentity({ cwd: L.dir });
      assert.equal(s.build_branch, null, 'detached HEAD has no branch, and is not given one');
      assert.equal(s.build_commit, A);
    } finally { L.cleanup(); }
  });

  test('outside a repository, nothing is invented', () => {
    const dir = mkdtempSync(join(tmpdir(), 'jop06-norepo.'));
    try {
      const s = collectBuildIdentity({ cwd: dir });
      assert.equal(s.app_build_sha, null);
      assert.equal(s.build_commit, null);
      assert.equal(s.build_dirty, null, 'unreadable dirty state is unknown, never false');
      assert.equal(s.build_repo_common_dir, null);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test('the packaged artifact receives the stamp as an extraResource', () => {
    const pkg = JSON.parse(readFileSync(join(HERE, '..', 'package.json'), 'utf8'));
    const res = pkg.build.extraResources.find((r) => r.to === 'build-info.json');
    assert.ok(res, 'the stamp must be shipped into the artifact');
    assert.equal(res.from, 'build/build-info.json');
    // ...and it must NOT be inside `files`, or a dev tree could pick it up.
    assert.ok(!JSON.stringify(pkg.build.files).includes('build-info'));
    assert.match(pkg.scripts.stamp, /scripts\/stamp\.mjs/, 'one stamp producer, not an inline second format');
    assert.match(pkg.scripts.pack, /npm run stamp/, 'packaging always stamps');
  });
});
