/**
 * JARVIS Durable Result Mapper V1 — pure deterministic result-to-attempt status.
 *
 * Boundary:
 * - no filesystem/network/environment/credentials
 * - no Work Unit mutation
 * - no lifecycle transition
 * - no authority mutation
 * - wrapper/process status is observable but never authoritative over durable result
 */

export const DURABLE_RESULT_MAPPER_VERSION = 'DR1.v1';

export const ATTEMPT_STATUSES = Object.freeze([
  'completed',
  'failed',
  'refused',
  'rejected',
  'insufficient',
  'escalated',
]);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function integerOrNull(value) {
  return Number.isInteger(value) ? value : null;
}

function outcome(status, precedence, reasonCodes, input) {
  return deepFreeze({
    mapper_version: DURABLE_RESULT_MAPPER_VERSION,
    status,
    precedence,
    reason_codes: Object.freeze([...reasonCodes]),
    wrapper_exit_code_observed: integerOrNull(input?.wrapper_exit_code),
    durable_exit_code: integerOrNull(input?.durable_result?.exit_code),
    durable_result_precedence: true,
    authority_effect: 'none',
    lifecycle_effect: 'none',
  });
}

/**
 * Deterministic precedence:
 *
 * 1. provider admission refusal
 * 2. durable nonzero exit_code
 * 3. durable recommended_next_action=reject
 * 4. durable evidence_sufficient=false
 * 5. durable escalation_required=true
 * 6. durable exit_code=0 -> completed
 * 7. otherwise structurally insufficient
 *
 * Unknown fields are ignored. They cannot widen standing or authority.
 */
export function mapDurableResultToAttemptStatus(input = {}) {
  const admission = isObject(input.provider_admission) ? input.provider_admission : null;
  const result = isObject(input.durable_result) ? input.durable_result : null;

  if (admission && admission.ok === false) {
    return outcome('refused', 1, ['PROVIDER_ADMISSION_REFUSED'], input);
  }

  if (result && Number.isInteger(result.exit_code) && result.exit_code !== 0) {
    return outcome('failed', 2, ['DURABLE_NONZERO_EXIT'], input);
  }

  if (result && result.recommended_next_action === 'reject') {
    return outcome('rejected', 3, ['DURABLE_RECOMMENDED_REJECT'], input);
  }

  if (result && result.evidence_sufficient === false) {
    return outcome('insufficient', 4, ['DURABLE_EVIDENCE_INSUFFICIENT'], input);
  }

  if (result && result.escalation_required === true) {
    return outcome('escalated', 5, ['DURABLE_ESCALATION_REQUIRED'], input);
  }

  if (result && result.exit_code === 0) {
    return outcome('completed', 6, ['DURABLE_COMPLETED'], input);
  }

  return outcome('insufficient', 7, ['DURABLE_RESULT_STRUCTURALLY_INSUFFICIENT'], input);
}
