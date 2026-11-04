/**
 * ASTRO-PRO-ASTROMAP-01 — astro map and relocated chart for a Pro subject.
 *
 * POST /api/astrology/pro/place?houseSystem=porphyry|whole-sign|equal
 * body: { subject: 'own' | <saved chart id>, lat?: number, lng?: number }
 *
 * Always returns the planets' right ascension and declination plus sidereal
 * time at the birth instant (enough to draw the astro map, and nothing that
 * names the birth time or place). With lat/lng it also returns the chart
 * relocated there: same instant, new place. Birth details stay server-side.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { calculateBirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { admitProCalculation, PRO_SUPPORTED_HOUSE_SYSTEMS } from '@/lib/astrology/proCalculationPolicy';
import { astroMapInput } from '@/lib/astrology/proAstroMap';
import { calculateChartPoints } from '@/lib/astrology/proChartPoints';
import { utcParts } from '@/lib/astrology/proDerivedMoments';
import { loadSubjectBirth } from '@/lib/astrology/proSubjectBirth';
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
  if (Object.keys(input).some((key) => !['subject', 'lat', 'lng'].includes(key))) return proError(400, 'unexpected_field');
  const relocate = input.lat !== undefined || input.lng !== undefined;
  if (relocate && (typeof input.lat !== 'number' || typeof input.lng !== 'number' ||
      !Number.isFinite(input.lat) || !Number.isFinite(input.lng) ||
      Math.abs(input.lat) > 90 || Math.abs(input.lng) > 180)) {
    return proError(400, 'location_invalid');
  }

  try {
    const subject = await loadSubjectBirth(owner.memberId, input.subject);
    if (!subject.ok) return proError(subject.status, subject.error);
    const natal = admitProCalculation({ ...subject.birth, houseSystem });
    if (!natal.ok) return proError(422, natal.error);

    let relocated: { data: unknown; points: unknown } | null = null;
    if (relocate) {
      const parts = utcParts(new Date(natal.verifiedUtc));
      const admission = admitProCalculation({
        date: parts.date, time: parts.time,
        location: { lat: input.lat as number, lng: input.lng as number, timezone: 'Etc/UTC' },
        houseSystem,
      });
      if (!admission.ok) return proError(422, admission.error);
      relocated = {
        data: await calculateBirthChart(admission.birthData),
        points: calculateChartPoints(admission.verifiedUtc, input.lat as number, input.lng as number),
      };
    }
    const map = astroMapInput(natal.verifiedUtc);

    if (!(await proOwnerStillCurrent(request, owner.memberId))) return proError(401, 'session_changed');
    const recheck = await loadSubjectBirth(owner.memberId, input.subject);
    if (!recheck.ok || recheck.revision !== subject.revision) return proError(409, 'chart_source_changed');

    return NextResponse.json({ map, relocated }, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'chart_temporarily_unavailable');
  }
}
