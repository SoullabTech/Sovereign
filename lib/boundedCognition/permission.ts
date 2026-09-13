/**
 * BCS-01A · W-P3 — effective permission is frozen ceiling ∩ current protection,
 * evaluated AT THE MOMENT OF THE GOVERNED ACT.
 *
 * NOT A COMPONENT. This directory is a location, not a runtime actor: there is no
 * manager, no service, no orchestration object, and no barrel that assembles one
 * (FR-J6; BCS-M1 §8 — "bounded cognition" ≠ one bounded-cognition service).
 *
 * WHY A PROVIDER AND NOT A VALUE. The authorization is `frozen ∩ current`, and
 * `current` must be re-read at each crossing. If this function took a protection
 * VALUE, an execution could read protection once at T0 and satisfy the type
 * forever — which is exactly the P3 failure (F-J9.2). Taking a provider makes the
 * re-read structural rather than disciplinary.
 *
 * THE CALLER DOES NOT SUPPLY PERMISSION. `requested` is a capability request; the
 * provider and the frozen commission are the authority (FR-J7 §7).
 */

/** Execution jurisdiction classes (FR-J7 §2). Ordered by egress breadth. */
export type ExecutionJurisdiction = 'sovereign' | 'external';

const BREADTH: Readonly<Record<ExecutionJurisdiction, number>> = {
  sovereign: 0,
  external: 1,
};

/** The frozen commission's authorization ceiling (FR-J9 §4). */
export interface FrozenAuthorization {
  readonly commissionId: string;
  /** Maximum execution jurisdiction the commission authorized when frozen. */
  readonly maxJurisdiction: ExecutionJurisdiction;
}

/**
 * Current protection state, read at the act. Deliberately a function: the value
 * may change while one execution stays alive.
 */
export interface ProtectionProvider {
  currentMaxJurisdiction(): ExecutionJurisdiction;
}

export type CrossingVerdict =
  | { ok: true; jurisdiction: ExecutionJurisdiction }
  | { ok: false; refusal: 'refused_by_frozen_ceiling' | 'refused_by_current_protection' };

/**
 * Effective permission for one governed material crossing.
 *
 * Current protection may CONTRACT the frozen ceiling; it may never enlarge it
 * (FR-J9 §4). Both constraints are evaluated here, on every call.
 */
export function permitCrossing(
  requested: ExecutionJurisdiction,
  frozen: FrozenAuthorization,
  protection: ProtectionProvider,
): CrossingVerdict {
  if (BREADTH[requested] > BREADTH[frozen.maxJurisdiction]) {
    return { ok: false, refusal: 'refused_by_frozen_ceiling' };
  }
  // Re-read, every time. Never cached by this function.
  const current = protection.currentMaxJurisdiction();
  if (BREADTH[requested] > BREADTH[current]) {
    return { ok: false, refusal: 'refused_by_current_protection' };
  }
  return { ok: true, jurisdiction: requested };
}
