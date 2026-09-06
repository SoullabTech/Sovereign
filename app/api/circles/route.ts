export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCircleAccess } from '@/lib/circles/circleAccess';
import { createCircleSchema } from '@/lib/circles/types';
import { listMyCircles, createCircle } from '@/lib/circles/circleService';

export async function GET(request: NextRequest) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    const circles = await listMyCircles(memberId);
    return NextResponse.json({ circles });
  } catch (error) {
    console.error('[Circles] GET /api/circles error:', error);
    return NextResponse.json({ error: 'Failed to list circles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireCircleAccess(request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
    const memberId = access.memberId;

    const body = createCircleSchema.parse(await request.json());
    const circle = await createCircle(memberId, body.name, body.description ?? null);
    return NextResponse.json({ circle }, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('[Circles] POST /api/circles error:', error);
    return NextResponse.json({ error: 'Failed to create circle' }, { status: 500 });
  }
}
