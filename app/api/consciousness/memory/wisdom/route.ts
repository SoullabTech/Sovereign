/**
 * WISDOM SYNTHESIS API
 *
 * The lattice doesn't just recall - it SYNTHESIZES.
 * Combines:
 * - Developmental memories
 * - AIN deliberations
 * - Pattern detection
 * - Spiralogic tracking
 * - Local AI synthesis (Ollama/DeepSeek)
 *
 * To generate EMERGENT WISDOM that didn't exist in any single piece.
 *
 * POST /api/consciousness/memory/wisdom
 * Body: {
 *   userId: string
 *   question: string
 *   facet?: { element, phase, code }
 * }
 *
 * Returns: {
 *   synthesis: string
 *   sources: string[]
 *   confidence: number (0-1)
 *   emergenceLevel: number (0-1)
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { lattice } from '@/lib/memory/ConsciousnessMemoryLattice';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, question, facet } = body;

    // Validate input
    if (!userId || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, question' },
        { status: 400 }
      );
    }

    // Default facet if not provided
    const defaultFacet = facet || {
      element: 'EARTH',
      phase: 1,
      code: 'EARTH-1'
    };

    // Synthesize wisdom
    const result = await lattice.synthesizeWisdom(userId, question, defaultFacet);

    console.log(`💎 [API] Wisdom synthesized for ${userId}: Confidence ${result.confidence.toFixed(2)}, Emergence ${result.emergenceLevel.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error('[API ERROR] Wisdom synthesis failed:', error);
    return NextResponse.json(
      {
        error: 'Wisdom synthesis failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
