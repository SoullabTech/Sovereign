/**
 * BUILD-07E — what the room does when it reopens on an observation, and when it
 * is allowed to speak.
 *
 * ONE INVARIANT GOVERNS THIS FILE, and it is 07E's invariant everywhere else:
 *
 *     UNKNOWN NEVER ROUNDS TO THE CONVENIENT ANSWER.
 *
 * `observationLocation` refuses to round unmeasured to current. This refuses to
 * round "could not find out whether earlier conversations exist" to "there are
 * none" — because that rounding does not merely mislead, it WRITES: the next
 * question posts an anchor and opens a second thread beside the one it was
 * about to resume.
 *
 * PURE, AND SEPARATE FROM THE COMPONENT, so the dangerous states are falsifiable
 * directly rather than inferred from a regex over JSX. The component performs
 * these decisions; it does not contain them, and it does not re-derive them
 * beside them.
 *
 * ⛔ THERE IS NO SILENT "LATEST WINS" RULE. Many threads per anchor are lawful —
 * `threadStore`'s identity is `id`, never `(manuscriptId, anchor)`. With one
 * thread there is nothing to choose. With more than one, choosing FOR the writer
 * would quietly make one conversation canonical and strand the others: the room
 * would look like it remembered, while having picked.
 */

export interface ThreadSummary {
  id: string;
  openedAt: string;
  turnCount: number;
}

/**
 * What discovery ACTUALLY established.
 *
 * A DISCRIMINATED RESULT, NOT AN ARRAY. The transport used to map every failure
 * to `[]`, which made "the server did not answer" and "there are none" the same
 * value — and only one of them is safe to act on.
 */
export type ThreadDiscovery =
  | { kind: 'threads'; threads: readonly ThreadSummary[] }
  | { kind: 'unavailable'; reason: string };

export type ResumeDecision =
  /** Discovery SUCCEEDED and found nothing. The next question opens a thread. */
  | { kind: 'fresh' }
  /** Exactly one. Nothing to choose; resume it and show what was said. */
  | { kind: 'resume'; threadId: string }
  /** More than one. The writer picks; the room does not. */
  | { kind: 'choose'; threads: readonly ThreadSummary[] }
  /** Discovery FAILED. Not "none" — the room does not know, and must not write. */
  | { kind: 'unavailable'; reason: string };

export function resumeDecision(discovery: ThreadDiscovery): ResumeDecision {
  if (discovery.kind === 'unavailable') {
    /* THE ROUNDING THIS FUNCTION EXISTS TO REFUSE. `fresh` here would be a
       transient GET failure silently authoring a duplicate thread. */
    return { kind: 'unavailable', reason: discovery.reason };
  }
  const { threads } = discovery;
  if (threads.length === 0) return { kind: 'fresh' };
  if (threads.length === 1) return { kind: 'resume', threadId: threads[0].id };
  return { kind: 'choose', threads };
}

/**
 * How — and whether — the next question may be sent.
 *
 * THE PAYLOAD AND THE PERMISSION ARE ONE ANSWER. A surface that disabled the
 * button from one rule and chose `{ anchor }` vs `{ threadId }` from another
 * would have two chances to disagree, and the disagreement writes a row.
 *
 * `adopting` IS THE CASE THE FOUNDER FOUND. Between "discovery says resume
 * thread X" and "thread X has been loaded" there is an await. During it the
 * decision is `resume` while `threadId` is still null — and a fast question in
 * that window would have gone out by anchor and opened a second thread. Resume
 * without an adopted id is therefore NOT sendable, rather than falling through
 * to the anchor path.
 */
export type SendMode =
  /** Lawful only where discovery succeeded and found nothing. */
  | { kind: 'open' }
  /** The thread is known; the question continues it. */
  | { kind: 'resume'; threadId: string }
  | { kind: 'blocked'; why: 'discovering' | 'unavailable' | 'choosing' | 'adopting' };

export function sendMode(
  decision: ResumeDecision | null,
  threadId: string | null,
): SendMode {
  if (decision === null) return { kind: 'blocked', why: 'discovering' };
  if (decision.kind === 'unavailable') return { kind: 'blocked', why: 'unavailable' };
  if (decision.kind === 'choose') return { kind: 'blocked', why: 'choosing' };
  /* An adopted thread wins over the decision that led to it: after a `fresh`
     thread is opened by the first question, the second must continue it. */
  if (threadId !== null) return { kind: 'resume', threadId };
  if (decision.kind === 'resume') return { kind: 'blocked', why: 'adopting' };
  return { kind: 'open' };
}

/**
 * How a resumable thread is offered, in the writer's terms.
 *
 * NO IDS. A chooser listing thread identifiers would ask the writer to recognise
 * a UUID — the failure Reader-04 removed from MAIA's prose, reappearing in the
 * interface instead of the model.
 */
export function threadChoiceLabel(t: ThreadSummary, formatWhen: (iso: string) => string): string {
  const turns = t.turnCount === 1 ? '1 turn' : `${t.turnCount} turns`;
  return `${formatWhen(t.openedAt)} · ${turns}`;
}

/**
 * The dialogue surface's identity.
 *
 * `(readingId, observationKey)` — DECIDE INV-2's address, and it is the whole
 * of it. `o1` is stable only WITHIN one reading, so a surface keyed on the
 * observation key alone is reused when the writer selects a different reading:
 * the room then shows reading B's observation while the component still holds
 * reading A's thread, and the next question appends to A's conversation.
 * `sendMode` cannot catch that and should not try — it correctly assumes its
 * thread belongs to its own anchor.
 *
 * EXPORTED SO THE ROOM CANNOT SPELL IT DIFFERENTLY. A key composed inline is a
 * key that can quietly lose half of itself in a later edit.
 */
export function dialogueSurfaceKey(readingId: string, observationKey: string): string {
  return `${readingId}:${observationKey}`;
}
