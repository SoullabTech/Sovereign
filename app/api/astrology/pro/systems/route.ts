/**
 * ASTRO-PRO-SYSTEMS-01 — Vedic, Chinese and Mayan views of a Pro chart.
 *
 * POST /api/astrology/pro/systems
 * body: { subject: 'own' | <saved chart id>, ayanamsa?: 'lahiri' | 'true_chitra' | 'krishnamurti',
 *         dayStart?: 'midnight' | 'zi-hour' }
 *
 * Birth details are read on the server for the verified owner only and are
 * never returned. The calculation is the Free Astrology calculators', shared.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { admitProCalculation } from '@/lib/astrology/proCalculationPolicy';
import { calculateProOtherSystems, PRO_SYSTEMS_AYANAMSAS } from '@/lib/astrology/proOtherSystems';
import { loadSubjectBirth } from '@/lib/astrology/proSubjectBirth';
import { PRO_RESPONSE_HEADERS, proError, proOwnerStillCurrent, resolveProOwner } from '@/lib/astrology/proRouteAccess';
import type { AyanamsaType } from '@/lib/astrology/types/vedic';

export async function POST(request: NextRequest) {
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
  if (Object.keys(input).some((key) => !['subject', 'ayanamsa', 'dayStart'].includes(key))) {
    return proError(400, 'unexpected_field');
  }
  const ayanamsa = input.ayanamsa ?? 'lahiri';
  if (!PRO_SYSTEMS_AYANAMSAS.includes(ayanamsa as AyanamsaType)) return proError(400, 'ayanamsa_unsupported');
  const dayStart = input.dayStart ?? 'midnight';
  if (dayStart !== 'midnight' && dayStart !== 'zi-hour') return proError(400, 'day_start_unsupported');

  try {
    const subject = await loadSubjectBirth(owner.memberId, input.subject);
    if (!subject.ok) return proError(subject.status, subject.error);
    const natal = admitProCalculation({ ...subject.birth, houseSystem: 'whole-sign' });
    if (!natal.ok) return proError(422, natal.error);

    const systems = await calculateProOtherSystems(subject.birth, natal.verifiedUtc, ayanamsa as AyanamsaType, dayStart);

    if (!(await proOwnerStillCurrent(request, owner.memberId))) return proError(401, 'session_changed');
    const recheck = await loadSubjectBirth(owner.memberId, input.subject);
    if (!recheck.ok || recheck.revision !== subject.revision) return proError(409, 'chart_source_changed');

    return NextResponse.json({ data: systems }, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    // Exception text may contain birth inputs; never log or return it.
    return proError(503, 'chart_temporarily_unavailable');
  }
}
