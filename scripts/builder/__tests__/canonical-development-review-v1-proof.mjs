#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  deriveDevelopmentReviewPlanV1,
} from '../canonical-development-review-v1.mjs';

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log('PASS', name);
}
function wu() {
  return {
    work_unit_version: 'W0.v2',
    identity: {
      id: 'v2-d6-review-proof',
      programme: 'JARVIS-D6-PROOF',
      parent_work_unit: null,
      objective: 'Build a bounded change.',
      work_class: 'PATCH',
      task_shape: 'CODE_GROUNDED',
      capability: null,
    },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    scope: {
      repository: 'bound-desktop-repository',
      base_ref: 'a'.repeat(40),
      allowed_paths: ['jarvis-desktop', 'scripts/builder'],
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
    version: 'D4-COMMIT.v1',
    status: 'COMMITTED_LOCAL',
    work_unit_id: 'v2-d6-review-proof',
    base_sha: 'a'.repeat(40),
    commit_sha: 'b'.repeat(40),
    branch: 'fix/jarvis-v2-d6-review-proof',
    verified_diff_digest: 'sha256:' + '1'.repeat(64),
    verification_receipt_digest: 'sha256:' + '2'.repeat(64),
    verification_changed_paths: [
      'jarvis-desktop/src/work-unit-control.js',
      'scripts/builder/canonical-development-v1.mjs',
    ],
  };
}

check('D6-P1 local review plan uses only local authority', () => {
  const out = deriveDevelopmentReviewPlanV1({
    developmentWorkUnit: wu(),
    commitRecord: commit(),
    mode: 'local',
  });
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  assert.equal(out.reviews.length, 1);
  const r = out.reviews[0];
  assert.equal(r.review_id, 'local-independent');
  assert.deepEqual(r.expected_families, ['QWEN', 'GPT_OSS']);
  assert.equal(r.spec.requestedPosture, 'default');
  assert.equal(r.spec.taskShape, 'CODE_GROUNDED');
  assert.deepEqual(r.spec.authorityRequest, {
    networkExternal: false,
    providerSpend: false,
    externalDisclosure: 'none',
  });
  assert.equal(out.automatic_provider_execution, false);
});

check('D6-P2 adversarial review asks for exact-bundle Inkling authority but spends nothing itself', () => {
  const out = deriveDevelopmentReviewPlanV1({
    developmentWorkUnit: wu(),
    commitRecord: commit(),
    mode: 'adversarial',
  });
  assert.equal(out.ok, true);
  const r = out.reviews.find((x) => x.review_id === 'inkling-adversarial');
  assert.ok(r);
  assert.deepEqual(r.expected_families, ['QWEN', 'GPT_OSS', 'INKLING']);
  assert.equal(r.spec.requestedPosture, 'adversarial_challenge');
  assert.equal(r.spec.taskShape, 'CODE_GROUNDED');
  assert.deepEqual(r.spec.authorityRequest, {
    networkExternal: true,
    providerSpend: true,
    externalDisclosure: 'exact_bundle',
  });
  assert.equal(out.automatic_network_authorization, false);
  assert.equal(out.automatic_spend_authorization, false);
});

check('D6-P3 frontier review uses evidence synthesis so Nemotron is eligible under existing J5 law', () => {
  const out = deriveDevelopmentReviewPlanV1({
    developmentWorkUnit: wu(),
    commitRecord: commit(),
    mode: 'frontier',
  });
  assert.equal(out.ok, true);
  const r = out.reviews.find((x) => x.review_id === 'nemotron-frontier');
  assert.ok(r);
  assert.deepEqual(r.expected_families, ['GPT_OSS', 'QWEN', 'NEMOTRON']);
  assert.equal(r.spec.taskShape, 'EVIDENCE_SYNTHESIS');
  assert.equal(r.spec.requestedPosture, 'frontier_repository');
  assert.equal(r.spec.authorityRequest.externalDisclosure, 'exact_bundle');
});

check('D6-P4 full mode plans both external families but never merges or deploys', () => {
  const out = deriveDevelopmentReviewPlanV1({
    developmentWorkUnit: wu(),
    commitRecord: commit(),
    mode: 'full',
  });
  assert.equal(out.ok, true);
  assert.deepEqual(out.reviews.map((x) => x.review_id), [
    'local-independent',
    'inkling-adversarial',
    'nemotron-frontier',
  ]);
  assert.equal(out.automatic_merge, false);
  assert.equal(out.automatic_deploy, false);
});

check('D6-P5 review path outside originating development scope is refused', () => {
  const c = commit();
  c.verification_changed_paths.push('scripts/deploy-production.sh');
  const out = deriveDevelopmentReviewPlanV1({
    developmentWorkUnit: wu(),
    commitRecord: c,
    mode: 'local',
  });
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'REVIEW_PATH_OUTSIDE_DEVELOPMENT_SCOPE'));
});

check('D6-P6 mismatched publication commit is refused', () => {
  const out = deriveDevelopmentReviewPlanV1({
    developmentWorkUnit: wu(),
    commitRecord: commit(),
    publicationRecord: {
      version: 'D5.v1',
      status: 'PUBLISHED_FOR_REVIEW',
      commit_sha: 'c'.repeat(40),
      pull_request_url: 'https://github.com/SoullabTech/Sovereign/pull/1',
    },
    mode: 'local',
  });
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'PUBLICATION_COMMIT_MISMATCH'));
});

console.log('');
console.log(passed + ' passed · 0 failed');
