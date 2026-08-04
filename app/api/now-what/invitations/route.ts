export const dynamic = 'force-dynamic';

/**
 * Member side of the invitation loop.
 *
 * GET  — what a practitioner has offered, with attribution attached at read
 *        time for render-time display. The practitioner's name never travels
 *        onto anything the member authors (CF-D5c).
 * POST — the member's gesture: accepted | declined. Nothing else. There is no
 *        completion state, and this endpoint takes no content: meaning the
 *        member makes belongs in their own material, unlinked.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import {
  listInvitationsForMember,
  respondToInvitation,
  InvitationError,
  type InvitationResponse,
} from '@/lib/practiceField/invitationService';

async function requireMemberId(request: NextRequest): Promise<string | null> {
  const cookieSession = await getCurrentSession();
  return cookieSession?.memberId ?? (await getMemberIdFromRequest(request));
}

export async function GET(request: NextRequest) {
  try {
    // 401-first: identity before any read.
    const memberId = await requireMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const fieldSlug = request.nextUrl.searchParams.get('fieldSlug');
    if (!fieldSlug) {
      return NextResponse.json({ error: 'fieldSlug is required.' }, { status: 400 });
    }
    const programSlug = request.nextUrl.searchParams.get('programSlug');

    const invitations = await listInvitationsForMember({
      memberId,
      fieldSlug,
      programSlug,
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    if (error instanceof InvitationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[now-what/invitations] GET failed', error);
    return NextResponse.json({ error: 'Could not load invitations.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await requireMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      invitationId?: string;
      response?: string;
    } | null;

    if (!body?.invitationId) {
      return NextResponse.json({ error: 'invitationId is required.' }, { status: 400 });
    }

    const result = await respondToInvitation({
      memberId,
      invitationId: body.invitationId,
      response: body.response as InvitationResponse,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof InvitationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[now-what/invitations] POST failed', error);
    return NextResponse.json({ error: 'Could not record your response.' }, { status: 500 });
  }
}
