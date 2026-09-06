export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { respondToInquiry } from '@/lib/circles/inquiryService';
import { respondToInquirySchema } from '@/lib/circles/types';

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
    const body = await request.json();
    const parsed = respondToInquirySchema.parse(body);

    const response = await respondToInquiry(
      inquiryId,
      memberId,
      parsed.responseText,
      parsed.responseType
    );
    return NextResponse.json({ response }, { status: 201 });
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    if (msg === 'NOT_FOUND') return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    if (msg === 'INQUIRY_NOT_OPEN') return NextResponse.json({ error: 'This inquiry is no longer open' }, { status: 409 });
    if (msg === 'ALREADY_RESPONDED') return NextResponse.json({ error: 'You have already responded to this inquiry' }, { status: 409 });
    if (error?.name === 'ZodError') return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    console.error('[Circles] POST respond error:', error);
    return NextResponse.json({ error: 'Failed to respond' }, { status: 500 });
  }
}
