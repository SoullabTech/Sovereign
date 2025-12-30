// @ts-nocheck
// app/api/community/commons/posts/route.ts
/**
 * COMMUNITY COMMONS POSTS LIST ROUTE
 *
 * Retrieves posts from the Community Commons with filtering, sorting, and pagination.
 */

import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filtering
    const featured = searchParams.get('featured') === 'true';
    const tag = searchParams.get('tag');
    const userId = searchParams.get('userId');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const supabase = createClient();
    let query = supabase
      .from('community_commons_posts')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    // Apply filters
    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'updated_at', 'view_count', 'like_count', 'title'];
    const column = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(column, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('[Commons] Failed to fetch posts:', error);
      return NextResponse.json(
        {
          ok: false,
          reason: 'database_error',
          message: 'Failed to fetch posts',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error('[Commons] GET error:', err);
    return NextResponse.json(
      {
        ok: false,
        reason: 'server_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
