/**
 * MAIA Model System Integration
 * Central integration layer that connects all local model systems with MAIA's consciousness architecture
 */

import { IntelligentModelRouter } from './intelligent-router';
import { ModelHealthMonitor } from './health-monitor';
import { ModelAnalyticsEngine } from './analytics';
import { SmartBenchmarker } from './benchmarking';
import { ModelOptimizer } from './optimization';
import { GollamaBridge } from './gollama-bridge';
import {
  ModelConfig,
  ConsciousnessLevel,
  ModelPerformance,
  GenerationRequest,
  ModelSelection,
  ModelAnalytics,
  BenchmarkResult
} from './types';

export interface MAIAModelConfig {
  enableIntelligentRouting: boolean;
  enablePerformanceMonitoring: boolean;
  enableAutomaticOptimization: boolean;
  enableGollamaBridge: boolean;
  consciousnessLevelMapping: {
    [key in ConsciousnessLevel]: {
      preferredModels: string[];
      fallbackModels: string[];
      qualityThreshold: number;
      responseTimeLimit: number;
    };
  };
  monitoringConfig: {
    healthCheckInterval: number; // seconds
    performanceTrackingWindow: number; // hours
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      availability: number;
    };
  };
}

export interface MAIAGenerationRequest {
  content: string;
  consciousnessLevel: ConsciousnessLevel;
  userId?: string;
  sessionId?: string;
  context?: {
    previousMessages: string[];
    userProfile: any;
    conversationTopic: string;
  };
  preferences?: {
    prioritizeSpeed: boolean;
    prioritizeQuality: boolean;
    preferredProvider: 'ollama' | 'lm-studio' | 'auto';
  };
}

export interface MAIAGenerationResponse {
  content: string;
  metadata: {
    modelUsed: string;
    provider: string;
    responseTime: number;
    qualityScore?: number;
    appropriatenessScore?: number;
    confidenceLevel: number;
    selectionReasoning: string;
    consciousnessLevel: ConsciousnessLevel;
  };
  performance: {
    tokensPerSecond: number;
    memoryUsage: number;
    processingTime: number;
  };
  alternatives: Array<{
    model: string;
    score: number;
    reasoning: string;
  }>;
}

export class MAIAModelSystem {
  private router: IntelligentModelRouter;
  private healthMonitor: ModelHealthMonitor;
  private analytics: ModelAnalyticsEngine;
  private benchmarker: SmartBenchmarker;
  private optimizer: ModelOptimizer;
  private gollamaBridge?: GollamaBridge;
  private config: MAIAModelConfig;
  private isInitialized = false;

  constructor(config: Partial<MAIAModelConfig> = {}) {
    this.config = {
      enableIntelligentRouting: true,
      enablePerformanceMonitoring: true,
      enableAutomaticOptimization: true,
      enableGollamaBridge: true,
      consciousnessLevelMapping: {
        1: {
          preferredModels: ['mistral:7b', 'llama3.1:8b'],
          fallbackModels: ['deepseek-r1:latest'],
          qualityThreshold: 0.6,
          responseTimeLimit: 3000
        },
        2: {
          preferredModels: ['deepseek-r1:latest', 'llama3.1:8b'],
          fallbackModels: ['mistral:7b'],
          qualityThreshold: 0.7,
          responseTimeLimit: 5000
        },
        3: {
          preferredModels: ['deepseek-r1:latest', 'llama3.1:70b'],
          fallbackModels: ['nous-hermes2-mixtral:8x7b'],
          qualityThreshold: 0.5,
          responseTimeLimit: 8000
        },
        4: {
          preferredModels: ['llama3.1:70b', 'deepseek-r1:latest'],
          fallbackModels: ['nous-hermes2-mixtral:8x7b'],
          qualityThreshold: 0.55,
          responseTimeLimit: 12000
        },
        5: {
          preferredModels: ['llama3.1:70b', 'deepseek-r1:latest'],
          fallbackModels: [],
          qualityThreshold: 0.6,
          responseTimeLimit: 15000
        }
      },
      monitoringConfig: {
        healthCheckInterval: 30, // 30 seconds
        performanceTrackingWindow: 24, // 24 hours
        alertThresholds: {
          errorRate: 0.05, // 5%
          responseTime: 10000, // 10 seconds
          availability: 0.95 // 95%
        }
      },
      ...config
    };

    // Initialize components
    this.healthMonitor = new ModelHealthMonitor();
    this.analytics = new ModelAnalyticsEngine();
    this.benchmarker = new SmartBenchmarker();
    this.optimizer = new ModelOptimizer();

    // Initialize router with MAIA-specific configuration
    this.router = new IntelligentModelRouter({
      enableGollama: this.config.enableGollamaBridge,
      fallbackModel: 'deepseek-r1:latest',
      qualityThreshold: 0.5,
      enableLearning: true,
      maxResponseTime: 10000
    });

    // Initialize Gollama bridge if enabled
    if (this.config.enableGollamaBridge) {
      this.gollamaBridge = new GollamaBridge({
        autoSync: true,
        syncInterval: 30,
        preferredProvider: 'auto'
      });
    }
  }

  /**
   * Initialize the MAIA model system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🧠 MAIA Model System already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing MAIA Model System...');

      // Initialize components in order
      const initPromises = [];

      if (this.config.enableGollamaBridge && this.gollamaBridge) {
        console.log('🌉 Initializing Gollama bridge...');
        initPromises.push(this.gollamaBridge.initialize());
      }

      if (this.config.enablePerformanceMonitoring) {
        console.log('📊 Starting performance monitoring...');
        initPromises.push(this.startPerformanceMonitoring());
      }

      if (this.config.enableAutomaticOptimization) {
        console.log('⚡ Initializing automatic optimization...');
        initPromises.push(this.startAutomaticOptimization());
      }

      // Wait for all components to initialize
      await Promise.allSettled(initPromises);

      // Perform initial system health check
      await this.performSystemHealthCheck();

      this.isInitialized = true;
      console.log('✅ MAIA Model System initialized successfully');

      // Log system status
      this.logSystemStatus();

    } catch (error) {
      console.error('❌ Failed to initialize MAIA Model System:', error);
      throw error;
    }
  }

  /**
   * Generate response using MAIA's consciousness-aware model selection
   */
  async generateResponse(request: MAIAGenerationRequest): Promise<MAIAGenerationResponse> {
    if (!this.isInitialized) {
      throw new Error('MAIA Model System not initialized. Call initialize() first.');
    }

    const startTime = Date.now();

    try {
      // Create generation request for the router
      const routerRequest: GenerationRequest = {
        input: request.content,
        consciousnessLevel: request.consciousnessLevel,
        userId: request.userId,
        temperature: 0.7,
        maxTokens: 1000,
        context: request.context ? {
          complexity: this.analyzeComplexity(request.content),
          domain: this.analyzeDomain(request.content),
          urgency: 'standard',
          length: request.content.length > 200 ? 'long' : 'medium',
          emotionalTone: 'neutral',
          topics: [],
          entities: [],
          confidence: 0.8
        } : undefined
      };

      // Get model selection from intelligent router
      const selection: ModelSelection = await this.router.selectModel(routerRequest);

      // Generate response using best provider
      const generationResult = await this.router.generateWithBestProvider(
        request.content,
        {
          consciousnessLevel: request.consciousnessLevel,
          modelId: selection.selectedModel.id,
          userId: request.userId
        }
      );

      const responseTime = Date.now() - startTime;

      // Record performance metrics
      if (this.config.enablePerformanceMonitoring) {
        await this.recordPerformance({
          modelId: selection.selectedModel.id,
          responseTime,
          request,
          response: generationResult.text
        });
      }

      // Calculate quality scores
      const qualityScore = await this.evaluateResponseQuality(generationResult.text, request.content);
      const appropriatenessScore = await this.evaluateConsciousnessAppropriateness(
        generationResult.text,
        request.consciousnessLevel
      );

      return {
        content: generationResult.text,
        metadata: {
          modelUsed: generationResult.modelUsed,
          provider: generationResult.provider,
          responseTime,
          qualityScore,
          appropriatenessScore,
          confidenceLevel: selection.confidence,
          selectionReasoning: selection.reasoning,
          consciousnessLevel: request.consciousnessLevel
        },
        performance: {
          tokensPerSecond: this.estimateTokensPerSecond(generationResult.text, responseTime),
          memoryUsage: 0, // Would need system monitoring
          processingTime: responseTime
        },
        alternatives: selection.alternatives.map(alt => ({
          model: alt.model.name,
          score: alt.score,
          reasoning: alt.reasoning
        }))
      };

    } catch (error) {
      console.error('❌ MAIA generation failed:', error);

      // Record error for monitoring
      if (this.config.enablePerformanceMonitoring) {
        await this.recordError(request.consciousnessLevel, error as Error);
      }

      throw error;
    }
  }

  /**
   * Get system status and performance metrics
   */
  async getSystemStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    components: Record<string, any>;
    performance: Record<string, any>;
    recommendations: string[];
  }> {
    const status = {
      status: 'healthy' as const,
      components: {},
      performance: {},
      recommendations: [] as string[]
    };

    try {
      // Check router status
      status.components.router = {
        enabled: this.config.enableIntelligentRouting,
        models: this.router.getAvailableModels().length
      };

      // Check Gollama bridge status
      if (this.gollamaBridge) {
        status.components.gollama = this.router.getGollamaStatus();
      }

      // Get health monitoring status
      status.components.healthMonitor = {
        enabled: this.config.enablePerformanceMonitoring,
        activeModels: this.healthMonitor.getActiveModels().length
      };

      // Get performance analytics
      const models = this.router.getAvailableModels();
      if (models.length > 0) {
        const analytics = this.analytics.getModelAnalytics(models[0].id);
        status.performance.primaryModel = analytics;
      }

      // Get optimization recommendations
      if (this.config.enableAutomaticOptimization) {
        const optimizationPlan = await this.optimizer.analyzeAndRecommend();
        status.recommendations = Object.values(optimizationPlan)
          .flatMap(plan => plan.recommendations);
      }

      // Determine overall status
      const componentStatuses = Object.values(status.components);
      if (componentStatuses.some((comp: any) => comp.status === 'critical')) {
        status.status = 'critical';
      } else if (componentStatuses.some((comp: any) => comp.status === 'degraded')) {
        status.status = 'degraded';
      }

    } catch (error) {
      console.error('❌ Failed to get system status:', error);
      status.status = 'critical';
      status.recommendations.push('System status check failed - investigate logs');
    }

    return status;
  }

  /**
   * Get models suitable for a consciousness level
   */
  getModelsForConsciousnessLevel(level: ConsciousnessLevel): ModelConfig[] {
    return this.router.getModelsForConsciousnessLevel(level);
  }

  /**
   * Refresh model discovery and optimization
   */
  async refresh(): Promise<void> {
    console.log('🔄 Refreshing MAIA Model System...');

    try {
      // Refresh model discovery
      await this.router.refreshModelDiscovery();

      // Run benchmarks on new models
      if (this.config.enablePerformanceMonitoring) {
        await this.benchmarker.runFullBenchmark();
      }

      // Update optimization recommendations
      if (this.config.enableAutomaticOptimization) {
        await this.optimizer.analyzeAndRecommend();
      }

      console.log('✅ MAIA Model System refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh system:', error);
    }
  }

  // Private helper methods

  private async startPerformanceMonitoring(): Promise<void> {
    // Start periodic health checks
    setInterval(async () => {
      const models = this.router.getAvailableModels();
      for (const model of models) {
        try {
          await this.healthMonitor.checkModelHealth(model.id);
        } catch (error) {
          console.warn(`Health check failed for ${model.id}:`, error);
        }
      }
    }, this.config.monitoringConfig.healthCheckInterval * 1000);
  }

  private async startAutomaticOptimization(): Promise<void> {
    // Periodically check for optimization opportunities
    setInterval(async () => {
      try {
        const recommendations = await this.optimizer.analyzeAndRecommend();
        const urgentRecommendations = Object.values(recommendations)
          .filter(plan => plan.priority === 'high');

        if (urgentRecommendations.length > 0) {
          console.log(`⚡ Found ${urgentRecommendations.length} high-priority optimization opportunities`);
        }
      } catch (error) {
        console.warn('Optimization analysis failed:', error);
      }
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  private async performSystemHealthCheck(): Promise<void> {
    console.log('🔍 Performing system health check...');

    const models = this.router.getAvailableModels();
    if (models.length === 0) {
      throw new Error('No models available - check Ollama/LM Studio connections');
    }

    // Test a quick generation with each consciousness level
    for (let level = 1; level <= 5; level++) {
      const levelModels = this.getModelsForConsciousnessLevel(level as ConsciousnessLevel);
      if (levelModels.length === 0) {
        console.warn(`⚠️ No models available for consciousness level ${level}`);
      }
    }

    console.log('✅ System health check passed');
  }

  private logSystemStatus(): void {
    const models = this.router.getAvailableModels();
    const gollamaStatus = this.gollamaBridge ? this.router.getGollamaStatus() : null;

    console.log('📊 MAIA Model System Status:');
    console.log(`   Models available: ${models.length}`);
    console.log(`   Gollama bridge: ${gollamaStatus ? '✅ Connected' : '❌ Disabled/Disconnected'}`);
    console.log(`   Performance monitoring: ${this.config.enablePerformanceMonitoring ? '✅' : '❌'}`);
    console.log(`   Automatic optimization: ${this.config.enableAutomaticOptimization ? '✅' : '❌'}`);

    // Log consciousness level coverage
    for (let level = 1; level <= 5; level++) {
      const levelModels = this.getModelsForConsciousnessLevel(level as ConsciousnessLevel);
      console.log(`   Level ${level}: ${levelModels.length} models`);
    }
  }

  private analyzeComplexity(content: string): 'low' | 'medium' | 'high' {
    if (content.length > 500) return 'high';
    if (content.length > 100) return 'medium';
    return 'low';
  }

  private analyzeDomain(content: string): 'spiritual' | 'practical' | 'creative' | 'analytical' | 'conversational' {
    const contentLower = content.toLowerCase();

    if (['soul', 'consciousness', 'divine', 'sacred'].some(word => contentLower.includes(word))) {
      return 'spiritual';
    }
    if (['create', 'imagine', 'story', 'art'].some(word => contentLower.includes(word))) {
      return 'creative';
    }
    if (['analyze', 'compare', 'data', 'logic'].some(word => contentLower.includes(word))) {
      return 'analytical';
    }
    if (['how to', 'help', 'solve', 'fix'].some(phrase => contentLower.includes(phrase))) {
      return 'practical';
    }

    return 'conversational';
  }

  private async recordPerformance(data: {
    modelId: string;
    responseTime: number;
    request: MAIAGenerationRequest;
    response: string;
  }): Promise<void> {
    const performance: ModelPerformance = {
      modelId: data.modelId,
      timestamp: Date.now(),
      metrics: {
        responseTime: data.responseTime,
        tokensPerSecond: this.estimateTokensPerSecond(data.response, data.responseTime),
        inputTokens: Math.ceil(data.request.content.length / 4), // Rough estimate
        outputTokens: Math.ceil(data.response.length / 4), // Rough estimate
        memoryUsage: 0, // Would need system monitoring
        qualityScore: await this.evaluateResponseQuality(data.response, data.request.content),
        appropriatenessScore: await this.evaluateConsciousnessAppropriateness(data.response, data.request.consciousnessLevel)
      },
      context: {
        consciousnessLevel: data.request.consciousnessLevel,
        inputComplexity: this.analyzeComplexity(data.request.content),
        domain: this.analyzeDomain(data.request.content),
        urgency: 'standard'
      },
      userId: data.request.userId
    };

    this.analytics.recordPerformance(performance);
  }

  private async recordError(consciousnessLevel: ConsciousnessLevel, error: Error): Promise<void> {
    // Record error for analytics and monitoring
    console.error(`Model error at consciousness level ${consciousnessLevel}:`, error.message);
  }

  private estimateTokensPerSecond(text: string, responseTime: number): number {
    const estimatedTokens = Math.ceil(text.length / 4); // Rough tokens estimate
    const seconds = responseTime / 1000;
    return seconds > 0 ? estimatedTokens / seconds : 0;
  }

  private async evaluateResponseQuality(response: string, prompt: string): Promise<number> {
    // Simple heuristic quality evaluation
    let score = 50;

    // Length appropriateness
    if (response.length > 50 && response.length < 2000) score += 20;

    // Relevance check
    const promptWords = prompt.toLowerCase().split(' ').filter(w => w.length > 3);
    const responseWords = response.toLowerCase().split(' ');
    const relevantWords = promptWords.filter(word => responseWords.includes(word));
    score += Math.min(relevantWords.length * 5, 20);

    // Coherence check
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length >= 2) score += 10;

    return Math.min(Math.max(score, 0), 100);
  }

  private async evaluateConsciousnessAppropriateness(response: string, level: ConsciousnessLevel): Promise<number> {
    let score = 50;

    const responseLower = response.toLowerCase();
    const levelCharacteristics = {
      1: ['practical', 'simple', 'clear', 'helpful'],
      2: ['gentle', 'caring', 'supportive', 'empathetic'],
      3: ['wisdom', 'insight', 'balanced', 'thoughtful'],
      4: ['mystical', 'transcendent', 'profound', 'sacred'],
      5: ['unity', 'infinite', 'ineffable', 'cosmic']
    };

    const characteristics = levelCharacteristics[level] || [];
    const matchedCharacteristics = characteristics.filter(char => responseLower.includes(char));
    score += matchedCharacteristics.length * 12;

    return Math.min(Math.max(score, 0), 100);
  }
}

// Singleton instance for global use
export const maiaModelSystem = new MAIAModelSystem();