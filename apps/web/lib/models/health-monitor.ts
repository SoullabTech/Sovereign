/**
 * MAIA Model Health Monitoring System
 * Tracks model availability, performance, and health metrics
 */

import { ModelHealth, ModelConfig, ModelPerformance } from './types';

interface HealthCheckConfig {
  interval: number; // ms between health checks
  timeout: number; // ms timeout for health check
  retryAttempts: number;
  testPrompt: string;
}

export class ModelHealthMonitor {
  private healthData = new Map<string, ModelHealth>();
  private performanceHistory = new Map<string, ModelPerformance[]>();
  private checkInterval?: NodeJS.Timeout;
  private config: HealthCheckConfig;

  constructor(config?: Partial<HealthCheckConfig>) {
    this.config = {
      interval: 30000, // Check every 30 seconds
      timeout: 10000, // 10 second timeout
      retryAttempts: 3,
      testPrompt: "Hello",
      ...config
    };
  }

  /**
   * Start continuous health monitoring
   */
  start(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkAllModels();
    }, this.config.interval);

    // Initial check
    this.checkAllModels();
    console.log('🏥 Model Health Monitor started');
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
    console.log('🏥 Model Health Monitor stopped');
  }

  /**
   * Check health of all available models
   */
  async checkAllModels(): Promise<void> {
    try {
      const models = await this.getAvailableModels();
      const healthChecks = models.map(model => this.checkModelHealth(model.id));
      await Promise.allSettled(healthChecks);
    } catch (error) {
      console.error('❌ Health check batch failed:', error);
    }
  }

  /**
   * Check health of a specific model
   */
  async checkModelHealth(modelId: string): Promise<ModelHealth> {
    const startTime = Date.now();
    const health: ModelHealth = {
      modelId,
      status: 'loading',
      lastChecked: startTime,
      availability: 0,
      averageResponseTime: 0,
      memoryFootprint: 0,
      errorRate: 0,
      issues: []
    };

    try {
      // Test model response
      const testResult = await this.testModelResponse(modelId);

      if (testResult.success) {
        health.status = testResult.responseTime > 10000 ? 'degraded' : 'healthy';
        health.availability = this.calculateAvailability(modelId);
        health.averageResponseTime = testResult.responseTime;
        health.memoryFootprint = await this.getModelMemoryUsage(modelId);
        health.errorRate = this.calculateErrorRate(modelId);
      } else {
        health.status = 'unavailable';
        health.issues.push(testResult.error || 'Unknown error');
      }
    } catch (error) {
      health.status = 'unavailable';
      health.issues.push(`Health check failed: ${error}`);
    }

    // Store health data
    this.healthData.set(modelId, health);

    // Log health changes
    this.logHealthChanges(modelId, health);

    return health;
  }

  /**
   * Test if a model can respond to a basic prompt
   */
  private async testModelResponse(modelId: string): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Determine provider and endpoint
      const provider = this.getModelProvider(modelId);

      if (provider === 'ollama') {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelId,
            prompt: this.config.testPrompt,
            stream: false,
            options: { num_predict: 10 }
          }),
          signal: AbortSignal.timeout(this.config.timeout)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          responseTime: Date.now() - startTime
        };
      } else if (provider === 'lm-studio') {
        // Test LM Studio endpoint
        const response = await fetch('http://localhost:1234/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelId,
            messages: [{ role: 'user', content: this.config.testPrompt }],
            max_tokens: 10
          }),
          signal: AbortSignal.timeout(this.config.timeout)
        });

        return {
          success: response.ok,
          responseTime: Date.now() - startTime,
          error: response.ok ? undefined : `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    return {
      success: false,
      responseTime: Date.now() - startTime,
      error: 'Unknown provider'
    };
  }

  /**
   * Get memory usage for a model (estimated)
   */
  private async getModelMemoryUsage(modelId: string): Promise<number> {
    try {
      // For Ollama, we can estimate based on model size
      const modelSizeMap: Record<string, number> = {
        'deepseek-r1:latest': 5200, // MB
        'llama3.1:70b': 42000,
        'llama3.1:8b': 4900,
        'mistral:7b': 4400,
        'nous-hermes2-mixtral:8x7b': 26000,
        'nomic-embed-text:latest': 274
      };

      return modelSizeMap[modelId] || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate model availability percentage
   */
  private calculateAvailability(modelId: string): number {
    const history = this.performanceHistory.get(modelId) || [];
    if (history.length === 0) return 1.0;

    const recentHistory = history.slice(-100); // Last 100 requests
    const successfulRequests = recentHistory.filter(p => p.metrics.responseTime > 0).length;

    return successfulRequests / recentHistory.length;
  }

  /**
   * Calculate error rate for a model
   */
  private calculateErrorRate(modelId: string): number {
    const history = this.performanceHistory.get(modelId) || [];
    if (history.length === 0) return 0;

    const recentHistory = history.slice(-100);
    const errorRequests = recentHistory.filter(p => p.metrics.responseTime === 0).length;

    return errorRequests / recentHistory.length;
  }

  /**
   * Determine provider from model ID
   */
  private getModelProvider(modelId: string): 'ollama' | 'lm-studio' | 'anthropic' {
    // Simple heuristic - can be enhanced
    if (modelId.includes('claude')) return 'anthropic';
    if (modelId.includes('lm-studio')) return 'lm-studio';
    return 'ollama';
  }

  /**
   * Get list of available models
   */
  private async getAvailableModels(): Promise<ModelConfig[]> {
    const models: ModelConfig[] = [];

    try {
      // Get Ollama models
      const ollamaResponse = await fetch('http://localhost:11434/api/tags');
      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        models.push(...data.models.map((m: any) => ({
          id: m.name,
          name: m.name,
          provider: 'ollama',
          size: this.extractModelSize(m.name),
          parameters: { temperature: 0.7, maxTokens: 500 },
          capabilities: [],
          consciousnessLevels: [1, 2, 3, 4, 5],
          tags: []
        })));
      }
    } catch (error) {
      console.warn('Could not fetch Ollama models:', error);
    }

    return models;
  }

  /**
   * Extract model size from model name
   */
  private extractModelSize(modelName: string): string {
    const sizeMatch = modelName.match(/(\d+[bB])/);
    return sizeMatch ? sizeMatch[1] : 'unknown';
  }

  /**
   * Log significant health changes
   */
  private logHealthChanges(modelId: string, newHealth: ModelHealth): void {
    const previousHealth = this.healthData.get(modelId);

    if (!previousHealth) {
      console.log(`🏥 [${modelId}] Health monitoring started - Status: ${newHealth.status}`);
      return;
    }

    if (previousHealth.status !== newHealth.status) {
      console.log(`🏥 [${modelId}] Status changed: ${previousHealth.status} → ${newHealth.status}`);

      if (newHealth.status === 'unavailable') {
        console.warn(`⚠️ [${modelId}] Model became unavailable. Issues: ${newHealth.issues.join(', ')}`);
      } else if (newHealth.status === 'healthy' && previousHealth.status === 'unavailable') {
        console.log(`✅ [${modelId}] Model recovered and is healthy`);
      }
    }

    if (newHealth.averageResponseTime > previousHealth.averageResponseTime * 2) {
      console.warn(`⏱️ [${modelId}] Response time degraded: ${previousHealth.averageResponseTime}ms → ${newHealth.averageResponseTime}ms`);
    }
  }

  /**
   * Get current health status for all models
   */
  getAllHealthStatus(): Map<string, ModelHealth> {
    return new Map(this.healthData);
  }

  /**
   * Get health status for specific model
   */
  getModelHealth(modelId: string): ModelHealth | undefined {
    return this.healthData.get(modelId);
  }

  /**
   * Add performance data point
   */
  recordPerformance(performance: ModelPerformance): void {
    const history = this.performanceHistory.get(performance.modelId) || [];
    history.push(performance);

    // Keep only last 1000 entries per model
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }

    this.performanceHistory.set(performance.modelId, history);
  }

  /**
   * Get performance history for a model
   */
  getPerformanceHistory(modelId: string): ModelPerformance[] {
    return this.performanceHistory.get(modelId) || [];
  }
}

// Singleton instance
export const modelHealthMonitor = new ModelHealthMonitor();