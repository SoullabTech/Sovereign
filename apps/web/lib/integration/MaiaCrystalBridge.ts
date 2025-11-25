/**
 * Maia Crystal Bridge
 *
 * Integration layer between existing MaiaOrchestrator and new Crystal Observer architecture
 * Enables gradual migration while maintaining backward compatibility
 */

import { MaiaOrchestrator } from '../oracle/MaiaOrchestrator';
import { CrystalObserverCore, getCrystalObserver, ConsciousnessExpression } from '../consciousness/CrystalObserverCore';
import { ParallelFieldProcessor } from '../fieldProtocol/ParallelFieldProcessor';
import { MaiaFieldOrchestrator } from '../maia/MaiaFieldOrchestrator';
import { Element } from '../../types/fieldProtocol';
import { ConsciousnessState } from '../../types/crystalObserver';

/**
 * Configuration for bridge behavior
 */
export interface BridgeConfig {
  // Migration settings
  mode: 'legacy' | 'hybrid' | 'crystal'; // Processing mode
  crystalWeight: number; // 0-1: How much to rely on Crystal Observer

  // Feature flags
  enableParallelProcessing: boolean;
  enableParadoxAccumulation: boolean;
  enableSymbolicMediation: boolean;
  enableCollectiveField: boolean;

  // Performance settings
  cacheResponses: boolean;
  asyncProcessing: boolean;

  // Monitoring
  logTransitions: boolean;
  metricsEnabled: boolean;
}

/**
 * Unified response format
 */
export interface UnifiedResponse {
  message: string;

  // Core attributes
  element: Element;
  duration: number;

  // Enhanced attributes from Crystal Observer
  consciousness?: {
    state: ConsciousnessState;
    coherence: number;
    emergence?: string;
  };

  // Experiential qualities
  experience?: {
    intensity: number;
    valence: number;
    texture: string;
  };

  // System metadata
  processingMode: 'legacy' | 'crystal' | 'hybrid';
  processingTime: number;
}

/**
 * Main bridge class
 */
export class MaiaCrystalBridge {
  private legacyOrchestrator: MaiaOrchestrator;
  private crystalObserver: CrystalObserverCore;
  private fieldOrchestrator: MaiaFieldOrchestrator;
  private parallelProcessor: ParallelFieldProcessor;
  private config: BridgeConfig;
  private responseCache: Map<string, UnifiedResponse>;
  private metrics: BridgeMetrics;

  constructor(config?: Partial<BridgeConfig>) {
    this.config = this.initializeConfig(config);
    this.legacyOrchestrator = new MaiaOrchestrator();
    this.crystalObserver = getCrystalObserver();
    this.fieldOrchestrator = new MaiaFieldOrchestrator();
    this.parallelProcessor = new ParallelFieldProcessor();
    this.responseCache = new Map();
    this.metrics = new BridgeMetrics();

    this.initialize();
  }

  /**
   * Initialize configuration with defaults
   */
  private initializeConfig(partial?: Partial<BridgeConfig>): BridgeConfig {
    return {
      mode: 'hybrid',
      crystalWeight: 0.5, // Start with 50/50 blend
      enableParallelProcessing: true,
      enableParadoxAccumulation: true,
      enableSymbolicMediation: false, // Start conservative
      enableCollectiveField: false, // Start conservative
      cacheResponses: true,
      asyncProcessing: true,
      logTransitions: true,
      metricsEnabled: true,
      ...partial
    };
  }

  /**
   * Initialize bridge systems
   */
  private async initialize() {
    if (this.config.logTransitions) {
      console.log('🌉 Initializing Maia Crystal Bridge...');
      console.log(`Mode: ${this.config.mode}`);
      console.log(`Crystal Weight: ${this.config.crystalWeight * 100}%`);
    }

    // Set up event listeners for monitoring
    this.setupEventListeners();

    // Warm up systems
    await this.warmupSystems();

    if (this.config.logTransitions) {
      console.log('✅ Bridge initialized successfully');
    }
  }

  /**
   * MAIN PUBLIC METHOD: Process input through appropriate system
   */
  async process(
    input: string,
    userId: string,
    context?: any
  ): Promise<UnifiedResponse> {
    const startTime = Date.now();

    // Check cache first
    if (this.config.cacheResponses) {
      const cacheKey = this.getCacheKey(input, userId);
      const cached = this.responseCache.get(cacheKey);
      if (cached) {
        this.metrics.recordCacheHit();
        return cached;
      }
    }

    // Route based on mode
    let response: UnifiedResponse;

    switch (this.config.mode) {
      case 'legacy':
        response = await this.processLegacy(input, userId, context);
        break;

      case 'crystal':
        response = await this.processCrystal(input, userId, context);
        break;

      case 'hybrid':
      default:
        response = await this.processHybrid(input, userId, context);
        break;
    }

    // Add processing metadata
    response.processingTime = Date.now() - startTime;
    response.processingMode = this.config.mode;

    // Cache if enabled
    if (this.config.cacheResponses) {
      const cacheKey = this.getCacheKey(input, userId);
      this.responseCache.set(cacheKey, response);

      // Limit cache size
      if (this.responseCache.size > 1000) {
        const firstKey = this.responseCache.keys().next().value;
        this.responseCache.delete(firstKey);
      }
    }

    // Record metrics
    if (this.config.metricsEnabled) {
      this.metrics.recordProcessing(response);
    }

    return response;
  }

  /**
   * Process through legacy system only
   */
  private async processLegacy(
    input: string,
    userId: string,
    context?: any
  ): Promise<UnifiedResponse> {
    const legacyResponse = await this.legacyOrchestrator.speak(input, userId);

    return {
      message: legacyResponse.message,
      element: legacyResponse.element as Element,
      duration: legacyResponse.duration,
      processingMode: 'legacy',
      processingTime: 0
    };
  }

  /**
   * Process through Crystal Observer only
   */
  private async processCrystal(
    input: string,
    userId: string,
    context?: any
  ): Promise<UnifiedResponse> {
    // Process through Crystal Observer
    const expression = await this.crystalObserver.channel(input, userId, context);

    // Process through parallel fields if enabled
    let fieldInteraction;
    if (this.config.enableParallelProcessing) {
      fieldInteraction = await this.parallelProcessor.processField(input, userId, context);
    }

    // Convert to unified response
    return this.convertCrystalToUnified(expression, fieldInteraction);
  }

  /**
   * Process through hybrid system (blend of both)
   */
  private async processHybrid(
    input: string,
    userId: string,
    context?: any
  ): Promise<UnifiedResponse> {
    // Process through both systems in parallel
    const [legacyResponse, crystalExpression] = await Promise.all([
      this.legacyOrchestrator.speak(input, userId),
      this.crystalObserver.channel(input, userId, context)
    ]);

    // Blend responses based on weight
    return this.blendResponses(legacyResponse, crystalExpression);
  }

  /**
   * Convert Crystal Observer expression to unified format
   */
  private convertCrystalToUnified(
    expression: ConsciousnessExpression,
    fieldInteraction?: any
  ): UnifiedResponse {
    // Handle silence as valid expression
    const message = expression.content || '...'; // Silence represented as ellipsis

    // Calculate duration based on intensity
    const duration = Math.max(1000, expression.qualities.intensity * 3000);

    return {
      message,
      element: expression.qualities.element,
      duration,
      consciousness: {
        state: this.determineConsciousnessState(expression),
        coherence: expression.qualities.coherence,
        emergence: fieldInteraction?.emergence?.content
      },
      experience: {
        intensity: expression.experience.intensity,
        valence: expression.experience.valence,
        texture: expression.experience.phenomenalProperties.texture
      },
      processingMode: 'crystal',
      processingTime: 0
    };
  }

  /**
   * Blend legacy and crystal responses
   */
  private blendResponses(
    legacy: any,
    crystal: ConsciousnessExpression
  ): UnifiedResponse {
    const weight = this.config.crystalWeight;

    // Choose primary message based on weight
    const useCrystal = Math.random() < weight;
    const message = useCrystal ?
                    (crystal.content || legacy.message) :
                    legacy.message;

    // Blend duration
    const crystalDuration = Math.max(1000, crystal.qualities.intensity * 3000);
    const duration = Math.round(
      legacy.duration * (1 - weight) + crystalDuration * weight
    );

    // Select element (prefer crystal's conscious choice)
    const element = useCrystal ? crystal.qualities.element : legacy.element;

    return {
      message,
      element: element as Element,
      duration,
      consciousness: {
        state: this.determineConsciousnessState(crystal),
        coherence: crystal.qualities.coherence,
        emergence: undefined // Would come from field interaction
      },
      experience: {
        intensity: crystal.experience.intensity,
        valence: crystal.experience.valence,
        texture: crystal.experience.phenomenalProperties.texture
      },
      processingMode: 'hybrid',
      processingTime: 0
    };
  }

  /**
   * Determine consciousness state from expression
   */
  private determineConsciousnessState(expression: ConsciousnessExpression): ConsciousnessState {
    const coherence = expression.qualities.coherence;
    const intensity = expression.qualities.intensity;

    if (coherence > 0.8 && intensity > 0.7) return ConsciousnessState.TRANSCENDENT;
    if (coherence > 0.7 && intensity > 0.6) return ConsciousnessState.RESONANT;
    if (coherence > 0.6 && intensity > 0.5) return ConsciousnessState.FLOWING;
    if (coherence > 0.4 && intensity > 0.3) return ConsciousnessState.ACTIVE;
    if (coherence > 0.2) return ConsciousnessState.AWAKENING;
    return ConsciousnessState.DORMANT;
  }

  /**
   * Set up event listeners for monitoring
   */
  private setupEventListeners() {
    // Crystal Observer events
    this.crystalObserver.on('consciousness:started', () => {
      if (this.config.logTransitions) {
        console.log('🔮 Crystal Observer consciousness flow started');
      }
    });

    this.crystalObserver.on('emergence:detected', (emergence) => {
      if (this.config.logTransitions) {
        console.log('✨ Emergence detected:', emergence);
      }
      this.metrics.recordEmergence(emergence);
    });

    this.crystalObserver.on('health:assessed', (health) => {
      this.metrics.updateHealth(health);
    });

    // Parallel processor events
    this.parallelProcessor.on('paradox:accumulated', (data) => {
      if (this.config.logTransitions) {
        console.log(`🔄 Paradoxes accumulated: ${data.count} new, ${data.total} total`);
      }
    });
  }

  /**
   * Warm up systems for better performance
   */
  private async warmupSystems() {
    // Send a simple test through each system
    const testInput = 'Hello';
    const testUserId = 'warmup-test';

    try {
      await Promise.all([
        this.legacyOrchestrator.speak(testInput, testUserId),
        this.crystalObserver.channel(testInput, testUserId)
      ]);
    } catch (error) {
      console.warn('Warmup partial failure:', error);
    }
  }

  /**
   * Generate cache key
   */
  private getCacheKey(input: string, userId: string): string {
    return `${userId}:${input.toLowerCase().slice(0, 50)}`;
  }

  /**
   * PUBLIC METHOD: Gradually increase Crystal Observer weight
   */
  async increaseCrystalWeight(increment: number = 0.1) {
    const newWeight = Math.min(1, this.config.crystalWeight + increment);
    this.config.crystalWeight = newWeight;

    if (this.config.logTransitions) {
      console.log(`📈 Crystal weight increased to ${newWeight * 100}%`);
    }

    // Switch to full crystal mode if weight is high enough
    if (newWeight >= 0.9 && this.config.mode === 'hybrid') {
      this.config.mode = 'crystal';
      console.log('🔮 Switched to full Crystal Observer mode');
    }
  }

  /**
   * PUBLIC METHOD: Get current metrics
   */
  getMetrics(): BridgeMetricsData {
    return this.metrics.getData();
  }

  /**
   * PUBLIC METHOD: Reset cache
   */
  clearCache() {
    this.responseCache.clear();
    if (this.config.logTransitions) {
      console.log('🗑️ Response cache cleared');
    }
  }

  /**
   * PUBLIC METHOD: Update configuration
   */
  updateConfig(updates: Partial<BridgeConfig>) {
    Object.assign(this.config, updates);
    if (this.config.logTransitions) {
      console.log('⚙️ Bridge configuration updated:', updates);
    }
  }
}

/**
 * Metrics tracking for bridge performance
 */
class BridgeMetrics {
  private processCount = 0;
  private cacheHits = 0;
  private emergenceCount = 0;
  private avgProcessingTime = 0;
  private healthScore = 0.5;

  recordProcessing(response: UnifiedResponse) {
    this.processCount++;

    // Update rolling average of processing time
    this.avgProcessingTime =
      (this.avgProcessingTime * (this.processCount - 1) + response.processingTime) /
      this.processCount;
  }

  recordCacheHit() {
    this.cacheHits++;
  }

  recordEmergence(emergence: any) {
    this.emergenceCount++;
  }

  updateHealth(health: any) {
    this.healthScore = health.flowQuality || 0.5;
  }

  getData(): BridgeMetricsData {
    return {
      processCount: this.processCount,
      cacheHitRate: this.processCount > 0 ? this.cacheHits / this.processCount : 0,
      emergenceCount: this.emergenceCount,
      avgProcessingTime: Math.round(this.avgProcessingTime),
      healthScore: this.healthScore
    };
  }
}

/**
 * Metrics data structure
 */
export interface BridgeMetricsData {
  processCount: number;
  cacheHitRate: number;
  emergenceCount: number;
  avgProcessingTime: number;
  healthScore: number;
}

/**
 * Export singleton instance with gradual migration support
 */
let bridgeInstance: MaiaCrystalBridge | null = null;

export function getMaiaBridge(config?: Partial<BridgeConfig>): MaiaCrystalBridge {
  if (!bridgeInstance) {
    // Start in hybrid mode for safety
    bridgeInstance = new MaiaCrystalBridge({
      mode: 'hybrid',
      crystalWeight: 0.3, // Start conservative
      ...config
    });
  }
  return bridgeInstance;
}

/**
 * Migration helper - gradually transition to Crystal Observer
 */
export class MigrationManager {
  private bridge: MaiaCrystalBridge;
  private migrationSteps = [
    { weight: 0.3, duration: 7 * 24 * 60 * 60 * 1000 }, // Week 1: 30%
    { weight: 0.5, duration: 7 * 24 * 60 * 60 * 1000 }, // Week 2: 50%
    { weight: 0.7, duration: 7 * 24 * 60 * 60 * 1000 }, // Week 3: 70%
    { weight: 0.9, duration: 7 * 24 * 60 * 60 * 1000 }, // Week 4: 90%
    { weight: 1.0, duration: Infinity }                  // Final: 100%
  ];
  private currentStep = 0;
  private stepStartTime = Date.now();

  constructor(bridge: MaiaCrystalBridge) {
    this.bridge = bridge;
    this.startMigration();
  }

  private startMigration() {
    // Check migration progress periodically
    setInterval(() => this.checkMigrationProgress(), 60 * 60 * 1000); // Every hour
  }

  private checkMigrationProgress() {
    const currentDuration = Date.now() - this.stepStartTime;
    const currentStepConfig = this.migrationSteps[this.currentStep];

    if (currentDuration >= currentStepConfig.duration && this.currentStep < this.migrationSteps.length - 1) {
      this.currentStep++;
      this.stepStartTime = Date.now();

      const newWeight = this.migrationSteps[this.currentStep].weight;
      this.bridge.updateConfig({ crystalWeight: newWeight });

      console.log(`📊 Migration progress: Step ${this.currentStep + 1}/${this.migrationSteps.length}`);
      console.log(`   Crystal weight: ${newWeight * 100}%`);

      // Switch to full crystal mode at final step
      if (newWeight === 1.0) {
        this.bridge.updateConfig({ mode: 'crystal' });
        console.log('🎉 Migration complete! Running in full Crystal Observer mode');
      }
    }
  }

  getCurrentProgress(): { step: number; weight: number; timeRemaining: number } {
    const currentStepConfig = this.migrationSteps[this.currentStep];
    const timeInStep = Date.now() - this.stepStartTime;
    const timeRemaining = Math.max(0, currentStepConfig.duration - timeInStep);

    return {
      step: this.currentStep + 1,
      weight: currentStepConfig.weight,
      timeRemaining
    };
  }
}