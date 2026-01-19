export const dynamic = 'force-static';

import { NextResponse } from 'next/server';
import { EmbeddingQueueService } from '@/lib/ai/EmbeddingQueueService';

export async function GET() {
  try {
    const pending = await EmbeddingQueueService.backlogCount();
    return NextResponse.json({ ok: true, pending });
  } catch (error) {
    console.error('[embeddings/backlog] Error:', error);
    return NextResponse.json({ ok: false, pending: 0, error: 'Failed to get backlog' }, { status: 500 });
  }
}
