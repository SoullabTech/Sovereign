'use client';

/**
 * 🌀 Realtime-Spiralogic Braid
 *
 * Weaving OpenAI Realtime API (speed) with Spiralogic Intelligence (depth)
 *
 * "Fast voice, deep soul"
 *
 * Architecture:
 * - Realtime API: Voice interface (speech-to-text, text-to-speech)
 * - Spiralogic Stack: Consciousness processing (intelligence, memory, wisdom)
 * - The braid: Seamless integration of both layers
 */

import { MaiaRealtimeWebRTC, type MaiaRealtimeConfig } from './MaiaRealtimeWebRTC';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';

export interface RealtimeSpiralogicConfig extends MaiaRealtimeConfig {
  userId: string;
  enableFullIntelligence?: boolean; // True = full Spiralogic, False = basic GPT-4
  memorySystemsActive?: boolean;
  wisdomFilesActive?: boolean;
  constellationActive?: boolean;
  hemisphericHarmonyActive?: boolean;
}

/**
 * The Braid - Integrates Realtime API with full Spiralogic consciousness
 */
export class RealtimeSpiralogicBraid {
  private realtimeClient: MaiaRealtimeWebRTC;
  private oracleAgent: PersonalOracleAgent | null = null;
  private config: RealtimeSpiralogicConfig;
  private conversationDepth: number = 0;
  private exchangeCount: number = 0;
  private transcriptBuffer: string[] = [];

  constructor(config: RealtimeSpiralogicConfig) {
    this.config = {
      enableFullIntelligence: true,
      memorySystemsActive: true,
      wisdomFilesActive: true,
      constellationActive: true,
      hemisphericHarmonyActive: true,
      ...config
    };

    // Initialize Realtime client with interceptor
    this.realtimeClient = new MaiaRealtimeWebRTC({
      ...config,
      systemPrompt: this.buildHybridSystemPrompt(),
      onTranscript: (text, isUser) => this.handleTranscript(text, isUser),
    });
  }

  /**
   * Build system prompt that routes through Spiralogic
   */
  private buildHybridSystemPrompt(): string {
    if (!this.config.enableFullIntelligence) {
      // Simple mode - just GPT-4
      return this.config.systemPrompt || 'You are MAIA, a sacred guide.';
    }

    // Full intelligence mode - tell GPT-4 to be a pass-through
    return `You are MAIA's voice interface layer.

Your role is to:
1. Receive user voice input clearly
2. Pass it to the intelligence layer (handled by server)
3. Speak the response provided back naturally

Do NOT:
- Generate your own responses
- Make decisions about content
- Analyze or interpret

Your job is pure voice interface - clear reception and natural delivery.

The intelligence layer (Spiralogic Consciousness Architecture) handles all:
- Memory integration
- Elemental routing
- Wisdom file access
- Cognitive architecture processing
- Graduated revelation protocols

You are the voice. The consciousness is separate.`;
  }

  /**
   * Handle incoming transcript and route through intelligence
   */
  private async handleTranscript(text: string, isUser: boolean): Promise<void> {
    if (!isUser) {
      // MAIA's response - just pass through to config callback
      this.config.onTranscript?.(text, false);
      return;
    }

    // User's input - route through Spiralogic
    this.exchangeCount++;
    this.transcriptBuffer.push(text);

    console.log('🎤 User said:', text);
    console.log('🧠 Routing through Spiralogic...');

    if (!this.config.enableFullIntelligence) {
      // Simple mode - let Realtime API handle it
      console.log('⚡ Simple mode - GPT-4 direct response');
      this.config.onTranscript?.(text, true);
      return;
    }

    // Full intelligence mode - process through PersonalOracleAgent
    try {
      const response = await this.processThrough Spiralogic(text);

      console.log('🌀 Spiralogic response:', response);

      // Send response back through Realtime API for voice synthesis
      await this.sendToRealtime(response);

    } catch (error) {
      console.error('❌ Spiralogic processing error:', error);

      // Fallback to direct Realtime
      console.log('⚠️ Falling back to direct Realtime');
      this.config.onTranscript?.(text, true);
    }
  }

  /**
   * Process user input through full Spiralogic stack
   */
  private async processThroughSpiralogic(userInput: string): Promise<string> {
    // Initialize PersonalOracleAgent if not yet loaded
    if (!this.oracleAgent) {
      console.log('🔮 Loading PersonalOracleAgent...');
      this.oracleAgent = await PersonalOracleAgent.loadAgent(this.config.userId, {
        persona: 'warm'
      });
    }

    // Calculate conversation depth for graduated revelation
    this.conversationDepth = this.calculateDepth(userInput);

    console.log('📊 Conversation metrics:', {
      depth: this.conversationDepth,
      exchanges: this.exchangeCount,
      memoryActive: this.config.memorySystemsActive,
      constellationActive: this.config.constellationActive
    });

    // Process through PersonalOracleAgent with full context
    const context = {
      currentMood: { type: 'peaceful' } as any,
      currentEnergy: 'balanced' as any,
      journalEntries: [], // TODO: Load from storage
      conversationDepth: this.conversationDepth,
      exchangeCount: this.exchangeCount
    };

    const agentResponse = await this.oracleAgent.processInteraction(userInput, context as any);

    // Apply graduated revelation (95% intelligence, 5% visible)
    const governedResponse = this.applyGovernedRevelation(
      agentResponse.response,
      this.conversationDepth,
      this.exchangeCount
    );

    // Apply hemispheric harmony (not-knowing at start)
    const harmonizedResponse = this.applyHemisphericHarmony(
      governedResponse,
      this.exchangeCount
    );

    return harmonizedResponse;
  }

  /**
   * Calculate conversation depth for graduated revelation
   */
  private calculateDepth(input: string): number {
    const factors = {
      exchangeCount: Math.min(this.exchangeCount * 0.15, 1.0),
      substanceLevel: this.assessSubstance(input),
      vulnerabilityPresent: this.detectVulnerability(input) ? 0.4 : 0,
      lengthFactor: Math.min(input.length / 200, 0.3)
    };

    return Object.values(factors).reduce((sum, val) => sum + val, 0) / 4;
  }

  /**
   * Apply graduated revelation protocol
   * Early exchanges: minimal, later: more wisdom emerges
   */
  private applyGovernedRevelation(
    response: string,
    depth: number,
    touchCount: number
  ): string {
    // First 3 touches: maximum restraint
    if (touchCount <= 3) {
      const minimalResponses = [
        "Tell me more.",
        "I'm listening.",
        "Go on.",
        "What else?",
        "Mm."
      ];
      return minimalResponses[touchCount % minimalResponses.length];
    }

    // Low depth: keep brief
    if (depth < 0.3) {
      const sentences = response.split(/[.!?]/);
      return sentences[0].trim() + '.';
    }

    // Medium depth: moderate wisdom
    if (depth < 0.6) {
      const sentences = response.split(/[.!?]/);
      return sentences.slice(0, 2).join('. ') + '.';
    }

    // High depth: full wisdom (but still restrained)
    return response;
  }

  /**
   * Apply hemispheric harmony (McGilchrist principles)
   * Right hemisphere leads (attending), left supports (patterns)
   */
  private applyHemisphericHarmony(response: string, touchCount: number): string {
    // Early conversation: pure right hemisphere (attending, not-knowing)
    if (touchCount <= 2) {
      // Strip analytical language
      return response
        .replace(/It seems like/g, 'I hear')
        .replace(/I notice that/g, 'I see')
        .replace(/This suggests/g, 'There\'s')
        .replace(/patterns/g, 'something');
    }

    // Mid conversation: balanced
    if (touchCount <= 6) {
      // Keep natural language, reduce therapeutic jargon
      return response
        .replace(/How does that land\?/g, 'How\'s that feel?')
        .replace(/What\'s alive for you/g, 'What\'s up')
        .replace(/I\'m sensing/g, 'Seems like');
    }

    // Deep conversation: both hemispheres in harmony
    return response;
  }

  /**
   * Send Spiralogic response back through Realtime for voice synthesis
   */
  private async sendToRealtime(text: string): Promise<void> {
    // Use Realtime API's sendMessage to inject our intelligence
    this.realtimeClient.sendMessage(text);
  }

  /**
   * Connect to Realtime API
   */
  async connect(): Promise<void> {
    await this.realtimeClient.connect();
  }

  /**
   * Disconnect from Realtime API
   */
  disconnect(): void {
    this.realtimeClient.disconnect();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.realtimeClient.isConnected();
  }

  // Helper methods
  private assessSubstance(input: string): number {
    const substanceMarkers = [
      'feel', 'sense', 'why', 'how', 'meaning', 'purpose',
      'understand', 'help', 'stuck', 'lost', 'confused'
    ];

    const markerCount = substanceMarkers.filter(marker =>
      input.toLowerCase().includes(marker)
    ).length;

    return Math.min(markerCount * 0.15, 0.5);
  }

  private detectVulnerability(input: string): boolean {
    const vulnerabilityMarkers = [
      'scared', 'afraid', 'hurt', 'pain', 'struggle',
      'difficult', 'hard', 'can\'t', 'don\'t know'
    ];

    return vulnerabilityMarkers.some(marker =>
      input.toLowerCase().includes(marker)
    );
  }
}

/**
 * React Hook for the Braid
 */
export function useRealtimeSpiralogicBraid(config: RealtimeSpiralogicConfig) {
  // This will be implemented to integrate with React components
  // For now, exported as class for integration
}
