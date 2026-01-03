// @ts-nocheck
// SOVEREIGNTY: No OpenAI dependency - using simple text matching for vector store
// Full semantic search uses local PostgreSQL pgvector via lib/db/pgvector.ts

import { Document } from "@langchain/core/documents";

// Simple in-memory vector store - no external AI dependencies
interface MemoryDocument {
  content: string;
  metadata: any;
  similarity?: number;
}

class SimpleMemoryVectorStore {
  private documents: MemoryDocument[] = [];

  async addDocuments(docs: Document[]) {
    docs.forEach(doc => {
      this.documents.push({
        content: doc.pageContent,
        metadata: doc.metadata
      });
    });
  }

  async similaritySearch(query: string, limit: number = 5, filter?: any) {
    // Simple text matching (semantic search via pgvector in production)
    const queryLower = query.toLowerCase();
    const results = this.documents
      .filter(doc => {
        if (filter) {
          return Object.keys(filter).every(key => doc.metadata[key] === filter[key]);
        }
        return true;
      })
      .map(doc => ({
        ...doc,
        similarity: this.calculateSimilarity(doc.content.toLowerCase(), queryLower)
      }))
      .filter(doc => doc.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results.map(doc => ({
      pageContent: doc.content,
      metadata: { ...doc.metadata, score: doc.similarity }
    }));
  }

  private calculateSimilarity(content: string, query: string): number {
    // Simple word overlap scoring
    const contentWords = new Set(content.split(/\s+/));
    const queryWords = query.split(/\s+/);
    let matches = 0;
    for (const word of queryWords) {
      if (contentWords.has(word)) matches++;
    }
    return queryWords.length > 0 ? matches / queryWords.length : 0;
  }
}

interface LlamaMemoryDocument {
  content: string;
  metadata: {
    userId: string;
    type: string;
    timestamp: string;
    referenceId?: number;
  };
}

export class LlamaService {
  private vectorStore: SimpleMemoryVectorStore | null = null;
  private _isInitialized = false;

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  async init() {
    // Initialize simple in-memory vector store (no external AI required)
    this.vectorStore = new SimpleMemoryVectorStore();
    this._isInitialized = true;
  }

  async addMemory(userId: string, memory: any) {
    if (!this.vectorStore) throw new Error("Llama index not initialized");

    let content: string;
    let metadata: any;

    if (typeof memory === 'string') {
      content = memory;
      metadata = {
        userId,
        type: 'chat',
        timestamp: new Date().toISOString()
      };
    } else {
      content = memory.content;
      metadata = {
        userId,
        id: memory.id,
        type: memory.type,
        timestamp: new Date().toISOString(),
        ...memory.meta
      };
    }

    const doc = new Document({
      pageContent: content,
      metadata
    });

    await this.vectorStore.addDocuments([doc]);
  }

  async queryMemory(userId: string, query: string, limit: number = 5) {
    if (!this.vectorStore) throw new Error("Llama index not initialized");

    const results = await this.vectorStore.similaritySearch(query, limit, {
      userId
    });

    return results.map(doc => ({
      content: doc.pageContent,
      type: doc.metadata.type,
      timestamp: doc.metadata.timestamp,
      score: doc.metadata.score || 1.0
    }));
  }

  async addJournalMemory(userId: string, journalId: number, content: string, title?: string) {
    const enrichedContent = title ? `Journal: ${title}\n${content}` : content;
    await this.addMemory(userId, enrichedContent, "journal", journalId);
  }

  async addUploadMemory(userId: string, uploadId: number, extractedContent: string, filename: string) {
    const enrichedContent = `File: ${filename}\n${extractedContent}`;
    await this.addMemory(userId, enrichedContent, "upload", uploadId);
  }

  async addVoiceMemory(userId: string, voiceId: number, transcript: string) {
    const enrichedContent = `Voice Note: ${transcript}`;
    await this.addMemory(userId, enrichedContent, "voice", voiceId);
  }

  async buildContextPrompt(userId: string, currentMessage: string): Promise<string> {
    const memories = await this.queryMemory(userId, currentMessage);

    if (memories.length === 0) {
      return "";
    }

    const contextParts = memories.map(mem => {
      const typeLabel = {
        chat: "Previous conversation",
        journal: "Journal entry",
        upload: "Uploaded document",
        voice: "Voice note"
      }[mem.type] || "Memory";

      return `[${typeLabel} from ${new Date(mem.timestamp).toLocaleDateString()}]:\n${mem.content}`;
    });

    return `\n\nRelevant context from past interactions:\n${contextParts.join("\n\n")}`;
  }

  async searchMemories(userId: string, query: string, limit: number = 10, filters?: { type?: string }): Promise<any[]> {
    if (!this.vectorStore) throw new Error("Llama index not initialized");

    const filter: any = { userId };
    if (filters?.type) {
      filter.type = filters.type;
    }

    const results = await this.vectorStore.similaritySearch(query, limit, filter);

    return results.map(doc => ({
      id: doc.metadata.id,
      content: doc.pageContent,
      type: doc.metadata.type,
      metadata: doc.metadata,
      score: doc.metadata.score || 1.0
    }));
  }
}

// Export singleton instance
export const llamaService = new LlamaService();
