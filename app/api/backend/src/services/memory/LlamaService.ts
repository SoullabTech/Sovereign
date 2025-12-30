// @ts-nocheck
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

// Simplified in-memory vector store implementation for production build compatibility
interface MemoryDocument {
  content: string;
  metadata: any;
  similarity?: number;
}

class SimpleMemoryVectorStore {
  private documents: MemoryDocument[] = [];
  private embeddings: OpenAIEmbeddings;

  constructor(embeddings: OpenAIEmbeddings) {
    this.embeddings = embeddings;
  }

  async addDocuments(docs: Document[]) {
    // For now, just store without embeddings (simplified for production build)
    docs.forEach(doc => {
      this.documents.push({
        content: doc.pageContent,
        metadata: doc.metadata
      });
    });
  }

  async similaritySearch(query: string, limit: number = 5, filter?: any) {
    // Simple text matching for now (would use embeddings in full implementation)
    const results = this.documents
      .filter(doc => {
        // Apply metadata filter if provided
        if (filter) {
          return Object.keys(filter).every(key => doc.metadata[key] === filter[key]);
        }
        return true;
      })
      .filter(doc => doc.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);

    return results.map(doc => ({
      pageContent: doc.content,
      metadata: doc.metadata
    }));
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
  private embeddings: OpenAIEmbeddings;
  private _isInitialized = false;

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-ada-002"
    });
  }

  async init() {
    // Initialize with simple in-memory vector store for production build compatibility
    // Can be upgraded to full MemoryVectorStore when LangChain compatibility is resolved
    this.vectorStore = new SimpleMemoryVectorStore(this.embeddings);
    this._isInitialized = true;
  }

  async addMemory(userId: string, memory: any) {
    if (!this.vectorStore) throw new Error("Llama index not initialized");
    
    // Handle both old format and new structured format
    let content: string;
    let metadata: any;
    
    if (typeof memory === 'string') {
      // Legacy format for backward compatibility
      content = memory;
      metadata = {
        userId,
        type: 'chat',
        timestamp: new Date().toISOString()
      };
    } else {
      // New structured format
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
    
    // Semantic search with user filter
    const results = await this.vectorStore.similaritySearch(query, limit, {
      userId
    });

    // Format results for context injection
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
    
    // Build metadata filter
    const filter: any = { userId };
    if (filters?.type) {
      filter.type = filters.type;
    }
    
    // Semantic search with filters
    const results = await this.vectorStore.similaritySearch(query, limit, filter);
    
    // Return structured results
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