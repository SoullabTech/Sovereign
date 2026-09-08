/**
 * WS2-ENCOUNTER-01 · E2 — the Encounter boundary for one Work.
 *
 *   POST  encounter this Work, now. Ephemeral.
 *
 * THE SERVER OWNS THE READ, and the request body is EMPTY. The client
 * contributes who is asking, which Work, and the act of asking — nothing else.
 * A client that could supply prose, scope, an observation or an interpretation
 * could publish under MAIA's name something MAIA never noticed.
 *
 * ⭐ AND THERE IS NO LENS. DEVELOP's commission takes one; this deliberately does
 * not. A lens parameter is precisely the door through which a developmental lens
 * would arrive wearing Encounter's name, and there is nothing to choose: the
 * ratified vocabulary is the whole permitted space.
 *
 * ⛔ AND "INADMISSIBLE" MEANS REFUSED, NOT IGNORED. The first implementation
 * documented an empty-body contract and then never read the body, so a client
 * could send `{ lens: 'development' }` or `{ observation: '…' }` and have it
 * silently discarded. Nothing was affected — and that is not the standard. A
 * constitutional rule that is merely unused is a rule the next refactor can
 * quietly honour differently. The body is now validated BEFORE the Work is read,
 * so a foreign field is refused rather than tolerated, and a refused request
 * never reaches Working Draft capture at all.
 *
 * MEMBER-INITIATED MEANS AN ACTUAL GESTURE (E-03). Opening a page, finishing an
 * import, route navigation, preload and background jobs must not commission an
 * Encounter — an unsolicited Encounter is a diagnosis by another name. POST is
 * the gesture; nothing here runs on GET, and there is no GET.
 *
 * NOTHING IS PERSISTED. There is no store, no history, no freeze and no id that
 * outlives this response. Keeping is deliberately not built (E2 §3): it needs a
 * provenance-preserving design that permits an explicit member act without
 * automatic server retention, and that mechanism is open, not decided here.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { encounter } from '@/lib/manuscript/encounter/read';

export const dynamic = 'force-dynamic';

export type BodyRefusal = 'malformed' | 'foreign_field' | 'invalid_body';

/**
 * The empty gesture, or a refusal. No request body and `{}` are the same act:
 * the client says *who is asking, which Work, and that they are asking* — and
 * has no channel for anything else.
 *
 * A foreign field is never partially honoured and never silently discarded.
 */
export async function readEmptyGesture(req: NextRequest): Promise<BodyRefusal | null> {
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return 'malformed';
  }
  if (raw.trim() === '') return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return 'malformed';
  }
  /* null, arrays, strings, numbers and booleans are all "a body that says
     something", and there is nothing for a client to say here. */
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return 'invalid_body';
  }
  if (Object.keys(parsed as Record<string, unknown>).length > 0) return 'foreign_field';
  return null;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  /* Before the Work is touched: the client contributes no content, no
     interpretation, no scope, no lens and no proposed perception. */
  const refusal = await readEmptyGesture(req);
  if (refusal) return NextResponse.json({ refusal }, { status: 400 });

  const { id } = await ctx.params;
  const result = await encounter(id, memberId);

  if (!result.ok) {
    /* A Work with no Working Draft is refused rather than answered from Source:
       falling back would change the object being encountered without saying so. */
    const status = result.refusal === 'not_traversable' ? 503 : 404;
    return NextResponse.json({ refusal: result.refusal }, { status });
  }

  /* An empty `notices` array is a COMPLETE, SUCCESSFUL Encounter. No message
     accompanies it: the system's lack of an observation is not information about
     the Work. */
  return NextResponse.json({
    snapshot: result.snapshot,
    notices: result.notices,
    recollections: result.recollections,
  });
}
