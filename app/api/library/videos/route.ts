/**
 * Member Video Library API
 *
 * GET: List published videos visible to authenticated members
 * Visibility levels: member (all), practitioner (practitioners+), admin (admin only)
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

interface MemberVideo {
  id: string;
  title: string;
  description: string | null;
  heygen_url: string;
  thumbnail_url: string | null;
  tags: string[];
  visibility: 'member' | 'practitioner' | 'admin';
  is_featured: boolean;
  duration_seconds: number | null;
  sort_order: number;
  created_at: string;
}

export async function GET() {
  try {
    // Require authenticated member
    await requireMemberId();

    // Fetch videos visible to members (excludes admin-only)
    const result = await query<MemberVideo>(
      `SELECT
        id,
        title,
        description,
        heygen_url,
        thumbnail_url,
        tags,
        visibility,
        is_featured,
        duration_seconds,
        sort_order,
        created_at
      FROM member_videos
      WHERE visibility IN ('member', 'practitioner')
      ORDER BY
        is_featured DESC,
        sort_order ASC,
        created_at DESC`
    );

    return NextResponse.json({
      videos: result.rows,
    });
  } catch (error: any) {
    if (error?.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.error('[VideoLibrary] Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
