/**
 * REFERRAL DETAIL API
 *
 * GET - View a single referral
 * PATCH - Update referral (respond with accept/decline)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getReferral,
  respondToReferral,
  updateRecipientNote,
} from '@/lib/practitioner/trustedColleagues';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id: referralId } = await params;

    const referral = await getReferral(referralId, memberId);

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ referral });
  } catch (error) {
    console.error('[Referral GET] Error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch referral' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id: referralId } = await params;
    const body = await request.json();

    // Handle response (accept/decline)
    if (body.response) {
      if (!['accepted', 'declined'].includes(body.response)) {
        return NextResponse.json(
          { error: 'response must be "accepted" or "declined"' },
          { status: 400 }
        );
      }

      const referral = await respondToReferral(
        referralId,
        memberId,
        body.response,
        body.recipient_note
      );

      return NextResponse.json({ referral });
    }

    // Handle recipient note update
    if (body.recipient_note !== undefined) {
      const referral = await updateRecipientNote(
        referralId,
        memberId,
        body.recipient_note
      );

      return NextResponse.json({ referral });
    }

    return NextResponse.json(
      { error: 'No valid update provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Referral PATCH] Error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'REFERRAL_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Referral not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update referral' },
      { status: 500 }
    );
  }
}
