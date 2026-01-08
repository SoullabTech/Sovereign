/**
 * RLM Client Library
 *
 * TypeScript client for the RLM (Recursive Language Models) microservice.
 * Implements corpus-as-environment paradigm for MAIA/AIN.
 */

export interface RecursiveQuery {
  /** The main query/task to process */
  prompt: string;
  /** Corpus chunks to search/navigate */
  corpus?: string[];
  /** Type of corpus for optimized handling */
  corpusType?: 'general' | 'codebase' | 'docs' | 'transcript';
  /** Maximum recursive depth (default: 5) */
  maxRecursions?: number;
  /** Max tokens per LLM call (default: 4096) */
  maxTokens?: number;
  /** Available tools (default: search, read, navigate) */
  toolsEnabled?: string[];
}

export interface RecursiveResult {
  /** The final answer from recursive processing */
  answer: string;
  /** Trace of reasoning at each recursion depth */
  reasoningTrace: Array<{
    depth: number;
    stopReason: string;
    contentTypes: string[];
  }>;
  /** Total tool calls made */
  toolCalls: number;
  /** Final recursion depth reached */
  recursionDepth: number;
  /** IDs of corpus chunks accessed */
  chunksAccessed: number[];
  /** Confidence score 0-1 */
  confidence: number;
}

export interface RLMHealth {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  model: string;
}

/**
 * RLM Client for corpus-as-environment processing
 *
 * Usage:
 * ```typescript
 * const rlm = new RLMClient();
 *
 * const result = await rlm.process({
 *   prompt: "What is the main theme across these documents?",
 *   corpus: documentsArray,
 *   corpusType: 'docs'
 * });
 *
 * console.log(result.answer);
 * console.log(`Accessed ${result.chunksAccessed.length} chunks in ${result.recursionDepth} iterations`);
 * ```
 */
export class RLMClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '/api/rlm';
  }

  /**
   * Process a query using recursive corpus-as-environment paradigm.
   *
   * Instead of stuffing entire corpus into context, the model navigates
   * it through tool calls (search, read, navigate).
   */
  async process(query: RecursiveQuery): Promise<RecursiveResult> {
    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `RLM request failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Check RLM service health
   */
  async health(): Promise<RLMHealth> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      return {
        status: 'unhealthy',
        service: 'rlm',
        version: 'unknown',
        model: 'unknown',
      };
    }

    return response.json();
  }

  /**
   * Process Community Commons documents
   */
  async processCommons(prompt: string, documents: string[]): Promise<RecursiveResult> {
    return this.process({
      prompt,
      corpus: documents,
      corpusType: 'docs',
      maxRecursions: 7,
    });
  }

  /**
   * Process codebase for navigation/understanding
   */
  async processCodebase(prompt: string, files: string[]): Promise<RecursiveResult> {
    return this.process({
      prompt,
      corpus: files,
      corpusType: 'codebase',
      maxRecursions: 10,
    });
  }

  /**
   * Process conversation transcript
   */
  async processTranscript(prompt: string, turns: string[]): Promise<RecursiveResult> {
    return this.process({
      prompt,
      corpus: turns,
      corpusType: 'transcript',
      maxRecursions: 5,
    });
  }
}

/**
 * Default RLM client instance
 */
export const rlmClient = new RLMClient();
