/**
 * ADOPTION-01 · PHASE B — THE MEMBER'S ADOPTION GESTURE.
 *
 * ⭐⭐ THE ACCEPTANCE LAW THIS FILE SERVES, in the founder's words:
 *
 *     Adoption means the member explicitly names a version and permits it to
 *     change the Work. The server determines where that change belongs and
 *     whether it is still safe to execute. The surface reports the result
 *     without collapsing permission, execution, or refusal into one false
 *     story.
 *
 * ── ⭐⭐ ONE GESTURE, TWO LEGAL ACTS — AND THE SECOND IS NOT IMPLIED ────────
 *
 *     ADOPT                    one member gesture
 *       │
 *       ├─ authorizeVersion    a permission comes into existence  (act 1)
 *       │
 *       └─ executeAuthorization the Work is re-read, re-fitted,
 *                               and only then mutated             (act 2)
 *
 * ⛔ THIS SEAM ADDS NO THIRD AUTHORITY. It calls the two existing acts in
 * order and reports what each of them said. It does not pre-check fit, does not
 * retry, does not repair, and does not decide anything either act decides.
 *
 * ⭐⭐ AND IT NEVER CONCEALS AN ACT THAT HAPPENED. `executeAuthorization`
 * deliberately re-reads the Work, so this is a REAL state:
 *
 *     permission established → Work moves → execution-fit refuses
 *                            → the permission STILL EXISTS
 *
 * Every outcome below therefore carries `permission`, and it is a union rather
 * than a nullable id: the surface cannot render an outcome without having been
 * told whether a durable permission exists. ⛔ *The surface may compress
 * interaction, but not truth.*
 *
 * ── ⭐ THE SOURCE OBLIGATION, MADE STRUCTURAL ──────────────────────────────
 *
 *     manuscript-state refusal  ≠  system failure
 *
 * `classifyAuthorizeRefusal` and `classifyExecutionRefusal` below are EXHAUSTIVE
 * switches with no `default`, so a refusal reason added to either substrate
 * fails this file's typecheck rather than silently falling into whichever family
 * happened to be last. ⛔ A new reason must be classified by a person.
 *
 * ── ⛔ WHAT THIS FILE DOES NOT ACCEPT ──────────────────────────────────────
 *
 *     baseVersion          minted by `resolveGuard` from the Work it read
 *     range / locator      server-derived, by `readAuthorizationStatus`
 *     idempotency token    the permission HAS a natural identity; ⛔ inventing
 *                          a second one over it is the exact move the store's
 *                          step-6 comment forbids
 *     expectedText         read from the chain, never asserted
 *     "the latest version" ⛔ there is no head lookup anywhere in this path
 *
 * ── ⚠️ ONE DELIBERATE DEVIATION FROM THE PHASE B AUTHORIZATION, DECLARED ───
 *
 * The ruling says *accept `chainId` + explicit `versionId` only*. This seam
 * accepts **`threadId` + explicit `versionId`** and derives the chain from the
 * owned thread in SQL, exactly as `appendMemberEditorialVersion` already does.
 * ⭐ That is STRICTLY NARROWER — the caller asserts one fact fewer, and thread
 * ownership is proved in the same statement that finds the chain. ⛔ It is
 * recorded here rather than chosen silently; the version remains explicit and
 * caller-named, which is the part of the ruling that carries the weight.
 */

import { altersProtectedText } from '@/lib/writersStudio/editorialDiff';
import { query } from '@/lib/db/postgres';
import { authorizeVersion, type AuthorizeRefusal } from '../revisionAuthorization/store';
import { executeAuthorization, type ExecutionRefusal } from '../revisionAuthorization/execute';
import { readAuthorizationStatus, type ChangeLocator } from '../revisionAuthorization/status';
import { locusIsAdoptable } from '../proposalChain/legacyLocus';
import type { VerifiedIdentity } from './turn';

export interface AdoptVersionInput {
  readonly identity: VerifiedIdentity;
  /** ⭐ The thread. ⛔ Never the chain — see the deviation note in the header. */
  readonly threadId: string;
  /**
   * ⭐⭐ THE EXACT VERSION THE MEMBER CHOSE, carried from their click.
   * ⛔ Not the head, not the newest, not the one MAIA last offered. A writer
   * may adopt MAIA's v2 after abandoning their own v4, and the record must say
   * so.
   */
  readonly versionId: string;
}

/**
 * ⭐⭐ WHETHER A DURABLE PERMISSION EXISTS, as a union rather than a nullable.
 *
 * ⛔ `authorizationId: string | null` would let a surface render an outcome
 * while forgetting to ask the question. This cannot be read without answering
 * it.
 */
export type AdoptionPermission =
  | { readonly established: false }
  | { readonly established: true; readonly authorizationId: string;
      readonly authorizedAt: string };

/** ⭐ A truthful fact about the member's manuscript. ⛔ Never a system claim. */
export type WorkMovedReason =
  | 'stale_base'
  | 'expected_text_absent'
  | 'expected_text_ambiguous';

/** ⛔ The Studio could not act. ⛔ NEVER anthropomorphized into a claim about the book. */
export type SystemRefusalReason =
  | 'work_unreadable'
  | 'section_unreadable'
  | 'section_not_found'
  | 'section_not_projectable'
  | 'version_unreadable'
  | 'draft_not_found'
  | 'write_refused'
  | 'authorization_unknown'
  | 'malformed';

/** The relationship itself could not be read. ⛔ Not a manuscript fact either. */
export type RelationshipRefusal =
  | 'thread_not_found'
  | 'not_editorial'
  | 'chain_unknown'
  | 'version_unknown';

/**
 * ⭐ What the surface may say, derived from `readAuthorizationStatus` AFTER the
 * two acts have run. ⛔ Never reconstructed by the browser from thread state.
 */
export interface AdoptionFacts {
  readonly status: 'executable' | 'spent' | 'no_longer_fits' | 'work_unreadable' | 'unreadable';
  /** ⭐ Server-derived coordinates. `null` whenever the substrate has none. */
  readonly locator: ChangeLocator | null;
}

export type AdoptionOutcome =
  /**
   * ⭐ APPLIED. The permission exists AND the receipt is whole.
   *
   * ⚠️ `byThisGesture` is FALSE only in the concurrency case where the
   * permission this act recovered was spent by another execution between our
   * two acts. The version the member named IS in the Work and the receipt is
   * real, so *"nothing was changed"* would be a lie — but *this* gesture did
   * not perform the write, and the surface is told which.
   */
  | { readonly kind: 'applied'; readonly permission: AdoptionPermission;
      readonly resultingVersion: number; readonly acceptedAt: string;
      readonly byThisGesture: boolean; readonly facts: AdoptionFacts }
  /**
   * ⚠️ THE PROPOSAL WOULD REWRITE A DETECTED SOURCE QUOTATION, so nothing was
   * authorized and nothing was applied. ⛔ Never reported as the member's
   * manuscript having moved, and ⛔ never as a system fault: the request was
   * well formed and the refusal is the rule working.
   */
  | { readonly kind: 'protected_quotation'; readonly permission: AdoptionPermission }
  /** ⭐⭐ THE WORK MOVED. ⛔ Do not imply the authorization never happened. */
  | { readonly kind: 'work_moved'; readonly permission: AdoptionPermission;
      readonly reason: WorkMovedReason; readonly facts: AdoptionFacts }
  /** ⛔ THE STUDIO COULD NOT ACT. ⛔ Not a statement about the manuscript. */
  | { readonly kind: 'system_refusal'; readonly permission: AdoptionPermission;
      readonly reason: SystemRefusalReason; readonly facts: AdoptionFacts }
  /**
   * ⚠️⚠️ A HISTORICALLY MALFORMED LOCUS — EDITORIAL-LEGACY-LOCUS-DISPOSITION-01.
   *
   * ⭐⭐ ITS OWN FAMILY, AND THAT IS THE POINT. Four different truths, and the
   * member must never receive one in place of another:
   *
   *     untouched modern headed section  → ADOPTABLE
   *     genuinely edited section         → work_moved
   *     historical stored-space chain    → THIS
   *     the Studio cannot execute        → system_refusal
   *
   * ⛔ It is NOT `work_moved`: nothing about her writing changed. ⛔ It is NOT a
   * system failure: nothing is broken. ⛔ And no permission exists — the refusal
   * happens before the authorizing act, so `permission` is `established: false`
   * by construction rather than by remembering to say so.
   */
  | { readonly kind: 'legacy_locus'; readonly permission: AdoptionPermission }
  /** The editorial relationship or the named version could not be read. */
  | { readonly kind: 'relationship_refusal'; readonly reason: RelationshipRefusal };

/* ══════════════════════════════════════════════════════════════════════════
   ⭐⭐ THE TWO CLASSIFICATION TABLES. EXHAUSTIVE, AND WITH NO `default`.
   ══════════════════════════════════════════════════════════════════════════ */

type AuthorizeClass =
  | { readonly family: 'relationship'; readonly reason: RelationshipRefusal }
  | { readonly family: 'work_moved'; readonly reason: WorkMovedReason }
  | { readonly family: 'system'; readonly reason: SystemRefusalReason };

function classifyAuthorizeRefusal(reason: AuthorizeRefusal): AuthorizeClass {
  switch (reason) {
    /* ⛔ Indistinguishable by design in the store: unknown and another
       member's collapse to one answer, and this preserves that. */
    case 'chain_unknown':   return { family: 'relationship', reason: 'chain_unknown' };
    case 'version_unknown': return { family: 'relationship', reason: 'version_unknown' };
    /* ⭐ The passage this exchange was opened against is gone, or now occurs
       more than once. Both are facts about the member's own writing. */
    case 'expected_text_absent':    return { family: 'work_moved', reason: 'expected_text_absent' };
    case 'expected_text_ambiguous': return { family: 'work_moved', reason: 'expected_text_ambiguous' };
    case 'work_unreadable':    return { family: 'system', reason: 'work_unreadable' };
    case 'section_unreadable': return { family: 'system', reason: 'section_unreadable' };
    case 'malformed':          return { family: 'system', reason: 'malformed' };
  }
}

type ExecutionClass =
  /** ⭐ Handled specially: the permission was spent by someone else's execution. */
  | { readonly family: 'already_spent' }
  | { readonly family: 'work_moved'; readonly reason: WorkMovedReason }
  | { readonly family: 'system'; readonly reason: SystemRefusalReason };

function classifyExecutionRefusal(reason: ExecutionRefusal): ExecutionClass {
  switch (reason) {
    case 'already_spent': return { family: 'already_spent' };
    /* ⭐ The Work advanced past the state this permission was bound to. */
    case 'stale_base':              return { family: 'work_moved', reason: 'stale_base' };
    case 'expected_text_absent':    return { family: 'work_moved', reason: 'expected_text_absent' };
    case 'expected_text_ambiguous': return { family: 'work_moved', reason: 'expected_text_ambiguous' };
    /* ⛔ SYSTEM LANGUAGE, deliberately. `section_not_found` here also carries
       `different_place`, which `executeAuthorization` maps onto it; neither is
       a sentence about the writer's prose. */
    case 'authorization_unknown':  return { family: 'system', reason: 'authorization_unknown' };
    case 'version_unreadable':     return { family: 'system', reason: 'version_unreadable' };
    case 'draft_not_found':        return { family: 'system', reason: 'draft_not_found' };
    case 'section_not_found':      return { family: 'system', reason: 'section_not_found' };
    case 'section_not_projectable':return { family: 'system', reason: 'section_not_projectable' };
    case 'write_refused':          return { family: 'system', reason: 'write_refused' };
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   THE ACT
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐ ONE GESTURE. Two acts. Three outcome families, plus the relationship
 * refusal that precedes all of them.
 *
 * ⛔ NO BLANKET `catch`. A database that cannot answer must say so — turning
 * unavailability into a domain refusal is the shape of the open S3 finding, and
 * both substrates below refuse to do it for exactly that reason.
 */
export async function adoptVersion(input: AdoptVersionInput): Promise<AdoptionOutcome> {
  const memberId = input.identity.memberId;

  /* ⭐ THE CHAIN, DERIVED FROM AN OWNED EDITORIAL THREAD — ownership inside the
     SQL, so an unknown thread and another member's are one answer.
     ⭐ The frozen locus and its section's heading ride along in the SAME
     statement: the legacy guard below needs both, and a second round trip would
     let them be read from two different moments. */
  const t = await query<{
    proposal_chain_id: string | null; expected_text: string | null;
    heading: string | null;
  }>(
    `SELECT th.proposal_chain_id, c.expected_text, ms.heading
       FROM ask_threads th
       LEFT JOIN proposal_chains c ON c.id = th.proposal_chain_id
       LEFT JOIN manuscript_draft_sections ds ON ds.id = c.target_section_id
       LEFT JOIN manuscript_sections ms ON ms.id = ds.source_section_id
      WHERE th.id = $1 AND th.member_id = $2`,
    [input.threadId, memberId]);
  if (t.rows.length === 0) {
    return { kind: 'relationship_refusal', reason: 'thread_not_found' };
  }
  const chainId = t.rows[0]!.proposal_chain_id;
  if (chainId === null) {
    return { kind: 'relationship_refusal', reason: 'not_editorial' };
  }

  /* ══ ⭐⭐ THE COMPATIBILITY GUARD — BEFORE ACT 1, DELIBERATELY ═══════════
     A locus frozen in the stored coordinate space can never be located in the
     projected one, so letting it proceed would mint a permission that can only
     fail, and fail as `expected_text_absent` — which this taxonomy reports as
     `work_moved`, telling the writer she changed a passage she never touched.

     ⛔ THE POSITION IS THE WHOLE REPAIR. Placing this inside
     `evaluateExecutionFit` would BE reclassifying `stale_base`; placing it in
     `authorizeVersion` would change authorization semantics for every caller.
     Here, the malformed locus never reaches the classifier and no authorization
     row is written. ⭐ `stale_base` keeps its meaning exactly. */
  if (!locusIsAdoptable(t.rows[0]!.expected_text ?? '', t.rows[0]!.heading)) {
    return { kind: 'legacy_locus', permission: { established: false } };
  }

  /* ══ ⚠️⚠️ THE DETECTED-QUOTATION GUARD — BEFORE ACT 1, FOR THE SAME REASON
     THE COMPATIBILITY GUARD IS ═══════════════════════════════════════════════

     ⭐⭐ A BROWSER CHECK IS NOT A GUARD. The page can mark a quotation as
     protected and decline to offer it as a choice, and none of that survives a
     request the page did not make. The refusal has to be here, where the named
     version and the frozen locus are both in hand, and BEFORE `authorizeVersion`
     — so a proposal that would rewrite a source's words never mints a
     permission at all. Placing it after would leave an authorization row
     standing for an act that must never happen.

     ⛔ REFUSED WHOLE, NEVER TRIMMED. Applying the lawful remainder would still
     publish a quotation the source did not write — shorter, and just as
     invented. There is no partial application of this refusal.

     ⚠️⚠️ THIS IS DETECTED-QUOTATION SAFETY, ⛔ NOT QUOTE CUSTODY, and it must
     never be reported as custody. `Block { type: 'quote', content, attribution }`
     exists in the manuscript model but never reaches this path: ingest flattens
     a section to body text before any row exists. So there is no preserved
     quotation identity to enforce — only syntactic detection, which is
     inference and is incomplete by construction. ⭐ It fails closed in the
     direction that matters: a false positive refuses a lawful edit, which the
     member can recover from; a false negative is the defect this guard was
     written for. Real custody needs member-declared or ingest-preserved spans,
     and that is a separate lane. */
  const proposed = await query<{ formulation: string }>(
    `SELECT formulation FROM proposal_versions WHERE id = $1 AND chain_id = $2`,
    [input.versionId, chainId]);
  const wording = proposed.rows[0]?.formulation ?? null;
  if (wording !== null
      && altersProtectedText(t.rows[0]!.expected_text ?? '', wording)) {
    return { kind: 'protected_quotation', permission: { established: false } };
  }

  /* ══ ACT 1 · THE PERMISSION ═══════════════════════════════════════════════
     ⭐⭐ The member's exact version id crosses this boundary unchanged. There
     is no ORDER BY, no LIMIT, and no head lookup on this path — not here, not
     in the store it calls. */
  const authorized = await authorizeVersion(memberId, chainId, input.versionId);
  if (!authorized.ok) {
    const c = classifyAuthorizeRefusal(authorized.reason);
    /* ⛔ NO PERMISSION EXISTS. Every one of these is reported with
       `established: false`, which is the honest half of the ruling's other
       half: a refusal here must not be dressed as an authorize-then-refuse. */
    const none: AdoptionPermission = { established: false };
    const facts: AdoptionFacts = { status: 'unreadable', locator: null };
    if (c.family === 'relationship') {
      return { kind: 'relationship_refusal', reason: c.reason };
    }
    if (c.family === 'work_moved') {
      return { kind: 'work_moved', permission: none, reason: c.reason, facts };
    }
    return { kind: 'system_refusal', permission: none, reason: c.reason, facts };
  }

  /* ⭐⭐ FROM HERE ON A DURABLE PERMISSION EXISTS, and no outcome may say
     otherwise. It is the SAME object whether it was minted now or recovered by
     its natural identity — the store returns it whole, same id, same
     `authorizedAt`, and this seam does not look at which happened. */
  const permission: AdoptionPermission = {
    established: true,
    authorizationId: authorized.authorization.id,
    authorizedAt: authorized.authorization.authorizedAt,
  };

  /* ══ ACT 2 · THE EXECUTION ════════════════════════════════════════════════
     ⛔ It is handed an id and nothing else. Every fact it acts on comes from
     the durable row, and it re-reads and re-fits the Work itself. */
  const executed = await executeAuthorization(memberId, permission.authorizationId);

  /* ⭐ THE CONFIRMATION FACTS COME FROM THE SUBSTRATE, once, after the acts.
     ⛔ The browser never reconstructs where the change belongs. */
  const facts = await readFacts(memberId, permission.authorizationId);

  if (executed.outcome === 'executed') {
    const a = executed.authorization;
    /* ⭐ The whole receipt, and only on completion. The contract's union makes
       a half receipt unrepresentable, so this narrowing is the type system
       stating the same law. */
    if (a.acceptedAt === null) {
      /* ⛔ Unreachable by contract. Reported rather than coerced: a receipt
         that executed without an `acceptedAt` is a defect, not an outcome. */
      return { kind: 'system_refusal', permission, reason: 'write_refused', facts };
    }
    return {
      kind: 'applied', permission,
      resultingVersion: a.resultingVersion, acceptedAt: a.acceptedAt,
      byThisGesture: true, facts,
    };
  }

  const c = classifyExecutionRefusal(executed.reason);
  if (c.family === 'work_moved') {
    return { kind: 'work_moved', permission, reason: c.reason, facts };
  }
  if (c.family === 'system') {
    return { kind: 'system_refusal', permission, reason: c.reason, facts };
  }

  /* ⭐⭐ `already_spent` — AND *"Nothing was changed"* WOULD BE FALSE HERE.
     The store recovers only unspent permissions, so reaching this means another
     execution spent this one between our two acts. The version the member named
     IS in the Work and the receipt is real; the honest report is therefore
     APPLIED, with `byThisGesture: false` so the surface is never told that this
     click performed the write.
     ⛔ Classifying it as a system refusal would tell the member nothing changed
     when something did — the one thing this outcome taxonomy exists to prevent. */
  const settled = await readAuthorizationStatus(memberId, permission.authorizationId);
  if (settled !== null && settled.state === 'spent'
      && settled.authorization.acceptedAt !== null) {
    return {
      kind: 'applied', permission,
      resultingVersion: settled.authorization.resultingVersion,
      acceptedAt: settled.authorization.acceptedAt,
      byThisGesture: false, facts,
    };
  }
  /* ⛔ Execution said spent and the record does not agree. That is a system
     fault, and it is reported as one rather than guessed at. */
  return { kind: 'system_refusal', permission, reason: 'authorization_unknown', facts };
}

/** ⭐ One read, through the substrate's own status law. ⛔ No second oracle. */
async function readFacts(memberId: string, authorizationId: string): Promise<AdoptionFacts> {
  const s = await readAuthorizationStatus(memberId, authorizationId);
  if (s === null) return { status: 'unreadable', locator: null };
  return {
    status: s.state,
    /* ⛔ The locator exists ONLY where the substrate derived one. It is never
       manufactured for the other states so the surface can mark a place. */
    locator: s.state === 'executable' ? s.locator : null,
  };
}
