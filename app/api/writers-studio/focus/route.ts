/**
 * POST /api/writers-studio/focus — the ONLY route that may send Work context
 * to MAIA.
 *
 *   ⭐⭐ One authorized boundary, one accountable crossing, one canonical MAIA —
 *       and no invisible alternate path.
 *
 * ⛔ This handler mints no consent, mints no receipt, reads no Work, and calls no
 * model of its own. It resolves identity, holds ONE requestId, and delegates to
 * `performFocusCrossing()`, which is the constituted path. Every guarantee lives
 * there so that a second route cannot acquire them by copying half of this one.
 *
 * ⛔ FOUNDER-GATED AND OFF BY DEFAULT. Without WRITERS_STUDIO_FOCUS_ENABLED the
 * route 404s — it does not 403. An unauthorized caller learns nothing about what
 * exists here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { performFocusCrossing, type FocusMemberScope } from '@/lib/writers-studio/focusCrossing';
import { readCurrentDraft } from '@/lib/writers-studio/currentDraftRead';
import { focusCurrencyResolver } from '@/lib/writers-studio/focusCurrencyResolver';
import { focusPresence } from '@/lib/writers-studio/focusPresence';
import { prepareCanonicalHandoff, beginCanonicalGeneration } from '@/lib/writers-studio/writersStudioCognition';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_FOCUS_ENABLED === '1';

export async function POST(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  // ⭐ ONE IDENTITY TRUTH. `constructCanonicalTurn` refuses any identity not minted
  // here, and rightly: authenticating for the route and then passing a raw string
  // downstream would be two identities pretending to be one. The member id used
  // for manuscript ownership is taken FROM the verified identity, never from meta,
  // a body field, or an x-member-id header.
  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const memberId = identity.memberId;

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const {
    sessionId, workRef, actId, readingId, observationKey,
    members, activeMemberId, gesture, ask,
  } = body ?? {};

  if (typeof sessionId !== 'string' || typeof workRef !== 'string' || typeof ask !== 'string') {
    return NextResponse.json({ error: 'sessionId, workRef and ask are required' }, { status: 400 });
  }
  /**
   * ⭐⭐ THE ACT IDENTITY IS THE CLIENT'S, AND IT IS REQUIRED.
   *
   *   one writer gesture → one act identity → N member disclosures
   *     → one canonical MAIA handoff
   *
   * ⛔ The server does NOT mint it. A retried request must be recognizable as
   * the same act, and a server-minted identity makes that impossible by
   * construction — the writer would acquire a disclosure history for an act
   * they performed once. Each member's disclosure id is derived from it
   * (`actId:focusMemberId`), so a retry addresses the SAME rows rather than
   * opening a second set beside them.
   */
  if (typeof actId !== 'string' || actId.length < 8) {
    return NextResponse.json({ error: 'actId is required' }, { status: 400 });
  }
  /* ⭐ The origin reading, so the SERVER can reach the frozen digests and
     establish for itself whether each anchor still denotes current Work. */
  if (typeof readingId !== 'string' || typeof observationKey !== 'string') {
    return NextResponse.json({ error: 'readingId and observationKey are required' }, { status: 400 });
  }
  if (gesture !== 'ask_maia' && gesture !== 'work_with_this' && gesture !== 'widen_focus') {
    return NextResponse.json({ error: 'unsupported gesture' }, { status: 400 });
  }
  /* ⛔ The client never supplies Work text. It names places; the server reads
     them, and only after the boundary authorizes each one. A caller-supplied
     passage would make the boundary decorative. */
  for (const forbidden of ['focusText', 'content', 'bodies']) {
    if (typeof (body as Record<string, unknown>)[forbidden] === 'string') {
      return NextResponse.json({ error: 'Work text is read server-side, never supplied' }, { status: 400 });
    }
  }

  /**
   * The declared attention — identities and historical coordinates only.
   *
   * ⛔⭐ THE CLIENT ASSERTS NO READABILITY AT ALL. It names places; the server
   * resolves, at Ask time, whether each historical anchor still denotes current
   * Work — and only `ready` is given a body. A field the client has no
   * authority to assert is not validated here; it does not exist.
   */
  const scopes = Array.isArray(members) ? members : [];
  if (!scopes.length) {
    return NextResponse.json({ error: 'at least one focus member is required' }, { status: 400 });
  }
  const parsed: FocusMemberScope[] = [];
  for (const m of scopes) {
    if (!m || typeof m !== 'object') break;
    const { focusMemberId, sectionRef, range } = m as Record<string, unknown>;
    if (typeof focusMemberId !== 'string' || typeof sectionRef !== 'string') break;
    parsed.push({
      focusMemberId, sectionRef,
      ...(range && typeof range === 'object'
        ? { range: { start: Number((range as any).start), end: Number((range as any).end) } }
        : {}),
    });
  }
  if (parsed.length !== scopes.length) {
    return NextResponse.json({ error: 'a focus member could not be parsed' }, { status: 400 });
  }
  if (activeMemberId !== null && activeMemberId !== undefined && typeof activeMemberId !== 'string') {
    return NextResponse.json({ error: 'activeMemberId must be a member id or null' }, { status: 400 });
  }

  // ⭐ ONE serving request. Every member's receipt shares it, so an auditor
  // grouping by it sees ONE member act carrying N section-scoped crossings.
  const requestId = randomUUID();

  const result = await performFocusCrossing(
    {
      requestId, actId, identity, posture: TurnPosture.resolve(body), memberId, sessionId,
      workRef, readingId, observationKey,
      members: parsed, activeMemberId: (activeMemberId as string | null) ?? null,
      gesture, ask,
    },
    {
      readDraft: readCurrentDraft, resolveCurrency: focusCurrencyResolver,
      presence: focusPresence,
      prepare: prepareCanonicalHandoff, generate: beginCanonicalGeneration,
    },
  );

  // ⛔ Internal vocabulary never leaves: the §3a presentation is the contract.
  return NextResponse.json({
    state: result.presentation.state,
    message: result.presentation.message,
    actions: result.presentation.actions,
    response: result.response,
    /* ⭐ The surface is told what MAIA was told: how many places the writer
       declared and how many she could actually read. A writer who asked about
       five places and got an answer about three is entitled to know that. */
    focus: result.participation
      ? {
          total: result.participation.total,
          readable: result.participation.readable,
          activeMemberId: result.participation.activeMemberId,
          members: result.participation.members.map((m) => ({
            focusMemberId: m.focusMemberId, ordinal: m.ordinal,
            status: m.status, bodyAvailable: m.bodyAvailable, active: m.active,
          })),
        }
      : null,
  });
}
