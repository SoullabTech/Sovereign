import { OpenAI } from 'openai';
import { logger } from '../utils/logger';
import { supabase } from '../lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface EmbeddingJob {
  id: string;
  userId: string;
  content: string;
  contentType: 'journal' | 'memory' | 'conversation';
  retryCount: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface EmbeddingResult {
  embedding: number[];
  metadata?: Record<string, any>;
}

class EmbeddingQueue {
  private queue: EmbeddingJob[] = [];
  private processing: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 30000; // 30 seconds

  async storeEmbeddedMemory(
    userId: string,
    content: string,
    contentType: 'journal' | 'memory' | 'conversation',
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Try immediate embedding first
      const result = await this.createEmbedding(content);
      
      if (result) {
        await this.saveToSupabase(userId, content, result, contentType, metadata);
        logger.info('[EMBED] Content indexed immediately', {
          userId,
          contentType,
          contentLength: content.length
        });
        return true;
      }
      
      // If immediate fails, queue for retry
      return await this.queueForRetry(userId, content, contentType, metadata);
      
    } catch (error) {
      logger.warn('[EMBED] Immediate indexing failed, queuing for retry', {
        userId,
        contentType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return await this.queueForRetry(userId, content, contentType, metadata);
    }
  }

  private async queueForRetry(
    userId: string,
    content: string,
    contentType: 'journal' | 'memory' | 'conversation',
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const job: EmbeddingJob = {
      id: `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      content,
      contentType,
      retryCount: 0,
      metadata,
      createdAt: new Date().toISOString()
    };

    this.queue.push(job);
    logger.info('[EMBED-QUEUE] Job queued for retry', {
      jobId: job.id,
      userId,
      contentType,
      queueLength: this.queue.length
    });

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return true;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    logger.info('[EMBED-QUEUE] Processing queue', { queueLength: this.queue.length });

    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      await this.processJob(job);
      
      // Small delay between jobs to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processing = false;
    logger.info('[EMBED-QUEUE] Queue processing completed');
  }

  private async processJob(job: EmbeddingJob): Promise<void> {
    try {
      logger.info('[EMBED-QUEUE] Processing job', {
        jobId: job.id,
        userId: job.userId,
        contentType: job.contentType,
        attempt: job.retryCount + 1
      });

      const result = await this.createEmbedding(job.content);
      
      if (result) {
        await this.saveToSupabase(
          job.userId,
          job.content,
          result,
          job.contentType,
          job.metadata
        );
        
        logger.info('[EMBED-QUEUE] Job completed successfully', {
          jobId: job.id,
          userId: job.userId,
          contentType: job.contentType
        });
      } else {
        throw new Error('Failed to create embedding');
      }

    } catch (error) {
      job.retryCount++;
      
      if (job.retryCount < this.MAX_RETRIES) {
        logger.warn('[EMBED-QUEUE] Job failed, scheduling retry', {
          jobId: job.id,
          userId: job.userId,
          contentType: job.contentType,
          attempt: job.retryCount,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        // Schedule retry after delay
        setTimeout(() => {
          this.queue.push(job);
          if (!this.processing) {
            this.processQueue();
          }
        }, this.RETRY_DELAY);
        
      } else {
        logger.error('[EMBED-QUEUE] Job failed permanently after max retries', {
          jobId: job.id,
          userId: job.userId,
          contentType: job.contentType,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async createEmbedding(content: string): Promise<EmbeddingResult | null> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: content.substring(0, 8000), // Limit content length
      });

      return {
        embedding: response.data[0].embedding
      };
      
    } catch (error) {
      logger.error('[EMBED] OpenAI embedding creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        contentLength: content.length
      });
      return null;
    }
  }

  private async saveToSupabase(
    userId: string,
    content: string,
    result: EmbeddingResult,
    contentType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const payload = {
      user_id: userId,
      content: content,
      content_type: contentType,
      embedding: result.embedding,
      metadata: {
        ...(metadata || {}),
        indexed_at: new Date().toISOString(),
        embedding_model: 'text-embedding-3-small'
      }
    };

    const { error } = await supabase
      .from('embedded_memories')
      .insert([payload]);

    if (error) {
      throw new Error(`Failed to save to Supabase: ${error.message}`);
    }
  }

  // Utility methods
  getQueueStatus(): { queueLength: number; processing: boolean } {
    return {
      queueLength: this.queue.length,
      processing: this.processing
    };
  }

  async retryFailedJobs(): Promise<void> {
    if (!this.processing) {
      this.processQueue();
    }
  }
}

export const embeddingQueue = new EmbeddingQueue();