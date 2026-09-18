/**
 * WS-EDITORIAL-RUNTIME-01 · ER-R4 — THE CANONICAL STRUCTURED HANDOFF.
 *
 * ⭐⭐ THE WHOLE TURN, AND NO NEW SUBSTRATE:
 *
 *   member act already persisted (ER-R1)
 *        ↓  assembleEditorialCognition()            (ER-R2)
 *        ↓  freeze EditorialInvocation
 *        ↓  constructEditorialWriterTurn → MIPA → canonical renderer
 *        ↓  runStructured()  — forced tool contract
 *        ↓  admitEditorialToolEnvelope()
 *        ↓  persistMaiaEditorialOutcome()           (ER-R3)
 *
 * ── FOUR LAWS THIS FILE EXISTS TO KEEP ────────────────────────────────────
 *
 * 1 ⭐⭐ THE CURRENT UTTERANCE COMES FROM THE DURABLE TURN. The request body is
 *   never handed to cognition a second time. ER-R1 already wrote the member's
 *   words; this reads that exact `ask_turns` row back and uses its stored
 *   `body`. ⛔ Otherwise a caller could persist A and think with B, and
 *   `ask_turns` would stop being the authoritative conversation record.
 *
 * 2 ⛔ THE STRUCTURED SEAM, NEVER THE PLAIN TEXT ONE. `runStructured` owns
 *   sovereignty policy and is deliberately non-fallbackable. ⛔ No
 *   `getMaiaResponse`, no `generateText`, and NO FALLBACK TO EITHER when
 *   structured inference refuses — a refusal is the answer.
 *
 * 3 ⭐ EVERY SUPPLIED BLOCK MUST CROSS MIPA AND THE RENDERER. The required set
 *   is what the assembly actually produced, so a silently dropped block refuses
 *   the handoff rather than thinning the prompt.
 *
 * 4 ⭐⭐ THE INVOCATION IS FROZEN BEFORE THE PROVIDER CALL and the same value
 *   goes to persistence. ⛔ No assembly reread after the provider returns.
 */

import { query } from '@/lib/db/postgres';
import { runStructured } from '@/lib/ai/structured/router';
import type { StructuredRequest } from '@/lib/ai/structured/types';
import { constructEditorialWriterTurn, renderEditorialTurn } from '@/lib/writers-studio/canonicalWriterTurn';
import type { MemberIdentity, TierStrategy } from '@/lib/maia/canonical-turn';
import {
  admitEditorialToolEnvelope, EDITORIAL_TOOL_NAME, editorialToolSchema,
  editorialTurnIdentity,
  type EditorialInvocation, type MemberActKind, type OutcomeRefusal,
} from '../editorialDiscourse/contract';
import { assembleEditorialCognition, type AssemblyRefusal } from './assembly';
import { persistMaiaEditorialOutcome, type MaiaOutcomeRefusal, type MaiaOutcomeResult } from './maiaOutcome';

/** ⭐ The capability owns its model pin. ⛔ Never chosen by HTTP. */
export const EDITORIAL_MODEL = process.env.MAIA_EDITORIAL_MODEL || 'claude-opus-5';
const MAX_TOKENS = 4096;

/** ⛔ VERIFIED ONLY. An editorial act has no anonymous or guest form. */
export type VerifiedIdentity = Extract<MemberIdentity, { status: 'verified' }>;

/**
 * ⭐⭐ THE CAPABILITY OWNS ITS COGNITION TIER.
 *
 * ⛔ Not a parameter. HTTP cannot select it — but more importantly no later
 * SERVER caller can either, without deliberately editing this file. A tier
 * accepted from a caller is a tier some caller will eventually choose.
 */
const EDITORIAL_STRATEGY: TierStrategy = { tier: 'CORE' };

export interface EditorialTurnInput {
  /**
   * ⭐⭐ ONE IDENTITY, NOT TWO. The member id is DERIVED from the minted
   * identity below.
   *
   * ⛔ An earlier cut took `memberId` AND `identity`, which is two potentially
   * divergent answers to *who is acting* — the same defect class as the second
   * succession resolver and the duplicated act vocabulary, at the identity
   * boundary. ⭐ There is now no parallel identity truth to disagree with.
   */
  readonly identity: VerifiedIdentity;
  readonly threadId: string;
  /** The turn ER-R1 just persisted. ⛔ Its BODY is read from the database, not passed. */
  readonly currentTurnIndex: number;
  readonly declaredAct: MemberActKind;
  readonly currentDirectionId: string | null;
  readonly exchangeId: string;
  readonly sanctuary: boolean;
}

export type EditorialTurnRefusal =
  | AssemblyRefusal
  | 'current_turn_not_found'
  /** ⛔ A supplied candidate did not survive MIPA or the renderer. */
  | 'handoff_unproven'
  | OutcomeRefusal
  | MaiaOutcomeRefusal
  /**
   * ⭐⭐ THE PROVIDER DID NOT SAY WHICH MODEL ANSWERED, or said a different one.
   * ⛔ Writer's Studio will not attribute authorship it cannot name.
   */
  | 'model_unattributable'
  /** The structured seam refused. ⛔ There is no fallback below this. */
  | 'structured_refused';

export type EditorialTurnResult =
  | {
      readonly ok: true;
      readonly invocation: EditorialInvocation;
      readonly request: StructuredRequest;
      readonly persisted: Extract<MaiaOutcomeResult, { ok: true }>;
    }
  | { readonly ok: false; readonly reason: EditorialTurnRefusal; readonly detail?: string };

export async function runEditorialTurn(
  input: EditorialTurnInput,
): Promise<EditorialTurnResult> {
  /* ⭐ DERIVED, never accepted. */
  const memberId: string = input.identity.memberId;
  const { threadId, currentTurnIndex } = input;

  /* 1 ⭐⭐ THE DURABLE TURN IS THE UTTERANCE. */
  const t = await query<{ body: string }>(
    `SELECT body FROM ask_turns tu
       JOIN ask_threads th ON th.id = tu.thread_id
      WHERE tu.thread_id = $1 AND tu.turn_index = $2
        AND tu.speaker = 'author' AND th.member_id = $3`,
    [threadId, currentTurnIndex, memberId]);
  if (t.rows.length === 0) return { ok: false, reason: 'current_turn_not_found' };
  const utterance = t.rows[0]!.body;

  /* 2 · assemble */
  const assembly = await assembleEditorialCognition({
    memberId, threadId, currentTurnIndex,
    declaredAct: input.declaredAct, currentDirectionId: input.currentDirectionId,
  });
  if (!assembly.ok) return { ok: false, reason: assembly.reason };

  /* 3 ⭐⭐ FREEZE. Everything after this uses THIS object. */
  const invocation: EditorialInvocation = {
    chainId: assembly.chainId,
    threadId,
    authoredAgainstVersionId: assembly.invokedAgainstVersionId,
  };

  /* 4 · canonical turn → MIPA → renderer, proving every supplied block crossed */
  /* ⭐ `constructCanonicalTurn` adjudicates internally — MIPA runs inside the
     constructor, so the turn that comes back already carries its admitted
     membership. ⛔ Calling `adjudicateParticipation` again here would be a
     second adjudication of the same turn. */
  /* ⭐ THE RULED HELPER decides thread identity — `sessionRef = threadId`,
     `turnId = exchangeId`. ⛔ Not an equivalent value handed in by a caller. */
  const ids = editorialTurnIdentity(threadId, input.exchangeId);
  const turn = constructEditorialWriterTurn({
    identity: input.identity, sessionRef: ids.sessionRef, exchangeId: ids.turnId,
    ask: utterance, sanctuary: input.sanctuary,
  }, assembly.blocks);
  const proof = renderEditorialTurn(turn, EDITORIAL_STRATEGY, assembly.blocks.map((b) => b.producerId));
  if (!proof) return { ok: false, reason: 'handoff_unproven' };

  /* 5 ⛔ THE STRUCTURED SEAM. No fallback exists below this call. */
  const request: StructuredRequest = {
    model: EDITORIAL_MODEL,
    system: proof.systemPrompt,
    messages: [{ role: 'user', content: utterance }],
    maxTokens: MAX_TOKENS,
    tools: [{ name: EDITORIAL_TOOL_NAME, inputSchema: editorialToolSchema, schemaEnforcement: 'required',
      description: 'Return exactly one editorial outcome. For a proposal use this nested shape: '
        + '{"kind":"reply_with_proposal","reply":"Your explanation","proposal":{"replacementText":"Exact candidate wording","rationale":"Editorial purpose: Short name. Reason"}}. '
        + 'proposal is an OBJECT, never a string. replacementText and rationale belong INSIDE proposal, never at the top level. '
        + 'For discussion without wording use {"kind":"reply_only","reply":"Your answer"}. '
        + 'Omit unused proposal/direction fields entirely; do not send null or both adjuncts.' }],
    toolChoice: { type: 'tool', name: EDITORIAL_TOOL_NAME },
  };
  const structured = await runStructured(request);
  if (!structured.ok) {
    return { ok: false, reason: 'structured_refused', detail: structured.refusal };
  }

  /* 6 ⛔ ADMISSION. A refusal here reaches no transaction, and prose is never
     inspected afterwards to rescue it. */
  /* ⭐⭐ ATTRIBUTION BEFORE ADMISSION — the Writer's Studio acceptance rule.
   *
   * The shared seam REPORTS the facts (`model` requested/sent · `reportedModel`
   * as the provider named it · `modelAgreement` derived). ⭐ It does not judge
   * them, and it should not: other callers may lawfully tolerate a substitution.
   *
   * ⛔ THIS CAPABILITY DOES NOT. A durable MAIA turn is an attribution of
   * authorship, and an editorial act attributed to a model the provider did not
   * name — or named differently — is an attribution nobody can stand behind.
   * ⛔ Refused BEFORE admission, so nothing is admitted and nothing is written.
   */
  const { reportedModel, modelAgreement } = structured.result.provenance;
  if (reportedModel === null || modelAgreement !== 'agreed') {
    return {
      ok: false, reason: 'model_unattributable',
      detail: `requested=${structured.result.provenance.model} reported=${reportedModel ?? 'none'} agreement=${modelAgreement}`,
    };
  }

  const admission = admitEditorialToolEnvelope(structured.result.content);
  if (!admission.ok) return { ok: false, reason: admission.reason };

  /* 7 · persist, with the provenance of the answer that ACTUALLY came back */
  const persisted = await persistMaiaEditorialOutcome({
    memberId, invocation, outcome: admission.outcome,
    /* ⭐ ALL THREE FACTS, and `model` keeps its governed meaning:
       requested and SENT. ⛔ It is not redefined to mean "what answered" — that
       is `reportedModel`, and their relation is `modelAgreement`. */
    answerProvenance: {
      provider: structured.result.provenance.provider,
      model: structured.result.provenance.model,
      reportedModel,
      modelAgreement,
      latencyMs: structured.result.provenance.latencyMs,
      usage: structured.result.usage,
      runtime: 'ws-editorial-runtime-01/er-r4',
    },
  });
  if (!persisted.ok) return { ok: false, reason: persisted.reason, detail: persisted.detail };

  return { ok: true, invocation, request, persisted };
}
