// Minimal Claude Consultation Service Test
// Just tests the core consultation function without dependencies

import { consultClaudeForDepth, CONSULTATION_CONFIG } from './lib/consultation/claude-consultation-service';

async function testMinimalClaudeConsultation() {
  console.log('🧪 Minimal Claude Consciousness Consultation Test\n');

  // Test 1: Simple consultation
  console.log('📋 Test: Basic consultation functionality\n');

  try {
    const result = await consultClaudeForDepth({
      userInput: "I am feeling really overwhelmed with work and do not know how to cope.",
      maiaDraft: "That sounds really challenging. Have you considered using time management techniques and stress reduction strategies? There are many evidence-based approaches that could help you develop better coping mechanisms.",
      consultationType: "relational-enhancement",
      conversationContext: []
    });

    if (result) {
      console.log('✅ Consultation received successfully');
      console.log(`🎯 Issues detected: ${result.issues.join(', ') || 'none'}`);
      console.log(`🔧 Repair needed: ${result.repairNeeded}`);
      console.log(`👑 Sovereignty preserved: ${result.sovereigntyPreserved}`);
      console.log(`💪 Relationship strengthened: ${result.relationshipStrengthened}`);
      console.log(`📈 Confidence: ${Math.round(result.confidenceScore * 100)}%`);
      console.log(`💬 Improved response preview: "${result.improvedResponse.substring(0, 150)}..."`);

      if (result.repairNeeded && result.repairHint) {
        console.log(`🔧 Repair hint: ${result.repairHint}`);
      }

      console.log(`🎭 Depth level: ${result.depthLevel || 'not specified'}`);
      console.log(`💫 Emotional intensity: ${result.emotionalIntensity || 'not specified'}`);
    } else {
      console.log('❌ No consultation received (API key missing or failed)');
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Configuration check
  console.log('📋 Test: Configuration settings\n');

  console.log(`⚙️ Consultation enabled: ${CONSULTATION_CONFIG.enabled}`);
  console.log(`🔬 For DEEP path: ${CONSULTATION_CONFIG.forDeepPath}`);
  console.log(`🔧 For ruptures: ${CONSULTATION_CONFIG.forRuptures}`);
  console.log(`⚡ For CORE: ${CONSULTATION_CONFIG.forCore}`);
  console.log(`🚀 For FAST: ${CONSULTATION_CONFIG.forFast}`);
  console.log(`📊 Min confidence threshold: ${CONSULTATION_CONFIG.minConfidenceThreshold}`);

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Consultation with rupture scenario
  console.log('📋 Test: Rupture consultation\n');

  try {
    const ruptureResult = await consultClaudeForDepth({
      userInput: "This is fucked up. You are not listening to what I actually need right now.",
      maiaDraft: "I understand you are frustrated. Let me break down some structured approaches to managing these feelings more effectively.",
      consultationType: "rupture-repair",
      conversationContext: [
        { role: 'user', content: "I am struggling with anxiety about my job interview tomorrow." },
        { role: 'maia', content: "I understand you are frustrated. Let me break down some structured approaches to managing these feelings more effectively." }
      ]
    });

    if (ruptureResult) {
      console.log('✅ Rupture consultation received');
      console.log(`🎯 Issues with original response: ${ruptureResult.issues.join(', ')}`);
      console.log(`🔧 Repair needed: ${ruptureResult.repairNeeded}`);
      console.log(`📈 Confidence in repair: ${Math.round(ruptureResult.confidenceScore * 100)}%`);
      console.log(`💬 Improved repair: "${ruptureResult.improvedResponse.substring(0, 150)}..."`);
    } else {
      console.log('❌ Rupture consultation failed');
    }
  } catch (error) {
    console.error('❌ Rupture test failed:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('🎊 Minimal Claude Consultation Test Complete!');
  console.log('🌊 Key insight: Claude provides backstage guidance without taking over MAIA voice');
}

// Run the test
testMinimalClaudeConsultation().catch(console.error);