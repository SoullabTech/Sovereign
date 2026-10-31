/**
 * Existing-thread member formulation Save.
 *
 * The browser names the frozen thread, its exact predecessor and the current
 * Work-level relationship. The server derives the chain from the immutable
 * thread origin, revalidates the current declaration/A2 authority under lock,
 * and appends only the member's wording. No MAIA turn and no Apply occur here.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import {
  appendCurrentMemberVersion,
  type AppendCurrentMemberVersionResult,
} from '@/lib/manuscript/editorialRuntime/memberVersion';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';

export const dynamic = 'force-dynamic';
const enabled = () => process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1';
const PRIVATE = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' } as const;
const BODY_KEYS = [
  'threadId', 'relationshipId', 'sanctuary',
  'supersedes', 'replacementText', 'purpose',
] as const;
type Refusal = Extract<AppendCurrentMemberVersionResult, { outcome: 'refused' }>['reason'];

function statusFor(reason: Refusal): number {
  switch (reason) {
    case 'chain_unknown': return 404;
    case 'origin_unavailable':
    case 'not_successor_of_head':
    case 'simultaneous_append':
    case 'version_exists':
    case 'chain_corrupt': return 409;
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
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return NextResponse.json({ error: 'a JSON object is required' }, { status: 400, headers: PRIVATE });
  }
  const body = raw as Record<string, unknown>;
  const stray = Object.keys(body).filter(key => !(BODY_KEYS as readonly string[]).includes(key));
  if (stray.length) {
    return NextResponse.json({ error: `unknown field(s): ${stray.join(', ')}` },
      { status: 400, headers: PRIVATE });
  }
  if (typeof body.threadId !== 'string' || body.threadId.length === 0) {
    return NextResponse.json({ error: 'threadId is required' }, { status: 400, headers: PRIVATE });
  }
  if (typeof body.relationshipId !== 'string' || body.relationshipId.length === 0) {
    return NextResponse.json({ error: 'relationship_required' }, { status: 400, headers: PRIVATE });
  }
  if (typeof body.sanctuary !== 'boolean') {
    return NextResponse.json({ error: 'posture_required' }, { status: 400, headers: PRIVATE });
  }
  if (!(body.supersedes === null || typeof body.supersedes === 'string')) {
    return NextResponse.json({ error: 'supersedes must be a version id or null' }, { status: 400, headers: PRIVATE });
  }
  if (typeof body.replacementText !== 'string') {
    return NextResponse.json({ error: 'replacementText is required' }, { status: 400, headers: PRIVATE });
  }
  if (body.purpose !== undefined
      && (typeof body.purpose !== 'string' || !body.purpose.trim() || body.purpose.length > 80)) {
    return NextResponse.json({ error: 'purpose must be 1–80 characters' }, { status: 400, headers: PRIVATE });
  }

  const posture = TurnPosture.resolve({ sanctuary: body.sanctuary });
  if (posture.sanctuary) {
    return NextResponse.json({ error: 'sanctuary_unavailable', persisted: false },
      { status: 409, headers: PRIVATE });
  }
  const appended = await appendCurrentMemberVersion({
    memberId: identity.memberId,
    relationshipId: body.relationshipId,
    threadId: body.threadId,
    supersedes: body.supersedes,
    replacementText: body.replacementText,
    ...(typeof body.purpose === 'string' ? { purpose: body.purpose.trim() } : {}),
  });
  if (appended.outcome !== 'appended') {
    return NextResponse.json({ error: appended.reason, persisted: false },
      { status: statusFor(appended.reason), headers: PRIVATE });
  }
  return NextResponse.json({
    versionId: appended.version.id,
    supersedes: appended.version.supersedes,
  }, { status: 201, headers: PRIVATE });
}
