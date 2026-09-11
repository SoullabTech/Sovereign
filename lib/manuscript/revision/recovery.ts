/**
 * RC-GEN-01 · 3C-2 — recovering a historical act instead of performing it again.
 *
 * ⭐ RECOVERY IS NOT RECONCILIATION. Where the receipt and the substrate
 * disagree, that is evidence of damaged history — never permission to pick
 * whichever record is convenient, and never permission to downgrade a
 * `proposals` receipt to `no_change` because the proposal is missing.
 */

import type { TransactionClient } from '../../db/postgres';
import type { RevisionOutcome } from './outcome';

export type RecoveryResult =
  | { kind: 'recovered'; outcome: RevisionOutcome }
  /** The act was consumed but never completed. Visibly distinct from a replay. */
  | { kind: 'incomplete' }
  /** ⛔ Receipt and substrate contradict each other. Never repaired by guessing. */
  | { kind: 'corrupt'; reason: string }
  | { kind: 'unknown' };

export type InvocationCheck =
  | { kind: 'replay' }
  | { kind: 'conflict'; expected: string; received: string }
  | { kind: 'unbound' }
  | { kind: 'unknown' };

/** Classify a presented (actId, digest) against what the substrate already holds. */
export async function checkInvocation(
  client: TransactionClient, ref: string, actId: string, digest: string,
): Promise<InvocationCheck> {
  const r = await client.query<{ consumed_by_act: string | null; request_digest: string | null }>(
    `SELECT consumed_by_act, request_digest FROM pending_ask_claims WHERE ref = $1`, [ref]);
  const row = r.rows[0];
  if (!row || row.consumed_by_act === null) return { kind: 'unknown' };
  if (row.consumed_by_act !== actId) return { kind: 'unknown' };
  if (row.request_digest === null) return { kind: 'unbound' };
  return row.request_digest === digest
    ? { kind: 'replay' }
    : { kind: 'conflict', expected: row.request_digest, received: digest };
}

/**
 * Read the durable receipt and reconstruct the typed outcome from the substrate.
 *
 * ⛔ Never infers `no_change` from an absent proposal row. `outcome_kind` is
 * positive evidence, and its absence under a completed act is corruption.
 */
export async function recoverAct(
  client: TransactionClient, ref: string,
): Promise<RecoveryResult> {
  const r = await client.query<{
    thread_id: string; completed_at: Date | null;
    outcome_kind: string | null; produced_in_turn_index: number | null;
  }>(`SELECT thread_id, completed_at, outcome_kind, produced_in_turn_index
        FROM pending_ask_claims WHERE ref = $1`, [ref]);
  const row = r.rows[0];
  if (!row) return { kind: 'unknown' };

  if (row.completed_at === null) {
    /* The schema forbids half a receipt, so either half present here is damage. */
    if (row.outcome_kind !== null || row.produced_in_turn_index !== null) {
      return { kind: 'corrupt', reason: 'receipt evidence present without completion' };
    }
    return { kind: 'incomplete' };
  }
  if (row.outcome_kind === null || row.produced_in_turn_index === null) {
    return { kind: 'corrupt', reason: 'completed act without its receipt evidence' };
  }

  const turn = await client.query<{ speaker: string; body: string }>(
    `SELECT speaker, body FROM ask_turns WHERE thread_id = $1 AND turn_index = $2`,
    [row.thread_id, row.produced_in_turn_index]);
  if (turn.rows.length === 0) return { kind: 'corrupt', reason: 'producer turn is missing' };
  if (turn.rows[0].speaker !== 'maia') {
    return { kind: 'corrupt', reason: 'producer locator does not name a MAIA turn' };
  }

  const proposals = await client.query<{ section_id: string; proposed_text: string; reason: string }>(
    `SELECT section_id, proposed_text, reason
       FROM manuscript_revision_proposals
      WHERE thread_id = $1 AND produced_in_turn_index = $2
      ORDER BY created_at, id`,
    [row.thread_id, row.produced_in_turn_index]);

  if (row.outcome_kind === 'no_change') {
    /* ⛔ A proposal attached to a restraint act is contradiction, not a hint. */
    if (proposals.rows.length > 0) {
      return { kind: 'corrupt', reason: 'no_change receipt with proposals attached to its producer' };
    }
    return { kind: 'recovered', outcome: { kind: 'no_change', reason: turn.rows[0].body } };
  }

  if (proposals.rows.length === 0) {
    /* ⛔ NEVER downgrade to no_change. The receipt says she proposed. */
    return { kind: 'corrupt', reason: 'proposals receipt with no proposal rows' };
  }

  const recovered = proposals.rows.map((p) => ({
    sectionId: p.section_id, proposedText: p.proposed_text, reason: p.reason,
  }));
  return {
    kind: 'recovered',
    outcome: { kind: 'proposals', proposals: recovered as [typeof recovered[0], ...typeof recovered] },
  };
}
