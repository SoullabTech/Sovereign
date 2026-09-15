/**
 * RETURN-LOCUS-01 · WHERE THE WORK WAS LAST TOUCHED — and whether that is a
 * place at all.
 *
 * ⭐⭐ THE ACT'S OWN PREMISE NEEDED CORRECTING BEFORE IT COULD BE BUILT.
 * "Return her to the section she last wrote in" sounds like
 * `MAX(updated_at) LIMIT 1`. It is not, because
 * `manuscript_draft_sections.updated_at` has FIVE writers and only one of them
 * is a writer at a place:
 *
 *   saveSection                     ONE row     ⭐ the member, writing here
 *   whole-draft save                EVERY row   ⛔ one timestamp, no place
 *   revision restore                EVERY row   ⛔ one timestamp, no place
 *   conversion / import (INSERT)    EVERY row   ⛔ DEFAULT now(), no place
 *   normalizeLegacyScaffold         MANY rows   ⛔ a system act, not a member's
 *
 * ⛔ So `LIMIT 1` over the maximum would break a tie by whatever order the
 * database happened to return — REPLACING "always Chapter 1" WITH A DIFFERENT
 * INVISIBLE GUESS. That is the one outcome this act exists to avoid.
 *
 * ⭐ The rule is therefore strict uniqueness: a locus exists when exactly ONE
 * section holds the maximum. A tie is not a weak signal to be ranked — it is
 * the truthful report that these rows were changed by one act that had no
 * place, and the Studio then says nothing about where she was.
 *
 * ── ⚠️ VOCABULARY, INHERITED NOT INVENTED ─────────────────────────────────
 *
 * `app/api/sovereign/manuscripts/route.ts` already ruled this exact class of
 * question at Work scale (STUDIO-WRITING-PRESENCE-01, 2026-09-08): its
 * `last_written_at` establishes MEMBER DRAFT ACTIVITY — "saving, checkpointing,
 * restoring, or editing. It does not establish writing, and nothing may render
 * it as a writing time."
 *
 * ⭐ This module inherits that ruling rather than re-deciding it, which is why
 * it is called ACTIVITY and not "where you were writing". A distinct result is
 * strong enough to RETURN someone to; it is not strong enough to CLAIM they
 * were writing there.
 */

import { query } from '@/lib/db/postgres';

export type SectionActivity =
  /** ⭐ Exactly one section holds the latest change. A place exists. */
  | { readonly kind: 'distinct'; readonly sectionId: string; readonly at: string }
  /**
   * ⛔ Several sections share the latest change — an import, a conversion, a
   * whole-draft save or a restore. Real activity, NO place. ⛔ Never ranked.
   */
  | { readonly kind: 'undifferentiated'; readonly at: string; readonly among: number }
  /** No section-addressable draft, or no sections. */
  | { readonly kind: 'none' };

/**
 * ⭐ ONE STATEMENT, and the tie is decided inside it rather than by the caller.
 * A caller handed a list would have to re-derive the rule, and the second
 * implementation is where it would drift into `[0]`.
 *
 * ⛔ Member-scoped in SQL: an unknown manuscript and another member's are one
 * answer, the convention this codebase already uses everywhere else.
 */
export async function readSectionActivity(
  memberId: string, manuscriptId: string,
): Promise<SectionActivity> {
  const rows = await query<{ id: string; at: Date; among: string }>(
    `WITH d AS (
       SELECT id FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2
          AND section_addressable_at IS NOT NULL
     ),
     latest AS (
       SELECT max(s.updated_at) AS at
         FROM manuscript_draft_sections s JOIN d ON d.id = s.draft_id
     )
     SELECT s.id, s.updated_at AS at,
            count(*) OVER () AS among
       FROM manuscript_draft_sections s
       JOIN d ON d.id = s.draft_id
       JOIN latest ON latest.at = s.updated_at`,
    [manuscriptId, memberId]);

  if (rows.rows.length === 0) return { kind: 'none' };
  const first = rows.rows[0]!;
  const among = Number(first.among);
  const at = new Date(first.at).toISOString();
  /* ⛔ The whole rule, in one place. */
  return among === 1
    ? { kind: 'distinct', sectionId: first.id, at }
    : { kind: 'undifferentiated', at, among };
}
