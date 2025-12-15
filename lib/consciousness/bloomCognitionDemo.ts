/**
 * BLOOM'S TAXONOMY COGNITIVE DETECTION - DEMO
 *
 * Run this to see how cognitive level detection works in real-time
 * Usage: npx tsx lib/consciousness/bloomCognitionDemo.ts
 */

import { awarenessLevelDetector } from '../sovereign/awarenessLevelDetection';

// Test inputs at different cognitive levels
const testInputs = [
  {
    level: 'REMEMBER (Level 1)',
    input: "I read that shadow work is really important. Ram Dass says we need to integrate our unconscious. According to Jung, the shadow contains all the parts of ourselves we reject."
  },
  {
    level: 'UNDERSTAND (Level 2)',
    input: "Shadow work means looking at the parts of myself I usually ignore or deny. It's basically about integrating my unconscious patterns so I can become more whole."
  },
  {
    level: 'APPLY (Level 3)',
    input: "I've been practicing shadow work by journaling every time I get triggered. Yesterday when my partner criticized me, I noticed myself getting defensive and I wrote about it instead of reacting."
  },
  {
    level: 'ANALYZE (Level 4)',
    input: "I'm noticing a pattern: whenever someone in authority criticizes me, I get defensive. But when friends give feedback, I'm open. It's not about the criticism itself - it's about who's delivering it. There's something underneath about power dynamics."
  },
  {
    level: 'EVALUATE (Level 5)',
    input: "I'm realizing that being right matters less to me than staying connected to my son. I used to think I needed to correct him when he was wrong, but now I see that our relationship is more important than me being the authority."
  },
  {
    level: 'CREATE (Level 6)',
    input: "I created a practice I call 'Tuesday Tea Ceremony' where I sit with difficult emotions for 20 minutes with tea. I've been sharing this with my men's group and they're finding it helpful too. It combines mindfulness with ritual."
  }
];

console.log('\n🧠 BLOOM\'S TAXONOMY COGNITIVE DETECTION DEMO\n');
console.log('=' .repeat(80));

for (const test of testInputs) {
  console.log(`\n📝 Expected: ${test.level}`);
  console.log(`Input: "${test.input.substring(0, 100)}..."\n`);

  // Run full awareness + cognitive detection
  const profile = awarenessLevelDetector.detectAwarenessLevel(test.input);

  if (profile.cognitiveLevel) {
    const { level, numericLevel, score, rationale, scaffoldingPrompt } = profile.cognitiveLevel;

    console.log(`✅ Detected: ${level} (Level ${numericLevel})`);
    console.log(`   Confidence: ${(score * 100).toFixed(0)}%`);
    console.log(`   Rationale: ${rationale.slice(0, 2).join('; ')}`);
    console.log(`   📈 Scaffolding: "${scaffoldingPrompt}"`);
  } else {
    console.log('❌ No cognitive level detected');
  }

  console.log('\n' + '-'.repeat(80));
}

// Demo: Detecting spiritual bypassing (high awareness, low cognition)
console.log('\n\n🚨 BYPASSING DETECTION DEMO\n');
console.log('=' .repeat(80));

const bypassInput = "I've been studying non-dual awareness for 10 years. Ramana Maharshi says the self is pure consciousness. My relationship problems aren't real - they're just ego identification.";

console.log(`Input: "${bypassInput}"\n`);

const bypassProfile = awarenessLevelDetector.detectAwarenessLevel(bypassInput);

console.log(`Awareness Dimensions:`);
console.log(`  - Transpersonal: ${bypassProfile.intelligenceDimensions.transpersonal}`);
console.log(`  - Analytical: ${bypassProfile.intelligenceDimensions.analytical}`);
console.log(`  - Emotional: ${bypassProfile.intelligenceDimensions.emotional}`);

if (bypassProfile.cognitiveLevel) {
  console.log(`\nCognitive Level: ${bypassProfile.cognitiveLevel.level} (${bypassProfile.cognitiveLevel.numericLevel}/6)`);

  // Check for bypassing: high transpersonal awareness but low cognitive engagement
  const transpersonal = bypassProfile.intelligenceDimensions.transpersonal;
  const cognitiveNum = bypassProfile.cognitiveLevel.numericLevel;

  if (transpersonal > 60 && cognitiveNum <= 2) {
    console.log(`\n⚠️  SPIRITUAL BYPASSING DETECTED:`);
    console.log(`   - High transpersonal awareness (${transpersonal})`);
    console.log(`   - Low cognitive engagement (Level ${cognitiveNum})`);
    console.log(`   - Using spiritual concepts to avoid thinking deeply about relationships`);
    console.log(`\n   💡 MAIA should scaffold: "Are you using these teachings to avoid analyzing your relationship pattern?"`);
  }
}

console.log('\n\n✨ Demo complete! Integration is working.\n');
