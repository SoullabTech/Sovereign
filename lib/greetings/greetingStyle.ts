/**
 * Greeting Style Chooser — how MAIA enters the room with this person.
 *
 * Not a voice engine thing. A social tone profile.
 * Think: "how does their friendship with MAIA feel?"
 *
 * Priority:
 *   1. Member explicit setting (greeting_style preference)
 *   2. Voice archetype hint (Puck → playful, Elder → ritual)
 *   3. RelationshipEssence inference (only if stable)
 *   4. Default: warm
 *
 * SOVEREIGNTY: Humor is earned. Playful style requires the humor gate to pass.
 */

import type { GreetingStyle } from './types';
import type { GreetingSignals } from './greetingScoring';

/**
 * Map voice archetype → default greeting style.
 * The archetype is a strong hint — if someone chose Puck, they want levity.
 */
const ARCHETYPE_TO_STYLE: Record<string, GreetingStyle> = {
  puck: 'playful',
  elder: 'ritual',
  maia_warm: 'warm',
  maia_clear: 'clear',
  maia_core: 'warm',
  mentor: 'clear',
};

/**
 * Is humor eligible for this member right now?
 *
 * Humor must be earned and bounded:
 * - High encounter count (5+)
 * - Stable morphic resonance (0.6+)
 * - NOT during threshold/tender states
 * - NOT in sanctuary
 */
function isHumorEligible(s: GreetingSignals): boolean {
  if (s.sanctuary) return false;
  if (s.thresholdActive) return false;
  if ((s.encounterCount ?? 0) < 5) return false;
  if ((s.morphicResonance ?? 0) < 0.6) return false;
  // Tender motion (stuck, breakthrough) → no humor
  if (s.motion === 'stuck' || s.motion === 'breakthrough') return false;
  return true;
}

/**
 * Choose greeting style for this member + moment.
 *
 * Returns { style, source } for observability.
 */
export function chooseGreetingStyle(
  s: GreetingSignals,
  opts?: {
    memberPreference?: GreetingStyle | null;
    voiceArchetype?: string | null;
  }
): { style: GreetingStyle; source: string } {
  // Sanctuary: always warm, zero personality risk
  if (s.sanctuary) {
    return { style: 'warm', source: 'sanctuary_default' };
  }

  // 1. Explicit member preference (highest priority)
  if (opts?.memberPreference) {
    // If they chose playful but humor isn't eligible, downgrade to warm
    if (opts.memberPreference === 'playful' && !isHumorEligible(s)) {
      return { style: 'warm', source: 'preference_playful_downgraded' };
    }
    return { style: opts.memberPreference, source: 'member_preference' };
  }

  // 2. Voice archetype hint
  if (opts?.voiceArchetype) {
    const archetypeStyle = ARCHETYPE_TO_STYLE[opts.voiceArchetype];
    if (archetypeStyle) {
      // Same humor gate for archetype-implied playful
      if (archetypeStyle === 'playful' && !isHumorEligible(s)) {
        return { style: 'warm', source: 'archetype_playful_downgraded' };
      }
      return { style: archetypeStyle, source: `archetype_${opts.voiceArchetype}` };
    }
  }

  // 3. RelationshipEssence inference (only if stable enough)
  if ((s.morphicResonance ?? 0) > 0.7 && (s.encounterCount ?? 0) > 8) {
    // Deep relationship — could earn spacious/ritual style
    if (s.dominantElement === 'aether' || s.dominantElement === 'water') {
      return { style: 'spacious', source: 'essence_deep_water_aether' };
    }
    if (s.dominantElement === 'fire') {
      return { style: 'clear', source: 'essence_deep_fire' };
    }
  }

  // 4. Default: warm
  return { style: 'warm', source: 'default' };
}
