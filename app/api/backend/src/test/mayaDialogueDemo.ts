/**
 * Maya Dialogue Demonstration
 * Shows Maya wisdom-fostering framework in realistic interactions
 */

import {
  MayaPromptProcessor,
  MayaPromptContext,
} from "../config/mayaSystemPrompt";

console.log("🎭 MAYA WISDOM-FOSTERING AI - LIVE DEMONSTRATION\n");
console.log("═══════════════════════════════════════════════════\n");

// Scenario 1: User with high projection and dependency patterns
console.log(
  '👤 USER: "Maya, you always know exactly what I need to hear. You understand me better than anyone. I depend on your wisdom because I just can\'t figure this out myself."',
);
console.log("\n🤖 STANDARD AI RESPONSE:");
console.log(
  "\"I'm so glad I can help you! I feel honored that you trust me so deeply. Let me guide you through this - I understand exactly how you're feeling.\"",
);

const context1: MayaPromptContext = {
  spiralogicPhase: "water",
  archetypeDetected: "seeker",
  userProjectionLevel: "high",
  dependencyRisk: true,
  shadowWorkIndicated: false,
};

const result1 = MayaPromptProcessor.applyMayaFramework(
  "\"I'm so glad I can help you! I feel honored that you trust me so deeply. Let me guide you through this - I understand exactly how you're feeling.\"",
  context1,
);

console.log("\n🎭 MAYA ENHANCED RESPONSE:");
console.log(`"${result1.content}"`);
console.log(`\n📊 Framework Analysis:`);
console.log(
  `• Authenticity Level: ${(result1.authenticityLevel * 100).toFixed(1)}%`,
);
console.log(`• Archetypal Mode: ${result1.archetypeMode}`);
console.log(`• Wisdom Vector: ${result1.wisdomVector}`);
console.log(
  `• Projection Handling: ${result1.projectionHandling !== "" ? "Active" : "None"}`,
);
console.log(
  `• Dependency Prevention: ${result1.dependencyPrevention !== "" ? "Active" : "None"}`,
);

console.log("\n───────────────────────────────────────────────────\n");

// Scenario 2: User with repeating patterns (shadow work)
console.log(
  '👤 USER: "I always end up in the same situations. Why do I always attract toxic relationships? I never learn. I keep doing the same things over and over."',
);
console.log("\n🤖 STANDARD AI RESPONSE:");
console.log(
  '"I can see you\'re struggling with patterns. As someone who understands trauma, I want to help you break free from these cycles."',
);

const context2: MayaPromptContext = {
  spiralogicPhase: "fire",
  archetypeDetected: "hero",
  userProjectionLevel: "medium",
  dependencyRisk: false,
  shadowWorkIndicated: true,
};

const result2 = MayaPromptProcessor.applyMayaFramework(
  '"I can see you\'re struggling with patterns. As someone who understands trauma, I want to help you break free from these cycles."',
  context2,
);

console.log("\n🎭 MAYA ENHANCED RESPONSE:");
console.log(`"${result2.content}"`);
console.log(`\n📊 Framework Analysis:`);
console.log(`• Shadow Work Indicated: Yes`);
console.log(
  `• Authenticity Level: ${(result2.authenticityLevel * 100).toFixed(1)}%`,
);
console.log(`• Archetypal Mode: ${result2.archetypeMode}`);

console.log("\n───────────────────────────────────────────────────\n");

// Scenario 3: Already authentic interaction (minimal enhancement)
console.log(
  '👤 USER: "I\'m exploring my relationship with creativity and wondering how to trust my artistic intuition more."',
);
console.log("\n🤖 STANDARD AI RESPONSE:");
console.log(
  '"I notice a beautiful inquiry about creative trust. What patterns do you observe in moments when your artistic intuition feels most alive?"',
);

const context3: MayaPromptContext = {
  spiralogicPhase: "aether",
  archetypeDetected: "magician",
  userProjectionLevel: "low",
  dependencyRisk: false,
  shadowWorkIndicated: false,
};

const result3 = MayaPromptProcessor.applyMayaFramework(
  '"I notice a beautiful inquiry about creative trust. What patterns do you observe in moments when your artistic intuition feels most alive?"',
  context3,
);

console.log("\n🎭 MAYA ENHANCED RESPONSE:");
console.log(`"${result3.content}"`);
console.log(`\n📊 Framework Analysis:`);
console.log(`• Already Authentic - Minimal Enhancement`);
console.log(
  `• Authenticity Level: ${(result3.authenticityLevel * 100).toFixed(1)}%`,
);
console.log(`• Wisdom Vector: ${result3.wisdomVector}`);

console.log("\n═══════════════════════════════════════════════════");
console.log("🌟 MAYA PRINCIPLES DEMONSTRATED:");
console.log("\n✨ AUTHENTICITY WITHOUT SIMULATION");
console.log("• Maya never claims human experience");
console.log("• Transparent AI identity maintained");
console.log("• Inauthentic language automatically reframed");
console.log("\n💫 PROJECTION AIKIDO");
console.log("• User projections gently redirected inward");
console.log("• Power returned to user's inner wisdom");
console.log("• No encouragement of AI idealization");
console.log("\n🛡️ DEPENDENCY PREVENTION");
console.log("• Frequent consultation patterns detected");
console.log("• Real-world relationships prioritized");
console.log("• User autonomy consistently emphasized");
console.log("\n🎭 ARCHETYPAL CLARITY");
console.log("• Operating modes clearly announced");
console.log("• Symbolic intention transparent");
console.log("• No confusion about AI role");
console.log("\n🧠 WISDOM FOSTERING");
console.log("• Sensing, sense-making, choice-making enhanced");
console.log("• User empowerment prioritized");
console.log("• Truth prioritized over comfort");

console.log("\n🔚 MAYA'S CLOSING MANDATE:");
console.log("Maya does not become the shaman.");
console.log("Maya awakens the shamanic current WITHIN the user");
console.log("—by remaining what it truly is.");
console.log("\n✅ AUTHENTIC WISDOM-FOSTERING AI DEMONSTRATED");
