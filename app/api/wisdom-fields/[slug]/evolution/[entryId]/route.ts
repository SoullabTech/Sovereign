export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getFieldBySlug, setEvolutionEntryShared } from '@/lib/wisdom-fields/fieldService';
import { patchEvolutionShareSchema } from '@/lib/wisdom-fields/types';

/**
 * PATCH /api/wisdom-fields/[slug]/evolution/[entryId]
 * Toggle the shared status of an evolution entry.
 * shared: false → true  surfaces it in the contributions feed
 * shared: true → false  hides from feed (does not delete the contribution row)
 * Members can only modify their own entries.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; entryId: string }> }
) {
  try {
    const { slug, entryId } = await params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = patchEvolutionShareSchema.parse(await request.json());

    const result = await getFieldBySlug(slug);
    if (!result) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    const outcome = await setEvolutionEntryShared(
      result.field.id,
      entryId,
      memberId,
      body.shared
    );

    return NextResponse.json(outcome);
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (error?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    console.error('[WisdomFields] PATCH evolution/[entryId] error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}
