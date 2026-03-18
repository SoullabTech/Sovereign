/**
 * Directive Evaluator
 *
 * Runs all directive rules against the current ledger snapshot.
 * Inserts new directives for triggered rules (one per rule per observation window).
 * Updates condition_cleared_at when a triggered condition is no longer firing.
 * Never auto-resolves — human acknowledgment is always required.
 *
 * Design principles:
 * - Idempotent: safe to run multiple times for the same period
 * - Graceful: per-rule errors are caught and logged; the run continues
 * - Non-blocking: no throws to caller; returns a result summary
 */

import { query } from '../db/postgres';
import { DIRECTIVE_RULES, LedgerSnapshot } from './directiveRules';

export interface DirectiveRunResult {
  triggered: string[];
  cleared: string[];
  skipped: string[];
  errors: string[];
}

// ---------------------------------------------------------------------------
// Internal: load a ledger snapshot for a given period_start value
// ---------------------------------------------------------------------------
async function loadSnapshot(periodStart: string): Promise<LedgerSnapshot> {
  const result = await query(
    `SELECT metric_key, metric_value, metric_payload, direction
       FROM system_research_ledger
      WHERE period_type = 'daily'
        AND period_start = $1`,
    [periodStart]
  );

  const snapshot: LedgerSnapshot = {};
  for (const row of result.rows as Array<{
    metric_key: string;
    metric_value: string | null;
    metric_payload: Record<string, unknown> | null;
    direction: string | null;
  }>) {
    const raw = row.metric_value;
    const metricValue = raw === null ? null : parseFloat(raw);
    snapshot[row.metric_key] = {
      metricValue: isNaN(metricValue as number) ? null : metricValue,
      metricPayload: row.metric_payload ?? {},
      direction: row.direction,
    };
  }
  return snapshot;
}

// ---------------------------------------------------------------------------
// Internal: find the most recent prior period_start before the given date
// ---------------------------------------------------------------------------
async function loadPriorPeriodStart(periodStart: string): Promise<string | null> {
  const result = await query(
    `SELECT MAX(period_start) AS prior
       FROM system_research_ledger
      WHERE period_type = 'daily'
        AND period_start < $1`,
    [periodStart]
  );
  const prior = (result.rows[0] as { prior: string | null } | undefined)?.prior ?? null;
  return prior;
}

// ---------------------------------------------------------------------------
// Internal: check whether an open/acknowledged directive already exists
// for this rule + observation window combination
// ---------------------------------------------------------------------------
async function findOpenDirective(
  directiveKey: string,
  observationPeriodStart: string
): Promise<{ id: string; condition_cleared_at: string | null } | null> {
  const result = await query(
    `SELECT id, condition_cleared_at
       FROM system_directives
      WHERE directive_key = $1
        AND observation_period_start = $2
        AND status IN ('open', 'acknowledged')
      LIMIT 1`,
    [directiveKey, observationPeriodStart]
  );
  const row = result.rows[0] as
    | { id: string; condition_cleared_at: string | null }
    | undefined;
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Internal: find any open directive for this key that has not yet been cleared
// (used for cross-window clearing — condition may have been open in a prior window)
// ---------------------------------------------------------------------------
async function findUnclearedOpenDirective(
  directiveKey: string
): Promise<{ id: string } | null> {
  const result = await query(
    `SELECT id
       FROM system_directives
      WHERE directive_key = $1
        AND status IN ('open', 'acknowledged')
        AND condition_cleared_at IS NULL
      LIMIT 1`,
    [directiveKey]
  );
  const row = result.rows[0] as { id: string } | undefined;
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Public: evaluate all directive rules for the given period
// ---------------------------------------------------------------------------
export async function evaluateSystemDirectives(
  periodStart: string
): Promise<DirectiveRunResult> {
  const result: DirectiveRunResult = {
    triggered: [],
    cleared: [],
    skipped: [],
    errors: [],
  };

  // 1. Load current snapshot
  let current: LedgerSnapshot;
  try {
    current = await loadSnapshot(periodStart);
  } catch (err) {
    const msg = `[Directives] Failed to load current snapshot for ${periodStart}: ${
      err instanceof Error ? err.message : String(err)
    }`;
    console.error(msg);
    result.errors.push(msg);
    return result;
  }

  const metricCount = Object.keys(current).length;
  console.log(
    `[Directives] Loaded current snapshot — period=${periodStart} metrics=${metricCount}`
  );

  // 2. Load prior snapshot (best-effort; null is acceptable)
  let prior: LedgerSnapshot | null = null;
  try {
    const priorPeriodStart = await loadPriorPeriodStart(periodStart);
    if (priorPeriodStart) {
      prior = await loadSnapshot(priorPeriodStart);
      console.log(
        `[Directives] Loaded prior snapshot — period=${priorPeriodStart} metrics=${Object.keys(prior).length}`
      );
    } else {
      console.log('[Directives] No prior period found — rules will operate without prior data');
    }
  } catch (err) {
    console.warn(
      `[Directives] Could not load prior snapshot (continuing without): ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  // 3. Evaluate each rule
  for (const rule of DIRECTIVE_RULES) {
    try {
      const candidate = rule.evaluate(current, prior);

      if (candidate !== null) {
        // --- Condition triggered ---
        const existing = await findOpenDirective(candidate.directiveKey, periodStart);

        if (existing) {
          // Already open for this window — skip insert
          result.skipped.push(rule.ruleKey);
          console.log(
            `[Directives] SKIP ${rule.ruleKey} — directive already open for period ${periodStart}`
          );
        } else {
          // Insert new directive
          await query(
            `INSERT INTO system_directives
               (directive_key, signal_type, observation_period_start,
                title, summary, evidence_payload, recommendation,
                priority, status)
             VALUES ($1, $2, $3::timestamptz, $4, $5, $6::jsonb, $7, $8, 'open')`,
            [
              candidate.directiveKey,
              candidate.signalType,
              periodStart,
              candidate.title,
              candidate.summary,
              JSON.stringify(candidate.evidencePayload),
              candidate.recommendation,
              candidate.priority,
            ]
          );
          result.triggered.push(rule.ruleKey);
          console.log(
            `[Directives] TRIGGERED ${rule.ruleKey} (${candidate.priority}) — inserted directive`
          );
        }
      } else {
        // --- Condition not triggered ---
        // Mark condition_cleared_at on any previously-open directive that has not yet been cleared
        const uncleared = await findUnclearedOpenDirective(rule.ruleKey);
        if (uncleared) {
          await query(
            `UPDATE system_directives
                SET condition_cleared_at = now()
              WHERE id = $1`,
            [uncleared.id]
          );
          result.cleared.push(rule.ruleKey);
          console.log(
            `[Directives] CLEARED ${rule.ruleKey} — condition no longer firing; human resolution still required`
          );
        }
      }
    } catch (err) {
      const msg = `[Directives] Rule ${rule.ruleKey} error: ${
        err instanceof Error ? err.message : String(err)
      }`;
      console.warn(msg);
      result.errors.push(msg);
    }
  }

  console.log(
    `[Directives] Done — triggered=${result.triggered.length} cleared=${result.cleared.length} ` +
    `skipped=${result.skipped.length} errors=${result.errors.length}`
  );

  return result;
}
