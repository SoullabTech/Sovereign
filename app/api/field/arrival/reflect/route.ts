/**
 * Marran reception — reflect endpoint. STORE-NOTHING.
 *
 * Returns MAIA's reflection of what a member brought as they arrive. It never
 * writes, never persists the input, never structures or extracts tasks. The
 * reception phases (Receive, Resonate) of the Arrival flow call only this.
 * Action lives elsewhere, behind explicit consent, in the Express phase.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { reflectArrival, type ReceptionPhase } from '@/lib/field/arrivalReception';

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const input = typeof b.input === 'string' ? b.input.trim().slice(0, 4000) : '';
  if (!input) {
    return NextResponse.json({ error: 'input required' }, { status: 400 });
  }
  const phase: ReceptionPhase = b.phase === 'resonate' ? 'resonate' : 'receive';
  const prior = typeof b.prior === 'string' ? b.prior : undefined;

  try {
    const reflection = await reflectArrival(input, phase, { prior });
    return NextResponse.json({ reflection });
  } catch (err) {
    console.error('[field/arrival/reflect] failed', err);
    return NextResponse.json({ error: 'reflect failed' }, { status: 500 });
  }
}
