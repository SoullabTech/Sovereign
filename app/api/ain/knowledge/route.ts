// Production requires force-dynamic for semantic search
export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import {
  retrieveKnowledge,
  retrieveForMode,
  formatForPrompt,
  getKnowledgeStats,
} from '@/lib/ain/knowledge/RetrievalService';
import { betaSession } from '@/lib/auth/betaSession';

/**
 * GET /api/ain/knowledge
 *
 * Retrieve relevant knowledge chunks for a query.
 *
 * Query params:
 *   - q: Query text (required)
 *   - mode: Session mode (care, talk, somatic, etc.)
 *   - limit: Max results (default 5)
 *   - format: 'chunks' (default) or 'prompt' (formatted for injection)
 */
export async function GET(request: NextRequest) {
  try {
    const user = betaSession.getCurrentUser();
    const { searchParams } = new URL(request.url);

    const queryText = searchParams.get('q');
    const mode = searchParams.get('mode');
    const limit = parseInt(searchParams.get('limit') || '5');
    const format = searchParams.get('format') || 'chunks';

    // Stats request
    if (searchParams.get('stats') === 'true') {
      const stats = await getKnowledgeStats();
      return NextResponse.json({
        success: true,
        stats,
      });
    }

    if (!queryText) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Retrieve knowledge
    const chunks = mode
      ? await retrieveForMode(queryText, mode, { limit, userId: user?.id })
      : await retrieveKnowledge(queryText, { limit, userId: user?.id });

    // Format response
    if (format === 'prompt') {
      const promptText = formatForPrompt(chunks);
      return NextResponse.json({
        success: true,
        prompt: promptText,
        chunksUsed: chunks.length,
      });
    }

    return NextResponse.json({
      success: true,
      chunks: chunks.map(c => ({
        id: c.chunkId,
        title: c.sourceTitle,
        text: c.chunkText,
        domain: c.domain,
        categories: c.categories,
        similarity: Math.round(c.similarity * 100) / 100,
      })),
    });

  } catch (error) {
    console.error('[AIN Knowledge API] Error:', error);
    return NextResponse.json(
      { error: 'Knowledge retrieval failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ain/knowledge
 *
 * Retrieve knowledge with more options (domains, categories).
 */
export async function POST(request: NextRequest) {
  try {
    const user = betaSession.getCurrentUser();
    const body = await request.json();

    const {
      query: queryText,
      mode,
      domains,
      categories,
      limit = 5,
      minSimilarity = 0.3,
      format = 'chunks',
    } = body;

    if (!queryText) {
      return NextResponse.json(
        { error: 'Query text is required' },
        { status: 400 }
      );
    }

    const chunks = await retrieveKnowledge(queryText, {
      limit,
      minSimilarity,
      domains,
      categories,
      userId: user?.id,
      sessionMode: mode,
    });

    if (format === 'prompt') {
      const promptText = formatForPrompt(chunks);
      return NextResponse.json({
        success: true,
        prompt: promptText,
        chunksUsed: chunks.length,
        sources: chunks.map(c => c.sourceTitle),
      });
    }

    return NextResponse.json({
      success: true,
      chunks: chunks.map(c => ({
        id: c.chunkId,
        title: c.sourceTitle,
        text: c.chunkText,
        domain: c.domain,
        categories: c.categories,
        similarity: Math.round(c.similarity * 100) / 100,
      })),
    });

  } catch (error) {
    console.error('[AIN Knowledge API] Error:', error);
    return NextResponse.json(
      { error: 'Knowledge retrieval failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
