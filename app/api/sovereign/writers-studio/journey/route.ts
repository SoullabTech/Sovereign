import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import {
  addJourneyAnswer,
  colabShareAvailability,
  isFounder,
  listCurrentForFounder,
  listOwnJourney,
} from '@/lib/writersStudio/journeyServer';

/**
 * SEMANTIC-FIELD-01 tester journey field.
 *
 *   GET            the caller's own answers (every version) + whether Co-Lab sharing is open
 *   GET ?scope=all the founder's view of every writer's current answers (founder only)
 *   POST           answer a question, or revise an earlier answer ({ supersedes })
 *
 * Same door as the beta feedback membrane: Writer's Studio pilot members only.
 */

export const dynamic = 'force-dynamic';
const privateHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, x-session-token' };

function missingTable(error: unknown): boolean {
  return (error as { code?: string })?.code === '42P01';
}

export async function GET(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401, headers: privateHeaders });
  const access = await writersStudioBetaAccess(memberId);
  if (!access.eligible) return NextResponse.json({ refusal: 'not_in_beta_pilot' }, { status: 403, headers: privateHeaders });

  try {
    if (req.nextUrl.searchParams.get('scope') === 'all') {
      if (!(await isFounder(memberId))) {
        return NextResponse.json({ refusal: 'founder_only' }, { status: 403, headers: privateHeaders });
      }
      return NextResponse.json({ answers: await listCurrentForFounder() }, { headers: privateHeaders });
    }
    const [answers, colab, founder] = await Promise.all([
      listOwnJourney(memberId),
      colabShareAvailability(memberId),
      isFounder(memberId),
    ]);
    return NextResponse.json({ answers, colab, founder }, { headers: privateHeaders });
  } catch (error) {
    if (missingTable(error)) {
      return NextResponse.json({ refusal: 'journey_not_ready' }, { status: 503, headers: privateHeaders });
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401, headers: privateHeaders });
  const access = await writersStudioBetaAccess(memberId);
  if (!access.eligible) return NextResponse.json({ refusal: 'not_in_beta_pilot' }, { status: 403, headers: privateHeaders });

  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400, headers: privateHeaders });
  }
  const body = raw as Record<string, unknown>;
  const allowed = new Set(['promptKey', 'choice', 'answer', 'supersedes', 'manuscriptId']);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400, headers: privateHeaders });
  }

  try {
    const result = await addJourneyAnswer(memberId, {
      promptKey: body.promptKey,
      choice: body.choice,
      answer: body.answer,
      supersedes: body.supersedes,
      manuscriptId: body.manuscriptId,
    });
    if (!result.ok) {
      const status = result.refusal === 'not_found' ? 404 : result.refusal === 'not_current' ? 409
        : result.refusal === 'too_long' ? 413 : 400;
      return NextResponse.json({ refusal: result.refusal }, { status, headers: privateHeaders });
    }
    return NextResponse.json({ answer: result.answer }, { headers: privateHeaders });
  } catch (error) {
    if (missingTable(error)) {
      return NextResponse.json({ refusal: 'journey_not_ready' }, { status: 503, headers: privateHeaders });
    }
    throw error;
  }
}
