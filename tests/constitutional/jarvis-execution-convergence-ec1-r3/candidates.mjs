import { REFERENCE } from './reference.mjs';

const make = (id, law, named, overrides, collateral = {}) =>
  Object.freeze({
    id, law, named,
    decisions: Object.freeze({ ...REFERENCE, ...overrides }),
    collateral: Object.freeze(collateral),
  });

export const CANDIDATES = Object.freeze([
  make('DC-1', 'cross-Work evidence is accepted', 'EC1-C1', {
    workBound() { return true; },
  }),
  make('DC-2', 'candidate standing ignores execution-grant identity', 'EC1-C2', {
    grantBound() { return true; },
  }),
  make('DC-3', 'candidate base is trusted from any one surface', 'EC1-C3', {
    baseBound() { return true; },
  }),
  make('DC-4', 'a Git candidate can stand without NPA1 APPLIED evidence', 'EC1-C4', {
    admissionValid() { return true; },
  }),
  make('DC-5', 'patch digests are advisory rather than identity-bearing', 'EC1-C5', {
    patchBound() { return true; },
  }),
  make('DC-6', 'changed paths may differ across admission/result/Git', 'EC1-C6', {
    pathsBound() { return true; },
  }),
  make('DC-7', 'multiple or mismatched candidate commits may represent one attempt', 'EC1-C7', {
    candidateBound() { return true; },
  }),
  make('DC-8', 'commit existence substitutes for JARVIS custody', 'EC1-C8', {
    custodyValid() { return true; },
  }),
  make('DC-9', 'the coding attempt may verify itself', 'EC1-C9', {
    verifierIndependent() { return true; },
  }),
  make('DC-10', 'verification may refer to another candidate/patch', 'EC1-C10', {
    verifierBound() { return true; },
  }),
  make('DC-11', 'recovery reruns a completed candidate effect', 'EC1-C11', {
    recoverCompleted() {
      return { disposition: 'RERUN_CODING', actions: ['RUN_QWEN', 'APPLY_PATCH', 'COMMIT'] };
    },
  }),
  make('DC-12', 'UNKNOWN is treated as effect absence and rerun', 'EC1-C12', {
    recoverUnknown() {
      return { disposition: 'RERUN_CODING', actions: ['RUN_QWEN', 'APPLY_PATCH', 'COMMIT'] };
    },
  }),
  make('DC-13', 'safety by inertness: every interrupted completed candidate is blocked forever', 'EC1-C11', {
    recoverCompleted() {
      return { disposition: 'BLOCKED_BY_EVIDENCE', actions: [] };
    },
  }),
]);
