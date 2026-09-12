/**
 * WHICH DECLARED PLACES ARE STILL IN THE WORK — established by the server.
 *
 * ⭐⭐ P13. The client may PRESENT "needs confirmation" or "no longer here"; it
 * may not be authoritative about which is true. A surface that decided the
 * reason a member was withheld would have solved disclosure authority and left
 * a smaller truthfulness hole beside it: MAIA would be told a section needs
 * confirming when it had actually been deleted, or deleted when it was merely
 * unconfirmed, on the word of a page that might have been open for an hour.
 *
 * ⛔ SO THE CLIENT IS NOT ASKED. The wire carries no withheld reason at all —
 * the hole is closed by deleting the client's authority rather than by checking
 * it, because a field that is validated is still a field that can be believed
 * on a path someone forgets to validate.
 *
 * ── ⭐ REPOINTED 2026-09-12 — N8 ────────────────────────────────────────────
 *
 * This probed `manuscript_sections` / `manuscripts`, which carried the SAME
 * namespace defect that failed Act 3: the Focus Set addresses
 * `manuscript_draft_sections`. A presence probe in the wrong namespace answers
 * "deleted" for every section that exists, which is the most misleading thing
 * it could say — and it would have said it confidently.
 *
 * Its law is unchanged: ids only, no body, no heading, no content expansion.
 *
 * ── Why this is not a disclosure ───────────────────────────────────────────
 *
 * This reads EXISTENCE and OWNERSHIP. It selects section ids and nothing else:
 * no body, no heading, no length, no ordering. "This section is still in your
 * Work" is a fact the writer is already looking at in their own outline, and
 * the only thing it reaches MAIA as is the currency state the founder ruled may
 * cross — never as content, and never for a member whose body did not cross.
 *
 * ⛔ It must never grow a column. The moment this returns anything but an id,
 * it has become a second, ungoverned read of the Work.
 */

import { query } from '@/lib/db/postgres';
import { memberRef } from '@/lib/privacy/memberRef';

export interface FocusPresenceProbe {
  (ref: { memberId: string; workRef: string; sectionRefs: readonly string[] }):
    Promise<ReadonlySet<string>>;
}

export const focusPresence: FocusPresenceProbe = async ({ memberId, workRef, sectionRefs }) => {
  if (sectionRefs.length === 0) return new Set();
  try {
    // Ownership is part of the read, not a separate check a later edit could drop.
    /* Ownership is proven through the working draft's own (manuscript_id,
       member_id) — the same pair `loadEditableSections` and `saveSection` use.
       ⛔ Still ids only: the join reaches the draft to prove custody, never to
       read a column that could carry prose. */
    const r = await query<{ id: string }>(
      `SELECT s.id FROM manuscript_draft_sections s
         JOIN manuscript_working_drafts d ON d.id = s.draft_id
        WHERE d.manuscript_id = $1 AND d.member_id = $2 AND s.id = ANY($3::uuid[])`,
      [workRef, memberId, sectionRefs],
    );
    return new Set(r.rows.map((x) => x.id));
  } catch (err) {
    /* ⛔ AN UNKNOWN PRESENCE IS NOT AN ABSENCE. Returning an empty set would
       tell MAIA every withheld place had been deleted, which is a claim this
       probe failed to establish. The caller falls back to the weaker, truthful
       state: the anchor needs confirming. */
    console.error('[FOCUS] presence probe failed', {
      memberRef: memberRef(memberId),
      error: err instanceof Error ? err.message : 'unknown',
    });
    return new Set(sectionRefs);
  }
};
