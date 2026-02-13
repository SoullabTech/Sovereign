/**
 * GET /api/guidance/content?featureKey=maia.sanctuary
 *
 * Returns enabled tooltip content for a given feature key.
 * Phase 1: tooltip depth only. Phase 2+ will add micro/deep/article.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const featureKey = searchParams.get('featureKey');

  if (!featureKey) {
    return NextResponse.json({ error: 'Missing featureKey' }, { status: 400 });
  }

  try {
    const result = await query(
      `SELECT id, slug, title, summary, depth
       FROM guidance_content
       WHERE feature_key = $1
         AND is_enabled = true
         AND depth = 'tooltip'
       ORDER BY sort_rank ASC, created_at ASC
       LIMIT 1`,
      [featureKey]
    );

    return NextResponse.json({
      featureKey,
      items: result.rows,
    });
  } catch (error) {
    console.error('[Guidance] Failed to fetch content:', error);
    return NextResponse.json({ featureKey, items: [] });
  }
}
