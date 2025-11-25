/**
 * ADAPTIVE LANGUAGE GENERATOR
 *
 * Core engine that generates responses at the appropriate consciousness level.
 *
 * Flow:
 * 1. Detect user's consciousness level
 * 2. Analyze elemental signature of input
 * 3. Build appropriate prompt for level
 * 4. Generate response via Claude/Llama
 * 5. Filter for cringe
 * 6. Return adapted response
 *
 * Kelly's Vision: "Meet people where they are. No cringe. Just wisdom."
 */

import { ConsciousnessLevel, ConsciousnessLevelDetector } from './ConsciousnessLevelDetector';
import { getSystemPrompt, ADAPTIVE_PROMPTS } from './AdaptiveSystemPrompts';
import { CringeFilter, addNoCringeRules } from './CringeFilter';
import { MultiLLMProvider } from './LLMProvider';

export interface ElementalAnalysis {
  fire: number;      // 0-10: Creative drive, vision, emergence
  water: number;     // 0-10: Emotional depth, feeling, intuition
  earth: number;     // 0-10: Grounding, embodiment, practical action
  air: number;       // 0-10: Mental clarity, perspective, integration
  aether: number;    // 0-10: Coherent presence, wholeness, unity
}

export interface AdaptiveResponse {
  message: string;
  consciousnessLevel: ConsciousnessLevel;
  elementalSignature: ElementalAnalysis;
  cringeScore: number;
  passedCringeFilter: boolean;
  metadata: {
    promptTemplate: string;
    modelUsed: string;
    generationTime: number;
  };
}

export class AdaptiveLanguageGenerator {
  private levelDetector: ConsciousnessLevelDetector;
  private cringeFilter: CringeFilter;
  private llmProvider: MultiLLMProvider;

  constructor() {
    this.levelDetector = new ConsciousnessLevelDetector();
    this.cringeFilter = new CringeFilter();

    // Initialize Multi-LLM Provider (open source first, Claude fallback)
    this.llmProvider = new MultiLLMProvider();
  }

  /**
   * Generate adaptive response based on user's consciousness level
   */
  async generateResponse(params: {
    input: string;
    userId: string;
    consciousnessLevel?: ConsciousnessLevel; // Optional override
  }): Promise<AdaptiveResponse> {

    const startTime = Date.now();
    const { input, userId, consciousnessLevel } = params;

    // 1. Detect or use provided consciousness level
    const level = consciousnessLevel || await this.levelDetector.detectLevel({ userId });

    // 2. Analyze elemental signature of input
    const elementalSignature = await this.analyzeElements(input);

    // 3. Build prompt appropriate for level
    const systemPrompt = this.buildPrompt(input, elementalSignature, level);

    // 4. Generate response (using appropriate LLM for level)
    const llmResponse = await this.llmProvider.generate({
      systemPrompt,
      userInput: input,
      level
    });
    const rawResponse = llmResponse.text;

    // 5. Check for cringe
    const cringeAnalysis = this.cringeFilter.analyze(rawResponse);

    // If cringe detected and score is high, regenerate with stricter rules
    let finalResponse = rawResponse;
    let finalModel = llmResponse.model;
    if (cringeAnalysis.score > 0.5) {
      console.warn(`Cringe detected (score: ${cringeAnalysis.score}). Regenerating...`);
      const stricterPrompt = this.buildPrompt(input, elementalSignature, level, true);
      const retryResponse = await this.llmProvider.generate({
        systemPrompt: stricterPrompt,
        userInput: input,
        level
      });
      finalResponse = retryResponse.text;
      finalModel = retryResponse.model;
    }

    const generationTime = Date.now() - startTime;

    return {
      message: finalResponse,
      consciousnessLevel: level,
      elementalSignature,
      cringeScore: cringeAnalysis.score,
      passedCringeFilter: cringeAnalysis.passesFilter,
      metadata: {
        promptTemplate: ADAPTIVE_PROMPTS[level].name,
        modelUsed: finalModel,
        generationTime
      }
    };
  }

  /**
   * Analyze elemental signature of user input
   */
  private async analyzeElements(input: string): Promise<ElementalAnalysis> {
    // Simple keyword-based analysis for now
    // TODO: Use Claude to analyze elemental signature more sophisticatedly

    const lowerInput = input.toLowerCase();

    // Fire indicators: action verbs, creation words, urgency
    const fireWords = ['create', 'do', 'start', 'build', 'make', 'now', 'urgent', 'push'];
    const fire = this.countMatches(lowerInput, fireWords) * 2;

    // Water indicators: feeling words, emotional language
    const waterWords = ['feel', 'emotion', 'heart', 'love', 'sad', 'happy', 'overwhelm', 'afraid'];
    const water = this.countMatches(lowerInput, waterWords) * 2;

    // Earth indicators: body words, practical concerns, grounding
    const earthWords = ['body', 'physical', 'ground', 'real', 'practical', 'concrete', 'tangible'];
    const earth = this.countMatches(lowerInput, earthWords) * 2;

    // Air indicators: thinking words, mental processing
    const airWords = ['think', 'understand', 'clarity', 'perspective', 'analyze', 'consider'];
    const air = this.countMatches(lowerInput, airWords) * 2;

    // Aether: presence, wholeness, integration words
    const aetherWords = ['whole', 'integrate', 'presence', 'aware', 'conscious', 'unity'];
    const aether = this.countMatches(lowerInput, aetherWords) * 2;

    // Normalize to 0-10 scale
    const max = Math.max(fire, water, earth, air, aether, 1);

    return {
      fire: Math.min(Math.round((fire / max) * 10), 10),
      water: Math.min(Math.round((water / max) * 10), 10),
      earth: Math.min(Math.round((earth / max) * 10), 10),
      air: Math.min(Math.round((air / max) * 10), 10),
      aether: Math.min(Math.round((aether / max) * 10), 10),
    };
  }

  /**
   * Count keyword matches in text
   */
  private countMatches(text: string, keywords: string[]): number {
    return keywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}`, 'gi');
      return count + (text.match(regex)?.length || 0);
    }, 0);
  }

  /**
   * Build complete system prompt for level
   */
  private buildPrompt(
    input: string,
    analysis: ElementalAnalysis,
    level: ConsciousnessLevel,
    extraStrict: boolean = false
  ): string {

    // Get base prompt for level
    let systemPrompt = getSystemPrompt(level);

    // Add NO CRINGE rules
    systemPrompt = addNoCringeRules(systemPrompt);

    // Add elemental context
    const elementalContext = `
ELEMENTAL SIGNATURE OF USER'S MESSAGE:
- Fire (creative drive): ${analysis.fire}/10
- Water (emotional depth): ${analysis.water}/10
- Earth (grounding): ${analysis.earth}/10
- Air (mental clarity): ${analysis.air}/10
- Aether (coherence): ${analysis.aether}/10

${level >= 3 ? 'You may reference these elements in your response if appropriate for the level.' : 'Do NOT reference elements - user is not ready for this framework.'}
`;

    systemPrompt = `${systemPrompt}\n\n${elementalContext}`;

    // If regenerating due to cringe, add extra strict rules
    if (extraStrict) {
      systemPrompt += `\n\nWARNING: Previous response failed cringe check. Be EXTRA direct and grounded.`;
    }

    return systemPrompt;
  }


  /**
   * Quick test method to compare responses across all levels
   */
  async testAllLevels(input: string, userId: string): Promise<Record<ConsciousnessLevel, AdaptiveResponse>> {
    const results = {} as Record<ConsciousnessLevel, AdaptiveResponse>;

    for (let level = 1; level <= 5; level++) {
      results[level as ConsciousnessLevel] = await this.generateResponse({
        input,
        userId,
        consciousnessLevel: level as ConsciousnessLevel
      });
    }

    return results;
  }
}
