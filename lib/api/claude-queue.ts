/**
 * Claude API Request Queue
 *
 * Manages sequential processing of Claude API requests to prevent rate limiting.
 * Implements intelligent spacing between requests and provides metrics.
 *
 * Usage:
 *   import { claudeQueue } from '@/lib/api/claude-queue';
 *   const response = await claudeQueue.add(() => fetch(...));
 */

interface QueuedRequest<T> {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  userId: string;
  timestamp: number;
}

interface QueueMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageWaitTime: number;
  currentQueueLength: number;
  lastProcessedAt: number | null;
}

class ClaudeRequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private processing = false;
  private minDelay = 1500; // 1.5 seconds between requests
  private maxDelay = 10000; // Maximum 10 seconds delay
  private metrics: QueueMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageWaitTime: 0,
    currentQueueLength: 0,
    lastProcessedAt: null
  };

  /**
   * Add a request to the queue
   * @param fn Function that returns a Promise (your API call)
   * @param userId User identifier for tracking
   * @returns Promise that resolves with your API response
   */
  async add<T>(fn: () => Promise<T>, userId: string = 'anonymous'): Promise<T> {
    const timestamp = Date.now();

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        execute: fn,
        resolve,
        reject,
        userId,
        timestamp
      });

      this.metrics.currentQueueLength = this.queue.length;
      this.metrics.totalRequests++;

      console.log(`📥 [QUEUE] Request added for ${userId} (queue: ${this.queue.length})`);

      // Start processing if not already running
      this.process();
    });
  }

  /**
   * Process the queue sequentially
   */
  private async process() {
    // Already processing or queue is empty
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`🔄 [QUEUE] Starting to process ${this.queue.length} requests`);

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      const waitTime = Date.now() - request.timestamp;

      // Update average wait time
      const totalWaitTime = this.metrics.averageWaitTime * (this.metrics.totalRequests - 1);
      this.metrics.averageWaitTime = (totalWaitTime + waitTime) / this.metrics.totalRequests;

      try {
        console.log(`⚡ [QUEUE] Processing request for ${request.userId} (waited ${waitTime}ms)`);

        const result = await request.execute();
        request.resolve(result);

        this.metrics.successfulRequests++;
        this.metrics.lastProcessedAt = Date.now();

        console.log(`✅ [QUEUE] Request completed for ${request.userId}`);

      } catch (error) {
        console.error(`❌ [QUEUE] Request failed for ${request.userId}:`, error);
        request.reject(error);

        this.metrics.failedRequests++;
      }

      this.metrics.currentQueueLength = this.queue.length;

      // Wait before processing next request (rate limiting prevention)
      if (this.queue.length > 0) {
        // Adaptive delay: longer delay if queue is backing up
        const adaptiveDelay = Math.min(
          this.minDelay + (this.queue.length * 200), // +200ms per queued request
          this.maxDelay
        );

        console.log(`⏱️  [QUEUE] Waiting ${adaptiveDelay}ms before next request (queue: ${this.queue.length})`);
        await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
      }
    }

    console.log(`✨ [QUEUE] All requests processed`);
    this.processing = false;
  }

  /**
   * Get current queue metrics
   */
  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is healthy (not backing up)
   */
  isHealthy(): boolean {
    return this.queue.length < 10; // Alert if more than 10 requests queued
  }

  /**
   * Log current status
   */
  logStatus() {
    const metrics = this.getMetrics();
    console.log(`📊 [QUEUE METRICS]`, {
      total: metrics.totalRequests,
      successful: metrics.successfulRequests,
      failed: metrics.failedRequests,
      successRate: ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1) + '%',
      avgWaitTime: metrics.averageWaitTime.toFixed(0) + 'ms',
      currentQueue: metrics.currentQueueLength,
      healthy: this.isHealthy() ? '✅' : '⚠️'
    });
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageWaitTime: 0,
      currentQueueLength: this.queue.length,
      lastProcessedAt: null
    };
    console.log(`🔄 [QUEUE] Metrics reset`);
  }
}

// Singleton instance
export const claudeQueue = new ClaudeRequestQueue();

// Export types for use in other files
export type { QueueMetrics };
