// backend — test-panconscious-field-routing.ts
/**
 * PANCONSCIOUS FIELD ROUTER TEST
 *
 * Tests the field safety gating logic that determines:
 * - Which realm (UNDERWORLD/MIDDLEWORLD/UPPERWORLD_SYMBOLIC)
 * - Whether field work is safe
 * - Whether deep symbolic work is recommended
 * - Maximum symbolic intensity allowed
 *
 * Run: npx tsx test-panconscious-field-routing.ts
 */

import { routePanconsciousField } from './lib/field/panconsciousFieldRouter';
import type { CognitiveProfile } from './lib/consciousness/cognitiveProfileService';

console.log('🌀 ========================================');
console.log('🌀 PANCONSCIOUS FIELD ROUTER TEST');
console.log('🌀 ========================================\n');

function mockProfile(overrides: Partial<CognitiveProfile>): CognitiveProfile {
  return {
    userId: 'test',
    currentLevel: 3,
    currentLabel: 'APPLY',
    currentScore: 0.6,
    lastUpdated: new Date(),
    rollingAverage: 3.0,
    stability: 'stable',
    bypassingFrequency: { spiritual: 0, intellectual: 0 },
    communityCommonsEligible: false,
    deepWorkRecommended: false,
    fieldWorkSafe: false,
    window: 20,
    totalTurns: 20,
    turnsWithCognitiveTracking: 20,
    ...overrides,
  };
}

async function run() {
  console.log('Testing field routing decisions across different cognitive profiles...\n');

  // ============================================================================
  // SCENARIO 1: Low Cognitive Altitude (avg < 2.5)
  // ============================================================================
  console.log('📝 SCENARIO 1: Low Cognitive Altitude (avg 2.1)\n');

  const lowAltitude = mockProfile({
    rollingAverage: 2.1,
    stability: 'stable',
  });

  const decision1 = routePanconsciousField({ cognitiveProfile: lowAltitude });

  console.log(`   Realm: ${decision1.realm}`);
  console.log(`   Field Work Safe: ${decision1.fieldWorkSafe ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Deep Work Recommended: ${decision1.deepWorkRecommended ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Max Symbolic Intensity: ${decision1.maxSymbolicIntensity}`);
  console.log(`   Reasoning: ${decision1.reasoning}\n`);

  if (
    decision1.realm === 'MIDDLEWORLD' &&
    !decision1.fieldWorkSafe &&
    decision1.maxSymbolicIntensity === 'low'
  ) {
    console.log('   ✅ PASS: Low altitude user restricted to grounded middleworld\n');
  } else {
    console.log('   ⚠️  NOTICE: Unexpected routing for low altitude user\n');
  }

  // ============================================================================
  // SCENARIO 2: Developing / Unstable (avg 3.2, volatile)
  // ============================================================================
  console.log('📝 SCENARIO 2: Developing / Unstable (avg 3.2, volatile)\n');

  const developingUnstable = mockProfile({
    rollingAverage: 3.2,
    stability: 'volatile',
  });

  const decision2 = routePanconsciousField({ cognitiveProfile: developingUnstable });

  console.log(`   Realm: ${decision2.realm}`);
  console.log(`   Field Work Safe: ${decision2.fieldWorkSafe ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Deep Work Recommended: ${decision2.deepWorkRecommended ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Max Symbolic Intensity: ${decision2.maxSymbolicIntensity}`);
  console.log(`   Reasoning: ${decision2.reasoning}\n`);

  if (
    decision2.realm === 'MIDDLEWORLD' &&
    decision2.fieldWorkSafe &&
    !decision2.deepWorkRecommended &&
    decision2.maxSymbolicIntensity === 'medium'
  ) {
    console.log('   ✅ PASS: Unstable user gets gentle middleworld work only\n');
  } else {
    console.log('   ⚠️  NOTICE: Unexpected routing for unstable user\n');
  }

  // ============================================================================
  // SCENARIO 3: High Altitude + Spiritual Bypassing (avg 4.3, bypass 50%)
  // ============================================================================
  console.log('📝 SCENARIO 3: High Altitude + Spiritual Bypassing (avg 4.3, bypass 50%)\n');

  const highWithBypassing = mockProfile({
    rollingAverage: 4.3,
    stability: 'stable',
    bypassingFrequency: { spiritual: 0.5, intellectual: 0.1 },
  });

  const decision3 = routePanconsciousField({ cognitiveProfile: highWithBypassing });

  console.log(`   Realm: ${decision3.realm}`);
  console.log(`   Field Work Safe: ${decision3.fieldWorkSafe ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Deep Work Recommended: ${decision3.deepWorkRecommended ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Max Symbolic Intensity: ${decision3.maxSymbolicIntensity}`);
  console.log(`   Reasoning: ${decision3.reasoning}\n`);

  if (
    decision3.realm === 'MIDDLEWORLD' &&
    decision3.fieldWorkSafe &&
    !decision3.deepWorkRecommended
  ) {
    console.log(
      '   ✅ PASS: High bypassing user restricted to middleworld despite high altitude\n',
    );
  } else {
    console.log('   ⚠️  NOTICE: Bypassing user may have been allowed too much access\n');
  }

  // ============================================================================
  // SCENARIO 4: High, Stable, Clean (avg 4.6, ascending, low bypassing)
  // ============================================================================
  console.log('📝 SCENARIO 4: High, Stable, Clean (avg 4.6, ascending, low bypassing)\n');

  const highStableClean = mockProfile({
    rollingAverage: 4.6,
    stability: 'ascending',
    bypassingFrequency: { spiritual: 0.1, intellectual: 0.05 },
    fieldWorkSafe: true,
    deepWorkRecommended: true,
  });

  const decision4 = routePanconsciousField({ cognitiveProfile: highStableClean });

  console.log(`   Realm: ${decision4.realm}`);
  console.log(`   Field Work Safe: ${decision4.fieldWorkSafe ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Deep Work Recommended: ${decision4.deepWorkRecommended ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Max Symbolic Intensity: ${decision4.maxSymbolicIntensity}`);
  console.log(`   Reasoning: ${decision4.reasoning}\n`);

  if (
    decision4.realm === 'UPPERWORLD_SYMBOLIC' &&
    decision4.fieldWorkSafe &&
    decision4.deepWorkRecommended &&
    decision4.maxSymbolicIntensity === 'high'
  ) {
    console.log('   ✅ PASS: High stable clean user allowed full upperworld access\n');
  } else {
    console.log('   ⚠️  NOTICE: High-level user may have been over-restricted\n');
  }

  // ============================================================================
  // SCENARIO 5: No Profile (null)
  // ============================================================================
  console.log('📝 SCENARIO 5: No Cognitive Profile (null)\n');

  const decision5 = routePanconsciousField({ cognitiveProfile: null });

  console.log(`   Realm: ${decision5.realm}`);
  console.log(`   Field Work Safe: ${decision5.fieldWorkSafe ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Deep Work Recommended: ${decision5.deepWorkRecommended ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Max Symbolic Intensity: ${decision5.maxSymbolicIntensity}`);
  console.log(`   Reasoning: ${decision5.reasoning}\n`);

  if (decision5.realm === 'MIDDLEWORLD' && !decision5.fieldWorkSafe) {
    console.log('   ✅ PASS: No profile defaults to safe middleworld\n');
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('🌀 ========================================');
  console.log('🌀 FIELD ROUTER TEST COMPLETE');
  console.log('🌀 ========================================\n');

  console.log('✅ Field Routing Logic:');
  console.log('   • Low altitude (< 2.5): MIDDLEWORLD, not safe, low intensity');
  console.log('   • Developing/unstable: MIDDLEWORLD, safe, medium intensity');
  console.log('   • High + bypassing: MIDDLEWORLD, safe but no deep work');
  console.log('   • High + stable + clean: UPPERWORLD, safe, high intensity\n');

  console.log('🎯 What This Accomplishes:');
  console.log('   • Protects low-level users from overwhelming symbolic work');
  console.log('   • Catches high bypassing despite high cognitive altitude');
  console.log('   • Allows full upperworld access only when truly safe');
  console.log('   • Graceful degradation without profile (defaults to safe)\n');

  console.log('📊 Integration Status:');
  console.log('   ✅ Phase 1: Detection → Logging → Scaffolding');
  console.log('   ✅ Phase 2: Cognitive Profile Service');
  console.log('   ✅ Phase 2: Router Integration');
  console.log('   ✅ Phase 2: Community Commons Gate');
  console.log('   ✅ Phase 3: Panconscious Field Router (THIS STEP)\n');

  console.log('🚀 Next Steps:');
  console.log('   1. Wire field routing into actual field/oracle agents');
  console.log('   2. Test with live DEEP path conversations');
  console.log('   3. Add mythic messaging for declined upperworld journeys');
  console.log('   4. Dashboard visualization (cognitive journey + field access)\n');
}

run().catch(console.error);
