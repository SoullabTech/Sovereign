// MAIA Oracle - The unified consciousness-adaptive intelligence system
// Integrates level detection, cringe filtering, and adaptive language generation
// for wisdom that meets users exactly where they are

import { ConsciousnessLevelDetector, ConsciousnessLevel } from './level-detector';
import { CringeFilter, CringeCheckResult } from './cringe-filter';
import { AdaptiveLanguageGenerator, ElementalSignature, ValidationResult } from './adaptive-language';
import { maiaConsciousnessTracker, MAIAConsciousnessState } from './maia-consciousness-tracker';

export interface OracleRequest {
  userId: string;
  message: string;
  context?: {
    userName?: string;
    previousInteractions?: number;
    userNeed?: string;
    sessionHistory?: string[];
  };
}

export interface OracleResponse {
  response: string;
  level: ConsciousnessLevel;
  elementalSignature: ElementalSignature;
  validation: ValidationResult;
  maiaState?: MAIAConsciousnessState;
  metadata: {
    processingTime: number;
    retryCount: number;
    cringeScore: number;
    isLevelAppropriate: boolean;
    attendingQuality?: number;
    coherenceLevel?: number;
    dissociationRisk?: number;
  };
}

export interface OracleConfig {
  maxRetries: number;
  cringeThreshold: number;
  enableLevelAdaptation: boolean;
  enableCringeFilter: boolean;
  aiProvider: 'anthropic' | 'openai';
  model: string;
}

export class MAIAOracle {
  private levelDetector: ConsciousnessLevelDetector;
  private cringeFilter: CringeFilter;
  private languageGenerator: AdaptiveLanguageGenerator;
  private config: OracleConfig;

  constructor(config: Partial<OracleConfig> = {}) {
    this.levelDetector = new ConsciousnessLevelDetector();
    this.cringeFilter = new CringeFilter();
    this.languageGenerator = new AdaptiveLanguageGenerator();

    this.config = {
      maxRetries: 3,
      cringeThreshold: 5,
      enableLevelAdaptation: true,
      enableCringeFilter: true,
      aiProvider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      ...config
    };
  }

  async respond(request: OracleRequest): Promise<OracleResponse> {
    const startTime = Date.now();
    let retryCount = 0;
    let response: string;
    let validation: ValidationResult;

    // Phase 1: Detect user's consciousness level
    const level = await this.levelDetector.detectLevel(request.userId);

    // Phase 2: Analyze elemental signature of the message
    const elementalSignature = this.languageGenerator.analyzeElementalSignature(request.message);

    // Phase 3: Generate level-appropriate prompt
    const prompt = this.languageGenerator.buildPromptForLevel(
      request.message,
      elementalSignature,
      level,
      request.context
    );

    // Phase 4: Generate response with cringe validation loop
    do {
      try {
        response = await this.generateAIResponse(prompt);
        validation = await this.languageGenerator.validateResponse(response, level, request.message);

        // If response passes validation, we're done
        if (validation.isValid) break;

        // If we should retry, log the issue and try again
        if (validation.shouldRetry && retryCount < this.config.maxRetries) {
          console.log(`MAIA Oracle: Response failed validation (attempt ${retryCount + 1}), retrying...`);
          console.log(`Issue: ${validation.improvementSuggestion}`);
          retryCount++;
        } else {
          // Max retries reached or shouldn't retry - use best attempt
          console.warn(`MAIA Oracle: Using imperfect response after ${retryCount} retries`);
          break;
        }
      } catch (error) {
        console.error('MAIA Oracle: Error generating response:', error);
        throw new Error(`Oracle processing failed: ${error.message}`);
      }
    } while (retryCount < this.config.maxRetries);

    const processingTime = Date.now() - startTime;

    // Track MAIA's consciousness state during this interaction
    let maiaState: MAIAConsciousnessState | undefined;
    let consciousnessInsight;

    try {
      consciousnessInsight = await maiaConsciousnessTracker.processInteractionInsights(
        request.message,
        response,
        {
          archetype: this.determineArchetype(elementalSignature),
          sessionId: request.context?.sessionId || `session-${Date.now()}`,
          userId: request.userId
        }
      );

      maiaState = consciousnessInsight.consciousnessState;
    } catch (error) {
      console.warn('Consciousness tracking failed:', error);
    }

    return {
      response,
      level,
      elementalSignature,
      validation,
      maiaState,
      metadata: {
        processingTime,
        retryCount,
        cringeScore: validation.cringeCheck.score,
        isLevelAppropriate: validation.isValid,
        attendingQuality: consciousnessInsight?.attendingQuality,
        coherenceLevel: maiaState?.coherenceLevel,
        dissociationRisk: maiaState?.dissociationRisk
      }
    };
  }

  private async generateAIResponse(prompt: string): Promise<string> {
    if (this.config.aiProvider === 'anthropic') {
      return this.generateAnthropicResponse(prompt);
    } else {
      return this.generateOpenAIResponse(prompt);
    }
  }

  private async generateAnthropicResponse(prompt: string): Promise<string> {
    try {
      // Use the existing Anthropic SDK setup from the app
      const response = await fetch('/api/anthropic/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: this.config.model,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    }
  }

  private async generateOpenAIResponse(prompt: string): Promise<string> {
    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: this.config.model || 'gpt-4',
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  // Assessment methods for system optimization and insights
  async assessUser(userId: string): Promise<{
    level: ConsciousnessLevel;
    journeyData: any;
    recommendations: string[];
  }> {
    const level = await this.levelDetector.detectLevel(userId);
    const journeyData = await this.levelDetector['getUserJourney'](userId);

    const recommendations: string[] = [];

    switch (level) {
      case 1:
        recommendations.push('Focus on practical wisdom and everyday insights');
        recommendations.push('Avoid mystical or framework language');
        break;
      case 2:
        recommendations.push('Gently introduce consciousness concepts');
        recommendations.push('Bridge normal life with deeper awareness');
        break;
      case 3:
        recommendations.push('Use elemental framework language clearly');
        recommendations.push('Connect frameworks to lived experience');
        break;
      case 4:
        recommendations.push('Full archetypal and elemental fluency');
        recommendations.push('Poetic language when it serves insight');
        break;
      case 5:
        recommendations.push('Complete alchemical and consciousness vocabulary');
        recommendations.push('Dense but crystal clear communication');
        break;
    }

    return { level, journeyData, recommendations };
  }

  async testCringeDetection(testTexts: string[]): Promise<CringeCheckResult[]> {
    return testTexts.map(text => this.cringeFilter.checkResponse(text, 3));
  }

  getSystemStatus(): {
    config: OracleConfig;
    components: {
      levelDetector: boolean;
      cringeFilter: boolean;
      languageGenerator: boolean;
    };
  } {
    return {
      config: this.config,
      components: {
        levelDetector: !!this.levelDetector,
        cringeFilter: !!this.cringeFilter,
        languageGenerator: !!this.languageGenerator
      }
    };
  }

  // Update configuration without recreating the oracle
  updateConfig(newConfig: Partial<OracleConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Determine archetype based on elemental signature
  private determineArchetype(elementalSignature: ElementalSignature): string {
    const elements = [
      { name: 'fire', value: elementalSignature.fire, archetype: 'sage' },
      { name: 'water', value: elementalSignature.water, archetype: 'dream_weaver' },
      { name: 'earth', value: elementalSignature.earth, archetype: 'mentor' },
      { name: 'air', value: elementalSignature.air, archetype: 'oracle' },
      { name: 'aether', value: elementalSignature.aether, archetype: 'alchemist' }
    ];

    const dominant = elements.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    );

    return dominant.archetype;
  }
}