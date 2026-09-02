/**
 * BUILD-07A · SEAM A — a developmental reading may reason only from a Work state
 * the MEMBER froze.
 *
 * THE CONSTITUTIONAL FLOOR, in one line:
 *
 *     MAIA does not freeze the Work. The member freezes a version; MAIA is later
 *     allowed to read that frozen version.
 *
 * ⛔ FOUR THINGS THIS MUST NEVER DO, each rejected by ruling:
 *
 *     make ordinary autosaves into revisions   collapses save into revision and
 *                                              widens what a revision means
 *     let the read gesture create one          reading would mutate what it
 *                                              reads, and a revision the member
 *                                              did not ask for is one they did
 *                                              not author
 *     read the latest checkpoint anyway        the reading would rest on prose
 *                                              the member has already moved past
 *                                              while claiming to describe their
 *                                              Work
 *     copy the read prose anywhere             the second custody domain the
 *                                              recoverability ruling rejected
 *
 * So the only admissible input is an existing member-authored immutable
 * revision that the current Work EXACTLY equals. Where none does, this refuses,
 * and the refusal is the honest answer: there is nothing frozen to read.
 *
 * ⛔ EXACTNESS IS ABOUT THE STATE, NOT THE VERSION NUMBER. A writer may change a
 * sentence and deliberately restore it; if the Work is again mechanically
 * identical, it is the same input for a developmental read. Requiring
 * `version` to match would refuse a Work that is, character for character, the
 * one that was frozen.
 *
 * ⛔ AND IT IS ABOUT THE PARTITION TOO, NOT ONLY THE TEXT. Identical prose cut
 * at different boundaries is a different input: the same characters divided into
 * different sections means evidence addressed to a section id would recover a
 * different passage. Text equality alone would admit that.
 */
import {
  flattenSections,
  partitionFromSections,
  type DraftSectionState,
  type RevisionSectionRange,
} from '@/lib/manuscript/draftSections';

export type ReadStateRefusal =
  /**
   * The Work has moved past every frozen version of it.
   *
   * Named for what the member would do about it, not for what the system
   * noticed: they freeze a version, and then the reading becomes possible. A
   * later surface may offer one compound gesture — "Save this version and ask
   * MAIA to read" — but the saving half must be explicit in what the member is
   * doing. It cannot hide behind "Ask MAIA to read."
   */
  | 'checkpoint_required'
  /**
   * The prose matches exactly and the BOUNDARIES do not.
   *
   * A distinct fact, and a stranger one: the same characters divided into
   * different sections. Reported apart from `checkpoint_required` because
   * freezing a new version would not obviously be the fix, and telling the
   * member to do that would send them somewhere useless.
   */
  | 'partition_mismatch'
  /** The revision predates section-addressability; its boundaries were never observed. */
  | 'partition_not_recorded';

export type ReadStateAdmissibility =
  | { ok: true; revisionNumber: number }
  | { ok: false; refusal: ReadStateRefusal; detail: string };

/** One immutable revision, as this proof needs it. */
export interface CandidateRevision {
  revisionNumber: number;
  content: string;
  partition: readonly RevisionSectionRange[] | null;
}

/**
 * Does this immutable revision hold EXACTLY the Work as it currently stands?
 *
 * Three things are proven, in order, and none of them is a similarity:
 *
 *   1 · the revision's content is byte-identical to the flattening of the
 *       current sections — bytes, because two different sequences of code
 *       points can compare equal after normalization, and a normalized match
 *       would let prose the member retyped differently call itself frozen;
 *   2 · the revision's partition names the same section ids in the same order;
 *   3 · at the same exact code-point boundaries.
 *
 * ⛔ No similarity, no normalization, no "close enough". A developmental reading
 * that rested on an approximately-matching revision would show the author
 * evidence from a Work that never existed.
 */
export function proveExactReadRevision(
  revision: CandidateRevision,
  currentSections: readonly DraftSectionState[],
): ReadStateAdmissibility {
  if (!revision.partition || revision.partition.length === 0) {
    return {
      ok: false,
      refusal: 'partition_not_recorded',
      detail: `revision ${revision.revisionNumber} predates section-addressability, `
        + 'so its boundaries were never observed and cannot be compared',
    };
  }

  const current = flattenSections(currentSections);
  if (!Buffer.from(revision.content, 'utf8').equals(Buffer.from(current, 'utf8'))) {
    return {
      ok: false,
      refusal: 'checkpoint_required',
      detail: `the Work has moved past revision ${revision.revisionNumber}`,
    };
  }

  /* Derived from the CURRENT sections and compared to what was frozen — the
     same one-pass derivation the save path uses, so the two cannot drift. */
  const expected = partitionFromSections(currentSections);
  if (expected.length !== revision.partition.length) {
    return {
      ok: false,
      refusal: 'partition_mismatch',
      detail: `the Work now has ${expected.length} sections; revision `
        + `${revision.revisionNumber} froze ${revision.partition.length}`,
    };
  }
  for (let i = 0; i < expected.length; i += 1) {
    const a = expected[i];
    const b = revision.partition[i];
    if (a.sectionId !== b.sectionId || a.start !== b.start || a.end !== b.end) {
      return {
        ok: false,
        refusal: 'partition_mismatch',
        detail: `the same prose is divided differently at position ${i}: `
          + `now ${a.sectionId} [${a.start},${a.end}), frozen ${b.sectionId} [${b.start},${b.end})`,
      };
    }
  }

  return { ok: true, revisionNumber: revision.revisionNumber };
}
