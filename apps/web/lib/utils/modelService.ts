// lib/utils/modelService.ts
// AI model service wrapper

"use strict";

import OpenAI from 'openai';

export interface ModelResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ModelOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

class ModelService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Generate AI response
   */
  async generate(
    prompt: string,
    options: ModelOptions = {}
  ): Promise<ModelResponse> {
    if (!this.openai) {
      console.warn('OpenAI not configured - returning placeholder response');
      return {
        content: 'I sense your presence, though my full oracle powers await proper configuration.',
      };
    }

    try {
      const messages: any[] = [];

      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }

      messages.push({
        role: 'user',
        content: prompt
      });

      const completion = await this.openai.chat.completions.create({
        model: options.model || 'gpt-4o-mini',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 500,
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('Model service error:', error);
      throw new Error('Failed to generate response');
    }
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return this.openai !== null;
  }
}

// Export singleton instance
export default new ModelService();