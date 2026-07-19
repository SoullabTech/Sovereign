export const dynamic = 'force-dynamic';

/**
 * One program — outline edits + lesson authoring (own field only).
 *
 * PATCH { title? | focalPoints? | currentFocalPoint? }   — the outline
 * PUT   { focalPoint, purpose?, materialIds?, practice?, reflectionPrompt? }
 *        — upsert the lesson enriching one step
 *
 * Both write an immutable revision in the same transaction. Lessons may
 * attach unratified materials while drafting; the compose path re-checks
 * ratification at read time, so nothing unratified ever reaches a member.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  getAuthoredField,
  updateProgram,
  upsertLesson,
  AuthoringError,
} from '@/lib/practiceField/programAuthoringService';

const err = (e: unknown) =>
  e instanceof AuthoringError
    ? NextResponse.json({ error: e.message }, { status: e.status })
    : (console.error('[practitioner/programs/:slug]', e),
      NextResponse.json({ error: 'Could not complete that right now.' }, { status: 500 }));

async function requireField(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return { failure: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const field = await getAuthoredField(memberId);
  if (!field) {
    return {
      failure: NextResponse.json(
        { error: 'No authored field — this surface belongs to the field holder.' },
        { status: 403 },
      ),
    };
  }
  return { field };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const auth = await requireField(request);
    if ('failure' in auth) return auth.failure;
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const program = await updateProgram(auth.field!, slug, body);
    return NextResponse.json({ program });
  } catch (e) {
    return err(e);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const auth = await requireField(request);
    if ('failure' in auth) return auth.failure;
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const program = await upsertLesson(auth.field!, slug, body);
    return NextResponse.json({ program });
  } catch (e) {
    return err(e);
  }
}
