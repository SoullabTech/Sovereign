// app/api/library/ask-jeeves/route.ts
// Ask Jeeves: Deep synthesis across MAIA's library
// Kimi-powered research for consciousness exploration

import { NextRequest, NextResponse } from 'next/server';
import { LibraryService } from '@/lib/library/LibraryService';
import { isKimiAvailable } from '@/lib/ai/kimiClient';

export const dynamic = 'force-dynamic';

interface AskJeevesRequest {
  query: string;
  facets?: string[];      // Optional facet filters (e.g., ['shadow', 'integration'])
  maxSources?: number;    // Limit sources consulted (default: 5)
}

/**
 * POST /api/library/ask-jeeves
 *
 * Deep synthesis across MAIA's library using Kimi.
 * This is the research layer - Jeeves prepares wisdom for MAIA,
 * never speaks directly to members in conversation.
 *
 * Use cases:
 * - Member asks "What does Jung say about shadow integration?"
 * - MAIA needs background research on a topic
 * - "Ask Jeeves" feature in Soullab for deep exploration
 */
export async function POST(request: NextRequest) {
  const t0 = Date.now();

  try {
    // Parse request
    const body: AskJeevesRequest = await request.json();
    const { query, facets, maxSources = 5 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (query.length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (query.length > 1000) {
      return NextResponse.json(
        { error: 'Query must be less than 1000 characters' },
        { status: 400 }
      );
    }

    // Check Kimi availability
    if (!isKimiAvailable()) {
      return NextResponse.json(
        {
          error: 'Jeeves is currently unavailable',
          detail: 'The research engine (Kimi) is not configured. Please check MOONSHOT_API_KEY.',
          fallback_available: false,
        },
        { status: 503 }
      );
    }

    // Initialize library service
    const library = new LibraryService();

    // Ask Jeeves
    console.log(`🎩 Ask Jeeves: "${query.slice(0, 50)}..." (facets: ${facets?.join(', ') || 'none'})`);

    const synthesis = await library.askJeeves(query, {
      maxSources: maxSources,
      maxChunksPerSource: 3,
    });

    const totalTime = Date.now() - t0;

    if (!synthesis) {
      return NextResponse.json(
        { error: 'Jeeves could not produce a synthesis', detail: 'No relevant sources found or synthesis failed' },
        { status: 404 }
      );
    }

    console.log(`🎩 Jeeves synthesis complete: ${synthesis.sources_consulted} sources, ${totalTime}ms total`);

    return NextResponse.json({
      success: true,
      synthesis: synthesis.synthesis,
      provenance: synthesis.provenance,
      facets_resonating: synthesis.facets_resonating,
      sources_consulted: synthesis.sources_consulted,
      model_used: synthesis.model_used,
      processing_time_ms: synthesis.processing_time_ms,
      total_time_ms: totalTime,
    });

  } catch (error: any) {
    console.error('Ask Jeeves error:', error);

    // Handle specific error types
    if (error.message?.includes('insufficient balance') || error.message?.includes('Insufficient Balance')) {
      return NextResponse.json(
        {
          error: 'Jeeves research engine needs attention',
          detail: 'The Moonshot account requires funding. Please contact the lab administrator.',
        },
        { status: 503 }
      );
    }

    if (error.message?.includes('No library sources')) {
      return NextResponse.json(
        {
          error: 'Library is empty',
          detail: 'No sources have been ingested yet. Run the library ingestion script first.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Jeeves encountered an error',
        detail: error.message || 'Unknown error during synthesis',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/library/ask-jeeves
 *
 * Health check and stats for Ask Jeeves feature.
 */
export async function GET() {
  try {
    const library = new LibraryService();
    const stats = await library.getStats();
    const kimiAvailable = isKimiAvailable();

    return NextResponse.json({
      status: kimiAvailable ? 'available' : 'unavailable',
      kimi_configured: kimiAvailable,
      library_stats: {
        sources: stats.sources,
        chunks: stats.chunks,
        distillates: stats.distillates,
      },
      message: kimiAvailable
        ? 'Jeeves is ready to assist with your research'
        : 'Jeeves requires MOONSHOT_API_KEY to be configured',
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
