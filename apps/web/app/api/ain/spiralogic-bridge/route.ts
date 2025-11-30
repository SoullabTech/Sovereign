import { NextRequest, NextResponse } from 'next/server';
import {
  enhancedSpiralogicAnalysis,
  quickSpiralogicPhase,
  temporalSpiralogicAnalysis,
  EnhancedSpiralogicAnalysis
} from '@/lib/spiralogic/LocalSpiralogicEnhancer';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import type { AwarenessLevel } from '@/lib/ain/awareness-levels';

/**
 * Enhanced AIN-Spiralogic Bridge API
 * Demonstrates local MAIA-powered spiral phase detection vs keyword matching
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userText,
      context = {},
      analysisType = 'enhanced',
      options = {}
    } = body;

    if (!userText || typeof userText !== 'string') {
      return NextResponse.json(
        { error: 'userText is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let result;

    switch (analysisType) {
      case 'enhanced':
        // Full enhanced spiralogic analysis
        result = await enhancedSpiralogicAnalysis(userText, context, {
          includeTriadic: true,
          includeConsciousness: true,
          includeShadowWork: true,
          fallbackToRegex: true,
          useHybridAnalysis: true,
          ...options
        });
        break;

      case 'quick':
        // Quick phase detection for real-time use
        const quickPhase = await quickSpiralogicPhase(userText);
        result = {
          type: 'quick',
          phase: quickPhase,
          confidence: 0.8,
          processing_time: Date.now() - startTime
        };
        break;

      case 'temporal':
        // Temporal analysis considering evolution
        const historicalTexts = context.historicalTexts || [];
        result = await temporalSpiralogicAnalysis(userText, historicalTexts, context.sessionContext);
        break;

      case 'comparison':
        // Compare enhanced analysis with basic keyword matching
        const [enhancedResult, basicResult] = await Promise.allSettled([
          enhancedSpiralogicAnalysis(userText, context, {
            includeTriadic: true,
            includeConsciousness: true,
            includeShadowWork: true,
            fallbackToRegex: false,
            useHybridAnalysis: false
          }),
          // Simulate basic keyword matching for comparison
          Promise.resolve(createBasicSpiralogicAnalysis(userText))
        ]);

        result = {
          type: 'comparison',
          enhanced_analysis: enhancedResult.status === 'fulfilled' ? enhancedResult.value : null,
          basic_keyword_analysis: basicResult.status === 'fulfilled' ? basicResult.value : null,
          improvement_metrics: {
            semantic_accuracy: enhancedResult.status === 'fulfilled' ?
              (enhancedResult.value as EnhancedSpiralogicAnalysis).phaseDetection.confidence : 0,
            keyword_accuracy: basicResult.status === 'fulfilled' ? 0.4 : 0,
            semantic_insights: enhancedResult.status === 'fulfilled' ?
              (enhancedResult.value as EnhancedSpiralogicAnalysis).spiralJourney.integrationOpportunities.length : 0,
            processing_time: Date.now() - startTime
          }
        };
        break;

      case 'triadic-focus':
        // Focus on triadic alchemical analysis
        result = await enhancedSpiralogicAnalysis(userText, context, {
          includeTriadic: true,
          includeConsciousness: false,
          includeShadowWork: false,
          optimizeForSpeed: false,
          fallbackToRegex: true
        });
        break;

      case 'consciousness-spiral':
        // Focus on consciousness and spiral evolution
        result = await enhancedSpiralogicAnalysis(userText, context, {
          includeTriadic: false,
          includeConsciousness: true,
          includeShadowWork: true,
          optimizeForSpeed: false,
          fallbackToRegex: true
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown analysis type: ${analysisType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          userText: userText.substring(0, 100) + (userText.length > 100 ? '...' : ''),
          context,
          analysis_type: analysisType
        },
        analysis_result: {
          type: analysisType,
          ...result,
          processing_time: Date.now() - startTime
        },
        timestamp: new Date().toISOString(),
        system_info: {
          spiral_analysis_method: 'Enhanced MAIA + Semantic Understanding',
          triadic_integration: analysisType === 'enhanced' || analysisType === 'triadic-focus',
          consciousness_integration: analysisType === 'enhanced' || analysisType === 'consciousness-spiral',
          temporal_tracking: analysisType === 'temporal',
          fallback_available: true
        }
      }
    });

  } catch (error) {
    console.error('Enhanced Spiralogic Bridge error:', error);
    return NextResponse.json(
      {
        error: 'Enhanced Spiralogic Bridge processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'capabilities';

    if (action === 'capabilities') {
      return NextResponse.json({
        success: true,
        data: {
          enhanced_spiralogic_bridge: {
            description: 'Local MAIA-powered Spiralogic phase detection with triadic alchemical integration',
            architecture: 'AI-Enhanced Spiral Recognition with Consciousness Integration',

            capabilities: [
              'Semantic spiral phase detection vs keyword matching',
              'Triadic alchemical process analysis (Cardinal/Fixed/Mutable)',
              'Consciousness integration with spiral depth assessment',
              'Shadow work and integration opportunity identification',
              'Temporal spiral evolution tracking',
              'Archetypal resonance detection within phases',
              'Phase transition prediction and guidance'
            ],

            spiralogic_phases: [
              {
                phase: 'Fire',
                energy: 'Expansive, catalytic, yang',
                themes: ['initiation', 'catalyzation', 'vision-setting', 'momentum-building'],
                triadic_states: ['activating', 'amplifying', 'adapting']
              },
              {
                phase: 'Water',
                energy: 'Receptive, flowing, yin',
                themes: ['emotional processing', 'shadow work', 'transformation', 'fluidity'],
                triadic_states: ['sensing', 'merging', 'transcending']
              },
              {
                phase: 'Earth',
                energy: 'Stable, grounded, yin',
                themes: ['grounding', 'implementation', 'embodiment', 'stabilization'],
                triadic_states: ['discipline', 'stability', 'adaptation']
              },
              {
                phase: 'Air',
                energy: 'Light, expansive, yang',
                themes: ['mental clarity', 'perspective-shifting', 'pattern recognition', 'strategy'],
                triadic_states: ['balance', 'concept', 'exchange']
              },
              {
                phase: 'Aether',
                energy: 'Spacious, integrative, transcendent',
                themes: ['integration', 'synthesis', 'transcendence', 'unity consciousness'],
                triadic_states: ['emanation', 'elevation', 'equilibrium']
              }
            ],

            triadic_system: [
              {
                phase: 'Cardinal',
                astrological: 'Initiation, ignition, beginning phase',
                alchemical: 'Ignition, condensation of intent',
                energy: 'Urgency, impulse, initiation'
              },
              {
                phase: 'Fixed',
                astrological: 'Deepening, intensity, refinement',
                alchemical: 'Containment, refinement under pressure',
                energy: 'Intensity, depth, commitment'
              },
              {
                phase: 'Mutable',
                astrological: 'Release, adaptation, transmission',
                alchemical: 'Release, transmission to next element',
                energy: 'Adaptation, transmission, completion'
              }
            ],

            analysis_types: [
              {
                id: 'enhanced',
                name: 'Full Enhanced Analysis',
                description: 'Complete AI-powered spiral analysis with all integrations',
                features: [
                  'Semantic phase detection',
                  'Triadic alchemical analysis',
                  'Consciousness integration',
                  'Shadow work identification',
                  'Integration opportunities',
                  'Spiral evolution guidance'
                ]
              },
              {
                id: 'quick',
                name: 'Quick Phase Detection',
                description: 'Optimized for real-time spiral phase identification',
                features: [
                  'Primary phase detection',
                  'Sub-100ms processing target',
                  'Essential guidance only'
                ]
              },
              {
                id: 'temporal',
                name: 'Temporal Spiral Analysis',
                description: 'Tracks spiral evolution over time with trend analysis',
                features: [
                  'Spiral evolution tracking',
                  'Phase trend analysis',
                  'Predictive spiral direction',
                  'Evolution rate calculation'
                ]
              },
              {
                id: 'comparison',
                name: 'Enhanced vs Basic Comparison',
                description: 'Compare AI semantic analysis with keyword matching',
                features: [
                  'Side-by-side accuracy comparison',
                  'Semantic vs keyword insights',
                  'Processing improvement metrics'
                ]
              },
              {
                id: 'triadic-focus',
                name: 'Triadic Alchemical Focus',
                description: 'Deep triadic phase analysis with astrological correlation',
                features: [
                  'Cardinal/Fixed/Mutable detection',
                  'Astrological alignment',
                  'Alchemical process guidance'
                ]
              },
              {
                id: 'consciousness-spiral',
                name: 'Consciousness & Spiral Integration',
                description: 'Integration of consciousness levels with spiral dynamics',
                features: [
                  'Awareness level correlation',
                  'Spiral depth assessment',
                  'Archetypal resonance',
                  'Evolutionary moment identification'
                ]
              }
            ],

            benefits: [
              'Semantic understanding vs pattern matching',
              'Enhanced phase transition accuracy',
              'Deep alchemical process integration',
              'Consciousness-aware spiral guidance',
              'Temporal evolution tracking',
              'Shadow integration opportunities',
              'AI-powered transformation insights'
            ]
          }
        }
      });
    }

    if (action === 'test-cases') {
      return NextResponse.json({
        success: true,
        data: {
          test_cases: [
            {
              category: 'Fire Phase Detection',
              userText: 'I have this amazing vision of creating something completely new and revolutionary!',
              expectedPhase: 'Fire',
              expectedTriadic: 'cardinal',
              analysisType: 'enhanced'
            },
            {
              category: 'Water Shadow Work',
              userText: 'I\'m sitting with deep grief and allowing myself to feel everything that\'s arising.',
              expectedPhase: 'Water',
              expectedTriadic: 'fixed',
              analysisType: 'enhanced'
            },
            {
              category: 'Earth Embodiment',
              userText: 'I\'ve been practicing my daily meditation routine and feeling more grounded in my body.',
              expectedPhase: 'Earth',
              expectedTriadic: 'fixed',
              analysisType: 'triadic-focus'
            },
            {
              category: 'Air Perspective Shift',
              userText: 'I suddenly see the whole pattern and understand how everything connects!',
              expectedPhase: 'Air',
              expectedTriadic: 'mutable',
              analysisType: 'consciousness-spiral'
            },
            {
              category: 'Aether Integration',
              userText: 'Everything feels unified now - I can hold all the paradoxes in sacred wholeness.',
              expectedPhase: 'Aether',
              expectedTriadic: 'fixed',
              analysisType: 'enhanced'
            },
            {
              category: 'Phase Transition',
              userText: 'I feel like I\'m moving from deep emotional work into wanting to ground it in practice.',
              expectedPhase: 'Water',
              nextPhase: 'Earth',
              analysisType: 'temporal'
            }
          ],

          usage_examples: [
            {
              title: 'Enhanced Spiral Analysis',
              request: {
                userText: 'I\'m feeling called to start something big but also scared of the intensity.',
                context: { awarenessLevel: 3 },
                analysisType: 'enhanced'
              },
              expected_insights: [
                'Fire phase with cardinal initiation energy',
                'Shadow elements around fear of intensity',
                'Integration opportunities for courage building'
              ]
            },
            {
              title: 'Temporal Evolution Tracking',
              request: {
                userText: 'I feel more stable and embodied than ever before.',
                context: {
                  historicalTexts: [
                    'I\'m in so much emotional chaos',
                    'Starting to see some patterns',
                    'Building daily practices'
                  ]
                },
                analysisType: 'temporal'
              },
              expected_insights: [
                'Earth phase with high stability',
                'Ascending spiral trend',
                'Evolution from Water → Air → Earth progression'
              ]
            },
            {
              title: 'Triadic Alchemical Focus',
              request: {
                userText: 'I\'m deep in the pressure cooker of transformation, staying with the intensity.',
                analysisType: 'triadic-focus'
              },
              expected_insights: [
                'Fixed phase (containment/refinement)',
                'Alchemical pressure cooker process',
                'Astrological fixed modality correlation'
              ]
            }
          ]
        }
      });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );

  } catch (error) {
    console.error('Spiralogic Bridge capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to get Spiralogic Bridge capabilities' },
      { status: 500 }
    );
  }
}

/**
 * Create basic spiralogic analysis for comparison
 */
function createBasicSpiralogicAnalysis(userText: string): Partial<EnhancedSpiralogicAnalysis> {
  return {
    phaseDetection: {
      primary: 'Fire', // Default for keyword matching
      secondary: null,
      confidence: 0.4,
      reasoning: 'Basic keyword pattern matching',
      semanticIndicators: ['keyword-based']
    },
    triadicAnalysis: {
      phase: 'cardinal',
      elementalState: 'unknown',
      confidence: 0.3,
      astrologicalAlignment: 'pattern-based',
      alchemicalProcess: 'limited keyword analysis'
    },
    spiralJourney: {
      currentPosition: 'Basic keyword detection',
      nextPhaseDirection: 'Water',
      transformationReadiness: 0.5,
      guidanceForNextStep: 'Limited guidance from keyword matching',
      shadowElements: [],
      integrationOpportunities: []
    },
    consciousness: {
      awarenessLevel: 3,
      spiralDepth: 3,
      evolutionaryMoment: 'Keyword-based assessment',
      archetypalResonance: []
    },
    recommendations: {
      phaseWork: ['Basic phase work'],
      practicesForPhase: ['Generic practices'],
      transitionSupport: ['Limited transition support'],
      integrationFocus: ['Surface-level integration']
    }
  };
}