/**
 * S3 · P1 · step 4 — SERVER-DERIVED RECOGNITION METADATA.
 *
 *   ⭐⭐ What the writer saw helps them RECOGNIZE the section.
 *       What the server authorizes is determined INDEPENDENTLY.
 *
 * A member asked to authorize `7d49fa3d-45e3-43cc-921c-44032903bd1f` has been
 * asked to consent to a string they cannot recognize. So ACT 2 returns a label —
 * and the label never becomes authorization input.
 *
 * ── THE THREE HARD BOUNDARIES ──────────────────────────────────────────────
 *
 * ⛔ 1 · `source_section_id` IS PROVENANCE ONLY. Its own column comment says
 *      "never a source of text", and a heading is text. Recovering a display
 *      string through it would quietly turn provenance into content authority.
 *      ⭐ So the authored title comes from the STRUCTURE lane — the member's own
 *      word for a division — and from nowhere else.
 *
 * ⛔ 2 · ACT 3 SENDS SECTION IDS ONLY. `heading` and `label` are display
 *      material; they are not accepted back, so they cannot influence what is
 *      authorized even if a client returns them.
 *
 * ⛔ 3 · THE SERVER RE-DERIVES THE REQUIRED SET ON RESUME. Client display
 *      metadata is never trusted as scope.
 *
 * ── heading vs label, kept apart on purpose ────────────────────────────────
 *
 *   heading   the member's authored title · null when none exists
 *   label     always renderable · the heading when there is one, otherwise
 *             "Section N" derived from canonical position
 *
 * ⭐ A generated "Section 4" is NOT authored text. Calling it a heading would
 * muddy the exact boundary this lane keeps protecting, so a member-facing field
 * never silently mixes authored prose with a generated string.
 */

import { query } from '@/lib/db/postgres';

export interface SectionRecognition {
  readonly sectionId: string;
  /** The member's authored title, or null. ⛔ Never a generated string. */
  readonly heading: string | null;
  /** Always renderable. ⛔ Never a UUID. */
  readonly label: string;
}

/**
 * ⭐ `position` is 0-based in the substrate and 1-based to a reader: a writer
 * counts their sections from one.
 */
export const labelFor = (heading: string | null, position: number): string =>
  heading && heading.trim().length > 0 ? heading.trim() : `Section ${position + 1}`;

/**
 * ⛔ `origin <> 'proposed'` IS LOAD-BEARING, and it is on the JOIN rather than in
 * a WHERE clause. A proposed unit is MAIA's suggestion, not the member's
 * structure — that table's own rule is that proposed rows "cannot render as the
 * Work's structure". Filtering it in a WHERE clause would drop the SECTION
 * instead of dropping its unauthored title, and the member would be asked to
 * authorize a section the response never named.
 */
const RECOGNITION = `
  SELECT s.id AS section_id, s.position AS position, u.title AS heading
    FROM manuscript_draft_sections s
    LEFT JOIN manuscript_structure_members m ON m.draft_section_id = s.id
    LEFT JOIN manuscript_structure_units u
           ON u.id = m.unit_id AND u.origin <> 'proposed'
   WHERE s.draft_id = $1 AND s.id = ANY($2::uuid[])
   ORDER BY s.position ASC`;

type Row = { section_id: string; position: number; heading: string | null };

/**
 * Recognition metadata for the sections whose body is required.
 *
 * ⛔ READS NO PROSE. `manuscript_draft_sections.text` is not selected, and the
 * only authored characters that can reach the caller are a title the member
 * wrote for a division of their own Work — shown back to its author for
 * orientation, which is the ruled-lawful use.
 *
 * ⭐ FAILS OPEN TO POSITION, NEVER TO A UUID. If the structure lane is
 * unreadable the sections still come back labelled, because a member who cannot
 * recognize what they are authorizing cannot lawfully authorize it.
 */
export async function recognizeSections(
  draftId: string,
  sectionIds: readonly string[],
): Promise<SectionRecognition[]> {
  if (sectionIds.length === 0) return [];
  try {
    const r = await query<Row>(RECOGNITION, [draftId, [...sectionIds]]);
    const found = new Map(r.rows.map((x) => [x.section_id, x]));
    return sectionIds.map((sectionId, i) => {
      const row = found.get(sectionId);
      const heading = row?.heading?.trim() || null;
      /* ⛔ A section the query did not return still gets a label. Its ORDINAL in
         the required set is not its position in the Work, so it is named as
         unrecognized rather than mislabelled with a number that means nothing. */
      return row
        ? { sectionId, heading, label: labelFor(heading, row.position) }
        : { sectionId, heading: null, label: `Section ${i + 1} (unrecognized)` };
    });
  } catch (err) {
    console.error('[S3/recognition] structure unreadable; labelling by ordinal', {
      error: err instanceof Error ? err.message : 'unknown',
    });
    return sectionIds.map((sectionId, i) => ({
      sectionId, heading: null, label: `Section ${i + 1}`,
    }));
  }
}
