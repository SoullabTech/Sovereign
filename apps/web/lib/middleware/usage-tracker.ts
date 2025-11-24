/**
 * Usage Tracker Middleware
 *
 * Middleware for tracking API usage, rate limiting, and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { eventTracking } from '@/lib/services/eventTracking';

export interface UsageMetrics {
  endpoint: string;
  method: string;
  timestamp: Date;
  duration?: number;
  statusCode?: number;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

class UsageTracker {
  private requests: Map<string, number[]> = new Map();
  private metrics: UsageMetrics[] = [];

  trackRequest(req: NextRequest, startTime: number, statusCode: number, userId?: string): void {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const metrics: UsageMetrics = {
      endpoint: req.nextUrl.pathname,
      method: req.method,
      timestamp: new Date(startTime),
      duration,
      statusCode,
      userId,
      userAgent: req.headers.get('user-agent') || undefined,
      ipAddress: this.getClientIp(req)
    };

    this.metrics.push(metrics);

    // Track via event tracking service
    eventTracking.track('api_request', {
      endpoint: metrics.endpoint,
      method: metrics.method,
      duration: metrics.duration,
      statusCode: metrics.statusCode,
      userAgent: metrics.userAgent
    }, userId);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  checkRateLimit(req: NextRequest, config: RateLimitConfig): boolean {
    const key = this.getRateLimitKey(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing requests for this key
    const requests = this.requests.get(key) || [];

    // Filter requests within the current window
    const requestsInWindow = requests.filter(time => time > windowStart);

    // Update the requests array
    this.requests.set(key, requestsInWindow);

    // Check if limit exceeded
    return requestsInWindow.length < config.maxRequests;
  }

  incrementRateLimit(req: NextRequest): void {
    const key = this.getRateLimitKey(req);
    const now = Date.now();

    const requests = this.requests.get(key) || [];
    requests.push(now);
    this.requests.set(key, requests);
  }

  private getRateLimitKey(req: NextRequest): string {
    // Combine IP and user agent for rate limiting
    const ip = this.getClientIp(req);
    const userAgent = req.headers.get('user-agent');
    return `${ip}:${userAgent}`;
  }

  private getClientIp(req: NextRequest): string {
    // Try various headers for getting client IP
    const xForwardedFor = req.headers.get('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }

    const xRealIp = req.headers.get('x-real-ip');
    if (xRealIp) {
      return xRealIp;
    }

    // Fallback to connection remote address
    return req.headers.get('x-forwarded-for') || 'unknown';
  }

  getMetrics(filter?: Partial<UsageMetrics>): UsageMetrics[] {
    if (!filter) return [...this.metrics];

    return this.metrics.filter(metric => {
      for (const [key, value] of Object.entries(filter)) {
        if (metric[key as keyof UsageMetrics] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  getUsageStats(timeWindow?: number): {
    totalRequests: number;
    uniqueUsers: number;
    averageResponseTime: number;
    errorRate: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  } {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    const relevantMetrics = this.metrics.filter(
      metric => metric.timestamp.getTime() > windowStart
    );

    const totalRequests = relevantMetrics.length;
    const uniqueUsers = new Set(relevantMetrics.map(m => m.userId).filter(Boolean)).size;

    const responseTimes = relevantMetrics
      .map(m => m.duration)
      .filter(Boolean) as number[];
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const errors = relevantMetrics.filter(m => m.statusCode && m.statusCode >= 400);
    const errorRate = totalRequests > 0 ? errors.length / totalRequests : 0;

    // Count requests by endpoint
    const endpointCounts = new Map<string, number>();
    relevantMetrics.forEach(metric => {
      const count = endpointCounts.get(metric.endpoint) || 0;
      endpointCounts.set(metric.endpoint, count + 1);
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests,
      uniqueUsers,
      averageResponseTime,
      errorRate,
      topEndpoints
    };
  }

  // Admin methods for usage summary - implemented as stubs for now
  async getUserSummary(userId: string, days: number = 7): Promise<any> {
    console.log(`[USAGE] Getting summary for user ${userId} (${days} days)`);

    // Return stub data - this should be implemented with actual database queries
    return {
      userId,
      period: `${days} days`,
      totalRequests: 0,
      totalCost: '$0.00',
      dailyBreakdown: [],
      quotaStatus: 'ok'
    };
  }

  async getSystemSummary(days: number = 7): Promise<any> {
    console.log(`[USAGE] Getting system summary (${days} days)`);

    // Return stub data - this should be implemented with actual database queries
    return {
      period: `${days} days`,
      totalUsers: 0,
      totalRequests: 0,
      totalCost: '$0.00',
      activeUsers: 0,
      topEndpoints: []
    };
  }

  async checkQuota(userId: string): Promise<any> {
    console.log(`[USAGE] Checking quota for user ${userId}`);

    // Return stub data - this should be implemented with actual database queries
    return {
      quota: 100,
      used: 0,
      remaining: 100,
      allowed: true,
      reason: 'Within limits'
    };
  }
}

export const usageTracker = new UsageTracker();

// Default rate limit configurations
export const defaultRateLimit: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
};

export const strictRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10
};

export const generousRateLimit: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000
};

// Middleware factory
export function createUsageMiddleware(config: RateLimitConfig = defaultRateLimit) {
  return async function usageMiddleware(req: NextRequest): Promise<NextResponse | undefined> {
    const startTime = Date.now();

    // Check rate limit
    if (!usageTracker.checkRateLimit(req, config)) {
      const response = NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );

      usageTracker.trackRequest(req, startTime, 429);
      return response;
    }

    // Increment rate limit counter
    usageTracker.incrementRateLimit(req);

    // Continue with request - tracking will happen in response
    return undefined;
  };
}

// Response tracking function
export function trackResponse(req: NextRequest, response: NextResponse, startTime: number, userId?: string): void {
  usageTracker.trackRequest(req, startTime, response.status, userId);
}

export default usageTracker;