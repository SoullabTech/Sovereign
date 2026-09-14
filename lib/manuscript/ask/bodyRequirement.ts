/**
 * S3 · what the Ask requires of the Work's BODY — derived, never asserted.
 *
 * ⭐⭐ THE WHOLE POINT: this is computed SERVER-SIDE from the observation's own
 * evidence references. ⛔ A client's account of what it needs never reaches it,
 * so a client claim can never widen what crosses into cognition.
 *
 * ⚠️ AND ONE TRAP, NAMED. `section-run` references CARRY section ids while
 * requiring only `position` — the order they sit in, not their prose. Taking
 * `sectionIdsOf` across ALL references would therefore demand, and authorize,
 * body disclosure for sections whose prose is never read.
 *
 *   ⭐ The required set is the union of sectionIdsOf over the refs whose
 *     requirement is `body`. Nothing else.
 *
 * PURE. No database, no I/O — so every branch is exercisable without one.
 */

import {
  requirementOf, sectionIdsOf, type EvidenceRef,
} from '@/lib/manuscript/development/evidenceRef';

export interface BodyRequirement {
  /** True where at least one reference needs the section's prose. */
  readonly required: boolean;
  /**
   * The sections whose BODY must be authorized before any of it may cross.
   * Sorted and de-duplicated so two derivations of the same Ask compare equal.
   */
  readonly sections: readonly string[];
}

export function deriveBodyRequirement(
  refs: readonly EvidenceRef[],
): BodyRequirement {
  const sections = new Set<string>();
  for (const ref of refs) {
    if (requirementOf(ref) !== 'body') continue;   // ⛔ position/structure never widen this
    for (const id of sectionIdsOf(ref)) sections.add(id);
  }
  return { required: sections.size > 0, sections: [...sections].sort() };
}

/**
 * Does the member's explicit act cover everything the server derived?
 *
 * ⛔ Supersetting is permitted and IGNORED: a member may name more than is
 * required, and the extra names confer nothing — what crosses is the derived
 * set, never the claimed one. A SUBSET is `BODY_SCOPE_INCOMPLETE`.
 */
export function authorizationCovers(
  authorizes: readonly string[], required: readonly string[],
): boolean {
  const claimed = new Set(authorizes);
  return required.every((s) => claimed.has(s));
}
