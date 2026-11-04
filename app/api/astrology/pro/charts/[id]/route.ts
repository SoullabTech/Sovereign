/**
 * ASTRO-PRO-SAVED-CHARTS-01 — one saved chart, owner-only.
 *
 * GET    → confirms the chart still exists for the verified member (used to
 *          close an open chart if it was deleted or the session changed).
 * POST   → calculates the chart from its stored birth details. Nothing is
 *          written; the result is returned to the owner only.
 * DELETE → hard delete.
 *
 * A chart that does not belong to the verified member is reported exactly as
 * a chart that does not exist.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { calculateBirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { admitProCalculation, PRO_SUPPORTED_HOUSE_SYSTEMS } from '@/lib/astrology/proCalculationPolicy';
import { calculateDeclinations } from '@/lib/astrology/proDeclinations';
import { calculateChartPoints } from '@/lib/astrology/proChartPoints';
import { deleteSavedChart, isSavedChartId, readSavedChartBirth, savedChartExists } from '@/lib/astrology/proSavedCharts';
import { PRO_RESPONSE_HEADERS, proError, proOwnerStillCurrent, resolveProOwner } from '@/lib/astrology/proRouteAccess';

type Params = { params: Promise<{ id: string }> };

function requestedHouseSystem(request: NextRequest): 'porphyry' | 'whole-sign' | 'equal' | 'placidus' | 'koch' | null {
  try {
    const params = new URL(request.url).searchParams;
    const names = Array.from(params.keys());
    if (names.length === 0) return 'porphyry';
    if (names.length !== 1 || names[0] !== 'houseSystem') return null;
    const selected = params.get('houseSystem');
    return selected && PRO_SUPPORTED_HOUSE_SYSTEMS.includes(selected as 'porphyry' | 'whole-sign' | 'equal' | 'placidus' | 'koch')
      ? selected as 'porphyry' | 'whole-sign' | 'equal' | 'placidus' | 'koch' : null;
  } catch { return null; }
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const owner = await resolveProOwner(request, false);
  if (!owner.ok) return owner.response;
  if (!isSavedChartId(id)) return proError(404, 'saved_chart_not_found');
  try {
    if (!(await savedChartExists(owner.memberId, id))) return proError(404, 'saved_chart_not_found');
    if (!(await proOwnerStillCurrent(request, owner.memberId))) return proError(401, 'session_changed');
    return NextResponse.json({ memberId: owner.memberId, chartId: id, verified: true }, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'session_verification_unavailable');
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const houseSystem = requestedHouseSystem(request);
  if (!houseSystem) return proError(400, 'house_system_unsupported');
  const owner = await resolveProOwner(request, true);
  if (!owner.ok) return owner.response;
  if (!isSavedChartId(id)) return proError(404, 'saved_chart_not_found');
  try {
    const birth = await readSavedChartBirth(owner.memberId, id);
    if (!birth) return proError(404, 'saved_chart_not_found');
    const admission = admitProCalculation({ ...birth, houseSystem });
    if (!admission.ok) return proError(422, admission.error);
    const chart = await calculateBirthChart(admission.birthData);

    // Never release a chart on a session or access decision made before the
    // calculation; re-check, and confirm the chart was not deleted meanwhile.
    if (!(await savedChartExists(owner.memberId, id))) return proError(404, 'saved_chart_not_found');
    if (!(await proOwnerStillCurrent(request, owner.memberId))) return proError(401, 'session_changed');

    const uncertainMotionBodies = ([
      'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    ] as const).filter(body => chart[body]?.motionStatus === 'stationary-uncertain');

    return NextResponse.json({
      memberId: owner.memberId,
      chartId: id,
      data: chart,
      // Sun, Moon and planets only; approximate minor bodies are excluded.
      declinations: calculateDeclinations(admission.verifiedUtc),
      points: calculateChartPoints(admission.verifiedUtc, birth.location.lat, birth.location.lng),
      calculationQuality: {
        profile: 'strict-core',
        method: admission.actualHouseSystem,
        housePlacementConvention: 'five-degree-pre-angular-cusp',
        lunarNodeMethod: 'approximate-mean-node',
        birthTimeSource: 'entered-by-chart-owner',
        utcSource: 'iana',
        independentlyCertified: false,
        approximateBodies: ['chiron', 'northNode', 'southNode', 'lilith', 'ceres', 'pallas', 'juno', 'vesta'],
        motionMethod: 'provisional-geocentric-station-guard',
        uncertainMotionBodies,
        warnings: ['minor_bodies_approximate', 'precision_review_pending',
          ...(uncertainMotionBodies.length ? ['near_station_motion_uncertain'] : [])],
      },
    }, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    // Exception text may contain birth inputs; never log or return it.
    return proError(503, 'chart_temporarily_unavailable');
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const owner = await resolveProOwner(request, true);
  if (!owner.ok) return owner.response;
  if (!isSavedChartId(id)) return proError(404, 'saved_chart_not_found');
  try {
    if (!(await deleteSavedChart(owner.memberId, id))) return proError(404, 'saved_chart_not_found');
    return NextResponse.json({ deleted: true }, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'saved_chart_not_deleted');
  }
}
