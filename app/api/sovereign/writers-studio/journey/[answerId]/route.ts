import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { isColabKind } from '@/lib/writersStudio/journey';
import { shareJourneyAnswer, withdrawJourneyAnswer } from '@/lib/writersStudio/journeyServer';

/**
 * PATCH { action: 'withdraw' }                 withdraw the writer's answer to that question
 * PATCH { action: 'share', kind: problem|question|suggestion }
 *                                              share the current answer to the Beta Co-Lab
 *
 * Both act only on the caller's own answer. Sharing is the single, explicit path
 * by which journey words reach Co-Lab.
 */

export const dynamic = 'force-dynamic';
const privateHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, x-session-token' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SHARE_STATUS: Record<string, number> = {
  colab_not_open: 409,
  not_a_member: 403,
  not_found: 404,
  not_current: 409,
  already_shared: 409,
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ answerId: string }> }) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401, headers: privateHeaders });
  const access = await writersStudioBetaAccess(memberId);
  if (!access.eligible) return NextResponse.json({ refusal: 'not_in_beta_pilot' }, { status: 403, headers: privateHeaders });

  const { answerId } = await params;
  if (!UUID.test(answerId)) return NextResponse.json({ refusal: 'not_found' }, { status: 404, headers: privateHeaders });

  const raw = await req.json().catch(() => null);
  const body = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : null;
  if (!body) return NextResponse.json({ refusal: 'malformed' }, { status: 400, headers: privateHeaders });

  if (body.action === 'withdraw' && Object.keys(body).length === 1) {
    const result = await withdrawJourneyAnswer(memberId, answerId);
    if (!result.ok) return NextResponse.json({ refusal: result.refusal }, { status: 404, headers: privateHeaders });
    return NextResponse.json({ withdrawn: result.withdrawn }, { headers: privateHeaders });
  }

  if (body.action === 'share' && isColabKind(body.kind) && Object.keys(body).length === 2) {
    const result = await shareJourneyAnswer(memberId, answerId, body.kind);
    if (!result.ok) {
      return NextResponse.json({ refusal: result.refusal }, { status: SHARE_STATUS[result.refusal] ?? 400, headers: privateHeaders });
    }
    return NextResponse.json({ answer: result.answer }, { headers: privateHeaders });
  }

  return NextResponse.json({ refusal: 'malformed' }, { status: 400, headers: privateHeaders });
}
