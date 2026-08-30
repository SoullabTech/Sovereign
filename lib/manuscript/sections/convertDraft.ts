/**
 * WS2-04A — converting a Working Draft to section-addressable form.
 *
 * WHAT THIS IS AND IS NOT. Not an edit. Not a migration of the member's words
 * into a new place. The characters do not move: the draft's existing text is
 * PARTITIONED, and each slice is stored alongside the boundary it belongs to.
 * Afterwards the draft reads exactly as it did — provably, or the transaction
 * does not commit.
 *
 * WHICH TEXT IS PARTITIONED. The member's current draft, never a recomposition
 * of the Source. The Source establishes which boundaries exist and where they
 * came from; the draft supplies every character. For the two production EDITED
 * books this distinction is the entire point — their body edits survive only
 * if the slices are cut from what they actually wrote.
 *
 * AUTHORITY. Founder ruling 2026-08-30: when the system performs a lossless
 * structural upgrade whose truth is mechanically established, it tells rather
 * than asks. This service is the mechanical establishment. It runs without a
 * member decision, so it refuses every case where the structure is not already
 * proven — and the round trip is the evidence the member is owed and was never
 * asked to supply.
 *
 * WHAT IT REFUSES, and why refusing is the feature:
 *   WITHHELD          the instruments disagree — nobody acts, the instrument
 *                     gets fixed
 *   NO_SOURCE         no boundaries exist to derive; the writer creates
 *                     structure when they want it
 *   moved boundary    a heading rewritten, deleted, or text carried across a
 *                     break — only the writer can say where it now falls
 * A LEGACY draft seeds like any other — byte-exactly, WITH its `# `
 * scaffolding. Stripping the scaffold is NOT part of conversion and never can
 * be: removing `# ` changes the draft's bytes, and this transaction promises
 * they are unchanged. Both claims cannot be true at once, so normalisation
 * stays a separate transform with its own proof and its own disclosure. The
 * boundary of a rewritten heading is still uniquely located — it is the line
 * that replaced it — so the partition is exact either way. (No production
 * draft is in this class today.)
 *
 * See docs/design/writer-studio/WS2-04A_SECTION_ADDRESSABLE_DRAFT.md.
 */

import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { classifyDraft } from '@/scripts/lib/draftProof';
import { assertRoundTrip, type DraftSection } from './seedInvariant';

export type ConversionRefusal =
  | 'draft_not_found'
  | 'withheld_instruments_disagree'
  | 'no_source_sections'
  | 'boundary_moved'
  | 'boundary_offsets_incomplete'
  | 'leading_text_before_first_boundary'
  | 'already_converted_inconsistently';

export interface ConversionResult {
  status: 'converted' | 'already_converted' | 'refused';
  refusal?: ConversionRefusal;
  /** Structural detail for a refusal. Never member text. */
  detail?: string;
  sectionCount?: number;
  draftVersion?: number;
}

/** Character offset of the start of each line in a text. */
function lineStarts(text: string): number[] {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return starts;
}

export interface PlannedSlice extends DraftSection {
  sourceSectionId: string;
}
export type ConversionPlan =
  | { ok: true; slices: PlannedSlice[] }
  | { ok: false; refusal: ConversionRefusal; detail?: string };

/**
 * Decide the partition. PURE — no database, no clock, no IO — so every refusal
 * path can be exercised directly rather than inferred from a service that
 * needs a live draft to run at all. The service does the locking, the writing
 * and the revision lineage; this does the deciding.
 */
export function planConversion(
  content: string,
  sourceSections: readonly {
    id: string;
    heading: string | null;
    body: string;
  }[],
): ConversionPlan {
  /* Re-prove from scratch. Whatever census authorised this ran earlier and
     against a possibly older state; none of its conclusions are carried in. */
  const verdict = classifyDraft(sourceSections, content);

  switch (verdict.classification) {
    case 'WITHHELD':
      return { ok: false, refusal: 'withheld_instruments_disagree' };
    case 'NO_SOURCE':
      return { ok: false, refusal: 'no_source_sections' };
    default:
      break;
  }
  const proof = verdict.proof;
  if (proof.otherHeadingDiff > 0 || proof.resolved !== proof.boundaries) {
    return {
      ok: false,
      refusal: 'boundary_moved',
      detail: `${proof.otherHeadingDiff} heading difference(s), ${proof.boundaries - proof.resolved} unresolved boundary/boundaries`,
    };
  }

  /* ── Derive the cut offsets in the CURRENT draft. */
  const starts = lineStarts(content);
  const offsets: number[] = [];
  for (const bLine of proof.boundaryBLine) {
    if (bLine === null || bLine >= starts.length) {
      return { ok: false, refusal: 'boundary_offsets_incomplete' };
    }
    offsets.push(starts[bLine]);
  }
  /* The first section must start at character zero. Otherwise text exists
     before any boundary, and the partition would silently absorb it into
     section 0 or drop it — either way changing a draft it promised not to. */
  if (offsets.length === 0 || offsets[0] !== 0) {
    return {
      ok: false,
      refusal: 'leading_text_before_first_boundary',
      detail: `first boundary at char ${offsets[0] ?? -1}`,
    };
  }
  /* Offsets must advance monotonically. Equal is fine — an empty section is a
     real position in the document — but backwards means the alignment is
     broken, and slicing on it would duplicate or lose text. */
  for (let i = 1; i < offsets.length; i++) {
    if (offsets[i] < offsets[i - 1]) {
      return {
        ok: false,
        refusal: 'boundary_offsets_incomplete',
        detail: `boundary ${i} precedes boundary ${i - 1}`,
      };
    }
  }

  const slices: (DraftSection & { sourceSectionId: string })[] = offsets.map(
    (start, i) => ({
      text: content.slice(
        start,
        i + 1 < offsets.length ? offsets[i + 1] : content.length,
      ),
      sourceSectionId: sourceSections[i].id,
    }),
  );

  /* ── THE GATE. Throws, so the transaction rolls back rather than
       committing a partition that loses a character. */
  return { ok: true, slices };
}

/**
 * Convert one draft. Idempotent: a second call never creates a second set of
 * sections — it verifies the existing ones still flatten to the draft and
 * reports the conversion that already happened, or stops on inconsistency
 * rather than silently repairing it.
 */
export async function convertDraftToSections(
  manuscriptId: string,
  memberId: string,
): Promise<ConversionResult> {
  return transaction(async (tx: TransactionClient) => {
    /* Lock the draft for the whole transaction. Everything below is proven
       against THIS content; a concurrent save must wait rather than land
       between the proof and the partition. */
    const draftRes = await tx.query<{
      id: string;
      content: string;
      version: string;
      section_addressable_at: Date | null;
    }>(
      `SELECT id, content, version, section_addressable_at
         FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2
        FOR UPDATE`,
      [manuscriptId, memberId],
    );
    if (draftRes.rows.length === 0) {
      return {
        status: 'refused',
        refusal: 'draft_not_found',
      } as ConversionResult;
    }
    const draft = draftRes.rows[0];

    /* ── Idempotency. Re-running must be safe, and must not paper over a
       disagreement it finds. */
    if (draft.section_addressable_at !== null) {
      const existing = await tx.query<{ text: string }>(
        `SELECT text FROM manuscript_draft_sections
          WHERE draft_id = $1 ORDER BY position ASC`,
        [draft.id],
      );
      const flattened = existing.rows.map((r) => r.text).join('');
      if (flattened !== draft.content) {
        return {
          status: 'refused',
          refusal: 'already_converted_inconsistently',
          detail: `${existing.rows.length} sections flatten to ${flattened.length} chars; draft holds ${draft.content.length}`,
        } as ConversionResult;
      }
      return {
        status: 'already_converted',
        sectionCount: existing.rows.length,
        draftVersion: Number(draft.version),
      } as ConversionResult;
    }

    /* ── Re-prove against the locked content and decide the partition. The
       census that authorised this ran earlier, against a possibly older
       state; nothing it concluded is carried in. */
    const sourceSections = await tx.query<{
      id: string;
      heading: string | null;
      body: string;
    }>(
      `SELECT id, heading, body FROM manuscript_sections
        WHERE manuscript_id = $1 ORDER BY position ASC`,
      [manuscriptId],
    );
    const plan = planConversion(draft.content, sourceSections.rows);
    if (!plan.ok) {
      return {
        status: 'refused',
        refusal: plan.refusal,
        detail: plan.detail,
      } as ConversionResult;
    }
    const slices = plan.slices;

    /* ── THE GATE. Throws, so the transaction rolls back rather than
       committing a partition that loses a character. */
    assertRoundTrip(draft.content, slices);

    for (const [i, slice] of slices.entries()) {
      await tx.query(
        `INSERT INTO manuscript_draft_sections (draft_id, position, text, source_section_id)
         VALUES ($1, $2, $3, $4)`,
        [draft.id, i, slice.text, slice.sourceSectionId],
      );
    }

    /* Preserve the exact pre-conversion draft through the EXISTING revision
       lineage, so the prior state stays reachable by the member's own history
       rather than through a mechanism only this feature understands. */
    await tx.query(
      `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
       SELECT $1, COALESCE(MAX(revision_number), 0) + 1, $2, $3, $4
         FROM working_draft_revisions WHERE draft_id = $1`,
      [draft.id, draft.content, memberId, 'before section conversion'],
    );

    await tx.query(
      `UPDATE manuscript_working_drafts
          SET section_addressable_at = now(),
              section_conversion_version = version,
              revision_count = revision_count + 1
        WHERE id = $1`,
      [draft.id],
    );

    return {
      status: 'converted',
      sectionCount: slices.length,
      draftVersion: Number(draft.version),
    } as ConversionResult;
  });
}
