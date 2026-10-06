export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { appendWorkDirectiveEvent } from '@/lib/writersStudio/workDirectivesServer';
import { isWorkDirectiveEvent } from '@/lib/writersStudio/workDirectives';

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; directiveId: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: workId, directiveId } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as {
    event?: unknown;
    text?: unknown;
  };

  if (!isWorkDirectiveEvent(body.event)) {
    return NextResponse.json({ error: 'invalid_event' }, { status: 400 });
  }
  if (body.event === 'revise' && typeof body.text !== 'string') {
    return NextResponse.json({ error: 'invalid_text' }, { status: 400 });
  }

  const result = await appendWorkDirectiveEvent({
    memberId,
    workId,
    directiveId,
    event: body.event,
    text: typeof body.text === 'string' ? body.text : undefined,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.refusal },
      { status: result.refusal === 'not_found' ? 404 : 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
