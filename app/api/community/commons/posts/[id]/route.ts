// @ts-nocheck
// app/api/community/commons/posts/[id]/route.ts
/**
 * COMMUNITY COMMONS SINGLE POST ROUTE
 *
 * Retrieves a single post by ID and increments view count.
 */

import { NextRequest, NextResponse } from 'next/server';
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'invalid_id',
          message: 'Post ID is required',
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Fetch post
    const { data: post, error } = await supabase
      .from('community_commons_posts')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error || !post) {
      console.error('[Commons] Post not found:', id, error);
      return NextResponse.json(
        {
          ok: false,
          reason: 'not_found',
          message: 'Post not found',
        },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    supabase
      .from('community_commons_posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', id)
      .then(() => {})
      .catch(err => console.warn('[Commons] Failed to increment view count:', err));

    return NextResponse.json({
      ok: true,
      post,
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
