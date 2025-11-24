/**
 * TEST ADAPTIVE ORACLE
 *
 * Demonstrates consciousness-level adaptive responses.
 *
 * Tests the same input across all 5 levels to show how MAIA adapts.
 */

import { AdaptiveLanguageGenerator } from '../lib/consciousness/AdaptiveLanguageGenerator';
import { ConsciousnessLevel } from '../lib/consciousness/ConsciousnessLevelDetector';

const generator = new AdaptiveLanguageGenerator();

// Test input: Creative block scenario
const testInput = "I've been feeling really stuck in my creative work lately and I don't know why.";

async function testAllLevels() {
  console.log('🎯 ADAPTIVE MAIA ORACLE TEST\n');
  console.log('Testing input:', testInput);
  console.log('\n' + '='.repeat(80) + '\n');

  const results = await generator.testAllLevels(testInput, 'test-user');

  // Display results for each level
  for (let level = 1; level <= 5; level++) {
    const response = results[level as ConsciousnessLevel];

    console.log(`\n${'█'.repeat(80)}`);
    console.log(`LEVEL ${level}: ${getLevelName(level as ConsciousnessLevel)}`);
    console.log(`${'█'.repeat(80)}\n`);

    console.log('Response:');
    console.log(response.message);
    console.log('\n' + '-'.repeat(80));

    console.log('\nMetrics:');
    console.log(`  Cringe Score: ${response.cringeScore.toFixed(2)} / 1.0`);
    console.log(`  Passed Filter: ${response.passedCringeFilter ? '✅ Yes' : '❌ No'}`);
    console.log(`  Generation Time: ${response.metadata.generationTime}ms`);
    console.log(`  Model: ${response.metadata.modelUsed}`);

    console.log('\nElemental Signature:');
    console.log(`  🔥 Fire: ${response.elementalSignature.fire}/10`);
    console.log(`  💧 Water: ${response.elementalSignature.water}/10`);
    console.log(`  🌍 Earth: ${response.elementalSignature.earth}/10`);
    console.log(`  🌬️ Air: ${response.elementalSignature.air}/10`);
    console.log(`  ✨ Aether: ${response.elementalSignature.aether}/10`);

    console.log('\n');
  }

  console.log('='.repeat(80));
  console.log('✅ Test complete!');
}

function getLevelName(level: ConsciousnessLevel): string {
  const names = {
    1: 'Asleep/Unconscious (Beginner)',
    2: 'Awakening/Curious (Explorer)',
    3: 'Practicing/Developing (Student)',
    4: 'Integrated/Fluent (Practitioner)',
    5: 'Teaching/Transmuting (Elder)'
  };
  return names[level];
}

// Run test
testAllLevels().catch(console.error);
