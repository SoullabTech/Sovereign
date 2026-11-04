/**
 * ASTRO-PRO-TRANSITS-01 — planetary positions at a chosen moment, for Pro.
 *
 * GET /api/astrology/pro/sky?at=<ISO 8601 instant>
 *
 * Takes no birth data and reads no member data; the natal comparison happens
 * in the member's browser. Gated by Pro access like the rest of Pro.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { calculateTransits } from '@/lib/astrology/proEphemerisCalculator';
import { transitMomentInRange } from '@/lib/astrology/proTransits';
import { PRO_RESPONSE_HEADERS, proError, resolveProOwner } from '@/lib/astrology/proRouteAccess';

export async function GET(request: NextRequest) {
  const owner = await resolveProOwner(request, false);
  if (!owner.ok) return owner.response;

  let at: Date;
  try {
    const params = new URL(request.url).searchParams;
    const names = Array.from(params.keys());
    if (names.length !== 1 || names[0] !== 'at') return proError(400, 'moment_required');
    const raw = params.get('at') || '';
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(raw)) {
      return proError(400, 'moment_invalid');
    }
    at = new Date(raw);
  } catch {
    return proError(400, 'moment_invalid');
  }
  if (!transitMomentInRange(at)) return proError(422, 'moment_out_of_range');

  try {
    const positions = await calculateTransits(at);
    return NextResponse.json({ at: at.toISOString(), positions }, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'sky_unavailable');
  }
}
