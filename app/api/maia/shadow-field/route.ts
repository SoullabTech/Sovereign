export const dynamic = 'force-dynamic';

/**
 * Shadow Field — Dedicated room (MAIA-SHADOW-FIELD-01 · PROTOTYPE v1).
 *
 * ASSEMBLY SOVEREIGNTY (constitution Part III, D6). This route is a SEPARATE
 * interpretive assembly. It is not `/list`, it does not call `getMaiaResponse`, and it
 * imports no ordinary-path psychological or frame-bearing producer:
 *   NOT lib/sovereign/maiaService          NOT lib/consciousness/WisdomRouter
 *   NOT lib/consciousness/maia-path-revelation (the Shadow Guardian trigger table)
 *   NOT lib/bridges/elemental-oracle-bridge  NOT lib/consciousness/processingProfiles
 *   NOT lib/field/panconsciousFieldRouter    NOT lib/consciousness/relationalObserver
 *   NOT lib/consciousness/shadowWorkFlows    NOT lib/features/ShadowIntegrationTracker
 *   NOT lib/shadow-insight
 * Because the ordinary path never assembles this turn, no ordinary-path producer CAN
 * participate in it. The exclusion is an import-graph fact, not a runtime discipline.
 * Safety, identity and transport are NOT excluded (D6 amendment).
 *
 * LEAVING ACTUALLY ENDS IT (L6, F14 — P5-C1). Every non-exit turn requires a LIVE
 * server-held sitting. Closing the sitting therefore ends Field conversation authority:
 * replaying an old activation object with a closed token cannot reach the model. The
 * activation act alone is not sufficient — it never was meant to be a bearer token.
 *
 * ENTRY IS AN ACT, NOT A MATCH (L1, F1, F2). This route requires an explicit
 * member-authored activation act on every turn. It never inspects message text to decide
 * whether the Field is active, which movement applies, or what to say about the member.
 * There is no keyword table, classifier, embedding, or model-derived gate in this file.
 *
 * NO WRITER IN v1 (P4 STOPPED — see docs/programme/MAIA-SHADOW-FIELD-01_PROTOTYPE_P4_STOP…).
 * This route performs no persistence of any kind. It imports no database client and no
 * memory writer. Nothing from a Shadow Field turn is stored, counted, scored or forwarded.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester } from '@/lib/auth/tester';
import {
  buildShadowFieldSystemPrompt,
  SHADOW_FIELD_EXIT_TEXT,
} from '@/lib/maia/shadowField/prompts';
import { MOVEMENT_ORDER } from '@/lib/maia/shadowField/types';
import { verifyFieldSession, closeFieldSession } from '@/lib/maia/shadowField/fieldSession';
import type {
  ShadowActivation,
  ShadowMovement,
  ShadowTurnInput,
} from '@/lib/maia/shadowField/types';

const anthropic = new Anthropic();

const MODEL = 'claude-opus-4-7';
const MAX_TOKENS = 1200;

/**
 * The activation gate (L1). A member act, or nothing.
 * Note what this function does NOT do: it does not look at `message`.
 */
function isMemberActivation(value: unknown): value is ShadowActivation {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  return (
    a.act === 'member_entered_shadow_field' &&
    a.authoredBy === 'member' &&
    a.participationClass === 'placed' &&
    (a.modality === 'button' || a.modality === 'typed' || a.modality === 'spoken')
  );
}

function isMovement(value: unknown): value is ShadowMovement {
  return typeof value === 'string' && (MOVEMENT_ORDER as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  // Bounded surface for the prototype, as the Field Lab rooms are bounded.
  const tester = await isMemberTester(session.memberId);
  if (!tester) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Partial<ShadowTurnInput> & {
    exit?: boolean;
  } | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // EXIT (L6, F14). One gesture. Immediate. No closing interpretation, no keep prompt,
  // no question, nothing written, and no reference to what was in the room.
  if (body.exit === true) {
    // Deactivation is server-side, not merely a client state change (P4-C1). After this
    // the token is dead: further turns and any keep attempt refuse.
    //
    // Ownership-bound: a member may close only their own verified sitting. An unverified
    // token closes nothing — and the acknowledgement is identical either way, so this
    // endpoint cannot be used to probe whether someone else's sitting exists.
    const leaving = verifyFieldSession((body as Record<string, unknown>).fieldToken, session.memberId);
    if (leaving) closeFieldSession(leaving.token);
    return NextResponse.json({ text: SHADOW_FIELD_EXIT_TEXT, fieldActive: false });
  }

  // ENTRY IS AN ACT. Without a member activation act there is no Field turn — whatever
  // the member wrote. Content never opens this door.
  if (!isMemberActivation(body.activation)) {
    return NextResponse.json(
      {
        refused: true,
        reason: 'no_activation',
        text: 'The Shadow Field opens only when you choose to enter it.',
      },
      { status: 409 },
    );
  }

  // A LIVE server-held sitting is required to think in the Field at all (P5-C1). No
  // fallback: an unknown, expired, foreign or closed token refuses. This is what makes
  // Leave real — after it, this branch is the wall.
  const field = verifyFieldSession((body as Record<string, unknown>).fieldToken, session.memberId);
  if (!field) {
    return NextResponse.json(
      {
        refused: true,
        reason: 'no_field_session',
        text: 'The Shadow Field opens only when you choose to enter it.',
      },
      { status: 409 },
    );
  }

  const movement: ShadowMovement = isMovement(body.movement) ? body.movement : 'encounter';

  // Sanctuary comes from the server sitting. There is no client fallback (P5-C1).
  const sanctuary = field.sanctuary;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const transcript = Array.isArray(body.transcript) ? body.transcript.slice(-20) : [];

  const systemPrompt = buildShadowFieldSystemPrompt(movement, sanctuary);

  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [
      ...transcript.map((t) => ({
        role: (t.role === 'maia' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: t.text,
      })),
      { role: 'user' as const, content: message },
    ],
  });

  const text = completion.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  // What is returned is the whole of what this turn produced. There is no meta channel,
  // no reading, no score, and nothing retained (L8, C2).
  return NextResponse.json({ text, movement, sanctuary, fieldActive: true });
}
