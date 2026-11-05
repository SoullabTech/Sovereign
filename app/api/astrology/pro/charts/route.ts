/**
 * ASTRO-PRO-SAVED-CHARTS-01 — list and save a Pro member's charts for other people.
 *
 * GET  → the verified member's saved charts (summaries only).
 * POST → save one chart. Requires the member's attestation that they have the
 *        person's permission to keep these birth details. Inputs must pass the
 *        Pro calculation policy first. Birth values are never logged.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSavedChart, listSavedCharts, validateSavedChartInput } from '@/lib/astrology/proSavedCharts';
import { PRO_RESPONSE_HEADERS, proError, proOwnerStillCurrent, resolveProOwner } from '@/lib/astrology/proRouteAccess';

export async function GET(request: NextRequest) {
  const owner = await resolveProOwner(request, false);
  if (!owner.ok) return owner.response;
  try {
    const charts = await listSavedCharts(owner.memberId);
    if (!(await proOwnerStillCurrent(request, owner.memberId))) return proError(401, 'session_changed');
    return NextResponse.json({ memberId: owner.memberId, charts }, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'saved_charts_unavailable');
  }
}

export async function POST(request: NextRequest) {
  const owner = await resolveProOwner(request, true);
  if (!owner.ok) return owner.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return proError(400, 'invalid_request');
  }
  const validation = validateSavedChartInput(body);
  if (!validation.ok) return proError(422, validation.error);
  try {
    if (!(await proOwnerStillCurrent(request, owner.memberId))) return proError(401, 'session_changed');
    const chart = await createSavedChart(owner.memberId, validation.input);
    if (!chart) return proError(409, 'saved_chart_limit_reached');
    return NextResponse.json({ chart }, { status: 201, headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'saved_chart_not_saved');
  }
}
