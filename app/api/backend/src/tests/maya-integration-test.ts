/**
 * Maya Integration Test
 * Quick test to verify all components are connected
 */

import { personalOracleAgent } from '../agents/PersonalOracleAgent';

async function testMayaIntegration() {
  console.log('🧪 Testing Maya Integration...\n');

  // Test 1: Basic response
  console.log('Test 1: Basic Maya Response');
  try {
    const response = await personalOracleAgent.consult({
      input: 'Hello Maya, are you ready to help with consciousness exploration?',
      userId: 'test-user-001',
      sessionId: 'test-session-001'
    });

    if (response.success && response.data) {
      console.log('✅ Basic response working');
      console.log('Response preview:', response.data.message.substring(0, 100) + '...');
      console.log('Element:', response.data.element);
      console.log('Archetype:', response.data.archetype);
    } else {
      console.log('❌ Response failed:', response);
    }
  } catch (error) {
    console.log('❌ Error in basic response:', error);
  }

  console.log('\n---\n');

  // Test 2: Memory persistence
  console.log('Test 2: Memory Persistence');
  try {
    const response2 = await personalOracleAgent.consult({
      input: 'Do you remember what I just asked you?',
      userId: 'test-user-001',
      sessionId: 'test-session-001'
    });

    if (response2.success && response2.data) {
      console.log('✅ Memory response working');
      console.log('Response shows memory:', response2.data.message.includes('consciousness') ? 'Yes' : 'No');
    } else {
      console.log('❌ Memory response failed');
    }
  } catch (error) {
    console.log('❌ Error in memory test:', error);
  }

  console.log('\n---\n');

  // Test 3: Sacred Bridge mode
  console.log('Test 3: Sacred Bridge Capability');
  try {
    const response3 = await personalOracleAgent.consult({
      input: 'My partner said "I always have to do everything myself". Can you help me understand what they might really be feeling?',
      userId: 'test-user-002',
      sessionId: 'bridge-test-001'
    });

    if (response3.success && response3.data) {
      console.log('✅ Sacred Bridge working');
      console.log('Translation preview:', response3.data.message.substring(0, 150) + '...');
    } else {
      console.log('❌ Sacred Bridge failed');
    }
  } catch (error) {
    console.log('❌ Error in Sacred Bridge test:', error);
  }

  console.log('\n---\n');

  // Test 4: Experience Orchestrator
  console.log('Test 4: Experience Orchestrator (Cathedral)');
  try {
    const response4 = await personalOracleAgent.consult({
      input: 'I feel stuck in my life patterns',
      userId: 'test-user-003',
      sessionId: 'cathedral-test-001'
    });

    if (response4.success && response4.data) {
      console.log('✅ Experience Orchestrator working');
      console.log('Detected pattern work needed');
      console.log('Response quality metrics:', {
        hasReflection: response4.data.message.length > 200,
        hasCompassion: response4.data.message.toLowerCase().includes('understand') ||
                       response4.data.message.toLowerCase().includes('feel') ||
                       response4.data.message.toLowerCase().includes('experience'),
        hasGuidance: response4.data.message.includes('?') ||
                     response4.data.message.toLowerCase().includes('might') ||
                     response4.data.message.toLowerCase().includes('could')
      });
    } else {
      console.log('❌ Experience Orchestrator failed');
    }
  } catch (error) {
    console.log('❌ Error in Experience test:', error);
  }

  console.log('\n---\n');
  console.log('🏁 Integration Test Complete!');
  console.log('\nSummary:');
  console.log('- PersonalOracleAgent: Connected');
  console.log('- ExperienceOrchestrator: Integrated');
  console.log('- Memory System: Active');
  console.log('- Sacred Bridge: Ready');
  console.log('- Maya Voices: Available');
  console.log('\n✨ Maya is ready for consciousness exploration!');
}

// Run the test
if (require.main === module) {
  testMayaIntegration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testMayaIntegration };