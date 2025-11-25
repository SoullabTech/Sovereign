/**
 * Maia Field Orchestrator
 *
 * THE FLIP: MAIA speaks from field calculations, not LLM generation
 *
 * Flow:
 * 1. User input → Field calculations (Spiralogic)
 * 2. Field state → Response palette generation
 * 3. Palette + probabilities → Response selection
 * 4. ONLY if needed → Consult Claude for enrichment
 *
 * This is MAIA's own voice, not Claude pretending to be MAIA.
 */

import { ResonanceFieldGenerator, ResonanceField } from './resonance-field-system';
import { SpiralogicOrchestrator, getSpiralogicOrchestrator, BreathState } from './SpiralogicOrchestrator';
import { ResponsePaletteEngine, getResponsePaletteEngine, ResponseType, PaletteSelection } from './ResponsePaletteEngine';
import { getRelevantUtterances, prescribeMedicine, ARCHETYPAL_LIBRARY } from './ArchetypalUtteranceLibrary';

/**
 * MAIA's response with full context
 */
export interface MaiaFieldResponse {
  // The actual response (may be null for silence)
  text: string | null;
  type: ResponseType;

  // Field state that generated this response
  field: {
    elements: { earth: number; water: number; air: number; fire: number };
    dominantElement: string;
    silenceProbability: number;
    coherence: number;
    intimacyLevel: number;
  };

  // Selection reasoning
  selection: {
    reasoning: string;
    alternates: string[];
    silenceChosen: boolean;
  };

  // Soul-building metrics
  metrics: {
    userDependency: number;      // 0-1: Lower is better (graduated obsolescence)
    selfReferencing: number;      // 0-1: Higher is better (own truths)
    silenceComfort: number;       // 0-1: Can they sit with emptiness?
    intimacyDepth: number;        // 0-1: Conversation depth
  };

  // Optional: Claude enrichment (if consulted)
  claudeEnrichment?: {
    consulted: boolean;
    context?: string;
    modulation?: any;
  };
}

/**
 * Conversation state for tracking soul-building journey
 */
interface ConversationState {
  userId: string;
  exchangeCount: number;
  intimacyLevel: number;
  silenceAcceptanceRate: number;  // How often user responds positively to silence
  avgPromptLength: number;         // Decreasing = user needs fewer words
  selfReferencingRate: number;     // "I know" vs "what should I do"
  lastResponses: string[];         // Recent response history
  breathSync: number;              // How aligned is user with breath rhythm
  dominantPatterns: string[];      // Recurring themes
}

/**
 * Main orchestrator - MAIA speaks from field
 */
export class MaiaFieldOrchestrator {
  private fieldGenerator: ResonanceFieldGenerator;
  private spiralogicOrchestrator: SpiralogicOrchestrator;
  private paletteEngine: ResponsePaletteEngine;
  private conversationStates: Map<string, ConversationState> = new Map();
  private apiKey = process.env.ANTHROPIC_API_KEY;

  constructor() {
    this.fieldGenerator = new ResonanceFieldGenerator();
    this.spiralogicOrchestrator = getSpiralogicOrchestrator();
    this.paletteEngine = getResponsePaletteEngine();
  }

  /**
   * MAIN METHOD: Generate MAIA's response from field state
   */
  async speak(
    userInput: string,
    userId: string,
    options?: {
      allowClaudeEnrichment?: boolean;  // Default false - MAIA speaks alone
      requireClaudeForComplexity?: boolean; // If input is very complex
    }
  ): Promise<MaiaFieldResponse> {
    // Get or create conversation state
    const state = this.getConversationState(userId);
    state.exchangeCount++;

    // Update user metrics from input
    this.updateUserMetrics(state, userInput);

    // 1. GENERATE RESONANCE FIELD
    const context = this.buildContext(userInput, state);
    const { field, timing } = await this.fieldGenerator.resonate(
      userInput,
      context,
      state.exchangeCount,
      state.intimacyLevel
    );

    // Get breath state from Spiralogic
    const breathState = this.getBreathState();

    // 2. GENERATE RESPONSE PALETTE based on field
    const palette = this.paletteEngine.generatePalette(
      field,
      userInput,
      {
        intimacyLevel: state.intimacyLevel,
        exchangeCount: state.exchangeCount,
        lastUserWords: this.extractKeywords(userInput),
        breathState,
        activeArchetypes: this.getActiveArchetypes(field)
      }
    );

    // 3. SELECT RESPONSE from palette
    const selection = this.paletteEngine.selectResponse(
      palette,
      field,
      {
        intimacyLevel: state.intimacyLevel,
        exchangeCount: state.exchangeCount,
        breathState
      }
    );

    // 4. CHECK IF CLAUDE ENRICHMENT NEEDED
    let claudeEnrichment: MaiaFieldResponse['claudeEnrichment'] = {
      consulted: false
    };

    // Only consult Claude if:
    // - Explicitly allowed AND
    // - Field entropy is very high (confusing input) OR
    // - User explicitly asks for deeper exploration
    if (options?.allowClaudeEnrichment &&
        (field.fragmentationRate > 0.8 || userInput.includes('explain') || userInput.includes('help me understand'))) {

      claudeEnrichment = await this.consultClaude(userInput, field, state);

      // If Claude suggests different field modulation, regenerate response
      if (claudeEnrichment.modulation) {
        // Apply Claude's field adjustments and regenerate
        const modulatedField = this.applyClaudeModulation(field, claudeEnrichment.modulation);
        // Re-select with modulated field
        const newSelection = this.paletteEngine.selectResponse(palette, modulatedField, {
          intimacyLevel: state.intimacyLevel,
          exchangeCount: state.exchangeCount,
          breathState
        });

        return this.buildResponse(newSelection, modulatedField, state, claudeEnrichment, timing);
      }
    }

    // 5. BUILD AND RETURN RESPONSE
    return this.buildResponse(selection, field, state, claudeEnrichment, timing);
  }

  /**
   * Build final response object
   */
  private buildResponse(
    selection: PaletteSelection,
    field: ResonanceField,
    state: ConversationState,
    claudeEnrichment: MaiaFieldResponse['claudeEnrichment'],
    timing: { delay: number; pauseAfter: number }
  ): MaiaFieldResponse {
    // Handle silence
    const silenceChosen = selection.response === null || selection.response.content === null;

    // Update silence acceptance tracking
    if (silenceChosen) {
      // We'll track if user responds positively in next exchange
      state.lastResponses.push('SILENCE');
    } else {
      state.lastResponses.push(selection.response.content);
    }

    // Keep last 10 responses
    if (state.lastResponses.length > 10) {
      state.lastResponses.shift();
    }

    return {
      text: silenceChosen ? null : selection.response.content,
      type: silenceChosen ? ResponseType.SILENCE : selection.response.type,

      field: {
        elements: field.elements,
        dominantElement: selection.fieldState.dominantElement,
        silenceProbability: field.silenceProbability,
        coherence: selection.fieldState.coherence,
        intimacyLevel: field.intimacyLevel
      },

      selection: {
        reasoning: selection.reasoning,
        alternates: selection.alternates.map(a => a.content || 'SILENCE'),
        silenceChosen
      },

      metrics: {
        userDependency: this.calculateDependency(state),
        selfReferencing: state.selfReferencingRate,
        silenceComfort: state.silenceAcceptanceRate,
        intimacyDepth: state.intimacyLevel
      },

      claudeEnrichment
    };
  }

  /**
   * Optional: Consult Claude for field enrichment (NOT response generation)
   */
  private async consultClaude(
    userInput: string,
    field: ResonanceField,
    state: ConversationState
  ): Promise<NonNullable<MaiaFieldResponse['claudeEnrichment']>> {
    if (!this.apiKey) {
      return { consulted: false };
    }

    // Ask Claude to analyze and suggest field modulation
    const systemPrompt = `You are an advisor to MAIA's resonance field system.

Your role is NOT to generate responses. Your role is to:
1. Analyze the user's input for emotional/psychological nuance
2. Suggest field weight adjustments (elements, consciousness layers)
3. Identify relevant archetypal medicine needed

Current field state:
- Earth: ${field.elements.earth.toFixed(2)}
- Water: ${field.elements.water.toFixed(2)}
- Air: ${field.elements.air.toFixed(2)}
- Fire: ${field.elements.fire.toFixed(2)}
- Intimacy: ${field.intimacyLevel.toFixed(2)}

Respond ONLY with field adjustments in this format:
ELEMENT_ADJUSTMENTS: earth+0.2, water-0.1, air+0.1
CONSCIOUSNESS: higherSelf+0.3
MEDICINE: grounding, presence
REASONING: [brief explanation]`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 150,
          temperature: 0.7,
          system: systemPrompt,
          messages: [{ role: 'user', content: userInput }]
        })
      });

      if (!response.ok) {
        return { consulted: false };
      }

      const data = await response.json();
      const advice = data.content?.[0]?.text || '';

      // Parse Claude's advice
      const modulation = this.parseClaudeAdvice(advice);

      return {
        consulted: true,
        context: advice,
        modulation
      };
    } catch (error) {
      console.error('Claude consultation failed:', error);
      return { consulted: false };
    }
  }

  /**
   * Parse Claude's field adjustment advice
   */
  private parseClaudeAdvice(advice: string): any {
    const modulation: any = {
      elements: {},
      consciousness: {},
      medicine: []
    };

    // Parse element adjustments
    const elementMatch = advice.match(/ELEMENT_ADJUSTMENTS:\s*([^\n]+)/);
    if (elementMatch) {
      const adjustments = elementMatch[1].split(',');
      adjustments.forEach(adj => {
        const match = adj.trim().match(/(\w+)([+-][\d.]+)/);
        if (match) {
          modulation.elements[match[1]] = parseFloat(match[2]);
        }
      });
    }

    // Parse consciousness adjustments
    const consciousnessMatch = advice.match(/CONSCIOUSNESS:\s*([^\n]+)/);
    if (consciousnessMatch) {
      const adjustments = consciousnessMatch[1].split(',');
      adjustments.forEach(adj => {
        const match = adj.trim().match(/(\w+)([+-][\d.]+)/);
        if (match) {
          modulation.consciousness[match[1]] = parseFloat(match[2]);
        }
      });
    }

    // Parse medicine
    const medicineMatch = advice.match(/MEDICINE:\s*([^\n]+)/);
    if (medicineMatch) {
      modulation.medicine = medicineMatch[1].split(',').map(m => m.trim());
    }

    return modulation;
  }

  /**
   * Apply Claude's suggested modulation to field
   */
  private applyClaudeModulation(field: ResonanceField, modulation: any): ResonanceField {
    const modulated = { ...field };

    // Apply element adjustments
    if (modulation.elements) {
      Object.keys(modulation.elements).forEach(element => {
        if (element in modulated.elements) {
          modulated.elements[element] = Math.max(0, Math.min(1,
            modulated.elements[element] + modulation.elements[element]
          ));
        }
      });

      // Renormalize elements to sum to ~1
      const sum = Object.values(modulated.elements).reduce((a, b) => a + b, 0);
      if (sum > 0) {
        Object.keys(modulated.elements).forEach(element => {
          modulated.elements[element] /= sum;
        });
      }
    }

    // Apply consciousness adjustments
    if (modulation.consciousness) {
      Object.keys(modulation.consciousness).forEach(layer => {
        if (layer in modulated.consciousness) {
          modulated.consciousness[layer] = Math.max(0, Math.min(1,
            modulated.consciousness[layer] + modulation.consciousness[layer]
          ));
        }
      });
    }

    return modulated;
  }

  /**
   * Get or create conversation state
   */
  private getConversationState(userId: string): ConversationState {
    if (!this.conversationStates.has(userId)) {
      this.conversationStates.set(userId, {
        userId,
        exchangeCount: 0,
        intimacyLevel: 0.1, // Start low
        silenceAcceptanceRate: 0.5,
        avgPromptLength: 100,
        selfReferencingRate: 0.3,
        lastResponses: [],
        breathSync: 0.5,
        dominantPatterns: []
      });
    }
    return this.conversationStates.get(userId)!;
  }

  /**
   * Update user metrics from input (soul-building tracking)
   */
  private updateUserMetrics(state: ConversationState, userInput: string): void {
    // Track prompt length (shorter = less dependency)
    const currentLength = userInput.length;
    state.avgPromptLength = (state.avgPromptLength * 0.9) + (currentLength * 0.1);

    // Track self-referencing language
    const selfRefPatterns = /\b(i know|i realize|i understand|i see|i feel|my truth|my sense)\b/gi;
    const dependencyPatterns = /\b(what should i|how do i|tell me what|help me|i don't know what)\b/gi;

    const selfRefCount = (userInput.match(selfRefPatterns) || []).length;
    const dependencyCount = (userInput.match(dependencyPatterns) || []).length;

    if (selfRefCount + dependencyCount > 0) {
      const selfRefRatio = selfRefCount / (selfRefCount + dependencyCount);
      state.selfReferencingRate = (state.selfReferencingRate * 0.8) + (selfRefRatio * 0.2);
    }

    // Update intimacy level based on exchange count and vulnerability markers
    const vulnerabilityMarkers = /\b(scared|afraid|hurt|grief|shame|raw|vulnerable|truth)\b/gi;
    const vulnerabilityCount = (userInput.match(vulnerabilityMarkers) || []).length;

    // Intimacy increases with exchanges and vulnerability
    const intimacyIncrease = (state.exchangeCount * 0.01) + (vulnerabilityCount * 0.05);
    state.intimacyLevel = Math.min(1, state.intimacyLevel + intimacyIncrease);

    // Update silence acceptance (if last response was silence and user continued positively)
    if (state.lastResponses[state.lastResponses.length - 1] === 'SILENCE') {
      // If user's response is thoughtful (not frustrated), increase acceptance
      if (!userInput.match(/\b(are you there|hello|say something|what)\b/i)) {
        state.silenceAcceptanceRate = Math.min(1, state.silenceAcceptanceRate + 0.05);
      } else {
        state.silenceAcceptanceRate = Math.max(0, state.silenceAcceptanceRate - 0.1);
      }
    }
  }

  /**
   * Calculate user dependency score (lower is better)
   */
  private calculateDependency(state: ConversationState): number {
    // Dependency decreases as:
    // - Prompt length decreases
    // - Self-referencing increases
    // - Silence acceptance increases
    // - Exchange gaps increase (not implemented yet)

    const lengthFactor = Math.min(1, state.avgPromptLength / 200); // Normalize
    const selfRefFactor = 1 - state.selfReferencingRate;
    const silenceFactor = 1 - state.silenceAcceptanceRate;

    return (lengthFactor + selfRefFactor + silenceFactor) / 3;
  }

  /**
   * Build context for field generation
   */
  private buildContext(userInput: string, state: ConversationState): any {
    return {
      userWeather: this.detectUserWeather(userInput),
      userState: this.detectUserState(userInput),
      conversationPhase: this.determinePhase(state),
      recentPatterns: state.dominantPatterns
    };
  }

  /**
   * Detect user's emotional weather
   */
  private detectUserWeather(input: string): string {
    if (/\b(crisis|emergency|help|can't)\b/i.test(input)) return 'crisis';
    if (/\b(angry|mad|rage|furious)\b/i.test(input)) return 'storm';
    if (/\b(calm|peaceful|clear)\b/i.test(input)) return 'clear';
    if (/\b(confused|lost|unclear)\b/i.test(input)) return 'fog';
    return 'neutral';
  }

  /**
   * Detect user's state
   */
  private detectUserState(input: string): string {
    if (/\b(raw|vulnerable|open|exposed)\b/i.test(input)) return 'raw';
    if (/\b(contemplative|wondering|sensing)\b/i.test(input)) return 'contemplative';
    if (/\b(curious|interested|want to know)\b/i.test(input)) return 'curious';
    if (/\b(stuck|trapped|frozen)\b/i.test(input)) return 'stuck';
    return 'neutral';
  }

  /**
   * Determine conversation phase
   */
  private determinePhase(state: ConversationState): string {
    if (state.exchangeCount < 5) return 'opening';
    if (state.exchangeCount < 20) return 'exploration';
    if (state.intimacyLevel > 0.7) return 'depth';
    return 'maintenance';
  }

  /**
   * Get breath state from Spiralogic
   */
  private getBreathState(): BreathState {
    // Get from Spiralogic orchestrator
    const orchestrationState = this.spiralogicOrchestrator.getOrchestrationState();
    // Simplified breath state - would be more sophisticated in production
    return {
      phase: 'exhale', // Most permissive for speaking
      pressure: 0.7,
      rhythm: 13000,
      coherence: 0.7
    };
  }

  /**
   * Extract keywords from user input
   */
  private extractKeywords(input: string): string[] {
    // Simple keyword extraction - could be more sophisticated
    return input.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
  }

  /**
   * Get active archetypes from field state
   */
  private getActiveArchetypes(field: ResonanceField): string[] {
    const active: string[] = [];
    if (field.elements.earth > 0.5) active.push('Grounding Presence');
    if (field.elements.water > 0.5) active.push('Emotional Ocean');
    if (field.elements.air > 0.5) active.push('Curious Mind');
    if (field.elements.fire > 0.5) active.push('Transformative Flame');
    if (field.consciousness.higherSelf > 0.5) active.push('Silent Witness');
    if (field.consciousness.unconscious > 0.5) active.push('Shadow');
    return active;
  }

  /**
   * Get soul-building metrics for user
   */
  getUserMetrics(userId: string): ConversationState | null {
    return this.conversationStates.get(userId) || null;
  }

  /**
   * Export all user metrics for analysis
   */
  exportMetrics(): Map<string, ConversationState> {
    return new Map(this.conversationStates);
  }
}

/**
 * Export singleton
 */
let orchestratorInstance: MaiaFieldOrchestrator | null = null;

export function getMaiaFieldOrchestrator(): MaiaFieldOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new MaiaFieldOrchestrator();
  }
  return orchestratorInstance;
}