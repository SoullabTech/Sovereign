/**
 * Unified Awareness Detection Pipeline
 *
 * Single entry point for detecting member awareness level.
 * Uses multiple data sources with confidence scoring.
 *
 * Priority order:
 * 1. Spiralogic profile (most accurate - beads, elements, engagement)
 * 2. Relationship memory (encounters, duration, breakthroughs)
 * 3. Text analysis (pattern detection in user input)
 * 4. Default (Newcomer with low confidence)
 *
 * Usage:
 *   const { level, confidence, source } = detectAwarenessLevel({
 *     spiralogicProfile: ...,
 *     relationshipMemory: ...,
 *     userInput: "..."
 *   });
 */

import {
  inferAwarenessLevel,
  inferAwarenessFromRelationship,
  type AwarenessLevel
} from './awareness-levels';

// Re-export for convenience
export type { AwarenessLevel } from './awareness-levels';

// ═══════════════════════════════════════════════════════════════
// INPUT TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Spiralogic profile data for awareness inference
 */
export interface SpiralogicProfileInput {
  dominant_element: string;
  top_facets: Array<{ element: string; percent: number }>;
  total_beads: number;
  window_days: number;
}

/**
 * Relationship memory data for awareness inference
 */
export interface RelationshipMemoryInput {
  totalEncounters: number;
  relationshipDuration: number; // days
  relationshipPhase: 'new' | 'developing' | 'established' | 'deep';
  trustLevel?: number; // 0-1
  breakthroughCount?: number;
}

/**
 * Combined input for awareness detection
 */
export interface AwarenessDetectionInput {
  // Spiralogic profile (if available)
  spiralogicProfile?: SpiralogicProfileInput;

  // Relationship memory (if available)
  relationshipMemory?: RelationshipMemoryInput;

  // User input text (for real-time detection)
  userInput?: string;

  // Override: explicit level set by member or admin
  explicitLevel?: AwarenessLevel;
}

// ═══════════════════════════════════════════════════════════════
// OUTPUT TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Source of awareness detection
 */
export type AwarenessSource =
  | 'explicit'       // Member/admin set level directly
  | 'spiralogic'     // Inferred from Spiralogic profile
  | 'relationship'   // Inferred from relationship memory
  | 'text'           // Detected from user input patterns
  | 'default';       // No data available

/**
 * Result of awareness detection
 */
export interface AwarenessDetectionResult {
  level: AwarenessLevel;
  confidence: number; // 0-1
  source: AwarenessSource;
  reasoning?: string; // Human-readable explanation
}

// ═══════════════════════════════════════════════════════════════
// TEXT ANALYSIS PATTERNS
// ═══════════════════════════════════════════════════════════════

/**
 * Linguistic patterns that suggest different awareness levels
 */
const AWARENESS_PATTERNS = {
  // Level 1-2: Surface, reactive language
  surface: [
    /just|simple|basic|what|how|help me/i,
    /i don'?t (know|understand)/i,
    /confused|lost|stuck/i
  ],

  // Level 3: Beginning insight, noticing patterns
  emerging: [
    /notice|pattern|realize|insight/i,
    /i'?m (starting|beginning) to/i,
    /makes sense now/i
  ],

  // Level 4: Relational depth, emotional intelligence
  relational: [
    /feel|relationship|vulnerable|connect/i,
    /shadow|projection|trigger/i,
    /between us|we are/i
  ],

  // Level 5-6: Systemic, integrated thinking
  integrated: [
    /integrate|system|wisdom|paradox/i,
    /consciousness|awareness|presence/i,
    /framework|model|approach/i
  ],

  // Level 7: Archetypal, transcendent language
  archetypal: [
    /sacred|ritual|oracle|archetype/i,
    /soul|transcend|numinous/i,
    /spiralogic|element|alchemy/i
  ]
} as const;

/**
 * Detect awareness level from text patterns
 */
function detectFromText(input: string): { level: AwarenessLevel; confidence: number } {
  const text = input.toLowerCase();

  // Score each level based on pattern matches
  const scores = {
    archetypal: 0,
    integrated: 0,
    relational: 0,
    emerging: 0,
    surface: 0
  };

  // Count matches for each category
  for (const pattern of AWARENESS_PATTERNS.archetypal) {
    if (pattern.test(text)) scores.archetypal += 1.8;
  }
  for (const pattern of AWARENESS_PATTERNS.integrated) {
    if (pattern.test(text)) scores.integrated += 1.6;
  }
  for (const pattern of AWARENESS_PATTERNS.relational) {
    if (pattern.test(text)) scores.relational += 1.4;
  }
  for (const pattern of AWARENESS_PATTERNS.emerging) {
    if (pattern.test(text)) scores.emerging += 1.2;
  }
  for (const pattern of AWARENESS_PATTERNS.surface) {
    if (pattern.test(text)) scores.surface += 1.0;
  }

  // Find highest scoring category
  const maxCategory = Object.entries(scores).reduce((max, [cat, score]) =>
    score > max.score ? { category: cat, score } : max,
    { category: 'surface', score: 0 }
  );

  // Map category to level
  const categoryToLevel: Record<string, AwarenessLevel> = {
    archetypal: 7,
    integrated: 5,
    relational: 4,
    emerging: 3,
    surface: 1
  };

  const level = categoryToLevel[maxCategory.category] || 1;

  // Confidence based on match strength (max 0.6 for text detection)
  const confidence = Math.min(0.6, maxCategory.score * 0.15);

  return { level, confidence };
}

// ═══════════════════════════════════════════════════════════════
// MAIN DETECTION FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Unified awareness detection - single entry point
 *
 * Chooses best inference method based on available data:
 * 1. Explicit override (if set)
 * 2. Spiralogic profile (most accurate)
 * 3. Relationship memory (good approximation)
 * 4. Text analysis (fallback)
 * 5. Default (Newcomer)
 */
export function detectAwarenessLevel(
  input: AwarenessDetectionInput
): AwarenessDetectionResult {
  // Priority 0: Explicit override
  if (input.explicitLevel) {
    return {
      level: input.explicitLevel,
      confidence: 1.0,
      source: 'explicit',
      reasoning: 'Level explicitly set by member or admin'
    };
  }

  // Priority 1: Spiralogic profile (most accurate)
  if (input.spiralogicProfile) {
    const level = inferAwarenessLevel(input.spiralogicProfile);
    const confidence = calculateSpiralogicConfidence(input.spiralogicProfile);
    return {
      level,
      confidence,
      source: 'spiralogic',
      reasoning: `Inferred from ${input.spiralogicProfile.total_beads} beads over ${input.spiralogicProfile.window_days} days`
    };
  }

  // Priority 2: Relationship memory
  if (input.relationshipMemory) {
    const level = inferAwarenessFromRelationship(input.relationshipMemory);
    const confidence = calculateRelationshipConfidence(input.relationshipMemory);
    return {
      level,
      confidence,
      source: 'relationship',
      reasoning: `Inferred from ${input.relationshipMemory.totalEncounters} encounters, ${input.relationshipMemory.relationshipPhase} phase`
    };
  }

  // Priority 3: Text analysis (fallback)
  if (input.userInput && input.userInput.length > 10) {
    const { level, confidence } = detectFromText(input.userInput);
    return {
      level,
      confidence,
      source: 'text',
      reasoning: 'Detected from linguistic patterns in user input'
    };
  }

  // Default: Newcomer with low confidence
  return {
    level: 1,
    confidence: 0.3,
    source: 'default',
    reasoning: 'No data available - defaulting to Newcomer'
  };
}

// ═══════════════════════════════════════════════════════════════
// CONFIDENCE CALCULATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate confidence for Spiralogic-based inference
 */
function calculateSpiralogicConfidence(profile: SpiralogicProfileInput): number {
  // More beads = higher confidence
  const beadConfidence = Math.min(1.0, profile.total_beads / 100);

  // Longer window = higher confidence
  const windowConfidence = Math.min(1.0, profile.window_days / 30);

  // More facets = better picture
  const facetConfidence = Math.min(1.0, profile.top_facets.length / 4);

  // Weighted average, max 0.95
  return Math.min(0.95, (beadConfidence * 0.5) + (windowConfidence * 0.3) + (facetConfidence * 0.2));
}

/**
 * Calculate confidence for relationship-based inference
 */
function calculateRelationshipConfidence(memory: RelationshipMemoryInput): number {
  // More encounters = higher confidence
  const encounterConfidence = Math.min(1.0, memory.totalEncounters / 50);

  // Longer duration = higher confidence
  const durationConfidence = Math.min(1.0, memory.relationshipDuration / 60);

  // Phase contributes
  const phaseConfidence: Record<string, number> = {
    'new': 0.4,
    'developing': 0.6,
    'established': 0.8,
    'deep': 0.9
  };
  const phaseFactor = phaseConfidence[memory.relationshipPhase] || 0.4;

  // Weighted average, max 0.85
  return Math.min(0.85, (encounterConfidence * 0.4) + (durationConfidence * 0.3) + (phaseFactor * 0.3));
}

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════

/**
 * Quick detection from just relationship memory
 * (Most common use case in chat route)
 */
export function detectFromRelationship(
  memory: RelationshipMemoryInput
): AwarenessDetectionResult {
  return detectAwarenessLevel({ relationshipMemory: memory });
}

/**
 * Quick detection from just user input
 * (For real-time adjustment)
 */
export function detectFromInput(userInput: string): AwarenessDetectionResult {
  return detectAwarenessLevel({ userInput });
}
