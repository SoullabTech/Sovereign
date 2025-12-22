/**
 * TEST META-DIALOGUE INTEGRATION
 * Phase 4.7: Seed sample dialogue data for UI testing
 *
 * Purpose:
 * - Create a sample dialogue session
 * - Insert user queries and MAIA responses
 * - Verify database persistence
 * - Enable immediate UI testing at /talk
 *
 * Usage:
 *   npx tsx scripts/test-meta-dialogue.ts
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://soullab@localhost:5432/maia_consciousness',
});

// ============================================================================
// SAMPLE DIALOGUE DATA
// ============================================================================

const SAMPLE_SESSION = {
  sessionName: 'First Meta-Dialogue Test',
  initialQuery: 'MAIA, what changed since my last Fire cycle?',
};

const SAMPLE_EXCHANGES = [
  // Exchange 1: User query
  {
    exchangeType: 'user_query',
    speaker: 'user',
    content: 'MAIA, what changed since my last Fire cycle?',
    referencedFacets: null,
    referencedMetaLayer: null,
    synthesisMethod: null,
  },
  // Exchange 2: MAIA response
  {
    exchangeType: 'maia_response',
    speaker: 'maia',
    content: `I sense a significant shift in your consciousness field. New facets have activated: F1, F2, A2. Previous facets have quieted: W1, W2, A1. Your coherence has strengthened by 13%, indicating growing alignment between symbolic patterns and biosignals.

💫 **Æ1 (Intuition)**: A signal is emerging from the liminal space. Pay attention to subtle cues and synchronicities.`,
    referencedFacets: ['F1', 'F2', 'A2', 'W1', 'W2', 'A1'],
    referencedMetaLayer: 'Æ1',
    synthesisMethod: 'template',
  },
  // Exchange 3: Follow-up user query
  {
    exchangeType: 'user_query',
    speaker: 'user',
    content: 'Tell me more about that Æ1 signal. What does it mean?',
    referencedFacets: null,
    referencedMetaLayer: null,
    synthesisMethod: null,
  },
  // Exchange 4: MAIA elaboration
  {
    exchangeType: 'maia_response',
    speaker: 'maia',
    content: `Æ1 (Intuition/Signal) indicates you're in a liminal phase — a threshold state where new patterns are forming but haven't fully crystallized yet. The 42% similarity with your prior state suggests you've moved into unfamiliar territory.

This is often experienced as:
• Heightened sensitivity to synchronicities
• Subtle bodily sensations that carry meaning
• Dreams or imagery that feel significant
• A sense of "something is shifting" without knowing exactly what

Your HRV increased by 6.9ms, suggesting your nervous system is integrating this change parasympathetically — you're processing the signal through rest and restoration rather than activation.`,
    referencedFacets: ['Æ1'],
    referencedMetaLayer: 'Æ1',
    synthesisMethod: 'template',
  },
  // Exchange 5: User asking for guidance
  {
    exchangeType: 'user_query',
    speaker: 'user',
    content: 'What should I focus on during this liminal phase?',
    referencedFacets: null,
    referencedMetaLayer: null,
    synthesisMethod: null,
  },
  // Exchange 6: MAIA guidance
  {
    exchangeType: 'maia_response',
    speaker: 'maia',
    content: `During an Æ1 (Intuition/Signal) phase, consider practices that enhance receptivity rather than force outcomes:

**Recommended:**
• Meditation or contemplative practices (listening to the signal)
• Nature immersion (allowing symbolic resonance)
• Creative flow without attachment to results (letting emergence happen)
• Journaling dreams, body sensations, synchronicities

**Avoid:**
• Over-analyzing or forcing meaning too early
• Making major decisions from uncertainty
• Suppressing the "signal" with busyness

Your Fire facets (F1, F2) are now active, which means you have activation energy available. Channel it into *receptive action* — creating space for the signal to clarify rather than pushing toward a specific outcome.

The Æ1 phase typically resolves into either Æ2 (integration/union) or Æ3 (creative emergence) within 3-7 days if you maintain the receptive stance.`,
    referencedFacets: ['Æ1', 'F1', 'F2', 'Æ2', 'Æ3'],
    referencedMetaLayer: 'Æ1',
    synthesisMethod: 'template',
  },
];

// ============================================================================
// TEST SCRIPT
// ============================================================================

async function testMetaDialogue() {
  const client = await pool.connect();

  try {
    console.log('🧪 Testing Meta-Dialogue Integration\n');
    console.log('=' .repeat(60));

    // Step 1: Check if tables exist
    console.log('\n1️⃣  Checking database schema...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('meta_dialogues', 'dialogue_sessions')
      ORDER BY table_name
    `);

    if (tablesResult.rows.length !== 2) {
      throw new Error(
        'Tables not found. Please apply migration: database/migrations/20260102_create_meta_dialogues.sql'
      );
    }

    console.log('   ✅ Tables exist: meta_dialogues, dialogue_sessions');

    // Step 2: Check for existing reflections (context for dialogue)
    console.log('\n2️⃣  Checking for existing reflections...');
    const reflectionsResult = await client.query(
      'SELECT COUNT(*) as count FROM consciousness_reflections'
    );
    const reflectionCount = parseInt(reflectionsResult.rows[0].count);

    if (reflectionCount === 0) {
      console.log('   ⚠️  No reflections found. Dialogue will work but lacks context.');
      console.log('   💡 Run: npx tsx scripts/test-reflection-generation.ts');
    } else {
      console.log(`   ✅ Found ${reflectionCount} reflection(s)`);
    }

    // Step 3: Get the most recent reflection ID (if exists)
    let reflectionId = null;
    if (reflectionCount > 0) {
      const latestReflection = await client.query(`
        SELECT id FROM consciousness_reflections
        ORDER BY created_at DESC
        LIMIT 1
      `);
      reflectionId = latestReflection.rows[0]?.id;
    }

    // Step 4: Create dialogue session
    console.log('\n3️⃣  Creating dialogue session...');
    const sessionResult = await client.query(
      `INSERT INTO dialogue_sessions (
         session_name,
         initial_query,
         initial_reflection_id
       ) VALUES ($1, $2, $3)
       RETURNING id, session_name, started_at`,
      [
        SAMPLE_SESSION.sessionName,
        SAMPLE_SESSION.initialQuery,
        reflectionId,
      ]
    );

    const session = sessionResult.rows[0];
    console.log(`   ✅ Session created: ${session.id}`);
    console.log(`      Name: ${session.session_name}`);
    console.log(`      Started: ${session.started_at}`);

    // Step 5: Insert dialogue exchanges
    console.log('\n4️⃣  Inserting dialogue exchanges...');
    const exchangeIds = [];

    for (const exchange of SAMPLE_EXCHANGES) {
      const exchangeResult = await client.query(
        `INSERT INTO meta_dialogues (
           session_id,
           reflection_id,
           exchange_type,
           speaker,
           content,
           referenced_facets,
           referenced_meta_layer,
           synthesis_method
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, speaker, exchange_type`,
        [
          session.id,
          reflectionId,
          exchange.exchangeType,
          exchange.speaker,
          exchange.content,
          exchange.referencedFacets ? `{${exchange.referencedFacets.join(',')}}` : null,
          exchange.referencedMetaLayer,
          exchange.synthesisMethod,
        ]
      );

      const inserted = exchangeResult.rows[0];
      exchangeIds.push(inserted.id);
      console.log(`   ✅ Exchange ${exchangeIds.length}: ${inserted.speaker} (${inserted.exchange_type})`);
    }

    // Step 6: Verify session metadata updated (via trigger)
    console.log('\n5️⃣  Verifying session metadata (trigger test)...');
    const updatedSessionResult = await client.query(
      'SELECT total_exchanges, last_activity_at FROM dialogue_sessions WHERE id = $1',
      [session.id]
    );

    const updatedSession = updatedSessionResult.rows[0];
    console.log(`   ✅ Total exchanges: ${updatedSession.total_exchanges}`);
    console.log(`   ✅ Last activity: ${updatedSession.last_activity_at}`);

    if (updatedSession.total_exchanges !== SAMPLE_EXCHANGES.length) {
      console.log(`   ⚠️  Expected ${SAMPLE_EXCHANGES.length} exchanges, got ${updatedSession.total_exchanges}`);
    }

    // Step 7: Query via views
    console.log('\n6️⃣  Testing database views...');

    const activeDialoguesResult = await client.query(
      'SELECT session_id, session_name, total_exchanges FROM active_dialogues LIMIT 1'
    );
    if (activeDialoguesResult.rows.length > 0) {
      console.log('   ✅ active_dialogues view working');
    }

    const dialogueThreadResult = await client.query(
      'SELECT COUNT(*) as count FROM dialogue_thread WHERE session_id = $1',
      [session.id]
    );
    console.log(`   ✅ dialogue_thread view: ${dialogueThreadResult.rows[0].count} exchanges`);

    // Step 8: Display sample exchange
    console.log('\n7️⃣  Sample exchange preview:');
    const sampleExchange = await client.query(
      `SELECT speaker, content, referenced_meta_layer, referenced_facets
       FROM meta_dialogues
       WHERE session_id = $1
       ORDER BY created_at
       LIMIT 2`,
      [session.id]
    );

    sampleExchange.rows.forEach((ex, i) => {
      console.log(`\n   ${ex.speaker.toUpperCase()}:`);
      console.log(`   ${ex.content.substring(0, 120)}...`);
      if (ex.referenced_meta_layer) {
        console.log(`   Meta-layer: ${ex.referenced_meta_layer}`);
      }
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Meta-Dialogue Test Complete!\n');
    console.log('📊 Results:');
    console.log(`   • Session ID: ${session.id}`);
    console.log(`   • Exchanges inserted: ${exchangeIds.length}`);
    console.log(`   • Session total: ${updatedSession.total_exchanges}`);
    console.log(`   • Reflection context: ${reflectionId ? 'Yes' : 'No'}`);

    console.log('\n🌐 Next Steps:');
    console.log('   1. Open browser: http://localhost:3000/talk');
    console.log('   2. View the seeded conversation');
    console.log('   3. Type a new query to test live dialogue');
    console.log('   4. Verify facet badges and Æ-codes display correctly');

    console.log('\n💾 Database Queries (optional):');
    console.log(`   psql postgresql://soullab@localhost:5432/maia_consciousness \\`);
    console.log(`     -c "SELECT * FROM active_dialogues;"`);
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n📋 Troubleshooting:');
    console.error('   • Ensure PostgreSQL is running');
    console.error('   • Verify migration applied: database/migrations/20260102_create_meta_dialogues.sql');
    console.error('   • Check database connection string');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run test
testMetaDialogue().catch((err) => {
  console.error(err);
  process.exit(1);
});
