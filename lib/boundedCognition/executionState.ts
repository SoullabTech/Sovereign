/**
 * BCS-01A · W-P7 — a cancellation REQUEST is not a cancellation.
 *
 * Two predicates, kept apart (FR-J9 §7):
 *   cancel-request  a legitimate actor asked this execution to stop
 *   cancelled       execution ACTUALLY terminated early because of an accepted request
 *
 * The interval between them must be witnessable, so the request is recorded on a
 * running execution WITHOUT changing its status. Only the execution path itself
 * may move the status, when it reaches a cancellation boundary.
 *
 * No persistence here. Step 2 proves the state semantics; durable execution is a
 * later step and must not have its state model fixed by a provisional migration.
 */

export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled';

/** Who asked, when, under what authority — answerable (FR-J9 §7). */
export interface CancelRequest {
  readonly requestedBy: string;
  readonly authority: string;
  readonly requestedAt: string;
  readonly reason?: string;
}

export interface ExecutionState {
  readonly executionId: string;
  readonly status: ExecutionStatus;
  readonly cancelRequest?: CancelRequest;
}

const TERMINAL: ReadonlySet<ExecutionStatus> = new Set<ExecutionStatus>([
  'completed',
  'failed',
  'cancelled',
]);

export const isTerminal = (s: ExecutionStatus): boolean => TERMINAL.has(s);

export type StateResult =
  | { ok: true; state: ExecutionState }
  | { ok: false; refusal: 'already_terminal' | 'no_cancel_request' | 'not_running' };

/**
 * Record the request. The status is deliberately untouched — a request being
 * written is never sufficient to claim `cancelled` (F-J9.7).
 *
 * A completed execution cannot be retroactively cancelled; withdrawal or
 * retirement of completed outputs is a separate responsibility, not decided here.
 */
export function recordCancelRequest(state: ExecutionState, request: CancelRequest): StateResult {
  if (isTerminal(state.status)) return { ok: false, refusal: 'already_terminal' };
  return { ok: true, state: { ...state, cancelRequest: request } };
}

/**
 * The execution path reached its cancellation boundary and stopped. This is the
 * only transition that may produce `cancelled`, and it requires an actual
 * accepted request to exist.
 */
export function observeCancellation(state: ExecutionState): StateResult {
  if (isTerminal(state.status)) return { ok: false, refusal: 'already_terminal' };
  if (state.status !== 'running') return { ok: false, refusal: 'not_running' };
  if (!state.cancelRequest) return { ok: false, refusal: 'no_cancel_request' };
  return { ok: true, state: { ...state, status: 'cancelled' } };
}

/** Normal execution terminus against the frozen scope (FR-J9 §8). */
export function completeExecution(state: ExecutionState): StateResult {
  if (isTerminal(state.status)) return { ok: false, refusal: 'already_terminal' };
  return { ok: true, state: { ...state, status: 'completed' } };
}
