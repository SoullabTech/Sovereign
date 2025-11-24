import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
// Stub DI container
function get<T>(token: any): T {
  return {} as T;
}
function wireDI() {
  // No-op
}
const TOKENS = {
  SSE_HUB: Symbol('SSE_HUB'),
  VOICE_QUEUE: Symbol('VOICE_QUEUE'),
  VOICE_EVENT_BUS: Symbol('VOICE_EVENT_BUS'),
  Cache: Symbol('Cache')
};

// Stub types
type SimpleCache = any;
type SseHub = any;
type VoiceQueue = any;
type VoiceEventBus = any;
// Temporarily stub out backend imports that are excluded from build
// import { get } from '../../../../backend/src/core/di/container';
// Temporarily stub out backend imports that are excluded from build
// import { TOKENS } from '../../../../backend/src/core/di/tokens';
// Temporarily stub out backend imports that are excluded from build
// import { wireDI } from '../../../../backend/src/bootstrap/di';
// Temporarily stub out backend imports that are excluded from build
// import { SimpleCache } from '../../../../backend/src/core/implementations/SimpleCache';
// Temporarily stub out backend imports that are excluded from build
// import { SseHub } from '../../../../backend/src/core/events/SseHub';
// Temporarily stub out backend imports that are excluded from build
// import { VoiceQueue } from '../../../../backend/src/services/VoiceQueue';

let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    wireDI();
    initialized = true;
  }
}

// Simple metrics collector
class MetricsCollector {
  private latencies: number[] = [];
  private readonly maxSamples = 1000;

  addLatency(ms: number) {
    this.latencies.push(ms);
    if (this.latencies.length > this.maxSamples) {
      this.latencies.shift(); // Remove oldest
    }
  }

  getPercentile(p: number): number {
    if (this.latencies.length === 0) return 0;
    
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const index = Math.min(
      sorted.length - 1, 
      Math.floor((p / 100) * sorted.length)
    );
    
    return sorted[index];
  }

  getStats() {
    return {
      count: this.latencies.length,
      p50: this.getPercentile(50),
      p95: this.getPercentile(95),
      p99: this.getPercentile(99),
      min: this.latencies.length > 0 ? Math.min(...this.latencies) : 0,
      max: this.latencies.length > 0 ? Math.max(...this.latencies) : 0,
      avg: this.latencies.length > 0 
        ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length 
        : 0
    };
  }
}

const metrics = new MetricsCollector();

export async function GET(request: NextRequest) {
  ensureInitialized();
  
  try {
    const startTime = Date.now();
    
    // Get system components
    const cache = get<SimpleCache>(TOKENS.Cache);
    const sseHub = get<SseHub>(TOKENS.SSE_HUB);
    const voiceQueue = get<VoiceQueue>(TOKENS.VOICE_QUEUE);
    
    // Collect health metrics
    const cacheStats = cache.getStats();
    const voiceQueueStats = voiceQueue.getQueueStatus();
    const sseStats = {
      activeUsers: sseHub.getActiveUsers().length,
      totalClients: sseHub.getClientCount()
    };
    
    const responseTime = Date.now() - startTime;
    metrics.addLatency(responseTime);
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      metrics: {
        responseTime,
        latency: metrics.getStats()
      },
      services: {
        cache: {
          ...cacheStats,
          status: 'healthy'
        },
        voiceQueue: {
          ...voiceQueueStats,
          status: voiceQueueStats.queueLength < 100 ? 'healthy' : 'degraded'
        },
        sse: {
          ...sseStats,
          status: 'healthy'
        }
      },
      version: '2.0-streamlined',
      architecture: 'DI-container'
    };
    
    // Determine overall health
    const hasIssues = 
      voiceQueueStats.queueLength > 100 ||
      cacheStats.size > cacheStats.maxSize * 0.9 ||
      responseTime > 1000;
    
    if (hasIssues) {
      health.status = 'degraded';
    }
    
    return Response.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Health-Check': 'true'
      }
    });
    
  } catch (error: any) {
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Health check failed'
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Health-Check': 'true'
      }
    });
  }
}