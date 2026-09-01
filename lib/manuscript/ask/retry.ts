/**
 * WS2-05B-8B-02c-2 — retrying a question that is already held.
 *
 * THE PROBLEM THIS SOLVES. The author's turn is persisted BEFORE the model is
 * called, so a failed answer leaves the question safely on the thread — that is
 * what "your words are held here" means, and it is why the client now keeps the
 * threadId through a refusal. But a retry then resumed the same thread and
 * appended the identical question a SECOND time, and because the prior turns are
 * replayed as history while the new question is appended separately, MAIA could
 * receive the same question twice in one request. The copy was true and the
 * behaviour was wrong.
 *
 * THE RULE IS NARROW ON PURPOSE. Only the LAST turn counts, it must be the
 * author's, it must be byte-identical to what was just submitted, and no MAIA
 * turn may have followed it — which the "last turn" condition already implies
 * and the name says out loud. Anything else is a new turn.
 *
 * IF THE AUTHOR EDITED THE WORDING, IT IS A NEW TURN. Rewording is thinking, and
 * a thread that silently folded a rephrasing into the previous question would
 * lose the record of what they actually asked first.
 *
 * A pure function with no database and no framework, because the defect lived in
 * the wiring and the wiring is what has to be checkable.
 */

export interface HeldTurn {
  speaker: 'author' | 'maia';
  body: string;
}

/**
 * Is this submission a retry of the question already sitting unanswered at the
 * end of the thread?
 */
export function isHeldRetry(
  turns: readonly HeldTurn[], question: string,
): boolean {
  const last = turns[turns.length - 1];
  return !!last && last.speaker === 'author' && last.body === question;
}

/**
 * The history to replay, given that `question` is sent separately.
 *
 * On a held retry the last turn IS the question, so it is dropped here rather
 * than reaching the model twice. On any other turn the history is untouched.
 */
export function historyFor<T extends HeldTurn>(
  turns: readonly T[], question: string,
): T[] {
  return isHeldRetry(turns, question) ? turns.slice(0, -1) : [...turns];
}
