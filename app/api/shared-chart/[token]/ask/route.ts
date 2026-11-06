/**
 * Ask MAIA about a shared chart (founder ruling 2026-11-05).
 *
 * POST /api/shared-chart/<token>/ask  { question }
 *
 * Answers only while the link is live, Pro is enabled, the owner holds Pro
 * access and the owner turned Ask MAIA on for this link. MAIA sees only this
 * chart and today's transits. No question or answer is stored or logged; only
 * that a question was answered. A question showing crisis or serious distress
 * gets a fixed safety reply and MAIA is not asked. Each link has a question
 * allowance, taken before MAIA is asked, plus a short per-visitor rate limit.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { analyzeSafetyCues } from '@/lib/comms/SafetyService';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { consumeAskMaiaQuestion, readSharedChartBirth } from '@/lib/astrology/proChartShares';
import { admitProCalculation } from '@/lib/astrology/proCalculationPolicy';
import { calculateBirthChart, calculateTransits } from '@/lib/astrology/proEphemerisCalculator';
import { chartBodies } from '@/lib/astrology/proChartGeometry';
import { transitBodies, transitToNatalAspects } from '@/lib/astrology/proTransits';
import {
  ASK_MAIA_MAX_QUESTION, ASK_MAIA_SAFETY_REPLY, askMaiaChartContext, askMaiaSystemPrompt, plainAnswer,
} from '@/lib/astrology/proAskMaia';

const HEADERS = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' } as const;

function reply(body: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...HEADERS, ...extra } });
}

// Short-term limit per link and visitor (in memory), on top of the per-link allowance.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 6;
const rate = new Map<string, { count: number; resetAt: number }>();
function allowed(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  for (const [k, v] of rate) if (now > v.resetAt) rate.delete(k);
  const entry = rate.get(key);
  if (!entry || now > entry.resetAt) {
    rate.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= RATE_MAX) return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!proPreviewEnabled(process.env)) return reply({ error: 'not_found' }, 404);
  let question: string;
  try {
    const body = await request.json();
    question = String(body?.question ?? '').trim();
  } catch {
    return reply({ error: 'invalid_request' }, 400);
  }
  if (!question) return reply({ error: 'question_required' }, 400);
  if (question.length > ASK_MAIA_MAX_QUESTION) return reply({ error: 'question_too_long' }, 400);

  try {
    const shared = await readSharedChartBirth(token);
    if (!shared || !shared.includeAskMaia || !(await proMemberAllowed(shared.ownerMemberId, process.env))) {
      return reply({ error: 'not_found' }, 404);
    }
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const limit = allowed(`${token}:${ip}`);
    if (!limit.ok) return reply({ error: 'slow_down', retryAfter: limit.retryAfter }, 429, { 'Retry-After': String(limit.retryAfter) });

    // Safety first: MAIA is not asked when a question shows crisis or serious distress.
    const safety = analyzeSafetyCues(question);
    if (safety.severity === 'crisis' || safety.severity === 'red') {
      console.log('[shared-chart/ask] safety reply given');
      return reply({ answer: ASK_MAIA_SAFETY_REPLY, safety: true });
    }

    if (!(await consumeAskMaiaQuestion(token))) return reply({ error: 'limit_reached' }, 429);

    const admission = admitProCalculation({ date: shared.date, time: shared.time, location: shared.location, houseSystem: 'porphyry' });
    if (!admission.ok) return reply({ error: 'chart_unavailable' }, 503);
    const chart = await calculateBirthChart(admission.birthData);
    const sky = transitBodies(await calculateTransits(new Date()));
    const transits = transitToNatalAspects(sky, chartBodies(chart), 2);
    const context = askMaiaChartContext(chart, transits, shared.includeElemental);

    const llm = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: askMaiaSystemPrompt({
        firstName: shared.label.trim().split(/\s+/)[0] || 'them',
        offeredBy: shared.askMaiaOfferedBy, context, includeElemental: shared.includeElemental,
      }),
      messages: [{ role: 'user', content: question }],
      maxTokens: 450,
      temperature: 0.6,
    });
    // Privacy: record only that a question was answered — never its content.
    console.log('[shared-chart/ask] answered');
    const answer = plainAnswer(llm.text || '');
    if (!answer) return reply({ error: 'no_answer' }, 503);
    return reply({ answer });
  } catch {
    return reply({ error: 'ask_unavailable' }, 503);
  }
}
