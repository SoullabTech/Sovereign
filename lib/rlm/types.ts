/**
 * RLM (Retrieval-augmented Language Model) Types
 *
 * Core types for the agentic retrieval pattern.
 */

/** Action types the RLM can take */
export type RLMActionType = 'search' | 'read' | 'list' | 'answer';

/** Base action interface */
export interface RLMAction {
  type: RLMActionType;
  reasoning?: string;
}

/** Search for code matching a pattern or query */
export interface SearchAction extends RLMAction {
  type: 'search';
  query: string;
  pattern?: string; // regex pattern
  fileGlob?: string; // e.g., '**/*.ts'
}

/** Read a specific file or file section */
export interface ReadAction extends RLMAction {
  type: 'read';
  filePath: string;
  startLine?: number;
  endLine?: number;
}

/** List files matching a glob pattern */
export interface ListAction extends RLMAction {
  type: 'list';
  glob: string;
  maxResults?: number;
}

/** Source reference with line ranges for citations */
export interface SourceRef {
  path: string;
  lineStart?: number;
  lineEnd?: number;
  why?: string;
}

/** Structured answer payload */
export interface AnswerPayload {
  answer: string;
  confidence: number; // 0-1
  sources: SourceRef[];
}

/** Final answer after gathering enough context */
export interface AnswerAction extends RLMAction {
  type: 'answer';
  answer: string;
  confidence: number; // 0-1
  sources: string[]; // file paths referenced (legacy)
  payload?: AnswerPayload; // structured answer (preferred)
}

/** Union of all action types */
export type AnyRLMAction = SearchAction | ReadAction | ListAction | AnswerAction;

/** A single match from ripgrep search */
export interface SearchMatch {
  path: string;
  line: number;
  preview: string;
}

/** Result from executing a tool */
export interface ToolResult {
  success: boolean;
  content: string;
  truncated?: boolean;
  metadata?: Record<string, unknown>;
  meta?: {
    matches?: SearchMatch[];
    files?: string[];
    linesRead?: number;
  };
}

/** Context accumulated during RLM loop */
export interface RLMContext {
  question: string;
  history: Array<{
    action: AnyRLMAction;
    result: ToolResult;
  }>;
  filesRead: Set<string>;
  searchesPerformed: string[];
}

/** Budget limits for tool calls */
export interface RLMBudget {
  search: number;
  list: number;
  read: number;
}

/** Configuration for RLM execution */
export interface RLMConfig {
  maxIterations: number;
  maxContextChars: number;
  modelId?: string; // defaults to local Ollama
  verbose?: boolean;
  budget?: RLMBudget;
  includeTrace?: boolean; // include tool-by-tool trace in result
}

// ============================================================================
// Proof objects (sovereignty-grade)
// Every confidence-bearing claim should be traceable to file + line ranges.
// ============================================================================

/**
 * Proof-grade source reference with line ranges.
 * Use this for audit-able citations.
 */
export type RLMSourceRef = {
  path: string;      // repo-relative
  startLine: number; // 1-indexed
  endLine: number;   // 1-indexed
  excerpt?: string;  // optional small snippet for UI
};

/**
 * Budget accounting for tool calls.
 */
export type RLMUsage = {
  budgets: { search: number; read: number; list: number };
  used: { search: number; read: number; list: number };
};

/**
 * Tool-by-tool trace for debugging or "show your work" UI.
 */
export type RLMTraceStep =
  | {
      tool: 'search';
      query: string;
      fileGlob?: string;
      hits: Array<{ path: string; line: number; preview: string }>;
      ms: number;
    }
  | {
      tool: 'read';
      path: string;
      startLine?: number;
      endLine?: number;
      ms: number;
    }
  | {
      tool: 'list';
      glob: string;
      results: string[];
      ms: number;
    }
  | {
      tool: 'deny';
      reason: 'denylist' | 'path_not_allowed' | 'budget_exceeded';
      detail: string;
      ms: number;
    };

/** Final result from RLM query */
export interface RLMResult {
  answer: string;
  confidence: number;

  /**
   * Back-compat: paths-only sources (legacy).
   * Prefer `sourceRefs` for proof-grade citations.
   */
  sources: string[];

  /**
   * Proof-grade sources: file + line ranges.
   * Populate this whenever possible (especially if confidence > ~0.4).
   */
  sourceRefs?: RLMSourceRef[];

  /**
   * Budget accounting for tool calls (search/read/list).
   */
  usage?: RLMUsage;

  /**
   * Optional tool-by-tool trace for debugging or "show your work" UI.
   * Gate behind config.includeTrace flag.
   */
  trace?: RLMTraceStep[];

  /**
   * Extra stats.
   */
  stats?: { ms?: number };

  warnings?: string[];
  iterations: number;
  totalTokensEst: number;
}
