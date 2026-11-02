/**
 * SEMANTIC-FIELD-01 · Design 3C — the free "Ask MAIA" box is a conversation by
 * default, and a full answer when the question asks for one.
 *
 * Founder ruling 2026-11-02 (WRITERS-STUDIO-SEMANTIC-FIELD-01_FOUNDER_DESIGN_RULINGS_2026-11-02.md):
 * a typed question went out with no conversational shape and could come back
 * as an info dump. Replies now lead with the most important thing, stay short,
 * and end with a question the writer steers by — unless the question itself
 * asks for breadth, which MAIA then gives in full.
 *
 * ⭐ SERVER-OWNED, like the teaching shape (F1, founder 2026-11-02): the client
 * sends only what the writer typed, plus the closed `turnShape: 'conversation'`
 * field. `conversationTurnInstruction()` is added to the system prompt; it is
 * never stored as a sentence the writer said.
 *
 * ⛔ MAIA judges what the QUESTION asks for, never the writer (L6c). Nothing
 * here names or infers who the writer is; the Studio does no breadth detection
 * of its own.
 * Shared by design: the implicit-Academy teaching shape (`teachingTurn.ts`,
 * owned by that work) may compose from `CONVERSATION_TURN_SHAPE`.
 */

export type TurnShape = 'conversation';

export function isTurnShape(value: unknown): value is TurnShape {
  return value === 'conversation';
}

export const CONVERSATION_TURN_SHAPE: readonly string[] = [
  'Answer as a conversation: lead with the most important thing, in a few plain sentences.',
  'End with one short question that lets me choose where we go next.',
  'If my question itself asks for breadth — all of it, a full list, everything you notice, a complete walk-through — give the full answer instead, organised so I can scan it.',
  'Decide that only from what my question asks for. Do not guess at what I can handle, and say nothing about my ability.',
];

/** How MAIA answers a question the writer typed or spoke in the free Ask box. */
export function conversationTurnInstruction(): string {
  return [
    'THE WRITER ASKED IN THEIR OWN WORDS',
    'The writer typed or spoke this question about the exact passage in view. Start by reflecting what they want, in plain language. Work only from this passage and what they have explicitly asked. Do not change or apply anything unless they later choose a revision and explicitly apply it.',
    'Shape the answer this way (written as the writer would put it):',
    ...CONVERSATION_TURN_SHAPE.map((line) => `- ${line}`),
  ].join('\n');
}
