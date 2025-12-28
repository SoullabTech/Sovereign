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

    // Memory permission gate: require explicit memoryMode
    // Defense-in-depth: lattice also checks internally, but be explicit
    const memoryMode = (body.memoryMode as 'ephemeral' | 'continuity' | 'longterm') || 'continuity';

    // Server-side allowlist check (same as orchestrator)
    const allowLongterm =
      process.env.MAIA_LONGTERM_WRITEBACK === '1' &&
      new Set((process.env.MAIA_LONGTERM_WRITEBACK_ALLOWLIST || '').split(',').map(s => s.trim()).filter(Boolean))
        .has(userId);

    const effectiveMode = memoryMode === 'longterm' && allowLongterm ? 'longterm' : memoryMode === 'ephemeral' ? 'ephemeral' : 'continuity';

    if (memoryMode === 'longterm' && effectiveMode !== 'longterm') {
      console.warn('🛡️ [MemoryGate] API integrate route: longterm requested but denied', { userId });
    }

    // Integrate event into lattice (with permission-gated memoryMode)
    const result = await lattice.integrateEvent(userId, event, facet, phase || { name: 'current' }, { memoryMode: effectiveMode });

    console.log(`✅ [API] Event integrated: ${event.type} for ${userId}, Memory: ${result.memoryFormed}, Mode: ${effectiveMode}`);

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
