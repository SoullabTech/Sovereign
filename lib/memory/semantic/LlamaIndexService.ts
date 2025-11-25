/**
 * LlamaIndex Semantic Layer
 * Provides semantic search and knowledge graph capabilities
 */

import { VectorStoreIndex, Document, ServiceContext, StorageContext } from 'llamaindex';
import { OpenAIEmbedding } from 'llamaindex/embeddings';
import { SimpleDirectoryReader } from 'llamaindex/readers';
import type { EmbeddingService } from '../core/MemoryCore';
import type { Element } from '@/lib/types/oracle';

export interface SemanticDocument {
  id: string;
  content: string;
  metadata: {
    userId?: string;
    type?: string;
    element?: Element;
    archetype?: string;
    timestamp?: Date;
    tags?: string[];
    anonymized?: boolean;
    [key: string]: any;
  };
  embedding?: number[];
}

export interface SemanticSearchResult {
  document: SemanticDocument;
  score: number;
  highlights?: string[];
}

export interface SemanticQuery {
  query: string;
  userId?: string;
  filters?: {
    type?: string;
    element?: Element;
    archetype?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
    [key: string]: any;
  };
  limit?: number;
  includeEmbedding?: boolean;
}

export class LlamaIndexService {
  private index: VectorStoreIndex | null = null;
  private documents: Map<string, SemanticDocument> = new Map();
  private embedder: EmbeddingService;
  private serviceContext: ServiceContext | null = null;
  
  constructor(embedder: EmbeddingService) {
    this.embedder = embedder;
    this.initialize();
  }
  
  private async initialize() {
    try {
      // Initialize LlamaIndex service context
      const embedding = new OpenAIEmbedding({
        model: 'text-embedding-ada-002',
        apiKey: process.env.OPENAI_API_KEY
      });
      
      this.serviceContext = ServiceContext.fromDefaults({
        embedModel: embedding
      });
      
      // Create vector store index
      this.index = await VectorStoreIndex.fromDocuments([], this.serviceContext);
    } catch (error) {
      console.error('Error initializing LlamaIndex:', error);
    }
  }
  
  // Index a new document
  async index(doc: SemanticDocument): Promise<void> {
    if (!this.index) await this.initialize();
    
    // Generate embedding if not provided
    if (!doc.embedding) {
      doc.embedding = await this.embedder.embed(doc.content);
    }
    
    // Create LlamaIndex document
    const llamaDoc = new Document({
      text: doc.content,
      id_: doc.id,
      metadata: doc.metadata,
      embedding: doc.embedding
    });
    
    // Add to index
    await this.index!.insert(llamaDoc);
    
    // Store in local map for quick access
    this.documents.set(doc.id, doc);
  }
  
  // Batch index documents
  async indexBatch(docs: SemanticDocument[]): Promise<void> {
    if (!this.index) await this.initialize();
    
    // Generate embeddings for documents without them
    const docsNeedingEmbeddings = docs.filter(d => !d.embedding);
    if (docsNeedingEmbeddings.length > 0) {
      const contents = docsNeedingEmbeddings.map(d => d.content);
      const embeddings = await this.embedder.embedBatch(contents);
      
      docsNeedingEmbeddings.forEach((doc, i) => {
        doc.embedding = embeddings[i];
      });
    }
    
    // Convert to LlamaIndex documents
    const llamaDocs = docs.map(doc => new Document({
      text: doc.content,
      id_: doc.id,
      metadata: doc.metadata,
      embedding: doc.embedding
    }));
    
    // Batch insert
    for (const doc of llamaDocs) {
      await this.index!.insert(doc);
    }
    
    // Update local map
    docs.forEach(doc => this.documents.set(doc.id, doc));
  }
  
  // Search the semantic index
  async search(query: SemanticQuery): Promise<SemanticSearchResult[]> {
    if (!this.index) await this.initialize();
    
    // Create query engine
    const queryEngine = this.index!.asQueryEngine();
    
    // Generate query embedding
    const queryEmbedding = await this.embedder.embed(query.query);
    
    // Perform vector search
    const response = await queryEngine.query({
      query: query.query,
      similarityTopK: query.limit || 10
    });
    
    // Filter results based on metadata
    let results = this.filterResults(response.sourceNodes || [], query.filters);
    
    // Convert to semantic search results
    const searchResults: SemanticSearchResult[] = results.map(node => ({
      document: {
        id: node.node.id_,
        content: node.node.text,
        metadata: node.node.metadata,
        embedding: query.includeEmbedding ? node.node.embedding : undefined
      },
      score: node.score || 0,
      highlights: this.extractHighlights(node.node.text, query.query)
    }));
    
    return searchResults;
  }
  
  // Filter results based on metadata
  private filterResults(nodes: any[], filters?: any): any[] {
    if (!filters) return nodes;
    
    return nodes.filter(node => {
      const metadata = node.node.metadata;
      
      // Check each filter
      if (filters.type && metadata.type !== filters.type) return false;
      if (filters.element && metadata.element !== filters.element) return false;
      if (filters.archetype && metadata.archetype !== filters.archetype) return false;
      
      // Check tags
      if (filters.tags && filters.tags.length > 0) {
        const nodeTags = metadata.tags || [];
        const hasAllTags = filters.tags.every((tag: string) => 
          nodeTags.includes(tag)
        );
        if (!hasAllTags) return false;
      }
      
      // Check date range
      if (filters.dateRange) {
        const nodeDate = new Date(metadata.timestamp);
        if (nodeDate < filters.dateRange.start || nodeDate > filters.dateRange.end) {
          return false;
        }
      }
      
      // Check user ID if not anonymized
      if (filters.userId && !metadata.anonymized) {
        if (metadata.userId !== filters.userId) return false;
      }
      
      return true;
    });
  }
  
  // Extract highlights from text
  private extractHighlights(text: string, query: string): string[] {
    const highlights: string[] = [];
    const queryWords = query.toLowerCase().split(/\W+/);
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      const hasQueryWord = queryWords.some(word => 
        word.length > 2 && sentenceLower.includes(word)
      );
      
      if (hasQueryWord) {
        highlights.push(sentence.trim());
      }
    });
    
    return highlights.slice(0, 3); // Return top 3 highlights
  }
  
  // Build knowledge graph connections
  async buildKnowledgeGraph(userId?: string): Promise<{
    nodes: Array<{id: string; label: string; type: string}>;
    edges: Array<{source: string; target: string; weight: number}>;
  }> {
    const nodes: Array<{id: string; label: string; type: string}> = [];
    const edges: Array<{source: string; target: string; weight: number}> = [];
    
    // Get all documents for user or collective
    const docs = Array.from(this.documents.values()).filter(doc => 
      !userId || doc.metadata.userId === userId
    );
    
    // Create nodes
    docs.forEach(doc => {
      nodes.push({
        id: doc.id,
        label: doc.metadata.type || 'memory',
        type: doc.metadata.element || 'aether'
      });
    });
    
    // Calculate edges based on semantic similarity
    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        if (docs[i].embedding && docs[j].embedding) {
          const similarity = this.cosineSimilarity(
            docs[i].embedding!,
            docs[j].embedding!
          );
          
          if (similarity > 0.7) { // Threshold for connection
            edges.push({
              source: docs[i].id,
              target: docs[j].id,
              weight: similarity
            });
          }
        }
      }
    }
    
    return { nodes, edges };
  }
  
  // Get related documents
  async getRelated(
    docId: string,
    limit: number = 5
  ): Promise<SemanticDocument[]> {
    const doc = this.documents.get(docId);
    if (!doc || !doc.embedding) return [];
    
    const similarities: Array<{doc: SemanticDocument; score: number}> = [];
    
    for (const [id, otherDoc] of this.documents) {
      if (id === docId) continue;
      if (!otherDoc.embedding) continue;
      
      const similarity = this.cosineSimilarity(
        doc.embedding,
        otherDoc.embedding
      );
      
      similarities.push({ doc: otherDoc, score: similarity });
    }
    
    // Sort by similarity and return top N
    similarities.sort((a, b) => b.score - a.score);
    return similarities.slice(0, limit).map(s => s.doc);
  }
  
  // Update document metadata
  async updateMetadata(docId: string, metadata: any): Promise<void> {
    const doc = this.documents.get(docId);
    if (!doc) return;
    
    doc.metadata = { ...doc.metadata, ...metadata };
    this.documents.set(docId, doc);
    
    // Re-index with updated metadata
    await this.index(doc);
  }
  
  // Delete document
  async delete(docId: string): Promise<void> {
    this.documents.delete(docId);
    // Note: LlamaIndex doesn't support direct deletion,
    // would need to rebuild index without this document
  }
  
  // Get all documents
  async getAll(): Promise<SemanticDocument[]> {
    return Array.from(this.documents.values());
  }
  
  // Calculate cosine similarity
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  // Create archetypal wisdom index
  async indexArchetypalWisdom() {
    const archetypes = [
      {
        id: 'wisdom_visionary',
        content: 'The Visionary sees beyond the horizon, translating dreams into reality through clear sight and elevated perspective.',
        metadata: {
          type: 'wisdom',
          archetype: 'visionary',
          element: 'air'
        }
      },
      {
        id: 'wisdom_alchemist',
        content: 'The Alchemist transforms base matter into gold, catalyzing change through the sacred fire of will and intention.',
        metadata: {
          type: 'wisdom',
          archetype: 'alchemist',
          element: 'fire'
        }
      },
      {
        id: 'wisdom_oracle',
        content: 'The Oracle flows with intuitive knowing, reading the currents of emotion and spirit like water finding its way.',
        metadata: {
          type: 'wisdom',
          archetype: 'oracle',
          element: 'water'
        }
      },
      {
        id: 'wisdom_guardian',
        content: 'The Guardian stands firm as ancient stone, protecting and nurturing with the steady presence of earth.',
        metadata: {
          type: 'wisdom',
          archetype: 'guardian',
          element: 'earth'
        }
      },
      {
        id: 'wisdom_mystic',
        content: 'The Mystic dwells in the space between, bridging worlds through the ethereal wisdom of the void.',
        metadata: {
          type: 'wisdom',
          archetype: 'mystic',
          element: 'aether'
        }
      }
    ];
    
    await this.indexBatch(archetypes);
  }
  
  // Create ritual knowledge base
  async indexRitualKnowledge() {
    const rituals = [
      {
        id: 'ritual_morning_intention',
        content: 'Begin each day by setting three intentions. Speak them aloud to give them form, write them to give them substance, and carry them in your heart to give them life.',
        metadata: {
          type: 'ritual',
          timeOfDay: 'morning',
          element: 'air',
          tags: ['intention', 'morning', 'practice']
        }
      },
      {
        id: 'ritual_evening_release',
        content: 'As darkness falls, release the day. Light a candle for what was learned, blow it out to let go of what no longer serves, and rest in the space between.',
        metadata: {
          type: 'ritual',
          timeOfDay: 'evening',
          element: 'water',
          tags: ['release', 'evening', 'letting-go']
        }
      },
      {
        id: 'ritual_transformation',
        content: 'When ready for change, write what must transform on paper. Burn it safely while speaking gratitude for its lessons. From the ashes, plant seeds of new intention.',
        metadata: {
          type: 'ritual',
          purpose: 'transformation',
          element: 'fire',
          tags: ['transformation', 'change', 'release']
        }
      }
    ];
    
    await this.indexBatch(rituals);
  }
}