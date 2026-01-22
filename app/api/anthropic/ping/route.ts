/**
 * Minimal Anthropic API test - no tools, no history
 * Used to isolate billing/account issues from payload/tool issues
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

export async function GET() {
  const anthropic = new Anthropic();
  try {
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 32,
      messages: [{ role: 'user', content: 'ping' }],
    });
    return NextResponse.json({
      ok: true,
      model: resp.model,
      usage: resp.usage,
      content: resp.content,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        status: err?.status,
        message: err?.message,
        request_id: err?.request_id,
        type: err?.type,
        error: err?.error,
      },
      { status: err?.status || 500 }
    );
  }
}
