/**
 * WS-EDITORIAL-RUNTIME-01 · ER-R5 — THE THIN EDITORIAL TURN DOOR.
 *
 * ⭐⭐ THIN MEANS THIN. This route establishes WHO is acting and WHAT they
 * declared, and then gets out of the way. ⛔ It is not a second authority layer:
 * every other fact the runtime needs is a SERVER fact, derived here or deeper.
 *
 * ⛔ FOUNDER-GATED AND OFF BY DEFAULT. Without `WRITERS_STUDIO_EDITORIAL_ENABLED`
 * it 404s — it does not 403. An unauthorized caller learns nothing about what
 * exists behind it. (The Focus route's posture, followed rather than reinvented.)
 *
 * ── ⭐⭐ THE ORDER IS THE LAW ──────────────────────────────────────────────
 *
 *   gate → identity → verified only → CLOSED parse → posture
 *        → ⛔ SANCTUARY REFUSES HERE, BEFORE ANY WRITE
 *        → R1 persist → mint exchangeId → R4 turn → thin response
 *
 * ⛔⛔ THE SANCTUARY REFUSAL IS BEFORE R1 AND THAT POSITION IS THE POINT. The
 * editorial stores are DURABLE and there is no ruled ephemeral editorial
 * equivalent. A member's words must not reach `ask_turns` and only then
 * discover that Sanctuary meant they should never have been written.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { persistMemberEditorialAct } from '@/lib/manuscript/editorialRuntime/memberAct';
import { runEditorialTurn } from '@/lib/manuscript/editorialRuntime/turn';
import { MEMBER_ACT_KINDS, type MemberActKind } from '@/lib/manuscript/editorialDiscourse/contract';
import {
  DEFAULT_SCOPE_DECLARATION, isEditorialLatitude,
  type EditorialScopeDeclaration,
} from '@/lib/manuscript/editorialScope/contract';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1';

/**
 * ⭐⭐ A CLOSED SHAPE, NOT A TOLERANT ONE.
 *
 * ⛔ Unknown keys are REFUSED, never ignored. A caller that sends `chainId` and
 * receives 200 would be left believing that value had standing — and the next
 * person to read their code would believe it too. The refusal names the keys so
 * the mistake is legible rather than mysterious.
 */
const TOP_KEYS = ['threadId', 'act', 'sanctuary', 'scope', 'externalProcessing'] as const;
const ACT_KEYS = ['act', 'text', 'refersTo'] as const;
/**
 * ⭐⭐ THE AUTHOR'S TWO CONTROLS, AND THEY ARE SEPARATE KEYS ON PURPOSE.
 *
 * ⛔ `mayRemoveParagraphs` is NOT derivable from `latitude`. A surface that
 * wants both must send both, and a surface that sends neither gets the most
 * protective setting — never a permission it did not ask for.
 */
const SCOPE_KEYS = ['latitude', 'mayRemoveParagraphs', 'mayProposeImmediately'] as const;

type Parsed =
  | {
      ok: true; threadId: string;
      act: { act: MemberActKind; text: string; refersTo: string | null };
      sanctuary: boolean;
      externalProcessing?: 'anthropic';
      scope: EditorialScopeDeclaration;
      /** ⭐ The writer's PER-WORK release of the sequence gate. ⛔ Default false. */
      mayProposeImmediately: boolean;
    }
  | { ok: false; error: string };

function parseClosed(body: unknown): Parsed {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'a JSON object is required' };
  }
  const b = body as Record<string, unknown>;
  const strayTop = Object.keys(b).filter((k) => !(TOP_KEYS as readonly string[]).includes(k));
  if (strayTop.length) {
    return { ok: false, error: `unknown field(s): ${strayTop.join(', ')} — these are server facts and carry no standing here` };
  }
  if (typeof b.threadId !== 'string' || b.threadId.length === 0) {
    return { ok: false, error: 'threadId is required' };
  }
  if (b.externalProcessing !== undefined && b.externalProcessing !== 'anthropic') {
    return { ok: false, error: 'externalProcessing must name anthropic' };
  }
  const a = b.act;
  if (typeof a !== 'object' || a === null || Array.isArray(a)) {
    return { ok: false, error: 'act is required' };
  }
  const ao = a as Record<string, unknown>;
  const strayAct = Object.keys(ao).filter((k) => !(ACT_KEYS as readonly string[]).includes(k));
  if (strayAct.length) {
    return { ok: false, error: `unknown act field(s): ${strayAct.join(', ')}` };
  }
  /* ⛔ The act kind is a CLOSED member-selected discriminant. */
  if (typeof ao.act !== 'string' || !(MEMBER_ACT_KINDS as readonly string[]).includes(ao.act)) {
    return { ok: false, error: `act.act must be one of ${MEMBER_ACT_KINDS.join(', ')}` };
  }
  if (typeof ao.text !== 'string') return { ok: false, error: 'act.text is required' };
  if (!(ao.refersTo === null || typeof ao.refersTo === 'string')) {
    return { ok: false, error: 'act.refersTo must be a string or null' };
  }
  if (!(b.sanctuary === undefined || typeof b.sanctuary === 'boolean')) {
    return { ok: false, error: 'sanctuary must be a boolean' };
  }

  /* ⭐ THE DECLARED LATITUDE. ⛔ Absence is the protective default, never a
     wildcard — and a MALFORMED declaration is refused rather than coerced,
     because silently reading an unrecognised value as "the safe one" would
     hide a broken surface until the day it sent something permissive. */
  let scope: EditorialScopeDeclaration = DEFAULT_SCOPE_DECLARATION;
  /* ⛔ Absence is not release — the discussion-first order is the default. */
  let mayProposeImmediately = false;
  if (b.scope !== undefined) {
    if (typeof b.scope !== 'object' || b.scope === null || Array.isArray(b.scope)) {
      return { ok: false, error: 'scope must be an object' };
    }
    const so = b.scope as Record<string, unknown>;
    const strayScope = Object.keys(so).filter(
      (k) => !(SCOPE_KEYS as readonly string[]).includes(k));
    if (strayScope.length) {
      return { ok: false, error: `unknown scope field(s): ${strayScope.join(', ')}` };
    }
    if (so.latitude !== undefined && !isEditorialLatitude(so.latitude)) {
      return { ok: false, error: 'scope.latitude must be an integer 1 through 5' };
    }
    if (!(so.mayRemoveParagraphs === undefined || typeof so.mayRemoveParagraphs === 'boolean')) {
      return { ok: false, error: 'scope.mayRemoveParagraphs must be a boolean' };
    }
    if (!(so.mayProposeImmediately === undefined || typeof so.mayProposeImmediately === 'boolean')) {
      return { ok: false, error: 'scope.mayProposeImmediately must be a boolean' };
    }
    mayProposeImmediately = so.mayProposeImmediately === true;
    scope = {
      latitude: so.latitude === undefined
        ? DEFAULT_SCOPE_DECLARATION.latitude : so.latitude,
      /* ⛔ `=== true`, so any other value is refused permission rather than
         truthy-coerced into it. */
      mayRemoveParagraphs: so.mayRemoveParagraphs === true,
    };
  }

  return {
    ok: true,
    threadId: b.threadId,
    /* ⛔ The member's text is carried EXACTLY. No trim, no normalisation. */
    act: { act: ao.act as MemberActKind, text: ao.text, refersTo: ao.refersTo ?? null },
    sanctuary: b.sanctuary === true,
    externalProcessing: b.externalProcessing as 'anthropic' | undefined,
    scope,
    mayProposeImmediately,
  };
}

export async function POST(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  /* ⭐ THE ONE MINT. Everything downstream uses this object. */
  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }); }

  const parsed = parseClosed(raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  /* ⛔⛔ BEFORE ANY WRITE. */
  const posture = TurnPosture.resolve({ sanctuary: parsed.sanctuary });
  if (posture.sanctuary) {
    return NextResponse.json({
      error: 'sanctuary_unavailable',
      detail: 'Editorial work is durable by construction, and no ephemeral editorial mode has been ruled. '
        + 'Nothing was written.',
    }, { status: 409 });
  }

  if (parsed.externalProcessing !== 'anthropic') {
    return NextResponse.json({ error: 'external_authorization_required',
      detail: 'Choose whether to send this passage and its editorial context to Anthropic. Nothing was sent or saved.' }, { status: 409 });
  }
  const memberId = identity.memberId;

  const act = await persistMemberEditorialAct({ memberId, threadId: parsed.threadId, act: parsed.act });
  if (!act.ok) {
    const status = act.reason === 'thread_not_found' ? 404 : 400;
    return NextResponse.json({ error: act.reason }, { status });
  }

  const turn = await runEditorialTurn({
    /* ⭐ THE SAME MINTED OBJECT. ⛔ No second identity crosses this boundary. */
    identity,
    threadId: parsed.threadId,
    currentTurnIndex: act.turnIndex,
    declaredAct: parsed.act.act,
    currentDirectionId: act.direction?.id ?? null,
    /* ⭐ Server-minted act identity. ⛔ Never supplied by the client. */
    exchangeId: randomUUID(),
    sanctuary: false,
    externalProcessing: parsed.externalProcessing,
    posture,
    /* ⭐ The author's declaration, carried to the one place that enforces it. */
    scope: parsed.scope,
    mayProposeImmediately: parsed.mayProposeImmediately,
  });

  if (!turn.ok) {
    /* ⭐ The member's act STANDS — it was theirs and it persisted. Only MAIA's
       turn failed, and the response says exactly that rather than implying the
       whole exchange is gone. */

    /* ⭐⭐ A SCOPE REFUSAL IS NOT A SERVER FAULT AND MUST NOT WEAR ONE.
     *
     * 502 says *something went wrong*. This went RIGHT: the author set a
     * latitude, MAIA exceeded it, and the system held the line. 409 says
     * *refused, and here is why* — with the counts, so the writer learns which
     * control to move instead of being handed a screen of their own words
     * struck through and asked to police it.
     *
     * ⛔ The refused wording is NOT returned. A refusal is not an occasion to
     * disclose the thing that was refused. */
    /* ⭐ Both scope and voice are the same KIND of outcome: the writer drew a
       line and the system held it. ⛔ Neither is a server fault. */
    /* ⭐ Scope, voice and sequence are one KIND of outcome: the writer drew a
       line and the system held it. ⛔ None of them is a server fault. */
    const scopeRefused = turn.scope !== undefined || turn.voice !== undefined
      || turn.reason === 'sequence_discussion_first';
    return NextResponse.json({
      threadId: parsed.threadId,
      memberTurnIndex: act.turnIndex,
      direction: act.direction ? { id: act.direction.id } : null,
      error: turn.reason,
      ...(turn.voice ? { voice: {
        note: turn.voice.note, unfamiliar: turn.voice.unfamiliar,
        sampleWords: turn.voice.sampleWords,
      } } : {}),
      /* ⭐ THE REFUSAL NAMES ITSELF, INCLUDING WHEN IT IS NOT A SCOPE REFUSAL.
       *
       * `structured_refused` carries the seam's own code as its detail — one of
       * `invalid_inference_mode` · `structured_inference_unavailable` ·
       * `not_configured` · `provider_unavailable`. Gating `detail` on
       * `scopeRefused` discarded exactly the word that distinguishes a
       * misconfigured deployment from an unreachable provider, and nothing logs
       * it, so a 502 was unattributable from either side.
       *
       * ⛔ Still never content: every detail on this path is a fixed code, a
       * model name, or the writer-facing refusal sentence. ⛔ No authored prose,
       * no candidate wording. A refusal is not an occasion to disclose. */
      ...(turn.detail !== undefined ? { detail: turn.detail } : {}),
      ...(turn.scope ? {
        scope: {
          declared: parsed.scope,
          authorWords: turn.scope!.measure.authorWords,
          wouldRemoveWords: turn.scope!.measure.removedWords,
          longestUnbrokenCut: turn.scope!.measure.longestContiguousRemoved,
          wholeParagraphsRemoved: turn.scope!.measure.droppedParagraphs.length,
          wouldPassAtLatitude: turn.scope!.wouldPassAtLatitude,
        },
      } : {}),
    }, { status: scopeRefused ? 409 : 502 });
  }

  /* ⛔ THIN. No StructuredRequest, no systemPrompt, no EditorialInvocation, no
     provider blocks, no MIPA proof. Those exist to ESTABLISH the act, not to
     become the client API. */
  return NextResponse.json({
    threadId: parsed.threadId,
    memberTurnIndex: act.turnIndex,
    maiaTurnIndex: turn.persisted.turnIndex,
    response: turn.persisted.reply,
    direction: turn.persisted.direction ? { id: turn.persisted.direction.id } : null,
    version: turn.persisted.version ? { id: turn.persisted.version.id } : null,
    /* ⭐⭐ WHAT THE SUGGESTION BROUGHT IN THAT IS NOT THE WRITER'S.
     *
     * ⛔ Carried on SUCCESS, deliberately. It is a thing to notice, not a thing
     * to fail — and for a writer still finding their voice, noticing in time is
     * the whole of the protection. */
    voice: turn.voice,
  });
}
