/**
 * Pattern Inquiry Protocol — lib/studio/patternInquiryProtocol.ts
 *
 * Types, week configuration, and context builder functions for the
 * PatternInquiryProtocol feature.
 *
 * Key responsibilities:
 *   1. WEEK_CONFIGS — 6 weeks of structured inquiry configuration
 *   2. loadActiveProtocol(memberId) — DB read with graceful null fallback
 *   3. buildProtocolContextHeader(protocol) — lean injection: name, week, goal
 *   4. buildProtocolListeningGuidance(protocol) — 2-4 tracking cues with sovereignty note
 *
 * Philosophy: Protocol context is INVISIBLE SCAFFOLDING. MAIA must not reference
 * the protocol by name in responses. These strings inform listening, not direction.
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type ProtocolStatus = 'draft' | 'active' | 'paused' | 'completed';
export type CouncilGuide = 'strategist' | 'body_listener' | 'pattern_seer' | 'symbolist';

export interface WeekConfig {
  title: string;
  goal: string;
  maiaPrompt: string;
  dailyPrompts: string[];
  trackingFocus: string[];
}

export interface ActiveProtocol {
  id: string;
  patternName: string;
  patternDescription?: string | null;
  trigger?: string | null;
  behavior?: string | null;
  immediateReward?: string | null;
  longTermCost?: string | null;
  currentWeek: number;
  weekConfig: WeekConfig;
  // Derived cues for oracle injection — never include practitioner notes
  somaticCues?: string | null;
  triggerContexts?: string | null;
}

export interface ProtocolRow {
  id: string;
  pattern_name: string;
  pattern_description: string | null;
  trigger: string | null;
  behavior: string | null;
  immediate_reward: string | null;
  long_term_cost: string | null;
  current_week: number;
  status: ProtocolStatus;
}

// ═══════════════════════════════════════════════════════════════
// Week Configurations
// All 6 weeks of the practitioner protocol
// ═══════════════════════════════════════════════════════════════

export const WEEK_CONFIGS: Record<number, WeekConfig> = {
  1: {
    title: 'Baseline Observation',
    goal: 'Observe the pattern without trying to change it',
    maiaPrompt:
      'This week we are in an observation phase. Notice what arises without judgment or pressure to shift anything yet.',
    dailyPrompts: [
      'Did the pattern show up today? What was happening around it?',
      'What did you notice in your body just before it happened?',
      'Looking back on today — what conditions made the pattern more or less likely?',
    ],
    trackingFocus: [
      'when the pattern appears (time, context, social setting)',
      'what preceded it (mood, body state, external trigger)',
      'what followed it (relief, regret, numbness, energy)',
      'any moments when it almost happened but didn\'t',
    ],
  },
  2: {
    title: 'Somatic Mapping',
    goal: 'Identify the body signal that precedes the pattern',
    maiaPrompt:
      'This week we are mapping where the pattern lives in the body. The felt sense before the behaviour is often the earliest accessible signal.',
    dailyPrompts: [
      'Where did you feel it first today — before any action was taken?',
      'What was the body doing in the moments leading up to it?',
      'If that body sensation had a name or an image, what would it be?',
    ],
    trackingFocus: [
      'specific body location of the trigger sensation',
      'quality of sensation (tight, warm, hollow, buzzing)',
      'how early the signal appears before the behaviour',
      'whether slowing down and sensing the body changes anything',
    ],
  },
  3: {
    title: 'Origin Inquiry',
    goal: 'Explore the relational or developmental history of the pattern',
    maiaPrompt:
      'This week we trace roots. Patterns rarely begin in the present. Something learned it was necessary — often long ago.',
    dailyPrompts: [
      'When you sit with the pattern, what earlier time comes to mind?',
      'Who in your history would have recognised this behaviour?',
      'What did this pattern originally protect you from or provide?',
    ],
    trackingFocus: [
      'earliest memory connected to this behaviour',
      'relational context in which pattern was first adaptive',
      'what the pattern says about belonging, safety, or worth',
      'moments of compassion or understanding toward the pattern\'s origin',
    ],
  },
  4: {
    title: 'Micro-Intervention',
    goal: 'Install a pause practice between trigger and behaviour',
    maiaPrompt:
      'This week we introduce a pause. Not to stop the pattern by force — but to create a moment of choice that wasn\'t there before.',
    dailyPrompts: [
      'Did you catch the signal in time to pause today? What happened?',
      'What did the pause feel like — relief, discomfort, unfamiliar?',
      'If you paused but still acted on the pattern, what did you learn?',
    ],
    trackingFocus: [
      'how often the pause was attempted vs. missed',
      'what the pause revealed (urge intensity, thought content)',
      'whether any alternative response emerged naturally in the pause',
      'quality of self-relationship during and after the pause attempt',
    ],
  },
  5: {
    title: 'Pattern Integration',
    goal: 'Reflect across the arc of the inquiry — what has shifted in the system',
    maiaPrompt:
      'This week we hold the whole. Not just the behaviour, but the person who has been watching it with growing honesty.',
    dailyPrompts: [
      'Compared to week one — what feels different about this pattern now?',
      'What have you learned that you couldn\'t have known at the start?',
      'Where is the pattern still strong? Where has it softened?',
    ],
    trackingFocus: [
      'changes in frequency or intensity of the pattern',
      'changes in the emotional relationship to the pattern',
      'new capacities or awarenesses that have emerged',
      'what the pattern still needs from you',
    ],
  },
  6: {
    title: 'Closing the Inquiry',
    goal: 'Synthesise learning and articulate what replaces or transforms the pattern',
    maiaPrompt:
      'This is the closing of a sustained inquiry. We gather what was learned and give it a form that can be carried forward.',
    dailyPrompts: [
      'If you wrote a short letter to this pattern, what would it say?',
      'What commitment, if any, do you want to make to yourself from here?',
      'What would the absence of this pattern make possible in your life?',
    ],
    trackingFocus: [
      'clearest insight gained across the six weeks',
      'what will be done differently and why',
      'support or accountability structures to maintain the shift',
      'gratitude or acknowledgment for the work done',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// 1. loadActiveProtocol
// ═══════════════════════════════════════════════════════════════

/**
 * Load the active protocol for a member.
 * Returns null if no active protocol exists, or on any error (graceful fallback).
 *
 * Used at oracle conversation start to provide invisible context scaffolding.
 * Never throws — failure silently degrades to no protocol context.
 */
export async function loadActiveProtocol(memberId: string): Promise<ActiveProtocol | null> {
  try {
    const result = await query<ProtocolRow>(
      `SELECT
        id,
        pattern_name,
        pattern_description,
        trigger,
        behavior,
        immediate_reward,
        long_term_cost,
        current_week,
        status
      FROM studio_pattern_protocols
      WHERE member_id = $1
        AND status = 'active'
      LIMIT 1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const week = Math.max(1, Math.min(6, row.current_week));
    const weekConfig = WEEK_CONFIGS[week];

    if (!weekConfig) {
      console.warn(`[protocol] Unknown week number ${week} for protocol ${row.id}`);
      return null;
    }

    return {
      id: row.id,
      patternName: row.pattern_name,
      patternDescription: row.pattern_description,
      trigger: row.trigger,
      behavior: row.behavior,
      immediateReward: row.immediate_reward,
      longTermCost: row.long_term_cost,
      currentWeek: week,
      weekConfig,
      // Derive somatic cues from trigger for oracle listening guidance
      somaticCues: row.trigger ? `somatic signals preceding: ${row.trigger}` : null,
      triggerContexts: row.trigger ?? null,
    };
  } catch (error) {
    // Graceful fallback — protocol loading must never break the oracle
    console.warn('[protocol] Failed to load active protocol for member:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. buildProtocolContextHeader
// ═══════════════════════════════════════════════════════════════

/**
 * Build the lean protocol context header for oracle system prompt injection.
 *
 * Contains: pattern name, current week number, week title, week goal.
 * Kept intentionally minimal — no habit loop anatomy in context header.
 * Separation of concerns: header = what we're tracking; guidance = how to listen.
 */
export function buildProtocolContextHeader(protocol: ActiveProtocol): string {
  const { weekConfig, currentWeek } = protocol;

  return [
    `[Pattern Inquiry Context]`,
    `Pattern: ${protocol.patternName}`,
    `Week ${currentWeek} of 6: ${weekConfig.title}`,
    `Week goal: ${weekConfig.goal}`,
    `[End Pattern Inquiry Context]`,
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════
// 3. buildProtocolListeningGuidance
// ═══════════════════════════════════════════════════════════════

/**
 * Build the listening guidance cues for oracle system prompt injection.
 *
 * Contains 2-4 week-specific tracking cues drawn from the week config.
 * Always ends with the sovereignty note: "Let this inform your listening
 * and reflection, not direct it."
 *
 * IMPORTANT: This is invisible scaffolding. MAIA must not reference the
 * protocol, pattern name, or week number in responses. It informs listening
 * only — never direction, explicit framing, or protocol disclosure.
 */
export function buildProtocolListeningGuidance(protocol: ActiveProtocol): string {
  const { weekConfig } = protocol;

  // Take the first 4 tracking cues (specification: 2-4 listening cues)
  const cues = weekConfig.trackingFocus.slice(0, 4);

  const lines: string[] = [
    `[Listening Guidance — do not reference these directly in responses]`,
    `In your listening this session, hold awareness of:`,
    ...cues.map((cue) => `- ${cue}`),
    ``,
    `Let this inform your listening and reflection, not direct it.`,
    `Do not mention the pattern inquiry, protocol, or any of these cues by name in your response.`,
    `[End Listening Guidance]`,
  ];

  return lines.join('\n');
}
