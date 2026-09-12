/**
 * POST /api/writers-studio/focus/currency — the Focus currency PREFLIGHT.
 *
 * ⭐⭐ RESOLUTION IS NOT DISCLOSURE. Two different acts, and this is the first:
 *
 *   FOCUS RESOLUTION   a member-facing host operation.
 *                      "Does this historical anchor still name current Work?"
 *   FOCUS DISCLOSURE   the member presses Ask MAIA. That is the OTHER route.
 *
 * ⛔ THIS ROUTE MUST NOT: call MAIA · mint a disclosure receipt · open a
 * FocusCrossingAct · return manuscript prose · return any digest, historical or
 * current · grant authority to the later Ask · mutate anything.
 *
 *   Nothing enters MAIA because the Focus panel happened to open.
 *
 * ⭐ IT TELLS THE UI WHAT IS TRUE NOW, AND NOTHING ELSE. The Ask crossing
 * establishes currency again, independently, when the member actually asks —
 * so a stale panel cannot authorize a disclosure, and this response is not an
 * authority anyone can spend.
 *
 * ⛔ NO DIGEST CROSSES INTO THE BROWSER. The client sends only the identities it
 * already carries — the reading, the observation, and which member is which.
 * The server reaches the historical digests itself and returns four words.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { focusCurrencyResolver } from '@/lib/writers-studio/focusCurrencyResolver';
import { spacedRange, type SpacedRange } from '@/lib/manuscript/sections/coordinateSpace';

export const dynamic = 'force-dynamic';

/** The same founder gate as the crossing. ⛔ 404, not 403. */
const enabled = () => process.env.WRITERS_STUDIO_FOCUS_ENABLED === '1';

export async function POST(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  /* ⭐ ONE IDENTITY TRUTH, as at the crossing. The member id used for ownership
     is taken FROM the verified identity, never from the body. */
  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const { workRef, readingId, observationKey, members } = body ?? {};

  if (typeof workRef !== 'string' || typeof readingId !== 'string'
      || typeof observationKey !== 'string') {
    return NextResponse.json(
      { error: 'workRef, readingId and observationKey are required' }, { status: 400 });
  }

  const scopes = Array.isArray(members) ? members : [];
  if (!scopes.length) {
    return NextResponse.json({ error: 'at least one focus member is required' }, { status: 400 });
  }

  const parsed: { focusMemberId: string; sectionRef: string; range?: SpacedRange }[] = [];
  for (const m of scopes) {
    if (!m || typeof m !== 'object') break;
    const { focusMemberId, sectionRef, range } = m as Record<string, unknown>;
    if (typeof focusMemberId !== 'string' || typeof sectionRef !== 'string') break;
    parsed.push({
      focusMemberId, sectionRef,
      ...(range === undefined || range === null ? {} : { range: spacedRange(range) as never }),
    });
  }
  /* ⛔ R9 · same law as the crossing: a range with no recognised space is
     refused here too, so the preflight cannot answer about a span it cannot
     locate. */
  if (parsed.length !== scopes.length || parsed.some((m) => m.range === null)) {
    return NextResponse.json({ error: 'a focus member could not be parsed' }, { status: 400 });
  }

  const currency = await focusCurrencyResolver({
    memberId: identity.memberId, workRef, readingId, observationKey, members: parsed,
  });

  return NextResponse.json({
    /**
     * ⭐ A FRESHNESS MARKER, NOT A COMPARISON. It says only: these statuses were
     * established against Working Draft v37. ⛔ It is never compared with the
     * reading's `revision_number` — a kept revision and a draft version are two
     * different clocks, and equal integers there would mean nothing.
     */
    resolvedAgainstDraftVersion: currency.resolvedAgainstDraftVersion,
    /* ⛔ STATUS ONLY. No body, no quotation, no length, no digest, no
       description of what any passage is about. The section ref is not echoed
       either: the client sent it and already holds it. */
    members: currency.members.map((m) => ({
      focusMemberId: m.focusMemberId,
      currency: m.currency,
    })),
  });
}
