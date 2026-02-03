/**
 * Proof Ritual: Pattern Linking
 *
 * This script triggers the consciousness lattice with events that should:
 * 1. Form a developmental memory
 * 2. Detect patterns
 * 3. Create memory_links between them
 *
 * Run: DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" npx tsx scripts/proof-pattern-linking.ts
 *
 * Options:
 *   --keep    Keep test data after ritual (for regression inspection)
 *   --clean   Only clean up existing test data, don't run ritual
 */

import { ConsciousnessMemoryLattice } from '../lib/memory/ConsciousnessMemoryLattice';
import { query } from '../lib/db/postgres';

const TEST_USER = 'proof-ritual-user-001';
const KEEP_DATA = process.argv.includes('--keep');
const CLEAN_ONLY = process.argv.includes('--clean');

async function runProofRitual() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  PROOF RITUAL: Pattern Linking');
  console.log('═══════════════════════════════════════════════════\n');

  const lattice = new ConsciousnessMemoryLattice();

  // IMPORTANT: memoryMode must be 'longterm' to bypass the MemoryGate
  const opts = { memoryMode: 'longterm' as const };

  // Phase objects (LifePhase requires .name property)
  const actionPhase = { name: 'action' };
  const reflectionPhase = { name: 'reflection' };

  // Event 1: Somatic event that should form a memory AND trigger pattern detection
  console.log('📍 Event 1: High-effectiveness somatic practice (chest breathing)');
  await lattice.integrateEvent(
    TEST_USER,
    {
      type: 'somatic',
      bodyRegion: 'chest',
      sensation: 'warmth',
      intensity: 0.9,
      effectiveness: 9, // High enough to form memory
      practice: 'deep breathing',
    },
    { code: 'FIRE-2', name: 'Fire Facet', element: 'fire', phase: 'action' },
    actionPhase as any,
    opts
  );

  // Event 2: Another chest event to trigger recurring_somatic pattern
  console.log('\n📍 Event 2: Second chest practice (should trigger pattern)');
  await lattice.integrateEvent(
    TEST_USER,
    {
      type: 'somatic',
      bodyRegion: 'chest',
      sensation: 'expansion',
      intensity: 0.85,
      effectiveness: 8,
      practice: 'heart-opening stretch',
    },
    { code: 'FIRE-2', name: 'Fire Facet', element: 'fire', phase: 'action' },
    actionPhase as any,
    opts
  );

  // Event 3: Third chest event
  console.log('\n📍 Event 3: Third chest practice (pattern should strengthen)');
  await lattice.integrateEvent(
    TEST_USER,
    {
      type: 'somatic',
      bodyRegion: 'chest',
      sensation: 'release',
      intensity: 0.8,
      effectiveness: 8,
      practice: 'chest massage',
    },
    { code: 'FIRE-2', name: 'Fire Facet', element: 'fire', phase: 'action' },
    actionPhase as any,
    opts
  );

  // Event 4: Mental insight at high cognitive level
  console.log('\n📍 Event 4: Mental insight (should form memory)');
  await lattice.integrateEvent(
    TEST_USER,
    {
      type: 'mental',
      cognitiveLevel: 6, // Create/Evaluate level
      intensity: 0.9,
      content: 'I realized that my chest tension is connected to unexpressed emotions',
    },
    { code: 'AIR-3', name: 'Air Facet', element: 'air', phase: 'reflection' },
    reflectionPhase as any,
    opts
  );

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  VERIFICATION QUERIES');
  console.log('═══════════════════════════════════════════════════\n');

  // Query 1: Check for emergent_pattern records
  console.log('🔍 Query 1: Emergent patterns created');
  const patterns = await query(
    `SELECT id, memory_type, entity_tags, content_text,
            trigger_event->>'seenCount' as seen_count,
            formed_at
     FROM developmental_memories
     WHERE memory_type = 'emergent_pattern'
       AND user_id = $1
     ORDER BY formed_at DESC
     LIMIT 10`,
    [TEST_USER]
  );
  console.log(`Found ${patterns.rows.length} pattern(s):`);
  for (const row of patterns.rows) {
    console.log(`  📊 ${row.entity_tags?.[0] ?? 'unknown'} (seen ${row.seen_count}x) → ${row.id.slice(0, 8)}...`);
  }

  // Query 2: Check for memory_links
  console.log('\n🔍 Query 2: Memory links created');
  const links = await query(
    `SELECT ml.from_id, ml.to_id, ml.link_type, ml.confidence, ml.created_at,
            dm.entity_tags as pattern_key
     FROM memory_links ml
     JOIN developmental_memories dm ON dm.id::text = ml.to_id
     WHERE ml.user_id = $1
     ORDER BY ml.created_at DESC
     LIMIT 10`,
    [TEST_USER]
  );
  console.log(`Found ${links.rows.length} link(s):`);
  for (const row of links.rows) {
    console.log(`  🔗 ${row.from_id.slice(0, 8)}... → ${row.pattern_key?.[0] ?? row.to_id.slice(0, 8)} (${row.link_type}, conf: ${row.confidence})`);
  }

  // Query 3: Check for formed memories
  console.log('\n🔍 Query 3: Developmental memories formed');
  const memories = await query(
    `SELECT id, memory_type, significance, content_text, formed_at
     FROM developmental_memories
     WHERE user_id = $1
       AND memory_type != 'emergent_pattern'
     ORDER BY formed_at DESC
     LIMIT 10`,
    [TEST_USER]
  );
  console.log(`Found ${memories.rows.length} memory/ies:`);
  for (const row of memories.rows) {
    const preview = (row.content_text || '').slice(0, 50);
    console.log(`  🧠 ${row.memory_type} (sig: ${row.significance}) → ${row.id.slice(0, 8)}... "${preview}..."`);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  PROOF RITUAL COMPLETE');
  console.log('═══════════════════════════════════════════════════\n');

  if (KEEP_DATA) {
    console.log('🔒 [--keep] Test data retained for inspection.');
    console.log('   To clean up later, run with --clean');
  } else {
    console.log('To clean up test data, run:');
    console.log(`  DELETE FROM memory_links WHERE user_id = '${TEST_USER}';`);
    console.log(`  DELETE FROM developmental_memories WHERE user_id = '${TEST_USER}';`);
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up proof ritual test data...');
  await query(`DELETE FROM memory_links WHERE user_id = $1`, [TEST_USER]);
  await query(`DELETE FROM developmental_memories WHERE user_id = $1`, [TEST_USER]);
  console.log('✅ Test data cleaned.');
}

// Main execution
if (CLEAN_ONLY) {
  cleanupTestData().catch(console.error);
} else {
  runProofRitual().catch(console.error);
}
