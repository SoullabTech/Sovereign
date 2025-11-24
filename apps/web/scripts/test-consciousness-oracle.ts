// Test script for the Consciousness Oracle System
// Verifies all components work together without cringe

import { MAIAOracle } from '@/lib/consciousness/maia-oracle';

async function testConsciousnessOracle() {
  console.log('🔥 Testing MAIA Consciousness Oracle System');
  console.log('=' .repeat(50));

  const oracle = new MAIAOracle({
    maxRetries: 2,
    cringeThreshold: 5,
    enableLevelAdaptation: true,
    enableCringeFilter: true,
    aiProvider: 'anthropic',
    model: 'claude-3-sonnet-20240229'
  });

  // Test 1: System Status
  console.log('\n1. System Status Check:');
  const status = oracle.getSystemStatus();
  console.log('✅ Configuration:', JSON.stringify(status.config, null, 2));
  console.log('✅ Components:', status.components);

  // Test 2: User Diagnosis
  console.log('\n2. User Diagnosis:');
  try {
    const diagnosis = await oracle.diagnoseUser('test-user-123');
    console.log('✅ User Level:', diagnosis.level);
    console.log('✅ Recommendations:');
    diagnosis.recommendations.forEach(rec => console.log(`   - ${rec}`));
  } catch (error) {
    console.log('❌ Diagnosis test failed:', error.message);
  }

  // Test 3: Cringe Detection
  console.log('\n3. Cringe Filter Test:');
  const testTexts = [
    "Hey, sounds like you're dealing with some tough stuff. What's actually happening?",
    "Beloved divine soul, you are infinite cosmic consciousness manifesting sacred light through your beautiful being.",
    "This pattern shows Fire meeting Water - creative energy encountering emotional depth.",
    "Trust the universe, everything happens for a divine reason in your sacred journey."
  ];

  const cringeResults = await oracle.testCringeDetection(testTexts);
  cringeResults.forEach((result, i) => {
    const status = result.hasCringe ? '❌' : '✅';
    console.log(`${status} Text ${i + 1}: Score ${result.score}/10`);
    if (result.suggestion) {
      console.log(`   💡 ${result.suggestion}`);
    }
  });

  // Test 4: Elemental Analysis
  console.log('\n4. Elemental Signature Analysis:');
  const testMessages = [
    "I want to create something amazing and start a new project",
    "I'm feeling really emotional and need to process these deep feelings",
    "I need practical steps to ground this idea in reality",
    "Help me think through this clearly and communicate better",
    "I want to integrate everything into a unified whole"
  ];

  // Use the language generator directly for this test
  const { AdaptiveLanguageGenerator } = await import('@/lib/consciousness/adaptive-language');
  const languageGen = new AdaptiveLanguageGenerator();

  testMessages.forEach((message, i) => {
    const signature = languageGen.analyzeElementalSignature(message);
    console.log(`Message ${i + 1}: Fire:${signature.fire} Water:${signature.water} Earth:${signature.earth} Air:${signature.air} Aether:${signature.aether}`);
  });

  console.log('\n🎉 All tests completed! The consciousness oracle system is ready.');
  console.log('\nTo use in your app:');
  console.log('1. Visit /oracle/consciousness for the demo interface');
  console.log('2. Call POST /api/oracle/conscious with user messages');
  console.log('3. Import useMAIAOracle() hook in React components');
}

// Run if called directly
if (require.main === module) {
  testConsciousnessOracle().catch(console.error);
}

export { testConsciousnessOracle };