/**
 * CONVERSATION-STAGE · step 3 (founder rulings Q2 and Q4, 2026-11-05) — Develop's
 * buttons put only the writer's words in the writer's turn.
 *
 * F1 (#2071) ruled that pressing a button counts as the writer saying its words.
 * Q2 extended it: no composed Studio text is stored as the writer's turn, in
 * Develop or anywhere. These buttons used to place, or auto-send, long
 * instructions to MAIA written in the writer's voice ("Stay with this exact
 * place… Begin by asking me…"). How MAIA answers is server-owned: the
 * developmental-ask standing for observations, the Work-conversation standing
 * for the Work, and `responseStyle` for depth.
 *
 * ⛔ Starters that carry MAIA's own material (an Attention Map item, a lineage
 * candidate, a developmental movement) are not here: moving that material
 * server-side needs a context channel the Work conversation does not have yet.
 */
import type { ExplanationDepth } from '@/lib/writersStudio/workingStyle';

export type ObservationStarter = 'plain' | 'talk' | 'deeper';

/** What the writer says when they press an observation button, and the depth it asks for. */
export const OBSERVATION_STARTERS: Readonly<Record<ObservationStarter, {
  readonly words: string;
  readonly responseStyle?: ExplanationDepth;
}>> = {
  plain: { words: 'Explain this plainly.', responseStyle: 'plain' },
  talk: { words: 'Let’s talk about this.' },
  deeper: { words: 'Go deeper on this, with the full editorial detail.', responseStyle: 'expert' },
};

/** "Talk with MAIA" at a place: the writer names where they are, and nothing more. */
export function placeStarter(label?: string | null): string {
  return label ? `Let’s talk about “${label}”.` : 'Let’s talk about my Work.';
}

/** The guided next moves that open the Work conversation, as the writer would say them. */
export const GUIDED_STARTERS = {
  'whole-work-conversation': 'Let’s start with the whole Work before the details.',
  'map-written-and-planned': 'Help me map what’s written, what’s planned, and what’s still open.',
  'clarify-central-question': 'Help me stay with the central question of this Work.',
  'sketch-possible-structure': 'Help me explore possible shapes for this Work.',
  'stay-at-this-scale': 'I want to stay at this scale and keep thinking.',
} as const;
