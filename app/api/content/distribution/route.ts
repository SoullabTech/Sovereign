/**
 * Content Distribution API
 *
 * GET: List posts (filterable by status, format)
 * PATCH: Update post status (draft → approved → scheduled)
 *
 * Protected by LABTOOLS_SECRET (admin-only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

const ADMIN_SECRET = process.env.LABTOOLS_SECRET || process.env.LABTOOLS_ADMIN_PASSWORD;

function checkAuth(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret');
  return Boolean(ADMIN_SECRET && secret === ADMIN_SECRET);
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const format = searchParams.get('format');

  // Canonical columns with legacy fallback: content trumps text, format trumps post_type
  let sql = `SELECT *, COALESCE(content, text) AS content, COALESCE(format, post_type) AS format, COALESCE(element, source_element) AS element FROM content_posts WHERE 1=1`;
  const params: string[] = [];

  if (status) {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }

  if (format) {
    params.push(format);
    sql += ` AND format = $${params.length}`;
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const result = await query(sql, params);
    return NextResponse.json({ posts: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('[Distribution] List error:', error);
    return NextResponse.json({ error: 'Failed to list posts' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, platform } = body;

    if (!id) {
      return NextResponse.json({ error: 'Post id required' }, { status: 400 });
    }

    const validStatuses = ['draft', 'approved', 'scheduled', 'published'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const updates: string[] = [];
    const params: (string | null)[] = [];

    if (status) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }

    if (platform !== undefined) {
      params.push(platform);
      updates.push(`platform = $${params.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const result = await query(
      `UPDATE content_posts SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post: result.rows[0] });
  } catch (error) {
    console.error('[Distribution] Update error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
