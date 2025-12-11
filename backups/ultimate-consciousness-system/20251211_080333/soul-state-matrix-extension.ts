/**
 * SoulState Matrix Extension
 * Adds 8-channel consciousness tracking to existing SoulState system
 */

import { z } from 'zod';

// Existing SoulState structure (from wisdom-engine-api.js)
export interface ExistingSoulState {
  session: {
    awarenessLevel: number;
    nervousSystemLoad: string;
  };
  activeSpiral: {
    currentPhase: string;
  };
  detectedFacet: string;
  constellation: {
    harmonyIndex: number;
  };
}

// 8-Channel Consciousness Matrix Types
export const SomaticStateSchema = z.enum(['grounded', 'activated', 'dissociated', 'hypervigilant', 'flowing']);
export const AffectiveStateSchema = z.enum(['peaceful', 'turbulent', 'numb', 'expansive', 'contracted', 'mixed']);
export const AttentionalStateSchema = z.enum(['focused', 'scattered', 'hyperfocused', 'spacious', 'foggy', 'cycling']);
export const TemporalStateSchema = z.enum(['present', 'past-stuck', 'future-anxious', 'timeless', 'rushing', 'suspended']);
export const RelationalStateSchema = z.enum(['secure', 'anxious', 'avoidant', 'disorganized', 'healing', 'isolated']);
export const CulturalStateSchema = z.enum(['aligned', 'questioning', 'conflicted', 'exploring', 'displaced', 'integrating']);
export const SystemicStateSchema = z.enum(['stable', 'precarious', 'overwhelmed', 'transitioning', 'supported', 'trapped']);
export const EdgeStateSchema = z.enum(['clear', 'triggered', 'flashback', 'dissociative', 'manic', 'psychotic', 'integrating']);

export const ConsciousnessMatrixSchema = z.object({
  somatic: SomaticStateSchema,
  affective: AffectiveStateSchema,
  attentional: AttentionalStateSchema,
  temporal: TemporalStateSchema,
  relational: RelationalStateSchema,
  cultural: CulturalStateSchema,
  systemic: SystemicStateSchema,
  edge: EdgeStateSchema
});

export type SomaticState = z.infer<typeof SomaticStateSchema>;
export type AffectiveState = z.infer<typeof AffectiveStateSchema>;
export type AttentionalState = z.infer<typeof AttentionalStateSchema>;
export type TemporalState = z.infer<typeof TemporalStateSchema>;
export type RelationalState = z.infer<typeof RelationalStateSchema>;
export type CulturalState = z.infer<typeof CulturalStateSchema>;
export type SystemicState = z.infer<typeof SystemicStateSchema>;
export type EdgeState = z.infer<typeof EdgeStateSchema>;
export type ConsciousnessMatrix = z.infer<typeof ConsciousnessMatrixSchema>;

// Enhanced SoulState with Consciousness Matrix
export interface EnhancedSoulState extends ExistingSoulState {
  consciousnessMatrix: ConsciousnessMatrix;
  matrixConfidence?: number; // How certain are we about these detections?
  lastUpdated?: number;      // Timestamp for matrix state
}

// Matrix Assessment Result
export interface MatrixAssessment {
  matrix: ConsciousnessMatrix;
  confidence: number;
  safetyLevel: 'green' | 'yellow' | 'red';
  recommendedProtocol: string;
  reasoning: string;
}

/**
 * Analyzes user message for consciousness state indicators
 */
export class ConsciousnessDetector {

  analyzeMessage(userMessage: string, conversationHistory?: string[]): MatrixAssessment {
    const matrix = this.detectMatrix(userMessage, conversationHistory);
    const confidence = this.calculateConfidence(matrix, userMessage);
    const safetyLevel = this.assessSafetyLevel(matrix);
    const protocol = this.recommendProtocol(matrix, safetyLevel);

    return {
      matrix,
      confidence,
      safetyLevel,
      recommendedProtocol: protocol,
      reasoning: this.generateReasoning(matrix, safetyLevel)
    };
  }

  private detectMatrix(message: string, history?: string[]): ConsciousnessMatrix {
    const text = message.toLowerCase();
    const fullContext = history ? [...history, message].join(' ').toLowerCase() : text;

    return {
      somatic: this.detectSomaticState(text, fullContext),
      affective: this.detectAffectiveState(text, fullContext),
      attentional: this.detectAttentionalState(text, fullContext),
      temporal: this.detectTemporalState(text, fullContext),
      relational: this.detectRelationalState(text, fullContext),
      cultural: this.detectCulturalState(text, fullContext),
      systemic: this.detectSystemicState(text, fullContext),
      edge: this.detectEdgeState(text, fullContext)
    };
  }

  private detectSomaticState(text: string, context: string): SomaticState {
    const indicators = {
      grounded: ['centered', 'present in body', 'solid', 'stable', 'rooted', 'embodied'],
      activated: ['anxious', 'jittery', 'can\'t sit still', 'heart racing', 'restless', 'wound up'],
      dissociated: ['numb', 'disconnected', 'floating', 'not real', 'outside myself', 'detached'],
      hypervigilant: ['on edge', 'jumpy', 'scanning', 'alert', 'unsafe', 'watching'],
      flowing: ['relaxed', 'fluid', 'moving', 'flexible', 'natural', 'easy']
    };

    return this.findBestMatch(text, context, indicators, 'flowing') as SomaticState;
  }

  private detectAffectiveState(text: string, context: string): AffectiveState {
    const indicators = {
      peaceful: ['calm', 'serene', 'tranquil', 'peaceful', 'still', 'quiet'],
      turbulent: ['intense', 'chaotic', 'stormy', 'overwhelming', 'turbulent', 'wild'],
      numb: ['nothing', 'empty', 'blank', 'numb', 'void', 'flat'],
      expansive: ['open', 'big', 'spacious', 'infinite', 'expanded', 'vast'],
      contracted: ['tight', 'small', 'closed', 'compressed', 'squeezed', 'narrow'],
      mixed: ['complicated', 'contradictory', 'mixed', 'confusing', 'both', 'neither']
    };

    return this.findBestMatch(text, context, indicators, 'peaceful') as AffectiveState;
  }

  private detectAttentionalState(text: string, context: string): AttentionalState {
    const indicators = {
      focused: ['clear', 'sharp', 'focused', 'concentrated', 'precise', 'laser'],
      scattered: ['scattered', 'distracted', 'everywhere', 'fragmented', 'jumping'],
      hyperfocused: ['obsessed', 'fixated', 'tunnel', 'locked', 'intense focus'],
      spacious: ['open awareness', 'panoramic', 'wide', 'spacious', 'peripheral'],
      foggy: ['foggy', 'unclear', 'muddy', 'hazy', 'confused', 'cloudy'],
      cycling: ['cycling', 'switching', 'back and forth', 'oscillating', 'alternating']
    };

    return this.findBestMatch(text, context, indicators, 'focused') as AttentionalState;
  }

  private detectTemporalState(text: string, context: string): TemporalState {
    const indicators = {
      present: ['right now', 'present', 'here', 'currently', 'this moment'],
      'past-stuck': ['always', 'used to', 'before', 'stuck in', 'keep thinking about'],
      'future-anxious': ['what if', 'worried about', 'when will', 'afraid', 'anxious about'],
      timeless: ['eternal', 'infinite', 'beyond time', 'timeless', 'forever'],
      rushing: ['hurry', 'fast', 'quick', 'rushing', 'running out of time'],
      suspended: ['suspended', 'waiting', 'paused', 'limbo', 'frozen', 'stuck']
    };

    return this.findBestMatch(text, context, indicators, 'present') as TemporalState;
  }

  private detectRelationalState(text: string, context: string): RelationalState {
    const indicators = {
      secure: ['safe', 'connected', 'trusting', 'secure', 'supported', 'belonging'],
      anxious: ['needy', 'clingy', 'afraid of losing', 'abandonment', 'insecure'],
      avoidant: ['independent', 'don\'t need', 'prefer alone', 'distant', 'self-reliant'],
      disorganized: ['confusing', 'chaotic', 'push-pull', 'contradictory', 'disorganized'],
      healing: ['learning', 'growing', 'healing', 'working on', 'improving'],
      isolated: ['alone', 'isolated', 'no one', 'lonely', 'cut off', 'withdrawn']
    };

    return this.findBestMatch(text, context, indicators, 'secure') as RelationalState;
  }

  private detectCulturalState(text: string, context: string): CulturalState {
    const indicators = {
      aligned: ['my tradition', 'fits', 'aligned', 'belongs', 'resonates'],
      questioning: ['wondering', 'questioning', 'not sure', 'doubting', 'exploring'],
      conflicted: ['torn', 'conflicted', 'doesn\'t fit', 'contradicts', 'struggle'],
      exploring: ['learning about', 'interested in', 'exploring', 'discovering'],
      displaced: ['don\'t belong', 'outsider', 'displaced', 'foreign', 'homeless'],
      integrating: ['combining', 'integrating', 'weaving', 'bridging', 'synthesizing']
    };

    return this.findBestMatch(text, context, indicators, 'aligned') as CulturalState;
  }

  private detectSystemicState(text: string, context: string): SystemicState {
    const indicators = {
      stable: ['stable', 'secure', 'financially okay', 'supported', 'resources'],
      precarious: ['uncertain', 'unstable', 'precarious', 'hanging by thread'],
      overwhelmed: ['too much', 'overwhelmed', 'can\'t handle', 'drowning', 'crushing'],
      transitioning: ['changing', 'transition', 'in between', 'shifting', 'moving'],
      supported: ['help', 'supported', 'resources', 'assistance', 'backing'],
      trapped: ['trapped', 'stuck', 'no way out', 'powerless', 'no options']
    };

    return this.findBestMatch(text, context, indicators, 'stable') as SystemicState;
  }

  private detectEdgeState(text: string, context: string): EdgeState {
    const indicators = {
      clear: ['clear', 'stable', 'fine', 'okay', 'good', 'normal'],
      triggered: ['triggered', 'activated', 'reactive', 'set off', 'provoked'],
      flashback: ['flashback', 'reliving', 'back there', 'happening again', 'transported'],
      dissociative: ['not real', 'outside myself', 'watching', 'dream-like', 'disconnected'],
      manic: ['manic', 'high energy', 'euphoric', 'grandiose', 'racing'],
      psychotic: ['hearing', 'seeing things', 'not real', 'voices', 'paranoid'],
      integrating: ['processing', 'integrating', 'working through', 'healing', 'understanding']
    };

    return this.findBestMatch(text, context, indicators, 'clear') as EdgeState;
  }

  private findBestMatch<T extends string>(
    text: string,
    context: string,
    indicators: Record<T, string[]>,
    defaultState: T
  ): T {
    let maxScore = 0;
    let bestMatch = defaultState;

    for (const [state, keywords] of Object.entries(indicators) as [T, string[]][]) {
      const score = keywords.reduce((sum, keyword) => {
        const textMatches = (text.includes(keyword) ? 1 : 0);
        const contextMatches = (context.includes(keyword) ? 0.5 : 0);
        return sum + textMatches + contextMatches;
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestMatch = state;
      }
    }

    return bestMatch;
  }

  private calculateConfidence(matrix: ConsciousnessMatrix, message: string): number {
    // Higher confidence with more specific language
    const specificityIndicators = [
      'feeling', 'experiencing', 'noticed', 'aware', 'sense', 'realize'
    ];

    const specificityScore = specificityIndicators.reduce((score, indicator) =>
      message.toLowerCase().includes(indicator) ? score + 0.1 : score, 0.5
    );

    return Math.min(1, specificityScore);
  }

  private assessSafetyLevel(matrix: ConsciousnessMatrix): 'green' | 'yellow' | 'red' {
    // Red light: immediate safety concerns
    const redStates = ['triggered', 'flashback', 'dissociative', 'manic', 'psychotic'];
    if (redStates.includes(matrix.edge) ||
        matrix.somatic === 'hypervigilant' ||
        matrix.systemic === 'trapped') {
      return 'red';
    }

    // Yellow light: proceed with care
    const yellowStates = [
      matrix.affective === 'turbulent' || matrix.affective === 'numb',
      matrix.attentional === 'scattered' || matrix.attentional === 'foggy',
      matrix.temporal === 'past-stuck' || matrix.temporal === 'future-anxious',
      matrix.relational === 'anxious' || matrix.relational === 'disorganized',
      matrix.systemic === 'precarious' || matrix.systemic === 'overwhelmed'
    ];

    if (yellowStates.some(condition => condition)) {
      return 'yellow';
    }

    return 'green';
  }

  private recommendProtocol(matrix: ConsciousnessMatrix, safetyLevel: 'green' | 'yellow' | 'red'): string {
    if (safetyLevel === 'red') {
      if (matrix.edge === 'psychotic' || matrix.edge === 'manic') {
        return 'crisis_professional_referral';
      }
      if (matrix.edge === 'flashback' || matrix.edge === 'triggered') {
        return 'grounding_and_safety';
      }
      return 'basic_nervous_system_care';
    }

    if (safetyLevel === 'yellow') {
      if (matrix.somatic === 'activated' || matrix.somatic === 'dissociated') {
        return 'somatic_regulation_first';
      }
      if (matrix.affective === 'turbulent') {
        return 'emotional_stabilization';
      }
      if (matrix.systemic === 'overwhelmed') {
        return 'practical_support_focus';
      }
      return 'gentle_exploration';
    }

    // Green light - full depth available
    return 'full_spiritual_depth';
  }

  private generateReasoning(matrix: ConsciousnessMatrix, safetyLevel: string): string {
    const concerns = [];

    if (safetyLevel === 'red') {
      concerns.push(`Edge state detected: ${matrix.edge}`);
    }
    if (matrix.somatic === 'hypervigilant' || matrix.somatic === 'dissociated') {
      concerns.push(`Somatic dysregulation: ${matrix.somatic}`);
    }
    if (matrix.systemic === 'overwhelmed' || matrix.systemic === 'trapped') {
      concerns.push(`Systemic pressure: ${matrix.systemic}`);
    }

    if (concerns.length === 0) {
      return "Consciousness matrix indicates readiness for full depth exploration";
    }

    return `Care needed due to: ${concerns.join(', ')}`;
  }
}

/**
 * Converts existing soulState to enhanced version with matrix
 */
export function enhanceSoulState(
  existingState: ExistingSoulState,
  userMessage: string,
  conversationHistory?: string[]
): EnhancedSoulState {
  const detector = new ConsciousnessDetector();
  const assessment = detector.analyzeMessage(userMessage, conversationHistory);

  return {
    ...existingState,
    consciousnessMatrix: assessment.matrix,
    matrixConfidence: assessment.confidence,
    lastUpdated: Date.now()
  };
}

/**
 * Helper for Navigator integration
 */
export function getProtocolRecommendation(
  matrix: ConsciousnessMatrix
): {
  protocol: string;
  depthLevel: 'basic' | 'medium' | 'full';
  specialCare: string[];
} {
  const detector = new ConsciousnessDetector();
  const safetyLevel = detector['assessSafetyLevel'](matrix);
  const protocol = detector['recommendProtocol'](matrix, safetyLevel);

  const depthLevel =
    safetyLevel === 'red' ? 'basic' :
    safetyLevel === 'yellow' ? 'medium' : 'full';

  const specialCare = [];
  if (matrix.edge !== 'clear') specialCare.push('trauma_aware');
  if (matrix.systemic === 'precarious' || matrix.systemic === 'overwhelmed') {
    specialCare.push('material_conditions_aware');
  }
  if (matrix.cultural === 'conflicted' || matrix.cultural === 'displaced') {
    specialCare.push('cultural_sensitivity');
  }

  return { protocol, depthLevel, specialCare };
}