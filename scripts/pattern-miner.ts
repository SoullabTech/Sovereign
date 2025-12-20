/**
 * Pattern Miner Job
 *
 * Analyzes skill co-occurrence patterns and identifies proto-agents
 * (emergent combinations of skills that work well together)
 *
 * Run: npx tsx scripts/pattern-miner.ts
 * Or schedule: cron job every 24 hours
 */

import { Pool } from 'pg';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL || '';
const MIN_COOCCURRENCE_COUNT = 3; // Minimum times skills must co-occur
const MIN_SUCCESS_RATE = 0.7; // 70% success rate
const MIN_SUPPORT_COUNT = 2; // At least 2 users must exhibit the pattern

interface CooccurrencePattern {
  skillSet: string[];
  tier: string | null;
  element: string | null;
  realm: string | null;
  cooccurrenceCount: number;
  distinctUsers: number;
  avgSuccessRate: number;
  firstObserved: Date;
  lastObserved: Date;
}

async function main() {
  console.log('🔍 Pattern Miner: Analyzing skill co-occurrence...\n');

  const db = new Pool({ connectionString: DATABASE_URL });

  try {
    // 1. Query co-occurrence patterns from view
    console.log('1️⃣  Fetching co-occurrence patterns...');
    const patternsResult = await db.query<CooccurrencePattern>(`
      SELECT *
      FROM v_skill_cooccurrence
      WHERE cooccurrence_count >= $1
        AND avg_success_rate >= $2
        AND distinct_users >= $3
      ORDER BY cooccurrence_count DESC, avg_success_rate DESC
      LIMIT 50
    `, [MIN_COOCCURRENCE_COUNT, MIN_SUCCESS_RATE, MIN_SUPPORT_COUNT]);

    console.log(`   Found ${patternsResult.rows.length} candidate patterns\n`);

    if (patternsResult.rows.length === 0) {
      console.log('   No patterns found. Need more usage data.\n');
      return;
    }

    // 2. Analyze each pattern
    console.log('2️⃣  Analyzing patterns for agent emergence...\n');

    let newCandidates = 0;
    let updatedCandidates = 0;

    for (const pattern of patternsResult.rows) {
      console.log(`   📊 Pattern: ${pattern.skillSet.join(' + ')}`);
      console.log(`      Tier: ${pattern.tier || 'mixed'}`);
      console.log(`      Element: ${pattern.element || 'mixed'}`);
      console.log(`      Realm: ${pattern.realm || 'mixed'}`);
      console.log(`      Co-occurrences: ${pattern.cooccurrenceCount}`);
      console.log(`      Users: ${pattern.distinctUsers}`);
      console.log(`      Success rate: ${(pattern.avgSuccessRate * 100).toFixed(1)}%`);

      // Generate signature hash
      const signatureData = {
        tier: pattern.tier || 'mixed',
        element: pattern.element || 'mixed',
        realm: pattern.realm || 'mixed',
        skillSet: pattern.skillSet.sort(), // Sort for consistent hashing
      };

      const signatureHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(signatureData))
        .digest('hex');

      // Generate archetypal name suggestion
      const archetypeName = generateArchetypalName(pattern);
      console.log(`      Suggested archetype: ${archetypeName}`);

      // Check if candidate already exists
      const existingResult = await db.query(
        `SELECT id, status FROM agent_emergence_candidates WHERE signature_hash = $1`,
        [signatureHash]
      );

      if (existingResult.rows.length > 0) {
        // Update existing candidate
        const existing = existingResult.rows[0];
        await db.query(`
          UPDATE agent_emergence_candidates
          SET cooccur_skills = $1,
              support_count = $2,
              avg_success_rate = $3,
              field_coherence = $4,
              notes = $5
          WHERE id = $6
        `, [
          JSON.stringify(pattern.skillSet),
          pattern.distinctUsers,
          pattern.avgSuccessRate,
          null, // field_coherence (could calculate from state_snapshot)
          `Updated: ${new Date().toISOString()}. Co-occurrences: ${pattern.cooccurrenceCount}`,
          existing.id,
        ]);
        console.log(`      ✅ Updated existing candidate (status: ${existing.status})\n`);
        updatedCandidates++;
      } else {
        // Create new candidate
        await db.query(`
          INSERT INTO agent_emergence_candidates (
            signature_hash,
            tier,
            element,
            realm,
            cooccur_skills,
            support_count,
            avg_success_rate,
            archetypal_name,
            status,
            notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          signatureHash,
          pattern.tier,
          pattern.element,
          pattern.realm,
          JSON.stringify(pattern.skillSet),
          pattern.distinctUsers,
          pattern.avgSuccessRate,
          archetypeName,
          'monitoring',
          `Created: ${new Date().toISOString()}. Initial co-occurrences: ${pattern.cooccurrenceCount}`,
        ]);
        console.log(`      ✨ New candidate created (status: monitoring)\n`);
        newCandidates++;
      }
    }

    // 3. Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Pattern mining complete!\n`);
    console.log(`   New candidates: ${newCandidates}`);
    console.log(`   Updated candidates: ${updatedCandidates}`);
    console.log(`   Total analyzed: ${patternsResult.rows.length}\n`);

    // 4. Show candidates ready for review
    const reviewReadyResult = await db.query(`
      SELECT id, archetypal_name, support_count, avg_success_rate, status
      FROM agent_emergence_candidates
      WHERE status = 'monitoring'
        AND support_count >= 3
        AND avg_success_rate >= 0.8
      ORDER BY support_count DESC, avg_success_rate DESC
      LIMIT 5
    `);

    if (reviewReadyResult.rows.length > 0) {
      console.log('🎯 Candidates ready for review (high support + high success):\n');
      for (const candidate of reviewReadyResult.rows) {
        console.log(`   ${candidate.archetypal_name}`);
        console.log(`      Support: ${candidate.support_count} users`);
        console.log(`      Success: ${(candidate.avg_success_rate * 100).toFixed(1)}%`);
        console.log(`      Status: ${candidate.status}\n`);
      }

      console.log('📝 Next steps:');
      console.log('   1. Review candidates in database: SELECT * FROM agent_emergence_candidates WHERE status = \'monitoring\';');
      console.log('   2. Promote promising candidates: UPDATE agent_emergence_candidates SET status = \'review\' WHERE id = ?;');
      console.log('   3. Create new skill definitions for approved agents');
    }

  } catch (err) {
    console.error('❌ Pattern mining failed:', err);
    throw err;
  } finally {
    await db.end();
  }
}

/**
 * Generate archetypal name from pattern
 * Simple heuristic - in production, could use LLM
 */
function generateArchetypalName(pattern: CooccurrencePattern): string {
  const skillNames = pattern.skillSet.map(s => {
    // Extract key words from skill ID
    return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  });

  const elementPrefix = pattern.element ? `${pattern.element.charAt(0).toUpperCase() + pattern.element.slice(1)} ` : '';
  const tierSuffix = pattern.tier === 'DEEP' ? ' (Deep)' : pattern.tier === 'FAST' ? ' (Fast)' : '';

  // Simple concatenation for MVP
  const baseName = skillNames.join(' → ');

  return `${elementPrefix}${baseName}${tierSuffix}`.substring(0, 100); // Limit length
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
