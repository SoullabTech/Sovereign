#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  prepareDevelopmentPublicationV1,
  createDevelopmentPublicationGrantV1,
  validateDevelopmentPublicationGrantV1,
  publishDevelopmentCommitV1,
} from '../canonical-development-publication-v1.mjs';
import {
  issueDevelopmentPublicationGrantV1,
  claimDevelopmentPublicationGrantV1,
  consumeDevelopmentPublicationGrantV1,
  publicationGrantStandingV1,
} from '../canonical-development-publication-grant-store-v1.mjs';

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log('PASS', name);
}
function workUnit() {
  return {
    work_unit_version: 'W0.v2',
    identity: {
      id: 'v2-d5-publication-proof',
      programme: 'JARVIS-D5-PROOF',
      parent_work_unit: null,
      objective: 'Publish one verified JARVIS change for review.',
      work_class: 'PATCH',
      task_shape: 'CODE_GROUNDED',
      capability: null,
    },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    scope: {
      repository: 'bound-desktop-repository',
      base_ref: 'a'.repeat(40),
      allowed_paths: ['jarvis-desktop/src/work-unit-control.js'],
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
function commit() {
  return {
    ok: true,
    version: 'D4-COMMIT.v1',
    status: 'COMMITTED_LOCAL',
    work_unit_id: 'v2-d5-publication-proof',
    base_sha: 'a'.repeat(40),
    branch: 'fix/jarvis-v2-d5-publication-proof',
    worktree: '/tmp/d5-proof-worktree',
    commit_sha: 'b'.repeat(40),
    verified_diff_digest: 'sha256:' + '1'.repeat(64),
    verification_receipt_digest: 'sha256:' + '2'.repeat(64),
    push_performed: false,
    pull_request_created: false,
    merge_performed: false,
    deploy_performed: false,
  };
}
function prepared() {
  const p = prepareDevelopmentPublicationV1({ workUnit: workUnit(), commitRecord: commit() });
  assert.equal(p.ok, true, JSON.stringify(p.blockers));
  return p;
}
function grant() {
  const g = createDevelopmentPublicationGrantV1(prepared(), {
    sequence: 1,
    actor_id: 'human:founder-proof',
    issued_at: '2026-09-21T00:00:00.000Z',
  });
  assert.equal(g.ok, true, JSON.stringify(g.blockers));
  return g.grant;
}

check('D5-P1 exact D4 local commit yields held publication preview', () => {
  const p = prepared();
  assert.equal(p.status, 'HELD_FOR_HUMAN_AUTHORIZATION');
  assert.deepEqual(p.preview.allowed_acts, ['git.push:branch', 'github.pull_request:create']);
  assert.ok(p.preview.forbidden_acts.includes('github.pull_request:merge'));
  assert.ok(p.preview.forbidden_acts.includes('deploy'));
});

check('D5-P2 merge or deploy authority is refused in a publication Work Unit', () => {
  const w = workUnit();
  w.authority.merge = true;
  const p = prepareDevelopmentPublicationV1({ workUnit: w, commitRecord: commit() });
  assert.equal(p.ok, false);
  assert.ok(p.blockers.some((b) => b.code === 'PUBLICATION_AUTHORITY_MUST_NOT_INCLUDE_INTEGRATION'));
});

check('D5-P3 changed commit facts invalidate a one-shot grant', () => {
  const p = prepared();
  const g = grant();
  const changed = prepareDevelopmentPublicationV1({
    workUnit: workUnit(),
    commitRecord: { ...commit(), commit_sha: 'c'.repeat(40) },
  });
  assert.equal(changed.ok, true);
  const v = validateDevelopmentPublicationGrantV1(g, changed);
  assert.equal(v.ok, false);
  assert.ok(v.blockers.some((b) => b.code === 'GRANT_SCOPE_CHANGED'));
});

check('D5-P4 publication grant store is one-shot and append-only in standing', () => {
  const home = mkdtempSync(path.join(os.tmpdir(), 'd5-grant-proof-'));
  try {
    const p = prepared();
    const issued = issueDevelopmentPublicationGrantV1(p, {
      home,
      actor_id: 'human:founder-proof',
      issued_at: '2026-09-21T00:00:00.000Z',
    });
    assert.equal(issued.ok, true);
    assert.equal(issued.standing, 'ACTIVE');
    const duplicate = issueDevelopmentPublicationGrantV1(p, {
      home,
      actor_id: 'human:founder-proof',
      issued_at: '2026-09-21T00:00:01.000Z',
    });
    assert.equal(duplicate.ok, false);
    assert.equal(duplicate.reason, 'UNRESOLVED_PUBLICATION_GRANT_EXISTS');

    const claimed = claimDevelopmentPublicationGrantV1(
      p.preview.work_unit_id,
      issued.grant.grant_id,
      { home, at: '2026-09-21T00:00:02.000Z' },
    );
    assert.equal(claimed.ok, true);
    assert.equal(publicationGrantStandingV1(
      p.preview.work_unit_id,
      issued.grant.grant_id,
      { home },
    ).standing, 'CLAIMED');

    const consumed = consumeDevelopmentPublicationGrantV1(
      p.preview.work_unit_id,
      issued.grant.grant_id,
      { home, at: '2026-09-21T00:00:03.000Z', outcome: 'PUBLISHED_FOR_REVIEW' },
    );
    assert.equal(consumed.ok, true);
    assert.equal(publicationGrantStandingV1(
      p.preview.work_unit_id,
      issued.grant.grant_id,
      { home },
    ).standing, 'CONSUMED');
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

function runnerScenario({
  remoteSha = null,
  existingPr = null,
  pushOk = true,
  createOk = true,
  ghAvailable = true,
  ghAuth = true,
} = {}) {
  const calls = [];
  const commitSha = 'b'.repeat(40);
  const runner = (file, args, _opts) => {
    calls.push([file, ...args]);
    const key = [file, ...args].join(' ');
    const ok = (stdout = '', stderr = '') => ({ status: 0, stdout, stderr });
    const fail = (stderr = 'fail') => ({ status: 1, stdout: '', stderr });

    if (file === 'git' && args[0] === 'rev-parse') return ok(commitSha + '\n');
    if (file === 'git' && args[0] === 'status') return ok('');
    if (file === 'git' && args[0] === 'remote') return ok('https://github.com/SoullabTech/Sovereign.git\n');
    if (file === 'gh' && args[0] === '--version') return ghAvailable ? ok('gh version proof\n') : fail('missing');
    if (file === 'gh' && args[0] === 'auth') return ghAuth ? ok('logged in\n') : fail('auth missing');
    if (file === 'git' && args[0] === 'ls-remote') {
      return ok(remoteSha ? remoteSha + '\trefs/heads/fix/jarvis-v2-d5-publication-proof\n' : '');
    }
    if (file === 'git' && args[0] === 'push') {
      if (!pushOk) return fail('push failed');
      remoteSha = commitSha;
      return ok('done\n');
    }
    if (file === 'gh' && args[0] === 'pr' && args[1] === 'list') {
      return ok(JSON.stringify(existingPr ? [existingPr] : []));
    }
    if (file === 'gh' && args[0] === 'pr' && args[1] === 'create') {
      return createOk ? ok('https://github.com/SoullabTech/Sovereign/pull/999\n') : fail('create failed');
    }
    return fail('unexpected: ' + key);
  };
  return { runner, calls };
}
function publicationInput() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'd5-publish-proof-'));
  const wt = path.join(root, 'worktree');
  mkdirSync(wt, { recursive: true });
  return {
    root,
    args: {
      repositoryRoot: root,
      workUnit: workUnit(),
      commitRecord: { ...commit(), worktree: wt },
      grant: grant(),
    },
  };
}

check('D5-X1 publisher uses exact non-force refspec and creates PR; never merges', () => {
  const x = publicationInput();
  try {
    const sim = runnerScenario();
    const out = publishDevelopmentCommitV1(x.args, { spawnSync: sim.runner });
    assert.equal(out.ok, true, JSON.stringify(out.blockers));
    assert.equal(out.status, 'PUBLISHED_FOR_REVIEW');
    assert.equal(out.push_performed, true);
    assert.equal(out.pull_request_created, true);
    assert.equal(out.pull_request_number, 999);
    assert.equal(out.merge_performed, false);
    assert.equal(out.deploy_performed, false);

    const push = sim.calls.find((c) => c[0] === 'git' && c[1] === 'push');
    assert.ok(push);
    assert.equal(push.includes('--force'), false);
    assert.ok(push.includes('b'.repeat(40) + ':refs/heads/fix/jarvis-v2-d5-publication-proof'));
    assert.equal(sim.calls.some((c) => c[0] === 'gh' && c[1] === 'pr' && c[2] === 'merge'), false);
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});

check('D5-X2 conflicting remote branch is refused and never pushed', () => {
  const x = publicationInput();
  try {
    const sim = runnerScenario({ remoteSha: 'c'.repeat(40) });
    const out = publishDevelopmentCommitV1(x.args, { spawnSync: sim.runner });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'REMOTE_BRANCH_CONFLICT');
    assert.equal(sim.calls.some((c) => c[0] === 'git' && c[1] === 'push'), false);
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});

check('D5-X3 exact remote branch + existing PR is idempotent without repush', () => {
  const x = publicationInput();
  try {
    const sha = 'b'.repeat(40);
    const sim = runnerScenario({
      remoteSha: sha,
      existingPr: {
        number: 123,
        url: 'https://github.com/SoullabTech/Sovereign/pull/123',
        headRefOid: sha,
      },
    });
    const out = publishDevelopmentCommitV1(x.args, { spawnSync: sim.runner });
    assert.equal(out.ok, true);
    assert.equal(out.push_performed, false);
    assert.equal(out.pull_request_created, false);
    assert.equal(out.pull_request_number, 123);
    assert.equal(sim.calls.some((c) => c[0] === 'git' && c[1] === 'push'), false);
    assert.equal(sim.calls.some((c) => c[0] === 'gh' && c[1] === 'pr' && c[2] === 'create'), false);
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});

check('D5-X4 missing gh is refused before any remote branch mutation', () => {
  const x = publicationInput();
  try {
    const sim = runnerScenario({ ghAvailable: false });
    const out = publishDevelopmentCommitV1(x.args, { spawnSync: sim.runner });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'GITHUB_CLI_REQUIRED');
    assert.equal(sim.calls.some((c) => c[0] === 'git' && c[1] === 'push'), false);
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});

console.log('');
console.log(passed + ' passed · 0 failed');
