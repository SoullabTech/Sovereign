// LISTEN-01 / F4 — Sanctuary closure for the review guide. Nothing from a Sanctuary session may be saved or sent to a
// model (CLAUDE.md "Sanctuary Mode"). Reuses the Studio posture: the client declares `sanctuary` on every request and
// the server fails closed — an undeclared or unreadable posture is refused exactly as Sanctuary is.
import { NextResponse } from 'next/server';
import { SANCTUARY_REVIEW_MESSAGE, UNDECLARED_REVIEW_MESSAGE } from '@/lib/listening/soundStudioReview';
import { resolveStudioPosture } from '@/lib/sanctuary/studioPosture';

/** Returns a 409 refusal response when the request may not proceed, or null when it is ordinary. Call before any model call or insert. */
export async function refuseIfNotOrdinary(memberId: string, body: Record<string, unknown> | null): Promise<NextResponse | null> {
  const posture = await resolveStudioPosture(memberId, { sanctuary: body?.sanctuary });
  if (posture.keep) return null;
  const refusal = posture.sanctuary ? 'sanctuary' : 'posture_undeclared';
  return NextResponse.json(
    { refusal, message: posture.sanctuary ? SANCTUARY_REVIEW_MESSAGE : UNDECLARED_REVIEW_MESSAGE },
    { status: 409, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
