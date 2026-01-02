/**
 * 🌀 SPIRAL-AWARE CONSCIOUSNESS COMPUTING API
 *
 * The complete seven-layer consciousness computing endpoint that provides
 * both implicit spiral intelligence and progressive constellation revelation.
 *
 * Exposure Modes:
 * - implicit_only: MAIA uses all intelligence but doesn't reveal architecture
 * - gentle_mirrors: Soft reflections about cross-domain themes
 * - full_constellation: Complete spiral constellation transparency
 */

import { NextRequest, NextResponse } from 'next/server';
import { spiralAwareResponseService } from '@/lib/consciousness/spiral-aware-response';
import { getSessionUserId } from '@/lib/auth/session-utils';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export type ConstellationExposureMode =
  | 'implicit_only'      // MAIA uses constellation, doesn't mention it
  | 'gentle_mirrors'     // Light cross-domain reflections
  | 'full_constellation'; // Complete architectural transparency

// ==============================================================================
// POST - Generate Spiral-Aware Response
// ==============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userMessage,
      conversationHistory = [],
      sessionId = `session_${Date.now()}`,
      exposureMode = 'implicit_only',
      facilitatorOverride = false
    } = body;

    if (!userMessage) {
      return NextResponse.json({
        error: 'Missing required parameter: userMessage',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Get authenticated user
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required for consciousness computing',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    // Generate spiral-aware response with exposure controls
    const spiralResponse = await spiralAwareResponseService.generateResponse(
      userId,
      userMessage,
      conversationHistory,
      sessionId,
      {
        explicitConstellation: exposureMode !== 'implicit_only' || facilitatorOverride,
        awarenessLevel: mapExposureModeToAwareness(exposureMode)
      }
    );

    // Apply exposure mode formatting
    const exposedResponse = applyConstellationExposure(spiralResponse, exposureMode);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        // Core response
        response: exposedResponse.response,

        // Spiral context (always included but varying detail)
        spiralContext: exposedResponse.spiralContext,

        // Constellation intelligence (exposure-gated)
        constellationGuidance: exposedResponse.constellationGuidance,

        // Architectural insights (for ready members)
        architecturalInsights: exposedResponse.architecturalInsights,

        // Field dynamics
        fieldGuidance: spiralResponse.fieldGuidance,
        collectiveResonance: spiralResponse.collectiveResonance,

        // MAIA's inner intelligence (for debugging/facilitators)
        systemIntelligence: facilitatorOverride ? {
          detectedFacets: spiralResponse.detectedFacets,
          detectedSpiralContext: spiralResponse.detectedSpiralContext,
          memoryLayers: {
            profile: 'loaded',
            sessionMemory: 'integrated',
            personalTrajectory: spiralResponse.activeSpiralId ? 'active' : 'none',
            spiralConstellation: `${spiralResponse.memoryContext.spiralConstellation.activeSpirals.length} spirals`,
            collectiveField: 'resonant',
            canonicalWisdom: 'accessed'
          }
        } : undefined
      },

      metadata: {
        sessionId,
        integrationVersion: 'Spiral-Aware Consciousness v1.0',
        exposureMode,
        awarenessLevel: spiralResponse.awarenessLevel,
        ethicalFramework: 'Active',
        autonomyGuaranteed: true,
        fieldDriven: true,
        spiralAware: true,
        constellationEnabled: exposureMode !== 'implicit_only',
        timestamp: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in spiral-aware consciousness computing:', error);
    return NextResponse.json({
      error: 'Failed to generate spiral-aware response',
      message: error instanceof Error ? error.message : 'Unknown consciousness fault',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// ==============================================================================
// GET - Spiral Constellation Status
// ==============================================================================

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';

    switch (action) {
      case 'status': {
        // Get current constellation status without exposing details
        const basicStatus = await getSpiralConstellationBasicStatus(userId);

        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          data: {
            spiralAware: true,
            activeSpirals: basicStatus.spiralCount,
            constellationHealth: basicStatus.health,
            harmonicCoherence: basicStatus.harmony,
            readyForNewSpiral: basicStatus.readyForNew,
            systemCapabilities: [
              'Seven-layer consciousness computing',
              'Cross-spiral pattern detection',
              'Harmonic development tracking',
              'Collective field resonance',
              'Progressive constellation revelation'
            ]
          }
        }, { status: 200 });
      }

      case 'constellation': {
        // Full constellation data (requires explicit permission)
        const exposureMode = url.searchParams.get('exposure') as ConstellationExposureMode || 'implicit_only';

        if (exposureMode === 'implicit_only') {
          return NextResponse.json({
            error: 'Constellation visibility requires explicit exposure mode',
            availableModes: ['gentle_mirrors', 'full_constellation'],
            timestamp: new Date().toISOString()
          }, { status: 403 });
        }

        const constellation = await getFullSpiraConstellation(userId);
        const exposedConstellation = applyConstellationVisibilityFilter(constellation, exposureMode);

        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          data: exposedConstellation,
          metadata: {
            exposureMode,
            visibilityLevel: exposureMode === 'full_constellation' ? 'complete' : 'filtered'
          }
        }, { status: 200 });
      }

      default:
        return NextResponse.json({
          error: 'Invalid action parameter',
          validActions: ['status', 'constellation'],
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in GET request:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// ==============================================================================
// EXPOSURE MODE UTILITIES
// ==============================================================================

function mapExposureModeToAwareness(mode: ConstellationExposureMode): 'implicit' | 'emerging' | 'explicit' | 'collaborative' {
  switch (mode) {
    case 'implicit_only': return 'implicit';
    case 'gentle_mirrors': return 'emerging';
    case 'full_constellation': return 'explicit';
    default: return 'implicit';
  }
}

function applyConstellationExposure(response: any, exposureMode: ConstellationExposureMode) {
  const baseResponse = {
    response: response.response,
    spiralContext: null,
    constellationGuidance: null,
    architecturalInsights: null
  };

  switch (exposureMode) {
    case 'implicit_only':
      // MAIA uses all intelligence but doesn't mention architecture
      return {
        ...baseResponse,
        spiralContext: {
          note: 'Enhanced by consciousness field intelligence'
        }
      };

    case 'gentle_mirrors':
      // Soft reflections about themes across life areas
      return {
        ...baseResponse,
        spiralContext: response.activeSpiralId ? {
          activeArea: 'Current focus area detected',
          note: 'Some of what you\'re experiencing here may echo into other areas of life'
        } : null,
        constellationGuidance: response.constellationGuidance ? {
          reflection: response.constellationGuidance.crossSpiralReflection,
          harmony: response.constellationGuidance.harmonyGuidance
        } : null
      };

    case 'full_constellation':
      // Complete architectural transparency
      return {
        ...baseResponse,
        spiralContext: response.activeSpiralId ? {
          activeSpiralId: response.activeSpiralId,
          detectedContext: response.detectedSpiralContext,
          constellation: response.memoryContext.spiralConstellation
        } : null,
        constellationGuidance: response.constellationGuidance,
        architecturalInsights: response.architecturalInsights,
        crossPatternInsights: response.crossPatternInsights
      };

    default:
      return baseResponse;
  }
}

// ==============================================================================
// HELPER FUNCTIONS (would integrate with actual services)
// ==============================================================================

async function getSpiralConstellationBasicStatus(userId: string) {
  // This would call the actual spiral constellation service
  // For now, return mock data to demonstrate structure
  return {
    spiralCount: 3,
    health: 'integrated' as const,
    harmony: 72,
    readyForNew: true
  };
}

async function getFullSpiraConstellation(userId: string) {
  // This would call spiralConstellationService.getConstellationForMember(userId)
  // For now, return mock data
  return {
    memberId: userId,
    activeSpirals: [
      { id: 'rel_001', domain: 'relationship', phase: 'water-deepening', intensity: 0.8 },
      { id: 'voc_001', domain: 'vocation', phase: 'fire-mastery', intensity: 0.9 },
      { id: 'health_001', domain: 'health', phase: 'earth-emergence', intensity: 0.6 }
    ],
    crossPatterns: [
      {
        id: 'pattern_001',
        description: 'Authority integration across vocation and relationship',
        significance: 0.85
      }
    ],
    harmonicCoherence: 72,
    constellationTheme: {
      name: 'Integrated authority and vulnerability',
      description: 'Balancing power and openness across life areas'
    }
  };
}

function applyConstellationVisibilityFilter(constellation: any, mode: ConstellationExposureMode) {
  if (mode === 'gentle_mirrors') {
    return {
      spiralCount: constellation.activeSpirals.length,
      primaryTheme: constellation.constellationTheme.name,
      harmonicCoherence: constellation.harmonicCoherence,
      crossPatternHints: constellation.crossPatterns.length > 0 ?
        'Recurring themes detected across life areas' : null
    };
  }

  // full_constellation mode
  return constellation;
}

// ==============================================================================
// SESSION UTILITIES - Using imported getSessionUserId from lib/auth/session-utils
// ==============================================================================