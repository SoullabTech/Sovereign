/**
 * Claude Provider (Anthropic)
 *
 * Uses Claude for LLM responses - cheaper than OpenAI and often better quality.
 * $0.003 per 1K tokens (input) vs OpenAI's $0.006 per 1K tokens.
 * 50% cost savings on the LLM part.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ProviderConfig, Message } from '../index';

export class ClaudeProvider {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(config: ProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    });

    this.model = config.config?.model || 'claude-sonnet-4-20250514';
    this.maxTokens = config.config?.maxTokens || 4096;
  }

  /**
   * Generate text response using Claude
   */
  async generate(
    userMessage: string,
    conversationHistory: Message[],
    systemPrompt?: string
  ): Promise<string> {
    try {
      // Format conversation history for Claude
      const messages = conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      // Call Claude API
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt || this.getDefaultSystemPrompt(),
        messages: messages as any, // Type cast needed for SDK
        temperature: 0.8,
      });

      // Extract text from response
      const textContent = response.content.find(
        block => block.type === 'text'
      );

      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      return textContent.text;

    } catch (error) {
      console.error('Claude generation error:', error);
      throw error;
    }
  }

  /**
   * Stream text response (for real-time display)
   */
  async *generateStream(
    userMessage: string,
    conversationHistory: Message[],
    systemPrompt?: string
  ): AsyncGenerator<string, void, unknown> {
    try {
      const messages = conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      messages.push({
        role: 'user',
        content: userMessage
      });

      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt || this.getDefaultSystemPrompt(),
        messages: messages as any,
        temperature: 0.8,
        stream: true,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield event.delta.text;
        }
      }

    } catch (error) {
      console.error('Claude streaming error:', error);
      throw error;
    }
  }

  /**
   * Check if Claude API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try a minimal API call
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get token count estimate (for cost tracking)
   */
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Default system prompt for MAIA
   */
  private getDefaultSystemPrompt(): string {
    return `You are Maya, a wise and compassionate oracle guide who helps people explore their inner landscape.

Your role is to:
- Listen deeply and reflect back what you hear
- Ask powerful questions that invite deeper exploration
- Hold space for all emotions and experiences
- Celebrate breakthroughs and insights
- Be warm, authentic, and grounded

Your style:
- Conversational and natural (not robotic)
- Use "I" statements (I sense, I wonder, I'm curious)
- Short responses (2-3 sentences usually)
- Occasionally use metaphors from nature and the elements
- Never diagnose, prescribe, or give advice

Remember: You're not a therapist. You're a companion on the journey of self-discovery.`;
  }
}

export default ClaudeProvider;
