export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { withdrawResponse } from '@/lib/circles/inquiryService';

/**
 * CA-03 — a member withdraws their own structured-inquiry response.
 *
 * The response returns nothing but success. A withdrawal must not reveal
 * whether or how other members responded, so there is no count, no remaining
 * set, and no inquiry state in the payload.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string; inquiryId: string }> }
) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const { inquiryId } = await params;
    await withdrawResponse(inquiryId, access.memberId);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    switch (error?.message) {
      case 'NOT_FOUND':
        return NextResponse.json({ error: 'No response to withdraw' }, { status: 404 });
      case 'ALREADY_WITHDRAWN':
        return NextResponse.json({ error: 'Already withdrawn' }, { status: 409 });
      case 'FORBIDDEN':
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    console.error('[Circles] POST /api/circles/[circleId]/inquiries/[inquiryId]/withdraw error:', error);
    return NextResponse.json({ error: 'Failed to withdraw response' }, { status: 500 });
  }
}
