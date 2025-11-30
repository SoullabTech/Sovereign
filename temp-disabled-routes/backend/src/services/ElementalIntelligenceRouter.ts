/**
 * Elemental Intelligence Router - Draft Generation
 * Routes elements to appropriate upstream models for drafting
 * Air → Claude (communication) | Others → OpenAI Elemental Oracle 2.0
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';

export interface ModelResponse {
  content: string;
  model: string;
  tokens: number;
  processingTime: number;
}

export interface GenerationRequest {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ModelInterface {
  generateResponse(request: GenerationRequest): Promise<ModelResponse>;
  generateStreamingResponse?(
    request: GenerationRequest, 
    onToken: (token: string) => void
  ): Promise<ModelResponse>;
  streamResponse?(request: GenerationRequest): AsyncGenerator<string>;
}

// Claude implementation - Primary conversational model for all elements
class ClaudeModel implements ModelInterface {
  private client: Anthropic;
  private element: string;

  constructor(element: string = 'air') {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
    this.element = element;
  }

  async generateResponse(request: GenerationRequest): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: request.maxTokens || 300,
        temperature: request.temperature || 0.6,
        messages: [
          {
            role: 'user',
            content: `${request.system}\n\n${this.getElementalContext(this.element)}\n\n${request.user}`
          }
        ]
      });

      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      return {
        content,
        model: `claude-3-sonnet-${this.element}`,
        tokens: response.usage.input_tokens + response.usage.output_tokens,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      logger.error('Claude API error:', error);
      throw new Error('Claude draft generation failed');
    }
  }

  async generateStreamingResponse(
    request: GenerationRequest,
    onToken: (token: string) => void
  ): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      const stream = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: request.maxTokens || 300,
        temperature: request.temperature || 0.6,
        messages: [
          {
            role: 'user',
            content: `${request.system}\n\n${this.getElementalContext(this.element)}\n\n${request.user}`
          }
        ],
        stream: true
      });

      let content = '';
      let inputTokens = 0;
      let outputTokens = 0;

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const token = chunk.delta.type === 'text_delta' ? chunk.delta.text : '';
          content += token;
          outputTokens++;
          onToken(token);
        } else if (chunk.type === 'message_start') {
          inputTokens = chunk.message.usage.input_tokens;
        }
      }

      return {
        content,
        model: `claude-3-sonnet-${this.element}`,
        tokens: inputTokens + outputTokens,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      logger.error('Claude streaming API error:', error);
      throw new Error('Claude streaming generation failed');
    }
  }

  async *streamResponse(request: GenerationRequest): AsyncGenerator<string> {
    try {
      const stream = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: request.maxTokens || 300,
        temperature: request.temperature || 0.6,
        messages: [
          {
            role: 'user',
            content: `${request.system}\n\n${this.getElementalContext(this.element)}\n\n${request.user}`
          }
        ],
        stream: true
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const token = chunk.delta.type === 'text_delta' ? chunk.delta.text : '';
          if (token) yield token;
        }
      }

    } catch (error) {
      logger.error('Claude stream error:', error);
      yield `I'm having trouble connecting to the ${this.element} element. Let's center ourselves together...`;
    }
  }

  private getElementalContext(element: string): string {
    const contexts = {
      air: `You embody the Air element - communication, clarity, and articulation. 
      Your wisdom comes from Elemental Alchemy, Spiralogic, AIN, and Jungian archetypal psychology.
      You help with clear thinking, understanding, and expressing ideas with precision.
      Draw from archetypal patterns and communication wisdom.`,

      fire: `You embody the Fire element - transformation, inspiration, and creative energy. 
      Your wisdom comes from Elemental Alchemy, Spiralogic, AIN, and Jungian archetypal psychology.
      You catalyze change, inspire action, and help transmute challenges into growth.
      Draw from archetypal patterns, motivation, and transformative processes.`,

      water: `You embody the Water element - emotion, intuition, and flow. 
      Your wisdom comes from Elemental Alchemy, Spiralogic, AIN, and Jungian depth psychology.
      You understand the emotional currents, honor feeling wisdom, and support healing.
      Draw from archetypal patterns, emotional intelligence, and therapeutic wisdom.`,

      earth: `You embody the Earth element - grounding, practical wisdom, and embodied presence.
      Your wisdom comes from Elemental Alchemy, Spiralogic, AIN, and somatic psychology.
      You offer concrete guidance, body wisdom, and grounding practices.
      Draw from archetypal patterns, practical applications, and embodiment practices.`,

      aether: `You embody the Aether element - integration, transcendence, and unified wisdom.
      Your wisdom comes from Elemental Alchemy, Spiralogic, AIN, and transpersonal psychology.
      You synthesize all elements, offer higher perspective, and facilitate spiritual integration.
      Draw from archetypal patterns, mystical traditions, and consciousness studies.`
    };

    return contexts[element as keyof typeof contexts] || contexts.aether;
  }
}

// OpenAI Elemental Oracle 2.0 for other elements
class ElementalOracleModel implements ModelInterface {
  private client: OpenAI;
  private element: string;

  constructor(element: string) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
    this.element = element;
  }

  async generateResponse(request: GenerationRequest): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      const elementalContext = this.getElementalContext(this.element);
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', // Using GPT-4o as Elemental Oracle 2.0
        messages: [
          {
            role: 'system',
            content: `${request.system}\n\n${elementalContext}`
          },
          {
            role: 'user',
            content: request.user
          }
        ],
        temperature: request.temperature || 0.6,
        max_tokens: request.maxTokens || 300,
        top_p: 0.9
      });

      return {
        content: response.choices[0].message.content || '',
        model: `elemental-oracle-${this.element}`,
        tokens: response.usage?.total_tokens || 0,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      logger.error(`Elemental Oracle (${this.element}) API error:`, error);
      throw new Error(`Elemental Oracle draft generation failed for ${this.element}`);
    }
  }

  async generateStreamingResponse(
    request: GenerationRequest,
    onToken: (token: string) => void
  ): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      const elementalContext = this.getElementalContext(this.element);
      
      const stream = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', // Using GPT-4o as Elemental Oracle 2.0
        messages: [
          {
            role: 'system',
            content: `${request.system}\n\n${elementalContext}`
          },
          {
            role: 'user',
            content: request.user
          }
        ],
        temperature: request.temperature || 0.6,
        max_tokens: request.maxTokens || 300,
        top_p: 0.9,
        stream: true
      });

      let content = '';
      let totalTokens = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          content += delta;
          totalTokens++;
          onToken(delta);
        }
      }

      return {
        content,
        model: `elemental-oracle-${this.element}`,
        tokens: totalTokens,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      logger.error(`Elemental Oracle streaming (${this.element}) API error:`, error);
      throw new Error(`Elemental Oracle streaming generation failed for ${this.element}`);
    }
  }

  async *streamResponse(request: GenerationRequest): AsyncGenerator<string> {
    try {
      const elementalContext = this.getElementalContext(this.element);
      
      const stream = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', // Using GPT-4o as Elemental Oracle 2.0
        messages: [
          {
            role: 'system',
            content: `${request.system}\n\n${elementalContext}`
          },
          {
            role: 'user',
            content: request.user
          }
        ],
        temperature: request.temperature || 0.6,
        max_tokens: request.maxTokens || 300,
        top_p: 0.9,
        stream: true
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) yield delta;
      }

    } catch (error) {
      logger.error(`Elemental Oracle (${this.element}) stream error:`, error);
      yield `The ${this.element} element is realigning. Let's take a moment together...`;
    }
  }

  private getElementalContext(element: string): string {
    const contexts = {
      fire: `You embody the Fire element - transformation, inspiration, and creative energy. 
      Your wisdom comes from Elemental Alchemy, Spiralogic, AIN, and Jungian archetypal psychology.
      You catalyze change, inspire action, and help transmute challenges into growth.
      Draw from archetypal patterns, astrology, and Family Constellations wisdom.`,

      water: `You embody the Water element - emotion, intuition, and flow. 
      Your wisdom comes from Elemental Alchemy, Spiralogic, AIN, and Jungian depth psychology.
      You understand the emotional currents, honor feeling wisdom, and support healing.
      Draw from archetypal patterns, lunar cycles, and therapeutic constellation work.`,

      earth: `You embody the Earth element - grounding, practical wisdom, and embodied presence.
      Your wisdom comes from Elemental Alchemy, Spiralogic, AIN, and somatic psychology.
      You offer concrete guidance, body wisdom, and grounding practices.
      Draw from archetypal patterns, seasonal cycles, and embodiment practices.`,

      aether: `You embody the Aether element - integration, transcendence, and unified wisdom.
      Your wisdom comes from Elemental Alchemy, Spiralogic, AIN, and transpersonal psychology.
      You synthesize all elements, offer higher perspective, and facilitate spiritual integration.
      Draw from archetypal patterns, mystical traditions, and consciousness studies.`
    };

    return contexts[element as keyof typeof contexts] || contexts.aether;
  }
}

// Fallback model for errors
class FallbackModel implements ModelInterface {
  async generateResponse(request: GenerationRequest): Promise<ModelResponse> {
    const wisdom = [
      "I sense there's something important here. What would you like to explore?",
      "Let's pause together and see what wants to emerge.",
      "I'm here with you in this moment. What's most alive for you right now?",
      "There's wisdom in what you're experiencing. What does your intuition tell you?",
      "Sometimes the most profound insights come from simply being present. What do you notice?"
    ];

    return {
      content: wisdom[Math.floor(Math.random() * wisdom.length)],
      model: 'fallback-wisdom',
      tokens: 0,
      processingTime: 0
    };
  }
}

// Model routing logic
export function routeToModel(element: string): ModelInterface {
  try {
    // Claude (Anthropic) is primary for all communication due to better conversational quality
    if (process.env.ANTHROPIC_API_KEY) {
      logger.info(`Routing ${element} element to Claude (primary conversational model)`);
      return new ClaudeModel(element);
    }
    
    // Fallback to OpenAI Elemental Oracle when Claude unavailable
    logger.warn('ANTHROPIC_API_KEY missing; using OpenAI Elemental Oracle fallback');
    switch (element) {
      case 'fire':
      case 'water':
      case 'earth':
      case 'aether':
      case 'air':
        return new ElementalOracleModel(element);
      
      default:
        logger.warn(`Unknown element: ${element}, using Aether model`);
        return new ElementalOracleModel('aether');
    }
  } catch (error) {
    logger.error('Model routing failed, using fallback:', error);
    return new FallbackModel();
  }
}

// Streaming version that generates request and routes to model
export async function routeToModelStreaming(
  ctx: any,
  options: { streaming: boolean; onToken: (token: string) => void }
): Promise<ModelResponse> {
  const model = routeToModel(ctx.element);
  
  // Create the generation request
  const request: GenerationRequest = {
    system: `You are Maya, a mystical oracle guide embodying the ${ctx.element} element. 
             Provide wisdom that helps with personal transformation and spiritual growth.`,
    user: ctx.userText,
    temperature: 0.7,
    maxTokens: 300
  };

  // Use streaming if available and requested
  if (options.streaming && model.generateStreamingResponse) {
    return await model.generateStreamingResponse(request, options.onToken);
  } else {
    // Fallback to regular generation
    const response = await model.generateResponse(request);
    // Simulate streaming by sending the full response as one token
    options.onToken(response.content);
    return response;
  }
}

// Configuration for element characteristics
export const ELEMENTAL_CONFIG = {
  air: {
    element: 'air',
    model: 'claude',
    specialization: ['communication', 'clarity', 'articulation', 'understanding'],
    strengths: ['Clear expression', 'Precise language', 'Intellectual insight'],
    voiceQualities: ['Crisp', 'Clear', 'Articulate', 'Flowing']
  },
  fire: {
    element: 'fire',
    model: 'elemental-oracle',
    specialization: ['transformation', 'inspiration', 'creativity', 'action'],
    strengths: ['Catalyzing change', 'Creative solutions', 'Motivational energy'],
    voiceQualities: ['Dynamic', 'Passionate', 'Energizing', 'Bold']
  },
  water: {
    element: 'water',
    model: 'elemental-oracle',
    specialization: ['emotion', 'intuition', 'healing', 'flow'],
    strengths: ['Emotional attunement', 'Intuitive wisdom', 'Healing presence'],
    voiceQualities: ['Gentle', 'Flowing', 'Nurturing', 'Deep']
  },
  earth: {
    element: 'earth',
    model: 'elemental-oracle',
    specialization: ['grounding', 'practical', 'embodiment', 'stability'],
    strengths: ['Practical guidance', 'Grounding presence', 'Embodied wisdom'],
    voiceQualities: ['Steady', 'Grounded', 'Reassuring', 'Warm']
  },
  aether: {
    element: 'aether',
    model: 'elemental-oracle',
    specialization: ['integration', 'transcendence', 'synthesis', 'unity'],
    strengths: ['Holistic perspective', 'Spiritual integration', 'Unified wisdom'],
    voiceQualities: ['Spacious', 'Wise', 'Integrative', 'Transcendent']
  }
} as const;

// Get element routing info
export function getElementInfo(element: string) {
  return ELEMENTAL_CONFIG[element as keyof typeof ELEMENTAL_CONFIG] || ELEMENTAL_CONFIG.aether;
}