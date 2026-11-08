/**
 * Ask MAIA about a section of Pro (founder request 2026-11-07).
 *
 * POST /api/astrology/pro/ask
 * body: { section, subject, other?, houseSystem?, at?, dayStart?, direction?, question }
 *
 * Only chart ids travel; the server reads the verified owner's birth details,
 * recalculates the section and gives MAIA its facts — never a name, birth
 * date, time or place. Nothing is stored or logged but the fact of an answer.
 * A question showing crisis or serious distress gets a fixed reply and MAIA is
 * not asked.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { analyzeSafetyCues } from '@/lib/comms/SafetyService';
import { admitProCalculation } from '@/lib/astrology/proCalculationPolicy';
import { calculateBirthChart, calculateTransits } from '@/lib/astrology/proEphemerisCalculator';
import { chartBodies } from '@/lib/astrology/proChartGeometry';
import { transitBodies, transitToNatalAspects } from '@/lib/astrology/proTransits';
import { chartAsOuterRing, compositeChart, crossAspects } from '@/lib/astrology/proComparison';
import { calculateFourPillars } from '@/lib/astrology/proFourPillars';
import { loadSubjectBirth } from '@/lib/astrology/proSubjectBirth';
import { ASK_MAIA_MAX_QUESTION, plainAnswer } from '@/lib/astrology/proAskMaia';
import {
  PRO_ASK_SAFETY_REPLY, chartFacts, contactFacts, fourPillarsFacts, isProAskSection, proAskSystemPrompt, thirdPersonConcern,
  transitFacts,
} from '@/lib/astrology/proAskMaiaSections';
import { PRO_RESPONSE_HEADERS, proError, proOwnerStillCurrent, resolveProOwner } from '@/lib/astrology/proRouteAccess';
import type { SavedChartBirth } from '@/lib/astrology/proSavedCharts';

// A short per-member limit (in memory) so a runaway loop cannot spend MAIA.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const rate = new Map<string, { count: number; resetAt: number }>();
function allowed(memberId: string): boolean {
  const now = Date.now();
  for (const [k, v] of rate) if (now > v.resetAt) rate.delete(k);
  const entry = rate.get(memberId);
  if (!entry || now > entry.resetAt) { rate.set(memberId, { count: 1, resetAt: now + RATE_WINDOW_MS }); return true; }
  if (entry.count >= RATE_MAX) return false;
  entry.count += 1;
  return true;
}

const KEYS = ['section', 'subject', 'other', 'houseSystem', 'at', 'dayStart', 'direction', 'question'];

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
  if (Object.keys(input).some((k) => !KEYS.includes(k))) return proError(400, 'unexpected_field');
  const section = input.section;
  if (!isProAskSection(section)) return proError(400, 'section_unsupported');
  const question = typeof input.question === 'string' ? input.question.trim() : '';
  if (!question) return proError(400, 'question_required');
  if (question.length > ASK_MAIA_MAX_QUESTION) return proError(400, 'question_too_long');
  const houseSystem = input.houseSystem ?? 'porphyry';
  const at = input.at === undefined ? new Date() : new Date(String(input.at));
  if (Number.isNaN(at.getTime())) return proError(400, 'invalid_moment');
  const dayStart = input.dayStart === 'zi-hour' ? 'zi-hour' : 'midnight';
  const direction = input.direction === 'forward' || input.direction === 'backward' ? input.direction : null;
  const twoCharts = section === 'biwheel' || section === 'composite';
  if (twoCharts && input.other === undefined) return proError(400, 'second_chart_required');

  if (!allowed(owner.memberId)) return proError(429, 'slow_down');

  // Safety first: MAIA is not asked when a question shows crisis or serious distress.
  const safety = analyzeSafetyCues(question);
  if (safety.severity === 'crisis' || safety.severity === 'red' || thirdPersonConcern(question)) {
    console.log('[astrology/pro/ask] safety reply given');
    return NextResponse.json({ answer: PRO_ASK_SAFETY_REPLY, safety: true }, { headers: PRO_RESPONSE_HEADERS });
  }

  try {
    const chartOf = async (subject: unknown) => {
      const loaded = await loadSubjectBirth(owner.memberId, subject);
      if (!loaded.ok) return { ok: false as const, status: loaded.status, error: loaded.error };
      const admitted = admitProCalculation({ ...loaded.birth, houseSystem });
      if (!admitted.ok) return { ok: false as const, status: 422, error: admitted.error };
      return {
        ok: true as const, birth: loaded.birth as SavedChartBirth,
        utc: admitted.verifiedUtc, chart: await calculateBirthChart(admitted.birthData),
      };
    };
    const first = await chartOf(input.subject);
    if (!first.ok) return proError(first.status, first.error);
    const second = twoCharts ? await chartOf(input.other) : null;
    if (second && !second.ok) return proError(second.status, second.error);

    let facts: string;
    if (section === 'natal' || section === 'transits') {
      const sky = transitBodies(await calculateTransits(at));
      const transits = transitToNatalAspects(sky, chartBodies(first.chart), 2);
      facts = section === 'natal'
        ? chartFacts(first.chart, 'Natal chart')
        : `${chartFacts(first.chart, 'Natal chart')}\n${transitFacts(transits, at.toISOString().slice(0, 10))}`;
    } else if (section === 'biwheel' && second?.ok) {
      const contacts = crossAspects(chartBodies(first.chart), chartAsOuterRing(second.chart), 3);
      facts = `${chartFacts(first.chart, 'First chart')}\n${chartFacts(second.chart, 'Second chart')}\n${contactFacts(contacts)}`;
    } else if (section === 'composite' && second?.ok) {
      const composite = compositeChart(first.chart, second.chart);
      if (!composite) return proError(422, 'composite_unavailable');
      facts = chartFacts(composite, 'Composite chart (midpoints, equal houses from the composite Ascendant)');
    } else {
      const fp = calculateFourPillars(new Date(first.utc), first.birth.date, first.birth.time.slice(0, 5), dayStart);
      facts = fourPillarsFacts(fp, direction);
    }

    const llm = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: proAskSystemPrompt(section, facts),
      messages: [{ role: 'user', content: question }],
      maxTokens: 600,
      temperature: 0.6,
    });
    if (!(await proOwnerStillCurrent(request, owner.memberId))) return proError(401, 'session_changed');
    // Privacy: record only that a question was answered, never its content.
    console.log('[astrology/pro/ask] answered');
    const answer = plainAnswer(llm.text || '');
    if (!answer) return proError(503, 'no_answer');
    return NextResponse.json({ answer }, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    // Exception text may contain birth inputs; never log or return it.
    return proError(503, 'ask_unavailable');
  }
}
