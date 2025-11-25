import { NextRequest, NextResponse } from 'next/server';
import { maiaModelSystem } from '@/lib/models/maia-integration';
import { SmartBenchmarker } from '@/lib/models/benchmarking';
import { ModelOptimizer } from '@/lib/models/optimization';

/**
 * MAIA Model Management API
 * Handles model listing, optimization, benchmarking, and configuration
 */

const benchmarker = new SmartBenchmarker();
const optimizer = new ModelOptimizer();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'list';
    const consciousnessLevel = searchParams.get('level');

    await maiaModelSystem.initialize();

    switch (action) {
      case 'list':
        if (consciousnessLevel) {
          const level = parseInt(consciousnessLevel) as any;
          const models = maiaModelSystem.getModelsForConsciousnessLevel(level);

          return NextResponse.json({
            success: true,
            data: {
              consciousnessLevel: level,
              models: models.map(model => ({
                id: model.id,
                name: model.name,
                provider: model.provider,
                size: model.size,
                quantization: model.quantization,
                capabilities: model.capabilities,
                tags: model.tags
              }))
            }
          });
        } else {
          const modelsByLevel = {};
          for (let level = 1; level <= 5; level++) {
            modelsByLevel[level] = maiaModelSystem.getModelsForConsciousnessLevel(level as any);
          }

          return NextResponse.json({
            success: true,
            data: {
              modelsByConsciousnessLevel: modelsByLevel,
              summary: {
                totalModels: Object.values(modelsByLevel).flat().length,
                providers: [...new Set(Object.values(modelsByLevel).flat().map((m: any) => m.provider))],
                capabilities: [...new Set(Object.values(modelsByLevel).flat().flatMap((m: any) => m.capabilities.map(c => c.type)))]
              }
            }
          });
        }

      case 'capabilities':
        const allModels = [];
        for (let level = 1; level <= 5; level++) {
          allModels.push(...maiaModelSystem.getModelsForConsciousnessLevel(level as any));
        }

        const capabilitiesSummary = allModels.reduce((acc, model) => {
          model.capabilities.forEach(cap => {
            if (!acc[cap.type]) {
              acc[cap.type] = {
                models: [],
                averageStrength: 0,
                description: cap.description
              };
            }
            acc[cap.type].models.push({
              id: model.id,
              name: model.name,
              strength: cap.strength
            });
          });
          return acc;
        }, {});

        // Calculate average strengths
        Object.keys(capabilitiesSummary).forEach(capType => {
          const models = capabilitiesSummary[capType].models;
          capabilitiesSummary[capType].averageStrength =
            models.reduce((sum, m) => sum + m.strength, 0) / models.length;
        });

        return NextResponse.json({
          success: true,
          data: {
            capabilities: capabilitiesSummary,
            totalCapabilities: Object.keys(capabilitiesSummary).length
          }
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Model management API error:', error);

    return NextResponse.json(
      {
        error: 'Model management operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, modelId, options = {} } = body;

    await maiaModelSystem.initialize();

    switch (action) {
      case 'benchmark':
        if (modelId) {
          // Benchmark specific model
          const result = await benchmarker.benchmarkModel(modelId, {
            suiteId: options.suiteId || 'maia-consciousness-suite',
            iterations: options.iterations || 3
          });

          return NextResponse.json({
            success: true,
            data: {
              modelId,
              benchmark: result,
              timestamp: new Date().toISOString()
            }
          });
        } else {
          // Benchmark all models
          const results = await benchmarker.runFullBenchmark(
            options.suiteId || 'maia-consciousness-suite'
          );

          return NextResponse.json({
            success: true,
            data: {
              benchmarks: results,
              modelsCount: Object.keys(results).length,
              timestamp: new Date().toISOString()
            }
          });
        }

      case 'optimize':
        if (modelId) {
          // Optimize specific model
          const optimizationPlan = await optimizer.optimizeModel(
            modelId,
            options.quantization || 'Q4_K_M'
          );

          return NextResponse.json({
            success: true,
            data: {
              modelId,
              optimization: optimizationPlan,
              timestamp: new Date().toISOString()
            }
          });
        } else {
          // Get optimization recommendations for all models
          const recommendations = await optimizer.analyzeAndRecommend();

          return NextResponse.json({
            success: true,
            data: {
              recommendations,
              modelsAnalyzed: Object.keys(recommendations).length,
              timestamp: new Date().toISOString()
            }
          });
        }

      case 'refresh-discovery':
        await maiaModelSystem.refresh();

        return NextResponse.json({
          success: true,
          message: 'Model discovery refreshed successfully',
          timestamp: new Date().toISOString()
        });

      case 'test-generation':
        const { prompt, consciousnessLevel } = options;

        if (!prompt || !consciousnessLevel) {
          return NextResponse.json(
            { error: 'Missing prompt or consciousnessLevel for test generation' },
            { status: 400 }
          );
        }

        const testResponse = await maiaModelSystem.generateResponse({
          content: prompt,
          consciousnessLevel: consciousnessLevel,
          userId: 'test-user'
        });

        return NextResponse.json({
          success: true,
          data: {
            test: true,
            prompt,
            consciousnessLevel,
            response: testResponse,
            timestamp: new Date().toISOString()
          }
        });

      case 'optimize-script':
        const script = optimizer.generateOptimizationScript();

        return NextResponse.json({
          success: true,
          data: {
            script,
            description: 'Shell script to optimize models with quantization',
            usage: 'Save as optimize-models.sh and run with bash optimize-models.sh',
            timestamp: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Model management action error:', error);

    return NextResponse.json(
      {
        error: 'Management action failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}