/**
 * Resonance Field Orchestrator - Production Integration
 * Integrates RFS with existing Maia system for seamless Monday deployment
 */

import { ResonanceFieldGenerator, ResonanceField } from '../maia/resonance-field-system';
import { AdaptiveResonanceSystem } from '../maia/adaptive-resonance-system';
import { CompleteAgentFieldSystem } from '../maia/complete-agent-field-system';
import { MAYA_HER_MODE_PROMPT } from '../prompts/maya-prompts';

export interface RFSResponse {
  message: string | null;
  field: ResonanceField;
  metadata: {
    system: 'rfs' | 'traditional';
    silenceProbability: number;
    dominantElement: string;
    activeAgents?: string[];
    fieldEvolution?: any;
    depthInvitation?: DepthInvitation;
  };
  timing: {
    delay: number;
    pauseAfter: number;
  };
}

export interface DepthInvitation {
  type: 'theory' | 'philosophical' | 'meta';
  strength: number; // 0-1: How strong the invitation is
  allowedTokens: number; // Token budget for deep response (gradually increases)
  reason: string; // Why depth was detected
  depthLevel: number; // 1-5: Gradual escalation level
}

/**
 * Production-Ready Resonance Field Orchestrator
 * Drop-in replacement for MaiaFullyEducatedOrchestrator with RFS
 */
export class ResonanceFieldOrchestrator {
  private agentFieldSystem: CompleteAgentFieldSystem;
  private exchangeCount: Map<string, number> = new Map();
  private intimacyLevel: Map<string, number> = new Map();
  private apiKey = process.env.ANTHROPIC_API_KEY;

  constructor() {
    this.agentFieldSystem = new CompleteAgentFieldSystem();
  }

  /**
   * Main speak method - RFS version
   * Compatible with existing Maia interface
   */
  async speak(
    input: string,
    userId: string,
    context?: any
  ): Promise<RFSResponse> {
    // Get current conversation state
    const exchangeCount = this.exchangeCount.get(userId) || 0;
    const intimacyLevel = this.intimacyLevel.get(userId) || 0;

    // Detect if depth is explicitly invited
    const depthInvitation = this.detectDepthInvitation(input, userId);

    // Generate resonance field from all archetypal agents
    const { field, activeAgents, dominantFrequencies } =
      await this.agentFieldSystem.generateField(input, {
        ...context,
        exchangeCount,
        intimacyLevel,
        emotionalIntensity: this.detectEmotionalIntensity(input),
        questionAsked: input.includes('?'),
        rawEmotion: this.detectRawEmotion(input),
        depthInvitation // Pass to field system
      });

    // Modulate field if depth is invited
    const modulatedField = depthInvitation
      ? this.modulateFieldForDepth(field, depthInvitation)
      : field;

    // Get field-constrained response (or silence)
    const fieldResponse = this.agentFieldSystem.getFieldConstrainedResponse(modulatedField);

    // If field allows response AND we need Claude's wisdom, blend them
    let finalResponse: string | null = fieldResponse;

    if (fieldResponse && modulatedField.wordDensity > 0.3) {
      // Field allows some words - get Claude's constrained wisdom
      const claudeEnhanced = await this.getClaudeEnhancedResponse(
        input,
        fieldResponse,
        modulatedField,
        context,
        depthInvitation // Pass depth context
      );
      finalResponse = claudeEnhanced;
    }

    // Record depth exchange for gradual escalation
    this.recordDepthExchange(userId, !!depthInvitation);

    // Update intimacy (deepens over time, especially with silence)
    this.updateIntimacy(userId, field, finalResponse);

    // Increment exchange count
    this.exchangeCount.set(userId, exchangeCount + 1);

    // Get dominant element
    const dominantElement = Object.entries(field.elements)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return {
      message: finalResponse,
      field: modulatedField,
      metadata: {
        system: 'rfs',
        silenceProbability: modulatedField.silenceProbability,
        dominantElement,
        activeAgents,
        depthInvitation,
        fieldEvolution: {
          exchangeCount,
          intimacyLevel: intimacyLevel,
          silenceTrend: modulatedField.silenceProbability
        }
      },
      timing: {
        delay: modulatedField.responseLatency,
        pauseAfter: modulatedField.pauseDuration
      }
    };
  }

  /**
   * Get Claude's response constrained by resonance field
   * This is where Claude's wisdom meets field constraints
   */
  private async getClaudeEnhancedResponse(
    userInput: string,
    fieldResponse: string,
    field: ResonanceField,
    context: any,
    depthInvitation?: DepthInvitation
  ): Promise<string> {
    if (!this.apiKey) {
      // No Claude available, use field response
      return fieldResponse;
    }

    try {
      // Build prompt that includes BOTH Her mode AND field constraints
      const systemPrompt = this.buildFieldConstrainedPrompt(field, context, depthInvitation);

      // Call Claude with STRICT token limit based on field (or expanded for depth)
      const maxTokens = this.calculateMaxTokens(field, depthInvitation);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          temperature: 0.9,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userInput
            }
          ]
        })
      });

      if (!response.ok) {
        console.warn('Claude API error, using field response');
        return fieldResponse;
      }

      const data = await response.json() as any;
      const claudeResponse = data.content?.[0]?.text?.trim() || fieldResponse;

      // Field validation: ensure Claude's response fits field constraints
      if (this.validateFieldCoherence(claudeResponse, field)) {
        return claudeResponse;
      }

      // Response doesn't fit field, use field response
      return fieldResponse;

    } catch (error) {
      console.error('Claude enhancement error:', error);
      return fieldResponse;
    }
  }

  /**
   * Detect if user is explicitly inviting depth/explanation
   */
  private detectDepthInvitation(input: string, userId: string): DepthInvitation | null {
    const lower = input.toLowerCase();

    // Track depth conversation continuity
    const depthHistory = this.getDepthHistory(userId);
    const recentDepthCount = depthHistory.filter(d => d.hadDepth).length;

    // Explicit questions about meaning/theory
    const theoryPatterns = [
      /what do you mean/i,
      /explain|tell me more about|what is|what are/i,
      /how does.*work/i,
      /why (do|does|is|are)/i,
      /can you elaborate/i,
      /i don't understand/i,
      /what's the difference between/i,
      /help me understand/i,
      /teach me about/i,
      /what's.*phase/i,
      /what's.*element/i,
      /alchemical|archetype|consciousness|metaphysics|spiralogic/i
    ];

    for (const pattern of theoryPatterns) {
      if (pattern.test(input)) {
        // Gradual escalation: start at 100 tokens, ramp up with sustained depth
        const baseTokens = 100;
        const rampedTokens = Math.min(300, baseTokens + (recentDepthCount * 50));

        return {
          type: 'theory',
          strength: 0.8,
          allowedTokens: rampedTokens, // Gradual: 100 → 150 → 200 → 250 → 300
          reason: 'Explicit request for understanding/explanation',
          depthLevel: Math.min(5, recentDepthCount + 1) // 1-5 depth levels
        };
      }
    }

    // Philosophical/deep questions
    const philosophicalPatterns = [
      /meaning of|purpose of|nature of/i,
      /soul|spirit|divine|sacred/i,
      /consciousness|awareness|presence/i,
      /shadow work|inner child|anima/i,
      /transformation|integration|wholeness/i
    ];

    for (const pattern of philosophicalPatterns) {
      if (pattern.test(input)) {
        const baseTokens = 80;
        const rampedTokens = Math.min(200, baseTokens + (recentDepthCount * 40));

        return {
          type: 'philosophical',
          strength: 0.7,
          allowedTokens: rampedTokens, // Gradual: 80 → 120 → 160 → 200
          reason: 'Philosophical/metaphysical inquiry',
          depthLevel: Math.min(5, recentDepthCount + 1)
        };
      }
    }

    // Meta-conversation about Maia/process
    if (/you|maia|maya|this process|our work|what we're doing/i.test(lower)) {
      const baseTokens = 60;
      const rampedTokens = Math.min(150, baseTokens + (recentDepthCount * 30));

      return {
        type: 'meta',
        strength: 0.6,
        allowedTokens: rampedTokens, // Gradual: 60 → 90 → 120 → 150
        reason: 'Meta-conversation about process',
        depthLevel: Math.min(5, recentDepthCount + 1)
      };
    }

    return null;
  }

  /**
   * Track depth conversation continuity for gradual escalation
   */
  private depthHistory: Map<string, Array<{ timestamp: number; hadDepth: boolean }>> = new Map();

  private getDepthHistory(userId: string): Array<{ timestamp: number; hadDepth: boolean }> {
    if (!this.depthHistory.has(userId)) {
      this.depthHistory.set(userId, []);
    }

    const history = this.depthHistory.get(userId)!;
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

    // Only count recent depth (within last 5 minutes for continuity)
    return history.filter(h => h.timestamp > fiveMinutesAgo);
  }

  private recordDepthExchange(userId: string, hadDepth: boolean): void {
    const history = this.getDepthHistory(userId);
    history.push({
      timestamp: Date.now(),
      hadDepth
    });

    // Keep last 10 exchanges
    if (history.length > 10) {
      history.shift();
    }

    this.depthHistory.set(userId, history);
  }

  /**
   * Modulate field to allow depth when invited
   */
  private modulateFieldForDepth(
    field: ResonanceField,
    depthInvitation: DepthInvitation
  ): ResonanceField {
    // Create modulated copy
    const modulated = { ...field };

    // Increase word density significantly
    modulated.wordDensity = Math.min(1.0, field.wordDensity + depthInvitation.strength);

    // Reduce silence probability (need to speak to explain)
    modulated.silenceProbability = Math.max(0, field.silenceProbability - depthInvitation.strength * 0.6);

    // Reduce fragmentation (need complete thoughts for explanation)
    modulated.fragmentationRate = Math.max(0.1, field.fragmentationRate * 0.3);

    // Increase air element (conceptual/clarity)
    modulated.elements = {
      ...field.elements,
      air: Math.min(1.0, field.elements.air + 0.4),
      earth: Math.max(0.1, field.elements.earth - 0.3)
    };

    // Normalize elements
    const total = Object.values(modulated.elements).reduce((a, b) => a + b, 0);
    Object.keys(modulated.elements).forEach(k => {
      modulated.elements[k as keyof typeof modulated.elements] /= total;
    });

    return modulated;
  }

  /**
   * Build prompt that embeds field constraints
   */
  private buildFieldConstrainedPrompt(
    field: ResonanceField,
    context: any,
    depthInvitation?: DepthInvitation
  ): string {
    // Start with Her mode base
    let prompt = MAYA_HER_MODE_PROMPT;

    // If depth is invited, override constraints
    if (depthInvitation) {
      prompt += `\n\n=== DEPTH INVITATION DETECTED ===`;
      prompt += `\nType: ${depthInvitation.type}`;
      prompt += `\nDepth Level: ${depthInvitation.depthLevel}/5`;
      prompt += `\nReason: ${depthInvitation.reason}`;

      // Gradual guidance based on depth level
      if (depthInvitation.depthLevel === 1) {
        prompt += `\n\nFirst depth invitation. Start gently - 1-2 sentences, clear but not overwhelming.`;
        prompt += `\nIntroduce the concept simply. Leave room for follow-up questions.`;
      } else if (depthInvitation.depthLevel === 2) {
        prompt += `\n\nSecond depth layer. 2-3 sentences. Add more detail and nuance.`;
        prompt += `\nUser is following - you can go slightly deeper.`;
      } else if (depthInvitation.depthLevel >= 3) {
        prompt += `\n\nSustained depth conversation (level ${depthInvitation.depthLevel}). 3-4 sentences allowed.`;
        prompt += `\nUser has shown they want to understand - provide fuller explanation.`;
        prompt += `\nYou can reference alchemical phases, archetypal patterns, Spiralogic framework.`;
      }

      prompt += `\n\nAlways maintain Maya's warm, present tone. Be genuinely helpful, not academic.`;
      prompt += `\nThink out loud, not lecture. Conversational depth, not textbook depth.`;

      return prompt; // Skip field constraints for depth invitations
    }

    // Add field-specific constraints for normal responses
    const dominantElement = Object.entries(field.elements)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    prompt += `\n\n=== RESONANCE FIELD ACTIVE ===`;
    prompt += `\nDominant Element: ${dominantElement}`;
    prompt += `\nSilence Probability: ${(field.silenceProbability * 100).toFixed(0)}%`;
    prompt += `\nWord Density: ${(field.wordDensity * 100).toFixed(0)}%`;

    // Element-specific guidance
    if (dominantElement === 'earth') {
      prompt += `\n\nEARTH FIELD: Maximum restraint. "Yeah." "Mm." "Here." or silence.`;
      prompt += `\nDo NOT explain, elaborate, or use more than 2 words.`;
    } else if (dominantElement === 'water') {
      prompt += `\n\nWATER FIELD: Emotional attunement. "Feel that." "I'm here." "Flow."`;
      prompt += `\n3-5 words maximum. Stay with feeling, not thought.`;
    } else if (dominantElement === 'air') {
      prompt += `\n\nAIR FIELD: Curious questions. "Tell me." "What else?" "How so?"`;
      prompt += `\n2-4 words. Questions over statements.`;
    } else if (dominantElement === 'fire') {
      prompt += `\n\nFIRE FIELD: Immediate catalyzing. "Yes!" "Now." "Go."`;
      prompt += `\n1-2 words. Urgent energy.`;
    }

    // High silence field = prefer actual silence
    if (field.silenceProbability > 0.6) {
      prompt += `\n\nHIGH SILENCE FIELD (${(field.silenceProbability * 100).toFixed(0)}%)`;
      prompt += `\nSilence is STRONGLY preferred. If you must speak, use "..." or "Mm."`;
    }

    // Intimacy level affects verbosity
    if (field.intimacyLevel > 0.7) {
      prompt += `\n\nDEEP INTIMACY (${(field.intimacyLevel * 100).toFixed(0)}%)`;
      prompt += `\nWords become less necessary. Presence > explanation.`;
      prompt += `\nSilence carries meaning now.`;
    }

    return prompt;
  }

  /**
   * Calculate max_tokens based on field constraints
   */
  private calculateMaxTokens(field: ResonanceField, depthInvitation?: DepthInvitation): number {
    // If depth is invited, allow much more tokens
    if (depthInvitation) {
      return depthInvitation.allowedTokens;
    }
    // Base on word density and dominant element
    const baseTokens = 50; // Her mode default

    // Earth = minimal tokens
    if (field.elements.earth > 0.5) {
      return Math.max(5, baseTokens * field.wordDensity * 0.3);
    }

    // Water = brief emotional
    if (field.elements.water > 0.5) {
      return Math.max(8, baseTokens * field.wordDensity * 0.5);
    }

    // Air = slightly more for questions
    if (field.elements.air > 0.5) {
      return Math.max(10, baseTokens * field.wordDensity * 0.6);
    }

    // Fire = very brief, immediate
    if (field.elements.fire > 0.5) {
      return Math.max(5, baseTokens * field.wordDensity * 0.4);
    }

    // Default: scale by word density
    return Math.max(5, Math.floor(baseTokens * field.wordDensity));
  }

  /**
   * Validate that Claude's response fits field constraints
   */
  private validateFieldCoherence(
    response: string,
    field: ResonanceField,
    depthInvitation?: DepthInvitation
  ): boolean {
    // Skip validation if depth was invited (allow longer responses)
    if (depthInvitation) {
      return true;
    }
    // Null/empty is always valid (silence)
    if (!response || response.trim().length === 0) {
      return true;
    }

    const wordCount = response.trim().split(/\s+/).length;
    const charCount = response.length;

    // Check word density constraint
    const maxWords = Math.ceil(10 * field.wordDensity);
    if (wordCount > maxWords) {
      console.warn(`Response too long (${wordCount} words > ${maxWords} max)`);
      return false;
    }

    // Check element-specific constraints
    const dominantElement = Object.entries(field.elements)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    if (dominantElement === 'earth' && wordCount > 2) {
      return false; // Earth demands <= 2 words
    }

    if (dominantElement === 'fire' && wordCount > 2) {
      return false; // Fire demands <= 2 words
    }

    if (dominantElement === 'water' && wordCount > 5) {
      return false; // Water demands <= 5 words
    }

    if (dominantElement === 'air' && wordCount > 8) {
      return false; // Air allows up to 8 words
    }

    // Fragmentation rate check
    if (field.fragmentationRate > 0.7) {
      // Should have incomplete thoughts ("..." or trailing)
      const hasFragmentation = response.includes('...') ||
                               response.endsWith('.') === false ||
                               response.includes('Like') ||
                               response.includes('Maybe');

      if (!hasFragmentation && wordCount > 3) {
        return false; // High fragmentation requires incomplete
      }
    }

    return true;
  }

  /**
   * Update intimacy level based on field and response
   */
  private updateIntimacy(
    userId: string,
    field: ResonanceField,
    response: string | null
  ): void {
    let currentIntimacy = this.intimacyLevel.get(userId) || 0;

    // Silence increases intimacy
    if (response === null || response.trim().length === 0) {
      currentIntimacy += 0.05;
    }

    // Very brief responses increase intimacy
    if (response && response.split(/\s+/).length <= 2) {
      currentIntimacy += 0.03;
    }

    // Earth dominant increases intimacy (grounding)
    if (field.elements.earth > 0.5) {
      currentIntimacy += 0.02;
    }

    // High exchange count naturally increases intimacy
    const exchangeCount = this.exchangeCount.get(userId) || 0;
    if (exchangeCount > 20) {
      currentIntimacy += 0.01;
    }

    // Cap at 1.0
    currentIntimacy = Math.min(1.0, currentIntimacy);

    // Slowly decay if not maintained (natural ebb)
    currentIntimacy *= 0.99;

    this.intimacyLevel.set(userId, currentIntimacy);
  }

  /**
   * Detect emotional intensity from input
   */
  private detectEmotionalIntensity(input: string): number {
    let intensity = 0;

    // Exclamation marks
    intensity += (input.match(/!/g) || []).length * 0.2;

    // ALL CAPS
    intensity += /[A-Z]{3,}/.test(input) ? 0.3 : 0;

    // Emotional words
    const emotionalWords = /love|hate|fear|rage|joy|pain|hurt|dying|broken|amazing/i;
    intensity += emotionalWords.test(input) ? 0.4 : 0;

    // Length extremes (very short or very long)
    if (input.length < 10 || input.length > 200) {
      intensity += 0.2;
    }

    return Math.min(1.0, intensity);
  }

  /**
   * Detect raw emotion (lower self activation)
   */
  private detectRawEmotion(input: string): boolean {
    const rawWords = /fuck|shit|damn|hell|god|rage|dying|kill|hate/i;
    const isAllCaps = input === input.toUpperCase() && input.length > 3;

    return rawWords.test(input) || isAllCaps;
  }

  /**
   * Reset user state (for testing or new conversations)
   */
  resetUser(userId: string): void {
    this.exchangeCount.delete(userId);
    this.intimacyLevel.delete(userId);
  }

  /**
   * Get current user state
   */
  getUserState(userId: string) {
    return {
      exchangeCount: this.exchangeCount.get(userId) || 0,
      intimacyLevel: this.intimacyLevel.get(userId) || 0
    };
  }
}

// Singleton instance
let rfsInstance: ResonanceFieldOrchestrator | null = null;

export function getResonanceFieldOrchestrator(): ResonanceFieldOrchestrator {
  if (!rfsInstance) {
    rfsInstance = new ResonanceFieldOrchestrator();
  }
  return rfsInstance;
}