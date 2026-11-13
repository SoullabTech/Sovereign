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
 */

import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { resolveEntitlements } from '@/lib/auth/entitlements';
import { proTasteEnabled, tasteStanding } from '@/lib/writersStudio/proTaste';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  const set = await resolveEntitlements(session.memberId);
  /* Writer's Studio: whether this Free writer still has their one complimentary whole-book pass (founder ruling
     2026-11-13). Reported beside the set, never as an entitlement key: it is a one-time gift, not a capacity. A lookup
     failure reports null (unknown), and the server decides at the pass itself. */
  let wholeWorkTaste: 'available' | null = null;
  if (!set.has('writing.wholeWork') && proTasteEnabled()) {
    wholeWorkTaste = (await tasteStanding(session.memberId, null).catch(() => 'none')) === 'available' ? 'available' : null;
  }
  return NextResponse.json(
    { entitlements: [...set], wholeWorkTaste },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
