export const dynamic = 'force-dynamic';

/**
 * Practitioner side of the invitation loop.
 *
 * GET    — the practitioner's own offers, with counts of member gestures.
 *          ⛔ Never a completion rate — there is no completion state. The
 *          counts say what members chose, not what they owe.
 * POST   — author an offer, in the practitioner's own words, stored verbatim.
 * DELETE — withdraw an offer. Soft: an existing member response is the
 *          member's act and is not erased by the practitioner withdrawing.
 *
 * ⛔ There is deliberately no endpoint here that reads member material. A
 *    practitioner sees what a member independently chose to share, through the
 *    existing share flag — never through the invitation they authored.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import {
  createInvitation,
  listAuthoredInvitations,
  withdrawInvitation,
  InvitationError,
} from '@/lib/practiceField/invitationService';

async function requirePractitionerId(request: NextRequest): Promise<string | null> {
  const cookieSession = await getCurrentSession();
  return cookieSession?.memberId ?? (await getMemberIdFromRequest(request));
}

export async function GET(request: NextRequest) {
  try {
    const practitionerId = await requirePractitionerId(request);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }
    const invitations = await listAuthoredInvitations(practitionerId);
    return NextResponse.json({ invitations });
  } catch (error) {
    if (error instanceof InvitationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[practitioner/invitations] GET failed', error);
    return NextResponse.json({ error: 'Could not load invitations.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const practitionerId = await requirePractitionerId(request);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      body?: string;
      programSlug?: string | null;
      addressedToMemberId?: string | null;
    } | null;

    const invitation = await createInvitation({
      practitionerId,
      body: body?.body ?? '',
      programSlug: body?.programSlug ?? null,
      addressedToMemberId: body?.addressedToMemberId ?? null,
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    if (error instanceof InvitationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[practitioner/invitations] POST failed', error);
    return NextResponse.json({ error: 'Could not create the invitation.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const practitionerId = await requirePractitionerId(request);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const invitationId = request.nextUrl.searchParams.get('id');
    if (!invitationId) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    await withdrawInvitation({ practitionerId, invitationId });
    return NextResponse.json({ withdrawn: true });
  } catch (error) {
    if (error instanceof InvitationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[practitioner/invitations] DELETE failed', error);
    return NextResponse.json({ error: 'Could not withdraw the invitation.' }, { status: 500 });
  }
}
