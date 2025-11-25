/**
 * 🌀 Spiralogic Phase Detector
 *
 * Maps user language to Spiralogic elemental phases
 * Integrates with Crystal State Mapping from Spiralogic IP
 */

export type SpiralogicPhase = "Fire" | "Water" | "Earth" | "Air" | "Aether";

export interface PhaseSignature {
  phase: SpiralogicPhase;
  keywords: string[];
  themes: string[];
  energyState: string;
}

/**
 * Spiralogic Phase Signatures
 * Based on the 5-element cycle of transformation
 */
export const PhaseSignatures: Record<SpiralogicPhase, PhaseSignature> = {
  Fire: {
    phase: "Fire",
    keywords: [
      "vision", "passion", "create", "start", "ignite", "inspire",
      "possibility", "dream", "goal", "excitement", "energy", "action",
      "courage", "bold", "risk", "new", "beginning", "launch"
    ],
    themes: [
      "initiation", "catalyzation", "vision-setting", "momentum-building"
    ],
    energyState: "expansive, catalytic, yang"
  },

  Water: {
    phase: "Water",
    keywords: [
      "feel", "emotion", "flow", "depth", "grief", "heart",
      "shadow", "vulnerability", "cry", "release", "transform",
      "intuition", "fluid", "surrender", "let go", "healing"
    ],
    themes: [
      "emotional processing", "shadow work", "transformation", "fluidity"
    ],
    energyState: "receptive, flowing, yin"
  },

  Earth: {
    phase: "Earth",
    keywords: [
      "ground", "structure", "ritual", "practice", "discipline",
      "routine", "embodied", "physical", "daily", "habit", "boundary",
      "stability", "foundation", "tangible", "manifest", "implement"
    ],
    themes: [
      "grounding", "implementation", "embodiment", "stabilization"
    ],
    energyState: "stable, grounded, yin"
  },

  Air: {
    phase: "Air",
    keywords: [
      "think", "perspective", "insight", "clarity", "understand",
      "reframe", "strategy", "logic", "pattern", "see", "observe",
      "mental", "analyze", "wonder", "question", "explore", "curious"
    ],
    themes: [
      "mental clarity", "perspective-shifting", "pattern recognition", "strategy"
    ],
    energyState: "light, expansive, yang"
  },

  Aether: {
    phase: "Aether",
    keywords: [
      "integrate", "synthesis", "whole", "unity", "soul", "spirit",
      "meaning", "purpose", "sacred", "divine", "consciousness",
      "metacognition", "awareness", "presence", "essence", "being"
    ],
    themes: [
      "integration", "synthesis", "transcendence", "unity consciousness"
    ],
    energyState: "spacious, integrative, transcendent"
  }
};

/**
 * Detect Spiralogic phase from user text
 * Returns phase with confidence score
 */
export function detectSpiralogicPhase(text: string): {
  phase: SpiralogicPhase;
  confidence: number;
  matchedKeywords: string[];
} {
  const t = text.toLowerCase();
  const scores: Record<SpiralogicPhase, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
    Aether: 0
  };

  const matchedKeywords: Record<SpiralogicPhase, string[]> = {
    Fire: [],
    Water: [],
    Earth: [],
    Air: [],
    Aether: []
  };

  // Score each phase based on keyword matches
  for (const [phaseName, signature] of Object.entries(PhaseSignatures)) {
    const phase = phaseName as SpiralogicPhase;

    for (const keyword of signature.keywords) {
      if (t.includes(keyword)) {
        scores[phase]++;
        matchedKeywords[phase].push(keyword);
      }
    }
  }

  // Find phase with highest score
  let maxPhase: SpiralogicPhase = "Aether";
  let maxScore = 0;

  for (const [phase, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxPhase = phase as SpiralogicPhase;
    }
  }

  // Calculate confidence (0-1 scale)
  const totalMatches = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalMatches > 0 ? maxScore / totalMatches : 0.5;

  return {
    phase: maxPhase,
    confidence,
    matchedKeywords: matchedKeywords[maxPhase]
  };
}

/**
 * Get complementary phase for balance
 * Based on elemental harmony principles
 */
export function getComplementaryPhase(phase: SpiralogicPhase): SpiralogicPhase {
  const complements: Record<SpiralogicPhase, SpiralogicPhase> = {
    Fire: "Water",    // Fire needs Water's depth
    Water: "Earth",   // Water needs Earth's grounding
    Earth: "Air",     // Earth needs Air's perspective
    Air: "Fire",      // Air needs Fire's action
    Aether: "Aether"  // Aether holds all
  };

  return complements[phase];
}

/**
 * Get next phase in cycle
 */
export function getNextPhase(phase: SpiralogicPhase): SpiralogicPhase {
  const cycle: SpiralogicPhase[] = ["Fire", "Water", "Earth", "Air", "Aether"];
  const currentIndex = cycle.indexOf(phase);
  const nextIndex = (currentIndex + 1) % cycle.length;
  return cycle[nextIndex];
}

/**
 * Check if user is in transition between phases
 */
export function detectTransition(text: string): {
  isTransitioning: boolean;
  fromPhase: SpiralogicPhase | null;
  toPhase: SpiralogicPhase | null;
} {
  const { phase: primary, confidence } = detectSpiralogicPhase(text);

  // Low confidence suggests transition
  if (confidence < 0.6) {
    const next = getNextPhase(primary);
    return {
      isTransitioning: true,
      fromPhase: primary,
      toPhase: next
    };
  }

  return {
    isTransitioning: false,
    fromPhase: null,
    toPhase: null
  };
}
