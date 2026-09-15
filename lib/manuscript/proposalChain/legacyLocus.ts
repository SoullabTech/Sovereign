/**
 * EDITORIAL-LEGACY-LOCUS-DISPOSITION-01 · PHASE B — the compatibility guard.
 *
 * ⭐⭐ THE LAW THIS SERVES:
 *
 *     A historically malformed locus must be identified BEFORE authorization,
 *     so it can never be mistaken for evidence that the member changed the
 *     Work.
 *
 * ── ⭐ WHAT WENT WRONG, AND WHY THESE ROWS CANNOT BE FIXED ────────────────
 *
 * Before EDITORIAL-LOCUS-ALIGNMENT-01, `openEditorialRelationship` froze
 * `ProposalLocus.expectedText` from the STORED section slice — heading prefix
 * included — while all six consumers compare it against
 * `splitStoredSection(...).body`, the PROJECTED passage. On a headed section the
 * two can never match, so the fit refused `expected_text_absent`, which the
 * outcome taxonomy reports as `work_moved`:
 *
 *     "You've written here since this version was made."
 *
 * ⛔ Which is FALSE. She wrote nothing.
 *
 * ⛔⛔ AND THE ROW CANNOT BE REPAIRED. `proposal_chains` refuses UPDATE **and**
 * DELETE at the database — *the chain does not evolve, only its versions do* —
 * so a disposition can only be a decision about how the chain is READ. This
 * module is that decision, and it mutates nothing.
 *
 * ── ⭐⭐ THE DISCRIMINATOR IS NOT INVENTED ────────────────────────────────
 *
 * It is `splitStoredSection` — the single authority on what the member's
 * editable body is — asked a different question: *does this frozen text carry a
 * heading prefix?* A legacy locus is `headingPrefix + body` BY CONSTRUCTION, so
 * the same function that defines the coordinate space recognises text written
 * into the wrong one. ⛔ No date rule, no deploy boundary, no shape guess.
 *
 * ⛔ A DATE RULE WAS REFUSED, and not for style: it would need an attributable
 * moment at which the repaired producer reached production, and the 2026-09-07
 * finding established that this deployment lane keeps no durable record of
 * completed deploys.
 *
 * ── ⚠️ TWO PROPERTIES, STATED IN BOTH DIRECTIONS ─────────────────────────
 *
 * ⭐ NO FALSE NEGATIVES, by construction: every pre-repair chain on a headed
 * section satisfies the predicate exactly.
 *
 * ⚠️ FALSE POSITIVES ARE POSSIBLE, RARE, AND FAIL SAFE. A valid post-repair
 * chain matches only if the writer literally repeated the heading as the first
 * line of the body. The consequence is a REFUSAL TO ADOPT — never a false
 * statement about her manuscript — which is the correct direction for an error
 * to fall.
 *
 * ⚠️⚠️ ONE DEPENDENCY, PINNED: this reads the heading AS IT IS NOW, so it
 * assumes `manuscript_sections.heading` is stable for the life of an editorial
 * relationship. No statement anywhere updates it today, and heading rename is
 * WS2-08C, unopened. ⛔ **WS2-08C may not open without accounting for immutable
 * editorial loci** — a rename would make today's reliable discriminator
 * unreliable tomorrow.
 */

import { splitStoredSection } from '@/lib/manuscript/sections/saveSection';

/**
 * ⭐ Which coordinate space a frozen locus was written in.
 *
 * ⛔ NOT a judgement about the relationship. A legacy locus is a perfectly real
 * editorial exchange whose frozen text addresses the wrong space; it stays
 * readable and comparable, and only adoption is withheld.
 */
export type LocusSpace =
  /** ⭐ The space every consumer reads, and the only one adoption may execute. */
  | 'projected_section_body'
  /** ⚠️ The stored slice, heading prefix included — pre-alignment. */
  | 'legacy_stored_section';

/**
 * ⭐ PURE. No database, no member, no authorization — so the law is falsifiable
 * without a fixture, and the seam and the read surface can consume the same
 * answer without either becoming the other.
 *
 * ⛔ A section with no heading yields `projected_section_body` unconditionally:
 * there, stored and projected COINCIDE, so a pre-repair chain is already
 * correct and there is no distinction to draw. ⛔ Reporting those as legacy
 * would withhold adoption from relationships that were never malformed.
 */
export function locusSpaceOf(expectedText: string, heading: string | null): LocusSpace {
  const split = splitStoredSection(expectedText, heading);
  /* `null` means the frozen text does not begin with the heading at all —
     which is what a correctly projected passage looks like. */
  if (split === null) return 'projected_section_body';
  return split.headingPrefix.length > 0
    ? 'legacy_stored_section'
    : 'projected_section_body';
}

/** ⭐ The one question the adoption seam and the read surface both ask. */
export const locusIsAdoptable = (expectedText: string, heading: string | null): boolean =>
  locusSpaceOf(expectedText, heading) === 'projected_section_body';
