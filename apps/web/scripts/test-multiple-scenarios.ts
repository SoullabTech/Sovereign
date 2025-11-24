/**
 * MULTI-SCENARIO TEST
 *
 * Tests MAIA's adaptive responses across different input types:
 * 1. Emotional distress (Water-heavy)
 * 2. Mental confusion (Air-heavy)
 * 3. Practical problem (Earth-heavy)
 * 4. Creative inspiration (Fire-heavy)
 */

import { AdaptiveLanguageGenerator } from '../lib/consciousness/AdaptiveLanguageGenerator';
import { ConsciousnessLevel } from '../lib/consciousness/ConsciousnessLevelDetector';

const generator = new AdaptiveLanguageGenerator();

const scenarios = [
  {
    name: "Emotional Distress (Water)",
    input: "I feel so overwhelmed by everything that's happening in my life right now. I can't stop crying."
  },
  {
    name: "Mental Confusion (Air)",
    input: "I keep thinking in circles about this decision and can't figure out what the right choice is."
  },
  {
    name: "Practical Problem (Earth)",
    input: "I need to make real changes in my daily routine but I don't know where to start."
  },
  {
    name: "Creative Block (Fire)",
    input: "I have so many ideas but I can't seem to take action on any of them."
  }
];

const levelsToTest = [1, 3, 5] as ConsciousnessLevel[]; // Test beginner, student, elder

async function testScenarios() {
  console.log('🎯 MAIA MULTI-SCENARIO TEST\n');
  console.log('Testing different elemental signatures across consciousness levels\n');
  console.log('='.repeat(100) + '\n');

  for (const scenario of scenarios) {
    console.log(`\n${'█'.repeat(100)}`);
    console.log(`SCENARIO: ${scenario.name}`);
    console.log(`INPUT: "${scenario.input}"`);
    console.log(`${'█'.repeat(100)}\n`);

    for (const level of levelsToTest) {
      const response = await generator.generateResponse({
        input: scenario.input,
        userId: 'test-user',
        consciousnessLevel: level
      });

      const levelName = getLevelName(level);

      console.log(`\n${'▓'.repeat(100)}`);
      console.log(`LEVEL ${level}: ${levelName}`);
      console.log(`${'▓'.repeat(100)}`);

      console.log(`\n${response.message}\n`);

      console.log(`Elemental Signature: 🔥${response.elementalSignature.fire} 💧${response.elementalSignature.water} 🌍${response.elementalSignature.earth} 🌬️${response.elementalSignature.air} ✨${response.elementalSignature.aether}`);
      console.log(`Cringe Score: ${response.cringeScore.toFixed(2)} ${response.passedCringeFilter ? '✅' : '❌'}`);
      console.log(`Generation Time: ${response.metadata.generationTime}ms`);

      console.log('\n' + '-'.repeat(100));
    }

    console.log('\n');
  }

  console.log('\n' + '='.repeat(100));
  console.log('✅ Multi-scenario test complete!');
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
testScenarios().catch(console.error);
