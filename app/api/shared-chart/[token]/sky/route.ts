/**
 * ASTRO-PRO-CHART-SHARE-01 — the sky at a chosen moment, for a client viewing
 * their shared chart.
 *
 * GET /api/shared-chart/<token>/sky?at=<ISO 8601 instant>
 *
 * Works only while the share link is live, Pro is enabled and the chart's
 * owner holds Pro access. Returns planetary positions only — no birth data;
 * the comparison with the natal chart happens in the viewer's browser.
 * Nothing about the viewer is recorded.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { calculateTransits } from '@/lib/astrology/proEphemerisCalculator';
import { transitMomentInRange } from '@/lib/astrology/proTransits';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { readSharedChartBirth } from '@/lib/astrology/proChartShares';

const HEADERS = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' } as const;

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: HEADERS });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!proPreviewEnabled(process.env)) return fail(404, 'not_found');
  let at: Date;
  try {
    const search = new URL(request.url).searchParams;
    const names = Array.from(search.keys());
    if (names.length !== 1 || names[0] !== 'at') return fail(400, 'moment_required');
    const raw = search.get('at') || '';
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(raw)) return fail(400, 'moment_invalid');
    at = new Date(raw);
  } catch {
    return fail(400, 'moment_invalid');
  }
  if (!transitMomentInRange(at)) return fail(422, 'moment_out_of_range');
  try {
    const shared = await readSharedChartBirth(token);
    if (!shared || !(await proMemberAllowed(shared.ownerMemberId, process.env))) return fail(404, 'not_found');
    const positions = await calculateTransits(at);
    return NextResponse.json({ at: at.toISOString(), positions }, { headers: HEADERS });
  } catch {
    return fail(503, 'sky_unavailable');
  }
}
