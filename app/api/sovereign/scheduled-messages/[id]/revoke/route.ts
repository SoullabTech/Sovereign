export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * Revoke / cancel a pending scheduled message (L2 smallest slice).
 * Withdraws the authorization: the worker can no longer claim or send it.
 * Only the owner can revoke; only a still-pending row is revocable.
 *
 * NOTE (iOS): force-dynamic route — add to EXCLUDED_DYNAMIC_ROUTES for Capacitor build.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { revokeScheduledMessage } from '@/lib/maia/scheduledMessages';

const ALLOWED_ORIGINS = new Set([
  'https://soullab.life',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'ionic://localhost',
  'null',
]);

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin');
  const allowOrigin =
    origin === 'null' ? 'null' : origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://soullab.life';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      req.headers.get('access-control-request-headers') ||
      'Content-Type, Authorization, X-Requested-With, X-Member-Id',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const headers = corsHeaders(req);
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers });

  const { id } = await params;
  const revoked = await revokeScheduledMessage(id, memberId);
  if (!revoked) {
    return NextResponse.json(
      { error: 'Not found, not yours, or already sent/revoked' },
      { status: 404, headers },
    );
  }
  return NextResponse.json({ ok: true, id, status: 'revoked' }, { status: 200, headers });
}
