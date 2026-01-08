/**
 * Recursive Corpus Navigator (RCN) Client
 * RLM-inspired corpus-as-environment processing
 *
 * TypeScript client for the RCN microservice with budget controls
 * and provenance tracking.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Budget Limits
// ═══════════════════════════════════════════════════════════════════════════════

export interface BudgetLimits {
  /** Max recursive depth (default: 5, max: 20) */
  maxRecursions?: number;
  /** Max total tool calls (default: 15, max: 50) */
  maxToolCalls?: number;
  /** Max chunks to read (default: 30, max: 100) */
  maxChunksRead?: number;
  /** Timeout in milliseconds (default: 60000, max: 300000) */
  timeoutMs?: number;
  /** Max tokens per LLM call (default: 4096, max: 8192) */
  maxTokensPerCall?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Request Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface RecursiveQuery {
  /** The main query/task to process */
  prompt: string;
  /** Corpus chunks to search/navigate */
  corpus?: string[];
  /** Type of corpus for optimized handling */
  corpusType?: 'general' | 'codebase' | 'docs' | 'transcript' | 'vault';
  /** Available tools (default: search, read, navigate) */
  toolsEnabled?: string[];
  /** Hard budget limits to prevent runaway recursion */
  budget?: BudgetLimits;
  /** Path to Obsidian vault (for corpusType='vault') */
  vaultPath?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Response Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface ChunkProvenance {
  /** Chunk ID that was accessed (negative for vault files) */
  chunkId: number;
  /** SHA256 hash (first 16 chars) of chunk content */
  contentHash: string;
  /** Character count of chunk */
  charCount: number;
  /** ISO timestamp when accessed */
  accessedAt: string;
  /** Order in which it was accessed (1-based) */
  accessOrder: number;
  /** Relative path within vault (vault corpus only) */
  filePath?: string;
  /** Heading section read (vault corpus only) */
  heading?: string;
}

export interface ExecutionTrace {
  /** Recursion depth (0-based) */
  depth: number;
  /** LLM stop reason */
  stopReason: string;
  /** Tool calls made in this step */
  toolCallsThisStep: number;
  /** Chunk IDs read in this step */
  chunksReadThisStep: number[];
  /** Time taken for this step (ms) */
  elapsedMs: number;
  /** Estimated input tokens this step */
  inputTokensThisStep: number;
  /** Estimated output tokens this step */
  outputTokensThisStep: number;
}

export interface BudgetUsage {
  /** Recursions used */
  recursionsUsed: number;
  /** Recursions limit */
  recursionsLimit: number;
  /** Tool calls used */
  toolCallsUsed: number;
  /** Tool calls limit */
  toolCallsLimit: number;
  /** Chunks read */
  chunksReadUsed: number;
  /** Chunks read limit */
  chunksReadLimit: number;
  /** Total elapsed time (ms) */
  elapsedMs: number;
  /** Timeout limit (ms) */
  timeoutMs: number;
  /** Estimated input tokens (all steps) */
  estimatedInputTokens: number;
  /** Estimated output tokens (all steps) */
  estimatedOutputTokens: number;
  /** Estimated total tokens (input + output) */
  estimatedTotalTokens: number;
  /** Why budget was exhausted (if applicable) */
  budgetExhaustedReason?: string;
  /** Whether a forced submit round was used (system overhead) */
  forcedSubmitUsed?: boolean;
  /** Recursions used by forced submit (not counted in recursionsUsed) */
  forcedSubmitOverheadRecursions?: number;
  /** Tool calls used by forced submit (not counted in toolCallsUsed) */
  forcedSubmitOverheadToolCalls?: number;
}

export interface RecursiveResult {
  /** Unique run ID for correlation/debugging */
  runId: string;
  /** The final answer from recursive processing */
  answer: string;
  /** Confidence score 0-1 */
  confidence: number;
  /** Detailed trace of each recursion step */
  reasoningTrace: ExecutionTrace[];
  /** Provenance for all accessed chunks */
  provenance: ChunkProvenance[];
  /** Budget consumption details */
  budgetUsage: BudgetUsage;
  /** True if completed normally, false if budget exhausted */
  completedNormally: boolean;
  /** Things not verified due to budget constraints (if incomplete) */
  notVerified?: string[];
  /** Suggested budget increase for rerun (if incomplete) */
  rerunSuggestion?: string;
}

export interface RCNHealth {
  status: 'healthy' | 'unhealthy';
  version: string;
  model: string;
  defaultBudgets: {
    maxRecursions: number;
    maxToolCalls: number;
    maxChunksRead: number;
    timeoutMs: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Client
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Recursive Corpus Navigator Client
 *
 * Implements corpus-as-environment paradigm where the model navigates
 * corpus via tool calls instead of context stuffing.
 *
 * Features:
 * - Hard budget enforcement (prevents runaway recursion)
 * - Provenance tracking (what was read, when, content hashes)
 * - Detailed execution traces for observability
 *
 * Usage:
 * ```typescript
 * const rcn = new RCNClient();
 *
 * const result = await rcn.process({
 *   prompt: "What is the main theme across these documents?",
 *   corpus: documentsArray,
 *   corpusType: 'docs',
 *   budget: {
 *     maxToolCalls: 20,
 *     maxChunksRead: 15,
 *     timeoutMs: 30000
 *   }
 * });
 *
 * console.log(result.answer);
 * console.log(`Budget: ${result.budgetUsage.toolCallsUsed}/${result.budgetUsage.toolCallsLimit} tool calls`);
 * console.log(`Provenance: ${result.provenance.length} chunks accessed`);
 * ```
 */
export class RCNClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '/api/rlm';
  }

  /**
   * Transform camelCase to snake_case for Python API
   */
  private toSnakeCase(budget?: BudgetLimits): Record<string, number> | undefined {
    if (!budget) return undefined;
    return {
      max_recursions: budget.maxRecursions ?? 5,
      max_tool_calls: budget.maxToolCalls ?? 15,
      max_chunks_read: budget.maxChunksRead ?? 30,
      timeout_ms: budget.timeoutMs ?? 60000,
      max_tokens_per_call: budget.maxTokensPerCall ?? 4096,
    };
  }

  /**
   * Transform snake_case response to camelCase
   */
  private transformResponse(raw: Record<string, unknown>): RecursiveResult {
    const budgetUsage = raw.budget_usage as Record<string, unknown>;
    const reasoningTrace = raw.reasoning_trace as Array<Record<string, unknown>>;
    const provenance = raw.provenance as Array<Record<string, unknown>>;

    return {
      runId: raw.run_id as string,
      answer: raw.answer as string,
      confidence: raw.confidence as number,
      completedNormally: raw.completed_normally as boolean,
      reasoningTrace: reasoningTrace.map(t => ({
        depth: t.depth as number,
        stopReason: t.stop_reason as string,
        toolCallsThisStep: t.tool_calls_this_step as number,
        chunksReadThisStep: t.chunks_read_this_step as number[],
        elapsedMs: t.elapsed_ms as number,
        inputTokensThisStep: t.input_tokens_this_step as number,
        outputTokensThisStep: t.output_tokens_this_step as number,
      })),
      provenance: provenance.map(p => ({
        chunkId: p.chunk_id as number,
        contentHash: p.content_hash as string,
        charCount: p.char_count as number,
        accessedAt: p.accessed_at as string,
        accessOrder: p.access_order as number,
        // Vault-specific fields (null → undefined coercion)
        filePath: (p.file_path ?? undefined) as string | undefined,
        heading: (p.heading ?? undefined) as string | undefined,
      })),
      budgetUsage: {
        recursionsUsed: budgetUsage.recursions_used as number,
        recursionsLimit: budgetUsage.recursions_limit as number,
        toolCallsUsed: budgetUsage.tool_calls_used as number,
        toolCallsLimit: budgetUsage.tool_calls_limit as number,
        chunksReadUsed: budgetUsage.chunks_read_used as number,
        chunksReadLimit: budgetUsage.chunks_read_limit as number,
        elapsedMs: budgetUsage.elapsed_ms as number,
        timeoutMs: budgetUsage.timeout_ms as number,
        estimatedInputTokens: budgetUsage.estimated_input_tokens as number,
        estimatedOutputTokens: budgetUsage.estimated_output_tokens as number,
        estimatedTotalTokens: budgetUsage.estimated_total_tokens as number,
        // Coalesce null → undefined to match TS types (Python sends null, not undefined)
        budgetExhaustedReason: (budgetUsage.budget_exhausted_reason ?? undefined) as string | undefined,
        // Forced submit overhead (system overhead, not counted against limits)
        forcedSubmitUsed: (budgetUsage.forced_submit_used ?? undefined) as boolean | undefined,
        forcedSubmitOverheadRecursions: (budgetUsage.forced_submit_overhead_recursions ?? undefined) as number | undefined,
        forcedSubmitOverheadToolCalls: (budgetUsage.forced_submit_overhead_tool_calls ?? undefined) as number | undefined,
      },
      // Coalesce null → undefined
      notVerified: (raw.not_verified ?? undefined) as string[] | undefined,
      rerunSuggestion: (raw.rerun_suggestion ?? undefined) as string | undefined,
    };
  }

  /**
   * Process a query using recursive corpus-as-environment paradigm.
   *
   * The model navigates the corpus through tool calls (search, read, navigate)
   * rather than receiving the entire context at once.
   *
   * Hard budgets prevent runaway recursion.
   */
  async process(query: RecursiveQuery): Promise<RecursiveResult> {
    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: query.prompt,
        corpus: query.corpus || [],
        corpus_type: query.corpusType || 'general',
        tools_enabled: query.toolsEnabled || ['search', 'read', 'navigate'],
        budget: this.toSnakeCase(query.budget),
        vault_path: query.vaultPath,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `RCN request failed: ${response.status}`);
    }

    const result = await response.json();

    // Handle proxy response (has data wrapper) vs direct response
    const rawResult = result.data || result;
    return this.transformResponse(rawResult);
  }

  /**
   * Check RCN service health and get default budgets
   */
  async health(): Promise<RCNHealth> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      return {
        status: 'unhealthy',
        version: 'unknown',
        model: 'unknown',
        defaultBudgets: {
          maxRecursions: 5,
          maxToolCalls: 15,
          maxChunksRead: 30,
          timeoutMs: 60000,
        },
      };
    }

    const data = await response.json();
    return {
      status: data.status,
      version: data.version,
      model: data.model,
      defaultBudgets: {
        maxRecursions: data.default_budgets?.max_recursions ?? 5,
        maxToolCalls: data.default_budgets?.max_tool_calls ?? 15,
        maxChunksRead: data.default_budgets?.max_chunks_read ?? 30,
        timeoutMs: data.default_budgets?.timeout_ms ?? 60000,
      },
    };
  }

  /**
   * Process Community Commons documents with optimized budget
   */
  async processCommons(prompt: string, documents: string[], budget?: Partial<BudgetLimits>): Promise<RecursiveResult> {
    return this.process({
      prompt,
      corpus: documents,
      corpusType: 'docs',
      budget: {
        maxRecursions: 7,
        maxToolCalls: 20,
        maxChunksRead: 25,
        timeoutMs: 45000,
        ...budget,
      },
    });
  }

  /**
   * Process codebase for navigation/understanding with higher limits
   */
  async processCodebase(prompt: string, files: string[], budget?: Partial<BudgetLimits>): Promise<RecursiveResult> {
    return this.process({
      prompt,
      corpus: files,
      corpusType: 'codebase',
      budget: {
        maxRecursions: 10,
        maxToolCalls: 30,
        maxChunksRead: 40,
        timeoutMs: 90000,
        ...budget,
      },
    });
  }

  /**
   * Process conversation transcript with balanced budget
   */
  async processTranscript(prompt: string, turns: string[], budget?: Partial<BudgetLimits>): Promise<RecursiveResult> {
    return this.process({
      prompt,
      corpus: turns,
      corpusType: 'transcript',
      budget: {
        maxRecursions: 5,
        maxToolCalls: 15,
        maxChunksRead: 20,
        timeoutMs: 30000,
        ...budget,
      },
    });
  }

  /**
   * Process Obsidian vault with optimized budget for note navigation
   *
   * @example
   * ```typescript
   * const result = await rcn.processVault(
   *   "What are the main themes in my MAIA project notes?",
   *   "/Users/me/vault"
   * );
   * console.log(result.answer);
   * console.log(`Read ${result.provenance.length} files`);
   * result.provenance.forEach(p => {
   *   if (p.filePath) console.log(`  - ${p.filePath}${p.heading ? ` (${p.heading})` : ''}`);
   * });
   * ```
   */
  async processVault(prompt: string, vaultPath: string, budget?: Partial<BudgetLimits>): Promise<RecursiveResult> {
    return this.process({
      prompt,
      corpusType: 'vault',
      vaultPath,
      toolsEnabled: ['vault_search', 'vault_read'],
      budget: {
        maxRecursions: 8,
        maxToolCalls: 25,
        maxChunksRead: 20,
        timeoutMs: 60000,
        ...budget,
      },
    });
  }
}

/**
 * Default RCN client instance
 */
export const rcnClient = new RCNClient();

// Legacy alias for backwards compatibility
export { RCNClient as RLMClient, rcnClient as rlmClient };
