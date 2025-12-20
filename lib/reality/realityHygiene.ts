/**
 * Reality Hygiene System - Detection & Analysis
 *
 * Detects when Reality Hygiene should run and builds consciousness-expanding questions.
 * This is the layer between raw scores and the RealityCheckAgent.
 */

import {
  REALITY_INDICATORS,
  RealityHygieneResult,
  RealityScores,
  computeRealityTotal,
  computeElementalBreakdown,
  getTopSignals,
  INDICATOR_TO_ELEMENT,
  type SpiralogicElement,
} from "./realityTypes";

/**
 * Should Reality Hygiene run for this input?
 * Triggers on:
 * - URLs (news/social media)
 * - "Newsy" language patterns
 * - Claims about others ("they say", "everyone believes")
 * - Urgent/breaking framing
 */
export function shouldRunRealityHygiene(input: string): boolean {
  const s = input.toLowerCase();

  // URL detection
  const hasUrl = /(https?:\/\/|www\.)/.test(s);

  // Newsy/viral language patterns
  const newsyPatterns = [
    "i heard",
    "they say",
    "breaking",
    "everyone is saying",
    "shocking",
    "cover up",
    "exposed",
    "propaganda",
    "conspiracy",
    "they don't want you to know",
    "mainstream media",
    "censored",
    "banned",
    "urgent",
    "act now",
    "before it's too late",
  ];

  const hasNewsyLanguage = newsyPatterns.some((pattern) => s.includes(pattern));

  // Tribal language
  const tribalPatterns = [
    "us vs them",
    "those people",
    "the left",
    "the right",
    "liberals",
    "conservatives",
    "they want to",
    "they're trying to",
  ];

  const hasTribalLanguage = tribalPatterns.some((pattern) => s.includes(pattern));

  return hasUrl || hasNewsyLanguage || hasTribalLanguage;
}

/**
 * Build Reality Hygiene result from user-provided scores
 * MVP: User scores, we compute totals + generate baseline questions
 */
export function buildRealityHygieneFromScores(scores: RealityScores): RealityHygieneResult {
  const { total, max, band } = computeRealityTotal(scores);
  const topSignals = getTopSignals(scores, 5);
  const elementalBreakdown = computeElementalBreakdown(scores);

  // Generate consciousness-expanding questions based on top elements
  const questions = generateConsciousnessQuestions(topSignals, elementalBreakdown, band);

  return {
    total,
    max,
    band,
    scores,
    topSignals,
    elementalBreakdown,
    questions,
  };
}

/**
 * Generate consciousness-expanding questions mapped to Spiralogic elements
 * This is what makes Reality Hygiene *MAIA* instead of just a checklist
 */
function generateConsciousnessQuestions(
  topSignals: Array<{ indicator: string; score: number; element: SpiralogicElement }>,
  elementalBreakdown: Record<SpiralogicElement, number>,
  band: string
): {
  lowering_score: string;
  emotional_recruitment: string;
  freedom_questions: string[];
} {
  // EARTH/AIR question: "What would I need to see to lower this score?"
  // (Evidence, data, counter-arguments - grounding in reality)
  const loweringScore = generateLoweringScoreQuestion(topSignals);

  // WATER/FIRE question: "Where am I being emotionally recruited?"
  // (Emotional hooks, urgency, outrage - awareness of manipulation)
  const emotionalRecruitment = generateEmotionalRecruitmentQuestion(topSignals, elementalBreakdown);

  // AETHER questions: "What questions restore freedom of attention?"
  // (Break out of the frame, reclaim sovereignty)
  const freedomQuestions = generateFreedomQuestions(band, elementalBreakdown);

  return {
    lowering_score: loweringScore,
    emotional_recruitment: emotionalRecruitment,
    freedom_questions: freedomQuestions,
  };
}

/**
 * EARTH/AIR: What evidence would change your mind?
 */
function generateLoweringScoreQuestion(
  topSignals: Array<{ indicator: string; score: number; element: SpiralogicElement }>
): string {
  const earthAirSignals = topSignals.filter((s) => s.element === "Earth" || s.element === "Air");

  if (earthAirSignals.length === 0) {
    return "What primary source (document, dataset, original study, court filing) would settle this claim definitively?";
  }

  const topIndicator = earthAirSignals[0].indicator;

  const questions: Record<string, string> = {
    missing_information: "What specific information is missing that would allow you to verify this claim independently?",
    cherry_picked_data: "What would the full dataset look like if it included counter-evidence?",
    logical_fallacies: "What's the strongest steel-man argument from the other side?",
    false_dilemmas: "What options exist beyond the two you're being presented with?",
    framing_techniques: "How would this look if framed from a completely different perspective?",
    historical_parallels: "What would a historian say about the accuracy of this comparison?",
  };

  return questions[topIndicator] || "What evidence would convince you that this claim is false or exaggerated?";
}

/**
 * WATER/FIRE: Where are you being emotionally recruited?
 */
function generateEmotionalRecruitmentQuestion(
  topSignals: Array<{ indicator: string; score: number; element: SpiralogicElement }>,
  elementalBreakdown: Record<SpiralogicElement, number>
): string {
  const waterFireSignals = topSignals.filter((s) => s.element === "Water" || s.element === "Fire");

  if (waterFireSignals.length === 0) {
    return "Notice where you feel emotionally activated - what feeling is being recruited (fear, anger, righteousness, urgency)?";
  }

  const topIndicator = waterFireSignals[0].indicator;

  const questions: Record<string, string> = {
    emotional_manipulation: "What emotion is this trying to make you feel? What would you do differently if you weren't feeling this emotion?",
    manufactured_outrage: "Is your outrage organic, or is it being engineered? Who benefits from your anger?",
    tribal_division: "Notice the 'us vs. them' framing. What happens to your thinking when you're in tribal mode?",
    urgent_action: "What would change if you waited 48 hours before acting or sharing this?",
    novelty_shock: "Is the shock value making you skip your usual critical thinking process?",
    rapid_behavior_shifts: "Why is there pressure to change your behavior or beliefs *right now*?",
    good_vs_evil: "Is this really simple good vs. evil, or is that framing preventing nuanced thinking?",
  };

  return questions[topIndicator] || "Where do you feel the emotional hook? What is it recruiting you to believe or do?";
}

/**
 * AETHER: What questions restore freedom of attention?
 * These break the frame and restore sovereignty
 */
function generateFreedomQuestions(
  band: string,
  elementalBreakdown: Record<SpiralogicElement, number>
): string[] {
  const baseQuestions = [
    "Who benefits if I believe this right now (financially, politically, attention-wise)?",
    "Am I being recruited into a pre-existing narrative, or am I thinking for myself?",
    "What would I need to personally verify before sharing this with others?",
  ];

  // Add band-specific questions
  if (band === "strong" || band === "overwhelming") {
    baseQuestions.push(
      "Is this content designed to bypass my critical thinking and go straight to emotional reaction?",
      "What happens to my freedom of attention if I accept this framing uncritically?"
    );
  }

  // Add element-specific questions
  if (elementalBreakdown.Aether >= 10) {
    baseQuestions.push(
      "Why is dissent being suppressed? What am I not allowed to question?",
      "When 'everyone agrees' or 'the science is settled,' what perspectives are being excluded?"
    );
  }

  return baseQuestions.slice(0, 5); // Return max 5 questions
}

/**
 * Generate a short, mythi explanatory note based on risk band
 * Used in Oracle response to frame Reality Hygiene non-preachy
 */
export function generateRealityHygieneNote(band: string, total: number, max: number): string {
  const bandMessages: Record<string, string> = {
    low: `Reality hygiene: **${band.toUpperCase()}** (${total}/${max}). Clean signal - few manipulation patterns detected.`,
    moderate: `Reality hygiene: **${band.toUpperCase()}** (${total}/${max}). Some manipulation patterns present - worth slowing down to check sources.`,
    strong: `Reality hygiene: **${band.toUpperCase()}** (${total}/${max}). Multiple manipulation patterns detected - suggests engineered narrative rather than organic information.`,
    overwhelming: `Reality hygiene: **${band.toUpperCase()}** (${total}/${max}). Heavy manipulation pattern load - this appears designed to bypass critical thinking entirely.`,
  };

  return bandMessages[band] || `Reality hygiene: ${band} (${total}/${max})`;
}
