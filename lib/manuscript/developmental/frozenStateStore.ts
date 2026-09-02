/**
 * BUILD-07A — the adapter between PostgreSQL rows and the pure substrate.
 *
 * WHY THIS FILE EXISTS SEPARATELY. `frozenState.ts` has no database, no model,
 * no write verb, and a falsifier asserts that over its SOURCE — so the claim is
 * about what it CAN do, not about what one code path happened to do. Putting a
 * query in there would end that guarantee. Everything here is loading; every
 * rule stays next door.
 *
 * ⛔ IT IS READ-ONLY BY CONSTRUCTION. No INSERT, no UPDATE, no DELETE. Recovering
 * what a reading rested on must never be able to change the Work it rested on.
 *
 * ⛔ THE TWO LOADS ARE DIFFERENT OBJECTS, and keeping them apart is the point:
 *
 *     loadRevisionSnapshot   an IMMUTABLE revision. Never rewritten, so a range
 *                            into it means the same characters forever.
 *     loadCurrentSection     the LIVE draft. Changes on the next keystroke.
 *
 * A resolver that loaded the live section and called it history would be the
 * re-anchoring INV-19 forbids — an observation made against one state of the
 * Work surviving that state changing by being re-pointed at the new one.
 */
import { query } from '@/lib/db/postgres';
import type { DraftSectionState, RevisionSectionRange } from '@/lib/manuscript/draftSections';
import type { RevisionSnapshot } from './frozenState';

export type LoadFailure =
  /** No such draft for this member, or no such revision of it. */
  | 'revision_not_found'
  /** The draft exists but holds no section by that id right now. */
  | 'section_not_found';

export type Loaded<T> = { ok: true; value: T } | { ok: false; failure: LoadFailure; detail: string };

/**
 * One immutable revision, as the substrate needs it.
 *
 * Member-scoped through the draft, with the same no-existence-leak discipline as
 * the manuscript routes: a revision of someone else's draft is not found, not
 * forbidden.
 *
 * `partition` may legitimately be NULL — the revision predates the draft
 * becoming section-addressable, and its boundaries were never observed. That is
 * carried through as it stands; the pure resolver refuses it by name rather than
 * inventing boundaries, and this loader must not smuggle in a guess.
 */
export async function loadRevisionSnapshot(
  draftId: string,
  memberId: string,
  revisionNumber: number,
): Promise<Loaded<RevisionSnapshot>> {
  const r = await query<{ content: string; section_partition: unknown }>(
    `SELECT r.content, r.section_partition
       FROM working_draft_revisions r
       JOIN manuscript_working_drafts d ON d.id = r.draft_id
      WHERE r.draft_id = $1 AND d.member_id = $2 AND r.revision_number = $3`,
    [draftId, memberId, revisionNumber],
  );
  if (r.rows.length === 0) {
    return {
      ok: false,
      failure: 'revision_not_found',
      detail: `no revision ${revisionNumber} of this draft`,
    };
  }
  return {
    ok: true,
    value: {
      revisionNumber,
      content: r.rows[0].content,
      /* jsonb arrives parsed. Passed through unvalidated ON PURPOSE: the pure
         resolver checks contiguity and coverage itself, and validating here too
         would put the same rule in two places to drift apart. */
      partition: (r.rows[0].section_partition ?? null) as RevisionSectionRange[] | null,
    },
  };
}

/**
 * One section of the LIVE draft — the other half of the currentness comparison.
 *
 * Returns `section_not_found` when the section is gone. ⛔ It does not look for
 * a similar one: a passage matched to a neighbour is invented evidence, and the
 * honest answer to "where is it now" is sometimes "nowhere".
 */
export async function loadCurrentSection(
  draftId: string,
  memberId: string,
  sectionId: string,
): Promise<Loaded<DraftSectionState>> {
  const r = await query<{ id: string; text: string }>(
    `SELECT s.id, s.text
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
      WHERE s.draft_id = $1 AND d.member_id = $2 AND s.id = $3`,
    [draftId, memberId, sectionId],
  );
  if (r.rows.length === 0) {
    return {
      ok: false,
      failure: 'section_not_found',
      detail: `the draft no longer holds section ${sectionId}`,
    };
  }
  return { ok: true, value: { id: r.rows[0].id, text: r.rows[0].text } };
}
