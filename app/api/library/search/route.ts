// app/api/library/search/route.ts
// Library semantic search endpoint

import { NextRequest, NextResponse } from 'next/server';
import { LibraryService } from '@/lib/library/LibraryService';

export const dynamic = 'force-dynamic';

interface SearchRequest {
  query: string;
  limit?: number;          // Max results (default: 10)
  facets?: string[];       // Filter by facet tags
  minScore?: number;       // Minimum similarity score (default: 0.5)
}

/**
 * POST /api/library/search
 *
 * Semantic search across the library.
 * Returns relevant chunks with provenance.
 */
export async function POST(request: NextRequest) {
  const t0 = Date.now();

  try {
    const body: SearchRequest = await request.json();
    const { query, limit = 10, facets, minScore = 0.5 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const library = new LibraryService();

    console.log(`[Library Search] "${query.slice(0, 50)}..." (limit: ${limit}, facets: ${facets?.join(', ') || 'none'})`);

    const context = await library.search(query, {
      limit,
      mode: 'deep',
    });

    const elapsed = Date.now() - t0;

    // Filter by minimum score if specified
    const results = minScore > 0
      ? context.chunks.filter(c => c.score >= minScore)
      : context.chunks;

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
      elapsed_ms: elapsed,
    });

  } catch (error: any) {
    console.error('Library search error:', error);

    return NextResponse.json(
      {
        error: 'Search failed',
        detail: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
