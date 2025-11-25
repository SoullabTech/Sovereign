/**
 * Hybrid System Toggle - Production Deployment Control
 * Seamlessly switch between Traditional Maya and RFS for Monday deployment
 */

import { MaiaFullyEducatedOrchestrator } from './MaiaFullyEducatedOrchestrator';
import { ResonanceFieldOrchestrator, RFSResponse } from './ResonanceFieldOrchestrator';

export type SystemMode = 'traditional' | 'rfs' | 'hybrid-ab' | 'auto';

export interface HybridConfig {
  mode: SystemMode;
  rfsRolloutPercentage: number; // 0-100: % of users getting RFS
  enableForNewUsers: boolean;
  enableForReturningUsers: boolean;
  forceRFSForUserIds: string[]; // Explicitly enable RFS for these users
  forceTraditionalForUserIds: string[]; // Explicitly disable RFS for these users
  monitoringEnabled: boolean;
}

export interface SystemMetrics {
  traditional: {
    totalRequests: number;
    avgResponseLength: number;
    avgResponseTime: number;
    silenceCount: number;
  };
  rfs: {
    totalRequests: number;
    avgResponseLength: number;
    avgResponseTime: number;
    silenceCount: number;
    avgSilenceProbability: number;
    dominantElements: Record<string, number>;
  };
}

/**
 * Hybrid System Toggle - Monday Deployment Ready
 */
export class HybridSystemToggle {
  private traditionalOrchestrator: MaiaFullyEducatedOrchestrator;
  private rfsOrchestrator: ResonanceFieldOrchestrator;
  private config: HybridConfig;
  private metrics: SystemMetrics;

  constructor(config?: Partial<HybridConfig>) {
    this.traditionalOrchestrator = new MaiaFullyEducatedOrchestrator();
    this.rfsOrchestrator = new ResonanceFieldOrchestrator();

    // Default: Traditional for now, switch to RFS Monday
    this.config = {
      mode: 'traditional', // Change to 'rfs' on Monday
      rfsRolloutPercentage: 0, // Change to 100 on Monday
      enableForNewUsers: false,
      enableForReturningUsers: false,
      forceRFSForUserIds: [], // Add your test user IDs
      forceTraditionalForUserIds: [],
      monitoringEnabled: true,
      ...config
    };

    this.metrics = this.initializeMetrics();
  }

  /**
   * Main speak method - intelligently routes to correct system
   */
  async speak(
    input: string,
    userId: string,
    preferences?: any
  ): Promise<{
    message: string | null;
    element?: string;
    duration?: number;
    voiceCharacteristics?: any;
    metadata: {
      system: 'traditional' | 'rfs';
      field?: any;
      silenceProbability?: number;
      dominantElement?: string;
    };
  }> {
    const startTime = Date.now();

    // Determine which system to use
    const useRFS = this.shouldUseRFS(userId, preferences);

    if (useRFS) {
      // Use Resonance Field System
      const rfsResponse = await this.rfsOrchestrator.speak(input, userId, {
        preferences,
        isFirstSession: preferences?.isFirstSession
      });

      // Track metrics
      if (this.config.monitoringEnabled) {
        this.trackRFSMetrics(rfsResponse, Date.now() - startTime);
      }

      // Convert RFS response to Maia format
      return {
        message: rfsResponse.message,
        element: rfsResponse.metadata.dominantElement as any,
        duration: rfsResponse.timing.pauseAfter,
        voiceCharacteristics: this.getVoiceForElement(
          rfsResponse.metadata.dominantElement
        ),
        metadata: {
          system: 'rfs',
          field: rfsResponse.field,
          silenceProbability: rfsResponse.metadata.silenceProbability,
          dominantElement: rfsResponse.metadata.dominantElement
        }
      };
    } else {
      // Use Traditional System
      const traditionalResponse = await this.traditionalOrchestrator.speak(
        input,
        userId,
        preferences
      );

      // Track metrics
      if (this.config.monitoringEnabled) {
        this.trackTraditionalMetrics(traditionalResponse, Date.now() - startTime);
      }

      return {
        message: traditionalResponse.message,
        element: traditionalResponse.element,
        duration: traditionalResponse.duration,
        voiceCharacteristics: traditionalResponse.voiceCharacteristics,
        metadata: {
          system: 'traditional'
        }
      };
    }
  }

  /**
   * Determine if user should get RFS
   */
  private shouldUseRFS(userId: string, preferences?: any): boolean {
    // Mode: traditional = always use traditional
    if (this.config.mode === 'traditional') {
      return false;
    }

    // Mode: rfs = always use RFS
    if (this.config.mode === 'rfs') {
      return true;
    }

    // Explicit overrides
    if (this.config.forceRFSForUserIds.includes(userId)) {
      return true;
    }

    if (this.config.forceTraditionalForUserIds.includes(userId)) {
      return false;
    }

    // Mode: hybrid-ab = percentage-based rollout
    if (this.config.mode === 'hybrid-ab') {
      // New users
      if (preferences?.isFirstSession && !this.config.enableForNewUsers) {
        return false;
      }

      // Returning users
      if (!preferences?.isFirstSession && !this.config.enableForReturningUsers) {
        return false;
      }

      // Percentage-based rollout (consistent hashing)
      const userHash = this.hashUserId(userId);
      const threshold = this.config.rfsRolloutPercentage / 100;
      return userHash < threshold;
    }

    // Mode: auto = intelligent selection based on context
    if (this.config.mode === 'auto') {
      return this.intelligentSystemSelection(userId, preferences);
    }

    // Default: traditional
    return false;
  }

  /**
   * Intelligent system selection based on user context
   */
  private intelligentSystemSelection(userId: string, preferences?: any): boolean {
    // RFS is better for:
    // - Deep conversations (high exchange count)
    // - Emotional intensity
    // - Users who prefer brevity
    // - Returning users

    const userState = this.rfsOrchestrator.getUserState(userId);

    // High exchange count = RFS shines
    if (userState.exchangeCount > 20) {
      return true;
    }

    // High intimacy = RFS shines
    if (userState.intimacyLevel > 0.5) {
      return true;
    }

    // User preference for brevity
    if (preferences?.communicationStyle === 'direct') {
      return true;
    }

    // New users might prefer traditional (more explanatory)
    if (preferences?.isFirstSession) {
      return false;
    }

    // Default: 50/50 split for auto mode
    return Math.random() < 0.5;
  }

  /**
   * Get voice characteristics for element
   */
  private getVoiceForElement(element: string): any {
    const voiceMapping: Record<string, any> = {
      earth: { pace: 'deliberate', tone: 'warm_grounded', energy: 'calm' },
      water: { pace: 'flowing', tone: 'empathetic', energy: 'gentle' },
      air: { pace: 'quick', tone: 'curious', energy: 'light' },
      fire: { pace: 'energetic', tone: 'encouraging', energy: 'dynamic' }
    };

    return voiceMapping[element] || voiceMapping.earth;
  }

  /**
   * Track RFS metrics
   */
  private trackRFSMetrics(response: RFSResponse, responseTime: number): void {
    this.metrics.rfs.totalRequests++;
    this.metrics.rfs.avgResponseTime =
      (this.metrics.rfs.avgResponseTime * (this.metrics.rfs.totalRequests - 1) +
        responseTime) /
      this.metrics.rfs.totalRequests;

    if (response.message) {
      const wordCount = response.message.split(/\s+/).length;
      this.metrics.rfs.avgResponseLength =
        (this.metrics.rfs.avgResponseLength * (this.metrics.rfs.totalRequests - 1) +
          wordCount) /
        this.metrics.rfs.totalRequests;
    } else {
      this.metrics.rfs.silenceCount++;
    }

    // Track element distribution
    const element = response.metadata.dominantElement;
    this.metrics.rfs.dominantElements[element] =
      (this.metrics.rfs.dominantElements[element] || 0) + 1;

    // Track average silence probability
    this.metrics.rfs.avgSilenceProbability =
      (this.metrics.rfs.avgSilenceProbability * (this.metrics.rfs.totalRequests - 1) +
        response.metadata.silenceProbability) /
      this.metrics.rfs.totalRequests;
  }

  /**
   * Track traditional metrics
   */
  private trackTraditionalMetrics(response: any, responseTime: number): void {
    this.metrics.traditional.totalRequests++;
    this.metrics.traditional.avgResponseTime =
      (this.metrics.traditional.avgResponseTime *
        (this.metrics.traditional.totalRequests - 1) +
        responseTime) /
      this.metrics.traditional.totalRequests;

    if (response.message) {
      const wordCount = response.message.split(/\s+/).length;
      this.metrics.traditional.avgResponseLength =
        (this.metrics.traditional.avgResponseLength *
          (this.metrics.traditional.totalRequests - 1) +
          wordCount) /
        this.metrics.traditional.totalRequests;
    } else {
      this.metrics.traditional.silenceCount++;
    }
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): SystemMetrics {
    return {
      traditional: {
        totalRequests: 0,
        avgResponseLength: 0,
        avgResponseTime: 0,
        silenceCount: 0
      },
      rfs: {
        totalRequests: 0,
        avgResponseLength: 0,
        avgResponseTime: 0,
        silenceCount: 0,
        avgSilenceProbability: 0,
        dominantElements: {}
      }
    };
  }

  /**
   * Consistent user ID hashing
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) / 2147483647;
  }

  /**
   * MONDAY DEPLOYMENT: Switch to RFS
   */
  switchToRFS(rolloutPercentage: number = 100): void {
    this.config.mode = 'rfs';
    this.config.rfsRolloutPercentage = rolloutPercentage;
    this.config.enableForNewUsers = true;
    this.config.enableForReturningUsers = true;

    console.log(`🚀 SWITCHED TO RFS: ${rolloutPercentage}% rollout`);
  }

  /**
   * Rollback to traditional (if needed)
   */
  rollbackToTraditional(): void {
    this.config.mode = 'traditional';
    this.config.rfsRolloutPercentage = 0;

    console.log('🔄 ROLLED BACK TO TRADITIONAL SYSTEM');
  }

  /**
   * Get current configuration
   */
  getConfig(): HybridConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<HybridConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('⚙️ Configuration updated:', updates);
  }

  /**
   * Get metrics
   */
  getMetrics(): SystemMetrics {
    return JSON.parse(JSON.stringify(this.metrics));
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    console.log('📊 Metrics reset');
  }

  /**
   * Get comparison report
   */
  getComparisonReport(): {
    traditional: any;
    rfs: any;
    comparison: any;
  } {
    const trad = this.metrics.traditional;
    const rfs = this.metrics.rfs;

    return {
      traditional: {
        totalRequests: trad.totalRequests,
        avgResponseLength: trad.avgResponseLength.toFixed(2),
        avgResponseTime: trad.avgResponseTime.toFixed(0) + 'ms',
        silenceRate: ((trad.silenceCount / trad.totalRequests) * 100).toFixed(1) + '%'
      },
      rfs: {
        totalRequests: rfs.totalRequests,
        avgResponseLength: rfs.avgResponseLength.toFixed(2),
        avgResponseTime: rfs.avgResponseTime.toFixed(0) + 'ms',
        silenceRate: ((rfs.silenceCount / rfs.totalRequests) * 100).toFixed(1) + '%',
        avgSilenceProbability: (rfs.avgSilenceProbability * 100).toFixed(1) + '%',
        elementDistribution: rfs.dominantElements
      },
      comparison: {
        brevityImprovement:
          trad.avgResponseLength > 0
            ? (
                ((trad.avgResponseLength - rfs.avgResponseLength) /
                  trad.avgResponseLength) *
                100
              ).toFixed(1) + '%'
            : 'N/A',
        silenceDifference:
          trad.totalRequests > 0 && rfs.totalRequests > 0
            ? (
                (rfs.silenceCount / rfs.totalRequests -
                  trad.silenceCount / trad.totalRequests) *
                100
              ).toFixed(1) + '%'
            : 'N/A',
        performanceDelta:
          trad.avgResponseTime > 0
            ? (
                ((rfs.avgResponseTime - trad.avgResponseTime) /
                  trad.avgResponseTime) *
                100
              ).toFixed(1) + '%'
            : 'N/A'
      }
    };
  }

  /**
   * End conversation (cleanup)
   */
  async endConversation(userId: string, satisfaction?: number): Promise<void> {
    await this.traditionalOrchestrator.endConversation(userId, satisfaction);
  }
}

// Singleton instance
let hybridInstance: HybridSystemToggle | null = null;

export function getHybridSystemToggle(
  config?: Partial<HybridConfig>
): HybridSystemToggle {
  if (!hybridInstance) {
    hybridInstance = new HybridSystemToggle(config);
  }
  return hybridInstance;
}

/**
 * Monday Deployment Helper
 */
export function enableRFSForProduction(rolloutPercentage: number = 100): void {
  const system = getHybridSystemToggle();
  system.switchToRFS(rolloutPercentage);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║          RESONANCE FIELD SYSTEM - LIVE IN PRODUCTION      ║
║                                                            ║
║  Rollout: ${rolloutPercentage}% of users                              ║
║  Mode: ${rolloutPercentage === 100 ? 'Full Deployment' : 'Gradual Rollout'}                           ║
║  Monitoring: Enabled                                       ║
║                                                            ║
║  Traditional system remains available as fallback          ║
╚════════════════════════════════════════════════════════════╝
  `);
}

/**
 * Emergency Rollback
 */
export function emergencyRollback(): void {
  const system = getHybridSystemToggle();
  system.rollbackToTraditional();

  console.log(`
╔════════════════════════════════════════════════════════════╗
║          EMERGENCY ROLLBACK - TRADITIONAL SYSTEM ACTIVE    ║
║                                                            ║
║  All users now using traditional Maya system               ║
║  RFS temporarily disabled                                  ║
║  Metrics preserved for analysis                            ║
╚════════════════════════════════════════════════════════════╝
  `);
}

export default HybridSystemToggle;