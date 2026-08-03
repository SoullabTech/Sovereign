/**
 * Single authoritative source for the practitioner identity shown to a member
 * inside a field — presentation half.
 *
 * WHY THIS EXISTS (2026-07-29): the Now What? room named two different people
 * as the practitioner to the same member in the same session — a literal
 * "Larry Closs" in the room eyebrow and a literal "Kelly" in the opening frame,
 * which is also the copy governing what sharing a thread *means*. The consent
 * gesture and the visible host disagreed. Neither literal came from
 * configuration; the configured name for the only live field is in fact
 * "Larry Closs (Demo)", so both literals were wrong even against their own
 * field.
 *
 * The invariant:
 *   Every member-facing reference to the practitioner in a field resolves from
 *   PracticeFieldContext.practitioner_name — reaching the UI through this
 *   module and no other path.
 *
 * There is deliberately NO second source and NO per-surface default. A surface
 * that cannot obtain the value renders NEUTRAL_PRACTITIONER rather than
 * guessing, so a configuration gap shows up as a gap instead of as a
 * manufactured identity.
 *
 * This module is import-safe from client components: it holds no database
 * access. The resolver lives in `practitionerIdentity.server.ts`.
 */

/** Copy used when no practitioner identity is configured. Never a person's name. */
export const NEUTRAL_PRACTITIONER = 'your practitioner';

/**
 * The name to render. Collapses the null/blank case to neutral copy so no
 * surface has to decide independently — that per-surface decision is exactly
 * what produced the collision.
 */
export function practitionerDisplayName(name: string | null | undefined): string {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  return trimmed ? trimmed : NEUTRAL_PRACTITIONER;
}
