/**
 * OUT-OF-BAND LEDGER FAILURE COUNTER.
 * ==================================
 *
 * The ledger cannot be its own witness. If a ledger write fails, there is by
 * definition no ledger row recording that it failed — so counting dropped writes
 * inside the ledger would count zero exactly when the number matters.
 *
 * Hence a process-local counter plus a structured log line. Any volume report that
 * cannot show this at zero for its window must label itself a FLOOR, not a total:
 *
 *     12,403 sends observed · 7 ledger writes lost      ← honest
 *     12,403 total sends                                ← not
 *
 * Process-local means it resets on restart and is per-container. That is a real
 * limitation and is why the counter is reported ALONGSIDE a window rather than
 * treated as a historical series.
 */

import { redactEmails } from '@/lib/privacy/redactEmails';

export type LedgerWritePhase = 'open' | 'settle';

let writeFailures = 0;

/** `email_ledger_write_failures_total`, process-local. */
export function ledgerWriteFailuresTotal(): number {
  return writeFailures;
}

export function resetLedgerWriteFailures(): void {
  writeFailures = 0;
}

/**
 * Record a dropped ledger write. Never throws — a failure to record a failure must
 * not become a third failure on the send path.
 */
export function recordLedgerWriteFailure(phase: LedgerWritePhase, err: unknown): void {
  writeFailures += 1;
  try {
    const message = err instanceof Error ? err.message : String(err);
    // Redacted: a database error can echo back the parameters it choked on, and
    // those parameters include a recipient domain and a fingerprint.
    console.error(
      `[MAIA/email] LEDGER_WRITE_FAILED phase=${phase} total=${writeFailures} error=${redactEmails(message)}`
    );
  } catch {
    // Deliberately empty: logging must not be able to throw here.
  }
}
