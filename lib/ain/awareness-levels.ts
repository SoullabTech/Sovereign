/**
 * @deprecated LEGACY 5-LEVEL SYSTEM (Knowledge Gate)
 *
 * This file is DEPRECATED. Use the canonical 7-level system instead:
 *
 *   import { AwarenessLevel, to5Level, from5Level } from '@/lib/consciousness/awareness-levels';
 *
 * Migration:
 * - AwarenessLevel enum → import type from awareness-levels.ts (7-level)
 * - To get 5-level values, use: to5Level(sevenLevelValue)
 * - To convert back, use: from5Level(fiveLevelValue)
 * - detectAwarenessLevel() → use from awareness-detection.ts instead
 *
 * This file remains for backwards compatibility but will be removed in a future version.
 *
 * Mapping: 7-level → 5-level
 *   1   → 1 (UNCONSCIOUS)
 *   2   → 2 (PARTIAL)
 *   3-4 → 3 (RELATIONAL)
 *   5-6 → 4 (INTEGRATED)
 *   7   → 5 (MASTER)
 */

// frontend

/**
 * MAIA's Five Levels of Awareness (LEGACY)
 *
 * The vertical axis of consciousness that complements the horizontal Knowledge Gate sources.
 * This creates a 5×5 mandala of Elemental Knowing × Depth of Awareness.
 *
 * @deprecated Use 7-level system from @/lib/consciousness/awareness-levels
 */

export enum AwarenessLevel {
  UNCONSCIOUS = 1,  // Surface patterns, reactive responses
  PARTIAL = 2,      // Beginning insight, noticing patterns
  RELATIONAL = 3,   // Interpersonal depth, emotional intelligence
  INTEGRATED = 4,   // Systemic understanding, wisdom integration
  MASTER = 5        // Archetypal depth, numinous knowing
}

export interface AwarenessState {
  level: AwarenessLevel;
  confidence: number;
  indicators: string[];
  depth_markers: {
    emotional_charge: number;      // 0-1: intensity of feeling language
    symbolic_language: number;     // 0-1: presence of metaphor, archetype, myth
    ritual_intent: number;         // 0-1: transformative/ceremonial language
    relational_depth: number;      // 0-1: interpersonal complexity
    systemic_thinking: number;     // 0-1: big picture, interconnection awareness
  };
}

export interface AwarenessDetectionResult {
  awarenessState: AwarenessState;
  debug: {
    rawScores: Record<string, number>;
    triggerPhrases: string[];
    analysisNotes: string[];
  };
}

/**
 * Lexical patterns for awareness level detection
 * Each level has distinct linguistic markers that indicate depth of consciousness
 */
const AWARENESS_PATTERNS = {
  [AwarenessLevel.UNCONSCIOUS]: {
    triggers: [
      /\b(just|simply|basic|quick|easy|obvious)\b/gi,
      /\b(what|how|when|where|which)\s+is\b/gi,
      /\b(tell me|show me|give me|explain)\b/gi,
      /\b(default|standard|normal|regular)\b/gi,
      /\b(fix|bug|error|problem|issue)\b/gi
    ],
    weight: 1.0,
    description: "Surface-level information seeking, reactive responses"
  },

  [AwarenessLevel.PARTIAL]: {
    triggers: [
      /\b(notice|noticing|aware|realize|understand)\b/gi,
      /\b(pattern|connection|link|relate|similar)\b/gi,
      /\b(why|because|reason|cause|effect)\b/gi,
      /\b(insight|learning|discovering|exploring)\b/gi,
      /\b(beginning to|starting to|seems like)\b/gi
    ],
    weight: 1.2,
    description: "Beginning awareness, pattern recognition"
  },

  [AwarenessLevel.RELATIONAL]: {
    triggers: [
      /\b(feel|feeling|sense|sensing|emotion|heart)\b/gi,
      /\b(relationship|connection|between us|together)\b/gi,
      /\b(empathy|compassion|understanding|care)\b/gi,
      /\b(vulnerable|open|trust|share|intimate)\b/gi,
      /\b(we|our|together|community|belonging)\b/gi,
      /\b(shadow|projection|trigger|wound|heal)\b/gi
    ],
    weight: 1.4,
    description: "Emotional intelligence, interpersonal depth"
  },

  [AwarenessLevel.INTEGRATED]: {
    triggers: [
      /\b(integrate|synthesis|holistic|wholeness)\b/gi,
      /\b(system|systemic|interconnect|web|network)\b/gi,
      /\b(wisdom|ancient|timeless|eternal|deep)\b/gi,
      /\b(paradox|both\/and|complexity|nuance)\b/gi,
      /\b(transform|transformation|metamorphosis)\b/gi,
      /\b(consciousness|awareness|presence|being)\b/gi,
      /\b(collective|archetypal|universal|cosmic)\b/gi
    ],
    weight: 1.6,
    description: "Systemic understanding, wisdom integration"
  },

  [AwarenessLevel.MASTER]: {
    triggers: [
      /\b(sacred|holy|divine|numinous|mystery)\b/gi,
      /\b(ritual|ceremony|initiation|threshold)\b/gi,
      /\b(oracle|prophecy|vision|revelation)\b/gi,
      /\b(archetype|myth|mythology|legend)\b/gi,
      /\b(soul|spirit|essence|core|source)\b/gi,
      /\b(transcend|transcendent|beyond|infinite)\b/gi,
      /\b(field|morphic|resonance|coherence)\b/gi,
      /\b(awakening|enlightenment|illumination)\b/gi
    ],
    weight: 1.8,
    description: "Archetypal depth, numinous knowing"
  }
};

/**
 * Depth markers analyze specific qualities that indicate consciousness depth
 */
const DEPTH_MARKER_PATTERNS = {
  emotional_charge: [
    /\b(feel|feeling|felt|emotion|heart|soul|deeply|intense|powerful|overwhelming)\b/gi,
    /\b(love|fear|anger|joy|sadness|grief|rage|bliss|ecstasy)\b/gi,
    /\b(tears|crying|laughing|trembling|shaking|alive)\b/gi
  ],

  symbolic_language: [
    /\b(like|as if|metaphor|symbol|archetype|myth|story|journey)\b/gi,
    /\b(dragon|phoenix|goddess|god|hero|shadow|anima|animus)\b/gi,
    /\b(river|mountain|ocean|fire|earth|air|water|tree|seed)\b/gi,
    /\b(birth|death|rebirth|transformation|initiation|threshold)\b/gi
  ],

  ritual_intent: [
    /\b(ritual|ceremony|practice|sacred|blessing|prayer|meditation)\b/gi,
    /\b(intention|invoke|call forth|manifest|create|birth)\b/gi,
    /\b(altar|temple|sanctuary|circle|space|container)\b/gi,
    /\b(initiate|transform|transmute|alchemical|purify)\b/gi
  ],

  relational_depth: [
    /\b(we|our|us|together|relationship|connection|bond)\b/gi,
    /\b(vulnerable|intimate|trust|safety|holding|witness)\b/gi,
    /\b(projection|shadow|trigger|mirror|reflect)\b/gi,
    /\b(family|ancestor|lineage|community|tribe|belonging)\b/gi
  ],

  systemic_thinking: [
    /\b(system|network|web|interconnect|holistic|whole)\b/gi,
    /\b(pattern|emergence|complexity|chaos|order|structure)\b/gi,
    /\b(field|resonance|morphic|collective|planetary|cosmic)\b/gi,
    /\b(evolution|consciousness|awakening|transformation|shift)\b/gi
  ]
};

/**
 * Detect the awareness level of a given input message
 *
 * @param input - The user message to analyze
 * @returns AwarenessDetectionResult with level, confidence, and debug info
 */
export function detectAwarenessLevel(input: string): AwarenessDetectionResult {
  const cleanInput = input.toLowerCase().trim();

  // Score each awareness level
  const levelScores: Record<AwarenessLevel, number> = {
    [AwarenessLevel.UNCONSCIOUS]: 0,
    [AwarenessLevel.PARTIAL]: 0,
    [AwarenessLevel.RELATIONAL]: 0,
    [AwarenessLevel.INTEGRATED]: 0,
    [AwarenessLevel.MASTER]: 0
  };

  const triggerPhrases: string[] = [];
  const analysisNotes: string[] = [];

  // Analyze patterns for each awareness level
  Object.entries(AWARENESS_PATTERNS).forEach(([levelStr, pattern]) => {
    const level = parseInt(levelStr) as AwarenessLevel;
    let score = 0;

    pattern.triggers.forEach((regex) => {
      const matches = cleanInput.match(regex);
      if (matches) {
        score += matches.length * pattern.weight;
        triggerPhrases.push(...matches);
      }
    });

    levelScores[level] = score;
    if (score > 0) {
      analysisNotes.push(`Level ${level}: ${score.toFixed(2)} (${pattern.description})`);
    }
  });

  // Calculate depth markers
  const depthMarkers: AwarenessState['depth_markers'] = {
    emotional_charge: 0,
    symbolic_language: 0,
    ritual_intent: 0,
    relational_depth: 0,
    systemic_thinking: 0
  };

  Object.entries(DEPTH_MARKER_PATTERNS).forEach(([marker, patterns]) => {
    let score = 0;
    patterns.forEach((regex) => {
      const matches = cleanInput.match(regex);
      if (matches) score += matches.length;
    });

    // Normalize to 0-1 range (cap at 5 matches for normalization)
    depthMarkers[marker as keyof typeof depthMarkers] = Math.min(score / 5, 1);
  });

  // Determine dominant awareness level
  const dominantLevel = (Object.entries(levelScores) as [string, number][])
    .reduce((prev, curr) => curr[1] > prev[1] ? curr : prev)[0] as unknown as AwarenessLevel;

  // Calculate confidence based on score distribution
  const totalScore = Object.values(levelScores).reduce((sum, score) => sum + score, 0);
  const dominantScore = levelScores[dominantLevel];
  const confidence = totalScore > 0 ? dominantScore / totalScore : 0.2; // Minimum confidence for ambiguous inputs

  // Additional indicators based on depth markers
  const indicators: string[] = [];
  Object.entries(depthMarkers).forEach(([marker, score]) => {
    if (score > 0.3) {
      indicators.push(marker.replace('_', ' '));
    }
  });

  // If no clear patterns detected, default to UNCONSCIOUS with low confidence
  const finalLevel = totalScore > 0 ? dominantLevel : AwarenessLevel.UNCONSCIOUS;
  const finalConfidence = totalScore > 0 ? confidence : 0.2;

  analysisNotes.push(`Final: Level ${finalLevel} (${(finalConfidence * 100).toFixed(1)}% confidence)`);

  return {
    awarenessState: {
      level: finalLevel,
      confidence: finalConfidence,
      indicators,
      depth_markers: depthMarkers
    },
    debug: {
      rawScores: levelScores,
      triggerPhrases: [...new Set(triggerPhrases)], // Remove duplicates
      analysisNotes
    }
  };
}

/**
 * Get a human-readable description of an awareness level
 */
export function getAwarenessLevelDescription(level: AwarenessLevel): string {
  const descriptions = {
    [AwarenessLevel.UNCONSCIOUS]: "🌑 Unconscious: Surface patterns, reactive responses",
    [AwarenessLevel.PARTIAL]: "🌒 Partial: Beginning insight, noticing patterns",
    [AwarenessLevel.RELATIONAL]: "🌓 Relational: Interpersonal depth, emotional intelligence",
    [AwarenessLevel.INTEGRATED]: "🌔 Integrated: Systemic understanding, wisdom integration",
    [AwarenessLevel.MASTER]: "🌕 Master: Archetypal depth, numinous knowing"
  };

  return descriptions[level];
}

/**
 * Get CSS class for awareness level styling
 */
export function getAwarenessLevelClass(level: AwarenessLevel): string {
  const classes = {
    [AwarenessLevel.UNCONSCIOUS]: "awareness-unconscious",
    [AwarenessLevel.PARTIAL]: "awareness-partial",
    [AwarenessLevel.RELATIONAL]: "awareness-relational",
    [AwarenessLevel.INTEGRATED]: "awareness-integrated",
    [AwarenessLevel.MASTER]: "awareness-master"
  };

  return classes[level];
}