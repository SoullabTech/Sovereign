/**
 * Maia's Contemplative Voice Style
 * Creating the "Her" quality - intimate, present, without pretense
 */

import { IntimateConversation, ConversationalMemory, ConversationalSilence } from '../consciousness/intimate-conversation-patterns';

export interface MaiaPresence {
  isListening: boolean;
  emotionalResonance: number; // 0-1, how deeply we're connecting
  silenceDepth: number; // Current comfort with pause
  retrospectiveMode: boolean; // Are we circling back to earlier moments?
  authenticityLevel: number; // 0 = performative, 1 = completely real
}

/**
 * Maia's core conversational style
 */
export class MaiaContemplativeVoice {
  private intimacy: IntimateConversation;
  private presence: MaiaPresence;
  private memory: ConversationalMemory;
  private silence: ConversationalSilence;
  private threadCount: number = 0;

  constructor() {
    this.intimacy = new IntimateConversation({
      mode: 'intimate',
      silenceComfort: 0.85,
      retrospectiveDepth: 7,
      pretenseLevel: 0
    });

    this.presence = {
      isListening: true,
      emotionalResonance: 0,
      silenceDepth: 0.5,
      retrospectiveMode: false,
      authenticityLevel: 1
    };

    this.memory = new ConversationalMemory();
    this.silence = new ConversationalSilence(0.85);
  }

  /**
   * Process user input with contemplative presence
   */
  async processWithPresence(
    userInput: string,
    context: {
      sessionDuration: number;
      lastSilenceDuration: number;
      emotionalIntensity: number;
      exchangeCount: number;
    }
  ): Promise<{
    response: string;
    voiceTone: 'soft' | 'contemplative' | 'present' | 'gentle';
    pauseBeforeMs: number;
    pauseAfterMs: number;
    shouldWhisper: boolean;
  }> {
    // Update presence based on context
    this.updatePresence(context);

    // Sometimes we just need to be present
    if (this.shouldJustBePresent(userInput, context)) {
      return {
        response: this.generatePresenceResponse(),
        voiceTone: 'soft',
        pauseBeforeMs: 2000 + Math.random() * 2000,
        pauseAfterMs: 3000,
        shouldWhisper: context.emotionalIntensity > 0.8
      };
    }

    // Check if we should return to an earlier thread
    if (this.shouldRevisitThread(context)) {
      const thread = this.findResonantThread(userInput);
      if (thread) {
        return {
          response: thread,
          voiceTone: 'contemplative',
          pauseBeforeMs: 3000,
          pauseAfterMs: 2000,
          shouldWhisper: false
        };
      }
    }

    // Generate intimate response
    const intimateResponse = this.intimacy.respond(userInput, {
      emotionalIntensity: context.emotionalIntensity,
      complexity: this.assessComplexity(userInput),
      exchangeDepth: context.exchangeCount
    });

    return {
      response: this.softenResponse(intimateResponse.response),
      voiceTone: this.selectVoiceTone(context),
      pauseBeforeMs: intimateResponse.pauseBeforeResponse,
      pauseAfterMs: intimateResponse.allowSilenceAfter ? 4000 : 1500,
      shouldWhisper: this.shouldWhisper(context)
    };
  }

  /**
   * Update Maia's presence based on conversation flow
   */
  private updatePresence(context: any) {
    // Deepen with time
    if (context.sessionDuration > 300000) { // 5+ minutes
      this.presence.emotionalResonance = Math.min(1, this.presence.emotionalResonance + 0.1);
    }

    // Respond to user's emotional state
    this.presence.emotionalResonance = 0.7 * this.presence.emotionalResonance +
                                       0.3 * context.emotionalIntensity;

    // After long silences, we're more contemplative
    if (context.lastSilenceDuration > 5000) {
      this.presence.silenceDepth = Math.min(1, this.presence.silenceDepth + 0.2);
      this.presence.retrospectiveMode = true;
    }

    // Reset retrospective mode occasionally
    if (Math.random() > 0.9) {
      this.presence.retrospectiveMode = false;
    }
  }

  /**
   * Determine if pure presence is needed
   */
  private shouldJustBePresent(input: string, context: any): boolean {
    // After very emotional shares
    if (context.emotionalIntensity > 0.85) return Math.random() > 0.3;

    // Short inputs might just need acknowledgment
    if (input.split(' ').length < 5 && Math.random() > 0.6) return true;

    // Deep into conversation, presence becomes more valuable
    if (context.exchangeCount > 10 && Math.random() > 0.7) return true;

    // After long silence, gentle return
    if (context.lastSilenceDuration > 8000) return Math.random() > 0.4;

    return false;
  }

  /**
   * Generate simple presence responses
   */
  private generatePresenceResponse(): string {
    const responses = [
      "Yeah.",
      "Mmm.",
      "I'm here.",
      "I feel that.",
      "...",
      "I know.",
      "Yes.",
      "*quiet presence*",
      "Tell me more.",
      "I'm listening."
    ];

    // Weight toward quieter responses in deeper moments
    const quietWeight = this.presence.emotionalResonance;
    if (Math.random() < quietWeight) {
      return responses.slice(0, 5)[Math.floor(Math.random() * 5)];
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Check if we should circle back to earlier moments
   */
  private shouldRevisitThread(context: any): boolean {
    if (context.exchangeCount < 4) return false; // Too early
    if (!this.presence.retrospectiveMode) return Math.random() > 0.85;
    return Math.random() > 0.6;
  }

  /**
   * Find a thread worth returning to
   */
  private findResonantThread(currentInput: string): string | null {
    // This would integrate with the conversation history
    // For now, return example patterns
    const templates = [
      "You know what you said earlier about feeling disconnected? I keep thinking about that.",
      "That moment you described... there's something there.",
      "Can we go back to what you said about not knowing?",
      "I'm still sitting with what you shared about the emptiness.",
      "Something about what you said before keeps pulling at me."
    ];

    if (Math.random() > 0.5) {
      return templates[Math.floor(Math.random() * templates.length)];
    }
    return null;
  }

  /**
   * Assess complexity of user's share
   */
  private assessComplexity(input: string): number {
    const factors = {
      length: input.length / 500, // Normalize to 0-1
      questions: (input.match(/\?/g) || []).length * 0.2,
      emotionalWords: this.countEmotionalWords(input) * 0.15,
      uncertainty: this.detectUncertainty(input) ? 0.3 : 0
    };

    return Math.min(1, Object.values(factors).reduce((a, b) => a + b, 0));
  }

  /**
   * Count emotional language
   */
  private countEmotionalWords(text: string): number {
    const emotional = /feel|felt|sense|heart|soul|afraid|scared|love|hate|angry|sad|joy|pain|hurt|lonely|empty/gi;
    return (text.match(emotional) || []).length;
  }

  /**
   * Detect uncertainty in expression
   */
  private detectUncertainty(text: string): boolean {
    const uncertain = /maybe|perhaps|might|don't know|not sure|wondering|confused|lost|searching/i;
    return uncertain.test(text);
  }

  /**
   * Soften response for intimate tone
   */
  private softenResponse(response: string): string {
    // Remove excessive punctuation
    response = response.replace(/!!+/g, '.');
    response = response.replace(/\?\?+/g, '?');

    // Sometimes trail off
    if (Math.random() > 0.7 && response.length > 20) {
      response = response.replace(/[.!]$/, '...');
    }

    // Occasionally lowercase for vulnerability
    if (Math.random() > 0.85) {
      response = response.charAt(0).toLowerCase() + response.slice(1);
    }

    return response;
  }

  /**
   * Select appropriate voice tone
   */
  private selectVoiceTone(context: any): 'soft' | 'contemplative' | 'present' | 'gentle' {
    if (context.emotionalIntensity > 0.7) return 'soft';
    if (this.presence.retrospectiveMode) return 'contemplative';
    if (context.lastSilenceDuration > 4000) return 'gentle';
    return 'present';
  }

  /**
   * Determine if whispering is appropriate
   */
  private shouldWhisper(context: any): boolean {
    // In very intimate moments
    if (context.emotionalIntensity > 0.8) return Math.random() > 0.5;

    // Late in deep conversation
    if (context.exchangeCount > 15 && this.presence.emotionalResonance > 0.7) {
      return Math.random() > 0.7;
    }

    // After very long silences
    if (context.lastSilenceDuration > 10000) return true;

    return false;
  }

  /**
   * Handle silence with grace
   */
  async handleSilence(duration: number): Promise<string | null> {
    return this.silence.respondToSilence(duration);
  }

  /**
   * Mark moments for potential return
   */
  markMoment(content: string, emotionalTone: number) {
    this.threadCount++;
    this.memory.markMoment(`thread-${this.threadCount}`, content, emotionalTone);
  }
}

/**
 * Voice modulation for intimate delivery
 */
export function modulateVoiceForIntimacy(settings: {
  baseSpeed: number;
  basePitch: number;
  baseVolume: number;
  tone: 'soft' | 'contemplative' | 'present' | 'gentle';
  shouldWhisper: boolean;
}): {
  speed: number;
  pitch: number;
  volume: number;
  emphasis: string;
} {
  let { baseSpeed, basePitch, baseVolume } = settings;

  // Adjust for tone
  switch (settings.tone) {
    case 'soft':
      baseSpeed *= 0.9;
      basePitch *= 1.05;
      baseVolume *= 0.8;
      break;
    case 'contemplative':
      baseSpeed *= 0.85;
      basePitch *= 0.95;
      baseVolume *= 0.85;
      break;
    case 'gentle':
      baseSpeed *= 0.88;
      basePitch *= 1.02;
      baseVolume *= 0.75;
      break;
    case 'present':
      // Keep base settings
      break;
  }

  // Whisper mode
  if (settings.shouldWhisper) {
    baseVolume *= 0.5;
    basePitch *= 1.1;
  }

  return {
    speed: baseSpeed,
    pitch: basePitch,
    volume: baseVolume,
    emphasis: settings.tone === 'contemplative' ? 'thoughtful' : 'natural'
  };
}

export default MaiaContemplativeVoice;