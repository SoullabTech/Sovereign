/**
 * WS2-05B-5½ — how much of a member's Work a reading may be given.
 *
 * RULED, NOT TUNED. These are not performance knobs. Every section here is a
 * piece of someone's private writing leaving their machine, and the ceilings are
 * the reason a bounded reading stays bounded instead of drifting toward "send
 * the book" one request at a time.
 *
 * THERE IS NO TRUNCATION SETTING, AND THERE IS NO UNBOUNDED MODE. Crossing a
 * ceiling REFUSES the read request; it does not shorten it and it does not
 * silently return fewer sections. A truncated section would let a surface report
 * that MAIA read section X when she read a prefix of it, and for a structural
 * boundary the END of a section is frequently the thing that settles it. Full
 * section or no section.
 *
 * If eight targeted sections cannot settle a Work, that is a FINDING about this
 * protocol — evidence that a bounded reading will not do it — and not a reason
 * to raise the ceiling.
 *
 * MATERIALS ARE OUT OF SCOPE. Notes, scraps, uploads, gathered references,
 * source material and surrounding Studio context are not readable here at all,
 * which is why no limit governs them: this reader interprets the Work AS
 * WRITTEN, not authorial intention reconstructed from auxiliary material. That
 * could become a later, separately consented capability; it is not this one.
 *
 * Its own module so `evidence.ts` and `interpret.ts` can both name the policy
 * without a cycle between them.
 */

export interface ReadScope {
  /** Ids a single request may name. A longer request is refused, not trimmed. */
  maxIdsPerRequest: number;
  /** Distinct section bodies across the whole reading. */
  maxSections: number;
  /** Characters of manuscript prose across the whole reading. */
  maxChars: number;
}

/** WS2-05B-5½ · REAL-STRUCTURE-READER-01, as ruled. */
export const DEFAULT_READ_SCOPE: ReadScope = {
  maxIdsPerRequest: 4,
  maxSections: 8,
  maxChars: 60_000,
};

/**
 * Why a request was refused, in numbers.
 *
 * NO PROSE, and no headings: this travels into logs and diagnostics, and a scope
 * refusal must not become the channel that leaks what the scope exists to bound.
 */
export interface ReadScopeReport {
  requestedIds: readonly string[];
  alreadySuppliedCount: number;
  requestedTotalCount: number;
  alreadySuppliedChars: number;
  prospectiveTotalChars: number;
  limitSections: number;
  limitChars: number;
}
