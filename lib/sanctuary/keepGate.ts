/**
 * Route-side Sanctuary gate for every Writer's Studio write of something MAIA keeps or learns (founder ruling 2026-11-09, third).
 * Call it right after reading the JSON body, before any read of the Work or any write. It returns the refusal to send, or null —
 * and in that case removes `sanctuary` from the body so the route's own strict field checks see exactly what they did before.
 * ⛔ Never used on the writer's own manuscript work or on deletions.
 */
import { NextResponse } from 'next/server';
import { keepRefusal } from '@/lib/sanctuary/studioPosture';

export async function keepGate(memberId: string, body: unknown): Promise<NextResponse | null> {
  const refused = await keepRefusal(memberId, body);
  if (refused) return NextResponse.json({ ...refused.body, persisted: false }, { status: refused.status });
  if (body && typeof body === 'object' && !Array.isArray(body)) delete (body as Record<string, unknown>).sanctuary;
  return null;
}
