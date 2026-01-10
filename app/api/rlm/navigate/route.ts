/**
 * RLM Navigate API
 *
 * POST /api/rlm/navigate
 * Body: { query: string, limit?: number, includeSnippets?: boolean }
 *
 * Returns next files to open, suggested grep queries, and confidence score.
 */
import { NextResponse } from 'next/server';
import {
  navigateCodebase,
  type RLMNavigateRequest,
} from '@/lib/rlm/navigate';
import { isRlmAllowed } from '@/lib/rlm/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!isRlmAllowed(req)) {
      return NextResponse.json(
        { success: false, error: 'not_found' },
        { status: 404 }
      );
    }

    const body = (await req.json()) as Partial<RLMNavigateRequest>;

    const query = String(body.query ?? '').trim();
    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: 'query_required' },
        { status: 400 }
      );
    }

    const result = await navigateCodebase({
      query,
      limit: typeof body.limit === 'number' ? body.limit : 5,
      includeSnippets: body.includeSnippets ?? true,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[RLM Navigate] Error:', err);
    return NextResponse.json(
      { success: false, error: 'rlm_navigate_failed' },
      { status: 500 }
    );
  }
}
