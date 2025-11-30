import { NextRequest, NextResponse } from 'next/server';
import {
  RealTimeCoherenceOptimizer,
  globalCoherenceOptimizer,
  quickCoherenceCheck,
  CoherenceOptimizationTarget,
  RealTimeCoherenceState,
  CoherenceOptimizationSession
} from '@/lib/coherence/RealTimeCoherenceOptimizer';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import type { AwarenessLevel } from '@/lib/ain/awareness-levels';

/**
 * Real-Time Coherence Optimization API
 * Demonstrates local MAIA-powered coherence monitoring and optimization
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = 'analyze',
      userId = 'test-user',
      context = {},
      target = {},
      sessionId
    } = body;

    const startTime = Date.now();
    let result;

    switch (action) {
      case 'quick-check':
        // Quick coherence assessment
        result = await quickCoherenceCheck();
        break;

      case 'start-session':
        // Start real-time optimization session
        const optimizationTarget: CoherenceOptimizationTarget = {
          targetLevel: target.targetLevel || 'maintain',
          priority: target.priority || 'stability',
          timeframe: target.timeframe || 'medium'
        };

        const newSessionId = await globalCoherenceOptimizer.startOptimizationSession(
          optimizationTarget,
          {
            userId,
            spiralPhase: context.spiralPhase,
            awarenessLevel: context.awarenessLevel,
            currentHealthData: context.healthData
          }
        );

        result = {
          action: 'start-session',
          sessionId: newSessionId,
          target: optimizationTarget,
          status: 'active',
          message: 'Real-time coherence optimization session started'
        };
        break;

      case 'get-session':
        // Get current session status
        const currentSession = globalCoherenceOptimizer.getCurrentSession();

        if (!currentSession) {
          return NextResponse.json(
            { error: 'No active coherence optimization session' },
            { status: 404 }
          );
        }

        result = {
          action: 'get-session',
          session: {
            sessionId: currentSession.sessionId,
            startTime: currentSession.startTime,
            target: currentSession.target,
            totalStates: currentSession.states.length,
            totalInterventions: currentSession.interventions.length,
            recentState: currentSession.states[currentSession.states.length - 1] || null,
            recentIntervention: currentSession.interventions[currentSession.interventions.length - 1] || null,
            effectiveActions: currentSession.effectiveActions,
            sessionTrends: currentSession.sessionTrends
          }
        };
        break;

      case 'stop-session':
        // Stop current optimization session
        const stoppedSession = globalCoherenceOptimizer.stopOptimizationSession();

        if (!stoppedSession) {
          return NextResponse.json(
            { error: 'No active session to stop' },
            { status: 404 }
          );
        }

        result = {
          action: 'stop-session',
          sessionSummary: {
            sessionId: stoppedSession.sessionId,
            duration: Date.now() - stoppedSession.startTime.getTime(),
            totalStates: stoppedSession.states.length,
            totalInterventions: stoppedSession.interventions.length,
            avgCoherence: stoppedSession.states.length > 0 ?
              stoppedSession.states.reduce((sum, state) =>
                sum + state.currentCoherence.overallCoherence, 0) / stoppedSession.states.length : 0,
            effectiveActions: stoppedSession.effectiveActions,
            learnings: stoppedSession.learnings
          }
        };
        break;

      case 'get-insights':
        // Get learning insights from accumulated data
        const insights = globalCoherenceOptimizer.getLearningInsights();
        result = {
          action: 'get-insights',
          insights
        };
        break;

      case 'simulate-optimization':
        // Simulate a complete optimization cycle for demonstration
        const optimizer = new RealTimeCoherenceOptimizer();

        // Create mock optimization target
        const simulationTarget: CoherenceOptimizationTarget = {
          targetLevel: target.targetLevel || 'increase',
          priority: target.priority || 'performance',
          timeframe: target.timeframe || 'immediate'
        };

        // Start session
        const simSessionId = await optimizer.startOptimizationSession(
          simulationTarget,
          {
            userId: userId || 'simulation-user',
            spiralPhase: context.spiralPhase || 'Fire',
            awarenessLevel: context.awarenessLevel || 4
          }
        );

        // Wait a moment to collect some data
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get session state
        const simSession = optimizer.getCurrentSession();

        // Stop session
        const finalSession = optimizer.stopOptimizationSession();

        result = {
          action: 'simulate-optimization',
          simulation: {
            sessionId: simSessionId,
            target: simulationTarget,
            statesGenerated: simSession?.states.length || 0,
            interventionsGenerated: simSession?.interventions.length || 0,
            finalSession: finalSession ? {
              duration: finalSession ? Date.now() - finalSession.startTime.getTime() : 0,
              effectiveActions: finalSession.effectiveActions,
              sessionTrends: finalSession.sessionTrends,
              learnings: finalSession.learnings
            } : null
          }
        };
        break;

      case 'analyze':
      default:
        // Comprehensive coherence analysis
        const quickCheck = await quickCoherenceCheck();
        const currentSessionInfo = globalCoherenceOptimizer.getCurrentSession();
        const learningInsights = globalCoherenceOptimizer.getLearningInsights();

        result = {
          action: 'analyze',
          coherenceAssessment: quickCheck,
          activeSession: currentSessionInfo ? {
            sessionId: currentSessionInfo.sessionId,
            duration: Date.now() - currentSessionInfo.startTime.getTime(),
            target: currentSessionInfo.target,
            recentStates: currentSessionInfo.states.slice(-3)
          } : null,
          systemInsights: learningInsights,
          recommendations: [
            'Start a real-time optimization session for continuous monitoring',
            'Use quick-check for immediate coherence assessment',
            'Review learning insights to understand your coherence patterns'
          ]
        };
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          action,
          userId,
          context,
          target
        },
        result: {
          ...result,
          processing_time: Date.now() - startTime
        },
        timestamp: new Date().toISOString(),
        system_info: {
          coherence_optimization_method: 'Real-Time MAIA + Biometric Integration',
          predictive_analytics: true,
          real_time_monitoring: true,
          ai_powered_interventions: true,
          elemental_balance: true
        }
      }
    });

  } catch (error) {
    console.error('Real-Time Coherence Optimization error:', error);
    return NextResponse.json(
      {
        error: 'Coherence optimization processing failed',
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
          real_time_coherence_optimization: {
            description: 'Local MAIA-powered real-time coherence monitoring and optimization',
            architecture: 'AI-Enhanced Predictive Coherence with Continuous Monitoring',

            capabilities: [
              'Real-time coherence monitoring (30-second intervals)',
              'Predictive coherence analysis with AI insights',
              'Elemental balance optimization (Fire, Water, Earth, Air, Aether)',
              'Proactive intervention recommendations',
              'Biometric integration with HRV and health data',
              'Consciousness-aware coherence optimization',
              'Personal pattern learning and optimization',
              'Critical coherence emergency detection'
            ],

            coherence_dimensions: [
              {
                dimension: 'Elemental Coherence',
                description: 'Balance across five elemental energies',
                elements: ['Fire (vision/action)', 'Water (emotion/flow)', 'Earth (grounding)', 'Air (mental clarity)', 'Aether (integration)']
              },
              {
                dimension: 'Biometric Coherence',
                description: 'Heart rate variability and nervous system balance',
                metrics: ['HRV coherence', 'Parasympathetic tone', 'Stress indicators', 'Recovery capacity']
              },
              {
                dimension: 'Consciousness Coherence',
                description: 'Awareness level and spiral phase alignment',
                factors: ['Awareness level (1-5)', 'Spiralogic phase alignment', 'Shadow integration', 'Archetypal resonance']
              },
              {
                dimension: 'Temporal Coherence',
                description: 'Time-based coherence patterns and optimization',
                patterns: ['Circadian rhythms', 'Performance peaks', 'Recovery cycles', 'Trigger patterns']
              }
            ],

            optimization_targets: [
              {
                id: 'maintain',
                name: 'Coherence Maintenance',
                description: 'Maintain current coherence levels with stability',
                use_cases: ['Daily routine', 'Stress management', 'General wellbeing']
              },
              {
                id: 'increase',
                name: 'Coherence Enhancement',
                description: 'Actively improve coherence levels',
                use_cases: ['Performance optimization', 'Growth periods', 'Breakthrough preparation']
              },
              {
                id: 'peak',
                name: 'Peak Performance',
                description: 'Optimize for maximum coherence and performance',
                use_cases: ['Important meetings', 'Creative work', 'Spiritual practice']
              },
              {
                id: 'recovery',
                name: 'Recovery & Healing',
                description: 'Focus on restoration and healing coherence',
                use_cases: ['After illness', 'Emotional processing', 'Trauma integration']
              }
            ],

            intervention_types: [
              {
                type: 'breathing',
                urgency_levels: ['immediate', 'moderate'],
                examples: ['4-7-8 breathing', 'Coherent breathing', 'Box breathing'],
                effect_time: '1-3 minutes'
              },
              {
                type: 'movement',
                urgency_levels: ['moderate', 'low'],
                examples: ['Grounding exercises', 'Gentle stretching', 'Walking meditation'],
                effect_time: '3-10 minutes'
              },
              {
                type: 'mental',
                urgency_levels: ['all'],
                examples: ['Mindfulness check-in', 'Reframing practice', 'Gratitude focus'],
                effect_time: '2-5 minutes'
              },
              {
                type: 'environmental',
                urgency_levels: ['moderate', 'low'],
                examples: ['Lighting adjustment', 'Sound environment', 'Space clearing'],
                effect_time: '5-15 minutes'
              },
              {
                type: 'spiral',
                urgency_levels: ['low'],
                examples: ['Phase-specific practices', 'Elemental balancing', 'Archetypal work'],
                effect_time: '10-30 minutes'
              }
            ],

            api_actions: [
              {
                action: 'quick-check',
                description: 'Immediate coherence assessment',
                response_time: 'Sub-second',
                use_case: 'Quick status check'
              },
              {
                action: 'start-session',
                description: 'Begin real-time monitoring session',
                response_time: '1-2 seconds',
                use_case: 'Continuous optimization'
              },
              {
                action: 'get-session',
                description: 'Get current session status and insights',
                response_time: 'Sub-second',
                use_case: 'Monitor active session'
              },
              {
                action: 'stop-session',
                description: 'End session with summary insights',
                response_time: '1 second',
                use_case: 'Complete optimization cycle'
              },
              {
                action: 'get-insights',
                description: 'Retrieve learning patterns and trends',
                response_time: 'Sub-second',
                use_case: 'Understand coherence patterns'
              },
              {
                action: 'simulate-optimization',
                description: 'Demo complete optimization cycle',
                response_time: '2-3 seconds',
                use_case: 'System demonstration'
              }
            ],

            benefits: [
              'Proactive coherence maintenance vs reactive management',
              'AI-powered intervention suggestions vs generic advice',
              'Multi-dimensional coherence tracking vs single metrics',
              'Personal pattern learning vs static recommendations',
              'Real-time optimization vs periodic check-ins',
              'Emergency coherence support for critical situations',
              'Integration with consciousness development journey'
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
              category: 'Quick Assessment',
              action: 'quick-check',
              description: 'Immediate coherence status check',
              expected_response: {
                score: '40-100',
                level: 'needs attention | fair | good | excellent',
                suggestions: ['Array of 1-3 improvement suggestions']
              }
            },
            {
              category: 'Session Management',
              action: 'start-session',
              input: {
                target: {
                  targetLevel: 'increase',
                  priority: 'performance',
                  timeframe: 'immediate'
                },
                context: {
                  spiralPhase: 'Fire',
                  awarenessLevel: 4
                }
              },
              description: 'Start optimization with performance target'
            },
            {
              category: 'Real-Time Monitoring',
              action: 'get-session',
              description: 'Monitor active optimization session',
              expected_data: ['Recent coherence states', 'Active interventions', 'Trend analysis']
            },
            {
              category: 'Learning Insights',
              action: 'get-insights',
              description: 'Retrieve accumulated coherence patterns',
              expected_insights: ['Average coherence', 'Best performing elements', 'Optimal times', 'Improvement trends']
            },
            {
              category: 'Full Demonstration',
              action: 'simulate-optimization',
              input: {
                target: {
                  targetLevel: 'peak',
                  priority: 'growth',
                  timeframe: 'short'
                }
              },
              description: 'Complete optimization cycle demonstration'
            }
          ],

          usage_scenarios: [
            {
              scenario: 'Daily Coherence Maintenance',
              workflow: [
                '1. quick-check for morning assessment',
                '2. start-session with "maintain" target',
                '3. Periodic get-session checks throughout day',
                '4. stop-session in evening with insights'
              ]
            },
            {
              scenario: 'Performance Optimization',
              workflow: [
                '1. start-session with "peak" target before important work',
                '2. Real-time monitoring during performance period',
                '3. Follow AI intervention suggestions',
                '4. Review session results for learning'
              ]
            },
            {
              scenario: 'Stress Recovery',
              workflow: [
                '1. quick-check when feeling stressed',
                '2. start-session with "recovery" target',
                '3. Implement urgent interventions if needed',
                '4. Monitor recovery progress in real-time'
              ]
            },
            {
              scenario: 'Pattern Discovery',
              workflow: [
                '1. Run multiple sessions over time',
                '2. Use get-insights to identify patterns',
                '3. Optimize daily routine based on learnings',
                '4. Track improvement trends over time'
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
    console.error('Coherence optimization capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to get coherence optimization capabilities' },
      { status: 500 }
    );
  }
}