/**
 * Writer's Studio — the Inspiration Opening (the Spark door).
 *
 * JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 · S1. Governing documents:
 *   docs/programme/WRITERS-STUDIO-INSPIRATION-OPENING-01_BUILD_DESIGN_2026-11-11.md
 *   docs/programme/WRITERS-STUDIO-INSPIRATION-OPENING-01_FLOW_2026-11-11.md
 *
 * MAIA may notice, reflect, propose and ask. The writer declares. `sparkCommitPlan` is the ONE place that decides
 * whether anything from the opening reaches the Work. It returns the exact text to store (the writer's own words,
 * untouched) or null with the reason. Nothing else in the door may write `purpose`.
 *
 * Founder rulings 2026-11-11: the opening conversation itself is never kept (Q1). Only Fire is asked at the door (Q4).
 * Later new Works get one line (Q3).
 */
import type { WriterWorkingStyle } from './workingStyle';

/** The single question at the door (Fire, asked alone). */
export const INSPIRATION_COPY = {
  question: 'Before anything else: what’s calling you to write?',
  invitation: 'It can be a feeling, an image, a sentence you can’t shake. You don’t need to have it figured out.',
  answerLabel: 'Your words',
  tell: 'Tell MAIA',
  unsure: 'I don’t know yet',
  justWrite: 'Just let me write',
  havePages: 'I already have pages',
  heardQuestion: 'Am I hearing that right?',
  heard: { yes: 'Yes', partly: 'Partly', not_quite: 'Not quite', differently: 'Let me say it differently' },
  whatChange: 'Say it again, in whatever words are closer.',
  holdQuestion: 'Would you like me to hold that as the spark of this Work?',
  holdOwn: 'Hold it in my words',
  holdOwnHint: 'Your sentence, exactly as you wrote it',
  notYet: 'Not yet',
  notYetHint: 'Nothing is saved to the Work',
  holdScope: 'Holding saves your words to this Work, and nothing else. Our conversation here isn’t kept either way.',
  sanctuaryHold: 'You’re in Sanctuary, so I won’t keep this: not the spark, and not our conversation. It was still worth saying.',
  switchToOrdinary: 'Switch to Ordinary so I can keep it',
  beginQuestion: 'Where would you like to begin?',
  facetQuestion: 'How would you like me to work with you?',
  facetNote: 'You can change this anytime. It doesn’t change your Work.',
  nextWorkQuestion: 'What’s calling this one?',
  tooLong: 'That’s more than I can hold as a spark. You can keep all of it on the page, or say the heart of it in fewer words.',
  unreachable: 'I couldn’t answer just now. Nothing was kept. You can try again, or go straight to the page.',
} as const;

/** What "I don't know yet" sends to MAIA. It is a complete answer, never a spark (F5). */
export const INSPIRATION_UNSURE_ANSWER = 'I don’t know yet. I just know something wants to be written.';

/** Same limit as the member-act PATCH that stores `purpose` (app/api/sovereign/living-works/[id]/route.ts). */
export const MAX_SPARK_CHARS = 2000;

export type HeardAnswer = 'yes' | 'partly' | 'not_quite' | 'differently';
/** S1 offers only the writer's own words or nothing. "Help me say it" and "Still discovering" need S2's history. */
export type HoldChoice = 'own' | 'not_yet';

export interface OpeningState {
  /** The writer's latest answer, exactly as typed. */
  answer: string;
  /** True when the writer chose "I don't know yet". */
  unsure: boolean;
  /** MAIA's latest reflection. Never stored. Present here only so a test can prove it is not what gets held. */
  reflection: string | null;
  /** The comprehension check. Never an adoption (ARRIVAL-EXPERIENCE finding 1). */
  understood: HeardAnswer | null;
  /** Whether the writer was ever shown the separate hold question. */
  holdReached: boolean;
  hold: HoldChoice | null;
  sanctuary: boolean;
}

export type SparkCommitReason =
  | 'held_own_words'
  | 'not_held'
  | 'sanctuary'
  | 'never_reached'
  | 'unsure'
  | 'empty'
  | 'too_long';

export interface SparkCommitPlan {
  /** The exact text to store as the Work's purpose, or null: nothing reaches the Work. */
  purpose: string | null;
  reason: SparkCommitReason;
}

export function sparkCommitPlan(state: OpeningState): SparkCommitPlan {
  if (state.sanctuary) return { purpose: null, reason: 'sanctuary' };
  if (!state.holdReached) return { purpose: null, reason: 'never_reached' };
  if (state.unsure) return { purpose: null, reason: 'unsure' };
  if (state.hold !== 'own') return { purpose: null, reason: 'not_held' };
  if (state.answer.trim().length === 0) return { purpose: null, reason: 'empty' };
  if (state.answer.length > MAX_SPARK_CHARS) return { purpose: null, reason: 'too_long' };
  return { purpose: state.answer, reason: 'held_own_words' };
}

/** The full door is for a first visit only: no Works and no writing yet (F6). */
export function shouldShowInspirationDoor(counts: { works: number; manuscripts: number }): boolean {
  return counts.works === 0 && counts.manuscripts === 0;
}

export type FacetChoice = 'guide' | 'teach' | 'control' | 'not_now';

export const FACET_COPY: Record<FacetChoice, string> = {
  guide: 'Guide me',
  teach: 'Teach me as we go',
  control: 'Give me full control',
  not_now: 'Not now',
};

/**
 * The charter's three relationships, onto the existing presentation preference (no second facet store).
 * Presentation only: how much MAIA explains and translates, never how much she writes (charter §9.3).
 * "Not now" returns null, so nothing is written and the shared default stays in force.
 */
export function facetWorkingStyle(choice: FacetChoice): WriterWorkingStyle | null {
  switch (choice) {
    case 'guide': return { pace: 'intimate', explanation: 'plain' };
    case 'teach': return { pace: 'guided', explanation: 'guided' };
    case 'control': return { pace: 'mapped', explanation: 'craft' };
    default: return null;
  }
}
