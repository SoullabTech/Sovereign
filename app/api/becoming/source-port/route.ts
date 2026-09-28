export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { resolveBecomingSourcePort } from '@/lib/becoming/sourcePort.server';

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      Vary: 'Cookie, x-session-token',
    },
  });
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return json({ error: 'Unauthorized' }, 401);

  if (request.headers.get('x-becoming-source-port') !== '1') {
    return json({ error: 'Explicit Becoming source selection required.' }, 403);
  }

  const body = await request.json().catch(() => null) as { facet?: unknown; refId?: unknown } | null;
  const facet = typeof body?.facet === 'string' ? body.facet.trim() : '';
  const refId = typeof body?.refId === 'string' ? body.refId.trim() : '';
  if (!facet || !refId) return json({ error: 'facet and refId required' }, 400);

  try {
    const source = await resolveBecomingSourcePort(memberId, facet, refId);
    if (!source) return json({ error: 'Source not available' }, 404);
    return json({ source });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid source request';
    return json({ error: message }, 400);
  }
}
