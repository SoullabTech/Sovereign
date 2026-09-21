/**
 * JARVIS-CANONICAL-DEVELOPMENT-01 / D7
 *
 * One-shot human-authorized deployment of an exact merged canonical SHA.
 *
 * D7 does NOT implement deployment. It verifies merge/canonical identity and
 * invokes the existing governed lane:
 *
 *   scripts/pre-deploy-gate.sh deploy-maia <exact SHA>
 *
 * The existing gate owns immutable build context, deploy lock, disk gate,
 * Co-Lab constitutional verification, rollback tagging, swap, and running
 * provenance verification.
 */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const DEVELOPMENT_DEPLOY_VERSION = 'D7.v1';
export const DEVELOPMENT_DEPLOY_GRANT_VERSION = 'D7-GRANT.v1';
export const DEPLOY_REPOSITORY = 'SoullabTech/Sovereign';
export const DEPLOY_BASE_BRANCH = 'clean-main-no-secrets';

function blocker(code, detail, pathValue = null) {
  return Object.freeze({ code, detail, path: pathValue });
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
function refusal(code, detail, extra = {}) {
  return deepFreeze({
    ok: false,
    version: DEVELOPMENT_DEPLOY_VERSION,
    status: 'REFUSED',
    blockers: [blocker(code, detail)],
    ...extra,
  });
}

export function prepareDevelopmentDeployV1({
  mergeCommitSha,
  pullRequestNumber,
  actorId,
} = {}) {
  const blocks = [];
  if (!validSha(mergeCommitSha)) {
    blocks.push(blocker('EXACT_MERGE_SHA_REQUIRED', 'D7 requires an exact 40-character merge commit SHA.'));
  }
  if (!Number.isInteger(pullRequestNumber) || pullRequestNumber < 1) {
    blocks.push(blocker('PULL_REQUEST_NUMBER_REQUIRED', 'D7 requires the merged pull request number.'));
  }
  if (!text(actorId).startsWith('human:')) {
    blocks.push(blocker('HUMAN_ACTOR_REQUIRED', 'D7 deployment authorization must originate from a human actor.'));
  }

  const preview = blocks.length ? null : {
    deploy_version: DEVELOPMENT_DEPLOY_VERSION,
    repository: DEPLOY_REPOSITORY,
    base_branch: DEPLOY_BASE_BRANCH,
    pull_request_number: pullRequestNumber,
    merge_commit_sha: text(mergeCommitSha),
    deploy_entrypoint: 'scripts/pre-deploy-gate.sh',
    deploy_command: 'deploy-maia',
    allowed_acts: ['deploy.maia:exact_sha'],
    forbidden_acts: [
      'deploy.head',
      'deploy.force',
      'deploy.rollback:auto',
      'production.migrate:auto',
      'production.restore:auto',
      'authority.change',
    ],
  };

  return deepFreeze({
    ok: blocks.length === 0,
    version: DEVELOPMENT_DEPLOY_VERSION,
    status: blocks.length === 0 ? 'HELD_FOR_HUMAN_AUTHORIZATION' : 'REFUSED',
    blockers: blocks,
    preview,
    preview_digest: preview ? digest(preview) : null,
    actor_id: text(actorId) || null,
  });
}

export function createDevelopmentDeployGrantV1(prepared, {
  sequence,
  actor_id,
  issued_at,
  authorization_act = 'JARVIS_DEVELOPMENT_AUTHORIZE_DEPLOY_ONCE',
} = {}) {
  const blocks = [];
  if (!prepared?.ok || !prepared.preview || !prepared.preview_digest) {
    blocks.push(blocker('DEPLOY_PREVIEW_REQUIRED', 'A valid D7 deployment preview is required.'));
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    blocks.push(blocker('GRANT_SEQUENCE_REQUIRED', 'D7 grant requires a positive sequence.'));
  }
  if (!text(actor_id).startsWith('human:')) {
    blocks.push(blocker('HUMAN_ACTOR_REQUIRED', 'D7 deployment grant must be human-authored.'));
  }
  if (prepared?.actor_id && prepared.actor_id !== text(actor_id)) {
    blocks.push(blocker('ACTOR_ID_MISMATCH', 'D7 deploy grant actor must match the preview actor.'));
  }
  if (!text(issued_at)) {
    blocks.push(blocker('ISSUED_AT_REQUIRED', 'D7 deployment grant requires issued_at.'));
  }
  if (blocks.length) return deepFreeze({ ok: false, status: 'REFUSED', blockers: blocks, grant: null });

  const seed = [
    prepared.preview.pull_request_number,
    prepared.preview.merge_commit_sha,
    sequence,
    actor_id,
    issued_at,
  ].join('|');
  const grant = {
    grant_version: DEVELOPMENT_DEPLOY_GRANT_VERSION,
    sequence,
    grant_id: 'd7-' + createHash('sha256').update(seed).digest('hex').slice(0, 32),
    deploy_version: DEVELOPMENT_DEPLOY_VERSION,
    preview_digest: prepared.preview_digest,
    deploy_scope: clone(prepared.preview),
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

export function validateDevelopmentDeployGrantV1(grant, prepared) {
  const blocks = [];
  if (!grant || grant.grant_version !== DEVELOPMENT_DEPLOY_GRANT_VERSION) {
    blocks.push(blocker('INVALID_GRANT_VERSION', 'D7 requires a D7-GRANT.v1 grant.'));
  }
  if (!prepared?.ok || !prepared.preview || !prepared.preview_digest) {
    blocks.push(blocker('CURRENT_DEPLOY_PREVIEW_REQUIRED', 'Current D7 deploy preview is required.'));
  }
  if (blocks.length) return deepFreeze({ ok: false, blockers: blocks });

  const { grant_digest, ...withoutDigest } = grant;
  if (grant_digest !== digest(withoutDigest)) {
    blocks.push(blocker('GRANT_DIGEST_MISMATCH', 'D7 deployment grant was modified.'));
  }
  if (grant.preview_digest !== prepared.preview_digest
      || digest(grant.deploy_scope) !== digest(prepared.preview)) {
    blocks.push(blocker('GRANT_SCOPE_CHANGED', 'D7 deploy facts changed after human authorization.'));
  }
  if (grant.actor_kind !== 'human' || !text(grant.actor_id).startsWith('human:')) {
    blocks.push(blocker('HUMAN_GRANT_REQUIRED', 'D7 deploy grant must remain human-authored.'));
  }
  if (grant.one_shot !== true || grant.non_transferable !== true) {
    blocks.push(blocker('ONE_SHOT_NONTRANSFERABLE_REQUIRED', 'D7 grant must remain one-shot and non-transferable.'));
  }
  return deepFreeze({ ok: blocks.length === 0, blockers: blocks });
}

function command(deps, file, args, opts = {}) {
  const runner = deps?.spawnSync || spawnSync;
  return runner(file, args, {
    cwd: opts.cwd,
    encoding: 'utf8',
    env: deps?.env || process.env,
    maxBuffer: 16 * 1024 * 1024,
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
function parsePr(stdout) {
  try {
    const value = JSON.parse(stdout);
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

export function deployMergedCanonicalV1({
  repositoryRoot,
  prepared,
  grant,
} = {}, deps = {}) {
  const validated = validateDevelopmentDeployGrantV1(grant, prepared);
  if (!validated.ok) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_DEPLOY_VERSION,
      status: 'GRANT_INVALID',
      blockers: validated.blockers,
    });
  }
  if (!repositoryRoot || !existsSync(repositoryRoot)) {
    return refusal('REPOSITORY_ROOT_REQUIRED', 'D7 requires the local canonical repository.');
  }

  const gate = path.join(repositoryRoot, 'scripts', 'pre-deploy-gate.sh');
  if (!existsSync(gate)) {
    return refusal('DEPLOY_GATE_REQUIRED', 'D7 requires repository-local scripts/pre-deploy-gate.sh.');
  }

  // Credential + PR verification is required BEFORE any deploy lane occupancy.
  const ghVersion = commandText(deps, 'gh', ['--version'], { cwd: repositoryRoot });
  if (!ghVersion.ok) return refusal('GITHUB_CLI_REQUIRED', 'D7 requires GitHub CLI for merge verification.');
  const ghAuth = commandText(deps, 'gh', ['auth', 'status', '--hostname', 'github.com'], { cwd: repositoryRoot });
  if (!ghAuth.ok) return refusal('GITHUB_AUTH_REQUIRED', 'D7 requires authenticated GitHub CLI.');

  const pr = commandText(
    deps,
    'gh',
    [
      'pr', 'view', String(prepared.preview.pull_request_number),
      '--repo', DEPLOY_REPOSITORY,
      '--json', 'state,mergedAt,mergeCommit,baseRefName',
    ],
    { cwd: repositoryRoot },
  );
  if (!pr.ok) return refusal('PULL_REQUEST_VERIFY_FAILED', 'D7 could not verify the authorized pull request.');
  const prData = parsePr(pr.stdout);
  const mergeOid = prData?.mergeCommit?.oid || null;
  if (!prData || prData.state !== 'MERGED' || !prData.mergedAt
      || prData.baseRefName !== DEPLOY_BASE_BRANCH
      || mergeOid !== prepared.preview.merge_commit_sha) {
    return refusal(
      'MERGED_PR_IDENTITY_MISMATCH',
      'D7 PR must be merged into canonical with the exact authorized merge commit.',
      { observed_merge_sha: mergeOid, observed_state: prData?.state || null },
    );
  }

  const fetched = commandText(
    deps,
    'git',
    ['fetch', '--quiet', 'origin', DEPLOY_BASE_BRANCH],
    { cwd: repositoryRoot },
  );
  if (!fetched.ok) return refusal('CANONICAL_FETCH_FAILED', 'D7 could not refresh the canonical branch.');

  const tip = commandText(
    deps,
    'git',
    ['rev-parse', 'origin/' + DEPLOY_BASE_BRANCH],
    { cwd: repositoryRoot },
  );
  if (!tip.ok || tip.stdout !== prepared.preview.merge_commit_sha) {
    return refusal(
      'DEPLOY_GRANT_STALE',
      'Canonical advanced after deploy authorization; authorize the current canonical tip instead.',
      { canonical_tip: tip.ok ? tip.stdout : null },
    );
  }

  const deploy = commandText(
    deps,
    '/bin/bash',
    [gate, 'deploy-maia', prepared.preview.merge_commit_sha],
    { cwd: repositoryRoot },
  );
  if (!deploy.ok) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_DEPLOY_VERSION,
      status: 'DEPLOY_FAILED',
      blockers: [blocker(
        'GOVERNED_DEPLOY_LANE_FAILED',
        'Existing pre-deploy/deploy lane returned non-zero.',
      )],
      merge_commit_sha: prepared.preview.merge_commit_sha,
      pull_request_number: prepared.preview.pull_request_number,
      exit_code: deploy.code,
      stdout_excerpt: deploy.stdout.slice(-8000),
      stderr_excerpt: deploy.stderr.slice(-8000),
      automatic_rollback: false,
    });
  }

  return deepFreeze({
    ok: true,
    version: DEVELOPMENT_DEPLOY_VERSION,
    status: 'DEPLOYED',
    blockers: [],
    repository: DEPLOY_REPOSITORY,
    base_branch: DEPLOY_BASE_BRANCH,
    pull_request_number: prepared.preview.pull_request_number,
    merge_commit_sha: prepared.preview.merge_commit_sha,
    deploy_entrypoint: 'scripts/pre-deploy-gate.sh deploy-maia',
    exit_code: 0,
    stdout_excerpt: deploy.stdout.slice(-8000),
    stderr_excerpt: deploy.stderr.slice(-8000),
    automatic_rollback: false,
    migration_performed_by_d7: false,
    restore_performed_by_d7: false,
  });
}
