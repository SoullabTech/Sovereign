export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { createInquiry, listInquiries } from '@/lib/circles/inquiryService';
import { createInquirySchema } from '@/lib/circles/types';
import type { InquiryStatus } from '@/lib/circles/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    const { circleId } = await params;
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as InquiryStatus | null;

    const inquiries = await listInquiries(circleId, memberId, status ?? undefined);
    return NextResponse.json({ inquiries });
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    console.error('[Circles] GET inquiries error:', error);
    return NextResponse.json({ error: 'Failed to list inquiries' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    const { circleId } = await params;
    const body = await request.json();
    const parsed = createInquirySchema.parse(body);

    const inquiry = await createInquiry(circleId, memberId, parsed.question);
    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (error: any) {
    const msg = error?.message;
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    if (msg === 'ROLE_INSUFFICIENT') return NextResponse.json({ error: 'Only helpers and facilitators can open inquiries' }, { status: 403 });
    if (msg === 'INQUIRY_ALREADY_OPEN') return NextResponse.json({ error: 'An inquiry is already open in this circle' }, { status: 409 });
    if (error?.name === 'ZodError') return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    console.error('[Circles] POST inquiry error:', error);
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
  }
}
