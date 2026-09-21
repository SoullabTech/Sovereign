/**
 * JARVIS-CANONICAL-DEVELOPMENT-01 / D5
 *
 * One-shot human-authorized publication of an already verified local D4 commit.
 *
 * D5 authority:
 *   push exact branch commit + create/open PR
 *
 * Explicitly NOT authorized:
 *   force push · merge · deploy · production access · model-authored publication
 */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  classifyDevelopmentWorkUnitV1,
  developmentBranchNameV1,
} from './canonical-development-v1.mjs';

export const DEVELOPMENT_PUBLICATION_VERSION = 'D5.v1';
export const DEVELOPMENT_PUBLICATION_GRANT_VERSION = 'D5-GRANT.v1';
export const CANONICAL_GITHUB_REPOSITORY = 'SoullabTech/Sovereign';
export const CANONICAL_BASE_BRANCH = 'clean-main-no-secrets';

function blocker(code, detail, path = null) {
  return Object.freeze({ code, detail, path });
}
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
  );
}
function digest(value) {
  return 'sha256:' + createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');
}
function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}
function validSha(value) {
  return /^[0-9a-f]{40}$/i.test(text(value));
}
function safeBranch(value) {
  return /^(fix|feature|chore)\/jarvis-[a-z0-9-]{3,120}$/.test(text(value));
}
function refusal(code, detail, extra = {}) {
  return deepFreeze({
    ok: false,
    version: DEVELOPMENT_PUBLICATION_VERSION,
    status: 'REFUSED',
    blockers: [blocker(code, detail)],
    ...extra,
  });
}

export function prepareDevelopmentPublicationV1({
  workUnit,
  commitRecord,
} = {}) {
  const development = classifyDevelopmentWorkUnitV1(workUnit);
  const blocks = [...(development.blockers || [])];

  if (!commitRecord || commitRecord.version !== 'D4-COMMIT.v1'
      || commitRecord.status !== 'COMMITTED_LOCAL') {
    blocks.push(blocker(
      'LOCAL_COMMIT_RECEIPT_REQUIRED',
      'D5 requires a D4 COMMITTED_LOCAL receipt.',
    ));
  } else {
    if (commitRecord.work_unit_id !== workUnit?.identity?.id) {
      blocks.push(blocker('WORK_UNIT_ID_MISMATCH', 'D4 commit belongs to a different Work Unit.'));
    }
    if (commitRecord.base_sha !== workUnit?.scope?.base_ref) {
      blocks.push(blocker('BASE_SHA_MISMATCH', 'D4 commit is not bound to the Work Unit base SHA.'));
    }
    if (commitRecord.branch !== developmentBranchNameV1(workUnit)) {
      blocks.push(blocker('BRANCH_IDENTITY_MISMATCH', 'D4 branch does not match the governed development branch.'));
    }
    if (!safeBranch(commitRecord.branch)) {
      blocks.push(blocker('UNSAFE_PUBLICATION_BRANCH', 'D5 publishes only governed JARVIS branch names.'));
    }
    if (!validSha(commitRecord.commit_sha)) {
      blocks.push(blocker('EXACT_COMMIT_SHA_REQUIRED', 'D5 requires an exact local commit SHA.'));
    }
    if (commitRecord.push_performed !== false
        || commitRecord.pull_request_created !== false
        || commitRecord.merge_performed !== false
        || commitRecord.deploy_performed !== false) {
      blocks.push(blocker(
        'PREPUBLICATION_RECEIPT_REQUIRED',
        'D5 requires a local-only D4 commit receipt with no prior publication/merge/deploy claim.',
      ));
    }
  }

  if (workUnit?.authority?.merge === true || workUnit?.authority?.deploy === true
      || workUnit?.authority?.production_read === true
      || workUnit?.authority?.production_write === true) {
    blocks.push(blocker(
      'PUBLICATION_AUTHORITY_MUST_NOT_INCLUDE_INTEGRATION',
      'D5 publication does not admit merge, deploy, or production authority.',
    ));
  }

  const preview = blocks.length ? null : {
    publication_version: DEVELOPMENT_PUBLICATION_VERSION,
    work_unit_id: workUnit.identity.id,
    base_sha: workUnit.scope.base_ref,
    branch: commitRecord.branch,
    commit_sha: commitRecord.commit_sha,
    verified_diff_digest: commitRecord.verified_diff_digest,
    verification_receipt_digest: commitRecord.verification_receipt_digest,
    remote_name: 'origin',
    repository: CANONICAL_GITHUB_REPOSITORY,
    base_branch: CANONICAL_BASE_BRANCH,
    allowed_acts: ['git.push:branch', 'github.pull_request:create'],
    forbidden_acts: ['git.force_push', 'github.pull_request:merge', 'deploy', 'production.read', 'production.write'],
  };

  return deepFreeze({
    ok: blocks.length === 0,
    version: DEVELOPMENT_PUBLICATION_VERSION,
    status: blocks.length === 0 ? 'HELD_FOR_HUMAN_AUTHORIZATION' : 'REFUSED',
    blockers: blocks,
    preview,
    preview_digest: preview ? digest(preview) : null,
  });
}

export function createDevelopmentPublicationGrantV1(prepared, {
  sequence,
  actor_id,
  issued_at,
  authorization_act = 'JARVIS_DEVELOPMENT_AUTHORIZE_PUBLISH_ONCE',
} = {}) {
  const blocks = [];
  if (!prepared?.ok || !prepared.preview || !prepared.preview_digest) {
    blocks.push(blocker('PUBLICATION_PREVIEW_REQUIRED', 'A valid D5 publication preview is required.'));
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    blocks.push(blocker('GRANT_SEQUENCE_REQUIRED', 'Publication grant requires a positive sequence.'));
  }
  if (!text(actor_id).startsWith('human:')) {
    blocks.push(blocker('HUMAN_ACTOR_REQUIRED', 'Publication grant must be authored by a human actor.'));
  }
  if (!text(issued_at)) {
    blocks.push(blocker('ISSUED_AT_REQUIRED', 'Publication grant requires issued_at.'));
  }
  if (blocks.length) {
    return deepFreeze({ ok: false, status: 'REFUSED', blockers: blocks, grant: null });
  }

  const seed = [
    prepared.preview.work_unit_id,
    prepared.preview.commit_sha,
    String(sequence),
    issued_at,
    actor_id,
  ].join('|');
  const grant = {
    grant_version: DEVELOPMENT_PUBLICATION_GRANT_VERSION,
    sequence,
    grant_id: 'd5-' + createHash('sha256').update(seed).digest('hex').slice(0, 32),
    publication_version: DEVELOPMENT_PUBLICATION_VERSION,
    preview_digest: prepared.preview_digest,
    publication_scope: clone(prepared.preview),
    actor_kind: 'human',
    actor_id: text(actor_id),
    authorization_act,
    issued_at: text(issued_at),
    one_shot: true,
    non_transferable: true,
  };
  grant.grant_digest = digest(grant);
  return deepFreeze({ ok: true, status: 'AUTHORIZED_ONCE', blockers: [], grant });
}

export function validateDevelopmentPublicationGrantV1(grant, prepared) {
  const blocks = [];
  if (!grant || grant.grant_version !== DEVELOPMENT_PUBLICATION_GRANT_VERSION) {
    blocks.push(blocker('INVALID_GRANT_VERSION', 'D5 requires a D5-GRANT.v1 grant.'));
  }
  if (!prepared?.ok || !prepared.preview || !prepared.preview_digest) {
    blocks.push(blocker('CURRENT_PUBLICATION_PREVIEW_REQUIRED', 'Current D5 publication preview is required.'));
  }
  if (blocks.length) return deepFreeze({ ok: false, blockers: blocks });

  const { grant_digest, ...withoutDigest } = grant;
  if (grant_digest !== digest(withoutDigest)) {
    blocks.push(blocker('GRANT_DIGEST_MISMATCH', 'D5 publication grant was modified.'));
  }
  if (grant.preview_digest !== prepared.preview_digest
      || digest(grant.publication_scope) !== digest(prepared.preview)) {
    blocks.push(blocker('GRANT_SCOPE_CHANGED', 'D5 publication facts changed after authorization.'));
  }
  if (grant.actor_kind !== 'human' || !text(grant.actor_id).startsWith('human:')) {
    blocks.push(blocker('HUMAN_GRANT_REQUIRED', 'D5 publication grant must remain human-authored.'));
  }
  if (grant.one_shot !== true || grant.non_transferable !== true) {
    blocks.push(blocker('ONE_SHOT_NONTRANSFERABLE_REQUIRED', 'D5 grant must remain one-shot and non-transferable.'));
  }
  return deepFreeze({ ok: blocks.length === 0, blockers: blocks });
}

function normalizeGitHubRepository(remoteUrl) {
  const value = text(remoteUrl);
  let match = /^https:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/.exec(value);
  if (match) return match[1];
  match = /^git@github\.com:([^/]+\/[^/]+?)(?:\.git)?$/.exec(value);
  return match ? match[1] : null;
}
function command(deps, file, args, opts = {}) {
  const runner = deps?.spawnSync || spawnSync;
  return runner(file, args, {
    cwd: opts.cwd,
    encoding: 'utf8',
    env: deps?.env || process.env,
    maxBuffer: 8 * 1024 * 1024,
    shell: false,
  });
}
function commandText(deps, file, args, opts = {}) {
  const out = command(deps, file, args, opts);
  return {
    ok: out.status === 0,
    code: Number.isInteger(out.status) ? out.status : 1,
    stdout: String(out.stdout || '').trim(),
    stderr: String(out.stderr || '').trim(),
  };
}
function parseOpenPrJson(stdout) {
  try {
    const value = JSON.parse(stdout);
    if (!Array.isArray(value) || value.length === 0) return null;
    const first = value[0];
    return first && typeof first === 'object' ? first : null;
  } catch {
    return null;
  }
}
function parsePrNumber(url) {
  const match = /\/pull\/(\d+)(?:$|[?#])/.exec(text(url));
  return match ? Number(match[1]) : null;
}
function safeTitle(workUnit) {
  const objective = text(workUnit?.identity?.objective)
    .replace(/\s+/g, ' ')
    .slice(0, 68);
  return 'JARVIS: ' + (objective || 'bounded development change');
}
function prBody(workUnit, commitRecord) {
  return [
    'Generated by JARVIS canonical development D5.',
    '',
    'Work Unit: ' + workUnit.identity.id,
    'Base SHA: ' + workUnit.scope.base_ref,
    'Commit SHA: ' + commitRecord.commit_sha,
    'Verified diff: ' + commitRecord.verified_diff_digest,
    '',
    'Publication only. Merge and deploy remain separate human-governed acts.',
  ].join('\n');
}

export function publishDevelopmentCommitV1({
  repositoryRoot,
  workUnit,
  commitRecord,
  grant,
} = {}, deps = {}) {
  const prepared = prepareDevelopmentPublicationV1({ workUnit, commitRecord });
  const validated = validateDevelopmentPublicationGrantV1(grant, prepared);
  if (!validated.ok) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_PUBLICATION_VERSION,
      status: 'GRANT_INVALID',
      blockers: validated.blockers,
    });
  }
  if (!repositoryRoot || !existsSync(repositoryRoot)
      || !commitRecord?.worktree || !existsSync(commitRecord.worktree)) {
    return refusal('PUBLICATION_WORKTREE_REQUIRED', 'D5 requires the exact existing D4 worktree.');
  }

  const head = commandText(deps, 'git', ['rev-parse', 'HEAD'], { cwd: commitRecord.worktree });
  const clean = commandText(deps, 'git', ['status', '--porcelain'], { cwd: commitRecord.worktree });
  if (!head.ok || head.stdout !== commitRecord.commit_sha || !clean.ok || clean.stdout !== '') {
    return refusal(
      'LOCAL_COMMIT_STATE_CHANGED',
      'D5 local worktree must be clean and exactly at the authorized commit SHA.',
    );
  }

  const remote = commandText(deps, 'git', ['remote', 'get-url', 'origin'], { cwd: repositoryRoot });
  const remoteRepo = remote.ok ? normalizeGitHubRepository(remote.stdout) : null;
  if (remoteRepo !== CANONICAL_GITHUB_REPOSITORY) {
    return refusal(
      'CANONICAL_REMOTE_REQUIRED',
      'D5 refuses publication to a remote other than ' + CANONICAL_GITHUB_REPOSITORY + '.',
    );
  }

  // Prove the PR tool and credential are usable BEFORE mutating the remote branch.
  const ghVersion = commandText(deps, 'gh', ['--version'], { cwd: repositoryRoot });
  if (!ghVersion.ok) {
    return refusal('GITHUB_CLI_REQUIRED', 'D5 requires an available GitHub CLI before branch publication.');
  }
  const ghAuth = commandText(deps, 'gh', ['auth', 'status', '--hostname', 'github.com'], { cwd: repositoryRoot });
  if (!ghAuth.ok) {
    return refusal('GITHUB_AUTH_REQUIRED', 'D5 requires an authenticated GitHub CLI before branch publication.');
  }

  const branch = prepared.preview.branch;
  const ref = 'refs/heads/' + branch;
  let remoteBranch = commandText(
    deps,
    'git',
    ['ls-remote', '--heads', 'origin', ref],
    { cwd: repositoryRoot },
  );
  if (!remoteBranch.ok) {
    return refusal('REMOTE_BRANCH_PROBE_FAILED', 'D5 could not inspect the target remote branch.');
  }
  let remoteSha = remoteBranch.stdout ? remoteBranch.stdout.split(/\s+/)[0] : null;
  let pushPerformed = false;

  if (remoteSha && remoteSha !== commitRecord.commit_sha) {
    return refusal(
      'REMOTE_BRANCH_CONFLICT',
      'D5 refuses to move an existing remote branch to a different commit; force-push is never used.',
      { remote_sha: remoteSha },
    );
  }
  if (!remoteSha) {
    const pushed = commandText(
      deps,
      'git',
      ['push', '--porcelain', 'origin', commitRecord.commit_sha + ':' + ref],
      { cwd: repositoryRoot },
    );
    if (!pushed.ok) {
      return refusal(
        'BRANCH_PUSH_FAILED',
        'D5 exact non-force branch push failed: ' + pushed.stderr,
      );
    }
    pushPerformed = true;
    remoteBranch = commandText(
      deps,
      'git',
      ['ls-remote', '--heads', 'origin', ref],
      { cwd: repositoryRoot },
    );
    remoteSha = remoteBranch.ok && remoteBranch.stdout
      ? remoteBranch.stdout.split(/\s+/)[0]
      : null;
    if (remoteSha !== commitRecord.commit_sha) {
      return refusal(
        'REMOTE_BRANCH_VERIFY_FAILED',
        'D5 push returned without the exact authorized commit becoming the remote branch tip.',
        { push_performed: true },
      );
    }
  }

  const existing = commandText(
    deps,
    'gh',
    [
      'pr', 'list',
      '--repo', CANONICAL_GITHUB_REPOSITORY,
      '--head', branch,
      '--base', CANONICAL_BASE_BRANCH,
      '--state', 'open',
      '--limit', '1',
      '--json', 'number,url,headRefOid',
    ],
    { cwd: repositoryRoot },
  );
  if (!existing.ok) {
    return refusal(
      'PULL_REQUEST_PROBE_FAILED',
      'D5 could not inspect existing pull requests.',
      { push_performed: pushPerformed, remote_sha: remoteSha },
    );
  }
  let pr = parseOpenPrJson(existing.stdout);
  if (pr && pr.headRefOid && pr.headRefOid !== commitRecord.commit_sha) {
    return refusal(
      'OPEN_PR_HEAD_MISMATCH',
      'Existing PR for the branch does not point at the authorized commit.',
      { push_performed: pushPerformed, remote_sha: remoteSha },
    );
  }

  let prCreated = false;
  if (!pr) {
    const created = commandText(
      deps,
      'gh',
      [
        'pr', 'create',
        '--repo', CANONICAL_GITHUB_REPOSITORY,
        '--base', CANONICAL_BASE_BRANCH,
        '--head', branch,
        '--title', safeTitle(workUnit),
        '--body', prBody(workUnit, commitRecord),
      ],
      { cwd: repositoryRoot },
    );
    if (!created.ok || !created.stdout.includes('/pull/')) {
      return refusal(
        'PULL_REQUEST_CREATE_FAILED',
        'D5 branch is published but PR creation failed: ' + created.stderr,
        { push_performed: pushPerformed, remote_sha: remoteSha },
      );
    }
    prCreated = true;
    pr = {
      number: parsePrNumber(created.stdout),
      url: created.stdout.split(/\s+/).find((v) => v.includes('/pull/')) || created.stdout,
      headRefOid: commitRecord.commit_sha,
    };
  }

  return deepFreeze({
    ok: true,
    version: DEVELOPMENT_PUBLICATION_VERSION,
    status: 'PUBLISHED_FOR_REVIEW',
    blockers: [],
    work_unit_id: workUnit.identity.id,
    base_sha: workUnit.scope.base_ref,
    branch,
    commit_sha: commitRecord.commit_sha,
    remote_repository: CANONICAL_GITHUB_REPOSITORY,
    remote_sha: remoteSha,
    push_performed: pushPerformed,
    pull_request_created: prCreated,
    pull_request_number: pr?.number ?? null,
    pull_request_url: pr?.url ?? null,
    merge_performed: false,
    deploy_performed: false,
  });
}
