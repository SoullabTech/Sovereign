/**
 * Exchange admission — who is allowed to run inference for an utterance.
 *
 * THE INVARIANT (founder ruling, 2026-08-17)
 *
 *     ONE user utterance
 *     ONE admitted exchange
 *     AT MOST ONE inference
 *     ONE assistant answer
 *
 * Not merely "one persisted user row". 2513 made the row unique but still let a
 * second request run a second inference:
 *
 *     REQUEST A  exchange X → inserts user turn → begins inference…
 *     REQUEST B  exchange X → insert is DUPLICATE
 *                           → looks for the answer, none yet
 *                           → begins ANOTHER inference   ← the defect
 *
 * The database prevented two rows; it did not guarantee one inference, and one
 * inference per human utterance is the entire load-bearing property. Under an
 * invite wave that is the difference between N and 2N calls against a
 * rate-limited upstream.
 *
 * ELECTION IS THE INSERT ITSELF
 *
 * `INSERT … ON CONFLICT (exchange_id, seq) DO NOTHING RETURNING id` is already
 * atomic: for a given exchange, exactly one concurrent request can come back
 * with a row. That IS the ownership acquisition — no status column, no advisory
 * lock, no second round trip that could itself race. The winner owns inference.
 * Every other request carrying that id must decline, whether or not the answer
 * exists yet.
 *
 * A duplicate with no answer does NOT mean "nothing has happened, go ahead". It
 * means "someone else owns this exchange and is producing the answer right now".
 * The correct reply is in_progress, never a second inference. That is the exact
 * sentence in 2513 — "falls through and generates, never worse" — that was
 * wrong: for this defect it is worse, because it forfeits the invariant.
 */

export type ExchangeAdmission =
  /** This request won the election. It alone may call the model. */
  | { action: 'run_inference' }
  /** Already answered. Serve what exists; cost nothing. */
  | { action: 'serve_existing'; answer: string }
  /** Another request owns it and has not finished. Decline, do not infer. */
  | { action: 'in_progress' }
  /** Sanctuary or provenance refused the write; nothing is durable. */
  | { action: 'refused' };

export type TurnWriteOutcomeLike = 'inserted' | 'duplicate' | 'refused';

/**
 * Decide what a request may do, given the atomic outcome of its user-turn write
 * and a lookup for an already-persisted answer.
 *
 * `findExistingAnswer` is only consulted on the duplicate path, so the winning
 * request pays no extra query.
 */
export async function admitExchange(
  writeOutcome: TurnWriteOutcomeLike,
  findExistingAnswer: () => Promise<string | null>
): Promise<ExchangeAdmission> {
  if (writeOutcome === 'refused') {
    return { action: 'refused' };
  }

  if (writeOutcome === 'inserted') {
    // Won the election. Exactly one concurrent request reaches here.
    return { action: 'run_inference' };
  }

  // Lost the election. Serve the answer if it is ready; otherwise say so.
  // Under no circumstance does this branch run inference.
  const existing = await findExistingAnswer();
  return existing ? { action: 'serve_existing', answer: existing } : { action: 'in_progress' };
}
