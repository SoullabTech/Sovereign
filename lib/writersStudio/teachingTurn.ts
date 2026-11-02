/**
 * SEMANTIC-FIELD-01 · the implicit Academy: one way MAIA teaches.
 *
 * Founder direction 2026-11-01: teaching is part of a conversation, not a full
 * info dump, and the level is the writer's to set. One idea per turn, in the
 * writer's own words, then one question the writer steers by. The technical
 * term, what a move costs, other moves and exercises wait until the writer
 * asks for them.
 *
 * ⭐ TWO HALVES, KEPT APART (F1 ruling, founder 2026-11-02).
 * - `teachingQuestion` is the WRITER'S WORDS: what the button says, and the
 *   only thing a client sends as the writer's turn. Pressing a button counts as
 *   the writer saying its words, so these stay short and visible, and carry no
 *   rule, policy or remark about the writer.
 * - `teachingTurnInstruction` is SERVER-OWNED: how MAIA answers. It travels as
 *   a closed `teachingAnchor` field and is added to the system prompt beside
 *   `editorialDirective`, never stored as another sentence the writer said.
 * Guarded by `teachingTurnEntryPoints.test.ts`.
 *
 * ⛔ Nothing here names or infers the writer's level (L6c). The writer sets the
 * next step by answering MAIA's question or choosing a depth.
 * ⛔ Teaching never proposes replacement wording unless the writer asks.
 */

export type TeachingAnchor = 'passage' | 'observation' | 'change' | 'direction' | 'continue';

export const TEACHING_ANCHORS: readonly TeachingAnchor[] = [
  'passage', 'observation', 'change', 'direction', 'continue',
];

export function isTeachingAnchor(value: unknown): value is TeachingAnchor {
  return typeof value === 'string' && (TEACHING_ANCHORS as readonly string[]).includes(value);
}

/** The writer's words for each teaching button: the writer's turn, as stored. */
export function teachingQuestion(anchor: TeachingAnchor, subject?: string): string {
  switch (anchor) {
    case 'passage':
      return 'Teach me about the writing in this passage.';
    case 'observation':
      return 'Teach me the craft at work in what you noticed.';
    case 'change':
      return `Teach me about ${subject ?? 'this change'}.`;
    case 'direction':
      return 'Teach me why this direction might work here.';
    case 'continue':
      return 'Teach me more.';
  }
}

/** How MAIA keeps a teaching turn: server-owned, never the writer's turn. */
export const TEACHING_TURN_SHAPE: readonly string[] = [
  'Keep it to a few plain sentences about one idea, shown in my own words.',
  'Do not add the technical term, what the move costs, other moves, or an exercise unless I ask for them.',
  'End with one short question that lets me choose where we go next — for example whether to say it more simply, look at why it works, or see what it costs.',
  'Do not propose replacement wording unless I ask.',
  'Do not test me or say anything about my ability.',
];

function opening(anchor: TeachingAnchor): string[] {
  switch (anchor) {
    case 'passage':
      return [
        'I have asked you to teach me about the writing in this exact passage, as a conversation rather than a lesson.',
        'Start with just one thing that is already working here and what it does.',
      ];
    case 'observation':
      return [
        'I have asked you to teach me the craft at work in this observation, as a conversation rather than a lesson.',
        'Start with the one writing idea most at work in what you noticed, shown in my own words.',
      ];
    case 'change':
      return [
        'I have asked you to teach me the writing technique involved in the change I named, as a conversation rather than a lesson.',
        'Start with the one thing this change does to my sentence.',
      ];
    case 'direction':
      return [
        'I have asked you to teach me why this editorial direction may or may not work in this exact passage, as a conversation rather than a lesson.',
        'Start with the one craft reason that matters most here, using my original wording and the current working direction.',
      ];
    case 'continue':
      return [
        'I have asked you to keep teaching from where we are in this conversation about this exact passage.',
        'Take the next single step: what I asked for if I said, otherwise the next thing worth knowing here. Do not repeat what you have already explained.',
      ];
  }
}

/** The system-prompt instruction for a teaching turn. Server-side only. */
export function teachingTurnInstruction(anchor: TeachingAnchor): string {
  return [...opening(anchor), ...TEACHING_TURN_SHAPE].join(' ');
}
