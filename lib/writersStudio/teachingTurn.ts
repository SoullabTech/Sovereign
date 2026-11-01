/**
 * SEMANTIC-FIELD-01 · the implicit Academy: one way MAIA teaches.
 *
 * Founder direction 2026-11-01: teaching is part of a conversation, not a full
 * info dump, and the level is the writer's to set. Every "Teach me" in the
 * Studio builds its message here, so no entry point can drift back into asking
 * for the whole lesson at once (guarded by `teachingTurnEntryPoints.test.ts`).
 *
 * One idea per turn, in the writer's own words, then one question the writer
 * steers by. The technical term, what a move costs, other moves and exercises
 * wait until the writer asks for them.
 *
 * ⛔ Nothing here names or infers the writer's level (L6c). The writer sets the
 * next step by answering MAIA's question or choosing a depth.
 * ⛔ Teaching never proposes replacement wording unless the writer asks.
 */

export type TeachingAnchor = 'passage' | 'observation' | 'change' | 'direction';

export const TEACHING_TURN_SHAPE: readonly string[] = [
  'Keep it to a few plain sentences about one idea, shown in my own words.',
  'Do not add the technical term, what the move costs, other moves, or an exercise unless I ask for them.',
  'End with one short question that lets me choose where we go next — for example whether to say it more simply, look at why it works, or see what it costs.',
  'Do not propose replacement wording unless I ask.',
  'Do not test me or say anything about my ability.',
];

function opening(anchor: TeachingAnchor, subject?: string): string[] {
  switch (anchor) {
    case 'passage':
      return [
        'Teach me about the writing in this exact passage, as a conversation rather than a lesson.',
        'Start with just one thing that is already working here and what it does.',
      ];
    case 'observation':
      return [
        'Teach me the craft at work in this observation, as a conversation rather than a lesson.',
        'Start with the one writing idea most at work in what you noticed, shown in my own words.',
      ];
    case 'change':
      return [
        `Teach me the writing technique involved in ${subject ?? 'this change'}, as a conversation rather than a lesson.`,
        'Start with the one thing this change does to my sentence.',
      ];
    case 'direction':
      return [
        'Teach me why this editorial direction may or may not work in this exact passage, as a conversation rather than a lesson.',
        'Start with the one craft reason that matters most here, using my original wording and the current working direction.',
      ];
  }
}

/** The first teaching turn for an anchor. */
export function teachingTurnPrompt(anchor: TeachingAnchor, subject?: string): string {
  return [...opening(anchor, subject), ...TEACHING_TURN_SHAPE].join('\n\n');
}

/** The next teaching turn, continuing the conversation rather than restarting the lesson. */
export function continueTeachingPrompt(): string {
  return [
    'Keep teaching from where we are in this conversation about this exact passage.',
    'Take the next single step: what I asked for if I said, otherwise the next thing worth knowing here. Do not repeat what you have already explained.',
    ...TEACHING_TURN_SHAPE,
  ].join('\n\n');
}
