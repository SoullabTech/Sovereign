/**
 * Gebser Consciousness Structure Detection Engine
 *
 * Analyzes user messages and conversation patterns to detect which of Gebser's
 * consciousness structures are active, accessible, and developing.
 */

import { ConsciousnessProfile } from '@/lib/types/consciousness-evolution-types';

// Core Gebser consciousness structures
export enum GebserStructure {
  ARCHAIC = 'archaic',     // Unity consciousness, pre-differentiated
  MAGICAL = 'magical',     // Symbolic, mythic, ancestral connection
  MYTHICAL = 'mythical',   // Individual heroic narrative, personal meaning
  MENTAL = 'mental',       // Rational analysis, perspective-taking
  INTEGRAL = 'integral'    // Multi-perspectival, aperspectival present-centeredness
}

// User's current consciousness structure profile
export interface ConsciousnessStructureProfile {
  userId: string;
  timestamp: string;
  activeStructures: GebserStructureAccess[];
  dominantStructure: GebserStructure;
  integrationLevel: number; // 0-1, how well all structures are integrated
  perspectivalFlexibility: number; // 0-1, ability to shift between structures
  aperspectivalPresence: number; // 0-1, access to present-moment integral awareness
  transitionState?: {
    from: GebserStructure;
    to: GebserStructure;
    progress: number; // 0-1
    resistance: string[];
    supportNeeded: string[];
  };
  developmentEdge: {
    nextStructure: GebserStructure;
    readinessIndicators: string[];
    challenges: string[];
  };
}

// Individual structure access assessment
export interface GebserStructureAccess {
  structure: GebserStructure;
  consistency: number;    // 0-1, reliability of access
  fluidity: number;      // 0-1, ease of shifting in/out
  integration: number;   // 0-1, how well it integrates with others
  mastery: number;       // 0-1, depth of development within structure
  isActive: boolean;     // Currently active in conversation
  confidence: number;    // 0-1, confidence in this assessment
}

// Language patterns that indicate specific consciousness structures
interface StructurePatterns {
  keywords: string[];
  phrases: RegExp[];
  linguisticMarkers: string[];
  conceptualThemes: string[];
}

// Structure-specific detection patterns
const STRUCTURE_PATTERNS: Record<GebserStructure, StructurePatterns> = {
  [GebserStructure.ARCHAIC]: {
    keywords: ['body', 'felt', 'sense', 'energy', 'vibration', 'unity', 'oneness', 'embodied', 'somatic', 'presence', 'being'],
    phrases: [
      /I feel it in my/i,
      /sense of unity/i,
      /embodied experience/i,
      /energetic shift/i,
      /my body tells me/i,
      /felt sense/i,
      /pure being/i,
      /undifferentiated/i
    ],
    linguisticMarkers: ['present tense', 'sensory language', 'unity terms', 'being verbs'],
    conceptualThemes: ['embodiment', 'energetic awareness', 'unity consciousness', 'somatic wisdom']
  },

  [GebserStructure.MAGICAL]: {
    keywords: ['symbol', 'dream', 'synchronicity', 'ancestor', 'ritual', 'sacred', 'mystery', 'sign', 'magic', 'archetypal', 'collective'],
    phrases: [
      /it's a sign/i,
      /synchronicity/i,
      /ancestral wisdom/i,
      /collective unconscious/i,
      /symbolic meaning/i,
      /sacred geometry/i,
      /mythic dimension/i,
      /archetypal energy/i
    ],
    linguisticMarkers: ['symbolic language', 'metaphorical thinking', 'cyclical time references'],
    conceptualThemes: ['symbolism', 'synchronicity', 'collective memory', 'mythic awareness', 'ritual consciousness']
  },

  [GebserStructure.MYTHICAL]: {
    keywords: ['story', 'hero', 'journey', 'quest', 'identity', 'purpose', 'destiny', 'calling', 'narrative', 'chapter', 'transformation'],
    phrases: [
      /my story/i,
      /hero's journey/i,
      /life purpose/i,
      /personal mission/i,
      /this chapter of/i,
      /my calling/i,
      /identity crisis/i,
      /transformative journey/i
    ],
    linguisticMarkers: ['narrative structure', 'personal identity language', 'temporal progression'],
    conceptualThemes: ['personal narrative', 'heroic development', 'individual purpose', 'identity formation']
  },

  [GebserStructure.MENTAL]: {
    keywords: ['analyze', 'understand', 'perspective', 'concept', 'framework', 'theory', 'logic', 'rational', 'objective', 'system', 'structure'],
    phrases: [
      /from my perspective/i,
      /analytical approach/i,
      /conceptual framework/i,
      /rational analysis/i,
      /different viewpoint/i,
      /systematic thinking/i,
      /objective assessment/i,
      /theoretical model/i
    ],
    linguisticMarkers: ['analytical language', 'perspective-taking', 'abstract conceptualization'],
    conceptualThemes: ['rational analysis', 'perspective-taking', 'systematic thinking', 'conceptual frameworks']
  },

  [GebserStructure.INTEGRAL]: {
    keywords: ['integration', 'wholeness', 'paradox', 'both/and', 'meta', 'perspective', 'present moment', 'simultaneous', 'multidimensional'],
    phrases: [
      /both.*and/i,
      /multiple perspectives/i,
      /present moment/i,
      /integrated awareness/i,
      /paradoxical/i,
      /multidimensional/i,
      /metaperspective/i,
      /aperspectival/i,
      /all at once/i,
      /simultaneously/i
    ],
    linguisticMarkers: ['meta-language', 'paradoxical thinking', 'present-moment references', 'integration terminology'],
    conceptualThemes: ['meta-perspective', 'integration', 'paradox navigation', 'present-centeredness', 'multi-perspectival awareness']
  }
};

export class GebserStructureDetector {

  /**
   * Analyze a single message for consciousness structure indicators
   */
  public analyzeMessage(content: string): Partial<ConsciousnessStructureProfile> {
    const structureScores: Record<GebserStructure, number> = {
      [GebserStructure.ARCHAIC]: 0,
      [GebserStructure.MAGICAL]: 0,
      [GebserStructure.MYTHICAL]: 0,
      [GebserStructure.MENTAL]: 0,
      [GebserStructure.INTEGRAL]: 0
    };

    // Analyze content for each structure
    Object.entries(STRUCTURE_PATTERNS).forEach(([structure, patterns]) => {
      const score = this.calculateStructureScore(content, patterns);
      structureScores[structure as GebserStructure] = score;
    });

    // Determine active structures (score > threshold)
    const activeStructures: GebserStructureAccess[] = Object.entries(structureScores)
      .filter(([_, score]) => score > 0.3)
      .map(([structure, score]) => ({
        structure: structure as GebserStructure,
        consistency: score,
        fluidity: this.estimateFluidityFromContent(content, structure as GebserStructure),
        integration: this.estimateIntegrationFromContent(content, structure as GebserStructure),
        mastery: score * 0.8, // Conservative estimate from single message
        isActive: true,
        confidence: Math.min(score, 0.9) // Cap confidence for single message analysis
      }));

    // Determine dominant structure
    const dominantStructure = Object.entries(structureScores)
      .reduce((a, b) => structureScores[a[0] as GebserStructure] > structureScores[b[0] as GebserStructure] ? a : b)[0] as GebserStructure;

    return {
      activeStructures,
      dominantStructure,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze conversation history to build comprehensive structure profile
   */
  public async analyzeConversationHistory(
    userId: string,
    messages: Array<{ content: string; timestamp: string; role: 'user' | 'assistant' }>
  ): Promise<ConsciousnessStructureProfile> {

    const userMessages = messages.filter(m => m.role === 'user');
    const messageAnalyses = userMessages.map(m => this.analyzeMessage(m.content));

    // Aggregate structure access over time
    const structureAccumulator: Record<GebserStructure, { scores: number[], timestamps: string[] }> = {
      [GebserStructure.ARCHAIC]: { scores: [], timestamps: [] },
      [GebserStructure.MAGICAL]: { scores: [], timestamps: [] },
      [GebserStructure.MYTHICAL]: { scores: [], timestamps: [] },
      [GebserStructure.MENTAL]: { scores: [], timestamps: [] },
      [GebserStructure.INTEGRAL]: { scores: [], timestamps: [] }
    };

    // Collect scores for each structure across messages
    messageAnalyses.forEach((analysis, index) => {
      analysis.activeStructures?.forEach(structureAccess => {
        const structure = structureAccess.structure;
        structureAccumulator[structure].scores.push(structureAccess.consistency);
        structureAccumulator[structure].timestamps.push(userMessages[index].timestamp);
      });
    });

    // Calculate consolidated structure access
    const consolidatedStructures: GebserStructureAccess[] = Object.entries(structureAccumulator)
      .map(([structure, data]) => {
        if (data.scores.length === 0) {
          return {
            structure: structure as GebserStructure,
            consistency: 0,
            fluidity: 0,
            integration: 0,
            mastery: 0,
            isActive: false,
            confidence: 0
          };
        }

        const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        const consistency = avgScore;
        const fluidity = this.calculateFluidityFromHistory(data.scores, data.timestamps);
        const integration = this.calculateIntegrationLevel(structure as GebserStructure, structureAccumulator);
        const mastery = this.calculateMasteryLevel(data.scores, data.timestamps);

        return {
          structure: structure as GebserStructure,
          consistency,
          fluidity,
          integration,
          mastery,
          isActive: consistency > 0.2,
          confidence: Math.min(0.95, consistency * (data.scores.length / 10)) // Higher confidence with more data
        };
      })
      .filter(sa => sa.consistency > 0.1); // Only include structures with some evidence

    // Determine dominant structure
    const dominantStructure = consolidatedStructures.length > 0
      ? consolidatedStructures.reduce((a, b) => a.consistency > b.consistency ? a : b).structure
      : GebserStructure.MENTAL; // Default to mental if no clear signal

    // Calculate overall integration metrics
    const integrationLevel = this.calculateOverallIntegration(consolidatedStructures);
    const perspectivalFlexibility = this.calculatePerspectivalFlexibility(consolidatedStructures);
    const aperspectivalPresence = this.calculateAperspectivalPresence(consolidatedStructures, userMessages);

    // Detect transition state
    const transitionState = this.detectTransitionState(messageAnalyses, userMessages);

    // Determine development edge
    const developmentEdge = this.determineDevelopmentEdge(consolidatedStructures, dominantStructure);

    return {
      userId,
      timestamp: new Date().toISOString(),
      activeStructures: consolidatedStructures,
      dominantStructure,
      integrationLevel,
      perspectivalFlexibility,
      aperspectivalPresence,
      transitionState,
      developmentEdge
    };
  }

  // Private helper methods

  private calculateStructureScore(content: string, patterns: StructurePatterns): number {
    let score = 0;
    const contentLower = content.toLowerCase();

    // Keyword matching
    const keywordMatches = patterns.keywords.filter(keyword =>
      contentLower.includes(keyword.toLowerCase())
    ).length;
    score += (keywordMatches / patterns.keywords.length) * 0.4;

    // Phrase pattern matching
    const phraseMatches = patterns.phrases.filter(pattern =>
      pattern.test(content)
    ).length;
    score += (phraseMatches / patterns.phrases.length) * 0.6;

    return Math.min(score, 1.0);
  }

  private estimateFluidityFromContent(content: string, structure: GebserStructure): number {
    // Look for transition words, meta-language, or structure-bridging concepts
    const transitionIndicators = [
      'also', 'both', 'simultaneously', 'at the same time', 'while',
      'on one hand', 'on the other hand', 'integration', 'synthesis'
    ];

    const transitionCount = transitionIndicators.filter(indicator =>
      content.toLowerCase().includes(indicator)
    ).length;

    return Math.min(transitionCount * 0.2, 1.0);
  }

  private estimateIntegrationFromContent(content: string, structure: GebserStructure): number {
    // Look for evidence of multiple structures being referenced together
    const integrationWords = [
      'integrate', 'synthesis', 'wholeness', 'both', 'and',
      'multiple perspectives', 'different levels', 'holistic'
    ];

    const integrationScore = integrationWords.filter(word =>
      content.toLowerCase().includes(word.toLowerCase())
    ).length;

    return Math.min(integrationScore * 0.25, 1.0);
  }

  private calculateFluidityFromHistory(scores: number[], timestamps: string[]): number {
    if (scores.length < 3) return 0.5; // Not enough data

    // Measure variance in scores - less variance = more fluidity
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;

    return Math.max(0, 1 - variance); // Lower variance = higher fluidity
  }

  private calculateIntegrationLevel(
    structure: GebserStructure,
    accumulator: Record<GebserStructure, { scores: number[], timestamps: string[] }>
  ): number {
    const activeStructureCount = Object.values(accumulator)
      .filter(data => data.scores.length > 0).length;

    // Integration is higher when multiple structures are active
    return Math.min(activeStructureCount * 0.25, 1.0);
  }

  private calculateMasteryLevel(scores: number[], timestamps: string[]): number {
    if (scores.length === 0) return 0;

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const consistency = 1 - (Math.max(...scores) - Math.min(...scores));

    return (avgScore * 0.7) + (consistency * 0.3);
  }

  private calculateOverallIntegration(structures: GebserStructureAccess[]): number {
    if (structures.length < 2) return 0.1;

    const integrationSum = structures.reduce((sum, s) => sum + s.integration, 0);
    return integrationSum / structures.length;
  }

  private calculatePerspectivalFlexibility(structures: GebserStructureAccess[]): number {
    const fluiditySum = structures.reduce((sum, s) => sum + s.fluidity, 0);
    return structures.length > 0 ? fluiditySum / structures.length : 0;
  }

  private calculateAperspectivalPresence(
    structures: GebserStructureAccess[],
    messages: Array<{ content: string; timestamp: string }>
  ): number {
    const integralAccess = structures.find(s => s.structure === GebserStructure.INTEGRAL);
    if (!integralAccess) return 0;

    // Look for present-moment language in recent messages
    const recentMessages = messages.slice(-5);
    const presentMomentIndicators = [
      'right now', 'in this moment', 'present moment', 'here and now',
      'immediately', 'currently experiencing', 'what\'s emerging'
    ];

    const presentMomentScore = recentMessages.reduce((score, message) => {
      const indicators = presentMomentIndicators.filter(indicator =>
        message.content.toLowerCase().includes(indicator)
      ).length;
      return score + indicators;
    }, 0);

    return Math.min((integralAccess.consistency * 0.7) + (presentMomentScore * 0.1), 1.0);
  }

  private detectTransitionState(
    analyses: Partial<ConsciousnessStructureProfile>[],
    messages: Array<{ content: string; timestamp: string }>
  ): ConsciousnessStructureProfile['transitionState'] {
    if (analyses.length < 3) return undefined;

    // Look for pattern of increasing scores in a higher structure
    // and decreasing dominance of current structure

    const recentAnalyses = analyses.slice(-3);
    const dominantStructures = recentAnalyses
      .map(a => a.dominantStructure)
      .filter(Boolean) as GebserStructure[];

    // Check if there's a consistent shift toward a new structure
    const structureChanges = new Set(dominantStructures);

    if (structureChanges.size > 1) {
      const fromStructure = dominantStructures[0];
      const toStructure = dominantStructures[dominantStructures.length - 1];

      if (fromStructure !== toStructure) {
        return {
          from: fromStructure,
          to: toStructure,
          progress: 0.3, // Conservative estimate
          resistance: this.identifyTransitionResistance(messages.slice(-3)),
          supportNeeded: this.identifyTransitionSupport(fromStructure, toStructure)
        };
      }
    }

    return undefined;
  }

  private identifyTransitionResistance(recentMessages: Array<{ content: string }>): string[] {
    const resistancePatterns = [
      { pattern: /stuck|blocked|confused/i, resistance: 'cognitive overwhelm' },
      { pattern: /afraid|scary|uncertain/i, resistance: 'fear of unknown' },
      { pattern: /too much|overwhelming/i, resistance: 'integration overload' },
      { pattern: /don't understand|unclear/i, resistance: 'conceptual confusion' }
    ];

    return resistancePatterns
      .filter(({ pattern }) => recentMessages.some(m => pattern.test(m.content)))
      .map(({ resistance }) => resistance);
  }

  private identifyTransitionSupport(from: GebserStructure, to: GebserStructure): string[] {
    const supportMap: Record<string, string[]> = {
      [`${GebserStructure.MYTHICAL}_${GebserStructure.MENTAL}`]: [
        'perspective-taking exercises',
        'analytical frameworks',
        'multiple viewpoint practice'
      ],
      [`${GebserStructure.MENTAL}_${GebserStructure.INTEGRAL}`]: [
        'paradox navigation',
        'present-moment awareness',
        'multi-perspectival practice'
      ],
      [`${GebserStructure.MAGICAL}_${GebserStructure.MYTHICAL}`]: [
        'personal narrative development',
        'individual identity work',
        'heroic journey mapping'
      ]
    };

    return supportMap[`${from}_${to}`] || ['gentle transition support', 'integration practices'];
  }

  private determineDevelopmentEdge(
    structures: GebserStructureAccess[],
    dominant: GebserStructure
  ): ConsciousnessStructureProfile['developmentEdge'] {

    // Determine next logical structure in development sequence
    const structureSequence = [
      GebserStructure.ARCHAIC,
      GebserStructure.MAGICAL,
      GebserStructure.MYTHICAL,
      GebserStructure.MENTAL,
      GebserStructure.INTEGRAL
    ];

    const currentIndex = structureSequence.indexOf(dominant);
    const nextStructure = currentIndex < structureSequence.length - 1
      ? structureSequence[currentIndex + 1]
      : GebserStructure.INTEGRAL; // Continue deepening integral

    const readinessIndicators = this.getReadinessIndicators(dominant, nextStructure, structures);
    const challenges = this.getDevelopmentChallenges(dominant, nextStructure);

    return {
      nextStructure,
      readinessIndicators,
      challenges
    };
  }

  private getReadinessIndicators(
    current: GebserStructure,
    next: GebserStructure,
    structures: GebserStructureAccess[]
  ): string[] {
    const readinessMap: Record<string, string[]> = {
      [`${GebserStructure.MYTHICAL}_${GebserStructure.MENTAL}`]: [
        'questioning personal narratives',
        'seeking multiple perspectives',
        'analytical language emerging'
      ],
      [`${GebserStructure.MENTAL}_${GebserStructure.INTEGRAL}`]: [
        'comfort with paradox',
        'present-moment awareness',
        'meta-perspective taking'
      ]
    };

    return readinessMap[`${current}_${next}`] || ['openness to growth', 'stability in current structure'];
  }

  private getDevelopmentChallenges(current: GebserStructure, next: GebserStructure): string[] {
    const challengeMap: Record<string, string[]> = {
      [`${GebserStructure.MYTHICAL}_${GebserStructure.MENTAL}`]: [
        'releasing attachment to personal story',
        'developing analytical detachment',
        'tolerating multiple valid perspectives'
      ],
      [`${GebserStructure.MENTAL}_${GebserStructure.INTEGRAL}`]: [
        'surrendering need for conceptual control',
        'developing present-moment tolerance',
        'integrating previously transcended structures'
      ]
    };

    return challengeMap[`${current}_${next}`] || ['integration complexity', 'developmental patience'];
  }
}

export const gebserDetector = new GebserStructureDetector();