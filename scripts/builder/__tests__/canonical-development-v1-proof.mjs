#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  PATCH_BEGIN,
  PATCH_END,
  MAX_PATCH_BYTES,
  classifyDevelopmentWorkUnitV1,
  developmentProviderPermissionEnvelopeV1,
  developmentPromptV1,
  extractDevelopmentProposalV1,
  analyzeDevelopmentPatchV1,
  isDevelopmentPathAllowedV1,
  developmentBranchNameV1,
} from '../canonical-development-v1.mjs';

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log('PASS', name);
}

function wu(patch = {}) {
  const base = {
    work_unit_version: 'W0.v2',
    identity: {
      id: 'v2-fix-canonical-development-proof',
      programme: 'JARVIS-PROOF',
      parent_work_unit: null,
      objective: 'Repair one bounded JARVIS seam.',
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
  return {
    ...base,
    ...patch,
    identity: { ...base.identity, ...(patch.identity || {}) },
    custody: { ...base.custody, ...(patch.custody || {}) },
    scope: { ...base.scope, ...(patch.scope || {}) },
    authority: { ...base.authority, ...(patch.authority || {}) },
  };
}

const validPatch = [
  'diff --git a/jarvis-desktop/src/work-unit-control.js b/jarvis-desktop/src/work-unit-control.js',
  '--- a/jarvis-desktop/src/work-unit-control.js',
  '+++ b/jarvis-desktop/src/work-unit-control.js',
  '@@ -1,1 +1,1 @@',
  '-old',
  '+new',
].join('\n');

check('D1-A1 valid PATCH Work Unit is development-admissible', () => {
  const out = classifyDevelopmentWorkUnitV1(wu());
  assert.equal(out.ok, true);
  assert.equal(out.control_plane_write_scope, 'worktree');
});

check('D1-A2 read-only Work Unit is refused as development', () => {
  const out = classifyDevelopmentWorkUnitV1(wu({ authority: { repository_write: 'none' } }));
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'WORKTREE_WRITE_REQUIRED'));
});

check('D1-A3 research class is refused', () => {
  const out = classifyDevelopmentWorkUnitV1(wu({ identity: { work_class: 'RESEARCH' } }));
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'DEVELOPMENT_WORK_CLASS_REQUIRED'));
});

check('D1-A4 non-code task shape is refused', () => {
  const out = classifyDevelopmentWorkUnitV1(wu({ identity: { task_shape: 'ARCHITECTURE_REASONING' } }));
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'CODE_GROUNDED_REQUIRED'));
});

check('D1-A5 nonlocal evidence custody is refused', () => {
  const out = classifyDevelopmentWorkUnitV1(wu({ custody: { evidence_class: 'E3_EXTERNAL_REPO_BUNDLE' } }));
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'LOCAL_REPOSITORY_EVIDENCE_REQUIRED'));
});

check('D1-A6 model shell authority is refused', () => {
  const out = classifyDevelopmentWorkUnitV1(wu({ authority: { shell: 'bounded_write' } }));
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'MODEL_SHELL_FORBIDDEN'));
});

check('D1-A7 merge authority is not smuggled with development', () => {
  const out = classifyDevelopmentWorkUnitV1(wu({ authority: { merge: true } }));
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'MERGE_AUTHORITY_FORBIDDEN'));
});

check('D1-A8 deploy authority is not smuggled with development', () => {
  const out = classifyDevelopmentWorkUnitV1(wu({ authority: { deploy: true } }));
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'DEPLOY_AUTHORITY_FORBIDDEN'));
});

check('D1-A9 production authority is not smuggled with development', () => {
  const out = classifyDevelopmentWorkUnitV1(wu({ authority: { production_read: true } }));
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'PRODUCTION_AUTHORITY_FORBIDDEN'));
});

check('D1-A10 development requires bounded allowed paths', () => {
  const out = classifyDevelopmentWorkUnitV1(wu({ scope: { allowed_paths: [] } }));
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'BOUNDED_ALLOWED_PATHS_REQUIRED'));
});

check('D1-A11 provider projection remains read-only despite Work Unit write authority', () => {
  const out = developmentProviderPermissionEnvelopeV1(wu());
  assert.equal(out.ok, true);
  assert.equal(out.permission_envelope.repo_write_scope, 'none');
  assert.equal(out.permission_envelope.repo_read, true);
  assert.equal(out.permission_envelope.deploy, false);
});

check('D1-A12 development prompt names proposal-only boundary', () => {
  const out = developmentPromptV1(wu(), ['jarvis-desktop/src/work-unit-control.js']);
  assert.equal(out.ok, true);
  assert.match(out.prompt, /READ-ONLY model/);
  assert.match(out.prompt, /JARVIS decides whether to apply it/);
  assert.match(out.prompt, new RegExp(PATCH_BEGIN));
  assert.match(out.prompt, new RegExp(PATCH_END));
});

check('D1-P1 exact authorized file patch is admitted', () => {
  const out = analyzeDevelopmentPatchV1(validPatch, ['jarvis-desktop/src/work-unit-control.js']);
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  assert.deepEqual(out.paths, ['jarvis-desktop/src/work-unit-control.js']);
  assert.match(out.digest, /^sha256:[0-9a-f]{64}$/);
});

check('D1-P2 authorized directory admits descendant file', () => {
  const out = analyzeDevelopmentPatchV1(validPatch, ['jarvis-desktop']);
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
});

check('D1-P3 sibling-prefix path does not escape directory authority', () => {
  assert.equal(
    isDevelopmentPathAllowedV1('jarvis-desktop-evil/x.js', ['jarvis-desktop']),
    false,
  );
});

check('D1-P4 out-of-scope patch is killed', () => {
  const out = analyzeDevelopmentPatchV1(
    validPatch.replaceAll('jarvis-desktop/src/work-unit-control.js', 'scripts/deploy-production.sh'),
    ['jarvis-desktop'],
  );
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'PATCH_PATH_OUTSIDE_AUTHORIZED_SCOPE'));
});

check('D1-P5 path traversal patch is killed', () => {
  const patch = validPatch.replaceAll(
    'jarvis-desktop/src/work-unit-control.js',
    '../secrets.txt',
  );
  const out = analyzeDevelopmentPatchV1(patch, ['jarvis-desktop']);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'UNSAFE_PATCH_PATH'));
});

check('D1-P6 binary patch is killed', () => {
  const out = analyzeDevelopmentPatchV1(validPatch + '\nGIT binary patch\nliteral 0\n', ['jarvis-desktop']);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'UNSUPPORTED_PATCH_OPERATION'));
});

check('D1-P7 rename patch is killed', () => {
  const out = analyzeDevelopmentPatchV1(validPatch + '\nrename from a\nrename to b\n', ['jarvis-desktop']);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'UNSUPPORTED_PATCH_OPERATION'));
});

check('D1-P8 mismatched a/b path identity is killed', () => {
  const patch = validPatch.replace(
    'diff --git a/jarvis-desktop/src/work-unit-control.js b/jarvis-desktop/src/work-unit-control.js',
    'diff --git a/jarvis-desktop/src/work-unit-control.js b/jarvis-desktop/src/other.js',
  );
  const out = analyzeDevelopmentPatchV1(patch, ['jarvis-desktop']);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'PATCH_PATH_IDENTITY_REQUIRED'));
});

check('D1-P9 exact marker-wrapped proposal is admitted', () => {
  const out = extractDevelopmentProposalV1(
    'analysis before\n' + PATCH_BEGIN + '\n' + validPatch + '\n' + PATCH_END + '\n',
    ['jarvis-desktop'],
  );
  assert.equal(out.ok, true, JSON.stringify(out.blockers));
  assert.equal(out.patch, validPatch);
});

check('D1-P10 missing marker is killed', () => {
  const out = extractDevelopmentProposalV1(validPatch, ['jarvis-desktop']);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'EXACT_PATCH_MARKERS_REQUIRED'));
});

check('D1-P11 multiple patch blocks are killed', () => {
  const output = PATCH_BEGIN + '\n' + validPatch + '\n' + PATCH_END
    + '\n' + PATCH_BEGIN + '\n' + validPatch + '\n' + PATCH_END;
  const out = extractDevelopmentProposalV1(output, ['jarvis-desktop']);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'EXACT_PATCH_MARKERS_REQUIRED'));
});

check('D1-P12 oversized proposal is killed before admission', () => {
  const giant = PATCH_BEGIN + '\n' + validPatch + '\n'
    + ('+' + 'x'.repeat(MAX_PATCH_BYTES + 10)) + '\n' + PATCH_END;
  const out = extractDevelopmentProposalV1(giant, ['jarvis-desktop']);
  assert.equal(out.ok, false);
  assert.ok(out.blockers.some((b) => b.code === 'PATCH_SIZE_LIMIT_EXCEEDED'));
});

check('D1-B1 PATCH branch is structurally allowed by repo branch policy', () => {
  assert.match(developmentBranchNameV1(wu()), /^fix\/jarvis-[a-z0-9-]+$/);
});

check('D1-B2 REBUILD maps to feature branch', () => {
  assert.match(
    developmentBranchNameV1(wu({ identity: { work_class: 'REBUILD' } })),
    /^feature\/jarvis-/,
  );
});

console.log('');
console.log(passed + ' passed · 0 failed');
