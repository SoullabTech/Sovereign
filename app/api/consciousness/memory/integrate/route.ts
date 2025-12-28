/**
 * CONSCIOUSNESS EVENT INTEGRATION API
 *
 * Integrates consciousness events into the Memory Lattice.
 * Creates lattice nodes, forms developmental memories, detects patterns.
 *
 * POST /api/consciousness/memory/integrate
 * Body: {
 *   userId: string
 *   event: ConsciousnessEvent (somatic|emotional|mental|spiritual|collective|beads)
 *   facet: { element, phase, code }
 *   phase: { name, age?, context? }
 * }
 *
 * Returns: {
 *   node: LatticeNode
 *   memoryFormed: boolean
 *   patternsDetected: string[]
 *   insights: string[]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { lattice } from '@/lib/memory/ConsciousnessMemoryLattice';
import { resolveMemoryMode, logMemoryGateDenial } from '@/lib/memory/MemoryGate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, event, facet, phase } = body;

    // Validate input
    if (!userId || !event || !facet) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, event, facet' },
        { status: 400 }
      );
    }

    // Validate event type
    const validTypes = ['somatic', 'emotional', 'mental', 'spiritual', 'collective', 'beads'];
    if (!validTypes.includes(event.type)) {
      return NextResponse.json(
        { error: `Invalid event type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Memory permission gate: use centralized resolver
    // Defense-in-depth: lattice also checks internally, but be explicit
    const modeResolution = resolveMemoryMode(userId, body.memoryMode);
    logMemoryGateDenial('API integrate route', userId, modeResolution);

    // Integrate event into lattice (with permission-gated memoryMode)
    const result = await lattice.integrateEvent(
      userId,
      event,
      facet,
      phase || { name: 'current' },
      { memoryMode: modeResolution.effective }
    );

    console.log(`✅ [API] Event integrated: ${event.type} for ${userId}, Memory: ${result.memoryFormed}, Mode: ${modeResolution.effective}`);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error('[API ERROR] Memory integration failed:', error);
    return NextResponse.json(
      {
        error: 'Memory integration failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
