export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getFieldBySlug, joinField } from '@/lib/wisdom-fields/fieldService';

/**
 * POST /api/wisdom-fields/[slug]/join
 * Join a field. Open fields require no token.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const result = await getFieldBySlug(slug);
    if (!result) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    const outcome = await joinField(result.field.id, memberId);
    return NextResponse.json(outcome, { status: 200 });
  } catch (error: any) {
    if (error?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }
    console.error('[WisdomFields] POST /api/wisdom-fields/[slug]/join error:', error);
    return NextResponse.json({ error: 'Failed to join field' }, { status: 500 });
  }
}
