import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { adminUnauthorized, checkAdminAuth } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = false;

/**
 * Administrative AI availability summary.
 *
 * Never returns provider-key bytes or prefixes, provider URLs, environment
 * values, or upstream error bodies. The route is independently admin-gated in
 * addition to its explicit access-matrix rule.
 */
export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth(
    req,
    ['founder', 'cto', 'operations'],
    '/api/ai/health',
  );
  if (!auth.authed) return adminUnauthorized();

  const anthropicAvailable = Boolean(process.env.ANTHROPIC_API_KEY);
  const localAvailable = Boolean(
    process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST,
  );

  return NextResponse.json(
    {
      ok: anthropicAvailable || localAvailable,
      providers: {
        anthropic: { status: anthropicAvailable ? 'available' : 'unavailable' },
        local: { status: localAvailable ? 'available' : 'unavailable' },
      },
      smoke: {
        noFallback: process.env.SMOKE_NO_FALLBACK === '1',
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
