/**
 * WS2-07 · BUILD-07F — DEVELOPMENTAL DECISIONS · the member's standing, as a
 * SIBLING RESOURCE of the reading (design §10).
 *
 * It is never folded into the reading payload: a frozen reading is what MAIA
 * noticed, and a standing is what the writer decided. Keeping them separate at
 * the API is what keeps them separate in every client that consumes them.
 *
 * GET returns the current projection AND `currentEventId` — without it the CAS
 * token is unobtainable, since a client cannot send a token it was never given.
 *
 * WHAT THIS RESOURCE HAS NO VERB FOR, each named in the design as absent:
 *   no PUT/PATCH of an event      a standing is changed by taking a later one
 *   no DELETE                     clearing is not an operation
 *   no history                    07F retains history; it does not expose it
 *   no `memberId` in the body     authentication supplies it; a request never does
 *   no `investigate`              a different axis, not a standing
 *
 * D6 rests here: this authenticated member route is the ONLY module permitted to
 * reach the standing writer, asserted by
 * `lib/manuscript/standing/__tests__/standingOutsideCognition.test.ts`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { parseStandingRequest } from '@/lib/manuscript/standing/contract';
import type { StandingEvent } from '@/lib/manuscript/standing/contract';
import {
  currentStandings, readingIsAddressable, recordStanding,
} from '@/lib/manuscript/standing/store';

export const dynamic = 'force-dynamic';

/**
 * SERVER-SIDE STANDING CONTAINMENT — Founder Pilot, 2026-09-06.
 *
 * DEVELOP moved INTO the pilot tester surface, and the UI-only kill switch that
 * containment previously relied on (`NEXT_PUBLIC_WS_STANDING_ENABLED` in
 * DevelopRoom) is not containment once a tester can reach the room. A hidden
 * button is a convention; this is the refusal.
 *
 * ⛔ THE SERVER VARIABLE IS THE AUTHORITY. `NEXT_PUBLIC_*` is inlined into the
 * client bundle, so letting it decide whether the server accepts a write would
 * put a client-visible value in charge of a server boundary. `WS_STANDING_ENABLED`
 * is server-only and decides alone.
 *
 * Both default to disabled, so the misconfiguration that can occur is the SAFE
 * one: public set without server = the controls render and every write is
 * refused (visible, harmless). The unsafe inverse — server open while the UI
 * hides it — cannot arise from setting the public flag alone.
 *
 * ⛔ CONTAINMENT ONLY. This does not resume BUILD-07F, does not repair FINDING
 * F-CTX, and does not touch recorded standing history: reads are unaffected and
 * every existing event stays exactly where it is. It removes the ability to
 * CREATE a new standing act while the feature is disabled — which is what makes
 * F-CTX unreachable for the cohort rather than merely unlikely.
 */
function standingWritesEnabled(): boolean {
  return process.env.WS_STANDING_ENABLED === '1';
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The wire shape. `currentEventId` is named for what it is: the token a later
 *  act must carry to prove which state it acted from. */
const wire = (e: StandingEvent) => ({
  observationKey: e.observationKey,
  standing: e.standing,
  currentEventId: e.id,
  recordedAt: e.recordedAt,
});

async function addressed(
  req: NextRequest, manuscriptId: string, readingId: string,
): Promise<{ memberId: string } | NextResponse> {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(readingId) || !UUID.test(manuscriptId)) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }
  if (!(await readingIsAddressable(memberId, manuscriptId, readingId))) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }
  return { memberId };
}

/**
 * The current standing for every observation this member has ruled on in this
 * reading. An observation with no entry is UNSET — and the surface must render
 * that as "no standing taken", never as a value.
 *
 * A FAILED read is a 500, not an empty list. Absence of evidence from the
 * instrument is not evidence of absence in the object (07E's discovery repair,
 * in its 07F form).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; readingId: string }> },
) {
  const { id: manuscriptId, readingId } = await params;
  const gate = await addressed(req, manuscriptId, readingId);
  if (gate instanceof NextResponse) return gate;

  const standings = await currentStandings(gate.memberId, readingId);
  return NextResponse.json({ standings: standings.map(wire) });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; readingId: string }> },
) {
  const { id: manuscriptId, readingId } = await params;

  /* Refused BEFORE identity, body parsing and any store call: a disabled
     feature must not be probeable for whether a reading exists or who owns it. */
  if (!standingWritesEnabled()) {
    return NextResponse.json({ refusal: 'standing_unavailable' }, { status: 403 });
  }

  const gate = await addressed(req, manuscriptId, readingId);
  if (gate instanceof NextResponse) return gate;

  const parsed = parseStandingRequest(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ refusal: 'malformed' }, { status: 400 });

  const result = await recordStanding(gate.memberId, readingId, parsed.request);
  switch (result.outcome) {
    case 'appended':
      return NextResponse.json({ outcome: 'appended', standing: wire(result.event) });
    case 'unchanged':
      return NextResponse.json({ outcome: 'unchanged', standing: wire(result.current) });
    case 'refused':
      /* A refusal carries NO fresh token: the writer refetches and may act
         again, deliberately. Handing one back would invite an automatic retry
         the member never authored (design §4). */
      return NextResponse.json({ refusal: result.reason }, {
        status: result.reason === 'stale_expectation' || result.reason === 'simultaneous_write'
          ? 409
          : 404,
      });
  }
}
