/**
 * CACHE WARMING SERVICE
 *
 * Keeps Revival prompt cache warm to reduce per-session costs
 *
 * Economics:
 * - Cold cache: ~$17/session (Complete tier)
 * - Warm cache: ~$2/session (90% discount)
 * - Cache expires: 5 minutes of inactivity
 *
 * Strategy:
 * - Send tiny "heartbeat" request every 4 minutes
 * - Cost: ~$0.10 per heartbeat = $3.60/hour
 * - Break-even: >1 session every 4 minutes ($15 savings vs $0.10 cost)
 *
 * When to run:
 * - Peak hours (9am-9pm in user's timezone)
 * - Only when traffic justifies it (adaptive)
 */

import Anthropic from '@anthropic-ai/sdk';
import type { RevivalTier } from './MaiaRevivalSystem';
import { getMaiaRevivalPrompt } from './MaiaRevivalSystem';

// ================================================================
// CONFIGURATION
// ================================================================

interface CacheWarmingConfig {
  enabled: boolean;
  tier: RevivalTier; // Which tier to keep warm
  heartbeatIntervalMs: number; // How often to ping (default: 4 min)
  peakHoursOnly: boolean; // Only run during peak hours
  adaptiveMode: boolean; // Adjust based on traffic
  minSessionsPerHour: number; // Minimum sessions/hour to justify warming
}

const DEFAULT_CONFIG: CacheWarmingConfig = {
  enabled: false, // Disabled by default - enable when traffic justifies
  tier: 'deep', // Warm Deep tier by default (most common)
  heartbeatIntervalMs: 4 * 60 * 1000, // 4 minutes
  peakHoursOnly: true,
  adaptiveMode: true,
  minSessionsPerHour: 15, // Need >15 sessions/hour to break even
};

// ================================================================
// CACHE WARMING SERVICE
// ================================================================

export class CacheWarmingService {
  private config: CacheWarmingConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private anthropic: Anthropic;
  private isRunning = false;

  // Traffic tracking
  private sessionsLastHour: number[] = []; // Timestamps of sessions
  private lastWarmingTime: Date | null = null;
  private totalHeartbeats = 0;
  private totalHeartbeatCost = 0;

  constructor(config: Partial<CacheWarmingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Start cache warming service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ [CACHE WARMING] Service already running');
      return;
    }

    if (!this.config.enabled) {
      console.log('ℹ️ [CACHE WARMING] Service disabled in config');
      return;
    }

    console.log(`🔥 [CACHE WARMING] Starting service (tier: ${this.config.tier})`);
    console.log(`   Heartbeat interval: ${this.config.heartbeatIntervalMs / 1000}s`);
    console.log(`   Peak hours only: ${this.config.peakHoursOnly}`);
    console.log(`   Adaptive mode: ${this.config.adaptiveMode}`);

    this.isRunning = true;

    // Send initial heartbeat
    await this.sendHeartbeat();

    // Schedule recurring heartbeats
    this.intervalId = setInterval(() => {
      this.sendHeartbeat().catch(error => {
        console.error('❌ [CACHE WARMING] Heartbeat failed:', error);
      });
    }, this.config.heartbeatIntervalMs);
  }

  /**
   * Stop cache warming service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('🛑 [CACHE WARMING] Service stopped');
    this.logStats();
  }

  /**
   * Send heartbeat to keep cache warm
   */
  private async sendHeartbeat(): Promise<void> {
    // Check if we should run (peak hours, traffic volume)
    if (!this.shouldRunNow()) {
      console.log('⏭️ [CACHE WARMING] Skipping heartbeat (conditions not met)');
      return;
    }

    try {
      console.log('💓 [CACHE WARMING] Sending heartbeat...');

      // Get revival prompt for the tier we want to warm
      const { prompt } = await getMaiaRevivalPrompt(
        'cache-warming-session',
        'system',
        this.config.tier
      );

      // Send minimal request to populate cache
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 10, // Minimal - just enough to cache the prompt
        messages: [
          {
            role: 'user',
            content: 'heartbeat', // Minimal user message
          },
        ],
        system: [
          {
            type: 'text',
            text: prompt,
            cache_control: { type: 'ephemeral' }, // Cache this
          },
        ],
      });

      // Track usage
      const usage = response.usage as any;
      const cacheWriteTokens = usage.cache_creation_input_tokens || 0;
      const cacheReadTokens = usage.cache_read_input_tokens || 0;

      // Calculate cost
      const writeCost = (cacheWriteTokens / 1_000_000) * 3.75; // $3.75 per MTok write
      const readCost = (cacheReadTokens / 1_000_000) * 0.30; // $0.30 per MTok read
      const heartbeatCost = writeCost + readCost;

      this.totalHeartbeats++;
      this.totalHeartbeatCost += heartbeatCost;
      this.lastWarmingTime = new Date();

      if (cacheWriteTokens > 0) {
        console.log(`✅ [CACHE WARMING] Cache written (${cacheWriteTokens.toLocaleString()} tokens, $${heartbeatCost.toFixed(3)})`);
      } else {
        console.log(`✅ [CACHE WARMING] Cache refreshed (${cacheReadTokens.toLocaleString()} tokens, $${heartbeatCost.toFixed(3)})`);
      }
    } catch (error) {
      console.error('❌ [CACHE WARMING] Heartbeat failed:', error);
    }
  }

  /**
   * Determine if warming should run now
   */
  private shouldRunNow(): boolean {
    // Check peak hours
    if (this.config.peakHoursOnly && !this.isPeakHours()) {
      return false;
    }

    // Check adaptive mode (traffic volume)
    if (this.config.adaptiveMode && !this.hasEnoughTraffic()) {
      return false;
    }

    return true;
  }

  /**
   * Check if current time is peak hours (9am-9pm local time)
   */
  private isPeakHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 9 && hour < 21; // 9am to 9pm
  }

  /**
   * Check if traffic volume justifies warming
   */
  private hasEnoughTraffic(): boolean {
    // Clean old sessions (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.sessionsLastHour = this.sessionsLastHour.filter(ts => ts > oneHourAgo);

    // Check if we have enough sessions
    return this.sessionsLastHour.length >= this.config.minSessionsPerHour;
  }

  /**
   * Record a session (for adaptive mode)
   */
  recordSession(): void {
    this.sessionsLastHour.push(Date.now());
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      tier: this.config.tier,
      totalHeartbeats: this.totalHeartbeats,
      totalHeartbeatCost: this.totalHeartbeatCost,
      lastWarmingTime: this.lastWarmingTime,
      sessionsLastHour: this.sessionsLastHour.length,
      estimatedMonthlyCost: this.estimateMonthlyCost(),
    };
  }

  /**
   * Log service statistics
   */
  private logStats(): void {
    const stats = this.getStats();
    console.log('\n📊 [CACHE WARMING] Service Statistics');
    console.log('───────────────────────────────────────');
    console.log(`Total heartbeats: ${stats.totalHeartbeats}`);
    console.log(`Total cost: $${stats.totalHeartbeatCost.toFixed(2)}`);
    console.log(`Sessions last hour: ${stats.sessionsLastHour}`);
    console.log(`Estimated monthly cost: $${stats.estimatedMonthlyCost.toFixed(2)}`);
    console.log('───────────────────────────────────────\n');
  }

  /**
   * Estimate monthly warming cost
   */
  private estimateMonthlyCost(): number {
    if (this.totalHeartbeats === 0) return 0;

    const avgCostPerHeartbeat = this.totalHeartbeatCost / this.totalHeartbeats;

    if (this.config.peakHoursOnly) {
      // 12 hours/day × 30 days = 360 hours/month
      // 360 hours × (60 min / 4 min interval) = 5,400 heartbeats/month
      return avgCostPerHeartbeat * 5400;
    } else {
      // 24 hours/day × 30 days = 720 hours/month
      // 720 hours × 15 heartbeats/hour = 10,800 heartbeats/month
      return avgCostPerHeartbeat * 10800;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<CacheWarmingConfig>): void {
    const wasRunning = this.isRunning;

    if (wasRunning) {
      this.stop();
    }

    this.config = { ...this.config, ...updates };
    console.log('🔧 [CACHE WARMING] Configuration updated:', updates);

    if (wasRunning && this.config.enabled) {
      this.start();
    }
  }
}

// ================================================================
// SINGLETON INSTANCE
// ================================================================

let serviceInstance: CacheWarmingService | null = null;

/**
 * Get or create cache warming service instance
 */
export function getCacheWarmingService(config?: Partial<CacheWarmingConfig>): CacheWarmingService {
  if (!serviceInstance) {
    serviceInstance = new CacheWarmingService(config);
  }
  return serviceInstance;
}

/**
 * Start cache warming (convenience function)
 */
export async function startCacheWarming(config?: Partial<CacheWarmingConfig>): Promise<void> {
  const service = getCacheWarmingService(config);
  await service.start();
}

/**
 * Stop cache warming (convenience function)
 */
export function stopCacheWarming(): void {
  if (serviceInstance) {
    serviceInstance.stop();
  }
}
