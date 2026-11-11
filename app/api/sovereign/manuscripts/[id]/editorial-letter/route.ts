/**
 * WS-RELATIONAL-ARCHITECTURE step 2 — GET MAIA's newest letter for this Work and the writer's decisions on its places.
 * Read-only. The member's own letter only. The draft it was of is returned, so the surface can say when it is of an earlier draft.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { currentDecisions, currentLetter } from '@/lib/writersStudio/letter/letterStore';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  const letter = await currentLetter(memberId, id);
  if (!letter) return NextResponse.json({ letter: null, decisions: {} });
  return NextResponse.json({ letter, decisions: await currentDecisions(memberId, letter.id) });
}
