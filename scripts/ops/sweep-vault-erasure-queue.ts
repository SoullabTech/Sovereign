/**
 * WS-DELETE-01 — the independent consumer of owed vault erasures.
 *
 * Founder ruling 2026-09-07, on the word "self-completing":
 *
 *   "A queue row is an owed act. It is self-completing only if there is an
 *    independently runnable consumer that will eventually revisit surviving rows
 *    without requiring the member to delete the now-absent Work again. If the
 *    only consumer is the original HTTP request, then this is named failure, not
 *    yet self-completing failure."
 *
 * That was exactly the gap. `eraseManuscript()` sweeps once, inline, and if that
 * sweep fails the row was truthful and permanent — retained bytes living forever
 * behind a perfectly honest queue row. This file is the second consumer that makes
 * the word true.
 *
 * ── What it is safe to be ────────────────────────────────────────────────
 * It reads no member data and reconstructs nothing. Its entire input is a list of
 * vault paths the database says are owed destruction; its entire effect is to
 * destroy them and forget them. It cannot erase anything a committed transaction
 * did not already decide to erase, so running it more often is never more
 * destructive — only more complete.
 *
 * Idempotent, and safe to run concurrently with itself: a path already destroyed
 * succeeds (ENOENT is the outcome we wanted), and a row deleted by another pass
 * simply is not there.
 *
 * ── Usage ────────────────────────────────────────────────────────────────
 *   DATABASE_URL=… npx tsx scripts/ops/sweep-vault-erasure-queue.ts
 *   DATABASE_URL=… npx tsx scripts/ops/sweep-vault-erasure-queue.ts --quiet
 *
 * Exit 0 when nothing is owed after the pass; exit 1 when obligations remain, so
 * a scheduler surfaces a vault that cannot be cleared rather than looping in
 * silence. Remaining rows are never deleted on failure — the row is the only
 * handle left on bytes nothing else can find.
 */

import { sweepVaultErasureQueue } from '../../lib/manuscript/source/eraseManuscript';
import { query, closePool } from '../../lib/db/postgres';

const quiet = process.argv.includes('--quiet');
const say = (s: string) => {
  if (!quiet) console.log(s);
};

async function main() {
  const before = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM vault_erasure_queue`,
  );
  const owed = before.rows[0]?.n ?? 0;

  if (owed === 0) {
    say('vault erasure queue: nothing owed');
    return 0;
  }

  say(`vault erasure queue: ${owed} obligation(s) owed`);
  const { destroyed, remaining } = await sweepVaultErasureQueue();
  say(`  destroyed ${destroyed} · ${remaining} still owed`);

  if (remaining > 0) {
    /* Name what is stuck. An obligation that keeps failing is an operator
       problem — a permission, a mount, a vault root — and it must be visible
       rather than retried forever in the dark. */
    const stuck = await query<{ artifact_ref: string; attempts: number; last_error: string | null }>(
      `SELECT artifact_ref, attempts, last_error FROM vault_erasure_queue
        ORDER BY attempts DESC, queued_at ASC LIMIT 10`,
    );
    for (const row of stuck.rows) {
      console.error(
        `  STILL OWED  ${row.artifact_ref}  attempts=${row.attempts}  ${row.last_error ?? ''}`,
      );
    }
  }
  return remaining > 0 ? 1 : 0;
}

main()
  .then(async (code) => {
    await closePool().catch(() => {});
    process.exit(code);
  })
  .catch(async (err) => {
    console.error('vault erasure sweep failed:', err);
    await closePool().catch(() => {});
    process.exit(1);
  });
