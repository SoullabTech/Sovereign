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
 *   label     always renderable · the truthful presentation string, which
 *             ALWAYS carries the section's canonical position and carries the
 *             authored title beside it when there is one
 *
 * ⭐ A generated "Section 4" is NOT authored text. Calling it a heading would
 * muddy the exact boundary this lane keeps protecting, so a member-facing field
 * never silently mixes authored prose with a generated string. `heading` stays
 * authored-or-null; `label` is presentation, and says so by its shape.
 *
 * ── F1 · EVERY OFFERED SECTION MUST BE DISTINGUISHABLE (2026-09-10) ─────────
 *
 * The authored title comes from the STRUCTURE lane, and a unit names a DIVISION
 * of the Work. Sections are finer than units, so N sections inside one unit
 * share one title. Step 7 walk 7e observed the consequence: an authorization
 * request offering
 *
 *     c070de10-…  =>  "Before the water"
 *     cabae9c4-…  =>  "Before the water"
 *
 * A member asked to authorize two strings they cannot tell apart has been asked
 * to consent to something they cannot identify — the same law that forbids
 * showing them a UUID, one level up.
 *
 * ⭐ THE LAW: every distinct section offered for authorization has a distinct,
 * stable, human-recognizable label, without any generated orientation text
 * pretending to be authored heading text.
 *
 * ⛔ NO NEW HEADING IS MANUFACTURED. The label is qualified by canonical
 * position, which is not authored and does not pretend to be.
 *
 * ⭐ DISTINCTNESS IS STRUCTURAL, NOT INCIDENTAL. Position carries it, and
 * `manuscript_draft_sections` holds `UNIQUE (draft_id, position)` — so two
 * sections of one draft cannot produce one label.
 *
 * ⭐ AND IT IS STABLE. The label is a pure function of (heading, position): a
 * section reads the same whatever else happens to be in the request. Qualifying
 * only when a request happened to contain a collision would make a section's
 * name depend on its company, which is not a name.
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
export const labelFor = (heading: string | null, position: number): string => {
  const authored = heading?.trim();
  const place = `Section ${position + 1}`;
  return authored ? `${authored} — ${place}` : place;
};

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
 *
 * ⭐ RETURNED IN THE WORK'S ORDER. See F2 below.
 */
export async function recognizeSections(
  draftId: string,
  sectionIds: readonly string[],
): Promise<SectionRecognition[]> {
  if (sectionIds.length === 0) return [];
  try {
    const r = await query<Row>(RECOGNITION, [draftId, [...sectionIds]]);

    /* ⭐⭐ F2 · THE ORDER IS THE WORK'S ORDER (2026-09-10).
       ⛔ NOT the order of the input. The caller's set arrives as
       `[...required].sort()` — a lexicographic sort of UUIDs, lawful for
       normalizing a SET and with no authority over how a Work is presented.
       Building the result by walking that input, as this function previously
       did, silently discarded the query's `ORDER BY s.position ASC` and showed
       the writer their own sections in the order of identifiers they never see.
       Step 7 walk 6c observed it. So the rows are walked in the order the
       database returned them, and the input is used only to decide membership. */
    const asked = new Set(sectionIds);
    const recognized = r.rows
      .filter((row) => asked.has(row.section_id))
      .map((row) => {
        const heading = row.heading?.trim() || null;
        return { sectionId: row.section_id, heading, label: labelFor(heading, row.position) };
      });

    /* ⛔ A section the query did not return still gets a label — it is part of
       what the member is being asked to act on. It has no known position, so it
       cannot be placed in the Work's order and is named as unrecognized rather
       than mislabelled with a number that means nothing. Its ORDINAL in the
       required set is not its position in the Work. */
    const seen = new Set(recognized.map((x) => x.sectionId));
    const unrecognized = sectionIds
      .filter((id) => !seen.has(id))
      .map((sectionId, i) => ({
        sectionId, heading: null, label: `Section ${i + 1} (unrecognized)`,
      }));

    return [...recognized, ...unrecognized];
  } catch (err) {
    console.error('[S3/recognition] structure unreadable; labelling as unrecognized', {
      error: err instanceof Error ? err.message : 'unknown',
    });
    /* ⛔ AND HERE TOO, NO POSITION IS ASSERTED. With the query gone there are no
       canonical positions, so an ordinal in the required set is not one — the
       previous `Section ${i + 1}` told the member a place this branch does not
       know. Every section still comes back labelled and distinct, because a
       member who cannot recognize what they are authorizing cannot lawfully
       authorize it; it is simply named as unrecognized rather than mislabelled.
       Found by the F2 falsifier while repairing the main path: the fallback was
       the same defect, in the branch nobody looks at. */
    return sectionIds.map((sectionId, i) => ({
      sectionId, heading: null, label: `Section ${i + 1} (unrecognized)`,
    }));
  }
}
