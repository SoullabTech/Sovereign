import { query } from '@/lib/db/postgres';

/**
 * Server half of the practitioner-identity source. Kept separate from
 * `practitionerIdentity.ts` so the presentation helpers stay import-safe from
 * `'use client'` components — importing the `pg`-backed `query` into a client
 * bundle would break the build.
 *
 * See `practitionerIdentity.ts` for the invariant this upholds.
 */

/**
 * Resolve the configured practitioner display name for a field slug.
 *
 * Returns `null` when the field is unknown, has no practitioner assigned, or
 * the practitioner has no name — all configuration gaps, not errors. Callers
 * render NEUTRAL_PRACTITIONER for null; they never substitute a name.
 */
export async function resolvePractitionerName(
  fieldSlug: string | null | undefined,
): Promise<string | null> {
  if (!fieldSlug) return null;

  const res = await query<{ name: string | null }>(
    `SELECT m.name
       FROM practice_fields pf
       JOIN members m ON m.id = pf.practitioner_member_id
      WHERE pf.field_slug = $1
      LIMIT 1`,
    [fieldSlug],
  );

  const name = res.rows[0]?.name?.trim();
  return name ? name : null;
}
