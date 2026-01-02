// app/api/community/commons/posts/route.ts
/**
 * COMMUNITY COMMONS POSTS LIST ROUTE
 *
 * Returns community posts. Currently returns mock data since
 * Community Commons content is served from embedded markdown.
 *
 * TODO: Integrate with PostgreSQL when database-backed posts are needed.
 * Per CLAUDE.md: Use local PostgreSQL via lib/db/postgres.ts (NOT Supabase)
 */

import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

// Mock posts for API compatibility
const mockPosts = [
  {
    id: '1',
    title: 'Nigredo - The Sacred Descent',
    excerpt: 'The alchemical stage of breakdown and purification',
    tags: ['concepts', 'alchemy', 'nigredo'],
    user_id: 'commons',
    user_name: 'Community Commons',
    created_at: new Date().toISOString(),
    view_count: 234,
    like_count: 45,
    is_featured: true,
    is_published: true,
    content_path: 'concepts/nigredo'
  },
  {
    id: '2',
    title: 'Active Imagination Practice',
    excerpt: "Jung's revolutionary method for engaging unconscious content",
    tags: ['practices', 'jung', 'imagination'],
    user_id: 'commons',
    user_name: 'Community Commons',
    created_at: new Date().toISOString(),
    view_count: 189,
    like_count: 38,
    is_featured: true,
    is_published: true,
    content_path: 'practices/active-imagination'
  },
  {
    id: '3',
    title: 'Against Literalization',
    excerpt: 'Deep explorations of key themes in depth psychology',
    tags: ['essays', 'hillman', 'psychology'],
    user_id: 'commons',
    user_name: 'Community Commons',
    created_at: new Date().toISOString(),
    view_count: 156,
    like_count: 29,
    is_featured: false,
    is_published: true,
    content_path: 'essays/against-literalization'
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Filtering
    const featured = searchParams.get('featured') === 'true';
    const tag = searchParams.get('tag');

    // Filter mock posts
    let filteredPosts = [...mockPosts];

    if (featured) {
      filteredPosts = filteredPosts.filter(p => p.is_featured);
    }

    if (tag) {
      filteredPosts = filteredPosts.filter(p => p.tags.includes(tag));
    }

    // Pagination
    const total = filteredPosts.length;
    const start = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(start, start + limit);

    return NextResponse.json({
      ok: true,
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      note: 'Content served from Community Commons. Visit /maia/community/commons for full library.'
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
