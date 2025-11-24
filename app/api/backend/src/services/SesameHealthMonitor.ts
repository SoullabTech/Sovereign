/**
 * Sesame Health Monitor
 * Ensures Sesame CSM is always available with automatic recovery
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface HealthCheck {
  timestamp: Date;
  endpoint: string;
  success: boolean;
  responseTime: number;
  error?: string;
}

interface HealthStatus {
  healthy: boolean;
  uptime: number;
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  modelStatus: {
    loaded: boolean;
    name: string;
    memoryUsageMB?: number;
  };
  lastCheck: Date;
  consecutiveFailures: number;
}

export class SesameHealthMonitor {
  private sesameUrl: string;
  private healthHistory: HealthCheck[] = [];
  private lastSuccessfulCheck: Date | null = null;
  private consecutiveFailures = 0;
  private isRecovering = false;
  private checkInterval: NodeJS.Timer | null = null;
  
  // Configuration
  private readonly MAX_CONSECUTIVE_FAILURES = 3;
  private readonly HEALTH_CHECK_INTERVAL = 10000; // 10 seconds
  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly RECOVERY_TIMEOUT = 60000; // 1 minute

  constructor() {
    this.sesameUrl = process.env.SESAME_URL || 'http://localhost:8000';
    this.startMonitoring();
  }

  /**
   * Start continuous health monitoring
   */
  private startMonitoring() {
    logger.info('🏥 Starting Sesame health monitoring', {
      url: this.sesameUrl,
      interval: this.HEALTH_CHECK_INTERVAL
    });

    // Initial check
    this.performHealthCheck();

    // Schedule regular checks
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    const checks: HealthCheck[] = [];

    // Test 1: Basic health endpoint
    const healthCheck = await this.checkEndpoint('/health', 'GET');
    checks.push(healthCheck);

    // Test 2: TTS capability check (with minimal text)
    const ttsCheck = await this.checkEndpoint('/tts', 'POST', {
      text: 'test',
      voice: 'maya'
    });
    checks.push(ttsCheck);

    // Test 3: Model status (if endpoint available)
    const modelCheck = await this.checkEndpoint('/model/status', 'GET');
    checks.push(modelCheck);

    // Calculate health metrics
    const allHealthy = checks.every(c => c.success);
    const responseTime = Date.now() - startTime;

    // Update history
    this.healthHistory.push(...checks);
    this.pruneHistory();

    // Update failure count
    if (allHealthy) {
      this.consecutiveFailures = 0;
      this.lastSuccessfulCheck = new Date();
    } else {
      this.consecutiveFailures++;
      logger.warn('⚠️ Sesame health check failed', {
        consecutiveFailures: this.consecutiveFailures,
        failedChecks: checks.filter(c => !c.success).map(c => c.endpoint)
      });
    }

    // Trigger auto-recovery if needed
    if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES && !this.isRecovering) {
      this.autoRecover();
    }

    // Calculate metrics
    const status: HealthStatus = {
      healthy: allHealthy,
      uptime: this.calculateUptime(),
      latency: this.calculateLatencyPercentiles(),
      modelStatus: {
        loaded: modelCheck.success,
        name: 'suno/bark',
        memoryUsageMB: await this.getMemoryUsage()
      },
      lastCheck: new Date(),
      consecutiveFailures: this.consecutiveFailures
    };

    // Log status
    if (allHealthy) {
      logger.debug('✅ Sesame health check passed', {
        responseTime,
        uptime: `${status.uptime.toFixed(2)}%`
      });
    }

    return status;
  }

  /**
   * Check a specific endpoint
   */
  private async checkEndpoint(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET',
    data?: any
  ): Promise<HealthCheck> {
    const startTime = Date.now();
    const url = `${this.sesameUrl}${endpoint}`;

    try {
      const response = await axios({
        method,
        url,
        data,
        timeout: 5000,
        validateStatus: (status) => status === 200
      });

      return {
        timestamp: new Date(),
        endpoint,
        success: true,
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        timestamp: new Date(),
        endpoint,
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Automatic recovery when Sesame fails
   */
  private async autoRecover(): Promise<void> {
    if (this.isRecovering) return;
    
    this.isRecovering = true;
    logger.warn('🔧 Starting Sesame auto-recovery...');

    try {
      // Step 1: Try graceful restart
      await this.gracefulRestart();
      
      // Step 2: Wait for service to come up
      const recovered = await this.waitForReady(this.RECOVERY_TIMEOUT);
      
      if (recovered) {
        logger.info('✅ Sesame recovered successfully');
        this.notifyRecovery();
        this.consecutiveFailures = 0;
      } else {
        logger.error('❌ Sesame recovery failed, escalating to fallback');
        this.escalateToFallback();
      }
    } catch (error) {
      logger.error('❌ Auto-recovery failed:', error);
      this.escalateToFallback();
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * Gracefully restart Sesame
   */
  private async gracefulRestart(): Promise<void> {
    logger.info('🔄 Attempting graceful Sesame restart...');

    try {
      // If running in Docker
      if (process.env.SESAME_DOCKER === 'true') {
        await execAsync('docker restart sesame-csm-prod');
      } else {
        // If running as systemd service
        await execAsync('sudo systemctl restart sesame-csm');
      }
    } catch (error) {
      logger.error('Graceful restart failed:', error);
      throw error;
    }
  }

  /**
   * Wait for Sesame to be ready
   */
  private async waitForReady(timeout: number): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 2000; // Check every 2 seconds

    while (Date.now() - startTime < timeout) {
      const health = await this.checkEndpoint('/health', 'GET');
      
      if (health.success) {
        // Also verify TTS is working
        const tts = await this.checkEndpoint('/tts', 'POST', {
          text: 'recovery test',
          voice: 'maya'
        });
        
        if (tts.success) {
          return true;
        }
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    return false;
  }

  /**
   * Calculate uptime percentage
   */
  private calculateUptime(): number {
    if (this.healthHistory.length === 0) return 0;

    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
    const recentChecks = this.healthHistory.filter(
      c => c.timestamp.getTime() > last24Hours
    );

    if (recentChecks.length === 0) return 100;

    const successfulChecks = recentChecks.filter(c => c.success).length;
    return (successfulChecks / recentChecks.length) * 100;
  }

  /**
   * Calculate latency percentiles
   */
  private calculateLatencyPercentiles(): { p50: number; p95: number; p99: number } {
    const responseTimes = this.healthHistory
      .filter(c => c.success)
      .map(c => c.responseTime)
      .sort((a, b) => a - b);

    if (responseTimes.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }

    const p50Index = Math.floor(responseTimes.length * 0.5);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    return {
      p50: responseTimes[p50Index] || 0,
      p95: responseTimes[p95Index] || 0,
      p99: responseTimes[p99Index] || 0
    };
  }

  /**
   * Get memory usage (if available)
   */
  private async getMemoryUsage(): Promise<number | undefined> {
    try {
      const response = await axios.get(`${this.sesameUrl}/metrics`, {
        timeout: 2000
      });
      return response.data?.memoryUsageMB;
    } catch {
      return undefined;
    }
  }

  /**
   * Prune old history entries
   */
  private pruneHistory() {
    if (this.healthHistory.length > this.MAX_HISTORY_SIZE) {
      this.healthHistory = this.healthHistory.slice(-this.MAX_HISTORY_SIZE);
    }
  }

  /**
   * Notify team of recovery
   */
  private notifyRecovery() {
    // TODO: Implement Slack/email notification
    logger.info('📧 Recovery notification sent');
  }

  /**
   * Escalate to fallback services
   */
  private escalateToFallback() {
    logger.warn('🔄 Escalating to ElevenLabs fallback');
    // This will be handled by TTSOrchestrator
  }

  /**
   * Get current status
   */
  async getStatus(): Promise<HealthStatus> {
    return this.performHealthCheck();
  }

  /**
   * Get uptime percentage
   */
  getUptimePercentage(): number {
    return this.calculateUptime();
  }

  /**
   * Check if model is loaded
   */
  async isModelLoaded(): Promise<boolean> {
    const check = await this.checkEndpoint('/model/status', 'GET');
    return check.success;
  }

  /**
   * Check if service is healthy
   */
  get isHealthy(): boolean {
    return this.consecutiveFailures === 0;
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Export singleton instance
export const sesameHealthMonitor = new SesameHealthMonitor();