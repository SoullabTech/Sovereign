/**
 * WRITERS-STUDIO · CONVERSATION STAGE · R2 "MAIA opens" (founder rulings 2026-11-04/05).
 *
 * When the writer deliberately opens a conversation on a passage, MAIA speaks first:
 * one specific observation and one question. The writer has said nothing yet, so
 * (O1(a)) NO writer turn is stored — the gesture is recorded as a typed event
 * (`opened_conversation_on_passage`) on MAIA's turn and on the relationship episode.
 *
 * ⛔ The instruction below is SERVER-OWNED. It rides in the system prompt only and is
 *    never stored as anyone's speech. The opening is an observation and a question,
 *    NEVER a proposal (the route and the runtime both force reply_only).
 */

export const OPENING_GESTURE = 'opened_conversation_on_passage' as const;
export type OpeningGesture = typeof OPENING_GESTURE;

export function isOpeningGesture(value: unknown): value is OpeningGesture {
  return value === OPENING_GESTURE;
}

/** What stands in the user-message slot for model input. Not stored; not the writer's words. */
export const OPENING_STAND_IN =
  '[The writer has just opened a conversation about this passage and has not said anything yet.]';

export function conversationOpeningInstruction(): string {
  return [
    'THE WRITER HAS JUST OPENED A CONVERSATION ABOUT THIS EXACT PASSAGE AND HAS NOT SAID ANYTHING YET',
    'You speak first. Say one specific thing you notice in these exact words, in plain language and without editorial jargon. Then ask one short question about what they are trying to do here.',
    'Do not propose replacement wording. Do not praise or grade the writing. Do not claim to know what the writer intends.',
    'Keep it short: a few plain sentences, ending with the one question.',
  ].join('\n');
}
