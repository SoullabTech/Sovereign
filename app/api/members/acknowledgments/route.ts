// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

/**
 * MEMBER-ADULT-ACK-01 — the signed-in member's own acknowledgments.
 *
 * GET  → which required acknowledgments this member has not yet given.
 * POST → record one, as the member's act at the sign-in prompt.
 *
 * Identity comes only from a verified session (getMemberIdFromRequest). The
 * body may name WHICH acknowledgment, never WHOSE.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  missingAcknowledgments,
  recordAcknowledgment,
  RECORDABLE_ACKNOWLEDGMENTS,
} from '@/lib/members/acknowledgments';
import { ADULT_ACK_COPY, ADULT_ACK_KIND } from '@/lib/members/adultConfirmation';

const ALLOWED_ORIGINS = new Set([
  'https://soullab.life',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'ionic://localhost',
]);

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://soullab.life',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Member-Id, X-Session-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: NextRequest) {
  const headers = corsHeaders(req);
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Not signed in' }, { status: 401, headers });
  try {
    const missing = await missingAcknowledgments(memberId);
    return NextResponse.json(
      { missing, copy: { [ADULT_ACK_KIND]: ADULT_ACK_COPY } },
      { headers },
    );
  } catch (err) {
    console.error('[ACK] read failed:', err);
    return NextResponse.json({ error: 'Unavailable' }, { status: 503, headers });
  }
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req);
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Not signed in' }, { status: 401, headers });

  let body: { kind?: unknown; confirms?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body is refused below */
  }
  // Only kinds in RECORDABLE_ACKNOWLEDGMENTS can be recorded, at their current
  // version (today: the 18+ confirmation). Only a literal `true` confirms.
  const recordable = RECORDABLE_ACKNOWLEDGMENTS.find((r) => r.kind === body.kind);
  if (!recordable || body.confirms !== true) {
    return NextResponse.json(
      { error: 'Please confirm the notice to continue.' },
      { status: 400, headers },
    );
  }
  try {
    await recordAcknowledgment(memberId, recordable.kind, recordable.version, 'sign_in_prompt');
    return NextResponse.json({ recorded: recordable.kind, version: recordable.version }, { headers });
  } catch (err) {
    console.error('[ACK] record failed:', err);
    return NextResponse.json({ error: 'Could not record. Please try again.' }, { status: 503, headers });
  }
}
