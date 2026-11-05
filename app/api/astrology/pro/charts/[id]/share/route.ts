/**
 * ASTRO-PRO-CHART-SHARE-01 — the private client link for one saved chart.
 *
 * GET    → the live link, if any.
 * POST   → makes the link (or returns the live one). Requires the owner to
 *          confirm the person agreed to have their chart shared by link.
 * PATCH  → changes what the live link shows
 *          ({ includeElemental, includeAskMaia, askMaiaOfferedBy }).
 * DELETE → turns the link off; it stops working at once.
 *
 * Owner-only; a chart that is not the verified member's reads as not found.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { isSavedChartId, savedChartExists } from '@/lib/astrology/proSavedCharts';
import {
  ASK_MAIA_LIMIT, cleanOfferedBy, createShare, readLiveShare, revokeShare, setShareOptions, sharePath,
  type ChartShare, type ShareOptions,
} from '@/lib/astrology/proChartShares';
import { PRO_RESPONSE_HEADERS, proError, resolveProOwner } from '@/lib/astrology/proRouteAccess';

type Params = { params: Promise<{ id: string }> };

function body(share: ChartShare | null) {
  return {
    share: share
      ? {
          path: sharePath(share.token), createdAt: share.createdAt,
          includeElemental: share.includeElemental, includeAskMaia: share.includeAskMaia,
          askMaiaOfferedBy: share.askMaiaOfferedBy,
          askMaiaQuestions: share.askMaiaQuestions, askMaiaLimit: ASK_MAIA_LIMIT,
        }
      : null,
  };
}

/** Reads the link options from a request body; null when any is malformed. */
function readOptions(payload: unknown): ShareOptions | null {
  const p = (payload ?? {}) as { includeElemental?: unknown; includeAskMaia?: unknown; askMaiaOfferedBy?: unknown };
  const offeredBy = cleanOfferedBy(p.askMaiaOfferedBy);
  if (offeredBy === undefined) return null;
  if (p.includeElemental !== undefined && typeof p.includeElemental !== 'boolean') return null;
  if (p.includeAskMaia !== undefined && typeof p.includeAskMaia !== 'boolean') return null;
  return {
    includeElemental: p.includeElemental === true,
    includeAskMaia: p.includeAskMaia === true,
    askMaiaOfferedBy: offeredBy,
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
    const options = readOptions(payload);
    if (!options) return proError(400, 'invalid_request');
    const share = await createShare(owner.memberId, id, options);
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
  const options = readOptions(payload);
  if (!options) return proError(400, 'invalid_request');
  try {
    const share = await setShareOptions(owner.memberId, id, options);
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
