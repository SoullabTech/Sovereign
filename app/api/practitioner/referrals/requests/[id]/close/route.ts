/**
 * REFERRAL CLOSE API
 *
 * POST - Close a referral (mark as completed/ended)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { closeReferral } from '@/lib/practitioner/trustedColleagues';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id: referralId } = await params;

    const referral = await closeReferral(referralId, memberId);

    return NextResponse.json({ referral });
  } catch (error) {
    console.error('[Referral Close] Error:', error);

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
      { error: 'Failed to close referral' },
      { status: 500 }
    );
  }
}
