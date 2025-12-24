/**
 * RESONANCE RECALL API
 *
 * Multi-dimensional memory recall based on current consciousness state.
 * Not traditional search - finds memories that RESONATE across:
 * - Semantic (meaning)
 * - Temporal (spiral cycle timing)
 * - Somatic (body regions)
 * - Emotional (feeling qualities)
 * - Spiral (facet positions)
 *
 * POST /api/consciousness/memory/recall
 * Body: {
 *   userId: string
 *   query?: string              // Semantic search
 *   facet?: { element, phase }  // Spiral dimension
 *   bodyRegion?: string         // Somatic dimension
 *   emotion?: string            // Emotional dimension
 *   intention?: string          // Purpose of recall
 * }
 *
 * Returns: {
 *   field: MemoryField {
 *     nodes: LatticeNode[]
 *     timeSpan: { start, end }
 *     facetDistribution: {}
 *     modalityBalance: {}
 *     spiralCycles: []
 *     stuckPatterns: []
 *     breakthroughMoments: []
 *     integrationThreads: []
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { lattice } from '@/lib/memory/ConsciousnessMemoryLattice';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, query, facet, bodyRegion, emotion, intention } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // At least one recall dimension must be provided
    if (!query && !facet && !bodyRegion && !emotion) {
      return NextResponse.json(
        { error: 'At least one recall dimension required (query, facet, bodyRegion, or emotion)' },
        { status: 400 }
      );
    }

    // Perform resonance recall
    const field = await lattice.resonanceRecall(userId, {
      query,
      facet,
      bodyRegion,
      emotion,
      intention
    });

    console.log(`🔮 [API] Resonance recall for ${userId}: ${field.nodes.length} nodes, ${field.stuckPatterns.length} patterns`);

    return NextResponse.json({
      success: true,
      field
    });

  } catch (error: any) {
    console.error('[API ERROR] Resonance recall failed:', error);
    return NextResponse.json(
      {
        error: 'Resonance recall failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
