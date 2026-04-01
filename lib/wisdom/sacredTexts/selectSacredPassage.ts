/**
 * selectSacredPassage — Multi-tradition passage selection
 *
 * Core principle: each tradition expresses a different mode of knowing.
 * MAIA matches the mode, not the text.
 *
 * Ranking priority:
 *   1. Mode alignment (hard preference)
 *   2. State affinity match
 *   3. Element alignment
 *   4. Engagement style
 *   5. Intensity
 *
 * Constraints:
 *   - Intensity guard: no intensity=3 passages when state is 'strain'
 *   - Tradition coherence: prefer active session tradition, max 1 switch
 */

import type {
  SacredPassageEntry,
  SacredTradition,
  Element,
  EncounterState,
  SacredMode,
  EngagementStyle,
  EncounterSessionContext,
} from './types';
import { SacredTextRegistry } from './SacredTextRegistry';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE → MODE MAPPING
//
// Which mode of knowing best meets each lived state?
// This is the "mode determines tradition" principle.
// ═══════════════════════════════════════════════════════════════════════════════

const STATE_TO_PREFERRED_MODE: Record<EncounterState, SacredMode[]> = {
  strain: ['revelation', 'philosophical'],     // needs holding, not pushing
  searching: ['paradox', 'philosophical'],      // needs opening, not answering
  remorse: ['instruction', 'revelation'],       // needs directness about return
  restlessness: ['philosophical', 'paradox'],   // needs spaciousness, not stimulation
  endurance: ['instruction', 'philosophical'],  // needs grounding, steadfastness
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATE → ELEMENT DEFAULTS (when spiralogicCell not available)
// ═══════════════════════════════════════════════════════════════════════════════

const STATE_TO_DEFAULT_ELEMENT: Record<EncounterState, Element> = {
  strain: 'earth',
  searching: 'air',
  remorse: 'water',
  restlessness: 'water',
  endurance: 'earth',
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCORING
// ═══════════════════════════════════════════════════════════════════════════════

interface ScoredPassage {
  entry: SacredPassageEntry;
  score: number;
}

function scorePassage(
  entry: SacredPassageEntry,
  state: EncounterState,
  element: Element,
  sessionContext: EncounterSessionContext,
): number {
  let score = 0;
  const meta = entry._meta;

  // 1. Mode alignment (highest weight: 40 points)
  const preferredModes = STATE_TO_PREFERRED_MODE[state];
  if (preferredModes[0] === meta.mode) score += 40;
  else if (preferredModes[1] === meta.mode) score += 25;
  else if (preferredModes.includes(meta.mode)) score += 15;

  // 2. State affinity (30 points)
  if (meta.stateAffinity.includes(state)) score += 30;

  // 3. Element alignment (15 points)
  if (meta.element === element) score += 15;

  // 4. Engagement style bonus (10 points)
  // Reflective is safest for most states; direct is better for remorse/endurance
  if (state === 'remorse' || state === 'endurance') {
    if (meta.engagementStyle === 'direct') score += 10;
  } else {
    if (meta.engagementStyle === 'reflective') score += 10;
  }

  // 5. Tradition coherence bonus (5 points)
  if (sessionContext.activeTradition && entry.tradition === sessionContext.activeTradition) {
    score += 5;
  }

  return score;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface SelectionInput {
  /** Detected lived state */
  state: EncounterState;
  /** Element from spiralogicCell (if available) */
  element?: Element;
  /** Session tradition tracking */
  sessionContext: EncounterSessionContext;
}

export interface SelectionResult {
  entry: SacredPassageEntry;
  score: number;
}

/**
 * Select the best passage across all traditions for the current state.
 * Returns null if no suitable passage passes all guards.
 */
export function selectSacredPassage(input: SelectionInput): SelectionResult | null {
  const element = input.element ?? STATE_TO_DEFAULT_ELEMENT[input.state];

  // Get all candidates
  let candidates = SacredTextRegistry.getAllEntries();

  // Intensity guard: no intensity=3 when strain (fragile state)
  if (input.state === 'strain') {
    candidates = candidates.filter(e => e._meta.intensity < 3);
  }

  // Tradition lock: if already switched once, lock to current tradition
  if (input.sessionContext.hasSwitchedTradition && input.sessionContext.activeTradition) {
    candidates = candidates.filter(e => e.tradition === input.sessionContext.activeTradition);
  }

  if (candidates.length === 0) return null;

  // Score all candidates
  const scored: ScoredPassage[] = candidates
    .map(entry => ({
      entry,
      score: scorePassage(entry, input.state, element, input.sessionContext),
    }))
    .filter(s => s.score > 0) // must have at least some relevance
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  return scored[0];
}
