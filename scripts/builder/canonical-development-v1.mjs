/**
 * JARVIS-CANONICAL-DEVELOPMENT-01 / D1
 *
 * Pure, deterministic contract for a future canonical development lane.
 *
 * D1 does NOT:
 * - write files or create worktrees;
 * - execute providers;
 * - run shell commands or tests;
 * - create commits, PRs, merges, or deployments;
 * - mutate W0.v2 / W2.v2 / W3.v2 / W4.v2 state.
 *
 * It establishes two load-bearing separations:
 *
 *   Work Unit may authorize JARVIS control-plane worktree writes
 *   !=
 *   model/provider receives repository-write or shell authority.
 *
 * Local Qwen remains a read-only evidence consumer. For development Work Units
 * it may PROPOSE a bounded unified diff. A later control-plane act may decide
 * whether to apply that proposal inside an isolated worktree.
 */

import { createHash } from 'node:crypto';

export const DEVELOPMENT_CONTRACT_VERSION = 'D1.v1';
export const PATCH_BEGIN = 'BEGIN_JARVIS_PATCH';
export const PATCH_END = 'END_JARVIS_PATCH';
export const MAX_PATCH_BYTES = 512 * 1024;

const DEVELOPMENT_WORK_CLASSES = Object.freeze([
  'PATCH',
  'REFACTOR',
  'REBUILD',
  'DELIVERY',
]);

const FORBIDDEN_PATCH_MARKERS = Object.freeze([
  'GIT binary patch',
  'Binary files ',
  'rename from ',
  'rename to ',
  'copy from ',
  'copy to ',
  'similarity index ',
  'dissimilarity index ',
]);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function blocker(code, detail, path = null) {
  return Object.freeze({ code, detail, path });
}
function nonBlank(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}
function textList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(nonBlank).map((v) => v.trim()))];
}
function safeRepoPath(value) {
  if (!nonBlank(value)) return null;
  const p = value.trim();
  if (
    p === '.'
    || p === '..'
    || p === '/'
    || p === '*'
    || p === '**'
    || p === '**/*'
    || p.startsWith('/')
    || p.startsWith('../')
    || p.includes('/../')
    || p.includes('\\')
    || p.includes('\0')
  ) return null;
  return p.replace(/^\.\//, '');
}
function sha256(value) {
  return 'sha256:' + createHash('sha256').update(value).digest('hex');
}

export function developmentWorkUnitBlockersV1(workUnit) {
  const blocks = [];
  if (!workUnit || typeof workUnit !== 'object' || Array.isArray(workUnit)) {
    return deepFreeze([blocker('WORK_UNIT_REQUIRED', 'A structured W0.v2 Work Unit is required.')]);
  }

  if (workUnit.work_unit_version !== 'W0.v2') {
    blocks.push(blocker(
      'WORK_UNIT_VERSION_MISMATCH',
      'Canonical development admits only W0.v2.',
      'work_unit_version',
    ));
  }

  const identity = workUnit.identity || {};
  if (!DEVELOPMENT_WORK_CLASSES.includes(identity.work_class)) {
    blocks.push(blocker(
      'DEVELOPMENT_WORK_CLASS_REQUIRED',
      'Development is limited to PATCH, REFACTOR, REBUILD, or DELIVERY Work Units.',
      'identity.work_class',
    ));
  }
  if (identity.task_shape !== 'CODE_GROUNDED') {
    blocks.push(blocker(
      'CODE_GROUNDED_REQUIRED',
      'Canonical development requires task_shape=CODE_GROUNDED.',
      'identity.task_shape',
    ));
  }
  if (workUnit.custody?.evidence_class !== 'E1_REPOSITORY_LOCAL') {
    blocks.push(blocker(
      'LOCAL_REPOSITORY_EVIDENCE_REQUIRED',
      'Canonical development requires E1_REPOSITORY_LOCAL evidence custody.',
      'custody.evidence_class',
    ));
  }

  const authority = workUnit.authority || {};
  if (authority.repository_read !== true) {
    blocks.push(blocker(
      'REPOSITORY_READ_REQUIRED',
      'Canonical development requires repository_read=true.',
      'authority.repository_read',
    ));
  }
  if (authority.repository_write !== 'worktree') {
    blocks.push(blocker(
      'WORKTREE_WRITE_REQUIRED',
      'Canonical development requires repository_write=worktree.',
      'authority.repository_write',
    ));
  }
  if (authority.shell !== 'none') {
    blocks.push(blocker(
      'MODEL_SHELL_FORBIDDEN',
      'Canonical development D1 keeps model shell authority at none.',
      'authority.shell',
    ));
  }
  if (authority.merge === true) {
    blocks.push(blocker(
      'MERGE_AUTHORITY_FORBIDDEN',
      'Development authority does not imply merge authority.',
      'authority.merge',
    ));
  }
  if (authority.deploy === true) {
    blocks.push(blocker(
      'DEPLOY_AUTHORITY_FORBIDDEN',
      'Development authority does not imply deploy authority.',
      'authority.deploy',
    ));
  }
  if (authority.production_read === true || authority.production_write === true) {
    blocks.push(blocker(
      'PRODUCTION_AUTHORITY_FORBIDDEN',
      'Canonical development D1 carries no production authority.',
      'authority',
    ));
  }

  const allowed = textList(workUnit.scope?.allowed_paths);
  if (!allowed.length) {
    blocks.push(blocker(
      'BOUNDED_ALLOWED_PATHS_REQUIRED',
      'Canonical development requires at least one bounded allowed path.',
      'scope.allowed_paths',
    ));
  } else if (allowed.some((p) => safeRepoPath(p) == null)) {
    blocks.push(blocker(
      'UNSAFE_ALLOWED_PATH',
      'Every development allowed path must be bounded and repository-relative.',
      'scope.allowed_paths',
    ));
  }

  return deepFreeze(blocks);
}

export function classifyDevelopmentWorkUnitV1(workUnit) {
  const blockers = developmentWorkUnitBlockersV1(workUnit);
  return deepFreeze({
    ok: blockers.length === 0,
    version: DEVELOPMENT_CONTRACT_VERSION,
    disposition: blockers.length === 0 ? 'DEVELOPMENT_ADMISSIBLE' : 'REFUSED',
    blockers,
    control_plane_write_scope: blockers.length === 0 ? 'worktree' : 'none',
    provider_write_scope: 'none',
    provider_shell_scope: 'none',
  });
}

/**
 * Provider projection is deliberately read-only even when the Work Unit gives
 * the JARVIS control plane worktree-write authority.
 *
 * This object is suitable for the existing provider resolver. A provider never
 * inherits repo.write, merge, deploy, or production authority from the Work Unit.
 */
export function developmentProviderPermissionEnvelopeV1(workUnit) {
  const standing = classifyDevelopmentWorkUnitV1(workUnit);
  if (!standing.ok) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_CONTRACT_VERSION,
      blockers: standing.blockers,
      permission_envelope: null,
    });
  }

  return deepFreeze({
    ok: true,
    version: DEVELOPMENT_CONTRACT_VERSION,
    blockers: [],
    permission_envelope: {
      repo_read: true,
      repo_write_scope: 'none',
      execute_checks: false,
      production_read: false,
      production_write: false,
      deploy: false,
      authority_change: false,
      external_network: false,
      external_repo_disclosure: false,
      provider_spend: false,
    },
  });
}

export function developmentPromptV1(workUnit, files = []) {
  const standing = classifyDevelopmentWorkUnitV1(workUnit);
  if (!standing.ok) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_CONTRACT_VERSION,
      blockers: standing.blockers,
      prompt: null,
    });
  }

  const offered = textList(files);
  const scope = textList(workUnit.scope?.allowed_paths);
  const prompt = [
    'You are a READ-ONLY model participating in a JARVIS canonical development Work Unit.',
    'You do not have repository-write, shell, git, merge, deploy, network, or production authority.',
    'Inspect only the evidence JARVIS supplied and propose a unified diff; JARVIS decides whether to apply it.',
    '',
    'AUTHORIZED DEVELOPMENT SCOPE:',
    ...scope.map((p) => '- ' + p),
    '',
    'FILES MATERIALIZED FOR THIS ATTEMPT:',
    ...(offered.length ? offered.map((p) => '- ' + p) : ['(none)']),
    '',
    'Return exactly one patch block using these markers:',
    PATCH_BEGIN,
    'diff --git a/path b/path',
    '...',
    PATCH_END,
    '',
    'Do not emit binary patches, renames, copies, shell commands, git commands, or edits outside AUTHORIZED DEVELOPMENT SCOPE.',
  ].join('\n');

  return deepFreeze({
    ok: true,
    version: DEVELOPMENT_CONTRACT_VERSION,
    blockers: [],
    prompt,
  });
}

export function isDevelopmentPathAllowedV1(candidate, allowedPaths) {
  const path = safeRepoPath(candidate);
  if (!path) return false;
  const allowed = textList(allowedPaths).map(safeRepoPath).filter(Boolean);
  return allowed.some((root) => path === root || path.startsWith(root + '/'));
}

function extractMarkerBlock(output) {
  const source = String(output || '');
  const starts = [];
  const ends = [];
  let cursor = 0;
  while ((cursor = source.indexOf(PATCH_BEGIN, cursor)) !== -1) {
    starts.push(cursor);
    cursor += PATCH_BEGIN.length;
  }
  cursor = 0;
  while ((cursor = source.indexOf(PATCH_END, cursor)) !== -1) {
    ends.push(cursor);
    cursor += PATCH_END.length;
  }

  if (starts.length !== 1 || ends.length !== 1 || ends[0] <= starts[0]) {
    return {
      ok: false,
      blocker: blocker(
        'EXACT_PATCH_MARKERS_REQUIRED',
        'Development output must contain exactly one ordered BEGIN_JARVIS_PATCH / END_JARVIS_PATCH block.',
      ),
    };
  }

  const patch = source.slice(starts[0] + PATCH_BEGIN.length, ends[0]).trim();
  if (!patch) {
    return {
      ok: false,
      blocker: blocker('EMPTY_PATCH_REFUSED', 'Development patch block may not be empty.'),
    };
  }
  if (Buffer.byteLength(patch, 'utf8') > MAX_PATCH_BYTES) {
    return {
      ok: false,
      blocker: blocker(
        'PATCH_SIZE_LIMIT_EXCEEDED',
        'Development patch exceeds the 512 KiB D1 proposal ceiling.',
      ),
    };
  }
  return { ok: true, patch };
}

export function analyzeDevelopmentPatchV1(patch, allowedPaths) {
  const source = String(patch || '').replace(/\r\n/g, '\n');
  const blocks = [];

  if (!source.startsWith('diff --git ')) {
    blocks.push(blocker(
      'UNIFIED_DIFF_REQUIRED',
      'Development proposal must begin with a git unified-diff header.',
    ));
  }

  for (const marker of FORBIDDEN_PATCH_MARKERS) {
    if (source.split('\n').some((line) => line.startsWith(marker))) {
      blocks.push(blocker(
        'UNSUPPORTED_PATCH_OPERATION',
        'D1 refuses binary, rename, and copy patch operations: ' + marker.trim(),
      ));
    }
  }

  const paths = [];
  const sectionLines = source.split('\n').filter((line) => line.startsWith('diff --git '));
  if (!sectionLines.length) {
    blocks.push(blocker('PATCH_FILE_SECTION_REQUIRED', 'Patch must contain at least one diff --git section.'));
  }

  for (const line of sectionLines) {
    const match = /^diff --git a\/([^\s]+) b\/([^\s]+)$/.exec(line);
    if (!match) {
      blocks.push(blocker(
        'SAFE_PATCH_PATH_FORMAT_REQUIRED',
        'D1 currently admits only unquoted repository paths without spaces in diff headers.',
      ));
      continue;
    }
    const a = safeRepoPath(match[1]);
    const b = safeRepoPath(match[2]);
    if (!a || !b) {
      blocks.push(blocker('UNSAFE_PATCH_PATH', 'Patch contains an unsafe or escaping path.'));
      continue;
    }
    if (a !== b) {
      blocks.push(blocker(
        'PATCH_PATH_IDENTITY_REQUIRED',
        'D1 does not admit path changes; diff a/ and b/ paths must be identical.',
      ));
      continue;
    }
    if (!isDevelopmentPathAllowedV1(a, allowedPaths)) {
      blocks.push(blocker(
        'PATCH_PATH_OUTSIDE_AUTHORIZED_SCOPE',
        'Patch path is outside the Work Unit allowed-path scope: ' + a,
        a,
      ));
      continue;
    }
    paths.push(a);
  }

  const uniquePaths = [...new Set(paths)];
  return deepFreeze({
    ok: blocks.length === 0,
    version: DEVELOPMENT_CONTRACT_VERSION,
    blockers: blocks,
    paths: uniquePaths,
    digest: source ? sha256(source) : null,
    patch_bytes: Buffer.byteLength(source, 'utf8'),
  });
}

export function extractDevelopmentProposalV1(output, allowedPaths) {
  const extracted = extractMarkerBlock(output);
  if (!extracted.ok) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_CONTRACT_VERSION,
      blockers: [extracted.blocker],
      patch: null,
      paths: [],
      digest: null,
    });
  }

  const analyzed = analyzeDevelopmentPatchV1(extracted.patch, allowedPaths);
  return deepFreeze({
    ok: analyzed.ok,
    version: DEVELOPMENT_CONTRACT_VERSION,
    blockers: analyzed.blockers,
    patch: analyzed.ok ? extracted.patch : null,
    paths: analyzed.paths,
    digest: analyzed.digest,
    patch_bytes: analyzed.patch_bytes,
  });
}

export function developmentBranchNameV1(workUnit) {
  const id = text(workUnit?.identity?.id)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42) || 'work';
  const cls = workUnit?.identity?.work_class;
  const prefix = cls === 'PATCH' ? 'fix' : cls === 'REBUILD' || cls === 'DELIVERY' ? 'feature' : 'chore';
  return prefix + '/jarvis-' + id;
}
