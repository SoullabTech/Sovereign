/**
 * One member's explicit "Discard uploaded file" gesture.
 *
 * This route never deletes a claimed manuscript and never accepts a member ID
 * from the caller. It acts only on the session owner and a still-unclaimed
 * source-arrival UUID. Discard is not a scheduled retention policy.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { discardUnclaimedArrival } from '@/lib/manuscript/source/discardUnclaimedArrival';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NO_STORE = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: NO_STORE }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Object required' }, { status: 400, headers: NO_STORE });
  }
  const fields = body as Record<string, unknown>;
  if (Object.keys(fields).length !== 1 || typeof fields.sourceArrivalId !== 'string'
    || !UUID.test(fields.sourceArrivalId)) {
    return NextResponse.json({ error: 'One sourceArrivalId UUID is required' },
      { status: 400, headers: NO_STORE });
  }

  try {
    const outcome = await discardUnclaimedArrival(fields.sourceArrivalId, memberId);
    switch (outcome.kind) {
      case 'discarded':
        return NextResponse.json({ discarded: true, originalBytesDestroyed: true },
          { status: 200, headers: NO_STORE });
      case 'not_found':
        return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NO_STORE });
      case 'already_claimed':
        return NextResponse.json({ error: 'This upload is part of a saved manuscript and cannot be discarded here' },
          { status: 409, headers: NO_STORE });
      case 'erasure_pending':
        return NextResponse.json({ discarded: true, originalBytesDestroyed: false, error: 'erasure_pending' },
          { status: 503, headers: NO_STORE });
    }
  } catch {
    // No database error details, identifiers, or vault paths in the response.
    return NextResponse.json({ error: 'Could not discard the upload' },
      { status: 503, headers: NO_STORE });
  }
}
