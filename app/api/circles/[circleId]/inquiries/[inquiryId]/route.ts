export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { getInquiryWithResponses } from '@/lib/circles/inquiryService';

export async function GET(
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
    const data = await getInquiryWithResponses(inquiryId, memberId);
    return NextResponse.json(data);
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    if (msg === 'NOT_FOUND') return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    console.error('[Circles] GET inquiry detail error:', error);
    return NextResponse.json({ error: 'Failed to get inquiry' }, { status: 500 });
  }
}
