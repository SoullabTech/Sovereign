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
 * @returns {{execution_lane: 'C0'|'C1'|'C3', cost_class: string, reason: string, task: object, status: 'routed', verification_required: boolean}}
 */
export function route(task) {
  if (task.capability && Object.prototype.hasOwnProperty.call(CAPABILITIES, task.capability)) {
    return {
      execution_lane: 'C0',
      cost_class: COST_CLASS.C0,
      reason: `Deterministic capability '${task.capability}' is registered; no model required.`,
      task,
      status: 'routed',
      verification_required: true,
    };
  }

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
