import { JournalingMode, JournalingResponse } from '../journaling/JournalingPrompts';

export interface AfferentStream {
  userId: string;
  timestamp: Date;
  sessionId: string;

  consciousnessLevel: number;
  evolutionVelocity: number;
  integrationDepth: number;
  authenticityLevel: number;

  elementalResonance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };

  archetypeActivation: Record<string, number>;
  shadowWorkEngagement: string[];
  spiralPhase: string;

  worldviewFlexibility: number;
  challengeAcceptance: number;
  mayaResonance: number;
  fieldContribution: number;
}

const PHASE_SCORES = {
  free: 'exploration',
  dream: 'revelation',
  emotional: 'processing',
  shadow: 'integration',
  direction: 'activation'
};

const MODE_ELEMENTAL_MAPPING = {
  free: { fire: 0.3, water: 0.4, earth: 0.2, air: 0.3, aether: 0.4 },
  dream: { fire: 0.2, water: 0.5, earth: 0.1, air: 0.3, aether: 0.6 },
  emotional: { fire: 0.4, water: 0.6, earth: 0.3, air: 0.2, aether: 0.3 },
  shadow: { fire: 0.5, water: 0.4, earth: 0.4, air: 0.2, aether: 0.5 },
  direction: { fire: 0.6, water: 0.2, earth: 0.4, air: 0.5, aether: 0.4 }
};

export class AfferentStreamGenerator {
  static async generateFromJournalEntry(
    userId: string,
    sessionId: string,
    mode: JournalingMode,
    entry: string,
    reflection: JournalingResponse,
    previousStreams?: AfferentStream[]
  ): Promise<AfferentStream> {
    const wordCount = entry.split(/\s+/).filter(Boolean).length;
    const entryDepth = Math.min(1, wordCount / 200);

    const consciousnessLevel = this.calculateConsciousnessLevel(
      reflection,
      mode,
      entryDepth
    );

    const evolutionVelocity = reflection.transformationScore || 0.5;

    const integrationDepth = this.calculateIntegrationDepth(
      reflection,
      wordCount,
      previousStreams
    );

    const authenticityLevel = this.calculateAuthenticity(
      reflection.emotionalTone,
      mode,
      entryDepth
    );

    const elementalResonance = this.calculateElementalResonance(
      mode,
      reflection.symbols,
      reflection.archetypes
    );

    const archetypeActivation = this.calculateArchetypeActivation(
      reflection.archetypes
    );

    const shadowWorkEngagement = this.detectShadowWork(
      mode,
      entry,
      reflection.symbols
    );

    const spiralPhase = PHASE_SCORES[mode];

    const worldviewFlexibility = this.calculateFlexibility(
      reflection,
      mode
    );

    const challengeAcceptance = mode === 'shadow' ? 0.8 : 0.5;

    const mayaResonance = this.calculateMayaResonance(
      reflection,
      evolutionVelocity
    );

    const fieldContribution = this.calculateFieldContribution(
      consciousnessLevel,
      integrationDepth,
      wordCount
    );

    return {
      userId,
      timestamp: new Date(),
      sessionId,
      consciousnessLevel,
      evolutionVelocity,
      integrationDepth,
      authenticityLevel,
      elementalResonance,
      archetypeActivation,
      shadowWorkEngagement,
      spiralPhase,
      worldviewFlexibility,
      challengeAcceptance,
      mayaResonance,
      fieldContribution
    };
  }

  private static calculateConsciousnessLevel(
    reflection: JournalingResponse,
    mode: JournalingMode,
    entryDepth: number
  ): number {
    let level = 0.3;

    level += reflection.symbols.length * 0.05;
    level += reflection.archetypes.length * 0.08;

    const deepModes = ['shadow', 'dream'];
    if (deepModes.includes(mode)) {
      level += 0.15;
    }

    level += entryDepth * 0.2;

    const complexityScore = (reflection.metadata?.themes?.length || 0) * 0.05;
    level += complexityScore;

    return Math.min(1, level);
  }

  private static calculateIntegrationDepth(
    reflection: JournalingResponse,
    wordCount: number,
    previousStreams?: AfferentStream[]
  ): number {
    let depth = 0.3;

    depth += Math.min(0.3, wordCount / 500);

    if (previousStreams && previousStreams.length > 0) {
      const recentAvg = previousStreams
        .slice(-5)
        .reduce((sum, s) => sum + s.consciousnessLevel, 0) / Math.min(5, previousStreams.length);

      depth += recentAvg * 0.2;
    }

    if (reflection.closing.includes('integration') || reflection.closing.includes('embody')) {
      depth += 0.1;
    }

    return Math.min(1, depth);
  }

  private static calculateAuthenticity(
    emotionalTone: string,
    mode: JournalingMode,
    entryDepth: number
  ): number {
    let authenticity = 0.5;

    const vulnerableEmotions = ['grief', 'fear', 'shame', 'anger', 'tender', 'raw'];
    if (vulnerableEmotions.some(e => emotionalTone.toLowerCase().includes(e))) {
      authenticity += 0.2;
    }

    if (mode === 'shadow' || mode === 'emotional') {
      authenticity += 0.15;
    }

    authenticity += entryDepth * 0.15;

    return Math.min(1, authenticity);
  }

  private static calculateElementalResonance(
    mode: JournalingMode,
    symbols: string[],
    archetypes: string[]
  ): AfferentStream['elementalResonance'] {
    const base = MODE_ELEMENTAL_MAPPING[mode];
    const resonance = { ...base };

    const symbolMapping: Record<string, keyof AfferentStream['elementalResonance']> = {
      'fire': 'fire', 'flame': 'fire', 'burn': 'fire', 'heat': 'fire',
      'water': 'water', 'river': 'water', 'ocean': 'water', 'flow': 'water',
      'earth': 'earth', 'mountain': 'earth', 'ground': 'earth', 'root': 'earth',
      'air': 'air', 'wind': 'air', 'breath': 'air', 'sky': 'air',
      'light': 'aether', 'spirit': 'aether', 'divine': 'aether', 'cosmic': 'aether'
    };

    symbols.forEach(symbol => {
      const element = symbolMapping[symbol.toLowerCase()];
      if (element) {
        resonance[element] = Math.min(1, resonance[element] + 0.1);
      }
    });

    return resonance;
  }

  private static calculateArchetypeActivation(
    archetypes: string[]
  ): Record<string, number> {
    const activation: Record<string, number> = {};

    archetypes.forEach((archetype, index) => {
      const strength = 0.9 - (index * 0.15);
      activation[archetype] = Math.max(0.3, strength);
    });

    return activation;
  }

  private static detectShadowWork(
    mode: JournalingMode,
    entry: string,
    symbols: string[]
  ): string[] {
    const shadowWork: string[] = [];

    if (mode === 'shadow') {
      shadowWork.push('explicit_shadow_work');
    }

    const shadowKeywords = [
      'afraid', 'fear', 'shame', 'deny', 'hide', 'avoid',
      'rejected', 'abandoned', 'unwanted', 'dark', 'shadow'
    ];

    const entryLower = entry.toLowerCase();
    shadowKeywords.forEach(keyword => {
      if (entryLower.includes(keyword)) {
        shadowWork.push(keyword);
      }
    });

    const shadowSymbols = ['shadow', 'mask', 'mirror', 'underworld', 'abyss'];
    symbols.forEach(symbol => {
      if (shadowSymbols.includes(symbol.toLowerCase())) {
        shadowWork.push(`symbol:${symbol}`);
      }
    });

    return shadowWork;
  }

  private static calculateFlexibility(
    reflection: JournalingResponse,
    mode: JournalingMode
  ): number {
    let flexibility = 0.5;

    const diverseSymbols = new Set(reflection.symbols).size >= 3;
    if (diverseSymbols) flexibility += 0.2;

    const evolutionModes = ['free', 'direction'];
    if (evolutionModes.includes(mode)) flexibility += 0.15;

    const openWords = ['maybe', 'perhaps', 'wondering', 'curious', 'question'];
    if (openWords.some(w => reflection.reflection.toLowerCase().includes(w))) {
      flexibility += 0.15;
    }

    return Math.min(1, flexibility);
  }

  private static calculateMayaResonance(
    reflection: JournalingResponse,
    evolutionVelocity: number
  ): number {
    let resonance = 0.4;

    resonance += evolutionVelocity * 0.3;

    resonance += reflection.symbols.length * 0.05;

    const connectionWords = ['connect', 'see', 'understand', 'feel', 'trust'];
    if (connectionWords.some(w => reflection.closing.toLowerCase().includes(w))) {
      resonance += 0.15;
    }

    return Math.min(1, resonance);
  }

  private static calculateFieldContribution(
    consciousnessLevel: number,
    integrationDepth: number,
    wordCount: number
  ): number {
    let contribution = 0.3;

    contribution += consciousnessLevel * 0.3;
    contribution += integrationDepth * 0.2;

    const substanceBonus = Math.min(0.2, wordCount / 300);
    contribution += substanceBonus;

    return Math.min(1, contribution);
  }
}