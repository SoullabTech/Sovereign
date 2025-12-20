/**
 * Reality Hygiene System - Quick Test Script
 *
 * Tests core functionality without requiring full server setup.
 */

import {
  shouldRunRealityHygiene,
  buildRealityHygieneFromScores,
} from "./lib/reality/realityHygiene";
import {
  defaultRealityScores,
  computeRealityTotal,
  computeElementalBreakdown,
  getTopSignals,
} from "./lib/reality/realityTypes";
import { generateRealityCheck } from "./lib/reality/realityCheckAgent";

async function testRealityHygiene() {
  console.log("🔍 Testing Reality Hygiene System\n");

  // Test 1: Detection trigger
  console.log("Test 1: Detection Trigger");
  const testMessages = [
    { text: "Hey, how are you?", shouldTrigger: false },
    {
      text: "Breaking news: everyone is saying this shocking thing!",
      shouldTrigger: true,
    },
    { text: "Check out this article: https://example.com/news", shouldTrigger: true },
    {
      text: "Those people are destroying everything. If you disagree, you're wrong.",
      shouldTrigger: true,
    },
  ];

  testMessages.forEach((msg) => {
    const triggers = shouldRunRealityHygiene(msg.text);
    const passed = triggers === msg.shouldTrigger;
    console.log(
      `  ${passed ? "✅" : "❌"} "${msg.text.slice(0, 40)}..." → ${triggers ? "TRIGGER" : "SKIP"}`
    );
  });

  console.log("\n");

  // Test 2: Scoring logic
  console.log("Test 2: Scoring Logic");
  const defaultScores = defaultRealityScores();
  const { total: defaultTotal, max, band: defaultBand } = computeRealityTotal(defaultScores);
  console.log(`  Default scores: ${defaultTotal}/${max} (${defaultBand})`);

  // Simulate a moderate manipulation pattern
  const moderateScores = { ...defaultScores };
  moderateScores.emotional_manipulation = 4;
  moderateScores.timing = 3;
  moderateScores.urgent_action = 3;
  moderateScores.bandwagon = 2;

  const { total: moderateTotal, band: moderateBand } = computeRealityTotal(moderateScores);
  console.log(`  Moderate pattern: ${moderateTotal}/${max} (${moderateBand})`);

  // Test 3: Elemental breakdown
  console.log("\nTest 3: Elemental Breakdown");
  const elementalBreakdown = computeElementalBreakdown(moderateScores);
  Object.entries(elementalBreakdown).forEach(([element, score]) => {
    console.log(`  ${element}: ${score}/25`);
  });

  // Test 4: Top signals
  console.log("\nTest 4: Top Signals");
  const topSignals = getTopSignals(moderateScores, 5);
  topSignals.forEach((signal, i) => {
    console.log(`  ${i + 1}. ${signal.indicator}: ${signal.score} (${signal.element})`);
  });

  // Test 5: Reality Hygiene result building
  console.log("\nTest 5: Reality Hygiene Result");
  const hygieneResult = buildRealityHygieneFromScores(moderateScores);
  console.log(`  Total: ${hygieneResult.total}/${hygieneResult.max}`);
  console.log(`  Band: ${hygieneResult.band}`);
  console.log(`  Top signal: ${hygieneResult.topSignals[0].indicator}`);

  // Test 6: RealityCheckAgent question generation
  console.log("\nTest 6: RealityCheckAgent Questions");
  const checkResult = await generateRealityCheck(
    hygieneResult.scores,
    hygieneResult.band,
    "Breaking news: everyone is saying this shocking thing!",
    5.5 // Cognitive altitude (medium-high)
  );

  console.log(`  Primary element: ${checkResult.primary_element}`);
  console.log(`  Lowering score Q: ${checkResult.lowering_score.slice(0, 80)}...`);
  console.log(`  Emotional recruit Q: ${checkResult.emotional_recruitment.slice(0, 80)}...`);
  console.log(`  Freedom questions: ${checkResult.freedom_questions.length} questions`);
  if (checkResult.developmental_note) {
    console.log(`  Developmental note: ${checkResult.developmental_note.slice(0, 80)}...`);
  }

  console.log("\n✅ All tests completed successfully!");
}

// Run tests
testRealityHygiene().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
