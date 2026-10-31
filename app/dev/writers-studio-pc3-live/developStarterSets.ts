import type { DevelopIntentKey } from './P4R1DevelopView';

/**
 * Which starter questions Develop offers first, and which wait under "Other ways to explore".
 *
 * The first three an author meets are invitations of equal warmth: just exploring, hearing what MAIA thinks, seeing the shape.
 * None presupposes that something is wrong. The problem-framed starters ("Something feels off", "This doesn't sound like me",
 * "I'm not sure what this chapter is doing", "I'm losing the thread") are still here for the author who arrives with exactly that,
 * one step further in, never removed.
 */
export const FOCUSED_INTENTS: readonly DevelopIntentKey[] = ['exploring', 'maia-thinks', 'shape'];

export function guidedIntents(hasExplicitPlace: boolean): readonly DevelopIntentKey[] {
  return hasExplicitPlace
    ? ['chapter-role', 'feels-off', 'voice', 'recurrence', 'thread', 'reader', 'help-look']
    : ['help-look', 'feels-off', 'thread', 'voice', 'reader'];
}
