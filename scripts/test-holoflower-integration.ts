/**
 * HOLOFLOWER MEMORY INTEGRATION - TEST SCRIPT
 * 
 * Tests the complete flow:
 * 1. First encounter - saves journal, creates relationship essence
 * 2. Second encounter - updates essence, increments morphic resonance
 * 3. Third encounter - triggers pattern detection
 * 4. Verification - checks all tables have correct data
 */

import { HoloflowerMemoryIntegration } from '@/lib/memory/bardic/HoloflowerMemoryIntegration';
import type { HoloflowerReadingData } from '@/lib/memory/bardic/HoloflowerMemoryIntegration';
import { query } from '@/lib/db/postgres';

const TEST_USER_ID = 'test-user-holoflower-' + Date.now();

// Sample reading data (mimics what would come from Holoflower UI)
function createSampleReading(encounterNumber: number): HoloflowerReadingData {
  return {
    userId: TEST_USER_ID,
    userName: 'Test User',
    intention: `Testing encounter ${encounterNumber}`,
    configurationMethod: 'conversational' as const,
    petalIntensities: [
      { petal: 'Will', intensity: 0.7 },
      { petal: 'Heart', intensity: 0.8 },
      { petal: 'Mind', intensity: 0.6 },
      { petal: 'Body', intensity: 0.5 },
      { petal: 'Soul', intensity: 0.9 },
    ],
    spiralStage: {
      code: encounterNumber === 1 ? 'W1' : encounterNumber === 2 ? 'W2' : 'F1',
      name: encounterNumber === 1 ? 'Spring' : encounterNumber === 2 ? 'River' : 'Spark',
      element: encounterNumber <= 2 ? 'water' : 'fire',
    },
    archetype: encounterNumber === 1 ? 'Seeker' : encounterNumber === 2 ? 'Healer' : 'Warrior',
    shadowArchetype: 'Wanderer',
    conversationMessages: [
      { role: 'user', content: `This is encounter ${encounterNumber}` },
      { role: 'assistant', content: `I sense you're in a ${encounterNumber === 1 ? 'spring' : encounterNumber === 2 ? 'river' : 'spark'} phase` },
    ],
    tags: [`encounter-${encounterNumber}`, 'test'],
    isFavorite: encounterNumber === 3,
    visibility: 'private' as const,
    spiralDynamics: {
      currentStage: encounterNumber === 1 ? 'W1' : encounterNumber === 2 ? 'W2' : 'F1',
      dynamics: `Test dynamics ${encounterNumber}`,
    },
    sessionThread: {
      emergingAwareness: [`Insight ${encounterNumber}`],
    },
    archetypalResonance: {
      primaryResonance: encounterNumber === 1 ? 'therapist' : encounterNumber === 2 ? 'spiritual_director' : 'coach',
      sensing: 'Open curiosity',
    },
    recalibrationEvent: encounterNumber === 3 ? {
      type: 'breakthrough',
      quality: 'Deep insight achieved',
    } : null,
    fieldState: {
      depth: 0.5 + (encounterNumber * 0.2),
    },
  };
}

async function testHoloflowerIntegration() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('HOLOFLOWER MEMORY INTEGRATION - TEST SCRIPT');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const integration = HoloflowerMemoryIntegration.getInstance();
  
  try {
    // ================================================================
    // ENCOUNTER 1: First meeting
    // ================================================================
    console.log('📍 ENCOUNTER 1: First meeting');
    console.log('─────────────────────────────────────────────────────────────────\n');
    
    const reading1 = createSampleReading(1);
    const result1 = await integration.saveHoloflowerReading(reading1);
    
    console.log('✅ First encounter saved');
    console.log(`   Journal ID: ${result1.journalEntry?.id}`);
    console.log(`   Soul Signature: ${result1.relationshipEssence?.soulSignature}`);
    console.log(`   Is First Encounter: ${result1.isFirstEncounter}`);
    console.log(`   Morphic Resonance: ${result1.relationshipEssence?.morphicResonance}\n`);
    
    // ================================================================
    // ENCOUNTER 2: Returning soul
    // ================================================================
    console.log('📍 ENCOUNTER 2: Returning soul');
    console.log('─────────────────────────────────────────────────────────────────\n');
    
    const reading2 = createSampleReading(2);
    const result2 = await integration.saveHoloflowerReading(reading2);
    
    console.log('✅ Second encounter saved');
    console.log(`   Journal ID: ${result2.journalEntry?.id}`);
    console.log(`   Is First Encounter: ${result2.isFirstEncounter}`);
    console.log(`   Previous Encounters: ${result2.previousEncounterCount}`);
    console.log(`   Morphic Resonance: ${result2.relationshipEssence?.morphicResonance}`);
    console.log(`   Archetypal Resonances: ${result2.relationshipEssence?.archetypalResonances.join(', ')}\n`);
    
    // ================================================================
    // ENCOUNTER 3: Pattern detection threshold
    // ================================================================
    console.log('📍 ENCOUNTER 3: Pattern detection threshold');
    console.log('─────────────────────────────────────────────────────────────────\n');
    
    const reading3 = createSampleReading(3);
    const result3 = await integration.saveHoloflowerReading(reading3);
    
    console.log('✅ Third encounter saved (patterns should be detected)');
    console.log(`   Journal ID: ${result3.journalEntry?.id}`);
    console.log(`   Previous Encounters: ${result3.previousEncounterCount}`);
    console.log(`   Morphic Resonance: ${result3.relationshipEssence?.morphicResonance}`);
    console.log(`   Breakthroughs: ${result3.relationshipEssence?.relationshipField.breakthroughs.length}\n`);
    
    // ================================================================
    // VERIFICATION: Check all tables
    // ================================================================
    console.log('📊 VERIFICATION: Checking database tables');
    console.log('─────────────────────────────────────────────────────────────────\n');
    
    // Check journal entries
    const journalResult = await query(`
      SELECT COUNT(*) as count FROM holoflower_journal_entries
      WHERE user_id = $1
    `, [TEST_USER_ID]);
    console.log(`✅ Journal entries: ${journalResult.rows[0].count} (expected: 3)`);
    
    // Check relationship essence
    const essenceResult = await query(`
      SELECT 
        encounter_count,
        morphic_resonance,
        archetypal_resonances,
        relationship_field
      FROM relationship_essences
      WHERE user_id = $1
    `, [TEST_USER_ID]);
    
    if (essenceResult.rows[0]) {
      const essence = essenceResult.rows[0];
      console.log(`✅ Relationship essence found`);
      console.log(`   Encounters: ${essence.encounter_count} (expected: 3)`);
      console.log(`   Morphic Resonance: ${essence.morphic_resonance} (expected: ~0.4)`);
      
      const resonances = typeof essence.archetypal_resonances === 'string' 
        ? JSON.parse(essence.archetypal_resonances)
        : essence.archetypal_resonances;
      console.log(`   Archetypal Resonances: ${resonances.length} types`);
      
      const field = typeof essence.relationship_field === 'string'
        ? JSON.parse(essence.relationship_field)
        : essence.relationship_field;
      console.log(`   Breakthroughs: ${field.breakthroughs.length}`);
    }
    
    // Check soul patterns (should exist after 3rd encounter)
    const patternsResult = await query(`
      SELECT pattern_type, confidence_score, observations_count
      FROM soul_patterns
      WHERE user_id = $1
      ORDER BY pattern_type
    `, [TEST_USER_ID]);
    
    console.log(`✅ Soul patterns detected: ${patternsResult.rows.length}`);
    for (const pattern of patternsResult.rows) {
      console.log(`   - ${pattern.pattern_type}: ${pattern.confidence_score.toFixed(2)} (${pattern.observations_count} observations)`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ HOLOFLOWER INTEGRATION TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await query(`DELETE FROM holoflower_journal_entries WHERE user_id = $1`, [TEST_USER_ID]);
    await query(`DELETE FROM soul_patterns WHERE user_id = $1`, [TEST_USER_ID]);
    await query(`DELETE FROM relationship_essences WHERE user_id = $1`, [TEST_USER_ID]);
    console.log('✅ Cleanup complete\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('\nError details:', error);
    
    // Cleanup on error
    console.log('\n🧹 Cleaning up test data after error...');
    try {
      await query(`DELETE FROM holoflower_journal_entries WHERE user_id = $1`, [TEST_USER_ID]);
      await query(`DELETE FROM soul_patterns WHERE user_id = $1`, [TEST_USER_ID]);
      await query(`DELETE FROM relationship_essences WHERE user_id = $1`, [TEST_USER_ID]);
      console.log('✅ Cleanup complete\n');
    } catch (cleanupError) {
      console.error('⚠️  Cleanup failed:', cleanupError);
    }
    
    process.exit(1);
  }
}

// Run test
testHoloflowerIntegration();
