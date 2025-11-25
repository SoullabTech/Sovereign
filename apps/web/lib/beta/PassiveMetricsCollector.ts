/**
 * Passive Metrics Collector
 * Lightweight, non-blocking metrics collection that runs async
 * Zero performance impact on MAIA's core functionality
 */

export interface PassiveMetric {
  timestamp: Date;
  metricType: string;
  data: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface AggregatedMetrics {
  // Conversation Quality
  conversationQuality: {
    averageResponseTime: number;
    responseTimeDistribution: { fast: number; medium: number; slow: number };
    errorRate: number;
    retryRate: number;
    userSatisfaction: number; // Inferred from engagement
  };

  // Memory Performance
  memoryPerformance: {
    hitRate: number; // % of times memory was successfully recalled
    falsePositiveRate: number; // % of times irrelevant memories surfaced
    recallLatency: number; // Time to fetch memories
    memoryAccuracy: number; // User feedback on recall accuracy
  };

  // Voice Quality
  voiceQuality: {
    synthesisLatency: number;
    audioPlaybackIssues: number;
    voiceChanges: number; // Track how often users change voice
    mostPopularVoice: string;
  };

  // User Engagement
  userEngagement: {
    averageSessionLength: number;
    messagesPerSession: number;
    returnRate: number; // % who return after first session
    dropoffPoints: string[]; // Where users typically stop
  };

  // Elemental Distribution
  elementalDistribution: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };

  // Archetypal Patterns
  archetypalPatterns: {
    mostCommon: string[];
    shadowWorkRate: number;
    breakthroughRate: number;
    archetypeTransitions: Record<string, number>;
  };

  // Field Intelligence
  fieldIntelligence: {
    averageResonance: number;
    sacredMoments: number;
    emergenceSources: Record<string, number>;
    adaptationSuccess: number;
  };

  // Technical Health
  technicalHealth: {
    uptime: number;
    cacheHitRate: number;
    databaseLatency: number;
    memoryUsage: number;
  };
}

class PassiveMetricsCollector {
  private metricsBuffer: PassiveMetric[] = [];
  private readonly MAX_BUFFER_SIZE = 1000;
  private readonly FLUSH_INTERVAL = 30000; // 30s
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startBackgroundFlush();
  }

  // Collect metric asynchronously (non-blocking)
  async collect(metricType: string, data: Record<string, any>, userId?: string, sessionId?: string): Promise<void> {
    // Use setImmediate to ensure this doesn't block
    setImmediate(() => {
      try {
        const metric: PassiveMetric = {
          timestamp: new Date(),
          metricType,
          data,
          userId,
          sessionId
        };

        this.metricsBuffer.push(metric);

        // Auto-flush if buffer is full
        if (this.metricsBuffer.length >= this.MAX_BUFFER_SIZE) {
          this.flush();
        }
      } catch (error) {
        // Silently fail - metrics should never crash the app
        console.error('Passive metric collection failed:', error);
      }
    });
  }

  // Flush buffer to storage (async, non-blocking)
  private async flush(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];

    // Process in background
    setImmediate(async () => {
      try {
        // TODO: Send to backend/analytics service
        // For now, just log summary
        const summary = this.generateSummary(metrics);
        console.log('📊 Metrics flushed:', summary);

        // Store in IndexedDB for offline analysis
        await this.storeInIndexedDB(metrics);
      } catch (error) {
        console.error('Metrics flush failed:', error);
      }
    });
  }

  private generateSummary(metrics: PassiveMetric[]): Record<string, any> {
    const summary: Record<string, any> = {};

    // Group by metric type
    metrics.forEach(metric => {
      if (!summary[metric.metricType]) {
        summary[metric.metricType] = 0;
      }
      summary[metric.metricType]++;
    });

    return {
      total: metrics.length,
      byType: summary,
      timeRange: {
        start: metrics[0]?.timestamp,
        end: metrics[metrics.length - 1]?.timestamp
      }
    };
  }

  private async storeInIndexedDB(metrics: PassiveMetric[]): Promise<void> {
    // Only run in browser
    if (typeof window === 'undefined' || !window.indexedDB) return;

    try {
      const dbName = 'maia_metrics';
      const storeName = 'passive_metrics';

      const request = indexedDB.open(dbName, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          const objectStore = db.createObjectStore(storeName, { keyPath: 'timestamp' });
          objectStore.createIndex('metricType', 'metricType', { unique: false });
          objectStore.createIndex('userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);

        metrics.forEach(metric => {
          objectStore.add({
            ...metric,
            timestamp: metric.timestamp.getTime() // Convert to number for indexing
          });
        });
      };
    } catch (error) {
      console.error('IndexedDB storage failed:', error);
    }
  }

  private startBackgroundFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  // Clean up
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(); // Final flush
  }

  // Get aggregated metrics (for dashboard)
  async getAggregatedMetrics(timeRange?: { start: Date; end: Date }): Promise<AggregatedMetrics> {
    // TODO: Query IndexedDB and aggregate
    // For now, return mock data structure
    return {
      conversationQuality: {
        averageResponseTime: 0,
        responseTimeDistribution: { fast: 0, medium: 0, slow: 0 },
        errorRate: 0,
        retryRate: 0,
        userSatisfaction: 0
      },
      memoryPerformance: {
        hitRate: 0,
        falsePositiveRate: 0,
        recallLatency: 0,
        memoryAccuracy: 0
      },
      voiceQuality: {
        synthesisLatency: 0,
        audioPlaybackIssues: 0,
        voiceChanges: 0,
        mostPopularVoice: 'shimmer'
      },
      userEngagement: {
        averageSessionLength: 0,
        messagesPerSession: 0,
        returnRate: 0,
        dropoffPoints: []
      },
      elementalDistribution: {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        aether: 0
      },
      archetypalPatterns: {
        mostCommon: [],
        shadowWorkRate: 0,
        breakthroughRate: 0,
        archetypeTransitions: {}
      },
      fieldIntelligence: {
        averageResonance: 0,
        sacredMoments: 0,
        emergenceSources: {},
        adaptationSuccess: 0
      },
      technicalHealth: {
        uptime: 0.99,
        cacheHitRate: 0,
        databaseLatency: 0,
        memoryUsage: 0
      }
    };
  }
}

// Singleton instance
export const passiveMetrics = new PassiveMetricsCollector();

// Convenience methods for common metrics
export const trackResponseTime = (ms: number, userId?: string) => {
  passiveMetrics.collect('response_time', { durationMs: ms }, userId);
};

export const trackMemoryRecall = (success: boolean, itemsRecalled: number, userId?: string) => {
  passiveMetrics.collect('memory_recall', { success, itemsRecalled }, userId);
};

export const trackVoiceEvent = (event: 'synthesis' | 'playback' | 'error', details: any, userId?: string) => {
  passiveMetrics.collect('voice_event', { event, ...details }, userId);
};

export const trackUserEngagement = (action: string, metadata: any, userId?: string) => {
  passiveMetrics.collect('user_engagement', { action, ...metadata }, userId);
};

export const trackArchetypalEvent = (archetype: string, event: 'detected' | 'transition' | 'shadow', userId?: string) => {
  passiveMetrics.collect('archetypal_event', { archetype, event }, userId);
};

export const trackFieldIntelligence = (resonance: number, source: string, userId?: string) => {
  passiveMetrics.collect('field_intelligence', { resonance, source }, userId);
};

export const trackError = (error: Error, context: string, userId?: string) => {
  passiveMetrics.collect('error', {
    message: error.message,
    context,
    stack: error.stack?.slice(0, 500) // Truncate for storage
  }, userId);
};