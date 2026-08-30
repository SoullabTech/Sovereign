export const dynamic = 'force-dynamic';

/**
 * Current session's resolved entitlement set.
 *
 * Mirrors /api/members/tester's auth semantics exactly (401 when signed out) so
 * that <PreviewGate> reproduces the Field Lab tester branch with zero behavior
 * change: `labs.preview` is present iff the member is a tester.
 *
 * Read-only. Does not grant anything; the tester opt-in/opt-out still lives at
 * /api/members/tester.
 *
 * ── COMPANION-01A step 2: the x-session-token contract ──────────────────────
 *
 * MAIA Desktop authenticates with `x-session-token` — the same canonical
 * credential the Safari/iOS path already uses when cookies are blocked, held in
 * Electron main and never exposed to a renderer. 259 API routes already accept
 * it through `getMemberIdFromRequest`. This one did not: it resolved identity
 * through `getCurrentSession()`, which reads cookies only.
 *
 * That made it the single server gap in the Companion's first slice, and it
 * matters more than its size suggests — House computes which doors a member may
 * open from their entitlements, so a Desktop that cannot read them would have
 * to either hardcode capability or invent a Desktop-only identity route. Both
 * are forbidden.
 *
 * ⛔ The cookie path is UNCHANGED and still runs first: the same
 * `getCurrentSession()` call, with the same result, before anything else is
 * considered. The header is a fallback for transports that cannot carry the
 * cookie, never a second way to be someone.
 *
 * ⛔ `x-member-id` remains untrusted here as everywhere else. A bare identity
 * assertion is not a credential; only a token validated against `auth_sessions`
 * (unrevoked, unexpired) resolves a member.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromSessionToken } from '@/lib/auth/getMemberFromRequest';
import { resolveEntitlements } from '@/lib/auth/entitlements';

export async function GET(request: NextRequest) {
  // 1. Cookie session — unchanged, and still authoritative when present.
  const session = await getCurrentSession();
  let memberId: string | null = session ? session.memberId : null;

  // 2. x-session-token — validated against auth_sessions by the canonical
  //    resolver. No new auth semantics are introduced here.
  if (!memberId) {
    memberId = await getMemberIdFromSessionToken(request.headers.get('x-session-token'));
  }

  if (!memberId) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const set = await resolveEntitlements(memberId);
  return NextResponse.json(
    { entitlements: [...set] },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
