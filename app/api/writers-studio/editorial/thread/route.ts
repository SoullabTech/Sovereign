/**
 * WS-EDITORIAL-UI-01 · THE EDITORIAL RELATIONSHIP DOOR.
 *
 *   POST  open a relationship on a section the member selected
 *   GET   read the durable conversation for display
 *
 * ⭐ Same posture as the turn route, deliberately: ⛔ off by default and 404 —
 * not 403 — ⛔ verified identity only, ⛔ a CLOSED request shape whose unknown
 * keys are refused and named rather than ignored.
 *
 * ⛔ THIS ROUTE IS NOT A SECOND AUTHORITY LAYER. The client names a section or a
 * thread; every other fact — work, draft, base version, expected text, chain —
 * is derived server-side.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import {
  openEditorialRelationship, readEditorialThread,
} from '@/lib/manuscript/editorialRuntime/thread';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1';

async function verified(request: NextRequest) {
  const identity = await resolveCanonicalIdentity(request);
  return identity.status === 'verified' ? identity : null;
}

export async function POST(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });
  const identity = await verified(request);
  if (!identity) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }); }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return NextResponse.json({ error: 'a JSON object is required' }, { status: 400 });
  }
  const b = raw as Record<string, unknown>;
  /* ⛔ CLOSED. `workId`, `draftId`, `chainId`, `expectedText`, `baseVersion` are
     all server facts; a caller that sent one and got 200 would believe it had
     standing. */
  const stray = Object.keys(b).filter((k) => k !== 'sectionId' && k !== 'sanctuary');
  if (stray.length) {
    return NextResponse.json({
      error: `unknown field(s): ${stray.join(', ')} — these are derived server-side and carry no standing here`,
    }, { status: 400 });
  }
  /* SANCTUARY-EDITORIAL-PERSISTENCE-01 / E1 — posture first. Opening a
     relationship writes proposal_chain + ask_threads; durable by construction.
     Explicit boolean required; absence/malformed = unresolved = refused. */
  if (typeof b.sanctuary !== 'boolean') {
    return NextResponse.json({ error: 'posture_required', persisted: false }, { status: 400 });
  }
  if (TurnPosture.resolve(b).sanctuary) {
    return NextResponse.json({ error: 'sanctuary_unavailable', persisted: false }, { status: 409 });
  }
  if (typeof b.sectionId !== 'string' || b.sectionId.length === 0) {
    return NextResponse.json({ error: 'sectionId is required' }, { status: 400 });
  }

  const opened = await openEditorialRelationship({ identity, sectionId: b.sectionId });
  if (!opened.ok) {
    return NextResponse.json({ error: opened.reason },
      { status: opened.reason === 'section_not_found' ? 404 : 400 });
  }
  return NextResponse.json({ threadId: opened.threadId, chainId: opened.chainId });
}

export async function GET(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });
  const identity = await verified(request);
  if (!identity) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const threadId = request.nextUrl.searchParams.get('threadId');
  if (!threadId) return NextResponse.json({ error: 'threadId is required' }, { status: 400 });

  const read = await readEditorialThread(identity, threadId);
  if (!read.ok) {
    return NextResponse.json({ error: read.reason },
      { status: read.reason === 'thread_not_found' ? 404 : 400 });
  }
  /* ⭐ The durable conversation, and only it. ⛔ No prompt, no invocation, no
     provider material — the same thinness the turn route keeps. */
  return NextResponse.json(read.view);
}
