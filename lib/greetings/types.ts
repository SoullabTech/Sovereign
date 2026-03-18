/**
 * Structured Greeting Types — Phase 3: Lane-based greeting system.
 *
 * A greeting is not a string. It's a governed ritual with:
 * - lanes (one signal per greeting, never a data dump)
 * - style (how MAIA enters the room with this person)
 * - gates (consent, relevance, closeness, freshness)
 * - observability (why this lane, what memory was used)
 *
 * SOVEREIGNTY: Personalization serves arrival, not surveillance.
 * If it would surprise them ("how do you know that?"), don't use it.
 */

/**
 * Greeting lanes — pick exactly one per greeting.
 *
 * identity     — "Good evening, Kelly." (time + name, always safe)
 * continuity   — "Still working with X?" (recent theme, soft noun)
 * gentle_recall — "Something's familiar here." (relationship essence, not content)
 * threshold    — "Feels like a threshold moment." (active decision/crossing)
 * intention    — "Do you want warmth, clarity, or momentum?" (orientation)
 */
export type GreetingLane =
  | 'identity'
  | 'continuity'
  | 'gentle_recall'
  | 'threshold'
  | 'intention';

/**
 * Greeting style — how MAIA enters the room with this person.
 * Not a voice engine thing — a social tone profile.
 *
 * warm     — soft, affectionate, steady (default)
 * clear    — friendly but crisp, direct
 * playful  — light humor, witty warmth (earned, not default)
 * spacious — minimal words, slow entry
 * ritual   — mythic, reverent, ceremonial
 */
export type GreetingStyle = 'warm' | 'clear' | 'playful' | 'spacious' | 'ritual';

/**
 * Safety metadata — why we chose this lane, what memory was used.
 * This is the audit trail that proves MAIA serves the person, not the data model.
 */
export type GreetingSafety = {
  usedMemory: boolean;
  sanctuary: boolean;
  reason: string;
  creepinessScore?: number;
};

/**
 * Memory reference — what structural memory informed the greeting.
 * Internal only, never rendered. For observability and debugging.
 */
export type GreetingMemoryRef = {
  kind:
    | 'relationship_essence'
    | 'last_conversation_theme'
    | 'spiral_state'
    | 'trajectory_focus'
    | 'threshold_event';
  id?: string;
  freshnessDays?: number;
};

/**
 * The structured greeting object.
 *
 * line1 — always safe (time + name at most)
 * line2 — optional personalization (only when gates pass)
 * style — social tone (warm/playful/clear/spacious/ritual)
 */
export type Greeting = {
  lane: GreetingLane;
  style: GreetingStyle;
  line1: string;
  line2?: string;
  memoryRef?: GreetingMemoryRef;
  safety: GreetingSafety;
  debug?: {
    candidateScores?: Record<GreetingLane, number>;
    chosenScore?: number;
    styleSource?: string;
  };
};
