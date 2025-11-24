/**
 * ADAPTIVE MAIA ORACLE v2.0
 *
 * Kelly's Vision: "Meet people where they are. Level 1 gets accessible language.
 * Level 5 gets sacred prosody. Everyone gets NO CRINGE."
 *
 * This oracle automatically detects user consciousness level and adapts
 * language complexity from conventional to alchemical while filtering cringe.
 */

import { MAIAOracle } from '@/lib/consciousness/maia-oracle';
import { ConsciousnessLevel } from '@/lib/consciousness/level-detector';
import { ElementalSignature } from '@/lib/consciousness/adaptive-language';

export interface AdaptiveOracleRequest {
  input: string;
  userId: string;
  sessionId?: string;
  forceLevel?: ConsciousnessLevel;
  showAllLevels?: boolean;
}

export interface AdaptiveOracleResponse {
  message: string;
  element: string;
  archetype: string;
  confidence: number;
  adaptive: {
    detectedLevel: ConsciousnessLevel;
    levelName: string;
    languageStyle: string;
    cringeScore: number;
    passedCringeFilter: boolean;
  };
  allLevelResponses?: {
    level1: LevelResponse;
    level2: LevelResponse;
    level3: LevelResponse;
    level4: LevelResponse;
    level5: LevelResponse;
  };
  metadata: {
    processingTime: number;
    retryCount: number;
    elementalSignature: ElementalSignature;
  };
}

interface LevelResponse {
  message: string;
  cringeScore: number;
  passedCringeFilter: boolean;
}

export class AdaptiveMAIAOracle {
  private oracle: MAIAOracle;

  constructor() {
    this.oracle = new MAIAOracle({
      maxRetries: 3,
      cringeThreshold: 5,
      enableLevelAdaptation: true,
      enableCringeFilter: true,
      aiProvider: 'anthropic',
      model: 'claude-3-sonnet-20240229'
    });
  }

  async generateResponse(request: AdaptiveOracleRequest): Promise<AdaptiveOracleResponse> {
    const startTime = Date.now();

    // Use the underlying oracle system
    const oracleResponse = await this.oracle.respond({
      userId: request.userId,
      message: request.input,
      context: {
        sessionId: request.sessionId
      }
    });

    // Determine primary element and archetype from signature
    const { element, archetype } = this.analyzeElementalDominance(oracleResponse.elementalSignature);

    // Get level name and style
    const levelInfo = this.getLevelInfo(oracleResponse.level);

    const adaptiveResponse: AdaptiveOracleResponse = {
      message: oracleResponse.response,
      element,
      archetype,
      confidence: oracleResponse.validation.isValid ? 0.95 : 0.75,
      adaptive: {
        detectedLevel: request.forceLevel || oracleResponse.level,
        levelName: levelInfo.name,
        languageStyle: levelInfo.style,
        cringeScore: oracleResponse.metadata.cringeScore,
        passedCringeFilter: oracleResponse.validation.isValid
      },
      metadata: {
        processingTime: Date.now() - startTime,
        retryCount: oracleResponse.metadata.retryCount,
        elementalSignature: oracleResponse.elementalSignature
      }
    };

    // If requested, generate responses for all levels
    if (request.showAllLevels) {
      adaptiveResponse.allLevelResponses = await this.testAllLevels(request.input, request.userId);
    }

    return adaptiveResponse;
  }

  async getUserProfile(userId: string) {
    const diagnosis = await this.oracle.diagnoseUser(userId);
    const levelInfo = this.getLevelInfo(diagnosis.level);

    return {
      userId,
      consciousnessLevel: diagnosis.level,
      levelName: levelInfo.name,
      languageStyle: levelInfo.style,
      recommendations: diagnosis.recommendations,
      journeyData: diagnosis.journeyData
    };
  }

  async testAllLevels(input: string, userId: string) {
    const responses: { [key: string]: LevelResponse } = {};

    for (let level = 1; level <= 5; level++) {
      try {
        const response = await this.oracle.respond({
          userId: `${userId}-level${level}`,
          message: input
        });

        responses[`level${level}`] = {
          message: response.response,
          cringeScore: response.metadata.cringeScore,
          passedCringeFilter: response.validation.isValid
        };
      } catch (error) {
        console.error(`Error testing level ${level}:`, error);
        responses[`level${level}`] = {
          message: `Error generating level ${level} response`,
          cringeScore: 10,
          passedCringeFilter: false
        };
      }
    }

    return responses;
  }

  private analyzeElementalDominance(signature: ElementalSignature): { element: string; archetype: string } {
    // Find the dominant element
    const elements = [
      { name: 'fire', value: signature.fire, archetype: 'Creator' },
      { name: 'water', value: signature.water, archetype: 'Healer' },
      { name: 'earth', value: signature.earth, archetype: 'Builder' },
      { name: 'air', value: signature.air, archetype: 'Communicator' },
      { name: 'aether', value: signature.aether, archetype: 'Integrator' }
    ];

    const dominant = elements.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    );

    return {
      element: dominant.name,
      archetype: dominant.archetype
    };
  }

  private getLevelInfo(level: ConsciousnessLevel): { name: string; style: string } {
    const levels = {
      1: { name: 'Asleep/Unconscious', style: 'Accessible Guide' },
      2: { name: 'Awakening/Curious', style: 'Bridging Guide' },
      3: { name: 'Practicing/Developing', style: 'Framework Teacher' },
      4: { name: 'Integrated/Fluent', style: 'Consciousness Mirror' },
      5: { name: 'Teaching/Transmuting', style: 'Sacred Prosody' }
    };

    return levels[level];
  }
}
