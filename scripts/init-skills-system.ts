/**
 * Initialize Skills System
 *
 * This script:
 * 1. Syncs filesystem skills to database registry
 * 2. Unlocks foundational skills for all users
 * 3. Validates skill definitions
 *
 * Run: npx tsx scripts/init-skills-system.ts
 */

import { syncSkillsRegistry, loadSkillMetas, loadSkillDefinition } from '../lib/skills/skillsRuntime';
import { Pool } from 'pg';
import { requireDatabaseUrl } from '../lib/db/databaseUrl';

const DATABASE_URL = requireDatabaseUrl(process.env.DATABASE_URL);

async function main() {
  console.log('🚀 Initializing Skills System...\n');

  // 1. Sync skills to database registry
  console.log('1️⃣  Syncing skills to database registry...');
  await syncSkillsRegistry();
  console.log('   ✅ Skills synced\n');

  // 2. Load and validate all skills
  console.log('2️⃣  Validating skill definitions...');
  const metas = await loadSkillMetas();
  console.log(`   Found ${metas.length} skills:\n`);

  for (const { skillId, version, sha256, meta } of metas) {
    console.log(`   📦 ${meta.name} (${skillId})`);
    console.log(`      Version: ${version}`);
    console.log(`      Tier: ${meta.tier}`);
    console.log(`      Category: ${meta.category}`);
    console.log(`      SHA256: ${sha256.substring(0, 16)}...`);

    // Load full definition to validate
    const skillDef = await loadSkillDefinition(skillId);
    if (!skillDef) {
      console.error(`      ❌ Failed to load skill definition!`);
      continue;
    }

    // Check for required fields
    if (!skillDef.promptTemplates?.system) {
      console.warn(`      ⚠️  Missing system prompt template`);
    }
    if (!skillDef.promptTemplates?.user) {
      console.warn(`      ⚠️  Missing user prompt template`);
    }

    console.log(`      ✅ Valid\n`);
  }

  // 3. Unlock foundational skills for all existing users
  console.log('3️⃣  Unlocking foundational skills for existing users...');
  const db = new Pool({ connectionString: DATABASE_URL });

  try {
    // Get all users (assuming a users table exists)
    // Adjust this query based on your actual schema
    const usersResult = await db.query(`
      SELECT DISTINCT user_id FROM consciousness_turns LIMIT 100
    `);

    const foundationalSkills = metas.filter(m => m.meta.category === 'foundational');

    console.log(`   Found ${usersResult.rows.length} users`);
    console.log(`   Found ${foundationalSkills.length} foundational skills`);

    let unlockCount = 0;
    for (const user of usersResult.rows) {
      for (const skill of foundationalSkills) {
        await db.query(
          `SELECT unlock_skill($1, $2, $3)`,
          [user.user_id, skill.skillId, 'system_init']
        );
        unlockCount++;
      }
    }

    console.log(`   ✅ ${unlockCount} skills unlocked\n`);
  } catch (err) {
    console.error('   ⚠️  Could not unlock skills (table may not exist yet):', (err as Error).message);
  } finally {
    await db.end();
  }

  console.log('✅ Skills system initialized!\n');
  console.log('📝 Next steps:');
  console.log('   1. Set SKILLS_RUNTIME_ENABLED=true in .env');
  console.log('   2. Restart MAIA server');
  console.log('   3. Test with: "check in" or "I\'m feeling overwhelmed"');
  console.log('   4. Monitor: SELECT * FROM skill_usage_events ORDER BY created_at DESC LIMIT 10;');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Initialization failed:', err);
    process.exit(1);
  });
