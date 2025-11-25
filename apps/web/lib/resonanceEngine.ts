/**
 * 🌌 Elemental Resonance Engine
 * 
 * Detects elemental states from user input, 
 * tracks transitions, and determines response mode.
 * 
 * - Handles mixed states (probabilities)
 * - Tracks transitions across turns
 * - Balances vs. matches based on intensity
 * - Outputs structured metadata for Sacred Oracle payload
 */

export type Element = "fire" | "water" | "earth" | "air" | "aether";

export interface ResonanceState {
  elements: Record<Element, number>; // probabilities 0–1
  dominant: Element;
  secondary?: Element;
  transitionDetected: boolean;
  intensity: number; // 0–1
  responseMode: "match" | "match_with_balance" | "balance";
  history: Element[];
}

export class ResonanceEngine {
  private lastDominant: Element | null = null;

  /**
   * Main entry point: detect resonance state
   */
  detect(input: string): ResonanceState {
    const probs = this.estimateProbabilities(input);

    // Sort to find dominant + secondary
    const sorted = Object.entries(probs).sort((a, b) => b[1] - a[1]);
    const [dominant, dominantScore] = sorted[0];
    const [secondary, secondaryScore] = sorted[1];

    // Intensity = top score (normalized to 0–1)
    const intensity = Math.min(Math.max(dominantScore, 0), 1);

    // Detect transition from last state
    const transitionDetected =
      this.lastDominant !== null && this.lastDominant !== dominant;

    // Decide response mode
    let responseMode: ResonanceState["responseMode"] = "match";
    if (intensity >= 0.9) responseMode = "balance";
    else if (intensity >= 0.7) responseMode = "match_with_balance";

    // Update last dominant
    this.lastDominant = dominant as Element;

    return {
      elements: probs,
      dominant: dominant as Element,
      secondary: secondaryScore > 0.3 ? (secondary as Element) : undefined,
      transitionDetected,
      intensity,
      responseMode,
      history: this.lastDominant ? [this.lastDominant] : []
    };
  }

  /**
   * Simple heuristic scoring — can be replaced with ML model later
   */
  private estimateProbabilities(input: string): Record<Element, number> {
    const text = input.toLowerCase();

    let scores: Record<Element, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    // Fire detection - passion, excitement, action, anger
    if (/\b(excite|excited|amazing|passion|energy|spark|burn|ignite|angry|rage|fierce|wild|dynamic|action|move|urgent|now|fast|quick)\b/.test(text)) {
      scores.fire += 0.8;
    }
    if (/[!]{2,}/.test(input)) scores.fire += 0.2; // Multiple exclamation marks
    if (/\b(CAPS|[A-Z]{3,})\b/.test(input)) scores.fire += 0.1; // All caps words

    // Water detection - emotions, flow, depth, grief
    if (/\b(cry|tears|sad|flow|feel|feeling|emotion|overwhelmed|heavy|grief|sorrow|longing|deep|ocean|wave|gentle|soft)\b/.test(text)) {
      scores.water += 0.8;
    }
    if (/\b(miss|lost|hurt|pain|tender|vulnerable)\b/.test(text)) {
      scores.water += 0.3;
    }

    // Earth detection - practical, grounded, stable
    if (/\b(practical|plan|planning|steps|solid|foundation|secure|stable|ground|grounded|steady|organize|structure|build|concrete|real|tangible)\b/.test(text)) {
      scores.earth += 0.8;
    }
    if (/\b(schedule|timeline|budget|resource|implement)\b/.test(text)) {
      scores.earth += 0.3;
    }

    // Air detection - mental, ideas, clarity
    if (/\b(thinking|clarity|idea|thought|analyze|logic|understand|concept|theory|question|wonder|curious|learn|know|mental)\b/.test(text)) {
      scores.air += 0.8;
    }
    if (/\?/.test(text)) scores.air += 0.2; // Questions increase air element

    // Aether detection - spiritual, transcendent, mystical
    if (/\b(spiritual|spirit|dream|vision|cosmic|universe|unity|transcend|divine|sacred|soul|consciousness|mystical|magic|ethereal|infinite)\b/.test(text)) {
      scores.aether += 0.8;
    }
    if (/\b(meditation|prayer|ritual|ceremony|awakening)\b/.test(text)) {
      scores.aether += 0.3;
    }

    // Normalize to 0–1
    const max = Math.max(...Object.values(scores), 1);
    for (const key in scores) {
      scores[key as Element] = scores[key as Element] / max;
    }

    return scores;
  }

  /**
   * Reset the engine state (useful for new conversations)
   */
  reset(): void {
    this.lastDominant = null;
  }
}

// Lazy-loaded singleton to avoid initialization issues
let _resonanceEngine: ResonanceEngine | null = null;

export const getResonanceEngine = (): ResonanceEngine => {
  if (!_resonanceEngine) {
    _resonanceEngine = new ResonanceEngine();
  }
  return _resonanceEngine;
};