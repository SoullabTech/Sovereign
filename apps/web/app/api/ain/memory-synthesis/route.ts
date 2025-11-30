import { NextRequest, NextResponse } from 'next/server';
import {
  synthesizeSymbolicMemoryLocal,
  quickSymbolicSynthesis,
  LocalSymbolicAnalysis
} from '@/lib/memory/LocalSymbolicSynthesis';
import { detectAwarenessLevel } from '@/lib/ain/awareness-levels';
import type { AINMemoryPayload, SymbolicThread, EmotionalMotif } from '@/lib/memory/AINMemoryPayload';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';

/**
 * Local MAIA Memory Synthesis API
 * Demonstrates AI-powered symbolic memory processing vs regex-based analysis
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userText,
      analysisType = 'standard',
      memoryContext = {},
      options = {}
    } = body;

    if (!userText || typeof userText !== 'string') {
      return NextResponse.json(
        { error: 'userText is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Create mock memory payload for testing
    const mockMemory = createMockMemoryPayload(userText, memoryContext);

    let result;

    switch (analysisType) {
      case 'quick':
        // Quick synthesis for real-time use
        const quickResult = await quickSymbolicSynthesis(mockMemory, userText);
        result = {
          type: 'quick',
          ...quickResult,
          processing_time: Date.now() - startTime
        };
        break;

      case 'comparison':
        // Compare local MAIA vs regex symbolic processing
        const [localResult, fallbackResult] = await Promise.allSettled([
          synthesizeSymbolicMemoryLocal(mockMemory, userText, {
            useHybridAnalysis: false,
            includeDeepSemantics: true,
            optimizeForSpeed: false
          }),
          // Simulate regex-based fallback
          Promise.resolve(createMockRegexAnalysis(mockMemory, userText))
        ]);

        result = {
          type: 'comparison',
          local_maia: localResult.status === 'fulfilled' ? localResult.value : null,
          regex_baseline: fallbackResult.status === 'fulfilled' ? fallbackResult.value : null,
          performance: {
            local_processing_time: Date.now() - startTime,
            accuracy_improvement: localResult.status === 'fulfilled' ?
              localResult.value.synthesisQuality - 0.4 : 0 // 0.4 baseline for regex
          }
        };
        break;

      case 'deep':
        // Full deep semantic analysis
        const deepResult = await synthesizeSymbolicMemoryLocal(mockMemory, userText, {
          useHybridAnalysis: true,
          includeDeepSemantics: true,
          optimizeForSpeed: false,
          ...options
        });

        result = {
          type: 'deep',
          ...deepResult,
          processing_time: Date.now() - startTime
        };
        break;

      case 'standard':
      default:
        // Standard local MAIA symbolic synthesis
        const standardResult = await synthesizeSymbolicMemoryLocal(mockMemory, userText, {
          useHybridAnalysis: true,
          includeDeepSemantics: true,
          optimizeForSpeed: false,
          ...options
        });

        result = {
          type: 'standard',
          ...standardResult,
          processing_time: Date.now() - startTime
        };
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          userText: userText.substring(0, 100) + (userText.length > 100 ? '...' : ''),
          analysis_type: analysisType,
          memory_context: memoryContext
        },
        analysis_result: result,
        timestamp: new Date().toISOString(),
        model_info: {
          synthesis_method: 'Local MAIA + Semantic Analysis',
          fallback_available: true,
          deep_symbolic_analysis: analysisType === 'deep' || analysisType === 'standard'
        }
      }
    });

  } catch (error) {
    console.error('Memory synthesis error:', error);
    return NextResponse.json(
      {
        error: 'Memory synthesis failed',
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
          memory_synthesis: {
            description: 'Local MAIA-powered symbolic memory synthesis and analysis',
            architecture: 'AI-Enhanced Symbolic Processing with Semantic Understanding',

            capabilities: [
              'Semantic symbol detection vs pattern matching',
              'AI-powered phase transition prediction',
              'Enhanced internal reflection generation',
              'Symbolic relationship mapping',
              'Deep metaphorical analysis',
              'Consciousness depth assessment'
            ],

            analysis_types: [
              {
                id: 'standard',
                name: 'Standard Synthesis',
                description: 'Full AI symbolic analysis with hybrid validation',
                features: [
                  'Semantic symbol detection',
                  'Phase transition prediction',
                  'Internal reflection synthesis',
                  'Symbolic relationship mapping'
                ]
              },
              {
                id: 'quick',
                name: 'Quick Synthesis',
                description: 'Optimized for real-time use (sub-200ms target)',
                features: [
                  'Primary symbol extraction',
                  'Phase direction prediction',
                  'Emotional flow analysis',
                  'Confidence scoring'
                ]
              },
              {
                id: 'comparison',
                name: 'AI vs Regex Comparison',
                description: 'Compare local MAIA synthesis with regex baseline',
                features: [
                  'Side-by-side analysis comparison',
                  'Accuracy improvement metrics',
                  'Processing time analysis',
                  'Quality assessment'
                ]
              },
              {
                id: 'deep',
                name: 'Deep Symbolic Analysis',
                description: 'Comprehensive symbolic relationship and meaning analysis',
                features: [
                  'Hidden symbol detection',
                  'Archetypal resonance mapping',
                  'Unconscious element identification',
                  'Integration opportunity assessment',
                  'Symbolic narrative synthesis'
                ]
              }
            ],

            symbolic_processing: {
              detection_methods: [
                'Semantic weight analysis',
                'Contextual meaning extraction',
                'Archetypal resonance identification',
                'Emotional charge assessment',
                'Transformative potential evaluation'
              ],

              phase_analysis: [
                'Current phase alignment',
                'Transition likelihood calculation',
                'Emotional flow mapping',
                'Consciousness depth assessment',
                'Symbolic momentum tracking'
              ],

              relationship_mapping: [
                'Symbol interconnection analysis',
                'Pattern type identification',
                'Central symbol detection',
                'Narrative emergence synthesis'
              ]
            },

            benefits: [
              'Sub-200ms quick synthesis for real-time use',
              'Semantic understanding vs pattern matching',
              'Enhanced phase transition accuracy',
              'Deep symbolic relationship analysis',
              'AI-powered internal reflection generation',
              'Hybrid validation with regex fallback'
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
              category: 'Symbolic Depth',
              userText: 'I dreamed of a great tree with roots reaching deep underground and branches touching the stars.',
              expectedElements: ['Tree symbolism', 'Root/branch duality', 'Earth/sky connection', 'Growth metaphor'],
              analysisType: 'deep'
            },
            {
              category: 'Phase Transition',
              userText: 'I feel like I\'m moving from chaos into a new clarity, but I\'m not sure what comes next.',
              expectedElements: ['Transition state', 'Clarity emergence', 'Uncertainty', 'Movement'],
              analysisType: 'standard'
            },
            {
              category: 'Archetypal Content',
              userText: 'The wise woman in my vision spoke of transformation through the fire of truth.',
              expectedElements: ['Wise Woman archetype', 'Fire symbolism', 'Transformation theme', 'Truth seeking'],
              analysisType: 'deep'
            },
            {
              category: 'Emotional Synthesis',
              userText: 'I feel overwhelmed by all the changes, like I\'m drowning in possibility.',
              expectedElements: ['Overwhelm', 'Water metaphor', 'Possibility', 'Change stress'],
              analysisType: 'quick'
            },
            {
              category: 'Integration Challenge',
              userText: 'How do I hold both my scientific mind and my spiritual knowing without losing either?',
              expectedElements: ['Paradox holding', 'Duality integration', 'Scientific/spiritual bridge'],
              analysisType: 'comparison'
            }
          ],

          usage_examples: [
            {
              title: 'Quick Symbolic Synthesis',
              request: {
                userText: 'The mountain calls to me in my dreams.',
                analysisType: 'quick'
              },
              expected_output: {
                primarySymbols: ['mountain', 'dreams', 'calling'],
                phaseDirection: 'Earth',
                emotionalFlow: 'seeking',
                confidence: 0.8
              }
            },
            {
              title: 'Deep Symbolic Analysis',
              request: {
                userText: 'I see myself as both the phoenix rising from ashes and the seed planted in dark earth.',
                analysisType: 'deep',
                options: { includeDeepSemantics: true }
              },
              expected_output: {
                detectedSymbols: ['phoenix', 'ashes', 'seed', 'dark earth'],
                hiddenSymbols: ['rebirth', 'death/renewal cycle'],
                symbolicRelationships: 'Complementary transformation patterns',
                emergingNarrative: 'Death-rebirth cycle with dual transformation paths'
              }
            },
            {
              title: 'Phase Transition Analysis',
              request: {
                userText: 'After all this emotional processing, I feel ready for action and new beginnings.',
                analysisType: 'standard',
                memoryContext: { currentPhase: 'Water', exchangeCount: 15 }
              },
              expected_output: {
                phaseTransition: {
                  nextPhaseLikely: 'Fire',
                  confidence: 0.85,
                  emotionalFlow: { current: 'processed', emerging: 'activated', transition_catalyst: 'readiness' }
                }
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
    console.error('Memory synthesis capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to get memory synthesis capabilities' },
      { status: 500 }
    );
  }
}

/**
 * Create mock memory payload for testing
 */
function createMockMemoryPayload(userText: string, context: any): AINMemoryPayload {
  const currentPhase: SpiralogicPhase = context.currentPhase || 'Air';
  const exchangeCount = context.exchangeCount || 5;

  // Extract some basic symbols for mock context
  const words = userText.toLowerCase().split(' ');
  const mockSymbols: SymbolicThread[] = [
    { motif: 'journey', occurrences: 3, lastInvoked: new Date(Date.now() - 86400000) },
    { motif: 'light', occurrences: 2, lastInvoked: new Date(Date.now() - 172800000) },
    { motif: 'water', occurrences: 1, lastInvoked: new Date(Date.now() - 259200000) }
  ];

  // Detect awareness level for context
  const awarenessResult = detectAwarenessLevel(userText);

  const mockEmotionalMotifs: EmotionalMotif[] = [
    { theme: 'seeking', occurrences: [new Date()], intensity: 0.7 },
    { theme: 'uncertainty', occurrences: [new Date()], intensity: 0.5 }
  ];

  return {
    userId: context.userId || 'test-user',
    sessionId: context.sessionId || 'test-session',
    exchangeCount,
    currentPhase,
    spiralogicCycle: {
      progressPercent: context.progressPercent || 60,
      phaseHistory: ['Fire', 'Water', currentPhase],
      lastTransition: new Date(Date.now() - 3600000)
    },
    awarenessLevel: awarenessResult.awarenessState.level,
    symbolicThreads: mockSymbols,
    emotionalMotifs: mockEmotionalMotifs,
    conversationContext: userText,
    lastUpdated: new Date(),
    fieldResonance: context.fieldResonance || 0.6,
    coherenceLevel: context.coherenceLevel || 0.75
  };
}

/**
 * Create mock regex analysis for comparison
 */
function createMockRegexAnalysis(memory: AINMemoryPayload, userText: string): LocalSymbolicAnalysis {
  return {
    symbols: {
      detectedSymbols: [
        {
          symbol: 'pattern-based',
          semanticWeight: 0.4,
          contextualMeaning: 'Regex pattern detection',
          archetypalResonance: [],
          emotionalCharge: 0.3,
          transformativePoential: 0.3
        }
      ],
      hiddenSymbols: [],
      symbolicThemes: ['pattern-analysis'],
      metaphoricalDensity: 0.3
    },
    phaseTransition: {
      currentPhase: memory.currentPhase,
      nextPhaseLikely: 'Fire', // Default prediction
      confidence: 0.4, // Lower confidence for regex
      reasoning: 'Pattern-based phase prediction',
      timeToTransition: 5,
      semanticReasons: ['Pattern matching analysis'],
      emotionalFlow: {
        current: 'unknown',
        emerging: 'unknown',
        transition_catalyst: 'pattern-based'
      },
      symbolicMomentum: {
        direction: 'Fire',
        strength: 0.4,
        supporting_symbols: []
      },
      consciousness_depth: {
        level: 3,
        integration_readiness: 0.5,
        paradox_tension: 0.3
      }
    },
    internalReflection: {
      timestamp: new Date(),
      phaseContext: memory.currentPhase,
      observation: 'Pattern-based observation',
      symbolsNoticed: ['pattern'],
      emotionalUndercurrent: 'neutral',
      semanticDepth: 'Surface pattern analysis',
      emergingPatterns: ['regex-patterns'],
      unconsciousElements: [],
      integrationOpportunity: 'Limited pattern-based insights',
      recommendedResponse: {
        approach: 'gentle',
        elements: [],
        timing: 'immediate'
      }
    },
    symbolicRelationships: {
      connections: [],
      centralSymbol: null,
      emergingNarrative: 'Pattern-based analysis limitations'
    },
    synthesisQuality: 0.4 // Lower quality for regex baseline
  };
}