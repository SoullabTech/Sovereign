import { NextRequest, NextResponse } from 'next/server';
import {
  detectAwarenessLevelLocal,
  quickConsciousnessDetection,
  batchConsciousnessAnalysis,
  temporalConsciousnessCalibration
} from '@/lib/ain/awareness-levels-local';
import { detectAwarenessLevel } from '@/lib/ain/awareness-levels';
import { awarenessLevelCache } from '@/lib/cache/consciousness-cache';

/**
 * Local MAIA Consciousness Calibration API
 * Demonstrates AI-powered awareness detection vs regex pattern matching
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      input,
      analysisType = 'standard',
      options = {},
      historicalInputs = [],
      sessionContext
    } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'input string is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let result;

    switch (analysisType) {
      case 'quick':
        // Quick detection for real-time use
        const quickLevel = await quickConsciousnessDetection(input);
        result = {
          type: 'quick',
          awareness_level: quickLevel,
          processing_time: Date.now() - startTime
        };
        break;

      case 'comparison':
        // Compare local MAIA vs regex detection
        const [localResult, regexResult] = await Promise.all([
          detectAwarenessLevelLocal(input, {
            fallbackToRegex: false,
            useHybridAnalysis: false,
            includeSemanticInsights: true
          }).catch(() => null),
          Promise.resolve(detectAwarenessLevel(input))
        ]);

        result = {
          type: 'comparison',
          local_maia: localResult,
          regex_baseline: regexResult,
          performance: {
            local_processing_time: Date.now() - startTime,
            accuracy_improvement: localResult ?
              Math.abs(localResult.awarenessAnalysis.awarenessState.confidence - regexResult.awarenessState.confidence)
              : 0
          }
        };
        break;

      case 'temporal':
        // Enhanced analysis with temporal context
        const temporalResult = await temporalConsciousnessCalibration(
          input,
          historicalInputs,
          sessionContext
        );
        result = {
          type: 'temporal',
          ...temporalResult,
          processing_time: Date.now() - startTime
        };
        break;

      case 'batch':
        // Batch analysis (input should be array)
        if (!Array.isArray(input)) {
          return NextResponse.json(
            { error: 'batch analysis requires input array' },
            { status: 400 }
          );
        }

        const batchResults = await batchConsciousnessAnalysis(input);
        result = {
          type: 'batch',
          results: batchResults,
          batch_size: input.length,
          processing_time: Date.now() - startTime,
          average_time_per_item: (Date.now() - startTime) / input.length
        };
        break;

      case 'standard':
      default:
        // Check cache first for standard analysis
        const cacheContext = {
          fallbackToRegex: true,
          useHybridAnalysis: true,
          includeSemanticInsights: true,
          ...options
        };

        let standardResult = awarenessLevelCache.get(input, cacheContext);
        let fromCache = false;

        if (standardResult) {
          fromCache = true;
          console.log('⚡ Using cached consciousness analysis result');
        } else {
          // Standard local MAIA analysis
          console.log('🧠 Computing new consciousness analysis...');
          const analysisStartTime = Date.now();

          standardResult = await detectAwarenessLevelLocal(input, cacheContext);

          const analysisTime = Date.now() - analysisStartTime;

          // Cache the result with metadata
          awarenessLevelCache.set(input, standardResult, cacheContext, {
            processingTime: analysisTime,
            modelUsed: 'deepseek-r1:latest',
            qualityScore: standardResult.confidence_level || 0.8
          });

          console.log(`💾 Cached consciousness analysis (${analysisTime}ms processing time)`);
        }

        result = {
          type: 'standard',
          ...standardResult,
          processing_time: Date.now() - startTime,
          cached: fromCache,
          cache_stats: awarenessLevelCache.getStats()
        };
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        input: analysisType === 'batch' ? `${input.length} inputs` : input,
        analysis_type: analysisType,
        ...result,
        timestamp: new Date().toISOString(),
        model_info: {
          detection_method: 'Local MAIA + Hybrid Analysis',
          fallback_available: true,
          semantic_insights: analysisType !== 'quick' && analysisType !== 'batch'
        }
      }
    });

  } catch (error) {
    console.error('Consciousness calibration error:', error);
    return NextResponse.json(
      {
        error: 'Consciousness calibration failed',
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
          consciousness_calibration: {
            description: 'Local MAIA-powered consciousness awareness detection',
            methods: [
              'Local semantic analysis',
              'Hybrid AI + regex analysis',
              'Temporal evolution tracking',
              'Batch processing optimization'
            ],
            analysis_types: [
              {
                id: 'standard',
                name: 'Standard Analysis',
                description: 'Full AI analysis with semantic insights and hybrid validation',
                features: ['Semantic understanding', 'Depth markers', 'Consciousness themes', 'Archetypal resonance']
              },
              {
                id: 'quick',
                name: 'Quick Detection',
                description: 'Optimized for real-time use (sub-100ms target)',
                features: ['Fast awareness level only', 'Suitable for real-time systems']
              },
              {
                id: 'comparison',
                name: 'AI vs Regex Comparison',
                description: 'Compare local MAIA analysis with regex baseline',
                features: ['Side-by-side comparison', 'Accuracy metrics', 'Performance analysis']
              },
              {
                id: 'temporal',
                name: 'Temporal Consciousness',
                description: 'Enhanced analysis with evolution tracking over time',
                features: ['Trend analysis', 'Evolution prediction', 'Historical context']
              },
              {
                id: 'batch',
                name: 'Batch Processing',
                description: 'Efficient analysis of multiple inputs',
                features: ['Optimized for multiple messages', 'Rate limiting', 'Bulk insights']
              }
            ],
            awareness_levels: [
              { level: 1, name: 'Unconscious', description: 'Surface patterns, reactive responses' },
              { level: 2, name: 'Partial', description: 'Beginning insight, noticing patterns' },
              { level: 3, name: 'Relational', description: 'Interpersonal depth, emotional intelligence' },
              { level: 4, name: 'Integrated', description: 'Systemic understanding, wisdom integration' },
              { level: 5, name: 'Master', description: 'Archetypal depth, numinous knowing' }
            ],
            depth_markers: [
              'Emotional charge intensity',
              'Symbolic language presence',
              'Ritual/transformative intent',
              'Relational complexity',
              'Systems thinking depth'
            ]
          }
        }
      });
    }

    if (action === 'test') {
      // Provide test cases for different awareness levels
      const testCases = [
        {
          level: 1,
          input: 'How do I fix this error in my code?',
          description: 'Simple problem-solving request'
        },
        {
          level: 2,
          input: 'I notice that this pattern keeps showing up in my work. Why might that be happening?',
          description: 'Beginning awareness of patterns'
        },
        {
          level: 3,
          input: 'I feel vulnerable sharing this, but our relationship has been triggering some deep wounds around trust.',
          description: 'Emotional depth and relational awareness'
        },
        {
          level: 4,
          input: 'I see how these seemingly separate issues are all part of a larger systemic pattern in my consciousness evolution.',
          description: 'Systems thinking and integration'
        },
        {
          level: 5,
          input: 'This ritual space feels sacred. I sense the archetypal energies calling forth a profound transformation in my soul.',
          description: 'Numinous awareness and archetypal language'
        }
      ];

      return NextResponse.json({
        success: true,
        data: {
          test_cases: testCases,
          usage: 'Use these test cases with the /consciousness-calibration endpoint to see the system in action',
          suggestion: 'Try the "comparison" analysis type to see Local MAIA vs regex detection'
        }
      });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );

  } catch (error) {
    console.error('Consciousness calibration capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to get consciousness calibration capabilities' },
      { status: 500 }
    );
  }
}