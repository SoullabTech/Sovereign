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
import { preflightEditorialRelationshipCarriage, resolvePriorMaiaEditorialCarry, type ResolvedPriorMaiaEditorialCarry } from '@/lib/writers-studio/relationshipCarriage';
import {
  DEFAULT_SCOPE_DECLARATION, isEditorialLatitude,
  type EditorialScopeDeclaration,
} from '@/lib/manuscript/editorialScope/contract';
import type { ProposalPolicy } from '@/lib/manuscript/editorialScope/sequence';
import { isReplyLength, type EditorialDepth, type ReplyLength } from '@/lib/writersStudio/editorialDepth';
import { isTeachingAnchor, type TeachingAnchor } from '@/lib/writersStudio/teachingTurn';
import { isTurnShape, type TurnShape } from '@/lib/writersStudio/conversationTurn';
import { isPassageAct, type PassageAct } from '@/lib/writersStudio/passageActs';
import { isArrivalOriginRef, type ArrivalOrigin, type ArrivalOriginRef } from '@/lib/writersStudio/arrivalOrigin';
import { resolveArrivalOrigin } from '@/lib/writersStudio/arrivalOriginServer';
import { OPENING_GESTURE } from '@/lib/writersStudio/conversationOpening';
import { query } from '@/lib/db/postgres';

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
const TOP_KEYS = [
  'threadId', 'act', 'sanctuary', 'scope', 'proposalPolicy', 'responseDepth', 'relationshipId', 'carry',
  'teachingAnchor', 'turnShape', 'passageAct', 'opening', 'replyLength', 'origin',
] as const;
const CARRY_KEYS = ['kind', 'sourceEpisodeSequence'] as const;
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
      /** ⛔ null ONLY for an opening: MAIA speaks first and the writer has said nothing. */
      act: { act: MemberActKind; text: string; refersTo: string | null } | null;
      /** R2 / O1(a): the writer's deliberate gesture, recorded as a typed event, never as words. */
      opening: boolean;
      sanctuary: boolean;
      scope: EditorialScopeDeclaration;
      relationshipId: string;
      carry: { kind: 'prior_maia_editorial_turn'; sourceEpisodeSequence: number } | null;
      /** ⭐ The writer's PER-WORK release of the sequence gate. ⛔ Default false. */
      mayProposeImmediately: boolean;
      /** Turn-local outcome vocabulary. ⛔ Defaults to allow. */
      proposalPolicy: ProposalPolicy;
      responseDepth: EditorialDepth;
      /** Which teaching shape MAIA answers in (F1). ⛔ A closed value, never instruction text. */
      teachingAnchor: TeachingAnchor | null;
      /** Design 3C: the free Ask box's conversational shape. ⛔ A closed value, never instruction text. */
      turnShape: TurnShape | null;
      /** Conversation-first Focus step 1: which card the writer pressed. ⛔ A closed value, never instruction text. */
      passageAct: PassageAct | null;
      /** The writer's own length choice. ⛔ A closed value, never instruction text. */
      replyLength: ReplyLength | null;
      /** Where the writer arrived from (F1). ⛔ Identities only; the server loads the observation. */
      origin: ArrivalOriginRef | null;
    }
  | { ok: false; error: string };

function parseClosed(body: unknown): Parsed {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'a JSON object is required' };
  }
  const b = body as Record<string, unknown>;
  if (!(b.replyLength === undefined || isReplyLength(b.replyLength))) {
    return { ok: false, error: 'replyLength must be shorter or fuller' };
  }
  const replyLength: ReplyLength | null = b.replyLength === undefined ? null : b.replyLength;
  const strayTop = Object.keys(b).filter((k) => !(TOP_KEYS as readonly string[]).includes(k));
  if (strayTop.length) {
    return { ok: false, error: `unknown field(s): ${strayTop.join(', ')} — these are server facts and carry no standing here` };
  }
  /* SANCTUARY-EDITORIAL-PERSISTENCE-01 / E1 — posture is REQUIRED, and it is
     checked before the act is examined. A member turn is durable (ask_turns +
     editorial_turn_bindings); absence or a malformed value is an UNRESOLVED
     posture, never ordinary. The route maps this to 400 posture_required. */
  if (typeof b.sanctuary !== 'boolean') {
    return { ok: false, error: 'posture_required' };
  }
  if (typeof b.threadId !== 'string' || b.threadId.length === 0) {
    return { ok: false, error: 'threadId is required' };
  }
  if (typeof b.relationshipId !== 'string' || b.relationshipId.length === 0) {
    return { ok: false, error: 'relationship_required' };
  }

  /* R2 "MAIA opens": an exclusive request shape. No act, no card, no shape, no carry. */
  if (b.opening !== undefined) {
    if (b.opening !== true) return { ok: false, error: 'opening must be true' };
    const clash = (['act', 'passageAct', 'teachingAnchor', 'turnShape', 'carry', 'origin'] as const)
      .filter((k) => b[k] !== undefined);
    if (clash.length) return { ok: false, error: `opening is exclusive with: ${clash.join(', ')}` };
    if (!(b.proposalPolicy === undefined || b.proposalPolicy === 'reply_only')) {
      return { ok: false, error: 'an opening is reply_only' };
    }
    let openScope: EditorialScopeDeclaration = DEFAULT_SCOPE_DECLARATION;
    if (b.scope !== undefined) {
      if (typeof b.scope !== 'object' || b.scope === null || Array.isArray(b.scope)) {
        return { ok: false, error: 'scope must be an object' };
      }
      const so = b.scope as Record<string, unknown>;
      const stray = Object.keys(so).filter((k) => !(SCOPE_KEYS as readonly string[]).includes(k));
      if (stray.length) return { ok: false, error: `unknown scope field(s): ${stray.join(', ')}` };
      if (so.latitude !== undefined && !isEditorialLatitude(so.latitude)) {
        return { ok: false, error: 'scope.latitude must be an integer 1 through 5' };
      }
      openScope = {
        latitude: so.latitude === undefined ? DEFAULT_SCOPE_DECLARATION.latitude : so.latitude,
        mayRemoveParagraphs: so.mayRemoveParagraphs === true,
      };
    }
    const depth: EditorialDepth = b.responseDepth === undefined ? 'guided' : b.responseDepth as EditorialDepth;
    if (!(['guided', 'learning', 'direct'] as readonly string[]).includes(depth)) {
      return { ok: false, error: 'responseDepth must be guided, learning, or direct' };
    }
    return {
      ok: true, threadId: b.threadId, act: null, opening: true,
      sanctuary: TurnPosture.resolve(b).sanctuary,
      scope: openScope, relationshipId: b.relationshipId, carry: null,
      mayProposeImmediately: false, proposalPolicy: 'reply_only', responseDepth: depth,
      teachingAnchor: null, turnShape: null, passageAct: null, replyLength, origin: null,
    };
  }

  let carry: { kind: 'prior_maia_editorial_turn'; sourceEpisodeSequence: number } | null = null;
  if (b.carry !== undefined) {
    if (typeof b.relationshipId !== 'string' || b.relationshipId.length === 0) {
      return { ok: false, error: 'relationship_required' };
    }
    if (typeof b.carry !== 'object' || b.carry === null || Array.isArray(b.carry)) {
      return { ok: false, error: 'carry must be an object' };
    }
    const co = b.carry as Record<string, unknown>;
    const strayCarry = Object.keys(co).filter((k) => !(CARRY_KEYS as readonly string[]).includes(k));
    if (strayCarry.length) return { ok: false, error: `unknown carry field(s): ${strayCarry.join(', ')}` };
    if (co.kind !== 'prior_maia_editorial_turn') {
      return { ok: false, error: 'carry.kind must be prior_maia_editorial_turn' };
    }
    if (!Number.isInteger(co.sourceEpisodeSequence) || Number(co.sourceEpisodeSequence) < 1) {
      return { ok: false, error: 'carry.sourceEpisodeSequence must be a positive integer' };
    }
    carry = { kind: 'prior_maia_editorial_turn', sourceEpisodeSequence: Number(co.sourceEpisodeSequence) };
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

  /* ⭐ THE DECLARED LATITUDE. ⛔ Absence is the protective default, never a
     wildcard — and a MALFORMED declaration is refused rather than coerced,
     because silently reading an unrecognised value as "the safe one" would
     hide a broken surface until the day it sent something permissive. */
  let scope: EditorialScopeDeclaration = DEFAULT_SCOPE_DECLARATION;
  /* ⛔ Absence is not release — the discussion-first order is the default. */
  let mayProposeImmediately = false;
  let proposalPolicy: ProposalPolicy = 'allow';
  // Only the explicit writer's requested EXPLANATION register may vary.
  // It NEVER permits a wider Read, revision latitude, or more authored prose.
  const responseDepth: EditorialDepth = b.responseDepth === undefined
    ? 'guided' : b.responseDepth as EditorialDepth;
  if (!(['guided','learning','direct'] as readonly string[]).includes(responseDepth)) {
    return { ok: false, error: 'responseDepth must be guided, learning, or direct' };
  }
  /* F1 (founder ruling 2026-11-02): how a teaching answer is shaped is server-
     owned. The client names the anchor; the instruction never rides in the
     writer's words. ⛔ An unknown anchor is refused, never ignored. */
  if (!(b.teachingAnchor === undefined || isTeachingAnchor(b.teachingAnchor))) {
    return { ok: false, error: 'teachingAnchor must be passage, observation, change, direction, or continue' };
  }
  const teachingAnchor: TeachingAnchor | null = b.teachingAnchor === undefined ? null : b.teachingAnchor;
  /* Design 3C: how a free-box answer is shaped is server-owned, like F1.
     ⛔ An unknown shape is refused, never ignored. */
  if (!(b.turnShape === undefined || isTurnShape(b.turnShape))) {
    return { ok: false, error: 'turnShape must be conversation' };
  }
  const turnShape: TurnShape | null = b.turnShape === undefined ? null : b.turnShape;
  /* One shape per turn: a teaching answer and a free-box answer are different
     instructions, and both landing in `system` would contradict each other. */
  if (teachingAnchor && turnShape) {
    return { ok: false, error: 'teachingAnchor and turnShape are exclusive' };
  }
  /* Step 1 of the conversation-first Focus: a card's instruction is server-owned, as
     for Teach me (F1). ⛔ Unknown acts are refused; one shape per turn. */
  if (!(b.passageAct === undefined || isPassageAct(b.passageAct))) {
    return { ok: false, error: 'passageAct is not a known card' };
  }
  const passageAct: PassageAct | null = b.passageAct === undefined ? null : b.passageAct;
  if (!(b.origin === undefined || isArrivalOriginRef(b.origin))) {
    return { ok: false, error: 'origin must be { source, readingId, observationKey }' };
  }
  const origin: ArrivalOriginRef | null = b.origin === undefined ? null : b.origin;
  if (passageAct && (teachingAnchor || turnShape)) {
    return { ok: false, error: 'passageAct, teachingAnchor and turnShape are exclusive' };
  }
  if (b.proposalPolicy !== undefined) {
    if (!(b.proposalPolicy === 'allow' || b.proposalPolicy === 'reply_only')) {
      return { ok: false, error: 'proposalPolicy must be allow or reply_only' };
    }
    proposalPolicy = b.proposalPolicy;
  }
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
    opening: false,
    /* ⭐ Validated as a boolean above; minted from the WHOLE body so a
       contradictory nested affirmative still fails closed to Sanctuary. */
    sanctuary: TurnPosture.resolve(b).sanctuary,
    scope,
    relationshipId: b.relationshipId,
    carry,
    mayProposeImmediately,
    proposalPolicy,
    responseDepth,
    teachingAnchor,
    turnShape,
    passageAct,
    replyLength,
    origin,
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
  if (!parsed.ok) {
    return NextResponse.json(
      parsed.error === 'posture_required' ? { error: 'posture_required', persisted: false } : { error: parsed.error },
      { status: 400 },
    );
  }

  /* ⛔⛔ BEFORE ANY WRITE. */
  const posture = TurnPosture.resolve({ sanctuary: parsed.sanctuary });
  if (posture.sanctuary) {
    return NextResponse.json({
      error: 'sanctuary_unavailable',
      persisted: false,
      detail: 'Editorial work is durable by construction, and no ephemeral editorial mode has been ruled. '
        + 'Nothing was written.',
    }, { status: 409 });
  }

  const memberId = identity.memberId;

  const relationship = await preflightEditorialRelationshipCarriage({
    memberId,
    relationshipId: parsed.relationshipId,
    threadId: parsed.threadId,
  });
  if (!relationship.ok) {
    const status = relationship.reason === 'relationship_not_found' ? 404 : 409;
    return NextResponse.json({ error: relationship.reason, persisted: false }, { status });
  }

  let resolvedCarry: ResolvedPriorMaiaEditorialCarry | undefined;
  if (parsed.carry !== null) {
    const carry = await resolvePriorMaiaEditorialCarry({
      memberId,
      relationshipId: parsed.relationshipId,
      receiverThreadId: parsed.threadId,
      sourceEpisodeSequence: parsed.carry.sourceEpisodeSequence,
    });
    if (!carry.ok) {
      const notFound = carry.reason === 'relationship_not_found'
        || carry.reason === 'source_episode_not_found'
        || carry.reason === 'source_thread_invalid'
        || carry.reason === 'source_turn_not_found';
      return NextResponse.json({ error: carry.reason, persisted: false }, { status: notFound ? 404 : 409 });
    }
    resolvedCarry = carry.carry;
  }

  if (parsed.opening) {
    /* R2: a deliberate gesture, once per opened conversation. ⛔ ANY existing turn
       refuses, before any model call — nothing here may add a second opening. */
    const owned = await query<{ turns: string }>(
      `SELECT (SELECT count(*) FROM ask_turns WHERE thread_id = th.id)::text AS turns
         FROM ask_threads th WHERE th.id = $1 AND th.member_id = $2`,
      [parsed.threadId, memberId]);
    if (owned.rows.length === 0) {
      return NextResponse.json({ error: 'thread_not_found', persisted: false }, { status: 404 });
    }
    if (Number(owned.rows[0]!.turns) !== 0) {
      return NextResponse.json({ error: 'opening_thread_not_new', persisted: false }, { status: 409 });
    }
    const opened = await runEditorialTurn({
      identity,
      threadId: parsed.threadId,
      relationshipId: parsed.relationshipId,
      currentTurnIndex: 0,
      declaredAct: 'discourse',
      currentDirectionId: null,
      exchangeId: randomUUID(),
      sanctuary: false,
      scope: parsed.scope,
      mayProposeImmediately: false,
      proposalPolicy: 'reply_only',
      responseDepth: parsed.responseDepth,
      ...(parsed.replyLength ? { replyLength: parsed.replyLength } : {}),
      opening: { gesture: OPENING_GESTURE },
    });
    if (!opened.ok) {
      const refusedByLaw = opened.reason === 'disclosure_unavailable'
        || opened.reason === 'relationship_refused' || opened.reason === 'proposal_policy_reply_only'
        || opened.reason === 'sequence_discussion_first' || opened.reason === 'relationship_scope_unmeasured';
      if (!refusedByLaw) {
        console.error('[editorial/turn] opening refused', {
          reason: opened.reason, dispatch: opened.dispatch ?? 'not_applicable', threadId: parsed.threadId,
        });
      }
      return NextResponse.json({
        threadId: parsed.threadId, persisted: false, opening: true, error: opened.reason,
        ...(opened.dispatch ? { dispatch: opened.dispatch } : {}),
      }, { status: refusedByLaw ? 409 : opened.reason === 'disclosure_confirmation_unresolved' ? 500 : 502 });
    }
    return NextResponse.json({
      threadId: parsed.threadId,
      opening: true,
      memberTurnIndex: null,
      persisted: true,
      maiaTurnIndex: opened.persisted.turnIndex,
      response: opened.persisted.reply,
      direction: null,
      version: null,
      voice: null,
    });
  }

  /* F1: the arrival framing rests on the member's own frozen reading, resolved before
     anything is written. ⛔ An unresolvable reference refuses; it is never sent on as text. */
  let arrivalOrigin: ArrivalOrigin | undefined;
  if (parsed.origin !== null) {
    const resolved = await resolveArrivalOrigin({ memberId, threadId: parsed.threadId, ref: parsed.origin });
    if (!resolved) return NextResponse.json({ error: 'origin_not_found', persisted: false }, { status: 404 });
    arrivalOrigin = resolved;
  }

  const act = await persistMemberEditorialAct({ memberId, threadId: parsed.threadId, act: parsed.act! });
  if (!act.ok) {
    const status = act.reason === 'thread_not_found' ? 404 : 400;
    return NextResponse.json({ error: act.reason }, { status });
  }

  const turn = await runEditorialTurn({
    /* ⭐ THE SAME MINTED OBJECT. ⛔ No second identity crosses this boundary. */
    identity,
    threadId: parsed.threadId,
    relationshipId: parsed.relationshipId,
    ...(resolvedCarry ? { carry: resolvedCarry } : {}),
    currentTurnIndex: act.turnIndex,
    declaredAct: parsed.act!.act,
    currentDirectionId: act.direction?.id ?? null,
    /* ⭐ Server-minted act identity. ⛔ Never supplied by the client. */
    exchangeId: randomUUID(),
    sanctuary: false,
    /* ⭐ The author's declaration, carried to the one place that enforces it. */
    scope: parsed.scope,
    mayProposeImmediately: parsed.mayProposeImmediately,
    proposalPolicy: parsed.proposalPolicy,
    responseDepth: parsed.responseDepth,
    ...(parsed.teachingAnchor ? { teachingAnchor: parsed.teachingAnchor } : {}),
    ...(parsed.turnShape ? { turnShape: parsed.turnShape } : {}),
    ...(parsed.passageAct ? { passageAct: parsed.passageAct } : {}),
    ...(parsed.replyLength ? { replyLength: parsed.replyLength } : {}),
    ...(arrivalOrigin ? { arrivalOrigin } : {}),
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
      || turn.reason === 'sequence_discussion_first'
      || turn.reason === 'proposal_policy_reply_only'
      || turn.reason === 'noop_editorial_adjustment'
      || turn.reason === 'relationship_scope_unmeasured'
      || turn.reason === 'relationship_refused';;
    /* ⭐ A DISCLOSURE REFUSAL IS ALSO NOT A SERVER FAULT — and not a scope
       refusal either, so it gets its own name rather than being folded into one.
       Authorization or accountability for the crossing could not be established,
       and nothing was sent. ⛔ 502 would blame the provider for a line this
       system drew before reaching it. */
    const disclosureRefused = turn.reason === 'disclosure_unavailable';
    const accountabilityUnresolved = turn.reason === 'disclosure_confirmation_unresolved';
    const safeDetail = scopeRefused || disclosureRefused
      ? turn.detail
      : turn.reason === 'structured_refused'
        ? turn.detail
        : turn.reason === 'model_unattributable'
          ? 'model_attribution_unverified'
          : accountabilityUnresolved
            ? 'provider_disclosure_confirmation_unresolved'
            : undefined;
    /* ⭐ THE DIAGNOSTIC THAT WAS MISLEADING, CORRECTED.
     *
     * `detail` is withheld from the RESPONSE for non-scope refusals, and that is
     * right: a refusal is not an occasion to disclose provider internals to a
     * member. ⚠️ But withholding it from the SERVER too left `structured_refused`
     * arriving as a bare four-value class with the one field that distinguishes
     * its causes stripped — an operator could not tell a missing key from a
     * rejected schema from a timeout. ⭐ The record is now written where
     * operators read and members do not. */
    if (!scopeRefused && !disclosureRefused) {
      console.error('[editorial/turn] refused', {
        reason: turn.reason,
        detail: safeDetail ?? 'redacted',
        dispatch: turn.dispatch ?? 'not_applicable',
        threadId: parsed.threadId,
        memberTurnIndex: act.turnIndex,
      });
    }
    return NextResponse.json({
      threadId: parsed.threadId,
      memberTurnIndex: act.turnIndex,
      persisted: true,
      direction: act.direction ? { id: act.direction.id } : null,
      error: turn.reason,
      /* ⭐ SAFE TO RETURN, and the reason the field exists: it reports whether a
         request arrived, never what any provider said. ⛔ It is not `detail` by
         another name. ⚠️ `unknown` is returned as itself — a client that renders
         it as "nothing was sent" would be inventing the certainty this value
         exists to deny. */
      ...(turn.dispatch ? { dispatch: turn.dispatch } : {}),
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
      ...(safeDetail !== undefined ? { detail: safeDetail } : {}),
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
    }, { status: scopeRefused || disclosureRefused ? 409 : accountabilityUnresolved ? 500 : 502 });
  }

  /* ⛔ THIN. No StructuredRequest, no systemPrompt, no EditorialInvocation, no
     provider blocks, no MIPA proof. Those exist to ESTABLISH the act, not to
     become the client API. */
  return NextResponse.json({
    threadId: parsed.threadId,
    memberTurnIndex: act.turnIndex,
    persisted: true,
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
