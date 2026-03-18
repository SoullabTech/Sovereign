#!/usr/bin/env ts-node
/**
 * Run daily research ledger aggregation.
 * Usage: npx ts-node scripts/run-daily-research-ledger.ts [--date 2026-03-15] [--dry-run]
 */
import { buildDailyResearchLedger } from '../lib/research/buildDailyResearchLedger';

async function assertCorrectDb(): Promise<void> {
  const { query } = await import('../lib/db/postgres');
  const result = await query('SELECT current_database()');
  const dbName = result.rows[0]?.current_database as string | undefined;
  if (dbName !== 'maia_consciousness') {
    throw new Error(`Wrong database: ${dbName}. Expected maia_consciousness.`);
  }
}

function parseDateArg(args: string[]): string | undefined {
  const dateIdx = args.indexOf('--date');
  if (dateIdx !== -1 && args[dateIdx + 1]) {
    return args[dateIdx + 1];
  }
  const inlineArg = args.find(a => a.startsWith('--date='));
  if (inlineArg) {
    return inlineArg.slice(7);
  }
  return undefined;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const dateStr = parseDateArg(args);

  console.log(`[ResearchLedger] Daily run — date=${dateStr ?? 'today'} dry-run=${dryRun}`);

  await assertCorrectDb();

  if (dryRun) {
    console.log('[ResearchLedger] DRY RUN — no writes');
    const { METRIC_REGISTRY } = await import('../lib/research/researchMetricRegistry');
    const metrics = METRIC_REGISTRY.filter(
      m => m.periodType === 'daily' || m.periodType === 'both'
    );
    console.log(`[ResearchLedger] Would compute ${metrics.length} metrics:`);
    metrics.forEach(m => console.log(`  - ${m.metricKey}`));
    return;
  }

  const start = Date.now();
  const result = await buildDailyResearchLedger(dateStr);
  const elapsed = Date.now() - start;

  console.log(
    `[ResearchLedger] Done in ${elapsed}ms — computed=${result.computed} upserted=${result.upserted} errors=${result.errors.length}`
  );
  if (result.errors.length) {
    result.errors.forEach(e => console.warn(e));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[ResearchLedger] Fatal:', err);
  process.exit(1);
});
