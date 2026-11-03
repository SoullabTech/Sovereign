/**
 * Bounded retention sweep for abandoned Writer uploads (founder-approved 2026-11-03). See
 * lib/manuscript/source/sweepAbandonedLandings.ts for exactly what it removes and what it never touches.
 *
 * NOT WIRED: nothing schedules this. Running it, or putting it on a timer, is a separate act.
 *
 * ── Usage ──────────────────────────────────────────────────────────────────────────────────────────────────────
 *   DATABASE_URL=… npx tsx scripts/ops/sweep-abandoned-landings.ts                    dry run (default): deletes nothing
 *   DATABASE_URL=… WRITER_LANDING_SWEEP_CONFIRM=delete-abandoned-uploads \
 *       npx tsx scripts/ops/sweep-abandoned-landings.ts --apply                       really removes them
 *   --older-than-hours=N   (integer, at least 24)     --limit=N   (1 to 500, default 50)     --quiet
 *
 * --apply WITHOUT the confirmation variable is refused before any database connection is opened.
 * Exit 0: dry run, or every removal finished. Exit 1: a removal failed or an erasure is still owed (a scheduler surfaces it).
 * Exit 2: refused to run (bad arguments, or --apply without confirmation).
 */
import { closePool } from '../../lib/db/postgres';
import { sweepAbandonedLandings, SweepConfigError, SWEEP_DEFAULT_LIMIT, SWEEP_MAX_LIMIT, SWEEP_MIN_AGE_HOURS } from '../../lib/manuscript/source/sweepAbandonedLandings';

export const CONFIRM_VALUE = 'delete-abandoned-uploads';

export function parseSweepArgs(argv: string[], env: Record<string, string | undefined>):
  { ok: true; apply: boolean; olderThanHours: number; limit: number; quiet: boolean } | { ok: false; reason: string } {
  let apply = false;
  let quiet = false;
  let olderThanHours: number = SWEEP_MIN_AGE_HOURS;
  let limit: number = SWEEP_DEFAULT_LIMIT;
  for (const arg of argv) {
    if (arg === '--apply') apply = true;
    else if (arg === '--quiet') quiet = true;
    else if (arg.startsWith('--older-than-hours=')) olderThanHours = Number(arg.slice('--older-than-hours='.length));
    else if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length));
    else return { ok: false, reason: `unknown argument ${arg.slice(0, 40)}` };
  }
  if (!Number.isInteger(olderThanHours) || olderThanHours < SWEEP_MIN_AGE_HOURS) return { ok: false, reason: `--older-than-hours must be an integer of at least ${SWEEP_MIN_AGE_HOURS}` };
  // The library refuses a limit above its ceiling; the script must refuse it too, BEFORE any connection, as the documented exit 2
  // (a scheduler reads exit 1 as "a removal failed", which a bad argument is not).
  if (!Number.isInteger(limit) || limit < 1 || limit > SWEEP_MAX_LIMIT) return { ok: false, reason: `--limit must be an integer from 1 to ${SWEEP_MAX_LIMIT}` };
  if (apply && env.WRITER_LANDING_SWEEP_CONFIRM !== CONFIRM_VALUE) {
    return { ok: false, reason: `--apply deletes member uploads and requires WRITER_LANDING_SWEEP_CONFIRM=${CONFIRM_VALUE}` };
  }
  return { ok: true, apply, olderThanHours, limit, quiet };
}

/** 1 when a removal failed or an erasure is still owed, so a scheduler surfaces it; a skipped live upload is normal and is 0. */
export function exitCodeFor(outcomes: { failed: number; erasure_pending: number }): 0 | 1 {
  return outcomes.failed > 0 || outcomes.erasure_pending > 0 ? 1 : 0;
}

async function main(): Promise<number> {
  const parsed = parseSweepArgs(process.argv.slice(2), process.env);
  if (!parsed.ok) {
    console.error(`sweep-abandoned-landings: refused: ${parsed.reason}`);
    return 2;
  }
  const say = (s: string) => { if (!parsed.quiet) console.log(s); };
  try {
    const report = await sweepAbandonedLandings({ apply: parsed.apply, olderThanHours: parsed.olderThanHours, limit: parsed.limit });
    say(`abandoned-upload sweep (${report.mode}): ${report.considered} older than ${report.olderThanHours}h considered (limit ${report.limit}); oldest ${report.oldestAgeHours ?? 'n/a'}h`);
    say(`  by state: ${JSON.stringify(report.byState)}`);
    if (report.mode === 'dry_run') {
      for (const c of report.candidates) say(`  would remove ${c.intentId} member ${c.memberRef} ${c.state} ${c.ageHours}h`);
      say('  dry run: nothing was deleted. Re-run with --apply and the confirmation variable to remove them.');
    } else {
      say(`  outcomes: ${JSON.stringify(report.outcomes)}`);
    }
    return exitCodeFor(report.outcomes);
  } catch (error) {
    console.error(`sweep-abandoned-landings: failed: ${error instanceof SweepConfigError ? error.code : error instanceof Error ? error.name : 'unknown'}`);
    return 1;
  } finally {
    await closePool().catch(() => undefined);
  }
}

if (process.argv[1] && /sweep-abandoned-landings\.[tj]s$/.test(process.argv[1])) {
  main().then((code) => process.exit(code));
}
