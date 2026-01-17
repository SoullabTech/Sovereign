/**
 * Executor Delegation Service
 *
 * Clean integration point between AIN committee deliberations and Agent Zero.
 * The committee decides, this service determines if execution is needed,
 * and delegates to the appropriate executor.
 *
 * Usage:
 *   import { shouldDelegate, delegateToExecutor } from './executorDelegationService';
 *
 *   if (shouldDelegate(deliberationResult, meta)) {
 *     const result = await delegateToExecutor(deliberationResult, meta);
 *     // Log result, attach to response
 *   }
 */

import { randomUUID } from 'crypto';
import { query } from '@/lib/db/postgres';
import { executeTask } from '@/lib/executors/executorAdapter';
import type {
  ExecutionTask,
  ExecutionResult,
  ExecutionTaskType,
  ExecutionRisk,
  DelegationDecision,
  ExecutorProvider,
} from '@/types/execution';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface DeliberationMeta {
  /** Deliberation ID from committee */
  deliberation_id?: string;

  /** Whether the deliberation requires tool execution */
  requires_tools?: boolean;

  /** Explicit actions to execute */
  actions?: string[];

  /** Execution-specific metadata */
  execution_type?: ExecutionTaskType;
  execution_risk?: ExecutionRisk;
  execution_title?: string;
  execution_instructions?: string;

  /** Context for execution */
  repoPath?: string;
  files?: string[];
  urls?: string[];

  /** Permission flags */
  allowNetwork?: boolean;
  allowShell?: boolean;
  allowWrites?: boolean;

  /** Traceability */
  decided_by?: string;
  session_id?: string;
  user_id?: string;

  /** Any other fields */
  [key: string]: unknown;
}

export interface DelegationResult {
  /** Whether delegation occurred */
  delegated: boolean;

  /** Delegation decision details */
  decision: DelegationDecision;

  /** Execution result (if delegated) */
  executionResult?: ExecutionResult;

  /** Task that was created (if delegated) */
  task?: ExecutionTask;

  /** Error if delegation failed */
  error?: string;
}

// ─── Decision Logic ────────────────────────────────────────────────────────────

/**
 * Determine if a deliberation result should be delegated to an executor.
 *
 * Rules (Phase 1 - keep it simple):
 * 1. Explicit `requires_tools: true` flag
 * 2. Non-empty `actions` array
 * 3. Execution-specific metadata present
 */
export function shouldDelegate(
  finalLabel: string,
  meta: DeliberationMeta
): DelegationDecision {
  // Rule 1: Explicit flag
  if (meta.requires_tools === true) {
    return {
      shouldDelegate: true,
      reason: 'Deliberation explicitly requires tool execution',
      suggestedProvider: 'agent_zero',
      suggestedRisk: meta.execution_risk || 'medium',
      extractedActions: meta.actions,
    };
  }

  // Rule 2: Actions array present and non-empty
  if (meta.actions && Array.isArray(meta.actions) && meta.actions.length > 0) {
    return {
      shouldDelegate: true,
      reason: `Deliberation includes ${meta.actions.length} action(s) to execute`,
      suggestedProvider: 'agent_zero',
      suggestedRisk: inferRiskFromActions(meta.actions),
      extractedActions: meta.actions,
    };
  }

  // Rule 3: Execution metadata present
  if (meta.execution_type || meta.execution_instructions) {
    return {
      shouldDelegate: true,
      reason: 'Deliberation includes explicit execution metadata',
      suggestedProvider: 'agent_zero',
      suggestedRisk: meta.execution_risk || 'medium',
      extractedActions: meta.execution_instructions
        ? [meta.execution_instructions]
        : undefined,
    };
  }

  // No delegation needed
  return {
    shouldDelegate: false,
    reason: 'No execution signals found in deliberation',
  };
}

/**
 * Infer risk level from action descriptions
 */
function inferRiskFromActions(actions: string[]): ExecutionRisk {
  const actionText = actions.join(' ').toLowerCase();

  // High risk patterns
  const highRiskPatterns = [
    'install',
    'npm install',
    'deploy',
    'delete',
    'rm ',
    'sudo',
    'chmod',
    'chown',
    'curl',
    'wget',
    'git push',
    'migrate',
    'drop table',
  ];

  if (highRiskPatterns.some((p) => actionText.includes(p))) {
    return 'high';
  }

  // Medium risk patterns
  const mediumRiskPatterns = [
    'write',
    'create',
    'update',
    'modify',
    'edit',
    'git commit',
    'save',
  ];

  if (mediumRiskPatterns.some((p) => actionText.includes(p))) {
    return 'medium';
  }

  // Default to low
  return 'low';
}

// ─── Task Builder ──────────────────────────────────────────────────────────────

/**
 * Build an ExecutionTask from deliberation metadata
 */
export function buildExecutionTask(
  finalLabel: string,
  meta: DeliberationMeta,
  decision: DelegationDecision
): ExecutionTask {
  const id = randomUUID();

  // Build instructions from available sources
  const instructions =
    meta.execution_instructions ||
    decision.extractedActions?.join('\n') ||
    `Execute the decision labeled: ${finalLabel}`;

  return {
    id,
    createdAt: new Date().toISOString(),

    // Task classification
    type: meta.execution_type || inferTaskType(instructions),
    risk: decision.suggestedRisk || meta.execution_risk || 'medium',

    // Human-readable info
    title: meta.execution_title || `AIN Execution: ${finalLabel}`,
    instructions,

    // Context
    repoPath: meta.repoPath,
    files: meta.files,
    urls: meta.urls,

    // Sovereignty controls (restrictive defaults)
    allowNetwork: Boolean(meta.allowNetwork),
    allowShell: Boolean(meta.allowShell),
    allowWrites: Boolean(meta.allowWrites),

    // Traceability
    requestedBy: meta.decided_by || 'committee',
    correlationId: meta.deliberation_id || meta.session_id,
    userId: meta.user_id,
    sessionId: meta.session_id,
  };
}

/**
 * Infer task type from instructions
 */
function inferTaskType(instructions: string): ExecutionTaskType {
  const text = instructions.toLowerCase();

  if (text.includes('search') || text.includes('research') || text.includes('web')) {
    return 'web_research';
  }
  if (text.includes('git') || text.includes('commit') || text.includes('code')) {
    return 'repo_change';
  }
  if (text.includes('run') || text.includes('execute') || text.includes('command')) {
    return 'run_command';
  }
  if (text.includes('file') || text.includes('read') || text.includes('write')) {
    return 'file_ops';
  }
  if (text.includes('test') || text.includes('spec')) {
    return 'test_execution';
  }
  if (text.includes('deploy') || text.includes('build')) {
    return 'deployment';
  }
  if (text.includes('migrate') || text.includes('database')) {
    return 'data_migration';
  }

  return 'other';
}

// ─── Main Delegation Function ──────────────────────────────────────────────────

/**
 * Delegate a deliberation to an executor if appropriate
 *
 * This is the main entry point for the delegation flow:
 * 1. Check if delegation is needed
 * 2. Build the execution task
 * 3. Execute via the appropriate provider
 * 4. Log the result to the database
 * 5. Return the result for attachment to response
 */
export async function delegateToExecutor(
  finalLabel: string,
  meta: DeliberationMeta,
  provider: ExecutorProvider = 'agent_zero'
): Promise<DelegationResult> {
  // Step 1: Check if we should delegate
  const decision = shouldDelegate(finalLabel, meta);

  if (!decision.shouldDelegate) {
    return {
      delegated: false,
      decision,
    };
  }

  // ─── TEST SHORT-CIRCUIT (one-shot) ───────────────────────────────────────────
  // If execution_type is "test", skip external executor and write a clean run row.
  // This proves the DB/UI pipeline end-to-end without needing Agent Zero running.
  // SAFETY: Only allowed when explicitly enabled AND not in production.
  const allowTestExecutor =
    process.env.AIN_ALLOW_TEST_EXECUTOR === '1' &&
    process.env.NODE_ENV !== 'production';

  if (allowTestExecutor && meta.execution_type === 'test') {
    const startedAt = Date.now();
    const testTaskId = randomUUID();

    await logExecutorRun({
      deliberationId: meta.deliberation_id,
      taskId: testTaskId,
      provider: 'test',
      taskType: 'test',
      risk: 'low',
      ok: true,
      summary: 'One-shot delegation test: hook fired and executor run logged successfully.',
      durationMs: Date.now() - startedAt,
      userId: meta.user_id,
    });

    console.log(
      `[Delegation] TEST MODE | deliberation=${meta.deliberation_id?.slice(0, 8) || 'N/A'}... | ` +
      `task=${testTaskId.slice(0, 8)}... | ok=true (short-circuit)`
    );

    return {
      delegated: true,
      decision,
      task: {
        id: testTaskId,
        createdAt: new Date().toISOString(),
        type: 'test' as any,
        risk: 'low',
        title: meta.execution_title || 'Test delegation',
        instructions: meta.execution_instructions || 'Test mode - no external execution',
      } as any,
      executionResult: {
        taskId: testTaskId,
        ok: true,
        summary: 'One-shot delegation test: hook fired and executor run logged successfully.',
        durationMs: Date.now() - startedAt,
      },
    };
  }
  // ─── END TEST SHORT-CIRCUIT ──────────────────────────────────────────────────

  // Step 2: Build the execution task
  const task = buildExecutionTask(finalLabel, meta, decision);

  console.log(
    `[Delegation] Delegating to ${provider} | ` +
    `deliberation=${meta.deliberation_id?.slice(0, 8) || 'N/A'}... | ` +
    `task=${task.id.slice(0, 8)}... | ` +
    `type=${task.type} | risk=${task.risk}`
  );

  try {
    // Step 3: Execute the task
    const executionResult = await executeTask(task, provider);

    // Step 4: Log to database
    await logExecutorRun({
      deliberationId: meta.deliberation_id,
      taskId: task.id,
      provider,
      taskType: task.type,
      risk: task.risk,
      ok: executionResult.ok,
      summary: executionResult.summary,
      durationMs: executionResult.durationMs,
      userId: meta.user_id,
      resultJson: executionResult,
    });

    console.log(
      `[Delegation] Completed | task=${task.id.slice(0, 8)}... | ` +
      `ok=${executionResult.ok} | duration=${executionResult.durationMs}ms`
    );

    return {
      delegated: true,
      decision,
      task,
      executionResult,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(
      `[Delegation] Failed | task=${task.id.slice(0, 8)}... | error=${errorMessage}`
    );

    // Log the failure
    await logExecutorRun({
      deliberationId: meta.deliberation_id,
      taskId: task.id,
      provider,
      taskType: task.type,
      risk: task.risk,
      ok: false,
      summary: `Delegation failed: ${errorMessage}`,
      userId: meta.user_id,
    });

    return {
      delegated: true,
      decision,
      task,
      error: errorMessage,
    };
  }
}

// ─── Database Logging ──────────────────────────────────────────────────────────

interface ExecutorLogInput {
  deliberationId?: string;
  taskId: string;
  provider: ExecutorProvider;
  taskType: ExecutionTaskType;
  risk: ExecutionRisk;
  ok: boolean;
  summary: string;
  durationMs?: number;
  userId?: string;
  resultJson?: ExecutionResult;
}

/**
 * Log an executor run to the database for audit and analysis
 */
async function logExecutorRun(input: ExecutorLogInput): Promise<void> {
  try {
    await query(
      `INSERT INTO ain_executor_runs (
        deliberation_id,
        task_id,
        provider,
        task_type,
        risk,
        ok,
        summary,
        duration_ms,
        user_id,
        result_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        input.deliberationId ?? null,
        input.taskId,
        input.provider,
        input.taskType,
        input.risk,
        input.ok,
        input.summary,
        input.durationMs ?? null,
        input.userId ?? null,
        input.resultJson ? JSON.stringify(input.resultJson) : null,
      ]
    );

    console.log(
      `[ExecutorLog] Persisted | task=${input.taskId.slice(0, 8)}... | ok=${input.ok}`
    );
  } catch (error) {
    // Log but don't fail the main flow
    console.error('[ExecutorLog] Failed to persist executor run:', error);
  }
}

// ─── Convenience Functions ─────────────────────────────────────────────────────

/**
 * Quick check if delegation is enabled (Agent Zero is configured)
 */
export function isDelegationEnabled(): boolean {
  const agentZeroUrl = process.env.AGENT_ZERO_URL;
  return Boolean(agentZeroUrl && agentZeroUrl.length > 0);
}

/**
 * Get executor statistics for a deliberation
 */
export async function getExecutorStats(deliberationId: string): Promise<{
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalDurationMs: number;
}> {
  const result = await query<{
    total_runs: string;
    successful_runs: string;
    failed_runs: string;
    total_duration_ms: string | null;
  }>(
    `SELECT
      COUNT(*) as total_runs,
      SUM(CASE WHEN ok THEN 1 ELSE 0 END) as successful_runs,
      SUM(CASE WHEN NOT ok THEN 1 ELSE 0 END) as failed_runs,
      SUM(duration_ms) as total_duration_ms
    FROM ain_executor_runs
    WHERE deliberation_id = $1`,
    [deliberationId]
  );

  const row = result.rows[0] || {};
  return {
    totalRuns: parseInt(row.total_runs || '0', 10),
    successfulRuns: parseInt(row.successful_runs || '0', 10),
    failedRuns: parseInt(row.failed_runs || '0', 10),
    totalDurationMs: parseInt(row.total_duration_ms || '0', 10),
  };
}
