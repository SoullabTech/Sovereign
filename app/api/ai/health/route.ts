// AI Health Check Endpoint
// Returns provider configuration status for smoke tests
export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextResponse } from 'next/server';

export async function GET() {
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const ollamaUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST;

  return NextResponse.json({
    ok: true,
    providers: {
      anthropic: {
        configured: hasAnthropicKey,
        keyPrefix: hasAnthropicKey
          ? process.env.ANTHROPIC_API_KEY?.slice(0, 12) + '...'
          : null,
      },
      ollama: {
        enabled: Boolean(ollamaUrl),
        url: ollamaUrl || null,
      },
    },
    smoke: {
      noFallback: process.env.SMOKE_NO_FALLBACK === '1',
    },
  });
}
