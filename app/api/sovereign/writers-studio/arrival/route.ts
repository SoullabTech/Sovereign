// Production web requires force-dynamic for runtime database access (the pilot check).
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Writer's Studio — the Spark door's reflection (JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 · S1).
 *
 * POST { answer, history?, sanctuary? } → { reply }
 *
 * ⭐ Founder ruling Q1 (2026-11-11): the opening conversation is NEVER kept, in Ordinary or Sanctuary. This route
 * answers in the moment and writes nothing: no thread, no turn, no log of the writer's words. The only thing from the
 * opening that can ever be kept is a spark the writer chooses to hold, and that goes through the existing member-act
 * PATCH on their Work, never through here. Falsifier F7 pins the imports, so a store cannot be added quietly.
 *
 * ⭐ One mind: the reply comes from askMaia with the opt-in `arrival` context, the same path and provider seam as the
 * Work conversation (F8). Pilot-gated like the rest of the Studio's server surface (F10).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { askMaia } from '@/lib/manuscript/ask/askReader';

const MAX_ANSWER_CHARS = 2000;
const MAX_HISTORY_TURNS = 20;
const MAX_HISTORY_CHARS = 4000;
const privateHeaders = { 'Cache-Control': 'private, no-store' };

type Turn = { speaker: 'author' | 'maia'; body: string };

function historyFrom(value: unknown): Turn[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_HISTORY_TURNS) return null;
  const turns: Turn[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return null;
    const { speaker, body } = item as Record<string, unknown>;
    if ((speaker !== 'author' && speaker !== 'maia') || typeof body !== 'string' || !body.trim() || body.length > MAX_HISTORY_CHARS) {
      return null;
    }
    turns.push({ speaker, body });
  }
  return turns;
}

export async function POST(req: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401, headers: privateHeaders });
  const access = await writersStudioBetaAccess(memberId);
  if (!access.eligible) return NextResponse.json({ refusal: 'not_in_beta_pilot' }, { status: 403, headers: privateHeaders });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400, headers: privateHeaders });
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400, headers: privateHeaders });
  }
  const body = raw as Record<string, unknown>;
  const allowed = new Set(['answer', 'history', 'sanctuary']);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    return NextResponse.json({ refusal: 'malformed', detail: 'unknown field' }, { status: 400, headers: privateHeaders });
  }
  if (typeof body.answer !== 'string' || !body.answer.trim()) {
    return NextResponse.json({ refusal: 'malformed', detail: 'answer' }, { status: 400, headers: privateHeaders });
  }
  if (body.answer.length > MAX_ANSWER_CHARS) {
    return NextResponse.json({ refusal: 'answer_too_long' }, { status: 413, headers: privateHeaders });
  }
  if (body.sanctuary !== undefined && typeof body.sanctuary !== 'boolean') {
    return NextResponse.json({ refusal: 'malformed', detail: 'sanctuary' }, { status: 400, headers: privateHeaders });
  }
  const history = historyFrom(body.history);
  if (!history) return NextResponse.json({ refusal: 'malformed', detail: 'history' }, { status: 400, headers: privateHeaders });

  const outcome = await askMaia({ kind: 'arrival', sanctuary: body.sanctuary === true }, history, body.answer);
  if (!outcome.ok) {
    return NextResponse.json({ refusal: outcome.refusal }, { status: 502, headers: privateHeaders });
  }
  return NextResponse.json({ reply: outcome.answer }, { status: 200, headers: privateHeaders });
}
