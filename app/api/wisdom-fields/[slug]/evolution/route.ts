export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getFieldBySlug, getEvolutionThread, addEvolutionEntry } from '@/lib/wisdom-fields/fieldService';
import { postEvolutionEntrySchema } from '@/lib/wisdom-fields/types';

/**
 * GET /api/wisdom-fields/[slug]/evolution
 * Get the member's private evolution thread for this field.
 * Returns only their own entries.
 */
export async function GET(
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

    const entries = await getEvolutionThread(result.field.id, memberId);
    return NextResponse.json({ entries });
  } catch (error: any) {
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Field membership required' }, { status: 403 });
    }
    if (error?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }
    console.error('[WisdomFields] GET evolution error:', error);
    return NextResponse.json({ error: 'Failed to load evolution thread' }, { status: 500 });
  }
}

/**
 * POST /api/wisdom-fields/[slug]/evolution
 * Add an entry to the member's evolution thread.
 * If shared=true, also surfaces in the contributions feed as type=integration.
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

    const body = postEvolutionEntrySchema.parse(await request.json());

    const result = await getFieldBySlug(slug);
    if (!result) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    const outcome = await addEvolutionEntry(result.field.id, memberId, body.body, body.shared);
    return NextResponse.json(outcome, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Field membership required' }, { status: 403 });
    }
    if (error?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }
    console.error('[WisdomFields] POST evolution error:', error);
    return NextResponse.json({ error: 'Failed to add evolution entry' }, { status: 500 });
  }
}
