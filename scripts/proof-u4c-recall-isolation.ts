/**
 * U4-C PROOF — recall fan-out isolation.
 *
 * Acceptance (founder-stated):
 *   "If temporal resonance fails, the other four recall dimensions still return.
 *    Temporal remains explicitly unavailable; no fake lattice contribution is created."
 *
 * Run in a worktree whose DB has developmental_memories but NOT lattice_nodes
 * (the production condition). Run against unmodified trunk as the control.
 */
import { lattice } from '../lib/memory/ConsciousnessMemoryLattice';
import { query as dbQuery } from '../lib/db/postgres';

async function main() {
  const guard = await dbQuery(
    `SELECT to_regclass('public.lattice_nodes') AS lat,
            to_regclass('public.developmental_memories') AS dm`, []
  );
  const { lat, dm } = guard.rows[0];
  console.log(`PRECONDITION  lattice_nodes=${lat ?? 'ABSENT'}  developmental_memories=${dm ?? 'ABSENT'}`);
  if (lat !== null) { console.log('SKIP: lattice_nodes exists — not the production condition.'); process.exit(2); }

  const u = await dbQuery(`SELECT user_id, facet_code FROM developmental_memories LIMIT 1`, []);
  if (u.rows.length === 0) { console.log('SKIP: no developmental_memories rows to recall.'); process.exit(2); }
  const userId: string = u.rows[0].user_id;
  console.log(`SUBJECT       user=${String(userId).slice(0, 8)}…`);

  let field: any, threw: Error | null = null;
  try {
    field = await lattice.resonanceRecall(userId, {
      query: 'continuity',
      facet: { element: 'EARTH', phase: 1, code: 'EARTH-1' } as any,
      bodyRegion: 'heart',
      emotion: 'grief',
    });
  } catch (e) { threw = e as Error; }

  console.log('\n──────── RESULT ────────');
  if (threw) {
    console.log(`THREW: ${threw.message.split('\n')[0]}`);
    console.log('VERDICT: recall CANCELLED — all dimensions lost.');
    process.exit(1);
  }

  const avail = field?.recallAvailability;
  const dims = {
    memories: (field?.stuckPatterns?.length ?? 0) + (field?.spiralCycles?.length ?? 0),
    nodes: field?.nodes?.length ?? 0,
  };
  console.log(`returned            : YES (did not throw)`);
  console.log(`nodes (lattice)     : ${dims.nodes}`);
  console.log(`spiralCycles        : ${field?.spiralCycles?.length ?? 0}`);
  console.log(`stuckPatterns       : ${field?.stuckPatterns?.length ?? 0}`);
  console.log(`breakthroughMoments : ${field?.breakthroughMoments?.length ?? 0}`);
  console.log(`recallAvailability  : ${avail ? JSON.stringify(avail) : 'ABSENT (pre-U4-C build)'}`);

  const checks: [string, boolean][] = [
    ['A. resonanceRecall returns instead of throwing', true],
    ['B. availability is reported at all', !!avail],
    // The invariant is NOT "must report false" — the substrate query is skipped
    // when no memories matched, and inventing a verdict for a query never run
    // would be the same dishonesty in miniature. The invariant is: never claim
    // available without evidence.
    ['C. never claims lattice available without evidence', avail?.latticeAvailable !== true],
    ['D. temporal named as unavailable', !!avail?.unavailable?.includes('temporal')],
    ['E. no fabricated lattice nodes', dims.nodes === 0],
    ['F. non-lattice dimensions still assembled', Array.isArray(field?.spiralCycles) && Array.isArray(field?.stuckPatterns)],
  ];
  console.log('\n──────── CHECKS ────────');
  let pass = 0;
  for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (ok) pass++; }
  console.log(`\n${pass}/${checks.length} passed`);
  process.exit(pass === checks.length ? 0 : 1);
}

main().catch(e => { console.error('HARNESS ERROR:', e?.message); process.exit(3); });
