/**
 * WS-EDITORIAL-RUNTIME-01 · ER-R1 — THE MEMBER'S ACT, AS ONE DURABLE FACT.
 *
 * ⭐⭐ THE GOVERNING SENTENCE:
 *
 *     The writer can say something, explicitly declare that saying as a
 *     Direction when they choose, and the database either remembers the
 *     ENTIRE authored act or remembers NONE of it.
 *
 * ⛔⛔ THE LAW THIS FILE EXISTS TO PRESERVE — `ER-F1`, `ER-F2`, `ER-F6`:
 *
 *     A semantic editorial act is DECLARED. It is never DERIVED FROM TEXT.
 *
 * So the only thing consulted below is `act.act`. `act.text` is written and
 * never read for meaning. There is:
 *
 *   ⛔ no `.trim()`          — the host must not tidy the writer's words; a
 *                              Direction whose text the system wrote is a
 *                              Direction the system authored
 *   ⛔ no paraphrase or summary
 *   ⛔ no focus-default for `refersTo` — the writer's silence is not a reference
 *   ⛔ no prose classifier   — if the system decides an utterance WAS a
 *                              Direction, the system authored a steering act
 *   ⛔ no post-write extraction pass
 *
 * ⚠️ WHAT THIS CUT DOES NOT ANSWER. An editorial turn's `staleness` is written
 * `UNMEASURED` — *every dimension unmeasured, the honest starting point, never a
 * default answer.* What staleness MEANS for a thread whose subject is a proposal
 * chain rather than a reading is a real question, and inventing a value here
 * would answer it by accident.
 */

import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { appendTurnWithClient } from '../ask/threadStore';
import { UNMEASURED } from '../ask/staleness';
import { createMemberDirectionWithExecutor } from '../editorialWorkspace/store';
import type { EditorialDirection } from '../editorialWorkspace/ontology';

export type MemberActKind = 'discourse' | 'direction';

export interface MemberEditorialActInput {
  readonly memberId: string;
  /** ⛔ The THREAD is named. ⛔ The chain is NEVER accepted from the caller. */
  readonly threadId: string;
  readonly act: {
    readonly act: MemberActKind;
    /** The member's own words, exactly as typed. */
    readonly text: string;
    /** ⛔ Absence stays null. */
    readonly refersTo: string | null;
  };
}

export type MemberActRefusal =
  /** No such thread, or it is not this member's. ⛔ The two are indistinguishable on purpose. */
  | 'thread_not_found'
  /** An anchored Ask thread. It has no editorial subject, so it cannot carry a Direction. */
  | 'not_editorial'
  /** A Direction must carry an instruction. ⛔ Judged on the member's bytes, untouched. */
  | 'empty_instruction'
  /** The database refused the Direction — foreign chain, unknown reference, vocabulary. */
  | 'direction_refused';

export type MemberActResult =
  | {
      readonly ok: true;
      readonly turnIndex: number;
      readonly chainId: string;
      /** Present exactly when the member DECLARED a Direction. */
      readonly direction: EditorialDirection | null;
    }
  | { readonly ok: false; readonly reason: MemberActRefusal; readonly detail?: string };

class ActRefused extends Error {
  constructor(readonly reason: MemberActRefusal, readonly detail?: string) {
    super(reason);
  }
}

/**
 * ⭐⭐ THE CHAIN IS DERIVED FROM THE OWNED THREAD, INSIDE THE TRANSACTION.
 *
 * ⛔ A caller-supplied chain id would let one member's thread be bound to a
 * chain about someone else's Work — the 01A.1 wrong-Work substitution, arriving
 * through the runtime instead of through persistence. Ownership is in the SQL
 * predicate, not in a precheck the caller could skip.
 */
async function resolveEditorialChain(
  tx: TransactionClient, threadId: string, memberId: string,
): Promise<string> {
  const r = await tx.query<{ proposal_chain_id: string | null }>(
    `SELECT proposal_chain_id FROM ask_threads WHERE id = $1 AND member_id = $2`,
    [threadId, memberId]);
  if (r.rows.length === 0) throw new ActRefused('thread_not_found');
  const chainId = r.rows[0]!.proposal_chain_id;
  /* ⭐ NULL here is not an error state — it is an ANCHORED Ask thread, which is
     a perfectly good thread that simply has no editorial subject. */
  if (chainId === null) throw new ActRefused('not_editorial');
  return chainId;
}

/**
 * ⛔ THE BINDING'S DENORMALISED COLUMNS ARE FIXED HERE, NEVER PASSED IN.
 * `turn_speaker='author'` and `act_author='member'` are facts about which
 * function is running, and each is FK-verified against its own source row by
 * the schema — so a wrong value does not insert rather than being trusted.
 */
async function bindTurnToDirection(
  tx: TransactionClient, threadId: string, turnIndex: number,
  chainId: string, directionId: string,
): Promise<void> {
  await tx.query(
    `INSERT INTO editorial_turn_bindings
       (thread_id, turn_index, turn_speaker, proposal_chain_id, act_author,
        direction_id, version_id)
     VALUES ($1, $2, 'author', $3, 'member', $4, NULL)`,
    [threadId, turnIndex, chainId, directionId]);
}

export async function persistMemberEditorialAct(
  input: MemberEditorialActInput,
): Promise<MemberActResult> {
  const { memberId, threadId, act } = input;
  try {
    return await transaction(async (tx) => {
      const chainId = await resolveEditorialChain(tx, threadId, memberId);

      /* ⭐ THE ONLY THING CONSULTED IS `act.act`. */
      const turnIndex = await appendTurnWithClient(tx, {
        threadId, memberId, speaker: 'author', body: act.text, staleness: UNMEASURED,
      });

      if (act.act === 'discourse') {
        return { ok: true as const, turnIndex, chainId, direction: null };
      }

      /* ⛔ Judged on the member's bytes. `.trim()` is used to ASK the question,
         never to change the answer that gets stored. */
      if (act.text.trim().length === 0) throw new ActRefused('empty_instruction');

      const d = await createMemberDirectionWithExecutor(tx, memberId, chainId, {
        /* ⭐ THE SAME UTTERANCE, character for character. */
        instruction: act.text,
        refersTo: act.refersTo,
      });
      if (!d.ok) throw new ActRefused('direction_refused', d.reason);

      await bindTurnToDirection(tx, threadId, turnIndex, chainId, d.direction.id);
      return { ok: true as const, turnIndex, chainId, direction: d.direction };
    });
  } catch (e) {
    /* ⛔ A refusal thrown inside the callback ABORTS the transaction. It is
       caught HERE, outside it — a politely-returned refusal would commit the
       half-written act, which is the exact defect the W5-4 seam was built to
       refuse. */
    if (e instanceof ActRefused) return { ok: false, reason: e.reason, detail: e.detail };
    throw e;
  }
}

/**
 * ⛔⛔ THERE IS NO `observe()`, NO EXTRACTION PASS, AND NO CLASSIFIER IN THIS
 * MODULE. `ER-F6` asserts that observing stored discourse mints nothing; the
 * way this file satisfies it is by having nothing that could.
 */
