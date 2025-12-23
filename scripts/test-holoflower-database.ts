/**
 * HOLOFLOWER DATABASE TEST
 *
 * Tests database schema and basic CRUD operations
 * Bypasses server-only restrictions by accessing DB directly
 */

import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://soullab@localhost:5432/maia_consciousness'
});

const TEST_USER_ID = 'test-user-holoflower-' + Date.now();

async function testHoloflowerDatabase() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('HOLOFLOWER DATABASE TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // ================================================================
    // TEST 1: Insert journal entry
    // ================================================================
    console.log('📝 TEST 1: Insert journal entry');
    console.log('─────────────────────────────────────────────────────────────────\n');

    const journalResult = await pool.query(`
      INSERT INTO holoflower_journal_entries (
        user_id,
        intention,
        configuration_method,
        petal_intensities,
        spiral_stage,
        archetype,
        conversation_messages,
        tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      TEST_USER_ID,
      'Test intention',
      'conversational',
      JSON.stringify([{petal: 'Will', intensity: 0.7}]),
      JSON.stringify({code: 'W1', name: 'Spring', element: 'water'}),
      'Seeker',
      JSON.stringify([{role: 'user', content: 'Test message'}]),
      ['test']
    ]);

    console.log(`✅ Journal entry created: ${journalResult.rows[0].id}`);
    console.log(`   User: ${journalResult.rows[0].user_id}`);
    console.log(`   Archetype: ${journalResult.rows[0].archetype}\n`);

    // ================================================================
    // TEST 2: Insert soul pattern
    // ================================================================
    console.log('🎯 TEST 2: Insert soul pattern');
    console.log('─────────────────────────────────────────────────────────────────\n');

    const patternResult = await pool.query(`
      INSERT INTO soul_patterns (
        user_id,
        pattern_type,
        pattern_data,
        confidence_score,
        maia_interpretation
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      TEST_USER_ID,
      'dominant_element',
      JSON.stringify({element: 'water'}),
      0.85,
      'This soul resonates strongly with water element'
    ]);

    console.log(`✅ Soul pattern created: ${patternResult.rows[0].id}`);
    console.log(`   Pattern type: ${patternResult.rows[0].pattern_type}`);
    console.log(`   Confidence: ${patternResult.rows[0].confidence_score}\n`);

    // ================================================================
    // TEST 3: Insert relationship essence
    // ================================================================
    console.log('💫 TEST 3: Insert relationship essence');
    console.log('─────────────────────────────────────────────────────────────────\n');

    const essenceResult = await pool.query(`
      INSERT INTO relationship_essences (
        soul_signature,
        user_id,
        user_name,
        presence_quality,
        archetypal_resonances,
        spiral_position,
        relationship_field,
        first_encounter,
        last_encounter,
        encounter_count,
        morphic_resonance
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      `soul_${TEST_USER_ID}`,
      TEST_USER_ID,
      'Test User',
      'Open curiosity',
      JSON.stringify(['therapist']),
      JSON.stringify({stage: 'W1', dynamics: 'Exploring', emergingAwareness: ['Insight 1']}),
      JSON.stringify({coCreatedInsights: [], breakthroughs: [], quality: 'Present', depth: 0.7}),
      new Date().toISOString(),
      new Date().toISOString(),
      1,
      0.1
    ]);

    console.log(`✅ Relationship essence created: ${essenceResult.rows[0].id}`);
    console.log(`   Soul signature: ${essenceResult.rows[0].soul_signature}`);
    console.log(`   Encounters: ${essenceResult.rows[0].encounter_count}`);
    console.log(`   Morphic resonance: ${essenceResult.rows[0].morphic_resonance}\n`);

    // ================================================================
    // TEST 4: Query all data
    // ================================================================
    console.log('📊 TEST 4: Query verification');
    console.log('─────────────────────────────────────────────────────────────────\n');

    const journalCount = await pool.query(
      'SELECT COUNT(*) FROM holoflower_journal_entries WHERE user_id = $1',
      [TEST_USER_ID]
    );
    console.log(`✅ Journal entries: ${journalCount.rows[0].count}`);

    const patternCount = await pool.query(
      'SELECT COUNT(*) FROM soul_patterns WHERE user_id = $1',
      [TEST_USER_ID]
    );
    console.log(`✅ Soul patterns: ${patternCount.rows[0].count}`);

    const essenceCount = await pool.query(
      'SELECT COUNT(*) FROM relationship_essences WHERE user_id = $1',
      [TEST_USER_ID]
    );
    console.log(`✅ Relationship essences: ${essenceCount.rows[0].count}\n`);

    // ================================================================
    // TEST 5: JSONB parsing
    // ================================================================
    console.log('🔍 TEST 5: JSONB field parsing');
    console.log('─────────────────────────────────────────────────────────────────\n');

    const journalEntry = await pool.query(
      'SELECT * FROM holoflower_journal_entries WHERE user_id = $1',
      [TEST_USER_ID]
    );

    const petalData = journalEntry.rows[0].petal_intensities;
    console.log(`✅ Petal intensities type: ${typeof petalData}`);
    console.log(`   Is array: ${Array.isArray(petalData)}`);
    if (Array.isArray(petalData)) {
      console.log(`   First petal: ${petalData[0].petal} = ${petalData[0].intensity}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await pool.query('DELETE FROM holoflower_journal_entries WHERE user_id = $1', [TEST_USER_ID]);
    await pool.query('DELETE FROM soul_patterns WHERE user_id = $1', [TEST_USER_ID]);
    await pool.query('DELETE FROM relationship_essences WHERE user_id = $1', [TEST_USER_ID]);
    console.log('✅ Cleanup complete\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('\nError details:', error);

    // Cleanup on error
    try {
      await pool.query('DELETE FROM holoflower_journal_entries WHERE user_id = $1', [TEST_USER_ID]);
      await pool.query('DELETE FROM soul_patterns WHERE user_id = $1', [TEST_USER_ID]);
      await pool.query('DELETE FROM relationship_essences WHERE user_id = $1', [TEST_USER_ID]);
    } catch (cleanupError) {
      console.error('⚠️  Cleanup failed:', cleanupError);
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run test
testHoloflowerDatabase();
