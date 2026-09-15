/**
 * WS-EDITORIAL-RUNTIME-01 · ER-R3 — MAIA'S OUTCOME, AS ONE DURABLE ACT.
 *
 * ⭐⭐ TWO LAWS, AND THE FILE IS SHAPED BY BOTH:
 *
 *   1  ADMISSION BEFORE PERSISTENCE. Prose has zero semantic authority. A
 *      malformed envelope, a text-only answer, two tool calls, two adjuncts —
 *      each reaches NO TRANSACTION and NO DURABLE ACT. ⛔ And prose is never
 *      inspected afterwards to rescue a refused envelope: there is no second
 *      chance and no fallback path below the admitter.
 *
 *   2  ⭐⭐ EXACT PREDECESSOR CUSTODY. The `EditorialInvocation` is frozen from
 *      the assembly BEFORE cognition and travels through unchanged. The
 *      proposal write receives `invocation.authoredAgainstVersionId`
 *      byte-for-byte, as an identity value.
 *
 *      ⛔ NO assembly rerun to obtain a newer predecessor.
 *      ⛔ NO head substitution.  ⛔ NO rebase.  ⛔ NO retry against a newer version.
 *
 *      If the chain moved while MAIA was thinking, `appendVersion` refuses with
 *      `not_successor_of_head` and THE WHOLE OUTCOME ROLLS BACK. ⭐ That is the
 *      right answer: MAIA authored against what she was shown, and a proposal
 *      silently rebased onto wording she never saw is a proposal she did not
 *      make.
 *
 * ⛔ The store is allowed to REREAD current succession to judge whether the
 * stated predecessor is still lawful. It is not allowed to use that reread to
 * CHOOSE a different one — that distinction is the whole of §2.
 */

import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { appendTurnWithClient } from '../ask/threadStore';
import { UNMEASURED } from '../ask/staleness';
import { createMaiaDirectionWithExecutor } from '../editorialWorkspace/store';
import { appendAuthoredVersionWithExecutor } from '../proposalChain/store';
import type {
  EditorialInvocation, EditorialOutcome,
} from '../editorialDiscourse/contract';
import type { EditorialDirection } from '../editorialWorkspace/ontology';
import type { ProposalVersion } from '../proposalChain/contract';

export interface MaiaOutcomeInput {
  readonly memberId: string;
  /** ⭐ FROZEN BEFORE COGNITION. ⛔ Never rebuilt after the answer returns. */
  readonly invocation: EditorialInvocation;
  /** ⭐ Already admitted. ⛔ This service never sees raw blocks. */
  readonly outcome: EditorialOutcome;
  /**
   * ⭐⭐ THE PROVENANCE OF THE ANSWER THAT ACTUALLY CAME BACK.
   *
   * ⛔ NOT the configured default. The durable MAIA turn must name the model
   * that AUTHORED it, not the model we intended to call — a fallback, a
   * version pin resolving differently, or an overridden base URL each make
   * those two different facts.
   */
  readonly answerProvenance?: unknown;
}

export type MaiaOutcomeRefusal =
  | 'thread_not_found' | 'not_editorial'
  /** The thread's editorial parent is not the chain the invocation names. */
  | 'invocation_mismatch'
  | 'direction_refused'
  /** ⭐⭐ The chain moved while MAIA was thinking. ⛔ Never rebased, never retried. */
  | 'not_successor_of_head'
  | 'version_refused';

export type MaiaOutcomeResult =
  | {
      readonly ok: true;
      readonly turnIndex: number;
      /**
       * ⭐ THE BODY THAT WAS PERSISTED, returned so a surface can show what the
       * database actually holds. ⛔ Not a second copy for the caller to render
       * instead — it IS `ask_turns.body` for `turnIndex`.
       */
      readonly reply: string;
      readonly direction: EditorialDirection | null;
      readonly version: ProposalVersion | null;
    }
  | { readonly ok: false; readonly reason: MaiaOutcomeRefusal; readonly detail?: string };

class OutcomeRefused extends Error {
  constructor(readonly reason: MaiaOutcomeRefusal, readonly detail?: string) { super(reason); }
}

/**
 * ⛔ THE THREAD MUST BE EDITORIAL *AND* BE ABOUT THE INVOCATION'S CHAIN.
 * Proving only the first would let an outcome authored against one chain land
 * on a thread about another — the wrong-Work substitution, arriving through the
 * answer instead of the question.
 */
async function proveInvocation(
  tx: TransactionClient, inv: EditorialInvocation, memberId: string,
): Promise<void> {
  const r = await tx.query<{ proposal_chain_id: string | null }>(
    `SELECT proposal_chain_id FROM ask_threads WHERE id = $1 AND member_id = $2`,
    [inv.threadId, memberId]);
  if (r.rows.length === 0) throw new OutcomeRefused('thread_not_found');
  const chainId = r.rows[0]!.proposal_chain_id;
  if (chainId === null) throw new OutcomeRefused('not_editorial');
  if (chainId !== inv.chainId) throw new OutcomeRefused('invocation_mismatch');
}

/** ⛔ Fixed by the service. `turn_speaker` and `act_author` are facts about
 *  which function is running, never values a caller supplies. */
async function bind(
  tx: TransactionClient, inv: EditorialInvocation, turnIndex: number,
  to: { directionId: string } | { versionId: string },
): Promise<void> {
  await tx.query(
    `INSERT INTO editorial_turn_bindings
       (thread_id, turn_index, turn_speaker, proposal_chain_id, act_author,
        direction_id, version_id)
     VALUES ($1, $2, 'maia', $3, 'maia', $4, $5)`,
    [inv.threadId, turnIndex, inv.chainId,
     'directionId' in to ? to.directionId : null,
     'versionId' in to ? to.versionId : null]);
}

export async function persistMaiaEditorialOutcome(
  input: MaiaOutcomeInput,
): Promise<MaiaOutcomeResult> {
  const { memberId, invocation, outcome } = input;
  try {
    return await transaction(async (tx) => {
      await proveInvocation(tx, invocation, memberId);

      const turnIndex = await appendTurnWithClient(tx, {
        threadId: invocation.threadId, memberId, speaker: 'maia',
        body: outcome.reply, staleness: UNMEASURED,
        answerProvenance: input.answerProvenance ?? null,
      });

      /* ⭐ THE ONLY THING CONSULTED IS `outcome.kind`. */
      if (outcome.kind === 'reply_only') {
        return { ok: true as const, turnIndex, reply: outcome.reply, direction: null, version: null };
      }

      if (outcome.kind === 'reply_with_direction') {
        const d = await createMaiaDirectionWithExecutor(tx, memberId, invocation.chainId, {
          instruction: outcome.direction.instruction,
          refersTo: outcome.direction.refersTo,
        });
        /* ⛔ THROWN, NEVER RETURNED. A politely-returned refusal would commit
           MAIA's turn while its declared adjunct did not exist. */
        if (!d.ok) throw new OutcomeRefused('direction_refused', d.reason);
        await bind(tx, invocation, turnIndex, { directionId: d.direction.id });
        return { ok: true as const, turnIndex, reply: outcome.reply, direction: d.direction, version: null };
      }

      const a = await appendAuthoredVersionWithExecutor(tx, memberId, invocation.chainId, {
        /* ⭐⭐ THE FROZEN IDENTITY, BYTE FOR BYTE. Not a lookup, not a head, not
           a recomputation — the same value the assembly produced before MAIA
           was asked anything. */
        supersedes: invocation.authoredAgainstVersionId,
        author: 'maia',
        replacementText: outcome.proposal.replacementText,
        ...(outcome.proposal.rationale !== undefined
          ? { rationale: outcome.proposal.rationale } : {}),
      });
      if (a.outcome !== 'appended') {
        throw new OutcomeRefused(
          a.reason === 'not_successor_of_head' ? 'not_successor_of_head' : 'version_refused',
          a.reason);
      }
      await bind(tx, invocation, turnIndex, { versionId: a.version.id });
      return { ok: true as const, turnIndex, reply: outcome.reply, direction: null, version: a.version };
    });
  } catch (e) {
    /* ⛔ Caught OUTSIDE the transaction, so the abort has already happened. */
    if (e instanceof OutcomeRefused) return { ok: false, reason: e.reason, detail: e.detail };
    throw e;
  }
}

/**
 * ⛔⛔ THERE IS NO PROSE PATH IN THIS MODULE. It takes an already-admitted
 * `EditorialOutcome` and never a `StructuredBlock[]`, so there is nowhere for a
 * refused envelope to be rescued by reading what MAIA happened to write.
 */
