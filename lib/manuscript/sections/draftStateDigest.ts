/**
 * THE DRAFT STATE DIGEST — which state the member was told about, named so it
 * can be checked again under the lock.
 *
 * WHY THIS EXISTS. A surface tells the member something about their draft and
 * then offers an act. Between the telling and the act the draft can move — an
 * autosave from another tab, a save they made and forgot — and the act would
 * then run against a state nobody was shown. The digest names the state that
 * WAS shown; the service re-derives it after taking the row lock and refuses
 * on a mismatch rather than reconciling.
 *
 * ⛔ IT NAMES A STATE, NOT AN AUTHORITY. Founder ruling (2026-09-06): the two
 * preparation paths do not carry the same kind of permission.
 *
 *     legacy_exact      the draft is byte-identical to what the Source
 *                       composed. Authority is MECHANICAL — the 2026-08-30
 *                       ruling: a lossless structural upgrade whose truth is
 *                       mechanically established TELLS rather than asks. The
 *                       member initiates; they are not asked to agree to a
 *                       fact. The digest here is a concurrency guard and
 *                       nothing more.
 *     legacy_diverged   the member has written since import. Authority is
 *                       their CONFIRMATION of a divergence they were shown,
 *                       and the digest names that disclosure.
 *
 * The same bytes serve both, and conflating them is what this comment exists
 * to prevent: a digest that matched would otherwise let mechanical authority
 * travel silently onto a draft that had since become merely resolvable. The
 * conversion service therefore re-proves PRISTINE under the lock for the
 * mechanical path — the digest is not asked to carry that claim.
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

/** The facts a told state stands on. Structural only — never member prose. */
export interface DraftStateBasis {
  /** The draft's version at the moment it was told. */
  version: number;
  /** The exact draft content the state was computed from. */
  content: string;
  /** How many Source sections supplied the boundary set. */
  sourceSections: number;
}

export function draftStateDigest(basis: DraftStateBasis): string {
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
