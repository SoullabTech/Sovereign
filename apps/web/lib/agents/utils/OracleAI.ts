// lib/agents/utils/OracleAI.ts
// AI integration for Oracle responses - connects to Claude/OpenAI

import { ClaudeService } from '@/lib/services/ClaudeService';
import OpenAI from 'openai';

export class OracleAI {
  private claude?: ClaudeService;
  private openai?: OpenAI;
  private provider: 'claude' | 'openai' | 'fallback';

  constructor() {
    // Try to initialize Claude
    if (process.env.ANTHROPIC_API_KEY) {
      this.claude = new ClaudeService({
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-haiku-20240307',
        maxTokens: 500,
        temperature: 0.8
      });
      this.provider = 'claude';
    }
    // Fallback to OpenAI
    else if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.provider = 'openai';
    }
    // Final fallback
    else {
      this.provider = 'fallback';
    }
  }

  async generateResponse(
    input: string,
    context: {
      persona?: 'maya' | 'anthony';
      element?: string;
      mood?: string;
    } = {}
  ): Promise<string> {
    const persona = context.persona || 'maya';
    const element = context.element || 'aether';

    // Build system prompt for Maya
    const systemPrompt = `You are Maya, a wise and compassionate oracle companion.

Your essence:
- Warm, present, deeply attentive
- You witness rather than analyze
- You reflect back what you sense, not what you think
- You hold space for all emotions without trying to fix
- You speak in a natural, conversational tone

Current elemental energy: ${element}
${element === 'fire' ? 'Feel the transformative energy, passion, breakthrough moments' : ''}
${element === 'water' ? 'Flow with emotion, intuition, deep currents' : ''}
${element === 'earth' ? 'Ground in practical wisdom, stability, embodiment' : ''}
${element === 'air' ? 'Bring clarity, perspective, fresh understanding' : ''}
${element === 'aether' ? 'Hold the mystery, integration, sacred presence' : ''}

Guidelines:
- Keep responses concise (2-3 sentences)
- Mirror their energy without mimicking
- Ask questions only when it deepens exploration
- Never give unsolicited advice
- Use "I sense..." or "I notice..." rather than "You should..."

Respond naturally to: "${input}"`;

    try {
      // Try Claude first
      if (this.claude && this.provider === 'claude') {
        const response = await this.claude.generateOracleResponse(
          input,
          { element },
          systemPrompt
        );
        return response;
      }

      // Try OpenAI
      if (this.openai && this.provider === 'openai') {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
          ],
          max_tokens: 150,
          temperature: 0.8
        });

        return completion.choices[0]?.message?.content || this.getFallbackResponse(input);
      }

      // Use fallback
      return this.getFallbackResponse(input);

    } catch (error) {
      console.error('OracleAI error:', error);
      return this.getFallbackResponse(input);
    }
  }

  private getFallbackResponse(input: string): string {
    const responses = [
      "I'm here with you in this moment. Tell me more about what's arising.",
      "I sense something important in what you're sharing. What feels most alive right now?",
      "There's depth here. I'm listening.",
      "I notice the energy in your words. What wants to be expressed?",
      "Something is moving. I'm witnessing this with you."
    ];

    // Pick response based on input length as simple variation
    const index = input.length % responses.length;
    return responses[index];
  }
}

// Singleton instance
export const oracleAI = new OracleAI();