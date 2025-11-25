/**
 * LOCAL VECTOR DATABASE
 *
 * Phase 1A of AI Sovereignty Roadmap
 *
 * Instead of sending 332k token prompt every session,
 * retrieve only relevant 20k tokens based on context.
 *
 * Benefits:
 * - 70% smaller prompts (332k → 28k)
 * - 70% cost reduction
 * - Knowledge stored locally (your infrastructure)
 * - Faster responses
 *
 * Technologies:
 * - Qdrant: Vector database (can self-host)
 * - OpenAI embeddings: Convert text → vectors (can replace with local model later)
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

// ================================================================
// CONFIGURATION
// ================================================================

interface VectorDBConfig {
  qdrantUrl?: string;  // Default: http://localhost:6333
  qdrantApiKey?: string;
  collectionName?: string;
  embeddingModel?: string;
  chunkSize?: number;  // Characters per chunk
  chunkOverlap?: number; // Overlap between chunks
}

const DEFAULT_CONFIG: VectorDBConfig = {
  qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',
  qdrantApiKey: process.env.QDRANT_API_KEY,
  collectionName: 'maia_wisdom',
  embeddingModel: 'text-embedding-3-small', // OpenAI (cheap, good quality)
  chunkSize: 1000,     // ~750 tokens per chunk
  chunkOverlap: 200,   // Overlap to preserve context
};

// ================================================================
// VECTOR DATABASE CLIENT
// ================================================================

export class LocalVectorDB {
  private qdrant: QdrantClient;
  private openai: OpenAI;
  private config: VectorDBConfig;
  private collectionInitialized = false;

  constructor(config: Partial<VectorDBConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize Qdrant client
    this.qdrant = new QdrantClient({
      url: this.config.qdrantUrl,
      apiKey: this.config.qdrantApiKey,
      https: this.config.qdrantUrl?.startsWith('https'),
    });

    // Initialize OpenAI for embeddings
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Initialize collection (one-time setup)
   */
  async initialize(): Promise<void> {
    if (this.collectionInitialized) return;

    console.log('🔧 [VECTOR DB] Initializing collection...');

    try {
      // Check if collection exists
      const collections = await this.qdrant.getCollections();
      const exists = collections.collections.some(
        c => c.name === this.config.collectionName
      );

      if (!exists) {
        // Create collection
        await this.qdrant.createCollection(this.config.collectionName!, {
          vectors: {
            size: 1536, // text-embedding-3-small dimension
            distance: 'Cosine',
          },
        });
        console.log(`✅ [VECTOR DB] Collection created: ${this.config.collectionName}`);
      } else {
        console.log(`✅ [VECTOR DB] Collection exists: ${this.config.collectionName}`);
      }

      this.collectionInitialized = true;
    } catch (error) {
      console.error('❌ [VECTOR DB] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Ingest wisdom texts into vector database
   */
  async ingestWisdom(sources: {
    id: string;
    title: string;
    author?: string;
    category: string;
    content: string;
    metadata?: Record<string, any>;
  }[]): Promise<void> {
    await this.initialize();

    console.log(`📚 [VECTOR DB] Ingesting ${sources.length} wisdom sources...`);

    let totalChunks = 0;

    for (const source of sources) {
      console.log(`   Processing: ${source.title}...`);

      // Split into chunks
      const chunks = this.splitIntoChunks(source.content);

      // Generate embeddings for each chunk
      const points = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Generate embedding
        const embedding = await this.generateEmbedding(chunk);

        // Create point with UUID (required by Qdrant)
        points.push({
          id: randomUUID(),
          vector: embedding,
          payload: {
            sourceId: source.id,
            title: source.title,
            author: source.author,
            category: source.category,
            chunkIndex: i,
            totalChunks: chunks.length,
            content: chunk,
            ...source.metadata,
          },
        });

        totalChunks++;
      }

      // Upload to Qdrant
      await this.qdrant.upsert(this.config.collectionName!, {
        wait: true,
        points,
      });

      console.log(`   ✓ ${source.title}: ${chunks.length} chunks`);

      // Rate limiting (OpenAI: 3000 RPM for tier 1)
      await this.sleep(100);
    }

    console.log(`✅ [VECTOR DB] Ingestion complete: ${totalChunks} chunks from ${sources.length} sources`);
  }

  /**
   * Retrieve relevant wisdom for a query
   */
  async retrieve(options: {
    query: string;
    conversationHistory?: string;
    maxTokens?: number;
    filters?: {
      categories?: string[];
      authors?: string[];
      topics?: string[];
      sourceIds?: string[];
    };
    includeContext?: boolean; // Include adjacent chunks for continuity
  }): Promise<{
    wisdom: string;
    sources: Array<{ title: string; author?: string; category: string }>;
    tokenCount: number;
  }> {
    await this.initialize();

    const maxTokens = options.maxTokens || 20000;

    // Combine query + conversation for better retrieval
    const retrievalQuery = options.conversationHistory
      ? `${options.query}\n\nContext: ${options.conversationHistory}`
      : options.query;

    console.log('🔍 [VECTOR DB] Retrieving relevant wisdom...');
    console.log(`   Query: ${options.query.substring(0, 100)}...`);
    console.log(`   Max tokens: ${maxTokens}`);

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(retrievalQuery);

    // Build filters
    const filter: any = {};
    if (options.filters?.categories) {
      filter.category = { $in: options.filters.categories };
    }
    if (options.filters?.authors) {
      filter.author = { $in: options.filters.authors };
    }
    if (options.filters?.sourceIds) {
      filter.sourceId = { $in: options.filters.sourceIds };
    }

    // Search
    const searchResults = await this.qdrant.search(this.config.collectionName!, {
      vector: queryEmbedding,
      limit: 50, // Get top 50 chunks
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      with_payload: true,
    });

    console.log(`   Found ${searchResults.length} relevant chunks`);

    // Assemble wisdom (up to maxTokens)
    let wisdom = '';
    let tokenCount = 0;
    const sources = new Set<string>();
    const includedChunks = new Set<string>();

    for (const result of searchResults) {
      const payload = result.payload as any;
      const chunkId = result.id;

      // Estimate tokens (rough: 1 token ≈ 0.75 words)
      const chunkTokens = Math.ceil(payload.content.split(/\s+/).length * 1.33);

      // Check if we have room
      if (tokenCount + chunkTokens > maxTokens) {
        break;
      }

      // Include this chunk
      if (!includedChunks.has(chunkId as string)) {
        wisdom += `\n\n---\n## ${payload.title}${payload.author ? ` by ${payload.author}` : ''}\n\n${payload.content}\n`;
        tokenCount += chunkTokens;
        includedChunks.add(chunkId as string);
        sources.add(JSON.stringify({
          title: payload.title,
          author: payload.author,
          category: payload.category,
        }));
      }

      // Optionally include adjacent chunks for context continuity
      if (options.includeContext && tokenCount < maxTokens) {
        // TODO: Fetch adjacent chunks (chunkIndex ± 1)
      }
    }

    const uniqueSources = Array.from(sources).map(s => JSON.parse(s));

    console.log(`✅ [VECTOR DB] Retrieved ${tokenCount.toLocaleString()} tokens from ${uniqueSources.length} sources`);

    return {
      wisdom,
      sources: uniqueSources,
      tokenCount,
    };
  }

  /**
   * Generate embedding for text
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.config.embeddingModel!,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ [VECTOR DB] Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Split text into overlapping chunks
   */
  private splitIntoChunks(text: string): string[] {
    const chunkSize = this.config.chunkSize!;
    const overlap = this.config.chunkOverlap!;
    const chunks: string[] = [];

    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.substring(start, end);

      // Only add non-empty chunks
      if (chunk.trim().length > 0) {
        chunks.push(chunk);
      }

      start += chunkSize - overlap;
    }

    return chunks;
  }

  /**
   * Sleep helper (rate limiting)
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get collection statistics
   */
  async getStats(): Promise<{
    totalChunks: number;
    totalSources: number;
    byCategory: Record<string, number>;
  }> {
    await this.initialize();

    const info = await this.qdrant.getCollection(this.config.collectionName!);

    // TODO: Query for category breakdown
    // For now, return basic stats
    return {
      totalChunks: info.points_count || 0,
      totalSources: 0, // TODO: Count unique sourceIds
      byCategory: {},
    };
  }
}

// ================================================================
// HELPER: INGEST FROM MAIA'S REFERENCE LIBRARY
// ================================================================

/**
 * Ingest MAIA's complete reference library into vector DB
 */
export async function ingestMaiaReferenceLibrary(): Promise<void> {
  const vectorDB = new LocalVectorDB();

  // Load reference library manifest
  const manifestPath = path.join(__dirname, '../../prompts/revival/tier3-reference-library-manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  console.log(`📚 Ingesting MAIA reference library: ${manifest.totalBooks} books`);

  // TODO: Load actual book content (currently only excerpts in tier3-complete-reference-library.txt)
  // For now, we'll parse the formatted library file

  const libraryPath = path.join(__dirname, '../../prompts/revival/tier3-complete-reference-library.txt');
  const libraryContent = await fs.readFile(libraryPath, 'utf-8');

  // Parse sections (each book is separated by "---")
  const bookSections = libraryContent.split(/\n---\n/).filter(s => s.trim().length > 0);

  const sources = manifest.books.map((book: any, index: number) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category,
    content: bookSections[index] || '', // Match with parsed content
    metadata: {
      wordCount: book.wordCount,
      topics: book.topics,
      relevanceScore: book.relevanceScore,
    },
  }));

  await vectorDB.ingestWisdom(sources);

  console.log('✅ MAIA reference library ingested into vector database');
}

// ================================================================
// EXAMPLE USAGE
// ================================================================

/**
 * Example: Retrieve wisdom for a conversation
 */
export async function exampleRetrieval() {
  const vectorDB = new LocalVectorDB();

  const result = await vectorDB.retrieve({
    query: "I'm struggling with my shadow - parts of myself I've rejected",
    conversationHistory: "We've been exploring elemental work. User is in Water phase.",
    maxTokens: 20000,
    filters: {
      categories: ['jung', 'hillman', 'alchemy'],
      authors: ['Carl Jung', 'James Hillman'],
    },
  });

  console.log('📖 Retrieved wisdom:');
  console.log(`   Tokens: ${result.tokenCount.toLocaleString()}`);
  console.log(`   Sources: ${result.sources.map(s => s.title).join(', ')}`);

  return result;
}
