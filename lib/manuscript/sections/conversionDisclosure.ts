/**
 * THE DISCLOSURE DIGEST — what the member was shown, named so it can be
 * checked again under the lock.
 *
 * WHY THIS EXISTS. Founder ruling (2026-09-05, DEVELOP preparation repair):
 * a changed draft may be converted only after its divergence has been
 * DISCLOSED to the member and the member has confirmed. A UI that shows a
 * divergence and then posts a bare `{ confirm: true }` cannot keep that
 * promise: between the disclosure and the confirmation the draft can move —
 * an autosave from another tab, a save the member made and forgot — and the
 * conversion would then proceed against a state nobody was shown.
 *
 * So the confirmation carries the digest of the state that WAS shown, and the
 * conversion re-derives it after taking the row lock. A mismatch is refused,
 * not reconciled. The member sees the new divergence and confirms that one,
 * or does not.
 *
 * ⛔ NOT A SECURITY TOKEN. It is unkeyed and a client could compute one over
 * a state it invented. It is not asked to prevent forgery — authority is the
 * member's session, and the conversion re-proves the partition from the
 * locked content regardless. It answers exactly one question: is this the
 * draft the disclosure described? A keyed token would make that answer no
 * more true.
 *
 * PURE. No database, no clock. Both the surface that discloses and the
 * service that converts import THIS function, so the two cannot compute the
 * digest differently and disagree about whether the member saw the truth.
 */

import { createHash } from 'crypto';

/** The facts a disclosure stands on. Structural only — never member prose. */
export interface DisclosureBasis {
  /** The draft's version at the moment of disclosure. */
  version: number;
  /** The exact draft content the divergence was computed from. */
  content: string;
  /** How many Source sections supplied the boundary set. */
  sourceSections: number;
}

export function disclosureDigest(basis: DisclosureBasis): string {
  const h = createHash('sha256');
  /* Length-prefixed so no field can impersonate part of another: without it,
     a version of 12 with 3 source sections and a version of 1 with 23 hash
     the same concatenation. */
  h.update(`v=${basis.version}\n`);
  h.update(`src=${basis.sourceSections}\n`);
  h.update(`len=${basis.content.length}\n`);
  h.update(createHash('sha256').update(basis.content, 'utf8').digest('hex'));
  return h.digest('hex');
}
