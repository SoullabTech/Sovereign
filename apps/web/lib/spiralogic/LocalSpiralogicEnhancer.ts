/**
 * Enhanced AIN-Spiralogic Bridge with Local MAIA Integration
 *
 * Replaces keyword-based phase detection with AI-powered semantic analysis
 * while maintaining compatibility with existing Spiralogic architecture.
 */

import { maiaModelSystem } from '@/lib/models/maia-integration';
import {
  SpiralogicPhase,
  PhaseSignatures,
  detectSpiralogicPhase as detectSpiralogicPhaseRegex,
  getComplementaryPhase,
  getNextPhase
} from './PhaseDetector';
import { TriadicPhase, TriadicDetection } from './TriadicPhaseDetector';
import { AwarenessLevel } from '@/lib/ain/awareness-levels';

export interface EnhancedSpiralogicAnalysis {
  phaseDetection: {
    primary: SpiralogicPhase;
    secondary: SpiralogicPhase | null;
    confidence: number;
    reasoning: string;
    semanticIndicators: string[];
  };
  triadicAnalysis: {
    phase: TriadicPhase;
    elementalState: string;
    confidence: number;
    astrologicalAlignment: string;
    alchemicalProcess: string;
  };
  spiralJourney: {
    currentPosition: string;
    nextPhaseDirection: SpiralogicPhase;
    transformationReadiness: number;
    guidanceForNextStep: string;
    shadowElements: string[];
    integrationOpportunities: string[];
  };
  consciousness: {
    awarenessLevel: AwarenessLevel;
    spiralDepth: number; // 1-10 scale of spiral sophistication
    evolutionaryMoment: string;
    archetypalResonance: string[];
  };
  recommendations: {
    phaseWork: string[];
    practicesForPhase: string[];
    transitionSupport: string[];
    integrationFocus: string[];
  };
}

export interface LocalSpiralogicOptions {
  includeTriadic?: boolean;
  includeConsciousness?: boolean;
  includeShadowWork?: boolean;
  optimizeForSpeed?: boolean;
  fallbackToRegex?: boolean;
  useHybridAnalysis?: boolean;
}

/**
 * Enhanced Spiralogic phase detection using local MAIA semantic analysis
 */
export async function enhancedSpiralogicAnalysis(
  userText: string,
  context: {
    previousPhase?: SpiralogicPhase;
    awarenessLevel?: AwarenessLevel;
    sessionHistory?: string[];
  } = {},
  options: LocalSpiralogicOptions = {}
): Promise<EnhancedSpiralogicAnalysis> {

  const {
    includeTriadic = true,
    includeConsciousness = true,
    includeShadowWork = true,
    optimizeForSpeed = false,
    fallbackToRegex = true,
    useHybridAnalysis = true
  } = options;

  try {
    // Initialize MAIA model system
    await maiaModelSystem.initialize();

    // Create comprehensive spiral analysis prompt
    const analysisPrompt = `Analyze this message for Spiralogic elemental phase and spiral transformation dynamics.

Message: "${userText}"

Spiralogic 5-Phase System:
1. FIRE: Vision, passion, creation, initiation, catalytic energy, new beginnings
2. WATER: Emotion, depth, flow, transformation, healing, shadow work, surrender
3. EARTH: Grounding, structure, embodiment, practice, stability, manifestation
4. AIR: Mental clarity, perspective, insight, strategy, communication, understanding
5. AETHER: Integration, synthesis, unity, transcendence, spiritual awareness, wholeness

Triadic Alchemical Process within each element:
- CARDINAL: Initiation, ignition, beginning phase of element
- FIXED: Deepening, intensity, refinement under pressure
- MUTABLE: Release, adaptation, transmission to next phase

Context: ${context.previousPhase ? `Previous phase was ${context.previousPhase}` : 'No previous phase data'}
${context.awarenessLevel ? `User consciousness level: ${context.awarenessLevel}` : ''}

Analyze the text and respond with ONLY this JSON format:
{
  "primary_phase": "Fire|Water|Earth|Air|Aether",
  "secondary_phase": "Fire|Water|Earth|Air|Aether|null",
  "phase_confidence": 0.0-1.0,
  "reasoning": "Detailed explanation of phase assessment",
  "semantic_indicators": ["key phrases indicating this phase"],

  "triadic_phase": "cardinal|fixed|mutable",
  "elemental_state": "specific state within element",
  "triadic_confidence": 0.0-1.0,
  "astrological_alignment": "correlation with astrological modalities",
  "alchemical_process": "current alchemical transformation",

  "spiral_position": "description of where user is in their spiral journey",
  "next_phase_direction": "Fire|Water|Earth|Air|Aether",
  "transformation_readiness": 0.0-1.0,
  "guidance_for_next_step": "specific guidance for spiral evolution",
  "shadow_elements": ["shadow aspects present"],
  "integration_opportunities": ["integration work available"],

  "spiral_awareness_level": 1-5,
  "spiral_depth": 1-10,
  "evolutionary_moment": "description of current evolutionary stage",
  "archetypal_resonance": ["active archetypes"],

  "phase_work_recommendations": ["specific work for current phase"],
  "practices_for_phase": ["recommended practices"],
  "transition_support": ["support for phase transitions"],
  "integration_focus": ["key integration areas"]
}`;

    // Generate analysis using local MAIA model
    const response = await maiaModelSystem.generateResponse({
      content: analysisPrompt,
      consciousnessLevel: context.awarenessLevel || 4,
      userId: 'spiralogic-enhancer',
      context: {
        domain: 'spiralogic',
        source: 'phase-detection',
        analysisType: 'enhanced'
      }
    });

    // Parse the AI response
    let aiAnalysis;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.content;
      aiAnalysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.warn('Failed to parse AI spiralogic analysis:', parseError);

      if (fallbackToRegex) {
        console.log('🔄 Falling back to regex-based spiralogic detection');
        return await createHybridSpiralogicResult(userText, context, null, false);
      }

      throw new Error(`Failed to parse spiralogic analysis: ${parseError}`);
    }

    // Build enhanced analysis result
    const enhancedResult: EnhancedSpiralogicAnalysis = {
      phaseDetection: {
        primary: validateSpiralogicPhase(aiAnalysis.primary_phase),
        secondary: aiAnalysis.secondary_phase ? validateSpiralogicPhase(aiAnalysis.secondary_phase) : null,
        confidence: Math.min(Math.max(aiAnalysis.phase_confidence, 0), 1),
        reasoning: aiAnalysis.reasoning || 'AI semantic analysis',
        semanticIndicators: aiAnalysis.semantic_indicators || []
      },
      triadicAnalysis: {
        phase: validateTriadicPhase(aiAnalysis.triadic_phase),
        elementalState: aiAnalysis.elemental_state || 'unknown',
        confidence: Math.min(Math.max(aiAnalysis.triadic_confidence, 0), 1),
        astrologicalAlignment: aiAnalysis.astrological_alignment || 'unknown',
        alchemicalProcess: aiAnalysis.alchemical_process || 'unknown'
      },
      spiralJourney: {
        currentPosition: aiAnalysis.spiral_position || 'unknown',
        nextPhaseDirection: validateSpiralogicPhase(aiAnalysis.next_phase_direction),
        transformationReadiness: Math.min(Math.max(aiAnalysis.transformation_readiness, 0), 1),
        guidanceForNextStep: aiAnalysis.guidance_for_next_step || '',
        shadowElements: aiAnalysis.shadow_elements || [],
        integrationOpportunities: aiAnalysis.integration_opportunities || []
      },
      consciousness: {
        awarenessLevel: Math.min(Math.max(aiAnalysis.spiral_awareness_level, 1), 5) as AwarenessLevel,
        spiralDepth: Math.min(Math.max(aiAnalysis.spiral_depth, 1), 10),
        evolutionaryMoment: aiAnalysis.evolutionary_moment || 'unknown',
        archetypalResonance: aiAnalysis.archetypal_resonance || []
      },
      recommendations: {
        phaseWork: aiAnalysis.phase_work_recommendations || [],
        practicesForPhase: aiAnalysis.practices_for_phase || [],
        transitionSupport: aiAnalysis.transition_support || [],
        integrationFocus: aiAnalysis.integration_focus || []
      }
    };

    // Hybrid analysis: combine with regex if requested
    if (useHybridAnalysis) {
      return await createHybridSpiralogicResult(userText, context, enhancedResult, true);
    }

    return enhancedResult;

  } catch (error) {
    console.error('Enhanced spiralogic analysis error:', error);

    if (fallbackToRegex) {
      console.log('🔄 Falling back to regex-based spiralogic detection due to error');
      return await createHybridSpiralogicResult(userText, context, null, false);
    }

    throw error;
  }
}

/**
 * Create hybrid result combining local MAIA and regex analysis
 */
async function createHybridSpiralogicResult(
  userText: string,
  context: any,
  localResult: EnhancedSpiralogicAnalysis | null,
  combineResults: boolean
): Promise<EnhancedSpiralogicAnalysis> {

  // Get regex-based analysis as baseline
  const regexAnalysis = detectSpiralogicPhaseRegex(userText);

  if (!localResult || !combineResults) {
    // Pure regex fallback with enhanced structure
    return {
      phaseDetection: {
        primary: regexAnalysis.phase,
        secondary: null,
        confidence: regexAnalysis.confidence,
        reasoning: 'Regex keyword pattern matching (fallback)',
        semanticIndicators: regexAnalysis.matchedKeywords
      },
      triadicAnalysis: {
        phase: 'cardinal', // Default
        elementalState: 'unknown',
        confidence: 0.5,
        astrologicalAlignment: 'unknown',
        alchemicalProcess: 'pattern-based detection'
      },
      spiralJourney: {
        currentPosition: 'Basic phase detection',
        nextPhaseDirection: getNextPhase(regexAnalysis.phase),
        transformationReadiness: 0.5,
        guidanceForNextStep: 'Limited guidance available from keyword matching',
        shadowElements: [],
        integrationOpportunities: []
      },
      consciousness: {
        awarenessLevel: 3,
        spiralDepth: 3,
        evolutionaryMoment: 'Pattern-based assessment',
        archetypalResonance: []
      },
      recommendations: {
        phaseWork: [`Work with ${regexAnalysis.phase} energy`],
        practicesForPhase: [`Explore ${regexAnalysis.phase} practices`],
        transitionSupport: ['Limited regex-based support'],
        integrationFocus: ['Basic phase work']
      }
    };
  }

  // Combine local MAIA and regex results for validation
  const combinedConfidence = localResult.phaseDetection.confidence * 0.8 + regexAnalysis.confidence * 0.2;

  // Use AI result if confident, otherwise blend
  const finalPhase = localResult.phaseDetection.confidence > 0.6
    ? localResult.phaseDetection.primary
    : regexAnalysis.phase;

  return {
    ...localResult,
    phaseDetection: {
      ...localResult.phaseDetection,
      primary: finalPhase,
      confidence: combinedConfidence,
      reasoning: `Hybrid analysis: ${localResult.phaseDetection.reasoning} + regex validation`
    }
  };
}

/**
 * Quick spiralogic phase detection for real-time use
 */
export async function quickSpiralogicPhase(userText: string): Promise<SpiralogicPhase> {
  try {
    const result = await enhancedSpiralogicAnalysis(userText, {}, {
      includeTriadic: false,
      includeConsciousness: false,
      includeShadowWork: false,
      optimizeForSpeed: true,
      fallbackToRegex: true,
      useHybridAnalysis: false
    });

    return result.phaseDetection.primary;
  } catch (error) {
    console.warn('Quick spiralogic phase detection failed, using regex fallback');
    return detectSpiralogicPhaseRegex(userText).phase;
  }
}

/**
 * Temporal spiralogic analysis considering user's spiral evolution over time
 */
export async function temporalSpiralogicAnalysis(
  currentText: string,
  historicalTexts: string[] = [],
  sessionContext?: {
    userId: string;
    sessionId: string;
    timestamp: Date;
  }
): Promise<EnhancedSpiralogicAnalysis & {
  evolution: {
    phaseTrend: 'ascending' | 'cycling' | 'stable' | 'unknown';
    spiralDirection: 'inward' | 'outward' | 'stable';
    evolutionRate: number;
    predictedNextPhase: SpiralogicPhase;
    confidence: number;
  };
}> {

  // Analyze current state
  const currentAnalysis = await enhancedSpiralogicAnalysis(currentText, {}, {
    includeTriadic: true,
    includeConsciousness: true,
    includeShadowWork: true
  });

  // Analyze evolution if historical data available
  let evolution = {
    phaseTrend: 'unknown' as const,
    spiralDirection: 'stable' as const,
    evolutionRate: 0,
    predictedNextPhase: currentAnalysis.spiralJourney.nextPhaseDirection,
    confidence: 0.5
  };

  if (historicalTexts.length > 0) {
    try {
      const historicalPhases = await Promise.all(
        historicalTexts.slice(-5).map(text => quickSpiralogicPhase(text))
      );

      const phaseNumbers = {
        'Fire': 1, 'Water': 2, 'Earth': 3, 'Air': 4, 'Aether': 5
      };

      const currentPhaseNum = phaseNumbers[currentAnalysis.phaseDetection.primary];
      const avgHistorical = historicalPhases.reduce((sum, phase) => sum + phaseNumbers[phase], 0) / historicalPhases.length;

      const trendRate = (currentPhaseNum - avgHistorical) / historicalPhases.length;

      evolution = {
        phaseTrend: Math.abs(trendRate) < 0.2 ? 'stable' : trendRate > 0 ? 'ascending' : 'cycling',
        spiralDirection: currentAnalysis.consciousness.spiralDepth > 5 ? 'inward' : 'outward',
        evolutionRate: Math.abs(trendRate),
        predictedNextPhase: getNextPhase(currentAnalysis.phaseDetection.primary),
        confidence: Math.min(currentAnalysis.phaseDetection.confidence + 0.2, 1)
      };

    } catch (error) {
      console.warn('Temporal spiral analysis failed:', error);
    }
  }

  return {
    ...currentAnalysis,
    evolution
  };
}

// Helper validation functions
function validateSpiralogicPhase(phase: any): SpiralogicPhase {
  const validPhases: SpiralogicPhase[] = ['Fire', 'Water', 'Earth', 'Air', 'Aether'];
  return validPhases.includes(phase) ? phase : 'Aether';
}

function validateTriadicPhase(phase: any): TriadicPhase {
  const validTriadic: TriadicPhase[] = ['cardinal', 'fixed', 'mutable'];
  return validTriadic.includes(phase) ? phase : 'cardinal';
}

export { SpiralogicPhase, TriadicPhase, AwarenessLevel };