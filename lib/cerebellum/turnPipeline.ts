/**
 * Turn Pipeline — The stage orchestrator of MAIA's cerebellum.
 *
 * Creates and manages the TurnContext that flows through every stage
 * of a conversation turn. The route becomes a thin orchestrator;
 * the pipeline handles timing, staging, and budget enforcement.
 *
 * Stages:
 *   INGEST -> LOAD -> CORTEX -> SPEAK -> COMMIT -> EMIT -> RESPOND -> DONE
 *
 * Each stage has clear ownership and fencing rules.
 * See lib/cerebellum/types.ts for the full stage contract.
 */

import crypto from 'crypto';
import type { TurnContext, CerebellumStage, ConsentScope, StageTiming } from './types';

function randId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Create a TurnContext at the start of a conversation turn.
 *
 * @param params.isSanctuary - MUST be resolved before calling this.
 *        This flag gates ALL writes for the entire turn.
 * @param params.budgetMs - Time budget for optional emissions (default 120ms).
 *        This is NOT the response timeout — just the emission window.
 */
export function createTurnContext(params: {
  memberId: string;
  sessionId?: string;
  turnId: string;
  isSanctuary: boolean;
  defaultConsentScope?: ConsentScope;
  budgetMs?: number;
}): TurnContext {
  const startedAtMs = Date.now();

  return {
    requestId: randId('req'),
    turnId: params.turnId.trim(),
    memberId: params.memberId.trim(),
    sessionId: params.sessionId?.trim(),

    isSanctuary: params.isSanctuary,
    defaultConsentScope: params.defaultConsentScope ?? 'private',

    startedAtMs,
    budgetMs: params.budgetMs ?? 120, // emissions budget only
    stage: 'INGEST' as CerebellumStage,

    stageTimings: [{
      stage: 'INGEST' as CerebellumStage,
      enteredAtMs: startedAtMs,
    }],

    idemSeed: `${params.memberId.trim()}|${(params.sessionId ?? '').trim()}|${params.turnId.trim()}`,
  };
}

/**
 * Advance the turn to a new stage.
 * Stages must advance forward (INGEST -> LOAD -> ... -> DONE).
 * This is advisory, not enforced — but log violations in dev.
 *
 * Also records per-stage timing: closes the previous stage's duration
 * and opens a new timing entry. Use getStageTimings() to read them.
 */
export function setStage(ctx: TurnContext, stage: CerebellumStage): void {
  const now = Date.now();

  // Close the previous stage's timing
  const prev = ctx.stageTimings[ctx.stageTimings.length - 1];
  if (prev && prev.durationMs === undefined) {
    prev.durationMs = now - prev.enteredAtMs;
  }

  // Open the new stage
  ctx.stage = stage;
  ctx.stageTimings.push({ stage, enteredAtMs: now });
}

/**
 * Get the per-stage timing breakdown.
 * Call after DONE stage to get the full picture.
 * Returns: [{ stage: 'INGEST', durationMs: 3 }, { stage: 'LOAD', durationMs: 42 }, ...]
 */
export function getStageTimings(ctx: TurnContext): Array<{ stage: string; durationMs: number }> {
  return ctx.stageTimings
    .filter((t): t is StageTiming & { durationMs: number } => t.durationMs !== undefined)
    .map(t => ({ stage: t.stage, durationMs: t.durationMs }));
}

/**
 * How much time remains in the emission budget.
 * Returns 0 if budget is exhausted.
 */
export function remainingBudgetMs(ctx: TurnContext): number {
  const elapsed = Date.now() - ctx.startedAtMs;
  return Math.max(0, ctx.budgetMs - elapsed);
}

/**
 * Should we skip optional emissions?
 * True if the emission time budget is exhausted.
 * Use this to gracefully degrade: core writes happen,
 * optional signals get dropped if we're over budget.
 */
export function shouldSkipOptional(ctx: TurnContext): boolean {
  return remainingBudgetMs(ctx) <= 0;
}
