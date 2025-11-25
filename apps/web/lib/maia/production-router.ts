/**
 * Production Router
 * Phase 1: Sesame live, RFS in shadow
 * Phase 2: A/B testing between both
 *
 * Integrates with Maya breath system for field modulation
 */

import ResonanceFieldShadowRunner, { type ShadowContext } from './resonance-field-shadow-runner';
import ResponseDualLogger from './response-dual-logger';

export interface ProductionConfig {
  mode: 'shadow' | 'ab-test' | 'rfs-only';
  abSplitRatio?: number; // 0.0 = all Sesame, 1.0 = all RFS
  enableBreathModulation?: boolean;
}

export class ProductionRouter {
  private shadowRunner: ResonanceFieldShadowRunner;
  private dualLogger: ResponseDualLogger;
  private config: ProductionConfig;

  constructor(config: ProductionConfig = { mode: 'shadow' }) {
    this.shadowRunner = new ResonanceFieldShadowRunner();
    this.dualLogger = new ResponseDualLogger();
    this.config = config;
  }

  /**
   * Main entry point: route user input through appropriate system
   */
  async handleUserInput(params: {
    inputText: string;
    userId: string;
    sessionId?: string;
    breathState?: ShadowContext['breathState'];
    emotionalContext?: any;
  }): Promise<string> {
    const context: ShadowContext = {
      sessionId: params.sessionId || this.generateSessionId(),
      userId: params.userId,
      inputText: params.inputText,
      timestamp: new Date().toISOString(),
      breathState: params.breathState,
      emotionalContext: params.emotionalContext
    };

    // Route based on mode
    switch (this.config.mode) {
      case 'shadow':
        return this.handleShadowMode(context);

      case 'ab-test':
        return this.handleABTest(context);

      case 'rfs-only':
        return this.handleRFSOnly(context);

      default:
        return this.handleShadowMode(context);
    }
  }

  /**
   * Phase 1: Shadow Mode
   * Sesame goes live, RFS runs in background for observation
   */
  private async handleShadowMode(context: ShadowContext): Promise<string> {
    // 1. Generate Sesame response (goes live)
    const sesameOutput = await this.generateSesameResponse(context.inputText);

    // 2. Run RFS in shadow (non-blocking, fire-and-forget)
    this.shadowRunner.runInShadow(context).catch(error => {
      console.error('[Shadow Runner Error]', error);
      // Don't break production on shadow errors
    });

    // 3. Get RFS output for comparison (blocking but cached)
    const rfsOutput = await this.shadowRunner.getResponseForComparison(context);

    // 4. Log comparison
    if (rfsOutput && rfsOutput !== '[RFS_ERROR]') {
      await this.dualLogger.logComparison(sesameOutput, rfsOutput, context);
    }

    // 5. Return Sesame (stable, proven)
    return sesameOutput;
  }

  /**
   * Phase 2: A/B Test Mode
   * Randomly assign users to Sesame or RFS
   */
  private async handleABTest(context: ShadowContext): Promise<string> {
    const splitRatio = this.config.abSplitRatio ?? 0.5;
    const userHash = this.hashUserId(context.userId);
    const useRFS = userHash < splitRatio;

    // Generate both for comparison
    const [sesameOutput, rfsOutput] = await Promise.all([
      this.generateSesameResponse(context.inputText),
      this.shadowRunner.getResponseForComparison(context)
    ]);

    // Log comparison
    if (rfsOutput && rfsOutput !== '[RFS_ERROR]') {
      await this.dualLogger.logComparison(sesameOutput, rfsOutput, context);
    }

    // Return based on A/B assignment
    return useRFS && rfsOutput && rfsOutput !== '[RFS_ERROR]'
      ? rfsOutput
      : sesameOutput;
  }

  /**
   * Phase 3: RFS Only Mode
   * Full cutover to Resonance Field System
   */
  private async handleRFSOnly(context: ShadowContext): Promise<string> {
    const rfsOutput = await this.shadowRunner.getResponseForComparison(context);

    // Fallback to Sesame on error
    if (!rfsOutput || rfsOutput === '[RFS_ERROR]') {
      console.error('[RFS Generation Failed - Falling back to Sesame]');
      return this.generateSesameResponse(context.inputText);
    }

    return rfsOutput;
  }

  /**
   * Generate Sesame response using existing presence layer
   */
  private async generateSesameResponse(inputText: string): Promise<string> {
    // TODO: Import and use actual Sesame system
    // For now, placeholder implementation

    // Simple presence-based responses (Sesame style)
    const responses = [
      "Yeah.",
      "Mm.",
      "I'm here.",
      "Tell me.",
      "What else?",
      "I know.",
      "Go on.",
      "...",
    ];

    // Sesame logic: simple, immediate, minimal
    if (inputText.length < 20) {
      return responses[Math.floor(Math.random() * 3)]; // Very short: "Yeah." "Mm." "I'm here."
    }

    if (inputText.includes('?')) {
      return responses[Math.floor(Math.random() * 2) + 3]; // Questions: "Tell me." "What else?"
    }

    // Default: acknowledgment or presence
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Hash user ID to deterministic 0-1 value for A/B testing
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash % 1000) / 1000; // Normalize to 0-1
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update router configuration at runtime
   */
  updateConfig(config: Partial<ProductionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current mode
   */
  getMode(): string {
    return this.config.mode;
  }

  /**
   * Get comparison statistics
   */
  async getStats(lastNHours: number = 24) {
    return this.dualLogger.getComparisonStats(lastNHours);
  }

  /**
   * Flush any pending logs
   */
  async flush(): Promise<void> {
    await this.dualLogger.forceFlush();
  }
}

/**
 * Factory function for easy initialization
 */
export function createProductionRouter(
  mode: ProductionConfig['mode'] = 'shadow'
): ProductionRouter {
  return new ProductionRouter({ mode });
}

/**
 * Global singleton for application-wide use
 */
let globalRouter: ProductionRouter | null = null;

export function getProductionRouter(): ProductionRouter {
  if (!globalRouter) {
    globalRouter = createProductionRouter('shadow');
  }
  return globalRouter;
}

export function setProductionRouter(router: ProductionRouter): void {
  globalRouter = router;
}

export default ProductionRouter;