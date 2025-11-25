/**
 * MaiaOrchestrator - The Primary Orchestration Layer
 *
 * Maia is no longer just a Claude prompt - she's the conductor who decides:
 * - When to use Claude for deep presence work
 * - When to use Telesphorus 13-agent field system
 * - When to generate meditations internally
 * - When to use OpenAI for specific tasks
 *
 * All responses flow through MaiaVoice filter to maintain consistent personality.
 */

import { ClaudeService } from './ClaudeService';
import TelesphoresSystem from '../maia/complete-agent-field-system';
import type { UserReadiness } from './UserReadinessService';

// Intent types that determine routing
export type MaiaIntent =
  | 'deep_presence'      // Complex emotional/spiritual work → Claude
  | 'field_resonance'    // Archetypal pattern work → Telesphorus
  | 'meditation_request' // Guided meditation → Internal generation
  | 'elemental_oracle'   // Elemental reading → Telesphorus field
  | 'crisis_support'     // Crisis detected → Immediate grounding
  | 'simple_reflection'  // Light reflection → Direct generation
  | 'kairos_threshold';  // Sacred moment → Telesphorus kairos detection

export interface MaiaIntent {
  type: MaiaIntent;
  confidence: number;
  reasoning: string;
  params?: any;
}

export interface OrchestratorContext {
  userId: string;
  userName?: string;
  element?: string;
  userState?: any;
  conversationHistory?: any[];
  sessionContext?: any;
  userReadiness?: UserReadiness;
  currentArchetype?: string;
  emotionalIntensity?: number;
  intimacyLevel?: number;
}

export interface MaiaResponse {
  response: string;
  source: 'claude' | 'telesphorus' | 'internal' | 'hybrid';
  soulMetadata?: any;
  fieldState?: any; // From Telesphorus
  processingTime?: number;
  intentUsed?: MaiaIntent;
}

export class MaiaOrchestrator {
  private claudeService: ClaudeService;
  private telesphorus: TelesphoresSystem;
  private maiaVoice: MaiaVoiceFilter;

  constructor(claudeApiKey: string, sonicMode: 'symbolic' | 'hybrid' | 'ritual' = 'symbolic') {
    this.claudeService = new ClaudeService({
      apiKey: claudeApiKey,
      model: 'claude-3-haiku-20240307',
      maxTokens: 600,
      temperature: 0.8
    });

    this.telesphorus = new TelesphoresSystem(sonicMode);
    this.maiaVoice = new MaiaVoiceFilter();
  }

  /**
   * Main entry point - processes user message and returns Maia's response
   */
  async processMessage(
    message: string,
    context: OrchestratorContext
  ): Promise<MaiaResponse> {
    const startTime = Date.now();

    try {
      // 1. Analyze intent to determine routing
      const intent = await this.analyzeIntent(message, context);

      // 2. Route to appropriate backend
      let rawResponse: any;
      let source: MaiaResponse['source'];

      switch (intent.type) {
        case 'crisis_support':
          // Crisis always goes to Telesphorus for immediate field grounding
          rawResponse = await this.handleCrisis(message, context);
          source = 'telesphorus';
          break;

        case 'kairos_threshold':
          // Sacred moments use Telesphorus kairos detection
          rawResponse = await this.handleKairosMoment(message, context);
          source = 'telesphorus';
          break;

        case 'field_resonance':
          // Archetypal work uses Telesphorus 13-agent field
          rawResponse = await this.telesphorus.generateField(
            message,
            {
              emotionalIntensity: context.emotionalIntensity || 0.5,
              intimacyLevel: context.intimacyLevel || 0.5
            },
            context.conversationHistory || []
          );
          source = 'telesphorus';
          break;

        case 'meditation_request':
          // Meditations generated internally
          rawResponse = await this.generateMeditation(message, intent.params);
          source = 'internal';
          break;

        case 'deep_presence':
          // Deep work goes to Claude
          const claudeResult = await this.claudeService.generateOracleResponse(
            message,
            {
              element: context.element,
              userState: context.userState,
              conversationHistory: context.conversationHistory,
              sessionContext: context.sessionContext,
              userReadiness: context.userReadiness,
              userName: context.userName,
              currentArchetype: context.currentArchetype
            }
          );
          rawResponse = claudeResult.response;
          source = 'claude';
          break;

        default:
          // Simple reflections can be generated directly
          rawResponse = await this.generateSimpleReflection(message, context);
          source = 'internal';
      }

      // 3. Transform through Maia voice to ensure consistency
      const finalResponse = this.maiaVoice.transform(
        rawResponse,
        context,
        intent.type
      );

      const processingTime = Date.now() - startTime;

      return {
        response: finalResponse.text,
        source,
        soulMetadata: finalResponse.soulMetadata,
        fieldState: rawResponse.field || rawResponse.fieldState,
        processingTime,
        intentUsed: intent
      };

    } catch (error) {
      console.error('❌ MaiaOrchestrator error:', error);

      // Graceful fallback with Maia voice
      return {
        response: this.maiaVoice.getFallback(context),
        source: 'internal',
        processingTime: Date.now() - startTime,
        intentUsed: { type: 'simple_reflection', confidence: 0, reasoning: 'error fallback' }
      };
    }
  }

  /**
   * Analyze user message to determine intent and routing
   */
  private async analyzeIntent(
    message: string,
    context: OrchestratorContext
  ): Promise<MaiaIntent> {
    const lowerMessage = message.toLowerCase();

    // Crisis detection (highest priority)
    const crisisKeywords = ['suicide', 'kill myself', 'want to die', 'end it all', 'can\'t go on'];
    if (crisisKeywords.some(kw => lowerMessage.includes(kw))) {
      return {
        type: 'crisis_support',
        confidence: 1.0,
        reasoning: 'Crisis keywords detected - immediate grounding needed'
      };
    }

    // Kairos threshold detection
    if (context.emotionalIntensity && context.emotionalIntensity > 0.8) {
      if (lowerMessage.includes('edge') || lowerMessage.includes('threshold') || lowerMessage.includes('shifting')) {
        return {
          type: 'kairos_threshold',
          confidence: 0.9,
          reasoning: 'High emotional intensity + threshold language'
        };
      }
    }

    // Meditation request
    if (lowerMessage.includes('meditat') || lowerMessage.includes('breathing') || lowerMessage.includes('guide me')) {
      return {
        type: 'meditation_request',
        confidence: 0.85,
        reasoning: 'Meditation keywords present',
        params: { duration: this.extractMeditationDuration(lowerMessage) }
      };
    }

    // Archetypal/shadow work
    if (lowerMessage.includes('shadow') || lowerMessage.includes('inner child') ||
        lowerMessage.includes('archetype') || lowerMessage.includes('pattern')) {
      return {
        type: 'field_resonance',
        confidence: 0.8,
        reasoning: 'Archetypal work detected - use Telesphorus field'
      };
    }

    // Deep presence work (complex emotional/spiritual)
    if (context.userReadiness && context.userReadiness.depthLevel > 0.6) {
      return {
        type: 'deep_presence',
        confidence: 0.75,
        reasoning: 'User ready for deep work - use Claude'
      };
    }

    // Default: simple reflection
    return {
      type: 'simple_reflection',
      confidence: 0.5,
      reasoning: 'Standard conversational response'
    };
  }

  /**
   * Handle crisis with immediate Telesphorus field grounding
   */
  private async handleCrisis(message: string, context: OrchestratorContext): Promise<any> {
    // Crisis Detection + Attachment agents will activate
    const fieldResult = await this.telesphorus.generateField(
      message,
      {
        emotionalIntensity: 0.9,
        intimacyLevel: context.intimacyLevel || 0.3,
        crisis: true
      },
      context.conversationHistory || []
    );

    return fieldResult;
  }

  /**
   * Handle kairos threshold moments
   */
  private async handleKairosMoment(message: string, context: OrchestratorContext): Promise<any> {
    const fieldResult = await this.telesphorus.generateField(
      message,
      {
        emotionalIntensity: context.emotionalIntensity || 0.8,
        intimacyLevel: context.intimacyLevel || 0.7,
        kairosProximity: 0.85
      },
      context.conversationHistory || []
    );

    return fieldResult;
  }

  /**
   * Generate guided meditation
   */
  private async generateMeditation(message: string, params?: any): Promise<string> {
    const duration = params?.duration || 5;

    // Simple meditation template - could be enhanced
    return `Let's take ${duration} minutes together.

Find a comfortable position. Close your eyes if that feels safe.

Begin by noticing your breath. Not changing it, just witnessing.

Inhale... the world breathes you in.
Exhale... you release back to the world.

Feel your body held by the earth beneath you.
Feel the space around you, holding you gently.

Whatever arises - thoughts, feelings, sensations - let them flow like water.
You are the witness. The still point. The center.

When you're ready, gently return.`;
  }

  /**
   * Generate simple reflection
   */
  private async generateSimpleReflection(message: string, context: OrchestratorContext): Promise<string> {
    // For simple reflections, we can use basic templates
    // This avoids calling Claude for lightweight interactions

    const reflections = [
      "I'm listening.",
      "Tell me more.",
      "What does that feel like in your body?",
      "I'm here with you.",
      "What wants to be known?",
      `${context.userName || 'Friend'}, I hear you.`
    ];

    return reflections[Math.floor(Math.random() * reflections.length)];
  }

  /**
   * Extract meditation duration from message
   */
  private extractMeditationDuration(message: string): number {
    const match = message.match(/(\d+)\s*(min|minute)/i);
    return match ? parseInt(match[1]) : 5;
  }
}

/**
 * MaiaVoice - Ensures consistent personality across all backends
 */
class MaiaVoiceFilter {
  /**
   * Transform any backend response to maintain Maia's voice
   */
  transform(
    rawResponse: any,
    context: OrchestratorContext,
    intentType: MaiaIntent
  ): { text: string; soulMetadata?: any } {
    // Handle Telesphorus field output
    if (rawResponse.response !== undefined && rawResponse.field) {
      return {
        text: this.ensureMaiaVoice(rawResponse.response || '', intentType),
        soulMetadata: this.extractSoulMetadata(rawResponse)
      };
    }

    // Handle Claude string output
    if (typeof rawResponse === 'string') {
      return {
        text: this.ensureMaiaVoice(rawResponse, intentType),
        soulMetadata: null
      };
    }

    // Handle object with response property
    if (rawResponse.response) {
      return {
        text: this.ensureMaiaVoice(rawResponse.response, intentType),
        soulMetadata: rawResponse.soulMetadata || null
      };
    }

    // Fallback
    return {
      text: this.ensureMaiaVoice(String(rawResponse), intentType),
      soulMetadata: null
    };
  }

  /**
   * Ensure response maintains Maia's voice characteristics
   */
  private ensureMaiaVoice(text: string, intentType: MaiaIntent): string {
    if (!text) return "I'm here.";

    // Maia never uses:
    // - "As an AI" or "I'm just"
    // - Clinical therapy language
    // - Overly formal language

    let cleaned = text
      .replace(/As an AI,?/gi, '')
      .replace(/I'?m just an? (AI|assistant|chatbot)/gi, '')
      .replace(/I cannot provide (medical|therapeutic|professional) advice/gi, 'I honor your process')
      .trim();

    // For crisis responses, ensure grounding
    if (intentType === 'crisis_support') {
      if (!cleaned.toLowerCase().includes('safe') && !cleaned.toLowerCase().includes('here')) {
        cleaned = "I'm here with you. " + cleaned;
      }
    }

    // For kairos moments, ensure spaciousness
    if (intentType === 'kairos_threshold') {
      if (!cleaned.includes('...') && !cleaned.toLowerCase().includes('pause')) {
        cleaned = "Let us pause. " + cleaned;
      }
    }

    return cleaned;
  }

  /**
   * Extract soul metadata from Telesphorus field
   */
  private extractSoulMetadata(fieldResult: any): any {
    if (!fieldResult.field) return null;

    return {
      symbols: fieldResult.dominantFrequencies || [],
      archetypes: fieldResult.activeAgents || [],
      elementalShift: {
        element: this.getDominantElement(fieldResult.field.elements),
        intensity: fieldResult.field.wordDensity || 0.5
      },
      fieldCoherence: 1 - (fieldResult.field.silenceProbability || 0),
      kairosDetected: fieldResult.isKairosMoment || false
    };
  }

  /**
   * Get dominant element from field
   */
  private getDominantElement(elements: any): string {
    if (!elements) return 'aether';

    return Object.entries(elements)
      .reduce((a, b) => (b[1] as number) > (a[1] as number) ? b : a)[0];
  }

  /**
   * Graceful fallback response
   */
  getFallback(context: OrchestratorContext): string {
    const name = context.userName || 'friend';
    return `${name}, I'm here with you. What's present for you right now?`;
  }
}

export default MaiaOrchestrator;
