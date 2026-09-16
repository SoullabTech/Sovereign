import { NextRequest, NextResponse } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import {
  openEditorialRelationshipAtSelection,
  type OpenEditorialRefusal,
} from '@/lib/manuscript/editorialRuntime/thread';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1';
const BODY_KEYS = ['sectionId', 'range', 'revisionNumber'] as const;

function statusFor(reason: OpenEditorialRefusal): number {
  switch (reason) {
    case 'section_not_found': return 404;
    case 'selection_invalid': return 400;
    case 'selection_stale':
    case 'selection_ambiguous':
    case 'section_unprojectable':
    case 'section_has_no_body':
    case 'chain_refused': return 409;
  }
}

export async function POST(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });
  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }); }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return NextResponse.json({ error: 'a JSON object is required' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  const stray = Object.keys(body).filter(
    (k) => !(BODY_KEYS as readonly string[]).includes(k));
  if (stray.length) {
    return NextResponse.json({ error: `unknown field(s): ${stray.join(', ')}` }, { status: 400 });
  }
  if (typeof body.sectionId !== 'string' || body.sectionId.length === 0) {
    return NextResponse.json({ error: 'sectionId is required' }, { status: 400 });
  }
  if (!Number.isInteger(body.revisionNumber) || Number(body.revisionNumber) < 0) {
    return NextResponse.json({ error: 'revisionNumber must be a non-negative integer' }, { status: 400 });
  }
  const range = body.range as { start?: unknown; end?: unknown } | undefined;
  if (!range || !Number.isInteger(range.start) || !Number.isInteger(range.end)) {
    return NextResponse.json({ error: 'range.start and range.end must be integers' }, { status: 400 });
  }

  const opened = await openEditorialRelationshipAtSelection({
    identity,
    sectionId: body.sectionId,
    revisionNumber: Number(body.revisionNumber),
    range: { start: Number(range.start), end: Number(range.end) },
  });
  if (!opened.ok) {
    return NextResponse.json({ error: opened.reason }, { status: statusFor(opened.reason) });
  }
  return NextResponse.json({ threadId: opened.threadId, chainId: opened.chainId });
}
