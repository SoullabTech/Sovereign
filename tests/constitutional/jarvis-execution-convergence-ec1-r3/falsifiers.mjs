import { BASE, scenario } from './contract.mjs';

const pass = (id, failures) => ({ id, pass: failures.length === 0, failures });
const checkBool = (id, fn, lawful, hostile, label) => {
  const f = [];
  if (!fn(lawful)) f.push('lawful candidate refused');
  if (fn(hostile)) f.push(label);
  return pass(id, f);
};

export function C1(d) {
  return checkBool('EC1-C1', d.workBound, BASE, scenario({ grant_work_unit_id: 'wu-other' }),
    'candidate from another Work was admitted');
}
export function C2(d) {
  return checkBool('EC1-C2', d.grantBound, BASE, scenario({ attempt_grant_id: 'grant-other' }),
    'attempt was detached from its execution grant');
}
export function C3(d) {
  const f = [];
  if (!d.baseBound(BASE)) f.push('lawful base lineage refused');
  for (const hostile of [
    scenario({ result_starting_sha: 'c'.repeat(40) }),
    scenario({ diff_base_ref: 'c'.repeat(40) }),
    scenario({ git_parent_sha: 'c'.repeat(40) }),
  ]) if (d.baseBound(hostile)) f.push('mismatched authorized base admitted');
  return pass('EC1-C3', f);
}
export function C4(d) {
  return checkBool('EC1-C4', d.admissionValid, BASE,
    scenario({ patch_code: 'PATCH_APPLIED', patch_applied: false }),
    'candidate standing acquired without an applied NPA1 effect');
}
export function C5(d) {
  const f = [];
  if (!d.patchBound(BASE)) f.push('lawful patch identity refused');
  for (const hostile of [
    scenario({ diff_digest: 'sha256:other' }),
    scenario({ durable_patch_digest: 'sha256:other' }),
  ]) if (d.patchBound(hostile)) f.push('patch identity substitution admitted');
  return pass('EC1-C5', f);
}
export function C6(d) {
  const f = [];
  if (!d.pathsBound(BASE)) f.push('lawful changed-path set refused');
  for (const hostile of [
    scenario({ git_paths: ['src/a.ts', 'src/hidden.ts'] }),
    scenario({ result_paths: [] }),
  ]) if (d.pathsBound(hostile)) f.push('changed-path disagreement admitted');
  return pass('EC1-C6', f);
}
export function C7(d) {
  const f = [];
  if (!d.candidateBound(BASE)) f.push('lawful single candidate refused');
  for (const hostile of [
    scenario({ commit_count: 2 }),
    scenario({ commit_sha: 'c'.repeat(40) }),
    scenario({ diff_head_ref: 'c'.repeat(40) }),
  ]) if (d.candidateBound(hostile)) f.push('non-unique or mismatched candidate admitted');
  return pass('EC1-C7', f);
}
export function C8(d) {
  return checkBool('EC1-C8', d.custodyValid, BASE,
    scenario({ author: 'QWEN <model@local.invalid>' }),
    'non-JARVIS candidate custody admitted');
}
export function C9(d) {
  const f = [];
  if (!d.verifierIndependent(BASE)) f.push('lawful verifier refused');
  for (const hostile of [
    scenario({ verifier_attempt_id: 'attempt-1' }),
    scenario({ verifier_parent_id: 'attempt-other' }),
    scenario({ verifier_kind: 'primary' }),
  ]) if (d.verifierIndependent(hostile)) f.push('self/non-independent verification admitted');
  return pass('EC1-C9', f);
}
export function C10(d) {
  const f = [];
  if (!d.verifierBound(BASE)) f.push('lawful verifier evidence refused');
  for (const hostile of [
    scenario({ verifier_candidate_sha: 'c'.repeat(40) }),
    scenario({ verifier_patch_digest: 'sha256:other' }),
  ]) if (d.verifierBound(hostile)) f.push('verification from another candidate/effect admitted');
  return pass('EC1-C10', f);
}
export function C11(d) {
  const f = [];
  const r = d.recoverCompleted(BASE);
  if (r?.disposition !== 'CONVERGE') f.push(`completed candidate did not converge: ${r?.disposition}`);
  if (JSON.stringify(r?.actions) !== JSON.stringify(['RECORD_EXISTING'])) {
    f.push(`completed candidate caused wrong actions: ${JSON.stringify(r?.actions)}`);
  }
  return pass('EC1-C11', f);
}
export function C12(d) {
  const f = [];
  const r = d.recoverUnknown(BASE);
  if (r?.disposition !== 'BLOCKED_BY_EVIDENCE') f.push(`unknown effect became ${r?.disposition}`);
  if ((r?.actions || []).length !== 0) f.push(`unknown effect caused actions: ${JSON.stringify(r.actions)}`);
  return pass('EC1-C12', f);
}

export const FALSIFIERS = Object.freeze({
  'EC1-C1': C1, 'EC1-C2': C2, 'EC1-C3': C3, 'EC1-C4': C4,
  'EC1-C5': C5, 'EC1-C6': C6, 'EC1-C7': C7, 'EC1-C8': C8,
  'EC1-C9': C9, 'EC1-C10': C10, 'EC1-C11': C11, 'EC1-C12': C12,
});
