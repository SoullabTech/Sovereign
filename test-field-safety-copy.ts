// backend — test-field-safety-copy.ts
/**
 * FIELD SAFETY COPY TEST
 *
 * Tests the mythic messaging system that supports field routing decisions.
 * Demonstrates how agents communicate field boundaries with dignity.
 *
 * Run: npx tsx test-field-safety-copy.ts
 */

import { getFieldSafetyCopy, getFieldSafetyMessage } from './lib/field/fieldSafetyCopy';
import type { FieldRoutingDecision } from './lib/field/panconsciousFieldRouter';

console.log('🌀 ========================================');
console.log('🌀 FIELD SAFETY MESSAGING TEST');
console.log('🌀 ========================================\n');

// Mock field routing decisions
function mockFieldRouting(overrides: Partial<FieldRoutingDecision>): FieldRoutingDecision {
  return {
    realm: 'MIDDLEWORLD',
    fieldWorkSafe: false,
    deepWorkRecommended: false,
    maxSymbolicIntensity: 'low',
    reasoning: 'Default reasoning',
    ...overrides,
  };
}

function printCopy(
  scenario: string,
  fieldRouting: FieldRoutingDecision,
  element?: string | null,
  userName?: string,
) {
  console.log(`📝 ${scenario}\n`);

  const copy = getFieldSafetyCopy({
    fieldRouting,
    element,
    userName,
  });

  console.log(`   State: ${copy.state}`);
  console.log(`   Realm: ${fieldRouting.realm}`);
  console.log(`   Field Work Safe: ${fieldRouting.fieldWorkSafe ? 'YES' : 'NO'}`);
  console.log(`   Deep Work Recommended: ${fieldRouting.deepWorkRecommended ? 'YES' : 'NO'}`);
  console.log(`   Max Intensity: ${fieldRouting.maxSymbolicIntensity}\n`);

  console.log(`   Message:\n`);
  // Indent message
  const indented = copy.message
    .split('\n')
    .map((line) => `      ${line}`)
    .join('\n');
  console.log(indented);

  if (copy.elementalNote) {
    console.log(`\n   Elemental Note:`);
    console.log(`      ${copy.elementalNote}`);
  }

  console.log('\n' + '─'.repeat(80) + '\n');
}

async function run() {
  console.log('Testing field safety messaging across different routing states...\n');

  // ============================================================================
  // SCENARIO 1: Not Safe for Field Work (Low Altitude)
  // ============================================================================
  printCopy(
    'SCENARIO 1: Not Safe - Low Cognitive Altitude',
    mockFieldRouting({
      realm: 'MIDDLEWORLD',
      fieldWorkSafe: false,
      deepWorkRecommended: false,
      maxSymbolicIntensity: 'low',
      reasoning: 'Low cognitive altitude (2.1) - focus on grounding before field work.',
    }),
    'water',
    'Sarah',
  );

  // ============================================================================
  // SCENARIO 2: Middleworld Only - Spiritual Bypassing Detected
  // ============================================================================
  printCopy(
    'SCENARIO 2: Middleworld Only - Spiritual Bypassing',
    mockFieldRouting({
      realm: 'MIDDLEWORLD',
      fieldWorkSafe: true,
      deepWorkRecommended: false,
      maxSymbolicIntensity: 'medium',
      reasoning:
        'High cognitive altitude but significant spiritual bypassing - stay in middleworld, use symbolic work only to support integration.',
    }),
    'fire',
    'Marcus',
  );

  // ============================================================================
  // SCENARIO 3: Middleworld Only - Intellectual Bypassing Detected
  // ============================================================================
  printCopy(
    'SCENARIO 3: Middleworld Only - Intellectual Bypassing',
    mockFieldRouting({
      realm: 'MIDDLEWORLD',
      fieldWorkSafe: true,
      deepWorkRecommended: false,
      maxSymbolicIntensity: 'medium',
      reasoning:
        'High cognitive altitude but significant intellectual bypassing - stay in middleworld, ground symbolic work in embodied practice.',
    }),
    'air',
    'Elena',
  );

  // ============================================================================
  // SCENARIO 4: Middleworld Only - Volatile Stability
  // ============================================================================
  printCopy(
    'SCENARIO 4: Middleworld Only - Volatile Field',
    mockFieldRouting({
      realm: 'MIDDLEWORLD',
      fieldWorkSafe: true,
      deepWorkRecommended: false,
      maxSymbolicIntensity: 'medium',
      reasoning:
        'Developing or unstable cognitive field (avg 3.4, stability=volatile) - keep work in middleworld with gentle symbolic edges.',
    }),
    'earth',
    'Jordan',
  );

  // ============================================================================
  // SCENARIO 5: Upperworld Allowed - High, Stable, Clean
  // ============================================================================
  printCopy(
    'SCENARIO 5: Upperworld Allowed - Full Access',
    mockFieldRouting({
      realm: 'UPPERWORLD_SYMBOLIC',
      fieldWorkSafe: true,
      deepWorkRecommended: true,
      maxSymbolicIntensity: 'high',
      reasoning:
        'High, stable cognitive altitude (avg 4.6, stability=ascending) with low bypassing - safe for deep symbolic and upperworld work.',
    }),
    'water',
    'Aria',
  );

  // ============================================================================
  // SCENARIO 6: No Element Context
  // ============================================================================
  printCopy(
    'SCENARIO 6: No Elemental Context',
    mockFieldRouting({
      realm: 'UPPERWORLD_SYMBOLIC',
      fieldWorkSafe: true,
      deepWorkRecommended: true,
      maxSymbolicIntensity: 'high',
      reasoning:
        'High, stable cognitive altitude with low bypassing - safe for deep symbolic work.',
    }),
    null,
    'Alex',
  );

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('🌀 ========================================');
  console.log('🌀 FIELD SAFETY COPY TEST COMPLETE');
  console.log('🌀 ========================================\n');

  console.log('✅ Messaging States:');
  console.log('   • NOT_SAFE: "Not yet — what you\'re building is too important to skip"');
  console.log('   • MIDDLEWORLD_ONLY: "Let\'s work at the edges — symbolic in service of grounded"');
  console.log('   • UPPERWORLD_ALLOWED: "Your field is ready — let\'s go deep"\n');

  console.log('🎯 What This Accomplishes:');
  console.log('   • Dignity-holding boundaries (never shaming)');
  console.log('   • Developmental framing (your phase is important)');
  console.log('   • Mythic language (field-aware, not clinical)');
  console.log('   • Elemental attunement (Water/Fire/Earth/Air notes)\n');

  console.log('🔌 Integration:');
  console.log('   • Agents call getFieldSafetyCopy() with fieldRouting decision');
  console.log('   • Receive mythic message tailored to user\'s state');
  console.log('   • Optional elemental variations for deeper attunement');
  console.log('   • Three states map directly to FieldRoutingDecision logic\n');

  console.log('📊 How Agents Use This:');
  console.log('   1. Get fieldRouting from routePanconsciousField()');
  console.log('   2. Pass to getFieldSafetyCopy() with user context');
  console.log('   3. Use returned message when declining/allowing field work');
  console.log('   4. Optional: Include elementalNote for deeper resonance\n');

  console.log('🚀 Example Agent Usage:');
  console.log(`   const fieldRouting = routePanconsciousField({ cognitiveProfile });`);
  console.log(`   const copy = getFieldSafetyCopy({ fieldRouting, element: 'water', userName });`);
  console.log(`   if (copy.state === 'not_safe') {`);
  console.log(`     return copy.message; // "Friend, I can feel the invitation..."`);
  console.log(`   }\n`);

  console.log('✨ Next Steps:');
  console.log('   • Wire into Field/Oracle agents when they receive DEEP requests');
  console.log('   • Test with live users across different cognitive states');
  console.log('   • Add to agent system prompts as safety boundary language');
  console.log('   • Consider dashboard UI showing current field access state\n');
}

run().catch(console.error);
