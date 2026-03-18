/**
 * Dynamic Range — Spiral-State-Aware Library Retrieval
 *
 * Determines how the Library consultation should be tuned based on
 * the member's current spiral state, conversation depth, and relational phase.
 *
 * The principle: wisdom arrives at the moment of readiness.
 * Not before. Not too much. Not in the wrong register.
 *
 * This is the difference between personalisation (what keeps them here?)
 * and dynamic range (what helps them leave?).
 */

import { LIBRARY_TRIGGERS } from './LibraryService';

// =============================================================================
// TYPES
// =============================================================================

export interface SpiralContext {
  element?: string;             // Current dominant element (fire/water/earth/air/aether)
  phase?: number;               // Current phase (1-3)
  motion?: string;              // ascending | stuck | breakthrough
  relationalPhase?: number;     // 1=orientation, 2=capacity, 3=autonomy, 4=seasonal return
  conversationDepth: number;    // Number of turns in current conversation
  distress?: {                  // Distress doorway context (from detectDistressSignals)
    isDistressed: boolean;
    intensity: 'low' | 'medium' | 'high';
    dominantTone: string;       // inferred element need (water/aether/earth/air)
  };
}

export interface DynamicRangeDecision {
  shouldConsult: boolean;       // Whether to consult the Library at all
  retrievalLimit: number;       // How many chunks to retrieve
  elementBoost: string | null;  // Element to boost in retrieval (or null for no bias)
  phaseFilter: string | null;   // Facet tag to prefer (e.g., 'WATER_2')
  includeDistillate: boolean;   // Whether to include distillate in results
  excerptMaxLength: number;     // Max chars per excerpt
  framingLevel: 'structured' | 'natural' | 'minimal';
  reason: string;               // Why this decision was made (for logging)
}

// =============================================================================
// DECISION LOGIC
// =============================================================================

/**
 * Calculate how the Library should engage given the member's current state.
 *
 * @param message - The user's current message
 * @param context - Their spiral state and conversation context
 * @returns Decision about if/how to consult the Library
 */
export function calculateDynamicRange(
  message: string,
  context: SpiralContext
): DynamicRangeDecision {

  // Gate 1: Too early in conversation — trust must be established first
  // EXCEPTION: Distress signals bypass this gate. Someone in pain
  // doesn't need to "earn" the Library through conversational depth.
  if (context.conversationDepth < 3 && !context.distress?.isDistressed) {
    return {
      shouldConsult: false,
      retrievalLimit: 0,
      elementBoost: null,
      phaseFilter: null,
      includeDistillate: false,
      excerptMaxLength: 0,
      framingLevel: 'minimal',
      reason: 'conversation_too_early',
    };
  }

  // Gate 1b: DISTRESS DOORWAY
  // When distress is detected at conversation start, the Library
  // consults lightly — not to lecture, but to shape MAIA's tone.
  // The member never sees the Library. They feel its presence.
  if (context.distress?.isDistressed && context.conversationDepth <= 1) {
    return {
      shouldConsult: true,
      retrievalLimit: 2,                              // Light — 1-2 chunks only
      elementBoost: context.distress.dominantTone,    // Bias toward inferred need
      phaseFilter: null,
      includeDistillate: true,                        // Distillates have practices
      excerptMaxLength: 200,                          // Short — presence not lecture
      framingLevel: 'minimal',                        // Library whispers, doesn't teach
      reason: 'distress_doorway',
    };
  }

  // Gate 2: Check if message triggers Library consultation
  const messageLower = message.toLowerCase();
  const hasLibraryTrigger = LIBRARY_TRIGGERS.some(trigger => messageLower.includes(trigger));

  if (!hasLibraryTrigger) {
    return {
      shouldConsult: false,
      retrievalLimit: 0,
      elementBoost: null,
      phaseFilter: null,
      includeDistillate: false,
      excerptMaxLength: 0,
      framingLevel: 'minimal',
      reason: 'no_library_trigger',
    };
  }

  // Base decision — will be modified by spiral context
  const decision: DynamicRangeDecision = {
    shouldConsult: true,
    retrievalLimit: 3,
    elementBoost: context.element || null,
    phaseFilter: null,
    includeDistillate: true,
    excerptMaxLength: 300,
    framingLevel: 'natural',
    reason: 'library_triggered',
  };

  // Build phase filter if we have both element and phase
  if (context.element && context.phase) {
    decision.phaseFilter = `${context.element.toUpperCase()}_${context.phase}`;
  }

  // ==========================================================================
  // Relational Phase Modulation
  // ==========================================================================

  if (context.relationalPhase === 1) {
    // ORIENTATION: Member is new to MAIA. More structure, more framing.
    // Library offers contextual scaffolding.
    decision.retrievalLimit = 2;
    decision.excerptMaxLength = 200;
    decision.framingLevel = 'structured';
    decision.includeDistillate = true;  // Distillates provide structure
    decision.reason += '|orientation_phase';
  }

  else if (context.relationalPhase === 2) {
    // CAPACITY: Member has established trust. Full Library access.
    // This is where the Library does its deepest work.
    decision.retrievalLimit = 4;
    decision.excerptMaxLength = 400;
    decision.framingLevel = 'natural';
    decision.includeDistillate = true;
    decision.reason += '|capacity_phase';
  }

  else if (context.relationalPhase === 3) {
    // AUTONOMY: Member is self-directed. Library steps back.
    // Surface less, trust more. The member is their own librarian.
    decision.retrievalLimit = 2;
    decision.excerptMaxLength = 250;
    decision.framingLevel = 'minimal';
    decision.includeDistillate = false;  // Let the raw text speak
    decision.reason += '|autonomy_phase';
  }

  else if (context.relationalPhase === 4) {
    // SEASONAL RETURN: Member returns after autonomy.
    // Library can surface texts for re-encounter.
    decision.retrievalLimit = 3;
    decision.excerptMaxLength = 350;
    decision.framingLevel = 'natural';
    decision.includeDistillate = true;
    decision.reason += '|seasonal_return';
  }

  // ==========================================================================
  // Motion Modulation
  // ==========================================================================

  if (context.motion === 'stuck') {
    // When stuck, surface more — especially practices.
    // The Library acts as gentle momentum.
    decision.retrievalLimit = Math.min(decision.retrievalLimit + 2, 6);
    decision.includeDistillate = true;   // Distillates include practices
    decision.reason += '|stuck_motion';
  }

  else if (context.motion === 'breakthrough') {
    // During breakthrough, surface less but deeper.
    // The member is already moving — Library confirms, doesn't redirect.
    decision.retrievalLimit = Math.min(decision.retrievalLimit, 3);
    decision.excerptMaxLength = Math.min(decision.excerptMaxLength + 100, 500);
    decision.reason += '|breakthrough_motion';
  }

  else if (context.motion === 'ascending') {
    // Normal upward movement. Standard retrieval.
    decision.reason += '|ascending_motion';
  }

  // ==========================================================================
  // Conversation Depth Scaling
  // ==========================================================================

  // As conversation deepens, Library can offer more
  if (context.conversationDepth >= 10) {
    decision.retrievalLimit = Math.min(decision.retrievalLimit + 1, 6);
    decision.excerptMaxLength = Math.min(decision.excerptMaxLength + 50, 500);
    decision.reason += '|deep_conversation';
  }

  return decision;
}

/**
 * Build the element boost SQL clause for use in LibraryService.search().
 *
 * Returns a SQL fragment that adds a score boost for chunks matching
 * the member's current element. Returns empty string if no boost needed.
 *
 * Example output: "CASE WHEN c.meta->>'element' = 'water' THEN 0.15 ELSE 0 END"
 */
export function buildElementBoostSQL(elementBoost: string | null): string {
  if (!elementBoost) return '';

  // Sanitize the element name (only allow known values)
  const validElements = ['fire', 'water', 'earth', 'air', 'aether'];
  if (!validElements.includes(elementBoost.toLowerCase())) return '';

  return `CASE WHEN c.meta->>'element' = '${elementBoost.toLowerCase()}' THEN 0.15 ELSE 0 END`;
}

/**
 * Build a facet filter clause for distillate retrieval.
 *
 * Returns a SQL WHERE clause fragment that filters distillates
 * whose facet_tags include the member's current facet.
 */
export function buildFacetFilterSQL(phaseFilter: string | null): string {
  if (!phaseFilter) return '';

  // Validate format (ELEMENT_PHASE)
  if (!/^[A-Z]+_[1-3]$/.test(phaseFilter)) return '';

  return `AND payload->'facet_tags' ? '${phaseFilter}'`;
}
