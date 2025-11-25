/**
 * Production monitoring and observability for MAIA Consciousness Lattice
 */

import { EventEmitter } from 'events';

export interface MetricPoint {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: number;
  context?: string;
  data?: any;
  error?: Error;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  checks: Record<string, {
    status: 'pass' | 'fail';
    message?: string;
    latency?: number;
  }>;
}

/**
 * Production monitoring service
 */
export class ProductionMonitor extends EventEmitter {
  private metrics: Map<string, MetricPoint[]> = new Map();
  private logs: LogEntry[] = [];
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();
  private readonly MAX_METRICS_PER_NAME = 1000;
  private readonly MAX_LOGS = 10000;
  private metricsInterval: NodeJS.Timeout | null = null;
  private healthInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startMetricsCollection();
    this.startHealthChecks();
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const point: MetricPoint = {
      name,
      value,
      timestamp: Date.now(),
      tags
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const points = this.metrics.get(name)!;
    points.push(point);

    // Trim old metrics
    if (points.length > this.MAX_METRICS_PER_NAME) {
      points.shift();
    }

    this.emit('metric', point);
  }

  /**
   * Record a counter increment
   */
  incrementCounter(name: string, tags?: Record<string, string>): void {
    const current = this.getLatestMetricValue(name) || 0;
    this.recordMetric(name, current + 1, tags);
  }

  /**
   * Record a gauge value
   */
  recordGauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric(name, value, tags);
  }

  /**
   * Record a histogram value
   */
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric(`${name}.value`, value, tags);
    this.updateHistogramStats(name, value);
  }

  /**
   * Start timing and return a function to stop
   */
  startTimer(name: string, tags?: Record<string, string>): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.recordHistogram(`${name}.duration_ms`, duration, tags);
    };
  }

  /**
   * Log a message
   */
  log(level: LogEntry['level'], message: string, context?: string, data?: any, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      data,
      error
    };

    this.logs.push(entry);

    // Trim old logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Emit for external loggers
    this.emit('log', entry);

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const prefix = context ? `[${context}]` : '';
      switch (level) {
        case 'debug':
          console.debug(`${prefix} ${message}`, data || '');
          break;
        case 'info':
          console.info(`${prefix} ${message}`, data || '');
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`, data || '');
          break;
        case 'error':
        case 'fatal':
          console.error(`${prefix} ${message}`, error || data || '');
          break;
      }
    }
  }

  // Convenience logging methods
  debug(message: string, context?: string, data?: any): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, error?: Error): void {
    this.log('error', message, context, undefined, error);
  }

  fatal(message: string, context?: string, error?: Error): void {
    this.log('fatal', message, context, undefined, error);
  }

  /**
   * Register a health check
   */
  registerHealthCheck(name: string, check: () => Promise<boolean>): void {
    this.healthChecks.set(name, check);
  }

  /**
   * Run health checks
   */
  async checkHealth(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {};
    let overallStatus: HealthStatus['status'] = 'healthy';

    for (const [name, check] of this.healthChecks) {
      const start = Date.now();
      try {
        const result = await check();
        checks[name] = {
          status: result ? 'pass' : 'fail',
          latency: Date.now() - start
        };
        if (!result) {
          overallStatus = 'degraded';
        }
      } catch (error) {
        checks[name] = {
          status: 'fail',
          message: error.message,
          latency: Date.now() - start
        };
        overallStatus = overallStatus === 'healthy' ? 'degraded' : 'unhealthy';
      }
    }

    const status: HealthStatus = {
      status: overallStatus,
      timestamp: Date.now(),
      checks
    };

    this.emit('health', status);
    return status;
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {};

    this.metrics.forEach((points, name) => {
      if (points.length === 0) return;

      const values = points.map(p => p.value);
      summary[name] = {
        count: points.length,
        latest: values[values.length - 1],
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p50: this.percentile(values, 0.5),
        p95: this.percentile(values, 0.95),
        p99: this.percentile(values, 0.99)
      };
    });

    return summary;
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 100, level?: LogEntry['level']): LogEntry[] {
    let logs = this.logs.slice(-limit);
    if (level) {
      logs = logs.filter(l => l.level === level);
    }
    return logs;
  }

  /**
   * Export metrics for external systems
   */
  exportMetrics(format: 'json' | 'prometheus' = 'json'): string {
    if (format === 'prometheus') {
      return this.exportPrometheusMetrics();
    }
    return JSON.stringify(this.getMetricsSummary(), null, 2);
  }

  private exportPrometheusMetrics(): string {
    const lines: string[] = [];

    this.metrics.forEach((points, name) => {
      if (points.length === 0) return;

      const safeName = name.replace(/[^a-zA-Z0-9_]/g, '_');
      const latest = points[points.length - 1];

      lines.push(`# TYPE ${safeName} gauge`);
      lines.push(`${safeName} ${latest.value} ${latest.timestamp}`);
    });

    return lines.join('\n');
  }

  private getLatestMetricValue(name: string): number | undefined {
    const points = this.metrics.get(name);
    if (!points || points.length === 0) return undefined;
    return points[points.length - 1].value;
  }

  private updateHistogramStats(name: string, value: number): void {
    const stats = [
      { suffix: '.count', delta: 1 },
      { suffix: '.sum', delta: value }
    ];

    stats.forEach(({ suffix, delta }) => {
      const current = this.getLatestMetricValue(name + suffix) || 0;
      this.recordMetric(name + suffix, current + delta);
    });
  }

  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * p);
    return sorted[index];
  }

  private startMetricsCollection(): void {
    // Collect system metrics every 30 seconds
    this.metricsInterval = setInterval(() => {
      // Memory usage
      const memUsage = process.memoryUsage();
      this.recordGauge('system.memory.heap_used', memUsage.heapUsed);
      this.recordGauge('system.memory.heap_total', memUsage.heapTotal);
      this.recordGauge('system.memory.rss', memUsage.rss);

      // Event loop lag (simplified)
      const start = Date.now();
      setImmediate(() => {
        const lag = Date.now() - start;
        this.recordGauge('system.event_loop.lag_ms', lag);
      });

      // Active connections (if available)
      const activeConnections = (global as any).activeConnections || 0;
      this.recordGauge('maia.connections.active', activeConnections);

    }, 30000);
  }

  private startHealthChecks(): void {
    // Run health checks every minute
    this.healthInterval = setInterval(() => {
      this.checkHealth().catch(error => {
        this.error('Health check failed', 'ProductionMonitor', error);
      });
    }, 60000);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
    }
    this.removeAllListeners();
  }
}

/**
 * Global monitor instance
 */
let globalMonitor: ProductionMonitor | null = null;

export function getMonitor(): ProductionMonitor {
  if (!globalMonitor) {
    globalMonitor = new ProductionMonitor();
  }
  return globalMonitor;
}

/**
 * Monitoring decorator for methods
 */
export function monitored(metricPrefix?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitor = getMonitor();
      const prefix = metricPrefix || `${target.constructor.name}.${propertyKey}`;
      const timer = monitor.startTimer(prefix);

      try {
        const result = await originalMethod.apply(this, args);
        monitor.incrementCounter(`${prefix}.success`);
        return result;
      } catch (error) {
        monitor.incrementCounter(`${prefix}.error`);
        monitor.error(`${prefix} failed`, target.constructor.name, error);
        throw error;
      } finally {
        timer();
      }
    };

    return descriptor;
  };
}