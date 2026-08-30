/**
 * WS2-04B — PUT one section's body.
 *
 * The browser sends a section id, an exact body snapshot and the version it
 * believes the draft is at. It never sends the whole manuscript: a client that
 * posts one carries a stale copy of every section it did not touch.
 *
 * A VERSION CONFLICT IS A FIRST-CLASS 409, not a generic failure. The client's
 * conflict latch depends on telling "the draft moved elsewhere" apart from
 * "the save did not arrive" — collapsing them would either hide a real
 * conflict or tell someone their draft changed elsewhere because Wi-Fi
 * dropped.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { saveSection } from '@/lib/manuscript/sections/saveSection';

export const dynamic = 'force-dynamic';

/** Bounded, development-only, and applied to the RESPONSE — never the commit. */
const MAX_WITNESS_DELAY_MS = 2000;

function witnessDelayMs(req: NextRequest): number {
  if (process.env.NODE_ENV !== 'development') return 0;
  const raw = Number(req.nextUrl.searchParams.get('witnessDelayMs') ?? 0);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(raw, MAX_WITNESS_DELAY_MS);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> },
) {
  const { id, sectionId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let payload: { body?: unknown; baseVersion?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (typeof payload.body !== 'string' || typeof payload.baseVersion !== 'number') {
    return NextResponse.json({ error: 'body and baseVersion are required' }, { status: 400 });
  }

  const result = await saveSection(id, memberId, sectionId, payload.body, payload.baseVersion);

  /* The delay sits AFTER the mutation has committed or been refused. Save
     semantics — locking, version check, derived content, the deferred
     invariant — are byte-identical with it enabled; only the response is late,
     which is what lets a witness see a section still `saving` while it clicks
     the next one. */
  const delay = witnessDelayMs(req);
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));

  if (result.status === 'saved') {
    return NextResponse.json({
      ok: true,
      /* Enough canonical identity for the caller to bank precisely what
         succeeded, rather than assume it. */
      sectionId,
      body: payload.body,
      version: result.version,
    });
  }

  if (result.refusal === 'stale_base') {
    return NextResponse.json(
      { ok: false, refusal: 'stale_base', detail: result.detail },
      { status: 409 },
    );
  }
  const status = result.refusal === 'draft_not_found' || result.refusal === 'section_not_found'
    ? 404 : 422;
  return NextResponse.json({ ok: false, refusal: result.refusal }, { status });
}
