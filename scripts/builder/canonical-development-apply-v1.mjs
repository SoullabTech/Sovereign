/**
 * JARVIS-CANONICAL-DEVELOPMENT-01 / D3
 *
 * Physical, fail-closed application of an already D1-admitted patch proposal.
 *
 * Authority boundary:
 * - JARVIS control plane owns git/worktree mutation.
 * - the model never receives shell, git, repository-write, merge, or deploy tools.
 * - D3 stops at APPLIED_UNCOMMITTED. Commit/push/PR/merge/deploy are later acts.
 */

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  analyzeDevelopmentPatchV1,
  classifyDevelopmentWorkUnitV1,
  developmentBranchNameV1,
  isDevelopmentPathAllowedV1,
} from './canonical-development-v1.mjs';

export const DEVELOPMENT_APPLY_VERSION = 'D3.v1';

function blocker(code, detail, pathValue = null) {
  return Object.freeze({ code, detail, path: pathValue });
}
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function safeUnitId(value) {
  return /^[a-z0-9][a-z0-9-]{2,63}$/.test(String(value || ''));
}
function validSha(value) {
  return /^[0-9a-f]{40}$/i.test(String(value || ''));
}
function sha256(value) {
  return 'sha256:' + createHash('sha256').update(value).digest('hex');
}

function git(args, { cwd, input = null, encoding = 'utf8' } = {}) {
  return spawnSync('git', args, {
    cwd,
    input,
    encoding,
    maxBuffer: 16 * 1024 * 1024,
    shell: false,
  });
}

function gitText(args, cwd) {
  const out = git(args, { cwd });
  if (out.status !== 0) return null;
  return String(out.stdout || '').trim();
}

function refExists(repositoryRoot, ref) {
  const out = git(['show-ref', '--verify', '--quiet', ref], { cwd: repositoryRoot });
  return out.status === 0;
}

function changedRecords(worktree) {
  const out = git(
    ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
    { cwd: worktree },
  );
  if (out.status !== 0) {
    return {
      ok: false,
      blocker: blocker(
        'WORKTREE_STATUS_FAILED',
        'git status failed after patch application: ' + String(out.stderr || '').trim(),
      ),
      records: [],
    };
  }
  const records = String(out.stdout || '')
    .split('\0')
    .filter(Boolean)
    .map((entry) => ({
      status: entry.slice(0, 2),
      path: entry.slice(3),
    }));
  return { ok: true, records };
}

function cleanupWorktree(repositoryRoot, worktree, branch) {
  if (worktree && existsSync(worktree)) {
    git(['worktree', 'remove', '--force', worktree], { cwd: repositoryRoot });
  }
  if (branch && refExists(repositoryRoot, 'refs/heads/' + branch)) {
    git(['branch', '-D', branch], { cwd: repositoryRoot });
  }
}

function refusal(code, detail, extra = {}) {
  return deepFreeze({
    ok: false,
    version: DEVELOPMENT_APPLY_VERSION,
    status: 'REFUSED',
    blockers: [blocker(code, detail)],
    ...extra,
  });
}

export function applyDevelopmentProposalV1({
  repositoryRoot,
  workUnit,
  proposal,
  workUnitId,
  worktreesRoot,
} = {}) {
  const standing = classifyDevelopmentWorkUnitV1(workUnit);
  if (!standing.ok) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_APPLY_VERSION,
      status: 'DEVELOPMENT_CONTRACT_REFUSED',
      blockers: standing.blockers,
    });
  }

  if (!safeUnitId(workUnitId) || workUnitId !== workUnit?.identity?.id) {
    return refusal(
      'WORK_UNIT_ID_MISMATCH',
      'D3 requires the exact safe W0.v2 identity.',
    );
  }
  if (!repositoryRoot || !existsSync(repositoryRoot)) {
    return refusal('REPOSITORY_ROOT_REQUIRED', 'D3 requires an existing repository root.');
  }
  if (!worktreesRoot) {
    return refusal('WORKTREES_ROOT_REQUIRED', 'D3 requires an explicit governed worktree root.');
  }
  if (!validSha(workUnit.scope?.base_ref)) {
    return refusal('EXACT_BASE_SHA_REQUIRED', 'D3 requires the exact 40-character Work Unit base SHA.');
  }
  if (!proposal || typeof proposal.patch !== 'string' || !proposal.digest) {
    return refusal('DEVELOPMENT_PROPOSAL_REQUIRED', 'D3 requires a persisted D1 proposal and digest.');
  }

  const analyzed = analyzeDevelopmentPatchV1(
    proposal.patch,
    workUnit.scope?.allowed_paths || [],
  );
  if (!analyzed.ok) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_APPLY_VERSION,
      status: 'PROPOSAL_REFUSED',
      blockers: analyzed.blockers,
    });
  }
  if (analyzed.digest !== proposal.digest) {
    return refusal(
      'PROPOSAL_DIGEST_MISMATCH',
      'Persisted proposal bytes no longer match the D1 digest.',
    );
  }

  const base = workUnit.scope.base_ref;
  const baseExists = git(['cat-file', '-e', base + '^{commit}'], { cwd: repositoryRoot });
  if (baseExists.status !== 0) {
    return refusal('BASE_SHA_NOT_FOUND', 'The exact Work Unit base SHA is not available in the repository.');
  }

  const branch = developmentBranchNameV1(workUnit);
  if (refExists(repositoryRoot, 'refs/heads/' + branch)) {
    return refusal(
      'DEVELOPMENT_BRANCH_EXISTS',
      'D3 refuses to reuse an existing branch because ownership would be ambiguous.',
      { branch },
    );
  }

  mkdirSync(worktreesRoot, { recursive: true });
  const worktree = path.join(worktreesRoot, 'ain-' + workUnitId);
  if (existsSync(worktree)) {
    return refusal(
      'DEVELOPMENT_WORKTREE_EXISTS',
      'D3 refuses to reuse an existing worktree because prior state may be present.',
      { branch, worktree },
    );
  }

  let created = false;
  try {
    const added = git(
      ['worktree', 'add', '-b', branch, worktree, base],
      { cwd: repositoryRoot },
    );
    if (added.status !== 0) {
      return refusal(
        'WORKTREE_CREATE_FAILED',
        'git worktree add failed: ' + String(added.stderr || '').trim(),
        { branch, worktree },
      );
    }
    created = true;

    const check = git(
      ['apply', '--check', '--whitespace=nowarn', '-'],
      { cwd: worktree, input: proposal.patch },
    );
    if (check.status !== 0) {
      cleanupWorktree(repositoryRoot, worktree, branch);
      created = false;
      return refusal(
        'PATCH_APPLY_CHECK_FAILED',
        'git apply --check refused the proposal: ' + String(check.stderr || '').trim(),
      );
    }

    const applied = git(
      ['apply', '--whitespace=nowarn', '-'],
      { cwd: worktree, input: proposal.patch },
    );
    if (applied.status !== 0) {
      cleanupWorktree(repositoryRoot, worktree, branch);
      created = false;
      return refusal(
        'PATCH_APPLY_FAILED',
        'git apply failed after a successful check: ' + String(applied.stderr || '').trim(),
      );
    }

    const measured = changedRecords(worktree);
    if (!measured.ok) {
      cleanupWorktree(repositoryRoot, worktree, branch);
      created = false;
      return deepFreeze({
        ok: false,
        version: DEVELOPMENT_APPLY_VERSION,
        status: 'REFUSED',
        blockers: [measured.blocker],
      });
    }
    if (!measured.records.length) {
      cleanupWorktree(repositoryRoot, worktree, branch);
      created = false;
      return refusal('EMPTY_APPLIED_DIFF', 'D3 refuses a proposal that produces no working-tree delta.');
    }

    const changedPaths = [...new Set(measured.records.map((r) => r.path))];
    const outOfScope = changedPaths.filter((p) =>
      !isDevelopmentPathAllowedV1(p, workUnit.scope?.allowed_paths || []));
    if (outOfScope.length) {
      cleanupWorktree(repositoryRoot, worktree, branch);
      created = false;
      return refusal(
        'APPLIED_PATH_OUTSIDE_AUTHORIZED_SCOPE',
        'Applied worktree contains paths outside the Work Unit scope: ' + outOfScope.join(', '),
      );
    }

    const unsupportedStatus = measured.records.filter((r) =>
      r.status.includes('R') || r.status.includes('C'));
    if (unsupportedStatus.length) {
      cleanupWorktree(repositoryRoot, worktree, branch);
      created = false;
      return refusal(
        'APPLIED_RENAME_OR_COPY_REFUSED',
        'D3 refuses rename/copy state even if git interpreted the patch that way.',
      );
    }

    const symlinks = [];
    for (const rel of changedPaths) {
      const target = path.join(worktree, rel);
      if (!existsSync(target)) continue; // deletions are ordinary.
      if (lstatSync(target).isSymbolicLink()) symlinks.push(rel);
    }
    if (symlinks.length) {
      cleanupWorktree(repositoryRoot, worktree, branch);
      created = false;
      return refusal(
        'SYMLINK_CHANGE_REFUSED',
        'D3 refuses symlink additions or replacements: ' + symlinks.join(', '),
      );
    }

    // Intent-to-add makes untracked new files visible to `git diff` without
    // staging their content or creating a commit.
    const untracked = measured.records
      .filter((r) => r.status === '??')
      .map((r) => r.path);
    if (untracked.length) {
      const intent = git(['add', '-N', '--', ...untracked], { cwd: worktree });
      if (intent.status !== 0) {
        cleanupWorktree(repositoryRoot, worktree, branch);
        created = false;
        return refusal(
          'INTENT_TO_ADD_FAILED',
          'D3 could not materialize new-file diff evidence.',
        );
      }
    }

    const whitespace = git(['diff', '--check'], { cwd: worktree });
    if (whitespace.status !== 0) {
      cleanupWorktree(repositoryRoot, worktree, branch);
      created = false;
      return refusal(
        'DIFF_CHECK_FAILED',
        'Applied proposal fails git diff --check: ' + String(whitespace.stdout || whitespace.stderr || '').trim(),
      );
    }

    const diff = git(['diff', '--binary', '--no-ext-diff', '--', '.'], { cwd: worktree });
    if (diff.status !== 0 || !String(diff.stdout || '').trim()) {
      cleanupWorktree(repositoryRoot, worktree, branch);
      created = false;
      return refusal(
        'DURABLE_DIFF_FAILED',
        'D3 could not produce a non-empty deterministic diff after application.',
      );
    }
    const diffText = String(diff.stdout);
    const head = gitText(['rev-parse', 'HEAD'], worktree);
    if (head !== base) {
      cleanupWorktree(repositoryRoot, worktree, branch);
      created = false;
      return refusal(
        'UNEXPECTED_COMMIT_MOVEMENT',
        'D3 must stop before commit; worktree HEAD changed unexpectedly.',
      );
    }

    return deepFreeze({
      ok: true,
      version: DEVELOPMENT_APPLY_VERSION,
      status: 'APPLIED_UNCOMMITTED',
      blockers: [],
      work_unit_id: workUnitId,
      base_sha: base,
      branch,
      worktree,
      changed_paths: changedPaths.sort(),
      proposal_digest: analyzed.digest,
      diff_digest: sha256(diffText),
      diff_bytes: Buffer.byteLength(diffText, 'utf8'),
      head_sha: head,
      commit_created: false,
      merge_performed: false,
      deploy_performed: false,
    });
  } catch (error) {
    if (created) cleanupWorktree(repositoryRoot, worktree, branch);
    return refusal(
      'DEVELOPMENT_APPLY_EXCEPTION',
      'D3 failed closed: ' + String(error?.message || error),
    );
  }
}
