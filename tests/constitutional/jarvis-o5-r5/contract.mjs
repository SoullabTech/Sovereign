export const SATISFIED_DEPENDENCY_STATE = 'CLOSED';
export const ELIGIBLE_OWN_STATE = 'ROUTED';
export const EVIDENCE_GATE = 'BLOCKED_BY_EVIDENCE';
export const BINDING_FIELDS = Object.freeze([
  'graph_id','graph_digest','planned_work_unit_id','canonical_work_unit_id','bound_at_sha',
]);
export const READINESS_STATUSES = Object.freeze(['READY','BLOCKED','INELIGIBLE']);
