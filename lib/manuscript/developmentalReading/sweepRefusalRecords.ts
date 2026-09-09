/**
 * WS-DEVELOP-REFUSAL-TRUTH-OBS-01 · R-3 — the retention caller.
 *
 * FOUNDER RULING 2026-09-08 — **host cron, never an in-process timer.**
 * `sweepExpired()` was built time-driven precisely so a quiet month cannot
 * retain records indefinitely merely because no further refusal occurs. An
 * in-process timer would reintroduce a dependency of the same shape one layer
 * down — process lifetime: frequent restarts can reset a timer before it ever
 * fires, several application processes can each hold their own, and retention
 * becomes an incidental responsibility of the web server.
 *
 *   The clock should own the sweep.
 *
 * ⛔ THE OPERATOR LINE IS ORDINARY OPERATIONAL LOGGING, NOT A REFUSAL RECORD.
 * Writing it into the seven-day family would mean the mechanism responsible for
 * deleting one record class creates more records inside that same retention
 * ontology.
 *
 * ⛔ WHAT IS NEVER LOGGED HERE: record bodies, refusal detail, manuscript ids,
 * member data — and, for the same reason, the daily FILENAMES. The ratified
 * line carries `removed_count`, not names. On failure the errno CODE is
 * reported rather than the error message, because a message carries a
 * filesystem path and a code is the whole diagnostic value of it.
 */

import { sweepExpired } from './refusalRecord';

const MARKER = '[MAIA/develop] refusal-record sweep';

/** Minimal sink, so the falsifiers can read the line without capturing globals. */
export interface SweepSink {
  log: (line: string) => void;
  error: (line: string) => void;
}

/**
 * Run one sweep. Returns the process exit code.
 *
 * ⛔ There is no third outcome. Either retention ran and is reported, or it did
 * not and the exit is non-zero — a sweep that reports success while records
 * remain is the single failure this whole lane exists to prevent.
 */
export async function runSweep(
  now: Date = new Date(),
  sink: SweepSink = { log: (l) => console.log(l), error: (l) => console.error(l) },
): Promise<0 | 1> {
  const started = Date.now();
  try {
    const { removed, failed, cutoffDay } = await sweepExpired(now);
    const duration_ms = Date.now() - started;

    /* A file that was due and survived is a retention failure, even though the
       sweep itself completed. Reported as such, and never as a partial success. */
    if (failed.length > 0) {
      sink.error(`${MARKER} ${JSON.stringify({
        outcome: 'failed',
        reason: 'unlink_failed',
        removed_count: removed.length,
        failed_count: failed.length,
        cutoff_day: cutoffDay,
        duration_ms,
      })}`);
      return 1;
    }

    sink.log(`${MARKER} ${JSON.stringify({
      outcome: 'ok',
      removed_count: removed.length,
      cutoff_day: cutoffDay,
      duration_ms,
    })}`);
    return 0;
  } catch (err) {
    sink.error(`${MARKER} ${JSON.stringify({
      outcome: 'failed',
      reason: (err as NodeJS.ErrnoException)?.code ?? 'unknown',
      duration_ms: Date.now() - started,
    })}`);
    return 1;
  }
}
