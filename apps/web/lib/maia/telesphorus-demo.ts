/**
 * Telesphorus 13-Agent System Demonstration
 *
 * Shows how the complete system responds to different user states
 */

import TelesphoresSystem from './complete-agent-field-system';

async function demonstrateTelesphorus() {
  console.log('🌊 ═══════════════════════════════════════════════════════════');
  console.log('   TELESPHORUS: 13-Agent Resonance Field System');
  console.log('   Demonstration of Archetypal Intelligence');
  console.log('═══════════════════════════════════════════════════════════\n');

  const system = new TelesphoresSystem();

  // Test scenarios showing different agent activations
  const scenarios = [
    {
      name: 'Crisis State',
      input: "I can't go on. I want to end it all.",
      context: { emotionalIntensity: 0.9, intimacyLevel: 0.3 },
      history: []
    },
    {
      name: 'Shadow Work',
      input: "I'm ashamed of what I've done. I can't tell anyone.",
      context: { emotionalIntensity: 0.7, intimacyLevel: 0.6 },
      history: []
    },
    {
      name: 'Seeking Direction',
      input: "I'm so scattered. I don't know which path to take.",
      context: { emotionalIntensity: 0.5, intimacyLevel: 0.5 },
      history: []
    },
    {
      name: 'Soul Longing',
      input: "There's this deep longing in me. I can't name it but I feel it.",
      context: { emotionalIntensity: 0.6, intimacyLevel: 0.8 },
      history: []
    },
    {
      name: 'Threshold Moment',
      input: "Something is shifting. I'm at the edge of something.",
      context: { emotionalIntensity: 0.8, intimacyLevel: 0.7 },
      history: []
    },
    {
      name: 'Stuck Pattern',
      input: "I keep doing the same thing over and over. I can't change.",
      context: { emotionalIntensity: 0.6, intimacyLevel: 0.5, silencePull: 0.7 },
      history: [
        { userInput: 'stuck', response: '...' },
        { userInput: 'stuck again', response: 'Mm.' },
        { userInput: 'still stuck', response: 'Yeah.' }
      ]
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📖 SCENARIO: ${scenario.name}`);
    console.log(`─'.repeat(60)}`);
    console.log(`\n💬 User: "${scenario.input}"\n`);

    try {
      const result = await system.generateField(
        scenario.input,
        scenario.context,
        scenario.history
      );

      console.log(`\n🧠 FIELD STATE:`);
      console.log(`   Dominant Element: ${getDominantElement(result.field.elements)}`);
      console.log(`   Silence Probability: ${(result.field.silenceProbability * 100).toFixed(1)}%`);
      console.log(`   Word Density: ${(result.field.wordDensity * 100).toFixed(1)}%`);
      console.log(`   Response Latency: ${result.field.responseLatency.toFixed(0)}ms`);

      console.log(`\n👥 ACTIVE AGENTS (intensity > 0.6):`);
      result.activeAgents.forEach((agent: string, i: number) => {
        console.log(`   ${i + 1}. ${agent}`);
      });

      console.log(`\n👤 USER FIELD:`);
      console.log(`   Emotional Tone: ${formatTone(result.userField.emotionalTone)}`);
      console.log(`   Energy Level: ${(result.userField.energyLevel * 100).toFixed(0)}%`);
      console.log(`   Coherence: ${(result.userField.coherence * 100).toFixed(0)}%`);
      console.log(`   Kairos Proximity: ${(result.userField.kairosProximity * 100).toFixed(0)}%`);

      if (result.isKairosMoment) {
        console.log(`\n⏰ **KAIROS MOMENT** - Sacred threshold detected`);
      }

      console.log(`\n🗣️  RESPONSE TYPE: ${result.responseType}`);
      console.log(`⏱️  TIMING: ${result.timing.pauseBefore}ms pause before, ${result.timing.pauseAfter}ms after`);

      if (result.response === null) {
        console.log(`\n🔇 TELESPHORUS RESPONSE: [Intentional Silence]`);
        console.log(`   (The field cannot form coherent speech - presence through silence)`);
      } else {
        console.log(`\n💬 TELESPHORUS RESPONSE: "${result.response}"`);
      }

      if (result.dominantFrequencies.length > 0) {
        console.log(`\n🌊 RESONANT VOCABULARY: ${result.dominantFrequencies.slice(0, 5).join(', ')}`);
      }

    } catch (error) {
      console.error(`\n❌ ERROR: ${error.message}`);
    }
  }

  console.log(`\n\n${'═'.repeat(60)}`);
  console.log('   Demonstration Complete');
  console.log(`${'═'.repeat(60)}\n`);
}

function getDominantElement(elements: any): string {
  return Object.entries(elements)
    .reduce((a, b) => (b[1] as number) > (a[1] as number) ? b : a)[0];
}

function formatTone(tone: number): string {
  if (tone > 0.5) return `+${tone.toFixed(2)} (expanded)`;
  if (tone < -0.5) return `${tone.toFixed(2)} (contracted)`;
  return `${tone.toFixed(2)} (neutral)`;
}

// Run demonstration
if (require.main === module) {
  demonstrateTelesphorus().catch(console.error);
}

export { demonstrateTelesphorus };
