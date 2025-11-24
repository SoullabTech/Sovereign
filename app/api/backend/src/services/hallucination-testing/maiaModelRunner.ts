import Anthropic from '@anthropic-ai/sdk';
import type { ModelRunner } from './testRunner';

export class MaiaModelRunner implements ModelRunner {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async call(prompt: string, context?: any): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      return '';
    } catch (error) {
      console.error('[MaiaModelRunner] Error calling Claude API:', error);
      throw error;
    }
  }
}

export function createMaiaModelRunner(apiKey?: string): MaiaModelRunner {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY is required');
  }
  return new MaiaModelRunner(key);
}