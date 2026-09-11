/**
 * RC-GEN-01 · step 3B — one lawful act becomes one internally coherent record.
 *
 * ⭐ THE WHOLE POINT IS THE TRANSACTION BOUNDARY. There must be no window in which
 * the conversation says MAIA proposed something and no proposal exists, or a
 * proposal exists that no MAIA turn ever produced.
 *
 * ⛔ THIS IS ATOMICITY, NOT IDEMPOTENCY, AND THE DIFFERENCE IS NOT PEDANTIC. A
 * transaction that rolls back perfectly still creates a SECOND historical act when
 * a lost response is retried. Nothing here protects against that, nothing here
 * should claim to, and the 3B witness deliberately contains no same-act specimen
 * so atomicity cannot quietly acquire credit for exactly-once behaviour.
 *
 * ⛔ `ask_turns.body` NEVER RECEIVES `proposed_text`. The conversation says what
 * MAIA is doing; the proposal row records exactly what she proposes. Copying the
 * wording into the turn because the thread schema wants text would create a second
 * authoritative answer to "what did she propose", and RC-06 already says what
 * happens then.
 *
 * ⛔ NOTHING HERE WRITES TO A WORK.
 */

import type { TransactionClient } from '../../db/postgres';
import type { RevisionOutcome } from './outcome';

export interface RevisionPersistInput {
  threadId: string;
  memberId: string;
  manuscriptId: string;
  draftId: string;
  /** What the writer asked, persisted as their own turn. */
  authorBody: string;
  /** MAIA's conversational reply — her reasons, never her proposed wording. */
  maiaBody: string;
  outcome: RevisionOutcome;
  /** Frozen at read time; one per section, keyed by sectionId. */
  evidence: Readonly<Record<string, { basedOn: unknown; readState: unknown; coverage: unknown }>>;
  /** The S3 disclosure that licensed the reading. Required for origin='work'. */
  authority: unknown;
  producer: string;
  inputFingerprint: string;
  staleness: unknown;
}

export interface RevisionPersistResult {
  authorTurnIndex: number;
  producerTurnIndex: number;
  proposalIds: readonly string[];
}

const APPEND_TURN = `
  INSERT INTO ask_turns (thread_id, turn_index, speaker, body, staleness)
  SELECT t.id,
         COALESCE((SELECT MAX(turn_index) + 1 FROM ask_turns WHERE thread_id = t.id), 0),
         $2, $3, $4
    FROM ask_threads t
   WHERE t.id = $1 AND t.member_id = $5
  RETURNING turn_index`;

const INSERT_PROPOSAL = `
  INSERT INTO manuscript_revision_proposals
    (manuscript_id, draft_id, section_id, member_id,
     thread_id, produced_in_turn_index,
     proposed_text, reason, based_on, read_state, coverage,
     origin, authority, producer, input_fingerprint)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'work',$12,$13,$14)
  RETURNING id`;

/**
 * Persist one revision act. The caller owns the transaction, so this composes
 * with whatever else must land in the same historical moment.
 *
 * ⭐ The producer turn is appended BEFORE the proposals and its index is passed
 * to them directly — the proposal never searches for the turn that produced it.
 * RC-08a's trigger then refuses any proposal whose producer is absent or is not
 * a MAIA turn, so the binding is enforced twice: by construction here, and by the
 * database regardless of what any caller does.
 */
export async function persistRevisionActWithClient(
  client: TransactionClient,
  input: RevisionPersistInput,
): Promise<RevisionPersistResult> {
  const stale = JSON.stringify(input.staleness);

  const author = await client.query<{ turn_index: number }>(APPEND_TURN, [
    input.threadId, 'author', input.authorBody, stale, input.memberId,
  ]);
  if (author.rows.length === 0) throw new Error('thread_not_found');

  const producer = await client.query<{ turn_index: number }>(APPEND_TURN, [
    input.threadId, 'maia', input.maiaBody, stale, input.memberId,
  ]);
  if (producer.rows.length === 0) throw new Error('thread_not_found');
  const producerTurnIndex = Number(producer.rows[0].turn_index);

  /* ⭐ RC-07a. Restraint writes no proposal row, because no proposal occurred.
     The MAIA turn already records what she said. */
  if (input.outcome.kind === 'no_change') {
    return {
      authorTurnIndex: Number(author.rows[0].turn_index),
      producerTurnIndex,
      proposalIds: [],
    };
  }

  const proposalIds: string[] = [];
  for (const p of input.outcome.proposals) {
    const ev = input.evidence[p.sectionId];
    if (!ev) {
      /* A proposal whose bounded original was never frozen has nothing to be
         current against. Refusing here keeps an unanswerable row out of the
         record rather than letting staleness discover it later. */
      throw new Error(`no frozen evidence for section ${p.sectionId}`);
    }
    const r = await client.query<{ id: string }>(INSERT_PROPOSAL, [
      input.manuscriptId, input.draftId, p.sectionId, input.memberId,
      input.threadId, producerTurnIndex,
      p.proposedText, p.reason,
      JSON.stringify(ev.basedOn), JSON.stringify(ev.readState), JSON.stringify(ev.coverage),
      JSON.stringify(input.authority), input.producer, input.inputFingerprint,
    ]);
    proposalIds.push(r.rows[0].id);
  }

  return {
    authorTurnIndex: Number(author.rows[0].turn_index),
    producerTurnIndex,
    proposalIds,
  };
}
