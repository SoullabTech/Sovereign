export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// GET - Fetch single post with comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  const { id } = await params;

  try {
    // Fetch post
    const postResult = await query(`
      SELECT
        p.*,
        t.slug as territory_slug,
        t.name as territory_name
      FROM community_posts p
      LEFT JOIN community_territories t ON p.territory_id = t.id
      WHERE p.id = $1
    `, [id]);

    if (postResult.rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = postResult.rows[0];

    // Increment view count (fire-and-forget)
    query(
      'UPDATE community_posts SET view_count = view_count + 1 WHERE id = $1',
      [id]
    ).catch(() => {});

    // Fetch comments (threaded — top-level first, then children)
    const commentsResult = await query(`
      SELECT * FROM community_comments
      WHERE post_id = $1
      ORDER BY
        CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
        created_at ASC
    `, [id]);

    return NextResponse.json({
      ok: true,
      post,
      comments: commentsResult.rows,
    });
  } catch (err) {
    console.error('[Post] GET error:', err);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// POST - Add comment to post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;

  try {
    const userId = request.headers.get('x-user-id');
    const userName = request.headers.get('x-user-name') || 'Anonymous';

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify post exists
    const postCheck = await query(
      'SELECT id FROM community_posts WHERE id = $1',
      [postId]
    );
    if (postCheck.rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create comment
    const result = await query(`
      INSERT INTO community_comments (post_id, parent_id, user_id, user_name, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [postId, parentId || null, userId, userName, content.trim()]);

    return NextResponse.json({
      ok: true,
      comment: result.rows[0],
    }, { status: 201 });
  } catch (err) {
    console.error('[Post] POST comment error:', err);
    return NextResponse.json(
      { ok: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
