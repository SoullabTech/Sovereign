#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  PATCH_BEGIN,
  PATCH_END,
  extractDevelopmentProposalV1,
} from '../canonical-development-v1.mjs';
import { applyDevelopmentProposalV1 } from '../canonical-development-apply-v1.mjs';
import {
  deriveDevelopmentVerificationPlanV1,
  verifyDevelopmentWorktreeV1,
  commitDevelopmentWorktreeV1,
} from '../canonical-development-finalize-v1.mjs';

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log('PASS', name);
}
function git(args, cwd) {
  const out = spawnSync('git', args, { cwd, encoding: 'utf8', shell: false });
  assert.equal(out.status, 0, String(out.stderr || out.stdout || 'git failed'));
  return String(out.stdout || '').trim();
}
function fixture(file = 'jarvis-desktop/src/demo.js') {
  const root = mkdtempSync(path.join(os.tmpdir(), 'jarvis-d4-proof-'));
  const repo = path.join(root, 'repo');
  const worktrees = path.join(root, 'worktrees');
  mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
  git(['init'], repo);
  git(['config', 'user.email', 'jarvis-proof@example.invalid'], repo);
  git(['config', 'user.name', 'JARVIS Proof'], repo);
  writeFileSync(path.join(repo, file), 'old\n');
  git(['add', file], repo);
  git(['commit', '-m', 'base'], repo);
  return { root, repo, worktrees, file, sha: git(['rev-parse', 'HEAD'], repo) };
}
function wu(fx) {
  return {
    work_unit_version: 'W0.v2',
    identity: {
      id: 'v2-d4-finalize-proof',
      programme: 'JARVIS-D4-PROOF',
      parent_work_unit: null,
      objective: 'Commit one verified bounded JARVIS change.',
      work_class: 'PATCH',
      task_shape: 'CODE_GROUNDED',
      capability: null,
    },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    scope: {
      repository: 'proof-repository',
      base_ref: fx.sha,
      allowed_paths: [fx.file],
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
}
function patchFor(file, to = 'new') {
  return [
    'diff --git a/' + file + ' b/' + file,
    'index 3367afd..3e75765 100644',
    '--- a/' + file,
    '+++ b/' + file,
    '@@ -1 +1 @@',
    '-old',
    '+' + to,
  ].join('\n');
}
function appliedFixture(file = 'jarvis-desktop/src/demo.js') {
  const fx = fixture(file);
  const workUnit = wu(fx);
  const proposed = extractDevelopmentProposalV1(
    PATCH_BEGIN + '\n' + patchFor(file) + '\n' + PATCH_END,
    [file],
  );
  assert.equal(proposed.ok, true, JSON.stringify(proposed.blockers));
  const apply = applyDevelopmentProposalV1({
    repositoryRoot: fx.repo,
    workUnit,
    proposal: { patch: proposed.patch, digest: proposed.digest },
    workUnitId: workUnit.identity.id,
    worktreesRoot: fx.worktrees,
  });
  assert.equal(apply.ok, true, JSON.stringify(apply.blockers));
  return { fx, workUnit, apply };
}

check('D4-P1 JARVIS path derives Builder + Desktop checks', () => {
  assert.deepEqual(
    deriveDevelopmentVerificationPlanV1(['jarvis-desktop/src/work-unit-control.js']),
    ['jarvis-proof', 'jarvis-desktop'],
  );
});

check('D4-P2 ordinary typed code derives typecheck', () => {
  assert.deepEqual(
    deriveDevelopmentVerificationPlanV1(['lib/example.ts']),
    ['typecheck'],
  );
});

check('D4-P3 database change derives bootstrap', () => {
  assert.deepEqual(
    deriveDevelopmentVerificationPlanV1(['database/migrations/20990101000000_x.sql']),
    ['db-bootstrap'],
  );
});

check('D4-V1 exact applied JARVIS diff produces PASS receipt bound to its digest', () => {
  const x = appliedFixture();
  try {
    const calls = [];
    const receipt = verifyDevelopmentWorktreeV1({
      repositoryRoot: x.fx.repo,
      workUnit: x.workUnit,
      applyRecord: x.apply,
    }, {
      runCheck: (name) => {
        calls.push(name);
        return { check: name, status: 'PASS', exit_code: 0, evidence: { synthetic: true } };
      },
    });
    assert.equal(receipt.ok, true, JSON.stringify(receipt.blockers));
    assert.equal(receipt.status, 'PASS');
    assert.deepEqual(calls, ['jarvis-proof', 'jarvis-desktop']);
    assert.equal(receipt.diff_digest, x.apply.diff_digest);
    assert.match(receipt.receipt_digest, /^sha256:[0-9a-f]{64}$/);
  } finally {
    rmSync(x.fx.root, { recursive: true, force: true });
  }
});

check('D4-V2 failed governed check produces FAIL receipt and cannot commit', () => {
  const x = appliedFixture();
  try {
    const receipt = verifyDevelopmentWorktreeV1({
      repositoryRoot: x.fx.repo,
      workUnit: x.workUnit,
      applyRecord: x.apply,
    }, {
      runCheck: (name) => ({
        check: name,
        status: name === 'jarvis-proof' ? 'FAIL' : 'PASS',
        exit_code: name === 'jarvis-proof' ? 1 : 0,
        evidence: {},
      }),
    });
    assert.equal(receipt.ok, false);
    assert.equal(receipt.status, 'FAIL');

    const commit = commitDevelopmentWorktreeV1({
      workUnit: x.workUnit,
      applyRecord: x.apply,
      verificationReceipt: receipt,
    });
    assert.equal(commit.ok, false);
    assert.equal(commit.blockers[0].code, 'PASS_VERIFICATION_REQUIRED');
    assert.equal(git(['rev-parse', 'HEAD'], x.apply.worktree), x.fx.sha);
  } finally {
    rmSync(x.fx.root, { recursive: true, force: true });
  }
});

check('D4-V3 verification that mutates tracked bytes is refused', () => {
  const x = appliedFixture();
  try {
    let first = true;
    const receipt = verifyDevelopmentWorktreeV1({
      repositoryRoot: x.fx.repo,
      workUnit: x.workUnit,
      applyRecord: x.apply,
    }, {
      runCheck: (name, ctx) => {
        if (first) {
          first = false;
          writeFileSync(path.join(ctx.worktree, x.fx.file), 'mutated-by-test\n');
        }
        return { check: name, status: 'PASS', exit_code: 0, evidence: {} };
      },
    });
    assert.equal(receipt.ok, false);
    assert.equal(receipt.blockers[0].code, 'VERIFICATION_MUTATED_WORKTREE');
  } finally {
    rmSync(x.fx.root, { recursive: true, force: true });
  }
});

check('D4-C1 exact PASS receipt creates local commit and nothing further', () => {
  const x = appliedFixture();
  try {
    const receipt = verifyDevelopmentWorktreeV1({
      repositoryRoot: x.fx.repo,
      workUnit: x.workUnit,
      applyRecord: x.apply,
    }, {
      runCheck: (name) => ({ check: name, status: 'PASS', exit_code: 0, evidence: {} }),
    });
    assert.equal(receipt.ok, true);

    const commit = commitDevelopmentWorktreeV1({
      workUnit: x.workUnit,
      applyRecord: x.apply,
      verificationReceipt: receipt,
    });
    assert.equal(commit.ok, true, JSON.stringify(commit.blockers));
    assert.equal(commit.status, 'COMMITTED_LOCAL');
    assert.match(commit.commit_sha, /^[0-9a-f]{40}$/);
    assert.notEqual(commit.commit_sha, x.fx.sha);
    assert.equal(commit.push_performed, false);
    assert.equal(commit.pull_request_created, false);
    assert.equal(commit.merge_performed, false);
    assert.equal(commit.deploy_performed, false);
    assert.equal(git(['status', '--porcelain'], x.apply.worktree), '');
    assert.equal(readFileSync(path.join(x.fx.repo, x.fx.file), 'utf8'), 'old\n');
  } finally {
    rmSync(x.fx.root, { recursive: true, force: true });
  }
});

check('D4-C2 changed bytes after PASS receipt make verification stale', () => {
  const x = appliedFixture();
  try {
    const receipt = verifyDevelopmentWorktreeV1({
      repositoryRoot: x.fx.repo,
      workUnit: x.workUnit,
      applyRecord: x.apply,
    }, {
      runCheck: (name) => ({ check: name, status: 'PASS', exit_code: 0, evidence: {} }),
    });
    assert.equal(receipt.ok, true);
    writeFileSync(path.join(x.apply.worktree, x.fx.file), 'changed-after-verification\n');

    const commit = commitDevelopmentWorktreeV1({
      workUnit: x.workUnit,
      applyRecord: x.apply,
      verificationReceipt: receipt,
    });
    assert.equal(commit.ok, false);
    assert.equal(commit.blockers[0].code, 'VERIFICATION_STALE');
    assert.equal(git(['rev-parse', 'HEAD'], x.apply.worktree), x.fx.sha);
  } finally {
    rmSync(x.fx.root, { recursive: true, force: true });
  }
});

check('D4-C3 forged receipt digest is refused', () => {
  const x = appliedFixture();
  try {
    const receipt = verifyDevelopmentWorktreeV1({
      repositoryRoot: x.fx.repo,
      workUnit: x.workUnit,
      applyRecord: x.apply,
    }, {
      runCheck: (name) => ({ check: name, status: 'PASS', exit_code: 0, evidence: {} }),
    });
    const forged = { ...receipt, receipt_digest: 'sha256:' + '0'.repeat(64) };
    const commit = commitDevelopmentWorktreeV1({
      workUnit: x.workUnit,
      applyRecord: x.apply,
      verificationReceipt: forged,
    });
    assert.equal(commit.ok, false);
    assert.equal(commit.blockers[0].code, 'VERIFICATION_RECEIPT_DIGEST_MISMATCH');
  } finally {
    rmSync(x.fx.root, { recursive: true, force: true });
  }
});

console.log('');
console.log(passed + ' passed · 0 failed');
