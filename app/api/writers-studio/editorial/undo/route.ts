import {holdLegacyWriterForVerifiedMemberR52} from '@/lib/writersStudio/release/heldLegacyWriterFenceR52';
import { NextResponse, type NextRequest } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { undoApplication } from '@/lib/manuscript/editorialRuntime/recovery';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  if (process.env.WRITERS_STUDIO_EDITORIAL_ENABLED !== '1') return new NextResponse(null, { status: 404 });
  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  // R52 pilot safety: never adopt the older plaintext editorial ledger.
  const r52Hold = await holdLegacyWriterForVerifiedMemberR52(identity.memberId);
  if (r52Hold) return r52Hold;

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return NextResponse.json({ error: 'Object required' }, { status: 400 });
  const b = raw as Record<string, unknown>;
  if (Object.keys(b).some(k => k !== 'authorizationId') || typeof b.authorizationId !== 'string'
      || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b.authorizationId))
    return NextResponse.json({ error: 'One authorizationId is required' }, { status: 400 });
  const outcome = await undoApplication(identity.memberId, b.authorizationId);
  return NextResponse.json(outcome, { status: outcome.kind === 'undone' ? 200 : 409 });
}
