/**
 * Skills Integration Test
 *
 * Tests end-to-end skill execution:
 * 1. Direct skill runtime test (bypasses getMaiaResponse)
 * 2. Database connection test
 * 3. Skill selection for sample queries
 */

import { runSkillRuntime, logSkillUsage } from '../lib/skills/runtime';
import { upsertSkillsRegistry } from '../lib/skills/db';
import { loadSkillMetas } from '../lib/skills/loader';
import type { SkillContext } from '../lib/skills/types';
import path from 'node:path';
import crypto from 'node:crypto';

const skillsRoot = path.join(process.cwd(), 'skills');

// Generate valid test UUIDs
const testUserId = crypto.randomUUID();

async function testSkillRuntime() {
  console.log('🧪 Testing Skills Runtime\n');

  // Test 1: Load skills and sync to DB
  console.log('1️⃣  Loading skills from filesystem...');
  const loaded = await loadSkillMetas(skillsRoot);
  console.log(`   ✅ Loaded ${loaded.length} skills`);
  loaded.forEach(s => {
    console.log(`      - ${s.meta.id} (${s.meta.tier}) v${s.meta.version}`);
  });

  console.log('\n2️⃣  Syncing to database...');
  try {
    await upsertSkillsRegistry(loaded);
    console.log('   ✅ Database sync complete');
  } catch (error) {
    console.error('   ❌ Database sync failed:', error);
    console.log('   ⚠️  Continuing with runtime tests...\n');
  }

  // Test 2: Regulation query (should match window-of-tolerance or elemental-checkin)
  console.log('\n3️⃣  Test: "I feel overwhelmed right now"');
  const ctx1: SkillContext = {
    userId: testUserId,
    sessionId: 'test-session-1',
    queryText: 'I feel overwhelmed right now',
    state: {
      tierAllowed: 'FAST',
      cognitiveLevel: 2,
      nervousSystemState: 'sympathetic',
      element: 'water',
    },
  };

  const result1 = await runSkillRuntime({
    skillsRoot,
    ctx: ctx1,
    renderWithModel: async (system, user) => {
      return `[MOCK] Let's ground together. Feel your feet on the floor...`;
    },
    refusalMessage: (key) => `[MOCK REFUSAL] ${key}`,
  });

  if (result1) {
    console.log(`   ✅ Skill selected: ${result1.skillId}`);
    console.log(`   ✅ Outcome: ${result1.outcome}`);
    console.log(`   ✅ Response: ${result1.responseText.slice(0, 60)}...`);

    // Try logging to DB
    try {
      await logSkillUsage(result1, ctx1);
      console.log('   ✅ Logged to database');
    } catch (error) {
      console.log('   ⚠️  Database logging skipped (non-blocking)');
    }
  } else {
    console.log('   ❌ No skill matched');
  }

  // Test 3: Dialectical query with dorsal state (should be refused)
  console.log('\n4️⃣  Test: "I\'m stuck between two choices" (dorsal state)');
  const ctx2: SkillContext = {
    userId: testUserId,
    sessionId: 'test-session-2',
    queryText: "I'm stuck between two choices",
    state: {
      tierAllowed: 'CORE',
      cognitiveLevel: 3,
      nervousSystemState: 'dorsal', // BLOCKED for dialectical-scaffold
    },
  };

  const result2 = await runSkillRuntime({
    skillsRoot,
    ctx: ctx2,
    renderWithModel: async () => '[MOCK]',
    refusalMessage: (key) => `Not safe right now — let's regulate first.`,
  });

  if (result2) {
    console.log(`   ✅ Skill selected: ${result2.skillId}`);
    console.log(`   ✅ Outcome: ${result2.outcome}`);
    if (result2.outcome === 'hard_refusal') {
      console.log(`   ✅ Correctly refused (reason: ${result2.summary})`);
      console.log(`   ✅ Refusal message: ${result2.responseText}`);
    }
  } else {
    console.log('   ❌ No skill matched');
  }

  // Test 4: Dialectical query with window state (should succeed)
  console.log('\n5️⃣  Test: "I\'m stuck between two choices" (window state)');
  const ctx3: SkillContext = {
    userId: testUserId,
    sessionId: 'test-session-3',
    queryText: "I'm stuck between two choices",
    state: {
      tierAllowed: 'CORE',
      cognitiveLevel: 3,
      nervousSystemState: 'window', // ALLOWED
      bypassingScore: 0.2,
    },
  };

  const result3 = await runSkillRuntime({
    skillsRoot,
    ctx: ctx3,
    renderWithModel: async () => '[MOCK] Both paths hold wisdom...',
    refusalMessage: (key) => `[MOCK REFUSAL] ${key}`,
  });

  if (result3) {
    console.log(`   ✅ Skill selected: ${result3.skillId}`);
    console.log(`   ✅ Outcome: ${result3.outcome}`);
    console.log(`   ✅ Response: ${result3.responseText.slice(0, 60)}...`);
  } else {
    console.log('   ❌ No skill matched');
  }

  console.log('\n✅ Skills integration test complete!\n');
}

// Run tests
testSkillRuntime().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
