'use client';

/**
 * Conversation-first Focus, step 2 (founder adoption 2026-11-03,
 * WRITERS-STUDIO-SEMANTIC-FIELD-01_FUNCTION_CASE_STUDY_2026-11-03.md §7):
 * Passage Focus shows the conversation, not only MAIA's latest reply.
 *
 * The transcript is the thread's own record (`thread.turns`), oldest first.
 * The writer's turns show what they actually said (step 1 made cards store only
 * their words). MAIA's turns are shown with Studio markers stripped; only her
 * latest turn may carry the offered control (Design 1B).
 *
 * ⛔ Display only: nothing here sends, saves or applies.
 * Older threads can hold long composed instructions from before step 1; those
 * are folded behind "Show the full message" rather than hidden or rewritten.
 */

import type { ReactNode } from 'react';
import { parseStudioActions } from '@/lib/writersStudio/studioActions';

export type FocusTurn = { turnIndex: number; speaker: 'author' | 'maia'; body: string };

const LONG_AUTHOR_TURN = 400;

export default function FocusConversation(props: {
  turns: readonly FocusTurn[];
  /** The control MAIA offered on her latest turn, already rendered by the panel. */
  latestAction?: ReactNode;
  /** Step 3: the writer's just-sent words, shown at once while MAIA answers. */
  pending?: string | null;
}) {
  const latestMaia = [...props.turns].reverse().find((t) => t.speaker === 'maia')?.turnIndex ?? null;
  const lastAuthor = [...props.turns].reverse().find((t) => t.speaker === 'author')?.body ?? null;
  // Once the thread holds the sent turn, the pending line would only repeat it.
  const pending = props.pending && props.pending !== lastAuthor ? props.pending : null;
  return (
    <ol className="p4r1-focus-conversation" data-focus-conversation aria-label="Your conversation with MAIA about this passage">
      {props.turns.map((t) => {
        const isMaia = t.speaker === 'maia';
        const text = isMaia ? parseStudioActions(t.body, 'passage-focus').text : t.body;
        const long = !isMaia && text.length > LONG_AUTHOR_TURN;
        return (
          <li key={t.turnIndex} data-turn-speaker={t.speaker} className={isMaia ? 'is-maia' : 'is-writer'}>
            <b>{isMaia ? 'MAIA' : 'You'}</b>
            {long ? (
              <details>
                <summary>{text.slice(0, 160).trimEnd()}… <span>Show the full message</span></summary>
                <p>{text}</p>
              </details>
            ) : (
              <p>{text}</p>
            )}
            {isMaia && t.turnIndex === latestMaia ? props.latestAction ?? null : null}
          </li>
        );
      })}
      {pending ? (
        <li data-turn-speaker="author" data-pending-turn className="is-writer is-pending">
          <b>You</b>
          <p>{pending}</p>
        </li>
      ) : null}
    </ol>
  );
}
