import { NextResponse, type NextRequest } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { parseCraftSaveRequest } from '@/lib/writersStudio/craftSaveContractR1';
import { saveWorkingEditorialVersion, type WorkingSaveRefusal } from '@/lib/manuscript/editorialRuntime/workingSave';

export const dynamic = 'force-dynamic';
const enabled = () => process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1';
const PRIVATE = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' } as const;

function statusFor(reason: WorkingSaveRefusal): number {
  switch (reason) {
    case 'relationship_required':
    case 'invalid_identity':
    case 'invalid_predecessor':
    case 'selection_invalid':
    case 'selection_ambiguous':
    case 'posture_required': return 400;
    case 'sanctuary_unavailable':
    case 'origin_unavailable':
    case 'selection_stale':
    case 'idempotency_conflict':
    case 'settled_choices_not_persisted':
    case 'not_successor_of_head':
    case 'simultaneous_append':
    case 'version_exists':
    case 'chain_corrupt': return 409;
    case 'section_not_found':
    case 'chain_unknown': return 404;
    default: return 409;
  }
}

export async function POST(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404, headers: PRIVATE });
  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: PRIVATE });
  }
  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400, headers: PRIVATE }); }
  const parsed = parseCraftSaveRequest(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.reason }, { status: 400, headers: PRIVATE });
  }
  const posture = TurnPosture.resolve({ sanctuary: parsed.value.sanctuary });
  const saved = await saveWorkingEditorialVersion({ identity, posture, request: parsed.value });
  if (!saved.ok) {
    return NextResponse.json({ error: saved.reason, persisted: false },
      { status: statusFor(saved.reason), headers: PRIVATE });
  }
  return NextResponse.json({
    threadId: saved.threadId, chainId: saved.chainId,
    versionId: saved.versionId, supersedes: saved.supersedes,
    sectionId: saved.sectionId, replayed: saved.replayed,
  }, { status: saved.replayed ? 200 : 201, headers: PRIVATE });
}
