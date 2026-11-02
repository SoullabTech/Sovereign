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
 * ⛔ MAIA judges what the QUESTION asks for, never the writer (L6c). Nothing
 * here names or infers who the writer is; the Studio does no breadth detection
 * of its own.
 * Shared by design: the implicit-Academy teaching shape (`teachingTurn.ts`,
 * owned by that work) may compose from this so the two cannot drift apart.
 */

export const CONVERSATION_TURN_SHAPE: readonly string[] = [
  'Answer as a conversation: lead with the most important thing, in a few plain sentences.',
  'End with one short question that lets me choose where we go next.',
  'If my question itself asks for breadth — all of it, a full list, everything you notice, a complete walk-through — give the full answer instead, organised so I can scan it.',
  'Decide that only from what my question asks for. Do not guess at what I can handle, and say nothing about my ability.',
];

/** The writer's own question, followed by the conversational shape. */
export function conversationTurnPrompt(question: string): string {
  return [question, '', ...CONVERSATION_TURN_SHAPE].join('\n');
}
