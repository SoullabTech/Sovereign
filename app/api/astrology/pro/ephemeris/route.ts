/**
 * ASTRO-PRO-EPHEMERIS-01 — sampled planetary longitudes for Pro.
 *
 * GET /api/astrology/pro/ephemeris?from=<ISO>&to=<ISO>&step=<hours>
 *
 * Takes only dates; reads no member or birth data. Range ≤ ~3 years and
 * ≤ 1500 samples. Pro-gated like the rest of Pro.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { ephemerisSeries } from '@/lib/astrology/proEphemerisSeries';
import { transitMomentInRange } from '@/lib/astrology/proTransits';
import { PRO_RESPONSE_HEADERS, proError, resolveProOwner } from '@/lib/astrology/proRouteAccess';

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

export async function GET(request: NextRequest) {
  const owner = await resolveProOwner(request, false);
  if (!owner.ok) return owner.response;

  const params = new URL(request.url).searchParams;
  const names = Array.from(params.keys()).sort();
  if (names.join(',') !== 'from,step,to') return proError(400, 'parameters_invalid');
  const fromRaw = params.get('from') || '';
  const toRaw = params.get('to') || '';
  if (!ISO.test(fromRaw) || !ISO.test(toRaw)) return proError(400, 'moment_invalid');
  const from = new Date(fromRaw);
  const to = new Date(toRaw);
  const step = Number(params.get('step'));
  if (!transitMomentInRange(from) || !transitMomentInRange(to)) return proError(422, 'moment_out_of_range');

  try {
    const series = ephemerisSeries(from, to, step);
    if (!series) return proError(422, 'range_too_large_or_invalid');
    return NextResponse.json(series, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'ephemeris_unavailable');
  }
}
