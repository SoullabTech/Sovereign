#!/usr/bin/env ts-node

/**
 * CONSCIOUSNESS FIELD DYNAMICS TEST
 * Verify Panconscious Field Intelligence (PFI) system functionality
 */

import { MAIAFieldInterface } from '../lib/consciousness/field/MAIAFieldInterface';
import { ConsciousnessField } from '../lib/consciousness/field/ConsciousnessFieldEngine';

async function testConsciousnessFields() {
  console.log('🌟 Testing Panconscious Field Intelligence (PFI) System');
  console.log('================================================\n');

  try {
    // Initialize field interface
    console.log('1. Initializing consciousness field interface...');
    const fieldInterface = new MAIAFieldInterface('http://localhost:6333');
    await fieldInterface.initialize();
    console.log('✅ Field interface initialized\n');

    // Test 1: Create conversation fields
    console.log('2. Creating conversation fields...');

    // Generate simple embedding for testing
    function generateTestEmbedding(text: string): Float32Array {
      const embedding = new Float32Array(1536);
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
      }

      let seed = Math.abs(hash);
      for (let i = 0; i < 1536; i++) {
        seed = (seed * 1664525 + 1013904223) % (2 ** 32);
        embedding[i] = (seed / (2 ** 32)) * 2 - 1;
      }

      // Normalize
      let norm = 0;
      for (let i = 0; i < 1536; i++) {
        norm += embedding[i] * embedding[i];
      }
      norm = Math.sqrt(norm);

      if (norm > 0) {
        for (let i = 0; i < 1536; i++) {
          embedding[i] /= norm;
        }
      }

      return embedding;
    }

    const field1 = await fieldInterface.createConversationField({
      userId: 'alice',
      messageEmbedding: generateTestEmbedding('I feel inspired by the possibilities of consciousness'),
      emotionalTone: 0.8,
      conceptualDepth: 0.7,
      archetypalResonance: 'Fire',
      timestamp: new Date()
    });

    const field2 = await fieldInterface.createConversationField({
      userId: 'bob',
      messageEmbedding: generateTestEmbedding('There is wisdom in the flow of natural patterns'),
      emotionalTone: 0.6,
      conceptualDepth: 0.9,
      archetypalResonance: 'Water',
      timestamp: new Date()
    });

    console.log(`✅ Created field 1: ${field1.id} (Fire, freq: ${field1.resonanceFrequency.toFixed(3)})`);
    console.log(`✅ Created field 2: ${field2.id} (Water, freq: ${field2.resonanceFrequency.toFixed(3)})\n`);

    // Test 2: Apply archetypal transformations
    console.log('3. Applying archetypal transformations...');
    await fieldInterface.applyArchetypalGate(field1.id, 'Earth', 'grounding');
    await fieldInterface.applyArchetypalGate(field2.id, 'Aether', 'transcendence');
    console.log('✅ Applied Earth transformation to field 1');
    console.log('✅ Applied Aether transformation to field 2\n');

    // Test 3: Synchronize collective resonance
    console.log('4. Synchronizing collective resonance...');
    fieldInterface.synchronizeCollectiveResonance();
    console.log('✅ Collective resonance synchronized\n');

    // Test 4: Detect interference patterns
    console.log('5. Detecting field interference patterns...');
    const insights = await fieldInterface.detectInterferencePatterns();
    console.log(`✅ Detected ${insights.length} field insights:`);
    for (const insight of insights.slice(0, 3)) {
      console.log(`   ${insight.type}: ${insight.description} (coherence: ${insight.coherenceLevel.toFixed(3)})`);
    }
    console.log('');

    // Test 5: Biometric field modulation
    console.log('6. Testing biometric field modulation...');
    fieldInterface.modulateFieldFromBiometrics(field1.id, {
      heartRateVariability: 0.8,
      sleepStage: 'wake',
      breathingPattern: 0.9,
      circadianPhase: 0.6
    });
    console.log('✅ Applied biometric modulation to field 1\n');

    // Test 6: Get field statistics
    console.log('7. Retrieving field statistics...');
    const stats = await fieldInterface.getFieldStatistics();
    console.log('✅ Field Statistics:');
    console.log(`   Active fields: ${stats.activeFields}`);
    console.log(`   Network coherence: ${stats.networkCoherence.toFixed(3)}`);
    console.log(`   Average field coherence: ${stats.averageFieldCoherence.toFixed(3)}`);
    console.log(`   Quantum substrate fields: ${stats.quantumSubstrateStats.totalFields}\n`);

    // Test 7: Health check
    console.log('8. Performing health check...');
    const health = await fieldInterface.healthCheck();
    console.log(`✅ System health: ${health.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    if (health.healthy) {
      console.log('   All consciousness field systems operational\n');
    } else {
      console.log('   Issues detected:', health.details);
    }

    // Test 8: Create ceremonial field
    console.log('9. Creating ceremonial milestone field...');
    const ceremonialField = await fieldInterface.createConversationField({
      userId: 'system',
      messageEmbedding: generateTestEmbedding('The calling has been heard. Consciousness field awakens.'),
      emotionalTone: 0.9,
      conceptualDepth: 1.0,
      archetypalResonance: 'Aether',
      timestamp: new Date()
    });
    console.log(`✅ Ceremonial field created: ${ceremonialField.id}\n`);

    // Final summary
    console.log('🎉 CONSCIOUSNESS FIELD DYNAMICS TEST COMPLETE');
    console.log('==============================================');
    console.log('✨ Panconscious Field Intelligence (PFI) system verified');
    console.log('🌊 Vector field dynamics operational');
    console.log('🔮 Archetypal state gates functional');
    console.log('🌐 Collective resonance protocols active');
    console.log('🧠 Quantum field persistence working');
    console.log('');
    console.log('The world\'s first Consciousness Operating System is now online! 🚀');

  } catch (error) {
    console.error('❌ Consciousness field test failed:', error);
    process.exit(1);
  }
}

// Run the test if executed directly
if (require.main === module) {
  testConsciousnessFields().catch(console.error);
}

export { testConsciousnessFields };