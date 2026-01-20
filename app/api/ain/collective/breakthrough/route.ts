export const dynamic = 'force-dynamic';

/**
 * AIN Collective Breakthrough API
 * Path: /api/ain/collective/breakthrough
 *
 * REST interface to the AIN afferent/efferent wisdom flow.
 * All operations go through AINSpiralogicBridge - this endpoint doesn't touch DB directly.
 *
 * Privacy guarantees:
 * - POST = Afferent (Individual → Collective): Only pattern signatures, never text
 * - GET = Efferent (Collective → Individual): Only field-level wisdom, never stories
 *
 * Underlying tables (accessed via bridge, not directly):
 * - collective_breakthroughs: Anonymized pattern signatures (pattern_id = SHA-256 hash)
 * - field_state_snapshots: Aggregated field state
 *
 * NOT the same as breakthrough_moments (personal memory with actual insight text).
 */

import { NextRequest, NextResponse } from 'next/server';
import { collectiveBreakthroughService } from '@/lib/services/collectiveBreakthroughService';
import { ainSpiralogicBridge } from '@/lib/ain/AINSpiralogicBridge';
import { detectBreakthrough } from '@/lib/utils/breakthroughDetection';

/**
 * POST /api/ain/collective/breakthrough
 *
 * Contribute a breakthrough to the collective field (Afferent flow).
 * Called when MAIA detects a breakthrough moment in conversation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      text,
      catalyst_type = 'reflection',
      archetype_from,
      archetype_to,
      elemental_phase_from,
      elemental_phase_to,
      practice_offered,
      spiralogic_phase = 'unknown',
      dominant_element = 'aether',
    } = body;

    if (!userId || !text) {
      return NextResponse.json(
        { error: 'userId and text are required' },
        { status: 400 }
      );
    }

    // Detect breakthrough characteristics from the text
    const detection = detectBreakthrough(text);

    if (!detection.isBreakthrough) {
      return NextResponse.json({
        success: false,
        reason: 'No breakthrough detected in text',
        detection,
      });
    }

    // Map detection to contribution format
    const transformationType = mapDepthToTransformationType(detection.depth);
    const emotionalShift = detection.markers.join(' → ');

    const result = await collectiveBreakthroughService.contributeBreakthrough(userId, {
      catalyst_type,
      archetype_from,
      archetype_to,
      elemental_phase_from,
      elemental_phase_to,
      practice_offered,
      transformation_type: transformationType,
      emotional_shift: emotionalShift,
      body_involved: detection.markers.includes('body') || detection.markers.includes('embodiment'),
      resonance_strength: Math.min(detection.depth / 5, 1), // Normalize to 0-1
      spiralogic_phase: detection.spiralLevel || spiralogic_phase,
      dominant_element,
    });

    console.log(`✨ [Collective] Breakthrough contributed: ${detection.depth} depth, ${detection.markers.length} markers`);

    return NextResponse.json({
      success: result.success,
      patternId: result.patternId,
      detection: {
        depth: detection.depth,
        markers: detection.markers,
        spiralLevel: detection.spiralLevel,
      },
    });

  } catch (error) {
    console.error('[AIN Collective Breakthrough] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to contribute breakthrough' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ain/collective/breakthrough
 *
 * Retrieve collective wisdom relevant to user's current state (Efferent flow).
 * Used to enrich MAIA's responses with field awareness.
 *
 * Query params:
 * - phase: spiralogic phase (cardinal, fixed, mutable)
 * - element: dominant element (fire, water, earth, air, aether)
 * - archetype: optional archetype for resonance matching
 * - forPrompt: if true, returns condensed wisdom for system prompt injection
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase') || 'unknown';
    const element = searchParams.get('element') || 'aether';
    const archetype = searchParams.get('archetype') || undefined;
    const forPrompt = searchParams.get('forPrompt') === 'true';

    // Quick path for system prompt enrichment
    if (forPrompt) {
      const promptWisdom = await ainSpiralogicBridge.getWisdomForPrompt(element, phase, archetype);
      return NextResponse.json({
        success: true,
        hasWisdom: !!promptWisdom,
        promptWisdom,
      });
    }

    // Full wisdom retrieval
    const wisdom = await collectiveBreakthroughService.getCollectiveWisdom(
      phase,
      element,
      archetype
    );

    if (!wisdom) {
      return NextResponse.json({
        success: true,
        hasWisdom: false,
        message: 'No collective wisdom available yet for these conditions',
      });
    }

    return NextResponse.json({
      success: true,
      hasWisdom: true,
      wisdom: {
        activeMovements: wisdom.active_movements,
        suggestedReflection: wisdom.suggested_reflection,
        synchronicityDetected: wisdom.synchronicity_detected,
        patternCount: wisdom.relevant_patterns.length,
      },
    });

  } catch (error) {
    console.error('[AIN Collective Breakthrough] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve collective wisdom' },
      { status: 500 }
    );
  }
}

/**
 * Map breakthrough depth to transformation type
 */
function mapDepthToTransformationType(depth: number): 'insight' | 'embodiment' | 'integration' | 'release' | 'awakening' {
  if (depth >= 5) return 'awakening';
  if (depth >= 4) return 'integration';
  if (depth >= 3) return 'release';
  if (depth >= 2) return 'embodiment';
  return 'insight';
}
