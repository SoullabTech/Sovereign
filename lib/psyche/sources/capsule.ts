/**
 * Capsule → Field Object: source resolution.
 *
 * Governed by MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md Amendment 5 (canonical
 * `1e15f9c71`) and FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md (canonical
 * `d61872e2a`).
 *
 * THIS MODULE NEVER WRITES AN ATOM. It answers one question — *may this member
 * declare this capsule, and what are their own words for it?* — and returns
 * either that answer or a precise refusal. `keepSource()` remains the single
 * governed minting capability; this resolver feeds it and nothing else.
 *
 * Why it is separate from `keepSource()`: source-specific ownership and
 * eligibility knowledge belongs beside its source, not accumulated as inline
 * conditionals inside the one shared minter. `keepSource()` enforces the
 * universal rules — member identity, atom shape, provenance, privacy defaults,
 * database idempotency, created-vs-existing. Capsule table knowledge lives
 * here. This is one small explicit function, deliberately not a plugin
 * registry: one new source does not justify a framework.
 */

import { query } from '@/lib/db/postgres';

/** What a capsule contributes to a declaration. Never includes an atom. */
export interface CapsuleDeclarationSource {
  /** The member's own title for the capsule, trimmed; a plain fallback if empty. */
  title: string;
  /** The capsule's reviewed summary, if it has one. */
  summary: string | null;
}

/**
 * The refusal messages, kept as constants because the route matches on them to
 * choose a status code. Changing a string here changes an HTTP contract.
 *
 * ABSENCE AND NON-OWNERSHIP DELIBERATELY SHARE ONE MESSAGE. A member must not
 * be able to discover another member's capsule ids by reading which error comes
 * back.
 */
export const CAPSULE_NOT_FOUND = 'keepSource: capsule not found';
export const CAPSULE_STILL_DRAFT =
  'keepSource: capsule is still a draft — not eligible to declare';
export const CAPSULE_ARCHIVED = 'keepSource: capsule is archived — not eligible to declare';

/**
 * Resolve a capsule for declaration, or refuse.
 *
 * ELIGIBILITY IS NOT DECLARATION (Amendment 5). `draft = false` decides whether
 * the gesture may be *offered*; reaching that state declares nothing. This
 * check exists so a declaration cannot name an ineligible source — it is not a
 * trigger, and nothing here watches capsules change state.
 *
 * `pinned` is deliberately NOT an eligibility condition. Pinning is a separate
 * member act about attention, and no ruling ties it to declaration.
 *
 * THE IDENTITY BOUNDARY IS EXPLICIT. `reflection_capsules.user_id` is `text`;
 * `member_memory_atoms.member_id` is `uuid`. We render the authenticated UUID
 * into its canonical text form and compare text to text, rather than casting
 * the column and letting PostgreSQL decide what equality means. All 346
 * production capsules carry the uuid form; if a second form ever appears, this
 * comparison fails closed rather than silently widening.
 */
export async function resolveCapsuleDeclarationSource(
  memberId: string,
  capsuleId: string,
): Promise<CapsuleDeclarationSource> {
  const capsule = await query<{
    draft: boolean;
    archived: boolean;
    owned: boolean;
    title: string | null;
    summary: string | null;
  }>(
    `SELECT draft, archived, (user_id = $2::text) AS owned, title, summary
       FROM reflection_capsules
      WHERE id = $1`,
    [capsuleId, memberId],
  );

  if (capsule.rows.length === 0) {
    throw new Error(CAPSULE_NOT_FOUND);
  }
  if (!capsule.rows[0].owned) {
    throw new Error(CAPSULE_NOT_FOUND);
  }
  if (capsule.rows[0].draft) {
    throw new Error(CAPSULE_STILL_DRAFT);
  }
  if (capsule.rows[0].archived) {
    throw new Error(CAPSULE_ARCHIVED);
  }

  return {
    title: capsule.rows[0].title?.trim() || 'Kept from a reflection',
    summary: capsule.rows[0].summary,
  };
}
