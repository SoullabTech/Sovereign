export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * Standing Authorizations — create + list one-time scheduled messages (L2 smallest slice).
 * The authenticated member is the author/authorizer (owner). Creating a row IS the
 * explicit permission to send exactly once (docs/architecture/MAIA_ASSIST_SCOPE_2026-06-17.md).
 *
 * NOTE (iOS): force-dynamic route — add to EXCLUDED_DYNAMIC_ROUTES in
 * scripts/capacitor-patch-routes.sh before the next Capacitor static build.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  createScheduledMessage,
  listScheduledMessages,
  ScheduledMessageError,
} from '@/lib/maia/scheduledMessages';

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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

export async function GET(req: NextRequest) {
  const headers = corsHeaders(req);
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers });
  const messages = await listScheduledMessages(memberId);
  return NextResponse.json({ messages }, { status: 200, headers });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req);
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'JSON body required' }, { status: 400, headers });
    }

    const message = await createScheduledMessage({
      ownerMemberId: memberId,
      recipient: body.recipient,
      subject: body.subject,
      body: body.body,
      scheduledAt: body.scheduledAt,
    });
    return NextResponse.json({ ok: true, message }, { status: 201, headers });
  } catch (err) {
    if (err instanceof ScheduledMessageError) {
      return NextResponse.json({ error: err.message }, { status: 400, headers });
    }
    console.error('[MAIA/scheduled-message] create error:', err);
    return NextResponse.json({ error: 'Failed to schedule message' }, { status: 500, headers });
  }
}
