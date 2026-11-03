/**
 * SEMANTIC-FIELD-01 · conversation-first Focus, step 1 (founder adoption 2026-11-03,
 * WRITERS-STUDIO-SEMANTIC-FIELD-01_FUNCTION_CASE_STUDY_2026-11-03.md §7).
 *
 * The Focus cards, their follow-ups and the passage menu used to send long composed
 * instructions as the writer's own words. F1 (#2071) ruled that pressing a button
 * counts as the writer saying its words, so — as for Teach me (`teachingTurn.ts`) and
 * the free box (`conversationTurn.ts`) — each act now has two halves:
 * - `passageActQuestion` is the WRITER'S WORDS: short, what the button says, the only
 *   thing stored as the writer's turn;
 * - `passageActInstruction` is SERVER-OWNED: how MAIA answers. It travels as the closed
 *   `passageAct` field and is added to the system prompt, never stored as speech.
 *
 * ⛔ The instruction text is moved here, not reworded: the revise packet labels are
 * parsed by the panel, so they must stay exactly as they were.
 * ⛔ Teach me stays in `teachingTurn.ts` (owned by the implicit-Academy work).
 */

import { EDITORIAL_PACKET_LABELS } from '@/lib/writersStudio/editorialIntelligence';

export type PassageAct = 'discuss' | 'revise' | 'revise-after-talk' | 'examples' | 'ideas' | 'deeper';

export const PASSAGE_ACTS: readonly PassageAct[] = ['discuss', 'revise', 'revise-after-talk', 'examples', 'ideas', 'deeper'];

export function isPassageAct(value: unknown): value is PassageAct {
  return typeof value === 'string' && (PASSAGE_ACTS as readonly string[]).includes(value);
}

/** The writer's words for each act: the writer's turn, as stored. */
export function passageActQuestion(act: PassageAct): string {
  switch (act) {
    case 'discuss': return 'Let’s talk about what’s happening in this passage.';
    case 'revise': return 'Show me edit options for this passage.';
    case 'revise-after-talk': return 'Show me revision options, from what we’ve discussed.';
    case 'examples': return 'Show me examples of what could work here.';
    case 'ideas': return 'Give me ideas for where this passage could go.';
    case 'deeper': return 'Go deeper on this passage.';
  }
}

const REVISE: readonly string[] = [
  'Help me revise this exact passage.',
  'Start with exactly these three short lines in plain language:',
  `"${EDITORIAL_PACKET_LABELS.preserve}: …"`,
  `"${EDITORIAL_PACKET_LABELS.friction}: …" — support this from the exact words; do not grade or diagnose the writing.`,
  `"${EDITORIAL_PACKET_LABELS.possibility}: …" — name the editorial move and why you would try it.`,
  'Then offer one concrete possible revision of this exact passage. I have already asked for edit options, so do not ask whether I want a revision and do not defer the proposal to a later turn. Preserve my voice, intention, subject, and intentional ambiguity.',
  'After the revision, add exactly these four short lines:',
  '"What changed: …"',
  '"Why: …"',
  '"Reader effect: …" — treat this as a hypothesis, never a fact about actual readers.',
  '"What I protected: …"',
  'Keep the explanation concrete and tied to the exact words. Separate meaning changes from style changes and say what could be lost.',
  'Nothing is to be applied automatically.',
];

function body(act: PassageAct): readonly string[] {
  switch (act) {
    case 'discuss': return [
      'Discuss what is happening in this exact passage with me before proposing any edits.',
      'Reflect what you notice in plain language and ask me one useful question about what I am trying to do.',
      'Do not propose replacement wording unless I ask.',
    ];
    case 'revise': return REVISE;
    case 'revise-after-talk': return ['Based on what we just discussed, help me revise this exact passage.', ...REVISE];
    case 'examples': return [
      'Show me examples of how a craft move could work in this exact passage.',
      'Give me two or three clearly labeled illustrative examples.',
      'Treat them as examples, not recommendations, and explain briefly what each example demonstrates.',
      'Do not apply or save any example automatically.',
    ];
    case 'ideas': return [
      'Give me several ideas for where this exact passage could go.',
      'Offer distinct creative directions rather than near-duplicate rewrites.',
      'Describe the intention of each direction in one human sentence before showing any wording.',
      'Do not rank them and do not apply anything automatically.',
    ];
    case 'deeper': return [
      'Go deeper on this exact passage.',
      'Use full craft and editorial vocabulary, but keep every claim tied to the words on the page.',
      'Separate meaning from style, evidence from interpretation, and reader-effect hypotheses from facts.',
      'Do not propose replacement wording unless I ask.',
    ];
  }
}

/** How MAIA answers the act the writer pressed: server-owned, never the writer's turn. */
export function passageActInstruction(act: PassageAct): string {
  return ['WHAT THE WRITER ASKED FOR (they pressed a button; written as they would put it)', ...body(act)].join('\n\n');
}
