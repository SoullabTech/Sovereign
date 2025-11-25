/**
 * Gollama Bridge - Integration layer between Ollama and LM Studio
 * Manages model synchronization and provides unified access to both platforms
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { ModelConfig, ModelProvider, ModelCapability } from './types';

const execAsync = promisify(exec);

export interface GollamaConfig {
  lmStudioPort: number;
  ollamaPort: number;
  syncInterval: number; // minutes
  autoSync: boolean;
  preferredProvider: 'ollama' | 'lm-studio' | 'auto';
}

export interface LMStudioModel {
  id: string;
  name: string;
  path: string;
  size: string;
  status: 'available' | 'loading' | 'error';
  parameters: {
    contextLength: number;
    temperature: number;
    maxTokens: number;
  };
}

export interface SyncStatus {
  lastSync: number;
  ollamaModels: string[];
  lmStudioModels: string[];
  syncedModels: string[];
  errors: string[];
}

export class GollamaBridge {
  private config: GollamaConfig;
  private syncStatus: SyncStatus;
  private isRunning = false;

  constructor(config: Partial<GollamaConfig> = {}) {
    this.config = {
      lmStudioPort: 1234,
      ollamaPort: 11434,
      syncInterval: 30,
      autoSync: true,
      preferredProvider: 'ollama',
      ...config
    };

    this.syncStatus = {
      lastSync: 0,
      ollamaModels: [],
      lmStudioModels: [],
      syncedModels: [],
      errors: []
    };
  }

  async initialize(): Promise<void> {
    console.log('🌉 Initializing Gollama Bridge...');

    try {
      // Check if gollama is installed
      await this.checkGollamaInstallation();

      // Test connections
      await this.testConnections();

      // Start initial sync
      await this.syncModels();

      // Start auto-sync if enabled
      if (this.config.autoSync) {
        this.startAutoSync();
      }

      this.isRunning = true;
      console.log('✅ Gollama Bridge initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Gollama Bridge:', error);
      throw error;
    }
  }

  private async checkGollamaInstallation(): Promise<void> {
    try {
      const { stdout } = await execAsync('which gollama');
      if (!stdout.trim()) {
        throw new Error('gollama not found');
      }
      console.log('✅ Gollama installation verified');
    } catch (error) {
      throw new Error('Gollama not installed. Run: brew install gollama');
    }
  }

  private async testConnections(): Promise<void> {
    const connections = await Promise.allSettled([
      this.testOllamaConnection(),
      this.testLMStudioConnection()
    ]);

    const [ollamaResult, lmStudioResult] = connections;

    if (ollamaResult.status === 'rejected') {
      console.warn('⚠️ Ollama connection failed:', ollamaResult.reason);
    } else {
      console.log('✅ Ollama connection verified');
    }

    if (lmStudioResult.status === 'rejected') {
      console.warn('⚠️ LM Studio connection failed:', lmStudioResult.reason);
    } else {
      console.log('✅ LM Studio connection verified');
    }

    // At least one connection must work
    if (ollamaResult.status === 'rejected' && lmStudioResult.status === 'rejected') {
      throw new Error('Both Ollama and LM Studio are unavailable');
    }
  }

  private async testOllamaConnection(): Promise<void> {
    try {
      const response = await fetch(`http://localhost:${this.config.ollamaPort}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Ollama not running on port ${this.config.ollamaPort}`);
    }
  }

  private async testLMStudioConnection(): Promise<void> {
    try {
      const response = await fetch(`http://localhost:${this.config.lmStudioPort}/v1/models`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      throw new Error(`LM Studio not running on port ${this.config.lmStudioPort}`);
    }
  }

  async syncModels(): Promise<SyncStatus> {
    console.log('🔄 Syncing models between Ollama and LM Studio...');

    try {
      // Get models from both providers
      const [ollamaModels, lmStudioModels] = await Promise.allSettled([
        this.getOllamaModels(),
        this.getLMStudioModels()
      ]);

      // Update sync status
      this.syncStatus.ollamaModels = ollamaModels.status === 'fulfilled' ? ollamaModels.value : [];
      this.syncStatus.lmStudioModels = lmStudioModels.status === 'fulfilled' ? lmStudioModels.value : [];
      this.syncStatus.errors = [];

      if (ollamaModels.status === 'rejected') {
        this.syncStatus.errors.push(`Ollama sync failed: ${ollamaModels.reason}`);
      }

      if (lmStudioModels.status === 'rejected') {
        this.syncStatus.errors.push(`LM Studio sync failed: ${lmStudioModels.reason}`);
      }

      // Bridge models using gollama
      await this.bridgeModels();

      this.syncStatus.lastSync = Date.now();
      console.log('✅ Model sync completed');

      return this.syncStatus;

    } catch (error) {
      console.error('❌ Model sync failed:', error);
      this.syncStatus.errors.push(`Sync failed: ${error}`);
      throw error;
    }
  }

  private async getOllamaModels(): Promise<string[]> {
    try {
      const response = await fetch(`http://localhost:${this.config.ollamaPort}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];

    } catch (error) {
      throw new Error(`Failed to get Ollama models: ${error}`);
    }
  }

  private async getLMStudioModels(): Promise<string[]> {
    try {
      const response = await fetch(`http://localhost:${this.config.lmStudioPort}/v1/models`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];

    } catch (error) {
      throw new Error(`Failed to get LM Studio models: ${error}`);
    }
  }

  private async bridgeModels(): Promise<void> {
    console.log('🌉 Bridging models with gollama...');

    try {
      // Use gollama to expose Ollama models to LM Studio
      const { stdout, stderr } = await execAsync('gollama bridge');

      if (stderr && !stderr.includes('INFO')) {
        console.warn('⚠️ Gollama bridge warnings:', stderr);
      }

      // Parse gollama output to determine successfully bridged models
      this.syncStatus.syncedModels = this.parseGollamaOutput(stdout);

      console.log(`✅ Bridged ${this.syncStatus.syncedModels.length} models`);

    } catch (error) {
      console.error('❌ Failed to bridge models:', error);
      throw error;
    }
  }

  private parseGollamaOutput(output: string): string[] {
    // Parse gollama output to extract successfully bridged models
    const lines = output.split('\n');
    const bridgedModels: string[] = [];

    for (const line of lines) {
      if (line.includes('Exposing') && line.includes('as')) {
        // Example: "Exposing ollama:llama3.1:70b as llama3.1:70b"
        const match = line.match(/Exposing.*?([^\s]+)\s+as\s+([^\s]+)/);
        if (match) {
          bridgedModels.push(match[1]);
        }
      }
    }

    return bridgedModels;
  }

  private startAutoSync(): void {
    if (this.config.autoSync && this.config.syncInterval > 0) {
      console.log(`🔄 Starting auto-sync every ${this.config.syncInterval} minutes`);

      setInterval(async () => {
        try {
          await this.syncModels();
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }, this.config.syncInterval * 60 * 1000);
    }
  }

  async getAllAvailableModels(): Promise<ModelConfig[]> {
    const models: ModelConfig[] = [];

    try {
      // Get Ollama models
      if (this.syncStatus.ollamaModels.length > 0) {
        for (const modelName of this.syncStatus.ollamaModels) {
          models.push(await this.createOllamaModelConfig(modelName));
        }
      }

      // Get LM Studio models
      if (this.syncStatus.lmStudioModels.length > 0) {
        for (const modelName of this.syncStatus.lmStudioModels) {
          models.push(await this.createLMStudioModelConfig(modelName));
        }
      }

      return models;

    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }

  private async createOllamaModelConfig(modelName: string): Promise<ModelConfig> {
    const size = await this.getModelSize(modelName, 'ollama');
    const capabilities = this.inferModelCapabilities(modelName);

    return {
      id: `ollama:${modelName}`,
      name: modelName,
      provider: 'ollama',
      size,
      quantization: this.inferQuantization(modelName),
      parameters: {
        temperature: 0.7,
        maxTokens: 4096,
        topP: 0.9
      },
      capabilities,
      consciousnessLevels: this.inferConsciousnessLevels(modelName, capabilities),
      tags: ['local', 'ollama', ...this.inferModelTags(modelName)]
    };
  }

  private async createLMStudioModelConfig(modelName: string): Promise<ModelConfig> {
    const size = await this.getModelSize(modelName, 'lm-studio');
    const capabilities = this.inferModelCapabilities(modelName);

    return {
      id: `lm-studio:${modelName}`,
      name: modelName,
      provider: 'lm-studio',
      size,
      quantization: this.inferQuantization(modelName),
      parameters: {
        temperature: 0.7,
        maxTokens: 4096,
        topP: 0.9
      },
      capabilities,
      consciousnessLevels: this.inferConsciousnessLevels(modelName, capabilities),
      tags: ['local', 'lm-studio', ...this.inferModelTags(modelName)]
    };
  }

  private async getModelSize(modelName: string, provider: 'ollama' | 'lm-studio'): Promise<string> {
    try {
      if (provider === 'ollama') {
        const { stdout } = await execAsync(`ollama show ${modelName.split(':')[0]}`);
        const match = stdout.match(/Size:\s*([^\n]+)/);
        return match ? match[1].trim() : 'Unknown';
      } else {
        // For LM Studio, size might be in the model path or name
        const sizeMatch = modelName.match(/(\d+[BM])/i);
        return sizeMatch ? sizeMatch[1] : 'Unknown';
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  private inferModelCapabilities(modelName: string): ModelCapability[] {
    const capabilities: ModelCapability[] = [];
    const nameLower = modelName.toLowerCase();

    // Base capabilities for all models
    capabilities.push('text-generation');

    // Infer specific capabilities from model name
    if (nameLower.includes('instruct') || nameLower.includes('chat')) {
      capabilities.push('conversation');
    }

    if (nameLower.includes('code') || nameLower.includes('deepseek')) {
      capabilities.push('coding');
    }

    if (nameLower.includes('math') || nameLower.includes('reasoning')) {
      capabilities.push('reasoning');
    }

    // Creative models
    if (nameLower.includes('creative') || nameLower.includes('llama')) {
      capabilities.push('creative-writing');
    }

    return capabilities;
  }

  private inferQuantization(modelName: string): string | undefined {
    const nameLower = modelName.toLowerCase();

    if (nameLower.includes('q4_k_m')) return 'Q4_K_M';
    if (nameLower.includes('q8_0')) return 'Q8_0';
    if (nameLower.includes('q4_0')) return 'Q4_0';
    if (nameLower.includes('q5_k_m')) return 'Q5_K_M';
    if (nameLower.includes('fp16')) return 'FP16';

    return undefined;
  }

  private inferConsciousnessLevels(modelName: string, capabilities: ModelCapability[]): number[] {
    const nameLower = modelName.toLowerCase();
    const levels: number[] = [];

    // All models can handle basic levels
    levels.push(1, 2, 3);

    // Larger models or specific types can handle higher levels
    if (nameLower.includes('70b') || nameLower.includes('65b') ||
        capabilities.includes('reasoning') || capabilities.includes('creative-writing')) {
      levels.push(4);
    }

    // Only the most capable models for level 5
    if (nameLower.includes('70b') || nameLower.includes('deepseek')) {
      levels.push(5);
    }

    return levels;
  }

  private inferModelTags(modelName: string): string[] {
    const tags: string[] = [];
    const nameLower = modelName.toLowerCase();

    // Size tags
    if (nameLower.includes('7b')) tags.push('7b', 'small');
    if (nameLower.includes('13b')) tags.push('13b', 'medium');
    if (nameLower.includes('70b') || nameLower.includes('65b')) tags.push('large', '70b');

    // Model family tags
    if (nameLower.includes('llama')) tags.push('llama', 'meta');
    if (nameLower.includes('mistral')) tags.push('mistral');
    if (nameLower.includes('deepseek')) tags.push('deepseek', 'reasoning');
    if (nameLower.includes('qwen')) tags.push('qwen', 'alibaba');

    // Capability tags
    if (nameLower.includes('instruct')) tags.push('instruct');
    if (nameLower.includes('chat')) tags.push('chat');
    if (nameLower.includes('code')) tags.push('coding');

    return tags;
  }

  async generateWithBestProvider(
    prompt: string,
    options: {
      modelId?: string;
      consciousnessLevel?: number;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<{ text: string; provider: 'ollama' | 'lm-studio'; modelUsed: string }> {
    const { modelId, consciousnessLevel = 3, temperature = 0.7, maxTokens = 1000 } = options;

    try {
      let selectedModel: ModelConfig;

      if (modelId) {
        const allModels = await this.getAllAvailableModels();
        selectedModel = allModels.find(m => m.id === modelId) || allModels[0];
      } else {
        // Auto-select best model based on consciousness level and availability
        selectedModel = await this.selectBestModel(consciousnessLevel);
      }

      if (!selectedModel) {
        throw new Error('No suitable model found');
      }

      const [provider, actualModelId] = selectedModel.id.split(':', 2);

      if (provider === 'ollama') {
        return await this.generateWithOllama(actualModelId, prompt, temperature, maxTokens);
      } else {
        return await this.generateWithLMStudio(actualModelId, prompt, temperature, maxTokens);
      }

    } catch (error) {
      console.error('Generation failed:', error);
      throw error;
    }
  }

  private async selectBestModel(consciousnessLevel: number): Promise<ModelConfig> {
    const allModels = await this.getAllAvailableModels();

    // Filter models that support the requested consciousness level
    const suitableModels = allModels.filter(model =>
      model.consciousnessLevels.includes(consciousnessLevel)
    );

    if (suitableModels.length === 0) {
      throw new Error(`No models support consciousness level ${consciousnessLevel}`);
    }

    // Prefer the configured provider
    const preferredModels = suitableModels.filter(m => m.provider === this.config.preferredProvider);
    if (preferredModels.length > 0) {
      return preferredModels[0];
    }

    return suitableModels[0];
  }

  private async generateWithOllama(
    modelId: string,
    prompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<{ text: string; provider: 'ollama'; modelUsed: string }> {
    const response = await fetch(`http://localhost:${this.config.ollamaPort}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
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
      modelUsed: modelId
    };
  }

  private async generateWithLMStudio(
    modelId: string,
    prompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<{ text: string; provider: 'lm-studio'; modelUsed: string }> {
    const response = await fetch(`http://localhost:${this.config.lmStudioPort}/v1/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        prompt,
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0]?.text || '',
      provider: 'lm-studio',
      modelUsed: modelId
    };
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  getConfig(): GollamaConfig {
    return { ...this.config };
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('🛑 Gollama Bridge stopped');
  }

  isConnected(): boolean {
    return this.isRunning && this.syncStatus.lastSync > 0;
  }
}