/**
 * Reality Hygiene System - Core Types
 *
 * Based on NCI Reality Assessment rubric, adapted for MAIA's consciousness architecture.
 * Maps manipulation patterns to Spiralogic elements for native integration.
 *
 * Spiralogic Mapping:
 * - Water: Emotional manipulation, outrage loops, tribal division
 * - Fire: Urgency, novelty, "act now" pressure, rapid behavior shifts
 * - Earth: Missing info, cherry-picked data, incentives, historical parallels
 * - Air: Logic/fallacies, false dilemmas, framing language
 * - Aether: Authority overload, suppression of dissent, uniformity signals
 */

export const REALITY_INDICATORS = [
  "timing",
  "emotional_manipulation",
  "uniform_messaging",
  "missing_information",
  "good_vs_evil",
  "tribal_division",
  "authority_overload",
  "urgent_action",
  "novelty_shock",
  "gain_incentive",
  "suppression_of_dissent",
  "false_dilemmas",
  "bandwagon",
  "emotional_repetition",
  "cherry_picked_data",
  "logical_fallacies",
  "manufactured_outrage",
  "framing_techniques",
  "rapid_behavior_shifts",
  "historical_parallels",
] as const;

export type RealityIndicator = (typeof REALITY_INDICATORS)[number];
export type RealityScores = Record<RealityIndicator, number>; // 1..5

export type RealityBand = "low" | "moderate" | "strong" | "overwhelming";

export type SpiralogicElement = "Water" | "Fire" | "Earth" | "Air" | "Aether";

export type RealityHygieneResult = {
  total: number;
  max: number;
  band: RealityBand;
  scores: RealityScores;
  topSignals: Array<{ indicator: RealityIndicator; score: number; element: SpiralogicElement }>;
  elementalBreakdown: Record<SpiralogicElement, number>; // Total score per element
  questions: {
    lowering_score: string;         // "What would I need to see to lower this score?" (Earth/Air)
    emotional_recruitment: string;  // "Where am I being emotionally recruited?" (Water/Fire)
    freedom_questions: string[];    // Questions that restore freedom of attention (Aether)
  };
};

/**
 * Map each indicator to its primary Spiralogic element
 * This allows Reality Hygiene to speak MAIA's native language
 */
export const INDICATOR_TO_ELEMENT: Record<RealityIndicator, SpiralogicElement> = {
  // WATER: Emotional manipulation, outrage loops, tribal division
  emotional_manipulation: "Water",
  tribal_division: "Water",
  manufactured_outrage: "Water",
  emotional_repetition: "Water",
  good_vs_evil: "Water",

  // FIRE: Urgency, novelty, action pressure, rapid shifts
  urgent_action: "Fire",
  novelty_shock: "Fire",
  rapid_behavior_shifts: "Fire",
  timing: "Fire",

  // EARTH: Missing info, data, incentives, historical context
  missing_information: "Earth",
  cherry_picked_data: "Earth",
  gain_incentive: "Earth",
  historical_parallels: "Earth",

  // AIR: Logic, framing, false dilemmas
  logical_fallacies: "Air",
  false_dilemmas: "Air",
  framing_techniques: "Air",
  bandwagon: "Air",

  // AETHER: Authority, suppression, uniformity
  authority_overload: "Aether",
  suppression_of_dissent: "Aether",
  uniform_messaging: "Aether",
};

/**
 * Indicator descriptions for UI/tooltips
 */
export const INDICATOR_DESCRIPTIONS: Record<RealityIndicator, string> = {
  timing: "Is this arriving at a politically/socially convenient moment?",
  emotional_manipulation: "Does this use fear, anger, or shame to bypass rational thought?",
  uniform_messaging: "Are diverse sources using identical language/talking points?",
  missing_information: "What crucial context, data, or counter-evidence is absent?",
  good_vs_evil: "Does this frame the issue as simple good vs. evil?",
  tribal_division: "Does this pit 'us vs. them' groups against each other?",
  authority_overload: "Are appeals to authority used to shut down inquiry?",
  urgent_action: "Is there pressure to act NOW without reflection?",
  novelty_shock: "Is shock value or novelty used to override critical thinking?",
  gain_incentive: "Who benefits financially/politically if you believe this?",
  suppression_of_dissent: "Are dissenting views being censored or delegitimized?",
  false_dilemmas: "Are you being presented with only two options when more exist?",
  bandwagon: "Is conformity pressure being applied ('everyone believes this')?",
  emotional_repetition: "Are emotionally charged phrases repeated to bypass analysis?",
  cherry_picked_data: "Is data selectively presented to support a predetermined conclusion?",
  logical_fallacies: "Are logical fallacies (ad hominem, strawman, etc.) being used?",
  manufactured_outrage: "Does this feel like engineered outrage rather than organic response?",
  framing_techniques: "How is language being used to frame your perception?",
  rapid_behavior_shifts: "Are you being asked to rapidly change behavior/beliefs?",
  historical_parallels: "Are historical comparisons accurate or manipulative?",
};

/**
 * Compute reality total and band from scores
 */
export function computeRealityTotal(scores: RealityScores) {
  let total = 0;
  for (const k of REALITY_INDICATORS) total += scores[k];
  const max = REALITY_INDICATORS.length * 5;

  const band: RealityBand =
    total <= 25 ? "low" :
    total <= 50 ? "moderate" :
    total <= 75 ? "strong" : "overwhelming";

  return { total, max, band };
}

/**
 * Default scores (all indicators at minimum)
 */
export function defaultRealityScores(): RealityScores {
  const out = {} as RealityScores;
  for (const k of REALITY_INDICATORS) out[k] = 1;
  return out;
}

/**
 * Compute elemental breakdown - which elements are most active in this manipulation pattern?
 */
export function computeElementalBreakdown(scores: RealityScores): Record<SpiralogicElement, number> {
  const breakdown: Record<SpiralogicElement, number> = {
    Water: 0,
    Fire: 0,
    Earth: 0,
    Air: 0,
    Aether: 0,
  };

  for (const indicator of REALITY_INDICATORS) {
    const element = INDICATOR_TO_ELEMENT[indicator];
    breakdown[element] += scores[indicator];
  }

  return breakdown;
}

/**
 * Get top signals (highest-scored indicators) with their elemental mapping
 */
export function getTopSignals(
  scores: RealityScores,
  limit: number = 5
): Array<{ indicator: RealityIndicator; score: number; element: SpiralogicElement }> {
  return [...REALITY_INDICATORS]
    .map((k) => ({
      indicator: k,
      score: scores[k],
      element: INDICATOR_TO_ELEMENT[k],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
