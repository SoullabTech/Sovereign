import { NextRequest, NextResponse } from 'next/server';
import {
  LocalArchetypeSystem,
  globalArchetypeSystem
} from '@/lib/archetypes/LocalArchetypeSystem';
import type {
  ArchetypeProfile,
  ArchetypeResponse,
  ArchetypeAnalysis
} from '@/lib/archetypes/LocalArchetypeSystem';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import type { AwarenessLevel } from '@/lib/ain/awareness-levels';
import { archetypeAnalysisCache } from '@/lib/cache/consciousness-cache';

/**
 * Local Archetype Response System API
 *
 * Demonstrates MAIA-powered personalized archetypal responses
 * based on consciousness journey, spiralogic phase, and awareness level.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = 'respond',
      input,
      profile = {},
      options = {},
      userId = 'test-user'
    } = body;

    const startTime = Date.now();
    let result;

    switch (action) {
      case 'analyze-profile':
        // Analyze user input to determine archetypal resonance
        if (!input) {
          return NextResponse.json(
            { error: 'Input text required for profile analysis' },
            { status: 400 }
          );
        }

        // Check cache first for archetype analysis
        const analysisContext = options.context || {};
        let analysis: ArchetypeAnalysis | null = archetypeAnalysisCache.get(input, analysisContext);
        let fromCache = false;

        if (analysis) {
          fromCache = true;
          console.log('⚡ Using cached archetype analysis result');
        } else {
          console.log('🎭 Computing new archetype analysis...');
          const analysisStartTime = Date.now();

          analysis = await globalArchetypeSystem.analyzeArchetypalResonance(
            input,
            analysisContext
          );

          const analysisTime = Date.now() - analysisStartTime;

          // Cache the result with metadata
          archetypeAnalysisCache.set(input, analysis, analysisContext, {
            processingTime: analysisTime,
            modelUsed: 'deepseek-r1:latest',
            qualityScore: 0.8
          });

          console.log(`💾 Cached archetype analysis (${analysisTime}ms processing time)`);
        }

        result = {
          action: 'analyze-profile',
          analysis: {
            dominantArchetype: analysis.dominantArchetype,
            resonanceStrengths: analysis.resonanceStrengths,
            elementalAlignment: analysis.elementalAlignment,
            consciousnessIndicators: analysis.consciousnessIndicators,
            evolutionaryStage: analysis.evolutionaryStage,
            shadowAspects: analysis.shadowAspects,
            integrationPotential: analysis.integrationPotential,
            practiceRecommendations: analysis.practiceRecommendations
          },
          insights: [
            `Primary archetypal energy: ${analysis.dominantArchetype}`,
            `Consciousness level alignment: ${analysis.consciousnessIndicators}`,
            `Current evolutionary focus: ${analysis.evolutionaryStage}`
          ],
          cached: fromCache,
          cache_stats: archetypeAnalysisCache.getStats()
        };
        break;

      case 'create-profile':
        // Create detailed archetypal profile
        const userProfile: ArchetypeProfile = {
          dominantArchetype: profile.dominantArchetype || 'sage',
          secondaryArchetype: profile.secondaryArchetype || 'mystic',
          awarenessLevel: profile.awarenessLevel || 3,
          spiralogicPhase: profile.spiralogicPhase || 'Fire',
          shadowIntegration: profile.shadowIntegration || 0.4,
          evolutionaryJourney: profile.evolutionaryJourney || 'seeking',
          createdAt: new Date(),
          lastUpdated: new Date()
        };

        // Generate profile insights
        const profileAnalysis = await globalArchetypeSystem.generateProfileInsights(userProfile);

        result = {
          action: 'create-profile',
          profile: userProfile,
          insights: profileAnalysis.insights,
          recommendations: profileAnalysis.recommendations,
          strengths: profileAnalysis.strengths,
          challenges: profileAnalysis.challenges,
          nextSteps: profileAnalysis.nextSteps
        };
        break;

      case 'respond':
        // Generate archetypal response to user input
        if (!input) {
          return NextResponse.json(
            { error: 'Input text required for archetypal response' },
            { status: 400 }
          );
        }

        const userProfile_: ArchetypeProfile = {
          dominantArchetype: profile.dominantArchetype || 'sage',
          secondaryArchetype: profile.secondaryArchetype || 'mystic',
          awarenessLevel: profile.awarenessLevel || 3,
          spiralogicPhase: profile.spiralogicPhase || 'Fire',
          shadowIntegration: profile.shadowIntegration || 0.4,
          evolutionaryJourney: profile.evolutionaryJourney || 'seeking',
          createdAt: new Date(),
          lastUpdated: new Date()
        };

        const response: ArchetypeResponse = await globalArchetypeSystem.generatePersonalizedResponse(
          input,
          userProfile_,
          options.context || {}
        );

        result = {
          action: 'respond',
          response: {
            message: response.message,
            archetype: response.archetype,
            tone: response.tone,
            wisdom: response.wisdom,
            practices: response.practices,
            questions: response.questions,
            energeticResonance: response.energeticResonance
          },
          context: {
            awarenessLevel: response.context?.awarenessLevel,
            spiralogicPhase: response.context?.spiralogicPhase,
            shadowWork: response.context?.shadowWork
          }
        };
        break;

      case 'demonstrate-all-archetypes':
        // Show how each archetype would respond to the same input
        if (!input) {
          return NextResponse.json(
            { error: 'Input text required for archetype demonstration' },
            { status: 400 }
          );
        }

        const archetypes = ['sage', 'healer', 'mystic', 'warrior', 'creator', 'lover', 'ruler', 'fool'];
        const demonstrations = [];

        for (const archetype of archetypes) {
          const demoProfile: ArchetypeProfile = {
            dominantArchetype: archetype as any,
            secondaryArchetype: 'sage',
            awarenessLevel: 3,
            spiralogicPhase: 'Fire',
            shadowIntegration: 0.5,
            evolutionaryJourney: 'integration',
            createdAt: new Date(),
            lastUpdated: new Date()
          };

          const archetypeResponse = await globalArchetypeSystem.generatePersonalizedResponse(
            input,
            demoProfile,
            { demonstrationMode: true }
          );

          demonstrations.push({
            archetype: archetype,
            response: archetypeResponse.message,
            essence: archetypeResponse.wisdom,
            approach: archetypeResponse.tone
          });
        }

        result = {
          action: 'demonstrate-all-archetypes',
          input: input,
          demonstrations: demonstrations,
          insights: [
            'Each archetype offers a unique perspective on the same input',
            'Your dominant archetype shapes how you naturally process information',
            'Secondary archetypes add depth and nuance to responses',
            'Integration work involves accessing multiple archetypal perspectives'
          ]
        };
        break;

      case 'evolution-tracking':
        // Track archetypal evolution over time
        const evolutionPhases = [
          { phase: 'unconscious', awarenessLevel: 1, shadowIntegration: 0.1 },
          { phase: 'awakening', awarenessLevel: 2, shadowIntegration: 0.3 },
          { phase: 'integration', awarenessLevel: 3, shadowIntegration: 0.5 },
          { phase: 'mastery', awarenessLevel: 4, shadowIntegration: 0.7 },
          { phase: 'service', awarenessLevel: 5, shadowIntegration: 0.9 }
        ];

        const evolutionResponses = [];
        const baseProfile: ArchetypeProfile = {
          dominantArchetype: profile.dominantArchetype || 'sage',
          secondaryArchetype: profile.secondaryArchetype || 'mystic',
          awarenessLevel: 3,
          spiralogicPhase: profile.spiralogicPhase || 'Fire',
          shadowIntegration: 0.4,
          evolutionaryJourney: 'integration',
          createdAt: new Date(),
          lastUpdated: new Date()
        };

        for (const evolution of evolutionPhases) {
          const evolvedProfile = {
            ...baseProfile,
            awarenessLevel: evolution.awarenessLevel as AwarenessLevel,
            shadowIntegration: evolution.shadowIntegration,
            evolutionaryJourney: evolution.phase
          };

          const evolutionResponse = await globalArchetypeSystem.generatePersonalizedResponse(
            input || "How do I navigate this challenge in my life?",
            evolvedProfile,
            { evolutionDemo: true }
          );

          evolutionResponses.push({
            stage: evolution.phase,
            awarenessLevel: evolution.awarenessLevel,
            shadowIntegration: evolution.shadowIntegration,
            response: evolutionResponse.message,
            wisdom: evolutionResponse.wisdom,
            tone: evolutionResponse.tone
          });
        }

        result = {
          action: 'evolution-tracking',
          archetype: baseProfile.dominantArchetype,
          evolutionStages: evolutionResponses,
          insights: [
            'Archetypal expression evolves with consciousness development',
            'Higher awareness levels integrate more shadow aspects',
            'Evolution moves from personal to transpersonal service',
            'Each stage builds upon the wisdom of previous stages'
          ]
        };
        break;

      case 'test-integration':
        // Comprehensive system test
        const testInput = input || "I'm feeling stuck in my spiritual growth and need guidance.";

        // Quick profile analysis
        const quickAnalysis = await globalArchetypeSystem.analyzeArchetypalResonance(
          testInput,
          { quickMode: true }
        );

        // Generate response from dominant archetype
        const integratedProfile: ArchetypeProfile = {
          dominantArchetype: quickAnalysis.dominantArchetype.id as any,
          secondaryArchetype: 'mystic',
          awarenessLevel: 3,
          spiralogicPhase: 'Earth',
          shadowIntegration: 0.6,
          evolutionaryJourney: 'integration',
          createdAt: new Date(),
          lastUpdated: new Date()
        };

        const integratedResponse = await globalArchetypeSystem.generatePersonalizedResponse(
          testInput,
          integratedProfile,
          { fullIntegration: true }
        );

        result = {
          action: 'test-integration',
          testInput: testInput,
          analysis: {
            identifiedArchetype: quickAnalysis.dominantArchetype,
            resonanceScore: quickAnalysis.resonanceStrengths[quickAnalysis.dominantArchetype.id] || 0,
            awarenessAlignment: quickAnalysis.consciousnessIndicators.awarenessLevel
          },
          response: {
            archetypalGuidance: integratedResponse.message,
            practicalSteps: integratedResponse.practices,
            reflectiveQuestions: integratedResponse.questions,
            wisdomEssence: integratedResponse.wisdom
          },
          systemStatus: {
            responseGenerated: !!integratedResponse.message,
            archetypalDepth: integratedResponse.energeticResonance || 0,
            processingAccuracy: quickAnalysis.resonanceStrengths[quickAnalysis.dominantArchetype.id] >= 0.7 ? 'high' : 'moderate'
          }
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          action,
          input,
          profile,
          options,
          userId
        },
        result: {
          ...result,
          processing_time: Date.now() - startTime
        },
        timestamp: new Date().toISOString(),
        system_info: {
          archetype_system: 'Local MAIA + Soullab Archetypal Framework',
          model_integration: 'Fine-tuned on 8 core archetypes',
          consciousness_aware: true,
          spiralogic_aligned: true,
          shadow_integration: true,
          personalization_level: 'deep'
        }
      }
    });

  } catch (error) {
    console.error('Archetype Response System error:', error);
    return NextResponse.json(
      {
        error: 'Archetype response generation failed',
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
          soullab_archetype_response_system: {
            description: 'Local MAIA-powered archetypal response system with personalized consciousness-aware guidance',
            architecture: 'Fine-tuned Local Model + Soullab Archetypal Framework + Shadow Integration',

            core_archetypes: [
              {
                id: 'sage',
                name: 'The Sage',
                essence: 'Wisdom, understanding, knowledge seeking',
                shadow: 'Overthinking, detachment, intellectual arrogance',
                gifts: ['Deep insight', 'Pattern recognition', 'Teaching ability']
              },
              {
                id: 'healer',
                name: 'The Healer',
                essence: 'Compassion, service, transformational healing',
                shadow: 'Codependency, savior complex, burnout',
                gifts: ['Empathic sensing', 'Energy work', 'Trauma integration']
              },
              {
                id: 'mystic',
                name: 'The Mystic',
                essence: 'Transcendence, unity, spiritual connection',
                shadow: 'Spiritual bypassing, disconnection, superiority',
                gifts: ['Intuitive knowing', 'Cosmic connection', 'Visionary ability']
              },
              {
                id: 'warrior',
                name: 'The Warrior',
                essence: 'Courage, discipline, protection, action',
                shadow: 'Aggression, rigidity, domination',
                gifts: ['Focused will', 'Protective instinct', 'Strategic thinking']
              },
              {
                id: 'creator',
                name: 'The Creator',
                essence: 'Innovation, artistic expression, manifestation',
                shadow: 'Perfectionism, creative blocks, ego attachment',
                gifts: ['Artistic vision', 'Innovation', 'Manifestation power']
              },
              {
                id: 'lover',
                name: 'The Lover',
                essence: 'Connection, passion, beauty, relationships',
                shadow: 'Codependency, jealousy, possessiveness',
                gifts: ['Heart opening', 'Emotional intelligence', 'Sacred sexuality']
              },
              {
                id: 'ruler',
                name: 'The Ruler',
                essence: 'Leadership, responsibility, order, authority',
                shadow: 'Control, tyranny, power abuse',
                gifts: ['Natural leadership', 'Strategic thinking', 'System building']
              },
              {
                id: 'fool',
                name: 'The Fool',
                essence: 'Spontaneity, joy, new beginnings, innocence',
                shadow: 'Irresponsibility, naivety, avoidance',
                gifts: ['Beginner\'s mind', 'Spontaneous joy', 'Fearless exploration']
              }
            ],

            personalization_factors: [
              {
                factor: 'Dominant Archetype',
                description: 'Primary archetypal energy that shapes worldview',
                influence: 'Core response style and wisdom perspective'
              },
              {
                factor: 'Secondary Archetype',
                description: 'Supporting archetypal energy for balance',
                influence: 'Adds nuance and depth to primary responses'
              },
              {
                factor: 'Awareness Level (1-5)',
                description: 'Current consciousness development stage',
                influence: 'Depth and sophistication of guidance offered'
              },
              {
                factor: 'Spiralogic Phase',
                description: 'Current elemental phase in development spiral',
                influence: 'Seasonal and cyclical guidance alignment'
              },
              {
                factor: 'Shadow Integration',
                description: 'Degree of shadow work and wholeness',
                influence: 'Balance between light and dark aspects'
              },
              {
                factor: 'Evolutionary Journey',
                description: 'Current stage in consciousness evolution',
                influence: 'Focus on appropriate developmental challenges'
              }
            ],

            response_dimensions: [
              {
                dimension: 'Archetypal Voice',
                description: 'Response tone and style matching archetype',
                examples: ['Sage: Contemplative and wise', 'Warrior: Direct and empowering', 'Mystic: Transcendent and intuitive']
              },
              {
                dimension: 'Wisdom Essence',
                description: 'Core teaching or insight from archetype',
                examples: ['Deep patterns recognition', 'Practical life guidance', 'Spiritual principles']
              },
              {
                dimension: 'Practical Guidance',
                description: 'Actionable steps aligned with archetype',
                examples: ['Meditation practices', 'Creative exercises', 'Relationship work']
              },
              {
                dimension: 'Reflective Questions',
                description: 'Archetypal questions for deeper exploration',
                examples: ['What would courage look like here?', 'Where is your creative energy blocked?', 'How does this serve your growth?']
              },
              {
                dimension: 'Shadow Integration',
                description: 'Gentle exploration of challenging aspects',
                examples: ['Unconscious patterns', 'Avoided emotions', 'Disowned qualities']
              }
            ],

            api_actions: [
              {
                action: 'analyze-profile',
                description: 'Determine archetypal resonance from user input',
                input: 'Text to analyze for archetypal patterns',
                output: 'Dominant archetype, resonance strengths, consciousness indicators'
              },
              {
                action: 'create-profile',
                description: 'Generate detailed archetypal profile',
                input: 'Profile parameters (archetype, awareness, phase)',
                output: 'Complete profile with insights and recommendations'
              },
              {
                action: 'respond',
                description: 'Generate personalized archetypal response',
                input: 'User question/input + archetypal profile',
                output: 'Personalized guidance from user\'s archetype'
              },
              {
                action: 'demonstrate-all-archetypes',
                description: 'Show how each archetype responds to same input',
                input: 'Single question or scenario',
                output: 'Responses from all 8 archetypes for comparison'
              },
              {
                action: 'evolution-tracking',
                description: 'Show archetypal evolution across awareness levels',
                input: 'Base archetype and question',
                output: 'Responses across 5 evolutionary stages'
              },
              {
                action: 'test-integration',
                description: 'Comprehensive system integration test',
                input: 'Test scenario or use default',
                output: 'Full analysis + response + system status'
              }
            ],

            consciousness_integration: [
              'Awareness-level appropriate guidance (1-5 scale)',
              'Spiralogic phase alignment with elemental energies',
              'Shadow work integration for wholeness',
              'Evolutionary stage recognition and support',
              'Personal growth edge identification',
              'Transpersonal development pathways'
            ],

            benefits: [
              'Personalized wisdom aligned with your archetypal nature',
              'Consciousness-aware guidance appropriate to your development',
              'Shadow integration support for wholeness work',
              'Multiple archetypal perspectives for complex situations',
              'Evolution tracking to see growth over time',
              'Local processing for privacy and real-time responses'
            ]
          }
        }
      });
    }

    if (action === 'test-scenarios') {
      return NextResponse.json({
        success: true,
        data: {
          test_scenarios: [
            {
              category: 'Profile Analysis',
              test: 'analyze-profile',
              input: {
                input: "I've been feeling called to teach and share wisdom, but I struggle with whether I truly know enough. There's this tension between wanting to help others understand what I've learned and feeling like an imposter."
              },
              expected_archetype: 'sage',
              description: 'Should identify Sage archetype with shadow elements'
            },
            {
              category: 'Personalized Response',
              test: 'respond',
              input: {
                input: "I keep attracting the same relationship patterns and I'm frustrated with myself",
                profile: {
                  dominantArchetype: 'lover',
                  awarenessLevel: 2,
                  spiralogicPhase: 'Water',
                  shadowIntegration: 0.3
                }
              },
              description: 'Lover archetype response to relationship patterns'
            },
            {
              category: 'Archetypal Comparison',
              test: 'demonstrate-all-archetypes',
              input: {
                input: "How do I find my life purpose?"
              },
              description: 'See how each archetype approaches purpose differently'
            },
            {
              category: 'Consciousness Evolution',
              test: 'evolution-tracking',
              input: {
                input: "I want to make a difference in the world",
                profile: {
                  dominantArchetype: 'healer'
                }
              },
              description: 'Track Healer archetype evolution across awareness levels'
            },
            {
              category: 'System Integration',
              test: 'test-integration',
              input: {
                input: "I feel like I'm at a crossroads in my spiritual journey"
              },
              description: 'Complete system test with analysis + response'
            }
          ],

          usage_patterns: [
            {
              pattern: 'Daily Guidance',
              workflow: [
                '1. analyze-profile with current question/situation',
                '2. respond with identified archetype for personalized guidance',
                '3. Track responses over time for evolution patterns'
              ]
            },
            {
              pattern: 'Shadow Work',
              workflow: [
                '1. Use current dominant archetype',
                '2. Ask questions about challenging patterns',
                '3. Receive shadow-integrated guidance for wholeness'
              ]
            },
            {
              pattern: 'Archetypal Exploration',
              workflow: [
                '1. demonstrate-all-archetypes for major life questions',
                '2. Identify which archetypal responses resonate',
                '3. Explore secondary archetypes for balance'
              ]
            },
            {
              pattern: 'Evolution Tracking',
              workflow: [
                '1. Regular evolution-tracking for growth assessment',
                '2. Notice how guidance changes with awareness development',
                '3. Focus on appropriate developmental challenges'
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
    console.error('Archetype capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to get archetype capabilities' },
      { status: 500 }
    );
  }
}