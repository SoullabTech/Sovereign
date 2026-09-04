/**
 * Founder auth — server-side env-var allowlist
 *
 * The /founder/ console is currently gated only by a feature flag in
 * app/founder/layout.tsx. That's not enough for surfaces that hold
 * founder-private interpretive data (verdicts, notes, etc.).
 *
 * This helper enforces real auth in API routes by checking the current
 * server session against an env-var allowlist of founder member IDs.
 *
 * Set FOUNDER_MEMBER_IDS in production env (.env on minisForum) as a
 * comma-separated list of UUIDs:
 *
 *   FOUNDER_MEMBER_IDS=ed52e28f-5331-4288-a9ab-4dae230079c9
 *
 * If the env var is unset, NO ONE is recognized as a founder — the
 * allowlist is empty and all requests get 403. This is intentional:
 * forgetting to set the env var should fail closed, not open.
 *
 * No schema change. Reversible. Promote to a real role system later
 * (e.g. members.is_founder boolean, or a roles table) if needed.
 */

import { getCurrentSession } from '@/lib/auth/serverSessions';

const FOUNDER_MEMBER_IDS: ReadonlySet<string> = new Set(
  (process.env.FOUNDER_MEMBER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);

export type FounderAuthResult =
  | { ok: true; memberId: string }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Check whether the current request is from a founder.
 * Returns { ok: true, memberId } on success, or a typed error result.
 *
 * Usage in an API route:
 *
 *   const auth = await requireFounder();
 *   if (!auth.ok) {
 *     return NextResponse.json({ error: auth.error }, { status: auth.status });
 *   }
 *   // auth.memberId is the founder's member id
 */
export async function requireFounder(): Promise<FounderAuthResult> {
  const session = await getCurrentSession();

  if (!session?.memberId) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }

  if (!FOUNDER_MEMBER_IDS.has(session.memberId)) {
    return { ok: false, status: 403, error: 'Founder access required' };
  }

  return { ok: true, memberId: session.memberId };
}

/**
 * Is this member id on the founder allowlist?
 *
 * Exported so a NARROWER authorization can include founders without widening
 * this one — lib/access/labAccess.ts unions the founder allowlist with the Lab
 * Tools allowlist so the founder never has to be listed twice.
 *
 * ⛔ This is a read. It is not a way to add someone to the founder allowlist:
 * FOUNDER_MEMBER_IDS is the authority for founder-private surfaces (the
 * /api/founder/* console, Book Studio drafts, uploads, render) and nobody
 * should be added to it to obtain access to something else.
 */
export function isFounderMemberId(memberId: string): boolean {
  return FOUNDER_MEMBER_IDS.has(memberId);
}

/**
 * For diagnostics — returns the count of configured founder member IDs.
 * Does NOT return the IDs themselves. Useful for health checks to verify
 * the env var was actually set without leaking the values.
 */
export function getFounderAllowlistSize(): number {
  return FOUNDER_MEMBER_IDS.size;
}
