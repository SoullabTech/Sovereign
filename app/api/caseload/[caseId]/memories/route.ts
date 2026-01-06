export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ caseId: 'default' }];
}

/**
 * CASE MEMORIES API
 *
 * GET  - List recent memories + patterns for a case
 * POST - Manually ingest content into memory
 */

import { NextRequest, NextResponse } from 'next/server';
import { CaseMemoryService } from '@/lib/caseload/CaseMemoryService';
import { CasePatternService } from '@/lib/caseload/CasePatternService';
import { CaseStore } from '@/lib/caseload/CaseStore';

interface RouteParams {
  params: Promise<{ caseId: string }>;
}

/**
 * GET /api/caseload/[caseId]/memories
 *
 * List recent memory chunks and cached patterns for a case.
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { caseId } = await context.params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const limit = parseInt(searchParams.get('limit') || '25');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 });
    }

    // Verify case access
    const caseData = await CaseStore.getCase(caseId, memberId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const [recent, patterns] = await Promise.all([
      CaseMemoryService.listRecent({ caseId, limit }),
      CasePatternService.get(caseId),
    ]);

    return NextResponse.json({
      recent,
      patterns: patterns?.summary || null,
      patternsComputedAt: patterns?.computed_at || null,
    });
  } catch (error) {
    console.error('[CASELOAD] Get memories error:', error);
    return NextResponse.json({ error: 'Failed to get memories' }, { status: 500 });
  }
}

/**
 * POST /api/caseload/[caseId]/memories
 *
 * Manually ingest content into case memory.
 *
 * Body:
 * - memberId (required)
 * - content (required)
 * - sourceType: 'note' | 'capture' | 'consultation' | 'manual'
 * - sourceId: optional source ID
 * - occurredAt: optional timestamp
 * - metadata: optional metadata object
 * - embed: whether to generate embeddings (default true)
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { caseId } = await context.params;
    const body = await request.json();
    const { memberId, content, sourceType, sourceId, occurredAt, metadata, embed } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'content required' }, { status: 400 });
    }

    // Verify case access
    const caseData = await CaseStore.getCase(caseId, memberId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Ingest the content
    const result = await CaseMemoryService.ingestText({
      caseId,
      memberId,
      sourceType: sourceType || 'manual',
      sourceId: sourceId || null,
      occurredAt: occurredAt || new Date().toISOString(),
      content,
      metadata: metadata || {},
      embed: embed !== false,
    });

    // Refresh patterns after ingest
    const patterns = await CasePatternService.upsert(caseId);

    return NextResponse.json({
      success: true,
      chunksInserted: result.inserted,
      patterns,
    });
  } catch (error) {
    console.error('[CASELOAD] Ingest memory error:', error);
    return NextResponse.json({ error: 'Failed to ingest memory' }, { status: 500 });
  }
}
