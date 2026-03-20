export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  getFieldBySlug,
  listFieldWorks,
  listFieldCoreIdeas,
} from '@/lib/wisdom-fields/fieldService';

/**
 * GET /api/wisdom-fields/[slug]
 * Field detail: field row + works + core ideas + optional membership status.
 * Public — works and core ideas visible to all. Membership status requires auth.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const memberId = await getMemberIdFromRequest(request);
    const result = await getFieldBySlug(slug, memberId ?? undefined);

    if (!result) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    const [works, coreIdeas] = await Promise.all([
      listFieldWorks(result.field.id),
      listFieldCoreIdeas(result.field.id),
    ]);

    return NextResponse.json({
      field: result.field,
      membership: result.membership,
      works,
      coreIdeas,
    });
  } catch (error) {
    console.error('[WisdomFields] GET /api/wisdom-fields/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to load field' }, { status: 500 });
  }
}
