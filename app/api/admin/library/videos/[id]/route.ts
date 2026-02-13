/**
 * Admin Video Library - Single Video API
 *
 * PUT: Update a video
 * DELETE: Delete a video
 *
 * Protected by LABTOOLS_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, updateOne } from '@/lib/db/postgres';

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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT: Update a video
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminSecret, ...updates } = body;

    if (!validateAdminSecret(adminSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or missing admin secret' },
        { status: 401 }
      );
    }

    // Build update data (only include provided fields)
    const data: Record<string, any> = {};

    if (updates.title !== undefined) data.title = String(updates.title).trim();
    if (updates.description !== undefined) data.description = updates.description?.trim() || null;
    if (updates.heygen_url !== undefined) data.heygen_url = String(updates.heygen_url).trim();
    if (updates.thumbnail_url !== undefined) data.thumbnail_url = updates.thumbnail_url?.trim() || null;
    if (updates.tags !== undefined) data.tags = Array.isArray(updates.tags) ? updates.tags.map(String) : [];
    if (updates.visibility !== undefined) {
      if (!['member', 'practitioner', 'admin'].includes(updates.visibility)) {
        return NextResponse.json(
          { error: 'Visibility must be member, practitioner, or admin' },
          { status: 400 }
        );
      }
      data.visibility = updates.visibility;
    }
    if (updates.is_featured !== undefined) data.is_featured = Boolean(updates.is_featured);
    if (updates.duration_seconds !== undefined) data.duration_seconds = updates.duration_seconds ?? null;
    if (updates.sort_order !== undefined) data.sort_order = updates.sort_order ?? 0;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const video = await updateOne('member_videos', id, data);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    console.log(`[AdminVideos] Updated video: ${video.title} (${id})`);

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error: any) {
    console.error('[AdminVideos] Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update video' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete a video
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const adminSecret = searchParams.get('adminSecret');

    if (!validateAdminSecret(adminSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or missing admin secret' },
        { status: 401 }
      );
    }

    const result = await query(
      `DELETE FROM member_videos WHERE id = $1 RETURNING id, title`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    console.log(`[AdminVideos] Deleted video: ${result.rows[0].title} (${id})`);

    return NextResponse.json({
      success: true,
      deleted: result.rows[0],
    });
  } catch (error: any) {
    console.error('[AdminVideos] Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete video' },
      { status: 500 }
    );
  }
}
