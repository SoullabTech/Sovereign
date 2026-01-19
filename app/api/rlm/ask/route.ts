/**
 * RLM Ask API - Agentic codebase Q&A
 *
 * POST /api/rlm/ask
 * Body: { query: string, includeTrace?: boolean, maxIterations?: number }
 *
 * Uses local Ollama to iteratively search, read, and synthesize answers.
 * Returns RLMResult with sourceRefs, usage, and optional trace.
 */
import { NextResponse } from 'next/server';
import { navigateCodebase } from '@/lib/rlm/CodebaseNavigator';
import { isRlmAllowed } from '@/lib/rlm/access';
import type { RLMConfig } from '@/lib/rlm/types';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

type AskBody = {
  query?: string;
  includeTrace?: boolean;
  maxIterations?: number;
  budget?: {
    search?: number;
    read?: number;
    list?: number;
  };
};

export async function POST(req: Request) {
  try {
    if (!isRlmAllowed(req)) {
      return NextResponse.json(
        { success: false, error: 'not_found' },
        { status: 404 }
      );
    }

    const body = (await req.json()) as AskBody;
    const query = String(body.query ?? '').trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'query_required' },
        { status: 400 }
      );
    }

    if (query.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'query_too_long' },
        { status: 400 }
      );
    }

    // Build config with safe bounds
    const config: Partial<RLMConfig> = {
      includeTrace: !!body.includeTrace,
      verbose: false,
    };

    // Allow maxIterations override (capped at 12)
    if (typeof body.maxIterations === 'number') {
      config.maxIterations = Math.min(Math.max(1, body.maxIterations), 12);
    }

    // Allow budget overrides (capped)
    if (body.budget) {
      config.budget = {
        search: Math.min(body.budget.search ?? 8, 16),
        read: Math.min(body.budget.read ?? 12, 24),
        list: Math.min(body.budget.list ?? 6, 12),
      };
    }

    const result = await navigateCodebase(query, config);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[RLM Ask] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'rlm_ask_failed',
        detail: err instanceof Error ? err.message : 'unknown_error',
      },
      { status: 500 }
    );
  }
}
