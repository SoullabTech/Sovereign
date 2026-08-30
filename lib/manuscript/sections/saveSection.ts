/**
 * WS2-04B — the section-aware write path.
 *
 * Once a draft is section-addressable, the browser edits ONE SECTION and never
 * submits a whole-manuscript string. That is not a convenience: a client that
 * posts the entire draft can silently carry a stale copy of every section it
 * did not touch, and a save of section A would rewrite section B with whatever
 * the browser last happened to hold.
 *
 * So the write contract is:
 *
 *     draft_section_id + body + baseVersion
 *          ↓
 *     lock the draft, check the version
 *     update that ONE section row
 *     derive content from the ordered sections, in SQL
 *     increment version ONCE
 *          ↓
 *     the deferred invariant verifies the two representations agree
 *
 * Content is DERIVED, never accepted. Nothing the client sends can make the
 * compatibility representation disagree with the sections.
 *
 * HEADINGS ARE READ-ONLY IN THIS CUT (founder ruling, 04B v1). A section's
 * stored text contains its heading bytes, but there is no draft-level heading
 * field — only source_section_id provenance. Editing a heading through the
 * body box would mean inferring "first line = heading" forever, which goes
 * ambiguous the moment a section has no heading or a member deletes one. So
 * the heading is rendered structurally, the body is editable, and rename /
 * split / merge become explicit structure operations later rather than hidden
 * behaviour inside a text box.
 */

import { transaction, type TransactionClient } from '@/lib/db/postgres';

export type SaveRefusal =
  | 'draft_not_found'
  | 'not_section_addressable'
  | 'stale_base'
  | 'section_not_found'
  | 'heading_prefix_not_found';

export interface SaveResult {
  status: 'saved' | 'refused';
  refusal?: SaveRefusal;
  detail?: string;
  version?: number;
  sectionChars?: number;
}

/**
 * Split a stored section slice into the part the member may not edit and the
 * part they may. PURE.
 *
 * Returns null when the slice does not begin with the heading the Source
 * records — which means this section is not in the shape this cut knows how to
 * edit, and refusing is the only honest response. Never guesses at a heading
 * by looking at the text.
 */
export function splitStoredSection(
  text: string,
  heading: string | null,
): { headingPrefix: string; body: string } | null {
  const h = heading?.trim();
  if (!h) return { headingPrefix: '', body: text };

  /* The composer writes `heading\n\n` before the body. Accept exactly that,
     and the degenerate case of a heading with nothing after it. */
  if (text === h) return { headingPrefix: h, body: '' };
  if (text.startsWith(`${h}\n`)) {
    const prefixEnd = text.startsWith(`${h}\n\n`) ? h.length + 2 : h.length + 1;
    return { headingPrefix: text.slice(0, prefixEnd), body: text.slice(prefixEnd) };
  }
  return null;
}

/** One section, as the writing surface needs it. */
export interface EditableSection {
  id: string;
  position: number;
  heading: string | null;
  body: string;
}

/**
 * Load the ordered sections of an addressable draft for the writing surface.
 * `id` is the stable navigation identity — the outline and the canvas agree on
 * a section because they name the same row, never because they counted to the
 * same number.
 */
export async function loadEditableSections(
  manuscriptId: string,
  memberId: string,
): Promise<{ sections: EditableSection[]; version: number } | null> {
  const { query } = await import('@/lib/db/postgres');
  const draft = await query<{ id: string; version: string; section_addressable_at: Date | null }>(
    `SELECT id, version, section_addressable_at FROM manuscript_working_drafts
      WHERE manuscript_id = $1 AND member_id = $2`, [manuscriptId, memberId]);
  if (draft.rows.length === 0 || draft.rows[0].section_addressable_at === null) return null;

  const rows = await query<{ id: string; position: number; text: string; heading: string | null }>(
    `SELECT s.id, s.position, s.text, ms.heading
       FROM manuscript_draft_sections s
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE s.draft_id = $1 ORDER BY s.position ASC`, [draft.rows[0].id]);

  return {
    version: Number(draft.rows[0].version),
    sections: rows.rows.map((r) => {
      const split = splitStoredSection(r.text, r.heading);
      return {
        id: r.id,
        position: r.position,
        heading: r.heading,
        /* A section whose shape this cut cannot split is shown whole and
           read-only rather than silently reinterpreted. */
        body: split ? split.body : r.text,
      };
    }),
  };
}

/**
 * Save one section. ONE logical save, ONE transaction, ONE version increment.
 */
export async function saveSection(
  manuscriptId: string,
  memberId: string,
  draftSectionId: string,
  body: string,
  baseVersion: number,
): Promise<SaveResult> {
  return transaction(async (tx: TransactionClient) => {
    const draftRes = await tx.query<{
      id: string; version: string; section_addressable_at: Date | null;
    }>(
      `SELECT id, version, section_addressable_at FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2 FOR UPDATE`,
      [manuscriptId, memberId]);
    if (draftRes.rows.length === 0) return { status: 'refused', refusal: 'draft_not_found' as const };
    const draft = draftRes.rows[0];
    if (draft.section_addressable_at === null) {
      return { status: 'refused', refusal: 'not_section_addressable' as const };
    }
    /* Existing compare-and-advance semantics, unchanged: a save built on a
       version someone else has already advanced is refused, not merged. */
    if (Number(draft.version) !== baseVersion) {
      return {
        status: 'refused', refusal: 'stale_base' as const,
        detail: `draft is at version ${draft.version}`,
      };
    }

    const secRes = await tx.query<{ id: string; text: string; heading: string | null }>(
      `SELECT s.id, s.text, ms.heading
         FROM manuscript_draft_sections s
         LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
        WHERE s.id = $1 AND s.draft_id = $2`, [draftSectionId, draft.id]);
    if (secRes.rows.length === 0) return { status: 'refused', refusal: 'section_not_found' as const };
    const sec = secRes.rows[0];

    const split = splitStoredSection(sec.text, sec.heading);
    if (!split) return { status: 'refused', refusal: 'heading_prefix_not_found' as const };

    /* The heading is carried over untouched. In this cut the member cannot
       change it, and the server does not take their word for what it was. */
    const newText = split.headingPrefix + body;

    await tx.query(
      `UPDATE manuscript_draft_sections SET text = $2, updated_at = now() WHERE id = $1`,
      [sec.id, newText]);

    /* DERIVE the compatibility representation from the sections themselves, in
       the same statement space the trigger will check. The client's copy of
       the rest of the manuscript never enters this. */
    const updated = await tx.query<{ version: string }>(
      `UPDATE manuscript_working_drafts
          SET content = (SELECT COALESCE(string_agg(text, '' ORDER BY position), '')
                           FROM manuscript_draft_sections WHERE draft_id = $1),
              version = version + 1,
              updated_at = now()
        WHERE id = $1
        RETURNING version`, [draft.id]);

    return {
      status: 'saved',
      version: Number(updated.rows[0].version),
      sectionChars: newText.length,
    };
  });
}
