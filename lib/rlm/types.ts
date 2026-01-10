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

/** Final answer after gathering enough context */
export interface AnswerAction extends RLMAction {
  type: 'answer';
  answer: string;
  confidence: number; // 0-1
  sources: string[]; // file paths referenced
}

/** Union of all action types */
export type AnyRLMAction = SearchAction | ReadAction | ListAction | AnswerAction;

/** Result from executing a tool */
export interface ToolResult {
  success: boolean;
  content: string;
  truncated?: boolean;
  metadata?: Record<string, unknown>;
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

/** Configuration for RLM execution */
export interface RLMConfig {
  maxIterations: number;
  maxContextChars: number;
  modelId?: string; // defaults to local Ollama
  verbose?: boolean;
}

/** Final result from RLM query */
export interface RLMResult {
  answer: string;
  confidence: number;
  sources: string[];
  iterations: number;
  totalTokensEst: number;
}
