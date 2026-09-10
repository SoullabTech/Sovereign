/**
 * ACT IDENTITY — the identifiers belong to the writer's act, not to the HTTP
 * invocation that carried it.
 *
 *   ⭐⭐ One fresh authority act has one fresh accountability record, one fresh
 *       disclosure trace, and one fresh ephemeral capability. None of those
 *       artifacts from a prior act can be promoted into authority for a retry.
 *
 * ⚠️ THE DEFECT THIS REPLACES. The Focus route minted both identifiers with
 * `randomUUID()` per request, so a transport replay produced a fresh requestId,
 * a fresh disclosureId, and therefore a second apparent disclosure act. F1k was
 * ratified law with no mechanism beneath it.
 *
 * ⛔ NO SECOND IDEMPOTENCY STORE. Nothing here persists. Both identifiers are
 * DERIVED from the act id, so the substrate that already behaves correctly does
 * the work: `runtime_consent_state.request_id` is UNIQUE, immutable and
 * first-write-wins, and `mintDisclosureAttempt` already refuses a reused
 * `disclosure_id` rather than treating it as fresh authority.
 *
 *   transport replay        → same act id → same identifiers → existing records,
 *                             no second act, no fresh capability, no crossing
 *   deliberate new gesture  → new act id  → fresh identifiers throughout
 *
 * ⭐ DIAGNOSTIC LIMIT, STATED RATHER THAN HIDDEN. A replay carrying a CHANGED
 * payload is refused — no fresh capability, nothing crosses — but the refusal
 * reads as "this act already exists" rather than "your payload changed", unless
 * the change touched a field the receipt records (member · Work · scope ·
 * locator · gesture · boundary), which reconciles as `identity_mismatch` and
 * names the differing fields. Distinguishing a changed *ask* would require
 * storing a digest of the writer's words; `RefusedReceiptField` refuses exactly
 * that, and a second store is not authorized. The constitutional outcome —
 * refusal, no disclosure — holds in both cases; only the explanation is coarser.
 *
 * ⛔ NOT AUTHORITY. These are identifiers. They authorize nothing on their own,
 * and deriving them from a known act id lets no one cross: the boundary still
 * refuses a reused disclosure id.
 */

import { createHash } from 'crypto';

/** Domain-separated so a request id can never collide with a disclosure id. */
const derive = (domain: string, actId: string): string =>
  createHash('sha256').update(`${domain}:${actId}`).digest('hex').slice(0, 32);

export interface ActIdentifiers {
  /** The act, as the caller named it. Never sent onward as authority. */
  readonly actId: string;
  /** `runtime_consent_state.request_id` and the receipt's `request_ref`. */
  readonly requestId: string;
  /** `context_disclosure_receipts.disclosure_id`. */
  readonly disclosureId: string;
}

/**
 * Derive both identifiers from one caller-owned act id.
 *
 * ⛔ THE CALLER OWNS THE CLASSIFICATION. Only the surface that saw the writer's
 * gesture knows whether this invocation is that gesture again or a new one; the
 * boundary cannot infer it and must not try. This function is deterministic on
 * purpose — hand it the same act id and it yields the same identifiers, which is
 * the whole mechanism.
 */
export function actIdentifiers(actId: string): ActIdentifiers {
  const trimmed = actId.trim();
  if (!trimmed) throw new Error('[DISCLOSURE] act id is required — identifiers may not be invented per request');
  return {
    actId: trimmed,
    requestId: derive('request', trimmed),
    disclosureId: derive('disclosure', trimmed),
  };
}

/** Shape check for a client-supplied act id. Identity, never content. */
export function isUsableActId(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length >= 8 && v.trim().length <= 200;
}
