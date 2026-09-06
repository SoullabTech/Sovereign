/**
 * DEVELOP PREPARATION — the state a Work is in before MAIA can read it, and
 * the one gesture that moves it.
 *
 * THE DEFECT THIS CLOSES. DEVELOP's capture stage reads the WORKING DRAFT's
 * partition (`manuscript_draft_sections` on a draft whose
 * `section_addressable_at` is set). WRITE's outline reads the immutable
 * SOURCE (`manuscript_sections`). They are different tables in different
 * namespaces, and a Work can hold 185 Source sections while its draft holds
 * none. When that happened the room said "it needs a draft with sections" —
 * a sentence that contradicts what the writer can plainly see one mode away,
 * and that collapsed three genuinely different states into one:
 *
 *     no working draft at all          the Work was never opened in WRITE
 *     a draft that predates sections   created before 74bed57c (2026-09-02),
 *                                      when a new draft began to be born
 *                                      section-addressable
 *     a partitioned draft              capture proceeds
 *
 * Each is a different fact about the Work and owes the writer a different
 * sentence and a different act. This module says which one holds.
 *
 * ⛔ IT NEVER CONVERTS AND NEVER CREATES. Resolving is a read. The acts live
 * behind an explicit member gesture: `convertDraftToSections` for a legacy
 * draft, the canonical draft-creation POST for a Work with none. Preparing a
 * Work as a side effect of reading it would make DEVELOP author state during
 * an operation the room promises changes nothing.
 *
 * ⛔ NO BOUNDARY IS INFERRED HERE OR ANYWHERE BELOW IT. The Source supplies
 * WHICH boundaries exist; WS2-04A locates each one in the member's CURRENT
 * text by identity and refuses when it cannot. A changed draft is offered
 * conversion only when every boundary is already located — otherwise the
 * honest answer is that the system does not know where the boundary went,
 * and no confirmation the member could give would tell it.
 */

import { query } from '@/lib/db/postgres';
import { classifyDraft, type Classification } from '@/lib/manuscript/sections/draftProof';
import { planConversion, type ConversionRefusal } from '@/lib/manuscript/sections/convertDraft';
import { disclosureDigest } from '@/lib/manuscript/sections/conversionDisclosure';

/**
 * What changed since the draft was initialized from Source, as counts.
 *
 * STRUCTURAL ONLY. No line of the member's prose appears here, and none may
 * be added: this crosses an HTTP boundary to be rendered, and a divergence
 * report is a fact about shape, never a quotation.
 */
export interface Divergence {
  classification: Classification;
  /** Boundaries the Source establishes. */
  boundaries: number;
  /** Of those, how many are located exactly in the current draft. */
  resolved: number;
  headingsChanged: number;
  bodyLinesChanged: number;
  draftChars: number;
}

export type DevelopPreparation =
  /** Capture will read this Work. Nothing to prepare. */
  | { kind: 'ready'; draftSections: number }
  /** No Source sections exist; there are no boundaries to derive. */
  | { kind: 'no_source' }
  /** The Work has never been opened in WRITE, so no draft was ever begun. */
  | { kind: 'no_draft'; sourceSections: number }
  /**
   * A draft that predates section addressing, whose boundaries ARE located
   * in its current text. `diverged` says whether the member's words have
   * moved since import — the disclosure they are owed before confirming.
   */
  | {
      kind: 'convertible';
      sourceSections: number;
      diverged: boolean;
      divergence: Divergence;
      /** Names the state this disclosure describes; carried back on confirm. */
      disclosure: string;
    }
  /**
   * A legacy draft whose boundaries cannot be located. Not an offer — there
   * is nothing here a member could confirm, because the system does not know
   * where the boundaries now fall.
   */
  | {
      kind: 'unresolvable';
      sourceSections: number;
      divergence: Divergence;
      refusal: ConversionRefusal;
      detail?: string;
    }
  /** The draft is section-addressable but holds no sections. Mounts nothing. */
  | { kind: 'indeterminate'; detail: string };

/** The proof's counts, in the shape the surface renders. PURE. */
export function describeDivergence(
  classification: Classification,
  proof: {
    boundaries: number;
    resolved: number;
    otherHeadingDiff: number;
    bodyDiff: number;
  },
  draftChars: number,
): Divergence {
  return {
    classification,
    boundaries: proof.boundaries,
    resolved: proof.resolved,
    headingsChanged: proof.otherHeadingDiff,
    bodyLinesChanged: proof.bodyDiff,
    draftChars,
  };
}

/**
 * Resolve one Work's preparation state. Member-scoped in the query, so a Work
 * that is not the caller's resolves as `no_source` rather than leaking that
 * it exists — the same no-existence-leak posture the readings boundary takes.
 */
export async function resolveDevelopPreparation(
  manuscriptId: string,
  memberId: string,
): Promise<DevelopPreparation> {
  const sources = await query<{ id: string; heading: string | null; body: string }>(
    `SELECT s.id, s.heading, s.body
       FROM manuscript_sections s
       JOIN member_manuscripts m ON m.id = s.manuscript_id
      WHERE s.manuscript_id = $1 AND m.member_id = $2
      ORDER BY s.position ASC`,
    [manuscriptId, memberId],
  );

  const draft = await query<{
    id: string;
    content: string;
    version: string;
    section_addressable_at: Date | null;
    draft_sections: string;
  }>(
    `SELECT d.id, d.content, d.version, d.section_addressable_at,
            (SELECT count(*) FROM manuscript_draft_sections s WHERE s.draft_id = d.id)::text
              AS draft_sections
       FROM manuscript_working_drafts d
      WHERE d.manuscript_id = $1 AND d.member_id = $2`,
    [manuscriptId, memberId],
  );

  /* READY IS DECIDED FIRST, and deliberately before the Source is consulted.
     A partitioned draft is readable on its own sections; whether the Source
     still holds anything is a different question and not this one. */
  if (draft.rows.length > 0) {
    const d = draft.rows[0];
    const partitioned = Number(d.draft_sections);
    if (d.section_addressable_at !== null) {
      return partitioned > 0
        ? { kind: 'ready', draftSections: partitioned }
        : {
            kind: 'indeterminate',
            detail: 'the draft is section-addressable but holds no sections',
          };
    }
  }

  if (sources.rows.length === 0) return { kind: 'no_source' };
  if (draft.rows.length === 0) return { kind: 'no_draft', sourceSections: sources.rows.length };

  const d = draft.rows[0];
  const verdict = classifyDraft(sources.rows, d.content);
  const divergence = describeDivergence(verdict.classification, verdict.proof, d.content.length);
  const plan = planConversion(d.content, sources.rows);

  if (!plan.ok) {
    return {
      kind: 'unresolvable',
      sourceSections: sources.rows.length,
      divergence,
      refusal: plan.refusal,
      detail: plan.detail,
    };
  }

  return {
    kind: 'convertible',
    sourceSections: sources.rows.length,
    /* PRISTINE means the draft is byte-identical to what the Source composed:
       nothing has moved, and the conversion changes representation only. Any
       other admitted class means the member has written since import, and the
       disclosure is what earns their confirmation. */
    diverged: verdict.classification !== 'PRISTINE',
    divergence,
    disclosure: disclosureDigest({
      version: Number(d.version),
      content: d.content,
      sourceSections: sources.rows.length,
    }),
  };
}
