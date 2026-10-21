/**
 * MAIL-02 retention runner. Run daily (cron).
 *
 * Rolls recipient-level rows older than 90 days into the anonymous monthly
 * aggregate, deletes them, then drops aggregates older than 13 months. Rolling up
 * BEFORE deleting is what keeps the prune from silently discarding volume history.
 *
 *   npx tsx scripts/prune-email-ledger.ts
 */
import { query, closePool } from '../lib/db/postgres';

async function main() {
  const r = await query<{ rolled_up: string; deleted: string }>(
    'SELECT * FROM prune_email_delivery_ledger()'
  );
  const { rolled_up = '0', deleted = '0' } = r.rows[0] ?? {};
  console.log(
    `[MAIA/email] ledger prune complete · rolled_up=${rolled_up} aggregate row(s) · deleted=${deleted} recipient-level row(s)`
  );
  // MAIL-05 budget counters are ephemeral, keyed HMAC data.
  // Purge separately from the observational ledger's longer retention.
  const budget = await query<{ deleted: string }>(
    'SELECT public.prune_soullab_mail_capacity() AS deleted'
  );
  console.log(
    `[Soullab Mail] capacity prune complete · deleted=${budget.rows[0]?.deleted ?? '0'} expired counter(s)`
  );
}

main()
  .catch((err) => {
    console.error('[MAIA/email] ledger prune FAILED:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => closePool());
