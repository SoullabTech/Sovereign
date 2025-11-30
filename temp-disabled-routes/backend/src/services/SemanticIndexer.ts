/**
 * SemanticIndexer.ts - Maya's Enhanced Memory Embedding Service
 * 
 * Builds on top of embeddingQueue.ts with:
 * - Smart chunking for long conversations
 * - Metadata extraction (elements, emotions, phases)
 * - Contextual tagging and relationship mapping
 * - Real-time indexing pipeline for journal entries + transcripts
 * - Vector similarity search with pgvector
 * 
 * Integration Points:
 * - ConversationalPipeline → indexes each exchange
 * - Journal API → indexes journal entries immediately
 * - MemoryOrchestrator → queries for context retrieval
 */

import { logger } from '../utils/logger';
import { supabase } from '../lib/supabase';
import { embeddingQueue } from './embeddingQueue';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Enhanced memory chunk interface
export interface MemoryChunk {
  id?: string;
  userId: string;
  content: string;
  contentType: 'journal' | 'conversation' | 'voice_transcript' | 'reflection';
  chunkIndex: number;
  totalChunks: number;
  parentId?: string; // Links chunks from same source
  embedding?: number[];
  metadata: MemoryMetadata;
  createdAt: string;
}

export interface MemoryMetadata {
  // Elemental resonance
  dominantElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  elementalMix?: { [key: string]: number }; // Multi-element detection
  
  // Emotional intelligence
  emotions?: string[];
  emotionalIntensity?: number; // 0-1 scale
  sentimentScore?: number; // -1 to 1
  
  // Contextual markers
  phase?: string; // Spiral phase if detected
  themes?: string[]; // Extracted topics/themes
  keywords?: string[]; // Key terms for retrieval
  
  // Relationship mapping
  personsMentioned?: string[];
  placesMentioned?: string[];
  conceptsDiscussed?: string[];
  
  // Session context
  sessionId?: string;
  conversationTurn?: number;
  voiceMetrics?: {
    duration?: number;
    speakingRate?: number;
    pauseCount?: number;
  };
  
  // Indexing metadata
  chunkingStrategy?: 'semantic' | 'sentence' | 'paragraph' | 'conversation_turn';
  extractionConfidence?: number;
  indexed_at: string;
  embedding_model: string;
}

export interface SemanticSearchQuery {
  query: string;
  userId: string;
  limit?: number;
  threshold?: number; // Similarity threshold
  contentTypes?: string[]; // Filter by content types
  timeRange?: {
    start?: string;
    end?: string;
  };
  elementalFilter?: string[]; // Filter by elements
  includeMetadata?: boolean;
}

export interface SemanticSearchResult {
  content: string;
  similarity: number;
  metadata: MemoryMetadata;
  chunkId: string;
  contentType: string;
  createdAt: string;
}

class SemanticIndexer {
  private readonly CHUNK_SIZE = 1000; // Characters per chunk
  private readonly OVERLAP_SIZE = 200; // Overlap between chunks
  private readonly MIN_CHUNK_SIZE = 300; // Minimum viable chunk

  /**
   * Index a journal entry with enhanced metadata extraction
   */
  async indexJournalEntry(
    userId: string,
    content: string,
    title?: string,
    sessionId?: string
  ): Promise<boolean> {
    try {
      logger.info('[SEMANTIC-INDEX] Processing journal entry', {
        userId,
        contentLength: content.length,
        title: title?.substring(0, 50),
      });

      // Extract metadata first
      const metadata = await this.extractMetadata(content, 'journal', sessionId);

      // Chunk the content if it's long
      const chunks = this.createChunks(content, 'semantic');
      
      let success = true;
      for (let i = 0; i < chunks.length; i++) {
        const chunk: MemoryChunk = {
          userId,
          content: chunks[i],
          contentType: 'journal',
          chunkIndex: i,
          totalChunks: chunks.length,
          parentId: `journal_${userId}_${Date.now()}`,
          metadata: {
            ...metadata,
            title,
            chunkingStrategy: 'semantic',
            extractionConfidence: metadata.extractionConfidence || 0.8,
          },
          createdAt: new Date().toISOString(),
        };

        const indexed = await this.indexChunk(chunk);
        if (!indexed) success = false;
      }

      logger.info('[SEMANTIC-INDEX] Journal entry indexed', {
        userId,
        chunks: chunks.length,
        success,
        dominantElement: metadata.dominantElement,
        themes: metadata.themes?.slice(0, 3),
      });

      return success;
    } catch (error) {
      logger.error('[SEMANTIC-INDEX] Journal indexing failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Index a conversation turn with contextual awareness
   */
  async indexConversationTurn(
    userId: string,
    userMessage: string,
    assistantMessage: string,
    sessionId: string,
    turnNumber: number,
    prosodyData?: any
  ): Promise<boolean> {
    try {
      logger.info('[SEMANTIC-INDEX] Processing conversation turn', {
        userId,
        sessionId,
        turnNumber,
        userLength: userMessage.length,
        assistantLength: assistantMessage.length,
      });

      // Combine user and assistant messages for contextual indexing
      const conversationContent = `User: ${userMessage}\n\nAssistant: ${assistantMessage}`;
      
      // Extract enhanced metadata including prosody
      const metadata = await this.extractMetadata(
        conversationContent,
        'conversation',
        sessionId,
        prosodyData
      );

      const chunk: MemoryChunk = {
        userId,
        content: conversationContent,
        contentType: 'conversation',
        chunkIndex: 0,
        totalChunks: 1,
        parentId: sessionId,
        metadata: {
          ...metadata,
          conversationTurn: turnNumber,
          prosodyElement: prosodyData?.element,
          prosodyPhase: prosodyData?.phase,
          chunkingStrategy: 'conversation_turn',
        },
        createdAt: new Date().toISOString(),
      };

      const success = await this.indexChunk(chunk);

      logger.info('[SEMANTIC-INDEX] Conversation turn indexed', {
        userId,
        sessionId,
        turnNumber,
        success,
        dominantElement: metadata.dominantElement,
        emotions: metadata.emotions?.slice(0, 2),
      });

      return success;
    } catch (error) {
      logger.error('[SEMANTIC-INDEX] Conversation indexing failed', {
        userId,
        sessionId,
        turnNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Index voice transcript with acoustic metadata
   */
  async indexVoiceTranscript(
    userId: string,
    transcript: string,
    sessionId: string,
    voiceMetrics?: {
      duration?: number;
      speakingRate?: number;
      pauseCount?: number;
    }
  ): Promise<boolean> {
    try {
      logger.info('[SEMANTIC-INDEX] Processing voice transcript', {
        userId,
        sessionId,
        transcriptLength: transcript.length,
        voiceMetrics,
      });

      const metadata = await this.extractMetadata(transcript, 'voice_transcript', sessionId);

      const chunk: MemoryChunk = {
        userId,
        content: transcript,
        contentType: 'voice_transcript',
        chunkIndex: 0,
        totalChunks: 1,
        parentId: sessionId,
        metadata: {
          ...metadata,
          voiceMetrics,
          chunkingStrategy: 'paragraph',
        },
        createdAt: new Date().toISOString(),
      };

      const success = await this.indexChunk(chunk);

      logger.info('[SEMANTIC-INDEX] Voice transcript indexed', {
        userId,
        sessionId,
        success,
        dominantElement: metadata.dominantElement,
        speakingRate: voiceMetrics?.speakingRate,
      });

      return success;
    } catch (error) {
      logger.error('[SEMANTIC-INDEX] Voice transcript indexing failed', {
        userId,
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Perform semantic search across indexed memories
   */
  async semanticSearch(params: SemanticSearchQuery): Promise<SemanticSearchResult[]> {
    try {
      logger.info('[SEMANTIC-SEARCH] Performing query', {
        userId: params.userId,
        query: params.query.substring(0, 100),
        limit: params.limit || 10,
        threshold: params.threshold || 0.7,
      });

      // Create query embedding
      const queryEmbedding = await this.createEmbedding(params.query);
      if (!queryEmbedding) {
        logger.warn('[SEMANTIC-SEARCH] Failed to create query embedding');
        return [];
      }

      // Build SQL query with pgvector similarity search
      let query = supabase
        .from('embedded_memories')
        .select(`
          content,
          metadata,
          content_type,
          created_at,
          id,
          embedding <-> '[${queryEmbedding.join(',')}]' as similarity
        `)
        .eq('user_id', params.userId)
        .order('similarity', { ascending: true })
        .limit(params.limit || 10);

      // Apply filters
      if (params.contentTypes && params.contentTypes.length > 0) {
        query = query.in('content_type', params.contentTypes);
      }

      if (params.timeRange?.start) {
        query = query.gte('created_at', params.timeRange.start);
      }

      if (params.timeRange?.end) {
        query = query.lte('created_at', params.timeRange.end);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('[SEMANTIC-SEARCH] Query failed', { error: error.message });
        return [];
      }

      // Filter by similarity threshold and elemental filters
      const results: SemanticSearchResult[] = (data || [])
        .filter((item: any) => {
          const similarity = 1 - item.similarity; // Convert distance to similarity
          if (similarity < (params.threshold || 0.7)) return false;

          if (params.elementalFilter && params.elementalFilter.length > 0) {
            const itemElement = item.metadata?.dominantElement;
            if (!itemElement || !params.elementalFilter.includes(itemElement)) {
              return false;
            }
          }

          return true;
        })
        .map((item: any) => ({
          content: item.content,
          similarity: 1 - item.similarity,
          metadata: item.metadata,
          chunkId: item.id,
          contentType: item.content_type,
          createdAt: item.created_at,
        }));

      logger.info('[SEMANTIC-SEARCH] Query completed', {
        userId: params.userId,
        resultsFound: results.length,
        avgSimilarity: results.length > 0 
          ? (results.reduce((sum, r) => sum + r.similarity, 0) / results.length).toFixed(3)
          : 0,
      });

      return results;
    } catch (error) {
      logger.error('[SEMANTIC-SEARCH] Search failed', {
        userId: params.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Get contextual memories for a conversation
   */
  async getContextualMemories(
    userId: string,
    currentMessage: string,
    sessionId?: string,
    limit = 5
  ): Promise<SemanticSearchResult[]> {
    return this.semanticSearch({
      query: currentMessage,
      userId,
      limit,
      threshold: 0.75,
      contentTypes: ['journal', 'conversation', 'reflection'],
      includeMetadata: true,
    });
  }

  /**
   * Extract metadata from content using AI
   */
  private async extractMetadata(
    content: string,
    contentType: string,
    sessionId?: string,
    prosodyData?: any
  ): Promise<MemoryMetadata> {
    try {
      // Use OpenAI to extract structured metadata
      const metadataPrompt = `Analyze this ${contentType} content and extract structured metadata:

Content: "${content.substring(0, 2000)}"

Extract:
1. Dominant element (fire/water/earth/air/aether) based on energy and tone
2. Emotions present (list up to 5)
3. Emotional intensity (0-1 scale)
4. Key themes (list up to 5)
5. Important keywords (list up to 8)
6. People mentioned (names or relationships)
7. Places mentioned
8. Concepts discussed

Return as JSON only:`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: metadataPrompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      let extractedData: any = {};
      try {
        extractedData = JSON.parse(response.choices[0].message.content || '{}');
      } catch (parseError) {
        logger.warn('[SEMANTIC-INDEX] Failed to parse metadata JSON, using fallback');
      }

      // Build metadata with fallbacks
      const metadata: MemoryMetadata = {
        dominantElement: extractedData.dominantElement || this.inferElement(content),
        emotions: extractedData.emotions || [],
        emotionalIntensity: extractedData.emotionalIntensity || 0.5,
        sentimentScore: this.calculateSentiment(content),
        themes: extractedData.themes || [],
        keywords: extractedData.keywords || [],
        personsMentioned: extractedData.personsMentioned || [],
        placesMentioned: extractedData.placesMentioned || [],
        conceptsDiscussed: extractedData.conceptsDiscussed || [],
        sessionId,
        extractionConfidence: 0.8,
        indexed_at: new Date().toISOString(),
        embedding_model: 'text-embedding-3-small',
      };

      // Add prosody data if available
      if (prosodyData) {
        metadata.phase = prosodyData.phase;
        metadata.elementalMix = prosodyData.elementalMix;
      }

      return metadata;
    } catch (error) {
      logger.warn('[SEMANTIC-INDEX] Metadata extraction failed, using fallback', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        dominantElement: this.inferElement(content),
        emotions: [],
        emotionalIntensity: 0.5,
        sentimentScore: 0,
        themes: [],
        keywords: [],
        personsMentioned: [],
        placesMentioned: [],
        conceptsDiscussed: [],
        sessionId,
        extractionConfidence: 0.3,
        indexed_at: new Date().toISOString(),
        embedding_model: 'text-embedding-3-small',
      };
    }
  }

  /**
   * Create smart chunks from content
   */
  private createChunks(content: string, strategy: 'semantic' | 'sentence' | 'paragraph' = 'semantic'): string[] {
    if (content.length <= this.CHUNK_SIZE) {
      return [content];
    }

    const chunks: string[] = [];
    
    switch (strategy) {
      case 'paragraph':
        // Split by paragraphs first, then by sentences if needed
        const paragraphs = content.split(/\n\s*\n/);
        let currentChunk = '';
        
        for (const paragraph of paragraphs) {
          if (currentChunk.length + paragraph.length <= this.CHUNK_SIZE) {
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = paragraph;
            
            // If single paragraph is too long, split by sentences
            if (currentChunk.length > this.CHUNK_SIZE) {
              chunks.push(...this.createChunks(currentChunk, 'sentence'));
              currentChunk = '';
            }
          }
        }
        
        if (currentChunk) chunks.push(currentChunk);
        break;

      case 'sentence':
        // Split by sentences with overlap
        const sentences = content.match(/[^\.!?]+[\.!?]+/g) || [content];
        let current = '';
        
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          
          if (current.length + sentence.length <= this.CHUNK_SIZE) {
            current += sentence;
          } else {
            if (current.length >= this.MIN_CHUNK_SIZE) {
              chunks.push(current.trim());
              // Add overlap
              current = sentences.slice(Math.max(0, i - 1), i).join('') + sentence;
            } else {
              current += sentence;
            }
          }
        }
        
        if (current.trim()) chunks.push(current.trim());
        break;

      default: // semantic
        // Simple sliding window with overlap for now
        // TODO: Implement true semantic chunking with sentence transformers
        for (let i = 0; i < content.length; i += this.CHUNK_SIZE - this.OVERLAP_SIZE) {
          const chunk = content.substring(i, i + this.CHUNK_SIZE);
          if (chunk.length >= this.MIN_CHUNK_SIZE) {
            chunks.push(chunk);
          }
        }
        break;
    }

    return chunks.filter(chunk => chunk.trim().length >= this.MIN_CHUNK_SIZE);
  }

  /**
   * Index a single chunk using the existing embedding queue
   */
  private async indexChunk(chunk: MemoryChunk): Promise<boolean> {
    return embeddingQueue.storeEmbeddedMemory(
      chunk.userId,
      chunk.content,
      chunk.contentType as 'journal' | 'memory' | 'conversation',
      {
        ...chunk.metadata,
        chunkIndex: chunk.chunkIndex,
        totalChunks: chunk.totalChunks,
        parentId: chunk.parentId,
      }
    );
  }

  /**
   * Create embedding using OpenAI
   */
  private async createEmbedding(content: string): Promise<number[] | null> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: content.substring(0, 8000),
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('[SEMANTIC-INDEX] Embedding creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Simple element inference based on keywords
   */
  private inferElement(content: string): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const lowerContent = content.toLowerCase();
    
    const elementKeywords = {
      fire: ['passionate', 'angry', 'energy', 'action', 'drive', 'intense', 'burning', 'excited'],
      water: ['emotional', 'flowing', 'intuitive', 'deep', 'feeling', 'tears', 'fluid', 'adaptive'],
      earth: ['grounded', 'practical', 'stable', 'concrete', 'material', 'physical', 'solid', 'rooted'],
      air: ['thinking', 'ideas', 'mental', 'communication', 'light', 'freedom', 'thoughts', 'clarity'],
      aether: ['spiritual', 'mystical', 'transcendent', 'divine', 'cosmic', 'infinite', 'sacred', 'unity'],
    };

    let maxScore = 0;
    let dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether' = 'aether';

    for (const [element, keywords] of Object.entries(elementKeywords)) {
      const score = keywords.filter(keyword => lowerContent.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        dominantElement = element as any;
      }
    }

    return dominantElement;
  }

  /**
   * Simple sentiment calculation
   */
  private calculateSentiment(content: string): number {
    // Simple sentiment based on positive/negative keywords
    const positiveWords = ['good', 'great', 'love', 'happy', 'joy', 'amazing', 'wonderful', 'excellent'];
    const negativeWords = ['bad', 'hate', 'sad', 'angry', 'terrible', 'awful', 'horrible', 'disappointed'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount + negativeCount === 0) return 0;
    
    return (positiveCount - negativeCount) / (positiveCount + negativeCount);
  }

  /**
   * Utility: Get indexing statistics
   */
  async getIndexingStats(userId?: string): Promise<any> {
    try {
      let query = supabase
        .from('embedded_memories')
        .select('content_type, metadata, created_at', { count: 'exact' });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      const stats = {
        totalMemories: count || 0,
        byContentType: {} as Record<string, number>,
        byElement: {} as Record<string, number>,
        recentActivity: 0,
      };

      // Calculate recent activity (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      data?.forEach((item: any) => {
        // Count by content type
        stats.byContentType[item.content_type] = (stats.byContentType[item.content_type] || 0) + 1;
        
        // Count by element
        const element = item.metadata?.dominantElement;
        if (element) {
          stats.byElement[element] = (stats.byElement[element] || 0) + 1;
        }
        
        // Count recent activity
        if (item.created_at >= weekAgo) {
          stats.recentActivity++;
        }
      });

      return stats;
    } catch (error) {
      logger.error('[SEMANTIC-INDEX] Stats query failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }
}

export const semanticIndexer = new SemanticIndexer();