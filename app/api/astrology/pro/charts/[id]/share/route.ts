/**
 * ASTRO-PRO-CHART-SHARE-01 — the private client link for one saved chart.
 *
 * GET    → the live link, if any.
 * POST   → makes the link (or returns the live one). Requires the owner to
 *          confirm the person agreed to have their chart shared by link.
 * PATCH  → changes what the live link shows ({ includeElemental }).
 * DELETE → turns the link off; it stops working at once.
 *
 * Owner-only; a chart that is not the verified member's reads as not found.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { isSavedChartId, savedChartExists } from '@/lib/astrology/proSavedCharts';
import { createShare, readLiveShare, revokeShare, setShareElemental, sharePath } from '@/lib/astrology/proChartShares';
import { PRO_RESPONSE_HEADERS, proError, resolveProOwner } from '@/lib/astrology/proRouteAccess';

type Params = { params: Promise<{ id: string }> };

function body(share: { token: string; createdAt: string; includeElemental: boolean } | null) {
  return {
    share: share
      ? { path: sharePath(share.token), createdAt: share.createdAt, includeElemental: share.includeElemental }
      : null,
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const owner = await resolveProOwner(request, false);
  if (!owner.ok) return owner.response;
  if (!isSavedChartId(id)) return proError(404, 'saved_chart_not_found');
  try {
    if (!(await savedChartExists(owner.memberId, id))) return proError(404, 'saved_chart_not_found');
    return NextResponse.json(body(await readLiveShare(owner.memberId, id)), { headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'share_unavailable');
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const owner = await resolveProOwner(request, true);
  if (!owner.ok) return owner.response;
  if (!isSavedChartId(id)) return proError(404, 'saved_chart_not_found');
  let payload: unknown;
  try { payload = await request.json(); } catch { return proError(400, 'invalid_request'); }
  if (!payload || typeof payload !== 'object' || (payload as { consentAttested?: unknown }).consentAttested !== true) {
    return proError(400, 'share_consent_required');
  }
  try {
    const share = await createShare(owner.memberId, id,
      (payload as { includeElemental?: unknown }).includeElemental === true);
    if (!share) return proError(404, 'saved_chart_not_found');
    return NextResponse.json(body(share), { status: 201, headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'share_not_created');
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const owner = await resolveProOwner(request, true);
  if (!owner.ok) return owner.response;
  if (!isSavedChartId(id)) return proError(404, 'saved_chart_not_found');
  let payload: unknown;
  try { payload = await request.json(); } catch { return proError(400, 'invalid_request'); }
  const include = (payload as { includeElemental?: unknown } | null)?.includeElemental;
  if (typeof include !== 'boolean') return proError(400, 'invalid_request');
  try {
    const share = await setShareElemental(owner.memberId, id, include);
    if (!share) return proError(404, 'share_not_found');
    return NextResponse.json(body(share), { headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'share_not_updated');
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const owner = await resolveProOwner(request, true);
  if (!owner.ok) return owner.response;
  if (!isSavedChartId(id)) return proError(404, 'saved_chart_not_found');
  try {
    if (!(await savedChartExists(owner.memberId, id))) return proError(404, 'saved_chart_not_found');
    await revokeShare(owner.memberId, id);
    return NextResponse.json(body(null), { headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'share_not_revoked');
  }
}
