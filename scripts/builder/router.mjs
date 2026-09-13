// JARVIS — minimal cost router (Alpha).
//
// Routing law (founder directive 2026-08-11, Minimal Router -> Desktop Alpha):
//   IF task can be answered by a deterministic capability -> C0
//   ELSE IF task is bounded and fits the local worker      -> C1
//   ELSE                                                    -> C3
//
// Deliberately NOT an intent classifier. It does not read task prose and
// guess. A task states its own capability (checked against the real
// deterministic.mjs registry) or declares itself bounded_for_local. Anything
// else escalates. No C2 lane exists at this stage (no Kimi/DeepSeek/GPT-OSS
// dependency for Alpha).
import { CAPABILITIES } from './deterministic.mjs';
import { isRoutable } from './routing-eligibility.mjs';

// ── JOP-04 RB-6A · host-brand reconciliation (Option B) ──────────────────────
// The producer and the consumer of routing eligibility must obtain their private
// identity from ONE authoritative module lineage BY CONSTRUCTION — not by a
// loading convention. `isRoutable` above and the producer below resolve to the
// SAME static specifier, so a host that imports this graph mints and tests
// through one lineage however this module itself was loaded.
//
// ⭐ This is a PURE RE-EXPORT: the producer is never bound into this module's
//    scope. The router therefore CANNOT self-mint — structurally, not by
//    discipline. The law it upholds:
//        router MAY expose the trusted producer to the host
//        router MAY NOT use that producer to authorize its own routing decision
export { declareRoutingEligibility } from './routing-eligibility.mjs';

export const COST_CLASS = { C0: 'deterministic', C1: 'local_model', C3: 'frontier_model' };

// Alpha bound: keep local-worker packets small enough that a 65536-token
// context window (scripts/ain-delegate.sh's CLAUDE_CODE_MAX_CONTEXT_TOKENS
// for the local lane) is never in question. This router does not itself
// invoke a model — callers who select C1 are responsible for staying under
// this bound and shrinking on CONTEXT_OVERFLOW, never escalating for that
// reason alone (explicit founder instruction).
export const C1_MAX_INPUT_CHARS = 4000;

/**
 * @param {object} task
 * @param {string} [task.capability] - a name to check against deterministic.mjs's CAPABILITIES
 * @param {boolean} [task.bounded_for_local] - caller asserts the task is small and local-worker-shaped
 * @param {number} [task.input_chars] - size of the actual input, checked against C1_MAX_INPUT_CHARS
 * @param {object} [routingEligibility] - JOP-04 RB-6A. The one fact routing needs that it
 *   CANNOT derive from the registry. Produced by routing-eligibility.mjs and unforgeable by
 *   assertion. Absent or unsatisfied ⇒ a REGISTERED capability is NOT ROUTABLE.
 *   ⛔ This is placement eligibility, never execution authority (RB-6B).
 * @returns {{execution_lane: 'C0'|'C1'|'C3'|null, cost_class: string|null, reason: string, task: object, status: string, verification_required: boolean}}
 */
export function route(task, routingEligibility) {
  // ── ROUTING JUDGMENT ─────────────────────────────────────────────────────
  // JOP-04 RB-6A: the router's own refusals are evaluated BEFORE any placement
  // grant. Registration must not preempt routing judgment — previously a
  // registered name returned C0 above this point and never reached the
  // router's one legitimate refusal.
  if (task.bounded_for_local === true) {
    const size = task.input_chars ?? 0;
    if (size > C1_MAX_INPUT_CHARS) {
      // Explicit founder rule: do not escalate merely because the packet is
      // oversized. The caller must shrink it. Routing itself refuses rather
      // than silently promoting to C3.
      return {
        execution_lane: null,
        cost_class: null,
        reason: `Task declared bounded_for_local but input_chars (${size}) exceeds C1_MAX_INPUT_CHARS (${C1_MAX_INPUT_CHARS}). Shrink the packet — do not escalate for size alone.`,
        task,
        status: 'rejected_oversized',
        verification_required: false,
      };
    }
  }

  // Registration is NECESSARY and INSUFFICIENT. Membership identifies the
  // instrument; it confers no placement.
  if (task.capability && Object.prototype.hasOwnProperty.call(CAPABILITIES, task.capability)) {
    if (!isRoutable(routingEligibility)) {
      return {
        execution_lane: null,
        cost_class: null,
        reason: `Capability '${task.capability}' is registered, but no satisfied routing eligibility was supplied. Registration identifies an instrument; it does not grant routing.`,
        task,
        status: 'refused_not_routable',
        verification_required: false,
      };
    }
    return {
      execution_lane: 'C0',
      cost_class: COST_CLASS.C0,
      reason: `Deterministic capability '${task.capability}' is registered AND routing eligibility is satisfied (basis: ${routingEligibility.basis}); no model required.`,
      task,
      status: 'routed',
      verification_required: true,
    };
  }

  if (task.bounded_for_local === true) {
    return {
      execution_lane: 'C1',
      cost_class: COST_CLASS.C1,
      reason: 'Task is bounded and local-worker-shaped; no deterministic capability applies.',
      task,
      status: 'routed',
      verification_required: true,
    };
  }

  return {
    execution_lane: 'C3',
    cost_class: COST_CLASS.C3,
    reason: 'No deterministic capability matched and task is not declared bounded-for-local; requires frontier-model reasoning.',
    task,
    status: 'routed',
    verification_required: true,
  };
}
