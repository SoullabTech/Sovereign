/**
 * Content Pipeline API
 *
 * POST: Run manuscript → extraction → transformation → filter → save pipeline
 *
 * Protected by LABTOOLS_SECRET (admin-only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runContentPipeline } from '@/lib/content-pipeline/pipeline';
import type { ContentSource } from '@/lib/content-pipeline/types';

export const dynamic = 'force-dynamic';

const ADMIN_SECRET = process.env.LABTOOLS_SECRET || process.env.LABTOOLS_ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.body || typeof body.body !== 'string') {
      return NextResponse.json({ error: 'body (manuscript text) is required' }, { status: 400 });
    }

    const source: ContentSource = {
      id: body.id || `draft-${Date.now()}`,
      title: body.title || 'Untitled',
      body: body.body,
      element: body.element,
    };

    const result = await runContentPipeline(source);

    return NextResponse.json({
      summary: result.extracted.summary,
      passageCount: result.extracted.passages.length,
      quoteCount: result.extracted.quotes.length,
      postsCreated: result.posts.length,
      posts: result.posts,
      transformed: result.transformed,
    });
  } catch (error) {
    console.error('[ContentPipeline] Pipeline error:', error);
    return NextResponse.json(
      { error: 'Pipeline failed', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
