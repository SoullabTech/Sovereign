/**
 * Test script to verify Memory Palace Orchestrator integration
 */

import { memoryPalaceOrchestrator } from './lib/consciousness/memory/MemoryPalaceOrchestrator';

async function testMemoryPalace() {
  console.log('🧪 Testing Memory Palace Orchestrator...\n');

  const testUserId = 'test-user-' + Date.now();
  const testSessionId = 'test-session-' + Date.now();

  try {
    // Test 1: Retrieve memory context (should work even for new user)
    console.log('Test 1: Retrieving memory context...');
    const memoryContext = await memoryPalaceOrchestrator.retrieveMemoryContext(
      testUserId,
      'Hello, this is a test message',
      []
    );
    console.log('✅ Memory context retrieved:', {
      hasSessionMemory: !!memoryContext?.sessionMemory,
      hasEvolutionStatus: !!memoryContext?.evolutionStatus,
      activePatterns: memoryContext?.activePatterns?.length || 0
    });

    // Test 2: Store conversation memory
    console.log('\nTest 2: Storing conversation memory...');
    await memoryPalaceOrchestrator.storeConversationMemory({
      userId: testUserId,
      sessionId: testSessionId,
      userMessage: 'I feel a heaviness in my shoulders',
      maiaResponse: 'I hear that heaviness. What does it want to tell you?',
      conversationHistory: [],
      significance: 7,
      emotionalIntensity: 0.6,
      breakthroughLevel: 5,
      bodyRegion: 'shoulders',
      tensionLevel: 7,
      elementalLevels: {
        fire: 0.3,
        water: 0.7,
        earth: 0.4,
        air: 0.5,
        aether: 0.4
      },
      fieldStates: [],
      insights: ['Somatic awareness emerging'],
      themes: ['Body wisdom'],
      spiralIndicators: {}
    });
    console.log('✅ Conversation memory stored successfully');

    // Test 3: Retrieve again (should have evolution status now)
    console.log('\nTest 3: Retrieving memory context after storage...');
    const memoryContext2 = await memoryPalaceOrchestrator.retrieveMemoryContext(
      testUserId,
      'How are my shoulders doing?',
      []
    );
    console.log('✅ Memory context retrieved:', {
      evolutionStage: memoryContext2?.evolutionStatus?.currentStage,
      evolutionStageName: memoryContext2?.evolutionStatus?.currentStageName,
      somaticPatterns: memoryContext2?.somaticPatterns?.length || 0,
      latestCoherence: memoryContext2?.latestCoherence?.balanceQuality
    });

    console.log('\n🎉 All tests passed! Memory Palace is functioning.');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testMemoryPalace()
  .then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
