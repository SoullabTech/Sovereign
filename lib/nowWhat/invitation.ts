/**
 * Now What? invitation eligibility — the single rule, shared by the door and
 * the registration route.
 *
 * WHY THIS EXISTS (2026-07-29): `/now-what/arrive` asserted "You were invited
 * here.", collected name, email and password, and only then discovered the
 * arrival carried no authorized field context — `POST /api/now-what/register`
 * refused with 403 at submit. Personal data was collected from someone the
 * system had already decided to refuse, and an invitation was asserted before
 * eligibility was established.
 *
 * The invariant:
 *   No credential field appears until the arriving context has been resolved
 *   and found eligible.
 *
 * The rule lives here so the page and the route cannot drift apart. The page
 * gate governs what is *rendered*; the route gate remains the authority and is
 * unchanged — a client gate is an ordering fix, never an authorization one.
 *
 * SCOPE: this is deliberately NOT an invitation-token architecture. It makes
 * the existing static allowlist truthful and correctly ordered. When tokens or
 * a field registry ship, they replace `AUTHORIZED_FIELD_CONTEXTS` and this
 * function's position and refusal stay identical.
 *
 * Pure — no database, no request objects — so it is import-safe from
 * `'use client'` components.
 */

/**
 * INTERIM MECHANISM: static allowlist, because no invitation-token system or
 * field registry exists yet. Kept as the sole definition; the route imports it
 * rather than declaring its own.
 */
export const AUTHORIZED_FIELD_CONTEXTS: ReadonlySet<string> = new Set([
  'now-what-demo',
  'now-what',
  'flourishing',
]);

/**
 * Resolve the authorized field context carried by a `next` path.
 *
 * Returns the context string when the arrival is eligible, or `null` for a
 * missing, malformed, off-environment, or unauthorized context. Callers must
 * treat `null` as refusal — never as "unknown, proceed".
 */
export function invitedFieldContext(next: string | null | undefined): string | null {
  if (!next) return null;
  try {
    const url = new URL(next, 'https://internal.invalid');
    if (!url.pathname.startsWith('/now-what/')) return null;
    const ctx = url.searchParams.get('fieldContext');
    return ctx && AUTHORIZED_FIELD_CONTEXTS.has(ctx) ? ctx : null;
  } catch {
    return null;
  }
}

/** Eligibility as a boolean, for render gating. */
export function isInvited(next: string | null | undefined): boolean {
  return invitedFieldContext(next) !== null;
}

/**
 * Member-facing refusal copy. Names no allowlist member, no field, and no
 * reason beyond the absence of an invitation — a refusal must not become a
 * probe for which contexts are authorized.
 */
export const REFUSAL_COPY = {
  heading: 'This door opens with an invitation.',
  body:
    'Now What? is opened by the person you are working with. If you were sent a link, ' +
    'please open it again — it carries what this door needs. If you arrived another way, ' +
    'ask them to send it.',
} as const;
