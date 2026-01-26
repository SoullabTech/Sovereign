/**
 * Field Awareness Service - Crystal Palace Integration Layer
 *
 * Aggregates Soulprint + existing context into SystemOutputs,
 * calculates unified elemental field, and returns FieldAwarenessResult.
 *
 * This is PHASE 1: Observability - adds field calculations without
 * changing MAIA's response generation.
 */

import {
  UnifiedElementalFieldCalculator,
  CompleteElementalFieldState,
  SystemOutputs,
} from './field/UnifiedElementalFieldCalculator';

import {
  getSoulprintForUser,
  soulprintMemory,
  type SoulprintSnapshot,
  type SymbolicContext,
} from '../memory/soulprint';

import {
  detectEmotionalTone,
  detectElementalNeeds,
  type EmotionalTone,
  type ElementalNeeds,
} from './ResonanceField';

// ═══════════════════════════════════════════════════════════════
// FIELD AWARENESS RESULT INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface FieldAwarenessResult {
  // Core field state
  dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  coherence: number; // 0-1: overall field coherence
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };

  // Emergence indicators
  emergentPotential: number; // 0-1: likelihood of breakthrough
  silenceProbability: number; // 0-1: should MAIA lean into silence?
  transcendentIntegration: number; // 0-1: unity consciousness access

  // User context from Soulprint
  soulprint: {
    sessionCount: number;
    recentArchetypes: string[];
    spiralHistory: string[];
    emotionalTrajectory: string[];
  };

  // Current input analysis
  inputAnalysis: {
    emotionalTone: EmotionalTone | undefined;
    elementalNeeds: ElementalNeeds;
    intimacySignals: number; // 0-1: depth of sharing
    complexityLevel: number; // 0-1: cognitive complexity
  };

  // Full field state (for advanced use)
  fullFieldState: CompleteElementalFieldState;

  // Timestamp
  calculatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// FIELD AWARENESS CONTEXT
// ═══════════════════════════════════════════════════════════════

export interface FieldAwarenessContext {
  conversationHistory?: Array<{ role: string; content: string }>;
  relationshipMemory?: {
    totalEncounters: number;
    relationshipPhase: string;
    themes: Array<{ theme: string; strength: number }>;
  };
  cognitiveProfile?: {
    rollingAverage: number;
    recentScores: number[];
  };
  mode?: 'dialogue' | 'counsel' | 'scribe';
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Detect intimacy signals in user input
 * Higher values indicate deeper personal sharing
 */
function detectIntimacySignals(input: string): number {
  const lowerInput = input.toLowerCase();
  let score = 0;

  // First-person vulnerability markers
  const vulnerabilityPatterns = [
    /\bi feel\b/i,
    /\bi'm afraid\b/i,
    /\bi'm scared\b/i,
    /\bi struggle\b/i,
    /\bi've never told\b/i,
    /\bmy heart\b/i,
    /\bdeep inside\b/i,
    /\bvulnerable\b/i,
    /\bshame\b/i,
    /\bafraid to\b/i,
    /\bcan i trust\b/i,
  ];

  vulnerabilityPatterns.forEach(pattern => {
    if (pattern.test(lowerInput)) score += 0.15;
  });

  // Personal disclosure markers
  if (/\bmy (father|mother|parent|child|partner|spouse)\b/i.test(lowerInput)) {
    score += 0.1;
  }

  // Length as intimacy signal (longer = more sharing)
  if (input.length > 200) score += 0.1;
  if (input.length > 400) score += 0.1;

  return Math.min(1, score);
}

/**
 * Detect cognitive complexity of input
 */
function detectComplexityLevel(input: string): number {
  const lowerInput = input.toLowerCase();
  let score = 0.3; // Base complexity

  // Abstract reasoning markers
  const abstractPatterns = [
    /\bwhy do\b/i,
    /\bwhat if\b/i,
    /\bhow does .* work\b/i,
    /\brelationship between\b/i,
    /\bpattern\b/i,
    /\bmeaning of\b/i,
    /\bpurpose\b/i,
    /\bconnection\b/i,
    /\bsystem\b/i,
  ];

  abstractPatterns.forEach(pattern => {
    if (pattern.test(lowerInput)) score += 0.1;
  });

  // Multi-clause sentences indicate complex thought
  const clauseCount = (input.match(/,|;|and|but|because|although|however/gi) || []).length;
  score += Math.min(0.2, clauseCount * 0.03);

  return Math.min(1, score);
}

/**
 * Calculate silence probability based on field state and context
 */
function calculateSilenceProbability(
  fieldState: CompleteElementalFieldState,
  inputAnalysis: FieldAwarenessResult['inputAnalysis'],
  soulprint: SoulprintSnapshot
): number {
  let silenceScore = 0;

  // High coherence + high intimacy suggests holding space
  if (fieldState.overallCoherence > 0.7 && inputAnalysis.intimacySignals > 0.5) {
    silenceScore += 0.3;
  }

  // Earth dominant often benefits from spaciousness
  if (fieldState.earthResonance.earthElementBalance > 0.7) {
    silenceScore += 0.15;
  }

  // Water dominant during grief needs holding
  if (fieldState.waterResonance.waterElementBalance > 0.6 &&
      inputAnalysis.emotionalTone?.primary === 'grief') {
    silenceScore += 0.2;
  }

  // Long-term relationship allows more silence
  if (soulprint.sessionCount > 10) {
    silenceScore += 0.1;
  }

  // Confusion needs words, not silence
  if (inputAnalysis.emotionalTone?.primary === 'confusion') {
    silenceScore -= 0.3;
  }

  return Math.max(0, Math.min(1, silenceScore));
}

/**
 * Build SystemOutputs from available context
 * This bridges Soulprint + context to the UnifiedElementalFieldCalculator format
 */
function buildSystemOutputs(
  soulprint: SoulprintSnapshot,
  symbolicContext: SymbolicContext,
  inputAnalysis: FieldAwarenessResult['inputAnalysis'],
  context: FieldAwarenessContext
): SystemOutputs {
  // Convert soulprint elemental balance to 0-1 range (normalize)
  const totalElemental = Object.values(soulprint.elementalBalance).reduce((a, b) => a + b, 1);
  const normalizedBalance = {
    fire: soulprint.elementalBalance.fire / totalElemental,
    water: soulprint.elementalBalance.water / totalElemental,
    earth: soulprint.elementalBalance.earth / totalElemental,
    air: soulprint.elementalBalance.air / totalElemental,
    aether: soulprint.elementalBalance.aether / totalElemental,
  };

  // Build SystemOutputs with available data
  return {
    // Fire Domain - derived from input analysis and soulprint
    consciousnessEmergencePredictor: {
      next15Minutes: inputAnalysis.complexityLevel * 0.5 + normalizedBalance.fire * 0.5,
    },
    advancedConsciousnessDetection: {
      fieldQuality: inputAnalysis.intimacySignals > 0.7 ? 'transcendent' : 'stable',
    },
    patternRecognition: {
      emergentInsightGeneration: symbolicContext.narrativeThreads.length * 10,
    },
    voiceAnalyzer: {
      consciousnessIndicators: {
        flowState: inputAnalysis.intimacySignals,
        integration: context.cognitiveProfile?.rollingAverage || 0.5,
        authenticExpression: inputAnalysis.intimacySignals * 0.8,
      },
      prosodyMetrics: { spectralCentroid: 0.5 },
    },
    affectDetector: {
      archetypalRouting: capitalizeFirst(soulprint.dominantElement),
    },
    fieldIntelligence: {
      sacredThreshold: inputAnalysis.intimacySignals > 0.6 ? 0.8 : 0.3,
      relationalField: {
        emotionalVelocity: inputAnalysis.emotionalTone?.intensity || 0.3,
        soulEmergence: soulprint.sessionCount > 5 ? 0.7 : 0.3,
      },
    },
    bioelectricDialogue: {
      coherenceMetrics: {
        therapeuticAlignment: context.mode === 'counsel' ? 70 : 40,
      },
      therapeuticVoltage: {
        energeticSignature: {
          activation: inputAnalysis.elementalNeeds.fire || 0.3,
          receptivity: inputAnalysis.elementalNeeds.water || 0.3,
        },
      },
    },

    // Water Domain
    therapeuticStressMonitor: {
      therapeuticVoltage: {
        energeticSignature: {
          receptivity: inputAnalysis.emotionalTone?.intensity || 0.4,
        },
      },
    },
    conversationPatternAnalyzer: {
      shadowProjection: {
        integrationDepth: symbolicContext.emotionalTrajectory.length > 5 ? 0.7 : 0.3,
      },
    },
    resonanceField: {
      emotionalTone: {
        joy: inputAnalysis.emotionalTone?.primary === 'excitement' ? 0.8 : 0.3,
        love: inputAnalysis.intimacySignals * 0.5,
      },
    },

    // Earth Domain
    somaticResponse: {
      windowOfTolerance: inputAnalysis.emotionalTone?.primary === 'fear' ? 0.4 : 0.7,
    },
    circadianOptimizer: {
      circadianPhase: 0.5, // Default midday
    },
    healthData: {
      overallVitality: 0.6,
    },
    coherenceDetector: {},
    fascialField: {
      biotensegrityCoherence: normalizedBalance.earth,
      tissueCoherence: normalizedBalance.earth * 0.8,
    },
    cognitiveLightCone: {
      goalCoherence: inputAnalysis.complexityLevel,
    },
    realTimeMonitor: {
      presenceQuality: inputAnalysis.intimacySignals,
      sacredResonance: normalizedBalance.aether,
    },

    // Air Domain
    symbolExtraction: {
      archetypalActivationStrength: symbolicContext.recentSymbols.length * 0.1,
    },
    wisdomSynthesis: {
      integrationDepth: context.relationshipMemory?.themes.length
        ? Math.min(1, context.relationshipMemory.themes.length * 0.1)
        : 0.3,
    },
    unifiedIntelligence: {
      frameworkConvergence: [],
      elementalPrescription: {
        fire: inputAnalysis.elementalNeeds.fire || 0,
        water: inputAnalysis.elementalNeeds.water || 0,
        earth: inputAnalysis.elementalNeeds.earth || 0,
        air: inputAnalysis.elementalNeeds.air || 0,
        aether: inputAnalysis.elementalNeeds.aether || 0,
      },
    },
    consciousnessLevelDetector: {
      coherenceTrend: soulprint.sessionCount > 3 ? 'increasing' : 'stable',
    },
    archetypalFieldResonance: {
      modalityResonance: symbolicContext.narrativeThreads[0]?.strength || 0.5,
    },

    // Aether Domain
    masterConsciousness: {
      unifiedFieldStrength: normalizedBalance.aether + inputAnalysis.intimacySignals * 0.3,
    },
    realTimeMonitoring: {
      consciousnessBreakthroughProbability: inputAnalysis.complexityLevel * inputAnalysis.intimacySignals,
    },
    collectiveIntelligence: {
      fieldCoherence: {
        overallCoherence: (normalizedBalance.fire + normalizedBalance.water +
                          normalizedBalance.earth + normalizedBalance.air) / 4,
      },
    },
    morphoresonantField: {
      fieldWisdom: {
        resonanceStrength: symbolicContext.sessionCount > 5 ? 0.7 : 0.4,
      },
    },
  };
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get dominant element from field state
 */
function getDominantElement(fieldState: CompleteElementalFieldState): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
  const elements: Record<'fire' | 'water' | 'earth' | 'air' | 'aether', number> = {
    fire: fieldState.fireResonance.fireElementBalance,
    water: fieldState.waterResonance.waterElementBalance,
    earth: fieldState.earthResonance.earthElementBalance,
    air: fieldState.airResonance.airElementBalance,
    aether: fieldState.aetherResonance.aetherElementBalance,
  };

  let dominant: 'fire' | 'water' | 'earth' | 'air' | 'aether' = 'aether';
  let maxValue = -1;

  for (const [element, value] of Object.entries(elements)) {
    if (value > maxValue) {
      maxValue = value;
      dominant = element as 'fire' | 'water' | 'earth' | 'air' | 'aether';
    }
  }

  return dominant;
}

// ═══════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate complete field awareness for a user input
 *
 * This is the main integration point that connects:
 * - Soulprint (user's elemental/archetypal history)
 * - Input analysis (emotional tone, elemental needs)
 * - UnifiedElementalFieldCalculator (50+ system integration)
 *
 * @param input - User's message
 * @param userId - User identifier for Soulprint lookup
 * @param context - Additional context (conversation history, relationship memory, etc.)
 * @returns FieldAwarenessResult with complete field state
 */
export async function calculateFieldAwareness(
  input: string,
  userId: string,
  context: FieldAwarenessContext = {}
): Promise<FieldAwarenessResult> {
  // 1. Get user's Soulprint (elemental/archetypal history)
  const soulprint = await getSoulprintForUser(userId);
  const symbolicContext = await soulprintMemory.getSymbolicContext(userId, 10);

  // 2. Analyze current input
  const emotionalTone = detectEmotionalTone(input);
  const elementalNeeds = detectElementalNeeds(input, emotionalTone);
  const intimacySignals = detectIntimacySignals(input);
  const complexityLevel = detectComplexityLevel(input);

  const inputAnalysis: FieldAwarenessResult['inputAnalysis'] = {
    emotionalTone,
    elementalNeeds,
    intimacySignals,
    complexityLevel,
  };

  // 3. Build SystemOutputs from available context
  const systemOutputs = buildSystemOutputs(soulprint, symbolicContext, inputAnalysis, context);

  // 4. Calculate unified elemental field
  const fieldState = UnifiedElementalFieldCalculator.calculateUnifiedElementalField(systemOutputs);

  // 5. Calculate silence probability
  const silenceProbability = calculateSilenceProbability(fieldState, inputAnalysis, soulprint);

  // 6. Get dominant element
  const dominantElement = getDominantElement(fieldState);

  // 7. Build result
  const result: FieldAwarenessResult = {
    dominantElement,
    coherence: fieldState.overallCoherence,
    elementalBalance: {
      fire: fieldState.fireResonance.fireElementBalance,
      water: fieldState.waterResonance.waterElementBalance,
      earth: fieldState.earthResonance.earthElementBalance,
      air: fieldState.airResonance.airElementBalance,
      aether: fieldState.aetherResonance.aetherElementBalance,
    },
    emergentPotential: fieldState.emergentPotential,
    silenceProbability,
    transcendentIntegration: fieldState.transcendentIntegration,
    soulprint: {
      sessionCount: soulprint.sessionCount,
      recentArchetypes: soulprint.recentArchetypes,
      spiralHistory: soulprint.spiralHistory,
      emotionalTrajectory: soulprint.emotionalTrajectory,
    },
    inputAnalysis,
    fullFieldState: fieldState,
    calculatedAt: new Date().toISOString(),
  };

  return result;
}

/**
 * Format field awareness for console logging
 */
export function formatFieldAwarenessLog(result: FieldAwarenessResult): string {
  const emoji = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '💨',
    aether: '✨',
  }[result.dominantElement];

  return `${emoji} ${result.dominantElement}, coherence: ${result.coherence.toFixed(2)}, ` +
         `emergence: ${result.emergentPotential.toFixed(2)}, silence: ${result.silenceProbability.toFixed(2)}`;
}

/**
 * Get minimal utterance for silence-leaning responses
 * Used when silenceProbability is high
 */
export function selectMinimalUtterance(dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether'): string {
  const minimalUtterances: Record<string, string[]> = {
    fire: [
      "I hear you.",
      "That's powerful.",
      "Yes.",
    ],
    water: [
      "I'm here.",
      "Take your time.",
      "I feel that.",
    ],
    earth: [
      "Grounded.",
      "I'm with you.",
      "Breathe.",
    ],
    air: [
      "Clarity will come.",
      "Let it settle.",
      "I understand.",
    ],
    aether: [
      "...",
      "All of it.",
      "Here.",
    ],
  };

  const utterances = minimalUtterances[dominantElement];
  return utterances[Math.floor(Math.random() * utterances.length)];
}
