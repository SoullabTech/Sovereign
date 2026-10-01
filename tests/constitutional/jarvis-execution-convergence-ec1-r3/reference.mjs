import { sameSet } from './contract.mjs';

export const REFERENCE = Object.freeze({
  workBound(s) {
    return s.work_unit_id === s.grant_work_unit_id;
  },
  grantBound(s) {
    return s.grant_id === s.attempt_grant_id;
  },
  baseBound(s) {
    return s.authorized_base === s.result_starting_sha
      && s.authorized_base === s.diff_base_ref
      && s.authorized_base === s.git_parent_sha;
  },
  admissionValid(s) {
    return s.patch_code === 'PATCH_APPLIED' && s.patch_applied === true;
  },
  patchBound(s) {
    return s.patch_digest === s.diff_digest
      && s.patch_digest === s.durable_patch_digest;
  },
  pathsBound(s) {
    return sameSet(s.admission_paths, s.result_paths)
      && sameSet(s.admission_paths, s.git_paths);
  },
  candidateBound(s) {
    return s.commit_count === 1
      && s.result_ending_sha === s.diff_head_ref
      && s.result_ending_sha === s.commit_sha;
  },
  custodyValid(s) {
    const jarvis = 'JARVIS <jarvis@local.invalid>';
    return s.author === jarvis && s.committer === jarvis;
  },
  verifierIndependent(s) {
    return s.verifier_attempt_id !== s.coding_attempt_id
      && s.verifier_kind === 'deterministic_verification'
      && s.verifier_parent_id === s.coding_attempt_id
      && s.verifier_target_id === s.coding_attempt_id
      && s.verifier_actor === 'system:jarvis-verifier';
  },
  verifierBound(s) {
    return s.verifier_candidate_sha === s.commit_sha
      && s.verifier_patch_digest === s.patch_digest;
  },
  recoverCompleted() {
    return { disposition: 'CONVERGE', actions: ['RECORD_EXISTING'] };
  },
  recoverUnknown() {
    return { disposition: 'BLOCKED_BY_EVIDENCE', actions: [] };
  },
});
