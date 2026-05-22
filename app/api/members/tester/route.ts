export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Tester opt-in toggle.
 *
 * Invariant: this endpoint only writes the tester flag for the currently
 * authenticated member. It does not allow setting another member's flag.
 * It does not grant any other capability. Opt-in is reversible.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester, setMemberTester } from '@/lib/auth/tester';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  const tester = await isMemberTester(session.memberId);
  return NextResponse.json({ tester });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.tester !== 'boolean') {
    return NextResponse.json(
      { error: 'Invalid body: { tester: boolean } required.' },
      { status: 400 }
    );
  }
  const ok = await setMemberTester(session.memberId, body.tester);
  if (!ok) {
    return NextResponse.json(
      { error: 'Could not update tester status. Try again in a moment.' },
      { status: 500 }
    );
  }
  return NextResponse.json({ tester: body.tester });
}
