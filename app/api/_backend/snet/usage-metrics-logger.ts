/**
 * Usage Metrics Logger for SingularityNET AGI Marketplace
 * Tracks service usage for billing and analytics
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UsageMetric {
  timestamp: string;
  requestId: string;
  userId: string;
  method: string;
  archetype: string;
  inputLength: number;
  outputLength: number;
  processingTimeMs: number;
  includesVoice: boolean;
  voiceDurationMs?: number;
  agixCharged: number;
  status: "success" | "error";
  errorMessage?: string;
}

export class UsageMetricsLogger {
  private logPath: string;
  private metricsBuffer: UsageMetric[] = [];
  private flushInterval: NodeJS.Timer;

  constructor() {
    this.logPath =
      process.env.METRICS_LOG_PATH ||
      path.join(__dirname, "../../../logs/snet-usage");
    this.ensureLogDirectory();

    // Flush metrics every 60 seconds
    this.flushInterval = setInterval(() => this.flushMetrics(), 60000);
  }

  /**
   * Log a service usage event
   */
  async logUsage(params: {
    requestId: string;
    userId: string;
    method: string;
    archetype: string;
    input: string;
    output: string;
    startTime: number;
    includesVoice: boolean;
    voiceDurationMs?: number;
    status: "success" | "error";
    errorMessage?: string;
  }): Promise<void> {
    const endTime = Date.now();
    const processingTimeMs = endTime - params.startTime;

    // Calculate AGIX charge based on method
    const agixCharged = this.calculateAgixCharge(
      params.method,
      params.includesVoice,
    );

    const metric: UsageMetric = {
      timestamp: new Date().toISOString(),
      requestId: params.requestId,
      userId: params.userId,
      method: params.method,
      archetype: params.archetype,
      inputLength: params.input.length,
      outputLength: params.output.length,
      processingTimeMs,
      includesVoice: params.includesVoice,
      voiceDurationMs: params.voiceDurationMs,
      agixCharged,
      status: params.status,
      errorMessage: params.errorMessage,
    };

    this.metricsBuffer.push(metric);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Usage Metric:", {
        requestId: metric.requestId,
        method: metric.method,
        archetype: metric.archetype,
        processingTimeMs: metric.processingTimeMs,
        agixCharged: metric.agixCharged,
      });
    }

    // Immediate flush for errors
    if (params.status === "error") {
      await this.flushMetrics();
    }
  }

  /**
   * Calculate AGIX charge based on pricing model
   */
  private calculateAgixCharge(method: string, includesVoice: boolean): number {
    const pricing = {
      ProcessQuery: includesVoice ? 0.00002 : 0.00001,
      StreamInsights: 0.00005,
      SynthesizeVoice: 0.000015,
    };

    return pricing[method] || 0.00001;
  }

  /**
   * Flush metrics buffer to disk
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const date = new Date();
    const filename = `usage-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}.jsonl`;
    const filepath = path.join(this.logPath, filename);

    const linesToWrite =
      this.metricsBuffer.map((metric) => JSON.stringify(metric)).join("\n") +
      "\n";

    try {
      await fs.promises.appendFile(filepath, linesToWrite);
      console.log(
        `✅ Flushed ${this.metricsBuffer.length} metrics to ${filename}`,
      );
      this.metricsBuffer = [];
    } catch (error) {
      console.error("❌ Failed to flush metrics:", error);
    }
  }

  /**
   * Get usage statistics for reporting
   */
  async getUsageStats(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalAgixEarned: number;
    averageProcessingTime: number;
    topArchetypes: { archetype: string; count: number }[];
    methodBreakdown: { method: string; count: number; agixEarned: number }[];
  }> {
    const metrics = await this.loadMetricsInRange(startDate, endDate);

    const stats = {
      totalRequests: metrics.length,
      successfulRequests: metrics.filter((m) => m.status === "success").length,
      failedRequests: metrics.filter((m) => m.status === "error").length,
      totalAgixEarned: metrics.reduce((sum, m) => sum + m.agixCharged, 0),
      averageProcessingTime:
        metrics.reduce((sum, m) => sum + m.processingTimeMs, 0) /
        metrics.length,
      topArchetypes: this.getTopArchetypes(metrics),
      methodBreakdown: this.getMethodBreakdown(metrics),
    };

    return stats;
  }

  /**
   * Load metrics within date range
   */
  private async loadMetricsInRange(
    startDate: Date,
    endDate: Date,
  ): Promise<UsageMetric[]> {
    const metrics: UsageMetric[] = [];
    const files = await fs.promises.readdir(this.logPath);

    for (const file of files) {
      if (!file.startsWith("usage-") || !file.endsWith(".jsonl")) continue;

      const filepath = path.join(this.logPath, file);
      const content = await fs.promises.readFile(filepath, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const metric = JSON.parse(line) as UsageMetric;
          const metricDate = new Date(metric.timestamp);

          if (metricDate >= startDate && metricDate <= endDate) {
            metrics.push(metric);
          }
        } catch (error) {
          console.error("Failed to parse metric line:", error);
        }
      }
    }

    return metrics;
  }

  /**
   * Get top used archetypes
   */
  private getTopArchetypes(
    metrics: UsageMetric[],
  ): { archetype: string; count: number }[] {
    const counts = metrics.reduce(
      (acc, m) => {
        acc[m.archetype] = (acc[m.archetype] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts)
      .map(([archetype, count]) => ({ archetype, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Get method usage breakdown
   */
  private getMethodBreakdown(
    metrics: UsageMetric[],
  ): { method: string; count: number; agixEarned: number }[] {
    const breakdown = metrics.reduce(
      (acc, m) => {
        if (!acc[m.method]) {
          acc[m.method] = { count: 0, agixEarned: 0 };
        }
        acc[m.method].count++;
        acc[m.method].agixEarned += m.agixCharged;
        return acc;
      },
      {} as Record<string, { count: number; agixEarned: number }>,
    );

    return Object.entries(breakdown)
      .map(([method, data]) => ({ method, ...data }))
      .sort((a, b) => b.agixEarned - a.agixEarned);
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown(): Promise<void> {
    clearInterval(this.flushInterval);
    await this.flushMetrics();
  }
}

// Singleton instance
export const metricsLogger = new UsageMetricsLogger();

// Graceful shutdown
process.on("SIGINT", async () => {
  await metricsLogger.shutdown();
});
