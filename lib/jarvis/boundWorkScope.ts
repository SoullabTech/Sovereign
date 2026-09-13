/**
 * JARVIS-ORCHESTRATION-CORE-01 · AMENDMENT A1 + R1 — `BoundWorkScope`.
 *
 * THE CENSUS FINDING THIS ANSWERS (BP-3):
 *
 *     Work authority travels through the organism as `memberId: string`.
 *     Thirty of thirty-four Work-scoped exports carry it and enforce it
 *     correctly. Nothing makes a WRONG string unrepresentable.
 *
 * A `BoundWorkScope` is a server-established fact:
 *
 *     the authenticated actor is authorized to operate on THIS Work
 *     within the bound member scope.
 *
 * It is NOT a DTO, not a wrapper around `memberId`, not a serialized claim,
 * and not a replacement for write-authority classification.
 *
 * ─── THE THREE DOCTRINES (A1 §3.7) ──────────────────────────────────────────
 *
 * BW-AUTH-1 · DERIVED AUTHORITY. Minted only from a PRESENTLY MINTED
 *   `MemberIdentity` — never from a raw or merely branded member identifier.
 *   The brand proves how a value was TYPED; the private WeakSet in
 *   `canonical-turn/identity` proves how the authority object was CREATED.
 *   Extracting the branded string and passing that to the binder would discard
 *   the runtime half of the proof at the exact moment it matters.
 *     ⭐ The child capability derives from the PARENT CAPABILITY, never from
 *        data extracted out of it.
 *
 * BW-AUTH-2 · NON-PORTABILITY. This is PROCESS-LOCAL authority. Serialization,
 *   persistence, queueing, caching, IPC or reconstruction DESTROYS it. A queue
 *   may carry a claim or a reference; it may never carry a `BoundWorkScope`.
 *   The receiving side establishes fresh identity and authorization and mints
 *   anew.
 *     ⭐ The capability is ephemeral. The claim may travel.
 *   `toJSON` therefore THROWS rather than returning a plain object: a silent
 *   serialization would produce something that looks like authority and is not,
 *   which is the failure this primitive exists to make impossible.
 *   ⛔ Deliberately UNLIKE `BoundEvidence.toJSON()`, which may serialize because
 *   re-binding requires the evidence object again. There is no re-bind here that
 *   does not re-read authorization — so there is nothing safe to write down.
 *
 * BW-AUTH-3 · NO EXISTENCE ORACLE. Failing to bind exposes no member-visible
 *   information distinguishing absence from lack of authority. The ownership
 *   read is ONE `SELECT 1 ... WHERE id = $1 AND member_id = $2`, which CANNOT
 *   tell the two cases apart — and this module deliberately does not issue a
 *   second query to acquire the distinction.
 *     ⭐ An oracle you never built cannot leak.
 *
 * ─── INHERITANCE (A1 §3.5 — ADDITIVE, not a choice) ─────────────────────────
 *
 *   from `BoundEvidence`   object-specific binding · typed refusal ·
 *                          fixed precedence · proof destruction at serialization
 *   from `MemberIdentity`  compile-time unforgeability · runtime provenance via
 *                          private minting · frozen minted objects · runtime
 *                          discrimination between looks-like and was-minted
 *
 * ⛔ WHAT THIS MODULE DOES NOT ANSWER. READ vs DERIVED authority · model
 * permission · source permission · provenance policy · resource budget ·
 * scheduling class · claim identity · revision identity. Those are orthogonal
 * contracts (A1 separation law). A `BoundWorkScope` that grows a `budget` field
 * has become the bag of strings this primitive exists to prevent.
 *
 * ⛔ THIS CLOSES NOTHING BY ITSELF. BP-1, BP-2, BP-3 and BP-4 remain open. BP-4
 * is capability ADMISSION, not tenant scope, and is not addressed here.
 */

import { query } from '@/lib/db/postgres';
import { isMintedIdentity } from '@/lib/maia/canonical-turn/identity';
import type { MemberIdentity, VerifiedMemberId } from '@/lib/maia/canonical-turn/types';

/* ── The value ───────────────────────────────────────────────────────────── */

const MINTED = new WeakSet<object>();

/**
 * Nominal AND runtime-provenanced. The private member makes a structurally
 * identical literal unassignable (compile lock); membership in the module-private
 * WeakSet makes a revived or hand-built object refusable (runtime lock).
 * The class is not exported, so the only reachable constructor is `bindWorkScope`.
 */
class Scope {
  private readonly minted = true as const;
  constructor(
    readonly memberId: VerifiedMemberId,
    readonly workRef: string,
  ) {}
  /** ⛔ BW-AUTH-2. Authority does not survive being written down. */
  toJSON(): never {
    throw new TypeError(
      'BoundWorkScope is process-local authority and must not be serialized (BW-AUTH-2). ' +
      'Carry a WorkScopeClaim or a work reference across the boundary and mint again on arrival.',
    );
  }
}

export type BoundWorkScope = Scope;

/** True iff this object was minted by THIS module. Runtime half of BW-F3/BW-F6. */
export function isBoundWorkScope(v: unknown): v is BoundWorkScope {
  return typeof v === 'object' && v !== null && MINTED.has(v);
}

/* ── Refusal ─────────────────────────────────────────────────────────────── */

/**
 * ONE member-visible code, several server-side reasons — BW-AUTH-3 / BW-F4.
 * ⚠️ `not_found_or_unauthorized` is deliberately UNDIVIDED: dividing it would
 * require a second query whose only product is an existence oracle.
 */
export type WorkScopeRefusalReason =
  | 'identity_not_minted'
  | 'identity_not_verified'
  | 'malformed_work_ref'
  | 'not_found_or_unauthorized';

export const WORK_SCOPE_UNAVAILABLE = 'WORK_SCOPE_UNAVAILABLE' as const;

export type BindWorkScopeResult =
  | { ok: true; value: BoundWorkScope }
  | { ok: false; external: typeof WORK_SCOPE_UNAVAILABLE; reason: WorkScopeRefusalReason };

const refuse = (reason: WorkScopeRefusalReason): BindWorkScopeResult =>
  ({ ok: false, external: WORK_SCOPE_UNAVAILABLE, reason });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ── The one minting authority ───────────────────────────────────────────── */

/**
 * Prove that this identity may operate on this Work, or say why not.
 *
 * REFUSAL PRECEDENCE IS FIXED (inherited from `bindEvidence`): provenance, then
 * status, then shape, then authorization. An unminted identity is refused as
 * unminted even if the Work would not have resolved either — the earlier failure
 * is the true one, and no database read happens on that path.
 *
 * ⛔ The authorization read is an OWNERSHIP PREDICATE (`SELECT 1`), never a
 * content loader. If this function ever needs to descend into a manuscript
 * loader to establish authority, the primitive is at the wrong layer — that is
 * the amendment's own predeclared defeat condition, and it is adjudicated then,
 * not worked around here.
 */
export async function bindWorkScope(
  identity: MemberIdentity,
  workRef: string,
): Promise<BindWorkScopeResult> {
  /* BW-AUTH-1 · the OBJECT, not a field of it. */
  if (!isMintedIdentity(identity)) return refuse('identity_not_minted');
  if (identity.status !== 'verified') return refuse('identity_not_verified');
  if (typeof workRef !== 'string' || !UUID.test(workRef)) return refuse('malformed_work_ref');

  /* ⛔ Ownership is in the PREDICATE, not beside it — the `readDraft` convention.
     A Work that is someone else's is indistinguishable here from one that does
     not exist, and this module never learns which it was. */
  const r = await query(
    `SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2 LIMIT 1`,
    [workRef, identity.memberId],
  );
  if (r.rows.length === 0) return refuse('not_found_or_unauthorized');

  /* Frozen in place, not via the return value: `Object.freeze` widens to
     `Readonly<Scope>`, which drops the private member that IS the nominal lock. */
  const scope = new Scope(identity.memberId, workRef);
  Object.freeze(scope);
  MINTED.add(scope);
  return { ok: true, value: scope };
}
