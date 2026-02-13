/**
 * Admin Video Library API
 *
 * POST: Create a new video entry
 * GET: List all videos (including admin-only)
 *
 * Protected by LABTOOLS_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, insertOne, updateOne } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

// Admin auth via LABTOOLS_SECRET
const ADMIN_SECRET = process.env.LABTOOLS_SECRET || process.env.LABTOOLS_ADMIN_PASSWORD;

function validateAdminSecret(secret: string | null | undefined): boolean {
  if (!ADMIN_SECRET) {
    console.error('[AdminVideos] LABTOOLS_SECRET not configured');
    return false;
  }
  return secret === ADMIN_SECRET;
}

interface VideoInput {
  title: string;
  description?: string;
  heygen_url: string;
  thumbnail_url?: string;
  tags?: string[];
  visibility?: 'member' | 'practitioner' | 'admin';
  is_featured?: boolean;
  duration_seconds?: number;
  sort_order?: number;
}

/**
 * POST: Create a new video
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminSecret, ...videoData } = body as VideoInput & { adminSecret?: string };

    // Admin auth check
    if (!validateAdminSecret(adminSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or missing admin secret' },
        { status: 401 }
      );
    }

    // Validate required fields
    const title = String(videoData.title ?? '').trim();
    const heygenUrl = String(videoData.heygen_url ?? '').trim();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!heygenUrl) {
      return NextResponse.json({ error: 'HeyGen URL is required' }, { status: 400 });
    }

    // Prepare data
    const data = {
      title,
      description: videoData.description?.trim() || null,
      heygen_url: heygenUrl,
      thumbnail_url: videoData.thumbnail_url?.trim() || null,
      tags: Array.isArray(videoData.tags) ? videoData.tags.map(String) : [],
      visibility: videoData.visibility || 'member',
      is_featured: Boolean(videoData.is_featured),
      duration_seconds: videoData.duration_seconds ?? null,
      sort_order: videoData.sort_order ?? 0,
    };

    // Validate visibility
    if (!['member', 'practitioner', 'admin'].includes(data.visibility)) {
      return NextResponse.json(
        { error: 'Visibility must be member, practitioner, or admin' },
        { status: 400 }
      );
    }

    const video = await insertOne('member_videos', data);

    console.log(`[AdminVideos] Created video: ${video.title} (${video.id})`);

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error: any) {
    console.error('[AdminVideos] Create error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create video' },
      { status: 500 }
    );
  }
}

/**
 * GET: List all videos (admin view includes admin-only videos)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminSecret = searchParams.get('adminSecret');

    if (!validateAdminSecret(adminSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or missing admin secret' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT *
       FROM member_videos
       ORDER BY
         sort_order ASC,
         created_at DESC`
    );

    return NextResponse.json({
      success: true,
      videos: result.rows,
    });
  } catch (error: any) {
    console.error('[AdminVideos] List error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list videos' },
      { status: 500 }
    );
  }
}
