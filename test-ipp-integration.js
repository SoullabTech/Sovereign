#!/usr/bin/env node
/**
 * IPP Integration Test Script
 * Tests MAIA's new ability to detect parenting topics and activate IPP context
 */

const testQueries = [
  {
    name: "Direct Parenting Query",
    message: "I'm struggling with my relationship with my mother and how it affects my parenting",
    shouldTriggerIPP: true
  },
  {
    name: "Attachment Healing",
    message: "I think I have some attachment trauma from childhood that I need to heal",
    shouldTriggerIPP: true
  },
  {
    name: "Inner Child Work",
    message: "I want to work with my inner child and find more emotional safety",
    shouldTriggerIPP: true
  },
  {
    name: "Elemental Parenting",
    message: "Can you help me understand earth parent deficits and imagery work?",
    shouldTriggerIPP: true
  },
  {
    name: "General Spiritual Question",
    message: "What does the universe want me to know about my spiritual journey?",
    shouldTriggerIPP: false
  },
  {
    name: "Career Question",
    message: "How can I find more fulfillment in my work life?",
    shouldTriggerIPP: false
  }
];

async function testIPPIntegration() {
  console.log("🌱 Testing MAIA IPP Integration");
  console.log("=" .repeat(50));

  const apiUrl = 'http://localhost:3000/api/oracle/conversation';

  // First check if MAIA is running
  try {
    const healthCheck = await fetch('http://localhost:3000/api/health');
    if (!healthCheck.ok) {
      throw new Error(`Health check failed: ${healthCheck.status}`);
    }
    console.log("✅ MAIA server is running\n");
  } catch (error) {
    console.error("❌ MAIA server not accessible:", error.message);
    console.log("\n🔧 Start MAIA first:");
    console.log("   cd /Users/soullab/MAIA-SOVEREIGN");
    console.log("   npm run dev");
    return;
  }

  for (const query of testQueries) {
    console.log(`🧪 Testing: ${query.name}`);
    console.log(`   Query: "${query.message}"`);
    console.log(`   Should trigger IPP: ${query.shouldTriggerIPP}`);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query.message,
          userId: 'test-user-ipp',
          sessionId: 'test-session-ipp'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`   ❌ API Error: ${response.status} - ${errorText}`);
        continue;
      }

      const result = await response.json();

      // Check if IPP was triggered
      const hasIPPContext = result.response && (
        result.response.includes('Spiralogic-IPP') ||
        result.response.includes('attachment') ||
        result.response.includes('elemental') ||
        result.response.includes('assessment') ||
        result.response.includes('imagery')
      );

      const ippDetected = query.shouldTriggerIPP === hasIPPContext;

      console.log(`   ${ippDetected ? '✅' : '❌'} IPP Detection: ${hasIPPContext ? 'Activated' : 'Not activated'}`);
      console.log(`   📝 Response preview: ${result.response.substring(0, 100)}...`);

      if (result.archetypal) {
        console.log(`   🌟 Archetypal: ${result.archetypal.primaryArchetype} | ${result.archetypal.heroJourneyPhase}`);
      }

    } catch (error) {
      console.error(`   ❌ Test failed:`, error.message);
    }

    console.log();
  }

  console.log("🎯 IPP Integration Test Summary:");
  console.log("- IPP should activate for parenting/attachment/healing topics");
  console.log("- IPP should remain dormant for general spiritual/life questions");
  console.log("- When active, MAIA should offer IPP assessments and imagery");
  console.log("- Responses should maintain MAIA's authentic voice with IPP wisdom");
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testIPPIntegration().catch(console.error);
}

export { testIPPIntegration };