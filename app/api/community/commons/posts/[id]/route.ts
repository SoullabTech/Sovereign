// app/api/community/commons/posts/[id]/route.ts
/**
 * COMMUNITY COMMONS SINGLE POST ROUTE
 *
 * Retrieves a single post by ID.
 * Currently returns mock data since Community Commons content
 * is served from embedded markdown.
 *
 * TODO: Integrate with PostgreSQL when database-backed posts are needed.
 * Per CLAUDE.md: Use local PostgreSQL via lib/db/postgres.ts (NOT Supabase)
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock posts matching the list route
const mockPosts: Record<string, {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  user_id: string;
  user_name: string;
  created_at: string;
  view_count: number;
  like_count: number;
  is_featured: boolean;
  is_published: boolean;
  content_path: string;
}> = {
  '1': {
    id: '1',
    title: 'Nigredo - The Sacred Descent',
    content: `# Nigredo - The Sacred Descent

The first stage of alchemical transformation, nigredo represents the necessary dissolution and decomposition that precedes all genuine growth.

## The Dark Night

In psychological terms, nigredo corresponds to what Jung called the "confrontation with the shadow" - that humbling encounter with the parts of ourselves we'd rather not acknowledge.

## Why Descent Matters

Without nigredo, there can be no authentic transformation. The gold we seek is hidden in the lead of our unexamined material.

*"One does not become enlightened by imagining figures of light, but by making the darkness conscious."* - C.G. Jung`,
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
  '2': {
    id: '2',
    title: 'Active Imagination Practice',
    content: `# Active Imagination Practice

Jung's revolutionary method for engaging directly with unconscious content through waking dialogue.

## The Method

1. **Quiet the Mind** - Enter a receptive state without falling asleep
2. **Allow Images** - Let figures or scenes arise spontaneously
3. **Engage Actively** - Enter into dialogue with what appears
4. **Record** - Write, draw, or otherwise capture the exchange

## Key Principles

- Approach with genuine curiosity, not interpretation
- Allow the figures autonomy - they may surprise you
- Take the experience seriously without literalizing it

*This practice bridges conscious and unconscious, allowing integration of split-off psychic contents.*`,
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
  '3': {
    id: '3',
    title: 'Against Literalization',
    content: `# Against Literalization

James Hillman's essential warning about the death of soul through concrete thinking.

## The Problem

When we take psychological or mythic content literally, we kill its living quality. A dream of death becomes anxiety about dying, rather than an invitation to transformation.

## Staying with Image

Hillman urges us to "stick with the image" - to let it work on us rather than reducing it to explanation.

## Soul-Making

The alternative to literalization is what Hillman calls "soul-making" - allowing images to deepen, complicate, and enrich our experience.

*"The soul's images are its wealth."*`,
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
};

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

    // Look up in mock data
    const post = mockPosts[id];

    if (!post) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'not_found',
          message: 'Post not found. Visit /maia/community/commons for the full library.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      post,
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
