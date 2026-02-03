/**
 * DIRECTORY PROFILE API
 *
 * GET - Get own directory profile
 * POST - Update own directory profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getDirectoryProfile,
  updateDirectoryProfile,
} from '@/lib/practitioner/trustedColleagues';

export async function GET() {
  try {
    const memberId = await requireMemberId();
    const profile = await getDirectoryProfile(memberId);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Directory Profile GET] Error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await requireMemberId();
    const body = await request.json();

    const profile = await updateDirectoryProfile(memberId, {
      is_listed: body.is_listed,
      accepting_referrals: body.accepting_referrals,
      display_name: body.display_name,
      location: body.location,
      bio: body.bio,
      modalities: body.modalities,
      tags: body.tags,
      languages: body.languages,
      accepts_sliding_scale: body.accepts_sliding_scale,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Directory Profile POST] Error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
