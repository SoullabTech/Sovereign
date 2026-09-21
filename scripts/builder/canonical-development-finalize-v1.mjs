/**
 * JARVIS-CANONICAL-DEVELOPMENT-01 / D4
 *
 * Deterministic verification + local commit custody for an already-applied D3
 * worktree. Models never receive shell/git authority.
 *
 * D4 remains local:
 * - no push
 * - no pull request
 * - no merge
 * - no deploy
 * - no production access
 */

import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  readlinkSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { classifyDevelopmentWorkUnitV1 } from './canonical-development-v1.mjs';

export const DEVELOPMENT_VERIFY_VERSION = 'D4-VERIFY.v1';
export const DEVELOPMENT_COMMIT_VERSION = 'D4-COMMIT.v1';

const JARVIS_PATH_PREFIXES = Object.freeze([
  'jarvis-desktop/',
  'scripts/builder/',
]);
const JARVIS_EXACT_PATHS = Object.freeze([
  'scripts/ain-delegate.sh',
  'scripts/ain-worktree-claim.sh',
  'package.json',
]);
const CODE_EXTENSIONS = Object.freeze([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
]);

function blocker(code, detail, pathValue = null) {
  return Object.freeze({ code, detail, path: pathValue });
}
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function sha256(value) {
  return 'sha256:' + createHash('sha256').update(value).digest('hex');
}
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
  );
}
function digestObject(value) {
  return sha256(JSON.stringify(canonicalize(value)));
}
function sameStringSet(a, b) {
  const left = [...new Set(a || [])].sort();
  const right = [...new Set(b || [])].sort();
  return left.length === right.length && left.every((v, i) => v === right[i]);
}
function git(args, { cwd, encoding = 'utf8' } = {}) {
  return spawnSync('git', args, {
    cwd,
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
function changedRecords(worktree) {
  const out = git(
    ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
    { cwd: worktree },
  );
  if (out.status !== 0) return null;
  return String(out.stdout || '')
    .split('\0')
    .filter(Boolean)
    .map((entry) => ({ status: entry.slice(0, 2), path: entry.slice(3) }));
}
function measure(worktree) {
  if (!worktree || !existsSync(worktree)) return null;
  const head = gitText(['rev-parse', 'HEAD'], worktree);
  const records = changedRecords(worktree);
  if (!head || records == null) return null;
  const diff = git(['diff', '--binary', '--no-ext-diff', '--', '.'], { cwd: worktree });
  if (diff.status !== 0) return null;
  const diffText = String(diff.stdout || '');
  return {
    head_sha: head,
    changed_paths: [...new Set(records.map((r) => r.path))].sort(),
    diff_digest: sha256(diffText),
    diff_bytes: Buffer.byteLength(diffText, 'utf8'),
  };
}
function refusal(code, detail, extra = {}) {
  return deepFreeze({
    ok: false,
    blockers: [blocker(code, detail)],
    ...extra,
  });
}

export function deriveDevelopmentVerificationPlanV1(changedPaths = []) {
  const paths = [...new Set(changedPaths)].sort();
  const checks = [];

  const jarvis = paths.some((p) =>
    JARVIS_PATH_PREFIXES.some((prefix) => p.startsWith(prefix))
    || JARVIS_EXACT_PATHS.includes(p)
    || p === '.github/workflows/jarvis-runtime-proof.yml');
  if (jarvis) {
    checks.push('jarvis-proof', 'jarvis-desktop');
  }

  const database = paths.some((p) =>
    p.startsWith('database/migrations/')
    || p.startsWith('database/baseline/')
    || p.startsWith('prisma/'));
  if (database) checks.push('db-bootstrap');

  const typedCode = paths.some((p) =>
    CODE_EXTENSIONS.some((ext) => p.endsWith(ext))
    && !JARVIS_PATH_PREFIXES.some((prefix) => p.startsWith(prefix)));
  if (typedCode) checks.push('typecheck');

  return deepFreeze([...new Set(checks)]);
}

function validateAppliedState(workUnit, applyRecord) {
  const development = classifyDevelopmentWorkUnitV1(workUnit);
  if (!development.ok) {
    return { ok: false, blockers: development.blockers, measured: null };
  }
  if (!applyRecord || applyRecord.status !== 'APPLIED_UNCOMMITTED') {
    return {
      ok: false,
      blockers: [blocker('APPLIED_WORKTREE_REQUIRED', 'D4 requires a D3 APPLIED_UNCOMMITTED record.')],
      measured: null,
    };
  }
  if (applyRecord.work_unit_id !== workUnit.identity?.id) {
    return {
      ok: false,
      blockers: [blocker('WORK_UNIT_ID_MISMATCH', 'D4 apply record belongs to a different Work Unit.')],
      measured: null,
    };
  }
  if (applyRecord.base_sha !== workUnit.scope?.base_ref || applyRecord.head_sha !== workUnit.scope?.base_ref) {
    return {
      ok: false,
      blockers: [blocker('APPLY_BASE_SHA_MISMATCH', 'D4 apply record is not bound to the Work Unit base SHA.')],
      measured: null,
    };
  }
  const measured = measure(applyRecord.worktree);
  if (!measured) {
    return {
      ok: false,
      blockers: [blocker('WORKTREE_MEASUREMENT_FAILED', 'D4 could not measure the applied worktree.')],
      measured: null,
    };
  }
  if (measured.head_sha !== applyRecord.head_sha
    || measured.diff_digest !== applyRecord.diff_digest
    || !sameStringSet(measured.changed_paths, applyRecord.changed_paths)) {
    return {
      ok: false,
      blockers: [blocker('APPLY_RECORD_STALE', 'Applied worktree no longer matches the D3 record.')],
      measured,
    };
  }
  return { ok: true, blockers: [], measured };
}

function defaultRunCheck(check, context, deps = {}) {
  const nodeBinary = deps.nodeBinary || 'node';
  const script = path.join(context.worktree, 'scripts', 'builder', 'run-check.mjs');
  const out = (deps.spawnSync || spawnSync)(
    nodeBinary,
    [
      script,
      check,
      '--cwd', context.worktree,
      '--work-unit', context.workUnitId,
      '--json',
    ],
    {
      cwd: context.worktree,
      encoding: 'utf8',
      env: deps.env || process.env,
      maxBuffer: 8 * 1024 * 1024,
      shell: false,
    },
  );

  let parsed = null;
  try {
    parsed = JSON.parse(String(out.stdout || ''));
  } catch {
    parsed = null;
  }
  return {
    check,
    status: parsed?.status || (out.status === 0 ? 'PASS' : 'FAIL'),
    exit_code: Number.isInteger(parsed?.exit_code) ? parsed.exit_code
      : Number.isInteger(out.status) ? out.status : 1,
    duration_ms: parsed?.duration_ms ?? null,
    evidence: parsed || {
      stdout: String(out.stdout || '').slice(-4000),
      stderr: String(out.stderr || '').slice(-4000),
    },
  };
}

function withDependencyLink(repositoryRoot, worktree, fn) {
  const source = path.join(repositoryRoot, 'node_modules');
  const target = path.join(worktree, 'node_modules');

  if (!existsSync(source)) {
    return refusal(
      'DEPENDENCIES_UNAVAILABLE',
      'Governed verification requires repositoryRoot/node_modules from the locked install.',
    );
  }
  if (existsSync(target) || lstatMaybe(target)) {
    return refusal(
      'WORKTREE_NODE_MODULES_PRESENT',
      'D4 refuses an existing worktree node_modules path because its provenance is unknown.',
    );
  }

  symlinkSync(source, target, 'dir');
  try {
    return fn();
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
}
function lstatMaybe(target) {
  try {
    lstatSync(target);
    return true;
  } catch {
    return false;
  }
}

export function verifyDevelopmentWorktreeV1({
  repositoryRoot,
  workUnit,
  applyRecord,
} = {}, deps = {}) {
  const validated = validateAppliedState(workUnit, applyRecord);
  if (!validated.ok) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_VERIFY_VERSION,
      status: 'REFUSED',
      blockers: validated.blockers,
    });
  }

  const plan = deriveDevelopmentVerificationPlanV1(applyRecord.changed_paths);
  const run = deps.runCheck || ((check, context) => defaultRunCheck(check, context, deps));
  const execute = () => {
    const results = [];
    for (const check of plan) {
      const result = run(check, {
        repositoryRoot,
        worktree: applyRecord.worktree,
        workUnitId: workUnit.identity.id,
        workUnit,
        applyRecord,
      });
      results.push(result);
      if (result?.status !== 'PASS' || result?.exit_code !== 0) break;
    }

    const after = measure(applyRecord.worktree);
    if (!after
      || after.head_sha !== validated.measured.head_sha
      || after.diff_digest !== validated.measured.diff_digest
      || !sameStringSet(after.changed_paths, validated.measured.changed_paths)) {
      return refusal(
        'VERIFICATION_MUTATED_WORKTREE',
        'Verification changed the governed worktree; prior results cannot attest the new bytes.',
        { results },
      );
    }

    const passed = results.length === plan.length
      && results.every((r) => r?.status === 'PASS' && r?.exit_code === 0);
    const core = {
      version: DEVELOPMENT_VERIFY_VERSION,
      work_unit_id: workUnit.identity.id,
      base_sha: workUnit.scope.base_ref,
      branch: applyRecord.branch,
      worktree: applyRecord.worktree,
      changed_paths: [...applyRecord.changed_paths].sort(),
      diff_digest: applyRecord.diff_digest,
      verification_plan: [...plan],
      results,
      status: passed ? 'PASS' : 'FAIL',
    };
    return deepFreeze({
      ok: passed,
      ...core,
      receipt_digest: digestObject(core),
      blockers: passed ? [] : [blocker(
        'DEVELOPMENT_VERIFICATION_FAILED',
        'At least one governed development verification check failed.',
      )],
    });
  };

  if (plan.length === 0 || deps.runCheck) return execute();
  return withDependencyLink(repositoryRoot, applyRecord.worktree, execute);
}

function validReceipt(receipt) {
  if (!receipt || receipt.version !== DEVELOPMENT_VERIFY_VERSION) return false;
  const {
    receipt_digest,
    ok: _ok,
    blockers: _blockers,
    ...core
  } = receipt;
  return receipt_digest === digestObject(core);
}

function safeCommitMessage(workUnit) {
  const objective = String(workUnit?.identity?.objective || 'bounded development change')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 64);
  return 'jarvis: ' + (objective || 'bounded development change');
}

export function commitDevelopmentWorktreeV1({
  workUnit,
  applyRecord,
  verificationReceipt,
} = {}) {
  const validated = validateAppliedState(workUnit, applyRecord);
  if (!validated.ok) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_COMMIT_VERSION,
      status: 'REFUSED',
      blockers: validated.blockers,
    });
  }
  if (!validReceipt(verificationReceipt)) {
    return refusal(
      'VERIFICATION_RECEIPT_DIGEST_MISMATCH',
      'D4 commit requires an untampered verification receipt.',
      { version: DEVELOPMENT_COMMIT_VERSION, status: 'REFUSED' },
    );
  }
  if (verificationReceipt.status !== 'PASS' || verificationReceipt.ok !== true) {
    return refusal(
      'PASS_VERIFICATION_REQUIRED',
      'D4 commit requires a PASS verification receipt.',
      { version: DEVELOPMENT_COMMIT_VERSION, status: 'REFUSED' },
    );
  }
  if (verificationReceipt.work_unit_id !== workUnit.identity.id
    || verificationReceipt.base_sha !== workUnit.scope.base_ref
    || verificationReceipt.branch !== applyRecord.branch
    || verificationReceipt.worktree !== applyRecord.worktree
    || verificationReceipt.diff_digest !== applyRecord.diff_digest
    || !sameStringSet(verificationReceipt.changed_paths, applyRecord.changed_paths)) {
    return refusal(
      'VERIFICATION_RECEIPT_SCOPE_MISMATCH',
      'Verification receipt does not identify the exact applied worktree.',
      { version: DEVELOPMENT_COMMIT_VERSION, status: 'REFUSED' },
    );
  }

  const current = measure(applyRecord.worktree);
  if (!current
    || current.head_sha !== workUnit.scope.base_ref
    || current.diff_digest !== verificationReceipt.diff_digest
    || !sameStringSet(current.changed_paths, verificationReceipt.changed_paths)) {
    return refusal(
      'VERIFICATION_STALE',
      'Worktree changed after verification; commit requires a fresh receipt.',
      { version: DEVELOPMENT_COMMIT_VERSION, status: 'REFUSED' },
    );
  }

  const staged = git(['add', '--', ...verificationReceipt.changed_paths], { cwd: applyRecord.worktree });
  if (staged.status !== 0) {
    return refusal(
      'GIT_ADD_FAILED',
      'D4 could not stage the verified changed-path set.',
      { version: DEVELOPMENT_COMMIT_VERSION, status: 'REFUSED' },
    );
  }

  const cachedCheck = git(['diff', '--cached', '--check'], { cwd: applyRecord.worktree });
  if (cachedCheck.status !== 0) {
    return refusal(
      'STAGED_DIFF_CHECK_FAILED',
      'Staged bytes fail git diff --cached --check.',
      { version: DEVELOPMENT_COMMIT_VERSION, status: 'REFUSED' },
    );
  }
  const names = git(
    ['diff', '--cached', '--name-only', '-z'],
    { cwd: applyRecord.worktree },
  );
  if (names.status !== 0) {
    return refusal(
      'STAGED_PATH_MEASUREMENT_FAILED',
      'D4 could not measure staged paths.',
      { version: DEVELOPMENT_COMMIT_VERSION, status: 'REFUSED' },
    );
  }
  const stagedPaths = String(names.stdout || '').split('\0').filter(Boolean).sort();
  if (!sameStringSet(stagedPaths, verificationReceipt.changed_paths)) {
    return refusal(
      'STAGED_PATH_SCOPE_MISMATCH',
      'Staged path population differs from the verified path population.',
      { version: DEVELOPMENT_COMMIT_VERSION, status: 'REFUSED' },
    );
  }

  const committed = git(
    ['commit', '-m', safeCommitMessage(workUnit)],
    { cwd: applyRecord.worktree },
  );
  if (committed.status !== 0) {
    return refusal(
      'LOCAL_COMMIT_FAILED',
      'D4 could not create the local commit: ' + String(committed.stderr || committed.stdout || '').trim(),
      { version: DEVELOPMENT_COMMIT_VERSION, status: 'REFUSED' },
    );
  }

  const commitSha = gitText(['rev-parse', 'HEAD'], applyRecord.worktree);
  const clean = gitText(['status', '--porcelain'], applyRecord.worktree);
  if (!/^[0-9a-f]{40}$/i.test(String(commitSha || '')) || clean !== '') {
    return refusal(
      'POST_COMMIT_STATE_INVALID',
      'D4 commit completed but the resulting worktree state is not exact and clean.',
      { version: DEVELOPMENT_COMMIT_VERSION, status: 'REFUSED' },
    );
  }

  return deepFreeze({
    ok: true,
    version: DEVELOPMENT_COMMIT_VERSION,
    status: 'COMMITTED_LOCAL',
    blockers: [],
    work_unit_id: workUnit.identity.id,
    base_sha: workUnit.scope.base_ref,
    branch: applyRecord.branch,
    worktree: applyRecord.worktree,
    commit_sha: commitSha,
    verified_diff_digest: verificationReceipt.diff_digest,
    verification_receipt_digest: verificationReceipt.receipt_digest,
    push_performed: false,
    pull_request_created: false,
    merge_performed: false,
    deploy_performed: false,
  });
}
