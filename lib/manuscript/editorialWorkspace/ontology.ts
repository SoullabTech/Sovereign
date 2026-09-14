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

/**
 * ⛔ The brand every non-authorizable editorial object carries.
 *
 * ⚠️ NARROWED BY FOUNDER REVIEW. The first writing called this a *"phantom
 * discriminant … never read"* while `isAuthorizableContent` reads it — a
 * contradiction — and, worse, implied it was an installed authorization
 * boundary. ⛔ IT IS NOT. `authorizeVersion` does not consult it; these are
 * PURE CONTRACT EVIDENCE, falsifiable here and nowhere else yet.
 *
 * ⭐⭐ THE DURABLE PROTECTION IS STRONGER AND IS ELSEWHERE:
 *
 *     Insight    not in proposal_versions
 *     Direction  not in proposal_versions
 *     ask_turn   not in proposal_versions
 *                        ↓
 *     authorizeVersion can IDENTIFY none of them as candidate wording
 *
 * The brand makes accidental conceptual laundering CONSPICUOUS at the type and
 * contract level. ⭐ The persistence separation is what makes it structurally
 * impossible. ⛔ Do not add the brand to runtime authorization in the belief
 * that it is the membrane — that would be mistaking the evidence for the wall.
 */
export interface NotAuthorizable {
  readonly __notAuthorizable: true;
}

/**
 * ⭐ The contract's runtime check, for boundaries that receive `unknown`.
 * ⛔ NOT the authorization membrane — see `NotAuthorizable`. It admits only the
 * shape `authorizeVersion` consumes: an id belonging to a chain, carrying a
 * formulation.
 */
export function isAuthorizableContent(v: unknown): v is ProposalVersion {
  if (!v || typeof v !== 'object') return false;
  const r = v as Record<string, unknown>;
  /* ⛔ An object carrying the brand is refused OUTRIGHT, even if it also
     happens to look like a version. A thing that is both is a conversion. */
  if ('__notAuthorizable' in r) return false;
  /* ⭐⭐ THE WHOLE SHAPE, because the signature CLAIMS the whole shape.
     ⚠️ The first writing checked three fields and told TypeScript the value was
     a complete `ProposalVersion`. `{ id, chainId, replacementText }` narrowed,
     and `supersedes`, `author` and `authoredAt` were then readable as present
     when they were not. Nothing exploitable reached authorization — this helper
     is contract evidence, not the membrane — ⛔ but an unsound predicate is the
     same weakness this programme has refused every time a caller happened to
     behave correctly. */
  if (typeof r.id !== 'string' || typeof r.chainId !== 'string') return false;
  if (!(r.supersedes === null || typeof r.supersedes === 'string')) return false;
  if (typeof r.replacementText !== 'string') return false;
  if (r.author !== 'maia' && r.author !== 'member') return false;
  if (typeof r.authoredAt !== 'string') return false;
  /* ⛔ Two states, as the ontology has it: absent, or a string. */
  if ('rationale' in r && typeof r.rationale !== 'string') return false;
  return true;
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
 *
 * ⚠️ AN EARLIER LINE HERE SAID Direction's lifetime is *"spent when answered"*.
 * ⛔ WITHDRAWN: W5-1 defines no answer relationship, and prose like that is
 * exactly what a schema designer turns into an `answered_at` column or a mutable
 * status. ⭐ A Direction is an IMMUTABLE AUTHORED INSTRUCTION. Whether a later
 * turn or formulation answers it is a SEPARATE RELATIONSHIP, not yet ruled —
 * W4 can earn it when MAIA actually answers inside the object. ⛔ A historical
 * act must not be mutated merely because something later responded to it.
 *
 * ⛔ Reusing it would dress a request as a governing decision — collapsing
 * *"try this again, less absolute"* into a member ruling about the Work.
 *
 * ⭐ IT GOVERNS NOTHING. Nothing is obliged to answer a Direction, and nothing
 * downstream reads it as authority. It is how the exchange is steered, not how
 * it is decided.
 *
 * ⭐ AND IT MAY REFER BACKWARD FREELY — see `refersTo`. ⛔ A conversational
 * reference is NOT a succession: a later candidate carries THE PREDECESSOR THE
 * AUTHOR ACTED AGAINST, and persistence judges whether that predecessor is
 * still lawful.
 *
 * ⚠️ AN EARLIER WORDING HERE SAID *"a later candidate still supersedes the
 * head"*. ⛔ Withdrawn: it contradicted `successionPredecessor` below and would
 * have had a schema designer recreate head synthesis from the paragraph above
 * the function that forbids it.
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
   * next candidate succeed v1: the candidate carries whichever predecessor its
   * AUTHOR ACTED AGAINST, and the store decides whether that is still lawful.
   * ⭐ This field is the whole reason the conversation can range freely without
   * branching authorizable history.
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
/**
 * ⭐⭐ W5-2 CRITERION — SAME MEMBER IS NOT ENOUGH. SAME WORK, PROVEN BY THE
 * DATABASE.
 *
 * ⛔ FOUNDER FINDING, carried forward and NOT implemented here. A relation
 * proving only `thread.member_id = chain.member_id` would still admit:
 *
 *     Kelly's thread about Work X  ──▶  Kelly's proposal chain about Work Y
 *
 * ⭐ That is the 01A.1 wrong-Work substitution again, this time in persistence
 * rather than in the room. We removed it from the mount; conversation identity
 * must not reopen it underneath.
 *
 *     same member
 *     AND thread.manuscript_id = chain.work_id
 *     AND exact chain identity
 *
 * ⛔ All three proven by the DATABASE, never by application code.
 *
 * ⚠️ The physical form is W5-2's to adjudicate and is deliberately not decided
 * here. The founder's current preference, recorded as a criterion rather than a
 * ruling: a nullable `ask_threads.proposal_chain_id` with a composite
 * relationship over `(member_id, manuscript_id, proposal_chain_id)` →
 * `(member_id, work_id, id)` — because the thread then OWNS the relationship,
 * its existing freeze makes it immutable, deleting the thread removes it
 * naturally, the chain is untouched, there is no separately deletable row that
 * could leave a live conversation mysteriously unbound, and `AskAnchor` stays
 * exactly what it is. A separate binding relation could still satisfy the
 * contract, but it must carry enough identity to prove the same Work and needs
 * extra lifecycle machinery the column gets for free.
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
 * ⭐⭐ THE AUTHORED PREDECESSOR — and it is NOT "the head".
 *
 * ⚠️ FOUNDER REVIEW OF 68c4a802b. The first writing was
 * `successorOf(headVersionId, …)` and explained that the next candidate
 * "supersedes THE HEAD". ⛔ That quietly reintroduced, one layer above the
 * store, the exact question W2 spent an act removing:
 *
 *     appendAuthoredVersion was repaired SPECIFICALLY so the store does not ask
 *     what the head is in order to populate `supersedes`.
 *
 * The parameter name was the tell. A contract that names the head as the
 * predecessor invites a caller to go and find one.
 *
 *     ⭐ LAWFUL
 *     conversation refers to V1              a conversational fact
 *     author authors against V4              an AUTHORED succession fact
 *         → supersedes = V4
 *     store later finds the head is V5
 *         → not_successor_of_head            ⭐ the store judges, truthfully
 *
 *     ⛔ UNLAWFUL
 *     conversation refers to V1
 *     system asks "what is the head?" → V5
 *         → supersedes = V5                  ⛔ machine timing authored it
 *
 * ⭐ THE SIGNIFICANT WORD IS `authoredAgainst`. This function returns the
 * predecessor the author ACTED AGAINST, unchanged — ⛔ never the head, never the
 * referenced version. It is deliberately given no means of learning what the
 * head is, because the protection is the ABSENCE of that access, not a promise
 * not to use it.
 *
 * ⛔ A STALE PREDECESSOR IS RETURNED UNCHANGED. Judging whether it is still
 * lawful is the store's authority and nobody else's:
 *
 *     The system may judge whether the predecessor is still the head;
 *     it may never choose the head on the author's behalf.
 */
export function successionPredecessor(
  authoredAgainstVersionId: string | null,
  _conversationalReference: string | null,
): string | null {
  /* ⛔ `_conversationalReference` is deliberately unused. It is a parameter so
     that a caller holding one cannot quietly pass it as the predecessor, and so
     that this refusal is visible in the signature rather than in a comment. */
  return authoredAgainstVersionId;
}
