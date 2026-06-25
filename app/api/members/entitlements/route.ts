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

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  const set = await resolveEntitlements(session.memberId);
  return NextResponse.json(
    { entitlements: [...set] },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
