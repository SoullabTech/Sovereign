#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  PATCH_BEGIN,
  PATCH_END,
  extractDevelopmentProposalV1,
  developmentBranchNameV1,
} from '../canonical-development-v1.mjs';
import { applyDevelopmentProposalV1 } from '../canonical-development-apply-v1.mjs';

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log('PASS', name);
}
function git(args, cwd, opts = {}) {
  const out = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    input: opts.input,
    shell: false,
  });
  if (opts.allowFail) return out;
  assert.equal(out.status, 0, String(out.stderr || out.stdout || 'git failed'));
  return String(out.stdout || '').trim();
}
function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'jarvis-d3-proof-'));
  const repo = path.join(root, 'repo');
  const worktrees = path.join(root, 'worktrees');
  mkdirSync(repo, { recursive: true });
  git(['init'], repo);
  git(['config', 'user.email', 'jarvis-proof@example.invalid'], repo);
  git(['config', 'user.name', 'JARVIS Proof'], repo);
  mkdirSync(path.join(repo, 'src'), { recursive: true });
  writeFileSync(path.join(repo, 'src', 'a.txt'), 'old\n');
  git(['add', 'src/a.txt'], repo);
  git(['commit', '-m', 'base'], repo);
  const sha = git(['rev-parse', 'HEAD'], repo);
  return { root, repo, worktrees, sha };
}
function wu(sha, patch = {}) {
  const base = {
    work_unit_version: 'W0.v2',
    identity: {
      id: 'v2-d3-physical-apply-proof',
      programme: 'JARVIS-D3-PROOF',
      parent_work_unit: null,
      objective: 'Apply one bounded proposal without committing it.',
      work_class: 'PATCH',
      task_shape: 'CODE_GROUNDED',
      capability: null,
    },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    scope: {
      repository: 'proof-repository',
      base_ref: sha,
      allowed_paths: ['src/a.txt'],
      forbidden_paths: [],
    },
    authority: {
      repository_read: true,
      repository_write: 'worktree',
      shell: 'none',
      network_external: false,
      provider_spend: false,
      external_disclosure: 'none',
      merge: false,
      deploy: false,
      production_read: false,
      production_write: false,
    },
  };
  return {
    ...base,
    ...patch,
    identity: { ...base.identity, ...(patch.identity || {}) },
    scope: { ...base.scope, ...(patch.scope || {}) },
    authority: { ...base.authority, ...(patch.authority || {}) },
  };
}
function proposal(patch, allowed) {
  const out = extractDevelopmentProposalV1(
    PATCH_BEGIN + '\n' + patch + '\n' + PATCH_END,
    allowed,
  );
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  return { patch: out.patch, digest: out.digest };
}
function replacePatch(file = 'src/a.txt', from = 'old', to = 'new') {
  return [
    'diff --git a/' + file + ' b/' + file,
    'index 3367afd..3e75765 100644',
    '--- a/' + file,
    '+++ b/' + file,
    '@@ -1 +1 @@',
    '-' + from,
    '+' + to,
  ].join('\n');
}

check('D3-A1 valid proposal creates isolated branch/worktree and stops uncommitted', () => {
  const fx = fixture();
  try {
    const workUnit = wu(fx.sha);
    const p = proposal(replacePatch(), workUnit.scope.allowed_paths);
    const out = applyDevelopmentProposalV1({
      repositoryRoot: fx.repo,
      workUnit,
      proposal: p,
      workUnitId: workUnit.identity.id,
      worktreesRoot: fx.worktrees,
    });
    assert.equal(out.ok, true, JSON.stringify(out.blockers));
    assert.equal(out.status, 'APPLIED_UNCOMMITTED');
    assert.equal(out.head_sha, fx.sha);
    assert.equal(out.commit_created, false);
    assert.equal(out.merge_performed, false);
    assert.equal(out.deploy_performed, false);
    assert.deepEqual(out.changed_paths, ['src/a.txt']);
    assert.match(out.diff_digest, /^sha256:[0-9a-f]{64}$/);
    assert.equal(readFileSync(path.join(out.worktree, 'src/a.txt'), 'utf8'), 'new\n');
    assert.equal(readFileSync(path.join(fx.repo, 'src/a.txt'), 'utf8'), 'old\n');
    assert.equal(git(['rev-parse', 'HEAD'], out.worktree), fx.sha);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

check('D3-A2 proposal digest mismatch is refused before worktree creation', () => {
  const fx = fixture();
  try {
    const workUnit = wu(fx.sha);
    const p = proposal(replacePatch(), workUnit.scope.allowed_paths);
    const out = applyDevelopmentProposalV1({
      repositoryRoot: fx.repo,
      workUnit,
      proposal: { ...p, digest: 'sha256:' + '0'.repeat(64) },
      workUnitId: workUnit.identity.id,
      worktreesRoot: fx.worktrees,
    });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'PROPOSAL_DIGEST_MISMATCH');
    assert.equal(existsSync(fx.worktrees), false);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

check('D3-A3 existing branch is refused rather than reused', () => {
  const fx = fixture();
  try {
    const workUnit = wu(fx.sha);
    const branch = developmentBranchNameV1(workUnit);
    git(['branch', branch, fx.sha], fx.repo);
    const p = proposal(replacePatch(), workUnit.scope.allowed_paths);
    const out = applyDevelopmentProposalV1({
      repositoryRoot: fx.repo,
      workUnit,
      proposal: p,
      workUnitId: workUnit.identity.id,
      worktreesRoot: fx.worktrees,
    });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'DEVELOPMENT_BRANCH_EXISTS');
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

check('D3-A4 existing worktree path is refused rather than reused', () => {
  const fx = fixture();
  try {
    const workUnit = wu(fx.sha);
    mkdirSync(path.join(fx.worktrees, 'ain-' + workUnit.identity.id), { recursive: true });
    const p = proposal(replacePatch(), workUnit.scope.allowed_paths);
    const out = applyDevelopmentProposalV1({
      repositoryRoot: fx.repo,
      workUnit,
      proposal: p,
      workUnitId: workUnit.identity.id,
      worktreesRoot: fx.worktrees,
    });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'DEVELOPMENT_WORKTREE_EXISTS');
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

check('D3-A5 patch that no longer applies is refused and cleaned up', () => {
  const fx = fixture();
  try {
    const workUnit = wu(fx.sha);
    const p = proposal(replacePatch('src/a.txt', 'not-present', 'new'), workUnit.scope.allowed_paths);
    const out = applyDevelopmentProposalV1({
      repositoryRoot: fx.repo,
      workUnit,
      proposal: p,
      workUnitId: workUnit.identity.id,
      worktreesRoot: fx.worktrees,
    });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'PATCH_APPLY_CHECK_FAILED');
    assert.equal(existsSync(path.join(fx.worktrees, 'ain-' + workUnit.identity.id)), false);
    assert.equal(
      git(['show-ref', '--verify', '--quiet', 'refs/heads/' + developmentBranchNameV1(workUnit)], fx.repo, { allowFail: true }).status,
      1,
    );
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

check('D3-A6 whitespace defect is refused after application and cleaned up', () => {
  const fx = fixture();
  try {
    const workUnit = wu(fx.sha);
    const p = proposal(replacePatch('src/a.txt', 'old', 'new   '), workUnit.scope.allowed_paths);
    const out = applyDevelopmentProposalV1({
      repositoryRoot: fx.repo,
      workUnit,
      proposal: p,
      workUnitId: workUnit.identity.id,
      worktreesRoot: fx.worktrees,
    });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'DIFF_CHECK_FAILED');
    assert.equal(existsSync(path.join(fx.worktrees, 'ain-' + workUnit.identity.id)), false);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

check('D3-A7 new symlink is refused even when its path is authorized', () => {
  const fx = fixture();
  try {
    const workUnit = wu(fx.sha, { scope: { allowed_paths: ['src'] } });
    const patch = [
      'diff --git a/src/link b/src/link',
      'new file mode 120000',
      'index 0000000..7fc5627',
      '--- /dev/null',
      '+++ b/src/link',
      '@@ -0,0 +1 @@',
      '+../outside',
    ].join('\n');
    const p = proposal(patch, workUnit.scope.allowed_paths);
    const out = applyDevelopmentProposalV1({
      repositoryRoot: fx.repo,
      workUnit,
      proposal: p,
      workUnitId: workUnit.identity.id,
      worktreesRoot: fx.worktrees,
    });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'SYMLINK_CHANGE_REFUSED');
    assert.equal(existsSync(path.join(fx.worktrees, 'ain-' + workUnit.identity.id)), false);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

check('D3-A8 work unit id mismatch is refused before git mutation', () => {
  const fx = fixture();
  try {
    const workUnit = wu(fx.sha);
    const p = proposal(replacePatch(), workUnit.scope.allowed_paths);
    const out = applyDevelopmentProposalV1({
      repositoryRoot: fx.repo,
      workUnit,
      proposal: p,
      workUnitId: 'v2-different-unit',
      worktreesRoot: fx.worktrees,
    });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'WORK_UNIT_ID_MISMATCH');
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

console.log('');
console.log(passed + ' passed · 0 failed');
