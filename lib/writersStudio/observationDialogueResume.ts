/**
 * BUILD-07E — what the room does when it reopens on an observation.
 *
 * PURE, AND SEPARATE FROM THE COMPONENT, so the decision can be falsified
 * without mounting React. The component's job is to perform this decision, not
 * to contain it.
 *
 * WHY A DECISION AT ALL. Many threads per anchor are LAWFUL — `threadStore`
 * says so explicitly, and its identity is `id`, never `(manuscriptId, anchor)`.
 * So reopening is not "load the thread"; it is "find out how many there are and
 * do the honest thing about it".
 *
 * ⛔ THERE IS NO SILENT "LATEST WINS" RULE, and this file is where that would
 * have been written. With one thread there is nothing to choose and resuming is
 * unambiguous. With more than one, choosing FOR the writer would quietly make
 * one conversation canonical and strand the others — the room would look like
 * it remembered, while having picked. The writer is asked.
 *
 * ORDER IS PRESERVED AS THE SERVER GAVE IT (newest first, by `opened_at`). That
 * is presentation order for a choice, not a ranking that decides anything.
 */

export interface ThreadSummary {
  id: string;
  openedAt: string;
  turnCount: number;
}

export type ResumeDecision =
  /** No prior conversation on this observation. The next question opens one. */
  | { kind: 'fresh' }
  /** Exactly one. Nothing to choose; resume it and show what was said. */
  | { kind: 'resume'; threadId: string }
  /** More than one. The writer picks; the room does not. */
  | { kind: 'choose'; threads: readonly ThreadSummary[] };

export function resumeDecision(threads: readonly ThreadSummary[]): ResumeDecision {
  if (threads.length === 0) return { kind: 'fresh' };
  if (threads.length === 1) return { kind: 'resume', threadId: threads[0].id };
  return { kind: 'choose', threads };
}

/**
 * How a resumable thread is offered, in the writer's terms.
 *
 * NO IDS. A chooser that listed thread identifiers would be asking the writer to
 * recognise a UUID — the same failure Reader-04 removed from MAIA's prose, in
 * the interface instead of the model.
 */
export function threadChoiceLabel(t: ThreadSummary, formatWhen: (iso: string) => string): string {
  const turns = t.turnCount === 1 ? '1 turn' : `${t.turnCount} turns`;
  return `${formatWhen(t.openedAt)} · ${turns}`;
}
