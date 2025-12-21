#!/usr/bin/env tsx
// backend - Verify all 8 consciousness rules load and fire correctly

import { fetchEnabledRulesSexpr } from "../../../services/rulesService";
import { compileRuleSExpr } from "../ruleCompiler";
import { runRuleEngine, pickRouting } from "../ruleEngine";
import { closePool } from "../../../../../lib/db/postgres";

async function verifyRules() {
  console.log("🔍 Verifying 8 Consciousness Rules\n");
  console.log("=".repeat(60));

  // Fetch rules from database
  const rulesSexpr = await fetchEnabledRulesSexpr();

  if (!rulesSexpr) {
    console.error("❌ No rules found in database");
    process.exit(1);
  }

  // Compile rules
  const rules = compileRuleSExpr(rulesSexpr);

  console.log(`\n✅ Loaded ${rules.length} rules from database`);
  console.log("\nRules (by priority):");
  rules.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name} (priority ${r.priority})`);
  });

  // Test scenarios
  const scenarios = [
    {
      name: "Critical Safety (HRV drop > 30)",
      facts: {
        input: { text: "I feel my heart racing" },
        biomarkers: { hrv_drop: 35 },
        symbolic: {},
      },
      expectedRoute: "SafetyAgent",
      expectedFacet: "safety",
    },
    {
      name: "Earth1 Grounding",
      facts: {
        input: { text: "I need grounding right now" },
        biomarkers: { energy_level: "low" },
        symbolic: {},
      },
      expectedRoute: "SomaticAgent",
      expectedFacet: "earth1",
    },
    {
      name: "Ventral Regulation",
      facts: {
        input: { text: "I'm anxious and can't calm down" },
        biomarkers: { sentiment_score: -0.5, arousal_score: 0.8 },
        symbolic: {},
      },
      expectedRoute: "SomaticAgent",
      expectedFacet: "ventral",
    },
    {
      name: "Water2 Shadow Work",
      facts: {
        input: { text: "I feel stuck thinking about the betrayal" },
        biomarkers: { hrv_drop: 20 },
        symbolic: { theme: "betrayal" },
      },
      expectedRoute: "ShadowAgent",
      expectedFacet: "water2",
    },
    {
      name: "Fire3 Vision Overheat",
      facts: {
        input: { text: "I have this big vision for my project" },
        biomarkers: { arousal_score: 0.85 },
        symbolic: {},
      },
      expectedRoute: "GuideAgent",
      expectedFacet: "fire3",
    },
    {
      name: "Air2 Meta-Reflection",
      facts: {
        input: { text: "I notice a pattern emerging in my life" },
        biomarkers: { emotional_clarity: 0.8 },
        symbolic: {},
      },
      expectedRoute: "ReflectionAgent",
      expectedFacet: "air2",
    },
    {
      name: "Air2 Rumination Loop",
      facts: {
        input: { text: "What if I keep replaying this mistake?" },
        biomarkers: {},
        symbolic: {},
      },
      expectedRoute: "CBTAgent",
      expectedFacet: "air2",
    },
    {
      name: "Aether Numinous Entry",
      facts: {
        input: { text: "This synchronicity feels archetypal" },
        biomarkers: {},
        symbolic: {},
      },
      expectedRoute: "MysticAgent",
      expectedFacet: "aether",
    },
  ];

  console.log("\n" + "=".repeat(60));
  console.log("\n🧪 Testing Rule Scenarios\n");

  let passCount = 0;
  let failCount = 0;

  for (const scenario of scenarios) {
    const fired = runRuleEngine(rules, scenario.facts);
    const routing = pickRouting(fired);

    const routeMatch = routing.route === scenario.expectedRoute;
    const facetMatch = routing.infer?.facet === scenario.expectedFacet;
    const passed = routeMatch && facetMatch;

    if (passed) {
      console.log(`✅ ${scenario.name}`);
      console.log(`   → Route: ${routing.route}, Facet: ${routing.infer?.facet}`);
      passCount++;
    } else {
      console.log(`❌ ${scenario.name}`);
      console.log(`   Expected: ${scenario.expectedRoute} / ${scenario.expectedFacet}`);
      console.log(`   Got: ${routing.route || "none"} / ${routing.infer?.facet || "none"}`);
      failCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\n📊 Results: ${passCount}/${scenarios.length} passed, ${failCount} failed\n`);

  await closePool();

  if (failCount > 0) {
    process.exit(1);
  }
}

verifyRules()
  .then(() => {
    console.log("✅ All rules verified successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
