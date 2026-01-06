export const dynamic = 'error';

/**
 * CASE MEMORY SEARCH API
 *
 * POST - Semantic search over case memories
 */

import { NextRequest, NextResponse } from 'next/server';
import { CaseMemoryService } from '@/lib/caseload/CaseMemoryService';
import { CaseStore } from '@/lib/caseload/CaseStore';

interface RouteParams {
  params: Promise<{ caseId: string }>;
}

/**
 * POST /api/caseload/[caseId]/memories/search
 *
 * Search case memories using semantic similarity.
 *
 * Body:
 * - memberId (required)
 * - query (required): Search query text
 * - topK: Number of results (default 8)
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { caseId } = await context.params;
    const body = await request.json();
    const { memberId, query: searchQuery, topK } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 });
    }

    if (!searchQuery) {
      return NextResponse.json({ error: 'query required' }, { status: 400 });
    }

    // Verify case access
    const caseData = await CaseStore.getCase(caseId, memberId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const results = await CaseMemoryService.searchSimilar({
      caseId,
      query: searchQuery,
      topK: topK || 8,
    });

    return NextResponse.json({
      success: true,
      query: searchQuery,
      results,
      resultCount: results.length,
    });
  } catch (error) {
    console.error('[CASELOAD] Memory search error:', error);
    return NextResponse.json({ error: 'Failed to search memories' }, { status: 500 });
  }
}
