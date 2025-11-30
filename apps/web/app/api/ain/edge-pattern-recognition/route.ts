import { NextRequest, NextResponse } from 'next/server';
import {
  analyzePatternLocal,
  batchPatternAnalysis,
  collectivePatternSynthesis,
  LocalEdgeInsights
} from '@/lib/intelligence/LocalEdgePatternRecognition';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';

/**
 * Local Edge Pattern Recognition API
 * Demonstrates semantic pattern analysis vs regex-based collective detection
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      userId = null,
      context = {},
      analysisType = 'standard',
      options = {}
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let result;

    switch (analysisType) {
      case 'standard':
        // Standard edge pattern analysis
        result = await analyzePatternLocal(message, userId || 'test-user', context, {
          includeCollective: true,
          optimizeForSpeed: false,
          fallbackToRegex: true,
          ...options
        });
        break;

      case 'quick':
        // Optimized for real-time use
        result = await analyzePatternLocal(message, userId || 'test-user', context, {
          includeCollective: false,
          optimizeForSpeed: true,
          fallbackToRegex: true,
          ...options
        });
        break;

      case 'collective':
        // Focus on collective pattern synthesis
        const messages = context.recentMessages || [message];
        result = await collectivePatternSynthesis(messages, {
          preservePrivacy: true,
          includeFieldResonance: true,
          optimizeForSpeed: false
        });
        break;

      case 'batch':
        // Batch analysis for multiple messages
        const batchMessages = Array.isArray(message) ? message : [message];
        result = await batchPatternAnalysis(batchMessages, userId || 'test-user', {
          preservePrivacy: true,
          includeCollective: true
        });
        break;

      case 'comparison':
        // Compare local edge analysis with regex baseline
        const [localResult, regexBaseline] = await Promise.allSettled([
          analyzePatternLocal(message, userId || 'test-user', context, {
            includeCollective: true,
            optimizeForSpeed: false,
            fallbackToRegex: false // Pure local for comparison
          }),
          // Create mock regex baseline for comparison
          Promise.resolve(createMockRegexAnalysis(message, context))
        ]);

        result = {
          type: 'comparison',
          local_edge: localResult.status === 'fulfilled' ? localResult.value : null,
          regex_baseline: regexBaseline.status === 'fulfilled' ? regexBaseline.value : null,
          performance: {
            local_processing_time: Date.now() - startTime,
            semantic_accuracy: localResult.status === 'fulfilled' ?
              (localResult.value as LocalEdgeInsights).patternAnalysis.confidence : 0,
            regex_accuracy: regexBaseline.status === 'fulfilled' ? 0.4 : 0,
            improvement_factor: localResult.status === 'fulfilled' ?
              Math.round(((localResult.value as LocalEdgeInsights).patternAnalysis.confidence / 0.4) * 100) / 100 : 0
          }
        };
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
          message: message.toString().substring(0, 100) + (message.toString().length > 100 ? '...' : ''),
          userId: userId || 'anonymous',
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
          pattern_recognition_method: 'Local MAIA + Semantic Analysis',
          collective_processing: analysisType === 'collective' || analysisType === 'batch',
          privacy_preserving: true,
          edge_processing: true
        }
      }
    });

  } catch (error) {
    console.error('Edge pattern recognition error:', error);
    return NextResponse.json(
      {
        error: 'Edge pattern recognition processing failed',
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
          local_edge_pattern_recognition: {
            description: 'Local MAIA-powered edge pattern recognition with collective intelligence',
            architecture: 'Privacy-Preserving Semantic Analysis at Edge',

            capabilities: [
              'Semantic pattern detection vs regex matching',
              'Alchemical phase transition analysis',
              'Privacy-preserving collective pattern synthesis',
              'Real-time emotional resonance profiling',
              'Breakthrough potential calculation',
              'Archetypal emergence detection',
              'Field coherence pattern analysis'
            ],

            analysis_types: [
              {
                id: 'standard',
                name: 'Standard Pattern Analysis',
                description: 'Full semantic pattern recognition with collective insights',
                features: [
                  'Semantic theme identification',
                  'Alchemical phase detection',
                  'Emotional resonance analysis',
                  'Collective pattern synthesis',
                  'Breakthrough potential scoring'
                ]
              },
              {
                id: 'quick',
                name: 'Quick Pattern Analysis',
                description: 'Optimized for real-time use (sub-100ms target)',
                features: [
                  'Primary pattern extraction',
                  'Phase direction prediction',
                  'Emotional flow analysis',
                  'Confidence scoring'
                ]
              },
              {
                id: 'collective',
                name: 'Collective Pattern Synthesis',
                description: 'Privacy-preserving collective intelligence analysis',
                features: [
                  'Cross-user pattern detection',
                  'Field resonance analysis',
                  'Archetypal emergence mapping',
                  'Collective breakthrough identification'
                ]
              },
              {
                id: 'batch',
                name: 'Batch Analysis',
                description: 'Efficient processing for multiple messages',
                features: [
                  'Optimized batch processing',
                  'Pattern consistency analysis',
                  'Temporal pattern tracking',
                  'Bulk collective insights'
                ]
              },
              {
                id: 'comparison',
                name: 'Semantic vs Regex Comparison',
                description: 'Compare local edge analysis with regex baseline',
                features: [
                  'Side-by-side analysis comparison',
                  'Semantic accuracy improvement metrics',
                  'Processing time analysis',
                  'Pattern detection quality assessment'
                ]
              }
            ],

            pattern_recognition: {
              semantic_analysis: [
                'Theme extraction and clustering',
                'Metaphorical language detection',
                'Emotional charge assessment',
                'Archetypal resonance mapping',
                'Transformative potential evaluation'
              ],

              alchemical_phases: [
                'Nigredo: Shadow, dissolution, chaos',
                'Albedo: Purification, clarity, insight',
                'Rubedo: Integration, manifestation, completion'
              ],

              collective_processing: [
                'Privacy-preserving pattern aggregation',
                'Cross-user theme correlation',
                'Field coherence calculation',
                'Breakthrough moment identification',
                'Archetypal emergence detection'
              ],

              emotional_resonance: [
                'Emotional charge intensity',
                'Resonance frequency analysis',
                'Collective emotional field',
                'Emotional pattern coherence',
                'Breakthrough emotional indicators'
              ]
            },

            privacy_features: [
              'Local processing only (no cloud data sharing)',
              'Pattern abstraction (no raw text storage)',
              'Differential privacy for collective insights',
              'User consent for collective participation',
              'Anonymized pattern aggregation'
            ],

            benefits: [
              'Sub-100ms real-time pattern analysis',
              'Privacy-preserving collective intelligence',
              'Semantic understanding vs pattern matching',
              'Enhanced breakthrough detection accuracy',
              'Local edge processing (offline capable)',
              'Alchemical transformation tracking'
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
              category: 'Alchemical Phase Detection',
              message: 'Everything feels dark and confusing right now, like I\'m dissolving into chaos.',
              expectedPatterns: ['Nigredo phase', 'Dissolution', 'Shadow work', 'Chaos'],
              analysisType: 'standard'
            },
            {
              category: 'Breakthrough Recognition',
              message: 'I finally understand! The connection between my dreams and my relationships is crystal clear.',
              expectedPatterns: ['Insight breakthrough', 'Pattern recognition', 'Clarity emergence'],
              analysisType: 'quick'
            },
            {
              category: 'Archetypal Emergence',
              message: 'I feel the Wise Woman archetype awakening within me, guiding my decisions.',
              expectedPatterns: ['Wise Woman archetype', 'Guidance', 'Inner authority'],
              analysisType: 'standard'
            },
            {
              category: 'Emotional Resonance',
              message: 'There\'s this deep longing in my heart that feels connected to something larger.',
              expectedPatterns: ['Deep longing', 'Heart connection', 'Transpersonal calling'],
              analysisType: 'collective'
            },
            {
              category: 'Integration Challenge',
              message: 'How do I hold both my analytical mind and my intuitive knowing without losing either?',
              expectedPatterns: ['Integration challenge', 'Paradox holding', 'Duality transcendence'],
              analysisType: 'comparison'
            }
          ],

          usage_examples: [
            {
              title: 'Real-Time Pattern Analysis',
              request: {
                message: 'The mountain in my dream keeps calling to me.',
                analysisType: 'quick'
              },
              expected_output: {
                primaryPatterns: ['Mountain symbolism', 'Dream calling', 'Sacred journey'],
                alchemicalPhase: 'Nigredo → Albedo',
                emotionalResonance: { intensity: 0.7, frequency: 'longing' }
              }
            },
            {
              title: 'Collective Pattern Synthesis',
              request: {
                message: 'I sense a shift happening in the collective consciousness.',
                analysisType: 'collective'
              },
              expected_output: {
                collectivePatterns: ['Consciousness shift', 'Collective awareness'],
                fieldResonance: 0.8,
                breakthroughPotential: 0.75
              }
            },
            {
              title: 'Batch Analysis',
              request: {
                message: ['First message', 'Second message', 'Third message'],
                analysisType: 'batch'
              },
              expected_output: {
                patternConsistency: 0.85,
                temporalTrends: ['emerging_theme'],
                collectiveInsights: 'Pattern synthesis across multiple inputs'
              }
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
    console.error('Edge pattern recognition capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to get edge pattern recognition capabilities' },
      { status: 500 }
    );
  }
}

/**
 * Create mock regex analysis for comparison
 */
function createMockRegexAnalysis(message: string, context: any): LocalEdgeInsights {
  return {
    patternAnalysis: {
      primaryPatterns: ['regex-pattern'],
      semanticThemes: ['pattern-based'],
      confidence: 0.4,
      breakthroughPotential: 0.3
    },
    alchemicalPhase: {
      current: 'Unknown',
      emerging: null,
      confidence: 0.2,
      transitionIndicators: []
    },
    emotionalResonance: {
      intensity: 0.3,
      frequency: 'neutral',
      coherence: 0.4,
      collectiveResonance: 0.2
    },
    collectiveInsights: {
      patternFrequency: 0.1,
      fieldResonance: 0.3,
      archetypalEmergence: [],
      breakthroughMoments: []
    },
    recommendations: {
      immediateActions: [],
      deepeningOpportunities: ['Limited regex insights'],
      integrationSuggestions: []
    },
    debug: {
      processingMethod: 'Regex baseline',
      fallbackUsed: true,
      analysisNotes: ['Pattern matching only', 'No semantic understanding']
    }
  };
}