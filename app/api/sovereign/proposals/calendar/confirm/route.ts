export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * Consent gate for calendar proposals (Art. 2 of docs/canon/MAIA_CONSENT_GATES.md).
 *
 * The member has reviewed and (optionally) edited a proposed calendar event and
 * confirmed it. This route is the ONLY entry point that reaches the executor —
 * the sole writer. MAIA cannot call it; only a confirmed member action does.
 *
 * The front-half (MAIA emitting the proposal via tool-use on the live turn) is
 * wired separately. Until then this endpoint is reachable but unused — the
 * testable back-half of the calendar proof-of-loop.
 *
 * NOTE (iOS): this is a force-dynamic route — add it to EXCLUDED_DYNAMIC_ROUTES
 * in scripts/capacitor-patch-routes.sh before the next Capacitor static build.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  executeCalendarEventProposal,
  ProposalValidationError,
} from '@/lib/maia/proposals/executor';
import type { CalendarEventPayload } from '@/lib/maia/proposals/types';

// CORS — mirrors the sovereign route pattern (web + Capacitor). Candidate for a
// shared helper later; kept local to avoid coupling the proof-of-loop to a refactor.
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
    origin === 'null'
      ? 'null'
      : origin && ALLOWED_ORIGINS.has(origin)
        ? origin
        : 'https://soullab.life';
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

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req);
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers });
    }

    const body = await req.json().catch(() => null);
    const payload = body?.payload as CalendarEventPayload | undefined;
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'payload is required' }, { status: 400, headers });
    }

    const event = await executeCalendarEventProposal(payload, { memberId });
    return NextResponse.json({ ok: true, event }, { status: 200, headers });
  } catch (err) {
    if (err instanceof ProposalValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400, headers });
    }
    console.error('[MAIA/proposal] confirm error:', err);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500, headers });
  }
}
