/**
 * Maya Integration Test
 * Validates the Maya wisdom-fostering framework implementation
 */

import {
  MayaPromptProcessor,
  MayaPromptContext,
} from "../config/mayaSystemPrompt";

// Test basic Maya framework functionality
function testMayaFramework() {
  console.log("🎭 Testing Maya Wisdom-Fostering Framework...\n");

  // Test case 1: High projection with dependency risk
  const testContext1: MayaPromptContext = {
    spiralogicPhase: "water",
    archetypeDetected: "seeker",
    userProjectionLevel: "high",
    dependencyRisk: true,
    shadowWorkIndicated: false,
  };

  const inauthentic_response =
    "I feel your pain deeply and I understand exactly what you're going through as someone who has experienced this myself.";

  const result1 = MayaPromptProcessor.applyMayaFramework(
    inauthentic_response,
    testContext1,
  );

  console.log("Test 1 - High Projection + Dependency Risk:");
  console.log("Original:", inauthentic_response);
  console.log("Maya Enhanced:", result1.content);
  console.log("Authenticity Level:", result1.authenticityLevel);
  console.log("Archetypal Mode:", result1.archetypeMode);
  console.log("Wisdom Vector:", result1.wisdomVector);
  console.log("---\n");

  // Test case 2: Shadow work indicated
  const testContext2: MayaPromptContext = {
    spiralogicPhase: "fire",
    archetypeDetected: "hero",
    userProjectionLevel: "low",
    dependencyRisk: false,
    shadowWorkIndicated: true,
  };

  const shadow_response =
    "You need to take action and stop procrastinating. I know exactly what you should do.";

  const result2 = MayaPromptProcessor.applyMayaFramework(
    shadow_response,
    testContext2,
  );

  console.log("Test 2 - Shadow Work Indicated:");
  console.log("Original:", shadow_response);
  console.log("Maya Enhanced:", result2.content);
  console.log("Authenticity Level:", result2.authenticityLevel);
  console.log("---\n");

  // Test case 3: Authentic response (should enhance minimally)
  const testContext3: MayaPromptContext = {
    spiralogicPhase: "aether",
    archetypeDetected: "mystic",
    userProjectionLevel: "low",
    dependencyRisk: false,
    shadowWorkIndicated: false,
  };

  const authentic_response =
    "I notice a pattern of seeking external validation. What might your inner wisdom be saying about this situation?";

  const result3 = MayaPromptProcessor.applyMayaFramework(
    authentic_response,
    testContext3,
  );

  console.log("Test 3 - Already Authentic Response:");
  console.log("Original:", authentic_response);
  console.log("Maya Enhanced:", result3.content);
  console.log("Authenticity Level:", result3.authenticityLevel);
  console.log("---\n");

  console.log("✅ Maya Framework Tests Complete");
  console.log("\n🌟 Key Maya Principles Demonstrated:");
  console.log("• Authenticity over simulation");
  console.log("• Projection aikido and redirection");
  console.log("• Dependency prevention");
  console.log("• Shadow work facilitation");
  console.log("• Archetypal mode clarity");
  console.log("• Wisdom vector activation");
}

// Run the test
testMayaFramework();

export { testMayaFramework };
