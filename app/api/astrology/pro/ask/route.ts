/**
 * Ask MAIA about a section of Pro (founder request 2026-11-07).
 *
 * POST /api/astrology/pro/ask
 * body: { section, subject, other?, houseSystem?, at?, dayStart?, direction?, question,
 *         mode?, view?, point? }
 *
 * From the cockpit's MAIA dock: `mode: 'mentor'` asks MAIA to teach a technique
 * instead of reading the chart; `view` (one of a fixed list) and `point` (a
 * body of this chart) tell MAIA what the astrologer has open. Neither carries
 * free text into the prompt.
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
import { calculateDeclinations } from '@/lib/astrology/proDeclinations';
import { transitBodies, transitToNatalAspects } from '@/lib/astrology/proTransits';
import { chartAsOuterRing, compositeChart, crossAspects } from '@/lib/astrology/proComparison';
import { calculateFourPillars } from '@/lib/astrology/proFourPillars';
import { traditionalMaya } from '@/lib/astrology/proTraditionalMaya';
import { PROGRESSION_MAX_YEARS, progressedFacts, progressedMoment, progressionsOverPeriod } from '@/lib/astrology/proProgressionFacts';
import type { HouseSystem } from '@/lib/astrology/proEphemerisCalculator';
import { loadSubjectBirth } from '@/lib/astrology/proSubjectBirth';
import { ASK_MAIA_MAX_QUESTION, plainAnswer } from '@/lib/astrology/proAskMaia';
import {
  LIFE_CONTEXT_MAX, PRO_ASK_SAFETY_REPLY, PRO_DEEP_CONTEXT_NOTE, chartFacts, declinationFacts, isProAskView, mayaFacts, proDeepSystemPrompt, contactFacts, fourPillarsFacts, isProAskSection, proAskSystemPrompt, thirdPersonConcern,
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

const KEYS = ['section', 'subject', 'other', 'houseSystem', 'at', 'from', 'dayStart', 'direction', 'question', 'include', 'lifeContext', 'mode', 'view', 'point'];
const DEEP_PARTS = ['four-pillars', 'maya', 'progressions'];

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
  const include = Array.isArray(input.include) ? input.include : [];
  if (include.some((part) => !DEEP_PARTS.includes(part as string))) return proError(400, 'include_unsupported');
  const lifeContext = typeof input.lifeContext === 'string' ? input.lifeContext.trim() : '';
  if (input.lifeContext !== undefined && section !== 'deep') return proError(400, 'unexpected_field');
  if (lifeContext.length > LIFE_CONTEXT_MAX) return proError(400, 'life_context_too_long');
  // A period for progressions: from a date to the chosen date, at most ten years.
  const from = input.from === undefined ? null : new Date(String(input.from));
  if (from && (Number.isNaN(from.getTime()) || from.getTime() >= at.getTime() ||
      at.getTime() - from.getTime() > PROGRESSION_MAX_YEARS * 365.25 * 86_400_000)) {
    return proError(400, 'invalid_period');
  }
  // The dock's mode and place. Both are closed lists; a point is checked against the chart below.
  if (input.mode !== undefined && input.mode !== 'ask' && input.mode !== 'mentor') return proError(400, 'mode_unsupported');
  const mode = input.mode === 'mentor' ? 'mentor' : 'ask';
  if (input.view !== undefined && !isProAskView(input.view)) return proError(400, 'view_unsupported');
  const view = isProAskView(input.view) ? input.view : undefined;
  if (input.point !== undefined && typeof input.point !== 'string') return proError(400, 'point_unsupported');
  if ((mode === 'mentor' || view || input.point !== undefined) && section === 'deep') return proError(400, 'unexpected_field');
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

    // Only a body that is in this chart may be named to MAIA as the selected point.
    const point = typeof input.point === 'string'
      ? chartBodies(first.chart).find((b) => b.name === input.point)?.name : undefined;
    if (input.point !== undefined && !point) return proError(400, 'point_unsupported');

    const place = { lat: first.birth.location.lat, lng: first.birth.location.lng };
    const birthUtc = new Date(first.utc);
    // Progressions and solar arcs at the chosen date, and over the period when one is given.
    const progressionPart = async () => {
      if (at.getTime() < birthUtc.getTime()) return 'Progressions: the chosen date is before birth.';
      const lines = [progressedFacts(await progressedMoment(first.chart, birthUtc, at, place, houseSystem as HouseSystem))];
      if (from) {
        const start = new Date(Math.max(from.getTime(), birthUtc.getTime()));
        lines.push(await progressionsOverPeriod(first.chart, birthUtc, start, at, place, houseSystem as HouseSystem));
      }
      return lines.join('\n');
    };

    let facts: string;
    if (section === 'progressed') {
      facts = `${chartFacts(first.chart, 'Natal chart')}\n${await progressionPart()}`;
    } else if (section === 'deep') {
      const parts = [chartFacts(first.chart, 'Natal chart')];
      if (input.at !== undefined) {
        const sky = transitBodies(await calculateTransits(at));
        parts.push(transitFacts(transitToNatalAspects(sky, chartBodies(first.chart), 2), at.toISOString().slice(0, 10)));
      }
      if (include.includes('four-pillars')) {
        const fp = calculateFourPillars(new Date(first.utc), first.birth.date, first.birth.time.slice(0, 5), dayStart);
        parts.push(`Chinese Four Pillars:\n${fourPillarsFacts(fp, direction)}`);
      }
      if (include.includes('progressions')) parts.push(await progressionPart());
      if (include.includes('maya')) {
        parts.push(mayaFacts(traditionalMaya(first.birth.date), 'Birth'));
        if (input.at !== undefined) parts.push(mayaFacts(traditionalMaya(at.toISOString().slice(0, 10)), 'Chosen date'));
      }
      facts = parts.join('\n');
    } else if (section === 'natal' || section === 'transits') {
      const sky = transitBodies(await calculateTransits(at));
      const transits = transitToNatalAspects(sky, chartBodies(first.chart), 2);
      // Natal includes transits only when the astrologer chose a date; Transits always does.
      facts = section === 'natal' && input.at === undefined
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

    // What the open view adds to the facts, where MAIA can be given it.
    if (view === 'aspects') facts += `\n${declinationFacts(calculateDeclinations(first.utc))}`;
    if (view === 'mayan') facts += `\n${mayaFacts(traditionalMaya(first.birth.date), 'Birth')}`;

    const deep = section === 'deep';
    const llm = await getLLMProvider().generateSimple({
      tier: deep ? 'deep' : 'core',
      systemPrompt: deep ? proDeepSystemPrompt(facts, lifeContext || null) : proAskSystemPrompt(section, facts, { mode, view, point }),
      messages: [{ role: 'user', content: question }],
      maxTokens: deep ? 2400 : mode === 'mentor' ? 750 : 600,
      temperature: 0.6,
      // As with Soul Portrait: a professional reading goes to Claude. Under
      // LOCAL_TIER_ENABLED the deep tier would wait five minutes on the local
      // model before falling back (production witness 2026-11-08).
      forceClaude: true,
    });
    if (!(await proOwnerStillCurrent(request, owner.memberId))) return proError(401, 'session_changed');
    // Privacy: record only that a question was answered, never its content.
    console.log('[astrology/pro/ask] answered');
    const answer = plainAnswer(llm.text || '');
    if (!answer) return proError(503, 'no_answer');
    // A life story that mentions risk does not stop the reading; it opens with where to turn.
    const contextConcern = deep && lifeContext && (thirdPersonConcern(lifeContext) ||
      ['crisis', 'red'].includes(String(analyzeSafetyCues(lifeContext).severity)));
    return NextResponse.json({ answer: contextConcern ? `${PRO_DEEP_CONTEXT_NOTE}\n\n${answer}` : answer },
      { headers: PRO_RESPONSE_HEADERS });
  } catch {
    // Exception text may contain birth inputs; never log or return it.
    return proError(503, 'ask_unavailable');
  }
}
