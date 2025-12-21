/**
 * PHASE 4.6 REFLECTION GENERATION TEST SCRIPT
 *
 * Purpose:
 * - Generate 2 sample mycelial cycles with embeddings
 * - Trigger first reflection generation
 * - Verify database persistence
 * - Display results to console
 *
 * Usage:
 *   npx tsx scripts/test-reflection-generation.ts
 *
 * Prerequisites:
 * - PostgreSQL running at localhost:5432
 * - Migration 20251228_create_reflective_sessions.sql applied
 * - Ollama running (optional - uses template fallback if unavailable)
 */

import { Pool } from 'pg';
import { generateReflection } from '../backend/src/services/reflection/reflectiveAgentService';
import type { FacetCode } from '../lib/consciousness/spiralogic-facet-mapping';

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
});

// ============================================================================
// SAMPLE CYCLE DATA
// ============================================================================

interface SampleCycle {
  cycleId: string;
  startTs: Date;
  endTs: Date;
  dominantFacets: FacetCode[];
  coherenceScore: number;
  meanHrv?: number;
  meanArousal?: number;
  meanValence?: number;
  eegAlpha?: number;
  embedding: number[];
}

const CYCLE_1: SampleCycle = {
  cycleId: 'test-cycle-001',
  startTs: new Date('2025-12-20T00:00:00Z'),
  endTs: new Date('2025-12-21T00:00:00Z'),
  dominantFacets: ['W1', 'W2', 'A1'],
  coherenceScore: 0.65,
  meanHrv: 45.2,
  meanArousal: 0.42,
  meanValence: 0.58,
  eegAlpha: 9.8,
  // Mock embedding: 256-dim vector with small random variations
  embedding: generateMockEmbedding(256, 0.5),
};

const CYCLE_2: SampleCycle = {
  cycleId: 'test-cycle-002',
  startTs: new Date('2025-12-27T00:00:00Z'),
  endTs: new Date('2025-12-28T00:00:00Z'),
  dominantFacets: ['F1', 'F2', 'A2'],
  coherenceScore: 0.78,
  meanHrv: 52.1,
  meanArousal: 0.68,
  meanValence: 0.72,
  eegAlpha: 11.2,
  // Mock embedding: similar to CYCLE_1 but with transformations (70% similarity expected)
  embedding: generateMockEmbedding(256, 0.5, CYCLE_1.embedding, 0.7),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate mock embedding vector
 *
 * @param dim - Dimension (should be 256 for mycelial memory)
 * @param scale - Scale factor for random values
 * @param basedOn - Optional base vector to transform (for similarity)
 * @param similarity - Similarity to base vector (0-1)
 */
function generateMockEmbedding(
  dim: number,
  scale: number = 1.0,
  basedOn?: number[],
  similarity: number = 0.0
): number[] {
  const embedding: number[] = [];

  for (let i = 0; i < dim; i++) {
    if (basedOn && similarity > 0) {
      // Mix base vector with random noise to achieve target similarity
      const baseValue = basedOn[i];
      const noise = (Math.random() - 0.5) * 2 * scale;
      embedding.push(baseValue * similarity + noise * (1 - similarity));
    } else {
      // Pure random vector
      embedding.push((Math.random() - 0.5) * 2 * scale);
    }
  }

  // Normalize to unit length (cosine similarity assumption)
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

/**
 * Insert sample cycle into database
 */
async function insertSampleCycle(cycle: SampleCycle): Promise<string> {
  const client = await pool.connect();

  try {
    const embeddingStr = `[${cycle.embedding.join(',')}]`;

    const result = await client.query(
      `INSERT INTO consciousness_mycelium (
        cycle_id,
        start_ts,
        end_ts,
        dominant_facets,
        coherence_score,
        mean_hrv,
        mean_arousal,
        mean_valence,
        eeg_alpha,
        embedding
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector)
      RETURNING id`,
      [
        cycle.cycleId,
        cycle.startTs,
        cycle.endTs,
        cycle.dominantFacets,
        cycle.coherenceScore,
        cycle.meanHrv,
        cycle.meanArousal,
        cycle.meanValence,
        cycle.eegAlpha,
        embeddingStr,
      ]
    );

    return result.rows[0].id;
  } finally {
    client.release();
  }
}

/**
 * Verify reflection was persisted
 */
async function verifyReflectionPersisted(cycleId: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT COUNT(*) as count
       FROM consciousness_reflections
       WHERE current_cycle_id IN (
         SELECT id FROM consciousness_mycelium WHERE cycle_id = $1
       )`,
      [cycleId]
    );

    return parseInt(result.rows[0].count, 10) > 0;
  } finally {
    client.release();
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  const client = await pool.connect();

  try {
    await client.query(`DELETE FROM consciousness_reflections WHERE current_cycle_id IN (
      SELECT id FROM consciousness_mycelium WHERE cycle_id LIKE 'test-cycle-%'
    )`);

    await client.query(`DELETE FROM consciousness_mycelium WHERE cycle_id LIKE 'test-cycle-%'`);

    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('⚠️  Error cleaning up test data:', error);
  } finally {
    client.release();
  }
}

// ============================================================================
// MAIN TEST FLOW
// ============================================================================

async function main() {
  console.log('🌙 Phase 4.6 Reflection Generation Test\n');

  try {
    // Step 1: Clean up any existing test data
    console.log('📋 Step 1: Cleaning up existing test data...');
    await cleanupTestData();

    // Step 2: Insert first cycle
    console.log('\n📋 Step 2: Inserting first sample cycle...');
    const cycle1Id = await insertSampleCycle(CYCLE_1);
    console.log(`✅ Cycle 1 inserted: ${cycle1Id}`);
    console.log(`   - Cycle ID: ${CYCLE_1.cycleId}`);
    console.log(`   - Date: ${CYCLE_1.startTs.toISOString().split('T')[0]}`);
    console.log(`   - Facets: ${CYCLE_1.dominantFacets.join(', ')}`);
    console.log(`   - Coherence: ${CYCLE_1.coherenceScore.toFixed(2)}`);
    console.log(`   - HRV: ${CYCLE_1.meanHrv}ms`);

    // Step 3: Insert second cycle
    console.log('\n📋 Step 3: Inserting second sample cycle...');
    const cycle2Id = await insertSampleCycle(CYCLE_2);
    console.log(`✅ Cycle 2 inserted: ${cycle2Id}`);
    console.log(`   - Cycle ID: ${CYCLE_2.cycleId}`);
    console.log(`   - Date: ${CYCLE_2.startTs.toISOString().split('T')[0]}`);
    console.log(`   - Facets: ${CYCLE_2.dominantFacets.join(', ')}`);
    console.log(`   - Coherence: ${CYCLE_2.coherenceScore.toFixed(2)}`);
    console.log(`   - HRV: ${CYCLE_2.meanHrv}ms`);

    // Step 4: Generate reflection
    console.log('\n📋 Step 4: Generating reflection for Cycle 2...');
    console.log('   (This will compare Cycle 2 to Cycle 1 via vector similarity)\n');

    const reflection = await generateReflection({
      cycleId: CYCLE_2.cycleId,
      similarityThreshold: 0.5,  // Lower threshold for test data
      maxDaysBetween: 30,
    });

    if (!reflection) {
      console.log('❌ No reflection generated (no similar cycle found)');
      console.log('   This might indicate:');
      console.log('   - Embeddings are too dissimilar (similarity < 0.5)');
      console.log('   - Vector search query issue');
      console.log('   - Missing pgvector extension');
      return;
    }

    // Step 5: Display results
    console.log('✅ Reflection generated successfully!\n');
    console.log('═'.repeat(80));
    console.log('REFLECTION OUTPUT');
    console.log('═'.repeat(80));
    console.log(`ID: ${reflection.id}`);
    console.log(`Current Cycle: ${reflection.currentCycleId}`);
    console.log(`Prior Cycle: ${reflection.priorCycleId}`);
    console.log(`Similarity: ${(reflection.similarityScore * 100).toFixed(1)}%`);
    console.log(`Coherence Delta: ${reflection.coherenceDelta > 0 ? '+' : ''}${reflection.coherenceDelta.toFixed(2)}`);
    console.log(`Meta-Layer: ${reflection.metaLayerCode || 'None'}`);
    if (reflection.metaLayerTrigger) {
      console.log(`Trigger: ${reflection.metaLayerTrigger}`);
    }
    console.log('\nFacet Deltas:');
    if (reflection.facetDeltas.removed.length > 0) {
      console.log(`  Removed: ${reflection.facetDeltas.removed.join(', ')}`);
    }
    if (reflection.facetDeltas.added.length > 0) {
      console.log(`  Added: ${reflection.facetDeltas.added.join(', ')}`);
    }
    if (reflection.facetDeltas.stable.length > 0) {
      console.log(`  Stable: ${reflection.facetDeltas.stable.join(', ')}`);
    }
    console.log('\nBiosignal Deltas:');
    if (reflection.biosignalDeltas.hrv !== undefined) {
      console.log(`  HRV: ${reflection.biosignalDeltas.hrv > 0 ? '+' : ''}${reflection.biosignalDeltas.hrv.toFixed(1)}ms`);
    }
    if (reflection.biosignalDeltas.arousal !== undefined) {
      console.log(`  Arousal: ${reflection.biosignalDeltas.arousal > 0 ? '+' : ''}${reflection.biosignalDeltas.arousal.toFixed(2)}`);
    }
    if (reflection.biosignalDeltas.eegAlpha !== undefined) {
      console.log(`  EEG Alpha: ${reflection.biosignalDeltas.eegAlpha > 0 ? '+' : ''}${reflection.biosignalDeltas.eegAlpha.toFixed(1)}Hz`);
    }
    console.log('\nReflection Text:');
    console.log(`  "${reflection.reflectionText}"`);
    console.log('\nInsights:');
    reflection.insights.forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });
    console.log('═'.repeat(80));

    // Step 6: Verify persistence
    console.log('\n📋 Step 6: Verifying database persistence...');
    const persisted = await verifyReflectionPersisted(CYCLE_2.cycleId);
    if (persisted) {
      console.log('✅ Reflection persisted to consciousness_reflections table');
    } else {
      console.log('❌ Reflection NOT found in database (persistence issue)');
    }

    // Step 7: Provide SQL verification queries
    console.log('\n📋 Step 7: SQL Verification Queries:\n');
    console.log('-- View all reflections:');
    console.log('SELECT * FROM reflective_timeline;');
    console.log('\n-- View meta-layer reflections only:');
    console.log('SELECT * FROM meta_layer_reflections;');
    console.log('\n-- View developmental arc:');
    console.log('SELECT * FROM developmental_arc;');
    console.log('\n-- Raw reflection data:');
    console.log(`SELECT * FROM consciousness_reflections WHERE current_cycle_id = '${cycle2Id}';`);

    console.log('\n✅ Test complete! Phase 4.6 Reflective Agentics is operational.');
    console.log('\nNext steps:');
    console.log('  1. View reflections in browser: http://localhost:3000/reflections');
    console.log('  2. Test API endpoints:');
    console.log('     GET  /api/reflections?limit=10');
    console.log('     POST /api/reflections/generate (body: { cycleId: "test-cycle-002" })');
    console.log('  3. Run cleanup: npx tsx scripts/test-reflection-generation.ts --cleanup');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nTroubleshooting:');
    console.error('  1. Ensure PostgreSQL is running: pg_isready');
    console.error('  2. Verify database exists: psql -l | grep maia_consciousness');
    console.error('  3. Check migration applied: \\d consciousness_reflections');
    console.error('  4. Verify pgvector extension: SELECT * FROM pg_extension WHERE extname = \'vector\';');
    console.error('  5. Check Ollama (optional): curl http://localhost:11434/api/tags');
    throw error;
  } finally {
    await pool.end();
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

const args = process.argv.slice(2);

if (args.includes('--cleanup')) {
  // Cleanup mode
  cleanupTestData()
    .then(() => {
      console.log('✅ Cleanup complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Cleanup failed:', err);
      process.exit(1);
    })
    .finally(() => pool.end());
} else {
  // Normal test mode
  main()
    .then(() => {
      console.log('\n🌙 Test script finished successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Test script failed:', err);
      process.exit(1);
    });
}
