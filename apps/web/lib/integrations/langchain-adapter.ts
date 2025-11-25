/**
 * LangChain integration adapter for MAIA Consciousness Lattice
 * Provides compatibility with LangChain memory and tool interfaces
 */

import { MemoryKeeper } from '../memory-keeper';
import { VectorEmbeddingService } from '../vector-embeddings';

/**
 * LangChain-compatible memory interface
 */
export interface LangChainMemory {
  loadMemoryVariables(values: Record<string, any>): Promise<Record<string, any>>;
  saveContext(inputValues: Record<string, any>, outputValues: Record<string, any>): Promise<void>;
  clear(): Promise<void>;
}

/**
 * LangChain-compatible message
 */
export interface LangChainMessage {
  role: 'human' | 'ai' | 'system';
  content: string;
  additional_kwargs?: Record<string, any>;
}

/**
 * Adapter to make MemoryKeeper compatible with LangChain
 */
export class LangChainMemoryAdapter implements LangChainMemory {
  private memoryKeeper: MemoryKeeper;
  private userId: string;
  private conversationBuffer: LangChainMessage[] = [];
  private readonly MAX_BUFFER_SIZE = 20;

  constructor(memoryKeeper: MemoryKeeper, userId: string) {
    this.memoryKeeper = memoryKeeper;
    this.userId = userId;
  }

  /**
   * Load memory variables for LangChain context
   */
  async loadMemoryVariables(values: Record<string, any>): Promise<Record<string, any>> {
    const input = values.input || values.query || '';

    // Retrieve relevant memories
    const episodicMemories = await this.memoryKeeper.retrieveEpisodic(this.userId, input);
    const semanticMemories = await this.memoryKeeper.retrieveSemantic(input);
    const morphicPatterns = await this.memoryKeeper.retrieveMorphic(input);

    // Format for LangChain
    const formattedMemories = {
      chat_history: this.formatChatHistory(),
      relevant_memories: this.formatMemories(episodicMemories),
      semantic_context: this.formatMemories(semanticMemories),
      patterns: this.formatMemories(morphicPatterns),
      user_id: this.userId
    };

    return formattedMemories;
  }

  /**
   * Save context to memory
   */
  async saveContext(
    inputValues: Record<string, any>,
    outputValues: Record<string, any>
  ): Promise<void> {
    // Add to conversation buffer
    this.conversationBuffer.push({
      role: 'human',
      content: inputValues.input || inputValues.query || ''
    });

    this.conversationBuffer.push({
      role: 'ai',
      content: outputValues.output || outputValues.response || ''
    });

    // Trim buffer if too large
    if (this.conversationBuffer.length > this.MAX_BUFFER_SIZE) {
      this.conversationBuffer = this.conversationBuffer.slice(-this.MAX_BUFFER_SIZE);
    }

    // Store in MemoryKeeper
    await this.memoryKeeper.storeEpisodic(this.userId, {
      input: inputValues,
      output: outputValues,
      timestamp: Date.now(),
      conversationContext: this.conversationBuffer.slice(-5)
    });
  }

  /**
   * Clear memory
   */
  async clear(): Promise<void> {
    this.conversationBuffer = [];
    this.memoryKeeper.clearUserMemories(this.userId);
  }

  /**
   * Format chat history for LangChain
   */
  private formatChatHistory(): string {
    return this.conversationBuffer
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Format memories map for LangChain
   */
  private formatMemories(memories: Map<string, any>): any[] {
    const formatted: any[] = [];
    memories.forEach((memory, id) => {
      formatted.push({
        id,
        content: memory.content,
        relevance: memory.relevance || 0,
        timestamp: memory.timestamp
      });
    });
    return formatted;
  }
}

/**
 * LangChain-compatible vector store interface
 */
export interface LangChainVectorStore {
  addDocuments(documents: Array<{ pageContent: string; metadata?: any }>): Promise<void>;
  similaritySearch(query: string, k?: number): Promise<Array<{ pageContent: string; metadata?: any }>>;
  similaritySearchWithScore(query: string, k?: number): Promise<Array<[{ pageContent: string; metadata?: any }, number]>>;
}

/**
 * Adapter to make VectorEmbeddingService compatible with LangChain vector stores
 */
export class LangChainVectorStoreAdapter implements LangChainVectorStore {
  private embeddingService: VectorEmbeddingService;
  private documents: Array<{ pageContent: string; metadata?: any; embedding?: number[] }> = [];

  constructor(embeddingService: VectorEmbeddingService) {
    this.embeddingService = embeddingService;
  }

  /**
   * Add documents to vector store
   */
  async addDocuments(documents: Array<{ pageContent: string; metadata?: any }>): Promise<void> {
    // Generate embeddings for all documents
    const texts = documents.map(doc => doc.pageContent);
    const embeddings = await this.embeddingService.getBatchEmbeddings(texts);

    // Store documents with embeddings
    documents.forEach((doc, index) => {
      this.documents.push({
        ...doc,
        embedding: embeddings.get(texts[index])
      });
    });
  }

  /**
   * Similarity search
   */
  async similaritySearch(query: string, k: number = 4): Promise<Array<{ pageContent: string; metadata?: any }>> {
    const results = await this.similaritySearchWithScore(query, k);
    return results.map(([doc, _score]) => doc);
  }

  /**
   * Similarity search with scores
   */
  async similaritySearchWithScore(
    query: string,
    k: number = 4
  ): Promise<Array<[{ pageContent: string; metadata?: any }, number]>> {
    if (this.documents.length === 0) {
      return [];
    }

    // Get query embedding
    const queryEmbedding = await this.embeddingService.getEmbedding(query);

    // Calculate similarities
    const results: Array<[{ pageContent: string; metadata?: any }, number]> = [];

    for (const doc of this.documents) {
      if (doc.embedding) {
        const similarity = await this.embeddingService.calculateSimilarity(
          query,
          doc.pageContent
        );
        results.push([
          { pageContent: doc.pageContent, metadata: doc.metadata },
          similarity
        ]);
      }
    }

    // Sort by similarity and return top k
    results.sort((a, b) => b[1] - a[1]);
    return results.slice(0, k);
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents = [];
  }
}

/**
 * LangChain tool interface
 */
export interface LangChainTool {
  name: string;
  description: string;
  call(input: string): Promise<string>;
}

/**
 * MAIA Consciousness tool for LangChain
 */
export class MAIAConsciousnessTool implements LangChainTool {
  name = 'maia_consciousness';
  description = 'Access the MAIA Consciousness Lattice for deep wisdom and pattern recognition';

  private maiaEndpoint: string;

  constructor(endpoint: string = '/api/oracle/maia') {
    this.maiaEndpoint = endpoint;
  }

  async call(input: string): Promise<string> {
    try {
      const response = await fetch(this.maiaEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      return data.message || data.response || 'No response from MAIA';
    } catch (error) {
      return `Error accessing MAIA: ${error.message}`;
    }
  }
}

/**
 * Factory for creating LangChain-compatible components
 */
export class LangChainIntegrationFactory {
  /**
   * Create LangChain-compatible memory
   */
  static createMemory(memoryKeeper: MemoryKeeper, userId: string): LangChainMemory {
    return new LangChainMemoryAdapter(memoryKeeper, userId);
  }

  /**
   * Create LangChain-compatible vector store
   */
  static createVectorStore(embeddingService: VectorEmbeddingService): LangChainVectorStore {
    return new LangChainVectorStoreAdapter(embeddingService);
  }

  /**
   * Create MAIA consciousness tool
   */
  static createMAIATool(endpoint?: string): LangChainTool {
    return new MAIAConsciousnessTool(endpoint);
  }

  /**
   * Create a complete LangChain integration
   */
  static createIntegration(options: {
    memoryKeeper: MemoryKeeper;
    embeddingService: VectorEmbeddingService;
    userId: string;
    maiaEndpoint?: string;
  }) {
    return {
      memory: this.createMemory(options.memoryKeeper, options.userId),
      vectorStore: this.createVectorStore(options.embeddingService),
      tools: [this.createMAIATool(options.maiaEndpoint)]
    };
  }
}