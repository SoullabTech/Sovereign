/**
 * Agent Zero Executor Provider
 *
 * HTTP bridge to Agent Zero autonomous agent framework.
 * Sovereignty-first design with restrictive defaults.
 *
 * Agent Zero provides:
 * - Hierarchical multi-agent task execution
 * - Persistent memory across sessions
 * - Full OS access within Docker container
 * - Code execution and web browsing
 *
 * This provider implements a generic HTTP interface that can adapt
 * to Agent Zero's actual API as it evolves.
 */

import type { ExecutionTask, ExecutionResult } from '@/types/execution';

// ─── Configuration ─────────────────────────────────────────────────────────────

const AGENT_ZERO_URL = process.env.AGENT_ZERO_URL || 'http://127.0.0.1:9090';
const AGENT_ZERO_TOKEN = process.env.AGENT_ZERO_TOKEN || '';
const AGENT_ZERO_TIMEOUT = parseInt(process.env.AGENT_ZERO_TIMEOUT || '60000', 10);

// ─── Request/Response Types ────────────────────────────────────────────────────

interface AgentZeroRequest {
  /** The task to execute */
  task: ExecutionTask;

  /** Sovereignty constraints */
  constraints: {
    allowNetwork: boolean;
    allowShell: boolean;
    allowWrites: boolean;
    timeoutMs: number;
  };

  /** Optional context for Agent Zero's memory */
  context?: {
    sessionId?: string;
    previousTasks?: string[];
    correlationId?: string;
  };
}

interface AgentZeroResponse {
  /** Whether the task succeeded */
  ok?: boolean;
  success?: boolean;

  /** Summary of what happened */
  summary?: string;
  message?: string;

  /** Command outputs */
  stdout?: string;
  stderr?: string;

  /** File changes */
  patches?: Array<{
    file: string;
    diff: string;
  }>;

  /** Files modified */
  files_modified?: string[];

  /** Web research results */
  web_findings?: Array<{
    url: string;
    title: string;
    summary: string;
  }>;

  /** Error information */
  error?: string;
  error_code?: string;

  /** Raw execution log */
  log?: string;

  /** Any other fields */
  [key: string]: unknown;
}

// ─── Main Executor Function ────────────────────────────────────────────────────

/**
 * Execute a task via Agent Zero HTTP API
 *
 * Implements sovereignty-first defaults:
 * - Network access: off by default
 * - Shell access: off by default
 * - Write access: off by default
 *
 * All permissions must be explicitly granted in the task.
 */
export async function agentZeroExecutor(
  task: ExecutionTask
): Promise<ExecutionResult> {
  // Build request with sovereignty defaults
  const request: AgentZeroRequest = {
    task,
    constraints: {
      allowNetwork: task.allowNetwork ?? false,
      allowShell: task.allowShell ?? false,
      allowWrites: task.allowWrites ?? false,
      timeoutMs: task.timeoutMs ?? AGENT_ZERO_TIMEOUT,
    },
    context: {
      sessionId: task.sessionId,
      correlationId: task.correlationId,
    },
  };

  // Log the request (redacting sensitive info)
  console.log(
    `[AgentZero] Sending task | id=${task.id.slice(0, 8)}... ` +
    `| type=${task.type} | constraints=${JSON.stringify(request.constraints)}`
  );

  try {
    // Make the request
    const response = await fetch(`${AGENT_ZERO_URL}/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AGENT_ZERO_TOKEN
          ? { Authorization: `Bearer ${AGENT_ZERO_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(request.constraints.timeoutMs),
    });

    // Parse response
    const json: AgentZeroResponse | null = await response.json().catch(() => null);

    // Handle non-OK HTTP response
    if (!response.ok) {
      return {
        taskId: task.id,
        ok: false,
        summary: `Agent Zero request failed (HTTP ${response.status})`,
        errorCode: `HTTP_${response.status}`,
        errorMessage: json?.error || json?.message || `HTTP ${response.status}`,
        retryable: response.status >= 500,
        raw: json ?? { status: response.status },
      };
    }

    // Handle null response
    if (!json) {
      return {
        taskId: task.id,
        ok: false,
        summary: 'Agent Zero returned empty response',
        errorCode: 'EMPTY_RESPONSE',
        errorMessage: 'The executor returned an empty or unparseable response',
        retryable: true,
      };
    }

    // Map Agent Zero response to our ExecutionResult
    const ok = json.ok ?? json.success ?? true;
    const summary = json.summary ?? json.message ?? 'Executed via Agent Zero';

    return {
      taskId: task.id,
      ok,
      summary,

      // Command outputs
      stdout: json.stdout,
      stderr: json.stderr,

      // File changes
      patches: json.patches,
      filesModified: json.files_modified,

      // Web research
      webFindings: json.web_findings,

      // Error info (if not ok)
      errorCode: !ok ? (json.error_code || 'TASK_FAILED') : undefined,
      errorMessage: !ok ? (json.error || json.message) : undefined,
      retryable: !ok,

      // Raw response for debugging
      raw: json,
    };
  } catch (error: unknown) {
    // Handle timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        taskId: task.id,
        ok: false,
        summary: `Agent Zero request timed out after ${request.constraints.timeoutMs}ms`,
        errorCode: 'TIMEOUT',
        errorMessage: `Request timed out after ${request.constraints.timeoutMs}ms`,
        retryable: true,
      };
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        taskId: task.id,
        ok: false,
        summary: 'Agent Zero is not reachable',
        errorCode: 'CONNECTION_ERROR',
        errorMessage: `Failed to connect to Agent Zero at ${AGENT_ZERO_URL}`,
        retryable: true,
      };
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      taskId: task.id,
      ok: false,
      summary: `Agent Zero executor error: ${errorMessage}`,
      errorCode: 'EXECUTOR_ERROR',
      errorMessage,
      retryable: true,
    };
  }
}

// ─── Health Check ──────────────────────────────────────────────────────────────

/**
 * Check if Agent Zero is reachable and healthy
 */
export async function checkAgentZeroHealth(): Promise<{
  healthy: boolean;
  url: string;
  message: string;
  version?: string;
}> {
  try {
    const response = await fetch(`${AGENT_ZERO_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        healthy: false,
        url: AGENT_ZERO_URL,
        message: `Agent Zero returned HTTP ${response.status}`,
      };
    }

    const json = await response.json().catch(() => ({}));

    return {
      healthy: true,
      url: AGENT_ZERO_URL,
      message: 'Agent Zero is healthy',
      version: json.version,
    };
  } catch {
    return {
      healthy: false,
      url: AGENT_ZERO_URL,
      message: `Agent Zero is not reachable at ${AGENT_ZERO_URL}`,
    };
  }
}
