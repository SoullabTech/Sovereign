/**
 * Participatory Reality Framework — Shared Types & Element Map
 *
 * Six lenses for noticing how human experience moves.
 * These are perceptual grammars, not causal laws.
 *
 * Philosophy: "Human participation in reality" — orientation, attention,
 * and response; not manufacture or control.
 *
 * Spiralogic element mapping:
 *   field_awareness     → aether   (relational field, shared atmosphere)
 *   pattern_recurrence  → water    (psyche, memory, repetition)
 *   embodied_coherence  → fire + water (state, alignment, integration)
 *   adaptive_unfolding  → air      (meaning, navigation, choice)
 *   wise_acceptance     → earth    (grounding, regulation, reality contact)
 *   ripeness            → aether   (emergence, synchronicity, timing)
 */

import type { Element } from '@/lib/types/voiceIntent';

// ═══════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════

export type ParticipatoryTheme =
  | 'field_awareness'
  | 'pattern_recurrence'
  | 'embodied_coherence'
  | 'adaptive_unfolding'
  | 'wise_acceptance'
  | 'ripeness';

export type ThemeSignalType =
  | 'active'       // Clearly present in session
  | 'emerging'     // Beginning to surface
  | 'blocked'      // Resistance to this theme detected
  | 'integrating'; // Member is working with / moving through this theme

export interface ThemeSignal {
  theme: ParticipatoryTheme;
  signal_type: ThemeSignalType;
  resonance_strength: number; // 0–1
  element: Element;
  context?: Record<string, unknown>; // structural ref only, never session content
  detected_at?: Date;
}

export interface MemberThemeSignalRow {
  id: number;
  member_id: string;
  session_id?: string | null;
  journal_entry_id?: string | null;
  theme: ParticipatoryTheme;
  signal_type: ThemeSignalType;
  resonance_strength: number | null;
  element: Element | null;
  context: Record<string, unknown>;
  detected_at: Date;
}

export interface ThemeRecurrence {
  theme: ParticipatoryTheme;
  count: number;
  first_seen: Date;
  last_seen: Date;
  dominant_signal_type: ThemeSignalType;
  dominant_element: Element | null;
}

// ═══════════════════════════════════════════════════════════════
// Element Map
// ═══════════════════════════════════════════════════════════════

/**
 * Primary element resonance for each theme.
 * Where a theme touches multiple elements (e.g. embodied_coherence = fire + water),
 * the primary is listed here; the conductor may factor in the secondary.
 */
export const THEME_ELEMENT_MAP: Record<ParticipatoryTheme, Element> = {
  field_awareness:    'aether',
  pattern_recurrence: 'water',
  embodied_coherence: 'fire',   // fire leads; water is secondary
  adaptive_unfolding: 'air',
  wise_acceptance:    'earth',
  ripeness:           'aether',
};

/**
 * Secondary element resonance (where applicable).
 */
export const THEME_SECONDARY_ELEMENT: Partial<Record<ParticipatoryTheme, Element>> = {
  embodied_coherence: 'water',
  ripeness:           'fire',
};

// ═══════════════════════════════════════════════════════════════
// Display Metadata (for UI cards and labels)
// ═══════════════════════════════════════════════════════════════

export interface ThemeDisplayMeta {
  label: string;
  practitionerLabel: string;
  element: Element;
  shortDescription: string;
  journalPrompt: string;
  tooltipText: string;
}

export const THEME_DISPLAY: Record<ParticipatoryTheme, ThemeDisplayMeta> = {
  field_awareness: {
    label: 'Field Awareness',
    practitionerLabel: 'Field Dynamic',
    element: 'aether',
    shortDescription:
      'The invisible atmosphere of a room, a relationship, a moment. What\'s present here that doesn\'t belong only to you?',
    journalPrompt:
      'What\'s in the atmosphere of this situation — beyond what you personally brought to it?',
    tooltipText: 'Noticing what\'s in the relational or collective field, not just the personal.',
  },
  pattern_recurrence: {
    label: 'Pattern Recurrence',
    practitionerLabel: 'Returning Pattern',
    element: 'water',
    shortDescription:
      'The psyche tends to circle back. Old themes return wearing new costumes. Recognizing recurrence is the moment before something finally changes.',
    journalPrompt:
      'Where have you been here before? What\'s different this time?',
    tooltipText: 'A theme or dynamic that has appeared before, arriving again in a new form.',
  },
  embodied_coherence: {
    label: 'Embodied Coherence',
    practitionerLabel: 'Coherence Tension',
    element: 'fire',
    shortDescription:
      'When what you think, feel, say, and do are roughly aligned, things tend to move. Incoherence isn\'t bad — it\'s information.',
    journalPrompt:
      'On a scale that\'s not about judgment — how aligned do you feel right now between what you know and how you\'re living?',
    tooltipText: 'The degree of alignment between stated intention and embodied state.',
  },
  adaptive_unfolding: {
    label: 'Adaptive Unfolding',
    practitionerLabel: 'Unfolding Edge',
    element: 'air',
    shortDescription:
      'Life responds to how you engage with it. Not because you control it, but because attention, choice, and meaning-making change what\'s possible.',
    journalPrompt:
      'What would shift if you treated this situation as responsive rather than fixed?',
    tooltipText: 'The moment of active navigation — where choice and meaning-making shape what unfolds.',
  },
  wise_acceptance: {
    label: 'Wise Acceptance',
    practitionerLabel: 'Resistance Point',
    element: 'earth',
    shortDescription:
      'Resistance costs energy. There is a difference between what you can change and what you need to move with. Acceptance isn\'t passivity — it\'s regaining ground.',
    journalPrompt:
      'What are you spending energy fighting that isn\'t going to change? What would it cost to stop?',
    tooltipText: 'Energy bound around non-acceptance — an invitation to distinguish what\'s changeable from what isn\'t.',
  },
  ripeness: {
    label: 'Ripeness',
    practitionerLabel: 'Ripeness Window',
    element: 'aether',
    shortDescription:
      'Not everything that\'s right is right now. There\'s a quality of timing that can be sensed — when the moment is ripe, action costs less and lands further.',
    journalPrompt:
      'Is this a moment of action, or a moment of preparation? How do you know?',
    tooltipText: 'A timing signal — the quality of readiness or emergence in the current moment.',
  },
};

// ═══════════════════════════════════════════════════════════════
// Language Markers (for detection heuristics)
// ═══════════════════════════════════════════════════════════════

/**
 * Informal language marker clusters for each theme.
 * Used by the detection helper to estimate which theme is present in member language.
 *
 * NOTE: These are soft signals — always low confidence unless multiple markers cluster.
 * Never override member framing with a theme name without bridge framing.
 */
export const THEME_LANGUAGE_MARKERS: Record<ParticipatoryTheme, string[]> = {
  field_awareness: [
    'the room feels',
    'something between us',
    'in the air',
    'everyone seems to be',
    'collective',
    'atmosphere',
    'the dynamic',
    'field',
    'shared',
    'relational pattern',
  ],
  pattern_recurrence: [
    'again',
    'always ends up',
    'been here before',
    'keeps happening',
    'same thing',
    'cycle',
    'loop',
    'recognize this',
    'familiar',
    'repeat',
    'echo',
    'once more',
  ],
  embodied_coherence: [
    'not aligned',
    'split',
    'contradiction',
    'say one thing',
    'not living what',
    'out of integrity',
    'conflicted',
    'incoherent',
    'doesn\'t match',
    'disconnect between',
    'feel one way',
    'tight',
    'tense',
  ],
  adaptive_unfolding: [
    'if I approach it',
    'how I engage',
    'what if I tried',
    'meaning of',
    'navigate',
    'respond differently',
    'interpret',
    'frame',
    'choose to see',
    'my part in',
  ],
  wise_acceptance: [
    'can\'t change',
    'fighting it',
    'resisting',
    'stuck on',
    'won\'t accept',
    'wish it were different',
    'need to let go',
    'hard to accept',
    'against it',
    'struggling to accept',
  ],
  ripeness: [
    'is now the time',
    'should I',
    'ready',
    'timing',
    'wait',
    'feel like it\'s time',
    'right moment',
    'not sure if now',
    'when to',
    'before I can',
    'feel ready',
    'sense that',
  ],
};

// ═══════════════════════════════════════════════════════════════
// Helper: Map current element to likely themes
// ═══════════════════════════════════════════════════════════════

/**
 * Given the member's current dominant element, return the themes
 * most likely to be relevant.
 *
 * Used by the oracle to weight which themes to hold lightly
 * without forcing — not to assign.
 */
export function getThemesForElement(element: Element): ParticipatoryTheme[] {
  const primary = Object.entries(THEME_ELEMENT_MAP)
    .filter(([, el]) => el === element)
    .map(([theme]) => theme as ParticipatoryTheme);

  const secondary = Object.entries(THEME_SECONDARY_ELEMENT)
    .filter(([, el]) => el === element)
    .map(([theme]) => theme as ParticipatoryTheme);

  return [...primary, ...secondary];
}

/**
 * Score each theme against member input text.
 * Returns themes above a minimum marker match count, sorted by score.
 *
 * LOW confidence by design — this is a heuristic, not a diagnosis.
 */
export function scoreThemesFromText(
  text: string,
  minMarkers = 1
): Array<{ theme: ParticipatoryTheme; score: number }> {
  const lower = text.toLowerCase();

  return Object.entries(THEME_LANGUAGE_MARKERS)
    .map(([theme, markers]) => {
      const score = markers.filter((m) => lower.includes(m)).length;
      return { theme: theme as ParticipatoryTheme, score };
    })
    .filter(({ score }) => score >= minMarkers)
    .sort((a, b) => b.score - a.score);
}
