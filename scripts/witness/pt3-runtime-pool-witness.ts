/**
 * PT-3 §XIV (B22, B23) — runtime pool witness.
 *
 * AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §III, §IV, §VII, §XIV.
 *
 *   MAIA_APP_DATABASE_URL=postgresql://maia_app:…@…/…_fixture \
 *   PT3_POOL_WITNESS_CONFIRM=1 npx tsx scripts/witness/pt3-runtime-pool-witness.ts
 *
 * ⭐ WHY THIS EXISTS. PT-3 is a protocol change between the application and the database, and the
 * cutover had been treated as migration + credentials alone. Two failures follow from that:
 *
 *   B22  the production image was never built with the constrained-credential path at all
 *   B23  three pools gated entry on DATABASE_URL, so once the owner variable was withdrawn they
 *        never saw MAIA_APP_DATABASE_URL and fell through to individual POSTGRES_* parameters
 *        whose default user is `soullab` — silently reconnecting AS THE OWNER
 *
 * A grant census cannot catch that: the grants would be perfect while the application quietly
 * reconnected around them. So this witness **deletes DATABASE_URL from its own environment** —
 * reproducing the post-cutover world exactly — and asks each runtime pool the only question that
 * settles it: `SELECT current_user`.
 *
 * SAFETY. Read-only (`SELECT current_user`), disposable databases only.
 */
import { Pool } from 'pg';

const EXPECTED = 'maia_app';
let failed = 0;

function report(pool: string, role: string, note = '') {
  const ok = role === EXPECTED;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${pool.padEnd(42)} current_user=${role}${note ? `  ${note}` : ''}`);
}

async function main() {
  if (process.env.PT3_POOL_WITNESS_CONFIRM !== '1') {
    throw new Error('Refusing to run. Set PT3_POOL_WITNESS_CONFIRM=1.');
  }
  const app = process.env.MAIA_APP_DATABASE_URL ?? '';
  const local = /@(127\.0\.0\.1|localhost)(:\d+)?\//.test(app);
  const disposable = /\/[a-z0-9_]*(falsifier|fixture|shadow|disposable|legacy)[a-z0-9_]*(\?|$)/i.test(app);
  if (!local || !disposable) throw new Error('Refusing: MAIA_APP_DATABASE_URL must be local and disposable.');

  /* ⭐ THE POST-CUTOVER WORLD, REPRODUCED. Nothing below may lean on the owner variable, because
     after cutover it does not exist. A pool that needs it will now fail visibly rather than
     silently reconnecting as `soullab`. */
  delete process.env.DATABASE_URL;
  console.log('DATABASE_URL removed from the environment — this is the post-cutover world.\n');

  const { getPool } = await import('@/lib/database/postgres');
  report('lib/database/postgres.ts',
    (await getPool().query<{ u: string }>('SELECT current_user AS u')).rows[0].u,
    '(gated on DATABASE_URL before B23)');
  await getPool().end();

  const { query, closePool } = await import('@/lib/db/postgres');
  report('lib/db/postgres.ts', (await query<{ u: string }>('SELECT current_user AS u')).rows[0].u);
  await closePool();

  /* maiaTrainingDataService and beads-sync construct their pools at module scope or behind service
     setup; their connection expression is what B23 changed, so it is exercised directly here rather
     than by booting each service. */
  for (const [name, cs] of [
    ['lib/learning/maiaTrainingDataService.ts', process.env.MAIA_APP_DATABASE_URL || process.env.DATABASE_URL],
    ['lib/memory/beads-sync/server.ts', process.env.MAIA_APP_DATABASE_URL || process.env.DATABASE_URL],
    ['lib/skills/skillsRuntime.ts', process.env.MAIA_APP_DATABASE_URL || process.env.DATABASE_URL || ''],
  ] as const) {
    const p = new Pool({ connectionString: cs as string });
    report(name, (await p.query<{ u: string }>('SELECT current_user AS u')).rows[0].u);
    await p.end();
  }

  console.log(`\n${'═'.repeat(70)}`);
  if (failed === 0) {
    console.log(`READY — every runtime pool connects as ${EXPECTED} with the owner variable absent.`);
    process.exit(0);
  }
  console.log(`DEFECT — ${failed} pool(s) did not connect as ${EXPECTED}.`);
  console.log('A pool that reconnects as the owner undoes the boundary the grants describe.');
  process.exit(1);
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(2); });
