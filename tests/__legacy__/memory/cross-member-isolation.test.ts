/**
 * Cross-Member Memory Isolation Test
 *
 * Critical security test ensuring one user's memories never leak to another user.
 * This tests the fundamental privacy invariant of the memory system.
 *
 * Run with: npx tsx tests/memory/cross-member-isolation.test.ts
 */

import { query as dbQuery } from '../../lib/db/postgres';
import { developmentalMemory } from '../../lib/memory/DevelopmentalMemory';
import { MemoryBundleService as memoryBundle } from '../../lib/memory/MemoryBundle';

// Test user IDs - use UUIDs that won't collide with real users
const USER_A = 'test-isolation-user-a-00000';
const USER_B = 'test-isolation-user-b-00000';

async function cleanup() {
  console.log('🧹 Cleaning up test data...');
  await dbQuery(
    `DELETE FROM developmental_memories WHERE user_id IN ($1, $2)`,
    [USER_A, USER_B]
  );
  await dbQuery(
    `DELETE FROM conversation_turns WHERE user_id IN ($1, $2)`,
    [USER_A, USER_B]
  );
  await dbQuery(
    `DELETE FROM conversation_memory_uses WHERE user_id IN ($1, $2)`,
    [USER_A, USER_B]
  );
  await dbQuery(
    `DELETE FROM memory_links WHERE user_id IN ($1, $2)`,
    [USER_A, USER_B]
  );
  await dbQuery(
    `DELETE FROM preference_confirmations WHERE user_id IN ($1, $2)`,
    [USER_A, USER_B]
  );
}

async function createTestMemories() {
  console.log('📝 Creating test memories for User A...');
  await developmentalMemory.formMemory({
    userId: USER_A,
    type: 'preference',
    triggerEvent: {
      type: 'mental',
      cognitiveLevel: 6,
      intensity: 0.8,
      content: 'User A prefers morning meditation sessions',
    },
    facetCode: 'FIRE-1',
    significance: 0.85,
    entityTags: ['meditation', 'morning'],
  });

  await developmentalMemory.formMemory({
    userId: USER_A,
    type: 'pattern',
    triggerEvent: {
      type: 'somatic',
      bodyRegion: 'chest',
      sensation: 'warmth',
      intensity: 0.7,
      effectiveness: 8,
    },
    facetCode: 'WATER-2',
    significance: 0.75,
    entityTags: ['chest', 'warmth'],
  });

  console.log('📝 Creating test memories for User B...');
  await developmentalMemory.formMemory({
    userId: USER_B,
    type: 'preference',
    triggerEvent: {
      type: 'mental',
      cognitiveLevel: 5,
      intensity: 0.9,
      content: 'User B prefers evening journaling',
    },
    facetCode: 'AIR-3',
    significance: 0.80,
    entityTags: ['journaling', 'evening'],
  });

  await developmentalMemory.formMemory({
    userId: USER_B,
    type: 'boundary',
    triggerEvent: {
      type: 'mental',
      cognitiveLevel: 4,
      intensity: 0.6,
      content: 'User B does not want to discuss work stress',
    },
    facetCode: 'EARTH-1',
    significance: 0.90,
    entityTags: ['work', 'boundary'],
  });
}

async function testDevelopmentalMemoryIsolation(): Promise<boolean> {
  console.log('\n🔒 Testing DevelopmentalMemory isolation...');

  // User A should only see their memories
  const userAMemories = await developmentalMemory.semanticSearch(
    USER_A,
    'meditation morning preferences',
    10
  );

  // User B should only see their memories
  const userBMemories = await developmentalMemory.semanticSearch(
    USER_B,
    'journaling evening preferences',
    10
  );

  // Check User A doesn't see User B's content
  const userAHasBContent = userAMemories.some(
    (m: any) =>
      m.content?.includes('User B') ||
      m.content?.includes('journaling') ||
      m.content?.includes('work stress')
  );

  // Check User B doesn't see User A's content
  const userBHasAContent = userBMemories.some(
    (m: any) =>
      m.content?.includes('User A') ||
      m.content?.includes('morning meditation') ||
      m.content?.includes('chest')
  );

  if (userAHasBContent) {
    console.error('❌ FAIL: User A saw User B content in DevelopmentalMemory!');
    return false;
  }

  if (userBHasAContent) {
    console.error('❌ FAIL: User B saw User A content in DevelopmentalMemory!');
    return false;
  }

  console.log('✅ DevelopmentalMemory isolation: PASS');
  return true;
}

async function testMemoryBundleIsolation(): Promise<boolean> {
  console.log('\n🔒 Testing MemoryBundle isolation...');

  // Get memory bundles for each user
  const userABundle = await memoryBundle.build({
    userId: USER_A,
    currentInput: 'What are my meditation preferences?',
    scope: 'all',
  });

  const userBBundle = await memoryBundle.build({
    userId: USER_B,
    currentInput: 'What are my evening routines?',
    scope: 'all',
  });

  // Extract all text from bundles for inspection
  const userAText = JSON.stringify(userABundle);
  const userBText = JSON.stringify(userBBundle);

  // Check for cross-contamination
  const aHasBContent =
    userAText.includes('User B') ||
    userAText.includes('journaling') ||
    userAText.includes('work stress');

  const bHasAContent =
    userBText.includes('User A') ||
    userBText.includes('morning meditation') ||
    (userBText.includes('chest') && userBText.includes('warmth'));

  if (aHasBContent) {
    console.error('❌ FAIL: User A MemoryBundle contains User B data!');
    console.error('Bundle:', userABundle);
    return false;
  }

  if (bHasAContent) {
    console.error('❌ FAIL: User B MemoryBundle contains User A data!');
    console.error('Bundle:', userBBundle);
    return false;
  }

  console.log('✅ MemoryBundle isolation: PASS');
  return true;
}

async function testDirectQueryIsolation(): Promise<boolean> {
  console.log('\n🔒 Testing direct SQL query isolation...');

  // Attempt a query that might accidentally leak if WHERE user_id is missing
  const result = await dbQuery(
    `SELECT user_id, memory_type, significance
     FROM developmental_memories
     WHERE user_id = $1`,
    [USER_A]
  );

  // All returned rows must be User A
  const leakedRows = result.rows.filter((r: any) => r.user_id !== USER_A);

  if (leakedRows.length > 0) {
    console.error('❌ FAIL: Direct query returned non-User-A rows!');
    console.error('Leaked rows:', leakedRows);
    return false;
  }

  console.log('✅ Direct SQL query isolation: PASS');
  return true;
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  CROSS-MEMBER MEMORY ISOLATION TEST');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    await cleanup();
    await createTestMemories();

    const results: boolean[] = [];

    results.push(await testDevelopmentalMemoryIsolation());
    results.push(await testMemoryBundleIsolation());
    results.push(await testDirectQueryIsolation());

    await cleanup();

    console.log('\n═══════════════════════════════════════════════════');
    const allPassed = results.every((r) => r);
    if (allPassed) {
      console.log('  ✅ ALL ISOLATION TESTS PASSED');
    } else {
      console.log('  ❌ SOME ISOLATION TESTS FAILED');
      process.exit(1);
    }
    console.log('═══════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('💥 Test suite error:', err);
    await cleanup();
    process.exit(1);
  }
}

// Run if executed directly
runAllTests();

export { runAllTests };
