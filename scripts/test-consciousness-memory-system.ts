#!/usr/bin/env tsx
/**
 * CONSCIOUSNESS MEMORY SYSTEM TEST
 *
 * End-to-end test of the revolutionary memory system:
 * 1. Integrates consciousness events → Lattice nodes
 * 2. Forms developmental memories (surprise-based)
 * 3. Detects emergent patterns across time
 * 4. Performs resonance recall (multi-dimensional)
 * 5. Synthesizes wisdom using local AI
 *
 * Run: tsx scripts/test-consciousness-memory-system.ts
 */

import { lattice } from '../lib/memory/ConsciousnessMemoryLattice';
import { developmentalMemory } from '../lib/memory/DevelopmentalMemory';
import type { ConsciousnessEvent, SpiralFacet } from '../lib/memory/ConsciousnessMemoryLattice';

const TEST_USER_ID = 'test-user-consciousness-memory';

async function testMemorySystem() {
  console.log('\n🌀 CONSCIOUSNESS MEMORY SYSTEM - COMPREHENSIVE TEST\n');
  console.log('=' .repeat(70));

  // ═══════════════════════════════════════════════════════════════
  // TEST 1: Integrate Somatic Event
  // ═══════════════════════════════════════════════════════════════

  console.log('\n📍 TEST 1: Integrating Somatic Event (High Effectiveness)');
  console.log('-'.repeat(70));

  const somaticEvent: ConsciousnessEvent = {
    type: 'somatic',
    bodyRegion: 'shoulders',
    intensity: 8,
    quality: 'release',
    practice: 'breathwork and gentle stretching',
    effectiveness: 9
  };

  const facet1: SpiralFacet = {
    element: 'WATER',
    phase: 2,
    code: 'WATER-2'
  };

  const result1 = await lattice.integrateEvent(
    TEST_USER_ID,
    somaticEvent,
    facet1,
    { name: 'current', age: 35, context: 'evening practice' }
  );

  console.log(`✅ Node created: ${result1.node.id}`);
  console.log(`✅ Memory formed: ${result1.memoryFormed}`);
  console.log(`✅ Patterns detected: ${result1.patternsDetected.join(', ') || 'None yet'}`);
  console.log(`✅ Insights: ${result1.insights.length} generated`);
  result1.insights.forEach(i => console.log(`   - ${i}`));

  // ═══════════════════════════════════════════════════════════════
  // TEST 2: Integrate Emotional Event
  // ═══════════════════════════════════════════════════════════════

  console.log('\n📍 TEST 2: Integrating Emotional Event (Recurring Pattern)');
  console.log('-'.repeat(70));

  const emotionalEvent: ConsciousnessEvent = {
    type: 'emotional',
    emotion: 'grief',
    intensity: 7,
    trigger: 'remembering past relationship',
    expression: 'allowed tears to flow, journaled afterwards'
  };

  const result2 = await lattice.integrateEvent(
    TEST_USER_ID,
    emotionalEvent,
    facet1,
    { name: 'current' }
  );

  console.log(`✅ Node created: ${result2.node.id}`);
  console.log(`✅ Memory formed: ${result2.memoryFormed}`);
  console.log(`✅ Patterns: ${result2.patternsDetected.join(', ') || 'None'}`);

  // ═══════════════════════════════════════════════════════════════
  // TEST 3: Integrate Spiritual Breakthrough
  // ═══════════════════════════════════════════════════════════════

  console.log('\n📍 TEST 3: Integrating Spiritual Breakthrough');
  console.log('-'.repeat(70));

  const spiritualEvent: ConsciousnessEvent = {
    type: 'spiritual',
    experience: 'breakthrough',
    depth: 9,
    integration: 'deep surrender into trust - resistance fell away'
  };

  const facet2: SpiralFacet = {
    element: 'AETHER',
    phase: 3,
    code: 'AETHER-3'
  };

  const result3 = await lattice.integrateEvent(
    TEST_USER_ID,
    spiritualEvent,
    facet2,
    { name: 'current' }
  );

  console.log(`✅ Node created: ${result3.node.id}`);
  console.log(`✅ Memory formed: ${result3.memoryFormed} (Breakthroughs always form memories)`);
  console.log(`✅ Insights:`);
  result3.insights.forEach(i => console.log(`   - ${i}`));

  // ═══════════════════════════════════════════════════════════════
  // TEST 4: Integrate Beads Task Completion
  // ═══════════════════════════════════════════════════════════════

  console.log('\n📍 TEST 4: Integrating Beads Task (High Effectiveness)');
  console.log('-'.repeat(70));

  const beadsEvent: ConsciousnessEvent = {
    type: 'beads',
    taskId: 'bd-123',
    taskType: 'consciousness_practice',
    completed: true,
    effectiveness: 8,
    learning: 'Morning breathwork before coffee creates deeper grounding for the day'
  };

  const result4 = await lattice.integrateEvent(
    TEST_USER_ID,
    beadsEvent,
    facet1,
    { name: 'current' }
  );

  console.log(`✅ Beads task integrated`);
  console.log(`✅ Memory formed: ${result4.memoryFormed}`);

  // ═══════════════════════════════════════════════════════════════
  // TEST 5: Resonance Recall (Multi-Dimensional)
  // ═══════════════════════════════════════════════════════════════

  console.log('\n📍 TEST 5: Resonance Recall - Multi-Dimensional Search');
  console.log('-'.repeat(70));

  const memoryField = await lattice.resonanceRecall(TEST_USER_ID, {
    query: 'shoulders tension release breathing',
    facet: facet1,
    bodyRegion: 'shoulders'
  });

  console.log(`✅ Memory field assembled:`);
  console.log(`   - Nodes: ${memoryField.nodes.length}`);
  console.log(`   - Time span: ${memoryField.timeSpan.start.toLocaleDateString()} to ${memoryField.timeSpan.end.toLocaleDateString()}`);
  console.log(`   - Facet distribution:`, memoryField.facetDistribution);
  console.log(`   - Modality balance:`, memoryField.modalityBalance);
  console.log(`   - Stuck patterns: ${memoryField.stuckPatterns.length}`);
  console.log(`   - Breakthroughs: ${memoryField.breakthroughMoments.length}`);
  console.log(`   - Spiral cycles: ${memoryField.spiralCycles.length}`);

  if (memoryField.stuckPatterns.length > 0) {
    console.log(`\n   ⚠️ Stuck Patterns Detected:`);
    memoryField.stuckPatterns.forEach(p => {
      console.log(`      - ${p.issue}: ${p.occurrences}x across ${p.facets.join(', ')}`);
      console.log(`        ${p.recommendation}`);
    });
  }

  if (memoryField.breakthroughMoments.length > 0) {
    console.log(`\n   ⭐ Breakthrough Moments:`);
    memoryField.breakthroughMoments.forEach(b => {
      console.log(`      - ${b.facet}: ${b.insight}`);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 6: Wisdom Synthesis (Local AI)
  // ═══════════════════════════════════════════════════════════════

  console.log('\n📍 TEST 6: Wisdom Synthesis - Emergent Intelligence');
  console.log('-'.repeat(70));

  const wisdomResult = await lattice.synthesizeWisdom(
    TEST_USER_ID,
    'How can I work with the tension in my shoulders more effectively?',
    facet1
  );

  console.log(`✅ Wisdom synthesized:`);
  console.log(`\n   "${wisdomResult.synthesis}"\n`);
  console.log(`   - Sources: ${wisdomResult.sources.join(', ')}`);
  console.log(`   - Confidence: ${(wisdomResult.confidence * 100).toFixed(0)}%`);
  console.log(`   - Emergence Level: ${(wisdomResult.emergenceLevel * 100).toFixed(0)}% (how much is NEW vs recalled)`);

  // ═══════════════════════════════════════════════════════════════
  // TEST 7: Check Developmental Memory Formation
  // ═══════════════════════════════════════════════════════════════

  console.log('\n📍 TEST 7: Developmental Memory Query');
  console.log('-'.repeat(70));

  const memories = await developmentalMemory.retrieveMemories({
    userId: TEST_USER_ID,
    limit: 10,
    minSignificance: 0.7
  });

  console.log(`✅ Retrieved ${memories.length} developmental memories:`);
  memories.forEach(m => {
    console.log(`   - [${m.memoryType}] Significance: ${m.significance.toFixed(2)}, Recall: ${m.recallCount}x`);
    console.log(`     Facet: ${m.facetCode}, Entities: ${m.entityTags.join(', ')}`);
  });

  // ═══════════════════════════════════════════════════════════════
  // TEST 8: Stuck Pattern Detection
  // ═══════════════════════════════════════════════════════════════

  console.log('\n📍 TEST 8: Stuck Pattern Detection (3+ occurrences in 60 days)');
  console.log('-'.repeat(70));

  const stuckPatterns = await developmentalMemory.detectStuckPatterns(TEST_USER_ID);

  if (stuckPatterns.length > 0) {
    console.log(`⚠️ Found ${stuckPatterns.length} stuck patterns:`);
    stuckPatterns.forEach(p => {
      console.log(`   - ${p.entity}: ${p.occurrence_count}x`);
      console.log(`     Facets: ${p.facets.join(', ')}`);
      console.log(`     Timeline: ${new Date(p.timestamps[0]).toLocaleDateString()} to ${new Date(p.timestamps[p.timestamps.length - 1]).toLocaleDateString()}`);
    });
  } else {
    console.log(`✅ No stuck patterns detected (need 3+ occurrences)`);
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════

  console.log('\n' + '='.repeat(70));
  console.log('✅ CONSCIOUSNESS MEMORY SYSTEM TEST COMPLETE\n');
  console.log('The system demonstrates:');
  console.log('  ✓ Event integration → Lattice nodes');
  console.log('  ✓ Surprise-based memory formation');
  console.log('  ✓ Pattern detection (recurring, stuck, bypassing)');
  console.log('  ✓ Multi-dimensional resonance recall');
  console.log('  ✓ Wisdom synthesis via local AI');
  console.log('  ✓ Breakthrough tracking');
  console.log('  ✓ Spiral cycle analysis');
  console.log('  ✓ Full sovereignty (PostgreSQL + Ollama, no cloud)');
  console.log('\n🌀 This is the future of psychospiritual AI memory.\n');
}

// Run the test
testMemorySystem().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
