export const LAW_IDS = Object.freeze([
  'EC1-C1','EC1-C2','EC1-C3','EC1-C4','EC1-C5','EC1-C6',
  'EC1-C7','EC1-C8','EC1-C9','EC1-C10','EC1-C11','EC1-C12',
]);

export const BASE = Object.freeze({
  work_unit_id: 'wu-ec1',
  grant_work_unit_id: 'wu-ec1',
  grant_id: 'grant-1',
  attempt_grant_id: 'grant-1',
  authorized_base: 'a'.repeat(40),
  result_starting_sha: 'a'.repeat(40),
  diff_base_ref: 'a'.repeat(40),
  git_parent_sha: 'a'.repeat(40),
  patch_code: 'PATCH_APPLIED',
  patch_applied: true,
  patch_digest: 'sha256:patch-1',
  diff_digest: 'sha256:patch-1',
  durable_patch_digest: 'sha256:patch-1',
  admission_paths: ['src/a.ts'],
  result_paths: ['src/a.ts'],
  git_paths: ['src/a.ts'],
  result_ending_sha: 'b'.repeat(40),
  diff_head_ref: 'b'.repeat(40),
  commit_sha: 'b'.repeat(40),
  commit_count: 1,
  author: 'JARVIS <jarvis@local.invalid>',
  committer: 'JARVIS <jarvis@local.invalid>',
  coding_attempt_id: 'attempt-1',
  verifier_attempt_id: 'verify-1',
  verifier_parent_id: 'attempt-1',
  verifier_target_id: 'attempt-1',
  verifier_kind: 'deterministic_verification',
  verifier_actor: 'system:jarvis-verifier',
  verifier_candidate_sha: 'b'.repeat(40),
  verifier_patch_digest: 'sha256:patch-1',
});

export function scenario(patch = {}) {
  return { ...BASE, ...patch };
}

export const sameSet = (a, b) =>
  JSON.stringify([...(a || [])].sort()) === JSON.stringify([...(b || [])].sort());
