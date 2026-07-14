export const dynamic = 'force-dynamic';

/**
 * One material — metadata edits + lifecycle gestures (own field only).
 *
 * PATCH { title? | description? | type? | status? }
 *   status moves one honest step: uploaded→processed→reviewed→ratified,
 *   archive from anywhere, restore lands at reviewed (never straight back to
 *   ratified). Ratify is the practitioner's gesture alone — nothing automated
 *   calls this route. No DELETE: originals are preserved; archive is the
 *   retirement gesture.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  getAuthoredField,
  updateMaterial,
  AuthoringError,
} from '@/lib/practiceField/programAuthoringService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const field = await getAuthoredField(memberId);
    if (!field) {
      return NextResponse.json(
        { error: 'No authored field — this surface belongs to the field holder.' },
        { status: 403 },
      );
    }
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const material = await updateMaterial(field, id, body);
    return NextResponse.json({ material });
  } catch (e) {
    if (e instanceof AuthoringError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('[practitioner/materials/:id]', e);
    return NextResponse.json({ error: 'Could not complete that right now.' }, { status: 500 });
  }
}
