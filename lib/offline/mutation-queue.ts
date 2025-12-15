/**
 * Offline Mutation Queue for MAIA
 * Handles queueing and syncing of mutations when offline
 */

import React from 'react';

export interface QueuedMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'normal' | 'low';
  status: 'pending' | 'syncing' | 'failed' | 'synced';
}

export interface QueueMetrics {
  totalQueued: number;
  pending: number;
  failed: number;
  synced: number;
  oldestPending: number | null;
}

const STORAGE_KEY = 'maia_mutation_queue';
const MAX_QUEUE_SIZE = 100;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second

export class OfflineMutationQueue {
  private queue: QueuedMutation[] = [];
  private syncing = false;
  private syncListeners: Set<(metrics: QueueMetrics) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupNetworkListeners();
  }

  /**
   * Add a mutation to the queue
   */
  async enqueue(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    const item: QueuedMutation = {
      ...mutation,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: mutation.maxRetries || DEFAULT_MAX_RETRIES,
      priority: mutation.priority || 'normal',
      status: 'pending'
    };

    // If queue is full, remove oldest low-priority items
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.queue = this.queue
        .filter(m => m.priority !== 'low' || m.status !== 'pending')
        .slice(-MAX_QUEUE_SIZE + 1);
    }

    this.queue.push(item);
    await this.persistQueue();
    this.notifyListeners();

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return item.id;
  }

  /**
   * Process the queue and sync pending mutations
   */
  async processQueue(): Promise<void> {
    if (this.syncing || !navigator.onLine) {
      return;
    }

    this.syncing = true;

    try {
      // Sort by priority and timestamp
      const pendingMutations = this.queue
        .filter(m => m.status === 'pending')
        .sort((a, b) => {
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return a.timestamp - b.timestamp;
        });

      for (const mutation of pendingMutations) {
        await this.syncMutation(mutation);
      }

      // Clean up synced mutations older than 24 hours
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      this.queue = this.queue.filter(
        m => m.status !== 'synced' || m.timestamp > oneDayAgo
      );

      await this.persistQueue();
    } finally {
      this.syncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Sync a single mutation
   */
  private async syncMutation(mutation: QueuedMutation): Promise<void> {
    mutation.status = 'syncing';
    await this.persistQueue();

    try {
      const response = await fetch(mutation.endpoint, {
        method: mutation.method,
        headers: {
          'Content-Type': 'application/json',
          ...mutation.headers
        },
        body: mutation.payload ? JSON.stringify(mutation.payload) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      mutation.status = 'synced';
      console.log(`[MutationQueue] Synced mutation ${mutation.id}:`, mutation.endpoint);
    } catch (error) {
      mutation.retryCount++;

      if (mutation.retryCount >= mutation.maxRetries) {
        mutation.status = 'failed';
        console.error(`[MutationQueue] Mutation ${mutation.id} failed after ${mutation.retryCount} attempts:`, error);
      } else {
        mutation.status = 'pending';
        // Exponential backoff
        const delay = RETRY_DELAY_BASE * Math.pow(2, mutation.retryCount);
        console.warn(`[MutationQueue] Mutation ${mutation.id} failed, retrying in ${delay}ms (attempt ${mutation.retryCount}/${mutation.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    await this.persistQueue();
    this.notifyListeners();
  }

  /**
   * Get queue metrics
   */
  getMetrics(): QueueMetrics {
    const pending = this.queue.filter(m => m.status === 'pending');

    return {
      totalQueued: this.queue.length,
      pending: pending.length,
      failed: this.queue.filter(m => m.status === 'failed').length,
      synced: this.queue.filter(m => m.status === 'synced').length,
      oldestPending: pending.length > 0
        ? Math.min(...pending.map(m => m.timestamp))
        : null
    };
  }

  /**
   * Get all mutations (for debugging)
   */
  getAllMutations(): QueuedMutation[] {
    return [...this.queue];
  }

  /**
   * Retry a failed mutation
   */
  async retryMutation(id: string): Promise<void> {
    const mutation = this.queue.find(m => m.id === id);
    if (!mutation) {
      throw new Error(`Mutation ${id} not found`);
    }

    if (mutation.status === 'failed') {
      mutation.status = 'pending';
      mutation.retryCount = 0;
      await this.persistQueue();
      this.processQueue();
    }
  }

  /**
   * Clear all synced mutations
   */
  async clearSynced(): Promise<void> {
    this.queue = this.queue.filter(m => m.status !== 'synced');
    await this.persistQueue();
    this.notifyListeners();
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: (metrics: QueueMetrics) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Setup network event listeners
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[MutationQueue] Network online, processing queue...');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('[MutationQueue] Network offline, mutations will be queued');
    });

    // Also listen for visibility change (app comes to foreground)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        this.processQueue();
      }
    });
  }

  /**
   * Persist queue to localStorage
   */
  private async persistQueue(): Promise<void> {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[MutationQueue] Failed to persist queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[MutationQueue] Loaded ${this.queue.length} mutations from storage`);
      }
    } catch (error) {
      console.error('[MutationQueue] Failed to load queue:', error);
      this.queue = [];
    }
  }

  /**
   * Notify all listeners of queue changes
   */
  private notifyListeners(): void {
    const metrics = this.getMetrics();
    this.syncListeners.forEach(listener => listener(metrics));
  }

  /**
   * Generate unique ID for mutation
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let queueInstance: OfflineMutationQueue | null = null;

export function getMutationQueue(): OfflineMutationQueue {
  if (!queueInstance) {
    queueInstance = new OfflineMutationQueue();
  }
  return queueInstance;
}

// React hook for using mutation queue
export function useOfflineMutationQueue() {
  const [metrics, setMetrics] = React.useState<QueueMetrics>({
    totalQueued: 0,
    pending: 0,
    failed: 0,
    synced: 0,
    oldestPending: null
  });

  React.useEffect(() => {
    const queue = getMutationQueue();
    setMetrics(queue.getMetrics());

    const unsubscribe = queue.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  return {
    metrics,
    queue: getMutationQueue()
  };
}
