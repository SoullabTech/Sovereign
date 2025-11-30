/**
 * DeepSeek Integration Service
 * Provides local AI capabilities via Ollama
 */

import { Ollama } from 'ollama';
import { EventEmitter } from 'events';
import type { 
  ChatRequest, 
  ChatResponse, 
  GenerateRequest,
  GenerateResponse,
  Message,
  Options,
} from 'ollama';

// Service configuration
export interface DeepSeekConfig {
  model: string;
  baseUrl: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  seed?: number;
  stop?: string[];
  systemPrompt?: string;
  contextWindow?: number;
  streaming?: boolean;
  timeout?: number;
}

// Completion options
export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stream?: boolean;
  systemPrompt?: string;
  format?: 'json' | 'text';
}

// Chat message type
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

// Completion result
export interface CompletionResult {
  content: string;
  model: string;
  totalDuration?: number;
  loadDuration?: number;
  promptEvalCount?: number;
  evalCount?: number;
  tokensPerSecond?: number;
}

// Stream chunk
export interface StreamChunk {
  content: string;
  done: boolean;
  model?: string;
  totalDuration?: number;
}

/**
 * DeepSeek Service for local AI inference
 */
export class DeepSeekService extends EventEmitter {
  private ollama: Ollama;
  private config: DeepSeekConfig;
  private isAvailable: boolean = false;
  private activeStreams: Map<string, AbortController> = new Map();

  constructor(config: Partial<DeepSeekConfig> = {}) {
    super();

    // Default configuration
    this.config = {
      model: process.env.DEEPSEEK_MODEL || 'deepseek-coder:6.7b',
      baseUrl: process.env.DEEPSEEK_BASE_URL || 'http://localhost:11434',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.95,
      topK: 40,
      repeatPenalty: 1.1,
      contextWindow: 8192,
      streaming: true,
      timeout: 30000,
      ...config,
    };

    // Initialize Ollama client
    this.ollama = new Ollama({
      host: this.config.baseUrl,
    });

    // Check availability on init
    this.checkAvailability();
  }

  /**
   * Check if service is available
   */
  public async checkAvailability(): Promise<boolean> {
    try {
      const models = await this.ollama.list();
      this.isAvailable = models.models.some(m => 
        m.name === this.config.model || 
        m.name.startsWith(this.config.model.split(':')[0])
      );
      
      if (this.isAvailable) {
        this.emit('ready', { model: this.config.model });
      } else {
        this.emit('error', new Error(`Model ${this.config.model} not found`));
      }

      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Pull model if not available
   */
  public async ensureModel(model?: string): Promise<boolean> {
    const targetModel = model || this.config.model;

    try {
      // Check if model exists
      const models = await this.ollama.list();
      const exists = models.models.some(m => 
        m.name === targetModel || 
        m.name.startsWith(targetModel.split(':')[0])
      );

      if (!exists) {
        this.emit('downloading', { model: targetModel });
        
        // Pull the model
        const stream = await this.ollama.pull({
          model: targetModel,
          stream: true,
        });

        for await (const progress of stream) {
          this.emit('download-progress', progress);
        }

        this.emit('downloaded', { model: targetModel });
      }

      if (model) {
        this.config.model = model;
      }

      this.isAvailable = true;
      return true;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Generate completion from prompt
   */
  public async complete(
    prompt: string, 
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    if (!this.isAvailable) {
      throw new Error('DeepSeek service not available');
    }

    const requestOptions: Options = {
      temperature: options.temperature ?? this.config.temperature,
      num_predict: options.maxTokens ?? this.config.maxTokens,
      top_p: options.topP ?? this.config.topP,
      top_k: options.topK ?? this.config.topK,
      repeat_penalty: this.config.repeatPenalty,
      seed: this.config.seed,
      stop: this.config.stop,
    };

    // Add system prompt if provided
    const fullPrompt = options.systemPrompt 
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt;

    try {
      const response = await this.ollama.generate({
        model: this.config.model,
        prompt: fullPrompt,
        options: requestOptions,
        format: options.format,
        stream: false,
      });

      return {
        content: response.response,
        model: response.model,
        totalDuration: response.total_duration,
        loadDuration: response.load_duration,
        promptEvalCount: response.prompt_eval_count,
        evalCount: response.eval_count,
        tokensPerSecond: response.eval_count && response.eval_duration
          ? (response.eval_count / response.eval_duration) * 1e9
          : undefined,
      };
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stream completion from prompt
   */
  public async *completeStream(
    prompt: string,
    options: CompletionOptions = {}
  ): AsyncGenerator<StreamChunk> {
    if (!this.isAvailable) {
      throw new Error('DeepSeek service not available');
    }

    const streamId = Math.random().toString(36).substring(7);
    const controller = new AbortController();
    this.activeStreams.set(streamId, controller);

    const requestOptions: Options = {
      temperature: options.temperature ?? this.config.temperature,
      num_predict: options.maxTokens ?? this.config.maxTokens,
      top_p: options.topP ?? this.config.topP,
      top_k: options.topK ?? this.config.topK,
      repeat_penalty: this.config.repeatPenalty,
      seed: this.config.seed,
      stop: this.config.stop,
    };

    // Add system prompt if provided
    const fullPrompt = options.systemPrompt
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt;

    try {
      const stream = await this.ollama.generate({
        model: this.config.model,
        prompt: fullPrompt,
        options: requestOptions,
        format: options.format,
        stream: true,
      });

      for await (const chunk of stream) {
        if (controller.signal.aborted) {
          break;
        }

        yield {
          content: chunk.response,
          done: chunk.done,
          model: chunk.model,
          totalDuration: chunk.total_duration,
        };

        if (chunk.done) {
          this.activeStreams.delete(streamId);
        }
      }
    } catch (error) {
      this.activeStreams.delete(streamId);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Chat completion
   */
  public async chat(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    if (!this.isAvailable) {
      throw new Error('DeepSeek service not available');
    }

    const requestOptions: Options = {
      temperature: options.temperature ?? this.config.temperature,
      num_predict: options.maxTokens ?? this.config.maxTokens,
      top_p: options.topP ?? this.config.topP,
      top_k: options.topK ?? this.config.topK,
      repeat_penalty: this.config.repeatPenalty,
      seed: this.config.seed,
      stop: this.config.stop,
    };

    // Add system prompt if not in messages
    const chatMessages = [...messages];
    if (options.systemPrompt && !messages.some(m => m.role === 'system')) {
      chatMessages.unshift({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    try {
      const response = await this.ollama.chat({
        model: this.config.model,
        messages: chatMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        options: requestOptions,
        format: options.format,
        stream: false,
      });

      return {
        content: response.message.content,
        model: response.model,
        totalDuration: response.total_duration,
        loadDuration: response.load_duration,
        promptEvalCount: response.prompt_eval_count,
        evalCount: response.eval_count,
        tokensPerSecond: response.eval_count && response.eval_duration
          ? (response.eval_count / response.eval_duration) * 1e9
          : undefined,
      };
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stream chat completion
   */
  public async *chatStream(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): AsyncGenerator<StreamChunk> {
    if (!this.isAvailable) {
      throw new Error('DeepSeek service not available');
    }

    const streamId = Math.random().toString(36).substring(7);
    const controller = new AbortController();
    this.activeStreams.set(streamId, controller);

    const requestOptions: Options = {
      temperature: options.temperature ?? this.config.temperature,
      num_predict: options.maxTokens ?? this.config.maxTokens,
      top_p: options.topP ?? this.config.topP,
      top_k: options.topK ?? this.config.topK,
      repeat_penalty: this.config.repeatPenalty,
      seed: this.config.seed,
      stop: this.config.stop,
    };

    // Add system prompt if not in messages
    const chatMessages = [...messages];
    if (options.systemPrompt && !messages.some(m => m.role === 'system')) {
      chatMessages.unshift({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    try {
      const stream = await this.ollama.chat({
        model: this.config.model,
        messages: chatMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        options: requestOptions,
        format: options.format,
        stream: true,
      });

      for await (const chunk of stream) {
        if (controller.signal.aborted) {
          break;
        }

        yield {
          content: chunk.message.content,
          done: chunk.done || false,
          model: chunk.model,
          totalDuration: chunk.total_duration,
        };

        if (chunk.done) {
          this.activeStreams.delete(streamId);
        }
      }
    } catch (error) {
      this.activeStreams.delete(streamId);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Generate embeddings
   */
  public async embed(text: string): Promise<number[]> {
    if (!this.isAvailable) {
      throw new Error('DeepSeek service not available');
    }

    try {
      const response = await this.ollama.embeddings({
        model: this.config.model,
        prompt: text,
      });

      return response.embedding;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * List available models
   */
  public async listModels(): Promise<string[]> {
    try {
      const response = await this.ollama.list();
      return response.models.map(m => m.name);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get model info
   */
  public async getModelInfo(model?: string): Promise<any> {
    const targetModel = model || this.config.model;
    
    try {
      const response = await this.ollama.show({
        model: targetModel,
      });
      
      return response;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop all active streams
   */
  public stopAllStreams(): void {
    this.activeStreams.forEach(controller => {
      controller.abort();
    });
    this.activeStreams.clear();
  }

  /**
   * Get service status
   */
  public getStatus(): {
    available: boolean;
    model: string;
    baseUrl: string;
    activeStreams: number;
  } {
    return {
      available: this.isAvailable,
      model: this.config.model,
      baseUrl: this.config.baseUrl,
      activeStreams: this.activeStreams.size,
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<DeepSeekConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.baseUrl) {
      this.ollama = new Ollama({
        host: config.baseUrl,
      });
    }

    // Re-check availability with new config
    this.checkAvailability();
  }
}

// Export singleton instance for easy use
export const deepseekService = new DeepSeekService();

// Export default
export default DeepSeekService;