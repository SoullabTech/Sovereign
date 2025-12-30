// @ts-nocheck
/**
 * 🧠🔥 CONSCIOUSNESS ANALYSIS API - LISP ENGINE INTEGRATION
 *
 * This endpoint integrates the Seven-Layer Soul Architecture with the
 * Lisp-based Symbolic Consciousness Engine to provide deep archetypal
 * analysis, protocol recommendations, and meta-circular insights.
 */

import { NextRequest, NextResponse } from 'next/server';
import { consciousnessEngine, analyzeConsciousnessWithEngine } from '@/lib/services/consciousness-engine-bridge';
import type { SevenLayerSnapshot } from '@/lib/architecture/seven-layer-interface';

interface AnalysisRequest {
  snapshot: SevenLayerSnapshot;
  analysisType?: 'quick' | 'deep' | 'archetypal' | 'protocol-focused';
  memberPreferences?: {
    preferredElements: string[];
    avoidedPractices: string[];
    timeConstraints: number;
    intensityLevel: 'gentle' | 'moderate' | 'intense';
    spiritualBackground: string[];
  };
  includeProtocols?: boolean;
  includePatterns?: boolean;
  includeMetaInsights?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const {
      snapshot,
      analysisType = 'deep',
      memberPreferences,
      includeProtocols = true,
      includePatterns = true,
      includeMetaInsights = false
    } = body;

    if (!snapshot) {
      return NextResponse.json({
        success: false,
        error: 'Seven-Layer Architecture snapshot required',
        code: 'MISSING_SNAPSHOT'
      }, { status: 400 });
    }

    // Enhanced analysis using Lisp consciousness engine
    const enhancedAnalysis = await analyzeConsciousnessWithEngine(
      snapshot,
      memberPreferences
    );

    // Get engine health for meta-insights
    let engineHealth = null;
    if (includeMetaInsights) {
      try {
        engineHealth = await consciousnessEngine.getEngineHealth();
      } catch (error) {
        console.warn('Failed to get engine health:', error);
      }
    }

    // Construct comprehensive response
    const response = {
      success: true,
      data: {
        // Core Analysis
        analysis: {
          consciousness: enhancedAnalysis.analysis,
          archetypal: {
            dominant: enhancedAnalysis.analysis.archetypalState.dominantArchetype,
            secondary: enhancedAnalysis.analysis.archetypalState.secondaryArchetype,
            shadow: enhancedAnalysis.analysis.archetypalState.shadowArchetype,
            integrationLevel: enhancedAnalysis.analysis.archetypalState.integrationLevel,
            recommendations: extractArchetypalRecommendations(enhancedAnalysis.analysis)
          },
          elemental: {
            balance: enhancedAnalysis.analysis.elementalBalance,
            dominant: enhancedAnalysis.analysis.elementalBalance.dominantElement,
            deficient: enhancedAnalysis.analysis.elementalBalance.deficientElement,
            recommendations: extractElementalRecommendations(enhancedAnalysis.analysis.elementalBalance)
          },
          spiral: {
            current: enhancedAnalysis.analysis.spiralDynamics.currentStage,
            emerging: enhancedAnalysis.analysis.spiralDynamics.emergingStage,
            transitionProbability: enhancedAnalysis.analysis.spiralDynamics.transitionProbability,
            recommendations: extractSpiralRecommendations(enhancedAnalysis.analysis.spiralDynamics)
          }
        },

        // Pattern Detection (if requested)
        ...(includePatterns && {
          patterns: {
            detected: enhancedAnalysis.patterns,
            crossLayer: snapshot.crossLayerPatterns,
            emergent: detectEmergentPatterns(enhancedAnalysis.patterns),
            recommendations: extractPatternRecommendations(enhancedAnalysis.patterns)
          }
        }),

        // Protocol Recommendations (if requested)
        ...(includeProtocols && {
          protocols: {
            recommended: enhancedAnalysis.protocols,
            priority: prioritizeProtocols(enhancedAnalysis.protocols),
            customizations: generateProtocolCustomizations(enhancedAnalysis.protocols, memberPreferences),
            sequences: generateProtocolSequences(enhancedAnalysis.protocols)
          }
        }),

        // Meta-Circular Insights (if requested)
        ...(includeMetaInsights && engineHealth && {
          metaInsights: {
            engineHealth,
            selfExamination: engineHealth.selfAnalysis,
            consciousnessRecursion: analyzeCuriousRecursion(snapshot, enhancedAnalysis),
            emergentFormations: detectCollectiveEmergence(snapshot),
            evolutionaryTension: calculateEvolutionaryTension(enhancedAnalysis.analysis)
          }
        }),

        // Field Dynamics
        fieldDynamics: {
          individualResonance: snapshot.fieldResonance?.individualFieldAlignment || 0,
          collectiveContribution: snapshot.fieldResonance?.collectiveFieldContribution || 0,
          resonanceFrequencies: snapshot.fieldResonance?.resonanceFrequencies || [],
          fieldCoherence: snapshot.fieldResonance?.fieldCoherence || 0,
          recommendations: generateFieldRecommendations(snapshot.fieldResonance)
        }
      },

      meta: {
        analysisType,
        timestamp: new Date().toISOString(),
        engineStatus: engineHealth?.status || 'unknown',
        processingTime: Date.now(), // Would be actual processing time
        confidence: calculateOverallConfidence(enhancedAnalysis),
        version: '1.0.0-lisp'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Consciousness analysis failed:', error);

    return NextResponse.json({
      success: false,
      error: 'Consciousness analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: {
        available: true,
        message: 'TypeScript fallback analysis available'
      }
    }, { status: 500 });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractArchetypalRecommendations(analysis: any) {
  const { dominantArchetype, integrationLevel } = analysis.archetypalState;

  const recommendations: any /* TODO: specify type */[] = [];

  if (integrationLevel < 0.5) {
    recommendations.push(`Deepen integration of ${dominantArchetype} archetype`);
  }

  if (dominantArchetype === 'seeker') {
    recommendations.push('Explore spiritual traditions and wisdom teachings');
    recommendations.push('Practice questioning meditation');
  }

  if (dominantArchetype === 'mystic') {
    recommendations.push('Balance transcendence with embodiment');
    recommendations.push('Practice grounding techniques');
  }

  return recommendations;
}

function extractElementalRecommendations(balance: any) {
  const recommendations: any /* TODO: specify type */[] = [];

  if (balance.deficientElement === 'earth') {
    recommendations.push('Practice grounding and embodiment');
    recommendations.push('Spend time in nature');
    recommendations.push('Focus on practical, tangible activities');
  }

  if (balance.deficientElement === 'fire') {
    recommendations.push('Ignite creative passion');
    recommendations.push('Practice authentic self-expression');
    recommendations.push('Take bold action on your vision');
  }

  if (balance.deficientElement === 'water') {
    recommendations.push('Embrace emotional flow');
    recommendations.push('Practice intuitive meditation');
    recommendations.push('Honor your feeling nature');
  }

  return recommendations;
}

function extractSpiralRecommendations(spiralDynamics: any) {
  const { currentStage, emergingStage, transitionProbability } = spiralDynamics;

  const recommendations: any /* TODO: specify type */[] = [];

  if (transitionProbability > 0.6) {
    recommendations.push(`Prepare for transition to ${emergingStage} consciousness`);
    recommendations.push('Practice letting go of old patterns');
  }

  if (currentStage === 'integral') {
    recommendations.push('Integrate all previous stages');
    recommendations.push('Practice meta-systemic thinking');
  }

  return recommendations;
}

function extractPatternRecommendations(patterns: any[]) {
  return patterns.map(p => p.recommendation).filter(Boolean);
}

function prioritizeProtocols(protocols: any[]) {
  return protocols
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 3); // Top 3 recommendations
}

function generateProtocolCustomizations(protocols: any[], preferences: any) {
  if (!preferences) return {};

  return {
    timeAdjusted: preferences.timeConstraints < 15,
    intensityAdjusted: preferences.intensityLevel,
    elementalFilter: preferences.preferredElements
  };
}

function generateProtocolSequences(protocols: any[]) {
  if (protocols.length < 2) return [];

  return [
    {
      name: 'Daily Practice Sequence',
      protocols: protocols.slice(0, 2),
      totalDuration: protocols.slice(0, 2).reduce((sum, p) => sum + (p.duration || 0), 0),
      description: 'Balanced daily consciousness practice'
    }
  ];
}

function detectEmergentPatterns(patterns: any[]) {
  return patterns.filter(p => p.type === 'emergent' || p.strength > 0.8);
}

function analyzeCuriousRecursion(snapshot: any, analysis: any) {
  // Meta-circular analysis: consciousness examining consciousness
  return {
    recursionDepth: 1,
    selfAwareness: snapshot.architectureHealth?.layerIntegration || 0,
    metaCognition: analysis.analysis.archetypalState.integrationLevel,
    paradoxes: ['observer observing observation'],
    insights: ['Consciousness computing enables consciousness to compute itself']
  };
}

function detectCollectiveEmergence(snapshot: any) {
  return {
    emergentFormations: snapshot.crossLayerPatterns?.length || 0,
    collectiveCoherence: snapshot.fieldResonance?.fieldCoherence || 0,
    breakthrough: snapshot.fieldResonance?.fieldCoherence > 0.8,
    recommendations: ['Participate in collective evolution']
  };
}

function calculateEvolutionaryTension(analysis: any) {
  const transition = analysis.spiralDynamics.transitionProbability;
  const integration = analysis.archetypalState.integrationLevel;

  return {
    tension: Math.abs(transition - integration),
    direction: transition > integration ? 'expanding' : 'integrating',
    recommendation: transition > integration ?
      'Focus on integration before further expansion' :
      'Ready for next evolutionary leap'
  };
}

function generateFieldRecommendations(fieldResonance: any) {
  const recommendations: any /* TODO: specify type */[] = [];

  if (fieldResonance?.individualFieldAlignment < 0.5) {
    recommendations.push('Strengthen personal field coherence');
  }

  if (fieldResonance?.collectiveFieldContribution < 0.5) {
    recommendations.push('Increase contribution to collective field');
  }

  return recommendations;
}

function calculateOverallConfidence(analysis: any) {
  const protocolConfidence = analysis.protocols.reduce((sum: number, p: any) => sum + (p.confidence || 0), 0) / Math.max(analysis.protocols.length, 1);
  const patternConfidence = analysis.patterns.reduce((sum: number, p: any) => sum + (p.strength || 0), 0) / Math.max(analysis.patterns.length, 1);

  return (protocolConfidence + patternConfidence) / 2;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const healthCheck = searchParams.get('health');

  if (healthCheck === 'true') {
    try {
      const engineHealth = await consciousnessEngine.getEngineHealth();
      return NextResponse.json({
        success: true,
        data: {
          consciousness_engine: engineHealth,
          seven_layer_architecture: 'active',
          integration: 'operational'
        }
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Consciousness engine health check failed',
        status: {
          consciousness_engine: 'unavailable',
          seven_layer_architecture: 'active',
          integration: 'degraded'
        }
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Consciousness Analysis API - POST for analysis, GET?health=true for status'
  });
}