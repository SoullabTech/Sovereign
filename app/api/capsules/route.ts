export const dynamic = 'force-dynamic';

/**
 * GET /api/capsules
 *
 * List capsules for the authenticated member.
 * Query params: q, archived, pinned, draft, tag, limit, cursor
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { listCapsules, CapsuleListQuerySchema } from '@/lib/capsules';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const memberId = await requireMemberId();

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const rawQuery = {
      q: searchParams.get('q') || undefined,
      archived: searchParams.get('archived') === 'true' ? true : searchParams.get('archived') === 'false' ? false : undefined,
      pinned: searchParams.get('pinned') === 'true' ? true : searchParams.get('pinned') === 'false' ? false : undefined,
      draft: searchParams.get('draft') === 'true' ? true : searchParams.get('draft') === 'false' ? false : undefined,
      tag: searchParams.get('tag') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
      cursor: searchParams.get('cursor') || undefined,
    };

    // Validate query params
    const parseResult = CapsuleListQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // Fetch capsules
    const result = await listCapsules({
      userId: memberId,
      query: parseResult.data,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[API] GET /api/capsules error:', error);
    return NextResponse.json(
      { error: 'Failed to list capsules' },
      { status: 500 }
    );
  }
}
