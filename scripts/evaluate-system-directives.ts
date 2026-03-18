#!/usr/bin/env tsx
/**
 * Evaluate System Directives
 *
 * Runs all directive rules against the current (or specified) daily ledger snapshot.
 * Inserts new directives for triggered rules, marks cleared conditions, skips duplicates.
 *
 * Usage:
 *   node_modules/.bin/tsx scripts/evaluate-system-directives.ts [--date 2026-03-15] [--dry-run]
 */

import { evaluateSystemDirectives } from '../lib/research/evaluateSystemDirectives';
import { DIRECTIVE_RULES } from '../lib/research/directiveRules';

// ---------------------------------------------------------------------------
// Guard: ensure we are connected to the correct database
// ---------------------------------------------------------------------------
async function assertCorrectDb(): Promise<void> {
  const { query } = await import('../lib/db/postgres');
  const result = await query('SELECT current_database()');
  const dbName = result.rows[0]?.current_database as string | undefined;
  if (dbName !== 'maia_consciousness') {
    throw new Error(`Wrong database: ${dbName}. Expected maia_consciousness.`);
  }
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
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

function buildPeriodStart(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  ).toISOString();
}

// ---------------------------------------------------------------------------
// Dry-run: show what rules exist and what ledger data is available
// ---------------------------------------------------------------------------
async function dryRun(periodStart: string): Promise<void> {
  console.log('[DirectiveEval] DRY RUN — no writes will occur');
  console.log(`[DirectiveEval] Period start: ${periodStart}`);
  console.log(`[DirectiveEval] Rules registered: ${DIRECTIVE_RULES.length}`);
  DIRECTIVE_RULES.forEach(r => console.log(`  - ${r.ruleKey}`));

  // Show available ledger data for this period
  const { query } = await import('../lib/db/postgres');
  const result = await query(
    `SELECT metric_key, metric_value, direction, metric_payload
       FROM system_research_ledger
      WHERE period_type = 'daily'
        AND period_start = $1
      ORDER BY metric_key`,
    [periodStart]
  );

  if (result.rows.length === 0) {
    console.log(
      `[DirectiveEval] No ledger rows found for period ${periodStart}. ` +
      'Run the daily research ledger first.'
    );
    return;
  }

  console.log(`[DirectiveEval] Ledger rows for ${periodStart}:`);
  for (const row of result.rows as Array<{
    metric_key: string;
    metric_value: string | null;
    direction: string | null;
    metric_payload: Record<string, unknown> | null;
  }>) {
    console.log(
      `  ${row.metric_key.padEnd(32)} value=${String(row.metric_value ?? 'null').padEnd(8)} dir=${row.direction ?? 'null'}`
    );
    if (row.metric_payload && Object.keys(row.metric_payload).length > 0) {
      const preview = JSON.stringify(row.metric_payload);
      console.log(`    payload: ${preview.length > 120 ? preview.slice(0, 120) + '...' : preview}`);
    }
  }

  // Also check existing open directives
  const openResult = await query(
    `SELECT directive_key, status, priority, condition_cleared_at, observation_period_start
       FROM system_directives
      WHERE status IN ('open', 'acknowledged')
      ORDER BY priority DESC, observation_period_start DESC`
  );
  if (openResult.rows.length > 0) {
    console.log(`[DirectiveEval] Currently open directives (${openResult.rows.length}):`);
    for (const row of openResult.rows as Array<{
      directive_key: string;
      status: string;
      priority: string;
      condition_cleared_at: string | null;
      observation_period_start: string;
    }>) {
      const cleared = row.condition_cleared_at ? ' [condition cleared]' : '';
      console.log(
        `  [${row.priority.toUpperCase()}] ${row.directive_key} (${row.status})${cleared} — period=${row.observation_period_start.slice(0, 10)}`
      );
    }
  } else {
    console.log('[DirectiveEval] No open directives currently in system_directives.');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const isDryRun   = args.includes('--dry-run');
  const dateStr    = parseDateArg(args);
  const periodStart = buildPeriodStart(dateStr);

  console.log(
    `[DirectiveEval] Starting — date=${dateStr ?? 'today'} period=${periodStart} dry-run=${isDryRun}`
  );

  await assertCorrectDb();

  if (isDryRun) {
    await dryRun(periodStart);
    return;
  }

  const start = Date.now();
  const result = await evaluateSystemDirectives(periodStart);
  const elapsed = Date.now() - start;

  console.log(`[DirectiveEval] Completed in ${elapsed}ms`);
  console.log(`  Triggered : ${result.triggered.join(', ') || '(none)'}`);
  console.log(`  Cleared   : ${result.cleared.join(', ') || '(none)'}`);
  console.log(`  Skipped   : ${result.skipped.join(', ') || '(none)'}`);
  if (result.errors.length) {
    console.error(`  Errors    : ${result.errors.length}`);
    result.errors.forEach(e => console.error(`    ${e}`));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[DirectiveEval] Fatal:', err);
  process.exit(1);
});
