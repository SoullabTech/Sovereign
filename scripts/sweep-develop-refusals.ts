#!/usr/bin/env npx tsx
/**
 * WS-DEVELOP-REFUSAL-TRUTH-OBS-01 · R-3 — retention entrypoint.
 *
 * Deliberately three lines. All behaviour, and every falsifier, lives in
 * `runSweep()`; a script body that cannot be imported cannot be tested.
 *
 * Schedule: host cron, hourly at a fixed UTC minute.
 * See docs/ops/DEVELOP_REFUSAL_RETENTION.md.
 */
import { runSweep } from '../lib/manuscript/developmentalReading/sweepRefusalRecords';

runSweep().then((code) => process.exit(code));
