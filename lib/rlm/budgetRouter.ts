/**
 * RCN Budget Router
 *
 * Intelligent budget selection for Recursive Corpus Navigator.
 * Picks optimal budget presets based on intent, corpus type, channel,
 * and previous run outcomes.
 */

import type { BudgetLimits, BudgetUsage, RecursiveResult } from './client';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type CorpusType = 'general' | 'docs' | 'transcript' | 'codebase' | 'vault';
export type RcnMode = 'quick' | 'standard' | 'deep';

export type RcnIntent =
  | 'chat'
  | 'summarize'
  | 'compare'
  | 'find_canonical'
  | 'verify'
  | 'debug'
  | 'refactor'
  | 'audit';

export type RcnChannel = 'voice' | 'text';

export interface RcnBudgetContext {
  corpusType: CorpusType;
  intent: RcnIntent;
  channel: RcnChannel;
  userAskedThorough?: boolean; // "be thorough", "verify", "cite", etc.
  lastResult?: Pick<RecursiveResult, 'confidence' | 'completedNormally' | 'budgetUsage'>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Budget Presets
// ═══════════════════════════════════════════════════════════════════════════════

export const RCN_BUDGETS: Record<RcnMode, BudgetLimits> = {
  quick: {
    maxRecursions: 3,
    maxToolCalls: 10,
    maxChunksRead: 8,
    timeoutMs: 12_000,
    maxTokensPerCall: 2048,
  },
  standard: {
    maxRecursions: 5,
    maxToolCalls: 18,
    maxChunksRead: 20,
    timeoutMs: 30_000,
    maxTokensPerCall: 4096,
  },
  deep: {
    maxRecursions: 8,
    maxToolCalls: 30,
    maxChunksRead: 45,
    timeoutMs: 90_000,
    maxTokensPerCall: 4096,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function applyCorpusTuning(base: BudgetLimits, corpusType: CorpusType): BudgetLimits {
  const b = { ...base };

  // Docs/Commons: allow more reads (breadth matters)
  if (corpusType === 'docs') {
    b.maxChunksRead = clamp((b.maxChunksRead ?? 0) + 2, 1, 100);
  }

  // Transcripts: fewer reads, more navigation/tooling
  if (corpusType === 'transcript') {
    b.maxChunksRead = clamp(Math.floor((b.maxChunksRead ?? 0) * 0.8), 1, 100);
    b.maxToolCalls = clamp((b.maxToolCalls ?? 0) + 2, 1, 50);
  }

  // Codebase: fewer reads (dense), more toolcalls (search/trace)
  if (corpusType === 'codebase') {
    b.maxChunksRead = clamp(Math.floor((b.maxChunksRead ?? 0) * 0.75), 1, 100);
    b.maxToolCalls = clamp((b.maxToolCalls ?? 0) + 6, 1, 50);
    b.timeoutMs = clamp((b.timeoutMs ?? 0) + 10_000, 1_000, 300_000);
  }

  // Vault: balance between search and read, allow more time for file I/O
  if (corpusType === 'vault') {
    b.maxChunksRead = clamp((b.maxChunksRead ?? 0) + 5, 1, 100);  // Vault files can be read efficiently
    b.maxToolCalls = clamp((b.maxToolCalls ?? 0) + 4, 1, 50);     // Search + read combos
    b.timeoutMs = clamp((b.timeoutMs ?? 0) + 15_000, 1_000, 300_000); // File I/O overhead
  }

  return b;
}

function intentToBaseMode(intent: RcnIntent): RcnMode {
  switch (intent) {
    case 'chat':
      return 'quick';
    case 'summarize':
      return 'standard';
    case 'compare':
      return 'standard';
    case 'find_canonical':
      return 'deep';
    case 'verify':
      return 'deep';
    case 'debug':
      return 'standard';
    case 'refactor':
      return 'deep';
    case 'audit':
      return 'deep';
    default:
      return 'standard';
  }
}

function shouldEscalate(
  from: RcnMode,
  last?: { confidence: number; completedNormally: boolean; budgetUsage: BudgetUsage },
  ctx?: { userAskedThorough?: boolean; channel?: RcnChannel }
): RcnMode | null {
  if (!last) return null;

  // Never auto-escalate in voice: keep latency predictable
  if (ctx?.channel === 'voice') return null;

  const { confidence, completedNormally, budgetUsage } = last;
  // Treat forcedSubmitUsed as "hit the wall" even if we got an answer
  const exhausted =
    !completedNormally ||
    !!budgetUsage.budgetExhaustedReason ||
    !!budgetUsage.forcedSubmitUsed ||
    budgetUsage.elapsedMs >= budgetUsage.timeoutMs;

  const nearBudget =
    budgetUsage.toolCallsLimit > 0 &&
    budgetUsage.toolCallsUsed / budgetUsage.toolCallsLimit >= 0.7;

  if (from === 'quick') {
    if (exhausted || confidence < 0.6 || nearBudget) return 'standard';
  }

  if (from === 'standard') {
    const asked = !!ctx?.userAskedThorough;
    if (exhausted) return 'deep';
    if (asked && confidence < 0.7) return 'deep';
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Router
// ═══════════════════════════════════════════════════════════════════════════════

export interface PickBudgetResult {
  mode: RcnMode;
  budget: BudgetLimits;
  rationale: string[];
}

/**
 * Pick optimal RCN budget based on context.
 *
 * Takes into account:
 * - Intent (chat vs audit vs verify)
 * - Channel (voice forces quick for latency)
 * - Corpus type (docs need breadth, code needs depth)
 * - User signals ("be thorough", "cite sources")
 * - Previous run outcome (auto-escalate on failure)
 *
 * @example
 * ```typescript
 * const { mode, budget, rationale } = pickRcnBudget({
 *   corpusType: 'docs',
 *   intent: 'compare',
 *   channel: 'text',
 *   userAskedThorough: false,
 * });
 *
 * const result = await rcnClient.processCommons(prompt, docs, budget);
 * console.log('[RCN]', { mode, rationale, conf: result.confidence });
 * ```
 */
export function pickRcnBudget(ctx: RcnBudgetContext): PickBudgetResult {
  const rationale: string[] = [];

  // 1) Base mode from intent
  let mode: RcnMode = intentToBaseMode(ctx.intent);
  rationale.push(`intent:${ctx.intent}→${mode}`);

  // 2) Voice channel guardrail
  if (ctx.channel === 'voice' && mode !== 'quick') {
    mode = 'quick';
    rationale.push('channel:voice→force quick');
  }

  // 3) If user explicitly asked for thoroughness, bump one step (except voice)
  if (ctx.userAskedThorough && ctx.channel !== 'voice') {
    if (mode === 'quick') {
      mode = 'standard';
      rationale.push('userAskedThorough→bump quick→standard');
    } else if (mode === 'standard') {
      mode = 'deep';
      rationale.push('userAskedThorough→bump standard→deep');
    }
  }

  // 4) Start from preset + corpus tuning
  let budget = applyCorpusTuning(RCN_BUDGETS[mode], ctx.corpusType);
  rationale.push(`corpusType:${ctx.corpusType}→tuned`);

  // 5) Auto-escalate based on last run outcome
  if (ctx.lastResult) {
    const next = shouldEscalate(
      mode,
      {
        confidence: ctx.lastResult.confidence,
        completedNormally: ctx.lastResult.completedNormally,
        budgetUsage: ctx.lastResult.budgetUsage,
      },
      { userAskedThorough: ctx.userAskedThorough, channel: ctx.channel }
    );

    if (next && next !== mode) {
      const escalated = applyCorpusTuning(RCN_BUDGETS[next], ctx.corpusType);
      rationale.push(`autoEscalate:${mode}→${next}`);
      mode = next;
      budget = escalated;
    } else {
      rationale.push('autoEscalate:none');
    }
  }

  return { mode, budget, rationale };
}
