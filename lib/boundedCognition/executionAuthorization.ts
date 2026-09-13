/**
 * BCS-01A · W-P10 — invalidation is not authorization (FR-J9 §10).
 *
 * Staleness creates a REASON to recompute. It does not create PERMISSION.
 * Re-execution requires either a commission that explicitly authorizes maintained
 * computation within its scope, or a new authorization act.
 *
 * This module deliberately cannot be satisfied by a currency value: `Currency`
 * is not an input here, and there is no code path from a measurement to an
 * enqueue (F-J9.9).
 */

import type { ExecutionJurisdiction } from './permission';

export interface Commission {
  readonly commissionId: string;
  readonly workId: string;
  readonly purpose: string;
  readonly maxJurisdiction: ExecutionJurisdiction;
  /**
   * A one-shot commission authorizes exactly one execution. FR-J9 §10 also
   * permits a commission that explicitly authorizes maintained/repeated
   * computation; this proving workload uses one-shot only, and does not
   * introduce standing maintenance merely to exercise the alternative.
   */
  readonly maintained: false;
  readonly consumed: boolean;
}

export interface ExecutionRequest {
  readonly workId: string;
  readonly requestedJurisdiction: ExecutionJurisdiction;
  /** An explicit act by an actor — never a measurement, never a scheduler tick. */
  readonly requestedBy: string;
}

export type AuthorizationResult =
  | { ok: true; commissionId: string }
  | {
      ok: false;
      refusal:
        | 'no_commission'
        | 'commission_consumed'
        | 'scope_mismatch'
        | 'exceeds_frozen_ceiling';
    };

const BREADTH: Readonly<Record<ExecutionJurisdiction, number>> = { sovereign: 0, external: 1 };

/**
 * The only door to an execution. A currency transition cannot reach it, because
 * a currency value is not an accepted input.
 */
export function authorizeExecution(
  commission: Commission | null,
  request: ExecutionRequest,
): AuthorizationResult {
  if (!commission) return { ok: false, refusal: 'no_commission' };
  if (commission.consumed) return { ok: false, refusal: 'commission_consumed' };
  if (commission.workId !== request.workId) return { ok: false, refusal: 'scope_mismatch' };
  if (BREADTH[request.requestedJurisdiction] > BREADTH[commission.maxJurisdiction]) {
    return { ok: false, refusal: 'exceeds_frozen_ceiling' };
  }
  return { ok: true, commissionId: commission.commissionId };
}
