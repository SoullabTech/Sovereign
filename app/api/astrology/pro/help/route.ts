/**
 * "How do I…?" — MAIA's chartless help inside Astrology Pro
 * (ASTRO-PRO-MAIA-GUIDE-R2; spec ASTRO-PRO-MAIA-GUIDE-01 §4 route H1).
 *
 * POST /api/astrology/pro/help
 * body: { question, history? }   — nothing else is accepted.
 *
 * MAIA answers questions about the workstation from the Pro guide
 * (lib/astrology/proGuide.ts) and reads no chart. The body has no field that
 * can carry a chart, a name, birth details or memory: any other key — subject,
 * other, section, personal, view, point, lifeContext, … — is refused with
 * `unexpected_field`, and each earlier turn may carry only `q` and `a`. Nothing
 * is loaded for the member but their Pro access.
 *
 * Same access as Pro Ask (`resolveProOwner`: the verified session member, the
 * founder or an audited grant). A question showing crisis or serious distress
 * gets the fixed reply and MAIA is not asked. Nothing is stored or logged but
 * the fact of an answer.
 *
 * ⚠️ Not yet mapped in config/accessMatrix.ts — that is the separate D-05
 * security lane. Until then the handler's own check is the gate.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { analyzeSafetyCues } from '@/lib/comms/SafetyService';
import { ASK_MAIA_MAX_QUESTION, plainAnswer } from '@/lib/astrology/proAskMaia';
import {
  PRO_ASK_HISTORY_MAX, PRO_ASK_HISTORY_TURN_MAX, PRO_ASK_SAFETY_REPLY, thirdPersonConcern,
} from '@/lib/astrology/proAskMaiaSections';
import { PRO_HELP_KEYS, PRO_HELP_TURN_KEYS, proHelpSystemPrompt } from '@/lib/astrology/proHelp';
import { PRO_RESPONSE_HEADERS, proError, proOwnerStillCurrent, resolveProOwner } from '@/lib/astrology/proRouteAccess';

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

const onlyKeys = (value: object, keys: readonly string[]) => Object.keys(value).every((k) => keys.includes(k));

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
  // Structural: nothing but the question and this visit's earlier turns.
  if (!onlyKeys(input, PRO_HELP_KEYS)) return proError(400, 'unexpected_field');
  const question = typeof input.question === 'string' ? input.question.trim() : '';
  if (!question) return proError(400, 'question_required');
  if (question.length > ASK_MAIA_MAX_QUESTION) return proError(400, 'question_too_long');

  // Earlier turns of this visit, from the page. Bounded; nothing is stored here.
  const history: Array<{ q: string; a: string }> = [];
  if (input.history !== undefined) {
    if (!Array.isArray(input.history) || input.history.length > PRO_ASK_HISTORY_MAX) return proError(400, 'history_unsupported');
    for (const turn of input.history) {
      if (!turn || typeof turn !== 'object' || Array.isArray(turn) || !onlyKeys(turn, PRO_HELP_TURN_KEYS)) {
        return proError(400, 'history_unsupported');
      }
      const { q, a } = turn as { q?: unknown; a?: unknown };
      if (typeof q !== 'string' || typeof a !== 'string' || !q.trim() || !a.trim() ||
          q.length > ASK_MAIA_MAX_QUESTION || a.length > PRO_ASK_HISTORY_TURN_MAX) return proError(400, 'history_unsupported');
      history.push({ q: q.trim(), a: a.trim() });
    }
  }

  if (!allowed(owner.memberId)) return proError(429, 'slow_down');

  // Safety first: MAIA is not asked when a question shows crisis or serious distress.
  const safety = analyzeSafetyCues(question);
  if (safety.severity === 'crisis' || safety.severity === 'red' || thirdPersonConcern(question)) {
    console.log('[astrology/pro/help] safety reply given');
    return NextResponse.json({ answer: PRO_ASK_SAFETY_REPLY, safety: true }, { headers: PRO_RESPONSE_HEADERS });
  }

  try {
    const llm = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: proHelpSystemPrompt({ continuing: history.length > 0 }),
      messages: [
        ...history.flatMap((turn) => [{ role: 'user' as const, content: turn.q }, { role: 'assistant' as const, content: turn.a }]),
        { role: 'user', content: question },
      ],
      maxTokens: 500,
      temperature: 0.4,
      // As with Pro Ask: under LOCAL_TIER_ENABLED the local model can stall.
      forceClaude: true,
    });
    if (!(await proOwnerStillCurrent(request, owner.memberId))) return proError(401, 'session_changed');
    // Privacy: record only that a question was answered, never its content.
    console.log('[astrology/pro/help] answered');
    const answer = plainAnswer(llm.text || '');
    if (!answer) return proError(503, 'no_answer');
    return NextResponse.json({ answer }, { headers: PRO_RESPONSE_HEADERS });
  } catch {
    return proError(503, 'help_unavailable');
  }
}
