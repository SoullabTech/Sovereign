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
 * The invariant (Kelly ruling 2026-07-29, F1 — Option A):
 *   No ACCOUNT-CREATING credential field may be presented until invitation
 *   eligibility has been established. Existing authorized members must always
 *   retain a path to authenticate into accounts they already hold.
 *
 * "The invitation is the gate" governs entry into MEMBERSHIP, not subsequent
 * authentication into an account the person already holds. An earlier version
 * of this repair gated the whole door and locked existing members out — and
 * added no authorization, since `/api/now-what/signin` carries no invitation
 * check server-side, so the denial was one the server would have overruled.
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
 * Copy shown when no invitation context was established.
 *
 * Per the F1 ruling (Option A), this is NOT a refusal of the door: an existing
 * member still signs in here. It refuses only the creation of a new key, and
 * says so without naming a field, an allowlist entry, or any reason beyond the
 * absence of an invitation link — the copy must not become a probe for which
 * contexts are authorized.
 */
export const UNINVITED_COPY = {
  heading: 'Welcome back.',
  body:
    'Sign in to continue. If someone invited you to a new field, open the link they sent — ' +
    'it carries what this door needs to set up a key.',
} as const;
