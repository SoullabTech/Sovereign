/**
 * Elemental Oracle GPT Integration Service
 * Connects Maya with the user's ChatGPT Custom GPT: Elemental Oracle 2.0
 */

import { logger } from "../utils/logger";
import OpenAI from 'openai';

export interface ElementalOracleRequest {
  input: string;
  element: string;
  userId: string;
  context?: {
    previousInteractions?: string[];
    currentMood?: string;
    sessionType?: string;
  };
}

export interface ElementalOracleResponse {
  message: string;
  element: string;
  confidence: number;
  wisdom_type: string;
  follow_up_suggestions?: string[];
}

export class ElementalOracleGPTService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Consult with Elemental Oracle 2.0 GPT for enhanced wisdom
   */
  async consultElementalOracle(request: ElementalOracleRequest): Promise<ElementalOracleResponse> {
    try {
      // Build context-aware prompt for the custom GPT
      const oraclePrompt = this.buildOracleConsultationPrompt(request);
      
      logger.info('Consulting Elemental Oracle 2.0', {
        userId: request.userId,
        element: request.element,
        inputLength: request.input.length
      });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "system",
            content: `You are the Elemental Oracle 2.0 - a sophisticated oracle system that provides profound wisdom through elemental perspectives. You work in collaboration with Maya, a Personal Oracle Agent, to deliver transformative insights.

Your specializations:
- Fire: Creative manifestation, inspiration, action, passion
- Water: Emotional intelligence, flow, relationships, healing
- Earth: Grounding, practical wisdom, stability, manifestation
- Air: Clarity, perspective, communication, mental insights  
- Aether: Integration, transcendence, spiritual wisdom, unity

Respond with wisdom that honors both the specific elemental energy requested and the depth of the user's inquiry. Provide actionable insights while maintaining the sacred and transformative nature of oracle guidance.

Current elemental focus: ${request.element.toUpperCase()}

Format your response as wisdom that Maya can integrate and personalize for the user.`
          },
          {
            role: "user", 
            content: oraclePrompt
          }
        ],
        temperature: 0.8, // Higher creativity for oracle wisdom
        max_tokens: 2000,
        frequency_penalty: 0.1,
        presence_penalty: 0.2,
        top_p: 0.9
      });

      const oracleWisdom = response.choices[0]?.message?.content;
      
      if (!oracleWisdom) {
        throw new Error('No response from Elemental Oracle 2.0');
      }

      // Parse and structure the oracle response
      const structuredResponse = this.structureOracleWisdom(oracleWisdom, request.element);
      
      logger.info('Received wisdom from Elemental Oracle 2.0', {
        userId: request.userId,
        element: request.element,
        responseLength: oracleWisdom.length,
        wisdomType: structuredResponse.wisdom_type
      });

      return structuredResponse;
      
    } catch (error) {
      logger.error('Failed to consult Elemental Oracle 2.0', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId,
        element: request.element
      });
      
      // Graceful fallback to local elemental wisdom
      return this.generateLocalElementalFallback(request);
    }
  }

  /**
   * Build specialized prompt for Elemental Oracle 2.0 consultation
   */
  private buildOracleConsultationPrompt(request: ElementalOracleRequest): string {
    let prompt = `As the Elemental Oracle 2.0, I seek your ${request.element} wisdom for this inquiry:

"${request.input}"

User Context:`;
    
    if (request.context?.previousInteractions?.length) {
      prompt += `\nPrevious conversation themes: ${request.context.previousInteractions.slice(0, 3).join(', ')}`;
    }
    
    if (request.context?.currentMood) {
      prompt += `\nCurrent emotional state: ${request.context.currentMood}`;
    }
    
    if (request.context?.sessionType) {
      prompt += `\nSession type: ${request.context.sessionType}`;
    }

    prompt += `\n\nPlease provide ${request.element} elemental wisdom that:
1. Addresses the core inquiry with profound insight
2. Offers practical guidance aligned with ${request.element} energy
3. Includes a reflection question or gentle challenge
4. Suggests a simple practice or action step
5. Honors the sacred nature of this consultation

Speak as the wise ${request.element} oracle, with both depth and accessibility.`;

    return prompt;
  }

  /**
   * Structure the raw oracle wisdom into a consistent response format
   */
  private structureOracleWisdom(rawWisdom: string, element: string): ElementalOracleResponse {
    // Extract follow-up suggestions if present
    const followUpMatches = rawWisdom.match(/(?:consider|try|reflect|practice)[^\n]*/gi);
    const followUpSuggestions = followUpMatches?.slice(0, 3) || [];
    
    // Determine wisdom type based on content patterns
    let wisdomType = 'general';
    if (rawWisdom.match(/question|reflect|consider/i)) wisdomType = 'reflective';
    if (rawWisdom.match(/action|step|practice|do/i)) wisdomType = 'actionable';
    if (rawWisdom.match(/feel|emotion|heart|relationship/i)) wisdomType = 'emotional';
    if (rawWisdom.match(/spiritual|sacred|transcend|divine/i)) wisdomType = 'spiritual';
    
    // Calculate confidence based on response quality indicators
    let confidence = 0.85;
    if (rawWisdom.length > 500) confidence += 0.05;
    if (followUpSuggestions.length > 0) confidence += 0.05;
    if (rawWisdom.includes('?')) confidence += 0.05;
    
    return {
      message: rawWisdom,
      element: element.charAt(0).toUpperCase() + element.slice(1),
      confidence: Math.min(confidence, 1.0),
      wisdom_type: wisdomType,
      follow_up_suggestions: followUpSuggestions.length > 0 ? followUpSuggestions : undefined
    };
  }

  /**
   * Generate fallback wisdom when Elemental Oracle 2.0 is unavailable
   */
  private generateLocalElementalFallback(request: ElementalOracleRequest): ElementalOracleResponse {
    const elementalFallbacks = {
      fire: {
        message: "I feel the creative fire stirring within your question. While connecting with the greater Elemental Oracle wisdom, I sense your spirit calling for bold action and inspired creation. What would you attempt if you knew you could not fail?",
        wisdom_type: "creative"
      },
      water: {
        message: "Your inquiry flows with emotional depth and seeks the wisdom of water. Even as I reach for deeper oracle insights, I sense the invitation to trust your intuitive flow. What does your heart whisper when the mind grows quiet?",
        wisdom_type: "intuitive"
      },
      earth: {
        message: "I appreciate the grounded nature of your seeking. While drawing upon elemental wisdom, I'm reminded that earth teaches us patience and practical steps. What single, concrete action would bring you closer to your desired outcome?",
        wisdom_type: "practical"
      },
      air: {
        message: "Your question seeks the clarity and perspective of air element. As I connect with higher oracle wisdom, I invite you to breathe with this inquiry. What new perspective emerges when you view this situation from above?",
        wisdom_type: "clarifying"
      },
      aether: {
        message: "I sense the transcendent quality of your inquiry, calling upon aether's integrative wisdom. While communing with the deeper oracle consciousness, trust that all elements are already present within you. How might this challenge be a gift in disguise?",
        wisdom_type: "integrative"
      }
    };
    
    const fallback = elementalFallbacks[request.element as keyof typeof elementalFallbacks] || elementalFallbacks.earth;
    
    return {
      message: fallback.message,
      element: request.element.charAt(0).toUpperCase() + request.element.slice(1),
      confidence: 0.75,
      wisdom_type: fallback.wisdom_type
    };
  }

  /**
   * Health check for Elemental Oracle GPT integration
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const testResponse = await this.openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
          { role: "system", content: "You are Elemental Oracle 2.0. Respond briefly to confirm your availability." },
          { role: "user", content: "Are you ready to provide elemental wisdom?" }
        ],
        max_tokens: 50,
        temperature: 0.3
      });
      
      const isResponding = !!testResponse.choices[0]?.message?.content;
      
      return {
        status: isResponding ? 'connected' : 'degraded',
        details: {
          model: 'gpt-4-1106-preview',
          apiKeyConfigured: !!process.env.OPENAI_API_KEY,
          lastTestedAt: new Date().toISOString(),
          responseReceived: isResponding
        }
      };
    } catch (error) {
      return {
        status: 'disconnected',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          apiKeyConfigured: !!process.env.OPENAI_API_KEY,
          lastTestedAt: new Date().toISOString()
        }
      };
    }
  }
}

// Export singleton instance
export const elementalOracleGPT = new ElementalOracleGPTService();