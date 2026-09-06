export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { closeInquiry } from '@/lib/circles/inquiryService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string; inquiryId: string }> }
) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    const { inquiryId } = await params;
    const body = await request.json().catch(() => ({}));

    const inquiry = await closeInquiry(inquiryId, memberId, body.fieldSynthesis);
    return NextResponse.json({ inquiry });
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    if (msg === 'NOT_FOUND') return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    if (msg === 'INQUIRY_NOT_OPEN') return NextResponse.json({ error: 'This inquiry is no longer open' }, { status: 409 });
    if (msg === 'NOT_OPENER') return NextResponse.json({ error: 'Only the person who opened this inquiry can close it' }, { status: 403 });
    console.error('[Circles] POST close error:', error);
    return NextResponse.json({ error: 'Failed to close inquiry' }, { status: 500 });
  }
}
