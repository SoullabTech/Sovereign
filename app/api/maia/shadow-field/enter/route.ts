export const dynamic = 'force-dynamic';

/**
 * Shadow Field — entry (MAIA-SHADOW-FIELD-01 · PROTOTYPE v1 · P4-C1).
 *
 * The member's activation act, recorded server-side. Entry is where Sanctuary becomes a
 * server fact: the member chooses it here, and from this moment the server — not the
 * client — is the authority on whether this sitting may persist anything.
 *
 * This endpoint activates nothing by itself and reads no member content. It records that
 * a member chose to enter, and returns the token that identifies the sitting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester } from '@/lib/auth/tester';
import { openFieldSession } from '@/lib/maia/shadowField/fieldSession';

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const tester = await isMemberTester(session.memberId);
  if (!tester) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { sanctuary?: unknown } | null;

  // The member's Sanctuary choice at entry. Recorded now, server-held from here on.
  const field = openFieldSession(session.memberId, body?.sanctuary === true);

  return NextResponse.json({
    fieldToken: field.token,
    sanctuary: field.sanctuary,
    openedAt: new Date(field.openedAt).toISOString(),
  });
}
