/**
 * Executor Adapter
 *
 * Pluggable transport layer for delegating tasks to external executors.
 * Phase 1: Agent Zero HTTP bridge
 * Future: A2A protocol, MCP tools, local shell
 *
 * This adapter provides a unified interface for task execution while
 * maintaining sovereignty controls and audit logging.
 */

import type {
  ExecutionTask,
  ExecutionResult,
  ExecutorProvider,
} from '@/types/execution';
import { agentZeroExecutor } from './providers/agentZeroExecutor';

// ─── Provider Registry ─────────────────────────────────────────────────────────

type ExecutorFunction = (task: ExecutionTask) => Promise<ExecutionResult>;

const providers: Record<ExecutorProvider, ExecutorFunction | null> = {
  agent_zero: agentZeroExecutor,
  local_shell: null,  // Future: direct shell execution
  mcp_tool: null,     // Future: MCP tool invocation
  a2a_agent: null,    // Future: A2A protocol
  test: null,         // Internal test executor (handled separately)
};

// ─── Main Execute Function ─────────────────────────────────────────────────────

/**
 * Execute a task using the specified provider
 *
 * @param task - The execution task to run
 * @param provider - The executor provider to use (default: agent_zero)
 * @returns Execution result with success/failure and artifacts
 */
export async function executeTask(
  task: ExecutionTask,
  provider: ExecutorProvider = 'agent_zero'
): Promise<ExecutionResult> {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  // Validate provider
  const executorFn = providers[provider];
  if (!executorFn) {
    return {
      taskId: task.id,
      ok: false,
      summary: `Executor provider '${provider}' is not available or not implemented`,
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      provider,
      errorCode: 'PROVIDER_NOT_AVAILABLE',
      errorMessage: `Provider '${provider}' is not registered or implemented`,
      retryable: false,
    };
  }

  // Log execution start
  console.log(
    `[Executor] Starting task | id=${task.id.slice(0, 8)}... ` +
    `| type=${task.type} | risk=${task.risk} | provider=${provider}`
  );

  try {
    // Execute the task
    const result = await executorFn(task);

    // Enhance result with timing
    const finishedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    const enhancedResult: ExecutionResult = {
      ...result,
      startedAt,
      finishedAt,
      durationMs,
      provider,
    };

    // Log execution completion
    console.log(
      `[Executor] Task completed | id=${task.id.slice(0, 8)}... ` +
      `| ok=${result.ok} | duration=${durationMs}ms`
    );

    return enhancedResult;
  } catch (error: unknown) {
    const finishedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(
      `[Executor] Task failed | id=${task.id.slice(0, 8)}... ` +
      `| error=${errorMessage}`
    );

    return {
      taskId: task.id,
      ok: false,
      summary: `Execution failed: ${errorMessage}`,
      startedAt,
      finishedAt,
      durationMs,
      provider,
      errorCode: 'EXECUTION_ERROR',
      errorMessage,
      retryable: true,
    };
  }
}

// ─── Provider Health Check ─────────────────────────────────────────────────────

/**
 * Check if a provider is available and healthy
 */
export async function checkProviderHealth(
  provider: ExecutorProvider
): Promise<{
  available: boolean;
  healthy: boolean;
  message: string;
}> {
  const executorFn = providers[provider];

  if (!executorFn) {
    return {
      available: false,
      healthy: false,
      message: `Provider '${provider}' is not implemented`,
    };
  }

  // For Agent Zero, we could do a health check ping
  if (provider === 'agent_zero') {
    const agentZeroUrl = process.env.AGENT_ZERO_URL || 'http://127.0.0.1:9090';
    try {
      const res = await fetch(`${agentZeroUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return {
        available: true,
        healthy: res.ok,
        message: res.ok ? 'Agent Zero is healthy' : `Agent Zero returned ${res.status}`,
      };
    } catch {
      return {
        available: true,
        healthy: false,
        message: 'Agent Zero is not reachable',
      };
    }
  }

  return {
    available: true,
    healthy: true,
    message: `Provider '${provider}' is available`,
  };
}

// ─── List Available Providers ──────────────────────────────────────────────────

/**
 * Get list of registered providers and their availability
 */
export function listProviders(): Array<{
  name: ExecutorProvider;
  implemented: boolean;
}> {
  return Object.entries(providers).map(([name, fn]) => ({
    name: name as ExecutorProvider,
    implemented: fn !== null,
  }));
}
