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
 *        ↓  ⭐ judgeProposalScope()                  (WS-EDITORIAL-SCOPE-01)
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
 *
 * 5 ⭐⭐ A PROPOSAL IS AN EDIT OF THE AUTHOR'S PASSAGE, NOT A REPLACEMENT OF IT.
 *   The author declares an editing latitude; MAIA is told it; and what comes
 *   back is MEASURED against the frozen locus before anything is written.
 *   ⛔ A proposal beyond the latitude refuses the whole turn — it is never
 *   trimmed, never downgraded to a reply, and never shown to the author as
 *   strike-through over their own words for them to police.
 */

import { query } from '@/lib/db/postgres';
import { runStructured } from '@/lib/ai/structured/router';
import type { StructuredRequest } from '@/lib/ai/structured/types';
import { constructEditorialWriterTurn, renderEditorialTurn } from '@/lib/writers-studio/canonicalWriterTurn';
import type { CandidateBlock, MemberIdentity, TierStrategy } from '@/lib/maia/canonical-turn';
import { buildTeachingRuntimeBridge } from '@/lib/maia/teaching/TeachingRuntimeBridge';
import {
  admitEditorialToolEnvelope, EDITORIAL_TOOL_NAME, editorialToolSchema,
  editorialTurnIdentity,
  type EditorialInvocation, type MemberActKind, type OutcomeRefusal,
} from '../editorialDiscourse/contract';
import {
  DEFAULT_SCOPE_DECLARATION, judgeProposalScope, latitudeInstruction,
  type EditorialScopeDeclaration, type ScopeRefusal, type ScopeMeasure,
} from '../editorialScope/contract';
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
  /**
   * ⭐⭐ THE AUTHOR'S DECLARED EDITING LATITUDE for this exchange.
   *
   * ⛔ Absence is not permission: it resolves to `DEFAULT_SCOPE_DECLARATION`,
   * which is the most protective setting available. A caller that forgets the
   * field gets "Touch" and no paragraph removal — never the other way round.
   */
  readonly scope?: EditorialScopeDeclaration;
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
  | 'structured_refused'
  /**
   * ⭐⭐ THE PROPOSAL EXCEEDED THE AUTHOR'S DECLARED LATITUDE.
   * ⛔ Nothing was written, and the wording is not shown.
   */
  | ScopeRefusal;

export type EditorialTurnResult =
  | {
      readonly ok: true;
      readonly invocation: EditorialInvocation;
      readonly request: StructuredRequest;
      readonly persisted: Extract<MaiaOutcomeResult, { ok: true }>;
    }
  | {
      readonly ok: false;
      readonly reason: EditorialTurnRefusal;
      readonly detail?: string;
      /** ⭐ Present only on a scope refusal, so the writer can be told in counts. */
      readonly scope?: { readonly measure: ScopeMeasure; readonly wouldPassAtLatitude: number | null };
    };

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

  // 🎓 T8A — teaching is a named, governed participant in the existing Writer cognition seam.
  // It is computed only from this durable current utterance and expires with this turn.
  const teaching = buildTeachingRuntimeBridge({
    surface: 'writers_studio',
    route: 'writers_studio_editorial',
    context: 'writers_studio',
    audience: 'writer',
    domainKey: 'writing_rhetoric',
    message: utterance,
    interactionId: threadId,
    turnId: input.exchangeId,
  });
  const teachingBlocks: CandidateBlock[] = teaching.active
    ? [{ producerId: 'computed.teaching_intelligence', text: teaching.directive }]
    : [];
  const cognitionBlocks: CandidateBlock[] = [...assembly.blocks, ...teachingBlocks];

  /* ⭐ The author's declaration, resolved ONCE and used for both the
     instruction MAIA is given and the law her answer is judged by. ⛔ Two
     resolutions could disagree, and the one that governs must be the one she
     was told about. */
  const scope: EditorialScopeDeclaration = input.scope ?? DEFAULT_SCOPE_DECLARATION;

  /* 3 ⭐⭐ FREEZE. Everything after this uses THIS object. */
  const invocation: EditorialInvocation = {
    chainId: assembly.chainId,
    threadId,
    authoredAgainstVersionId: assembly.invokedAgainstVersionId,
    /* ⭐⭐ The words the scope law will measure against. ⛔ Never re-read. */
    locusText: assembly.locusText,
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
  }, cognitionBlocks);
  const proof = renderEditorialTurn(turn, EDITORIAL_STRATEGY, cognitionBlocks.map((b) => b.producerId));
  if (!proof) return { ok: false, reason: 'handoff_unproven' };

  /* 5 ⛔ THE STRUCTURED SEAM. No fallback exists below this call. */
  const request: StructuredRequest = {
    model: EDITORIAL_MODEL,
    /* ⭐ THE LATITUDE IS STATED TO HER, as a courtesy so a refusal is the
       exception rather than the routine. ⛔ It is NOT the enforcement — every
       sentence of it is also a bound checked below on what actually comes
       back, and deleting this line would not change what is permitted. */
    system: `${proof.systemPrompt}\n\n${latitudeInstruction(scope)}`,
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

  /* 6b ⭐⭐ THE SCOPE LAW — WS-EDITORIAL-SCOPE-01.
   *
   * ⛔ A SECOND ADMISSION CONDITION, DELIBERATELY ITS OWN GATE. The first proved
   * the ENVELOPE was well formed; this proves the PROPOSAL is an edit of the
   * author's passage rather than a replacement of it. They are different
   * questions with different inputs — the first needs only MAIA's answer, this
   * one needs the author's words — and merging them would have made the
   * envelope admitter depend on the Work.
   *
   * ⭐ MEASURED AGAINST THE FROZEN LOCUS, so she is judged against exactly what
   * she was shown.
   *
   * ⛔⛔ AND THE WHOLE TURN IS REFUSED, NOT REPAIRED. It would be easy here to
   * keep `reply` and drop the proposal — and that would be the system authoring
   * MAIA's act, which is the member-side anti-classification law read from the
   * other end. She proposed; the proposal was not permitted; nothing of hers is
   * kept and nothing of the author's is shown struck through. The member's own
   * act already persisted and still stands.
   */
  if (admission.outcome.kind === 'reply_with_proposal') {
    const verdict = judgeProposalScope(
      invocation.locusText, admission.outcome.proposal.replacementText, scope);
    if (!verdict.ok) {
      return {
        ok: false, reason: verdict.reason, detail: verdict.detail,
        scope: { measure: verdict.measure, wouldPassAtLatitude: verdict.wouldPassAtLatitude },
      };
    }
  }

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
