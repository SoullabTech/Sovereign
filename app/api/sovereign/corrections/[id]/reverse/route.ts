/**
 * Reverse a member correction (Gate 1, F6 — corrigibility of the
 * corrigibility mechanism).
 *
 * When the system misclassified an utterance as a correction — or the member
 * simply changes their mind — this route restores the eligibility of any
 * turns the correction superseded. The reversal is itself recorded as a new
 * member_corrections row; the original correction row is preserved untouched.
 * History accumulates; it is never rewritten (F2).
 *
 * Ownership: authenticated member; the correction must belong to them.
 * Mismatched ownership returns 404 (we do not leak which corrections exist).
 *
 * Authority: docs/governance/FOUNDER_RULING_PERSISTENT_CORRIGIBILITY_GATE1_2026-08-09.md (F6)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { reverseMemberCorrection } from '@/lib/maia/correctionPersistence';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Correction id required.' }, { status: 400 });
  }

  let note = 'Member reversed this correction.';
  try {
    const body = await request.json();
    if (typeof body?.note === 'string' && body.note.trim()) {
      note = body.note.trim();
    }
  } catch {
    // body optional
  }

  const result = await reverseMemberCorrection({
    memberId,
    correctionId: id,
    verbatimText: note,
  });

  if (!result.reversed) {
    // Not owned, not found, or write failure — do not distinguish (no leak).
    return NextResponse.json({ error: 'Correction not found.' }, { status: 404 });
  }

  return NextResponse.json({
    reversed: true,
    reversalId: result.reversalId,
    restoredTurnCount: result.restoredTurnCount,
  });
}
