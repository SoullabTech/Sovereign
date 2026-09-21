#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  prepareDevelopmentDeployV1,
  createDevelopmentDeployGrantV1,
  validateDevelopmentDeployGrantV1,
  deployMergedCanonicalV1,
} from '../canonical-development-deploy-v1.mjs';
import {
  issueDevelopmentDeployGrantV1,
  claimDevelopmentDeployGrantV1,
  consumeDevelopmentDeployGrantV1,
  deploymentGrantStandingV1,
} from '../canonical-development-deploy-grant-store-v1.mjs';

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log('PASS', name);
}
const SHA = 'a'.repeat(40);
function prepared() {
  const p = prepareDevelopmentDeployV1({
    mergeCommitSha: SHA,
    pullRequestNumber: 1426,
    actorId: 'human:founder-proof',
  });
  assert.equal(p.ok, true, JSON.stringify(p.blockers));
  return p;
}
function grant() {
  const g = createDevelopmentDeployGrantV1(prepared(), {
    sequence: 1,
    actor_id: 'human:founder-proof',
    issued_at: '2026-09-21T00:00:00.000Z',
  });
  assert.equal(g.ok, true, JSON.stringify(g.blockers));
  return g.grant;
}

check('D7-P1 deploy preview names exact SHA and only deploy-maia authority', () => {
  const p = prepared();
  assert.equal(p.status, 'HELD_FOR_HUMAN_AUTHORIZATION');
  assert.equal(p.preview.merge_commit_sha, SHA);
  assert.deepEqual(p.preview.allowed_acts, ['deploy.maia:exact_sha']);
  assert.ok(p.preview.forbidden_acts.includes('deploy.head'));
  assert.ok(p.preview.forbidden_acts.includes('production.migrate:auto'));
});

check('D7-P2 grant is invalid if deploy SHA changes after authorization', () => {
  const g = grant();
  const changed = prepareDevelopmentDeployV1({
    mergeCommitSha: 'b'.repeat(40),
    pullRequestNumber: 1426,
    actorId: 'human:founder-proof',
  });
  const v = validateDevelopmentDeployGrantV1(g, changed);
  assert.equal(v.ok, false);
  assert.ok(v.blockers.some((b) => b.code === 'GRANT_SCOPE_CHANGED'));
});

check('D7-P3 append-only deploy grant is claim/consume one-shot', () => {
  const home = mkdtempSync(path.join(os.tmpdir(), 'd7-grant-proof-'));
  try {
    const p = prepared();
    const issued = issueDevelopmentDeployGrantV1(p, {
      home,
      actor_id: 'human:founder-proof',
      issued_at: '2026-09-21T00:00:00.000Z',
    });
    assert.equal(issued.ok, true);
    const duplicate = issueDevelopmentDeployGrantV1(p, {
      home,
      actor_id: 'human:founder-proof',
      issued_at: '2026-09-21T00:00:01.000Z',
    });
    assert.equal(duplicate.ok, false);
    assert.equal(duplicate.reason, 'UNRESOLVED_DEPLOY_GRANT_EXISTS');

    const claimed = claimDevelopmentDeployGrantV1(
      issued.deploy_identity,
      issued.grant.grant_id,
      { home, at: '2026-09-21T00:00:02.000Z' },
    );
    assert.equal(claimed.ok, true);
    assert.equal(deploymentGrantStandingV1(
      issued.deploy_identity,
      issued.grant.grant_id,
      { home },
    ).standing, 'CLAIMED');

    const consumed = consumeDevelopmentDeployGrantV1(
      issued.deploy_identity,
      issued.grant.grant_id,
      { home, at: '2026-09-21T00:00:03.000Z', outcome: 'DEPLOYED' },
    );
    assert.equal(consumed.ok, true);
    assert.equal(deploymentGrantStandingV1(
      issued.deploy_identity,
      issued.grant.grant_id,
      { home },
    ).standing, 'CONSUMED');
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'd7-deploy-proof-'));
  mkdirSync(path.join(root, 'scripts'), { recursive: true });
  writeFileSync(path.join(root, 'scripts', 'pre-deploy-gate.sh'), '#!/bin/bash\nexit 0\n');
  return root;
}
function scenario({
  prState = 'MERGED',
  mergedAt = '2026-09-21T00:00:00Z',
  mergeSha = SHA,
  base = 'clean-main-no-secrets',
  canonicalTip = SHA,
  deployExit = 0,
} = {}) {
  const calls = [];
  const runner = (file, args, _opts) => {
    calls.push([file, ...args]);
    const ok = (stdout = '', stderr = '') => ({ status: 0, stdout, stderr });
    const fail = (stderr = 'fail', code = 1) => ({ status: code, stdout: '', stderr });
    if (file === 'gh' && args[0] === '--version') return ok('gh proof\n');
    if (file === 'gh' && args[0] === 'auth') return ok('logged in\n');
    if (file === 'gh' && args[0] === 'pr' && args[1] === 'view') {
      return ok(JSON.stringify({
        state: prState,
        mergedAt,
        mergeCommit: mergeSha ? { oid: mergeSha } : null,
        baseRefName: base,
      }));
    }
    if (file === 'git' && args[0] === 'fetch') return ok('');
    if (file === 'git' && args[0] === 'rev-parse') return ok(canonicalTip + '\n');
    if (file === '/bin/bash' && args[1]?.endsWith('pre-deploy-gate.sh')) {
      return deployExit === 0 ? ok('deployed\n') : fail('deploy failed', deployExit);
    }
    return fail('unexpected call: ' + [file, ...args].join(' '));
  };
  return { runner, calls };
}

check('D7-X1 exact merged current canonical SHA invokes only pre-deploy deploy-maia', () => {
  const root = fixture();
  try {
    const sim = scenario();
    const out = deployMergedCanonicalV1({
      repositoryRoot: root,
      prepared: prepared(),
      grant: grant(),
    }, { spawnSync: sim.runner });
    assert.equal(out.ok, true, JSON.stringify(out.blockers));
    assert.equal(out.status, 'DEPLOYED');
    assert.equal(out.merge_commit_sha, SHA);
    assert.equal(out.automatic_rollback, false);
    assert.equal(out.migration_performed_by_d7, false);
    const deploy = sim.calls.find((c) => c[0] === '/bin/bash');
    assert.ok(deploy);
    assert.deepEqual(deploy.slice(-2), ['deploy-maia', SHA]);
    assert.equal(sim.calls.some((c) => c.includes('deploy-production.sh')), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

check('D7-X2 unmerged or mismatched PR refuses before deploy lane', () => {
  const root = fixture();
  try {
    const sim = scenario({ prState: 'OPEN', mergedAt: null });
    const out = deployMergedCanonicalV1({
      repositoryRoot: root,
      prepared: prepared(),
      grant: grant(),
    }, { spawnSync: sim.runner });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'MERGED_PR_IDENTITY_MISMATCH');
    assert.equal(sim.calls.some((c) => c[0] === '/bin/bash'), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

check('D7-X3 canonical tip advancing after authorization makes grant stale', () => {
  const root = fixture();
  try {
    const sim = scenario({ canonicalTip: 'b'.repeat(40) });
    const out = deployMergedCanonicalV1({
      repositoryRoot: root,
      prepared: prepared(),
      grant: grant(),
    }, { spawnSync: sim.runner });
    assert.equal(out.ok, false);
    assert.equal(out.blockers[0].code, 'DEPLOY_GRANT_STALE');
    assert.equal(sim.calls.some((c) => c[0] === '/bin/bash'), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

check('D7-X4 governed deploy-lane nonzero result remains failure; no automatic rollback', () => {
  const root = fixture();
  try {
    const sim = scenario({ deployExit: 9 });
    const out = deployMergedCanonicalV1({
      repositoryRoot: root,
      prepared: prepared(),
      grant: grant(),
    }, { spawnSync: sim.runner });
    assert.equal(out.ok, false);
    assert.equal(out.status, 'DEPLOY_FAILED');
    assert.equal(out.exit_code, 9);
    assert.equal(out.automatic_rollback, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

console.log('');
console.log(passed + ' passed · 0 failed');
