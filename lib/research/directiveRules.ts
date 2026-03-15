/**
 * Directive Rules — v1 (3 rules)
 *
 * Deterministic rules that evaluate the current ledger snapshot and return
 * a directive candidate when a condition is triggered.
 *
 * Design principles:
 * - Pure functions — no DB access, no side effects
 * - Null return = condition not met (clear)
 * - Candidate return = condition triggered (raise or maintain directive)
 *
 * v1 rules:
 *   1. ain_shape_degraded       — pass rate 0% with volume, or WoW drop > 15pp
 *   2. error_rate_breach        — oracle error rate > 20% with >= 5 turns
 *   3. pattern_accumulation_stall — no new pattern keys in current + prior period
 */

export interface LedgerSnapshot {
  [metricKey: string]: {
    metricValue: number | null;
    metricPayload: Record<string, unknown>;
    direction: string | null;
  };
}

export interface DirectiveCandidate {
  directiveKey: string;
  signalType: string;
  title: string;
  summary: string;
  evidencePayload: Record<string, unknown>;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DirectiveRule {
  ruleKey: string;
  evaluate: (
    current: LedgerSnapshot,
    prior: LedgerSnapshot | null
  ) => DirectiveCandidate | null;
}

// ---------------------------------------------------------------------------
// Helper: safely extract a number from a payload field
// ---------------------------------------------------------------------------
function numField(payload: Record<string, unknown>, key: string): number | null {
  const v = payload[key];
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const parsed = parseFloat(v);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Rule 1: ain_shape_degraded
// Triggers when pass rate is 0% with >= 5 evaluated turns,
// or when the week-over-week drop exceeds 15 percentage points.
// ---------------------------------------------------------------------------
const ainShapeDegraded: DirectiveRule = {
  ruleKey: 'ain_shape_degraded',
  evaluate(current, prior) {
    const row = current['ain_shape_pass_rate'];
    if (!row) return null;

    const passRate = row.metricValue;
    const payload  = row.metricPayload;
    const total    = numField(payload, 'total') ?? 0;

    const zeroWithVolume = passRate === 0 && total >= 5;

    const priorRow   = prior?.['ain_shape_pass_rate'];
    const priorValue = priorRow?.metricValue ?? null;
    const wowDrop    =
      passRate !== null &&
      priorValue !== null &&
      priorValue - passRate > 15;

    if (!zeroWithVolume && !wowDrop) return null;

    const nextStepRate   = numField(payload, 'next_step_rate') ?? 0;
    const permissionRate = numField(payload, 'permission_rate') ?? 0;
    const bridgeRate     = numField(payload, 'bridge_rate') ?? 0;
    const menuModeRate   = numField(payload, 'menu_mode_rate') ?? 0;
    const mirrorRate     = numField(payload, 'mirror_rate') ?? 0;

    const dragAnchors: string[] = [];
    if (nextStepRate === 0) dragAnchors.push('next_step (0%)');
    if (permissionRate < 20) dragAnchors.push(`permission (${permissionRate}%)`);
    if (bridgeRate < 20) dragAnchors.push(`bridge (${bridgeRate}%)`);

    const summaryParts: string[] = [];
    if (zeroWithVolume) {
      summaryParts.push(`Pass rate is 0% across ${total} evaluated turns.`);
    }
    if (wowDrop) {
      summaryParts.push(
        `Week-over-week drop of ${((priorValue ?? 0) - (passRate ?? 0)).toFixed(1)} percentage points (${priorValue}% → ${passRate}%).`
      );
    }
    if (dragAnchors.length) {
      summaryParts.push(`Primary drag anchors: ${dragAnchors.join(', ')}.`);
    }
    summaryParts.push(
      `Component rates — next_step: ${nextStepRate}%, permission: ${permissionRate}%, bridge: ${bridgeRate}%, menu_mode: ${menuModeRate}%, mirror: ${mirrorRate}%.`
    );

    return {
      directiveKey: 'ain_shape_degraded',
      signalType: 'ain_shape_quality',
      title: 'AIN Shape Pass Rate Critical',
      summary: summaryParts.join(' '),
      evidencePayload: {
        pass_rate: passRate,
        total_turns: total,
        next_step_rate: nextStepRate,
        permission_rate: permissionRate,
        bridge_rate: bridgeRate,
        menu_mode_rate: menuModeRate,
        mirror_rate: mirrorRate,
        prior_pass_rate: priorValue,
        trigger: zeroWithVolume ? 'zero_with_volume' : 'wow_drop',
      },
      recommendation:
        'Review oracle response shape. next_step and permission are the primary drag anchors. Check buildSacredAttendingPrompt and maiaService shape evaluator.',
      priority: 'high',
    };
  },
};

// ---------------------------------------------------------------------------
// Rule 2: error_rate_breach
// Triggers when oracle error rate exceeds 20% with at least 5 turns in the period.
// Minimum turn threshold prevents spurious alerts during low-traffic periods.
// ---------------------------------------------------------------------------
const errorRateBreach: DirectiveRule = {
  ruleKey: 'error_rate_breach',
  evaluate(current) {
    const row = current['total_oracle_turns'];
    if (!row) return null;

    const payload   = row.metricPayload;
    const total     = numField(payload, 'total') ?? 0;
    const errorRate = numField(payload, 'error_rate') ?? 0;

    // Require >= 5 turns to avoid false positives from single-turn errors
    if (errorRate <= 20 || total < 5) return null;

    const errorCount   = numField(payload, 'error_count') ?? 0;
    const successCount = numField(payload, 'success_count') ?? 0;

    return {
      directiveKey: 'error_rate_breach',
      signalType: 'system_health',
      title: 'Oracle Error Rate Elevated',
      summary:
        `${errorRate.toFixed(1)}% of oracle turns are failing ` +
        `(${errorCount} errors out of ${total} total turns, ${successCount} succeeded).`,
      evidencePayload: {
        total_turns: total,
        error_count: errorCount,
        error_rate: errorRate,
        success_count: successCount,
      },
      recommendation:
        'Check oracle route logs for the period. Likely causes: Anthropic API errors, DB connection failures, or auth issues. Inspect docker logs maia-sovereign.',
      priority: 'high',
    };
  },
};

// ---------------------------------------------------------------------------
// Rule 3: pattern_accumulation_stall
// Triggers when both the current and prior periods show zero new pattern keys.
// Requires that both periods exist (prior null → insufficient_data, no trigger).
// Full 7-day oracle-activity guard is deferred to v1.1.
// ---------------------------------------------------------------------------
const patternAccumulationStall: DirectiveRule = {
  ruleKey: 'pattern_accumulation_stall',
  evaluate(current, prior) {
    const row      = current['pattern_ledger_growth'];
    const priorRow = prior?.['pattern_ledger_growth'];

    if (!row) return null;
    // Require prior data — without it we cannot distinguish stall from first run
    if (!priorRow) return null;

    const currentValue = row.metricValue ?? 0;
    const priorValue   = priorRow.metricValue ?? 0;

    // Both periods must show zero growth to trigger
    if (currentValue !== 0 || priorValue !== 0) return null;

    return {
      directiveKey: 'pattern_accumulation_stall',
      signalType: 'memory_health',
      title: 'Pattern Ledger Not Growing',
      summary:
        'No new canonical pattern keys have been written to the ledger across the current and prior periods. ' +
        'The pattern recognition and write path may be idle or failing silently.',
      evidencePayload: {
        current_new_keys: currentValue,
        prior_new_keys: priorValue,
        note: 'Full 7-day oracle-activity guard deferred to v1.1 — current detection uses two-period proxy.',
      },
      recommendation:
        'Verify that storeSessionInsights is being called for CORE/DEEP turns and that upsertPatternLedger is firing. Check for DB connection errors in oracle logs.',
      priority: 'medium',
    };
  },
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
export const DIRECTIVE_RULES: DirectiveRule[] = [
  ainShapeDegraded,
  errorRateBreach,
  patternAccumulationStall,
];
