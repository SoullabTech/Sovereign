/**
 * REFERRAL SEND API
 *
 * POST - Send a draft referral to the colleague
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { sendReferral } from '@/lib/practitioner/trustedColleagues';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id: referralId } = await params;

    const referral = await sendReferral(referralId, memberId);

    return NextResponse.json({ referral });
  } catch (error) {
    console.error('[Referral Send] Error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'REFERRAL_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Referral not found or not in draft status' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send referral' },
      { status: 500 }
    );
  }
}
