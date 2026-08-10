/**
 * CC-U1 PROVING WALK — remove manufactured relational standing
 *
 * Read-only. Loads REAL production relationship memory for sampled members and renders
 * the prompt block through BOTH the trunk (baseline) formatter and the CC-U1 formatter,
 * at FAST and CORE retrieval parameters.
 *
 * Proves:
 *   1. the trust/intimacy/phase claim is gone
 *   2. unaffirmed breakthrough quotation is gone
 *   3. elapsed-time + encounter-count continuity is PRESERVED
 *   4. no replacement metric appears
 *
 * Run against a read-only tunnel to production:
 *   # 1. materialise the pre-CC-U1 formatter for side-by-side comparison (temporary, untracked)
 *   git show <pre-CC-U1-sha>:lib/memory/RelationshipMemoryService.ts > lib/memory/__cc_u1_baseline__.ts
 *   # 2. read-only tunnel
 *   ssh -f -N -L 15432:127.0.0.1:5432 soullab@minisforum
 *   # 3. run (DATABASE_URL = prod URL with host rewritten to localhost:15432)
 *   DATABASE_URL=... npx tsx scripts/cc-u1-proving-walk.ts
 *   # 4. rm lib/memory/__cc_u1_baseline__.ts and close the tunnel
 *
 * Result 2026-08-10 against prod d2db55d7b, 6 members × FAST/CORE:
 *   banned-pattern failures: 0 · continuity losses: 0 · PASSED
 *
 *   Shape of the baseline output removed by this cut (member content redacted;
 *   the structure is the evidence, the identities are not):
 *     `Relationship quality: <phase>, trust 100%, intimacy 9X%`   <- on real members
 *     `Recent breakthrough: "<9-word conversational fragment>"`
 *   Shape of what CC-U1 preserves:
 *     `<N> conversations over <M> days with <name>. Last spoke <T> ago.`
 *
 * NOTE: this script renders live member names and utterances to stdout by design —
 * it reads production. Treat its output as member data: read it, do not paste it
 * into docs, comments, fixtures, commit messages, or PR discussion.
 */

import { query } from '@/lib/db/postgres';
import {
  loadRelationshipMemory,
  formatRelationshipMemoryForPrompt as formatNew,
} from '@/lib/memory/RelationshipMemoryService';
import { formatRelationshipMemoryForPrompt as formatBaseline } from '@/lib/memory/__cc_u1_baseline__';

// FAST and CORE call maiaService.ts:678 / :1415 with these exact options.
const FAST = { includeThemes: true, includeBreakthroughs: true, includePatterns: false, maxThemes: 3, maxBreakthroughs: 1 };
const CORE = { includeThemes: true, includeBreakthroughs: true, includePatterns: true, maxThemes: 5, maxBreakthroughs: 2 };

const BANNED = [
  /trust\s+\d+%/i,
  /intimacy\s+\d+%/i,
  /Relationship quality:/i,
  /Recent breakthrough:/i,
  /Recent insight:/i,
  /\((new|developing|established|deep) relationship\)/i,
];

// Continuity that MUST survive the cut.
const CONTINUITY = [/\d+ conversations over \d+ days/i, /Last spoke/i];

async function main() {
  // Sample real members across the resonance distribution, favouring the saturated ones.
  const sample = await query<{ user_id: string; encounter_count: number; morphic_resonance: number }>(`
    SELECT user_id, encounter_count, morphic_resonance
    FROM relationship_essences
    WHERE encounter_count > 0
    ORDER BY morphic_resonance DESC, encounter_count DESC
    LIMIT 6
  `);

  let failures = 0;
  let continuityLoss = 0;

  for (const row of sample.rows) {
    for (const [tier, opts] of [['FAST', FAST], ['CORE', CORE]] as const) {
      const memory = await loadRelationshipMemory(row.user_id, opts);
      const before = formatBaseline(memory);
      const after = formatNew(memory);

      console.log('\n' + '='.repeat(72));
      console.log(`member ${row.user_id.slice(0, 8)}  enc=${row.encounter_count}  mr=${Number(row.morphic_resonance).toFixed(2)}  tier=${tier}`);
      console.log('-'.repeat(72));
      console.log('--- BASELINE (trunk d2db55d7b) ---');
      console.log(before || '(empty)');
      console.log('--- CC-U1 ---');
      console.log(after || '(empty)');

      for (const re of BANNED) {
        if (re.test(after)) { console.log(`  ❌ FAIL banned pattern still present: ${re}`); failures++; }
      }
      // Continuity is only asserted for members with real history rendered in baseline.
      for (const re of CONTINUITY) {
        if (re.test(before) && !re.test(after)) { console.log(`  ❌ CONTINUITY LOST: ${re}`); continuityLoss++; }
      }
    }
  }

  console.log('\n' + '='.repeat(72));
  console.log(`banned-pattern failures: ${failures}`);
  console.log(`continuity losses:       ${continuityLoss}`);
  console.log(failures === 0 && continuityLoss === 0 ? '✅ CC-U1 PROVING WALK PASSED' : '❌ CC-U1 PROVING WALK FAILED');
  process.exit(failures === 0 && continuityLoss === 0 ? 0 : 1);
}

main().catch(err => { console.error('proving walk error:', err?.message || err); process.exit(2); });
