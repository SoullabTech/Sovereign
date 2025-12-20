/**
 * Reality Check Agent
 *
 * The part that makes Reality Hygiene *MAIA* instead of just a checklist.
 * Generates consciousness-expanding questions mapped to Spiralogic elements.
 *
 * Takes reality scores + user content and returns:
 * 1. "What would I need to see to lower this score?" (Earth/Air - grounding in evidence)
 * 2. "Where am I being emotionally recruited?" (Water/Fire - awareness of manipulation)
 * 3. "What questions restore freedom of attention?" (Aether - sovereignty)
 *
 * This is the intervention layer - not just detection, but consciousness expansion.
 */

import {
  type RealityScores,
  type RealityBand,
  type SpiralogicElement,
  computeElementalBreakdown,
  getTopSignals,
} from "./realityTypes";

export type RealityCheckResult = {
  // Core questions (always generated)
  lowering_score: string;
  emotional_recruitment: string;
  freedom_questions: string[];

  // Elemental breakdown (which elements are most activated)
  primary_element: SpiralogicElement;
  elemental_breakdown: Record<SpiralogicElement, number>;

  // Developmental messaging (tied to cognitive altitude if available)
  developmental_note?: string;
};

/**
 * Generate consciousness-expanding questions from Reality Hygiene scores
 * This is async to allow for future LLM-assisted generation
 */
export async function generateRealityCheck(
  scores: RealityScores,
  band: RealityBand,
  userContent: string,
  cognitiveAltitude?: number // Optional: from cognitive profile
): Promise<RealityCheckResult> {
  const topSignals = getTopSignals(scores, 5);
  const elementalBreakdown = computeElementalBreakdown(scores);

  // Determine primary element (most activated)
  const primaryElement = (Object.entries(elementalBreakdown).sort(
    ([, a], [, b]) => b - a
  )[0][0] as SpiralogicElement);

  // Generate three question types
  const loweringScore = generateLoweringScoreQuestion(
    topSignals,
    elementalBreakdown,
    userContent
  );

  const emotionalRecruitment = generateEmotionalRecruitmentQuestion(
    topSignals,
    elementalBreakdown,
    band,
    userContent
  );

  const freedomQuestions = generateFreedomQuestions(
    band,
    elementalBreakdown,
    topSignals
  );

  // Optional: Add developmental messaging based on cognitive altitude
  const developmentalNote = cognitiveAltitude
    ? generateDevelopmentalNote(cognitiveAltitude, band, primaryElement)
    : undefined;

  return {
    lowering_score: loweringScore,
    emotional_recruitment: emotionalRecruitment,
    freedom_questions: freedomQuestions,
    primary_element: primaryElement,
    elemental_breakdown: elementalBreakdown,
    developmental_note: developmentalNote,
  };
}

/**
 * EARTH/AIR: "What would I need to see to lower this score?"
 * Grounding question - what evidence would change your mind?
 */
function generateLoweringScoreQuestion(
  topSignals: Array<{ indicator: string; score: number; element: SpiralogicElement }>,
  elementalBreakdown: Record<SpiralogicElement, number>,
  userContent: string
): string {
  const earthAirSignals = topSignals.filter(
    (s) => s.element === "Earth" || s.element === "Air"
  );

  if (earthAirSignals.length === 0) {
    return "What primary source (original document, full dataset, court filing, peer-reviewed study) would definitively settle this claim?";
  }

  const topIndicator = earthAirSignals[0].indicator;

  // Map indicators to specific grounding questions
  const questions: Record<string, string> = {
    missing_information:
      "What specific information is missing? List exactly what you would need to verify this independently.",
    cherry_picked_data:
      "What would the full dataset look like? What data points might have been excluded?",
    logical_fallacies:
      "What's the strongest steel-man argument from someone who disagrees? Can you articulate it without straw-manning?",
    false_dilemmas:
      "What options exist beyond the two being presented? What would a third path look like?",
    framing_techniques:
      "How would this story read if framed by someone with the opposite perspective? What language would change?",
    historical_parallels:
      "Are the historical parallels accurate? What would a professional historian say about this comparison?",
    gain_incentive:
      "Who benefits financially or politically if this becomes widely believed? Follow the money.",
  };

  return (
    questions[topIndicator] ||
    "What concrete evidence would convince you this claim is false or exaggerated?"
  );
}

/**
 * WATER/FIRE: "Where am I being emotionally recruited?"
 * Awareness question - notice the manipulation hooks
 */
function generateEmotionalRecruitmentQuestion(
  topSignals: Array<{ indicator: string; score: number; element: SpiralogicElement }>,
  elementalBreakdown: Record<SpiralogicElement, number>,
  band: RealityBand,
  userContent: string
): string {
  const waterFireSignals = topSignals.filter(
    (s) => s.element === "Water" || s.element === "Fire"
  );

  if (waterFireSignals.length === 0) {
    return "Notice where you feel emotionally activated. What emotion is being recruited (fear, anger, righteousness, urgency)? What would you think if you weren't feeling this emotion?";
  }

  const topIndicator = waterFireSignals[0].indicator;

  const questions: Record<string, string> = {
    emotional_manipulation:
      "What specific emotion is this trying to make you feel? Fear? Anger? Shame? Righteousness? Now ask: what would you do differently if you weren't feeling this emotion?",
    manufactured_outrage:
      "Is your outrage organic (coming from your values) or engineered (designed by someone else)? Who benefits from your anger?",
    tribal_division:
      "Notice the 'us vs. them' framing. When you're in tribal mode, what happens to your ability to think clearly? What cognitive functions shut down?",
    urgent_action:
      "What would change if you waited 48 hours before acting, sharing, or deciding? Why is there pressure to act RIGHT NOW?",
    novelty_shock:
      "Is the shock value making you skip your usual critical thinking steps? What would you normally check before believing this?",
    rapid_behavior_shifts:
      "Why is there sudden pressure to change your behavior or beliefs *immediately*? What would thoughtful change look like instead?",
    good_vs_evil:
      "Is this really simple good vs. evil? Or is that framing preventing you from seeing complexity, trade-offs, and nuance?",
    emotional_repetition:
      "What emotionally-charged phrase is being repeated? Notice how repetition bypasses analysis. What would one careful reading reveal?",
  };

  return (
    questions[topIndicator] ||
    "Where do you feel the emotional hook in your body? What is it recruiting you to believe or do?"
  );
}

/**
 * AETHER: "What questions restore freedom of attention?"
 * Sovereignty questions - break the frame, reclaim your thinking
 */
function generateFreedomQuestions(
  band: RealityBand,
  elementalBreakdown: Record<SpiralogicElement, number>,
  topSignals: Array<{ indicator: string; score: number; element: SpiralogicElement }>
): string[] {
  const questions: string[] = [];

  // Base freedom questions (always include)
  questions.push(
    "Who benefits if I believe this right now? Follow the incentives (money, power, attention, recruitment)."
  );

  questions.push(
    "Am I thinking for myself, or being recruited into a pre-existing narrative? What's the difference?"
  );

  questions.push(
    "What would I need to personally verify (not just read online) before sharing this with others?"
  );

  // Add band-specific questions
  if (band === "strong" || band === "overwhelming") {
    questions.push(
      "Is this content designed to bypass my critical thinking entirely? What happens if I slow down and check each claim?"
    );

    questions.push(
      "What happens to my freedom of attention if I accept this framing uncritically? What am I no longer able to see?"
    );
  }

  // Add element-specific questions
  if (elementalBreakdown.Aether >= 10) {
    questions.push(
      "Why is dissent being suppressed? What am I not allowed to question? When questioning itself is forbidden, what does that tell you?"
    );

    questions.push(
      "When 'everyone agrees' or 'the science is settled,' what perspectives are being excluded? Who's not in the room?"
    );
  }

  if (elementalBreakdown.Water >= 12) {
    questions.push(
      "If I share this while emotionally activated, am I spreading truth or spreading contagion? What's my responsibility?"
    );
  }

  if (elementalBreakdown.Fire >= 12) {
    questions.push(
      "What would 'acting slowly' look like? Can I afford 24-48 hours to think before committing?"
    );
  }

  if (elementalBreakdown.Earth >= 12) {
    questions.push(
      "What primary sources exist? Who has actually read the original document/study/data? Can I be one of those people?"
    );
  }

  // Return max 5 questions (prioritize first ones)
  return questions.slice(0, 5);
}

/**
 * Generate developmental note based on cognitive altitude
 * Ties Reality Hygiene to user's current consciousness level
 */
function generateDevelopmentalNote(
  cognitiveAltitude: number,
  band: RealityBand,
  primaryElement: SpiralogicElement
): string {
  // Map cognitive levels (1-10 scale) to Bloom's taxonomy
  if (cognitiveAltitude <= 2) {
    // Level 1-2: Knowledge/Comprehension - still gathering information
    return `You're in a knowledge-gathering phase. Right now, focus on: "What are the facts?" and "What's missing?" Don't rush to conclusions.`;
  }

  if (cognitiveAltitude <= 4) {
    // Level 3-4: Application/Analysis - starting to see patterns
    return `You're developing pattern recognition. Good questions for you: "What patterns do I see?" and "What counter-evidence exists?" Build your analytical muscles.`;
  }

  if (cognitiveAltitude <= 6) {
    // Level 5-6: Analysis/Evaluation - can hold complexity
    return `You're able to hold complexity. Challenge yourself: "What's being left out?" and "How would someone smart disagree?" Don't settle for simple narratives.`;
  }

  if (cognitiveAltitude <= 8) {
    // Level 7-8: Synthesis - integrating multiple perspectives
    return `You're synthesizing multiple viewpoints. Your edge: "What perspective would integrate all of this?" and "What am I certain about vs. what do I assume?"`;
  }

  // Level 9-10: Creation/Metacognition - teaching others
  return `You're operating at a metacognitive level. Your responsibility: "How do I help others see what I see without manipulation?" and "What wisdom can I offer?"`;
}

/**
 * Generate a short summary for Oracle response
 * Non-preachy, mythic framing
 */
export function generateRealityHygieneSummary(
  band: RealityBand,
  total: number,
  max: number,
  primaryElement: SpiralogicElement
): string {
  const elementNotes: Record<SpiralogicElement, string> = {
    Water: "emotional manipulation is the primary pattern",
    Fire: "urgency and pressure are the primary patterns",
    Earth: "missing information and cherry-picked data are the primary patterns",
    Air: "logical fallacies and framing are the primary patterns",
    Aether: "authority appeals and suppression are the primary patterns",
  };

  const bandMessages: Record<RealityBand, string> = {
    low: `Reality hygiene: **${band.toUpperCase()}** (${total}/${max}). Clean signal - few manipulation patterns detected. Proceed with normal critical thinking.`,
    moderate: `Reality hygiene: **${band.toUpperCase()}** (${total}/${max}). Some manipulation patterns present (${elementNotes[primaryElement]}). Worth slowing down to verify sources.`,
    strong: `Reality hygiene: **${band.toUpperCase()}** (${total}/${max}). Multiple manipulation patterns detected (${elementNotes[primaryElement]}). This appears to be engineered narrative rather than organic information. Check primary sources before sharing.`,
    overwhelming: `Reality hygiene: **${band.toUpperCase()}** (${total}/${max}). Heavy manipulation pattern load (${elementNotes[primaryElement]}). This content appears designed to bypass critical thinking entirely. Do not share without deep verification.`,
  };

  return bandMessages[band];
}
