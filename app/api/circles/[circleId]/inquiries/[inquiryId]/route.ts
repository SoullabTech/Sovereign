export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getInquiryWithResponses } from '@/lib/circles/inquiryService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string; inquiryId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
