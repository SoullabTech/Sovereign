/**
 * W5-1 — THE EDITORIAL ONTOLOGY CONTRACT. ⛔ PURE. No schema, no migration, no
 * persistence, no runtime. Types and laws only; W5 proper writes the schema.
 *
 * ⭐⭐ THE SENTENCE OVER ALL OF IT (founder, 2026-09-14):
 *
 *     The conversation may disappear, the insight may exist without an edit,
 *     and the discussion may refer anywhere — but only an authored candidate
 *     formulation can ever cross into authorization.
 *
 * ── THE FIVE OBJECTS AND THE ONE THAT CAN BE AUTHORIZED ────────────────────
 *
 *     Insight        MAIA-authored observation      ⛔ never wording
 *     Direction      an authored instruction        ⛔ never wording, governs nothing
 *     Discourse      ask_threads / ask_turns        ⛔ never wording
 *     Suggestion     ProposalVersion                ⭐ THE ONLY AUTHORIZABLE CONTENT
 *     Authorization  RevisionAuthorization          unchanged
 */

import type { ProposalVersion } from '@/lib/manuscript/proposalChain/contract';

/* ══════════════════════════════════════════════════════════════════════════
   ⭐⭐ THE NEGATIVE LAW — the acceptance bar, stated first because it is the
   reason every other shape below is the shape it is.

   ⚠️ THE CENSUS PROVED THIS BADLY AND THE FOUNDER CORRECTED IT. It said
   `authorizeVersion` "reaches exactly two tables". It reaches SIX:
   `proposal_chains` · `proposal_versions` · `manuscript_working_drafts` ·
   `manuscript_draft_sections` · `manuscript_sections` ·
   `manuscript_revision_authorizations`. The conclusion held; the proof was
   lazy. The narrower and stronger form:

       The only authorizable editorial CONTENT identity is one exact
       `proposal_version`. The other five tables supply ownership, current-Work
       proof, execution binding and permission persistence — ⛔ none of them
       supplies editorial content.

   ⛔ So no Insight, Direction or discourse turn can become candidate wording
   unless it is first ILLEGITIMATELY CONVERTED into a `proposal_version`. The
   guard below exists to make that conversion impossible to write by accident.
   ══════════════════════════════════════════════════════════════════════════ */

/** ⛔ The brand every non-authorizable editorial object carries. */
export interface NotAuthorizable {
  /**
   * ⭐ A phantom discriminant. It is never persisted and never read; it exists
   * so that passing an Insight, a Direction or a discourse turn where a
   * `ProposalVersion` is expected is a TYPE ERROR rather than a runtime
   * surprise — and so that a "convenience adapter" has to say out loud that it
   * is stripping this brand.
   */
  readonly __notAuthorizable: true;
}

/**
 * ⭐ The runtime half of the same law, for boundaries that receive `unknown`.
 * ⛔ It admits ONLY the shape `authorizeVersion` actually consumes: an id that
 * belongs to a chain and carries a formulation.
 */
export function isAuthorizableContent(v: unknown): v is ProposalVersion {
  if (!v || typeof v !== 'object') return false;
  const r = v as Record<string, unknown>;
  /* ⛔ An object carrying the brand is refused OUTRIGHT, even if it also
     happens to look like a version. A thing that is both is a conversion. */
  if ('__notAuthorizable' in r) return false;
  return typeof r.id === 'string' && typeof r.chainId === 'string'
    && typeof r.replacementText === 'string';
}

/* ══════════════════════════════════════════════════════════════════════════
   INSIGHT — what MAIA sees, and why it matters.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐⭐ MAIA-AUTHORED, AND IT MAY STAND ALONE.
 *
 * ⛔ NOT a developmental `observation`. That is MAIA's reading of a FROZEN
 * READING, keyed `(readingId, observationKey)`; this is her reading of THIS
 * chain's locus at the moment the chain opened. Reusing the observation would
 * make every editorial remark about a sentence require a frozen developmental
 * reading to exist first.
 *
 * ⭐⭐ IT MAY EXIST WITH ZERO `ProposalVersion`s, WHICH IS HOW *"I WOULD KEEP
 * THIS"* BECOMES SAYABLE — the clearest single sign the model improved. A real
 * editor sometimes says *"I noticed the repetition, but in context I'd leave
 * it; it's doing emotional work."* ⛔ A system whose only expressive act is
 * replacement will always find something to replace.
 *
 * ⭐ MEASURED, not hoped: `validateChain` returns `yes` at zero versions, so a
 * chain with no candidate wording is ALREADY LAWFUL. The KEEP case needs no
 * change to succession law.
 *
 * ⛔ AND IT CARRIES NO WORDING. No `replacementText`, no range, no operation.
 * An insight that carried a candidate would be a Suggestion wearing another
 * name, and the whole separation would be decorative.
 */
export interface EditorialInsight extends NotAuthorizable {
  readonly id: string;
  /** ⭐ Its subject is the chain — and through the chain, the locus. */
  readonly chainId: string;
  /** ⛔ MAIA authors insights. A member's reading of their own Work is not this. */
  readonly author: 'maia';
  /** What she sees and why it matters, in her own words. */
  readonly observation: string;
  /** ⛔ Immutable once authored: a correction is a new insight, never a rewrite. */
  readonly authoredAt: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   DIRECTION — an instruction, and never a ruling.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐ *"Give me a gentler option."* · *"Go back to what V1 was doing."*
 *
 * ⛔ NOT `EditorialDecision.intent`, and the difference is authority, not
 * vocabulary. That object's own contract says *"a decision is not a
 * proto-revisionproposal… carries a ruling, an intent and a principle — never
 * prose."*
 *
 *     EditorialDecision.intent        Direction
 *     subject: the Work               subject: this exchange's next formulation
 *     act: a RULING that governs      act: an INSTRUCTION that asks
 *     lifetime: standing              lifetime: spent when answered
 *
 * ⛔ Reusing it would dress a request as a governing decision — collapsing
 * *"try this again, less absolute"* into a member ruling about the Work.
 *
 * ⭐ IT GOVERNS NOTHING. Nothing is obliged to answer a Direction, and nothing
 * downstream reads it as authority. It is how the exchange is steered, not how
 * it is decided.
 *
 * ⭐ AND IT MAY REFER BACKWARD FREELY — see `refersTo`. ⛔ A conversational
 * reference is NOT a succession: a later candidate still supersedes the head.
 */
export interface EditorialDirection extends NotAuthorizable {
  readonly id: string;
  readonly chainId: string;
  /** ⭐ Either party may steer. */
  readonly author: 'maia' | 'member';
  /** The instruction, in the author's words. ⛔ Never candidate wording. */
  readonly instruction: string;
  /**
   * ⭐ An earlier formulation this instruction is ABOUT, if any.
   * ⛔⛔ A REFERENCE, NOT A SUPERSESSION. Referring to v1 does not make the
   * next candidate succeed v1 — the authorizable lineage stays linear and the
   * next candidate still supersedes the head. This field is the whole reason
   * the conversation can range freely without branching authorizable history.
   */
  readonly refersTo: string | null;
  readonly authoredAt: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   DISCOURSE — reuse, with a relationship the database can prove.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐⭐ RULED: REUSE `ask_threads` / `ask_turns`. ⛔ DO NOT BUILD A SECOND
 * CONVERSATION SUBSTRATE. The existing one is append-only by trigger, carries
 * `speaker IN ('author','maia')`, is owned `ON DELETE RESTRICT`, freezes its
 * anchor and reading reference against re-pointing, and already supports many
 * threads per anchor. The charter's *"three objects do not exist"* was wrong
 * about this one.
 *
 * ── ⛔ WHAT IS **REFUSED**: A JSONB-ONLY CHAIN IDENTITY ────────────────────
 *
 * ⭐ FOUNDER RULING. `AskAnchor` is `jsonb` with no foreign key, so a
 * `{ on: 'proposal_chain', chainId }` anchor would be a chain relationship the
 * database cannot prove — while `(member_id, proposal_chain_id)` was made
 * provable for authorizations on purpose.
 *
 *     A proposal-chain discourse relationship must not be weaker merely
 *     because it is conversational.
 *
 * ⛔ The physical form is NOT ruled here — a typed nullable column and a small
 * binding relation are both candidates, and W5 decides. What IS ruled: the
 * relationship is TYPED, IMMUTABLE, and the database proves that the thread's
 * member owns the chain.
 *
 * ⛔ And `AskAnchor` is left alone. Whether chain membership is an ANCHOR or an
 * EDITORIAL-PARENT relationship is the contract's question, and forcing it into
 * the union because that is the quickest migration would answer it by accident.
 */
export interface DiscourseBinding {
  readonly threadId: string;
  readonly chainId: string;
  /** ⛔ Provable, not asserted: the same member owns both sides. */
  readonly memberId: string;
  /** ⛔ Immutable. A conversation cannot be re-pointed at a chain it was not about. */
  readonly boundAt: string;
}

/**
 * ⭐⭐ RULED · THE CONVERSATION IS WITHDRAWABLE; THE LINEAGE IS NOT.
 *
 *     member withdraws the conversation  →  thread + turns may disappear
 *     proposal chain · versions · authorizations  →  REMAIN
 *
 * ⛔ Deleting a conversation must never cascade into the chain or erase an
 * authored version. ⛔ And the lineage does not own the conversation: it must
 * not oblige the member to keep it.
 *
 * ⭐ If W5 introduces a binding object, THE BINDING MAY GO WITH THE THREAD.
 * The chain does not.
 *
 * ⚠️ The asymmetry is deliberate and was nearly inherited rather than ruled:
 * `ask_threads.manuscript_id` is `ON DELETE CASCADE` and turns cascade from the
 * thread, while `proposal_chains` carries NO foreign key to the Work (so
 * authored history is not hostage to a topology change) and authorizations are
 * `ON DELETE RESTRICT`. *A conversation is the member's to withdraw; an
 * authored formulation is a record of an act.*
 */
export const DISCOURSE_DELETION = {
  threadDeletionCascadesToTurns: true,
  threadDeletionMayRemoveBinding: true,
  /** ⛔ Absolutely not. */
  threadDeletionTouchesChain: false,
  threadDeletionTouchesVersions: false,
  threadDeletionTouchesAuthorizations: false,
  /** ⛔ The lineage may not force the member to retain the conversation. */
  lineageRetentionObligesThreadRetention: false,
} as const;

/**
 * ⭐⭐ RULED · TWO FREEZES, TWO MOMENTS — and not even the same KIND of fact.
 *
 *     proposal_chain.base_version      the Work state when this LOCUS opened
 *     ask_thread.canonical_at_open     the canonical Work state when this
 *                                      CONVERSATION opened
 *
 * A thread may begin minutes, days or several authored formulations after the
 * chain. ⛔ So: NO equality invariant, NO copying one into the other, and NO
 * "synchronise the freezes". The thread REFERENCES the chain if it needs
 * chain-open history; its own baseline keeps meaning conversation-open history.
 *
 * ⚠️ The census listed this as UNREAD and declined to infer it. The founder
 * ruled it rather than leaving it to be discovered by a migration.
 */
export const FREEZE_RELATIONSHIP = {
  mustBeEqual: false,
  mayBeCopied: false,
  threadMayOpenAfterChain: true,
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   THE LINEAGE STAYS LINEAR.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐ A Direction or a discourse turn may refer to any earlier formulation. The
 * next candidate still supersedes THE HEAD.
 *
 *     "Go back to what MAIA V1 was doing, but gentler."   ⭐ a reference
 *     V5 supersedes V4                                     ⭐ a succession
 *
 * ⛔ This function exists to be the place that says so once. It takes a
 * reference and the current head and returns what the next candidate must
 * supersede — ⛔ which is never the referenced version.
 */
export function successorOf(
  headVersionId: string | null,
  _conversationalReference: string | null,
): string | null {
  /* ⛔ `_conversationalReference` is deliberately unused. It is a parameter so
     that a caller holding one cannot quietly pass it as the predecessor, and so
     that this refusal is visible in the signature rather than in a comment. */
  return headVersionId;
}
