/**
 * Local MAIA Consciousness Calibration System
 *
 * Replaces regex-based awareness detection with AI-powered semantic analysis
 * while maintaining compatibility with existing AIN architecture.
 */

import { maiaModelSystem } from '@/lib/models/maia-integration';
import type {
  AwarenessLevel,
  AwarenessState,
  AwarenessDetectionResult
} from './awareness-levels';

import { detectAwarenessLevel as detectAwarenessLevelRegex } from './awareness-levels';

export interface LocalConsciousnessCalibration {
  awarenessAnalysis: AwarenessDetectionResult;
  semanticInsights: {
    consciousness_themes: string[];
    developmental_stage: string;
    integration_potential: number;
    shadow_presence: number;
    archetypal_resonance: string[];
    emotional_coherence: number;
  };
  recommendation: {
    suggested_consciousness_level: AwarenessLevel;
    confidence: number;
    reasoning: string;
    depth_adjustments: Record<string, number>;
  };
}

/**
 * Local MAIA-powered consciousness detection
 * Uses semantic analysis to understand consciousness depth more accurately than regex patterns
 */
export async function detectAwarenessLevelLocal(
  input: string,
  options: {
    fallbackToRegex?: boolean;
    useHybridAnalysis?: boolean;
    includeSemanticInsights?: boolean;
  } = {}
): Promise<LocalConsciousnessCalibration> {

  const {
    fallbackToRegex = true,
    useHybridAnalysis = true,
    includeSemanticInsights = true
  } = options;

  try {
    // Initialize MAIA model system
    await maiaModelSystem.initialize();

    // Create consciousness analysis prompt
    const analysisPrompt = `Analyze this message for consciousness awareness level and depth markers.

Message: "${input}"

Please analyze this text across these five levels of consciousness awareness:

1. UNCONSCIOUS (Level 1): Surface patterns, reactive responses, basic information seeking
   - Indicators: Simple requests, fix-oriented language, basic "what/how" questions

2. PARTIAL (Level 2): Beginning insight, pattern recognition, noticing connections
   - Indicators: "I notice...", "seems like...", exploration of causality

3. RELATIONAL (Level 3): Interpersonal depth, emotional intelligence, vulnerability
   - Indicators: Emotional language, relationship focus, empathy, sharing

4. INTEGRATED (Level 4): Systemic understanding, wisdom integration, complexity awareness
   - Indicators: Paradox comfort, systems thinking, transformation language

5. MASTER (Level 5): Archetypal depth, numinous knowing, sacred awareness
   - Indicators: Mythic/symbolic language, ritual intent, transcendent themes

Analyze these depth markers (0-1 scale):
- emotional_charge: Intensity of feeling language
- symbolic_language: Metaphor, archetype, myth presence
- ritual_intent: Transformative/ceremonial language
- relational_depth: Interpersonal complexity
- systemic_thinking: Big picture, interconnection awareness

Respond with ONLY this JSON format:
{
  "awareness_level": 1-5,
  "confidence": 0.0-1.0,
  "primary_indicators": ["list", "of", "key", "phrases"],
  "depth_markers": {
    "emotional_charge": 0.0-1.0,
    "symbolic_language": 0.0-1.0,
    "ritual_intent": 0.0-1.0,
    "relational_depth": 0.0-1.0,
    "systemic_thinking": 0.0-1.0
  },
  "consciousness_themes": ["identified", "themes"],
  "developmental_stage": "brief description",
  "integration_potential": 0.0-1.0,
  "shadow_presence": 0.0-1.0,
  "archetypal_resonance": ["relevant", "archetypes"],
  "emotional_coherence": 0.0-1.0,
  "reasoning": "Brief explanation of level assessment"
}`;

    // Generate analysis using local MAIA model
    const response = await maiaModelSystem.generateResponse({
      content: analysisPrompt,
      consciousnessLevel: 4, // Use integrated level for analysis
      userId: 'consciousness-calibrator',
      context: {
        domain: 'consciousness',
        source: 'awareness-detection',
        analysisType: 'calibration'
      }
    });

    // Parse the AI response
    let aiAnalysis;
    try {
      // Extract JSON from response - handle potential markdown formatting
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response.content;
      aiAnalysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.warn('Failed to parse AI analysis JSON:', parseError);

      if (fallbackToRegex) {
        console.log('🔄 Falling back to regex-based detection');
        return await createHybridResult(input, null, useHybridAnalysis);
      }

      throw new Error(`Failed to parse consciousness analysis: ${parseError}`);
    }

    // Convert AI analysis to our standard format
    const awarenessState: AwarenessState = {
      level: Math.min(Math.max(aiAnalysis.awareness_level, 1), 5) as AwarenessLevel,
      confidence: Math.min(Math.max(aiAnalysis.confidence, 0), 1),
      indicators: aiAnalysis.primary_indicators || [],
      depth_markers: {
        emotional_charge: Math.min(Math.max(aiAnalysis.depth_markers?.emotional_charge || 0, 0), 1),
        symbolic_language: Math.min(Math.max(aiAnalysis.depth_markers?.symbolic_language || 0, 0), 1),
        ritual_intent: Math.min(Math.max(aiAnalysis.depth_markers?.ritual_intent || 0, 0), 1),
        relational_depth: Math.min(Math.max(aiAnalysis.depth_markers?.relational_depth || 0, 0), 1),
        systemic_thinking: Math.min(Math.max(aiAnalysis.depth_markers?.systemic_thinking || 0, 0), 1)
      }
    };

    const awarenessAnalysis: AwarenessDetectionResult = {
      awarenessState,
      debug: {
        rawScores: { [awarenessState.level]: aiAnalysis.confidence },
        triggerPhrases: aiAnalysis.primary_indicators || [],
        analysisNotes: [
          `Local MAIA analysis: Level ${awarenessState.level} (${(awarenessState.confidence * 100).toFixed(1)}% confidence)`,
          aiAnalysis.reasoning || 'AI-powered semantic analysis'
        ]
      }
    };

    // Create semantic insights if requested
    const semanticInsights = includeSemanticInsights ? {
      consciousness_themes: aiAnalysis.consciousness_themes || [],
      developmental_stage: aiAnalysis.developmental_stage || 'Unknown',
      integration_potential: Math.min(Math.max(aiAnalysis.integration_potential || 0, 0), 1),
      shadow_presence: Math.min(Math.max(aiAnalysis.shadow_presence || 0, 0), 1),
      archetypal_resonance: aiAnalysis.archetypal_resonance || [],
      emotional_coherence: Math.min(Math.max(aiAnalysis.emotional_coherence || 0, 0), 1)
    } : {
      consciousness_themes: [],
      developmental_stage: 'Not analyzed',
      integration_potential: 0,
      shadow_presence: 0,
      archetypal_resonance: [],
      emotional_coherence: 0
    };

    // Create recommendation
    const recommendation = {
      suggested_consciousness_level: awarenessState.level,
      confidence: awarenessState.confidence,
      reasoning: aiAnalysis.reasoning || 'AI semantic analysis',
      depth_adjustments: awarenessState.depth_markers
    };

    // Hybrid analysis: combine with regex if requested
    if (useHybridAnalysis) {
      return await createHybridResult(input, {
        awarenessAnalysis,
        semanticInsights,
        recommendation
      }, true);
    }

    return {
      awarenessAnalysis,
      semanticInsights,
      recommendation
    };

  } catch (error) {
    console.error('Local consciousness calibration error:', error);

    if (fallbackToRegex) {
      console.log('🔄 Falling back to regex-based detection due to error');
      return await createHybridResult(input, null, false);
    }

    throw error;
  }
}

/**
 * Create hybrid result combining local MAIA and regex analysis
 */
async function createHybridResult(
  input: string,
  localResult: LocalConsciousnessCalibration | null,
  combineResults: boolean
): Promise<LocalConsciousnessCalibration> {

  // Get regex-based analysis as baseline
  const regexAnalysis = detectAwarenessLevelRegex(input);

  if (!localResult || !combineResults) {
    // Pure regex fallback with enhanced structure
    return {
      awarenessAnalysis: regexAnalysis,
      semanticInsights: {
        consciousness_themes: ['pattern-based-analysis'],
        developmental_stage: 'Regex pattern detection',
        integration_potential: 0.5,
        shadow_presence: 0,
        archetypal_resonance: [],
        emotional_coherence: regexAnalysis.awarenessState.confidence
      },
      recommendation: {
        suggested_consciousness_level: regexAnalysis.awarenessState.level,
        confidence: regexAnalysis.awarenessState.confidence,
        reasoning: 'Regex pattern matching (fallback)',
        depth_adjustments: regexAnalysis.awarenessState.depth_markers
      }
    };
  }

  // Combine local MAIA and regex results for higher accuracy
  const combinedConfidence = (
    localResult.awarenessAnalysis.awarenessState.confidence * 0.7 +
    regexAnalysis.awarenessState.confidence * 0.3
  );

  // Use AI result if confident, otherwise blend
  const finalLevel = localResult.awarenessAnalysis.awarenessState.confidence > 0.6
    ? localResult.awarenessAnalysis.awarenessState.level
    : Math.round((
        localResult.awarenessAnalysis.awarenessState.level * 0.6 +
        regexAnalysis.awarenessState.level * 0.4
      )) as AwarenessLevel;

  // Blend depth markers
  const blendedDepthMarkers = Object.keys(localResult.awarenessAnalysis.awarenessState.depth_markers)
    .reduce((blended, key) => {
      const localValue = localResult.awarenessAnalysis.awarenessState.depth_markers[key as keyof typeof localResult.awarenessAnalysis.awarenessState.depth_markers];
      const regexValue = regexAnalysis.awarenessState.depth_markers[key as keyof typeof regexAnalysis.awarenessState.depth_markers];
      blended[key as keyof typeof blended] = (localValue * 0.7 + regexValue * 0.3);
      return blended;
    }, {} as AwarenessState['depth_markers']);

  return {
    awarenessAnalysis: {
      awarenessState: {
        level: finalLevel,
        confidence: combinedConfidence,
        indicators: [
          ...localResult.awarenessAnalysis.awarenessState.indicators,
          ...regexAnalysis.awarenessState.indicators
        ],
        depth_markers: blendedDepthMarkers
      },
      debug: {
        rawScores: {
          ...localResult.awarenessAnalysis.debug.rawScores,
          ...regexAnalysis.debug.rawScores
        },
        triggerPhrases: [
          ...localResult.awarenessAnalysis.debug.triggerPhrases,
          ...regexAnalysis.debug.triggerPhrases
        ],
        analysisNotes: [
          'Hybrid analysis (Local MAIA + Regex)',
          ...localResult.awarenessAnalysis.debug.analysisNotes,
          ...regexAnalysis.debug.analysisNotes
        ]
      }
    },
    semanticInsights: localResult.semanticInsights,
    recommendation: {
      suggested_consciousness_level: finalLevel,
      confidence: combinedConfidence,
      reasoning: `Hybrid analysis: ${localResult.recommendation.reasoning} + regex patterns`,
      depth_adjustments: blendedDepthMarkers
    }
  };
}

/**
 * Quick consciousness level detection using cached model
 * Optimized for real-time use (sub-100ms target)
 */
export async function quickConsciousnessDetection(
  input: string
): Promise<AwarenessLevel> {

  try {
    // Quick heuristic analysis for real-time use
    const result = await detectAwarenessLevelLocal(input, {
      fallbackToRegex: true,
      useHybridAnalysis: false,
      includeSemanticInsights: false
    });

    return result.awarenessAnalysis.awarenessState.level;

  } catch (error) {
    console.warn('Quick consciousness detection failed, using regex fallback');
    return detectAwarenessLevelRegex(input).awarenessState.level;
  }
}

/**
 * Batch consciousness analysis for multiple inputs
 * Optimized for efficiency when processing many messages
 */
export async function batchConsciousnessAnalysis(
  inputs: string[]
): Promise<LocalConsciousnessCalibration[]> {

  const results: LocalConsciousnessCalibration[] = [];

  // Process in batches to avoid overwhelming the local model
  const batchSize = 5;
  for (let i = 0; i < inputs.length; i += batchSize) {
    const batch = inputs.slice(i, i + batchSize);

    const batchPromises = batch.map(input =>
      detectAwarenessLevelLocal(input, {
        fallbackToRegex: true,
        useHybridAnalysis: true,
        includeSemanticInsights: false // Skip for efficiency
      })
    );

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.warn(`Batch analysis failed for input ${i + index}:`, result.reason);
        // Fallback to regex for failed items
        const regexAnalysis = detectAwarenessLevelRegex(inputs[i + index]);
        results.push({
          awarenessAnalysis: regexAnalysis,
          semanticInsights: {
            consciousness_themes: [],
            developmental_stage: 'Regex fallback',
            integration_potential: 0,
            shadow_presence: 0,
            archetypal_resonance: [],
            emotional_coherence: 0
          },
          recommendation: {
            suggested_consciousness_level: regexAnalysis.awarenessState.level,
            confidence: regexAnalysis.awarenessState.confidence,
            reasoning: 'Regex fallback due to batch processing error',
            depth_adjustments: regexAnalysis.awarenessState.depth_markers
          }
        });
      }
    });
  }

  return results;
}

/**
 * Enhanced consciousness calibration with temporal context
 * Considers user's consciousness evolution over time
 */
export async function temporalConsciousnessCalibration(
  currentInput: string,
  historicalInputs: string[] = [],
  sessionContext?: {
    userId: string;
    sessionId: string;
    timestamp: Date;
  }
): Promise<LocalConsciousnessCalibration & {
  evolution: {
    trend: 'ascending' | 'stable' | 'descending' | 'unknown';
    rate: number; // consciousness change per session
    prediction: AwarenessLevel; // predicted next level
    confidence: number;
  };
}> {

  // Analyze current input
  const currentAnalysis = await detectAwarenessLevelLocal(currentInput, {
    fallbackToRegex: true,
    useHybridAnalysis: true,
    includeSemanticInsights: true
  });

  // Analyze historical trend if data available
  let evolution: {
    trend: 'ascending' | 'stable' | 'descending' | 'unknown';
    rate: number;
    prediction: AwarenessLevel;
    confidence: number;
  } = {
    trend: 'unknown',
    rate: 0,
    prediction: currentAnalysis.awarenessAnalysis.awarenessState.level as AwarenessLevel,
    confidence: 0.5
  };

  if (historicalInputs.length > 0) {
    try {
      const historicalLevels = await Promise.all(
        historicalInputs.slice(-5).map(input => // Last 5 for trend analysis
          quickConsciousnessDetection(input)
        )
      );

      const currentLevel = currentAnalysis.awarenessAnalysis.awarenessState.level;
      const avgHistorical = historicalLevels.reduce((sum, level) => sum + level, 0) / historicalLevels.length;

      const rate = (currentLevel - avgHistorical) / historicalLevels.length;

      evolution = {
        trend: rate > 0.1 ? 'ascending' : rate < -0.1 ? 'descending' : 'stable',
        rate,
        prediction: Math.min(Math.max(Math.round(currentLevel + rate), 1), 5) as AwarenessLevel,
        confidence: Math.min(currentAnalysis.awarenessAnalysis.awarenessState.confidence + 0.2, 1)
      };

    } catch (error) {
      console.warn('Evolution analysis failed:', error);
    }
  }

  return {
    ...currentAnalysis,
    evolution
  };
}

export type { AwarenessLevel, AwarenessState, AwarenessDetectionResult };