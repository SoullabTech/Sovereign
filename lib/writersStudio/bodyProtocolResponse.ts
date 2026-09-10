/**
 * S3 · P1 · step 7 — READING THE ROUTE'S ANSWER, without guessing.
 *
 *   ⭐ The route answers some outcomes as `{ result }` and others as
 *     `{ refusal }`. This is the one place that knows both shapes.
 *
 * ⛔ IT INVENTS NOTHING. An answer this mapper does not recognise returns `null`
 * — the ordinary Ask path, or a refusal that belongs to another lane. A
 * catch-all would let a shape nobody designed be rendered as a disclosure state,
 * and the whole point of six distinct states is that they are not
 * interchangeable.
 */

import type { BodyProtocolOutcome, DisclosureSection } from './bodyAuthorization';

const sections = (v: unknown): DisclosureSection[] =>
  Array.isArray(v)
    ? v.filter((x): x is DisclosureSection =>
        !!x && typeof x === 'object'
        && typeof (x as DisclosureSection).sectionId === 'string'
        && typeof (x as DisclosureSection).label === 'string')
    : [];

const completion = (v: unknown): 'completed' | 'incomplete' =>
  v === 'completed' ? 'completed' : 'incomplete';

/**
 * ⭐ `status` participates, because the same body can mean different things at
 * different statuses and the route uses status deliberately: 410 for a lapsed
 * resume, 404 for one that never existed.
 */
export function bodyOutcomeFrom(
  status: number, json: Record<string, unknown>,
): BodyProtocolOutcome | null {
  switch (json.result) {
    case 'BODY_AUTHORITY_REQUIRED':
      return typeof json.pendingAskRef === 'string'
        ? { kind: 'BODY_AUTHORITY_REQUIRED', sections: sections(json.sections), pendingAskRef: json.pendingAskRef }
        /* ⛔ An offer with no resume to claim is not an offer. */
        : { kind: 'PENDING_UNAVAILABLE' };
    case 'BODY_SCOPE_INCOMPLETE':
      return typeof json.pendingAskRef === 'string'
        ? { kind: 'BODY_SCOPE_INCOMPLETE', outstanding: sections(json.outstanding), pendingAskRef: json.pendingAskRef }
        : { kind: 'PENDING_UNAVAILABLE' };
    case 'DISCLOSURE_UNAVAILABLE':
      return { kind: 'DISCLOSURE_UNAVAILABLE', actSpent: json.actSpent === true, sections: sections(json.sections) };
    case 'BODY_UNVERIFIABLE':
      return { kind: 'BODY_UNVERIFIABLE' };
    case 'ACT_ALREADY_PROCESSED':
      return { kind: 'ACT_ALREADY_PROCESSED', completion: completion(json.completion) };
    case 'ALREADY_CONSUMED':
      return { kind: 'ALREADY_CONSUMED', completion: completion(json.completion) };
    case 'BODY_AUTHORIZED':
      return { kind: 'BODY_AUTHORIZED' };
  }

  /* ⭐ The refusal-bearing half. These are the continuity failures a member is
     most likely to meet, and a mapper blind to them would render nothing. */
  switch (json.refusal) {
    case 'expired': return { kind: 'PENDING_EXPIRED' };
    case 'unknown': return status === 404 ? { kind: 'PENDING_UNKNOWN' } : null;
    case 'pending_ask_mismatch': return { kind: 'PENDING_MISMATCH' };
    case 'pending_ask_unavailable': return { kind: 'PENDING_UNAVAILABLE' };
    /* ⛔ `unavailable` from the claim is the substrate declining to say what
       happened. It is NOT a replay and NOT a spent act; the honest surface
       offers the same act again rather than a new ceremony. */
    case 'unavailable': return { kind: 'PENDING_UNAVAILABLE' };
    default: return null;
  }
}
