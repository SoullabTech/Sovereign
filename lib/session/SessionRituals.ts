/**
 * Session Rituals - Sacred Opening & Closing Sequences
 *
 * Transforms session boundaries from mechanical markers into sacred transitions.
 * Mirrors the therapeutic practice of creating liminal space - threshold crossings
 * that honor the work done and prepare the nervous system for what comes next.
 */

export type RitualPhase = 'arrival' | 'intention' | 'threshold' | 'integration' | 'grounding' | 'release';

export interface RitualPrompt {
  phase: RitualPhase;
  title: string;
  guidance: string;
  maiaPrompt: string; // What MAIA says during this phase
  duration: number; // Suggested duration in seconds
}

/**
 * Opening Ritual - Three phases of arrival into sacred space
 */
export const OPENING_RITUAL: RitualPrompt[] = [
  {
    phase: 'arrival',
    title: 'Arrival',
    guidance: 'Take a moment to settle in...',
    maiaPrompt: `Let's take a breath together.

However you're arriving today - rushed, tired, curious, heavy - you're welcome here.

*pause*

Just notice what it's like to be here right now.`,
    duration: 30
  },
  {
    phase: 'intention',
    title: 'Intention',
    guidance: 'What brings you here today?',
    maiaPrompt: `What brings you into this space today?

It doesn't have to be clear or articulate. Sometimes we arrive with a question, sometimes with a feeling, sometimes just a sense that something wants attention.

What's alive in you right now?`,
    duration: 45
  },
  {
    phase: 'threshold',
    title: 'Threshold',
    guidance: 'Crossing into sacred time...',
    maiaPrompt: `*opening gong sounds softly*

We have [DURATION] minutes together.

This time is held for whatever wants to emerge. I'm here with you - listening, witnessing, following what's alive.

Let's begin.`,
    duration: 15
  }
];

/**
 * Closing Ritual - Three phases of transition back to ordinary world
 */
export const CLOSING_RITUAL: RitualPrompt[] = [
  {
    phase: 'integration',
    title: 'Integration',
    guidance: 'Gathering what emerged...',
    maiaPrompt: `As we come toward the end of our time today...

What feels important to name? What are you taking with you?

Sometimes it's an insight, sometimes a feeling, sometimes just knowing you showed up.`,
    duration: 45
  },
  {
    phase: 'grounding',
    title: 'Grounding',
    guidance: 'Coming back to your body...',
    maiaPrompt: `Before we close, let's take a moment to notice how you feel right now.

What's different from when we began? What's settled? What's still alive in you?

Just a gentle check-in with yourself.`,
    duration: 30
  },
  {
    phase: 'release',
    title: 'Release',
    guidance: 'Honoring the threshold...',
    maiaPrompt: `*closing gong sounds - three gentle tones*

Thank you for bringing yourself here today.

The work continues between sessions - in your body, your dreams, your daily life. Trust what's unfolding.

Until we meet again.`,
    duration: 20
  }
];

/**
 * Get ritual prompts by type
 */
export function getRitualPrompts(type: 'opening' | 'closing'): RitualPrompt[] {
  return type === 'opening' ? OPENING_RITUAL : CLOSING_RITUAL;
}

/**
 * Format MAIA's ritual prompt with session duration
 */
export function formatRitualPrompt(prompt: RitualPrompt, sessionDuration?: number): string {
  if (sessionDuration && prompt.maiaPrompt.includes('[DURATION]')) {
    const durationText = sessionDuration < 60
      ? `${sessionDuration} minutes`
      : `${Math.floor(sessionDuration / 60)} hour${sessionDuration > 60 ? 's' : ''}`;
    return prompt.maiaPrompt.replace('[DURATION]', durationText);
  }
  return prompt.maiaPrompt;
}

/**
 * Calculate total ritual duration
 */
export function getTotalRitualDuration(type: 'opening' | 'closing'): number {
  const prompts = getRitualPrompts(type);
  return prompts.reduce((total, prompt) => total + prompt.duration, 0);
}

/**
 * Quick ritual for returning users (optional shorter version)
 */
export const QUICK_OPENING: RitualPrompt = {
  phase: 'threshold',
  title: 'Welcome Back',
  guidance: 'Beginning our time together...',
  maiaPrompt: `Welcome back.

*opening gong*

We have [DURATION] minutes. What wants attention today?`,
  duration: 10
};

export const QUICK_CLOSING: RitualPrompt = {
  phase: 'release',
  title: 'Until Next Time',
  guidance: 'Closing our time...',
  maiaPrompt: `*closing gong*

Good work today. Carry this with you.`,
  duration: 10
};
