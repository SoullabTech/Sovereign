export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  createWorkDirective,
  listWorkDirectives,
} from '@/lib/writersStudio/workDirectivesServer';
import { isWorkDirectiveKind } from '@/lib/writersStudio/workDirectives';

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: workId } = await ctx.params;
  return NextResponse.json({
    directives: await listWorkDirectives(memberId, workId),
  });
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: workId } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as {
    kind?: unknown;
    text?: unknown;
  };

  if (!isWorkDirectiveKind(body.kind) || typeof body.text !== 'string') {
    return NextResponse.json({ error: 'invalid_directive' }, { status: 400 });
  }

  const result = await createWorkDirective({
    memberId,
    workId,
    kind: body.kind,
    text: body.text,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.refusal },
      { status: result.refusal === 'not_found' ? 404 : 400 },
    );
  }
  return NextResponse.json({ directiveId: result.directiveId }, { status: 201 });
}
