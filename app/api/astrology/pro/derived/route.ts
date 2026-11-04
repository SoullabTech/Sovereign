/**
 * ASTRO-PRO-DERIVED-01 — progressed and return charts for a Pro chart subject.
 *
 * POST /api/astrology/pro/derived?houseSystem=porphyry|whole-sign|equal
 * body: { subject: 'own' | <saved chart id>,
 *         kind: 'progressed' | 'return',
 *         at: <ISO instant>,              // progressed-for date, or search start
 *         body?: 'Sun' | 'Moon' | ... }   // required for kind 'return'
 *
 * Birth details are read on the server for the verified owner only and are
 * never returned. The response carries the derived chart and its instant.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { calculateBirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { admitProCalculation, PRO_SUPPORTED_HOUSE_SYSTEMS } from '@/lib/astrology/proCalculationPolicy';
import { calculateDeclinations } from '@/lib/astrology/proDeclinations';
import { calculateChartPoints } from '@/lib/astrology/proChartPoints';
import {
  RETURN_BODIES, findReturn, geocentricLongitude, secondaryProgressionInstant, utcParts, type ReturnBody,
} from '@/lib/astrology/proDerivedMoments';
import { loadSubjectBirth } from '@/lib/astrology/proSubjectBirth';
import { transitMomentInRange } from '@/lib/astrology/proTransits';
import { PRO_RESPONSE_HEADERS, proError, proOwnerStillCurrent, resolveProOwner } from '@/lib/astrology/proRouteAccess';

type HouseSystem = 'porphyry' | 'whole-sign' | 'equal' | 'placidus' | 'koch';

function requestedHouseSystem(request: NextRequest): HouseSystem | null {
  try {
    const params = new URL(request.url).searchParams;
    const names = Array.from(params.keys());
    if (names.length === 0) return 'porphyry';
    if (names.length !== 1 || names[0] !== 'houseSystem') return null;
    const selected = params.get('houseSystem');
    return selected && PRO_SUPPORTED_HOUSE_SYSTEMS.includes(selected as HouseSystem) ? selected as HouseSystem : null;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  const houseSystem = requestedHouseSystem(request);
  if (!houseSystem) return proError(400, 'house_system_unsupported');
  const owner = await resolveProOwner(request, true);
  if (!owner.ok) return owner.response;

  let input: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return proError(400, 'invalid_request');
    input = parsed as Record<string, unknown>;
  } catch {
    return proError(400, 'invalid_request');
  }
  if (Object.keys(input).some((key) => !['subject', 'kind', 'at', 'body'].includes(key))) {
    return proError(400, 'unexpected_field');
  }
  const kind = input.kind;
  if (kind !== 'progressed' && kind !== 'return') return proError(400, 'kind_invalid');
  const body = input.body;
  if (kind === 'return' && !RETURN_BODIES.includes(body as ReturnBody)) return proError(400, 'return_body_invalid');
  if (kind === 'progressed' && body !== undefined) return proError(400, 'unexpected_field');
  const at = typeof input.at === 'string' ? new Date(input.at) : new Date(NaN);
  if (!transitMomentInRange(at)) return proError(422, 'moment_out_of_range');

  try {
    const subject = await loadSubjectBirth(owner.memberId, input.subject);
    if (!subject.ok) return proError(subject.status, subject.error);
    const natal = admitProCalculation({ ...subject.birth, houseSystem });
    if (!natal.ok) return proError(422, natal.error);
    const birthUtc = new Date(natal.verifiedUtc);

    let instant: Date | null;
    if (kind === 'progressed') {
      if (at.getTime() < birthUtc.getTime()) return proError(422, 'moment_before_birth');
      instant = secondaryProgressionInstant(birthUtc, at);
    } else {
      const returnBody = body as ReturnBody;
      instant = findReturn(returnBody, geocentricLongitude(returnBody, birthUtc), at);
      if (!instant) return proError(422, 'return_not_found');
    }

    const parts = utcParts(instant);
    const derived = admitProCalculation({
      date: parts.date, time: parts.time,
      location: { lat: subject.birth.location.lat, lng: subject.birth.location.lng, timezone: 'Etc/UTC' },
      houseSystem,
    });
    if (!derived.ok) return proError(422, derived.error);
    const chart = await calculateBirthChart(derived.birthData);

    if (!(await proOwnerStillCurrent(request, owner.memberId))) return proError(401, 'session_changed');
    // The subject must still be the same source the chart was built from.
    const recheck = await loadSubjectBirth(owner.memberId, input.subject);
    if (!recheck.ok || recheck.revision !== subject.revision) return proError(409, 'chart_source_changed');

    return NextResponse.json({
      kind,
      body: kind === 'return' ? body : null,
      instant: new Date(derived.verifiedUtc).toISOString(),
      data: chart,
      declinations: calculateDeclinations(derived.verifiedUtc),
      points: calculateChartPoints(derived.verifiedUtc, subject.birth.location.lat, subject.birth.location.lng),
      method: kind === 'progressed'
        ? 'secondary progression (day for a year), cast at the birth place for the progressed instant'
        : 'exact geocentric return of the body to its natal longitude, cast at the birth place',
    }, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    // Exception text may contain birth inputs; never log or return it.
    return proError(503, 'chart_temporarily_unavailable');
  }
}
