/**
 * DIRECTORY SEARCH API
 *
 * GET - Search listed practitioners
 *
 * Only returns practitioners where:
 * - is_listed = true
 * - accepting_referrals = true
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { searchDirectory } from '@/lib/practitioner/trustedColleagues';

export async function GET(request: NextRequest) {
  try {
    const memberId = await requireMemberId();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query params
    const modalities = searchParams.get('modalities')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const location = searchParams.get('location') || undefined;
    const acceptsSlidingScale = searchParams.get('accepts_sliding_scale') === 'true';

    const profiles = await searchDirectory(memberId, {
      modalities,
      tags,
      location,
      accepts_sliding_scale: acceptsSlidingScale || undefined,
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('[Directory Search] Error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to search directory' },
      { status: 500 }
    );
  }
}
