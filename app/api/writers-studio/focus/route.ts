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
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { performFocusCrossing } from '@/lib/writers-studio/focusCrossing';
import { assembleFocus } from '@/lib/writers-studio/assembleFocus';
import { writersStudioCognition } from '@/lib/writers-studio/writersStudioCognition';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_FOCUS_ENABLED === '1';

export async function POST(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const { sessionId, workRef, scopeKind, sectionRef, range, gesture, ask } = body ?? {};

  if (typeof sessionId !== 'string' || typeof workRef !== 'string' || typeof ask !== 'string') {
    return NextResponse.json({ error: 'sessionId, workRef and ask are required' }, { status: 400 });
  }
  if (scopeKind !== 'whole_work' && scopeKind !== 'section' && scopeKind !== 'passage') {
    return NextResponse.json({ error: 'unsupported scope' }, { status: 400 });
  }
  if (gesture !== 'ask_maia' && gesture !== 'work_with_this' && gesture !== 'widen_focus') {
    return NextResponse.json({ error: 'unsupported gesture' }, { status: 400 });
  }
  // ⛔ The client never supplies Work text. It names a scope; the server reads it,
  // and only after the boundary authorizes. A caller-supplied passage would make
  // the boundary decorative.
  if (typeof (body as Record<string, unknown>).focusText === 'string') {
    return NextResponse.json({ error: 'Work text is read server-side, never supplied' }, { status: 400 });
  }

  // ⭐ ONE identity, minted here at the boundary and carried through consent,
  // receipt and cognition. Never regenerated downstream.
  const requestId = randomUUID();
  // ⭐ A NEW disclosure identity per member act — never reused, so an unresolved
  // prior attempt can never be replayed as though it were this one.
  const disclosureId = randomUUID();

  const result = await performFocusCrossing(
    {
      requestId, posture: TurnPosture.resolve(body), memberId, sessionId,
      disclosureId, workRef, scopeKind,
      sectionRef: typeof sectionRef === 'string' ? sectionRef : undefined,
      range: range && typeof range === 'object'
        ? { start: Number((range as any).start), end: Number((range as any).end) } : undefined,
      gesture, ask,
    },
    { assemble: assembleFocus, cognition: writersStudioCognition },
  );

  // ⛔ Internal vocabulary never leaves: the §3a presentation is the contract.
  return NextResponse.json({
    state: result.presentation.state,
    message: result.presentation.message,
    actions: result.presentation.actions,
    response: result.response,
  });
}
