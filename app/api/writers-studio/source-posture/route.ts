/** Session-owned Sanctuary source-persistence posture.
 * This API is deliberately NOT wired to UI until all Sanctuary toggles are reconciled.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { PersistenceRefused, readSourcePersistencePosture, transitionSourcePersistencePosture } from '@/lib/sanctuary/sessionPersistenceLease';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const result = await readSourcePersistencePosture(request, memberId);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof PersistenceRefused) return NextResponse.json({ error: 'Posture unavailable' }, { status: 423 });
    return NextResponse.json({ error: 'Posture unavailable' }, { status: 503 });
  }
}
export async function POST(request: NextRequest) {
  // A cross-origin browser request must never silently flip privacy mode.
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return NextResponse.json({ error: 'JSON required' }, { status: 415 });
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || Object.keys(body).length !== 1 || !['ordinary', 'sanctuary'].includes(body.posture))
    return NextResponse.json({ error: 'Explicit posture required' }, { status: 400 });
  try {
    const result = await transitionSourcePersistencePosture(request, memberId, body.posture);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof PersistenceRefused) return NextResponse.json({ error: 'Posture unavailable' }, { status: 423 });
    return NextResponse.json({ error: 'Posture unavailable' }, { status: 503 });
  }
}
