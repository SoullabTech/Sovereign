/**
 * MAIA Intelligent Model Router
 * Analyzes context and automatically selects optimal models for each request
 */

import {
  ModelConfig,
  ModelSelection,
  ContextAnalysis,
  ConsciousnessLevel,
  GenerationRequest,
  ModelPerformance
} from './types';
import { modelAnalytics } from './analytics';
import { modelHealthMonitor } from './health-monitor';
import { GollamaBridge } from './gollama-bridge';

interface RouterConfig {
  fallbackModel: string;
  maxResponseTime: number; // ms
  qualityThreshold: number; // 0-1
  enableLearning: boolean;
  enableGollama: boolean;
  gollamaConfig?: {
    lmStudioPort: number;
    ollamaPort: number;
    autoSync: boolean;
    preferredProvider: 'ollama' | 'lmstudio' | 'auto';
  };
}

interface ModelRegistry {
  models: Map<string, ModelConfig>;
  consciousnessLevelModels: Map<ConsciousnessLevel, string[]>;
  domainSpecialists: Map<string, string[]>;
}

export class IntelligentModelRouter {
  private config: RouterConfig;
  private registry: ModelRegistry;
  private contextAnalyzer: ContextAnalyzer;
  private gollamaBridge?: GollamaBridge;

  constructor(config?: Partial<RouterConfig>) {
    this.config = {
      fallbackModel: 'deepseek-r1:latest',
      maxResponseTime: 10000, // 10 seconds
      qualityThreshold: 0.7,
      enableLearning: true,
      enableGollama: true,
      gollamaConfig: {
        lmStudioPort: 1234,
        ollamaPort: 11434,
        autoSync: true,
        preferredProvider: 'auto'
      },
      ...config
    };

    this.registry = {
      models: new Map(),
      consciousnessLevelModels: new Map(),
      domainSpecialists: new Map()
    };

    this.contextAnalyzer = new ContextAnalyzer();

    // Initialize Gollama bridge if enabled
    if (this.config.enableGollama && this.config.gollamaConfig) {
      this.gollamaBridge = new GollamaBridge(this.config.gollamaConfig);
      this.initializeGollama();
    }

    this.initializeRegistry();
  }

  /**
   * Select optimal model for a request
   */
  async selectModel(request: GenerationRequest): Promise<ModelSelection> {
    const startTime = Date.now();

    try {
      // Analyze context if not provided
      const context = request.context || await this.contextAnalyzer.analyze(request.input);

      // Get candidate models for consciousness level
      const candidates = this.getCandidateModels(request.consciousnessLevel, context);

      // Score and rank models
      const scoredModels = await this.scoreModels(candidates, request, context);

      // Select best available model
      const selection = await this.makeSelection(scoredModels, request);

      console.log(`🧠 [Router] Selected ${selection.selectedModel.id} for consciousness level ${request.consciousnessLevel} (${Date.now() - startTime}ms)`);

      return selection;
    } catch (error) {
      console.error('❌ Model selection failed:', error);

      // Return fallback selection
      return this.getFallbackSelection(request);
    }
  }

  /**
   * Get candidate models for consciousness level and context
   */
  private getCandidateModels(level: ConsciousnessLevel, context: ContextAnalysis): ModelConfig[] {
    const candidates: ModelConfig[] = [];

    // Get models configured for this consciousness level
    const levelModels = this.registry.consciousnessLevelModels.get(level) || [];
    levelModels.forEach(modelId => {
      const model = this.registry.models.get(modelId);
      if (model) candidates.push(model);
    });

    // Add domain specialists if applicable
    const domainModels = this.registry.domainSpecialists.get(context.domain) || [];
    domainModels.forEach(modelId => {
      const model = this.registry.models.get(modelId);
      if (model && !candidates.find(c => c.id === model.id)) {
        candidates.push(model);
      }
    });

    // If no specific models, use all available
    if (candidates.length === 0) {
      candidates.push(...Array.from(this.registry.models.values()));
    }

    return candidates;
  }

  /**
   * Score models based on multiple criteria
   */
  private async scoreModels(
    candidates: ModelConfig[],
    request: GenerationRequest,
    context: ContextAnalysis
  ): Promise<Array<{ model: ModelConfig; score: number; reasoning: string }>> {
    const scoredModels: Array<{ model: ModelConfig; score: number; reasoning: string }> = [];

    for (const model of candidates) {
      const score = await this.calculateModelScore(model, request, context);
      scoredModels.push(score);
    }

    // Sort by score (highest first)
    return scoredModels.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate comprehensive score for a model
   */
  private async calculateModelScore(
    model: ModelConfig,
    request: GenerationRequest,
    context: ContextAnalysis
  ): Promise<{ model: ModelConfig; score: number; reasoning: string }> {
    let score = 0;
    const reasons: string[] = [];

    // 1. Health and availability (30% weight)
    const health = modelHealthMonitor.getModelHealth(model.id);
    if (health) {
      const healthScore = this.calculateHealthScore(health);
      score += healthScore * 0.3;
      reasons.push(`health: ${(healthScore * 100).toFixed(0)}%`);
    } else {
      score += 0.5 * 0.3; // Assume average if no health data
      reasons.push('health: unknown');
    }

    // 2. Performance history (25% weight)
    const analytics = modelAnalytics.getModelAnalytics(model.id, 24);
    if (analytics) {
      const performanceScore = this.calculatePerformanceScore(analytics, request, context);
      score += performanceScore * 0.25;
      reasons.push(`performance: ${(performanceScore * 100).toFixed(0)}%`);
    } else {
      score += 0.5 * 0.25;
      reasons.push('performance: unknown');
    }

    // 3. Capability match (20% weight)
    const capabilityScore = this.calculateCapabilityScore(model, context);
    score += capabilityScore * 0.2;
    reasons.push(`capabilities: ${(capabilityScore * 100).toFixed(0)}%`);

    // 4. Context appropriateness (15% weight)
    const contextScore = this.calculateContextScore(model, context, request.consciousnessLevel);
    score += contextScore * 0.15;
    reasons.push(`context: ${(contextScore * 100).toFixed(0)}%`);

    // 5. User preferences and learning (10% weight)
    const preferenceScore = await this.calculatePreferenceScore(model, request);
    score += preferenceScore * 0.1;
    reasons.push(`preference: ${(preferenceScore * 100).toFixed(0)}%`);

    return {
      model,
      score,
      reasoning: reasons.join(', ')
    };
  }

  /**
   * Calculate health-based score
   */
  private calculateHealthScore(health: any): number {
    if (health.status === 'unavailable') return 0;
    if (health.status === 'degraded') return 0.3;

    let score = 0.5; // Base for 'healthy'
    score += health.availability * 0.3; // Availability boost
    score += (1 - health.errorRate) * 0.2; // Low error rate boost

    return Math.min(score, 1);
  }

  /**
   * Calculate performance-based score
   */
  private calculatePerformanceScore(analytics: any, request: GenerationRequest, context: ContextAnalysis): number {
    let score = 0;

    // Response time score (faster = better)
    const responseTime = analytics.usage.averageResponseTime;
    const timeScore = Math.max(0, 1 - (responseTime / this.config.maxResponseTime));
    score += timeScore * 0.4;

    // Quality score
    const qualityScore = analytics.performance.qualityScoreAverage || 0.5;
    score += qualityScore * 0.4;

    // Consciousness level performance
    const levelPerf = analytics.consciousnessLevelBreakdown[request.consciousnessLevel];
    if (levelPerf && levelPerf.requests > 0) {
      const levelScore = levelPerf.averageQuality / 5; // Assuming 1-5 scale
      score += levelScore * 0.2;
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate capability match score
   */
  private calculateCapabilityScore(model: ModelConfig, context: ContextAnalysis): number {
    const requiredCapabilities = this.getRequiredCapabilities(context);
    let score = 0;

    for (const required of requiredCapabilities) {
      const modelCap = model.capabilities.find(c => c.type === required.type);
      if (modelCap) {
        score += modelCap.strength * required.importance;
      }
    }

    return Math.min(score / requiredCapabilities.length, 1);
  }

  /**
   * Calculate context appropriateness score
   */
  private calculateContextScore(model: ModelConfig, context: ContextAnalysis, level: ConsciousnessLevel): number {
    let score = 0;

    // Check if model supports this consciousness level
    if (model.consciousnessLevels.includes(level)) {
      score += 0.4;
    }

    // Domain appropriateness
    const domainTags = {
      spiritual: ['sacred', 'mystical', 'consciousness'],
      creative: ['creative', 'artistic', 'imagination'],
      analytical: ['reasoning', 'analysis', 'logic'],
      practical: ['practical', 'utility', 'everyday'],
      conversational: ['conversation', 'chat', 'social']
    };

    const relevantTags = domainTags[context.domain] || [];
    const tagMatches = model.tags.filter(tag => relevantTags.includes(tag)).length;
    score += (tagMatches / Math.max(relevantTags.length, 1)) * 0.3;

    // Complexity match
    const complexityMatch = this.getComplexityMatch(model, context.complexity);
    score += complexityMatch * 0.3;

    return Math.min(score, 1);
  }

  /**
   * Calculate user preference score
   */
  private async calculatePreferenceScore(model: ModelConfig, request: GenerationRequest): Promise<number> {
    if (!this.config.enableLearning || !request.userId) {
      return 0.5; // Neutral if no learning or user ID
    }

    // Get user's historical preferences for this model
    const userHistory = await this.getUserModelHistory(request.userId, model.id);

    if (userHistory.length === 0) {
      return 0.5; // Neutral if no history
    }

    // Calculate average satisfaction
    const avgSatisfaction = userHistory.reduce((sum, h) => sum + h.satisfaction, 0) / userHistory.length;
    return avgSatisfaction;
  }

  /**
   * Make final model selection
   */
  private async makeSelection(
    scoredModels: Array<{ model: ModelConfig; score: number; reasoning: string }>,
    request: GenerationRequest
  ): Promise<ModelSelection> {

    if (scoredModels.length === 0) {
      return this.getFallbackSelection(request);
    }

    const selected = scoredModels[0];
    const alternatives = scoredModels.slice(1, 4); // Top 3 alternatives

    // Check if selected model meets minimum threshold
    if (selected.score < this.config.qualityThreshold) {
      console.warn(`⚠️ Selected model ${selected.model.id} below quality threshold (${selected.score})`);
    }

    // Generate fallback models
    const fallbackModels = alternatives.map(alt => alt.model);

    // Add general fallback if not already included
    const fallback = this.registry.models.get(this.config.fallbackModel);
    if (fallback && !fallbackModels.find(m => m.id === fallback.id)) {
      fallbackModels.push(fallback);
    }

    return {
      selectedModel: selected.model,
      reasoning: `Selected based on: ${selected.reasoning} (score: ${(selected.score * 100).toFixed(1)}%)`,
      alternatives: alternatives.map(alt => ({
        model: alt.model,
        score: alt.score,
        reasoning: alt.reasoning
      })),
      confidence: selected.score,
      fallbackModels
    };
  }

  /**
   * Generate text using the best available provider (Gollama bridge or direct)
   */
  async generateWithBestProvider(
    prompt: string,
    options: {
      consciousnessLevel?: ConsciousnessLevel;
      modelId?: string;
      temperature?: number;
      maxTokens?: number;
      userId?: string;
    } = {}
  ): Promise<{ text: string; provider: string; modelUsed: string; selectionReasoning: string }> {
    const {
      consciousnessLevel = 3,
      modelId,
      temperature = 0.7,
      maxTokens = 1000,
      userId
    } = options;

    try {
      // If Gollama bridge is available, use it for intelligent provider selection
      if (this.gollamaBridge && this.gollamaBridge.isConnected()) {
        const result = await this.gollamaBridge.generateWithBestProvider(prompt, {
          modelId,
          consciousnessLevel,
          temperature,
          maxTokens
        });

        return {
          text: result.text,
          provider: result.provider,
          modelUsed: result.modelUsed,
          selectionReasoning: `Gollama bridge selected ${result.provider}:${result.modelUsed}`
        };
      }

      // Fallback to local model selection and direct generation
      const selection = await this.selectModel({
        input: prompt,
        consciousnessLevel,
        modelId,
        userId,
        temperature,
        maxTokens
      });

      // Use Ollama API directly
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selection.selectedModel.id.replace('ollama:', ''),
          prompt,
          stream: false,
          options: {
            temperature,
            num_predict: maxTokens
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        text: data.response,
        provider: 'ollama',
        modelUsed: selection.selectedModel.id,
        selectionReasoning: selection.reasoning
      };

    } catch (error) {
      console.error('❌ Generation failed:', error);
      throw error;
    }
  }

  /**
   * Get available models from all providers
   */
  getAvailableModels(): ModelConfig[] {
    return Array.from(this.registry.models.values());
  }

  /**
   * Get models suitable for a specific consciousness level
   */
  getModelsForConsciousnessLevel(level: ConsciousnessLevel): ModelConfig[] {
    const modelIds = this.registry.consciousnessLevelModels.get(level) || [];
    return modelIds
      .map(id => this.registry.models.get(id))
      .filter((model): model is ModelConfig => model !== undefined);
  }

  /**
   * Get Gollama bridge status
   */
  getGollamaStatus(): { connected: boolean; lastSync: number; models: number } | null {
    if (!this.gollamaBridge) {
      return null;
    }

    const status = this.gollamaBridge.getSyncStatus();
    return {
      connected: this.gollamaBridge.isConnected(),
      lastSync: status.lastSync,
      models: status.ollamaModels.length + status.lmStudioModels.length
    };
  }

  /**
   * Refresh model discovery through Gollama
   */
  async refreshModelDiscovery(): Promise<void> {
    if (this.gollamaBridge) {
      try {
        console.log('🔄 Refreshing model discovery...');
        await this.gollamaBridge.syncModels();
        await this.initializeRegistry(); // Re-initialize with new models
        console.log('✅ Model discovery refreshed');
      } catch (error) {
        console.error('❌ Failed to refresh model discovery:', error);
      }
    }
  }

  /**
   * Get fallback selection when normal selection fails
   */
  private getFallbackSelection(request: GenerationRequest): ModelSelection {
    const fallbackModel = this.registry.models.get(this.config.fallbackModel);

    if (!fallbackModel) {
      throw new Error('No fallback model available');
    }

    return {
      selectedModel: fallbackModel,
      reasoning: 'Fallback selection due to selection failure',
      alternatives: [],
      confidence: 0.1,
      fallbackModels: []
    };
  }

  /**
   * Initialize Gollama bridge
   */
  private async initializeGollama(): Promise<void> {
    if (!this.gollamaBridge) return;

    try {
      console.log('🌉 Initializing Gollama bridge...');
      await this.gollamaBridge.initialize();
      console.log('✅ Gollama bridge initialized successfully');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Gollama bridge:', error);
      console.log('Falling back to Ollama-only mode');
      this.gollamaBridge = undefined;
    }
  }

  /**
   * Initialize model registry with available models
   */
  private async initializeRegistry(): Promise<void> {
    let models: ModelConfig[] = [];

    // Try to get models from Gollama bridge first
    if (this.gollamaBridge && this.gollamaBridge.isConnected()) {
      try {
        console.log('🔍 Discovering models through Gollama bridge...');
        models = await this.gollamaBridge.getAllAvailableModels();
        console.log(`✅ Discovered ${models.length} models via Gollama`);
      } catch (error) {
        console.warn('⚠️ Failed to discover models via Gollama, using fallback:', error);
      }
    }

    // Fallback to hardcoded models if Gollama discovery fails
    if (models.length === 0) {
      console.log('📋 Using fallback model configurations...');
      models = this.getFallbackModelConfigs();
    }

    // Register discovered models
    models.forEach(model => {
      this.registry.models.set(model.id, model);
    });

    // Dynamically set up consciousness level mappings based on discovered models
    this.setupConsciousnessLevelMappings(models);

    // Set up domain specialists based on model capabilities and tags
    this.setupDomainSpecialistMappings(models);

    console.log(`🧠 Intelligent Model Router initialized with ${models.length} models across ${Array.from(this.registry.consciousnessLevelModels.keys()).length} consciousness levels`);
  }

  /**
   * Get fallback model configurations when dynamic discovery fails
   */
  private getFallbackModelConfigs(): ModelConfig[] {
    return [
      {
        id: 'deepseek-r1:latest',
        name: 'DeepSeek R1',
        provider: 'ollama',
        size: '5.2GB',
        quantization: 'Q4_K_M',
        parameters: { temperature: 0.7, maxTokens: 800 },
        capabilities: [
          { type: 'reasoning', strength: 0.95, description: 'Exceptional reasoning with thinking process' },
          { type: 'analysis', strength: 0.9, description: 'Deep analytical capabilities' },
          { type: 'conversation', strength: 0.85, description: 'Natural conversation flow' }
        ],
        consciousnessLevels: [1, 2, 3, 4, 5],
        tags: ['reasoning', 'analysis', 'consciousness']
      },
      {
        id: 'llama3.1:70b',
        name: 'Llama 3.1 70B',
        provider: 'ollama',
        size: '42GB',
        quantization: 'FP16',
        parameters: { temperature: 0.75, maxTokens: 1000 },
        capabilities: [
          { type: 'reasoning', strength: 0.9, description: 'Advanced reasoning capabilities' },
          { type: 'creativity', strength: 0.85, description: 'Creative and imaginative' },
          { type: 'sacred', strength: 0.8, description: 'Handles spiritual content well' }
        ],
        consciousnessLevels: [3, 4, 5],
        tags: ['large', 'creative', 'sacred', 'complex']
      },
      {
        id: 'llama3.1:8b',
        name: 'Llama 3.1 8B',
        provider: 'ollama',
        size: '4.9GB',
        quantization: 'Q4_K_M',
        parameters: { temperature: 0.65, maxTokens: 500 },
        capabilities: [
          { type: 'conversation', strength: 0.8, description: 'Good for general conversation' },
          { type: 'analysis', strength: 0.7, description: 'Basic analytical capabilities' }
        ],
        consciousnessLevels: [1, 2, 3],
        tags: ['fast', 'conversation', 'practical']
      }
    ];
  }

  /**
   * Setup consciousness level mappings based on available models
   */
  private setupConsciousnessLevelMappings(models: ModelConfig[]): void {
    // Clear existing mappings
    this.registry.consciousnessLevelModels.clear();

    for (let level = 1; level <= 5; level++) {
      const suitableModels = models
        .filter(model => model.consciousnessLevels.includes(level as ConsciousnessLevel))
        .map(model => model.id);

      if (suitableModels.length > 0) {
        this.registry.consciousnessLevelModels.set(level as ConsciousnessLevel, suitableModels);
      }
    }

    // Ensure each level has at least one model (use fallback)
    for (let level = 1; level <= 5; level++) {
      const currentModels = this.registry.consciousnessLevelModels.get(level as ConsciousnessLevel);
      if (!currentModels || currentModels.length === 0) {
        // Find a suitable fallback
        const fallback = models.find(m =>
          m.id.includes('deepseek') || m.id.includes('llama') || m.id.includes('mistral')
        );
        if (fallback) {
          this.registry.consciousnessLevelModels.set(level as ConsciousnessLevel, [fallback.id]);
        }
      }
    }
  }

  /**
   * Setup domain specialist mappings based on model tags and capabilities
   */
  private setupDomainSpecialistMappings(models: ModelConfig[]): void {
    // Clear existing mappings
    this.registry.domainSpecialists.clear();

    const domainMappings = {
      spiritual: ['sacred', 'mystical', 'consciousness', 'wisdom'],
      creative: ['creative', 'artistic', 'imagination', 'uncensored'],
      analytical: ['reasoning', 'analysis', 'logic', 'evaluation'],
      practical: ['practical', 'utility', 'coding', 'fast'],
      conversational: ['conversation', 'chat', 'social', 'dialogue']
    };

    Object.entries(domainMappings).forEach(([domain, keywords]) => {
      const specialists = models
        .filter(model =>
          keywords.some(keyword =>
            model.tags.includes(keyword) ||
            model.capabilities.some(cap => cap.type === keyword)
          )
        )
        .map(model => model.id);

      if (specialists.length > 0) {
        this.registry.domainSpecialists.set(domain, specialists);
      }
    });
  }

  /**
   * Get required capabilities for context
   */
  private getRequiredCapabilities(context: ContextAnalysis): Array<{ type: any; importance: number }> {
    const requirements: Array<{ type: any; importance: number }> = [];

    // Base requirements by domain
    switch (context.domain) {
      case 'spiritual':
        requirements.push({ type: 'sacred', importance: 0.8 });
        requirements.push({ type: 'reasoning', importance: 0.6 });
        break;
      case 'creative':
        requirements.push({ type: 'creativity', importance: 0.9 });
        requirements.push({ type: 'conversation', importance: 0.5 });
        break;
      case 'analytical':
        requirements.push({ type: 'reasoning', importance: 0.9 });
        requirements.push({ type: 'analysis', importance: 0.8 });
        break;
      case 'practical':
        requirements.push({ type: 'conversation', importance: 0.7 });
        requirements.push({ type: 'coding', importance: 0.3 });
        break;
      default:
        requirements.push({ type: 'conversation', importance: 0.8 });
    }

    // Adjust by complexity
    if (context.complexity === 'high') {
      requirements.push({ type: 'reasoning', importance: 0.7 });
    }

    return requirements;
  }

  /**
   * Get complexity match score
   */
  private getComplexityMatch(model: ModelConfig, complexity: string): number {
    const modelComplexity = this.inferModelComplexity(model);

    const complexityMap = { low: 1, medium: 2, high: 3 };
    const modelLevel = complexityMap[modelComplexity as keyof typeof complexityMap] || 2;
    const requiredLevel = complexityMap[complexity as keyof typeof complexityMap] || 2;

    // Prefer models that match or slightly exceed required complexity
    const diff = Math.abs(modelLevel - requiredLevel);
    return Math.max(0, 1 - (diff * 0.3));
  }

  /**
   * Infer model complexity level
   */
  private inferModelComplexity(model: ModelConfig): string {
    const size = model.size.toLowerCase();
    if (size.includes('70b') || size.includes('405b')) return 'high';
    if (size.includes('8x7b') || size.includes('13b') || size.includes('34b')) return 'medium';
    return 'low';
  }

  /**
   * Get user's historical model satisfaction
   */
  private async getUserModelHistory(userId: string, modelId: string): Promise<Array<{ satisfaction: number }>> {
    // Placeholder - would integrate with actual user feedback system
    return [];
  }
}

/**
 * Context Analyzer - Analyzes input text to determine context
 */
class ContextAnalyzer {
  async analyze(input: string): Promise<ContextAnalysis> {
    const analysis: ContextAnalysis = {
      complexity: this.analyzeComplexity(input),
      domain: this.analyzeDomain(input),
      urgency: this.analyzeUrgency(input),
      length: this.analyzeLength(input),
      emotionalTone: this.analyzeEmotionalTone(input),
      topics: this.extractTopics(input),
      entities: this.extractEntities(input),
      confidence: 0.8 // Placeholder confidence
    };

    return analysis;
  }

  private analyzeComplexity(input: string): 'low' | 'medium' | 'high' {
    // Simple heuristic - can be enhanced with ML
    const complexIndicators = [
      'analyze', 'compare', 'synthesize', 'philosophical', 'consciousness',
      'quantum', 'metaphysical', 'dialectical', 'transcendental'
    ];

    const foundIndicators = complexIndicators.filter(indicator =>
      input.toLowerCase().includes(indicator)
    ).length;

    if (foundIndicators >= 2 || input.length > 500) return 'high';
    if (foundIndicators >= 1 || input.length > 100) return 'medium';
    return 'low';
  }

  private analyzeDomain(input: string): 'spiritual' | 'practical' | 'creative' | 'analytical' | 'conversational' {
    const domainKeywords = {
      spiritual: ['soul', 'consciousness', 'sacred', 'divine', 'spiritual', 'mystical', 'meditation', 'awakening'],
      creative: ['create', 'imagine', 'artistic', 'design', 'story', 'creative', 'art', 'music'],
      analytical: ['analyze', 'data', 'compare', 'reasoning', 'logic', 'evaluate', 'assess'],
      practical: ['how to', 'help me', 'solve', 'fix', 'tutorial', 'guide', 'steps']
    };

    const scores = Object.entries(domainKeywords).map(([domain, keywords]) => {
      const count = keywords.filter(keyword =>
        input.toLowerCase().includes(keyword)
      ).length;
      return { domain, score: count };
    });

    const topDomain = scores.reduce((max, current) =>
      current.score > max.score ? current : max
    );

    return topDomain.score > 0 ? topDomain.domain as any : 'conversational';
  }

  private analyzeUrgency(input: string): 'realtime' | 'standard' | 'deep' {
    const urgentKeywords = ['urgent', 'quick', 'fast', 'immediately', 'now'];
    const deepKeywords = ['contemplate', 'meditate', 'deeply', 'thoroughly', 'philosophy'];

    const hasUrgent = urgentKeywords.some(keyword => input.toLowerCase().includes(keyword));
    const hasDeep = deepKeywords.some(keyword => input.toLowerCase().includes(keyword));

    if (hasUrgent) return 'realtime';
    if (hasDeep) return 'deep';
    return 'standard';
  }

  private analyzeLength(input: string): 'short' | 'medium' | 'long' {
    if (input.length < 50) return 'short';
    if (input.length < 200) return 'medium';
    return 'long';
  }

  private analyzeEmotionalTone(input: string): 'neutral' | 'positive' | 'negative' | 'sacred' | 'questioning' {
    const toneKeywords = {
      positive: ['happy', 'excited', 'grateful', 'love', 'joy', 'wonderful'],
      negative: ['sad', 'angry', 'frustrated', 'difficult', 'problem', 'pain'],
      sacred: ['divine', 'holy', 'sacred', 'blessed', 'transcendent', 'mystical'],
      questioning: ['how', 'why', 'what', 'when', 'where', '?']
    };

    for (const [tone, keywords] of Object.entries(toneKeywords)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        return tone as any;
      }
    }

    return 'neutral';
  }

  private extractTopics(input: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const words = input.toLowerCase().split(/\W+/);
    const topics = words.filter(word => word.length > 3);
    return [...new Set(topics)].slice(0, 5);
  }

  private extractEntities(input: string): string[] {
    // Placeholder for named entity recognition
    const capitalizedWords = input.match(/\b[A-Z][a-z]+\b/g) || [];
    return [...new Set(capitalizedWords)];
  }
}

// Singleton instance
export const intelligentRouter = new IntelligentModelRouter();