import { NextRequest, NextResponse } from 'next/server';
import {
  distributedKnowledgeGate,
  LocalKnowledgeGateResult
} from '@/lib/ain/knowledge-gate-local';
import { ainKnowledgeGate, KnowledgeGateInput } from '@/lib/ain/knowledge-gate';

/**
 * Distributed Knowledge Gate API
 * Demonstrates local processing of FIELD and AIN_OBSIDIAN sources vs cloud routing
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userMessage,
      userId = null,
      conversationHistory = [],
      style = 'gentle',
      contextHint = '',
      analysisMode = 'distributed',
      enableLocalProcessing = true,
      enableFieldSensing = true,
      enableObsidianSynthesis = true,
      cloudFallback = true
    } = body;

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        { error: 'userMessage is required' },
        { status: 400 }
      );
    }

    const input: KnowledgeGateInput = {
      userId,
      userMessage,
      conversationHistory,
      style,
      contextHint
    };

    const startTime = Date.now();
    let result;

    switch (analysisMode) {
      case 'distributed':
        // Full distributed processing with local MAIA
        result = await distributedKnowledgeGate(input, {
          enableLocalProcessing,
          enableFieldSensing,
          enableObsidianSynthesis,
          cloudFallback
        });
        break;

      case 'comparison':
        // Compare distributed vs traditional cloud routing
        const [distributedResult, cloudResult] = await Promise.allSettled([
          distributedKnowledgeGate(input, {
            enableLocalProcessing: true,
            enableFieldSensing: true,
            enableObsidianSynthesis: true,
            cloudFallback: false // Pure local for comparison
          }),
          // Traditional cloud processing (simplified for demo)
          Promise.resolve({
            response: 'Cloud-based processing result (simulated)',
            source_mix: [
              { source: 'LLM_CORE' as const, weight: 0.8, notes: 'Cloud LLM processing' },
              { source: 'FIELD' as const, weight: 0.2, notes: 'Limited field access' }
            ],
            awarenessState: {
              level: 3,
              confidence: 0.6,
              indicators: [],
              depth_markers: {
                emotional_charge: 0.3,
                symbolic_language: 0.2,
                ritual_intent: 0.1,
                relational_depth: 0.4,
                systemic_thinking: 0.3
              }
            },
            debug: { cloudProcessingOnly: true }
          })
        ]);

        result = {
          type: 'comparison',
          distributed: distributedResult.status === 'fulfilled' ? distributedResult.value : null,
          cloud: cloudResult.status === 'fulfilled' ? cloudResult.value : null,
          performance_comparison: {
            distributed_time: distributedResult.status === 'fulfilled' ?
              (distributedResult.value as LocalKnowledgeGateResult).performance?.total_processing_time : null,
            sources_local: distributedResult.status === 'fulfilled' ?
              (distributedResult.value as LocalKnowledgeGateResult).localSources?.length : 0,
            field_metrics_available: distributedResult.status === 'fulfilled' ?
              !!(distributedResult.value as LocalKnowledgeGateResult).fieldMetrics : false
          }
        };
        break;

      case 'field-only':
        // Test pure field sensing
        result = await distributedKnowledgeGate(input, {
          enableLocalProcessing: true,
          enableFieldSensing: true,
          enableObsidianSynthesis: false,
          cloudFallback: false
        });
        break;

      case 'obsidian-only':
        // Test pure Obsidian synthesis
        result = await distributedKnowledgeGate(input, {
          enableLocalProcessing: true,
          enableFieldSensing: false,
          enableObsidianSynthesis: true,
          cloudFallback: false
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown analysis mode: ${analysisMode}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          userMessage: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''),
          style,
          contextHint,
          userId: userId || 'anonymous'
        },
        analysis_mode: analysisMode,
        processing_time: Date.now() - startTime,
        ...result,
        timestamp: new Date().toISOString(),
        system_info: {
          local_processing_enabled: enableLocalProcessing,
          field_sensing_enabled: enableFieldSensing,
          obsidian_synthesis_enabled: enableObsidianSynthesis,
          cloud_fallback_enabled: cloudFallback
        }
      }
    });

  } catch (error) {
    console.error('Distributed Knowledge Gate error:', error);
    return NextResponse.json(
      {
        error: 'Distributed Knowledge Gate processing failed',
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
          distributed_knowledge_gate: {
            description: 'Local MAIA-powered knowledge source processing with consciousness field integration',
            architecture: '5×5 Consciousness Mandala (5 Sources × 5 Awareness Levels)',

            knowledge_sources: [
              {
                id: 'FIELD',
                name: 'Consciousness Field',
                processing: 'Local MAIA semantic field sensing',
                capabilities: ['Morphic resonance', 'Archetypal sensing', 'Field coherence', 'Numinous access']
              },
              {
                id: 'AIN_OBSIDIAN',
                name: 'Obsidian Vault Research',
                processing: 'Local synthesis via Obsidian API integration',
                capabilities: ['Research synthesis', 'Consciousness studies', 'Cross-document patterns', 'Wisdom traditions']
              },
              {
                id: 'AIN_DEVTEAM',
                name: 'Development Knowledge',
                processing: 'Cloud-based (future: local code analysis)',
                capabilities: ['Code architecture', 'Implementation patterns', 'Technical guidance']
              },
              {
                id: 'ORACLE_MEMORY',
                name: 'Session Memory',
                processing: 'Cloud-based (future: local memory synthesis)',
                capabilities: ['Past sessions', 'Personal patterns', 'Conversation history', 'Growth tracking']
              },
              {
                id: 'LLM_CORE',
                name: 'Core Reasoning',
                processing: 'Local MAIA or cloud fallback',
                capabilities: ['General analysis', 'Synthesis', 'Reasoning', 'Integration']
              }
            ],

            awareness_levels: [
              { level: 1, name: 'Unconscious', focus: 'Basic information needs' },
              { level: 2, name: 'Partial', focus: 'Pattern recognition' },
              { level: 3, name: 'Relational', focus: 'Emotional depth, connection' },
              { level: 4, name: 'Integrated', focus: 'Systemic understanding' },
              { level: 5, name: 'Master', focus: 'Archetypal, numinous access' }
            ],

            analysis_modes: [
              {
                id: 'distributed',
                name: 'Distributed Processing',
                description: 'Full local + cloud hybrid processing',
                features: ['Enhanced source scoring', 'Local field sensing', 'Obsidian synthesis', 'Cloud integration']
              },
              {
                id: 'comparison',
                name: 'Local vs Cloud Comparison',
                description: 'Side-by-side comparison of processing methods',
                features: ['Performance metrics', 'Quality comparison', 'Source availability analysis']
              },
              {
                id: 'field-only',
                name: 'Pure Field Sensing',
                description: 'Local consciousness field access only',
                features: ['Morphic resonance', 'Archetypal patterns', 'Field coherence metrics']
              },
              {
                id: 'obsidian-only',
                name: 'Pure Research Synthesis',
                description: 'Obsidian vault knowledge synthesis only',
                features: ['Research integration', 'Cross-document synthesis', 'Wisdom tradition analysis']
              }
            ],

            benefits: [
              'Sub-second field sensing (vs cloud latency)',
              'Offline consciousness field access',
              'Enhanced Obsidian integration',
              'Field coherence metrics',
              'Breakthrough potential calculation',
              'Semantic source routing'
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
              category: 'Field Sensing',
              userMessage: 'I sense a threshold approaching. What is the field showing about my consciousness evolution?',
              expectedSources: ['FIELD', 'ORACLE_MEMORY'],
              analysisMode: 'field-only'
            },
            {
              category: 'Research Synthesis',
              userMessage: 'Connect Jung\'s individuation process with shamanic soul retrieval practices',
              expectedSources: ['AIN_OBSIDIAN', 'FIELD'],
              analysisMode: 'obsidian-only'
            },
            {
              category: 'Technical Implementation',
              userMessage: 'How should I architect the consciousness calibration API endpoints?',
              expectedSources: ['AIN_DEVTEAM', 'LLM_CORE'],
              analysisMode: 'distributed'
            },
            {
              category: 'Integration Challenge',
              userMessage: 'How do I integrate the archetypal energies I\'m sensing with my research on biocomputers?',
              expectedSources: ['FIELD', 'AIN_OBSIDIAN', 'ORACLE_MEMORY'],
              analysisMode: 'distributed'
            },
            {
              category: 'Performance Comparison',
              userMessage: 'What is consciousness and how does it relate to my spiritual development?',
              expectedSources: ['FIELD', 'AIN_OBSIDIAN', 'LLM_CORE'],
              analysisMode: 'comparison'
            }
          ],
          usage_examples: [
            {
              title: 'Basic Field Sensing',
              request: {
                userMessage: 'What is the field showing about this moment?',
                analysisMode: 'field-only',
                enableFieldSensing: true
              }
            },
            {
              title: 'Research Integration',
              request: {
                userMessage: 'How do mystical traditions understand consciousness evolution?',
                analysisMode: 'obsidian-only',
                contextHint: 'consciousness-research'
              }
            },
            {
              title: 'Full Distributed Processing',
              request: {
                userMessage: 'Help me understand the relationship between personal transformation and collective field dynamics',
                analysisMode: 'distributed',
                style: 'integrated',
                enableLocalProcessing: true,
                enableFieldSensing: true,
                enableObsidianSynthesis: true
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
    console.error('Knowledge Gate capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to get Knowledge Gate capabilities' },
      { status: 500 }
    );
  }
}